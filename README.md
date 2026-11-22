# AAS School Manager: Laravel + MySQL school management system

AAS School Manager is a complete school management system: a REST API, an admin panel (/admin), a parent/teacher portal (/portal) and a public landing page (/). Covered areas: academics, attendance, exams, fees and finance, front office, HR and payroll, communication, library, inventory, transport, hostel, and portals for parents, students and teachers.

**Stack:** Laravel 12 · PHP 8.2+ · MySQL 8 / MariaDB 10.4+ · Sanctum token auth · DomPDF (PDF vouchers, receipts, report cards, salary slips) · CSV/Excel export

---

## 1. Module coverage

| Area | Module | What's included |
|---|---|---|
| **Academics** | Student Information | Profiles with photo and login, auto admission no, **online admission** (public form → approve → student created), **history tracking**, **bulk import (CSV)**, bulk update, promotion and graduation |
| | Academics & Timetable | Sessions, classes, sections, subjects, teacher assignments, class timetable (prevents double booking) |
| | Examinations | Exams, **exam schedule (date sheet)**, marks entry, custom grade scheme, pass %, tabulation sheet with positions, report card PDF, **subject-wise class performance**, **year-over-year student progress** |
| | Attendance | Daily student attendance, SMS/WhatsApp alerts to parents, monthly register, staff attendance |
| | Homework | Assign with attachments, **online submission by student/parent**, late detection, **teacher evaluation** (marks + feedback), submission tracking |
| | Download Center | Assignments, syllabus, study material and circulars, by class, section and subject |
| **Finance** | Fees Collection | Fee types, structure per class, bulk monthly invoices (incl. transport and hostel fees, discounts), partial payments, **PDF receipts**, PDF vouchers (3 copies), late fines, defaulters, **one-click SMS/WhatsApp reminders**, student ledger, collection report, **month-end reconciliation**, **online payment** (parent submits transaction ID + screenshot → accountant approves) |
| | Income | Non-fee income: book and uniform sales, donations, events, canteen … |
| | Expenses | Categorised expenses; payroll tracked separately |
| | Financial Reports | Income vs expense (P&L) with monthly breakdown, dashboard charts |
| **Administration** | Front Office | Admission enquiries with follow-ups, visitor log, phone call log, postal receive/dispatch, complaints |
| | Human Resources | Teaching and non-teaching staff, staff attendance, payroll with absence deductions, salary slip PDF, **leave management** (types, balances, approval → attendance auto-marked) |
| | Communication | Notices (by audience/section), **two-way messaging** (parents ↔ teachers ↔ admin), bulk SMS & **WhatsApp**, Urdu (unicode) SMS |
| | System Settings | Sessions, user accounts & roles, SMS/WhatsApp gateways, **payment methods**, school branding (name, logo, address) |
| **Campus** | Library | Catalogue, issue/return, overdue tracking, automatic fines, lost books |
| | Inventory & Assets | Items, suppliers, stock in/out/adjustment, low-stock alerts, stock value, fixed asset register |
| | Transport | Vehicles (driver, insurance), routes with fare, student allocation (fare added to fee invoices) |
| | Hostel | Hostels, rooms & capacity, allocation/vacate, occupancy report, hostel fee added to invoices |
| **Portals** | Parent / Student | Children, attendance, fee ledger, vouchers, **online payment**, published results & progress, exam schedule, timetable, homework + **submission**, downloads, messages, leave requests |
| | Teacher | Own classes/subjects, timetable, attendance, marks, homework & evaluation, download center, messages, leave |
| **Platform** | Export | `?export=csv` on every list and on the main reports (opens in Excel; UTF-8 so Urdu works) |

**Included front-end:** Parent/Student and Teacher portals at **`/portal`** (see section 2a).
**Not included yet:** the admin web panel, the Android/iOS app and Urdu interface labels. These are built separately on top of this API.

---

## 2. Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
# create the database, then set DB_DATABASE / DB_USERNAME / DB_PASSWORD in .env
#   CREATE DATABASE school_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
php artisan migrate --seed                  # tables + admin, classes, subjects, grades, fee types, leave types
php artisan db:seed --class=DemoSeeder      # optional sample data
php artisan storage:link                    # serve uploaded photos/files
php artisan serve                           # http://localhost:8000
```

**Default login:** `admin@school.com` / `password`. Change it after the first login.

The demo data adds these logins (all with password `password`): `accountant@`, `librarian@`, `reception@`, `teacher1@` … `teacher8@`, and `parent@school.com`.

**Scheduled jobs.** Add this cron entry:

```
* * * * * cd /path && php artisan schedule:run
```

It runs `fees:generate` on the 1st of each month at 06:00, and `fees:apply-late-fines` daily at 01:00.

---

## 2a. Parent / Student / Teacher portal

After `php artisan serve`, open **http://localhost:8000/portal** (or just http://localhost:8000).

- **Nothing to build or install.** It is plain HTML, CSS and JavaScript in `public/portal/` and uses the API on the same server.
- **One login page.** Parents and students go to the parent portal; teachers go to the teacher portal. Admin and other staff accounts are refused, because those use the admin panel.
- **Mobile-friendly.** It uses no external libraries or CDNs, so it also works on a school network without internet.

| Parent / student portal | Teacher portal |
|---|---|
| Home: child card, attendance %, fee balance, pending homework, upcoming exams, today's classes, notices | Dashboard: today's schedule, my classes, quick links |
| Child switcher for parents with several children | Attendance: tap P / A / L / LV per student, mark all present, SMS absentees, monthly register + Excel export |
| Attendance calendar by month, absences list, apply for leave | Marks entry per exam / section / subject, with validation and absent flags |
| Fees: invoices, voucher PDF, receipts PDF, statement, **pay online** (transaction ID + screenshot) | Results tabulation with positions, report card PDFs, Excel export |
| Results: report cards (+PDF), progress chart across exams | Homework: assign with attachment, see who submitted, check & give marks/feedback |
| Exam date sheet, weekly timetable, homework with **online submission**, downloads | Download center: upload notes, syllabus, assignments, links |
| Notices, messages with teachers, leave requests, account & password | Timetable, leave, notices, messages, account |

**Public online admission form:** http://localhost:8000/portal#/apply (linked from the login page).

**Demo logins** (after `php artisan db:seed --class=DemoSeeder`): `parent@school.com` and `teacher1@school.com`, password `password`.

To give a real parent a login, open the guardian record (`PUT /api/guardians/{id}`) and set `create_login=1`, `login_email` and `password`. Teachers and students work the same way.

---

## 3. Roles

| Role | Access |
|---|---|
| admin | Everything |
| accountant | Dashboard, fees, online payment approval, payroll, expenses, income, inventory & assets, reports |
| teacher | Attendance, marks, results & analytics, homework & evaluation, download center, own classes/timetable, read-only master data |
| receptionist | Front office: enquiries, visitors, calls, postal, complaints |
| librarian | Books, issue/return |
| parent / student | Portal (own children / self only) |
| all logged-in users | Messages, notices, leave requests, profile |

Admin is the only role that approves leave requests and online admissions.

Staff profiles (teaching and non-teaching) live in `/teachers` with `staff_type`. When you create a profile with `create_login=1`, you can also set `login_role`: teacher, accountant, librarian or receptionist.

---

## 4. Using the API

- Base URL: `/api`. Log in with `POST /api/login` and send `Authorization: Bearer <token>` on every other request.
- Responses are JSON. Validation errors return 422 with an `errors` object.
- File uploads use `multipart/form-data`. To update a record with a file, send `POST` to the record URL (or add `_method=PUT`).
- Lists accept these query parameters: `search`, any filter field, `from`/`to` date range, `sort`/`direction`, `per_page`, `all=1`, and `export=csv`.
- **Postman:** import `docs/postman_collection.json` (284 requests). Run *Login* first; it saves the token automatically.

---

## 5. Endpoint reference

### Public (no login)
| Method | Endpoint |
|---|---|
| GET | `/public/admission-form`: open/closed flag, school info, class list |
| POST | `/public/admission-applications`: student + guardian details, photo. Returns an application no. |
| GET | `/public/admission-applications/status?application_no=&guardian_phone=` |

### Account (any role)
`POST /login`, `GET /me`, `POST /logout`, `POST /logout-all`, `POST /profile`, `POST /change-password`, `GET /notices/feed`, `GET /settings`, `GET /payment-methods/active`

**Messages**
- `GET /messages?box=inbox|sent&unread=1`
- `GET /messages/contacts`: who you are allowed to message
- `GET /messages/unread-count`
- `GET /messages/{id}`: the full thread; marks it read
- `POST /messages`: `{receiver_id, subject, body}`. To reply, send `{parent_id, body}`.

**Leave**
- `GET /leave-types`
- `GET /leave-requests`
- `POST /leave-requests`: `{leave_type_id, from_date, to_date, reason, student_id?}`
- `POST /leave-requests/{id}/cancel`

### Master data (CRUD: list, create, show, update, delete)
| Resource | Notes |
|---|---|
| `/users` | name, email, password, role, is_active |
| `/academic-sessions`, `/classes`, `/sections`, `/subjects`, `/class-subjects` | |
| `/teachers` | Staff. Includes staff_type, department, designation, salary, and login fields. |
| `/guardians`, `/students` | Login fields optional; photo upload |
| `/timetables`, `/exams`, `/exam-schedules`, `/grades` | |
| `/transport-routes`, `/vehicles` | |
| `/hostels`, `/hostel-rooms` | |
| `/notices`, `/leave-types`, `/payment-methods` | |
| `/homework`, `/study-materials` | teacher |
| `/fee-types`, `/fee-structures`, `/expenses`, `/incomes` | accountant |
| `/suppliers`, `/inventory-items`, `/assets` | accountant |
| `/admission-enquiries`, `/visitors`, `/phone-calls`, `/postal-records`, `/complaints` | receptionist |
| `/books` | librarian |

### Students
| Method | Endpoint |
|---|---|
| GET | `/students/{id}`: profile with attendance and fee summary |
| GET | `/students/{id}/history`: admissions, transfers, promotions, status changes |
| POST | `/students/promote`: `student_ids[]` or `from_section_id`, plus `to_class_id`, `to_section_id`, `to_session_id`. Or send `mark_graduated=1`. |
| PATCH | `/students/bulk`: `student_ids[]` with section, status, transport route or discount |
| GET | `/students/import-template` |
| POST | `/students/import`: CSV file. Use `dry_run=1` to validate without saving. |
| GET | `/admission-applications` |
| POST | `/admission-applications/{id}/approve`: `{section_id, charge_admission_fee?, create_parent_login?, parent_email?, parent_password?}` |
| POST | `/admission-applications/{id}/reject` |

### Attendance & leave
| Method | Endpoint |
|---|---|
| GET/POST | `/attendance`: sheet / save a whole section (`notify_absent`, `channel`) |
| GET | `/attendance/report?section_id=&month=`: monthly register (supports `export=csv`) |
| GET | `/attendance/students/{id}` |
| GET | `/reports/attendance-summary?date=` |
| GET/POST | `/staff-attendance` |
| GET | `/staff-attendance/report` |
| POST | `/leave-requests/{id}/approve`, `/reject`. Approval marks attendance as "leave". |

### Exams & results
| Method | Endpoint |
|---|---|
| GET/POST | `/marks/sheet`, `/marks` |
| GET | `/results/section?exam_id=&section_id=`: tabulation with positions (supports `export=csv`) |
| GET | `/results/report-card?exam_id=&student_id=&pdf=1` |
| GET | `/results/subject-performance?exam_id=&school_class_id=`: average, highest, lowest and pass % per subject |
| GET | `/results/student-progress?student_id=`: every exam, session averages and trend |

### Homework
| Method | Endpoint |
|---|---|
| GET | `/homework/{id}/submissions`: every student with submitted / late / pending / evaluated status |
| POST | `/homework-submissions/{id}/evaluate`: `{marks, feedback}` |
| POST | `/portal/students/{student}/homework/{homework}/submit`: `{content, attachment}` |

### Fees & finance
| Method | Endpoint |
|---|---|
| POST | `/fee-invoices/generate`: `month, school_class_id?, section_id?, fee_type_ids?, include_transport?, include_hostel?` |
| GET/POST | `/fee-invoices` (supports `export=csv`) |
| GET/PUT | `/fee-invoices/{id}` |
| POST | `/fee-invoices/{id}/payments`, `/fee-invoices/{id}/cancel` |
| GET | `/fee-invoices/{id}/voucher`: PDF |
| GET | `/fee-payments/{id}/receipt`: PDF |
| DELETE | `/fee-payments/{id}` (admin) |
| POST | `/fee-invoices/apply-late-fines` |
| GET | `/fees/defaulters` (supports `export=csv`) |
| POST | `/fees/send-reminders`: `channel: sms|whatsapp|both` |
| GET | `/fees/students/{id}/ledger` |
| GET | `/fees/collection-report` (supports `export=csv`) |
| GET | `/fees/reconciliation?month=`: billed vs collected, arrears recovered, advance, by method/day |
| GET | `/payment-submissions?status=pending` |
| POST | `/payment-submissions/{id}/approve`, `/reject` |
| GET | `/payroll`, `POST /payroll/generate`, `PUT /payroll/{id}`, `POST /payroll/{id}/pay`, `GET /payroll/{id}/slip` |
| GET | `/reports/income-expense?from=&to=` |
| GET | `/dashboard` |

### Inventory, hostel, library
| Method | Endpoint |
|---|---|
| GET/POST | `/stock-movements`: `type: in|out|adjustment` |
| GET | `/inventory/report`: stock value, low stock, assets |
| GET | `/hostels-occupancy` |
| GET/POST | `/hostel-allocations` |
| POST | `/hostel-allocations/{id}/vacate` |
| GET/POST | `/book-issues` |
| POST | `/book-issues/{id}/return` |

### Admin tools
`POST /sms/send` (`audience`, `message`, `channel`), `GET /sms/logs`, `GET /reports/student-strength`, `PUT /settings`

### Parent / student portal (`/portal/...`)
- `GET /portal/children`
- Under `/portal/students/{id}/`: `attendance`, `fees`, `invoices/{inv}/voucher`, `invoices/{inv}/pay-online` (POST), `exams`, `results/{exam}?pdf=1`, `progress`, `exam-schedule`, `timetable`, `homework`, `homework/{hw}/submit` (POST), `downloads`

### Teacher self-service
`GET /teacher/classes` and `GET /teacher/timetable`.

---

## 6. SMS & WhatsApp
`settings.notification_channel` sets the default channel: `sms`, `whatsapp` or `both`. Most send actions also accept a `channel` parameter to override it. Every message is stored in `sms_logs`.

- **SMS:** `SMS_DRIVER=http` plus `SMS_API_URL`, `SMS_API_KEY` and `SMS_SENDER_ID`. Adapt `sendSms()` in `app/Services/SmsService.php` to your provider's field names. Urdu messages are flagged as unicode.
- **WhatsApp:** `WHATSAPP_DRIVER=cloud` plus `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` (Meta WhatsApp Cloud API). Meta only allows free-form text within 24 hours of the parent's last message. To send outside that window, set `WHATSAPP_TEMPLATE` to an approved template with one body variable.
- With the `log` drivers (the default), nothing is sent. Messages are only stored, so you can test safely.

## 7. Online fee payment
Parents pay into an account listed under **Payment Methods** (bank, JazzCash or EasyPaisa). They then submit the transaction ID and a screenshot from the portal. The accountant approves the submission, which posts the payment, issues a receipt and notifies the parent.

A direct card or wallet checkout (JazzCash/EasyPaisa merchant API, Stripe …) can be added later. It plugs into `PaymentSubmissionController::approve()` and needs merchant credentials from the provider.

---

## 8. Project structure
```
app/Http/Controllers/Api/   CrudController (generic CRUD + CSV export) and one controller per module
app/Http/Middleware/        RoleMiddleware, ForceJsonResponse
app/Models/                 53 Eloquent models
app/Services/               FeeService, ResultService, SmsService (SMS + WhatsApp)
app/Support/CsvExport.php   Excel-friendly CSV export
database/migrations/        All tables
database/seeders/           DatabaseSeeder (base), DemoSeeder (sample data)
resources/views/pdf/        voucher, receipt, report-card, salary-slip
routes/api.php              All endpoints grouped by role
docs/postman_collection.json
```
