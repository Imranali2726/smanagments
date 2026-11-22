<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt {{ $payment->receipt_no }}</title>
<style>
    @page { margin: 22px; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 10.5px; color: #222; }
    .header { text-align: center; border-bottom: 2px solid #1f3b73; padding-bottom: 6px; }
    .header h2 { margin: 0; color: #1f3b73; }
    .header p { margin: 1px 0; font-size: 9px; }
    .title { text-align: center; font-weight: bold; margin: 8px 0; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; }
    table.info td { padding: 3px; }
    table.info td.k { color: #555; width: 32%; }
    table.box { margin-top: 8px; }
    table.box td, table.box th { border: 1px solid #777; padding: 4px; }
    table.box th { background: #eef2f9; text-align: left; }
    .num { text-align: right; }
    .big td { font-weight: bold; font-size: 12px; background: #f3f6fb; }
    .paid-stamp { margin-top: 10px; text-align: center; font-size: 16px; font-weight: bold; color: #1b7a3a; border: 2px solid #1b7a3a; padding: 4px; }
    .footer { margin-top: 26px; display: table; width: 100%; font-size: 9px; }
    .footer div { display: table-cell; }
</style>
</head>
<body>
@php($currency = $settings['currency'] ?? 'PKR')
@php($student = $invoice->student)
<div class="header">
    <h2>{{ $settings['school_name'] }}</h2>
    @if ($settings['school_address'])<p>{{ $settings['school_address'] }}</p>@endif
    @if ($settings['school_phone'])<p>Phone: {{ $settings['school_phone'] }}</p>@endif
</div>
<div class="title">FEE PAYMENT RECEIPT</div>

<table class="info">
    <tr><td class="k">Receipt No</td><td><strong>{{ $payment->receipt_no }}</strong></td></tr>
    <tr><td class="k">Date</td><td>{{ $payment->paid_on->format('d-m-Y') }}</td></tr>
    <tr><td class="k">Student</td><td>{{ $student->full_name }} ({{ $student->admission_no }})</td></tr>
    <tr><td class="k">Father / Guardian</td><td>{{ $student->guardian?->name }}</td></tr>
    <tr><td class="k">Class</td><td>{{ $student->schoolClass?->name }} - {{ $student->section?->name }}</td></tr>
    <tr><td class="k">Invoice</td><td>{{ $invoice->invoice_no }} ({{ \Illuminate\Support\Carbon::createFromFormat('Y-m', $invoice->month)->format('F Y') }})</td></tr>
    <tr><td class="k">Payment Method</td><td>{{ ucfirst($payment->method) }} @if($payment->reference) — Ref: {{ $payment->reference }} @endif</td></tr>
</table>

<table class="box">
    <tr><th>Invoice Details</th><th class="num">{{ $currency }}</th></tr>
    @foreach ($invoice->items as $item)
        <tr><td>{{ $item->description }}</td><td class="num">{{ number_format($item->amount) }}</td></tr>
    @endforeach
    @if ($invoice->discount > 0)<tr><td>Discount</td><td class="num">- {{ number_format($invoice->discount) }}</td></tr>@endif
    @if ($invoice->fine > 0)<tr><td>Fine</td><td class="num">{{ number_format($invoice->fine) }}</td></tr>@endif
    <tr><td><strong>Invoice Total</strong></td><td class="num"><strong>{{ number_format($invoice->total) }}</strong></td></tr>
    <tr class="big"><td>Amount Received</td><td class="num">{{ number_format($payment->amount) }}</td></tr>
    <tr><td>Total Paid on Invoice</td><td class="num">{{ number_format($invoice->paid) }}</td></tr>
    <tr><td>Remaining Balance</td><td class="num">{{ number_format($invoice->balance) }}</td></tr>
</table>

@if ($invoice->balance <= 0)<div class="paid-stamp">PAID IN FULL</div>@endif

<div class="footer">
    <div>Received by: {{ $payment->receiver?->name ?? '—' }}</div>
    <div style="text-align:right">This is a computer-generated receipt.</div>
</div>
</body>
</html>
