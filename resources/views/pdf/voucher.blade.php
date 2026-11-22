<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Fee Voucher {{ $invoice->invoice_no }}</title>
<style>
    @page { margin: 18px; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #222; }
    table.copies { width: 100%; border-collapse: collapse; }
    table.copies > tbody > tr > td { width: 33.33%; vertical-align: top; padding: 0 6px; border-right: 1px dashed #999; }
    table.copies > tbody > tr > td:last-child { border-right: none; }
    .copy-label { text-align: right; font-size: 8px; font-weight: bold; text-transform: uppercase; color: #555; }
    .school { text-align: center; margin-bottom: 6px; }
    .school h2 { margin: 0; font-size: 14px; }
    .school p { margin: 1px 0; font-size: 8.5px; }
    table.info, table.items { width: 100%; border-collapse: collapse; margin-top: 6px; }
    table.info td { padding: 2px 3px; }
    table.info td.k { color: #555; width: 38%; }
    table.items th, table.items td { border: 1px solid #555; padding: 3px; }
    table.items th { background: #eee; text-align: left; }
    .num { text-align: right; }
    .total td { font-weight: bold; background: #f5f5f5; }
    .due { margin-top: 6px; padding: 4px; border: 1px solid #333; text-align: center; font-weight: bold; }
    .sign { margin-top: 26px; display: table; width: 100%; font-size: 8.5px; }
    .sign div { display: table-cell; text-align: center; }
    .sign span { border-top: 1px solid #333; padding: 0 12px; }
</style>
</head>
<body>
@php
    $currency = $settings['currency'] ?? 'PKR';
    $student = $invoice->student;
    $grand = $invoice->balance + $previousDue;
@endphp
<table class="copies"><tbody><tr>
@foreach (['Bank Copy', 'School Copy', 'Student Copy'] as $copy)
    <td>
        <div class="copy-label">{{ $copy }}</div>
        <div class="school">
            <h2>{{ $settings['school_name'] }}</h2>
            @if ($settings['school_address'])<p>{{ $settings['school_address'] }}</p>@endif
            @if ($settings['school_phone'])<p>Phone: {{ $settings['school_phone'] }}</p>@endif
            <p><strong>FEE VOUCHER</strong></p>
        </div>

        <table class="info">
            <tr><td class="k">Voucher No</td><td><strong>{{ $invoice->invoice_no }}</strong></td></tr>
            <tr><td class="k">Fee Month</td><td>{{ \Illuminate\Support\Carbon::createFromFormat('Y-m', $invoice->month)->format('F Y') }}</td></tr>
            <tr><td class="k">Issue Date</td><td>{{ $invoice->issue_date->format('d-m-Y') }}</td></tr>
            <tr><td class="k">Due Date</td><td><strong>{{ $invoice->due_date->format('d-m-Y') }}</strong></td></tr>
            <tr><td class="k">Student</td><td>{{ $student->full_name }}</td></tr>
            <tr><td class="k">Father / Guardian</td><td>{{ $student->guardian?->name }}</td></tr>
            <tr><td class="k">Admission No</td><td>{{ $student->admission_no }}</td></tr>
            <tr><td class="k">Class</td><td>{{ $student->schoolClass?->name }} - {{ $student->section?->name }}</td></tr>
        </table>

        <table class="items">
            <thead><tr><th>Description</th><th class="num">Amount ({{ $currency }})</th></tr></thead>
            <tbody>
            @foreach ($invoice->items as $item)
                <tr><td>{{ $item->description }}</td><td class="num">{{ number_format($item->amount) }}</td></tr>
            @endforeach
            @if ($invoice->discount > 0)
                <tr><td>Discount</td><td class="num">- {{ number_format($invoice->discount) }}</td></tr>
            @endif
            @if ($invoice->fine > 0)
                <tr><td>Late Fine</td><td class="num">{{ number_format($invoice->fine) }}</td></tr>
            @endif
            @if ($invoice->paid > 0)
                <tr><td>Already Paid</td><td class="num">- {{ number_format($invoice->paid) }}</td></tr>
            @endif
            @if ($previousDue > 0)
                <tr><td>Previous Arrears</td><td class="num">{{ number_format($previousDue) }}</td></tr>
            @endif
            <tr class="total"><td>Total Payable</td><td class="num">{{ number_format($grand) }}</td></tr>
            </tbody>
        </table>

        @if ((float) ($settings['late_fee_amount'] ?? 0) > 0)
            <div class="due">After due date pay {{ $currency }} {{ number_format($grand + (float) $settings['late_fee_amount']) }}</div>
        @endif

        <div class="sign">
            <div><span>Cashier</span></div>
            <div><span>Officer</span></div>
        </div>
    </td>
@endforeach
</tr></tbody></table>
</body>
</html>
