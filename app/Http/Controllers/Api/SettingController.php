<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all_values();
        $settings['school_logo_url'] = $settings['school_logo'] ? Storage::disk('public')->url($settings['school_logo']) : null;

        return response()->json(['data' => $settings]);
    }

    /** Send any of the keys in Setting::DEFAULTS; "school_logo" may be an uploaded image. */
    public function update(Request $request): JsonResponse
    {
        $rules = collect(Setting::DEFAULTS)->except('school_logo')->map(fn () => 'nullable|string|max:1000')->all();
        $rules['school_logo'] = 'nullable|image|max:2048';
        foreach (['invoice_due_day', 'late_fee_amount', 'pass_percentage', 'library_fine_per_day', 'library_issue_days'] as $numeric) {
            $rules[$numeric] = 'nullable|numeric|min:0';
        }
        $rules['notification_channel'] = 'nullable|in:sms,whatsapp,both';
        foreach (['sms_on_absence', 'sms_on_payment', 'online_admission_open'] as $bool) {
            $rules[$bool] = 'nullable|boolean';
        }

        $data = $request->validate($rules);

        if ($request->hasFile('school_logo')) {
            if ($old = Setting::get('school_logo')) {
                Storage::disk('public')->delete($old);
            }
            $data['school_logo'] = $request->file('school_logo')->store('settings', 'public');
        }

        foreach ($data as $key => $value) {
            Setting::put($key, $value ?? '');
        }

        return $this->index();
    }
}
