<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeeInvoice;
use App\Models\FeePayment;
use App\Models\PaymentMethod;
use App\Models\PaymentSubmission;
use App\Models\Setting;
use App\Models\Student;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Online fee payment from the parent / student portal.
 * Parent pays via bank transfer / JazzCash / EasyPaisa to an account listed in Payment Methods,
 * uploads the transaction ID and screenshot; the accountant verifies and approves → a fee payment is posted.
 */
class PaymentSubmissionController extends Controller
{
    /** GET /payment-methods/active : accounts parents can pay into (any logged-in user). */
    public function methods(): JsonResponse
    {
        return response()->json(['data' => PaymentMethod::where('is_active', true)->orderBy('name')->get()]);
    }

    /** POST /portal/students/{student}/invoices/{invoice}/pay-online  (multipart) */
    public function submit(Request $request, Student $student, FeeInvoice $invoice): JsonResponse
    {
        $user = $request->user();
        $allowed = ($user->role === 'student' && $student->user_id == $user->id)
            || ($user->role === 'parent' && $user->guardian && $student->guardian_id == $user->guardian->id)
            || $user->role === 'admin';
        abort_unless($allowed && $invoice->student_id == $student->id, 403);

        if ($invoice->status === 'cancelled' || $invoice->balance <= 0) {
            throw ValidationException::withMessages(['amount' => 'Nothing is payable on this invoice.']);
        }
        if (PaymentSubmission::where('fee_invoice_id', $invoice->id)->where('status', 'pending')->exists()) {
            throw ValidationException::withMessages(['amount' => 'A payment for this invoice is already awaiting verification.']);
        }

        $data = $request->validate([
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'method' => 'required|in:bank,jazzcash,easypaisa,online,cheque',
            'amount' => 'required|numeric|min:1|max:'.$invoice->balance,
            'reference' => 'required|string|max:255',
            'paid_on' => 'required|date|before_or_equal:today',
            'proof' => 'nullable|image|max:4096',
        ]);
        if ($request->hasFile('proof')) {
            $data['proof'] = $request->file('proof')->store('payment-proofs', 'public');
        }

        $sub = PaymentSubmission::create($data + [
            'fee_invoice_id' => $invoice->id,
            'student_id' => $student->id,
            'submitted_by' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Payment submitted. It will be confirmed after verification by the accounts office.', 'data' => $sub], 201);
    }

    /** GET /payment-submissions?status=pending */
    public function index(Request $request): JsonResponse
    {
        return response()->json(PaymentSubmission::with(
            'invoice:id,invoice_no,month,total,paid', 'student:id,first_name,last_name,admission_no',
            'paymentMethod:id,name', 'submitter:id,name', 'reviewer:id,name'
        )
            ->when($request->query('status', 'pending'), fn ($q, $v) => $v === 'all' ? $q : $q->where('status', $v))
            ->latest()
            ->paginate(min((int) $request->query('per_page', 20), 200)));
    }

    /** POST /payment-submissions/{submission}/approve */
    public function approve(Request $request, PaymentSubmission $submission, SmsService $sms): JsonResponse
    {
        $this->ensurePending($submission);

        $payment = DB::transaction(function () use ($submission, $request) {
            $invoice = FeeInvoice::lockForUpdate()->findOrFail($submission->fee_invoice_id);
            $amount = min($submission->amount, $invoice->balance);
            if ($amount <= 0) {
                throw ValidationException::withMessages(['amount' => 'Invoice is already fully paid.']);
            }
            $payment = FeePayment::create([
                'fee_invoice_id' => $invoice->id,
                'amount' => $amount,
                'method' => in_array($submission->method, FeePayment::METHODS, true) ? $submission->method : 'online',
                'reference' => $submission->reference,
                'paid_on' => $submission->paid_on,
                'received_by' => $request->user()->id,
                'notes' => 'Online submission #'.$submission->id,
            ]);
            $invoice->recalculate();
            $submission->update(['status' => 'approved', 'fee_payment_id' => $payment->id, 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);

            return $payment;
        });

        $submission->load('student.guardian', 'invoice');
        $sms->send($submission->student->guardian?->phone,
            'Payment of '.Setting::get('currency', 'PKR').' '.number_format($payment->amount)." for {$submission->student->full_name} has been verified. Receipt: ".$payment->fresh()->receipt_no.'. - '.Setting::get('school_name'),
            $request->user()->id);

        return response()->json(['message' => 'Payment approved and posted.', 'receipt' => $payment->fresh()]);
    }

    /** POST /payment-submissions/{submission}/reject { remarks } */
    public function reject(Request $request, PaymentSubmission $submission): JsonResponse
    {
        $this->ensurePending($submission);
        $data = $request->validate(['remarks' => 'required|string|max:255']);
        $submission->update(['status' => 'rejected', 'remarks' => $data['remarks'], 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);

        return response()->json(['message' => 'Payment submission rejected.']);
    }

    protected function ensurePending(PaymentSubmission $submission): void
    {
        if ($submission->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'This submission has already been '.$submission->status.'.']);
        }
    }
}
