/* ===========================================================
   Portal extras: school calendar, behaviour remarks,
   upcoming events on the home page. Loaded after teacher.js.
   =========================================================== */
'use strict';

const EV_TYPES = { event: 'Event', holiday: 'Holiday', exam: 'Exam', meeting: 'Meeting', sports: 'Sports', other: 'Other' };
const evRange = (e) => {
    const s = fmt.date(e.start_date);
    const end = e.end_date && e.end_date !== e.start_date ? ' – ' + fmt.date(e.end_date) : '';
    const t = e.start_time ? ` · ${fmt.time(e.start_time)}${e.end_time ? ' – ' + fmt.time(e.end_time) : ''}` : '';
    return s + end + t;
};
function eventItem(e) {
    const d = fmt.parse(e.start_date);
    return `<li class="ev t-${esc(e.type)}" data-ev="${e.id}" style="cursor:pointer"><div class="date-tile"><b>${d.getDate()}</b><span>${d.toLocaleDateString('en-GB', { month: 'short' })}</span></div>
        <div class="grow"><div class="ev-type" style="color:var(--evt)">${esc(EV_TYPES[e.type] || e.type)}</div><div class="title">${esc(e.title)}</div><small>${evRange(e)}${e.location ? ' · ' + esc(e.location) : ''}</small></div></li>`;
}
function eventModal(e, foot = '') {
    return modal({
        title: e.title,
        body: `<p>${badge('', EV_TYPES[e.type] || e.type)} ${e.audience && e.audience !== 'all' ? badge('info', 'For ' + e.audience) : ''}</p>
            <p><b>${evRange(e)}</b>${e.location ? `<br><small>${esc(e.location)}</small>` : ''}</p>${e.description ? `<p class="pre">${esc(e.description)}</p>` : ''}`,
        foot,
    });
}

/** Month grid. `events` = array; returns html. */
function monthGrid(ym, events) {
    const [y, m] = ym.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const startDow = (first.getDay() + 6) % 7; // Monday first
    const start = new Date(y, m - 1, 1 - startDow);
    const today = fmt.today();
    const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    let html = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const k = key(d);
        if (i >= 35 && d.getMonth() !== m - 1) break;
        const evs = events.filter((e) => e.start_date <= k && (e.end_date || e.start_date) >= k);
        html += `<div class="cell ${d.getMonth() !== m - 1 ? 'other' : ''} ${k === today ? 'today' : ''}"><span class="n">${d.getDate()}</span>
            ${evs.slice(0, 3).map((e) => `<span class="e t-${esc(e.type)}" data-ev="${e.id}" title="${esc(e.title)}">${esc(e.title)}</span>`).join('')}${evs.length > 3 ? `<small>+${evs.length - 3} more</small>` : ''}</div>`;
    }
    return `<div class="mcal">${html}</div>`;
}
function monthBounds(ym) {
    const [y, m] = ym.split('-').map(Number);
    const last = new Date(y, m, 0).getDate();
    return { from: `${ym}-01`, to: `${ym}-${pad(last)}` };
}
function shiftMonth(ym, n) { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }

Object.assign(Pages, {
    async calendar(view, params, query) {
        const ym = query.month || fmt.thisMonth();
        const { from, to } = monthBounds(ym);
        const [res, upcoming] = await Promise.all([API.get('/events/feed', { from, to }), API.get('/events/feed', { from: fmt.today() })]);
        const next = upcoming.data.filter((e) => (e.end_date || e.start_date) >= fmt.today()).slice(0, 8);
        view.innerHTML = `<div class="grid-2" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
            <div class="card"><div class="card-head"><h2>${fmt.month(ym)}</h2><div class="flex">
                <a class="btn secondary sm" href="#/calendar?month=${shiftMonth(ym, -1)}">‹ Prev</a><a class="btn secondary sm" href="#/calendar">Today</a><a class="btn secondary sm" href="#/calendar?month=${shiftMonth(ym, 1)}">Next ›</a></div></div>
                ${monthGrid(ym, res.data)}
                <div class="card-body legend">${Object.entries(EV_TYPES).map(([k, l]) => `<span class="t-${k}"><i style="background:var(--evt)"></i>${l}</span>`).join('')}</div></div>
            <div class="card" style="align-self:start"><div class="card-head"><h2>Coming up</h2></div>
                ${next.length ? `<ul class="list">${next.map(eventItem).join('')}</ul>` : emptyHtml('Nothing coming up', '', 'calendar')}</div></div>`;
        const all = [...res.data, ...upcoming.data];
        $$('[data-ev]', view).forEach((el) => (el.onclick = () => eventModal(all.find((e) => e.id === +el.dataset.ev))));
    },
});

ParentPortal.remarks = async (view) => {
    if (!ParentPortal.ready(view)) return;
    const { data } = await API.get(ParentPortal.base() + '/remarks');
    const pos = data.filter((r) => r.type === 'positive').length, neg = data.filter((r) => r.type === 'negative').length;
    view.innerHTML = `<div class="stats mb">
        <div class="card stat"><div class="ico tone-ok">${icon('award')}</div><div><div class="label">Appreciations</div><div class="value">${pos}</div></div></div>
        <div class="card stat"><div class="ico tone-bad">${icon('alert')}</div><div><div class="label">Concerns</div><div class="value">${neg}</div></div></div>
        <div class="card stat"><div class="ico tone-info">${icon('clipboard')}</div><div><div class="label">Notes</div><div class="value">${data.length - pos - neg}</div></div></div></div>
    <div class="card">${data.length ? `<ul class="list">${data.map((r) => `<li class="remark ${esc(r.type)}"><div class="flex between flex-wrap"><span class="title">${esc(r.title)}</span>${badge(r.type === 'positive' ? 'approved' : r.type === 'negative' ? 'rejected' : 'leave', fmt.cap(r.type === 'positive' ? 'Appreciation' : r.type === 'negative' ? 'Concern' : 'Note'))}</div>
        ${r.description ? `<div class="pre">${esc(r.description)}</div>` : ''}${r.action_taken ? `<small><b>Action:</b> ${esc(r.action_taken)}</small><br>` : ''}
        <small>${fmt.date(r.remark_date)}${r.category ? ' · ' + esc(r.category) : ''}${r.creator ? ' · by ' + esc(r.creator.name) : ''}</small></li>`).join('')}</ul>`
        : emptyHtml('No remarks yet', 'Teachers\' appreciation notes and behaviour remarks will appear here.', 'award')}</div>`;
};

TeacherPortal.remarks = async (view, params, query) => {
    const scope = await TeacherPortal.scope();
    const res = await API.get('/student-remarks', { page: query.page || 1, per_page: 20 });
    view.innerHTML = `<div class="page-head"><div><p>Appreciation and behaviour notes you have written. Parents can see them unless you hide them.</p></div>
        <button class="btn" id="newRm" ${scope.sections.length ? '' : 'disabled'}>${icon('plus')} New remark</button></div>
    <div class="card">${res.data.length ? `<ul class="list">${res.data.map((r) => `<li class="remark ${esc(r.type)}"><div class="flex between flex-wrap"><span class="title">${esc(r.title)}</span>
        <span>${badge(r.type === 'positive' ? 'approved' : r.type === 'negative' ? 'rejected' : 'leave', r.type === 'positive' ? 'Appreciation' : r.type === 'negative' ? 'Concern' : 'Note')} ${r.visible_to_parent ? '' : badge('', 'Hidden from parent')}</span></div>
        <div>${esc(r.student ? `${r.student.first_name} ${r.student.last_name || ''}` : '')} <small>${esc(r.student?.school_class?.name || '')} – ${esc(r.student?.section?.name || '')}</small></div>
        ${r.description ? `<div class="clamp">${esc(r.description)}</div>` : ''}<small>${fmt.date(r.remark_date)}${r.category ? ' · ' + esc(r.category) : ''}</small></li>`).join('')}</ul>${pagerHtml(res)}`
        : emptyHtml('No remarks yet', 'Click "New remark" to appreciate a student or record a concern.', 'award')}</div>`;
    bindPager(view, (p) => Router.navigate('/remarks?page=' + p));
    $('#newRm', view).onclick = () => {
        const m = modal({
            title: 'New remark',
            body: `<form class="form" id="rf" novalidate>
                <div class="form-row"><label class="field"><span>Class / section</span><select name="section">${options(scope.sections, { label: 'label', placeholder: 'Select' })}</select></label>
                <label class="field"><span>Student *</span><select name="student_id"><option value="">Select section first</option></select></label></div>
                <div class="form-row"><label class="field"><span>Type *</span><select name="type"><option value="positive">Appreciation (positive)</option><option value="negative">Concern (negative)</option><option value="note">General note</option></select></label>
                <label class="field"><span>Category</span><input name="category" list="rmCats" placeholder="e.g. Discipline"><datalist id="rmCats"><option>Discipline</option><option>Homework</option><option>Punctuality</option><option>Uniform</option><option>Class participation</option><option>Sports</option><option>Good behaviour</option></datalist></label></div>
                <label class="field"><span>Title *</span><input name="title" required placeholder="e.g. Excellent class presentation"></label>
                <label class="field"><span>Details</span><textarea name="description" rows="3"></textarea></label>
                <label class="field"><span>Action taken</span><input name="action_taken"></label>
                <label class="check"><input type="checkbox" name="visible_to_parent" checked> Show to parent</label>
                <div class="flex" style="justify-content:flex-end"><button type="button" class="btn secondary" data-close>Cancel</button><button class="btn" type="submit" data-busy="Saving…">Save</button></div></form>`,
        });
        const f = $('#rf', m.el);
        f.section.onchange = async () => {
            f.student_id.innerHTML = '<option value="">Loading…</option>';
            const { data } = await API.get('/students', { section_id: f.section.value, all: 1, status: 'active' });
            f.student_id.innerHTML = options(data, { label: (s) => `${s.roll_no ? s.roll_no + '. ' : ''}${s.full_name}`, placeholder: 'Select student' });
        };
        f.onsubmit = (e) => { e.preventDefault(); busy($('button[type=submit]', f), async () => {
            try { const v = formValues(f); delete v.section; await API.post('/student-remarks', v); m.close(); toast('Remark saved.'); Router.resolve(); } catch (err) { showErrors(f, err); }
        }); };
    };
};

/* ---------- navigation ---------- */
NAV.parent.splice(NAV.parent.findIndex((n) => n[0] === '/downloads') + 1, 0, ['/remarks', 'Behaviour & Remarks', 'award'], ['/calendar', 'School Calendar', 'calendar']);
NAV.teacher.splice(NAV.teacher.findIndex((n) => n[0] === '/timetable') + 1, 0, ['/remarks', 'Student Remarks', 'award'], ['/calendar', 'School Calendar', 'calendar']);
Router.add('shared', '/calendar', 'School Calendar', Pages.calendar);
Router.add('parent', '/remarks', 'Behaviour & Remarks', ParentPortal.remarks);
Router.add('teacher', '/remarks', 'Student Remarks', TeacherPortal.remarks);

/* ---------- upcoming events on both home pages ---------- */
Router.routes.filter((r) => r.pattern === '/').forEach((r) => {
    const orig = r.render;
    r.render = async (view, params, query) => {
        await orig(view, params, query);
        if (r.portal === 'teacher') view.querySelector('.page-head')?.classList.add('welcome');
        try {
            const { data } = await API.get('/events/feed', { from: fmt.today() });
            const next = data.filter((e) => (e.end_date || e.start_date) >= fmt.today()).slice(0, 5);
            if (!next.length || !document.body.contains(view)) return;
            const card = document.createElement('div');
            card.className = 'card mt';
            card.innerHTML = `<div class="card-head"><h2>Upcoming events &amp; holidays</h2><a class="btn ghost sm" href="#/calendar">Calendar</a></div><ul class="list">${next.map(eventItem).join('')}</ul>`;
            view.appendChild(card);
            $$('[data-ev]', card).forEach((el) => (el.onclick = () => eventModal(next.find((e) => e.id === +el.dataset.ev))));
        } catch (e) { /* events table not migrated yet */ }
    };
});

/* ---------- AAS branding fallback ---------- */
const _brandLogo = brandLogo;
brandLogo = function () {
    return App.school.logo_url ? _brandLogo() : `<div class="brand-logo aas"><img src="../brand/aas-logo.svg" alt="AAS"></div>`;
};

/* ---------- multi-school: load this school's name/logo and switched-off modules ---------- */
const PORTAL_MODULES = {
    exams: ['/results', '/exam-schedule', '/marks'],
    homework: ['/homework', '/downloads'],
    events: ['/calendar'],
    remarks: ['/remarks'],
};
{
    const baseResolve = Router.resolve;
    Router.resolve = async function () {
        const { path } = this.current();
        if (!App.schoolLoaded && API.token() && path !== '/login' && path !== '/apply') {
            try {
                const me = await API.get('/me');
                App.user = me.user;
                App.tenant = me.school;
                const s = (await API.get('/settings')).data;
                Object.assign(App.school, { name: s.school_name, address: s.school_address, phone: s.school_phone, logo_url: s.school_logo_url, currency: s.currency || 'PKR' });
            } catch (e) { /* handled by the page */ }
            const off = new Set((App.tenant?.disabled_modules || []).flatMap((m) => PORTAL_MODULES[m] || []));
            if (off.size) {
                ['parent', 'teacher'].forEach((k) => { for (let i = NAV[k].length - 1; i >= 0; i--) if (off.has(NAV[k][i][0])) NAV[k].splice(i, 1); });
                Router.routes = Router.routes.filter((r) => !off.has(r.pattern));
            }
            App.schoolLoaded = true;
        }
        return baseResolve.call(this);
    };
    const baseLogout = Pages.logout;
    Pages.logout = async () => { await baseLogout(); location.reload(); };
}
