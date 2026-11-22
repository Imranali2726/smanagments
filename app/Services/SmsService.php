<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\SmsLog;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Sends notifications by SMS and/or WhatsApp.
 *
 * Channel is chosen per call, or from settings.notification_channel (sms | whatsapp | both).
 *  - SMS:      SMS_DRIVER=log (just store) | http (generic gateway, see sendSms())
 *  - WhatsApp: WHATSAPP_DRIVER=log | cloud (Meta WhatsApp Cloud API)
 * Every message is stored in sms_logs with its channel and delivery status.
 * Urdu text is supported (sent as unicode).
 */
class SmsService
{
    /** @return int number of recipients processed */
    public function send(array|string|null $numbers, string $message, ?int $sentBy = null, ?string $channel = null): int
    {
        $channel ??= Setting::get('notification_channel', 'sms');
        $channels = $channel === 'both' ? ['sms', 'whatsapp'] : [$channel];
        $numbers = array_values(array_unique(array_filter(array_map([$this, 'normalize'], (array) $numbers))));

        foreach ($numbers as $number) {
            foreach ($channels as $ch) {
                [$status, $response] = $ch === 'whatsapp'
                    ? $this->sendWhatsApp($number, $message)
                    : $this->sendSms($number, $message);

                SmsLog::create([
                    'to' => $number,
                    'channel' => $ch,
                    'message' => $message,
                    'status' => $status,
                    'response' => $response,
                    'sent_by' => $sentBy,
                ]);
            }
        }

        return count($numbers);
    }

    /** Generic HTTP SMS gateway. Adjust the field names to your provider. */
    protected function sendSms(string $number, string $message): array
    {
        if (config('services.sms.driver') !== 'http') {
            return ['logged', null];
        }
        $url = config('services.sms.url');
        if (! $url) {
            return ['failed', 'SMS_API_URL is not configured'];
        }

        try {
            $res = Http::timeout(15)->asForm()->post($url, [
                'api_key' => config('services.sms.api_key'),
                'sender' => config('services.sms.sender'),
                'to' => $number,
                'message' => $message,
                'unicode' => $this->isUnicode($message) ? 1 : 0,   // Urdu SMS
            ]);

            return [$res->successful() ? 'sent' : 'failed', mb_substr($res->body(), 0, 1000)];
        } catch (Throwable $e) {
            return ['failed', mb_substr($e->getMessage(), 0, 1000)];
        }
    }

    /**
     * WhatsApp Cloud API. Free-form text is delivered only inside the 24-hour customer window;
     * outside it Meta requires an approved template — set WHATSAPP_TEMPLATE to a template with one
     * body variable and the message is sent as that variable.
     */
    protected function sendWhatsApp(string $number, string $message): array
    {
        if (config('services.whatsapp.driver') !== 'cloud') {
            return ['logged', null];
        }
        $token = config('services.whatsapp.token');
        $phoneId = config('services.whatsapp.phone_number_id');
        if (! $token || ! $phoneId) {
            return ['failed', 'WhatsApp credentials are not configured'];
        }

        $template = config('services.whatsapp.template');
        $payload = $template
            ? ['messaging_product' => 'whatsapp', 'to' => $number, 'type' => 'template', 'template' => [
                'name' => $template,
                'language' => ['code' => config('services.whatsapp.language', 'en')],
                'components' => [['type' => 'body', 'parameters' => [['type' => 'text', 'text' => $message]]]],
            ]]
            : ['messaging_product' => 'whatsapp', 'to' => $number, 'type' => 'text', 'text' => ['body' => $message]];

        try {
            $res = Http::timeout(15)->withToken($token)
                ->post('https://graph.facebook.com/'.config('services.whatsapp.version', 'v21.0')."/{$phoneId}/messages", $payload);

            return [$res->successful() ? 'sent' : 'failed', mb_substr($res->body(), 0, 1000)];
        } catch (Throwable $e) {
            return ['failed', mb_substr($e->getMessage(), 0, 1000)];
        }
    }

    protected function isUnicode(string $text): bool
    {
        return (bool) preg_match('/[^\x00-\x7F]/', $text);
    }

    /** 03001234567 / +92 300 1234567 -> 923001234567 */
    public function normalize(?string $number): ?string
    {
        if (! $number) {
            return null;
        }
        $digits = preg_replace('/\D+/', '', $number);
        if (str_starts_with($digits, '0')) {
            $digits = '92'.substr($digits, 1);
        }

        return strlen($digits) >= 10 ? $digits : null;
    }
}
