<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeInvoice extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    protected $appends = ['balance'];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date:Y-m-d',
            'due_date' => 'date:Y-m-d',
            'subtotal' => 'float',
            'discount' => 'float',
            'fine' => 'float',
            'total' => 'float',
            'paid' => 'float',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (FeeInvoice $invoice) {
            if (! $invoice->invoice_no) {
                $invoice->invoice_no = 'INV-'.str_replace('-', '', $invoice->month).'-'.str_pad((string) $invoice->id, 6, '0', STR_PAD_LEFT);
                $invoice->saveQuietly();
            }
        });
    }

    protected function balance(): Attribute
    {
        return Attribute::get(fn () => round(max(0, (float) ($this->attributes['total'] ?? 0) - (float) ($this->attributes['paid'] ?? 0)), 2));
    }

    public function scopeOutstanding($query)
    {
        return $query->whereIn('status', ['unpaid', 'partial']);
    }

    /** Re-computes subtotal, total, paid and status from items & payments. */
    public function recalculate(): self
    {
        $this->subtotal = (float) $this->items()->sum('amount');
        $this->total = max(0, round($this->subtotal - (float) $this->discount + (float) $this->fine, 2));
        $this->paid = (float) $this->payments()->sum('amount');

        if ($this->status !== 'cancelled') {
            $this->status = match (true) {
                $this->total <= 0 || $this->paid >= $this->total => 'paid',
                $this->paid > 0 => 'partial',
                default => 'unpaid',
            };
        }

        $this->save();

        return $this;
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(FeeInvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
