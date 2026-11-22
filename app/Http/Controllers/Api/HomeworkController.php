<?php

namespace App\Http\Controllers\Api;

use App\Models\Homework;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class HomeworkController extends CrudController
{
    protected string $model = Homework::class;

    protected array $with = ['section.schoolClass:id,name', 'subject:id,name', 'teacher:id,name'];

    protected array $withCount = ['submissions'];

    protected array $searchable = ['title'];

    protected array $filterable = ['section_id', 'subject_id', 'teacher_id'];

    protected ?string $dateColumn = 'assigned_date';

    protected string $orderBy = 'assigned_date';

    protected array $fileFields = ['attachment' => 'homework'];

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,ppt,pptx,xls,xlsx,zip',
            'assigned_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:assigned_date',
        ];
    }

    /** Teachers only see / manage their own homework. */
    protected function baseQuery(Request $request): Builder
    {
        $user = $request->user();

        return Homework::query()->when($user->role === 'teacher', fn ($q) => $q->where('teacher_id', $user->teacher?->id ?? 0));
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        $user = $request->user();
        if ($user->role === 'teacher') {
            if ($item && $item->teacher_id != $user->teacher?->id) {
                throw ValidationException::withMessages(['id' => 'You can only edit your own homework.']);
            }
            $data['teacher_id'] = $user->teacher?->id;
        }
        if (! $item) {
            $data['assigned_date'] = $data['assigned_date'] ?? today()->toDateString();
        }

        return $data;
    }

    public function destroy(int $id): JsonResponse
    {
        $user = request()->user();
        if ($user->role === 'teacher' && Homework::findOrFail($id)->teacher_id != $user->teacher?->id) {
            return response()->json(['message' => 'You can only delete your own homework.'], 403);
        }

        return parent::destroy($id);
    }
}
