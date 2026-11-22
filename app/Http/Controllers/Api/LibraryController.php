<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookIssue;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LibraryController extends Controller
{
    /** GET /book-issues?status=&student_id=&teacher_id=&overdue=1 */
    public function index(Request $request): JsonResponse
    {
        $query = BookIssue::with('book:id,title,author,isbn', 'student:id,first_name,last_name,admission_no', 'teacher:id,name,employee_no')
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('student_id'), fn ($q, $v) => $q->where('student_id', $v))
            ->when($request->query('teacher_id'), fn ($q, $v) => $q->where('teacher_id', $v))
            ->when($request->query('book_id'), fn ($q, $v) => $q->where('book_id', $v))
            ->when($request->boolean('overdue'), fn ($q) => $q->where('status', 'issued')->whereDate('due_date', '<', today()))
            ->orderByDesc('issue_date');

        return response()->json($query->paginate(min((int) $request->query('per_page', 20), 200)));
    }

    /** POST /book-issues { book_id, student_id | teacher_id, issue_date?, due_date? } */
    public function issue(Request $request): JsonResponse
    {
        $data = $request->validate([
            'book_id' => 'required|exists:books,id',
            'student_id' => 'nullable|required_without:teacher_id|exists:students,id',
            'teacher_id' => 'nullable|required_without:student_id|exists:teachers,id',
            'issue_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:issue_date',
        ]);

        $issue = DB::transaction(function () use ($data, $request) {
            $book = Book::lockForUpdate()->findOrFail($data['book_id']);
            if ($book->available < 1) {
                throw ValidationException::withMessages(['book_id' => 'No copies of this book are available.']);
            }
            $issueDate = Carbon::parse($data['issue_date'] ?? today());
            $book->decrement('available');

            return BookIssue::create([
                'book_id' => $book->id,
                'student_id' => $data['student_id'] ?? null,
                'teacher_id' => $data['teacher_id'] ?? null,
                'issue_date' => $issueDate->toDateString(),
                'due_date' => $data['due_date'] ?? $issueDate->copy()->addDays((int) Setting::get('library_issue_days', 14))->toDateString(),
                'status' => 'issued',
                'issued_by' => $request->user()->id,
            ]);
        });

        return response()->json(['message' => 'Book issued.', 'data' => $issue->load('book:id,title')], 201);
    }

    /** POST /book-issues/{issue}/return { return_date?, fine?, lost? } — fine auto-calculated if omitted. */
    public function returnBook(Request $request, BookIssue $issue): JsonResponse
    {
        if ($issue->status !== 'issued') {
            throw ValidationException::withMessages(['status' => 'This book has already been returned.']);
        }
        $data = $request->validate([
            'return_date' => 'nullable|date',
            'fine' => 'nullable|numeric|min:0',
            'lost' => 'nullable|boolean',
        ]);

        $returnDate = Carbon::parse($data['return_date'] ?? today());
        $lateDays = (int) max(0, floor($issue->due_date->diffInDays($returnDate, false)));
        $fine = $data['fine'] ?? round($lateDays * (float) Setting::get('library_fine_per_day', 0), 2);
        $lost = $request->boolean('lost');

        DB::transaction(function () use ($issue, $returnDate, $fine, $lost) {
            $issue->update([
                'return_date' => $returnDate->toDateString(),
                'fine' => $fine,
                'status' => $lost ? 'lost' : 'returned',
            ]);
            if ($lost) {
                // A lost copy leaves the stock permanently.
                $issue->book()->where('quantity', '>', 0)->decrement('quantity');
            } else {
                $issue->book()->increment('available');
            }
        });

        return response()->json([
            'message' => $lost ? 'Book marked as lost.' : 'Book returned.',
            'late_days' => (int) $lateDays,
            'fine' => $fine,
            'data' => $issue->fresh('book:id,title'),
        ]);
    }
}
