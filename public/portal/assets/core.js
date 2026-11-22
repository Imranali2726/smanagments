/* ===========================================================
   School Portal — core: API client, UI helpers, router, layout,
   login and pages shared by parents, students and teachers.
   No build step and no dependencies.
   =========================================================== */
'use strict';

/* ---------------- icons ---------------- */
const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Z"/><circle cx="16" cy="14.5" r="1.3"/>',
    award: '<circle cx="12" cy="8.5" r="5.5"/><path d="M8.5 13 7 21.5l5-3 5 3-1.5-8.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    download: '<path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8.5 3 8.5H3S6 15 6 8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.1A8 8 0 1 1 21 12Z"/>',
    leave: '<path d="M8 3h8l4 4v14H4V3h4"/><path d="M9 12h6M9 16h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.8 3.5 5.7"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    send: '<path d="m22 2-11 11M22 2l-7 20-4-9-9-4z"/>',
    upload: '<path d="M12 21V9m0 0-4.5 4.5M12 9l4.5 4.5"/><path d="M4 7V4.5A1.5 1.5 0 0 1 5.5 3h13A1.5 1.5 0 0 1 20 4.5V7"/>',
    arrowLeft: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
    inbox: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 4h14l2 9v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
    cap: '<path d="M12 4 1.5 9 12 14l10.5-5z"/><path d="M6 11.5V16c0 1.7 2.7 3.5 6 3.5s6-1.8 6-3.5v-4.5M22.5 9v6"/>',
};
function icon(name, cls = '') {
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ---------------- small helpers ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
// Works at any address: http://localhost:8000/portal/ or http://localhost/myfolder/public/portal/
const ROOT = location.pathname.replace(/\/portal(\/.*)?$/, '');
const storageUrl = (path) => (path ? (/^https?:/.test(path) ? path : ROOT + '/storage/' + String(path).replace(/^\/+/, '')) : '');
const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fmt = {
    parse(d) { if (!d) return null; const s = String(d); return new Date(s.length === 10 ? s + 'T00:00:00' : s); },
    date(d) { const x = fmt.parse(d); return x && !isNaN(x) ? x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; },
    dateShort(d) { const x = fmt.parse(d); return x && !isNaN(x) ? x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'; },
    datetime(d) { const x = fmt.parse(d); return x && !isNaN(x) ? x.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; },
    relative(d) {
        const x = fmt.parse(d); if (!x) return '';
        const diff = (Date.now() - x.getTime()) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
        if (diff < 86400) return Math.floor(diff / 3600) + ' h ago';
        if (diff < 86400 * 7) return Math.floor(diff / 86400) + ' d ago';
        return fmt.date(d);
    },
    month(ym) { if (!ym) return '—'; const [y, m] = ym.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); },
    time(t) { if (!t) return ''; const [h, m] = String(t).split(':'); const H = +h; return `${((H + 11) % 12) + 1}:${m} ${H < 12 ? 'AM' : 'PM'}`; },
    money(v) { return (App.school.currency || 'PKR') + ' ' + Math.round(Number(v || 0)).toLocaleString('en-US'); },
    num(v) { const n = Number(v); return Number.isFinite(n) ? (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')) : '—'; },
    pct(v) { return v === null || v === undefined ? '—' : fmt.num(v) + '%'; },
    today() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; },
    thisMonth() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; },
    dayName(i) { return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i]; },
    todayName() { return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]; },
    cap(s) { s = String(s || '').replace(/_/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); },
};

const BADGE_TONES = {
    paid: 'ok', present: 'ok', approved: 'ok', submitted: 'ok', evaluated: 'brand', pass: 'ok', active: 'ok', resolved: 'ok',
    partial: 'warn', late: 'warn', pending: 'warn', 'awaiting verification': 'info',
    unpaid: 'bad', absent: 'bad', rejected: 'bad', overdue: 'bad', fail: 'bad',
    leave: 'info', cancelled: '', 'not submitted': '',
};
function badge(status, label) {
    const key = String(status || '').toLowerCase();
    return `<span class="badge ${BADGE_TONES[key] ?? ''}">${esc(label || fmt.cap(status))}</span>`;
}

function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, type === 'error' ? 5200 : 3200);
}

function loadingHtml() { return '<div class="loading"><div class="spinner"></div></div>'; }
function emptyHtml(title, text = '', ico = 'inbox') { return `<div class="empty">${icon(ico)}<b>${esc(title)}</b>${esc(text)}</div>`; }
function errorHtml(err) { return `<div class="alert bad">${icon('alert')}<div>${esc(err?.message || 'Something went wrong.')}</div></div>`; }

/** Modal dialog. Returns { el, close }. `onSubmit(form, close)` wires the form's submit if body contains a <form>. */
function modal({ title, body, foot = '', wide = false, onOpen } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
        <div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
        <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(wrap);
    const first = $('input:not([type=hidden]), select, textarea', wrap);
    if (first) setTimeout(() => first.focus(), 50);
    onOpen?.(wrap, close);
    return { el: wrap, close };
}

function confirmBox(message, { okText = 'Yes, continue', danger = false } = {}) {
    return new Promise((resolve) => {
        const m = modal({
            title: 'Please confirm',
            body: `<p>${esc(message)}</p>`,
            foot: `<button class="btn secondary" data-close>Cancel</button><button class="btn ${danger ? 'danger' : ''}" data-ok>${esc(okText)}</button>`,
        });
        let done = false;
        $('[data-ok]', m.el).onclick = () => { done = true; m.close(); resolve(true); };
        const obs = new MutationObserver(() => { if (!document.body.contains(m.el)) { obs.disconnect(); if (!done) resolve(false); } });
        obs.observe(document.body, { childList: true });
    });
}

/** Shows Laravel validation errors next to the matching fields. */
function showErrors(form, err) {
    $$('.field-error', form).forEach((e) => e.remove());
    $$('.is-invalid', form).forEach((e) => e.classList.remove('is-invalid'));
    const errors = err?.errors || {};
    let placed = false;
    for (const [key, msgs] of Object.entries(errors)) {
        const input = form.querySelector(`[name="${key}"]`) || form.querySelector(`[name="${key.split('.')[0]}"]`);
        if (input) {
            input.classList.add('is-invalid');
            const div = document.createElement('div');
            div.className = 'field-error';
            div.textContent = Array.isArray(msgs) ? msgs[0] : msgs;
            (input.closest('.field') || input.parentElement).appendChild(div);
            placed = true;
        }
    }
    if (!placed || !Object.keys(errors).length) toast(err?.message || 'Something went wrong.', 'error');
}

/** Runs an async action while showing a spinner in the button. */
async function busy(btn, fn) {
    if (!btn) return fn();
    const html = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner sm"></span>' + (btn.dataset.busy || 'Please wait…');
    try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = html; }
}

function formValues(form) {
    const out = {};
    for (const el of form.elements) {
        if (!el.name || el.type === 'file' || el.disabled) continue;
        if (el.type === 'checkbox') out[el.name] = el.checked;
        else if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; }
        else out[el.name] = el.value;
    }
    return out;
}

function options(list, { value = 'id', label = 'name', selected = '', placeholder = '' } = {}) {
    const ph = placeholder ? `<option value="">${esc(placeholder)}</option>` : '';
    return ph + list.map((o) => {
        const v = typeof value === 'function' ? value(o) : o[value];
        const l = typeof label === 'function' ? label(o) : o[label];
        return `<option value="${esc(v)}" ${String(v) === String(selected) ? 'selected' : ''}>${esc(l)}</option>`;
    }).join('');
}

function pagerHtml(page) {
    if (!page || !page.last_page || page.last_page <= 1) return '';
    return `<div class="pager"><span>Page ${page.current_page} of ${page.last_page} · ${page.total} items</span>
        <span class="flex"><button class="btn secondary sm" data-page="${page.current_page - 1}" ${page.current_page <= 1 ? 'disabled' : ''}>Previous</button>
        <button class="btn secondary sm" data-page="${page.current_page + 1}" ${page.current_page >= page.last_page ? 'disabled' : ''}>Next</button></span></div>`;
}
function bindPager(root, onPage) {
    $$('[data-page]', root).forEach((b) => (b.onclick = () => onPage(+b.dataset.page)));
}

/* ---------------- API client ---------------- */
class ApiError extends Error {
    constructor(message, status = 0, errors = {}) { super(message); this.status = status; this.errors = errors || {}; }
}

const API = {
    base: ROOT + '/api',
    token() { return localStorage.getItem('portal_token'); },

    async request(method, path, { params, body, raw } = {}) {
        let url = this.base + path;
        if (params) {
            const q = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
            const s = q.toString();
            if (s) url += (url.includes('?') ? '&' : '?') + s;
        }
        const headers = { Accept: 'application/json' };
        if (this.token()) headers.Authorization = 'Bearer ' + this.token();
        let payload;
        if (body instanceof FormData) payload = body;
        else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

        let res;
        try { res = await fetch(url, { method, headers, body: payload }); } catch (e) {
            throw new ApiError('Cannot reach the server. Please check your connection.');
        }

        if (res.status === 401 && path !== '/login') {
            Auth.clear();
            Router.navigate('/login');
            throw new ApiError('Your session has expired. Please log in again.', 401);
        }
        if (raw && res.ok) return res;

        const data = res.status === 204 ? null : await res.json().catch(() => null);
        if (!res.ok) throw new ApiError(data?.message || `Request failed (${res.status}).`, res.status, data?.errors);
        return data;
    },
    get(path, params) { return this.request('GET', path, { params }); },
    post(path, body) { return this.request('POST', path, { body: body ?? {} }); },
    put(path, body) { return this.request('PUT', path, { body: body ?? {} }); },
    del(path) { return this.request('DELETE', path); },

    /** Downloads a protected file (PDF/CSV) with the auth header. */
    async download(path, params, fallbackName = 'download') {
        const res = await this.request('GET', path, { params, raw: true });
        const blob = await res.blob();
        const cd = res.headers.get('Content-Disposition') || '';
        const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = m ? decodeURIComponent(m[1]) : fallbackName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    },
};

/* ---------------- auth ---------------- */
const Auth = {
    save(token, user) { localStorage.setItem('portal_token', token); App.user = user; },
    clear() { localStorage.removeItem('portal_token'); App.user = null; App.children = []; App.child = null; App.tscope = null; App.shellRendered = false; },
    portalFor(role) { return ['parent', 'student'].includes(role) ? 'parent' : role === 'teacher' ? 'teacher' : null; },
};

/* ---------------- router ---------------- */
const Router = {
    routes: [],
    add(portal, pattern, title, render) {
        const keys = [];
        const rx = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
        this.routes.push({ portal, pattern, title, render, rx, keys });
    },
    navigate(path) { if (location.hash !== '#' + path) location.hash = '#' + path; else this.resolve(); },
    current() {
        const raw = location.hash.slice(1) || '/';
        const [path, qs] = raw.split('?');
        return { path, query: Object.fromEntries(new URLSearchParams(qs || '')) };
    },
    async resolve() {
        const { path, query } = this.current();
        const token = API.token();

        // Public pages
        if (path === '/login') return token && App.user ? this.navigate('/') : Pages.login();
        if (path === '/apply') return Pages.apply();
        if (!token) return this.navigate('/login');

        if (!App.user) {
            try { App.user = (await API.get('/me')).user; } catch (e) { return; }
        }
        const portal = Auth.portalFor(App.user.role);
        if (!portal) return Pages.wrongRole();

        if (portal === 'parent' && !App.children.length) await ParentPortal.loadChildren();
        if (portal === 'teacher') TeacherPortal.scope().catch(() => {});

        const route = this.routes.find((r) => (r.portal === portal || r.portal === 'shared') && r.rx.test(path));
        if (!route) return this.navigate('/');
        const params = {};
        const m = path.match(route.rx);
        route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));

        Layout.render(portal);
        Layout.setActive(path, route.title);
        // Fresh container per navigation: a slow page that finishes after the user moved on
        // writes into the detached old element instead of over the new page.
        const old = $('#view');
        const view = old.cloneNode(false);
        old.replaceWith(view);
        view.innerHTML = loadingHtml();
        window.scrollTo(0, 0);
        try {
            await route.render(view, params, query);
        } catch (e) {
            if (e.status !== 401) view.innerHTML = errorHtml(e);
            console.error(e);
        }
    },
};

/* ---------------- layout ---------------- */
const NAV = {
    parent: [
        ['/', 'Home', 'home'],
        ['/attendance', 'Attendance', 'check'],
        ['/fees', 'Fees', 'wallet'],
        ['/results', 'Results', 'award'],
        ['/exam-schedule', 'Exam Schedule', 'calendar'],
        ['/timetable', 'Timetable', 'clock'],
        ['/homework', 'Homework', 'book'],
        ['/downloads', 'Downloads', 'download'],
        ['section', 'Communication'],
        ['/notices', 'Notices', 'bell'],
        ['/messages', 'Messages', 'chat', 'msg'],
        ['/leave', 'Leave Requests', 'leave'],
        ['/account', 'My Account', 'user'],
    ],
    teacher: [
        ['/', 'Home', 'home'],
        ['/attendance', 'Attendance', 'check'],
        ['/marks', 'Marks Entry', 'clipboard'],
        ['/results', 'Results', 'award'],
        ['/homework', 'Homework', 'book'],
        ['/downloads', 'Download Center', 'upload'],
        ['/timetable', 'My Timetable', 'clock'],
        ['section', 'Communication'],
        ['/notices', 'Notices', 'bell'],
        ['/messages', 'Messages', 'chat', 'msg'],
        ['/leave', 'Leave', 'leave'],
        ['/account', 'My Account', 'user'],
    ],
};

const Layout = {
    render(portal) {
        if (App.shellRendered === portal) return;
        App.shellRendered = portal;
        const u = App.user;
        const nav = NAV[portal].map((n) => n[0] === 'section'
            ? `<div class="nav-section">${esc(n[1])}</div>`
            : `<a href="#${n[0]}" data-path="${n[0]}">${icon(n[2])}<span>${esc(n[1])}</span>${n[3] ? '<span class="count hidden" data-count="msg"></span>' : ''}</a>`).join('');

        $('#app').innerHTML = `
        <div class="shell">
            <aside class="sidebar" id="sidebar">
                <div class="brand-row">${brandLogo()}<span>${esc(App.school.name || 'School Portal')}<small>${portal === 'teacher' ? 'Teacher Portal' : (u.role === 'student' ? 'Student Portal' : 'Parent Portal')}</small></span></div>
                <nav class="nav">${nav}</nav>
                <div class="sidebar-foot">
                    <div class="user-chip"><div class="avatar">${u.avatar ? `<img src="${esc(storageUrl(u.avatar))}" alt="">` : esc(initials(u.name))}</div>
                        <div class="grow"><div class="name">${esc(u.name)}</div><div class="role">${esc(u.role)}</div></div>
                        <button class="icon-btn" id="logoutBtn" title="Log out" style="background:transparent;border-color:rgba(255,255,255,.15);color:#c4d6d3">${icon('logout')}</button>
                    </div>
                </div>
            </aside>
            <div class="scrim" id="scrim"></div>
            <div class="main">
                <header class="topbar">
                    <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">${icon('menu')}</button>
                    <h1 id="pageTitle"></h1>
                    <div id="topExtra"></div>
                    <a class="icon-btn bell-link" href="#/notices" title="Notices">${icon('bell')}</a>
                    <a class="icon-btn" href="#/messages" title="Messages">${icon('chat')}<span class="dot hidden" data-count="msg"></span></a>
                </header>
                <main class="content" id="view"></main>
            </div>
        </div>`;

        const close = () => { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('open'); };
        $('#menuBtn').onclick = () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('open'); };
        $('#scrim').onclick = close;
        $$('.nav a').forEach((a) => a.addEventListener('click', close));
        $('#logoutBtn').onclick = Pages.logout;

        if (portal === 'parent') ParentPortal.renderSwitcher();
        Layout.refreshUnread();
        clearInterval(App.unreadTimer);
        App.unreadTimer = setInterval(Layout.refreshUnread, 60000);
    },
    setActive(path, title) {
        $('#pageTitle').textContent = title;
        document.title = `${title} · ${App.school.name || 'School Portal'}`;
        const base = '/' + (path.split('/')[1] || '');
        $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.path === base));
    },
    async refreshUnread() {
        if (!API.token()) return;
        try {
            const { count } = await API.get('/messages/unread-count');
            $$('[data-count="msg"]').forEach((el) => { el.textContent = count > 99 ? '99+' : count; el.classList.toggle('hidden', !count); });
        } catch (e) { /* ignore */ }
    },
};

function brandLogo() {
    return `<div class="brand-logo">${App.school.logo_url ? `<img src="${esc(App.school.logo_url)}" alt="">` : icon('cap')}</div>`;
}

/* ---------------- app ---------------- */
const App = {
    user: null, school: {}, children: [], child: null, tscope: null, shellRendered: false, unreadTimer: null,

    async start() {
        try {
            const info = await API.get('/public/admission-form');
            App.school = { ...(info.school || {}), currency: info.currency || 'PKR', admissionOpen: info.open, classes: info.classes || [] };
        } catch (e) { App.school = { name: 'School Portal', currency: 'PKR' }; }
        window.addEventListener('hashchange', () => Router.resolve());
        Router.resolve();
    },
};

/* ===========================================================
   Pages shared by every portal
   =========================================================== */
const Pages = {
    login() {
        App.shellRendered = false;
        document.title = 'Sign in · ' + (App.school.name || 'School Portal');
        $('#app').innerHTML = `
        <div class="auth">
            <section class="auth-art">
                <div class="brand-row">${brandLogo()}<span>${esc(App.school.name || 'School Portal')}</span></div>
                <div>
                    <h1>Stay connected with your school, every day.</h1>
                    <p>One login for parents, students and teachers.</p>
                    <ul>
                        <li>Attendance, results and report cards</li>
                        <li>Fee vouchers, receipts and online payment</li>
                        <li>Homework, timetable and downloads</li>
                        <li>Notices and direct messages with teachers</li>
                    </ul>
                </div>
                <small class="art-foot" style="color:rgba(255,255,255,.6)">${esc(App.school.address || '')}${App.school.phone ? ' · ' + esc(App.school.phone) : ''}</small>
            </section>
            <section class="auth-form">
                <div class="auth-card">
                    <h2>Sign in</h2>
                    <p class="sub">Use the email and password given by the school.</p>
                    <form class="form" id="loginForm" novalidate>
                        <label class="field"><span>Email</span><input name="email" type="email" autocomplete="username" required></label>
                        <label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
                        <button class="btn block" type="submit" data-busy="Signing in…">Sign in</button>
                    </form>
                    <div class="auth-footer">
                        ${App.school.admissionOpen !== false ? `New to the school? <a href="#/apply">Apply for admission online</a><br>` : ''}
                        Forgot your password? Please contact the school office.
                    </div>
                    <div class="powered"><img src="../brand/aas-logo.svg" alt="">Powered by <b>AAS School Manager</b></div>
                </div>
            </section>
        </div>`;
        const form = $('#loginForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const v = formValues(form);
            await busy($('button[type=submit]', form), async () => {
                try {
                    const res = await API.post('/login', { email: v.email.trim(), password: v.password, device_name: 'portal' });
                    if (!Auth.portalFor(res.user.role)) {
                        showErrors(form, { errors: { email: ['This portal is for parents, students and teachers. Staff accounts use the admin panel.'] } });
                        // Revoke the token we just received (it was never stored).
                        fetch(API.base + '/logout', { method: 'POST', headers: { Accept: 'application/json', Authorization: 'Bearer ' + res.token } }).catch(() => {});
                        return;
                    }
                    Auth.save(res.token, res.user);
                    App.children = [];
                    Router.navigate('/');
                } catch (err) { showErrors(form, err); }
            });
        };
    },

    wrongRole() {
        $('#app').innerHTML = `<div class="auth-form" style="min-height:100vh"><div class="auth-card card card-pad center">
            ${emptyHtml('Wrong portal', 'This portal is for parents, students and teachers only.', 'alert')}
            <button class="btn" id="out">Log out</button></div></div>`;
        $('#out').onclick = Pages.logout;
    },

    async logout() {
        try { await API.post('/logout'); } catch (e) { /* ignore */ }
        Auth.clear();
        clearInterval(App.unreadTimer);
        Router.navigate('/login');
    },

    /* ---------- public online admission ---------- */
    apply() {
        App.shellRendered = false;
        document.title = 'Online Admission · ' + (App.school.name || 'School');
        const open = App.school.admissionOpen !== false;
        $('#app').innerHTML = `
        <div style="max-width:860px;margin:0 auto;padding:1.5rem 1rem 3rem">
            <div class="flex between mb"><div class="brand-row" style="color:var(--ink)"><div class="brand-logo" style="background:var(--brand);color:#fff">${App.school.logo_url ? `<img src="${esc(App.school.logo_url)}" alt="">` : icon('cap')}</div>${esc(App.school.name || 'School')}</div>
            <a class="btn secondary sm" href="#/login">${icon('arrowLeft')} Sign in</a></div>
            <div class="card">
                <div class="card-head"><div><h2>Online Admission Form</h2><small>Fill in the details below. The school will contact you after reviewing the application.</small></div></div>
                <div class="card-body">${open ? '' : '<div class="alert warn mb">Online admissions are closed at the moment. Please contact the school office.</div>'}
                <form class="form" id="applyForm" ${open ? '' : 'hidden'}>
                    <h3>Student</h3>
                    <div class="form-row">
                        <label class="field"><span>First name <em>*</em></span><input name="first_name" required></label>
                        <label class="field"><span>Last name</span><input name="last_name"></label>
                    </div>
                    <div class="form-row">
                        <label class="field"><span>Gender <em>*</em></span><select name="gender" required><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></label>
                        <label class="field"><span>Date of birth</span><input name="date_of_birth" type="date" max="${fmt.today()}"></label>
                    </div>
                    <div class="form-row">
                        <label class="field"><span>Class applying for <em>*</em></span><select name="school_class_id" required>${options(App.school.classes || [], { placeholder: 'Select class' })}</select></label>
                        <label class="field"><span>B-Form / CNIC no.</span><input name="b_form" placeholder="35202-1234567-1"></label>
                    </div>
                    <div class="form-row">
                        <label class="field"><span>Previous school</span><input name="previous_school"></label>
                        <label class="field"><span>Student photo</span><input name="photo" type="file" accept="image/*"></label>
                    </div>
                    <hr><h3>Parent / Guardian</h3>
                    <div class="form-row">
                        <label class="field"><span>Name <em>*</em></span><input name="guardian_name" required></label>
                        <label class="field"><span>Relation</span><select name="guardian_relation"><option>Father</option><option>Mother</option><option>Guardian</option></select></label>
                    </div>
                    <div class="form-row">
                        <label class="field"><span>Mobile number <em>*</em></span><input name="guardian_phone" type="tel" placeholder="03XX-XXXXXXX" required></label>
                        <label class="field"><span>Email</span><input name="guardian_email" type="email"></label>
                    </div>
                    <div class="form-row">
                        <label class="field"><span>CNIC</span><input name="guardian_cnic"></label>
                        <label class="field"><span>Occupation</span><input name="guardian_occupation"></label>
                    </div>
                    <label class="field"><span>Home address</span><textarea name="address" rows="2"></textarea></label>
                    <label class="field"><span>Anything else we should know?</span><textarea name="notes" rows="2"></textarea></label>
                    <div><button class="btn" type="submit" data-busy="Submitting…">${icon('send')} Submit application</button></div>
                </form></div>
            </div>
            <div class="card mt">
                <div class="card-head"><h2>Check application status</h2></div>
                <div class="card-body"><form class="toolbar" id="statusForm">
                    <label class="field"><span>Application no.</span><input name="application_no" placeholder="APP-2026-00001" required></label>
                    <label class="field"><span>Mobile number</span><input name="guardian_phone" required></label>
                    <button class="btn secondary" type="submit">Check</button>
                </form><div id="statusOut" class="mt-s"></div></div>
            </div>
        </div>`;

        const form = $('#applyForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            await busy($('button[type=submit]', form), async () => {
                try {
                    const res = await API.post('/public/admission-applications', new FormData(form));
                    $('.card-body', form.closest('.card')).innerHTML = `<div class="alert ok">${icon('check')}<div><b>Application submitted.</b><br>
                        Your application number is <b>${esc(res.application_no)}</b>. Please keep it to check the status. The school will contact you soon.</div></div>`;
                    window.scrollTo(0, 0);
                } catch (err) { showErrors(form, err); }
            });
        };
        $('#statusForm').onsubmit = async (e) => {
            e.preventDefault();
            const out = $('#statusOut');
            try {
                const { data } = await API.get('/public/admission-applications/status', formValues(e.target));
                out.innerHTML = `<div class="alert info"><div><b>${esc(data.first_name)} ${esc(data.last_name || '')}</b> — ${esc(data.class || '')}<br>
                    Status: ${badge(data.status)} ${data.remarks ? '<br>' + esc(data.remarks) : ''}</div></div>`;
            } catch (err) { out.innerHTML = errorHtml(err.status === 404 ? { message: 'No application found with these details.' } : err); }
        };
    },

    /* ---------- notices ---------- */
    async notices(view, params, query) {
        const page = +(query.page || 1);
        const res = await API.get('/notices/feed', { page, per_page: 15 });
        view.innerHTML = `<div class="card">
            ${res.data.length ? `<ul class="list">${res.data.map((n) => `
                <li><div class="item-row"><div class="date-tile"><b>${fmt.parse(n.publish_date).getDate()}</b><span>${fmt.parse(n.publish_date).toLocaleDateString('en-GB', { month: 'short' })}</span></div>
                <div class="grow"><div class="flex between"><span class="title">${esc(n.title)}</span>${n.audience !== 'all' ? badge('info', fmt.cap(n.audience)) : ''}</div>
                <div class="pre clamp" data-body>${esc(n.body)}</div>
                <small>${n.creator ? 'By ' + esc(n.creator.name) + ' · ' : ''}${fmt.date(n.publish_date)}</small></div></div></li>`).join('')}</ul>`
            : emptyHtml('No notices', 'School announcements will appear here.', 'bell')}
            ${pagerHtml(res)}</div>`;
        $$('[data-body]', view).forEach((b) => (b.onclick = () => b.classList.toggle('clamp')));
        bindPager(view, (p) => Router.navigate('/notices?page=' + p));
    },

    /* ---------- messages ---------- */
    async messages(view, params, query) {
        const box = query.box || 'inbox';
        const res = await API.get('/messages', { box, page: query.page || 1 });
        const me = App.user.id;
        view.innerHTML = `
            <div class="page-head"><div class="tabs" style="margin:0;border:0">
                <button data-box="inbox" class="${box === 'inbox' ? 'active' : ''}">Inbox</button>
                <button data-box="sent" class="${box === 'sent' ? 'active' : ''}">Sent</button></div>
                <button class="btn" id="composeBtn">${icon('plus')} New message</button></div>
            <div class="card">
            ${res.data.length ? `<ul class="list clickable">${res.data.map((m) => {
                const other = m.sender_id === me ? m.receiver : m.sender;
                const unread = (m.receiver_id === me && !m.read_at) || m.unread_replies > 0;
                return `<li data-id="${m.id}" class="${unread ? 'unread' : ''}"><div class="item-row">
                    <div class="avatar">${esc(initials(other?.name))}</div>
                    <div class="grow"><div class="flex between"><span class="title">${esc(other?.name || 'Unknown')} <small>· ${esc(fmt.cap(other?.role))}</small></span><small class="nowrap">${fmt.relative(m.updated_at)}</small></div>
                    <div class="flex">${unread ? '<span class="unread-dot"></span>' : ''}<span class="clamp">${m.subject ? '<b>' + esc(m.subject) + '</b> — ' : ''}${esc(m.body)}</span></div></div></div></li>`;
            }).join('')}</ul>` : emptyHtml('No messages yet', box === 'inbox' ? 'Messages from teachers and the school will appear here.' : 'Messages you send will appear here.', 'chat')}
            ${pagerHtml(res)}</div>`;
        $$('[data-box]', view).forEach((b) => (b.onclick = () => Router.navigate('/messages?box=' + b.dataset.box)));
        $$('[data-id]', view).forEach((li) => (li.onclick = () => Router.navigate('/messages/' + li.dataset.id)));
        bindPager(view, (p) => Router.navigate(`/messages?box=${box}&page=${p}`));
        $('#composeBtn', view).onclick = () => Pages.compose();
    },

    async compose(preselect) {
        const m = modal({ title: 'New message', body: loadingHtml() });
        try {
            const { data: contacts } = await API.get('/messages/contacts');
            const label = (c) => `${c.name} (${fmt.cap(c.role)})`;
            $('.modal-body', m.el).innerHTML = `<form class="form" id="msgForm">
                <label class="field"><span>To <em>*</em></span><select name="receiver_id" required>${options(contacts, { label, placeholder: contacts.length ? 'Select a person' : 'No contacts available', selected: preselect })}</select></label>
                <label class="field"><span>Subject</span><input name="subject" maxlength="255"></label>
                <label class="field"><span>Message <em>*</em></span><textarea name="body" rows="5" required></textarea></label>
                <div class="flex" style="justify-content:flex-end"><button class="btn secondary" type="button" data-close>Cancel</button><button class="btn" type="submit" data-busy="Sending…">${icon('send')} Send</button></div></form>`;
            const form = $('#msgForm', m.el);
            form.onsubmit = async (e) => {
                e.preventDefault();
                await busy($('button[type=submit]', form), async () => {
                    try {
                        const res = await API.post('/messages', formValues(form));
                        m.close();
                        toast('Message sent.');
                        Router.navigate('/messages/' + res.data.id);
                    } catch (err) { showErrors(form, err); }
                });
            };
        } catch (err) { $('.modal-body', m.el).innerHTML = errorHtml(err); }
    },

    async thread(view, params) {
        const res = await API.get('/messages/' + params.id);
        const root = res.data;
        const me = App.user.id;
        const other = root.sender_id === me ? root.receiver : root.sender;
        const all = [root, ...res.replies];
        view.innerHTML = `
            <div class="page-head"><div><a href="#/messages" class="btn ghost sm">${icon('arrowLeft')} Messages</a>
                <h2 class="mt-s">${esc(root.subject || 'Conversation')}</h2><p>with ${esc(other?.name)} · ${esc(fmt.cap(other?.role))}</p></div></div>
            <div class="card card-pad"><div class="thread">${all.map((m) => `
                <div class="bubble ${m.sender_id === me ? 'mine' : ''}"><div class="who"><b>${esc(m.sender_id === me ? 'You' : (m.sender?.name || other?.name))}</b><span>${fmt.datetime(m.created_at)}</span></div>
                <div class="pre">${esc(m.body)}</div></div>`).join('')}</div>
            <form class="form mt" id="replyForm"><label class="field"><span>Reply</span><textarea name="body" rows="3" required placeholder="Write your reply…"></textarea></label>
            <div><button class="btn" type="submit" data-busy="Sending…">${icon('send')} Send reply</button></div></form></div>`;
        Layout.refreshUnread();
        const form = $('#replyForm', view);
        form.onsubmit = async (e) => {
            e.preventDefault();
            await busy($('button[type=submit]', form), async () => {
                try {
                    await API.post('/messages', { parent_id: root.id, body: form.body.value });
                    toast('Reply sent.');
                    Pages.thread(view, params);
                } catch (err) { showErrors(form, err); }
            });
        };
    },

    /* ---------- leave ---------- */
    async leave(view, params, query) {
        const isParent = App.user.role === 'parent';
        const res = await API.get('/leave-requests', { page: query.page || 1 });
        view.innerHTML = `
            <div class="page-head"><div><p>${isParent ? 'Apply for leave for your child. The school will approve or reject the request.' : 'Apply for leave and track approval.'}</p></div>
                <button class="btn" id="applyLeave">${icon('plus')} Apply for leave</button></div>
            <div class="card"><div class="table-wrap">${res.data.length ? `<table class="table"><thead><tr>
                ${isParent ? '<th>Student</th>' : ''}<th>Type</th><th>From</th><th>To</th><th class="num">Days</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>
                ${res.data.map((l) => `<tr>${isParent ? `<td>${esc(l.student ? (l.student.first_name + ' ' + (l.student.last_name || '')) : '')}</td>` : ''}
                    <td>${esc(l.leave_type?.name || 'General')}</td><td class="nowrap">${fmt.date(l.from_date)}</td><td class="nowrap">${fmt.date(l.to_date)}</td><td class="num">${l.days}</td>
                    <td><span class="clamp">${esc(l.reason)}</span>${l.remarks ? `<small>Remarks: ${esc(l.remarks)}</small>` : ''}</td><td>${badge(l.status)}</td>
                    <td class="right">${l.status === 'pending' && l.applied_by === App.user.id ? `<button class="btn ghost sm" data-cancel="${l.id}">Cancel</button>` : ''}</td></tr>`).join('')}
                </tbody></table>` : emptyHtml('No leave requests', 'Requests you submit will appear here.', 'leave')}</div>${pagerHtml(res)}</div>`;
        bindPager(view, (p) => Router.navigate('/leave?page=' + p));
        $$('[data-cancel]', view).forEach((b) => (b.onclick = async () => {
            if (!(await confirmBox('Cancel this leave request?'))) return;
            try { await API.post(`/leave-requests/${b.dataset.cancel}/cancel`); toast('Leave request cancelled.'); Pages.leave(view, params, query); } catch (err) { toast(err.message, 'error'); }
        }));
        $('#applyLeave', view).onclick = () => Pages.applyLeave(() => Pages.leave(view, params, query));
    },

    async applyLeave(onDone) {
        const isParent = App.user.role === 'parent';
        const m = modal({ title: 'Apply for leave', body: loadingHtml() });
        let types = [];
        try { types = (await API.get('/leave-types', { all: 1 })).data; } catch (e) { /* optional */ }
        const forWho = isParent || App.user.role === 'student' ? ['student', 'both'] : ['staff', 'both'];
        types = types.filter((t) => forWho.includes(t.applies_to));
        $('.modal-body', m.el).innerHTML = `<form class="form" id="leaveForm">
            ${isParent ? `<label class="field"><span>Student <em>*</em></span><select name="student_id" required>${options(App.children, { label: 'full_name', selected: App.child?.id })}</select></label>` : ''}
            <label class="field"><span>Leave type</span><select name="leave_type_id">${options(types, { label: (t) => t.name + (t.days_allowed ? ` (${t.days_allowed} days/year)` : ''), placeholder: 'General' })}</select></label>
            <div class="form-row"><label class="field"><span>From <em>*</em></span><input type="date" name="from_date" value="${fmt.today()}" required></label>
            <label class="field"><span>To <em>*</em></span><input type="date" name="to_date" value="${fmt.today()}" required></label></div>
            <label class="field"><span>Reason <em>*</em></span><textarea name="reason" rows="3" required></textarea></label>
            <label class="field"><span>Attachment (e.g. medical certificate)</span><input type="file" name="attachment"></label>
            <div class="flex" style="justify-content:flex-end"><button class="btn secondary" type="button" data-close>Cancel</button><button class="btn" type="submit" data-busy="Submitting…">Submit request</button></div></form>`;
        const form = $('#leaveForm', m.el);
        form.onsubmit = async (e) => {
            e.preventDefault();
            await busy($('button[type=submit]', form), async () => {
                try {
                    const fd = new FormData(form);
                    if (!fd.get('leave_type_id')) fd.delete('leave_type_id');
                    if (fd.get('attachment') && !fd.get('attachment').size) fd.delete('attachment');
                    await API.post('/leave-requests', fd);
                    m.close();
                    toast('Leave request submitted.');
                    onDone?.();
                } catch (err) { showErrors(form, err); }
            });
        };
    },

    /* ---------- account ---------- */
    async account(view) {
        const u = App.user;
        view.innerHTML = `<div class="grid-2">
            <div class="card"><div class="card-head"><h2>Profile</h2></div><div class="card-body">
                <div class="flex mb"><div class="avatar lg">${u.avatar ? `<img src="${esc(storageUrl(u.avatar))}" alt="">` : esc(initials(u.name))}</div>
                <div><h2>${esc(u.name)}</h2><small>${esc(u.email)} · ${esc(fmt.cap(u.role))}</small></div></div>
                <form class="form" id="profileForm">
                    <label class="field"><span>Name</span><input name="name" value="${esc(u.name)}" required></label>
                    <label class="field"><span>Phone</span><input name="phone" value="${esc(u.phone || '')}"></label>
                    <label class="field"><span>Profile photo</span><input name="avatar" type="file" accept="image/*"></label>
                    <div><button class="btn" type="submit" data-busy="Saving…">Save profile</button></div>
                </form></div></div>
            <div class="card"><div class="card-head"><h2>Change password</h2></div><div class="card-body">
                <form class="form" id="pwForm">
                    <label class="field"><span>Current password</span><input name="current_password" type="password" autocomplete="current-password" required></label>
                    <label class="field"><span>New password</span><input name="password" type="password" minlength="8" autocomplete="new-password" required></label>
                    <label class="field"><span>Confirm new password</span><input name="password_confirmation" type="password" autocomplete="new-password" required></label>
                    <div><button class="btn" type="submit" data-busy="Updating…">Update password</button></div>
                </form>
                <hr><button class="btn secondary" id="logoutAll">${icon('logout')} Log out of all devices</button></div></div></div>`;

        const pf = $('#profileForm', view);
        pf.onsubmit = async (e) => {
            e.preventDefault();
            await busy($('button[type=submit]', pf), async () => {
                try {
                    const fd = new FormData(pf);
                    if (!fd.get('avatar')?.size) fd.delete('avatar');
                    const res = await API.post('/profile', fd);
                    App.user = { ...App.user, ...res.user };
                    App.shellRendered = false;
                    toast('Profile updated.');
                    Router.resolve();
                } catch (err) { showErrors(pf, err); }
            });
        };
        const pw = $('#pwForm', view);
        pw.onsubmit = async (e) => {
            e.preventDefault();
            await busy($('button[type=submit]', pw), async () => {
                try { await API.post('/change-password', formValues(pw)); pw.reset(); toast('Password changed.'); } catch (err) { showErrors(pw, err); }
            });
        };
        $('#logoutAll', view).onclick = async () => {
            if (!(await confirmBox('Log out from every device, including this one?'))) return;
            try { await API.post('/logout-all'); } catch (e) { /* ignore */ }
            Auth.clear();
            Router.navigate('/login');
        };
    },
};

Router.add('shared', '/notices', 'Notices', Pages.notices);
Router.add('shared', '/messages', 'Messages', Pages.messages);
Router.add('shared', '/messages/:id', 'Conversation', Pages.thread);
Router.add('shared', '/leave', 'Leave Requests', Pages.leave);
Router.add('shared', '/account', 'My Account', Pages.account);
