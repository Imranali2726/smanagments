<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookController extends CrudController
{
    protected string $model = Book::class;

    protected array $searchable = ['title', 'author', 'isbn', 'publisher'];

    protected array $filterable = ['category'];

    protected string $orderBy = 'title';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'isbn' => ['nullable', 'string', 'max:30', Rule::unique('books')->ignore($id)],
            'category' => 'nullable|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'edition' => 'nullable|string|max:30',
            'quantity' => 'required|integer|min:1',
            'rack_no' => 'nullable|string|max:20',
        ];
    }

    /** Keeps "available" consistent with quantity changes. */
    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item) {
            $data['available'] = $data['quantity'];
        } elseif (isset($data['quantity'])) {
            $issued = $item->quantity - $item->available;
            if ($data['quantity'] < $issued) {
                throw ValidationException::withMessages(['quantity' => "Quantity cannot be less than {$issued} copies currently issued."]);
            }
            $data['available'] = $data['quantity'] - $issued;
        }

        return $data;
    }
}
