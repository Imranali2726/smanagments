<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\CreatesLoginAccount;
use App\Models\Guardian;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class GuardianController extends CrudController
{
    use CreatesLoginAccount;

    protected string $model = Guardian::class;

    protected array $with = ['user:id,email,is_active', 'students:id,guardian_id,first_name,last_name,admission_no,school_class_id,section_id'];

    protected array $withCount = ['students'];

    protected array $searchable = ['name', 'phone', 'cnic', 'email'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected array $nonColumns = ['create_login', 'login_email', 'password'];

    protected function rules(Request $request, ?int $id = null): array
    {
        $userId = $id ? Guardian::find($id)?->user_id : null;

        return array_merge([
            'name' => 'required|string|max:255',
            'relation' => 'nullable|string|max:30',
            'phone' => 'required|string|max:30',
            'alternate_phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'cnic' => 'nullable|string|max:20',
            'occupation' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
        ], $this->loginRules($userId));
    }

    protected function afterSave(Model $item, Request $request, bool $created): void
    {
        $this->syncLoginAccount($item, $request, 'parent', $item->name);
    }
}
