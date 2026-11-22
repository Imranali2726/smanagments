/* ===========================================================
   Parent & student portal
   =========================================================== */
'use strict';

const ParentPortal = {
    async loadChildren() {
        try {
            const { data } = await API.get('/portal/children');
            App.children = data || [];
        } catch (e) { App.children = []; }
        const saved = localStorage.getItem('portal_child');
        App.child = App.children.find((c) => String(c.id) === saved) || App.children[0] || null;
    },

    renderSwitcher() {
        const box = $('#topExtra');
        if (!box) return;
        if (App.children.length <= 1) { box.innerHTML = ''; return; }
        const c = App.child;
        box.innerHTML = `<label class="child-switch" title="Switch child">
            <div class="avatar" id="childAvatar">${c?.photo ? `<img src="${esc(storageUrl(c.photo))}" alt="">` : esc(initials(c?.full_name))}</div>
            <select id="childSelect" aria-label="Select child">${options(App.children, { label: (x) => `${x.full_name} · ${x.school_class?.name || ''}`, selected: c?.id })}</select></label>`;
        $('#childSelect').onchange = (e) => {
            App.child = App.children.find((x) => String(x.id) === e.target.value);
            localStorage.setItem('portal_child', App.child.id);
            $('#childAvatar').innerHTML = App.child.photo ? `<img src="${esc(storageUrl(App.child.photo))}" alt="">` : esc(initials(App.child.full_name));
            Router.resolve();
        };
    },

    base() { return `/portal/students/${App.child.id}`; },

    /** Returns false (and shows a message) when no student is linked to the account. */
    ready(view) {
        if (App.child) return true;
        view.innerHTML = `<div class="card">${emptyHtml('No student linked to your account', 'Please contact the school office to link your child to this login.', 'users')}</div>`;
        return false;
    },

    childHeader() {
        const c = App.child;
        return `<div class="card profile-card mb">
            <div class="avatar lg">${c.photo ? `<img src="${esc(storageUrl(c.photo))}" alt="">` : esc(initials(c.full_name))}</div>
            <div class="grow"><h2>${esc(c.full_name)}</h2><div class="meta">
                <span>${esc(c.school_class?.name || '')}${c.section ? ' – ' + esc(c.section.name) : ''}</span>
                <span>Adm. No: ${esc(c.admission_no)}</span>${c.roll_no ? `<span>Roll No: ${esc(c.roll_no)}</span>` : ''}
                ${c.transport_route ? `<span>Transport: ${esc(c.transport_route.name)}</span>` : ''}
                ${c.active_hostel_allocation?.room ? `<span>Hostel: ${esc(c.active_hostel_allocation.room.hostel?.name || '')} (Room ${esc(c.active_hostel_allocation.room.room_no)})</span>` : ''}
            </div></div></div>`;
    },

    homeworkStatus(hw) {
        const s = hw.submission;
        if (s?.status === 'evaluated') return ['evaluated', 'Evaluated'];
        if (s?.status === 'late') return ['late', 'Submitted late'];
        if (s) return ['submitted', 'Submitted'];
        if (hw.due_date && hw.due_date < fmt.today()) return ['overdue', 'Not submitted'];
        return ['pending', 'Pending'];
    },

    /* ---------------- pages ---------------- */
    async home(view) {
        if (!ParentPortal.ready(view)) return;
        const b = ParentPortal.base();
        const [att, fees, hw, notices, sched, tt] = await Promise.allSettled([
            API.get(b + '/attendance', { month: fmt.thisMonth() }),
            API.get(b + '/fees'),
            API.get(b + '/homework'),
            API.get('/notices/feed', { per_page: 4 }),
            API.get(b + '/exam-schedule'),
            API.get(b + '/timetable'),
        ]);
        const val = (r) => (r.status === 'fulfilled' ? r.value : null);
        const a = val(att)?.summary;
        const f = val(fees);
        const homework = val(hw)?.data || [];
        const pendingHw = homework.filter((h) => ['pending', 'overdue'].includes(ParentPortal.homeworkStatus(h)[0]));
        const upcomingExams = (val(sched)?.data || []).filter((e) => e.exam_date >= fmt.today()).slice(0, 5);
        const todays = (val(tt)?.data || {})[fmt.todayName()] || [];
        const noticeList = val(notices)?.data || [];

        view.innerHTML = `${ParentPortal.childHeader()}
        <div class="stats mb">
            <a class="card stat" href="#/attendance"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Attendance this month</div>
                <div class="value">${a ? fmt.pct(a.percentage) : '—'}</div><div class="hint">${a ? `${a.present + a.late} of ${a.working_days} days present` : ''}</div></div></a>
            <a class="card stat" href="#/fees"><div class="ico ${f && f.balance > 0 ? 'tone-bad' : 'tone-ok'}">${icon('wallet')}</div><div><div class="label">Fee balance</div>
                <div class="value">${f ? fmt.money(f.balance) : '—'}</div><div class="hint">${f && f.balance > 0 ? 'Outstanding' : 'All dues clear'}</div></div></a>
            <a class="card stat" href="#/homework"><div class="ico tone-warn">${icon('book')}</div><div><div class="label">Pending homework</div>
                <div class="value">${pendingHw.length}</div><div class="hint">${homework.length} assigned recently</div></div></a>
            <a class="card stat" href="#/exam-schedule"><div class="ico tone-info">${icon('calendar')}</div><div><div class="label">Upcoming exams</div>
                <div class="value">${upcomingExams.length}</div><div class="hint">${upcomingExams[0] ? 'Next: ' + fmt.dateShort(upcomingExams[0].exam_date) : 'None scheduled'}</div></div></a>
        </div>
        <div class="grid-2">
            <div class="grid" style="align-content:start">
                <div class="card"><div class="card-head"><h2>Today's classes</h2><a href="#/timetable" class="btn ghost sm">Full timetable</a></div>
                    <div class="card-body">${todays.length ? todays.map((p) => `<div class="period"><div class="time">${fmt.time(p.start_time)} – ${fmt.time(p.end_time)}</div>
                        <div class="grow"><div class="subj">${esc(p.subject?.name)}</div><small>${esc(p.teacher?.name || '')}${p.room ? ' · Room ' + esc(p.room) : ''}</small></div></div>`).join('')
                        : '<p class="muted" style="margin:0">No classes scheduled today.</p>'}</div></div>
                <div class="card"><div class="card-head"><h2>Homework</h2><a href="#/homework" class="btn ghost sm">View all</a></div>
                    ${pendingHw.length ? `<ul class="list">${pendingHw.slice(0, 4).map((h) => {
                        const [st, lbl] = ParentPortal.homeworkStatus(h);
                        return `<li><div class="flex between"><span class="title">${esc(h.title)}</span>${badge(st, lbl)}</div>
                            <small>${esc(h.subject?.name || '')} · Due ${fmt.date(h.due_date)}</small></li>`;
                    }).join('')}</ul>` : `<div class="card-body"><p class="muted" style="margin:0">No pending homework. 🎉</p></div>`}</div>
            </div>
            <div class="grid" style="align-content:start">
                <div class="card"><div class="card-head"><h2>Latest notices</h2><a href="#/notices" class="btn ghost sm">View all</a></div>
                    ${noticeList.length ? `<ul class="list">${noticeList.map((n) => `<li><div class="title">${esc(n.title)}</div><div class="clamp muted">${esc(n.body)}</div><small>${fmt.date(n.publish_date)}</small></li>`).join('')}</ul>`
                        : `<div class="card-body"><p class="muted" style="margin:0">No notices.</p></div>`}</div>
                ${upcomingExams.length ? `<div class="card"><div class="card-head"><h2>Upcoming exams</h2></div><ul class="list">${upcomingExams.map((e) => `
                    <li><div class="item-row"><div class="date-tile"><b>${fmt.parse(e.exam_date).getDate()}</b><span>${fmt.parse(e.exam_date).toLocaleDateString('en-GB', { month: 'short' })}</span></div>
                    <div><div class="title">${esc(e.subject?.name)}</div><small>${esc(e.exam?.name || '')}${e.start_time ? ' · ' + fmt.time(e.start_time) : ''}</small></div></div></li>`).join('')}</ul></div>` : ''}
            </div>
        </div>`;
    },

    async attendance(view, params, query) {
        if (!ParentPortal.ready(view)) return;
        const month = query.month || fmt.thisMonth();
        const res = await API.get(ParentPortal.base() + '/attendance', { month });
        const s = res.summary;
        const byDate = {};
        res.data.forEach((r) => (byDate[String(r.date).slice(0, 10)] = r));

        const [y, m] = month.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const days = new Date(y, m, 0).getDate();
        const offset = (first.getDay() + 6) % 7;
        const today = fmt.today();
        let cells = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<div class="dow">${d}</div>`).join('');
        cells += '<div class="day blank"></div>'.repeat(offset);
        for (let d = 1; d <= days; d++) {
            const ds = `${y}-${pad(m)}-${pad(d)}`;
            const rec = byDate[ds];
            const sunday = new Date(y, m - 1, d).getDay() === 0;
            const cls = rec ? rec.status : (sunday ? 'off' : '');
            cells += `<div class="day ${cls} ${ds === today ? 'today' : ''}" title="${rec ? esc(fmt.cap(rec.status) + (rec.remarks ? ' — ' + rec.remarks : '')) : ''}">
                <span class="n">${d}</span><span class="s">${rec ? { present: 'P', absent: 'A', late: 'Late', leave: 'Leave' }[rec.status] : (sunday ? 'Off' : '')}</span></div>`;
        }
        const shift = (delta) => { const d = new Date(y, m - 1 + delta, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
        const absences = res.data.filter((r) => r.status !== 'present');

        view.innerHTML = `
        <div class="page-head"><div><h2>${esc(App.child.full_name)}</h2><p>Attendance for ${fmt.month(month)}</p></div>
            <div class="flex"><a class="btn secondary sm" href="#/attendance?month=${shift(-1)}">‹ Prev</a>
            <input type="month" id="monthPick" value="${month}" max="${fmt.thisMonth()}" style="width:auto">
            ${month < fmt.thisMonth() ? `<a class="btn secondary sm" href="#/attendance?month=${shift(1)}">Next ›</a>` : ''}</div></div>
        <div class="stats mb">
            <div class="card stat"><div class="ico tone-brand">${icon('chart')}</div><div><div class="label">Attendance</div><div class="value">${fmt.pct(s.percentage)}</div><div class="hint">${s.working_days} school days marked</div></div></div>
            <div class="card stat"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Present</div><div class="value">${s.present}</div></div></div>
            <div class="card stat"><div class="ico tone-bad">${icon('x')}</div><div><div class="label">Absent</div><div class="value">${s.absent}</div></div></div>
            <div class="card stat"><div class="ico tone-warn">${icon('clock')}</div><div><div class="label">Late / Leave</div><div class="value">${s.late} / ${s.leave}</div></div></div>
        </div>
        <div class="grid-2" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)">
            <div class="card card-pad"><div class="cal">${cells}</div>
                <div class="legend mt"><span><i style="background:var(--ok)"></i>Present</span><span><i style="background:var(--bad)"></i>Absent</span>
                <span><i style="background:var(--accent)"></i>Late</span><span><i style="background:var(--info)"></i>Leave</span></div></div>
            <div class="card"><div class="card-head"><h2>Absences & late days</h2></div>
                ${absences.length ? `<ul class="list">${absences.map((r) => `<li><div class="flex between"><b>${fmt.date(r.date)}</b>${badge(r.status)}</div>${r.remarks ? `<small>${esc(r.remarks)}</small>` : ''}</li>`).join('')}</ul>`
                    : `<div class="card-body"><p class="muted" style="margin:0">No absences this month.</p></div>`}
                <div class="card-body" style="border-top:1px solid var(--line)"><button class="btn secondary block" id="leaveBtn">${icon('leave')} Apply for leave</button></div></div>
        </div>`;
        $('#monthPick', view).onchange = (e) => e.target.value && Router.navigate('/attendance?month=' + e.target.value);
        $('#leaveBtn', view).onclick = () => Pages.applyLeave(() => Router.navigate('/leave'));
    },

    async fees(view, params, query) {
        if (!ParentPortal.ready(view)) return;
        const tab = query.tab || 'invoices';
        const b = ParentPortal.base();
        const [res, subs] = await Promise.all([
            API.get(b + '/fees'),
            API.get(b + '/payment-submissions').catch(() => ({ data: [] })),
        ]);
        const pending = new Set(subs.data.filter((s) => s.status === 'pending').map((s) => s.fee_invoice_id));
        const invoices = [...res.invoices].sort((x, y) => (x.month < y.month ? 1 : -1));

        const invoiceCards = invoices.length ? invoices.map((inv) => {
            const awaiting = pending.has(inv.id);
            const canPay = inv.balance > 0 && inv.status !== 'cancelled' && !awaiting;
            const overdue = inv.balance > 0 && inv.due_date < fmt.today();
            return `<li><div class="flex between flex-wrap">
                    <div><span class="title">${fmt.month(inv.month)}</span> <small>· ${esc(inv.invoice_no)}</small><br>
                    <small>Due ${fmt.date(inv.due_date)} ${overdue ? '<span class="badge bad">Overdue</span>' : ''}</small></div>
                    <div class="flex">${awaiting ? badge('awaiting verification', 'Awaiting verification') : badge(inv.status)}</div></div>
                <div class="flex flex-wrap mt-s" style="gap:1.25rem">
                    <span><small>Total</small><br><b>${fmt.money(inv.total)}</b></span>
                    <span><small>Paid</small><br><b>${fmt.money(inv.paid)}</b></span>
                    <span><small>Balance</small><br><b style="color:${inv.balance > 0 ? 'var(--bad)' : 'var(--ok)'}">${fmt.money(inv.balance)}</b></span>
                    <span class="grow"></span>
                    <span class="flex flex-wrap">
                        <button class="btn secondary sm" data-voucher="${inv.id}" data-no="${esc(inv.invoice_no)}">${icon('download')} Voucher</button>
                        ${canPay ? `<button class="btn sm" data-pay="${inv.id}">${icon('wallet')} Pay online</button>` : ''}
                    </span></div>
                <details class="mt-s"><summary class="muted" style="cursor:pointer">Details${inv.payments.length ? ` & ${inv.payments.length} receipt(s)` : ''}</summary>
                    <table class="table compact mt-s"><tbody>
                        ${inv.items.map((i) => `<tr><td>${esc(i.description)}</td><td class="num">${fmt.money(i.amount)}</td></tr>`).join('')}
                        ${inv.discount > 0 ? `<tr><td>Discount</td><td class="num">− ${fmt.money(inv.discount)}</td></tr>` : ''}
                        ${inv.fine > 0 ? `<tr><td>Late fine</td><td class="num">${fmt.money(inv.fine)}</td></tr>` : ''}
                    </tbody></table>
                    ${inv.payments.map((p) => `<div class="flex between mt-s"><span><b>${esc(p.receipt_no)}</b> · ${fmt.date(p.paid_on)} · ${esc(fmt.cap(p.method))}</span>
                        <span class="flex"><b>${fmt.money(p.amount)}</b><button class="btn ghost sm" data-receipt="${p.id}" data-no="${esc(p.receipt_no)}">${icon('download')} Receipt</button></span></div>`).join('')}
                </details></li>`;
        }).join('') : '';

        view.innerHTML = `
        <div class="stats mb">
            <div class="card stat"><div class="ico tone-info">${icon('file')}</div><div><div class="label">Total billed</div><div class="value">${fmt.money(res.total_billed)}</div></div></div>
            <div class="card stat"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Total paid</div><div class="value">${fmt.money(res.total_paid)}</div></div></div>
            <div class="card stat"><div class="ico ${res.balance > 0 ? 'tone-bad' : 'tone-ok'}">${icon('wallet')}</div><div><div class="label">Balance due</div><div class="value">${fmt.money(res.balance)}</div></div></div>
        </div>
        <div class="tabs"><button data-tab="invoices" class="${tab === 'invoices' ? 'active' : ''}">Invoices</button>
            <button data-tab="statement" class="${tab === 'statement' ? 'active' : ''}">Statement</button>
            <button data-tab="online" class="${tab === 'online' ? 'active' : ''}">Online payments${pending.size ? ` (${pending.size})` : ''}</button></div>
        <div class="card" data-pane="invoices" ${tab !== 'invoices' ? 'hidden' : ''}>${invoiceCards ? `<ul class="list">${invoiceCards}</ul>` : emptyHtml('No invoices yet', '', 'wallet')}</div>
        <div class="card" data-pane="statement" ${tab !== 'statement' ? 'hidden' : ''}><div class="table-wrap">${res.ledger.length ? `<table class="table"><thead><tr><th>Date</th><th>Description</th><th>Reference</th><th class="num">Charged</th><th class="num">Paid</th><th class="num">Balance</th></tr></thead><tbody>
            ${res.ledger.map((e) => `<tr><td class="nowrap">${fmt.date(e.date)}</td><td>${esc(e.description)}</td><td><small>${esc(e.reference || '')}</small></td>
            <td class="num">${e.debit ? fmt.money(e.debit) : ''}</td><td class="num">${e.credit ? fmt.money(e.credit) : ''}</td><td class="num"><b>${fmt.money(e.balance)}</b></td></tr>`).join('')}
            </tbody></table>` : emptyHtml('No transactions yet')}</div></div>
        <div class="card" data-pane="online" ${tab !== 'online' ? 'hidden' : ''}><div class="table-wrap">${subs.data.length ? `<table class="table"><thead><tr><th>Submitted</th><th>Invoice</th><th>Method</th><th>Transaction ID</th><th class="num">Amount</th><th>Status</th></tr></thead><tbody>
            ${subs.data.map((s) => `<tr><td class="nowrap">${fmt.date(s.created_at)}</td><td>${esc(s.invoice?.invoice_no || '')}</td><td>${esc(fmt.cap(s.method))}</td><td>${esc(s.reference || '')}</td>
            <td class="num">${fmt.money(s.amount)}</td><td>${badge(s.status === 'pending' ? 'awaiting verification' : s.status, s.status === 'pending' ? 'Awaiting verification' : null)}${s.remarks ? `<br><small>${esc(s.remarks)}</small>` : ''}</td></tr>`).join('')}
            </tbody></table>` : emptyHtml('No online payments', 'Payments you submit online will appear here until verified.', 'wallet')}</div></div>`;

        $$('[data-tab]', view).forEach((t) => (t.onclick = () => Router.navigate('/fees?tab=' + t.dataset.tab)));
        $$('[data-voucher]', view).forEach((btn) => (btn.onclick = () => busy(btn, () =>
            API.download(`${b}/invoices/${btn.dataset.voucher}/voucher`, null, `fee-voucher-${btn.dataset.no}.pdf`).catch((e) => toast(e.message, 'error')))));
        $$('[data-receipt]', view).forEach((btn) => (btn.onclick = () => busy(btn, () =>
            API.download(`${b}/payments/${btn.dataset.receipt}/receipt`, null, `receipt-${btn.dataset.no}.pdf`).catch((e) => toast(e.message, 'error')))));
        $$('[data-pay]', view).forEach((btn) => (btn.onclick = () => ParentPortal.payOnline(invoices.find((i) => String(i.id) === btn.dataset.pay), () => Router.navigate('/fees?tab=online'))));
    },

    async payOnline(inv, onDone) {
        const m = modal({ title: `Pay online — ${fmt.month(inv.month)}`, body: loadingHtml(), wide: true });
        let methods = [];
        try { methods = (await API.get('/payment-methods/active')).data; } catch (e) { /* optional */ }
        const guess = (name) => { const n = String(name).toLowerCase(); return n.includes('jazz') ? 'jazzcash' : n.includes('easy') ? 'easypaisa' : 'bank'; };
        $('.modal-body', m.el).innerHTML = `
            <div class="alert info mb">${icon('alert')}<div><b>Step 1:</b> Send ${fmt.money(inv.balance)} to one of the accounts below.<br><b>Step 2:</b> Enter the transaction ID and upload a screenshot. The accounts office will verify it and issue a receipt.</div></div>
            ${methods.length ? `<div class="grid-2 mb">${methods.map((pm) => `<div class="card card-pad"><b>${esc(pm.name)}</b>
                ${pm.account_title ? `<div><small>Account title</small><br>${esc(pm.account_title)}</div>` : ''}
                ${pm.account_number ? `<div class="mt-s"><small>Account / mobile no.</small><br><b style="font-size:1.05rem;letter-spacing:.02em">${esc(pm.account_number)}</b></div>` : ''}
                ${pm.instructions ? `<small class="pre">${esc(pm.instructions)}</small>` : ''}</div>`).join('')}</div>` : ''}
            <form class="form" id="payForm">
                <div class="form-row">
                    <label class="field"><span>Paid to</span><select name="payment_method_id">${options(methods, { placeholder: 'Select account' })}</select></label>
                    <label class="field"><span>Payment method <em>*</em></span><select name="method" required>
                        <option value="bank">Bank transfer</option><option value="jazzcash">JazzCash</option><option value="easypaisa">EasyPaisa</option><option value="online">Other online</option><option value="cheque">Cheque deposit</option></select></label>
                </div>
                <div class="form-row">
                    <label class="field"><span>Amount paid <em>*</em></span><input name="amount" type="number" min="1" max="${inv.balance}" step="1" value="${Math.round(inv.balance)}" required></label>
                    <label class="field"><span>Payment date <em>*</em></span><input name="paid_on" type="date" value="${fmt.today()}" max="${fmt.today()}" required></label>
                </div>
                <label class="field"><span>Transaction ID / reference <em>*</em></span><input name="reference" required placeholder="e.g. TID 1234567890"></label>
                <label class="field"><span>Screenshot / deposit slip</span><input name="proof" type="file" accept="image/*"></label>
                <div class="flex" style="justify-content:flex-end"><button class="btn secondary" type="button" data-close>Cancel</button><button class="btn" type="submit" data-busy="Submitting…">Submit payment</button></div>
            </form>`;
        const form = $('#payForm', m.el);
        form.payment_method_id.onchange = (e) => {
            const pm = methods.find((x) => String(x.id) === e.target.value);
            if (pm) form.method.value = guess(pm.name);
        };
        form.onsubmit = async (e) => {
            e.preventDefault();
            await busy($('button[type=submit]', form), async () => {
                try {
                    const fd = new FormData(form);
                    if (!fd.get('payment_method_id')) fd.delete('payment_method_id');
                    if (!fd.get('proof')?.size) fd.delete('proof');
                    await API.post(`${ParentPortal.base()}/invoices/${inv.id}/pay-online`, fd);
                    m.close();
                    toast('Payment submitted for verification.');
                    onDone?.();
                } catch (err) { showErrors(form, err); }
            });
        };
    },

    async results(view) {
        if (!ParentPortal.ready(view)) return;
        const b = ParentPortal.base();
        const [exams, prog] = await Promise.all([API.get(b + '/exams'), API.get(b + '/progress').catch(() => null)]);
        const list = exams.data || [];
        const progExams = prog?.exams || [];
        const byExam = Object.fromEntries(progExams.map((e) => [e.exam_id, e]));

        view.innerHTML = `
        <div class="card mb"><div class="card-head"><h2>Report cards</h2><small>Published results</small></div>
            ${list.length ? `<ul class="list clickable">${list.map((ex) => {
                const p = byExam[ex.id];
                return `<li data-exam="${ex.id}"><div class="flex between"><div><span class="title">${esc(ex.name)}</span><br><small>${ex.start_date ? fmt.date(ex.start_date) : ''}</small></div>
                    <div class="flex">${p ? `<b>${fmt.pct(p.percentage)}</b>${p.grade ? badge('brand', 'Grade ' + p.grade) : ''}` : ''}<span class="btn ghost sm">View ›</span></div></div></li>`;
            }).join('')}</ul>` : emptyHtml('No results published yet', 'Report cards appear here once the school publishes them.', 'award')}</div>
        ${progExams.length ? `<div class="card"><div class="card-head"><h2>Progress over time</h2>
            ${prog.trend !== null ? `<span class="badge ${prog.trend >= 0 ? 'ok' : 'bad'}">${prog.trend >= 0 ? '▲' : '▼'} ${fmt.num(Math.abs(prog.trend))}% since first exam</span>` : ''}</div>
            <div class="card-body"><div class="bar-chart">${progExams.map((e) => `<div class="bar"><b>${fmt.num(e.percentage)}%</b><i style="height:${Math.max(2, e.percentage)}%"></i></div>`).join('')}</div>
            <div class="bar-labels">${progExams.map((e) => `<span>${esc(e.exam)}<br>${esc(e.session || '')}</span>`).join('')}</div>
            ${Object.keys(prog.session_averages || {}).length > 1 ? `<div class="mt"><b>Average by session:</b> ${Object.entries(prog.session_averages).map(([k, v]) => `${esc(k)}: <b>${fmt.num(v)}%</b>`).join(' · ')}</div>` : ''}
            </div></div>` : ''}`;
        $$('[data-exam]', view).forEach((li) => (li.onclick = () => Router.navigate('/results/' + li.dataset.exam)));
    },

    async reportCard(view, params) {
        if (!ParentPortal.ready(view)) return;
        const path = `${ParentPortal.base()}/results/${params.examId}`;
        const { data: c } = await API.get(path);
        view.innerHTML = `
        <div class="page-head"><div><a href="#/results" class="btn ghost sm">${icon('arrowLeft')} Results</a>
            <h2 class="mt-s">${esc(c.exam.name)}${c.session ? ' · ' + esc(c.session) : ''}</h2><p>${esc(c.student.name)} · ${esc(c.student.class || '')} ${esc(c.student.section || '')}</p></div>
            <button class="btn" id="pdfBtn" data-busy="Preparing…">${icon('download')} Download PDF</button></div>
        <div class="rc-summary mb">
            <div><span>Marks</span><b>${fmt.num(c.obtained_marks)} / ${fmt.num(c.total_marks)}</b></div>
            <div><span>Percentage</span><b>${fmt.pct(c.percentage)}</b></div>
            <div><span>Grade</span><b>${esc(c.grade || '—')}</b></div>
            <div><span>Position</span><b>${c.position ? `${c.position} <small>of ${c.class_strength}</small>` : '—'}</b></div>
            <div><span>Result</span><b style="color:${c.result === 'Fail' ? 'var(--bad)' : 'var(--ok)'}">${esc(c.result)}</b></div>
            ${c.attendance ? `<div><span>Attendance</span><b>${c.attendance.present}/${c.attendance.working_days}</b></div>` : ''}
        </div>
        <div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Subject</th><th class="num">Total</th><th class="num">Obtained</th><th style="width:28%">Score</th><th>Grade</th><th>Remarks</th></tr></thead><tbody>
            ${c.subjects.map((s) => `<tr><td><b>${esc(s.subject)}</b></td><td class="num">${fmt.num(s.total_marks)}</td>
            <td class="num" style="color:${s.passed ? 'inherit' : 'var(--bad)'}">${s.is_absent ? 'Absent' : fmt.num(s.obtained_marks)}</td>
            <td><div class="flex"><div class="progress grow"><i style="width:${Math.min(100, s.percentage)}%;${s.passed ? '' : 'background:var(--bad)'}"></i></div><small class="nowrap">${fmt.num(s.percentage)}%</small></div></td>
            <td>${esc(s.grade || '')}</td><td><small>${esc(s.remarks || '')}</small></td></tr>`).join('')}
        </tbody></table></div>
        ${c.grade_remarks ? `<div class="card-body" style="border-top:1px solid var(--line)"><b>Remarks:</b> ${esc(c.grade_remarks)}</div>` : ''}</div>`;
        const btn = $('#pdfBtn', view);
        btn.onclick = () => busy(btn, () => API.download(path, { pdf: 1 }, 'report-card.pdf').catch((e) => toast(e.message, 'error')));
    },

    async examSchedule(view) {
        if (!ParentPortal.ready(view)) return;
        const { data } = await API.get(ParentPortal.base() + '/exam-schedule');
        const groups = {};
        data.forEach((e) => { (groups[e.exam?.name || 'Exam'] ||= []).push(e); });
        view.innerHTML = Object.keys(groups).length ? Object.entries(groups).map(([name, rows]) => `
            <div class="card mb"><div class="card-head"><h2>${esc(name)}</h2><small>${rows.length} paper(s)</small></div>
            <div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Day</th><th>Subject</th><th>Time</th><th>Room</th><th class="num">Marks</th></tr></thead><tbody>
            ${rows.map((e) => `<tr style="${e.exam_date < fmt.today() ? 'opacity:.55' : ''}"><td class="nowrap"><b>${fmt.date(e.exam_date)}</b></td>
                <td>${fmt.parse(e.exam_date).toLocaleDateString('en-GB', { weekday: 'long' })}</td><td>${esc(e.subject?.name)}</td>
                <td class="nowrap">${e.start_time ? fmt.time(e.start_time) + (e.end_time ? ' – ' + fmt.time(e.end_time) : '') : '—'}</td><td>${esc(e.room || '—')}</td><td class="num">${fmt.num(e.total_marks)}</td></tr>`).join('')}
            </tbody></table></div></div>`).join('')
            : `<div class="card">${emptyHtml('No exams scheduled', 'The date sheet will appear here when the school publishes it.', 'calendar')}</div>`;
    },

    async timetable(view, params, query) {
        if (!ParentPortal.ready(view)) return;
        const { data } = await API.get(ParentPortal.base() + '/timetable');
        renderWeek(view, data, query, '/timetable', (p) => `<div class="subj">${esc(p.subject?.name)}</div><small>${esc(p.teacher?.name || '')}${p.room ? ' · Room ' + esc(p.room) : ''}</small>`);
    },

    async homework(view, params, query) {
        if (!ParentPortal.ready(view)) return;
        const res = await API.get(ParentPortal.base() + '/homework', { page: query.page || 1 });
        view.innerHTML = `<div class="card">${res.data.length ? `<ul class="list">${res.data.map((h) => {
            const [st, lbl] = ParentPortal.homeworkStatus(h);
            const s = h.submission;
            return `<li><div class="flex between flex-wrap"><div><span class="title">${esc(h.title)}</span><br>
                <small>${esc(h.subject?.name || '')} · ${esc(h.teacher?.name || '')} · Given ${fmt.dateShort(h.assigned_date)}${h.due_date ? ' · <b>Due ' + fmt.date(h.due_date) + '</b>' : ''}</small></div>${badge(st, lbl)}</div>
                ${h.description ? `<div class="pre mt-s">${esc(h.description)}</div>` : ''}
                <div class="flex flex-wrap mt-s">
                    ${h.attachment ? `<a class="btn secondary sm" href="${esc(storageUrl(h.attachment))}" target="_blank" rel="noopener">${icon('file')} Teacher's file</a>` : ''}
                    ${st !== 'evaluated' ? `<button class="btn sm" data-submit="${h.id}">${icon('upload')} ${s ? 'Resubmit' : 'Submit work'}</button>` : ''}
                    ${s?.attachment ? `<a class="btn ghost sm" href="${esc(storageUrl(s.attachment))}" target="_blank" rel="noopener">Your file</a>` : ''}
                </div>
                ${s?.status === 'evaluated' ? `<div class="alert ok mt-s"><div>${s.marks !== null && s.marks !== undefined ? `<b>Marks: ${fmt.num(s.marks)}</b><br>` : ''}${esc(s.feedback || 'Checked by teacher.')}</div></div>` : ''}
            </li>`;
        }).join('')}</ul>` : emptyHtml('No homework', 'Homework given by teachers will appear here.', 'book')}${pagerHtml(res)}</div>`;
        bindPager(view, (p) => Router.navigate('/homework?page=' + p));
        $$('[data-submit]', view).forEach((b) => (b.onclick = () => {
            const hw = res.data.find((x) => String(x.id) === b.dataset.submit);
            const m = modal({
                title: 'Submit: ' + hw.title,
                body: `<form class="form" id="subForm">
                    <label class="field"><span>Answer / notes</span><textarea name="content" rows="5">${esc(hw.submission?.content || '')}</textarea></label>
                    <label class="field"><span>Attach file (photo, PDF, Word)</span><input type="file" name="attachment" accept="image/*,.pdf,.doc,.docx,.txt,.zip"></label>
                    <small>Write an answer, attach a file, or both.</small>
                    <div class="flex" style="justify-content:flex-end"><button class="btn secondary" type="button" data-close>Cancel</button><button class="btn" type="submit" data-busy="Uploading…">Submit</button></div></form>`,
            });
            const form = $('#subForm', m.el);
            form.onsubmit = async (e) => {
                e.preventDefault();
                await busy($('button[type=submit]', form), async () => {
                    try {
                        const fd = new FormData(form);
                        if (!fd.get('attachment')?.size) fd.delete('attachment');
                        if (!fd.get('content')) fd.delete('content');
                        await API.post(`${ParentPortal.base()}/homework/${hw.id}/submit`, fd);
                        m.close();
                        toast('Homework submitted.');
                        ParentPortal.homework(view, params, query);
                    } catch (err) { showErrors(form, err); }
                });
            };
        }));
    },

    async downloads(view, params, query) {
        if (!ParentPortal.ready(view)) return;
        const type = query.type || '';
        const res = await API.get(ParentPortal.base() + '/downloads', { type, page: query.page || 1 });
        const types = [['', 'All'], ['assignment', 'Assignments'], ['syllabus', 'Syllabus'], ['study_material', 'Study material'], ['circular', 'Circulars'], ['other', 'Other']];
        view.innerHTML = `<div class="chips mb">${types.map(([v, l]) => `<button class="chip ${v === type ? 'active' : ''}" data-type="${v}">${l}</button>`).join('')}</div>
            <div class="card">${materialList(res.data)}${pagerHtml(res)}</div>`;
        $$('[data-type]', view).forEach((c) => (c.onclick = () => Router.navigate('/downloads' + (c.dataset.type ? '?type=' + c.dataset.type : ''))));
        bindPager(view, (p) => Router.navigate(`/downloads?type=${type}&page=${p}`));
    },
};

/* ---------- helpers shared with the teacher portal ---------- */
function materialList(items, { deletable = false } = {}) {
    if (!items.length) return emptyHtml('Nothing here yet', 'Syllabus, assignments and study material will appear here.', 'download');
    return `<ul class="list">${items.map((d) => `<li><div class="item-row">
        <div class="ico tone-brand" style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;flex:none">${icon(d.type === 'circular' ? 'bell' : 'file')}</div>
        <div class="grow"><div class="flex between flex-wrap"><span class="title">${esc(d.title)}</span>${badge('brand', fmt.cap(d.type))}</div>
            <small>${[d.school_class?.name, d.section?.name, d.subject?.name].filter(Boolean).map(esc).join(' · ') || 'All classes'} · ${fmt.date(d.created_at)}</small>
            ${d.description ? `<div class="clamp muted">${esc(d.description)}</div>` : ''}
            <div class="flex mt-s">${d.file ? `<a class="btn secondary sm" href="${esc(storageUrl(d.file))}" target="_blank" rel="noopener">${icon('download')} Download</a>` : ''}
            ${d.link ? `<a class="btn secondary sm" href="${esc(d.link)}" target="_blank" rel="noopener">Open link</a>` : ''}
            ${deletable ? `<button class="btn ghost sm" data-del="${d.id}" style="color:var(--bad)">${icon('trash')} Delete</button>` : ''}</div>
        </div></div></li>`).join('')}</ul>`;
}

/** Weekly timetable with day chips. `cell(period)` renders the period body. */
function renderWeek(view, data, query, route, cell) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].filter((d) => data[d]?.length);
    if (!days.length) { view.innerHTML = `<div class="card">${emptyHtml('No timetable yet', 'The class timetable will appear here.', 'clock')}</div>`; return; }
    const today = fmt.todayName();
    const day = query.day && days.includes(query.day) ? query.day : (days.includes(today) ? today : days[0]);
    const now = new Date();
    const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    view.innerHTML = `<div class="chips mb">${days.map((d) => `<button class="chip ${d === day ? 'active' : ''}" data-day="${d}">${fmt.cap(d)}${d === today ? ' • Today' : ''}</button>`).join('')}</div>
        <div class="card card-pad">${data[day].map((p) => {
            const isNow = day === today && String(p.start_time).slice(0, 5) <= hm && hm < String(p.end_time).slice(0, 5);
            return `<div class="period ${isNow ? 'now' : ''}"><div class="time">${fmt.time(p.start_time)} – ${fmt.time(p.end_time)}${isNow ? '<br><span class="badge ok">Now</span>' : ''}</div><div class="grow">${cell(p)}</div></div>`;
        }).join('')}</div>`;
    $$('[data-day]', view).forEach((c) => (c.onclick = () => Router.navigate(`${route}?day=${c.dataset.day}`)));
}

Router.add('parent', '/', 'Home', ParentPortal.home);
Router.add('parent', '/attendance', 'Attendance', ParentPortal.attendance);
Router.add('parent', '/fees', 'Fees', ParentPortal.fees);
Router.add('parent', '/results', 'Results', ParentPortal.results);
Router.add('parent', '/results/:examId', 'Report Card', ParentPortal.reportCard);
Router.add('parent', '/exam-schedule', 'Exam Schedule', ParentPortal.examSchedule);
Router.add('parent', '/timetable', 'Timetable', ParentPortal.timetable);
Router.add('parent', '/homework', 'Homework', ParentPortal.homework);
Router.add('parent', '/downloads', 'Downloads', ParentPortal.downloads);
