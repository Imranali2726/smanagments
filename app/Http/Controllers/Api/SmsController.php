<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use App\Models\SmsLog;
use App\Models\Student;
use App\Models\Teacher;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SmsController extends Controller
{
    /**
     * POST /sms/send
     * { audience: all_parents|class|section|teachers|custom, school_class_id?, section_id?, numbers?[], message, channel?: sms|whatsapp|both }
     */
    public function send(Request $request, SmsService $sms): JsonResponse
    {
        $data = $request->validate([
            'audience' => 'required|in:all_parents,class,section,teachers,custom',
            'school_class_id' => 'required_if:audience,class|nullable|exists:school_classes,id',
            'section_id' => 'required_if:audience,section|nullable|exists:sections,id',
            'numbers' => 'required_if:audience,custom|nullable|array',
            'numbers.*' => 'string|max:30',
            'message' => 'required|string|max:600',
            'channel' => 'nullable|in:sms,whatsapp,both',
        ]);

        $guardianPhones = fn ($studentQuery) => Guardian::whereIn('id', $studentQuery->whereNotNull('guardian_id')->pluck('guardian_id'))->pluck('phone')->all();

        $numbers = match ($data['audience']) {
            'all_parents' => $guardianPhones(Student::active()),
            'class' => $guardianPhones(Student::active()->where('school_class_id', $data['school_class_id'])),
            'section' => $guardianPhones(Student::active()->where('section_id', $data['section_id'])),
            'teachers' => Teacher::where('status', 'active')->pluck('phone')->all(),
            'custom' => $data['numbers'],
        };

        $count = $sms->send($numbers, $data['message'], $request->user()->id, $data['channel'] ?? null);

        return response()->json(['message' => "{$count} SMS processed."]);
    }

    /** GET /sms/logs?status=&search= */
    public function logs(Request $request): JsonResponse
    {
        return response()->json(SmsLog::query()
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('channel'), fn ($q, $v) => $q->where('channel', $v))
            ->when($request->query('search'), fn ($q, $v) => $q->where(fn ($w) => $w->where('to', 'like', "%{$v}%")->orWhere('message', 'like', "%{$v}%")))
            ->latest()
            ->paginate(min((int) $request->query('per_page', 30), 200)));
    }
}
