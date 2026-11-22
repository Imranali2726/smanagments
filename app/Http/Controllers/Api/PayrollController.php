<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalaryPayment;
use App\Models\Setting;
use App\Models\StaffAttendance;
use App\Models\Teacher;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayrollController extends Controller
{
    /** GET /payroll?month=&status=&teacher_id= */
    public function index(Request $request): JsonResponse
    {
        $query = SalaryPayment::with('teacher:id,name,employee_no,designation')
            ->when($request->query('month'), fn ($q, $v) => $q->where('month', $v))
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('teacher_id'), fn ($q, $v) => $q->where('teacher_id', $v))
            ->orderByDesc('month')->orderBy('teacher_id');

        $items = $request->boolean('all') ? $query->get() : null;

        return response()->json($items !== null
            ? ['data' => $items, 'total_net' => round($items->sum('net_salary'), 2)]
            : $query->paginate(min((int) $request->query('per_page', 50), 200)));
    }

    /**
     * POST /payroll/generate { month, deduct_absences? }
     * Creates a pending salary record for every active teacher that has none for the month.
     * With deduct_absences, (basic / days in month) is deducted per absent day.
     */
    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => 'required|date_format:Y-m',
            'deduct_absences' => 'nullable|boolean',
        ]);
        $start = Carbon::createFromFormat('Y-m-d', $data['month'].'-01');
        $end = $start->copy()->endOfMonth();
        $deduct = $request->boolean('deduct_absences');

        $existing = SalaryPayment::where('month', $data['month'])->pluck('teacher_id')->flip();
        $absences = StaffAttendance::where('status', 'absent')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('teacher_id, COUNT(*) as days')->groupBy('teacher_id')->pluck('days', 'teacher_id');

        $created = 0;
        DB::transaction(function () use ($data, $existing, $absences, $deduct, $start, &$created) {
            Teacher::where('status', 'active')->each(function (Teacher $t) use ($data, $existing, $absences, $deduct, $start, &$created) {
                if ($existing->has($t->id)) {
                    return;
                }
                $absent = (int) ($absences[$t->id] ?? 0);
                $basic = (float) $t->basic_salary;
                $deductions = $deduct ? round($basic / $start->daysInMonth * $absent, 2) : 0;

                $salary = new SalaryPayment([
                    'teacher_id' => $t->id,
                    'month' => $data['month'],
                    'basic_salary' => $basic,
                    'allowances' => 0,
                    'deductions' => $deductions,
                    'absent_days' => $absent,
                    'status' => 'pending',
                ]);
                $salary->computeNet()->save();
                $created++;
            });
        });

        return response()->json(['message' => "{$created} salary record(s) generated for {$data['month']}."]);
    }

    /** PUT /payroll/{salary} { allowances, deductions, basic_salary, notes } */
    public function update(Request $request, SalaryPayment $salary): JsonResponse
    {
        if ($salary->status === 'paid') {
            throw ValidationException::withMessages(['status' => 'Paid salaries cannot be edited.']);
        }
        $data = $request->validate([
            'basic_salary' => 'sometimes|numeric|min:0',
            'allowances' => 'sometimes|numeric|min:0',
            'deductions' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);
        $salary->fill($data)->computeNet()->save();

        return response()->json(['message' => 'Salary updated.', 'data' => $salary->load('teacher:id,name')]);
    }

    /** POST /payroll/{salary}/pay { payment_method, paid_on? } */
    public function pay(Request $request, SalaryPayment $salary): JsonResponse
    {
        if ($salary->status === 'paid') {
            throw ValidationException::withMessages(['status' => 'Salary already paid.']);
        }
        $data = $request->validate([
            'payment_method' => 'required|string|max:30',
            'paid_on' => 'nullable|date|before_or_equal:today',
        ]);
        $salary->update([
            'status' => 'paid',
            'payment_method' => $data['payment_method'],
            'paid_on' => $data['paid_on'] ?? today()->toDateString(),
        ]);

        return response()->json(['message' => 'Salary marked as paid.', 'data' => $salary]);
    }

    public function destroy(SalaryPayment $salary): JsonResponse
    {
        if ($salary->status === 'paid') {
            throw ValidationException::withMessages(['status' => 'Paid salaries cannot be deleted.']);
        }
        $salary->delete();

        return response()->json(['message' => 'Salary record deleted.']);
    }

    /** GET /payroll/{salary}/slip  (PDF) */
    public function slip(SalaryPayment $salary)
    {
        return Pdf::loadView('pdf.salary-slip', [
            'salary' => $salary->load('teacher'),
            'settings' => Setting::all_values(),
        ])->setPaper('a5', 'landscape')->download("salary-slip-{$salary->teacher->employee_no}-{$salary->month}.pdf");
    }
}
