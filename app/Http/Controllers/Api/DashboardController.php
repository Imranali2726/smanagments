<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Expense;
use App\Models\FeeInvoice;
use App\Models\FeePayment;
use App\Models\AdmissionApplication;
use App\Models\AdmissionEnquiry;
use App\Models\Complaint;
use App\Models\Guardian;
use App\Models\Income;
use App\Models\InventoryItem;
use App\Models\LeaveRequest;
use App\Models\PaymentSubmission;
use App\Models\Notice;
use App\Models\SalaryPayment;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $today = today();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();

        $attendanceToday = Attendance::whereDate('date', $today)
            ->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');
        $marked = (int) $attendanceToday->sum();
        $present = (int) ($attendanceToday['present'] ?? 0) + (int) ($attendanceToday['late'] ?? 0);

        $outstanding = FeeInvoice::outstanding()->selectRaw('COALESCE(SUM(total - paid),0) as due, COUNT(DISTINCT student_id) as students')->first();

        // Last 12 months: fee income vs expenses vs salaries
        $chart = [];
        for ($i = 11; $i >= 0; $i--) {
            $start = $today->copy()->startOfMonth()->subMonths($i);
            $end = $start->copy()->endOfMonth();
            $chart[] = [
                'month' => $start->format('Y-m'),
                'label' => $start->format('M Y'),
                'fee_collected' => (float) FeePayment::whereBetween('paid_on', [$start, $end])->sum('amount'),
                'other_income' => (float) Income::whereBetween('income_date', [$start, $end])->sum('amount'),
                'expenses' => (float) Expense::whereBetween('expense_date', [$start, $end])->sum('amount'),
                'salaries' => (float) SalaryPayment::where('status', 'paid')->where('month', $start->format('Y-m'))->sum('net_salary'),
            ];
        }

        return response()->json([
            'counts' => [
                'students' => Student::active()->count(),
                'male_students' => Student::active()->where('gender', 'male')->count(),
                'female_students' => Student::active()->where('gender', 'female')->count(),
                'teachers' => Teacher::where('status', 'active')->count(),
                'guardians' => Guardian::count(),
                'classes' => SchoolClass::count(),
                'sections' => Section::count(),
                'new_admissions_this_month' => Student::whereBetween('admission_date', [$monthStart, $monthEnd])->count(),
            ],
            'attendance_today' => [
                'marked' => $marked,
                'present' => (int) ($attendanceToday['present'] ?? 0),
                'absent' => (int) ($attendanceToday['absent'] ?? 0),
                'late' => (int) ($attendanceToday['late'] ?? 0),
                'leave' => (int) ($attendanceToday['leave'] ?? 0),
                'percentage' => $marked ? round($present / $marked * 100, 1) : null,
            ],
            'finance' => [
                'collected_today' => (float) FeePayment::whereDate('paid_on', $today)->sum('amount'),
                'collected_this_month' => (float) FeePayment::whereBetween('paid_on', [$monthStart, $monthEnd])->sum('amount'),
                'billed_this_month' => (float) FeeInvoice::where('month', $today->format('Y-m'))->where('status', '!=', 'cancelled')->sum('total'),
                'outstanding_dues' => (float) $outstanding->due,
                'defaulter_students' => (int) $outstanding->students,
                'other_income_this_month' => (float) Income::whereBetween('income_date', [$monthStart, $monthEnd])->sum('amount'),
                'expenses_this_month' => (float) Expense::whereBetween('expense_date', [$monthStart, $monthEnd])->sum('amount'),
                'salaries_paid_this_month' => (float) SalaryPayment::where('status', 'paid')->where('month', $today->format('Y-m'))->sum('net_salary'),
            ],
            'pending' => [
                'admission_applications' => AdmissionApplication::where('status', 'pending')->count(),
                'enquiries_follow_up' => AdmissionEnquiry::whereIn('status', ['open', 'follow_up'])->count(),
                'leave_requests' => LeaveRequest::where('status', 'pending')->count(),
                'online_payments' => PaymentSubmission::where('status', 'pending')->count(),
                'complaints' => Complaint::whereIn('status', ['open', 'in_progress'])->count(),
                'low_stock_items' => InventoryItem::whereColumn('quantity', '<=', 'reorder_level')->count(),
            ],
            'monthly_chart' => $chart,
            'class_strength' => SchoolClass::withCount(['students' => fn ($q) => $q->where('status', 'active')])
                ->orderBy('numeric_level')->get(['id', 'name']),
            'recent_payments' => FeePayment::with('invoice.student:id,first_name,last_name,admission_no')
                ->latest()->limit(8)->get(),
            'notices' => Notice::visibleTo($request->user())->orderByDesc('publish_date')->limit(5)->get(['id', 'title', 'publish_date', 'audience']),
        ]);
    }
}
