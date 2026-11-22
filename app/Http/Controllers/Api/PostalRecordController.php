<?php

namespace App\Http\Controllers\Api;

use App\Models\PostalRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class PostalRecordController extends CrudController
{
    protected string $model = PostalRecord::class;

    protected array $searchable = ['title', 'reference_no', 'from_title', 'to_title'];

    protected array $filterable = ['type'];

    protected array $fileFields = ['attachment' => 'postal'];

    protected ?string $dateColumn = 'postal_date';

    protected string $orderBy = 'postal_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'type' => 'required|in:receive,dispatch',
            'reference_no' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'from_title' => 'nullable|string|max:255',
            'to_title' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'postal_date' => 'nullable|date',
            'attachment' => 'nullable|file|max:10240',
            'notes' => 'nullable|string|max:2000',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item && empty($data['postal_date'])) {
            $data['postal_date'] = today()->toDateString();
        }

        return $data;
    }
}
