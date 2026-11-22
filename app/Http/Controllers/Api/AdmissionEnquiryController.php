<?php

namespace App\Http\Controllers\Api;

use App\Models\AdmissionEnquiry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AdmissionEnquiryController extends CrudController
{
    protected string $model = AdmissionEnquiry::class;

    protected array $with = ['schoolClass:id,name', 'assignee:id,name'];

    protected array $searchable = ['name', 'phone', 'student_name', 'email'];

    protected array $filterable = ['status', 'source', 'school_class_id', 'assigned_to'];

    protected ?string $dateColumn = 'enquiry_date';

    protected string $orderBy = 'enquiry_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:255',
            'student_name' => 'nullable|string|max:255',
            'school_class_id' => 'nullable|exists:school_classes,id',
            'source' => 'nullable|in:walk_in,phone,website,social_media,referral,other',
            'enquiry_date' => 'nullable|date',
            'follow_up_date' => 'nullable|date',
            'status' => 'nullable|in:open,follow_up,converted,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string|max:2000',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item && empty($data['enquiry_date'])) {
            $data['enquiry_date'] = today()->toDateString();
        }

        return $data;
    }
}
