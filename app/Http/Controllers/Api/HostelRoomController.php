<?php

namespace App\Http\Controllers\Api;

use App\Models\HostelRoom;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HostelRoomController extends CrudController
{
    protected string $model = HostelRoom::class;

    protected array $with = ['hostel:id,name,type'];

    protected array $withCount = ['activeAllocations'];

    protected array $searchable = ['room_no', 'room_type'];

    protected array $filterable = ['hostel_id', 'room_type'];

    protected string $orderBy = 'room_no';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'hostel_id' => 'required|exists:hostels,id',
            'room_no' => ['required', 'string', 'max:20', Rule::unique('hostel_rooms')->where('hostel_id', $request->input('hostel_id', $id ? HostelRoom::find($id)?->hostel_id : null))->ignore($id)],
            'room_type' => 'nullable|string|max:50',
            'capacity' => 'required|integer|min:1|max:50',
            'cost_per_month' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:2000',
        ];
    }
}
