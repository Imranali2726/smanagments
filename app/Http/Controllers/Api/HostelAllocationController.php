<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hostel;
use App\Models\HostelAllocation;
use App\Models\HostelRoom;
use App\Models\Student;
use App\Support\CsvExport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HostelAllocationController extends Controller
{
    /** GET /hostel-allocations?hostel_id=&hostel_room_id=&status=active */
    public function index(Request $request)
    {
        $query = HostelAllocation::with('room.hostel:id,name', 'student:id,first_name,last_name,admission_no,school_class_id,section_id', 'student.schoolClass:id,name')
            ->when($request->query('status', 'active'), fn ($q, $v) => $v === 'all' ? $q : $q->where('status', $v))
            ->when($request->query('hostel_room_id'), fn ($q, $v) => $q->where('hostel_room_id', $v))
            ->when($request->query('hostel_id'), fn ($q, $v) => $q->whereHas('room', fn ($r) => $r->where('hostel_id', $v)))
            ->when($request->query('student_id'), fn ($q, $v) => $q->where('student_id', $v))
            ->orderByDesc('from_date');

        if ($request->query('export') === 'csv') {
            return CsvExport::download($query->get(), 'hostel-allocations');
        }

        return response()->json($query->paginate(min((int) $request->query('per_page', 30), 200)));
    }

    /** POST /hostel-allocations { student_id, hostel_room_id, from_date?, notes? } */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'hostel_room_id' => 'required|exists:hostel_rooms,id',
            'from_date' => 'nullable|date',
            'notes' => 'nullable|string|max:255',
        ]);

        $allocation = DB::transaction(function () use ($data) {
            $room = HostelRoom::with('hostel')->lockForUpdate()->findOrFail($data['hostel_room_id']);
            $student = Student::findOrFail($data['student_id']);

            if (HostelAllocation::where('student_id', $student->id)->where('status', 'active')->exists()) {
                throw ValidationException::withMessages(['student_id' => 'Student already has a room. Vacate it first.']);
            }
            if ($room->activeAllocations()->count() >= $room->capacity) {
                throw ValidationException::withMessages(['hostel_room_id' => 'This room is full.']);
            }
            if ($room->hostel->type !== 'mixed' && $room->hostel->type !== ($student->gender === 'female' ? 'girls' : 'boys')) {
                throw ValidationException::withMessages(['hostel_room_id' => "This is a {$room->hostel->type} hostel."]);
            }

            return HostelAllocation::create([
                'student_id' => $student->id,
                'hostel_room_id' => $room->id,
                'from_date' => $data['from_date'] ?? today()->toDateString(),
                'status' => 'active',
                'notes' => $data['notes'] ?? null,
            ]);
        });

        return response()->json(['message' => 'Room allocated.', 'data' => $allocation->load('room.hostel')], 201);
    }

    /** POST /hostel-allocations/{allocation}/vacate { to_date? } */
    public function vacate(Request $request, HostelAllocation $allocation): JsonResponse
    {
        if ($allocation->status !== 'active') {
            throw ValidationException::withMessages(['status' => 'Already vacated.']);
        }
        $date = $request->validate(['to_date' => 'nullable|date'])['to_date'] ?? today()->toDateString();
        $allocation->update(['status' => 'left', 'to_date' => $date]);

        return response()->json(['message' => 'Room vacated.']);
    }

    /** GET /hostels/occupancy : beds, occupied and free per hostel and room. */
    public function occupancy(): JsonResponse
    {
        $hostels = Hostel::with(['rooms' => fn ($q) => $q->withCount('activeAllocations')->orderBy('room_no')])->get();

        return response()->json(['data' => $hostels->map(fn ($h) => [
            'id' => $h->id,
            'name' => $h->name,
            'type' => $h->type,
            'rooms' => $h->rooms->count(),
            'beds' => $h->rooms->sum('capacity'),
            'occupied' => $h->rooms->sum('active_allocations_count'),
            'available' => $h->rooms->sum('capacity') - $h->rooms->sum('active_allocations_count'),
            'room_details' => $h->rooms->map(fn ($r) => [
                'id' => $r->id, 'room_no' => $r->room_no, 'room_type' => $r->room_type, 'capacity' => $r->capacity,
                'occupied' => $r->active_allocations_count, 'available' => $r->capacity - $r->active_allocations_count,
                'cost_per_month' => $r->cost_per_month,
            ]),
        ])]);
    }
}
