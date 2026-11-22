<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
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
        if ($user->role !== User::SUPER_ADMIN) {
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

        $user->forceFill(['last_login_at' => now()])->save();
        $token = $user->createToken($data['device_name'] ?? 'api')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->loadProfile(),
            'school' => \App\Models\School::find($user->school_id)?->summary(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->loadProfile(),
            'school' => \App\Models\School::find($request->user()->school_id)?->summary(),
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
