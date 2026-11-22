<?php

namespace App\Http\Controllers\Api;

use App\Models\Complaint;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ComplaintController extends CrudController
{
    protected string $model = Complaint::class;

    protected array $with = ['assignee:id,name'];

    protected array $searchable = ['complainant_name', 'phone', 'complaint_type', 'description'];

    protected array $filterable = ['status', 'complaint_type', 'source', 'assigned_to'];

    protected ?string $dateColumn = 'complaint_date';

    protected string $orderBy = 'complaint_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'complainant_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'complaint_type' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:30',
            'description' => 'required|string|max:5000',
            'complaint_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'nullable|in:open,in_progress,resolved,closed',
            'action_taken' => 'nullable|string|max:5000',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item && empty($data['complaint_date'])) {
            $data['complaint_date'] = today()->toDateString();
        }
        if (in_array($data['status'] ?? null, ['resolved', 'closed'], true) && ! $item?->resolved_at) {
            $data['resolved_at'] = today()->toDateString();
        }

        return $data;
    }
}
