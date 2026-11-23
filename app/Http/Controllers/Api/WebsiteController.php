<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Notice;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

/**
 * Each school's public website (landing page) on its own sub-domain, e.g. arham.aasschoolmanager.com.
 * All content is kept in the school's "website" setting (JSON) and edited from the admin panel.
 */
class WebsiteController extends Controller
{
    public const SECTIONS = ['about', 'principal', 'stats', 'programs', 'facilities', 'gallery', 'notices', 'events', 'testimonials', 'admission', 'contact'];

    /** Default content for a school that has not edited its website yet. */
    public static function defaults(): array
    {
        $name = Setting::get('school_name') ?: (Tenant::school()?->name ?? 'Our School');

        return [
            'published' => true,
            'theme' => ['primary' => '#1d4ed8', 'accent' => '#f59e0b'],
            'hero' => [
                'title' => "Welcome to {$name}",
                'subtitle' => 'Quality education in a caring, safe and modern environment — where every child is known, valued and inspired to do their best.',
                'image' => '',
                'button' => 'Apply for admission',
            ],
            'about' => [
                'title' => 'About our school',
                'text' => "{$name} provides a strong academic foundation together with character building, sports and co-curricular activities. Our qualified teachers give personal attention to every student, and parents stay connected through our online parent portal.",
                'image' => '',
            ],
            'principal' => [
                'name' => '', 'designation' => 'Principal', 'photo' => '',
                'message' => 'Our aim is to nurture confident, responsible and caring young people. We work closely with parents so that every child can discover their strengths and reach their full potential.',
            ],
            'stats' => [
                ['value' => 'auto:students', 'label' => 'Students'],
                ['value' => 'auto:teachers', 'label' => 'Qualified teachers'],
                ['value' => 'auto:classes', 'label' => 'Classes'],
                ['value' => '100%', 'label' => 'Parent portal access'],
            ],
            'programs' => [
                ['title' => 'Pre-school', 'text' => 'Play Group, Nursery and Prep with activity-based learning.'],
                ['title' => 'Primary', 'text' => 'Class 1 to 5 with a strong focus on English, Urdu, Maths and Science.'],
                ['title' => 'Middle & Secondary', 'text' => 'Class 6 to 10 preparing students for board examinations.'],
            ],
            'facilities' => [
                ['icon' => '🔬', 'title' => 'Science & computer labs', 'text' => 'Hands-on practicals with modern equipment.'],
                ['icon' => '📚', 'title' => 'Library', 'text' => 'Hundreds of books to build a reading habit.'],
                ['icon' => '⚽', 'title' => 'Sports & activities', 'text' => 'Sports day, debates, art and annual functions.'],
                ['icon' => '🚌', 'title' => 'Safe transport', 'text' => 'Pick and drop service on major routes.'],
                ['icon' => '📹', 'title' => 'Secure campus', 'text' => 'CCTV, guards and a caring staff.'],
                ['icon' => '📱', 'title' => 'Parent app', 'text' => 'Attendance, results and fees on your phone.'],
            ],
            'gallery' => [],
            'testimonials' => [],
            'contact' => [
                'address' => Setting::get('school_address') ?: (Tenant::school()?->address ?? ''),
                'phone' => Setting::get('school_phone') ?: (Tenant::school()?->phone ?? ''),
                'whatsapp' => '',
                'email' => Setting::get('school_email') ?: (Tenant::school()?->email ?? ''),
                'timings' => 'Mon – Fri: 8:00 AM – 2:00 PM · Sat: 8:00 AM – 12:00 PM',
                'map' => '',
            ],
            'social' => ['facebook' => '', 'instagram' => '', 'youtube' => ''],
            'sections' => array_fill_keys(self::SECTIONS, true),
        ];
    }

    /** Saved content merged over the defaults (so new fields always exist). */
    public static function content(): array
    {
        $saved = json_decode((string) Setting::get('website', ''), true);
        $data = is_array($saved) ? array_replace_recursive(self::defaults(), $saved) : self::defaults();
        // Lists are replaced as a whole, not merged item by item.
        foreach (['stats', 'programs', 'facilities', 'gallery', 'testimonials'] as $list) {
            if (is_array($saved) && array_key_exists($list, $saved)) {
                $data[$list] = array_values((array) $saved[$list]);
            }
        }

        return $data;
    }

    /** GET /website (admin) */
    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->withUrls(self::content()), 'site_url' => $this->siteUrl()]);
    }

    /** PUT /website (admin) */
    public function update(Request $request): JsonResponse
    {
        $str = 'nullable|string|max:255';
        $text = 'nullable|string|max:5000';
        $data = $request->validate([
            'published' => 'boolean',
            'theme.primary' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.accent' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'hero.title' => $str, 'hero.subtitle' => 'nullable|string|max:600', 'hero.image' => $str, 'hero.button' => 'nullable|string|max:60',
            'about.title' => $str, 'about.text' => $text, 'about.image' => $str,
            'principal.name' => $str, 'principal.designation' => $str, 'principal.photo' => $str, 'principal.message' => $text,
            'stats' => 'nullable|array|max:6', 'stats.*.value' => 'nullable|string|max:40', 'stats.*.label' => 'nullable|string|max:60',
            'programs' => 'nullable|array|max:12', 'programs.*.title' => $str, 'programs.*.text' => 'nullable|string|max:600',
            'facilities' => 'nullable|array|max:12', 'facilities.*.icon' => 'nullable|string|max:16', 'facilities.*.title' => $str, 'facilities.*.text' => 'nullable|string|max:600',
            'gallery' => 'nullable|array|max:24', 'gallery.*.image' => $str, 'gallery.*.caption' => 'nullable|string|max:120',
            'testimonials' => 'nullable|array|max:9', 'testimonials.*.name' => $str, 'testimonials.*.role' => $str, 'testimonials.*.text' => 'nullable|string|max:800',
            'contact.address' => 'nullable|string|max:500', 'contact.phone' => 'nullable|string|max:40', 'contact.whatsapp' => 'nullable|string|max:40',
            'contact.email' => 'nullable|email|max:255', 'contact.timings' => $str, 'contact.map' => 'nullable|string|max:1500',
            'social.facebook' => 'nullable|url|max:255', 'social.instagram' => 'nullable|url|max:255', 'social.youtube' => 'nullable|url|max:255',
            'sections' => 'nullable|array', 'sections.*' => 'boolean',
        ]);

        // Keep only image paths that belong to this school's uploads.
        $own = fn ($p) => is_string($p) && str_starts_with($p, $this->dir().'/') ? $p : '';
        foreach (['hero.image', 'about.image', 'principal.photo'] as $key) {
            if (Arr::has($data, $key)) {
                Arr::set($data, $key, $own(Arr::get($data, $key)));
            }
        }
        if (isset($data['gallery'])) {
            $data['gallery'] = array_values(array_filter(array_map(fn ($g) => ['image' => $own($g['image'] ?? ''), 'caption' => $g['caption'] ?? ''], $data['gallery']), fn ($g) => $g['image']));
        }
        foreach (['stats' => 'label', 'programs' => 'title', 'facilities' => 'title', 'testimonials' => 'text'] as $list => $needed) {
            if (isset($data[$list])) {
                $data[$list] = array_values(array_filter($data[$list], fn ($row) => trim((string) ($row[$needed] ?? '')) !== ''));
            }
        }
        if (isset($data['sections'])) {
            $data['sections'] = array_intersect_key($data['sections'], array_flip(self::SECTIONS));
        }

        $merged = array_replace_recursive(json_decode((string) Setting::get('website', ''), true) ?: [], $data);
        foreach (['stats', 'programs', 'facilities', 'gallery', 'testimonials'] as $list) {
            if (array_key_exists($list, $data)) {
                $merged[$list] = $data[$list] ?? [];
            }
        }
        Setting::put('website', json_encode($merged, JSON_UNESCAPED_UNICODE));

        return response()->json(['message' => 'Website saved.', 'data' => $this->withUrls(self::content())]);
    }

    /** POST /website/image (admin) — multipart "image"; returns its stored path. */
    public function upload(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096']);
        $path = $request->file('image')->store($this->dir(), 'public');

        return response()->json(['path' => $path, 'url' => Storage::disk('public')->url($path)]);
    }

    /**
     * GET /public/site — public content of the school on this sub-domain.
     * On the main domain (local testing) pass ?school=<subdomain>.
     */
    public function site(Request $request): JsonResponse
    {
        if (! Tenant::school() && $request->filled('school')) {
            Tenant::set(School::where('subdomain', strtolower((string) $request->query('school')))->first());
        }
        $school = Tenant::school();
        if (! $school) {
            return response()->json(['message' => 'No school is registered at this address.'], 404);
        }
        if ($school->status !== 'active' || $school->isExpired() || ! $school->moduleEnabled('website')) {
            return response()->json(['message' => 'This school\'s website is not available right now.'], 404);
        }

        $w = self::content();
        if (! ($w['published'] ?? true)) {
            return response()->json(['message' => 'This website is coming soon.', 'code' => 'unpublished', 'school' => ['name' => Setting::get('school_name') ?: $school->name]], 404);
        }

        $live = [
            'students' => Student::where('status', 'active')->count(),
            'teachers' => Teacher::count(),
            'classes' => SchoolClass::count(),
        ];
        foreach ($w['stats'] as &$stat) {
            if (is_string($stat['value'] ?? null) && str_starts_with($stat['value'], 'auto:')) {
                $stat['value'] = number_format($live[substr($stat['value'], 5)] ?? 0);
            }
        }
        unset($stat);

        $public = ['all', 'parents', 'students'];
        $notices = ($w['sections']['notices'] ?? true) ? Notice::where('is_published', true)->whereIn('audience', $public)->whereNull('section_id')
            ->where(fn ($q) => $q->whereNull('publish_date')->orWhereDate('publish_date', '<=', today()))
            ->where(fn ($q) => $q->whereNull('expiry_date')->orWhereDate('expiry_date', '>=', today()))
            ->orderByDesc('publish_date')->orderByDesc('id')->limit(5)->get(['id', 'title', 'body', 'publish_date']) : [];
        $events = ($w['sections']['events'] ?? true) && $school->moduleEnabled('events') ? Event::whereIn('audience', $public)
            ->where(fn ($q) => $q->whereDate('start_date', '>=', today())->orWhereDate('end_date', '>=', today()))
            ->orderBy('start_date')->limit(6)->get(['id', 'title', 'type', 'start_date', 'end_date', 'start_time', 'location']) : [];

        $logo = Setting::get('school_logo');

        return response()->json([
            'school' => [
                'name' => Setting::get('school_name') ?: $school->name,
                'campus_name' => $school->campus_name,
                'city' => $school->city,
                'subdomain' => $school->subdomain,
                'logo_url' => $logo ? Storage::disk('public')->url($logo) : null,
            ],
            'website' => $this->withUrls($w),
            'notices' => $notices,
            'events' => $events,
            'admission_open' => $school->moduleEnabled('online_admission') && Setting::get('online_admission_open', '1') === '1',
        ]);
    }

    private function dir(): string
    {
        return 'websites/'.Tenant::id();
    }

    private function siteUrl(): string
    {
        $school = Tenant::school();
        $domain = config('app.domain');
        if (! $school) {
            return url('/');
        }
        $scheme = request()->getScheme();
        $port = in_array(request()->getPort(), [80, 443], true) ? '' : ':'.request()->getPort();

        return $domain && $domain !== 'localhost' ? "{$scheme}://{$school->subdomain}.{$domain}{$port}/" : url('site').'?school='.$school->subdomain;
    }

    /** Adds *_url next to every stored image path. */
    private function withUrls(array $w): array
    {
        $u = fn ($p) => $p ? Storage::disk('public')->url($p) : null;
        $w['hero']['image_url'] = $u($w['hero']['image'] ?? '');
        $w['about']['image_url'] = $u($w['about']['image'] ?? '');
        $w['principal']['photo_url'] = $u($w['principal']['photo'] ?? '');
        $w['gallery'] = array_map(fn ($g) => $g + ['url' => $u($g['image'] ?? '')], $w['gallery'] ?? []);

        return $w;
    }
}
