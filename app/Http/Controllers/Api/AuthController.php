<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string|max:100',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'The email or password is incorrect.']);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages(['email' => 'Your account is inactive. Contact the administrator.']);
        }

        // Multi-school checks (on a school's sub-domain only that school's users are found at all).
        if ($user->role === User::SUPER_ADMIN && \App\Support\Tenant::id()) {
            throw ValidationException::withMessages(['email' => 'The email or password is incorrect.']);
        }
        if ($user->role === User::OWNER) {
            if (\App\Support\Tenant::id() || ! $user->group_id) {
                throw ValidationException::withMessages(['email' => 'Owners sign in on the main address of AAS School Manager.']);
            }
        } elseif ($user->role !== User::SUPER_ADMIN) {
            $school = \App\Models\School::find($user->school_id);
            if (! $school) {
                throw ValidationException::withMessages(['email' => 'Your account is not linked to a school.']);
            }
            if ($school->status !== 'active') {
                throw ValidationException::withMessages(['email' => 'This school\'s account is suspended. Please contact AAS School Manager.']);
            }
            if ($school->isExpired()) {
                throw ValidationException::withMessages(['email' => 'This school\'s subscription has expired. Please renew to continue.']);
            }
        }

        // Two-factor login: the password was right, now ask for the code from the authenticator app.
        if ($user->hasTwoFactor()) {
            return response()->json([
                'two_factor' => true,
                'message' => 'Enter the 6-digit code from your authenticator app.',
                'challenge' => Crypt::encryptString(json_encode([
                    'id' => $user->id, 'exp' => time() + 300, 'device' => $data['device_name'] ?? 'api', 'host' => $request->getHost(),
                ])),
            ]);
        }

        return $this->issueToken($user, $data['device_name'] ?? 'api');
    }

    /** POST /login/two-factor {challenge, code | recovery_code} — second step of the login. */
    public function loginTwoFactor(Request $request): JsonResponse
    {
        $data = $request->validate([
            'challenge' => 'required|string',
            'code' => 'nullable|string|max:12',
            'recovery_code' => 'nullable|string|max:20',
        ]);
        try {
            $c = json_decode(Crypt::decryptString($data['challenge']), true);
        } catch (DecryptException) {
            $c = null;
        }
        if (! is_array($c) || ($c['exp'] ?? 0) < time() || ($c['host'] ?? '') !== $request->getHost()) {
            throw ValidationException::withMessages(['code' => 'This sign-in has expired. Please enter your email and password again.']);
        }
        $user = User::withoutGlobalScopes()->find($c['id'] ?? 0);
        if (! $user || ! $user->is_active || ! $user->hasTwoFactor()) {
            throw ValidationException::withMessages(['code' => 'Please sign in again.']);
        }
        $code = $data['code'] ?? null;
        $recovery = $data['recovery_code'] ?? null;
        if (! $code && ! $recovery) {
            throw ValidationException::withMessages(['code' => 'Enter the code from your authenticator app.']);
        }
        if ($error = TwoFactorController::check($user, $code, $recovery)) {
            throw ValidationException::withMessages([$recovery ? 'recovery_code' : 'code' => $error]);
        }

        return $this->issueToken($user, $c['device'] ?? 'api', $recovery ? count($user->two_factor_recovery_codes ?? []) : null);
    }

    private function issueToken(User $user, string $device, ?int $recoveryLeft = null): JsonResponse
    {
        $user->forceFill(['last_login_at' => now()])->save();
        $token = $user->createToken($device)->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->loadProfile(),
            'school' => \App\Models\School::find($user->school_id)?->summary(),
        ] + ($recoveryLeft !== null ? ['recovery_codes_left' => $recoveryLeft] : []));
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $realRole = $request->attributes->get('real_role', $user->role);

        return response()->json([
            'user' => $user->loadProfile(),
            'real_role' => $realRole,
            'school' => (\App\Support\Tenant::school() ?? \App\Models\School::find($user->school_id))?->summary(),
            'group' => $user->group_id ? \App\Models\SchoolGroup::find($user->group_id)?->only('id', 'name') : null,
            'two_factor' => (bool) $user->hasTwoFactor(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out from all devices.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return response()->json(['message' => 'Profile updated.', 'user' => $user->fresh()]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();
        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'Current password is incorrect.']);
        }

        $user->update(['password' => $data['password']]);
        // Sign out other devices.
        $user->tokens()->where('id', '!=', $user->currentAccessToken()?->id)->delete();

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
