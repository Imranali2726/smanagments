<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\CsvExport;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Generic REST controller. Child classes declare the model, validation rules and
 * list behaviour; they can override the hooks for custom logic.
 *
 * Index query parameters:
 *   ?search=  text search on $searchable columns
 *   ?<field>= exact filter on any $filterable column
 *   ?from=&to= date range on $dateColumn
 *   ?sort=column&direction=asc|desc
 *   ?per_page=15  |  ?all=1 (no pagination, e.g. for dropdowns)
 *   ?export=csv  download the filtered list as a CSV (opens in Excel)
 */
abstract class CrudController extends Controller
{
    /** @var class-string<Model> */
    protected string $model;

    protected array $with = [];

    protected array $withCount = [];

    protected array $searchable = [];

    protected array $filterable = [];

    protected ?string $dateColumn = null;

    protected string $orderBy = 'id';

    protected string $orderDirection = 'desc';

    /** Validated keys that are not DB columns (removed before saving). */
    protected array $nonColumns = [];

    /** Uploaded file fields => folder on the "public" disk. */
    protected array $fileFields = [];

    abstract protected function rules(Request $request, ?int $id = null): array;

    /** Override to scope the listing (e.g. teachers only see their own records). */
    protected function baseQuery(Request $request): Builder
    {
        return ($this->model)::query();
    }

    /** Override to change data before create/update. $item is null on create. */
    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        return $data;
    }

    /** Override for work after create/update (inside the same DB transaction). */
    protected function afterSave(Model $item, Request $request, bool $created): void
    {
        //
    }

    public function index(Request $request)
    {
        $query = $this->baseQuery($request)->with($this->with)->withCount($this->withCount);

        $search = trim((string) $request->query('search', ''));
        if ($search !== '' && $this->searchable) {
            $query->where(function (Builder $q) use ($search) {
                foreach ($this->searchable as $column) {
                    $q->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        foreach ($this->filterable as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->query($field));
            }
        }

        if ($this->dateColumn) {
            if ($request->filled('from')) {
                $query->whereDate($this->dateColumn, '>=', $request->query('from'));
            }
            if ($request->filled('to')) {
                $query->whereDate($this->dateColumn, '<=', $request->query('to'));
            }
        }

        $sort = $request->query('sort');
        $allowedSorts = array_merge(['id', 'created_at', $this->orderBy], $this->searchable, $this->filterable);
        if ($sort && in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $request->query('direction') === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy($this->orderBy, $this->orderDirection);
        }

        if ($request->query('export') === 'csv') {
            return CsvExport::download($query->limit(50000)->get(), class_basename($this->model).'s');
        }

        if ($request->boolean('all')) {
            return response()->json(['data' => $query->get()]);
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 200);

        return response()->json($query->paginate($perPage));
    }

    public function show(int $id): JsonResponse
    {
        $item = ($this->model)::with($this->with)->withCount($this->withCount)->findOrFail($id);

        return response()->json(['data' => $item]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules($request));

        $item = DB::transaction(function () use ($validated, $request) {
            $data = $this->prepare($validated, $request, null);
            $item = ($this->model)::create($data);
            $this->afterSave($item, $request, true);

            return $item;
        });

        return response()->json([
            'message' => 'Record created successfully.',
            'data' => $this->reload($item),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = ($this->model)::findOrFail($id);
        $validated = $request->validate($this->updateRules($request, $id));

        DB::transaction(function () use ($item, $validated, $request) {
            $data = $this->prepare($validated, $request, $item);
            $item->update($data);
            $this->afterSave($item, $request, false);
        });

        return response()->json([
            'message' => 'Record updated successfully.',
            'data' => $this->reload($item),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $item = ($this->model)::findOrFail($id);

        try {
            $item->delete();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'This record cannot be deleted because other records depend on it.',
            ], 422);
        }

        foreach (array_keys($this->fileFields) as $field) {
            if ($item->{$field}) {
                Storage::disk('public')->delete($item->{$field});
            }
        }

        return response()->json(['message' => 'Record deleted successfully.']);
    }

    /** On update every rule becomes "sometimes" so partial updates (PATCH) work. */
    protected function updateRules(Request $request, int $id): array
    {
        return collect($this->rules($request, $id))->map(function ($rule) {
            return is_string($rule) ? 'sometimes|'.$rule : array_merge(['sometimes'], $rule);
        })->all();
    }

    protected function prepare(array $validated, Request $request, ?Model $item): array
    {
        foreach ($this->fileFields as $field => $folder) {
            if ($request->hasFile($field)) {
                if ($item && $item->{$field}) {
                    Storage::disk('public')->delete($item->{$field});
                }
                $validated[$field] = $request->file($field)->store($folder, 'public');
            } else {
                unset($validated[$field]);
            }
        }

        return $this->beforeSave(Arr::except($validated, $this->nonColumns), $request, $item);
    }

    protected function reload(Model $item): Model
    {
        return $item->fresh($this->with)->loadCount($this->withCount);
    }
}
