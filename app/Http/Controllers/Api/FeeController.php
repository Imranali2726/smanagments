<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeeInvoice;
use App\Models\FeePayment;
use App\Models\Setting;
use App\Models\Student;
use App\Services\FeeService;
use App\Services\SmsService;
use App\Support\CsvExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FeeController extends Controller
{
    public function __construct(protected FeeService $fees, protected SmsService $sms)
    {
    }

    /** GET /fee-invoices?status=&month=&student_id=&school_class_id=&section_id=&search=&export=csv */
    public function index(Request $request)
    {
        $query = FeeInvoice::with('student:id,first_name,last_name,admission_no,school_class_id,section_id', 'student.schoolClass:id,name', 'student.section:id,name')
            ->when($request->query('status'), fn ($q, $v) => $v === 'outstanding' ? $q->outstanding() : $q->where('status', $v))
            ->when($request->query('month'), fn ($q, $v) => $q->where('month', $v))
            ->when($request->query('student_id'), fn ($q, $v) => $q->where('student_id', $v))
            ->when($request->query('school_class_id'), fn ($q, $v) => $q->whereHas('student', fn ($s) => $s->where('school_class_id', $v)))
            ->when($request->query('section_id'), fn ($q, $v) => $q->whereHas('student', fn ($s) => $s->where('section_id', $v)))
            ->when($request->query('search'), function ($q, $v) {
                $q->where(fn ($w) => $w->where('invoice_no', 'like', "%{$v}%")
                    ->orWhereHas('student', fn ($s) => $s->where('first_name', 'like', "%{$v}%")
                        ->orWhere('last_name', 'like', "%{$v}%")->orWhere('admission_no', 'like', "%{$v}%")));
            })
            ->orderByDesc('month')->orderByDesc('id');

        if ($request->query('export') === 'csv') {
            return CsvExport::download($query->get(), 'fee-invoices-'.($request->query('month') ?? 'all'));
        }

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        return response()->json($query->paginate(min((int) $request->query('per_page', 20), 200)));
    }

    public function show(FeeInvoice $invoice): JsonResponse
    {
        return response()->json(['data' => $invoice->load(
            'student.schoolClass:id,name', 'student.section:id,name', 'student.guardian:id,name,phone',
            'items.feeType:id,name', 'payments.receiver:id,name', 'academicSession:id,name'
        )]);
    }

    /** POST /fee-invoices/generate : bulk monthly invoices from fee structure. */
    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => 'required|date_format:Y-m',
            'due_date' => 'nullable|date',
            'school_class_id' => 'nullable|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'integer|exists:students,id',
            'fee_type_ids' => 'nullable|array',
            'fee_type_ids.*' => 'integer|exists:fee_types,id',
            'include_transport' => 'nullable|boolean',
            'include_hostel' => 'nullable|boolean',
        ]);
        $data['include_transport'] = $request->boolean('include_transport', true);
        $data['include_hostel'] = $request->boolean('include_hostel', true);
        $data['created_by'] = $request->user()->id;

        $result = $this->fees->generate($data);

        return response()->json([
            'message' => "{$result['created']} invoice(s) generated, {$result['skipped']} skipped (already invoiced or no fee defined).",
            ...$result,
        ]);
    }

    /** POST /fee-invoices : one custom invoice. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'month' => 'required|date_format:Y-m',
            'due_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.fee_type_id' => 'nullable|exists:fee_types,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        $invoice = DB::transaction(fn () => $this->fees->createInvoice(
            Student::findOrFail($data['student_id']),
            $data['month'],
            $data['due_date'],
            array_map(fn ($i) => [
                'fee_type_id' => $i['fee_type_id'] ?? null,
                'description' => $i['description'],
                'amount' => $i['amount'],
            ], $data['items']),
            (float) ($data['discount'] ?? 0),
            null,
            $request->user()->id,
            $data['notes'] ?? null,
        ));

        return response()->json(['message' => 'Invoice created.', 'data' => $invoice->load('items', 'student:id,first_name,last_name,admission_no')], 201);
    }

    /** PUT /fee-invoices/{invoice} : change discount, fine, due date, notes (and optionally items). */
    public function update(Request $request, FeeInvoice $invoice): JsonResponse
    {
        if ($invoice->status === 'cancelled') {
            throw ValidationException::withMessages(['status' => 'Cancelled invoices cannot be edited.']);
        }

        $data = $request->validate([
            'due_date' => 'sometimes|date',
            'discount' => 'sometimes|numeric|min:0',
            'fine' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'items' => 'sometimes|array|min:1',
            'items.*.fee_type_id' => 'nullable|exists:fee_types,id',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.amount' => 'required_with:items|numeric|min:0',
        ]);

        DB::transaction(function () use ($invoice, $data) {
            $invoice->fill(collect($data)->except('items')->all());
            if (isset($data['items'])) {
                $invoice->items()->delete();
                $invoice->items()->createMany($data['items']);
            }
            $invoice->recalculate();
        });

        return response()->json(['message' => 'Invoice updated.', 'data' => $invoice->fresh('items', 'payments')]);
    }

    /** POST /fee-invoices/{invoice}/cancel */
    public function cancel(FeeInvoice $invoice): JsonResponse
    {
        if ($invoice->paid > 0) {
            throw ValidationException::withMessages(['status' => 'Invoice has payments. Delete the payments first.']);
        }
        $invoice->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Invoice cancelled.']);
    }

    /** POST /fee-invoices/{invoice}/payments { amount, method, reference?, paid_on?, notes?, notify? } */
    public function pay(Request $request, FeeInvoice $invoice): JsonResponse
    {
        if ($invoice->status === 'cancelled') {
            throw ValidationException::withMessages(['status' => 'Cannot collect payment on a cancelled invoice.']);
        }
        if ($invoice->balance <= 0) {
            throw ValidationException::withMessages(['amount' => 'This invoice is already fully paid.']);
        }

        $data = $request->validate([
            'amount' => 'required|numeric|min:1|max:'.$invoice->balance,
            'method' => 'required|in:'.implode(',', FeePayment::METHODS),
            'reference' => 'nullable|string|max:255',
            'paid_on' => 'nullable|date|before_or_equal:today',
            'notes' => 'nullable|string|max:255',
            'notify' => 'nullable|boolean',
        ]);

        $payment = DB::transaction(function () use ($invoice, $data, $request) {
            $payment = $invoice->payments()->create([
                'amount' => $data['amount'],
                'method' => $data['method'],
                'reference' => $data['reference'] ?? null,
                'paid_on' => $data['paid_on'] ?? today()->toDateString(),
                'notes' => $data['notes'] ?? null,
                'received_by' => $request->user()->id,
            ]);
            $invoice->recalculate();

            return $payment;
        });

        if ($request->boolean('notify', (bool) Setting::get('sms_on_payment'))) {
            $invoice->load('student.guardian');
            $currency = Setting::get('currency', 'PKR');
            $this->sms->send(
                $invoice->student->guardian?->phone,
                "Received {$currency} ".number_format($payment->amount)." for {$invoice->student->full_name} (Invoice {$invoice->invoice_no}). Balance: {$currency} ".number_format($invoice->balance).'. Thank you. - '.Setting::get('school_name'),
                $request->user()->id
            );
        }

        return response()->json([
            'message' => 'Payment received.',
            'receipt' => $payment->fresh(),
            'invoice' => $invoice->fresh(),
        ], 201);
    }

    /** DELETE /fee-payments/{payment} (admin only — reverses a wrong entry). */
    public function deletePayment(FeePayment $payment): JsonResponse
    {
        DB::transaction(function () use ($payment) {
            $invoice = $payment->invoice;
            $payment->delete();
            $invoice->recalculate();
        });

        return response()->json(['message' => 'Payment deleted and invoice recalculated.']);
    }

    /** GET /fee-invoices/{invoice}/voucher : printable fee challan (PDF, 3 copies). */
    public function voucher(FeeInvoice $invoice)
    {
        $invoice->load('student.schoolClass', 'student.section', 'student.guardian', 'items');

        $previousDue = FeeInvoice::outstanding()
            ->where('student_id', $invoice->student_id)
            ->where('id', '!=', $invoice->id)
            ->where('month', '<', $invoice->month)
            ->get()->sum('balance');

        return Pdf::loadView('pdf.voucher', [
            'invoice' => $invoice,
            'previousDue' => $previousDue,
            'settings' => Setting::all_values(),
        ])->setPaper('a4', 'landscape')->download("fee-voucher-{$invoice->invoice_no}.pdf");
    }

    /** POST /fee-invoices/apply-late-fines */
    public function applyLateFines(): JsonResponse
    {
        $count = $this->fees->applyLateFines();

        return response()->json(['message' => "Late fine applied to {$count} overdue invoice(s)."]);
    }

    /** GET /fees/defaulters?school_class_id=&section_id=&min_balance=&export=csv */
    public function defaulters(Request $request)
    {
        $rows = FeeInvoice::whereIn('fee_invoices.status', ['unpaid', 'partial'])
            ->join('students', 'students.id', '=', 'fee_invoices.student_id')
            ->where('students.status', 'active')
            ->when($request->query('school_class_id'), fn ($q, $v) => $q->where('students.school_class_id', $v))
            ->when($request->query('section_id'), fn ($q, $v) => $q->where('students.section_id', $v))
            ->groupBy('fee_invoices.student_id')
            ->selectRaw('fee_invoices.student_id, COUNT(*) as invoices, SUM(fee_invoices.total - fee_invoices.paid) as balance, MIN(fee_invoices.due_date) as oldest_due_date')
            ->havingRaw('SUM(fee_invoices.total - fee_invoices.paid) >= ?', [(float) $request->query('min_balance', 1)])
            ->orderByDesc('balance')
            ->get();

        $students = Student::with('schoolClass:id,name', 'section:id,name', 'guardian:id,name,phone')
            ->whereIn('id', $rows->pluck('student_id'))->get()->keyBy('id');

        $data = $rows->map(fn ($r) => [
            'student' => $students->get($r->student_id),
            'invoices' => (int) $r->invoices,
            'balance' => round((float) $r->balance, 2),
            'oldest_due_date' => $r->oldest_due_date,
        ]);

        if ($request->query('export') === 'csv') {
            return CsvExport::download($data->map(fn ($r) => [
                'admission_no' => $r['student']?->admission_no,
                'student' => $r['student']?->full_name,
                'class' => $r['student']?->schoolClass?->name.' - '.$r['student']?->section?->name,
                'guardian' => $r['student']?->guardian?->name,
                'phone' => $r['student']?->guardian?->phone,
                'invoices' => $r['invoices'],
                'balance' => $r['balance'],
                'oldest_due_date' => $r['oldest_due_date'],
            ]), 'fee-defaulters');
        }

        return response()->json(['total_due' => round($data->sum('balance'), 2), 'count' => $data->count(), 'data' => $data]);
    }

    /** POST /fees/send-reminders { school_class_id?, section_id?, message? } */
    public function sendReminders(Request $request): JsonResponse
    {
        $request->validate(['message' => 'nullable|string|max:500', 'channel' => 'nullable|in:sms,whatsapp,both']);
        $request->query->remove('export');
        $defaulters = collect($this->defaulters($request)->getData(true)['data']);
        $currency = Setting::get('currency', 'PKR');
        $school = Setting::get('school_name');
        $sent = 0;

        foreach ($defaulters as $row) {
            $phone = $row['student']['guardian']['phone'] ?? null;
            $name = trim($row['student']['first_name'].' '.($row['student']['last_name'] ?? ''));
            $message = $request->input('message')
                ?: "Dear Parent, fee of {$currency} ".number_format($row['balance'])." is outstanding for {$name}. Kindly pay at the earliest. - {$school}";
            $sent += $this->sms->send($phone, $message, $request->user()->id, $request->input('channel'));
        }

        return response()->json(['message' => "{$sent} reminder(s) sent."]);
    }

    /** GET /fees/students/{student}/ledger */
    public function ledger(Student $student): JsonResponse
    {
        return response()->json(self::studentLedger($student));
    }

    public static function studentLedger(Student $student): array
    {
        $invoices = FeeInvoice::with('items:id,fee_invoice_id,description,amount', 'payments')
            ->where('student_id', $student->id)->where('status', '!=', 'cancelled')
            ->orderBy('month')->get();

        $entries = collect();
        foreach ($invoices as $inv) {
            $entries->push(['date' => $inv->issue_date->format('Y-m-d'), 'type' => 'invoice', 'reference' => $inv->invoice_no, 'description' => 'Fee for '.$inv->month, 'debit' => $inv->total, 'credit' => 0]);
            foreach ($inv->payments as $p) {
                $entries->push(['date' => $p->paid_on->format('Y-m-d'), 'type' => 'payment', 'reference' => $p->receipt_no, 'description' => 'Payment ('.$p->method.')', 'debit' => 0, 'credit' => $p->amount]);
            }
        }

        $balance = 0;
        $entries = $entries->sortBy([['date', 'asc'], ['type', 'asc']])->values()->map(function ($e) use (&$balance) {
            $balance = round($balance + $e['debit'] - $e['credit'], 2);

            return $e + ['balance' => $balance];
        });

        return [
            'student' => $student->only('id', 'admission_no', 'full_name'),
            'total_billed' => round($invoices->sum('total'), 2),
            'total_paid' => round($invoices->sum('paid'), 2),
            'balance' => round($invoices->sum('total') - $invoices->sum('paid'), 2),
            'invoices' => $invoices,
            'ledger' => $entries,
        ];
    }

    /** GET /fees/collection-report?from=&to=&method=&received_by=&export=csv */
    public function collectionReport(Request $request)
    {
        $data = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'method' => 'nullable|in:'.implode(',', FeePayment::METHODS),
            'received_by' => 'nullable|exists:users,id',
        ]);

        $payments = FeePayment::with('invoice:id,invoice_no,student_id,month', 'invoice.student:id,first_name,last_name,admission_no,school_class_id', 'invoice.student.schoolClass:id,name', 'receiver:id,name')
            ->whereBetween('paid_on', [$data['from'], $data['to']])
            ->when($data['method'] ?? null, fn ($q, $v) => $q->where('method', $v))
            ->when($data['received_by'] ?? null, fn ($q, $v) => $q->where('received_by', $v))
            ->orderBy('paid_on')->get();

        if ($request->query('export') === 'csv') {
            return CsvExport::download($payments->map(fn ($p) => [
                'receipt_no' => $p->receipt_no, 'paid_on' => $p->paid_on->format('Y-m-d'), 'invoice_no' => $p->invoice?->invoice_no,
                'month' => $p->invoice?->month, 'admission_no' => $p->invoice?->student?->admission_no,
                'student' => $p->invoice?->student?->full_name, 'class' => $p->invoice?->student?->schoolClass?->name,
                'method' => $p->method, 'reference' => $p->reference, 'amount' => $p->amount, 'received_by' => $p->receiver?->name,
            ]), 'fee-collection');
        }

        return response()->json([
            'from' => $data['from'],
            'to' => $data['to'],
            'total' => round($payments->sum('amount'), 2),
            'count' => $payments->count(),
            'by_method' => $payments->groupBy('method')->map(fn ($g) => round($g->sum('amount'), 2)),
            'by_class' => $payments->groupBy(fn ($p) => $p->invoice?->student?->schoolClass?->name ?? 'Unknown')->map(fn ($g) => round($g->sum('amount'), 2)),
            'by_day' => $payments->groupBy(fn ($p) => $p->paid_on->format('Y-m-d'))->map(fn ($g) => round($g->sum('amount'), 2)),
            'data' => $payments,
        ]);
    }

    /** GET /fee-payments/{payment}/receipt : PDF payment receipt. */
    public function receipt(FeePayment $payment)
    {
        $payment->load('invoice.student.schoolClass', 'invoice.student.section', 'invoice.student.guardian', 'invoice.items', 'receiver:id,name');

        return Pdf::loadView('pdf.receipt', [
            'payment' => $payment,
            'invoice' => $payment->invoice,
            'settings' => Setting::all_values(),
        ])->setPaper('a5', 'portrait')->download("receipt-{$payment->receipt_no}.pdf");
    }

    /**
     * GET /fees/reconciliation?month=YYYY-MM : end-of-month reconciliation.
     * Billed vs collected for the month, collections by method and by day,
     * arrears recovered (payments against older invoices) and closing outstanding.
     */
    public function reconciliation(Request $request): JsonResponse
    {
        $month = $request->validate(['month' => 'required|date_format:Y-m'])['month'];
        $start = \Illuminate\Support\Carbon::createFromFormat('Y-m-d', $month.'-01')->startOfDay();
        $end = $start->copy()->endOfMonth();

        $invoices = FeeInvoice::where('month', $month)->where('status', '!=', 'cancelled')->get();
        $payments = FeePayment::with('invoice:id,month')->whereBetween('paid_on', [$start->toDateString(), $end->toDateString()])->get();

        $currentMonthPayments = $payments->filter(fn ($p) => $p->invoice?->month === $month);
        $arrearsRecovered = $payments->filter(fn ($p) => $p->invoice && $p->invoice->month < $month);
        $advance = $payments->filter(fn ($p) => $p->invoice && $p->invoice->month > $month);

        return response()->json([
            'month' => $month,
            'billing' => [
                'invoices' => $invoices->count(),
                'gross' => round($invoices->sum('subtotal'), 2),
                'discounts' => round($invoices->sum('discount'), 2),
                'fines' => round($invoices->sum('fine'), 2),
                'net_billed' => round($invoices->sum('total'), 2),
                'paid' => $invoices->where('status', 'paid')->count(),
                'partial' => $invoices->where('status', 'partial')->count(),
                'unpaid' => $invoices->where('status', 'unpaid')->count(),
            ],
            'collection' => [
                'total_received' => round($payments->sum('amount'), 2),
                'against_this_month' => round($currentMonthPayments->sum('amount'), 2),
                'arrears_recovered' => round($arrearsRecovered->sum('amount'), 2),
                'advance_received' => round($advance->sum('amount'), 2),
                'by_method' => $payments->groupBy('method')->map(fn ($g) => round($g->sum('amount'), 2)),
                'by_day' => $payments->groupBy(fn ($p) => $p->paid_on->format('Y-m-d'))->map(fn ($g) => round($g->sum('amount'), 2))->sortKeys(),
            ],
            'this_month_outstanding' => round($invoices->sum('total') - $invoices->sum('paid'), 2),
            'collection_rate' => $invoices->sum('total') > 0 ? round($invoices->sum('paid') / $invoices->sum('total') * 100, 1) : null,
            'total_outstanding_all_months' => round((float) FeeInvoice::outstanding()->selectRaw('COALESCE(SUM(total - paid),0) as due')->value('due'), 2),
        ]);
    }
}
