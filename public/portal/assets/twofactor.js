/* ===========================================================
   Two-factor login (authenticator app) — shared by the admin
   panel and the parent / teacher portal.
   Uses the helpers both apps define: API, $, $$, esc, icon,
   toast, busy, showErrors, formValues, confirmBox.
   =========================================================== */
const TwoFA = {
    /**
     * Second login step. Replaces the login form with a code form.
     * onDone(res) receives the normal login response (token, user…).
     */
    challenge(form, res, device, onDone) {
        const card = form.closest('.auth-card') || form.parentElement;
        const keep = card.innerHTML;
        let useRecovery = false;
        const draw = () => {
            card.innerHTML = `
                <div class="tfa-head"><div class="tfa-ico">${icon('lock')}</div>
                <h2>${useRecovery ? 'Use a recovery code' : 'Enter your code'}</h2>
                <p class="sub">${useRecovery ? 'Type one of the recovery codes you saved when you turned on two-factor login. Each code works once.' : 'Open your authenticator app (Google Authenticator, Microsoft Authenticator…) and enter the 6-digit code for AAS School Manager.'}</p></div>
                <form class="form" id="tfaForm" novalidate>
                    ${useRecovery
                        ? `<label class="field"><span>Recovery code</span><input name="recovery_code" autocomplete="off" placeholder="XXXX-XXXX" required style="letter-spacing:.12em;text-transform:uppercase"></label>`
                        : `<label class="field"><span>6-digit code</span><input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="7" pattern="[0-9 ]*" placeholder="123 456" required class="tfa-code"></label>`}
                    <button class="btn block" type="submit" data-busy="Checking…">Verify & sign in</button>
                </form>
                <div class="auth-footer">
                    <a href="javascript:void 0" id="tfaSwitch">${useRecovery ? 'Use the code from my app instead' : 'Lost your phone? Use a recovery code'}</a><br>
                    <a href="javascript:void 0" id="tfaBack">← Back to sign in</a>
                </div>`;
            const f = $('#tfaForm', card);
            const input = $('input', f);
            input.focus();
            if (!useRecovery) input.oninput = () => { const d = input.value.replace(/\D/g, ''); if (d.length === 6) f.requestSubmit(); };
            f.onsubmit = async (e) => {
                e.preventDefault();
                const v = formValues(f);
                await busy($('button[type=submit]', f), async () => {
                    try {
                        const r = await API.post('/login/two-factor', { challenge: res.challenge, ...v });
                        if (r.recovery_codes_left !== undefined) setTimeout(() => toast(`Recovery code used. ${r.recovery_codes_left} left — create new ones from your security settings.`, r.recovery_codes_left < 3 ? 'error' : 'success'), 600);
                        onDone(r);
                    } catch (err) {
                        if (/expired|sign in again/i.test(err.message)) { toast(err.message, 'error'); back(); return; }
                        showErrors(f, err); input.select();
                    }
                });
            };
            $('#tfaSwitch', card).onclick = () => { useRecovery = !useRecovery; draw(); };
            $('#tfaBack', card).onclick = back;
        };
        const back = () => { location.reload(); };
        draw();
    },

    /** Security card for "My account": status, setup, recovery codes, turn off. */
    async card(box) {
        box.innerHTML = `<div class="card-head"><h2>${icon('lock')} Two-factor login</h2></div><div class="card-body" id="tfaBody">${typeof loadingHtml === 'function' ? loadingHtml() : 'Loading…'}</div>`;
        const body = $('#tfaBody', box);
        const st = await API.get('/two-factor');
        const pwField = `<label class="field"><span>Your password</span><input name="password" type="password" autocomplete="current-password" required></label>`;

        if (!st.enabled) {
            body.innerHTML = `<p>Protect your account with a second step: after your password, you also enter a 6-digit code from an authenticator app on your phone. Even if someone learns your password, they cannot sign in without your phone.</p>
                <div class="tfa-badge off">${icon('alert')} Off</div>
                <form class="form mt" id="tfaOn">${pwField}<div><button class="btn" type="submit" data-busy="Starting…">${icon('lock')} Turn on two-factor login</button></div></form>`;
            const f = $('#tfaOn', body);
            f.onsubmit = (e) => { e.preventDefault(); busy($('button', f), async () => {
                try { const r = await API.post('/two-factor/enable', formValues(f)); TwoFA.setup(box, r); } catch (err) { showErrors(f, err); }
            }); };
            return;
        }

        body.innerHTML = `<div class="tfa-badge on">${icon('check')} On</div>
            <p class="mt-s">Since ${esc(new Date(st.confirmed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))}. Recovery codes left: <b>${st.recovery_codes_left}</b>${st.recovery_codes_left < 3 ? ' — create new ones soon.' : ''}</p>
            <form class="form mt" id="tfaPw">${pwField}
                <div class="flex" style="gap:.5rem;flex-wrap:wrap"><button class="btn secondary" type="button" data-act="codes">${icon('file')} New recovery codes</button>
                <button class="btn danger" type="button" data-act="off">Turn off</button></div></form>`;
        const f = $('#tfaPw', body);
        $$('[data-act]', f).forEach((b) => (b.onclick = () => busy(b, async () => {
            try {
                if (b.dataset.act === 'off') {
                    if (!(await confirmBox('Turn off two-factor login? Your account will be protected by the password only.', { okText: 'Turn off', danger: true }))) return;
                    const r = await API.post('/two-factor/disable', formValues(f)); toast(r.message); TwoFA.card(box);
                } else {
                    const r = await API.post('/two-factor/recovery-codes', formValues(f)); TwoFA.showCodes(box, r.recovery_codes, r.message);
                }
            } catch (err) { showErrors(f, err); }
        })));
    },

    /** Step 2 of setup: QR code + confirm with the first code. */
    setup(box, r) {
        const body = $('#tfaBody', box);
        let qr = '';
        try { const q = qrcode(0, 'M'); q.addData(r.otpauth_url); q.make(); qr = q.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); } catch (e) { qr = ''; }
        body.innerHTML = `<ol class="tfa-steps">
                <li>Install <b>Google Authenticator</b> or <b>Microsoft Authenticator</b> on your phone.</li>
                <li>In the app tap <b>+</b> → <b>Scan a QR code</b> and scan this code:</li></ol>
            <div class="tfa-qr">${qr || '<p class="muted">QR code could not be shown — use the key below.</p>'}</div>
            <p class="center"><small>Can't scan? Choose "Enter a setup key" in the app and type:</small><br><code class="tfa-secret">${esc(r.secret)}</code></p>
            <ol class="tfa-steps" start="3"><li>Enter the 6-digit code the app shows:</li></ol>
            <form class="form" id="tfaConfirm"><label class="field"><span>6-digit code</span><input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="123 456" required class="tfa-code"></label>
            <div class="flex" style="gap:.5rem"><button class="btn" type="submit" data-busy="Checking…">${icon('check')} Confirm & turn on</button><button class="btn ghost" type="button" id="tfaCancel">Cancel</button></div></form>`;
        const f = $('#tfaConfirm', body);
        $('input', f).focus();
        f.onsubmit = (e) => { e.preventDefault(); busy($('button[type=submit]', f), async () => {
            try { const res = await API.post('/two-factor/confirm', formValues(f)); TwoFA.showCodes(box, res.recovery_codes, res.message); } catch (err) { showErrors(f, err); }
        }); };
        $('#tfaCancel', body).onclick = () => TwoFA.card(box);
    },

    /** Shows recovery codes once, with copy / download. */
    showCodes(box, codes, message) {
        const body = $('#tfaBody', box);
        const text = `AAS School Manager — recovery codes\n${App.user?.email || ''}\n\n${codes.join('\n')}\n\nEach code can be used once if you lose your phone.`;
        body.innerHTML = `<div class="alert ok mb">${icon('check')}<div><b>${esc(message || 'Done.')}</b></div></div>
            <p><b>Save these recovery codes</b> somewhere safe (print them or keep them in a notebook). If you lose your phone, each code lets you sign in once. They are shown only now.</p>
            <div class="tfa-codes">${codes.map((c) => `<code>${esc(c)}</code>`).join('')}</div>
            <div class="flex mt" style="gap:.5rem;flex-wrap:wrap"><button class="btn secondary" id="tfaCopy">${icon('file')} Copy</button><button class="btn secondary" id="tfaDl">${icon('download')} Download</button><button class="btn" id="tfaDone">I have saved them</button></div>`;
        $('#tfaCopy', body).onclick = async () => { try { await navigator.clipboard.writeText(text); toast('Copied.'); } catch (e) { toast('Copy failed — please write them down.', 'error'); } };
        $('#tfaDl', body).onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = 'aas-recovery-codes.txt'; a.click(); };
        $('#tfaDone', body).onclick = () => TwoFA.card(box);
    },
};

(function addStyles() {
    if (typeof ICONS !== 'undefined' && !ICONS.lock) ICONS.lock = '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
    const css = document.createElement('style');
    css.textContent = `
    .tfa-head{text-align:center;margin-bottom:1rem}.tfa-ico{width:58px;height:58px;border-radius:16px;margin:0 auto .8rem;display:grid;place-items:center;background:color-mix(in srgb,var(--brand,#4f46e5) 12%,#fff);color:var(--brand,#4f46e5)}
    .tfa-ico svg{width:28px;height:28px}.tfa-code{font-size:1.5rem!important;letter-spacing:.35em;text-align:center;font-weight:700}
    .tfa-badge{display:inline-flex;align-items:center;gap:.35rem;padding:.3rem .8rem;border-radius:999px;font-weight:700;font-size:.85rem}.tfa-badge svg{width:16px;height:16px}
    .tfa-badge.on{background:#dcfce7;color:#166534}.tfa-badge.off{background:#fef3c7;color:#92400e}
    .tfa-qr{width:220px;margin:.6rem auto;padding:8px;background:#fff;border:1px solid var(--line,#e5e7eb);border-radius:14px}.tfa-qr svg{display:block;width:100%;height:auto}
    .tfa-secret{display:inline-block;margin-top:.3rem;padding:.4rem .7rem;border-radius:8px;background:#f1f3f9;font-size:1rem;letter-spacing:.08em;word-break:break-all}
    .tfa-steps{padding-left:1.2rem;margin:.4rem 0}.tfa-steps li{margin:.3rem 0}
    .tfa-codes{display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem}.tfa-codes code{padding:.55rem;border-radius:8px;background:#f1f3f9;text-align:center;font-size:1.05rem;letter-spacing:.08em;font-weight:700}
    .card-head h2 svg{width:20px;height:20px;vertical-align:-3px;margin-right:.3rem}`;
    document.head.appendChild(css);
})();
