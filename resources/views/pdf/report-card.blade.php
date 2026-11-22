<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Report Card</title>
<style>
    @page { margin: 30px; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #222; }
    .header { text-align: center; border-bottom: 2px solid #1f3b73; padding-bottom: 8px; }
    .header h1 { margin: 0; font-size: 20px; color: #1f3b73; }
    .header p { margin: 2px 0; }
    .title { text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold; letter-spacing: 1px; }
    table { width: 100%; border-collapse: collapse; }
    table.info td { padding: 4px; }
    table.info td.k { color: #555; width: 18%; }
    table.marks { margin-top: 12px; }
    table.marks th, table.marks td { border: 1px solid #666; padding: 6px; text-align: center; }
    table.marks th { background: #1f3b73; color: #fff; }
    table.marks td.left { text-align: left; }
    .fail { color: #b00020; font-weight: bold; }
    table.summary { margin-top: 14px; }
    table.summary td { border: 1px solid #666; padding: 6px; text-align: center; }
    table.summary td.k { background: #eef2f9; font-weight: bold; }
    .signatures { margin-top: 60px; display: table; width: 100%; }
    .signatures div { display: table-cell; text-align: center; }
    .signatures span { border-top: 1px solid #333; padding: 0 20px; }
</style>
</head>
<body>
<div class="header">
    <h1>{{ $card['school']['name'] }}</h1>
    @if ($card['school']['address'])<p>{{ $card['school']['address'] }}</p>@endif
    @if ($card['school']['phone'])<p>Phone: {{ $card['school']['phone'] }}</p>@endif
</div>

<div class="title">REPORT CARD — {{ strtoupper($card['exam']['name']) }} @if($card['session']) ({{ $card['session'] }}) @endif</div>

<table class="info">
    <tr>
        <td class="k">Student Name</td><td><strong>{{ $card['student']['name'] }}</strong></td>
        <td class="k">Admission No</td><td>{{ $card['student']['admission_no'] }}</td>
    </tr>
    <tr>
        <td class="k">Father Name</td><td>{{ $card['student']['father_name'] }}</td>
        <td class="k">Roll No</td><td>{{ $card['student']['roll_no'] }}</td>
    </tr>
    <tr>
        <td class="k">Class</td><td>{{ $card['student']['class'] }} - {{ $card['student']['section'] }}</td>
        <td class="k">Date of Birth</td><td>{{ $card['student']['date_of_birth'] }}</td>
    </tr>
</table>

<table class="marks">
    <thead>
        <tr><th>#</th><th>Subject</th><th>Total Marks</th><th>Obtained</th><th>%</th><th>Grade</th><th>Remarks</th></tr>
    </thead>
    <tbody>
    @forelse ($card['subjects'] as $i => $s)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td class="left">{{ $s['subject'] }}</td>
            <td>{{ $s['total_marks'] + 0 }}</td>
            <td class="{{ $s['passed'] ? '' : 'fail' }}">{{ $s['is_absent'] ? 'Absent' : ($s['obtained_marks'] + 0) }}</td>
            <td>{{ $s['percentage'] }}</td>
            <td>{{ $s['grade'] }}</td>
            <td>{{ $s['remarks'] }}</td>
        </tr>
    @empty
        <tr><td colspan="7">No marks recorded.</td></tr>
    @endforelse
    </tbody>
</table>

<table class="summary">
    <tr>
        <td class="k">Total</td><td>{{ $card['obtained_marks'] + 0 }} / {{ $card['total_marks'] + 0 }}</td>
        <td class="k">Percentage</td><td>{{ $card['percentage'] }}%</td>
        <td class="k">Grade</td><td>{{ $card['grade'] }}</td>
    </tr>
    <tr>
        <td class="k">Result</td><td class="{{ $card['result'] === 'Fail' ? 'fail' : '' }}">{{ $card['result'] }}</td>
        <td class="k">Position</td><td>{{ $card['position'] ?? '-' }} of {{ $card['class_strength'] }}</td>
        <td class="k">Attendance</td>
        <td>
            @if ($card['attendance'])
                {{ $card['attendance']['present'] }} / {{ $card['attendance']['working_days'] }} days
            @else - @endif
        </td>
    </tr>
    @if ($card['grade_remarks'])
    <tr><td class="k">Remarks</td><td colspan="5" style="text-align:left">{{ $card['grade_remarks'] }}</td></tr>
    @endif
</table>

<div class="signatures">
    <div><span>Class Teacher</span></div>
    <div><span>Principal</span></div>
    <div><span>Parent</span></div>
</div>
</body>
</html>
