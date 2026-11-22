<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Lets teacher / student / guardian forms optionally create a login:
 *   create_login=1, login_email=..., password=...
 */
trait CreatesLoginAccount
{
    protected function loginRules(?int $userId = null): array
    {
        return [
            'create_login' => 'nullable|boolean',
            'login_email' => ['nullable', 'required_if:create_login,1,true', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => 'nullable|required_if:create_login,1,true|string|min:6',
        ];
    }

    protected function syncLoginAccount(Model $profile, Request $request, string $role, string $name): void
    {
        $user = $profile->user_id ? User::find($profile->user_id) : null;

        if ($user) {
            // Keep the login name in sync; optionally reset password / email.
            $changes = ['name' => $name];
            if ($request->filled('login_email')) {
                $changes['email'] = $request->input('login_email');
            }
            if ($request->filled('password')) {
                $changes['password'] = $request->input('password');
            }
            $user->update($changes);

            return;
        }

        if ($request->boolean('create_login')) {
            $user = User::create([
                'name' => $name,
                'email' => $request->input('login_email'),
                'password' => $request->input('password'),
                'phone' => $profile->phone ?? null,
                'role' => $role,
                'is_active' => true,
            ]);
            $profile->update(['user_id' => $user->id]);
        }
    }
}
