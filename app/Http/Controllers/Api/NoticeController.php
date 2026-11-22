<?php

namespace App\Http\Controllers\Api;

use App\Models\Notice;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoticeController extends CrudController
{
    protected string $model = Notice::class;

    protected array $with = ['section.schoolClass:id,name', 'creator:id,name'];

    protected array $searchable = ['title'];

    protected array $filterable = ['audience', 'section_id', 'is_published'];

    protected ?string $dateColumn = 'publish_date';

    protected string $orderBy = 'publish_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'audience' => 'required|in:all,teachers,students,parents,staff',
            'section_id' => 'nullable|exists:sections,id',
            'publish_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:publish_date',
            'is_published' => 'nullable|boolean',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item) {
            $data['created_by'] = $request->user()->id;
            $data['publish_date'] = $data['publish_date'] ?? today()->toDateString();
        }

        return $data;
    }

    /** Notice board for the logged-in user (any role). */
    public function feed(Request $request): JsonResponse
    {
        $notices = Notice::visibleTo($request->user())
            ->with('creator:id,name')
            ->orderByDesc('publish_date')
            ->paginate(min((int) $request->query('per_page', 20), 100));

        return response()->json($notices);
    }
}
