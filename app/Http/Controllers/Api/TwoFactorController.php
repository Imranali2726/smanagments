<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Totp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Two-factor login with an authenticator app (Google Authenticator, Microsoft Authenticator, Authy…).
 * Every user can switch it on for their own account.
 */
class TwoFactorController extends Controller
{
    /** GET /two-factor */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'enabled' => (bool) $user->hasTwoFactor(),
            'pending' => ! $user->hasTwoFactor() && (bool) $user->two_factor_secret,
            'confirmed_at' => $user->two_factor_confirmed_at,
            'recovery_codes_left' => count($user->two_factor_recovery_codes ?? []),
        ]);
    }

    /** POST /two-factor/enable {password} — starts setup: returns the secret and the QR link. */
    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->checkPassword($request, $user);
        if ($user->hasTwoFactor()) {
            throw ValidationException::withMessages(['password' => 'Two-factor login is already on.']);
        }

        $secret = Totp::secret();
        $user->forceFill(['two_factor_secret' => $secret, 'two_factor_confirmed_at' => null, 'two_factor_recovery_codes' => null, 'two_factor_last_step' => null])->save();

        return response()->json([
            'secret' => trim(chunk_split($secret, 4, ' ')),
            'otpauth_url' => Totp::uri($secret, $user->email),
        ]);
    }

    /** POST /two-factor/confirm {code} — finishes setup with the first code from the app. */
    public function confirm(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => 'required|string|max:12']);
        $user = $request->user();
        if (! $user->two_factor_secret || $user->hasTwoFactor()) {
            throw ValidationException::withMessages(['code' => 'Start the setup again.']);
        }
        $step = Totp::verify($user->two_factor_secret, $data['code']);
        if ($step === null) {
            throw ValidationException::withMessages(['code' => 'This code is not correct. Check the time on your phone and try the newest code.']);
        }

        $codes = $this->newRecoveryCodes($user);
        $user->forceFill(['two_factor_confirmed_at' => now(), 'two_factor_last_step' => $step])->save();
        // Other devices must sign in again with the code.
        $user->tokens()->where('id', '!=', $user->currentAccessToken()?->id)->delete();

        return response()->json(['message' => 'Two-factor login is on.', 'recovery_codes' => $codes]);
    }

    /** POST /two-factor/recovery-codes {password} — replaces the recovery codes. */
    public function recoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->checkPassword($request, $user);
        abort_unless($user->hasTwoFactor(), 422, 'Two-factor login is not on.');

        return response()->json(['message' => 'New recovery codes created. The old ones no longer work.', 'recovery_codes' => $this->newRecoveryCodes($user)]);
    }

    /** POST /two-factor/disable {password} */
    public function disable(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->checkPassword($request, $user);
        $user->clearTwoFactor();

        return response()->json(['message' => 'Two-factor login is off.']);
    }

    /** POST /users/{user}/reset-two-factor — a school admin turns it off for someone who lost their phone. */
    public function resetForUser(Request $request, User $user): JsonResponse
    {
        abort_if($user->role === User::SUPER_ADMIN || $user->role === User::OWNER, 403);
        abort_if($user->id === $request->user()->id, 422, 'Use your own security settings to change your two-factor login.');
        $user->clearTwoFactor();
        $user->tokens()->delete();

        return response()->json(['message' => "Two-factor login turned off for {$user->name}. They can sign in with the password and set it up again."]);
    }

    /**
     * Checks the code (or a recovery code) during login. Marks a code as used.
     * Returns null on success, or the error message.
     */
    public static function check(User $user, ?string $code, ?string $recovery): ?string
    {
        if ($recovery) {
            $hash = hash('sha256', strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $recovery)));
            $codes = $user->two_factor_recovery_codes ?? [];
            $i = array_search($hash, $codes, true);
            if ($i === false) {
                return 'This recovery code is not correct or was already used.';
            }
            array_splice($codes, $i, 1);
            $user->forceFill(['two_factor_recovery_codes' => $codes])->save();

            return null;
        }
        $step = Totp::verify((string) $user->two_factor_secret, (string) $code, $user->two_factor_last_step);
        if ($step === null) {
            return 'This code is not correct. Use the newest code from your authenticator app.';
        }
        $user->forceFill(['two_factor_last_step' => $step])->save();

        return null;
    }

    /** 8 one-time codes like "K7Q2-9XMB"; only their hashes are stored. */
    private function newRecoveryCodes(User $user): array
    {
        $plain = [];
        for ($i = 0; $i < 8; $i++) {
            $c = strtoupper(Str::random(8));
            $c = strtr($c, ['0' => 'X', 'O' => 'Y', '1' => 'Z', 'I' => 'W', 'L' => 'V']);
            $plain[] = substr($c, 0, 4).'-'.substr($c, 4);
        }
        $user->forceFill(['two_factor_recovery_codes' => array_map(fn ($c) => hash('sha256', str_replace('-', '', $c)), $plain)])->save();

        return $plain;
    }

    private function checkPassword(Request $request, User $user): void
    {
        $request->validate(['password' => 'required|string']);
        if (! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages(['password' => 'The password is incorrect.']);
        }
    }
}
