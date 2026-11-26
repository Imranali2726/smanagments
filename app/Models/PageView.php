<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/** Anonymous visits to the main landing page (no cookies; the visitor id changes every day). */
class PageView extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = ['id'];

    protected $casts = ['created_at' => 'datetime'];

    public const EVENTS = ['view', 'whatsapp', 'video', 'login'];

    public static function isBot(?string $ua): bool
    {
        return ! $ua || (bool) preg_match('/bot|crawl|spider|slurp|preview|facebookexternalhit|facebot|whatsapp\/|telegram|curl|wget|python|headless|lighthouse|pingdom|uptime|monitor|scan/i', $ua);
    }

    public static function source(string $utm, string $ua, ?string $refHost): string
    {
        $utm = strtolower(trim($utm));
        $host = strtolower((string) $refHost);
        $map = ['facebook' => 'Facebook', 'fb' => 'Facebook', 'instagram' => 'Instagram', 'ig' => 'Instagram', 'whatsapp' => 'WhatsApp', 'wa' => 'WhatsApp',
            'google' => 'Google', 'youtube' => 'YouTube', 'tiktok' => 'TikTok', 'linkedin' => 'LinkedIn', 'email' => 'Email', 'sms' => 'SMS', 'brochure' => 'Brochure', 'qr' => 'QR code'];
        if ($utm !== '') {
            return $map[$utm] ?? ucfirst(mb_substr($utm, 0, 28));
        }

        return match (true) {
            str_contains($host, 'facebook') || str_contains($host, 'fb.') || str_contains($ua, 'FBAN') || str_contains($ua, 'FBAV') => 'Facebook',
            str_contains($host, 'instagram') || str_contains($ua, 'Instagram') => 'Instagram',
            str_contains($host, 'whatsapp') || str_contains($host, 'wa.me') => 'WhatsApp',
            str_contains($host, 'google') => 'Google',
            str_contains($host, 'bing') || str_contains($host, 'yahoo') || str_contains($host, 'duckduckgo') => 'Other search',
            str_contains($host, 'youtube') => 'YouTube',
            str_contains($host, 'tiktok') => 'TikTok',
            str_contains($host, 'linkedin') => 'LinkedIn',
            $host === '' => 'Direct',
            default => 'Other sites',
        };
    }

    public static function record(Request $request, string $event = 'view'): void
    {
        $ua = $request->userAgent();
        if (static::isBot($ua) || ! in_array($event, static::EVENTS, true)) {
            return;
        }
        $ref = $event === 'view' ? $request->headers->get('referer') : (is_string($request->input('ref')) ? $request->input('ref') : null);
        $refHost = $ref ? parse_url($ref, PHP_URL_HOST) : null;
        $own = parse_url(config('app.url'), PHP_URL_HOST);
        if ($refHost && $own && ($refHost === $own || str_ends_with($refHost, '.'.$own))) {
            $refHost = null; // moving around our own site
        }
        $device = preg_match('/iPad|Tablet/i', (string) $ua) ? 'tablet' : (preg_match('/Mobi|Android|iPhone/i', (string) $ua) ? 'mobile' : 'desktop');
        $country = strtoupper((string) $request->header('CF-IPCountry', ''));
        $isView = $event === 'view';
        $utm = (string) ($isView ? $request->query('utm_source', '') : $request->input('utm', ''));
        $path = $isView ? $request->path() : (string) $request->input('path', '/');

        static::create([
            'event' => $event,
            'path' => mb_substr('/'.ltrim(parse_url($path, PHP_URL_PATH) ?: '/', '/'), 0, 120),
            'visitor' => substr(hash('sha256', $request->ip().'|'.$ua.'|'.now()->toDateString().'|'.config('app.key')), 0, 16),
            'source' => static::source($utm, (string) $ua, $refHost),
            'referrer_host' => $refHost ? mb_substr($refHost, 0, 120) : null,
            'device' => $device,
            'country' => preg_match('/^[A-Z]{2}$/', $country) && $country !== 'XX' ? $country : null,
        ]);
    }
}
