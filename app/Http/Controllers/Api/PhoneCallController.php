<?php

namespace App\Http\Controllers\Api;

use App\Models\PhoneCall;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class PhoneCallController extends CrudController
{
    protected string $model = PhoneCall::class;

    protected array $searchable = ['name', 'phone', 'description'];

    protected array $filterable = ['call_type'];

    protected ?string $dateColumn = 'call_date';

    protected string $orderBy = 'call_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'call_type' => 'required|in:incoming,outgoing',
            'call_date' => 'nullable|date',
            'duration' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:2000',
            'follow_up_date' => 'nullable|date',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item && empty($data['call_date'])) {
            $data['call_date'] = today()->toDateString();
        }

        return $data;
    }
}
