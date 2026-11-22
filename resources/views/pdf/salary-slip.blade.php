<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Salary Slip</title>
<style>
    @page { margin: 24px; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #222; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 10px; }
    .header h2 { margin: 0; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 5px; }
    table.box td, table.box th { border: 1px solid #666; }
    th { background: #eee; text-align: left; }
    .num { text-align: right; }
    .net td { font-weight: bold; background: #f3f3f3; }
</style>
</head>
<body>
@php($currency = $settings['currency'] ?? 'PKR')
<div class="header">
    <h2>{{ $settings['school_name'] }}</h2>
    <div>Salary Slip — {{ \Illuminate\Support\Carbon::createFromFormat('Y-m', $salary->month)->format('F Y') }}</div>
</div>

<table>
    <tr><td><strong>Name:</strong> {{ $salary->teacher->name }}</td><td><strong>Employee No:</strong> {{ $salary->teacher->employee_no }}</td></tr>
    <tr><td><strong>Designation:</strong> {{ $salary->teacher->designation }}</td><td><strong>Absent Days:</strong> {{ $salary->absent_days }}</td></tr>
</table>
<br>
<table class="box">
    <tr><th>Description</th><th class="num">Amount ({{ $currency }})</th></tr>
    <tr><td>Basic Salary</td><td class="num">{{ number_format($salary->basic_salary, 2) }}</td></tr>
    <tr><td>Allowances</td><td class="num">{{ number_format($salary->allowances, 2) }}</td></tr>
    <tr><td>Deductions</td><td class="num">- {{ number_format($salary->deductions, 2) }}</td></tr>
    <tr class="net"><td>Net Salary</td><td class="num">{{ number_format($salary->net_salary, 2) }}</td></tr>
</table>
<p>
    Status: <strong>{{ ucfirst($salary->status) }}</strong>
    @if ($salary->paid_on) — Paid on {{ $salary->paid_on->format('d-m-Y') }} via {{ $salary->payment_method }} @endif
</p>
@if ($salary->notes)<p>Notes: {{ $salary->notes }}</p>@endif
</body>
</html>
