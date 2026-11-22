<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Manage login accounts (admins, accountants, librarians, and any other user). */
class UserController extends CrudController
{
    protected string $model = User::class;

    protected array $searchable = ['name', 'email', 'phone'];

    protected array $filterable = ['role', 'is_active'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($id)],
            'phone' => 'nullable|string|max:30',
            'password' => $id ? 'nullable|string|min:6' : 'required|string|min:6',
            'role' => 'required|in:'.implode(',', User::ROLES),
            'is_active' => 'nullable|boolean',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (empty($data['password'])) {
            unset($data['password']);
        }

        return $data;
    }

    public function destroy(int $id): JsonResponse
    {
        if ($id === request()->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        return parent::destroy($id);
    }
}
