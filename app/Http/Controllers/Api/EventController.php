<?php

namespace App\Http\Controllers\Api;

use App\Models\Event;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends CrudController
{
    protected string $model = Event::class;

    protected array $with = ['creator:id,name'];

    protected array $searchable = ['title', 'location', 'description'];

    protected array $filterable = ['type', 'audience'];

    protected ?string $dateColumn = 'start_date';

    protected string $orderBy = 'start_date';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'type' => 'required|in:'.implode(',', Event::TYPES),
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'audience' => 'required|in:all,staff,parents,students',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item) {
            $data['created_by'] = $request->user()->id;
        }

        return $data;
    }

    /** GET /events/feed?from=&to=  calendar for the logged-in user (any role). */
    public function feed(Request $request): JsonResponse
    {
        $data = $request->validate(['from' => 'nullable|date', 'to' => 'nullable|date']);
        $from = $data['from'] ?? today()->startOfMonth()->toDateString();
        $to = $data['to'] ?? today()->addMonths(2)->endOfMonth()->toDateString();

        $events = Event::visibleTo($request->user())->between($from, $to)
            ->orderBy('start_date')->orderBy('start_time')->limit(500)->get();

        return response()->json(['from' => $from, 'to' => $to, 'data' => $events]);
    }
}
