<?php

namespace App\Http\Controllers\Api;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleController extends CrudController
{
    protected string $model = Vehicle::class;

    protected array $with = ['routes:id,name,vehicle_id'];

    protected array $searchable = ['vehicle_no', 'model', 'driver_name', 'driver_phone'];

    protected string $orderBy = 'vehicle_no';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'vehicle_no' => ['required', 'string', 'max:30', Rule::unique('vehicles')->ignore($id)],
            'model' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1|max:200',
            'driver_name' => 'nullable|string|max:255',
            'driver_phone' => 'nullable|string|max:30',
            'driver_license' => 'nullable|string|max:50',
            'insurance_expiry' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
        ];
    }
}
