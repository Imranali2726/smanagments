<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

/**
 * Content of the main AAS School Manager landing page (aasschoolmanager.com),
 * edited by the super admin. Texts not changed here keep the wording in public/landing.html.
 */
class LandingController extends Controller
{
    /** Sections that can be shown or hidden (the top banner is always shown). */
    public const SECTIONS = ['video', 'why', 'new', 'modules', 'features', 'portals', 'steps', 'pricing', 'faq', 'contact'];

    public static function defaults(): array
    {
        return [
            'sections' => array_merge(array_fill_keys(self::SECTIONS, true), ['pricing' => false]),
            'text' => (object) [],
            'contact' => [
                'phone' => '+92 300 9712726',
                'whatsapp' => '923009712726',
                'whatsapp2' => '923037616030',
                'email' => 'info@aasschoolmanager.com',
                'address' => 'Lahore, Pakistan',
            ],
            'plans' => [
                ['name' => 'Starter', 'students' => 'Up to 150 students', 'price' => 30, 'popular' => false, 'items' => ['All 22 modules', 'Parent & teacher portal', 'Your own school website', 'Email & WhatsApp support', 'Online training']],
                ['name' => 'Growth', 'students' => '151 to 400 students', 'price' => 25, 'popular' => true, 'items' => ['Everything in Starter', 'SMS & WhatsApp alerts setup', 'Data import by our team', 'Priority support']],
                ['name' => 'Campus', 'students' => 'More than 400 students', 'price' => 20, 'popular' => false, 'items' => ['Everything in Growth', 'Multi-campus owner view', 'On-site training if needed', 'Custom report formats', 'Dedicated support person']],
            ],
            'pricing_notes' => [
                '**Launch offer:** the first 10 schools get 50% off for their first 3 months.',
                '**Pay yearly, get 2 months free.**',
                'Minimum bill Rs 2,500 per month. SMS and WhatsApp message charges are paid to your own SMS / WhatsApp provider.',
            ],
            'faqs' => null, // null = keep the questions written in landing.html
        ];
    }

    public static function content(): array
    {
        $saved = Schema::hasTable('platform_settings') ? (PlatformSetting::getJson('landing', []) ?: []) : [];
        $c = self::defaults();
        $c['sections'] = array_merge($c['sections'], array_intersect_key($saved['sections'] ?? [], $c['sections']));
        foreach (['text', 'contact', 'plans', 'pricing_notes', 'faqs'] as $k) {
            if (array_key_exists($k, $saved)) {
                $c[$k] = $k === 'contact' ? array_merge($c['contact'], $saved['contact'] ?? []) : $saved[$k];
            }
        }
        $c['text'] = (object) (array) $c['text'];

        return $c;
    }

    /** The landing page with its content injected, so hidden sections never flash on screen. */
    public static function page()
    {
        $html = file_get_contents(public_path('landing.html'));
        $c = self::content();
        $json = json_encode($c, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE);
        $hidden = array_keys(array_filter($c['sections'], fn ($on) => ! $on));
        $css = $hidden ? implode(',', array_map(fn ($s) => "[data-sec=\"{$s}\"]", $hidden)).'{display:none!important}' : '';
        $inject = "<style id=\"landingHide\">{$css}</style>\n<script>window.LANDING = {$json};</script>\n</head>";
        $html = preg_replace('~</head>~i', $inject, $html, 1);

        return response($html)->header('Content-Type', 'text/html; charset=UTF-8')->header('Cache-Control', 'no-cache');
    }

    public function show(): JsonResponse
    {
        return response()->json(['data' => self::content(), 'defaults' => self::defaults(), 'sections' => self::SECTIONS]);
    }

    public function publicContent(): JsonResponse
    {
        return response()->json(self::content());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sections' => 'required|array',
            'sections.*' => 'boolean',
            'text' => 'nullable|array|max:400',
            'text.*.from' => 'required|string|max:2000',
            'text.*.to' => 'present|nullable|string|max:2000',
            'contact.phone' => 'nullable|string|max:40',
            'contact.whatsapp' => ['nullable', 'regex:/^\d{10,15}$/'],
            'contact.whatsapp2' => ['nullable', 'regex:/^\d{10,15}$/'],
            'contact.email' => 'nullable|email|max:120',
            'contact.address' => 'nullable|string|max:200',
            'plans' => 'nullable|array|max:6',
            'plans.*.name' => 'required|string|max:40',
            'plans.*.students' => 'nullable|string|max:60',
            'plans.*.price' => 'required|numeric|min:0|max:100000',
            'plans.*.popular' => 'boolean',
            'plans.*.items' => 'nullable|array|max:12',
            'plans.*.items.*' => 'nullable|string|max:120',
            'pricing_notes' => 'nullable|array|max:6',
            'pricing_notes.*' => 'nullable|string|max:300',
            'faqs' => 'nullable|array|max:30',
            'faqs.*.q' => 'required|string|max:200',
            'faqs.*.a' => 'required|string|max:1500',
        ], [
            'contact.whatsapp.regex' => 'WhatsApp number: digits only with country code, e.g. 923001234567.',
            'contact.whatsapp2.regex' => 'Second WhatsApp number: digits only with country code, e.g. 923001234567.',
        ]);

        $clean = fn ($list) => array_values(array_filter(array_map(fn ($s) => trim((string) $s), $list ?? []), fn ($s) => $s !== ''));
        $save = [
            'sections' => array_intersect_key(array_map('boolval', $data['sections']), array_flip(self::SECTIONS)),
            'text' => (object) collect($data['text'] ?? [])
                ->filter(fn ($v, $k) => preg_match('/^[a-z0-9_]+\.\d+$/', (string) $k))
                ->map(fn ($v) => ['from' => $v['from'], 'to' => trim((string) ($v['to'] ?? ''))])
                ->all(),
            'contact' => array_map(fn ($v) => trim((string) $v), $data['contact'] ?? []),
            'plans' => array_map(fn ($p) => [
                'name' => $p['name'], 'students' => $p['students'] ?? '', 'price' => $p['price'] + 0,
                'popular' => (bool) ($p['popular'] ?? false), 'items' => $clean($p['items'] ?? []),
            ], $data['plans'] ?? []),
            'pricing_notes' => $clean($data['pricing_notes'] ?? []),
            'faqs' => array_key_exists('faqs', $data) && $data['faqs'] !== null
                ? array_map(fn ($f) => ['q' => trim($f['q']), 'a' => trim($f['a'])], $data['faqs']) : null,
        ];
        PlatformSetting::putJson('landing', $save);

        return response()->json(['message' => 'Landing page saved.', 'data' => self::content()]);
    }
}
