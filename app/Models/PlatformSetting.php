<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Platform-wide key/value settings (JSON values). Not scoped to a school. */
class PlatformSetting extends Model
{
    protected $guarded = ['id'];

    public static function getJson(string $key, mixed $default = null): mixed
    {
        $row = static::where('key', $key)->first();
        if (! $row || $row->value === null) {
            return $default;
        }
        $v = json_decode($row->value, true);

        return json_last_error() === JSON_ERROR_NONE ? $v : $default;
    }

    public static function putJson(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => json_encode($value, JSON_UNESCAPED_UNICODE)]);
    }
}
