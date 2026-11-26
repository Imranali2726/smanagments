<?php

namespace App\Models;

use App\Support\Tenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ActivityLog extends Model
{
    use Concerns\BelongsToSchool;

    public const UPDATED_AT = null;

    protected $guarded = ['id'];

    protected $casts = ['created_at' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Short "Chrome on Windows" style description of a browser. */
    public static function device(?string $ua): ?string
    {
        if (! $ua) {
            return null;
        }
        $b = match (true) {
            str_contains($ua, 'Edg/') => 'Edge',
            str_contains($ua, 'OPR/') || str_contains($ua, 'Opera') => 'Opera',
            str_contains($ua, 'SamsungBrowser') => 'Samsung Internet',
            str_contains($ua, 'Chrome/') => 'Chrome',
            str_contains($ua, 'Firefox/') => 'Firefox',
            str_contains($ua, 'Safari/') => 'Safari',
            str_contains($ua, 'okhttp') || str_contains($ua, 'Dart/') => 'Mobile app',
            default => 'Browser',
        };
        $os = match (true) {
            str_contains($ua, 'Android') => 'Android',
            str_contains($ua, 'iPhone') || str_contains($ua, 'iPad') => 'iPhone/iPad',
            str_contains($ua, 'Windows') => 'Windows',
            str_contains($ua, 'Mac OS') => 'Mac',
            str_contains($ua, 'Linux') => 'Linux',
            default => null,
        };

        return $os ? "{$b} on {$os}" : $b;
    }

    public static function record(?User $user, string $action, string $description, ?Request $request = null, array $extra = []): void
    {
        $request ??= request();
        $real = $request->attributes->get('real_role');
        static::create(array_merge([
            'school_id' => Tenant::id() ?? $user?->school_id,
            'user_id' => $user?->id,
            'actor_role' => $real ?: $user?->getOriginal('role') ?? $user?->role,
            'action' => $action,
            'description' => mb_substr($description, 0, 255),
            'ip' => $request->ip(),
            'device' => mb_substr((string) static::device($request->userAgent()), 0, 120) ?: null,
        ], $extra));
    }
}
