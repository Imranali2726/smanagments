<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    public const DEFAULTS = [
        'school_name' => 'My School',
        'school_address' => '',
        'school_phone' => '',
        'school_email' => '',
        'school_logo' => '',
        'currency' => 'PKR',
        'invoice_due_day' => '10',        // default due day of month for generated invoices
        'late_fee_amount' => '0',         // flat fine added to overdue invoices
        'pass_percentage' => '33',
        'library_fine_per_day' => '10',
        'library_issue_days' => '14',
        'sms_on_absence' => '0',
        'sms_on_payment' => '0',
        'notification_channel' => 'sms',  // sms | whatsapp | both
        'online_admission_open' => '1',
        'admission_fee_type' => 'Admission Fee',
    ];

    protected static ?array $cache = null;

    public static function all_values(): array
    {
        if (static::$cache === null) {
            static::$cache = array_merge(static::DEFAULTS, static::query()->pluck('value', 'key')->all());
        }

        return static::$cache;
    }

    public static function flush(): void
    {
        static::$cache = null;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::all_values()[$key] ?? $default;
    }

    public static function put(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => is_bool($value) ? (int) $value : $value]);
        static::$cache = null;
    }
}
