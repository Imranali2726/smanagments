<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Expense;
use App\Models\FeePayment;
use App\Models\Income;
use App\Models\SalaryPayment;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    /** GET /reports/student-strength : students per class & section by gender. */
    public function studentStrength(): JsonResponse
    {
        $counts = Student::active()
            ->selectRaw('section_id, gender, COUNT(*) as total')
            ->groupBy('section_id', 'gender')->get()->groupBy('section_id');

        $sections = Section::with('schoolClass:id,name,numeric_level')->get()
            ->sortBy(fn ($s) => sprintf('%05d-%s', $s->schoolClass->numeric_level ?? 0, $s->name));

        $rows = $sections->map(function ($s) use ($counts) {
            $c = $counts->get($s->id, collect())->pluck('total', 'gender');

            return [
                'class' => $s->schoolClass->name,
                'section' => $s->name,
                'section_id' => $s->id,
                'capacity' => $s->capacity,
                'male' => (int) ($c['male'] ?? 0),
                'female' => (int) ($c['female'] ?? 0),
                'other' => (int) ($c['other'] ?? 0),
                'total' => (int) $c->sum(),
            ];
        })->values();

        return response()->json([
            'total' => $rows->sum('total'),
            'male' => $rows->sum('male'),
            'female' => $rows->sum('female'),
            'data' => $rows,
        ]);
    }

    /** GET /reports/income-expense?from=&to= : profit & loss. */
    public function incomeExpense(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);
        [$from, $to] = [$data['from'], $data['to']];

        $feeIncome = (float) FeePayment::whereBetween('paid_on', [$from, $to])->sum('amount');
        $otherIncome = Income::whereBetween('income_date', [$from, $to])
            ->selectRaw('category, SUM(amount) as total')->groupBy('category')->pluck('total', 'category')
            ->map(fn ($v) => (float) $v);
        $totalIncome = $feeIncome + $otherIncome->sum();
        $expenses = Expense::whereBetween('expense_date', [$from, $to])
            ->selectRaw('category, SUM(amount) as total')->groupBy('category')->pluck('total', 'category')
            ->map(fn ($v) => (float) $v);
        $salaries = (float) SalaryPayment::where('status', 'paid')->whereBetween('paid_on', [$from, $to])->sum('net_salary');

        $totalExpense = $expenses->sum() + $salaries;

        return response()->json([
            'from' => $from,
            'to' => $to,
            'income' => ['fee_collection' => $feeIncome, 'other_by_category' => $otherIncome, 'total' => round($totalIncome, 2)],
            'expenses' => ['by_category' => $expenses, 'salaries' => $salaries, 'total' => round($totalExpense, 2)],
            'net_profit' => round($totalIncome - $totalExpense, 2),
            'monthly' => $this->monthlyBreakdown($from, $to),
        ]);
    }

    /** GET /reports/attendance-summary?date= : per-section attendance for one day. */
    public function attendanceSummary(Request $request): JsonResponse
    {
        $date = Carbon::parse($request->validate(['date' => 'nullable|date'])['date'] ?? today())->toDateString();

        $counts = Attendance::whereDate('date', $date)
            ->selectRaw('section_id, status, COUNT(*) as total')
            ->groupBy('section_id', 'status')->get()->groupBy('section_id');

        $strength = Student::active()->selectRaw('section_id, COUNT(*) as total')->groupBy('section_id')->pluck('total', 'section_id');

        $rows = Section::with('schoolClass:id,name,numeric_level')->get()
            ->sortBy(fn ($s) => sprintf('%05d-%s', $s->schoolClass->numeric_level ?? 0, $s->name))
            ->map(function ($s) use ($counts, $strength) {
                $c = $counts->get($s->id, collect())->pluck('total', 'status');
                $marked = (int) $c->sum();
                $present = (int) ($c['present'] ?? 0) + (int) ($c['late'] ?? 0);

                return [
                    'class' => $s->schoolClass->name,
                    'section' => $s->name,
                    'section_id' => $s->id,
                    'strength' => (int) ($strength[$s->id] ?? 0),
                    'marked' => $marked > 0,
                    'present' => (int) ($c['present'] ?? 0),
                    'absent' => (int) ($c['absent'] ?? 0),
                    'late' => (int) ($c['late'] ?? 0),
                    'leave' => (int) ($c['leave'] ?? 0),
                    'percentage' => $marked ? round($present / $marked * 100, 1) : null,
                ];
            })->values();

        return response()->json(['date' => $date, 'data' => $rows]);
    }

    protected function monthlyBreakdown(string $from, string $to): array
    {
        $rows = [];
        $cursor = Carbon::parse($from)->startOfMonth();
        $end = Carbon::parse($to)->endOfMonth();
        while ($cursor->lte($end) && count($rows) < 36) {
            $s = $cursor->copy()->max(Carbon::parse($from))->toDateString();
            $e = $cursor->copy()->endOfMonth()->min(Carbon::parse($to))->toDateString();
            $income = (float) FeePayment::whereBetween('paid_on', [$s, $e])->sum('amount') + (float) Income::whereBetween('income_date', [$s, $e])->sum('amount');
            $expense = (float) Expense::whereBetween('expense_date', [$s, $e])->sum('amount') + (float) SalaryPayment::where('status', 'paid')->whereBetween('paid_on', [$s, $e])->sum('net_salary');
            $rows[] = ['month' => $cursor->format('Y-m'), 'label' => $cursor->format('M Y'), 'income' => round($income, 2), 'expense' => round($expense, 2), 'net' => round($income - $expense, 2)];
            $cursor->addMonth();
        }

        return $rows;
    }
}
