<?php

namespace App\Http\Controllers\Api;

use App\Models\TransportRoute;
use Illuminate\Http\Request;

class TransportRouteController extends CrudController
{
    protected string $model = TransportRoute::class;

    protected array $with = ['vehicle:id,vehicle_no,model,capacity,driver_name,driver_phone'];

    protected array $withCount = ['students'];

    protected array $searchable = ['name', 'vehicle_no', 'driver_name'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'vehicle_no' => 'nullable|string|max:30',
            'driver_name' => 'nullable|string|max:255',
            'driver_phone' => 'nullable|string|max:30',
            'fare' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:2000',
        ];
    }
}
