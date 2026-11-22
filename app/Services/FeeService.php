<?php

namespace App\Services;

use App\Models\AcademicSession;
use App\Models\FeeInvoice;
use App\Models\FeeStructure;
use App\Models\Setting;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class FeeService
{
    /**
     * Generate monthly invoices for many students from the class fee structure.
     *
     * @param  array  $options  month (Y-m), due_date, school_class_id?, section_id?, student_ids?,
     *                          fee_type_ids? (include non-monthly fees e.g. admission/exam fee),
     *                          include_transport (bool), include_hostel (bool), created_by
     * @return array{created:int, skipped:int, invoice_ids:array}
     */
    public function generate(array $options): array
    {
        $month = $options['month'];
        $session = AcademicSession::current();
        $dueDate = $options['due_date']
            ?? Carbon::createFromFormat('Y-m-d', $month.'-01')->day(min(28, (int) Setting::get('invoice_due_day', 10)))->toDateString();

        $students = Student::active()
            ->with('transportRoute', 'activeHostelAllocation.room.hostel')
            ->when($options['school_class_id'] ?? null, fn ($q, $v) => $q->where('school_class_id', $v))
            ->when($options['section_id'] ?? null, fn ($q, $v) => $q->where('section_id', $v))
            ->when($options['student_ids'] ?? null, fn ($q, $v) => $q->whereIn('id', $v))
            ->get();

        $structures = FeeStructure::with('feeType')
            ->whereIn('school_class_id', $students->pluck('school_class_id')->unique())
            ->where(fn ($q) => $q->whereNull('academic_session_id')->orWhere('academic_session_id', $session?->id))
            ->get()
            ->groupBy('school_class_id');

        $extraTypeIds = $options['fee_type_ids'] ?? [];

        $alreadyInvoiced = FeeInvoice::where('month', $month)
            ->where('status', '!=', 'cancelled')
            ->whereIn('student_id', $students->pluck('id'))
            ->pluck('student_id')
            ->flip();

        $created = 0;
        $skipped = 0;
        $ids = [];

        DB::transaction(function () use ($students, $structures, $extraTypeIds, $alreadyInvoiced, $month, $dueDate, $session, $options, &$created, &$skipped, &$ids) {
            foreach ($students as $student) {
                if ($alreadyInvoiced->has($student->id)) {
                    $skipped++;

                    continue;
                }

                $items = [];
                foreach ($structures->get($student->school_class_id, collect()) as $structure) {
                    $isMonthly = $structure->feeType->frequency === 'monthly';
                    if ($isMonthly || in_array($structure->fee_type_id, $extraTypeIds)) {
                        $items[] = [
                            'fee_type_id' => $structure->fee_type_id,
                            'description' => $structure->feeType->name,
                            'amount' => (float) $structure->amount,
                        ];
                    }
                }

                if (($options['include_transport'] ?? true) && $student->transportRoute && $student->transportRoute->fare > 0) {
                    $items[] = [
                        'fee_type_id' => null,
                        'description' => 'Transport Fee ('.$student->transportRoute->name.')',
                        'amount' => (float) $student->transportRoute->fare,
                    ];
                }

                $room = $student->activeHostelAllocation?->room;
                if (($options['include_hostel'] ?? true) && $room && $room->cost_per_month > 0) {
                    $items[] = [
                        'fee_type_id' => null,
                        'description' => 'Hostel Fee ('.$room->hostel->name.', Room '.$room->room_no.')',
                        'amount' => (float) $room->cost_per_month,
                    ];
                }

                if (! $items) {
                    $skipped++;

                    continue;
                }

                $invoice = $this->createInvoice($student, $month, $dueDate, $items, (float) $student->monthly_discount, $session?->id, $options['created_by'] ?? null);
                $ids[] = $invoice->id;
                $created++;
            }
        });

        return ['created' => $created, 'skipped' => $skipped, 'invoice_ids' => $ids];
    }

    public function createInvoice(Student $student, string $month, string $dueDate, array $items, float $discount = 0, ?int $sessionId = null, ?int $createdBy = null, ?string $notes = null): FeeInvoice
    {
        $invoice = FeeInvoice::create([
            'student_id' => $student->id,
            'academic_session_id' => $sessionId ?? AcademicSession::current()?->id,
            'month' => $month,
            'issue_date' => today()->toDateString(),
            'due_date' => $dueDate,
            'discount' => $discount,
            'fine' => 0,
            'notes' => $notes,
            'created_by' => $createdBy,
        ]);

        $invoice->items()->createMany($items);

        return $invoice->recalculate();
    }

    /** Adds the flat late fee (settings.late_fee_amount) to overdue invoices that have no fine yet. */
    public function applyLateFines(): int
    {
        $fine = (float) Setting::get('late_fee_amount', 0);
        if ($fine <= 0) {
            return 0;
        }

        $count = 0;
        FeeInvoice::outstanding()
            ->whereDate('due_date', '<', today())
            ->where('fine', 0)
            ->chunkById(200, function ($invoices) use ($fine, &$count) {
                foreach ($invoices as $invoice) {
                    $invoice->fine = $fine;
                    $invoice->recalculate();
                    $count++;
                }
            });

        return $count;
    }
}
