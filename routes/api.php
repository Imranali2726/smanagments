<?php

use App\Http\Controllers\Api\AcademicSessionController;
use App\Http\Controllers\Api\AdmissionApplicationController;
use App\Http\Controllers\Api\AdmissionEnquiryController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\ClassSubjectController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\ExamScheduleController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\FeeController;
use App\Http\Controllers\Api\FeeStructureController;
use App\Http\Controllers\Api\FeeTypeController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\GuardianController;
use App\Http\Controllers\Api\HomeworkController;
use App\Http\Controllers\Api\HomeworkSubmissionController;
use App\Http\Controllers\Api\HostelAllocationController;
use App\Http\Controllers\Api\HostelController;
use App\Http\Controllers\Api\HostelRoomController;
use App\Http\Controllers\Api\IncomeController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\LeaveTypeController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\OwnerController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\PaymentSubmissionController;
use App\Http\Controllers\Api\PlatformController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\PhoneCallController;
use App\Http\Controllers\Api\PortalController;
use App\Http\Controllers\Api\PostalRecordController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ResultController;
use App\Http\Controllers\Api\SchoolClassController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SmsController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentRemarkController;
use App\Http\Controllers\Api\StudyMaterialController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\TimetableController;
use App\Http\Controllers\Api\TransportRouteController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\VisitorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| School Management System API  (all routes are prefixed with /api)
|--------------------------------------------------------------------------
| Roles: admin, teacher, student, parent, accountant, librarian, receptionist
| "role:x,y" allows those roles; admin is always allowed.
*/

// Numeric IDs only, so /students/bulk or /students/import-template never hit /students/{student}.
Route::pattern('student', '[0-9]+');
Route::pattern('id', '[0-9]+');

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// ---------- Public (no login): online admission ----------
Route::prefix('public')->middleware('throttle:20,1')->group(function () {
    Route::get('/admission-form', [AdmissionApplicationController::class, 'formOptions']);
    Route::post('/admission-applications', [AdmissionApplicationController::class, 'apply']);
    Route::get('/admission-applications/status', [AdmissionApplicationController::class, 'status']);
});

// ---------- Platform super admin (main domain only) ----------
Route::middleware(['auth:sanctum', 'tenant.user', 'superadmin'])->prefix('platform')->group(function () {
    Route::get('/overview', [PlatformController::class, 'overview']);
    Route::get('/modules', [PlatformController::class, 'modules']);
    Route::get('/schools', [PlatformController::class, 'index']);
    Route::post('/schools', [PlatformController::class, 'store']);
    Route::get('/schools/{school}', [PlatformController::class, 'show']);
    Route::put('/schools/{school}', [PlatformController::class, 'update']);
    Route::post('/schools/{school}/admin-password', [PlatformController::class, 'resetAdmin']);

    // Multi-campus school groups
    Route::get('/groups', [PlatformController::class, 'groups']);
    Route::post('/groups', [PlatformController::class, 'storeGroup']);
    Route::put('/groups/{group}', [PlatformController::class, 'updateGroup']);
    Route::post('/groups/{group}/owners', [PlatformController::class, 'addOwner']);
    Route::delete('/groups/{group}/owners/{owner}', [PlatformController::class, 'removeOwner']);
});

// ---------- Group owner: all campuses (main domain) ----------
Route::middleware(['auth:sanctum', 'tenant.user', 'owner'])->prefix('owner')->group(function () {
    Route::get('/campuses', [OwnerController::class, 'campuses']);
    Route::get('/overview', [OwnerController::class, 'overview']);
});

Route::middleware(['auth:sanctum', 'tenant.user'])->group(function () {

    // ---------- Account (every role) ----------
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/notices/feed', [NoticeController::class, 'feed']);
    Route::get('/events/feed', [EventController::class, 'feed']);
    Route::get('/settings', [SettingController::class, 'index']);
    Route::get('/payment-methods/active', [PaymentSubmissionController::class, 'methods']);

    // Messages (two-way communication)
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/contacts', [MessageController::class, 'contacts']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/{message}', [MessageController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store']);

    // Leave requests (staff apply for themselves, parents for their children)
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::post('/leave-requests/{id}/cancel', [LeaveRequestController::class, 'cancel']);
    Route::get('/leave-types', [LeaveTypeController::class, 'index']);

    // ---------- Admin only ----------
    Route::middleware('role:admin')->group(function () {
        Route::put('/settings', [SettingController::class, 'update']);
        Route::post('/settings', [SettingController::class, 'update']); // for multipart (logo upload)

        Route::apiResource('users', UserController::class);
        Route::apiResource('academic-sessions', AcademicSessionController::class);
        Route::apiResource('classes', SchoolClassController::class)->except(['index', 'show']);
        Route::apiResource('sections', SectionController::class)->except(['index', 'show']);
        Route::apiResource('subjects', SubjectController::class)->except(['index', 'show']);
        Route::apiResource('class-subjects', ClassSubjectController::class)->except(['index', 'show']);
        Route::apiResource('teachers', TeacherController::class)->except(['index', 'show']);
        Route::apiResource('guardians', GuardianController::class)->except(['index', 'show']);
        Route::apiResource('students', StudentController::class)->except(['index', 'show']);
        Route::post('/students/promote', [StudentController::class, 'promote']);
        Route::patch('/students/bulk', [StudentController::class, 'bulkUpdate']);
        Route::post('/students/import', [StudentController::class, 'import']);
        Route::get('/students/import-template', [StudentController::class, 'importTemplate']);
        Route::post('/students/{student}', [StudentController::class, 'update']); // multipart update (photo)

        Route::get('/admission-applications', [AdmissionApplicationController::class, 'index']);
        Route::get('/admission-applications/{id}', [AdmissionApplicationController::class, 'show']);
        Route::post('/admission-applications', [AdmissionApplicationController::class, 'store']);
        Route::delete('/admission-applications/{id}', [AdmissionApplicationController::class, 'destroy']);
        Route::post('/admission-applications/{id}/approve', [AdmissionApplicationController::class, 'approve']);
        Route::post('/admission-applications/{id}/reject', [AdmissionApplicationController::class, 'reject']);

        Route::apiResource('exam-schedules', ExamScheduleController::class)->except(['index', 'show']);
        Route::apiResource('leave-types', LeaveTypeController::class)->except(['index']);
        Route::post('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve']);
        Route::post('/leave-requests/{id}/reject', [LeaveRequestController::class, 'reject']);

        Route::apiResource('payment-methods', PaymentMethodController::class);
        Route::apiResource('vehicles', VehicleController::class);

        // Hostel
        Route::apiResource('hostels', HostelController::class);
        Route::apiResource('hostel-rooms', HostelRoomController::class);
        Route::get('/hostels-occupancy', [HostelAllocationController::class, 'occupancy']);
        Route::get('/hostel-allocations', [HostelAllocationController::class, 'index']);
        Route::post('/hostel-allocations', [HostelAllocationController::class, 'store']);
        Route::post('/hostel-allocations/{allocation}/vacate', [HostelAllocationController::class, 'vacate']);
        Route::apiResource('timetables', TimetableController::class)->except(['index', 'show']);
        Route::apiResource('exams', ExamController::class)->except(['index', 'show']);
        Route::apiResource('grades', GradeController::class)->except(['index', 'show']);
        Route::apiResource('transport-routes', TransportRouteController::class);
        Route::apiResource('notices', NoticeController::class);
        Route::apiResource('events', EventController::class);
        Route::put('/student-remarks/{id}', [StudentRemarkController::class, 'update']);
        Route::delete('/student-remarks/{id}', [StudentRemarkController::class, 'destroy']);

        Route::get('/staff-attendance', [AttendanceController::class, 'staffSheet']);
        Route::post('/staff-attendance', [AttendanceController::class, 'staffStore']);
        Route::get('/staff-attendance/report', [AttendanceController::class, 'staffReport']);

        Route::delete('/fee-payments/{payment}', [FeeController::class, 'deletePayment']);

        Route::post('/sms/send', [SmsController::class, 'send']);
        Route::get('/sms/logs', [SmsController::class, 'logs']);

        Route::get('/reports/student-strength', [ReportController::class, 'studentStrength']);
    });

    // ---------- Staff (read access to master data) ----------
    Route::middleware('role:teacher,accountant,librarian')->group(function () {
        Route::apiResource('classes', SchoolClassController::class)->only(['index', 'show']);
        Route::apiResource('sections', SectionController::class)->only(['index', 'show']);
        Route::apiResource('subjects', SubjectController::class)->only(['index', 'show']);
        Route::apiResource('class-subjects', ClassSubjectController::class)->only(['index', 'show']);
        Route::apiResource('teachers', TeacherController::class)->only(['index', 'show']);
        Route::apiResource('guardians', GuardianController::class)->only(['index', 'show']);
        Route::apiResource('students', StudentController::class)->only(['index', 'show']);
        Route::apiResource('timetables', TimetableController::class)->only(['index', 'show']);
        Route::apiResource('exams', ExamController::class)->only(['index', 'show']);
        Route::apiResource('grades', GradeController::class)->only(['index', 'show']);
        Route::apiResource('exam-schedules', ExamScheduleController::class)->only(['index', 'show']);
        Route::get('/students/{id}/history', [StudentController::class, 'history']);
    });

    // ---------- Dashboard ----------
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('role:accountant');

    // ---------- Academics: teachers ----------
    Route::middleware('role:teacher')->group(function () {
        Route::get('/attendance', [AttendanceController::class, 'sheet']);
        Route::post('/attendance', [AttendanceController::class, 'store']);
        Route::get('/attendance/report', [AttendanceController::class, 'monthlyReport']);
        Route::get('/attendance/students/{student}', [AttendanceController::class, 'student']);
        Route::get('/reports/attendance-summary', [ReportController::class, 'attendanceSummary']);

        Route::get('/marks/sheet', [ResultController::class, 'sheet']);
        Route::post('/marks', [ResultController::class, 'store']);
        Route::get('/results/section', [ResultController::class, 'section']);
        Route::get('/results/report-card', [ResultController::class, 'reportCard']);
        Route::get('/results/subject-performance', [ResultController::class, 'subjectPerformance']);
        Route::get('/results/student-progress', [ResultController::class, 'studentProgress']);

        Route::apiResource('homework', HomeworkController::class);
        Route::post('/homework/{homework}', [HomeworkController::class, 'update']); // multipart update
        Route::get('/homework/{homework}/submissions', [HomeworkSubmissionController::class, 'index']);
        Route::post('/homework-submissions/{submission}/evaluate', [HomeworkSubmissionController::class, 'evaluate']);

        // Download center
        Route::apiResource('study-materials', StudyMaterialController::class);
        Route::post('/study-materials/{study_material}', [StudyMaterialController::class, 'update']); // multipart update

        Route::get('/student-remarks', [StudentRemarkController::class, 'index']);
        Route::post('/student-remarks', [StudentRemarkController::class, 'store']);

        Route::get('/teacher/classes', [PortalController::class, 'teacherClasses']);
        Route::get('/teacher/timetable', [PortalController::class, 'teacherTimetable']);
    });

    // ---------- Finance: accountants ----------
    Route::middleware('role:accountant')->group(function () {
        Route::apiResource('fee-types', FeeTypeController::class);
        Route::apiResource('fee-structures', FeeStructureController::class);

        Route::get('/fee-invoices', [FeeController::class, 'index']);
        Route::post('/fee-invoices', [FeeController::class, 'store']);
        Route::post('/fee-invoices/generate', [FeeController::class, 'generate']);
        Route::post('/fee-invoices/apply-late-fines', [FeeController::class, 'applyLateFines']);
        Route::get('/fee-invoices/{invoice}', [FeeController::class, 'show']);
        Route::put('/fee-invoices/{invoice}', [FeeController::class, 'update']);
        Route::post('/fee-invoices/{invoice}/cancel', [FeeController::class, 'cancel']);
        Route::post('/fee-invoices/{invoice}/payments', [FeeController::class, 'pay']);
        Route::get('/fee-invoices/{invoice}/voucher', [FeeController::class, 'voucher']);
        Route::get('/fee-payments/{payment}/receipt', [FeeController::class, 'receipt']);

        Route::get('/payment-submissions', [PaymentSubmissionController::class, 'index']);
        Route::post('/payment-submissions/{submission}/approve', [PaymentSubmissionController::class, 'approve']);
        Route::post('/payment-submissions/{submission}/reject', [PaymentSubmissionController::class, 'reject']);

        Route::get('/fees/defaulters', [FeeController::class, 'defaulters']);
        Route::post('/fees/send-reminders', [FeeController::class, 'sendReminders']);
        Route::get('/fees/students/{student}/ledger', [FeeController::class, 'ledger']);
        Route::get('/fees/collection-report', [FeeController::class, 'collectionReport']);
        Route::get('/fees/reconciliation', [FeeController::class, 'reconciliation']);

        Route::get('/payroll', [PayrollController::class, 'index']);
        Route::post('/payroll/generate', [PayrollController::class, 'generate']);
        Route::put('/payroll/{salary}', [PayrollController::class, 'update']);
        Route::delete('/payroll/{salary}', [PayrollController::class, 'destroy']);
        Route::post('/payroll/{salary}/pay', [PayrollController::class, 'pay']);
        Route::get('/payroll/{salary}/slip', [PayrollController::class, 'slip']);

        Route::apiResource('expenses', ExpenseController::class);
        Route::apiResource('incomes', IncomeController::class);
        Route::get('/reports/income-expense', [ReportController::class, 'incomeExpense']);

        // Inventory & assets (store)
        Route::apiResource('suppliers', SupplierController::class);
        Route::apiResource('inventory-items', InventoryItemController::class);
        Route::get('/stock-movements', [InventoryController::class, 'movements']);
        Route::post('/stock-movements', [InventoryController::class, 'store']);
        Route::get('/inventory/report', [InventoryController::class, 'report']);
        Route::apiResource('assets', AssetController::class);
    });

    // ---------- Front office: receptionists ----------
    Route::middleware('role:receptionist')->group(function () {
        Route::apiResource('admission-enquiries', AdmissionEnquiryController::class);
        Route::apiResource('visitors', VisitorController::class);
        Route::apiResource('phone-calls', PhoneCallController::class);
        Route::apiResource('postal-records', PostalRecordController::class);
        Route::post('/postal-records/{postal_record}', [PostalRecordController::class, 'update']); // multipart update
        Route::apiResource('complaints', ComplaintController::class);
    });

    // ---------- Library: librarians ----------
    Route::middleware('role:librarian')->group(function () {
        Route::apiResource('books', BookController::class);
        Route::get('/book-issues', [LibraryController::class, 'index']);
        Route::post('/book-issues', [LibraryController::class, 'issue']);
        Route::post('/book-issues/{issue}/return', [LibraryController::class, 'returnBook']);
    });

    // ---------- Student & parent portal ----------
    Route::middleware('role:student,parent')->prefix('portal')->group(function () {
        Route::get('/children', [PortalController::class, 'children']);
        Route::get('/students/{student}/attendance', [PortalController::class, 'attendance']);
        Route::get('/students/{student}/fees', [PortalController::class, 'fees']);
        Route::get('/students/{student}/invoices/{invoice}/voucher', [PortalController::class, 'voucher']);
        Route::get('/students/{student}/exams', [PortalController::class, 'exams']);
        Route::get('/students/{student}/results/{exam}', [PortalController::class, 'result']);
        Route::get('/students/{student}/timetable', [PortalController::class, 'timetable']);
        Route::get('/students/{student}/homework', [PortalController::class, 'homework']);
        Route::post('/students/{student}/homework/{homework}/submit', [HomeworkSubmissionController::class, 'submit']);
        Route::get('/students/{student}/downloads', [PortalController::class, 'downloads']);
        Route::get('/students/{student}/exam-schedule', [PortalController::class, 'examSchedule']);
        Route::get('/students/{student}/progress', [PortalController::class, 'progress']);
        Route::get('/students/{student}/remarks', [PortalController::class, 'remarks']);
        Route::post('/students/{student}/invoices/{invoice}/pay-online', [PaymentSubmissionController::class, 'submit']);
        Route::get('/students/{student}/payment-submissions', [PortalController::class, 'paymentSubmissions']);
        Route::get('/students/{student}/payments/{payment}/receipt', [PortalController::class, 'receipt']);
    });
});
