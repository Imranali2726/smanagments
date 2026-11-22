<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeePayment extends Model
{
    use Concerns\BelongsToSchool;

    public const METHODS = ['cash', 'bank', 'cheque', 'jazzcash', 'easypaisa', 'online'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'paid_on' => 'date:Y-m-d',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (FeePayment $payment) {
            if (! $payment->receipt_no) {
                $payment->receipt_no = 'RCPT-'.str_pad((string) $payment->id, 7, '0', STR_PAD_LEFT);
                $payment->saveQuietly();
            }
        });
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(FeeInvoice::class, 'fee_invoice_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
