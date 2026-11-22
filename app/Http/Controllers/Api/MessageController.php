<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSubject;
use App\Models\Message;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Two-way messaging between parents/students and teachers/admin.
 * Parents & students can message staff only; staff can message anyone.
 */
class MessageController extends Controller
{
    /** GET /messages?box=inbox|sent&unread=1 */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $box = $request->query('box', 'inbox');

        $query = Message::with('sender:id,name,role', 'receiver:id,name,role')
            ->whereNull('parent_id')
            ->when($box === 'sent', fn ($q) => $q->where('sender_id', $user->id),
                fn ($q) => $q->where(fn ($w) => $w->where('receiver_id', $user->id)
                    ->orWhereHas('replies', fn ($r) => $r->where('receiver_id', $user->id))))
            ->withCount(['replies as unread_replies' => fn ($q) => $q->where('receiver_id', $user->id)->whereNull('read_at')])
            ->latest('updated_at');

        if ($request->boolean('unread')) {
            $query->where(fn ($q) => $q->where(fn ($w) => $w->where('receiver_id', $user->id)->whereNull('read_at'))
                ->orWhereHas('replies', fn ($r) => $r->where('receiver_id', $user->id)->whereNull('read_at')));
        }

        return response()->json($query->paginate(min((int) $request->query('per_page', 20), 100)));
    }

    /** GET /messages/unread-count */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json(['count' => Message::where('receiver_id', $request->user()->id)->whereNull('read_at')->count()]);
    }

    /** GET /messages/{message} : full conversation; marks it read. */
    public function show(Request $request, Message $message): JsonResponse
    {
        $user = $request->user();
        $root = $message->parent_id ? $message->parent : $message;
        abort_unless(in_array($user->id, [$root->sender_id, $root->receiver_id]), 403);

        Message::where(fn ($q) => $q->where('id', $root->id)->orWhere('parent_id', $root->id))
            ->where('receiver_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'data' => $root->load('sender:id,name,role', 'receiver:id,name,role'),
            'replies' => $root->replies()->with('sender:id,name,role')->oldest()->get(),
        ]);
    }

    /** POST /messages { receiver_id, subject?, body }  |  reply: { parent_id, body } */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'parent_id' => 'nullable|exists:messages,id',
            'receiver_id' => 'required_without:parent_id|nullable|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:5000',
        ]);

        if (! empty($data['parent_id'])) {
            $root = Message::findOrFail($data['parent_id']);
            $root = $root->parent_id ? $root->parent : $root;
            abort_unless(in_array($user->id, [$root->sender_id, $root->receiver_id]), 403);
            $receiverId = $root->sender_id == $user->id ? $root->receiver_id : $root->sender_id;
            $msg = Message::create(['sender_id' => $user->id, 'receiver_id' => $receiverId, 'parent_id' => $root->id, 'body' => $data['body']]);
            $root->touch();
        } else {
            abort_unless($this->contactsFor($user)->contains('id', (int) $data['receiver_id']), 403, 'You cannot message this user.');
            $msg = Message::create(['sender_id' => $user->id, 'receiver_id' => $data['receiver_id'], 'subject' => $data['subject'] ?? null, 'body' => $data['body']]);
        }

        return response()->json(['message' => 'Message sent.', 'data' => $msg->load('receiver:id,name,role')], 201);
    }

    /** GET /messages/contacts : people the current user may message. */
    public function contacts(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->contactsFor($request->user())->values()]);
    }

    protected function contactsFor(User $user): Collection
    {
        $admins = User::where('role', 'admin')->where('is_active', true)->get(['id', 'name', 'role']);

        if (in_array($user->role, ['parent', 'student'], true)) {
            $students = $user->role === 'parent'
                ? ($user->guardian ? $user->guardian->students()->get() : collect())
                : collect([$user->student])->filter();

            $classIds = $students->pluck('school_class_id')->unique();
            $sectionIds = $students->pluck('section_id')->unique();
            $teacherIds = ClassSubject::whereIn('school_class_id', $classIds)->whereNotNull('teacher_id')->pluck('teacher_id')
                ->merge(Section::whereIn('id', $sectionIds)->whereNotNull('class_teacher_id')->pluck('class_teacher_id'))
                ->unique();

            $teachers = User::whereHas('teacher', fn ($q) => $q->whereIn('id', $teacherIds))->where('is_active', true)->get(['id', 'name', 'role']);
            $accounts = User::where('role', 'accountant')->where('is_active', true)->get(['id', 'name', 'role']);

            return $admins->merge($teachers)->merge($accounts)->unique('id');
        }

        if ($user->role === 'teacher' && $user->teacher) {
            $sectionIds = Section::where('class_teacher_id', $user->teacher->id)->pluck('id');
            $classIds = ClassSubject::where('teacher_id', $user->teacher->id)->pluck('school_class_id');
            $guardianUserIds = Student::active()
                ->where(fn ($q) => $q->whereIn('section_id', $sectionIds)->orWhereIn('school_class_id', $classIds))
                ->with('guardian:id,user_id')->get()->pluck('guardian.user_id')->filter()->unique();

            $parents = User::whereIn('id', $guardianUserIds)->get(['id', 'name', 'role']);
            $staff = User::whereIn('role', ['admin', 'teacher', 'accountant', 'librarian', 'receptionist'])
                ->where('is_active', true)->where('id', '!=', $user->id)->get(['id', 'name', 'role']);

            return $staff->merge($parents)->unique('id');
        }

        // Admin & other staff: everyone active.
        return User::where('is_active', true)->where('id', '!=', $user->id)->orderBy('name')->get(['id', 'name', 'role']);
    }
}
