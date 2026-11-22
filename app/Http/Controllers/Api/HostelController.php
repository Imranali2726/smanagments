<?php

namespace App\Http\Controllers\Api;

use App\Models\Hostel;
use Illuminate\Http\Request;

class HostelController extends CrudController
{
    protected string $model = Hostel::class;

    protected array $with = ['rooms'];

    protected array $searchable = ['name', 'warden_name'];

    protected array $filterable = ['type'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'nullable|in:boys,girls,mixed',
            'address' => 'nullable|string|max:1000',
            'warden_name' => 'nullable|string|max:255',
            'warden_phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string|max:2000',
        ];
    }
}
