<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SchoolGroup;
use App\Support\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Group owner: all campuses of the group at a glance. */
class OwnerController extends Controller
{
    private function campusList(Request $request)
    {
        return School::where('group_id', $request->user()->group_id)->orderBy('name')->get();
    }

    /** GET /owner/campuses */
    public function campuses(Request $request): JsonResponse
    {
        return response()->json([
            'group' => SchoolGroup::find($request->user()->group_id)?->only('id', 'name'),
            'data' => $this->campusList($request)->map(fn ($c) => $c->summary() + ['is_expired' => $c->isExpired()]),
        ]);
    }

    /** GET /owner/overview  per-campus dashboard figures + group totals. */
    public function overview(Request $request): JsonResponse
    {
        $previous = Tenant::school();
        $rows = [];
        $totals = ['students' => 0, 'teachers' => 0, 'collected_today' => 0, 'collected_this_month' => 0, 'billed_this_month' => 0,
            'outstanding_dues' => 0, 'defaulter_students' => 0, 'expenses_this_month' => 0, 'other_income_this_month' => 0,
            'salaries_paid_this_month' => 0, 'present_today' => 0, 'marked_today' => 0, 'pending_admissions' => 0, 'pending_leaves' => 0];

        foreach ($this->campusList($request) as $campus) {
            Tenant::set($campus);
            $d = app(DashboardController::class)->index($request)->getData(true);
            $att = $d['attendance_today'];
            $fin = $d['finance'];
            $rows[] = [
                'campus' => $campus->summary() + ['is_expired' => $campus->isExpired()],
                'counts' => $d['counts'],
                'attendance_today' => $att,
                'finance' => $fin,
                'pending' => $d['pending'],
                'monthly_chart' => $d['monthly_chart'] ?? [],
            ];
            $totals['students'] += $d['counts']['students'];
            $totals['teachers'] += $d['counts']['teachers'];
            foreach (['collected_today', 'collected_this_month', 'billed_this_month', 'outstanding_dues', 'defaulter_students', 'expenses_this_month', 'other_income_this_month', 'salaries_paid_this_month'] as $k) {
                $totals[$k] += $fin[$k] ?? 0;
            }
            $totals['present_today'] += ($att['present'] ?? 0) + ($att['late'] ?? 0);
            $totals['marked_today'] += $att['marked'] ?? 0;
            $totals['pending_admissions'] += $d['pending']['admission_applications'] ?? 0;
            $totals['pending_leaves'] += $d['pending']['leave_requests'] ?? 0;
        }
        Tenant::set($previous);

        $totals['attendance_percentage'] = $totals['marked_today'] ? round($totals['present_today'] / $totals['marked_today'] * 100, 1) : null;

        return response()->json([
            'group' => SchoolGroup::find($request->user()->group_id)?->only('id', 'name'),
            'totals' => $totals,
            'campuses' => $rows,
        ]);
    }
}
