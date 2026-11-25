/* ===========================================================
   School Admin Panel. No build step and no dependencies.
   Helpers below are copied from ../portal/assets/core.js.
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
const ROOT = location.pathname.replace(/\/admin(\/.*)?$/, '');
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
    token() { return localStorage.getItem('admin_token'); },

    async request(method, path, { params, body, raw } = {}) {
        let url = this.base + path;
        if (params) {
            const q = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
            const s = q.toString();
            if (s) url += (url.includes('?') ? '&' : '?') + s;
        }
        const headers = { Accept: 'application/json' };
        // Group owners working inside one campus send which campus (multi-campus).
        try { const campus = localStorage.getItem('aas_campus'); if (campus) headers['X-Campus'] = campus; } catch (e) { /* storage unavailable */ }
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


/* ===========================================================
   Admin panel — auth, router, layout and pages
   =========================================================== */
Object.assign(ICONS, {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
});

const Auth = {
    save(token, user) { localStorage.setItem('admin_token', token); App.user = user; },
    clear() { localStorage.removeItem('admin_token'); App.user = null; App.shellRendered = false; },
};

/* ---------------- shared lookups (cached) ---------------- */
const Lookups = {
    _c: {},
    async get(key, loader) { if (!this._c[key]) this._c[key] = loader().catch((e) => { delete this._c[key]; throw e; }); return this._c[key]; },
    reset(...keys) { keys.forEach((k) => delete this._c[k]); },
    classes() { return this.get('classes', async () => (await API.get('/classes', { all: 1 })).data); },
    async sections() {
        const classes = await this.classes();
        return classes.flatMap((c) => (c.sections || []).map((s) => ({ ...s, label: `${c.name} – ${s.name}`, class_name: c.name })));
    },
    sessions() { return this.get('sessions', async () => (await API.get('/academic-sessions', { all: 1 })).data); },
    guardians() { return this.get('guardians', async () => (await API.get('/guardians', { all: 1 })).data); },
    teachers() { return this.get('teachers', async () => (await API.get('/teachers', { all: 1 })).data); },
};

/* ---------------- router ---------------- */
const Router = {
    routes: [],
    add(pattern, title, render) {
        const keys = [];
        const rx = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
        this.routes.push({ pattern, title, render, rx, keys });
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
        if (path === '/login') return token && App.user ? this.navigate('/') : Pages.login();
        if (!token) return this.navigate('/login');
        if (!App.user) {
            try { App.user = (await API.get('/me')).user; } catch (e) { return; }
        }
        if (!['admin', 'super_admin', 'owner'].includes(App.user.role)) return Pages.wrongRole();

        const route = this.routes.find((r) => r.rx.test(path));
        if (!route) return this.navigate('/');
        const params = {};
        const m = path.match(route.rx);
        route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));

        Layout.render();
        Layout.setActive(path, route.title);
        const old = $('#view');
        const view = old.cloneNode(false);
        old.replaceWith(view);
        view.innerHTML = loadingHtml();
        window.scrollTo(0, 0);
        try { await route.render(view, params, query); } catch (e) {
            if (e.status !== 401) view.innerHTML = errorHtml(e);
            console.error(e);
        }
    },
};
const go = (path, q) => Router.navigate(path + (q ? '?' + new URLSearchParams(Object.entries(q).filter(([, v]) => v !== '' && v != null)) : ''));

/* ---------------- layout ---------------- */
const NAV = [
    ['/', 'Dashboard', 'grid'],
    ['section', 'Academics'],
    ['/students', 'Students', 'users'],
    ['/teachers', 'Teachers & Staff', 'user'],
    ['/classes', 'Classes & Sections', 'layers'],
    ['/attendance', 'Attendance', 'check'],
    ['section', 'Office'],
    ['/fees', 'Fees', 'wallet'],
    ['/admissions', 'Admissions', 'cap', 'adm'],
    ['/leaves', 'Leave Requests', 'leave', 'leave'],
];

const Layout = {
    render() {
        if (App.shellRendered) return;
        App.shellRendered = true;
        const u = App.user;
        const nav = NAV.map((n) => n[0] === 'section'
            ? `<div class="nav-section">${esc(n[1])}</div>`
            : `<a href="#${n[0]}" data-path="${n[0]}">${icon(n[2])}<span>${esc(n[1])}</span>${n[3] ? `<span class="count hidden" data-count="${n[3]}"></span>` : ''}</a>`).join('');
        $('#app').innerHTML = `
        <div class="shell">
            <aside class="sidebar" id="sidebar">
                <div class="brand-row">${brandLogo()}<span>${brandName()}<small>${esc(App.school.name || 'School')} · Admin</small></span></div>
                <nav class="nav">${nav}</nav>
                <div class="sidebar-foot">
                    <div class="user-chip"><div class="avatar">${esc(initials(u.name))}</div>
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
                    <a class="btn secondary sm" href="../portal/" target="_blank">Open portal</a>
                </header>
                <main class="content" id="view"></main>
            </div>
        </div>`;
        const close = () => { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('open'); };
        $('#menuBtn').onclick = () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('open'); };
        $('#scrim').onclick = close;
        $$('.nav a').forEach((a) => a.addEventListener('click', close));
        $('#logoutBtn').onclick = Pages.logout;
        Layout.refreshCounts();
    },
    setActive(path, title) {
        $('#pageTitle').textContent = title;
        document.title = `${title} · ${BRAND.name}`;
        const base = '/' + (path.split('/')[1] || '');
        $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.path === base));
    },
    setCount(key, n) {
        $$(`[data-count="${key}"]`).forEach((el) => { el.textContent = n > 99 ? '99+' : n; el.classList.toggle('hidden', !n); });
    },
    async refreshCounts() {
        try {
            const d = await API.get('/dashboard');
            Layout.setCount('adm', d.pending?.admission_applications || 0);
            Layout.setCount('leave', d.pending?.leave_requests || 0);
        } catch (e) { /* ignore */ }
    },
};

const BRAND = { name: 'AAS School Manager', logo: '../brand/aas-logo.svg' };
function brandLogo() {
    return `<div class="brand-logo aas"><img src="${BRAND.logo}" alt="AAS"></div>`;
}
const brandName = () => `<span class="aas-name">AAS <b>School</b> Manager</span>`;

const App = {
    user: null, school: {}, shellRendered: false,
    async start() {
        try {
            const info = await API.get('/public/admission-form');
            App.school = { ...(info.school || {}), currency: info.currency || 'PKR' };
        } catch (e) { App.school = { name: 'School', currency: 'PKR' }; }
        window.addEventListener('hashchange', () => Router.resolve());
        Router.resolve();
    },
};

/** Small helper: a form inside a modal that posts to the API. */
function formModal({ title, fields, wide = false, submitText = 'Save', onSubmit }) {
    const m = modal({
        title, wide,
        body: `<form class="form" novalidate>${fields}<div class="modal-foot" style="padding:0;border:0;margin-top:.5rem">
            <button type="button" class="btn secondary" data-close>Cancel</button>
            <button type="submit" class="btn" data-busy="Saving…">${esc(submitText)}</button></div></form>`,
    });
    const form = $('form', m.el);
    form.onsubmit = (e) => {
        e.preventDefault();
        busy($('button[type=submit]', form), async () => {
            try { await onSubmit(formValues(form), form, m.close); } catch (err) { showErrors(form, err); }
        });
    };
    return { ...m, form };
}
const field = (label, input, cls = '') => `<label class="field ${cls}"><span>${esc(label)}</span>${input}</label>`;
const inp = (name, value = '', type = 'text', extra = '') => `<input name="${name}" type="${type}" value="${esc(value ?? '')}" ${extra}>`;
const sel = (name, opts, extra = '') => `<select name="${name}" ${extra}>${opts}</select>`;
const clean = (v) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === '' ? null : x]));

/* ===========================================================
   Pages
   =========================================================== */
const Pages = {
    login() {
        App.shellRendered = false;
        document.title = 'Sign in · ' + BRAND.name;
        $('#app').innerHTML = `
        <div class="auth">
            <section class="auth-art">
                <div class="brand-row">${brandLogo()}<span>${brandName()}</span></div>
                <div>
                    <h1>Run ${esc(App.school.name || 'your school')} from one place.</h1>
                    <p>Manage students, staff, classes, fees and approvals in one place.</p>
                    <ul>
                        <li>Students, teachers and classes</li>
                        <li>Daily attendance for any section</li>
                        <li>Fee invoices and payment collection</li>
                        <li>Admission and leave approvals</li>
                    </ul>
                </div>
                <small class="art-foot" style="color:rgba(255,255,255,.6)">Parents and teachers sign in at the <a href="../portal/" style="color:#fff">portal</a>.</small>
            </section>
            <section class="auth-form">
                <div class="auth-card">
                    <h2>Admin sign in</h2>
                    <p class="sub">AAS School Manager · for school administrators.</p>
                    <form class="form" id="loginForm" novalidate>
                        <label class="field"><span>Email</span><input name="email" type="email" autocomplete="username" required></label>
                        <label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
                        <button class="btn block" type="submit" data-busy="Signing in…">Sign in</button>
                    </form>
                </div>
            </section>
        </div>`;
        const form = $('#loginForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const v = formValues(form);
            await busy($('button[type=submit]', form), async () => {
                try {
                    const res = await API.post('/login', { email: v.email.trim(), password: v.password, device_name: 'admin-panel' });
                    const done = (r) => {
                        if (!['admin', 'super_admin', 'owner'].includes(r.user.role)) {
                            fetch(API.base + '/logout', { method: 'POST', headers: { Accept: 'application/json', Authorization: 'Bearer ' + r.token } }).catch(() => {});
                            toast('This panel is for administrators. Parents and teachers use the portal.', 'error');
                            setTimeout(() => location.reload(), 1800);
                            return;
                        }
                        Auth.save(r.token, r.user);
                        Router.navigate('/');
                    };
                    if (res.two_factor) return TwoFA.challenge(form, res, 'admin-panel', done);
                    done(res);
                } catch (err) { showErrors(form, err); }
            });
        };
    },

    wrongRole() {
        $('#app').innerHTML = `<div class="auth-form" style="min-height:100vh"><div class="auth-card card card-pad center">
            ${emptyHtml('Admins only', 'This account is not an administrator. Please use the portal.', 'alert')}
            <button class="btn" id="out">Log out</button></div></div>`;
        $('#out').onclick = Pages.logout;
    },

    async logout() {
        try { await API.post('/logout'); } catch (e) { /* ignore */ }
        Auth.clear();
        Router.navigate('/login');
    },

    /* ---------- Dashboard ---------- */
    async dashboard(view) {
        const d = await API.get('/dashboard');
        const c = d.counts || {}, a = d.attendance_today || {}, f = d.finance || {}, p = d.pending || {};
        Layout.setCount('adm', p.admission_applications || 0);
        Layout.setCount('leave', p.leave_requests || 0);
        const chart = (d.monthly_chart || []).slice(-6);
        const max = Math.max(1, ...chart.map((x) => Number(x.fee_collected || 0)));
        view.innerHTML = `
        <div class="stats mb">
            <a class="card stat" href="#/students"><div class="ico tone-brand">${icon('users')}</div><div><div class="label">Students</div><div class="value">${c.students ?? 0}</div><div class="hint">${c.male_students ?? 0} boys · ${c.female_students ?? 0} girls</div></div></a>
            <a class="card stat" href="#/teachers"><div class="ico tone-info">${icon('user')}</div><div><div class="label">Teachers & staff</div><div class="value">${c.teachers ?? 0}</div><div class="hint">${c.classes ?? 0} classes · ${c.sections ?? 0} sections</div></div></a>
            <a class="card stat" href="#/attendance"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Attendance today</div><div class="value">${fmt.pct(a.percentage)}</div><div class="hint">${a.marked ? `${a.present} present · ${a.absent} absent` : 'Not marked yet'}</div></div></a>
            <a class="card stat" href="#/fees?status=outstanding"><div class="ico tone-bad">${icon('wallet')}</div><div><div class="label">Outstanding dues</div><div class="value">${fmt.money(f.outstanding_dues)}</div><div class="hint">${f.defaulter_students ?? 0} students with dues</div></div></a>
        </div>
        <div class="grid-2">
            <div class="card"><div class="card-head"><h2>Fees this month</h2><a href="#/fees">View invoices</a></div><div class="card-body">
                <div class="rc-summary">
                    <div><span>Billed</span><b>${fmt.money(f.billed_this_month)}</b></div>
                    <div><span>Collected</span><b>${fmt.money(f.collected_this_month)}</b></div>
                    <div><span>Collected today</span><b>${fmt.money(f.collected_today)}</b></div>
                </div>
                ${chart.length ? `<div class="bar-chart mt">${chart.map((x) => `<div class="bar" title="${esc(x.label)}: ${fmt.money(x.fee_collected)}"><b>${Number(x.fee_collected) ? Math.round(x.fee_collected / 1000) + 'k' : ''}</b><i style="height:${Math.round((Number(x.fee_collected || 0) / max) * 100)}%"></i></div>`).join('')}</div>
                <div class="bar-labels">${chart.map((x) => `<span>${esc(String(x.label).split(' ')[0])}</span>`).join('')}</div>` : ''}
            </div></div>
            <div class="card"><div class="card-head"><h2>Needs your attention</h2></div>
                <ul class="list">
                    <li class="item-row"><div class="grow"><a href="#/admissions">Online admission applications</a></div>${badge(p.admission_applications ? 'pending' : 'active', String(p.admission_applications || 0))}</li>
                    <li class="item-row"><div class="grow"><a href="#/leaves">Leave requests</a></div>${badge(p.leave_requests ? 'pending' : 'active', String(p.leave_requests || 0))}</li>
                    <li class="item-row"><div class="grow">Online payments to verify</div>${badge(p.online_payments ? 'pending' : 'active', String(p.online_payments || 0))}</li>
                    <li class="item-row"><div class="grow">Enquiries to follow up</div>${badge(p.enquiries_follow_up ? 'pending' : 'active', String(p.enquiries_follow_up || 0))}</li>
                    <li class="item-row"><div class="grow">Open complaints</div>${badge(p.complaints ? 'pending' : 'active', String(p.complaints || 0))}</li>
                </ul>
            </div>
        </div>`;
    },

    /* ---------- Students ---------- */
    async students(view, _p, q) {
        const page = +q.page || 1;
        const [classes, sections] = await Promise.all([Lookups.classes(), Lookups.sections()]);
        const secs = q.class ? sections.filter((s) => String(s.school_class_id) === q.class) : sections;
        view.innerHTML = `
        <div class="card mb"><div class="card-body"><form class="toolbar" id="flt">
            <label class="field wide"><span>Search</span><input name="search" value="${esc(q.search || '')}" placeholder="Name, admission no, roll no, phone"></label>
            <label class="field"><span>Class</span><select name="class">${options(classes, { selected: q.class, placeholder: 'All classes' })}</select></label>
            <label class="field"><span>Section</span><select name="section">${options(secs, { label: 'label', selected: q.section, placeholder: 'All sections' })}</select></label>
            <label class="field"><span>Status</span><select name="status">${options(['active', 'left', 'graduated', 'suspended', 'any'].map((s) => ({ id: s, name: s === 'any' ? 'Any status' : fmt.cap(s) })), { selected: q.status || 'active' })}</select></label>
            <button class="btn secondary" type="submit">${icon('search')} Filter</button>
            <button class="btn secondary" type="button" id="impBtn">${icon('upload')} Import CSV</button>
            <button class="btn secondary" type="button" id="proBtn">Promote</button>
            <button class="btn" type="button" id="addBtn">${icon('plus')} Add student</button>
        </form></div></div>
        <div class="card" id="list">${loadingHtml()}</div>`;
        const flt = $('#flt', view);
        flt.onsubmit = (e) => { e.preventDefault(); go('/students', formValues(flt)); };
        $('[name=class]', flt).onchange = () => { $('[name=section]', flt).value = ''; flt.requestSubmit(); };
        $('[name=section]', flt).onchange = () => flt.requestSubmit();
        $('[name=status]', flt).onchange = () => flt.requestSubmit();
        $('#addBtn', view).onclick = () => Pages.studentForm();
        $('#impBtn', view).onclick = () => Pages.importStudents();
        $('#proBtn', view).onclick = () => Pages.promote();

        const res = await API.get('/students', { page, per_page: 20, search: q.search, school_class_id: q.class, section_id: q.section, status: q.status === 'any' ? '' : (q.status || 'active') });
        const list = $('#list', view);
        if (!res.data.length) { list.innerHTML = emptyHtml('No students found', 'Try a different filter or add a new student.', 'users'); return; }
        list.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Adm. no</th><th>Name</th><th>Class</th><th class="hide-sm">Guardian</th><th>Status</th><th></th></tr></thead><tbody>
            ${res.data.map((s) => `<tr><td class="nowrap">${esc(s.admission_no || '—')}</td>
                <td><a href="javascript:void 0" data-prof="${s.id}"><b>${esc(s.full_name)}</b></a><br><small>Roll ${esc(s.roll_no || '—')} · ${fmt.cap(s.gender)}</small></td>
                <td class="nowrap">${esc(s.school_class?.name || '—')} – ${esc(s.section?.name || '')}</td>
                <td class="hide-sm">${esc(s.guardian?.name || '—')}<br><small>${esc(s.guardian?.phone || '')}</small></td>
                <td>${badge(s.status)}</td>
                <td class="right nowrap"><button class="btn ghost sm" data-edit="${s.id}">${icon('edit')}</button><button class="btn ghost sm" data-del="${s.id}" title="Delete">${icon('trash')}</button></td></tr>`).join('')}
            </tbody></table></div>${pagerHtml(res)}`;
        bindPager(list, (n) => go('/students', { ...q, page: n }));
        $$('[data-edit]', list).forEach((b) => (b.onclick = () => Pages.studentForm(res.data.find((s) => s.id === +b.dataset.edit))));
        $$('[data-prof]', list).forEach((b) => (b.onclick = () => Pages.studentProfile(+b.dataset.prof).catch((e) => toast(e.message, 'error'))));
        $$('[data-del]', list).forEach((b) => (b.onclick = async () => {
            const s = res.data.find((x) => x.id === +b.dataset.del);
            if (!(await confirmBox(`Delete ${s.full_name}? This cannot be undone. To keep records, edit the student and set status to "Left" instead.`, { okText: 'Delete', danger: true }))) return;
            try { await API.del('/students/' + s.id); toast('Student deleted.'); Router.resolve(); } catch (err) { toast(err.message, 'error'); }
        }));
    },

    async studentForm(s = null) {
        const [classes, sections, sessions, guardians, routes] = await Promise.all([Lookups.classes(), Lookups.sections(), Lookups.sessions(), Lookups.guardians(), Lookups.routes()]);
        const current = sessions.find((x) => x.is_current);
        const { form } = formModal({
            title: s ? `Edit ${s.full_name}` : 'Add student', wide: true,
            fields: `
            <div class="form-row">${field('First name *', inp('first_name', s?.first_name, 'text', 'required'))}${field('Last name', inp('last_name', s?.last_name))}</div>
            <div class="form-row">${field('Gender *', sel('gender', options([{ id: 'male', name: 'Male' }, { id: 'female', name: 'Female' }, { id: 'other', name: 'Other' }], { selected: s?.gender, placeholder: 'Select' })))}
                ${field('Date of birth', inp('date_of_birth', s?.date_of_birth?.slice(0, 10), 'date'))}</div>
            <div class="form-row">${field('Class *', sel('school_class_id', options(classes, { selected: s?.school_class_id, placeholder: 'Select class' })))}
                ${field('Section *', sel('section_id', ''))}</div>
            <div class="form-row">${field('Admission no', inp('admission_no', s?.admission_no, 'text', 'placeholder="Auto if empty"'))}${field('Roll no', inp('roll_no', s?.roll_no))}</div>
            <div class="form-row">${field('Guardian', sel('guardian_id', options(guardians, { label: (g) => `${g.name} (${g.phone || g.relation || ''})`, selected: s?.guardian_id, placeholder: 'None' })))}
                ${field('Session', sel('academic_session_id', options(sessions, { selected: s?.academic_session_id || current?.id, placeholder: 'Select' })))}</div>
            <div class="form-row">${field('B-Form', inp('b_form', s?.b_form))}${field('Phone', inp('phone', s?.phone))}</div>
            <div class="form-row">${field('Transport route', sel('transport_route_id', options(routes, { label: (r) => `${r.name} (${fmt.money(r.fare)})`, selected: s?.transport_route_id, placeholder: 'No transport' })))}
                ${field('Blood group', inp('blood_group', s?.blood_group))}</div>
            <div class="form-row">${field('Admission date', inp('admission_date', (s?.admission_date || fmt.today()).slice(0, 10), 'date'))}
                ${field('Monthly discount', inp('monthly_discount', s?.monthly_discount ?? 0, 'number', 'min="0" step="1"'))}</div>
            ${s ? field('Status', sel('status', options(['active', 'left', 'graduated', 'suspended'].map((x) => ({ id: x, name: fmt.cap(x) })), { selected: s.status }))) : ''}
            ${field('Address', `<textarea name="address" rows="2">${esc(s?.address || '')}</textarea>`)}`,
            onSubmit: async (v, _f, close) => {
                const body = clean(v);
                const res = s ? await API.put('/students/' + s.id, body) : await API.post('/students', body);
                close(); toast(res?.message || (s ? 'Student updated.' : 'Student added.'));
                Lookups.reset('classes'); Router.resolve();
            },
        });
        const fillSections = () => {
            const cid = $('[name=school_class_id]', form).value;
            $('[name=section_id]', form).innerHTML = options(sections.filter((x) => String(x.school_class_id) === cid), { selected: s?.section_id, placeholder: cid ? 'Select section' : 'Select class first' });
        };
        $('[name=school_class_id]', form).onchange = fillSections;
        fillSections();
    },

    /* ---------- Teachers ---------- */
    async teachers(view, _p, q) {
        const page = +q.page || 1;
        view.innerHTML = `
        <div class="card mb"><div class="card-body"><form class="toolbar" id="flt">
            <label class="field wide"><span>Search</span><input name="search" value="${esc(q.search || '')}" placeholder="Name, employee no, phone, CNIC"></label>
            <label class="field"><span>Type</span><select name="type">${options([{ id: 'teaching', name: 'Teaching' }, { id: 'non_teaching', name: 'Non-teaching' }], { selected: q.type, placeholder: 'All staff' })}</select></label>
            <button class="btn secondary" type="submit">${icon('search')} Filter</button>
            <button class="btn" type="button" id="addBtn">${icon('plus')} Add staff</button>
        </form></div></div>
        <div class="card" id="list">${loadingHtml()}</div>`;
        const flt = $('#flt', view);
        flt.onsubmit = (e) => { e.preventDefault(); go('/teachers', formValues(flt)); };
        $('[name=type]', flt).onchange = () => flt.requestSubmit();
        $('#addBtn', view).onclick = () => Pages.teacherForm();

        const res = await API.get('/teachers', { page, per_page: 20, search: q.search, staff_type: q.type });
        const list = $('#list', view);
        if (!res.data.length) { list.innerHTML = emptyHtml('No staff found', '', 'user'); return; }
        list.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Emp. no</th><th>Name</th><th class="hide-sm">Designation</th><th class="hide-sm">Phone</th><th>Login</th><th>Status</th><th></th></tr></thead><tbody>
            ${res.data.map((t) => `<tr><td class="nowrap">${esc(t.employee_no || '—')}</td>
                <td><b>${esc(t.name)}</b><br><small>${esc(t.qualification || '')}</small></td>
                <td class="hide-sm">${esc(t.designation || '—')}<br><small>${fmt.cap(t.staff_type)}</small></td>
                <td class="hide-sm nowrap">${esc(t.phone || '—')}</td>
                <td><small>${esc(t.user?.email || 'No login')}</small></td>
                <td>${badge(t.status)}</td>
                <td class="right nowrap"><button class="btn ghost sm" data-edit="${t.id}">${icon('edit')}</button><button class="btn ghost sm" data-del="${t.id}" title="Delete">${icon('trash')}</button></td></tr>`).join('')}
            </tbody></table></div>${pagerHtml(res)}`;
        bindPager(list, (n) => go('/teachers', { ...q, page: n }));
        $$('[data-edit]', list).forEach((b) => (b.onclick = () => Pages.teacherForm(res.data.find((t) => t.id === +b.dataset.edit))));
        $$('[data-del]', list).forEach((b) => (b.onclick = async () => {
            const t = res.data.find((x) => x.id === +b.dataset.del);
            if (!(await confirmBox(`Delete ${t.name}? This cannot be undone. You can set status to "Inactive" instead.`, { okText: 'Delete', danger: true }))) return;
            try { await API.del('/teachers/' + t.id); toast('Staff member deleted.'); Lookups.reset('teachers'); Router.resolve(); } catch (err) { toast(err.message, 'error'); }
        }));
    },

    teacherForm(t = null) {
        const hasLogin = !!t?.user;
        const { form } = formModal({
            title: t ? `Edit ${t.name}` : 'Add staff member', wide: true,
            fields: `
            <div class="form-row">${field('Full name *', inp('name', t?.name, 'text', 'required'))}${field('Employee no', inp('employee_no', t?.employee_no, 'text', 'placeholder="Auto if empty"'))}</div>
            <div class="form-row">${field('Staff type', sel('staff_type', options([{ id: 'teaching', name: 'Teaching' }, { id: 'non_teaching', name: 'Non-teaching' }], { selected: t?.staff_type || 'teaching' })))}
                ${field('Designation', inp('designation', t?.designation ?? 'Teacher'))}</div>
            <div class="form-row">${field('Gender', sel('gender', options([{ id: 'male', name: 'Male' }, { id: 'female', name: 'Female' }, { id: 'other', name: 'Other' }], { selected: t?.gender, placeholder: 'Select' })))}
                ${field('Qualification', inp('qualification', t?.qualification))}</div>
            <div class="form-row">${field('Phone', inp('phone', t?.phone))}${field('Email', inp('email', t?.email, 'email'))}</div>
            <div class="form-row">${field('CNIC', inp('cnic', t?.cnic))}${field('Joining date', inp('joining_date', (t?.joining_date || fmt.today()).slice(0, 10), 'date'))}</div>
            <div class="form-row">${field('Basic salary', inp('basic_salary', t?.basic_salary ?? '', 'number', 'min="0"'))}
                ${field('Status', sel('status', options([{ id: 'active', name: 'Active' }, { id: 'inactive', name: 'Inactive' }], { selected: t?.status || 'active' })))}</div>
            <label class="check"><input type="checkbox" name="create_login" ${hasLogin ? 'checked' : ''}> ${hasLogin ? 'Has portal login (update below)' : 'Create a portal login for this person'}</label>
            <div id="loginBox" class="${hasLogin ? '' : 'hidden'}">
                <div class="form-row">${field('Login email', inp('login_email', t?.user?.email || t?.email))}
                    ${field('Login role', sel('login_role', options(['teacher', 'accountant', 'librarian', 'receptionist'].map((r) => ({ id: r, name: fmt.cap(r) })), { selected: 'teacher' })))}</div>
                ${field(hasLogin ? 'New password (leave empty to keep)' : 'Password (min 6)', inp('password', '', 'password', 'autocomplete="new-password"'))}
            </div>`,
            onSubmit: async (v, _f, close) => {
                const body = clean(v);
                if (!body.create_login) { delete body.login_email; delete body.password; delete body.login_role; }
                const res = t ? await API.put('/teachers/' + t.id, body) : await API.post('/teachers', body);
                close(); toast(res?.message || (t ? 'Saved.' : 'Staff member added.'));
                Lookups.reset('teachers'); Router.resolve();
            },
        });
        $('[name=create_login]', form).onchange = (e) => $('#loginBox', form).classList.toggle('hidden', !e.target.checked);
    },

    /* ---------- Classes & sections ---------- */
    async classes(view) {
        Lookups.reset('classes');
        const [classes, teachers] = await Promise.all([Lookups.classes(), Lookups.teachers()]);
        view.innerHTML = `
        <div class="page-head flex between mb"><p>${classes.length} classes · ${classes.reduce((n, c) => n + (c.sections?.length || 0), 0)} sections</p>
            <span class="flex"><button class="btn secondary" id="addSec">${icon('plus')} Add section</button><button class="btn" id="addCls">${icon('plus')} Add class</button></span></div>
        <div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Class</th><th>Students</th><th>Sections (class teacher · capacity)</th><th></th></tr></thead><tbody>
        ${classes.map((c) => `<tr><td><b>${esc(c.name)}</b><br><small>Level ${esc(c.numeric_level ?? '—')}</small></td><td>${c.students_count ?? 0}</td>
            <td>${(c.sections || []).map((s) => `<button class="chip" data-sec="${s.id}" title="Edit section">${esc(s.name)} · ${esc(s.class_teacher?.name || 'No teacher')} · ${s.capacity ?? '—'}</button>`).join(' ') || '<small>No sections</small>'}</td>
            <td class="right nowrap"><button class="btn ghost sm" data-edit="${c.id}">${icon('edit')}</button><button class="btn ghost sm" data-del="${c.id}">${icon('trash')}</button></td></tr>`).join('')}
        </tbody></table></div></div>`;

        const clsForm = (c = null) => formModal({
            title: c ? `Edit ${c.name}` : 'Add class',
            fields: `${field('Class name *', inp('name', c?.name, 'text', 'required placeholder="e.g. Class 6"'))}
                ${field('Level (for ordering)', inp('numeric_level', c?.numeric_level ?? '', 'number', 'min="0"'))}
                ${c ? '' : field('First section name', inp('first_section', 'A'))}`,
            onSubmit: async (v, _f, close) => {
                const body = clean({ name: v.name, numeric_level: v.numeric_level });
                if (c) await API.put('/classes/' + c.id, body);
                else {
                    const res = await API.post('/classes', body);
                    const id = res?.data?.id ?? res?.id;
                    if (id && v.first_section) await API.post('/sections', { school_class_id: id, name: v.first_section, capacity: 40 });
                }
                close(); toast(c ? 'Class updated.' : 'Class added.'); Router.resolve();
            },
        });
        const secForm = (s = null) => formModal({
            title: s ? 'Edit section' : 'Add section',
            fields: `${field('Class *', sel('school_class_id', options(classes, { selected: s?.school_class_id, placeholder: 'Select class' })))}
                <div class="form-row">${field('Section name *', inp('name', s?.name, 'text', 'required placeholder="e.g. B"'))}${field('Capacity', inp('capacity', s?.capacity ?? 40, 'number', 'min="1"'))}</div>
                ${field('Class teacher', sel('class_teacher_id', options(teachers.filter((t) => t.status === 'active'), { selected: s?.class_teacher_id, placeholder: 'None' })))}
                ${s ? `<button type="button" class="btn danger sm" id="delSec">${icon('trash')} Delete this section</button>` : ''}`,
            onSubmit: async (v, _f, close) => {
                const body = clean(v);
                if (s) await API.put('/sections/' + s.id, body); else await API.post('/sections', body);
                close(); toast(s ? 'Section updated.' : 'Section added.'); Router.resolve();
            },
        });
        $('#addCls', view).onclick = () => clsForm();
        $('#addSec', view).onclick = () => secForm();
        $$('[data-edit]', view).forEach((b) => (b.onclick = () => clsForm(classes.find((c) => c.id === +b.dataset.edit))));
        $$('[data-sec]', view).forEach((b) => (b.onclick = () => {
            const s = classes.flatMap((c) => c.sections || []).find((x) => x.id === +b.dataset.sec);
            const m = secForm(s);
            $('#delSec', m.el).onclick = async () => {
                if (!(await confirmBox(`Delete section ${s.name}?`, { okText: 'Delete', danger: true }))) return;
                try { await API.del('/sections/' + s.id); m.close(); toast('Section deleted.'); Router.resolve(); } catch (err) { toast(err.message, 'error'); }
            };
        }));
        $$('[data-del]', view).forEach((b) => (b.onclick = async () => {
            const c = classes.find((x) => x.id === +b.dataset.del);
            if (!(await confirmBox(`Delete ${c.name}? Classes with students or sections cannot be deleted.`, { okText: 'Delete', danger: true }))) return;
            try { await API.del('/classes/' + c.id); toast('Class deleted.'); Router.resolve(); } catch (err) { toast(err.message, 'error'); }
        }));
    },

    /* ---------- Attendance ---------- */
    async attendance(view, _p, q) {
        const sections = await Lookups.sections();
        if (!sections.length) { view.innerHTML = `<div class="card">${emptyHtml('No sections yet', 'Add classes and sections first.')}</div>`; return; }
        const sectionId = q.section || sections[0].id;
        const date = q.date || fmt.today();
        view.innerHTML = `
        <div class="card mb"><div class="card-body"><div class="toolbar">
            <label class="field wide"><span>Class / section</span><select id="secSel">${options(sections, { label: 'label', selected: sectionId })}</select></label>
            <label class="field"><span>Date</span><input type="date" id="datePick" value="${date}" max="${fmt.today()}"></label>
        </div></div></div><div id="attBody">${loadingHtml()}</div>`;
        $('#secSel', view).onchange = (e) => go('/attendance', { section: e.target.value, date });
        $('#datePick', view).onchange = (e) => e.target.value && go('/attendance', { section: sectionId, date: e.target.value });

        const body = $('#attBody', view);
        const sheet = await API.get('/attendance', { section_id: sectionId, date });
        if (!sheet.data.length) { body.innerHTML = `<div class="card">${emptyHtml('No active students in this section', '', 'users')}</div>`; return; }
        const state = sheet.data.map((r) => ({ ...r, status: r.status || 'present' }));
        const STAT = [['present', 'P'], ['absent', 'A'], ['late', 'L'], ['leave', 'LV']];
        body.innerHTML = `
        ${sheet.is_marked ? `<div class="alert info mb">${icon('alert')}<div>Attendance for ${fmt.date(date)} is already saved. Saving again will update it.</div></div>` : ''}
        <div class="card"><div class="card-head"><h2>${esc(sheet.section?.school_class?.name || '')} – ${esc(sheet.section?.name || '')} · ${fmt.date(date)}</h2>
            <button class="btn secondary sm" id="allPresent">Mark all present</button></div>
        <div class="table-wrap"><table class="table"><thead><tr><th style="width:60px">Roll</th><th>Student</th><th>Status</th><th class="hide-sm">Remarks</th></tr></thead><tbody>
        ${state.map((r, i) => `<tr><td>${esc(r.roll_no || '—')}</td><td><b>${esc(r.name)}</b><br><small>${esc(r.admission_no)}</small></td>
            <td><div class="seg" data-row="${i}">${STAT.map(([k, l]) => `<button type="button" data-st="${k}" class="${k}" title="${fmt.cap(k)}">${l}</button>`).join('')}</div></td>
            <td class="hide-sm"><input data-remark="${i}" value="${esc(r.remarks || '')}" placeholder="Optional" style="min-height:34px;padding:.35rem .55rem"></td></tr>`).join('')}
        </tbody></table></div>
        <div class="sticky-bar"><span id="attCounts" class="grow"></span>
            <label class="check"><input type="checkbox" id="notify"> SMS parents of absent students</label>
            <button class="btn" id="saveAtt" data-busy="Saving…">${icon('check')} Save attendance</button></div></div>`;
        const paint = () => {
            $('#attCounts', view).innerHTML = STAT.map(([k]) => badge(k, `${fmt.cap(k)}: ${state.filter((r) => r.status === k).length}`)).join(' ');
            $$('.seg', body).forEach((seg) => { const r = state[+seg.dataset.row]; $$('button', seg).forEach((b) => b.classList.toggle('on', b.dataset.st === r.status)); });
        };
        paint();
        $$('.seg button', body).forEach((b) => (b.onclick = () => { state[+b.parentElement.dataset.row].status = b.dataset.st; paint(); }));
        $$('[data-remark]', body).forEach((i) => (i.oninput = () => (state[+i.dataset.remark].remarks = i.value)));
        $('#allPresent', view).onclick = () => { state.forEach((r) => (r.status = 'present')); paint(); };
        $('#saveAtt', view).onclick = (e) => busy(e.currentTarget, async () => {
            try {
                const res = await API.post('/attendance', {
                    section_id: +sectionId, date, notify_absent: $('#notify', view).checked,
                    records: state.map((r) => ({ student_id: r.student_id, status: r.status, remarks: r.remarks || null })),
                });
                toast(res?.message || 'Attendance saved.');
            } catch (err) { toast(err.message, 'error'); }
        });
    },

    /* ---------- Fees ---------- */
    async fees(view, _p, q) {
        const page = +q.page || 1;
        const [classes] = await Promise.all([Lookups.classes()]);
        const STATUSES = [{ id: 'outstanding', name: 'Outstanding (unpaid + partial)' }, { id: 'unpaid', name: 'Unpaid' }, { id: 'partial', name: 'Partial' }, { id: 'paid', name: 'Paid' }, { id: 'cancelled', name: 'Cancelled' }];
        view.innerHTML = `
        <div class="card mb"><div class="card-body"><form class="toolbar" id="flt">
            <label class="field wide"><span>Search</span><input name="search" value="${esc(q.search || '')}" placeholder="Invoice no, student name, admission no"></label>
            <label class="field"><span>Month</span><input type="month" name="month" value="${esc(q.month || '')}"></label>
            <label class="field"><span>Class</span><select name="class">${options(classes, { selected: q.class, placeholder: 'All classes' })}</select></label>
            <label class="field"><span>Status</span><select name="status">${options(STATUSES, { selected: q.status, placeholder: 'Any status' })}</select></label>
            <button class="btn secondary" type="submit">${icon('search')} Filter</button>
            <button class="btn" type="button" id="genBtn">${icon('plus')} Generate invoices</button>
            <button class="btn secondary" type="button" id="fineBtn">Apply late fines</button>
            <button class="btn secondary" type="button" id="csvBtn">${icon('download')} CSV</button>
        </form></div></div>
        <div class="card" id="list">${loadingHtml()}</div>`;
        const flt = $('#flt', view);
        flt.onsubmit = (e) => { e.preventDefault(); go('/fees', formValues(flt)); };
        ['class', 'status', 'month'].forEach((n) => ($(`[name=${n}]`, flt).onchange = () => flt.requestSubmit()));
        $('#genBtn', flt).onclick = () => Pages.feeGenerate();
        $('#fineBtn', flt).onclick = async () => { if (!(await confirmBox('Add the late fee (from School Settings) to every overdue unpaid invoice?'))) return; try { toast((await API.post('/fee-invoices/apply-late-fines')).message); Router.resolve(); } catch (err) { toast(err.message, 'error'); } };
        $('#csvBtn', flt).onclick = (e) => busy(e.currentTarget, () => API.download('/fee-invoices', { export: 'csv', month: q.month, status: q.status, school_class_id: q.class, search: q.search }, 'fee-invoices.csv').catch((err) => toast(err.message, 'error')));

        const res = await API.get('/fee-invoices', { page, per_page: 20, search: q.search, month: q.month, school_class_id: q.class, status: q.status });
        const list = $('#list', view);
        if (!res.data.length) { list.innerHTML = emptyHtml('No invoices found', 'Invoices are generated monthly by the accountant (or via the API).', 'wallet'); return; }
        list.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Invoice</th><th>Student</th><th>Month</th><th class="num">Total</th><th class="num">Paid</th><th class="num">Balance</th><th>Status</th><th></th></tr></thead><tbody>
        ${res.data.map((i) => `<tr><td class="nowrap"><b>${esc(i.invoice_no)}</b><br><small>Due ${fmt.date(i.due_date)}</small></td>
            <td>${esc(i.student?.full_name || '—')}<br><small>${esc(i.student?.school_class?.name || '')} – ${esc(i.student?.section?.name || '')}</small></td>
            <td class="nowrap">${fmt.month(i.month)}</td>
            <td class="num">${fmt.money(i.total)}</td><td class="num">${fmt.money(i.paid)}</td><td class="num"><b>${fmt.money(i.balance)}</b></td>
            <td>${badge(i.status)}</td>
            <td class="right nowrap">${i.balance > 0 && i.status !== 'cancelled' ? `<button class="btn sm" data-pay="${i.id}">Collect</button>` : ''}
                <button class="btn ghost sm" data-inv="${i.id}" title="Details, payments & receipts">${icon('file')}</button><button class="btn ghost sm" data-vou="${i.id}" title="Download voucher (PDF)">${icon('download')}</button></td></tr>`).join('')}
        </tbody></table></div>${pagerHtml(res)}`;
        bindPager(list, (n) => go('/fees', { ...q, page: n }));
        $$('[data-vou]', list).forEach((b) => (b.onclick = () => busy(b, () => API.download(`/fee-invoices/${b.dataset.vou}/voucher`, null, 'voucher.pdf').catch((err) => toast(err.message, 'error')))));
        $$('[data-inv]', list).forEach((b) => (b.onclick = () => busy(b, () => Pages.invoiceDetails(b.dataset.inv).catch((err) => toast(err.message, 'error')))));
        $$('[data-pay]', list).forEach((b) => (b.onclick = () => {
            const i = res.data.find((x) => x.id === +b.dataset.pay);
            formModal({
                title: `Collect fee · ${i.invoice_no}`, submitText: 'Save payment',
                fields: `<div class="alert info">${icon('wallet')}<div>${esc(i.student?.full_name || '')} · ${fmt.month(i.month)} · balance <b>${fmt.money(i.balance)}</b></div></div>
                <div class="form-row">${field('Amount *', inp('amount', i.balance, 'number', `min="1" max="${i.balance}" required`))}
                    ${field('Method *', sel('method', options(['cash', 'bank', 'cheque', 'jazzcash', 'easypaisa', 'online'].map((m) => ({ id: m, name: fmt.cap(m) })), { selected: 'cash' })))}</div>
                <div class="form-row">${field('Paid on', inp('paid_on', fmt.today(), 'date', `max="${fmt.today()}"`))}${field('Reference', inp('reference', '', 'text', 'placeholder="Cheque / transaction no"'))}</div>
                ${field('Notes', inp('notes'))}`,
                onSubmit: async (v, _f, close) => {
                    const r = await API.post(`/fee-invoices/${i.id}/payments`, clean(v));
                    close(); toast(r?.message || 'Payment saved.'); Router.resolve();
                },
            });
        }));
    },

    /* ---------- Admissions ---------- */
    async admissions(view, _p, q) {
        const status = q.status ?? 'pending';
        const page = +q.page || 1;
        view.innerHTML = `
        <div class="tabs">${['pending', 'approved', 'rejected', ''].map((s) => `<button data-st="${s}" class="${status === s ? 'active' : ''}">${s ? fmt.cap(s) : 'All'}</button>`).join('')}</div>
        <div class="card" id="list">${loadingHtml()}</div>`;
        $$('[data-st]', view).forEach((b) => (b.onclick = () => go('/admissions', { status: b.dataset.st || 'all' })));
        const res = await API.get('/admission-applications', { page, per_page: 20, status: status === 'all' ? '' : status });
        if (status === 'all') $('[data-st=""]', view).classList.add('active');
        const list = $('#list', view);
        if (!res.data.length) { list.innerHTML = emptyHtml('No applications', 'Online applications from the portal\'s "Apply for admission" page show up here.', 'cap'); return; }
        list.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Application</th><th>Student</th><th>Class</th><th class="hide-sm">Guardian</th><th>Status</th><th></th></tr></thead><tbody>
        ${res.data.map((a) => `<tr><td class="nowrap"><b>${esc(a.application_no || '#' + a.id)}</b><br><small>${fmt.date(a.created_at)}</small></td>
            <td>${esc(a.first_name)} ${esc(a.last_name || '')}<br><small>${fmt.cap(a.gender)}${a.date_of_birth ? ' · DOB ' + fmt.date(a.date_of_birth) : ''}</small></td>
            <td>${esc(a.school_class?.name || '—')}</td>
            <td class="hide-sm">${esc(a.guardian_name)} (${esc(a.guardian_relation || '')})<br><small>${esc(a.guardian_phone)}</small></td>
            <td>${badge(a.status)}${a.remarks ? `<br><small>${esc(a.remarks)}</small>` : ''}</td>
            <td class="right nowrap">${a.status === 'pending' ? `<button class="btn sm" data-ok="${a.id}">Approve</button> <button class="btn secondary sm" data-no="${a.id}">Reject</button>` : ''}</td></tr>`).join('')}
        </tbody></table></div>${pagerHtml(res)}`;
        bindPager(list, (n) => go('/admissions', { ...q, page: n }));
        const sections = await Lookups.sections();
        $$('[data-ok]', list).forEach((b) => (b.onclick = () => {
            const a = res.data.find((x) => x.id === +b.dataset.ok);
            const secs = sections.filter((s) => !a.school_class_id || s.school_class_id === a.school_class_id);
            formModal({
                title: `Approve ${a.first_name} ${a.last_name || ''}`, submitText: 'Approve & enrol',
                fields: `<p>This creates the student record (and the guardian, if new).</p>
                ${field('Section *', sel('section_id', options(secs.length ? secs : sections, { label: 'label', placeholder: 'Select section' })))}
                <div class="form-row">${field('Roll no', inp('roll_no'))}${field('Admission no', inp('admission_no', '', 'text', 'placeholder="Auto if empty"'))}</div>
                <label class="check"><input type="checkbox" name="charge_admission_fee" checked> Create admission fee invoice</label>`,
                onSubmit: async (v, _f, close) => {
                    const sec = sections.find((s) => String(s.id) === v.section_id);
                    const r = await API.post(`/admission-applications/${a.id}/approve`, clean({ ...v, school_class_id: sec?.school_class_id }));
                    close(); toast(r?.message || 'Application approved.'); Lookups.reset('classes', 'guardians'); Layout.refreshCounts(); Router.resolve();
                },
            });
        }));
        $$('[data-no]', list).forEach((b) => (b.onclick = () => {
            const a = res.data.find((x) => x.id === +b.dataset.no);
            formModal({
                title: `Reject ${a.first_name}`, submitText: 'Reject application',
                fields: field('Reason (optional)', inp('remarks')),
                onSubmit: async (v, _f, close) => {
                    const r = await API.post(`/admission-applications/${a.id}/reject`, clean(v));
                    close(); toast(r?.message || 'Rejected.'); Layout.refreshCounts(); Router.resolve();
                },
            });
        }));
    },

    /* ---------- Leave requests ---------- */
    async leaves(view, _p, q) {
        const status = q.status ?? 'pending';
        const type = q.type || '';
        const page = +q.page || 1;
        view.innerHTML = `
        <div class="flex between flex-wrap mb">
            <div class="tabs" style="margin:0">${['pending', 'approved', 'rejected', 'all'].map((s) => `<button data-st="${s}" class="${status === s ? 'active' : ''}">${fmt.cap(s)}</button>`).join('')}</div>
            <div class="chips">${[['', 'Everyone'], ['staff', 'Staff'], ['student', 'Students']].map(([k, l]) => `<button class="chip ${type === k ? 'active' : ''}" data-type="${k}">${l}</button>`).join('')}</div>
        </div>
        <div class="card" id="list">${loadingHtml()}</div>`;
        $$('[data-st]', view).forEach((b) => (b.onclick = () => go('/leaves', { status: b.dataset.st, type })));
        $$('[data-type]', view).forEach((b) => (b.onclick = () => go('/leaves', { status, type: b.dataset.type })));
        const res = await API.get('/leave-requests', { page, per_page: 20, status: status === 'all' ? '' : status, type });
        const list = $('#list', view);
        if (!res.data.length) { list.innerHTML = emptyHtml('No leave requests', '', 'leave'); return; }
        list.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Who</th><th>Type</th><th>Dates</th><th class="hide-sm">Reason</th><th>Status</th><th></th></tr></thead><tbody>
        ${res.data.map((l) => `<tr><td><b>${esc(l.teacher?.name || (l.student ? `${l.student.first_name} ${l.student.last_name || ''}` : '—'))}</b><br><small>${l.teacher ? 'Staff · ' + esc(l.teacher.employee_no || '') : 'Student · ' + esc(l.student?.admission_no || '')}</small></td>
            <td>${esc(l.leave_type?.name || '—')}</td>
            <td class="nowrap">${fmt.dateShort(l.from_date)} – ${fmt.date(l.to_date)}<br><small>${l.days} day(s)</small></td>
            <td class="hide-sm"><span class="clamp">${esc(l.reason)}</span></td>
            <td>${badge(l.status)}${l.remarks ? `<br><small>${esc(l.remarks)}</small>` : ''}</td>
            <td class="right nowrap">${l.status === 'pending' ? `<button class="btn sm" data-act="approve" data-id="${l.id}">Approve</button> <button class="btn secondary sm" data-act="reject" data-id="${l.id}">Reject</button>` : ''}</td></tr>`).join('')}
        </tbody></table></div>${pagerHtml(res)}`;
        bindPager(list, (n) => go('/leaves', { ...q, page: n }));
        $$('[data-act]', list).forEach((b) => (b.onclick = () => {
            const act = b.dataset.act;
            formModal({
                title: act === 'approve' ? 'Approve leave' : 'Reject leave', submitText: fmt.cap(act),
                fields: field('Remarks (optional)', inp('remarks')),
                onSubmit: async (v, _f, close) => {
                    const r = await API.post(`/leave-requests/${b.dataset.id}/${act}`, clean(v));
                    close(); toast(r?.message || 'Done.'); Layout.refreshCounts(); Router.resolve();
                },
            });
        }));
    },
};

Router.add('/', 'Dashboard', Pages.dashboard);
Router.add('/students', 'Students', Pages.students);
Router.add('/teachers', 'Teachers & Staff', Pages.teachers);
Router.add('/classes', 'Classes & Sections', Pages.classes);
Router.add('/attendance', 'Attendance', Pages.attendance);
Router.add('/fees', 'Fees', Pages.fees);
Router.add('/admissions', 'Admissions', Pages.admissions);
Router.add('/leaves', 'Leave Requests', Pages.leaves);

/* ===========================================================
   All other modules: generic CRUD engine + special pages
   =========================================================== */
Object.assign(ICONS, {
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    bus: '<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16M8 17v3M16 17v3"/><circle cx="8" cy="14" r=".6"/><circle cx="16" cy="14" r=".6"/>',
    bed: '<path d="M3 20V6M3 16h18v4M21 16v-4a3 3 0 0 0-3-3h-7v7"/><circle cx="7" cy="11" r="2"/>',
    box: '<path d="m21 8-9-5-9 5 9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
    library: '<path d="M4 3h4v18H4zM10 3h4v18h-4zM16.5 3.5l3.8 1 -4.5 17-3.8-1z"/>',
    money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    report: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M9 17v-3M12 17v-6M15 17v-4"/>',
});

/* ---------- more lookups ---------- */
Object.assign(Lookups, {
    subjects() { return this.get('subjects', async () => (await API.get('/subjects', { all: 1 })).data); },
    exams() { return this.get('exams', async () => (await API.get('/exams', { all: 1 })).data); },
    feeTypes() { return this.get('feeTypes', async () => (await API.get('/fee-types', { all: 1 })).data); },
    suppliers() { return this.get('suppliers', async () => (await API.get('/suppliers', { all: 1 })).data); },
    items() { return this.get('items', async () => (await API.get('/inventory-items', { all: 1 })).data); },
    books() { return this.get('books', async () => (await API.get('/books', { all: 1 })).data); },
    hostels() { return this.get('hostels', async () => (await API.get('/hostels', { all: 1 })).data); },
    vehicles() { return this.get('vehicles', async () => (await API.get('/vehicles', { all: 1 })).data); },
    users() { return this.get('users', async () => (await API.get('/users', { all: 1 })).data); },
    students() { return this.get('students', async () => (await API.get('/students', { all: 1, status: 'active' })).data); },
});
const opt = (arr) => arr.map((x) => (typeof x === 'string' ? { id: x, name: fmt.cap(x) } : x));
const d10 = (v) => (v ? String(v).slice(0, 10) : '');
const t5 = (v) => (v ? String(v).slice(0, 5) : '');
const yesNo = (v) => badge(v ? 'active' : 'cancelled', v ? 'Yes' : 'No');
const studentLabel = (s) => `${s.full_name || `${s.first_name} ${s.last_name || ''}`} (${s.admission_no || ''})`;

/* ---------- field rendering ---------- */
async function fieldsHtml(spec, row = {}) {
    const parts = [];
    for (const f of spec) {
        if (f.row) { parts.push(`<div class="form-row">${await fieldsHtml(f.row, row)}</div>`); continue; }
        if (f.html) { parts.push(typeof f.html === 'function' ? f.html(row) : f.html); continue; }
        const raw = row?.[f.name] ?? (typeof f.value === 'function' ? f.value(row) : f.value);
        const req = f.required ? 'required' : '';
        const label = f.label + (f.required ? ' *' : '');
        let input;
        switch (f.type) {
            case 'select': {
                const list = typeof f.options === 'function' ? await f.options(row) : f.options;
                input = `<select name="${f.name}" ${req}>${options(opt(list), { label: f.optLabel || 'name', selected: raw ?? '', placeholder: f.placeholder ?? (f.required ? 'Select' : 'None') })}</select>`;
                break;
            }
            case 'textarea': input = `<textarea name="${f.name}" rows="${f.rows || 3}" ${req}>${esc(raw ?? '')}</textarea>`; break;
            case 'checkbox': parts.push(`<label class="check"><input type="checkbox" name="${f.name}" ${raw ? 'checked' : ''}> ${esc(f.label)}</label>`); continue;
            case 'date': input = inp(f.name, d10(raw), 'date', req); break;
            case 'time': input = inp(f.name, t5(raw), 'time', req); break;
            case 'file': input = `<input type="file" name="${f.name}" ${f.accept ? `accept="${f.accept}"` : ''}>`; break;
            default: input = inp(f.name, raw ?? '', f.type || 'text', `${req} ${f.attrs || ''}`);
        }
        parts.push(field(label, input));
    }
    return parts.join('');
}

/* ---------- generic CRUD page ---------- */
const Crud = {
    page(cfg) {
        return async (view, _p, q) => {
            const page = +q.page || 1;
            const filters = cfg.filters || [];
            const fOpts = await Promise.all(filters.map((f) => (typeof f.options === 'function' ? f.options() : f.options)));
            const path = Router.current().path;
            view.innerHTML = `
            ${cfg.intro ? `<div class="alert info mb">${icon('alert')}<div>${cfg.intro}</div></div>` : ''}
            <div class="card mb"><div class="card-body"><form class="toolbar" id="flt">
                ${cfg.search === false ? '' : `<label class="field wide"><span>Search</span><input name="search" value="${esc(q.search || '')}" placeholder="${esc(cfg.search || 'Search')}"></label>`}
                ${filters.map((f, i) => f.type === 'month' || f.type === 'date'
                    ? `<label class="field"><span>${esc(f.label)}</span><input type="${f.type}" name="${f.name}" value="${esc(q[f.name] ?? (f.default || ''))}"></label>`
                    : `<label class="field"><span>${esc(f.label)}</span><select name="${f.name}">${options(opt(fOpts[i] || []), { label: f.optLabel || 'name', selected: q[f.name] ?? f.default ?? '', placeholder: f.all === false ? '' : (f.all || 'All') })}</select></label>`).join('')}
                ${cfg.search === false && !filters.length ? '' : `<button class="btn secondary" type="submit">${icon('search')} Filter</button>`}
                ${(cfg.toolbar || []).map((t, i) => `<button class="btn secondary" type="button" data-tool="${i}">${icon(t.icon || 'plus')} ${esc(t.label)}</button>`).join('')}
                ${cfg.fields && cfg.canAdd !== false ? `<button class="btn" type="button" id="addBtn">${icon('plus')} Add ${esc(cfg.singular)}</button>` : ''}
            </form></div></div>
            <div id="above"></div>
            <div class="card" id="list">${loadingHtml()}</div>`;
            const flt = $('#flt', view);
            flt.onsubmit = (e) => { e.preventDefault(); go(path, formValues(flt)); };
            $$('select, input[type=month], input[type=date]', flt).forEach((s) => (s.onchange = () => flt.requestSubmit()));
            $$('[data-tool]', flt).forEach((b) => (b.onclick = () => cfg.toolbar[+b.dataset.tool].run(q, b)));
            if ($('#addBtn', view)) $('#addBtn', view).onclick = () => Crud.form(cfg);

            const params = { page, per_page: 20, search: q.search, ...(cfg.params ? cfg.params(q) : {}) };
            filters.forEach((f) => { const v = q[f.name] ?? f.default; if (v !== undefined && v !== '' && (v !== 'all' || f.passAll)) params[f.param || f.name] = v; });
            const res = await API.get(cfg.endpoint, params);
            if (cfg.above) cfg.above($('#above', view), res, q);
            const rows = res.data || [];
            const list = $('#list', view);
            if (!rows.length) { list.innerHTML = emptyHtml(cfg.empty || `No ${cfg.title.toLowerCase()} yet`, cfg.fields && cfg.canAdd !== false ? `Click "Add ${cfg.singular}" to create one.` : '', cfg.icon || 'inbox'); return; }
            const acts = cfg.actions || [];
            list.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr>${cfg.columns.map((c) => `<th class="${c.cls || ''}">${esc(c.label)}</th>`).join('')}<th></th></tr></thead><tbody>
                ${rows.map((r, i) => `<tr>${cfg.columns.map((c) => `<td class="${c.cls || ''}">${c.render ? c.render(r) : esc(r[c.key] ?? '—')}</td>`).join('')}
                <td class="right nowrap">${acts.filter((a) => !a.show || a.show(r)).map((a, j) => `<button class="btn ${a.primary ? '' : 'ghost'} sm" data-act="${acts.indexOf(a)}" data-i="${i}" title="${esc(a.label)}">${a.icon ? icon(a.icon) : ''}${a.icon && !a.text ? '' : esc(a.label)}</button>`).join(' ')}
                    ${cfg.fields && cfg.canEdit !== false ? `<button class="btn ghost sm" data-edit="${i}" title="Edit">${icon('edit')}</button>` : ''}
                    ${cfg.canDelete !== false ? `<button class="btn ghost sm" data-del="${i}" title="Delete">${icon('trash')}</button>` : ''}</td></tr>`).join('')}
                </tbody>${cfg.foot ? cfg.foot(res) : ''}</table></div>${pagerHtml(res)}`;
            bindPager(list, (n) => go(path, { ...q, page: n }));
            $$('[data-edit]', list).forEach((b) => (b.onclick = () => Crud.form(cfg, rows[+b.dataset.edit])));
            $$('[data-act]', list).forEach((b) => (b.onclick = () => acts[+b.dataset.act].run(rows[+b.dataset.i], b)));
            $$('[data-del]', list).forEach((b) => (b.onclick = async () => {
                const r = rows[+b.dataset.del];
                const name = cfg.name ? cfg.name(r) : (r.name || r.title || '#' + r.id);
                if (!(await confirmBox(`Delete "${name}"? This cannot be undone.`, { okText: 'Delete', danger: true }))) return;
                try { const x = await API.del(`${cfg.endpoint}/${r.id}`); toast(x?.message || 'Deleted.'); (cfg.reset || []).forEach((k) => Lookups.reset(k)); Router.resolve(); } catch (err) { toast(err.message, 'error'); }
            }));
        };
    },

    async form(cfg, row = null) {
        const spec = typeof cfg.fields === 'function' ? cfg.fields(row) : cfg.fields;
        const html = await fieldsHtml(spec, row || {});
        const hasFile = /type="file"/.test(html);
        const m = formModal({
            title: row ? `Edit ${cfg.singular}` : `Add ${cfg.singular}`, wide: cfg.wide !== false,
            fields: html,
            onSubmit: async (v, form, close) => {
                let body = clean(v);
                if (cfg.beforeSave) body = cfg.beforeSave(body, row) || body;
                let res;
                if (hasFile) {
                    const fd = new FormData();
                    Object.entries(body).forEach(([k, x]) => { if (x !== null && x !== undefined) fd.append(k, typeof x === 'boolean' ? (x ? 1 : 0) : x); });
                    $$('input[type=file]', form).forEach((f) => { if (f.files[0]) fd.append(f.name, f.files[0]); });
                    res = await API.request('POST', row ? `${cfg.endpoint}/${row.id}` : cfg.endpoint, { body: fd });
                } else {
                    res = row ? await API.put(`${cfg.endpoint}/${row.id}`, body) : await API.post(cfg.endpoint, body);
                }
                close(); toast(res?.message || 'Saved.');
                (cfg.reset || []).forEach((k) => Lookups.reset(k));
                Router.resolve();
            },
        });
        cfg.onOpen?.(m.form, row);
        return m;
    },
};

/* ---------- reusable field specs ---------- */
const F = {
    classSel: (name = 'school_class_id', required = true, label = 'Class') => ({ name, label, type: 'select', required, options: () => Lookups.classes() }),
    sectionSel: (name = 'section_id', required = true, label = 'Class / section') => ({ name, label, type: 'select', required, optLabel: 'label', options: () => Lookups.sections() }),
    subjectSel: (required = true) => ({ name: 'subject_id', label: 'Subject', type: 'select', required, options: () => Lookups.subjects() }),
    teacherSel: (name = 'teacher_id', label = 'Teacher') => ({ name, label, type: 'select', options: () => Lookups.teachers() }),
    sessionSel: () => ({ name: 'academic_session_id', label: 'Session', type: 'select', options: () => Lookups.sessions(), value: () => null }),
    userSel: (name = 'assigned_to', label = 'Assigned to') => ({ name, label, type: 'select', options: async () => (await Lookups.users()).filter((u) => u.role !== 'parent' && u.role !== 'student') }),
    methodSel: (name = 'payment_method') => ({ name, label: 'Payment method', type: 'select', options: ['cash', 'bank', 'cheque', 'jazzcash', 'easypaisa', 'online'], value: 'cash' }),
};
const filt = {
    cls: { name: 'school_class_id', label: 'Class', options: () => Lookups.classes() },
    sec: { name: 'section_id', label: 'Section', optLabel: 'label', options: () => Lookups.sections() },
    from: { name: 'from', label: 'From', type: 'date' },
    to: { name: 'to', label: 'To', type: 'date' },
};

async function downloadOrToast(btn, path, params, name) {
    return busy(btn, () => API.download(path, params, name).catch((err) => toast(err.message, 'error')));
}

/* ===========================================================
   Module configs
   =========================================================== */
const M = {};

/* ----- Academics ----- */
M.subjects = Crud.page({
    endpoint: '/subjects', title: 'Subjects', singular: 'subject', icon: 'book', search: 'Name or code', reset: ['subjects'],
    filters: [{ name: 'type', label: 'Type', options: ['theory', 'practical', 'both'] }],
    columns: [{ label: 'Code', key: 'code' }, { label: 'Subject', render: (r) => `<b>${esc(r.name)}</b>` }, { label: 'Type', render: (r) => fmt.cap(r.type) }],
    fields: [{ row: [{ name: 'name', label: 'Name', required: true }, { name: 'code', label: 'Code', required: true }] }, { name: 'type', label: 'Type', type: 'select', options: ['theory', 'practical', 'both'], value: 'theory', placeholder: '' }],
});
M.classSubjects = Crud.page({
    endpoint: '/class-subjects', title: 'Class subjects', singular: 'subject to class', search: false, icon: 'book',
    intro: 'Which subjects each class studies, and who teaches them.',
    filters: [filt.cls, { name: 'teacher_id', label: 'Teacher', options: () => Lookups.teachers() }],
    columns: [{ label: 'Class', render: (r) => esc(r.school_class?.name || '—') }, { label: 'Subject', render: (r) => `<b>${esc(r.subject?.name || '—')}</b> <small>${esc(r.subject?.code || '')}</small>` }, { label: 'Teacher', render: (r) => esc(r.teacher?.name || '—') }],
    name: (r) => `${r.subject?.name} – ${r.school_class?.name}`,
    fields: [F.classSel(), F.subjectSel(), F.teacherSel()],
});
M.timetable = Crud.page({
    endpoint: '/timetables', title: 'Timetable', singular: 'period', search: false, icon: 'clock',
    filters: [filt.sec, { name: 'day', label: 'Day', options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }, { name: 'teacher_id', label: 'Teacher', options: () => Lookups.teachers() }],
    params: () => ({ per_page: 100 }),
    columns: [{ label: 'Day', render: (r) => fmt.cap(r.day) }, { label: 'Time', cls: 'nowrap', render: (r) => `${fmt.time(r.start_time)} – ${fmt.time(r.end_time)}` },
        { label: 'Class', render: (r) => `${esc(r.section?.school_class?.name || '')} – ${esc(r.section?.name || '')}` }, { label: 'Subject', render: (r) => `<b>${esc(r.subject?.name || '')}</b>` },
        { label: 'Teacher', render: (r) => esc(r.teacher?.name || '—') }, { label: 'Room', key: 'room' }],
    name: (r) => `${fmt.cap(r.day)} ${fmt.time(r.start_time)} ${r.subject?.name || ''}`,
    fields: [F.sectionSel(), { row: [F.subjectSel(), F.teacherSel()] }, { row: [{ name: 'day', label: 'Day', type: 'select', required: true, options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }, { name: 'room', label: 'Room' }] },
        { row: [{ name: 'start_time', label: 'Start', type: 'time', required: true }, { name: 'end_time', label: 'End', type: 'time', required: true }] }],
});
M.homework = Crud.page({
    endpoint: '/homework', title: 'Homework', singular: 'homework', search: 'Title', icon: 'book',
    filters: [filt.sec, { name: 'subject_id', label: 'Subject', options: () => Lookups.subjects() }],
    columns: [{ label: 'Assigned', cls: 'nowrap', render: (r) => fmt.date(r.assigned_date) }, { label: 'Title', render: (r) => `<b>${esc(r.title)}</b><br><small class="clamp">${esc(r.description || '')}</small>` },
        { label: 'Class', render: (r) => `${esc(r.section?.school_class?.name || '')} – ${esc(r.section?.name || '')}` }, { label: 'Subject', render: (r) => esc(r.subject?.name || '') },
        { label: 'Due', cls: 'nowrap', render: (r) => fmt.date(r.due_date) }],
    actions: [{ label: 'Submissions', text: true, run: (r) => Pages.homeworkSubmissions(r).catch((e) => toast(e.message, 'error')) }, { label: 'Download attachment', icon: 'download', show: (r) => !!r.attachment, run: (r) => window.open(storageUrl(r.attachment), '_blank') }],
    fields: [F.sectionSel(), { row: [F.subjectSel(), F.teacherSel()] }, { name: 'title', label: 'Title', required: true }, { name: 'description', label: 'Details', type: 'textarea' },
        { row: [{ name: 'assigned_date', label: 'Assigned on', type: 'date', value: fmt.today() }, { name: 'due_date', label: 'Due date', type: 'date' }] }, { name: 'attachment', label: 'Attachment (optional)', type: 'file' }],
});
M.materials = Crud.page({
    endpoint: '/study-materials', title: 'Download center', singular: 'material', search: 'Title', icon: 'download',
    filters: [{ name: 'type', label: 'Type', options: ['assignment', 'syllabus', 'study_material', 'circular', 'other'] }, filt.cls],
    columns: [{ label: 'Title', render: (r) => `<b>${esc(r.title)}</b><br><small>${fmt.cap(r.type)}</small>` }, { label: 'For', render: (r) => esc(r.school_class?.name ? `${r.school_class.name}${r.section ? ' – ' + r.section.name : ''}` : 'Everyone') },
        { label: 'Subject', render: (r) => esc(r.subject?.name || '—') }, { label: 'Public', render: (r) => yesNo(r.is_public) }, { label: 'Added', cls: 'nowrap', render: (r) => fmt.date(r.created_at) }],
    actions: [{ label: 'Open', icon: 'download', show: (r) => !!(r.file || r.link), run: (r) => window.open(r.file ? storageUrl(r.file) : r.link, '_blank') }],
    fields: [{ name: 'title', label: 'Title', required: true }, { row: [{ name: 'type', label: 'Type', type: 'select', required: true, options: ['assignment', 'syllabus', 'study_material', 'circular', 'other'], value: 'study_material' }, F.subjectSel(false)] },
        { row: [F.classSel('school_class_id', false), F.sectionSel('section_id', false, 'Section (optional)')] }, { name: 'description', label: 'Description', type: 'textarea' },
        { row: [{ name: 'file', label: 'File', type: 'file' }, { name: 'link', label: 'Or a link (URL)', type: 'url' }] }, { name: 'is_public', label: 'Visible to everyone', type: 'checkbox', value: true }],
});

/* ----- Exams ----- */
M.exams = Crud.page({
    endpoint: '/exams', title: 'Exams', singular: 'exam', search: 'Exam name', icon: 'award', reset: ['exams'],
    filters: [{ name: 'academic_session_id', label: 'Session', options: () => Lookups.sessions() }],
    columns: [{ label: 'Exam', render: (r) => `<b>${esc(r.name)}</b><br><small>${esc(r.academic_session?.name || '')}</small>` }, { label: 'Dates', cls: 'nowrap', render: (r) => `${fmt.date(r.start_date)} – ${fmt.date(r.end_date)}` },
        { label: 'Results published', render: (r) => yesNo(r.is_published) }],
    actions: [{ label: 'Results', text: true, run: (r) => go('/results', { exam: r.id }) }],
    fields: [{ name: 'name', label: 'Exam name', required: true }, F.sessionSel(), { row: [{ name: 'start_date', label: 'Start date', type: 'date' }, { name: 'end_date', label: 'End date', type: 'date' }] },
        { name: 'description', label: 'Description', type: 'textarea', rows: 2 }, { name: 'is_published', label: 'Publish results to parents & students', type: 'checkbox' }],
});
M.examSchedule = Crud.page({
    endpoint: '/exam-schedules', title: 'Date sheet', singular: 'paper', search: false, icon: 'calendar',
    filters: [{ name: 'exam_id', label: 'Exam', options: () => Lookups.exams() }, filt.cls],
    params: () => ({ per_page: 50 }),
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.exam_date) }, { label: 'Time', cls: 'nowrap', render: (r) => r.start_time ? `${fmt.time(r.start_time)} – ${fmt.time(r.end_time)}` : '—' },
        { label: 'Exam', render: (r) => esc(r.exam?.name || '') }, { label: 'Class', render: (r) => esc(r.school_class?.name || '') }, { label: 'Subject', render: (r) => `<b>${esc(r.subject?.name || '')}</b>` },
        { label: 'Marks', render: (r) => `${fmt.num(r.total_marks)} (pass ${fmt.num(r.pass_marks)})` }, { label: 'Room', key: 'room' }],
    name: (r) => `${r.subject?.name} – ${r.school_class?.name}`,
    fields: [{ row: [{ name: 'exam_id', label: 'Exam', type: 'select', required: true, options: () => Lookups.exams() }, F.classSel()] }, { row: [F.subjectSel(), { name: 'exam_date', label: 'Date', type: 'date', required: true }] },
        { row: [{ name: 'start_time', label: 'Start', type: 'time' }, { name: 'end_time', label: 'End', type: 'time' }] },
        { row: [{ name: 'total_marks', label: 'Total marks', type: 'number', value: 100 }, { name: 'pass_marks', label: 'Pass marks', type: 'number', value: 33 }] }, { name: 'room', label: 'Room' }],
});
M.grades = Crud.page({
    endpoint: '/grades', title: 'Grades', singular: 'grade', search: false, icon: 'award',
    params: () => ({ per_page: 50 }),
    columns: [{ label: 'Grade', render: (r) => `<b>${esc(r.name)}</b>` }, { label: 'Percentage', render: (r) => `${fmt.num(r.min_percentage)}% – ${fmt.num(r.max_percentage)}%` }, { label: 'GPA', render: (r) => fmt.num(r.grade_point) }, { label: 'Remarks', key: 'remarks' }],
    fields: [{ row: [{ name: 'name', label: 'Grade', required: true }, { name: 'grade_point', label: 'Grade point', type: 'number', attrs: 'step="0.1"' }] },
        { row: [{ name: 'min_percentage', label: 'Min %', type: 'number', required: true }, { name: 'max_percentage', label: 'Max %', type: 'number', required: true }] }, { name: 'remarks', label: 'Remarks' }],
});

/* ----- People ----- */
M.guardians = Crud.page({
    endpoint: '/guardians', title: 'Parents / guardians', singular: 'guardian', search: 'Name, phone, CNIC', icon: 'users', reset: ['guardians'],
    columns: [{ label: 'Guardian', render: (r) => `<b>${esc(r.name)}</b><br><small>${esc(r.relation || '')} · ${esc(r.occupation || '')}</small>` }, { label: 'Phone', cls: 'nowrap', key: 'phone' }, { label: 'CNIC', cls: 'nowrap', key: 'cnic' },
        { label: 'Children', render: (r) => (r.students || []).map((s) => esc(s.full_name)).join(', ') || '—' }, { label: 'Portal login', render: (r) => esc(r.user?.email || 'None') }],
    fields: (r) => [{ row: [{ name: 'name', label: 'Name', required: true }, { name: 'relation', label: 'Relation', value: 'Father' }] }, { row: [{ name: 'phone', label: 'Phone', required: true }, { name: 'alternate_phone', label: 'Alternate phone' }] },
        { row: [{ name: 'email', label: 'Email', type: 'email' }, { name: 'cnic', label: 'CNIC' }] }, { name: 'occupation', label: 'Occupation' }, { name: 'address', label: 'Address', type: 'textarea', rows: 2 },
        { name: 'create_login', label: r?.user ? 'Has parent portal login (update below)' : 'Create a parent portal login', type: 'checkbox', value: !!r?.user },
        { row: [{ name: 'login_email', label: 'Login email', type: 'email', value: (x) => x?.user?.email || x?.email }, { name: 'password', label: r?.user ? 'New password (optional)' : 'Password (min 6)', type: 'password' }] }],
    beforeSave: (b) => { if (!b.create_login) { delete b.login_email; delete b.password; } return b; },
});
M.users = Crud.page({
    endpoint: '/users', title: 'User accounts', singular: 'user', search: 'Name, email, phone', icon: 'user', reset: ['users'],
    filters: [{ name: 'role', label: 'Role', options: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian', 'receptionist'] }],
    columns: [{ label: 'Name', render: (r) => `<b>${esc(r.name)}</b>` }, { label: 'Email', key: 'email' }, { label: 'Role', render: (r) => badge('', fmt.cap(r.role)) }, { label: 'Active', render: (r) => yesNo(r.is_active) }, { label: '2FA', render: (r) => (r.two_factor_confirmed_at ? badge('active', 'On') : '<small class="muted">Off</small>') }, { label: 'Last login', cls: 'nowrap', render: (r) => fmt.relative(r.last_login_at) || '—' }],
    actions: [{ label: 'Turn off 2FA', text: true, show: (r) => !!r.two_factor_confirmed_at, run: async (r) => {
        if (!(await confirmBox(`Turn off two-factor login for ${r.name}? Use this when they lost their phone. They can sign in with the password and set it up again.`, { okText: 'Turn off', danger: true }))) return;
        try { toast((await API.post(`/users/${r.id}/reset-two-factor`)).message); Router.resolve(); } catch (e) { toast(e.message, 'error'); }
    } }],
    fields: (r) => [{ row: [{ name: 'name', label: 'Name', required: true }, { name: 'phone', label: 'Phone' }] }, { row: [{ name: 'email', label: 'Email', type: 'email', required: true }, { name: 'role', label: 'Role', type: 'select', required: true, options: ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian', 'receptionist'] }] },
        { name: 'password', label: r ? 'New password (leave empty to keep)' : 'Password (min 6)', type: 'password', required: !r }, { name: 'is_active', label: 'Active (can log in)', type: 'checkbox', value: true }],
    beforeSave: (b) => { if (!b.password) delete b.password; return b; },
});

/* ----- Finance ----- */
M.feeTypes = Crud.page({
    endpoint: '/fee-types', title: 'Fee types', singular: 'fee type', search: 'Name', icon: 'wallet', reset: ['feeTypes'],
    filters: [{ name: 'frequency', label: 'Frequency', options: ['monthly', 'yearly', 'one_time'] }],
    columns: [{ label: 'Fee type', render: (r) => `<b>${esc(r.name)}</b>` }, { label: 'Frequency', render: (r) => fmt.cap(r.frequency) }, { label: 'Description', key: 'description' }],
    fields: [{ name: 'name', label: 'Name', required: true }, { name: 'frequency', label: 'Frequency', type: 'select', required: true, options: ['monthly', 'yearly', 'one_time'], value: 'monthly' }, { name: 'description', label: 'Description' }],
});
M.feeStructures = Crud.page({
    endpoint: '/fee-structures', title: 'Fee structure', singular: 'fee amount', search: false, icon: 'wallet',
    intro: 'How much each class pays for each fee type. Monthly invoices are generated from this.',
    filters: [filt.cls, { name: 'fee_type_id', label: 'Fee type', options: () => Lookups.feeTypes() }],
    params: () => ({ per_page: 100 }),
    columns: [{ label: 'Class', render: (r) => `<b>${esc(r.school_class?.name || '')}</b>` }, { label: 'Fee type', render: (r) => `${esc(r.fee_type?.name || '')} <small>(${fmt.cap(r.fee_type?.frequency)})</small>` },
        { label: 'Session', render: (r) => esc(r.academic_session?.name || 'All') }, { label: 'Amount', cls: 'num', render: (r) => fmt.money(r.amount) }],
    name: (r) => `${r.fee_type?.name} – ${r.school_class?.name}`,
    fields: [{ row: [F.classSel(), { name: 'fee_type_id', label: 'Fee type', type: 'select', required: true, options: () => Lookups.feeTypes() }] }, { row: [F.sessionSel(), { name: 'amount', label: 'Amount', type: 'number', required: true, attrs: 'min="0"' }] }],
});
M.onlinePayments = Crud.page({
    endpoint: '/payment-submissions', title: 'Online payments', singular: 'payment', search: false, icon: 'money', canDelete: false,
    intro: 'Payments that parents submitted from the portal (bank / JazzCash / Easypaisa). Approve to post them to the invoice.',
    filters: [{ name: 'status', label: 'Status', options: ['pending', 'approved', 'rejected', 'all'], default: 'pending', all: false, passAll: true }],
    columns: [{ label: 'Submitted', cls: 'nowrap', render: (r) => fmt.date(r.created_at) }, { label: 'Student', render: (r) => esc(r.student ? studentLabel(r.student) : '—') },
        { label: 'Invoice', render: (r) => `${esc(r.invoice?.invoice_no || '')}<br><small>${fmt.month(r.invoice?.month)}</small>` }, { label: 'Amount', cls: 'num', render: (r) => fmt.money(r.amount) },
        { label: 'Method / ref', render: (r) => `${esc(r.payment_method?.name || fmt.cap(r.method))}<br><small>${esc(r.reference || '')}</small>` }, { label: 'Status', render: (r) => badge(r.status) + (r.remarks ? `<br><small>${esc(r.remarks)}</small>` : '') }],
    actions: [
        { label: 'Proof', icon: 'file', show: (r) => !!r.proof, run: (r) => window.open(storageUrl(r.proof), '_blank') },
        { label: 'Approve', primary: true, text: true, show: (r) => r.status === 'pending', run: async (r, b) => { if (!(await confirmBox(`Approve ${fmt.money(r.amount)} and post it to ${r.invoice?.invoice_no}?`))) return; busy(b, async () => { try { toast((await API.post(`/payment-submissions/${r.id}/approve`)).message); Router.resolve(); } catch (e) { toast(e.message, 'error'); } }); } },
        { label: 'Reject', text: true, show: (r) => r.status === 'pending', run: (r) => formModal({ title: 'Reject payment', submitText: 'Reject', fields: field('Reason *', inp('remarks', '', 'text', 'required')), onSubmit: async (v, _f, close) => { toast((await API.post(`/payment-submissions/${r.id}/reject`, v)).message); close(); Router.resolve(); } }) },
    ],
});
M.expenses = Crud.page({
    endpoint: '/expenses', title: 'Expenses', singular: 'expense', search: 'Title or reference', icon: 'money',
    filters: [filt.from, filt.to],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.expense_date) }, { label: 'Title', render: (r) => `<b>${esc(r.title)}</b><br><small>${esc(r.notes || '')}</small>` }, { label: 'Category', key: 'category' },
        { label: 'Method', render: (r) => esc(fmt.cap(r.payment_method || '—')) }, { label: 'Amount', cls: 'num', render: (r) => fmt.money(r.amount) }],
    fields: [{ name: 'title', label: 'Title', required: true }, { row: [{ name: 'category', label: 'Category', required: true, attrs: 'list="expCats" placeholder="e.g. Utilities"' }, { name: 'amount', label: 'Amount', type: 'number', required: true }] },
        { html: '<datalist id="expCats"><option>Utilities</option><option>Rent</option><option>Stationery</option><option>Maintenance</option><option>Transport</option><option>Events</option><option>Miscellaneous</option></datalist>' },
        { row: [{ name: 'expense_date', label: 'Date', type: 'date', required: true, value: fmt.today() }, F.methodSel()] }, { name: 'reference', label: 'Reference' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});
M.incomes = Crud.page({
    endpoint: '/incomes', title: 'Other income', singular: 'income', search: 'Title, received from', icon: 'money',
    intro: 'Income other than student fees (uniform sales, donations, canteen…).',
    filters: [filt.from, filt.to],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.income_date) }, { label: 'Title', render: (r) => `<b>${esc(r.title)}</b><br><small>${esc(r.received_from || '')}</small>` }, { label: 'Category', key: 'category' },
        { label: 'Method', render: (r) => esc(fmt.cap(r.payment_method || '—')) }, { label: 'Amount', cls: 'num', render: (r) => fmt.money(r.amount) }],
    fields: [{ name: 'title', label: 'Title', required: true }, { row: [{ name: 'category', label: 'Category', required: true, attrs: 'placeholder="e.g. Uniform Sales"' }, { name: 'amount', label: 'Amount', type: 'number', required: true }] },
        { row: [{ name: 'income_date', label: 'Date', type: 'date', required: true, value: fmt.today() }, { name: 'received_from', label: 'Received from' }] }, { row: [F.methodSel(), { name: 'reference', label: 'Reference' }] }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});

/* ----- Inventory ----- */
M.items = Crud.page({
    endpoint: '/inventory-items', title: 'Store items', singular: 'item', search: 'Item or location', icon: 'box', reset: ['items'],
    columns: [{ label: 'Item', render: (r) => `<b>${esc(r.name)}</b><br><small>${esc(r.category || '')}</small>` }, { label: 'In stock', render: (r) => `${fmt.num(r.quantity)} ${esc(r.unit || '')}${Number(r.quantity) <= Number(r.reorder_level || 0) ? ' ' + badge('overdue', 'Low') : ''}` },
        { label: 'Reorder at', render: (r) => fmt.num(r.reorder_level) }, { label: 'Unit price', cls: 'num', render: (r) => fmt.money(r.unit_price) }, { label: 'Location', key: 'location' }],
    actions: [{ label: 'Stock in / out', text: true, run: (r) => stockForm(r) }],
    fields: (r) => [{ row: [{ name: 'name', label: 'Item name', required: true }, { name: 'category', label: 'Category' }] }, { row: [{ name: 'unit', label: 'Unit', value: 'pcs' }, { name: 'unit_price', label: 'Unit price', type: 'number' }] },
        { row: [{ name: 'reorder_level', label: 'Reorder level', type: 'number', value: 0 }, { name: 'location', label: 'Location' }] }, ...(r ? [] : [{ name: 'opening_stock', label: 'Opening stock', type: 'number', value: 0 }]), { name: 'description', label: 'Description', type: 'textarea', rows: 2 }],
});
async function stockForm(item = null) {
    const [items, suppliers] = await Promise.all([Lookups.items(), Lookups.suppliers()]);
    const { form } = formModal({
        title: item ? `Stock movement · ${item.name}` : 'Stock movement', submitText: 'Save',
        fields: await fieldsHtml([{ name: 'inventory_item_id', label: 'Item', type: 'select', required: true, options: items, value: item?.id },
            { row: [{ name: 'type', label: 'Type', type: 'select', required: true, options: [{ id: 'in', name: 'Stock in (purchase)' }, { id: 'out', name: 'Stock out (issue)' }, { id: 'adjustment', name: 'Adjustment (set count)' }], value: 'in', placeholder: '' }, { name: 'quantity', label: 'Quantity', type: 'number', required: true }] },
            { row: [{ name: 'unit_price', label: 'Unit price', type: 'number' }, { name: 'movement_date', label: 'Date', type: 'date', value: fmt.today() }] },
            { row: [{ name: 'supplier_id', label: 'Supplier', type: 'select', options: suppliers }, { name: 'issued_to', label: 'Issued to (for stock out)' }] }, { name: 'reference', label: 'Reference' }]),
        onSubmit: async (v, _f, close) => { toast((await API.post('/stock-movements', clean(v))).message); close(); Lookups.reset('items'); Router.resolve(); },
    });
    return form;
}
M.stock = Crud.page({
    endpoint: '/stock-movements', title: 'Stock movements', singular: 'movement', search: false, icon: 'box', canDelete: false,
    filters: [{ name: 'inventory_item_id', label: 'Item', options: () => Lookups.items() }, { name: 'type', label: 'Type', options: ['in', 'out', 'adjustment'] }, filt.from, filt.to],
    toolbar: [{ label: 'New movement', icon: 'plus', run: () => stockForm() }],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.movement_date) }, { label: 'Item', render: (r) => `<b>${esc(r.item?.name || r.inventory_item?.name || '#' + r.inventory_item_id)}</b>` },
        { label: 'Type', render: (r) => badge(r.type === 'in' ? 'paid' : r.type === 'out' ? 'unpaid' : 'leave', fmt.cap(r.type)) }, { label: 'Qty', cls: 'num', render: (r) => fmt.num(r.quantity) },
        { label: 'Issued to / supplier', render: (r) => esc(r.issued_to || r.supplier?.name || '—') }, { label: 'Reference', key: 'reference' }],
});
M.suppliers = Crud.page({
    endpoint: '/suppliers', title: 'Suppliers', singular: 'supplier', search: 'Name, contact, phone', icon: 'box', reset: ['suppliers'],
    columns: [{ label: 'Supplier', render: (r) => `<b>${esc(r.name)}</b><br><small>${esc(r.contact_person || '')}</small>` }, { label: 'Phone', key: 'phone' }, { label: 'Email', key: 'email' }, { label: 'Address', key: 'address' }],
    fields: [{ row: [{ name: 'name', label: 'Name', required: true }, { name: 'contact_person', label: 'Contact person' }] }, { row: [{ name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email', type: 'email' }] }, { name: 'address', label: 'Address', type: 'textarea', rows: 2 }],
});
M.assets = Crud.page({
    endpoint: '/assets', title: 'Assets', singular: 'asset', search: 'Name, code, location', icon: 'box',
    filters: [{ name: 'condition', label: 'Condition', options: ['new', 'good', 'fair', 'poor', 'damaged', 'disposed'] }],
    columns: [{ label: 'Code', key: 'asset_code' }, { label: 'Asset', render: (r) => `<b>${esc(r.name)}</b><br><small>${esc(r.category || '')}</small>` }, { label: 'Location', render: (r) => `${esc(r.location || '—')}<br><small>${esc(r.assigned_to || '')}</small>` },
        { label: 'Purchased', cls: 'nowrap', render: (r) => `${fmt.date(r.purchase_date)}<br><small>${fmt.money(r.purchase_cost)}</small>` }, { label: 'Condition', render: (r) => badge(['poor', 'damaged', 'disposed'].includes(r.condition) ? 'overdue' : 'active', fmt.cap(r.condition)) }],
    fields: [{ row: [{ name: 'name', label: 'Asset name', required: true }, { name: 'asset_code', label: 'Asset code' }] }, { row: [{ name: 'category', label: 'Category' }, { name: 'condition', label: 'Condition', type: 'select', options: ['new', 'good', 'fair', 'poor', 'damaged', 'disposed'], value: 'good' }] },
        { row: [{ name: 'purchase_date', label: 'Purchase date', type: 'date' }, { name: 'purchase_cost', label: 'Cost', type: 'number' }] }, { row: [{ name: 'supplier_id', label: 'Supplier', type: 'select', options: () => Lookups.suppliers() }, { name: 'location', label: 'Location' }] },
        { name: 'assigned_to', label: 'Assigned to' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});

/* ----- Front office ----- */
M.enquiries = Crud.page({
    endpoint: '/admission-enquiries', title: 'Admission enquiries', singular: 'enquiry', search: 'Name, phone, student', icon: 'phone',
    filters: [{ name: 'status', label: 'Status', options: ['open', 'follow_up', 'converted', 'closed'] }, { name: 'source', label: 'Source', options: ['walk_in', 'phone', 'website', 'social_media', 'referral', 'other'] }],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.enquiry_date) }, { label: 'Parent', render: (r) => `<b>${esc(r.name)}</b><br><small>${esc(r.phone)}</small>` }, { label: 'Student / class', render: (r) => `${esc(r.student_name || '—')}<br><small>${esc(r.school_class?.name || '')}</small>` },
        { label: 'Source', render: (r) => fmt.cap(r.source) }, { label: 'Follow up', cls: 'nowrap', render: (r) => fmt.date(r.follow_up_date) }, { label: 'Status', render: (r) => badge(r.status === 'converted' ? 'approved' : r.status === 'closed' ? 'cancelled' : 'pending', fmt.cap(r.status)) }],
    fields: [{ row: [{ name: 'name', label: 'Parent name', required: true }, { name: 'phone', label: 'Phone', required: true }] }, { row: [{ name: 'student_name', label: 'Student name' }, F.classSel('school_class_id', false, 'Class wanted')] },
        { row: [{ name: 'source', label: 'Source', type: 'select', options: ['walk_in', 'phone', 'website', 'social_media', 'referral', 'other'], value: 'walk_in' }, { name: 'status', label: 'Status', type: 'select', options: ['open', 'follow_up', 'converted', 'closed'], value: 'open', placeholder: '' }] },
        { row: [{ name: 'enquiry_date', label: 'Enquiry date', type: 'date', value: fmt.today() }, { name: 'follow_up_date', label: 'Follow-up date', type: 'date' }] }, { row: [{ name: 'email', label: 'Email', type: 'email' }, F.userSel()] }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});
M.visitors = Crud.page({
    endpoint: '/visitors', title: 'Visitor book', singular: 'visitor', search: 'Name, phone, purpose', icon: 'users',
    filters: [filt.from, filt.to],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => `${fmt.date(r.visit_date)}<br><small>${fmt.time(r.in_time)}${r.out_time ? ' – ' + fmt.time(r.out_time) : ''}</small>` }, { label: 'Visitor', render: (r) => `<b>${esc(r.name)}</b><br><small>${esc(r.phone || '')}</small>` },
        { label: 'Purpose', key: 'purpose' }, { label: 'To meet', key: 'person_to_meet' }, { label: 'Persons', key: 'number_of_persons' }],
    fields: [{ row: [{ name: 'name', label: 'Name', required: true }, { name: 'phone', label: 'Phone' }] }, { row: [{ name: 'purpose', label: 'Purpose', required: true }, { name: 'person_to_meet', label: 'Person to meet' }] },
        { row: [{ name: 'cnic', label: 'CNIC' }, { name: 'number_of_persons', label: 'No. of persons', type: 'number', value: 1 }] },
        { row: [{ name: 'visit_date', label: 'Date', type: 'date', value: fmt.today() }, { name: 'in_time', label: 'In time', type: 'time', value: () => new Date().toTimeString().slice(0, 5) }] }, { name: 'out_time', label: 'Out time', type: 'time' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});
M.calls = Crud.page({
    endpoint: '/phone-calls', title: 'Phone call log', singular: 'call', search: 'Name, phone', icon: 'phone',
    filters: [{ name: 'call_type', label: 'Type', options: ['incoming', 'outgoing'] }, filt.from, filt.to],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.call_date) }, { label: 'Caller', render: (r) => `<b>${esc(r.name)}</b><br><small>${esc(r.phone)}</small>` }, { label: 'Type', render: (r) => fmt.cap(r.call_type) },
        { label: 'Details', render: (r) => `<span class="clamp">${esc(r.description || '')}</span>` }, { label: 'Follow up', cls: 'nowrap', render: (r) => fmt.date(r.follow_up_date) }],
    fields: [{ row: [{ name: 'name', label: 'Name', required: true }, { name: 'phone', label: 'Phone', required: true }] }, { row: [{ name: 'call_type', label: 'Type', type: 'select', required: true, options: ['incoming', 'outgoing'], value: 'incoming' }, { name: 'call_date', label: 'Date', type: 'date', value: fmt.today() }] },
        { row: [{ name: 'duration', label: 'Duration', attrs: 'placeholder="e.g. 5 min"' }, { name: 'follow_up_date', label: 'Follow-up date', type: 'date' }] }, { name: 'description', label: 'Details', type: 'textarea' }],
});
M.postal = Crud.page({
    endpoint: '/postal-records', title: 'Postal receive / dispatch', singular: 'postal record', search: 'Title, reference, from/to', icon: 'send',
    filters: [{ name: 'type', label: 'Type', options: ['receive', 'dispatch'] }, filt.from, filt.to],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.postal_date) }, { label: 'Type', render: (r) => badge(r.type === 'receive' ? 'leave' : 'pending', fmt.cap(r.type)) }, { label: 'Title', render: (r) => `<b>${esc(r.title)}</b><br><small>${esc(r.reference_no || '')}</small>` },
        { label: 'From → To', render: (r) => `${esc(r.from_title || '—')} → ${esc(r.to_title || '—')}` }],
    actions: [{ label: 'Attachment', icon: 'download', show: (r) => !!r.attachment, run: (r) => window.open(storageUrl(r.attachment), '_blank') }],
    fields: [{ row: [{ name: 'type', label: 'Type', type: 'select', required: true, options: ['receive', 'dispatch'], value: 'receive' }, { name: 'postal_date', label: 'Date', type: 'date', value: fmt.today() }] }, { row: [{ name: 'title', label: 'Title', required: true }, { name: 'reference_no', label: 'Reference no' }] },
        { row: [{ name: 'from_title', label: 'From' }, { name: 'to_title', label: 'To' }] }, { name: 'address', label: 'Address', type: 'textarea', rows: 2 }, { name: 'attachment', label: 'Attachment', type: 'file' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});
M.complaints = Crud.page({
    endpoint: '/complaints', title: 'Complaints', singular: 'complaint', search: 'Name, phone, type', icon: 'alert',
    filters: [{ name: 'status', label: 'Status', options: ['open', 'in_progress', 'resolved', 'closed'] }],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.complaint_date) }, { label: 'Complainant', render: (r) => `<b>${esc(r.complainant_name)}</b><br><small>${esc(r.phone || '')}</small>` }, { label: 'Type', key: 'complaint_type' },
        { label: 'Complaint', render: (r) => `<span class="clamp">${esc(r.description)}</span>` }, { label: 'Assigned', render: (r) => esc(r.assignee?.name || '—') }, { label: 'Status', render: (r) => badge(['resolved', 'closed'].includes(r.status) ? 'resolved' : 'pending', fmt.cap(r.status)) }],
    fields: [{ row: [{ name: 'complainant_name', label: 'Complainant', required: true }, { name: 'phone', label: 'Phone' }] }, { row: [{ name: 'complaint_type', label: 'Type', attrs: 'placeholder="e.g. Transport, Fee, Staff"' }, { name: 'source', label: 'Source', attrs: 'placeholder="e.g. Phone, In person"' }] },
        { name: 'description', label: 'Complaint', type: 'textarea', required: true }, { row: [{ name: 'complaint_date', label: 'Date', type: 'date', value: fmt.today() }, F.userSel()] },
        { name: 'status', label: 'Status', type: 'select', options: ['open', 'in_progress', 'resolved', 'closed'], value: 'open', placeholder: '' }, { name: 'action_taken', label: 'Action taken', type: 'textarea', rows: 2 }],
});

/* ----- Library ----- */
M.books = Crud.page({
    endpoint: '/books', title: 'Books', singular: 'book', search: 'Title, author, ISBN', icon: 'library', reset: ['books'],
    columns: [{ label: 'Title', render: (r) => `<b>${esc(r.title)}</b><br><small>${esc(r.author || '')}</small>` }, { label: 'ISBN', key: 'isbn' }, { label: 'Category', key: 'category' }, { label: 'Rack', key: 'rack_no' },
        { label: 'Available', render: (r) => `${r.available ?? '—'} / ${r.quantity}` }],
    actions: [{ label: 'Issue', text: true, show: (r) => (r.available ?? 1) > 0, run: (r) => issueForm(r) }],
    fields: [{ name: 'title', label: 'Title', required: true }, { row: [{ name: 'author', label: 'Author' }, { name: 'isbn', label: 'ISBN' }] }, { row: [{ name: 'category', label: 'Category' }, { name: 'publisher', label: 'Publisher' }] },
        { row: [{ name: 'edition', label: 'Edition' }, { name: 'rack_no', label: 'Rack no' }] }, { name: 'quantity', label: 'Copies', type: 'number', required: true, value: 1 }],
});
async function issueForm(book = null) {
    const [books, students, teachers] = await Promise.all([Lookups.books(), Lookups.students(), Lookups.teachers()]);
    const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const { form } = formModal({
        title: 'Issue book', submitText: 'Issue',
        fields: await fieldsHtml([{ name: 'book_id', label: 'Book', type: 'select', required: true, options: books.filter((b) => (b.available ?? 1) > 0).map((b) => ({ id: b.id, name: `${b.title} (${b.available ?? '?'} left)` })), value: book?.id },
            { name: 'borrower', label: 'Borrower', type: 'select', options: [{ id: 'student', name: 'Student' }, { id: 'teacher', name: 'Staff' }], value: 'student', placeholder: '' },
            { name: 'student_id', label: 'Student', type: 'select', options: students.map((s) => ({ id: s.id, name: `${studentLabel(s)} · ${s.school_class?.name || ''}` })) },
            { name: 'teacher_id', label: 'Staff member', type: 'select', options: teachers },
            { row: [{ name: 'issue_date', label: 'Issue date', type: 'date', value: fmt.today() }, { name: 'due_date', label: 'Due date', type: 'date', value: due }] }]),
        onSubmit: async (v, _f, close) => {
            const b = clean(v); if (b.borrower === 'student') delete b.teacher_id; else delete b.student_id; delete b.borrower;
            toast((await API.post('/book-issues', b)).message); close(); Lookups.reset('books'); go('/library-issues');
        },
    });
    const sync = () => { const s = $('[name=borrower]', form).value === 'student'; $('[name=student_id]', form).closest('.field').classList.toggle('hidden', !s); $('[name=teacher_id]', form).closest('.field').classList.toggle('hidden', s); };
    $('[name=borrower]', form).onchange = sync; sync();
}
M.issues = Crud.page({
    endpoint: '/book-issues', title: 'Issued books', singular: 'issue', search: false, icon: 'library', canDelete: false,
    filters: [{ name: 'status', label: 'Status', options: ['issued', 'returned', 'lost', 'all'], default: 'issued', all: false }],
    toolbar: [{ label: 'Issue a book', icon: 'plus', run: () => issueForm() }],
    columns: [{ label: 'Book', render: (r) => `<b>${esc(r.book?.title || '')}</b><br><small>${esc(r.book?.author || '')}</small>` }, { label: 'Borrower', render: (r) => esc(r.student ? studentLabel(r.student) : r.teacher ? `${r.teacher.name} (staff)` : '—') },
        { label: 'Issued', cls: 'nowrap', render: (r) => fmt.date(r.issue_date) }, { label: 'Due', cls: 'nowrap', render: (r) => `${fmt.date(r.due_date)}${r.status === 'issued' && d10(r.due_date) < fmt.today() ? '<br>' + badge('overdue') : ''}` },
        { label: 'Returned', cls: 'nowrap', render: (r) => fmt.date(r.return_date) }, { label: 'Fine', cls: 'num', render: (r) => (Number(r.fine) ? fmt.money(r.fine) : '—') }, { label: 'Status', render: (r) => badge(r.status === 'returned' ? 'paid' : r.status === 'lost' ? 'unpaid' : 'pending', fmt.cap(r.status)) }],
    actions: [{ label: 'Return', primary: true, text: true, show: (r) => r.status === 'issued', run: (r) => formModal({
        title: `Return · ${r.book?.title}`, submitText: 'Save return',
        fields: `<p>Leave fine empty to calculate it automatically from the late days.</p><div class="form-row">${field('Return date', inp('return_date', fmt.today(), 'date'))}${field('Fine', inp('fine', '', 'number', 'min="0"'))}</div><label class="check"><input type="checkbox" name="lost"> Book is lost</label>`,
        onSubmit: async (v, _f, close) => { toast((await API.post(`/book-issues/${r.id}/return`, clean(v))).message || 'Returned.'); close(); Lookups.reset('books'); Router.resolve(); },
    }) }],
});

/* ----- Transport ----- */
M.routes = Crud.page({
    endpoint: '/transport-routes', title: 'Transport routes', singular: 'route', search: 'Route, vehicle, driver', icon: 'bus',
    columns: [{ label: 'Route', render: (r) => `<b>${esc(r.name)}</b><br><small class="clamp">${esc(r.description || '')}</small>` }, { label: 'Vehicle', render: (r) => esc(r.vehicle?.vehicle_no || r.vehicle_no || '—') },
        { label: 'Driver', render: (r) => `${esc(r.vehicle?.driver_name || r.driver_name || '—')}<br><small>${esc(r.vehicle?.driver_phone || r.driver_phone || '')}</small>` }, { label: 'Monthly fare', cls: 'num', render: (r) => fmt.money(r.fare) }],
    fields: [{ row: [{ name: 'name', label: 'Route name', required: true }, { name: 'fare', label: 'Monthly fare', type: 'number' }] }, { name: 'vehicle_id', label: 'Vehicle', type: 'select', options: async () => (await Lookups.vehicles()).map((v) => ({ id: v.id, name: `${v.vehicle_no} ${v.model ? '· ' + v.model : ''}` })) },
        { row: [{ name: 'driver_name', label: 'Driver (if no vehicle)' }, { name: 'driver_phone', label: 'Driver phone' }] }, { name: 'description', label: 'Stops / description', type: 'textarea', rows: 2 }],
});
M.vehicles = Crud.page({
    endpoint: '/vehicles', title: 'Vehicles', singular: 'vehicle', search: 'Number, model, driver', icon: 'bus', reset: ['vehicles'],
    columns: [{ label: 'Vehicle', render: (r) => `<b>${esc(r.vehicle_no)}</b><br><small>${esc(r.model || '')}</small>` }, { label: 'Capacity', key: 'capacity' }, { label: 'Driver', render: (r) => `${esc(r.driver_name || '—')}<br><small>${esc(r.driver_phone || '')}</small>` },
        { label: 'Routes', render: (r) => (r.routes || []).map((x) => esc(x.name)).join(', ') || '—' }, { label: 'Insurance expiry', cls: 'nowrap', render: (r) => fmt.date(r.insurance_expiry) }],
    fields: [{ row: [{ name: 'vehicle_no', label: 'Vehicle no', required: true }, { name: 'model', label: 'Model' }] }, { row: [{ name: 'capacity', label: 'Capacity', type: 'number' }, { name: 'insurance_expiry', label: 'Insurance expiry', type: 'date' }] },
        { row: [{ name: 'driver_name', label: 'Driver name' }, { name: 'driver_phone', label: 'Driver phone' }] }, { name: 'driver_license', label: 'Driver licence' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});

/* ----- Hostel ----- */
M.hostels = Crud.page({
    endpoint: '/hostels', title: 'Hostels', singular: 'hostel', search: 'Name, warden', icon: 'bed', reset: ['hostels'],
    columns: [{ label: 'Hostel', render: (r) => `<b>${esc(r.name)}</b><br><small>${fmt.cap(r.type)}</small>` }, { label: 'Warden', render: (r) => `${esc(r.warden_name || '—')}<br><small>${esc(r.warden_phone || '')}</small>` },
        { label: 'Rooms', render: (r) => (r.rooms || []).length }, { label: 'Beds', render: (r) => (r.rooms || []).reduce((n, x) => n + Number(x.capacity || 0), 0) }],
    actions: [{ label: 'Rooms', text: true, run: (r) => go('/hostel-rooms', { hostel_id: r.id }) }],
    fields: [{ row: [{ name: 'name', label: 'Name', required: true }, { name: 'type', label: 'Type', type: 'select', options: ['boys', 'girls', 'mixed'], value: 'boys' }] }, { row: [{ name: 'warden_name', label: 'Warden' }, { name: 'warden_phone', label: 'Warden phone' }] },
        { name: 'address', label: 'Address', type: 'textarea', rows: 2 }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});
M.rooms = Crud.page({
    endpoint: '/hostel-rooms', title: 'Hostel rooms', singular: 'room', search: 'Room no or type', icon: 'bed',
    filters: [{ name: 'hostel_id', label: 'Hostel', options: () => Lookups.hostels() }],
    params: () => ({ per_page: 50 }),
    columns: [{ label: 'Hostel', render: (r) => esc(r.hostel?.name || '') }, { label: 'Room', render: (r) => `<b>${esc(r.room_no)}</b><br><small>${esc(r.room_type || '')}</small>` }, { label: 'Capacity', key: 'capacity' }, { label: 'Cost / month', cls: 'num', render: (r) => fmt.money(r.cost_per_month) }],
    name: (r) => `Room ${r.room_no}`,
    fields: [{ row: [{ name: 'hostel_id', label: 'Hostel', type: 'select', required: true, options: () => Lookups.hostels() }, { name: 'room_no', label: 'Room no', required: true }] },
        { row: [{ name: 'room_type', label: 'Room type', attrs: 'placeholder="e.g. 3-Seater"' }, { name: 'capacity', label: 'Beds', type: 'number', required: true, value: 3 }] }, { name: 'cost_per_month', label: 'Cost per month', type: 'number' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
});
async function allocateForm() {
    const [occ, students] = await Promise.all([API.get('/hostels-occupancy'), Lookups.students()]);
    const rooms = occ.data.flatMap((h) => h.room_details.filter((r) => r.available > 0).map((r) => ({ id: r.id, name: `${h.name} · Room ${r.room_no} (${r.available} free)` })));
    formModal({
        title: 'Allocate room', submitText: 'Allocate',
        fields: await fieldsHtml([{ name: 'student_id', label: 'Student', type: 'select', required: true, options: students.map((s) => ({ id: s.id, name: `${studentLabel(s)} · ${s.school_class?.name || ''}` })) },
            { name: 'hostel_room_id', label: 'Room', type: 'select', required: true, options: rooms }, { name: 'from_date', label: 'From', type: 'date', value: fmt.today() }, { name: 'notes', label: 'Notes' }]),
        onSubmit: async (v, _f, close) => { toast((await API.post('/hostel-allocations', clean(v))).message); close(); Router.resolve(); },
    });
}
M.allocations = Crud.page({
    endpoint: '/hostel-allocations', title: 'Hostel residents', singular: 'allocation', search: false, icon: 'bed', canDelete: false,
    filters: [{ name: 'hostel_id', label: 'Hostel', options: () => Lookups.hostels() }, { name: 'status', label: 'Status', options: ['active', 'left', 'all'], default: 'active', all: false, passAll: true }],
    toolbar: [{ label: 'Allocate room', icon: 'plus', run: allocateForm }],
    above: async (el) => {
        const occ = await API.get('/hostels-occupancy');
        el.innerHTML = `<div class="stats mb">${occ.data.map((h) => `<div class="card stat"><div class="ico tone-info">${icon('bed')}</div><div><div class="label">${esc(h.name)}</div><div class="value">${h.occupied} / ${h.beds}</div><div class="hint">${h.available} beds free · ${h.rooms} rooms</div></div></div>`).join('')}</div>`;
    },
    columns: [{ label: 'Student', render: (r) => `<b>${esc(r.student ? studentLabel(r.student) : '—')}</b><br><small>${esc(r.student?.school_class?.name || '')}</small>` }, { label: 'Room', render: (r) => `${esc(r.room?.hostel?.name || '')} · ${esc(r.room?.room_no || '')}` },
        { label: 'From', cls: 'nowrap', render: (r) => fmt.date(r.from_date) }, { label: 'To', cls: 'nowrap', render: (r) => fmt.date(r.to_date) }, { label: 'Status', render: (r) => badge(r.status) }],
    actions: [{ label: 'Vacate', text: true, show: (r) => r.status === 'active', run: async (r) => { if (!(await confirmBox(`Vacate room for ${studentLabel(r.student)}?`))) return; try { toast((await API.post(`/hostel-allocations/${r.id}/vacate`, { to_date: fmt.today() })).message); Router.resolve(); } catch (e) { toast(e.message, 'error'); } } }],
});

/* ----- Communication ----- */
M.notices = Crud.page({
    endpoint: '/notices', title: 'Notices', singular: 'notice', search: 'Title', icon: 'bell',
    filters: [{ name: 'audience', label: 'Audience', options: ['all', 'teachers', 'students', 'parents', 'staff'] }],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.publish_date || r.created_at) }, { label: 'Notice', render: (r) => `<b>${esc(r.title)}</b><br><small class="clamp">${esc(r.body)}</small>` },
        { label: 'Audience', render: (r) => `${fmt.cap(r.audience)}${r.section ? `<br><small>${esc(r.section.school_class?.name || '')} – ${esc(r.section.name)}</small>` : ''}` }, { label: 'Published', render: (r) => yesNo(r.is_published) }, { label: 'Expires', cls: 'nowrap', render: (r) => fmt.date(r.expiry_date) }],
    fields: [{ name: 'title', label: 'Title', required: true }, { name: 'body', label: 'Message', type: 'textarea', rows: 5, required: true },
        { row: [{ name: 'audience', label: 'Audience', type: 'select', required: true, options: ['all', 'teachers', 'students', 'parents', 'staff'], value: 'all' }, F.sectionSel('section_id', false, 'Only this section (optional)')] },
        { row: [{ name: 'publish_date', label: 'Publish date', type: 'date', value: fmt.today() }, { name: 'expiry_date', label: 'Expiry date', type: 'date' }] }, { name: 'is_published', label: 'Published', type: 'checkbox', value: true }],
});
M.smsLogs = Crud.page({
    endpoint: '/sms/logs', title: 'SMS / WhatsApp log', singular: 'message', search: 'Number or text', icon: 'send', canDelete: false,
    filters: [{ name: 'channel', label: 'Channel', options: ['sms', 'whatsapp'] }, { name: 'status', label: 'Status', options: ['logged', 'sent', 'failed'] }],
    toolbar: [{ label: 'Send SMS / WhatsApp', icon: 'send', run: () => smsForm() }],
    intro: 'With SMS_DRIVER=log in .env, messages are only saved here (not really sent). Set up an SMS / WhatsApp API in .env to send for real.',
    columns: [{ label: 'Time', cls: 'nowrap', render: (r) => fmt.datetime(r.created_at) }, { label: 'To', key: 'to' }, { label: 'Channel', render: (r) => fmt.cap(r.channel) }, { label: 'Message', render: (r) => `<span class="clamp">${esc(r.message)}</span>` }, { label: 'Status', render: (r) => badge(r.status === 'failed' ? 'unpaid' : 'paid', fmt.cap(r.status)) }],
});
async function smsForm(preset = {}) {
    const { form } = formModal({
        title: 'Send SMS / WhatsApp', submitText: 'Send',
        fields: await fieldsHtml([{ row: [{ name: 'audience', label: 'Send to', type: 'select', required: true, options: [{ id: 'all_parents', name: 'All parents' }, { id: 'class', name: 'Parents of a class' }, { id: 'section', name: 'Parents of a section' }, { id: 'teachers', name: 'All teachers' }, { id: 'custom', name: 'Custom numbers' }], value: preset.audience || 'all_parents', placeholder: '' },
            { name: 'channel', label: 'Channel', type: 'select', options: ['sms', 'whatsapp', 'both'], value: 'sms', placeholder: '' }] },
            F.classSel('school_class_id', false), F.sectionSel('section_id', false, 'Section'), { name: 'numbers', label: 'Numbers (comma separated)', attrs: 'placeholder="03001234567, 03211234567"' },
            { name: 'message', label: 'Message', type: 'textarea', rows: 4, required: true }]),
        onSubmit: async (v, _f, close) => {
            const b = clean(v);
            b.numbers = b.audience === 'custom' ? String(b.numbers || '').split(/[,\s]+/).filter(Boolean) : null;
            if (b.audience !== 'class') delete b.school_class_id; if (b.audience !== 'section') delete b.section_id;
            toast((await API.post('/sms/send', b)).message); close(); go('/sms');
        },
    });
    const sync = () => { const a = $('[name=audience]', form).value; [['school_class_id', 'class'], ['section_id', 'section'], ['numbers', 'custom']].forEach(([n, k]) => $(`[name=${n}]`, form).closest('.field').classList.toggle('hidden', a !== k)); };
    $('[name=audience]', form).onchange = sync; sync();
}

/* ----- Settings ----- */
M.sessions = Crud.page({
    endpoint: '/academic-sessions', title: 'Academic sessions', singular: 'session', search: false, icon: 'calendar', reset: ['sessions'],
    columns: [{ label: 'Session', render: (r) => `<b>${esc(r.name)}</b>` }, { label: 'Dates', render: (r) => `${fmt.date(r.start_date)} – ${fmt.date(r.end_date)}` }, { label: 'Current', render: (r) => (r.is_current ? badge('active', 'Current') : '') }],
    fields: [{ name: 'name', label: 'Name', required: true, attrs: 'placeholder="2027-2028"' }, { row: [{ name: 'start_date', label: 'Start', type: 'date', required: true }, { name: 'end_date', label: 'End', type: 'date', required: true }] }, { name: 'is_current', label: 'This is the current session', type: 'checkbox' }],
});
M.leaveTypes = Crud.page({
    endpoint: '/leave-types', title: 'Leave types', singular: 'leave type', search: false, icon: 'leave',
    columns: [{ label: 'Leave type', render: (r) => `<b>${esc(r.name)}</b>` }, { label: 'Days per year', render: (r) => r.days_allowed ?? 'Unlimited' }, { label: 'For', render: (r) => fmt.cap(r.applies_to) }],
    fields: [{ name: 'name', label: 'Name', required: true }, { row: [{ name: 'days_allowed', label: 'Days allowed per year', type: 'number' }, { name: 'applies_to', label: 'Applies to', type: 'select', options: ['staff', 'student', 'both'], value: 'both', placeholder: '' }] }],
});
M.paymentMethods = Crud.page({
    endpoint: '/payment-methods', title: 'Payment methods', singular: 'payment method', search: false, icon: 'money',
    intro: 'Bank / JazzCash / Easypaisa accounts shown to parents for online fee payment.',
    columns: [{ label: 'Method', render: (r) => `<b>${esc(r.name)}</b>` }, { label: 'Account', render: (r) => `${esc(r.account_title || '')}<br><small>${esc(r.account_number || '')}</small>` }, { label: 'Active', render: (r) => yesNo(r.is_active) }],
    fields: [{ name: 'name', label: 'Name', required: true, attrs: 'placeholder="e.g. Meezan Bank"' }, { row: [{ name: 'account_title', label: 'Account title' }, { name: 'account_number', label: 'Account / IBAN / mobile no' }] }, { name: 'instructions', label: 'Instructions for parents', type: 'textarea', rows: 2 }, { name: 'is_active', label: 'Active', type: 'checkbox', value: true }],
});

/* ===========================================================
   Special pages
   =========================================================== */
Object.assign(Pages, {
    /* ----- Fee generation & tools (added to Fees page toolbar) ----- */
    async feeGenerate() {
        const [classes, sections, types] = await Promise.all([Lookups.classes(), Lookups.sections(), Lookups.feeTypes()]);
        formModal({
            title: 'Generate monthly invoices', submitText: 'Generate',
            fields: `<p>Creates one invoice per active student from the fee structure. Students who already have an invoice for that month are skipped.</p>
            <div class="form-row">${field('Month *', inp('month', fmt.thisMonth(), 'month', 'required'))}${field('Due date', inp('due_date', '', 'date'))}</div>
            <div class="form-row">${field('Class (optional)', sel('school_class_id', options(classes, { placeholder: 'All classes' })))}${field('Section (optional)', sel('section_id', options(sections, { label: 'label', placeholder: 'All sections' })))}</div>
            ${field('Fee types', `<div class="chips">${types.map((t) => `<label class="check"><input type="checkbox" name="ft_${t.id}" ${t.frequency === 'monthly' ? 'checked' : ''}> ${esc(t.name)}</label>`).join(' ')}</div>`)}
            <label class="check"><input type="checkbox" name="include_transport" checked> Add transport fare</label> <label class="check"><input type="checkbox" name="include_hostel" checked> Add hostel rent</label>`,
            onSubmit: async (v, _f, close) => {
                const ids = Object.keys(v).filter((k) => k.startsWith('ft_') && v[k]).map((k) => +k.slice(3));
                const body = clean({ month: v.month, due_date: v.due_date, school_class_id: v.school_class_id, section_id: v.section_id, include_transport: v.include_transport, include_hostel: v.include_hostel });
                if (ids.length) body.fee_type_ids = ids;
                const r = await API.post('/fee-invoices/generate', body);
                close(); toast(r.message || 'Invoices generated.'); go('/fees', { month: v.month });
            },
        });
    },

    async defaulters(view, _p, q) {
        const [classes] = await Promise.all([Lookups.classes()]);
        view.innerHTML = `<div class="card mb"><div class="card-body"><form class="toolbar" id="flt">
            <label class="field"><span>Class</span><select name="class">${options(classes, { selected: q.class, placeholder: 'All classes' })}</select></label>
            <button class="btn secondary" type="button" id="csv">${icon('download')} Export CSV</button>
            <button class="btn" type="button" id="remind">${icon('send')} Send reminders</button></form></div></div><div id="body">${loadingHtml()}</div>`;
        $('[name=class]', view).onchange = (e) => go('/defaulters', { class: e.target.value });
        $('#csv', view).onclick = (e) => downloadOrToast(e.currentTarget, '/fees/defaulters', { school_class_id: q.class, export: 'csv' }, 'defaulters.csv');
        $('#remind', view).onclick = () => formModal({
            title: 'Send fee reminders', submitText: 'Send',
            fields: `<p>Sends a reminder to the guardian of every defaulter${q.class ? ' in this class' : ''}.</p>${field('Channel', sel('channel', options(opt(['sms', 'whatsapp', 'both']), { selected: 'sms' })))}${field('Custom message (optional)', '<textarea name="message" rows="3" placeholder="Leave empty for the default message with the due amount"></textarea>')}`,
            onSubmit: async (v, _f, close) => { toast((await API.post('/fees/send-reminders' + (q.class ? `?school_class_id=${q.class}` : ''), clean(v))).message); close(); },
        });
        const res = await API.get('/fees/defaulters', { school_class_id: q.class });
        $('#body', view).innerHTML = `<div class="stats mb"><div class="card stat"><div class="ico tone-bad">${icon('wallet')}</div><div><div class="label">Total due</div><div class="value">${fmt.money(res.total_due)}</div><div class="hint">${res.count} students</div></div></div></div>
        <div class="card">${res.data.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Class</th><th>Guardian</th><th>Invoices</th><th>Oldest due</th><th class="num">Balance</th><th></th></tr></thead><tbody>
        ${res.data.map((r) => `<tr><td><b>${esc(r.student?.full_name || '')}</b><br><small>${esc(r.student?.admission_no || '')}</small></td><td>${esc(r.student?.school_class?.name || '')} – ${esc(r.student?.section?.name || '')}</td>
            <td>${esc(r.student?.guardian?.name || '—')}<br><small>${esc(r.student?.guardian?.phone || '')}</small></td><td>${r.invoices}</td><td class="nowrap">${fmt.date(r.oldest_due_date)}</td><td class="num"><b>${fmt.money(r.balance)}</b></td>
            <td><a class="btn ghost sm" href="#/fees?search=${encodeURIComponent(r.student?.admission_no || '')}&status=outstanding">Invoices</a></td></tr>`).join('')}</tbody></table></div>` : emptyHtml('No defaulters', 'All dues are clear.', 'check')}</div>`;
    },

    async payroll(view, _p, q) {
        const month = q.month || fmt.thisMonth();
        view.innerHTML = `<div class="card mb"><div class="card-body"><div class="toolbar">
            <label class="field"><span>Month</span><input type="month" id="m" value="${month}"></label>
            <label class="field"><span>Status</span><select id="st">${options(opt(['pending', 'paid']), { selected: q.status, placeholder: 'All' })}</select></label>
            <button class="btn" id="gen">${icon('plus')} Generate salaries for ${fmt.month(month)}</button></div></div></div><div class="card" id="list">${loadingHtml()}</div>`;
        $('#m', view).onchange = (e) => e.target.value && go('/payroll', { month: e.target.value, status: q.status });
        $('#st', view).onchange = (e) => go('/payroll', { month, status: e.target.value });
        $('#gen', view).onclick = () => formModal({
            title: `Generate salaries · ${fmt.month(month)}`, submitText: 'Generate',
            fields: `<p>Creates a salary record for every active staff member from their basic salary. Existing records are skipped.</p><label class="check"><input type="checkbox" name="deduct_absences"> Deduct salary for absent days (from staff attendance)</label>`,
            onSubmit: async (v, _f, close) => { toast((await API.post('/payroll/generate', { month, deduct_absences: v.deduct_absences })).message); close(); Router.resolve(); },
        });
        const res = await API.get('/payroll', { month, status: q.status, all: 1 });
        const rows = res.data || [];
        const list = $('#list', view);
        if (!rows.length) { list.innerHTML = emptyHtml('No salaries for this month', 'Click "Generate salaries" to create them.', 'money'); return; }
        list.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Staff</th><th class="num">Basic</th><th class="num">Allowances</th><th class="num">Deductions</th><th>Absent</th><th class="num">Net</th><th>Status</th><th></th></tr></thead><tbody>
        ${rows.map((s, i) => `<tr><td><b>${esc(s.teacher?.name || '')}</b><br><small>${esc(s.teacher?.employee_no || '')} · ${esc(s.teacher?.designation || '')}</small></td>
            <td class="num">${fmt.money(s.basic_salary)}</td><td class="num">${fmt.money(s.allowances)}</td><td class="num">${fmt.money(s.deductions)}</td><td>${s.absent_days ?? 0}</td><td class="num"><b>${fmt.money(s.net_salary)}</b></td>
            <td>${badge(s.status)}${s.paid_on ? `<br><small>${fmt.date(s.paid_on)}</small>` : ''}</td>
            <td class="right nowrap">${s.status !== 'paid' ? `<button class="btn sm" data-pay="${i}">Pay</button> <button class="btn ghost sm" data-edit="${i}">${icon('edit')}</button> <button class="btn ghost sm" data-del="${i}">${icon('trash')}</button>` : ''}
                <button class="btn ghost sm" data-slip="${i}" title="Salary slip (PDF)">${icon('download')}</button></td></tr>`).join('')}
        </tbody><tfoot><tr><td colspan="5">Total</td><td class="num"><b>${fmt.money(res.total_net ?? rows.reduce((n, s) => n + Number(s.net_salary || 0), 0))}</b></td><td colspan="2"></td></tr></tfoot></table></div>`;
        $$('[data-slip]', list).forEach((b) => (b.onclick = () => downloadOrToast(b, `/payroll/${rows[+b.dataset.slip].id}/slip`, null, 'salary-slip.pdf')));
        $$('[data-edit]', list).forEach((b) => (b.onclick = () => { const s = rows[+b.dataset.edit]; formModal({
            title: `Edit salary · ${s.teacher?.name}`, fields: `<div class="form-row">${field('Basic salary', inp('basic_salary', s.basic_salary, 'number'))}${field('Allowances', inp('allowances', s.allowances, 'number'))}</div>${field('Deductions', inp('deductions', s.deductions, 'number'))}${field('Notes', inp('notes', s.notes))}`,
            onSubmit: async (v, _f, close) => { toast((await API.put(`/payroll/${s.id}`, clean(v))).message); close(); Router.resolve(); } }); }));
        $$('[data-pay]', list).forEach((b) => (b.onclick = () => { const s = rows[+b.dataset.pay]; formModal({
            title: `Pay ${fmt.money(s.net_salary)} to ${s.teacher?.name}`, submitText: 'Mark as paid',
            fields: `<div class="form-row">${field('Payment method *', sel('payment_method', options(opt(['cash', 'bank', 'cheque', 'jazzcash', 'easypaisa']), { selected: 'bank' })))}${field('Paid on', inp('paid_on', fmt.today(), 'date'))}</div>`,
            onSubmit: async (v, _f, close) => { toast((await API.post(`/payroll/${s.id}/pay`, clean(v))).message); close(); Router.resolve(); } }); }));
        $$('[data-del]', list).forEach((b) => (b.onclick = async () => { const s = rows[+b.dataset.del]; if (!(await confirmBox(`Delete salary record of ${s.teacher?.name}?`, { okText: 'Delete', danger: true }))) return; try { await API.del(`/payroll/${s.id}`); toast('Deleted.'); Router.resolve(); } catch (e) { toast(e.message, 'error'); } }));
    },

    async staffAttendance(view, _p, q) {
        const tab = q.tab || 'mark';
        const date = q.date || fmt.today();
        const month = q.month || fmt.thisMonth();
        view.innerHTML = `<div class="tabs"><button data-tab="mark" class="${tab === 'mark' ? 'active' : ''}">Mark attendance</button><button data-tab="report" class="${tab === 'report' ? 'active' : ''}">Monthly report</button></div>
        <div class="card mb"><div class="card-body"><div class="toolbar">${tab === 'mark' ? `<label class="field"><span>Date</span><input type="date" id="d" value="${date}" max="${fmt.today()}"></label>` : `<label class="field"><span>Month</span><input type="month" id="mo" value="${month}"></label>`}</div></div></div><div id="body">${loadingHtml()}</div>`;
        $$('[data-tab]', view).forEach((b) => (b.onclick = () => go('/staff-attendance', { tab: b.dataset.tab, date, month })));
        if ($('#d', view)) $('#d', view).onchange = (e) => go('/staff-attendance', { tab, date: e.target.value });
        if ($('#mo', view)) $('#mo', view).onchange = (e) => go('/staff-attendance', { tab, month: e.target.value });
        const body = $('#body', view);
        if (tab === 'report') {
            const r = await API.get('/staff-attendance/report', { month });
            body.innerHTML = `<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Staff</th><th>Present</th><th>Absent</th><th>Late</th><th>Leave</th></tr></thead><tbody>
            ${r.data.map((t) => `<tr><td><b>${esc(t.name)}</b><br><small>${esc(t.employee_no || '')}</small></td><td>${t.present}</td><td>${t.absent}</td><td>${t.late}</td><td>${t.leave}</td></tr>`).join('')}</tbody></table></div></div>`;
            return;
        }
        const sheet = await API.get('/staff-attendance', { date });
        const state = sheet.data.map((r) => ({ ...r, status: r.status || 'present' }));
        const STAT = [['present', 'P'], ['absent', 'A'], ['late', 'L'], ['leave', 'LV']];
        body.innerHTML = `<div class="card"><div class="card-head"><h2>Staff · ${fmt.date(date)}</h2><button class="btn secondary sm" id="all">Mark all present</button></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Staff</th><th>Status</th><th>In</th><th>Out</th></tr></thead><tbody>
        ${state.map((r, i) => `<tr><td><b>${esc(r.name)}</b><br><small>${esc(r.employee_no || '')} · ${esc(r.designation || '')}</small></td>
            <td><div class="seg" data-row="${i}">${STAT.map(([k, l]) => `<button type="button" data-st="${k}" class="${k}">${l}</button>`).join('')}</div></td>
            <td><input type="time" data-in="${i}" value="${t5(r.check_in)}" style="min-height:34px"></td><td><input type="time" data-out="${i}" value="${t5(r.check_out)}" style="min-height:34px"></td></tr>`).join('')}
        </tbody></table></div><div class="sticky-bar"><span class="grow"></span><button class="btn" id="save" data-busy="Saving…">${icon('check')} Save</button></div></div>`;
        const paint = () => $$('.seg', body).forEach((seg) => { const r = state[+seg.dataset.row]; $$('button', seg).forEach((b) => b.classList.toggle('on', b.dataset.st === r.status)); });
        paint();
        $$('.seg button', body).forEach((b) => (b.onclick = () => { state[+b.parentElement.dataset.row].status = b.dataset.st; paint(); }));
        $('#all', body).onclick = () => { state.forEach((r) => (r.status = 'present')); paint(); };
        $('#save', body).onclick = (e) => busy(e.currentTarget, async () => {
            try {
                const records = state.map((r, i) => ({ teacher_id: r.teacher_id, status: r.status, check_in: $(`[data-in="${i}"]`, body).value || null, check_out: $(`[data-out="${i}"]`, body).value || null }));
                toast((await API.post('/staff-attendance', { date, records })).message);
            } catch (err) { toast(err.message, 'error'); }
        });
    },

    async marks(view, _p, q) {
        const [exams, sections, subjects] = await Promise.all([Lookups.exams(), Lookups.sections(), Lookups.subjects()]);
        if (!exams.length) { view.innerHTML = `<div class="card">${emptyHtml('No exams yet', 'Create an exam first (Exams page).', 'award')}</div>`; return; }
        const exam = q.exam || exams[0].id, section = q.section || sections[0]?.id, subject = q.subject || subjects[0]?.id;
        view.innerHTML = `<div class="card mb"><div class="card-body"><div class="toolbar">
            <label class="field"><span>Exam</span><select id="ex">${options(exams, { selected: exam })}</select></label>
            <label class="field wide"><span>Class / section</span><select id="se">${options(sections, { label: 'label', selected: section })}</select></label>
            <label class="field"><span>Subject</span><select id="su">${options(subjects, { selected: subject })}</select></label></div></div></div><div id="body">${loadingHtml()}</div>`;
        const re = () => go('/marks', { exam: $('#ex', view).value, section: $('#se', view).value, subject: $('#su', view).value });
        ['#ex', '#se', '#su'].forEach((s) => ($(s, view).onchange = re));
        const sheet = await API.get('/marks/sheet', { exam_id: exam, section_id: section, subject_id: subject });
        const body = $('#body', view);
        if (!sheet.data.length) { body.innerHTML = `<div class="card">${emptyHtml('No students in this section', '', 'users')}</div>`; return; }
        body.innerHTML = `<div class="card"><div class="card-head"><h2>Marks entry</h2><label class="field" style="margin:0;max-width:160px"><span>Total marks</span><input type="number" id="tot" value="${sheet.total_marks ?? 100}" min="1"></label></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Roll</th><th>Student</th><th>Obtained</th><th>Absent</th><th class="hide-sm">Remarks</th></tr></thead><tbody>
        ${sheet.data.map((r, i) => `<tr><td>${esc(r.roll_no || '—')}</td><td><b>${esc(r.name)}</b><br><small>${esc(r.admission_no)}</small></td>
            <td><input class="cell" type="number" min="0" step="0.5" data-m="${i}" value="${r.obtained_marks ?? ''}" style="max-width:110px"></td>
            <td><input type="checkbox" data-a="${i}" ${r.is_absent ? 'checked' : ''}></td><td class="hide-sm"><input data-r="${i}" value="${esc(r.remarks || '')}" style="min-height:34px"></td></tr>`).join('')}
        </tbody></table></div><div class="sticky-bar"><span class="grow"></span><button class="btn" id="save" data-busy="Saving…">${icon('check')} Save marks</button></div></div>`;
        $('#save', body).onclick = (e) => busy(e.currentTarget, async () => {
            try {
                const records = sheet.data.map((r, i) => ({ student_id: r.student_id, obtained_marks: $(`[data-m="${i}"]`, body).value === '' ? null : +$(`[data-m="${i}"]`, body).value, is_absent: $(`[data-a="${i}"]`, body).checked, remarks: $(`[data-r="${i}"]`, body).value || null }));
                toast((await API.post('/marks', { exam_id: +exam, section_id: +section, subject_id: +subject, total_marks: +$('#tot', body).value, records })).message);
            } catch (err) { toast(err.message, 'error'); }
        });
    },

    async results(view, _p, q) {
        const [exams, sections] = await Promise.all([Lookups.exams(), Lookups.sections()]);
        if (!exams.length) { view.innerHTML = `<div class="card">${emptyHtml('No exams yet', 'Create an exam first.', 'award')}</div>`; return; }
        const exam = q.exam || exams[0].id, section = q.section || sections[0]?.id;
        view.innerHTML = `<div class="card mb"><div class="card-body"><div class="toolbar">
            <label class="field"><span>Exam</span><select id="ex">${options(exams, { selected: exam })}</select></label>
            <label class="field wide"><span>Class / section</span><select id="se">${options(sections, { label: 'label', selected: section })}</select></label>
            <button class="btn secondary" id="csv">${icon('download')} Export CSV</button></div></div></div><div id="body">${loadingHtml()}</div>`;
        const re = () => go('/results', { exam: $('#ex', view).value, section: $('#se', view).value });
        $('#ex', view).onchange = re; $('#se', view).onchange = re;
        $('#csv', view).onclick = (e) => downloadOrToast(e.currentTarget, '/results/section', { exam_id: exam, section_id: section, export: 'csv' }, 'results.csv');
        const r = await API.get('/results/section', { exam_id: exam, section_id: section });
        const s = r.summary || {};
        const body = $('#body', view);
        body.innerHTML = `<div class="stats mb">
            <div class="card stat"><div class="ico tone-brand">${icon('users')}</div><div><div class="label">Students</div><div class="value">${s.students ?? 0}</div></div></div>
            <div class="card stat"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Passed</div><div class="value">${s.passed ?? 0}</div></div></div>
            <div class="card stat"><div class="ico tone-bad">${icon('x')}</div><div><div class="label">Failed</div><div class="value">${s.failed ?? 0}</div></div></div>
            <div class="card stat"><div class="ico tone-info">${icon('chart')}</div><div><div class="label">Average</div><div class="value">${fmt.pct(s.average_percentage)}</div></div></div></div>
        <div class="card">${r.data?.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Pos.</th><th>Student</th><th>Marks</th><th>%</th><th>Grade</th><th>Result</th><th></th></tr></thead><tbody>
        ${r.data.map((x) => `<tr><td>${x.position ?? '—'}</td><td><b>${esc(x.student?.name || x.student?.full_name || x.name || '')}</b><br><small>Roll ${esc(x.student?.roll_no || '')}</small></td><td>${fmt.num(x.obtained_marks)} / ${fmt.num(x.total_marks)}</td>
            <td>${fmt.pct(x.percentage)}</td><td>${esc(x.grade || '—')}</td><td>${badge(String(x.result).toLowerCase(), x.result)}</td>
            <td><button class="btn ghost sm" data-rc="${x.student?.id || x.student_id}" title="Report card PDF">${icon('download')}</button></td></tr>`).join('')}</tbody></table></div>` : emptyHtml('No marks entered yet', 'Enter marks from the Marks Entry page.', 'clipboard')}</div>`;
        $$('[data-rc]', body).forEach((b) => (b.onclick = () => downloadOrToast(b, '/results/report-card', { exam_id: exam, student_id: b.dataset.rc, pdf: 1 }, 'report-card.pdf')));
    },

    async messages(view, _p, q) {
        const box = q.box || 'inbox';
        view.innerHTML = `<div class="flex between flex-wrap mb"><div class="tabs" style="margin:0"><button data-box="inbox" class="${box === 'inbox' ? 'active' : ''}">Inbox</button><button data-box="sent" class="${box === 'sent' ? 'active' : ''}">Sent</button></div>
            <button class="btn" id="new">${icon('plus')} New message</button></div><div class="card" id="list">${loadingHtml()}</div>`;
        $$('[data-box]', view).forEach((b) => (b.onclick = () => go('/messages', { box: b.dataset.box })));
        $('#new', view).onclick = async () => {
            const { data } = await API.get('/messages/contacts');
            formModal({
                title: 'New message', submitText: 'Send',
                fields: `${field('To *', sel('receiver_id', options(data, { label: (c) => `${c.name} (${fmt.cap(c.role)})`, placeholder: 'Select person' })))}${field('Subject', inp('subject'))}${field('Message *', '<textarea name="body" rows="5" required></textarea>')}`,
                onSubmit: async (v, _f, close) => { toast((await API.post('/messages', clean(v))).message); close(); go('/messages', { box: 'sent' }); },
            });
        };
        const res = await API.get('/messages', { box, page: +q.page || 1 });
        const list = $('#list', view);
        if (!res.data.length) { list.innerHTML = emptyHtml('No messages', '', 'chat'); return; }
        list.innerHTML = `<ul class="list clickable">${res.data.map((m, i) => { const other = box === 'sent' ? m.receiver : m.sender; return `<li data-i="${i}" class="${box === 'inbox' && !m.read_at ? 'unread' : ''}"><div class="flex between"><span class="title">${esc(other?.name || '')} <small>· ${fmt.cap(other?.role)}</small></span><small>${fmt.relative(m.updated_at || m.created_at)}</small></div><div><b>${esc(m.subject || '(no subject)')}</b></div><div class="clamp">${esc(m.body)}</div></li>`; }).join('')}</ul>${pagerHtml(res)}`;
        bindPager(list, (n) => go('/messages', { box, page: n }));
        $$('[data-i]', list).forEach((li) => (li.onclick = async () => {
            const m = res.data[+li.dataset.i];
            const t = await API.get('/messages/' + (m.parent_id || m.id));
            const all = [t.data, ...(t.replies || [])];
            const md = modal({ title: t.data.subject || 'Conversation', wide: true,
                body: `<div class="thread">${all.map((x) => `<div class="bubble ${x.sender_id === App.user.id ? 'mine' : ''}"><div class="who">${esc(x.sender?.name || '')} · ${fmt.datetime(x.created_at)}</div>${esc(x.body)}</div>`).join('')}</div>
                <form class="form mt" id="rf"><textarea name="body" rows="3" placeholder="Write a reply…" required></textarea><button class="btn" type="submit" data-busy="Sending…">${icon('send')} Reply</button></form>` });
            $('#rf', md.el).onsubmit = (e) => { e.preventDefault(); const f = e.currentTarget; busy($('button', f), async () => { try { await API.post('/messages', { parent_id: t.data.id, body: f.body.value }); md.close(); toast('Reply sent.'); Router.resolve(); } catch (err) { showErrors(f, err); } }); };
        }));
    },

    async settings(view) {
        const { data: s } = await API.get('/settings');
        view.innerHTML = `<div class="card"><div class="card-head"><h2>School settings</h2></div><div class="card-body"><form class="form" id="sf" novalidate>
            <div class="form-row">${field('School name', inp('school_name', s.school_name))}${field('Phone', inp('school_phone', s.school_phone))}</div>
            <div class="form-row">${field('Email', inp('school_email', s.school_email, 'email'))}${field('Currency', inp('currency', s.currency))}</div>
            ${field('Address', `<textarea name="school_address" rows="2">${esc(s.school_address)}</textarea>`)}
            <div class="form-row">${field('Logo', '<input type="file" name="school_logo" accept="image/*">')}<div>${s.school_logo_url ? `<img src="${esc(s.school_logo_url)}" alt="" style="height:56px;border-radius:8px">` : ''}</div></div>
            <h3 class="mt">Fees</h3>
            <div class="form-row">${field('Invoice due day of month', inp('invoice_due_day', s.invoice_due_day, 'number', 'min="1" max="28"'))}${field('Late fee (flat amount)', inp('late_fee_amount', s.late_fee_amount, 'number'))}</div>
            ${field('Admission fee type name', inp('admission_fee_type', s.admission_fee_type))}
            <h3 class="mt">Exams & library</h3>
            <div class="form-row">${field('Pass percentage', inp('pass_percentage', s.pass_percentage, 'number'))}${field('Library issue days', inp('library_issue_days', s.library_issue_days, 'number'))}</div>
            ${field('Library fine per late day', inp('library_fine_per_day', s.library_fine_per_day, 'number'))}
            <h3 class="mt">Notifications & admissions</h3>
            ${field('Notification channel', sel('notification_channel', options(opt(['sms', 'whatsapp', 'both']), { selected: s.notification_channel })))}
            <label class="check"><input type="checkbox" name="sms_on_absence" ${s.sms_on_absence === '1' ? 'checked' : ''}> Notify parents when a student is absent</label>
            <label class="check"><input type="checkbox" name="sms_on_payment" ${s.sms_on_payment === '1' ? 'checked' : ''}> Notify parents when a fee payment is received</label>
            <label class="check"><input type="checkbox" name="online_admission_open" ${s.online_admission_open === '1' ? 'checked' : ''}> Online admission form is open</label>
            <div><button class="btn" type="submit" data-busy="Saving…">${icon('check')} Save settings</button></div></form></div></div>`;
        const f = $('#sf', view);
        f.onsubmit = (e) => { e.preventDefault(); busy($('button[type=submit]', f), async () => {
            try {
                const v = formValues(f); const fd = new FormData();
                Object.entries(v).forEach(([k, x]) => fd.append(k, typeof x === 'boolean' ? (x ? '1' : '0') : (x ?? '')));
                if (f.school_logo.files[0]) fd.append('school_logo', f.school_logo.files[0]);
                await API.request('POST', '/settings', { body: fd });
                toast('Settings saved.'); App.school.name = v.school_name; App.school.currency = v.currency;
            } catch (err) { showErrors(f, err); }
        }); };
    },

    async reports(view, _p, q) {
        const tab = q.tab || 'income';
        const from = q.from || fmt.thisMonth() + '-01', to = q.to || fmt.today();
        const TABS = [['income', 'Income & expense'], ['collection', 'Fee collection'], ['strength', 'Student strength'], ['attendance', 'Attendance today'], ['register', 'Monthly attendance'], ['inventory', 'Inventory']];
        view.innerHTML = `<div class="tabs">${TABS.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'active' : ''}">${l}</button>`).join('')}</div><div id="tools"></div><div id="body">${loadingHtml()}</div>`;
        $$('[data-tab]', view).forEach((b) => (b.onclick = () => go('/reports', { tab: b.dataset.tab })));
        const body = $('#body', view), tools = $('#tools', view);
        const range = (extra = '') => { tools.innerHTML = `<div class="card mb"><div class="card-body"><div class="toolbar"><label class="field"><span>From</span><input type="date" id="f" value="${from}"></label><label class="field"><span>To</span><input type="date" id="t" value="${to}"></label>${extra}</div></div></div>`;
            $('#f', tools).onchange = $('#t', tools).onchange = () => go('/reports', { tab, from: $('#f', tools).value, to: $('#t', tools).value }); };
        const kv = (obj) => Object.entries(obj || {}).map(([k, v]) => `<tr><td>${esc(fmt.cap(k))}</td><td class="num">${fmt.money(v)}</td></tr>`).join('') || '<tr><td colspan="2"><small>None</small></td></tr>';
        if (tab === 'income') {
            range();
            const r = await API.get('/reports/income-expense', { from, to });
            body.innerHTML = `<div class="stats mb"><div class="card stat"><div class="ico tone-ok">${icon('money')}</div><div><div class="label">Total income</div><div class="value">${fmt.money(r.income.total)}</div></div></div>
                <div class="card stat"><div class="ico tone-bad">${icon('money')}</div><div><div class="label">Total expense</div><div class="value">${fmt.money(r.expenses.total)}</div></div></div>
                <div class="card stat"><div class="ico tone-brand">${icon('chart')}</div><div><div class="label">Net</div><div class="value">${fmt.money(r.net_profit)}</div></div></div></div>
            <div class="grid-2"><div class="card"><div class="card-head"><h2>Income</h2></div><table class="table"><tbody><tr><td>Fee collection</td><td class="num">${fmt.money(r.income.fee_collection)}</td></tr>${kv(r.income.other_by_category)}</tbody></table></div>
            <div class="card"><div class="card-head"><h2>Expenses</h2></div><table class="table"><tbody><tr><td>Salaries</td><td class="num">${fmt.money(r.expenses.salaries)}</td></tr>${kv(Array.isArray(r.expenses.by_category) ? Object.fromEntries(r.expenses.by_category.map((x) => [x.category, x.total])) : r.expenses.by_category)}</tbody></table></div></div>`;
        } else if (tab === 'collection') {
            range(`<button class="btn secondary" id="csv">${icon('download')} Export CSV</button>`);
            $('#csv', tools).onclick = (e) => downloadOrToast(e.currentTarget, '/fees/collection-report', { from, to, export: 'csv' }, 'fee-collection.csv');
            const r = await API.get('/fees/collection-report', { from, to });
            body.innerHTML = `<div class="stats mb"><div class="card stat"><div class="ico tone-ok">${icon('wallet')}</div><div><div class="label">Collected</div><div class="value">${fmt.money(r.total)}</div><div class="hint">${r.count} payments</div></div></div></div>
            <div class="grid-2 mb"><div class="card"><div class="card-head"><h2>By method</h2></div><table class="table"><tbody>${kv(r.by_method)}</tbody></table></div><div class="card"><div class="card-head"><h2>By class</h2></div><table class="table"><tbody>${kv(r.by_class)}</tbody></table></div></div>
            <div class="card">${r.data.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Receipt</th><th>Date</th><th>Student</th><th>Invoice</th><th>Method</th><th class="num">Amount</th></tr></thead><tbody>
            ${r.data.map((p) => `<tr><td>${esc(p.receipt_no || '')}</td><td class="nowrap">${fmt.date(p.paid_on)}</td><td>${esc(p.invoice?.student?.full_name || '')}</td><td>${esc(p.invoice?.invoice_no || '')}</td><td>${fmt.cap(p.method)}</td><td class="num">${fmt.money(p.amount)}</td></tr>`).join('')}</tbody></table></div>` : emptyHtml('No payments in this period')}</div>`;
        } else if (tab === 'strength') {
            tools.innerHTML = '';
            const r = await API.get('/reports/student-strength');
            body.innerHTML = `<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Class</th><th>Section</th><th>Boys</th><th>Girls</th><th>Total</th><th>Capacity</th></tr></thead><tbody>
            ${r.data.map((x) => `<tr><td>${esc(x.class)}</td><td>${esc(x.section)}</td><td>${x.male}</td><td>${x.female}</td><td><b>${x.total}</b></td><td>${x.capacity ?? '—'}</td></tr>`).join('')}</tbody>
            <tfoot><tr><td colspan="2">Total</td><td>${r.male}</td><td>${r.female}</td><td><b>${r.total}</b></td><td></td></tr></tfoot></table></div></div>`;
        } else if (tab === 'attendance') {
            const date = q.date || fmt.today();
            tools.innerHTML = `<div class="card mb"><div class="card-body"><div class="toolbar"><label class="field"><span>Date</span><input type="date" id="d" value="${date}" max="${fmt.today()}"></label></div></div></div>`;
            $('#d', tools).onchange = (e) => go('/reports', { tab, date: e.target.value });
            const r = await API.get('/reports/attendance-summary', { date });
            body.innerHTML = `<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Class</th><th>Strength</th><th>Marked</th><th>Present</th><th>Absent</th><th>Late</th><th>Leave</th><th>%</th></tr></thead><tbody>
            ${r.data.map((x) => `<tr><td>${esc(x.class)} – ${esc(x.section)}</td><td>${x.strength}</td><td>${x.marked ? badge('paid', 'Yes') : badge('unpaid', 'No')}</td><td>${x.present}</td><td>${x.absent}</td><td>${x.late}</td><td>${x.leave}</td><td>${fmt.pct(x.percentage)}</td></tr>`).join('')}</tbody></table></div></div>`;
        } else if (tab === 'register') {
            const sections = await Lookups.sections();
            const sec = q.section || sections[0]?.id, month = q.month || fmt.thisMonth();
            tools.innerHTML = `<div class="card mb"><div class="card-body"><div class="toolbar"><label class="field wide"><span>Class / section</span><select id="s">${options(sections, { label: 'label', selected: sec })}</select></label><label class="field"><span>Month</span><input type="month" id="m" value="${month}"></label><button class="btn secondary" id="csv">${icon('download')} Export CSV</button></div></div></div>`;
            $('#s', tools).onchange = $('#m', tools).onchange = () => go('/reports', { tab, section: $('#s', tools).value, month: $('#m', tools).value });
            $('#csv', tools).onclick = (e) => downloadOrToast(e.currentTarget, '/attendance/report', { section_id: sec, month, export: 'csv' }, `attendance-${month}.csv`);
            const r = await API.get('/attendance/report', { section_id: sec, month });
            const days = Array.from({ length: r.days_in_month || 31 }, (_, i) => String(i + 1));
            body.innerHTML = `<div class="card">${r.data.length ? `<div class="table-wrap"><table class="table compact"><thead><tr><th>Student</th>${days.map((d) => `<th>${d}</th>`).join('')}<th>P</th><th>A</th><th>%</th></tr></thead><tbody>
            ${r.data.map((x) => `<tr><td class="nowrap">${esc(x.name || x.student?.full_name || '')}</td>${days.map((d) => `<td>${esc((x.days || {})[d] || '')}</td>`).join('')}<td>${x.present ?? x.summary?.present ?? ''}</td><td>${x.absent ?? x.summary?.absent ?? ''}</td><td>${fmt.pct(x.percentage ?? x.summary?.percentage)}</td></tr>`).join('')}</tbody></table></div>` : emptyHtml('No students')}</div>`;
        } else if (tab === 'inventory') {
            tools.innerHTML = '';
            const r = await API.get('/inventory/report');
            body.innerHTML = `<div class="stats mb"><div class="card stat"><div class="ico tone-brand">${icon('box')}</div><div><div class="label">Store items</div><div class="value">${r.total_items}</div><div class="hint">Value ${fmt.money(r.stock_value)}</div></div></div>
                <div class="card stat"><div class="ico tone-bad">${icon('alert')}</div><div><div class="label">Low stock</div><div class="value">${r.low_stock_count}</div></div></div>
                <div class="card stat"><div class="ico tone-info">${icon('box')}</div><div><div class="label">Assets</div><div class="value">${r.assets?.count ?? 0}</div><div class="hint">Value ${fmt.money(r.assets?.value)}</div></div></div></div>
            <div class="card"><div class="card-head"><h2>Low stock items</h2></div>${(r.low_stock || []).length ? `<table class="table"><tbody>${r.low_stock.map((i) => `<tr><td><b>${esc(i.name)}</b></td><td>${fmt.num(i.quantity)} ${esc(i.unit || '')}</td><td><small>Reorder at ${fmt.num(i.reorder_level)}</small></td></tr>`).join('')}</tbody></table>` : emptyHtml('Nothing is low on stock', '', 'check')}</div>`;
        }
    },
});

/* ===========================================================
   Navigation (replaces the basic one)
   =========================================================== */
NAV.length = 0;
NAV.push(
    ['/', 'Dashboard', 'grid'],
    ['section', 'Students & staff'],
    ['/students', 'Students', 'users'],
    ['/guardians', 'Parents / Guardians', 'users'],
    ['/admissions', 'Online Admissions', 'cap', 'adm'],
    ['/teachers', 'Teachers & Staff', 'user'],
    ['/staff-attendance', 'Staff Attendance', 'check'],
    ['section', 'Academics'],
    ['/classes', 'Classes & Sections', 'layers'],
    ['/subjects', 'Subjects', 'book'],
    ['/class-subjects', 'Class Subjects', 'book'],
    ['/timetable', 'Timetable', 'clock'],
    ['/attendance', 'Student Attendance', 'check'],
    ['/homework', 'Homework', 'book'],
    ['/materials', 'Download Center', 'download'],
    ['section', 'Exams'],
    ['/exams', 'Exams', 'award'],
    ['/exam-schedule', 'Date Sheet', 'calendar'],
    ['/marks', 'Marks Entry', 'clipboard'],
    ['/results', 'Results', 'award'],
    ['/grades', 'Grades', 'award'],
    ['section', 'Finance'],
    ['/fees', 'Fee Invoices', 'wallet'],
    ['/online-payments', 'Online Payments', 'money'],
    ['/defaulters', 'Fee Defaulters', 'alert'],
    ['/fee-types', 'Fee Types', 'wallet'],
    ['/fee-structure', 'Fee Structure', 'wallet'],
    ['/payroll', 'Payroll', 'money'],
    ['/expenses', 'Expenses', 'money'],
    ['/incomes', 'Other Income', 'money'],
    ['section', 'Front office'],
    ['/enquiries', 'Admission Enquiries', 'phone'],
    ['/visitors', 'Visitor Book', 'users'],
    ['/calls', 'Phone Calls', 'phone'],
    ['/postal', 'Postal', 'send'],
    ['/complaints', 'Complaints', 'alert'],
    ['/leaves', 'Leave Requests', 'leave', 'leave'],
    ['section', 'Communication'],
    ['/notices', 'Notices', 'bell'],
    ['/messages', 'Messages', 'chat'],
    ['/sms', 'SMS / WhatsApp', 'send'],
    ['section', 'Library'],
    ['/books', 'Books', 'library'],
    ['/library-issues', 'Issue / Return', 'library'],
    ['section', 'Transport & hostel'],
    ['/transport', 'Routes', 'bus'],
    ['/vehicles', 'Vehicles', 'bus'],
    ['/hostels', 'Hostels', 'bed'],
    ['/hostel-rooms', 'Hostel Rooms', 'bed'],
    ['/hostel-residents', 'Hostel Residents', 'bed'],
    ['section', 'Inventory'],
    ['/store', 'Store Items', 'box'],
    ['/stock', 'Stock In / Out', 'box'],
    ['/suppliers', 'Suppliers', 'box'],
    ['/assets', 'Assets', 'box'],
    ['section', 'Reports & settings'],
    ['/reports', 'Reports', 'report'],
    ['/settings', 'School Settings', 'settings'],
    ['/sessions', 'Academic Sessions', 'calendar'],
    ['/users', 'User Accounts', 'user'],
    ['/leave-types', 'Leave Types', 'leave'],
    ['/payment-methods', 'Payment Methods', 'money'],
);

[
    ['/guardians', 'Parents / Guardians', M.guardians], ['/staff-attendance', 'Staff Attendance', Pages.staffAttendance],
    ['/subjects', 'Subjects', M.subjects], ['/class-subjects', 'Class Subjects', M.classSubjects], ['/timetable', 'Timetable', M.timetable],
    ['/homework', 'Homework', M.homework], ['/materials', 'Download Center', M.materials],
    ['/exams', 'Exams', M.exams], ['/exam-schedule', 'Date Sheet', M.examSchedule], ['/marks', 'Marks Entry', Pages.marks], ['/results', 'Results', Pages.results], ['/grades', 'Grades', M.grades],
    ['/online-payments', 'Online Payments', M.onlinePayments], ['/defaulters', 'Fee Defaulters', Pages.defaulters], ['/fee-types', 'Fee Types', M.feeTypes], ['/fee-structure', 'Fee Structure', M.feeStructures],
    ['/payroll', 'Payroll', Pages.payroll], ['/expenses', 'Expenses', M.expenses], ['/incomes', 'Other Income', M.incomes],
    ['/enquiries', 'Admission Enquiries', M.enquiries], ['/visitors', 'Visitor Book', M.visitors], ['/calls', 'Phone Calls', M.calls], ['/postal', 'Postal', M.postal], ['/complaints', 'Complaints', M.complaints],
    ['/notices', 'Notices', M.notices], ['/messages', 'Messages', Pages.messages], ['/sms', 'SMS / WhatsApp', M.smsLogs],
    ['/books', 'Books', M.books], ['/library-issues', 'Issue / Return', M.issues],
    ['/transport', 'Transport Routes', M.routes], ['/vehicles', 'Vehicles', M.vehicles],
    ['/hostels', 'Hostels', M.hostels], ['/hostel-rooms', 'Hostel Rooms', M.rooms], ['/hostel-residents', 'Hostel Residents', M.allocations],
    ['/store', 'Store Items', M.items], ['/stock', 'Stock In / Out', M.stock], ['/suppliers', 'Suppliers', M.suppliers], ['/assets', 'Assets', M.assets],
    ['/reports', 'Reports', Pages.reports], ['/settings', 'School Settings', Pages.settings], ['/sessions', 'Academic Sessions', M.sessions],
    ['/users', 'User Accounts', M.users], ['/leave-types', 'Leave Types', M.leaveTypes], ['/payment-methods', 'Payment Methods', M.paymentMethods],
].forEach(([p, t, fn]) => Router.add(p, t, fn));

/* ===========================================================
   Extra student / homework / fee tools
   =========================================================== */
Lookups.routes = function () { return this.get('routes', async () => (await API.get('/transport-routes', { all: 1 })).data); };

Object.assign(Pages, {
    async studentProfile(id) {
        const [{ data: s, summary }, hist] = await Promise.all([API.get('/students/' + id), API.get(`/students/${id}/history`).catch(() => ({ data: [] }))]);
        const att = summary?.attendance || {};
        const totalAtt = Object.values(att).reduce((n, x) => n + Number(x), 0);
        const pct = totalAtt ? Math.round(((Number(att.present || 0) + Number(att.late || 0)) / totalAtt) * 100) : null;
        const row = (k, v) => `<tr><td><small>${esc(k)}</small></td><td>${v}</td></tr>`;
        const m = modal({
            title: s.full_name, wide: true,
            body: `<div class="profile-card flex mb"><div class="avatar lg">${s.photo ? `<img src="${esc(storageUrl(s.photo))}" alt="">` : esc(initials(s.full_name))}</div>
                <div class="grow"><h2>${esc(s.full_name)}</h2><div class="meta">${esc(s.school_class?.name || '')} – ${esc(s.section?.name || '')} · Adm. ${esc(s.admission_no || '')} · Roll ${esc(s.roll_no || '—')} · ${badge(s.status)}</div></div></div>
            <div class="stats mb">
                <div class="card stat"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Attendance</div><div class="value">${pct === null ? '—' : pct + '%'}</div><div class="hint">${att.present || 0} present · ${att.absent || 0} absent</div></div></div>
                <div class="card stat"><div class="ico ${summary?.fees?.balance > 0 ? 'tone-bad' : 'tone-ok'}">${icon('wallet')}</div><div><div class="label">Fee balance</div><div class="value">${fmt.money(summary?.fees?.balance)}</div><div class="hint">Paid ${fmt.money(summary?.fees?.paid)} of ${fmt.money(summary?.fees?.billed)}</div></div></div></div>
            <div class="grid-2"><div class="card"><div class="card-head"><h2>Details</h2></div><table class="table compact"><tbody>
                ${row('Gender', fmt.cap(s.gender))}${row('Date of birth', fmt.date(s.date_of_birth))}${row('B-Form', esc(s.b_form || '—'))}${row('Admission date', fmt.date(s.admission_date))}
                ${row('Guardian', `${esc(s.guardian?.name || '—')} <small>${esc(s.guardian?.relation || '')}</small><br><small>${esc(s.guardian?.phone || '')}</small>`)}
                ${row('Transport', esc(s.transport_route ? `${s.transport_route.name} (${fmt.money(s.transport_route.fare)})` : 'None'))}${row('Monthly discount', fmt.money(s.monthly_discount))}${row('Address', esc(s.address || '—'))}
                ${row('Portal login', esc(s.user?.email || 'None'))}</tbody></table></div>
            <div class="card"><div class="card-head"><h2>History</h2></div>${(hist.data || []).length ? `<ul class="list">${hist.data.map((h) => `<li><div class="title">${esc(fmt.cap(h.event))}</div><div>${esc(h.description || '')}</div><small>${fmt.date(h.created_at)} · ${esc(h.school_class?.name || '')} ${esc(h.section?.name || '')} · ${esc(h.academic_session?.name || '')}${h.changer ? ' · by ' + esc(h.changer.name) : ''}</small></li>`).join('')}</ul>` : emptyHtml('No history yet')}</div></div>`,
            foot: `<a class="btn secondary" href="#/fees?search=${encodeURIComponent(s.admission_no || '')}" data-close>${icon('wallet')} Fee invoices</a><button class="btn" id="editStu">${icon('edit')} Edit</button>`,
        });
        $('#editStu', m.el).onclick = () => { m.close(); Pages.studentForm(s); };
    },

    async importStudents() {
        const m = modal({
            title: 'Import students from CSV',
            body: `<p>1. Download the template, fill one student per row (class and section must match names in Classes & Sections). 2. Check the file. 3. Import.</p>
            <button class="btn secondary mb" id="tpl">${icon('download')} Download template</button>
            <form class="form" id="imp"><label class="field"><span>CSV file *</span><input type="file" name="file" accept=".csv,text/csv" required></label><div id="impOut"></div>
            <div class="flex"><button type="button" class="btn secondary" id="check" data-busy="Checking…">Check file</button><button type="submit" class="btn" data-busy="Importing…">${icon('upload')} Import</button></div></form>`,
        });
        $('#tpl', m.el).onclick = (e) => busy(e.currentTarget, () => API.download('/students/import-template', null, 'student-import-template.csv').catch((err) => toast(err.message, 'error')));
        const send = async (dry, btn) => busy(btn, async () => {
            const f = $('#imp', m.el), out = $('#impOut', m.el);
            if (!f.file.files[0]) return toast('Choose a CSV file first.', 'error');
            const fd = new FormData(); fd.append('file', f.file.files[0]); if (dry) fd.append('dry_run', 1);
            try {
                const r = await API.request('POST', '/students/import', { body: fd });
                out.innerHTML = `<div class="alert ok">${icon('check')}<div>${esc(r.message)}</div></div>`;
                if (!dry) { toast(r.message); m.close(); Lookups.reset('classes', 'guardians', 'students'); Router.resolve(); }
            } catch (err) {
                const rows = Array.isArray(err.errors) ? err.errors : (err.errors?.errors || []);
                out.innerHTML = `<div class="alert bad">${icon('alert')}<div>${esc(err.message)}${Array.isArray(rows) && rows.length ? `<ul>${rows.slice(0, 30).map((r) => `<li>Line ${r.line}: ${esc((r.errors || []).join(', '))}</li>`).join('')}</ul>` : ''}</div></div>`;
            }
        });
        $('#check', m.el).onclick = (e) => send(true, e.currentTarget);
        $('#imp', m.el).onsubmit = (e) => { e.preventDefault(); send(false, $('button[type=submit]', e.currentTarget)); };
    },

    async promote() {
        const [classes, sections, sessions] = await Promise.all([Lookups.classes(), Lookups.sections(), Lookups.sessions()]);
        const { form } = formModal({
            title: 'Promote students', submitText: 'Promote',
            fields: `<p>Moves every active student of a section to a new class/section (end of session). Tick "graduated" for the final class.</p>
            ${field('From section *', sel('from_section_id', options(sections, { label: 'label', placeholder: 'Select section' })))}
            <label class="check"><input type="checkbox" name="mark_graduated"> Mark these students as graduated (school leaving)</label>
            <div id="toBox"><div class="form-row">${field('To class', sel('to_class_id', options(classes, { placeholder: 'Select class' })))}${field('To section', sel('to_section_id', ''))}</div>
            ${field('New session', sel('to_session_id', options(sessions, { placeholder: 'Keep current' })))}</div>`,
            onSubmit: async (v, _f, close) => {
                const b = clean(v); if (b.mark_graduated) { delete b.to_class_id; delete b.to_section_id; }
                if (!(await confirmBox('Promote all active students of this section now?'))) return;
                const r = await API.post('/students/promote', b); close(); toast(r.message || 'Students promoted.'); Lookups.reset('classes'); Router.resolve();
            },
        });
        const fill = () => { const c = $('[name=to_class_id]', form).value; $('[name=to_section_id]', form).innerHTML = options(sections.filter((s) => String(s.school_class_id) === c), { placeholder: c ? 'Select section' : 'Select class first' }); };
        $('[name=to_class_id]', form).onchange = fill; fill();
        $('[name=mark_graduated]', form).onchange = (e) => $('#toBox', form).classList.toggle('hidden', e.target.checked);
    },

    async homeworkSubmissions(hw) {
        const r = await API.get(`/homework/${hw.id}/submissions`);
        const rows = r.data || [];
        const m = modal({
            title: `Submissions · ${hw.title}`, wide: true,
            body: `${r.summary ? `<p>${Object.entries(r.summary).map(([k, v]) => `${badge(k, `${fmt.cap(k)}: ${v}`)}`).join(' ')}</p>` : ''}
            ${rows.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Roll</th><th>Student</th><th>Status</th><th>Answer</th><th>Marks</th><th></th></tr></thead><tbody>
            ${rows.map((x, i) => `<tr><td>${esc(x.roll_no || '—')}</td><td>${esc(x.name)}</td><td>${badge(x.status === 'pending' ? 'not submitted' : x.status, x.status === 'pending' ? 'Not submitted' : fmt.cap(x.status))}</td>
                <td>${x.submission ? `<span class="clamp">${esc(x.submission.content || '')}</span>${x.submission.attachment ? ` <a href="${esc(storageUrl(x.submission.attachment))}" target="_blank">File</a>` : ''}` : '—'}</td>
                <td>${x.submission?.marks != null ? fmt.num(x.submission.marks) : '—'}</td>
                <td>${x.submission ? `<button class="btn ghost sm" data-ev="${i}">Evaluate</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : emptyHtml('No students in this section')}`,
        });
        $$('[data-ev]', m.el).forEach((b) => (b.onclick = () => {
            const x = rows[+b.dataset.ev];
            formModal({
                title: `Evaluate · ${x.name}`, submitText: 'Save',
                fields: `${field('Marks', inp('marks', x.submission.marks ?? '', 'number', 'min="0"'))}${field('Feedback', `<textarea name="feedback" rows="3">${esc(x.submission.feedback || '')}</textarea>`)}`,
                onSubmit: async (v, _f, close) => { toast((await API.post(`/homework-submissions/${x.submission.id}/evaluate`, clean(v))).message); close(); m.close(); Pages.homeworkSubmissions(hw); },
            });
        }));
    },

    async invoiceDetails(id) {
        const { data: inv } = await API.get('/fee-invoices/' + id);
        const m = modal({
            title: `Invoice ${inv.invoice_no}`, wide: true,
            body: `<p><b>${esc(inv.student?.full_name || '')}</b> · ${esc(inv.student?.school_class?.name || '')} – ${esc(inv.student?.section?.name || '')} · ${fmt.month(inv.month)} · ${badge(inv.status)}</p>
            <div class="grid-2"><div class="card"><div class="card-head"><h2>Items</h2></div><table class="table compact"><tbody>
                ${(inv.items || []).map((it) => `<tr><td>${esc(it.fee_type?.name || it.description || 'Fee')}</td><td class="num">${fmt.money(it.amount)}</td></tr>`).join('')}
                ${Number(inv.discount) ? `<tr><td>Discount</td><td class="num">− ${fmt.money(inv.discount)}</td></tr>` : ''}${Number(inv.fine) ? `<tr><td>Late fine</td><td class="num">${fmt.money(inv.fine)}</td></tr>` : ''}
                </tbody><tfoot><tr><td>Total</td><td class="num"><b>${fmt.money(inv.total)}</b></td></tr><tr><td>Balance</td><td class="num"><b>${fmt.money(inv.balance)}</b></td></tr></tfoot></table></div>
            <div class="card"><div class="card-head"><h2>Payments</h2></div>${(inv.payments || []).length ? `<table class="table compact"><tbody>
                ${inv.payments.map((p, i) => `<tr><td>${esc(p.receipt_no || '')}<br><small>${fmt.date(p.paid_on)} · ${fmt.cap(p.method)}${p.receiver ? ' · ' + esc(p.receiver.name) : ''}</small></td><td class="num">${fmt.money(p.amount)}</td>
                <td class="right nowrap"><button class="btn ghost sm" data-rc="${i}" title="Receipt PDF">${icon('download')}</button><button class="btn ghost sm" data-dp="${i}" title="Delete payment">${icon('trash')}</button></td></tr>`).join('')}</tbody></table>` : emptyHtml('No payments yet', '', 'wallet')}</div></div>`,
            foot: `<button class="btn secondary" id="vou">${icon('download')} Voucher</button>${inv.status !== 'cancelled' && Number(inv.paid) === 0 ? `<button class="btn danger" id="cancelInv">Cancel invoice</button>` : ''}`,
        });
        $('#vou', m.el).onclick = (e) => busy(e.currentTarget, () => API.download(`/fee-invoices/${id}/voucher`, null, 'voucher.pdf').catch((err) => toast(err.message, 'error')));
        if ($('#cancelInv', m.el)) $('#cancelInv', m.el).onclick = async () => { if (!(await confirmBox('Cancel this invoice?', { okText: 'Cancel invoice', danger: true }))) return; try { toast((await API.post(`/fee-invoices/${id}/cancel`)).message || 'Cancelled.'); m.close(); Router.resolve(); } catch (e) { toast(e.message, 'error'); } };
        $$('[data-rc]', m.el).forEach((b) => (b.onclick = () => busy(b, () => API.download(`/fee-payments/${inv.payments[+b.dataset.rc].id}/receipt`, null, 'receipt.pdf').catch((err) => toast(err.message, 'error')))));
        $$('[data-dp]', m.el).forEach((b) => (b.onclick = async () => { const p = inv.payments[+b.dataset.dp]; if (!(await confirmBox(`Delete payment ${p.receipt_no} of ${fmt.money(p.amount)}? The invoice balance goes back up.`, { okText: 'Delete', danger: true }))) return; try { await API.del('/fee-payments/' + p.id); toast('Payment deleted.'); m.close(); Router.resolve(); } catch (e) { toast(e.message, 'error'); } }));
    },
});

/* ===========================================================
   New school features: events calendar, behaviour remarks,
   ID cards, certificates, birthdays, global search, dashboard
   =========================================================== */
const EV_TYPES = { event: 'Event', holiday: 'Holiday', exam: 'Exam', meeting: 'Meeting', sports: 'Sports', other: 'Other' };
const evRange = (e) => fmt.date(e.start_date) + (e.end_date && e.end_date !== e.start_date ? ' – ' + fmt.date(e.end_date) : '') + (e.start_time ? ` · ${fmt.time(e.start_time)}${e.end_time ? ' – ' + fmt.time(e.end_time) : ''}` : '');
const shiftMonth = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
function eventLi(e) {
    const d = fmt.parse(e.start_date);
    return `<li class="ev t-${esc(e.type)}" data-ev="${e.id}" style="cursor:pointer"><div class="date-tile"><b>${d.getDate()}</b><span>${d.toLocaleDateString('en-GB', { month: 'short' })}</span></div>
        <div class="grow"><div class="ev-type" style="color:var(--evt)">${esc(EV_TYPES[e.type] || e.type)}</div><div class="title">${esc(e.title)}</div><small>${evRange(e)}${e.location ? ' · ' + esc(e.location) : ''}</small></div></li>`;
}
function monthGrid(ym, events) {
    const [y, m] = ym.split('-').map(Number);
    const start = new Date(y, m - 1, 1 - ((new Date(y, m - 1, 1).getDay() + 6) % 7));
    const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    let html = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        if (i >= 35 && d.getMonth() !== m - 1) break;
        const k = key(d);
        const evs = events.filter((e) => e.start_date <= k && (e.end_date || e.start_date) >= k);
        html += `<div class="cell ${d.getMonth() !== m - 1 ? 'other' : ''} ${k === fmt.today() ? 'today' : ''}" data-day="${k}"><span class="n">${d.getDate()}</span>
            ${evs.slice(0, 3).map((e) => `<span class="e t-${esc(e.type)}" data-ev="${e.id}" title="${esc(e.title)}">${esc(e.title)}</span>`).join('')}${evs.length > 3 ? `<small>+${evs.length - 3} more</small>` : ''}</div>`;
    }
    return `<div class="mcal">${html}</div>`;
}

const eventFields = [{ name: 'title', label: 'Title', required: true }, { row: [{ name: 'type', label: 'Type', type: 'select', required: true, options: Object.entries(EV_TYPES).map(([id, name]) => ({ id, name })), value: 'event', placeholder: '' },
    { name: 'audience', label: 'Who can see it', type: 'select', required: true, options: [{ id: 'all', name: 'Everyone' }, { id: 'staff', name: 'Staff only' }, { id: 'parents', name: 'Parents' }, { id: 'students', name: 'Students' }], value: 'all', placeholder: '' }] },
    { row: [{ name: 'start_date', label: 'Start date', type: 'date', required: true, value: fmt.today() }, { name: 'end_date', label: 'End date (multi-day)', type: 'date' }] },
    { row: [{ name: 'start_time', label: 'Start time', type: 'time' }, { name: 'end_time', label: 'End time', type: 'time' }] }, { name: 'location', label: 'Location' }, { name: 'description', label: 'Details', type: 'textarea' }];
const eventCfg = { endpoint: '/events', singular: 'event', fields: eventFields };

M.eventsList = Crud.page({
    endpoint: '/events', title: 'Events', singular: 'event', search: 'Title or place', icon: 'calendar',
    filters: [{ name: 'type', label: 'Type', options: Object.entries(EV_TYPES).map(([id, name]) => ({ id, name })) }, filt.from, filt.to],
    toolbar: [{ label: 'Calendar view', icon: 'calendar', run: () => go('/events') }],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => evRange(r) }, { label: 'Event', render: (r) => `<b>${esc(r.title)}</b>${r.location ? `<br><small>${esc(r.location)}</small>` : ''}` },
        { label: 'Type', render: (r) => `<span class="badge t-${esc(r.type)}" style="background:var(--evc);color:var(--evt)">${EV_TYPES[r.type] || r.type}</span>` }, { label: 'For', render: (r) => fmt.cap(r.audience === 'all' ? 'everyone' : r.audience) }],
    fields: eventFields,
});

Object.assign(Pages, {
    async events(view, _p, q) {
        const ym = q.month || fmt.thisMonth();
        const [y, m] = ym.split('-').map(Number);
        const from = `${ym}-01`, to = `${ym}-${pad(new Date(y, m, 0).getDate())}`;
        let res;
        try { res = await API.get('/events/feed', { from, to }); } catch (e) {
            view.innerHTML = `<div class="alert warn">${icon('alert')}<div>The calendar tables are not created yet. Run <code>php artisan migrate</code> in the project folder, then refresh.</div></div>`; return;
        }
        view.innerHTML = `<div class="card"><div class="card-head"><h2>${fmt.month(ym)}</h2><div class="flex flex-wrap">
            <a class="btn secondary sm" href="#/events?month=${shiftMonth(ym, -1)}">‹</a><a class="btn secondary sm" href="#/events">Today</a><a class="btn secondary sm" href="#/events?month=${shiftMonth(ym, 1)}">›</a>
            <a class="btn secondary sm" href="#/events-list">List view</a><button class="btn sm" id="addEv">${icon('plus')} Add event</button></div></div>
            ${monthGrid(ym, res.data)}
            <div class="card-body legend">${Object.entries(EV_TYPES).map(([k, l]) => `<span class="t-${k}"><i style="background:var(--evt)"></i>${l}</span>`).join('')} <small>Tip: click a day to add an event on that date.</small></div></div>`;
        $('#addEv', view).onclick = () => Crud.form(eventCfg);
        $$('[data-day]', view).forEach((c) => (c.ondblclick = c.onclick = (e) => { if (e.target.closest('[data-ev]')) return; Crud.form(eventCfg, null).then((md) => { md.form.start_date.value = c.dataset.day; }); }));
        $$('[data-ev]', view).forEach((el) => (el.onclick = () => {
            const ev = res.data.find((x) => x.id === +el.dataset.ev);
            const md = modal({ title: ev.title, body: `<p>${`<span class="badge t-${esc(ev.type)}" style="background:var(--evc);color:var(--evt)">${EV_TYPES[ev.type]}</span>`} ${badge('info', ev.audience === 'all' ? 'Everyone' : fmt.cap(ev.audience))}</p><p><b>${evRange(ev)}</b>${ev.location ? '<br><small>' + esc(ev.location) + '</small>' : ''}</p>${ev.description ? `<p class="pre">${esc(ev.description)}</p>` : ''}`,
                foot: `<button class="btn danger" data-d>${icon('trash')} Delete</button><button class="btn" data-e>${icon('edit')} Edit</button>` });
            $('[data-e]', md.el).onclick = () => { md.close(); Crud.form(eventCfg, ev); };
            $('[data-d]', md.el).onclick = async () => { if (!(await confirmBox(`Delete "${ev.title}"?`, { okText: 'Delete', danger: true }))) return; await API.del('/events/' + ev.id); md.close(); toast('Event deleted.'); Router.resolve(); };
        }));
    },
});

/* ----- behaviour / discipline ----- */
M.remarks = Crud.page({
    endpoint: '/student-remarks', title: 'Behaviour & remarks', singular: 'remark', search: 'Title, category', icon: 'award',
    intro: 'Appreciation and discipline log. Parents see remarks marked "Show to parent" in their portal; teachers can add remarks from the teacher portal.',
    filters: [{ name: 'type', label: 'Type', options: [{ id: 'positive', name: 'Appreciation' }, { id: 'negative', name: 'Concern' }, { id: 'note', name: 'Note' }] }, filt.sec, filt.from, filt.to],
    columns: [{ label: 'Date', cls: 'nowrap', render: (r) => fmt.date(r.remark_date) }, { label: 'Student', render: (r) => `<b>${esc(r.student ? `${r.student.first_name} ${r.student.last_name || ''}` : '')}</b><br><small>${esc(r.student?.school_class?.name || '')} – ${esc(r.student?.section?.name || '')}</small>` },
        { label: 'Remark', render: (r) => `<b>${esc(r.title)}</b>${r.category ? ` <small>· ${esc(r.category)}</small>` : ''}<br><small class="clamp">${esc(r.description || '')}</small>` },
        { label: 'Type', render: (r) => badge(r.type === 'positive' ? 'approved' : r.type === 'negative' ? 'rejected' : 'leave', r.type === 'positive' ? 'Appreciation' : r.type === 'negative' ? 'Concern' : 'Note') },
        { label: 'Parent', render: (r) => (r.visible_to_parent ? badge('active', 'Visible') : badge('', 'Hidden')) }, { label: 'By', render: (r) => esc(r.creator?.name || '—') }],
    name: (r) => r.title,
    fields: (r) => [{ name: 'student_id', label: 'Student', type: 'select', required: true, options: async () => (await Lookups.students()).map((s) => ({ id: s.id, name: `${studentLabel(s)} · ${s.school_class?.name || ''} ${s.section?.name || ''}` })) },
        { row: [{ name: 'type', label: 'Type', type: 'select', required: true, options: [{ id: 'positive', name: 'Appreciation (positive)' }, { id: 'negative', name: 'Concern (negative)' }, { id: 'note', name: 'General note' }], value: 'positive', placeholder: '' },
            { name: 'category', label: 'Category', attrs: 'list="rmCats" placeholder="e.g. Discipline"' }] },
        { html: '<datalist id="rmCats"><option>Discipline</option><option>Homework</option><option>Punctuality</option><option>Uniform</option><option>Class participation</option><option>Sports</option><option>Good behaviour</option><option>Bullying</option></datalist>' },
        { name: 'title', label: 'Title', required: true }, { name: 'description', label: 'Details', type: 'textarea' },
        { row: [{ name: 'remark_date', label: 'Date', type: 'date', value: fmt.today() }, { name: 'action_taken', label: 'Action taken' }] }, { name: 'visible_to_parent', label: 'Show to parent in portal', type: 'checkbox', value: true }],
});

/* ----- printing helpers ----- */
function schoolHeader() {
    const s = App.school || {};
    return { name: s.name || 'School', address: s.address || '', phone: s.phone || '', logo: s.logo_url || new URL('../brand/aas-logo.svg', location.href).href };
}
function printWindow(title, css, body) {
    const w = window.open('', '_blank');
    if (!w) { toast('Allow pop-ups for this site to print.', 'error'); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
        <style>*{box-sizing:border-box}body{margin:0;font-family:"Plus Jakarta Sans","Segoe UI",Arial,sans-serif;color:#17152f;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .bar{position:sticky;top:0;background:#1e1b4b;color:#fff;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;font-size:14px}
        .bar button{background:#f59e0b;border:0;border-radius:8px;padding:8px 16px;font-weight:800;cursor:pointer}
        @media print{.bar{display:none}}${css}</style></head><body><div class="bar"><span>${esc(title)}</span><button onclick="print()">Print</button></div>${body}</body></html>`);
    w.document.close();
}

/* ----- ID cards ----- */
Object.assign(Pages, {
    async idCards(view, _p, q) {
        const kind = q.kind || 'students';
        const sections = await Lookups.sections();
        const sec = q.section || sections.find((s) => s.students_count)?.id || sections[0]?.id;
        view.innerHTML = `<div class="tabs"><button data-k="students" class="${kind === 'students' ? 'active' : ''}">Student ID cards</button><button data-k="staff" class="${kind === 'staff' ? 'active' : ''}">Staff ID cards</button></div>
        <div class="card mb"><div class="card-body"><div class="toolbar">
            ${kind === 'students' ? `<label class="field wide"><span>Class / section</span><select id="sec">${options(sections, { label: 'label', selected: sec })}</select></label>` : ''}
            <label class="field"><span>Valid till</span><input type="date" id="valid" value="${(await Lookups.sessions()).find((s) => s.is_current)?.end_date?.slice(0, 10) || ''}"></label>
            <button class="btn" id="print">${icon('download')} Print cards</button></div></div></div><div id="cards">${loadingHtml()}</div>`;
        $$('[data-k]', view).forEach((b) => (b.onclick = () => go('/id-cards', { kind: b.dataset.k })));
        if ($('#sec', view)) $('#sec', view).onchange = (e) => go('/id-cards', { kind, section: e.target.value });
        const people = kind === 'students'
            ? (await API.get('/students', { section_id: sec, all: 1, status: 'active' })).data
            : (await API.get('/teachers', { all: 1 })).data.filter((t) => t.status === 'active');
        const sch = schoolHeader();
        const card = (p) => {
            const isS = kind === 'students';
            const name = isS ? p.full_name : p.name;
            const rows = isS
                ? [['Class', `${p.school_class?.name || ''} – ${p.section?.name || ''}`], ['Adm. No', p.admission_no], ['Roll No', p.roll_no], ['Father / Guardian', p.guardian?.name], ['Contact', p.guardian?.phone], ['Blood group', p.blood_group]]
                : [['Designation', p.designation], ['Employee No', p.employee_no], ['Phone', p.phone], ['CNIC', p.cnic], ['Blood group', null]];
            return `<div class="idc"><div class="idc-top"><img src="${esc(sch.logo)}" alt=""><div><b>${esc(sch.name)}</b><small>${esc(sch.phone || sch.address || '')}</small></div></div>
                <div class="idc-ph">${p.photo ? `<img src="${esc(storageUrl(p.photo))}" alt="">` : `<span>${esc(initials(name))}</span>`}</div>
                <div class="idc-name">${esc(name)}</div><div class="idc-role">${isS ? 'STUDENT' : esc((p.staff_type === 'non_teaching' ? 'STAFF' : 'TEACHER'))}</div>
                <table>${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
                <div class="idc-foot">${$('#valid', view)?.value ? 'Valid till ' + esc(fmt.date($('#valid', view).value)) : 'AAS School Manager'}</div></div>`;
        };
        const css = `.idgrid{display:flex;flex-wrap:wrap;gap:14px;padding:16px}
            .idc{width:54mm;height:86mm;border-radius:10px;overflow:hidden;background:#fff;border:1px solid #e3e1f2;position:relative;display:flex;flex-direction:column;align-items:center;font-size:8.5px;break-inside:avoid;box-shadow:0 4px 14px rgba(0,0,0,.08)}
            .idc-top{width:100%;background:linear-gradient(120deg,#4f46e5,#3b0f8c);color:#fff;display:flex;gap:6px;align-items:center;padding:7px 8px 24px}
            .idc-top img{width:22px;height:22px;border-radius:5px;background:#fff;object-fit:contain}.idc-top b{display:block;font-size:10px;line-height:1.1}.idc-top small{opacity:.8;font-size:7px}
            .idc-ph{width:58px;height:58px;border-radius:50%;margin-top:-20px;border:3px solid #fbbf24;background:#eef2ff;overflow:hidden;display:grid;place-items:center;font-weight:800;color:#4f46e5;font-size:18px}
            .idc-ph img{width:100%;height:100%;object-fit:cover}.idc-name{font-weight:800;font-size:11px;margin-top:5px;text-align:center;padding:0 6px}
            .idc-role{font-size:7px;font-weight:800;letter-spacing:.12em;color:#b45309;background:#fef3c7;border-radius:99px;padding:1px 8px;margin:3px 0 5px}
            .idc table{width:88%;border-collapse:collapse}.idc td{padding:1.5px 0;vertical-align:top}.idc td:first-child{color:#85829f;width:46%}.idc td:last-child{font-weight:700}
            .idc-foot{margin-top:auto;width:100%;text-align:center;background:#1e1b4b;color:#fbbf24;font-weight:700;font-size:7px;padding:4px}
            @media print{.idgrid{padding:0;gap:6mm}.idc{box-shadow:none}}`;
        const html = people.length ? `<div class="idgrid">${people.map(card).join('')}</div>` : '';
        const box = $('#cards', view);
        box.innerHTML = people.length ? `<div class="card"><style>${css}</style>${html}</div>` : `<div class="card">${emptyHtml('Nobody to show')}</div>`;
        $('#print', view).onclick = () => printWindow(`ID cards · ${kind}`, css, `<div class="idgrid">${people.map(card).join('')}</div>`);
    },

    /* ----- certificates ----- */
    async certificates(view, _p, q) {
        const sections = await Lookups.sections();
        const sec = q.section || sections.find((s) => s.students_count)?.id || sections[0]?.id;
        const students = (await API.get('/students', { section_id: sec, all: 1 })).data;
        const curSession = (await Lookups.sessions()).find((x) => x.is_current)?.name || '';
        const TYPES = { leaving: 'School Leaving Certificate', character: 'Character Certificate', bonafide: 'Bonafide / Enrolment Certificate', appreciation: 'Certificate of Appreciation' };
        view.innerHTML = `<div class="grid-2" style="grid-template-columns:minmax(0,1fr) minmax(0,1.6fr)">
            <div class="card" style="align-self:start"><div class="card-head"><h2>Certificate details</h2></div><div class="card-body"><form class="form" id="cf">
                ${field('Certificate', sel('type', options(Object.entries(TYPES).map(([id, name]) => ({ id, name })), { selected: q.type || 'leaving' })))}
                ${field('Class / section', `<select name="section">${options(sections, { label: 'label', selected: sec })}</select>`)}
                ${field('Student', sel('student', options(students, { label: (s) => `${s.full_name} (${s.admission_no || ''})` })))}
                ${field('Issue date', inp('issue_date', fmt.today(), 'date'))}
                <div data-for="leaving">${field('Date of leaving', inp('leaving_date', fmt.today(), 'date'))}${field('Reason for leaving', inp('reason', 'On parents\' request'))}</div>
                <div data-for="leaving character">${field('Conduct', sel('conduct', options(opt(['Excellent', 'Very good', 'Good', 'Satisfactory']), { selected: 'Good' })))}</div>
                <div data-for="appreciation">${field('For (achievement)', inp('achievement', 'outstanding performance in academics'))}</div>
                ${field('Certificate no', inp('cert_no', 'CERT-' + Date.now().toString().slice(-6)))}
                <button class="btn" type="button" id="pr">${icon('download')} Print certificate</button></form></div></div>
            <div class="card"><div class="card-head"><h2>Preview</h2></div><div class="card-body" id="prev" style="background:#f5f4fb"></div></div></div>`;
        const f = $('#cf', view);
        f.section.onchange = (e) => go('/certificates', { section: e.target.value, type: f.type.value });
        const css = `.cert{width:270mm;min-height:190mm;margin:10px auto;background:#fff;padding:16mm 20mm;position:relative;border:10px solid #1e1b4b;outline:3px solid #fbbf24;outline-offset:-18px;text-align:center}
            .cert .logo{width:62px;height:62px;object-fit:contain;margin:0 auto}.cert h1{font-family:"Playfair Display",Georgia,serif;font-size:30px;margin:8px 0 2px;color:#1e1b4b}
            .cert .addr{color:#85829f;font-size:12px}.cert h2{display:inline-block;margin:18px 0 10px;padding:6px 22px;background:linear-gradient(120deg,#4f46e5,#3b0f8c);color:#fff;border-radius:99px;font-size:17px;letter-spacing:.04em}
            .cert .no{position:absolute;top:14mm;right:20mm;font-size:11px;color:#85829f}.cert p{font-size:15px;line-height:2;max-width:220mm;margin:10px auto;text-align:justify}
            .cert b.f{border-bottom:1px dashed #85829f;padding:0 6px}.sign{display:flex;justify-content:space-between;margin-top:40px;font-size:13px}.sign div{border-top:1.5px solid #17152f;padding-top:6px;width:60mm}
            @page{size:A4 landscape;margin:8mm}@media print{.cert{margin:0 auto}}`;
        const render = () => {
            const v = formValues(f);
            $$('[data-for]', f).forEach((d) => d.classList.toggle('hidden', !d.dataset.for.split(' ').includes(v.type)));
            const s = students.find((x) => String(x.id) === v.student);
            if (!s) { $('#prev', view).innerHTML = emptyHtml('No students in this section'); return ''; }
            const he = s.gender === 'female' ? 'she' : 'he', his = s.gender === 'female' ? 'her' : 'his', child = s.gender === 'female' ? 'daughter' : 'son';
            const g = s.guardian?.name || '________';
            const B = (x) => `<b class="f">${esc(x || '________')}</b>`;
            const cls = `${s.school_class?.name || ''} ${s.section?.name || ''}`;
            const sch = schoolHeader();
            const text = {
                leaving: `This is to certify that ${B(s.full_name)}, ${child} of ${B(g)}, Admission No. ${B(s.admission_no)}, born on ${B(fmt.date(s.date_of_birth))}, was a bonafide student of this school from ${B(fmt.date(s.admission_date))} to ${B(fmt.date(v.leaving_date))}. At the time of leaving ${he} was studying in ${B(cls)}. ${fmt.cap(his)} conduct during this period was ${B(v.conduct)}. Reason for leaving: ${B(v.reason)}. All dues of the school have been cleared. We wish ${his === 'her' ? 'her' : 'him'} success in the future.`,
                character: `This is to certify that ${B(s.full_name)}, ${child} of ${B(g)}, Admission No. ${B(s.admission_no)}, is / was a student of this school in ${B(cls)}. To the best of our knowledge ${he} bears a ${B(v.conduct.toLowerCase())} moral character. ${fmt.cap(he)} has not taken part in any activity against the discipline of the school.`,
                bonafide: `This is to certify that ${B(s.full_name)}, ${child} of ${B(g)}, Admission No. ${B(s.admission_no)}, date of birth ${B(fmt.date(s.date_of_birth))}, is a bonafide student of this school, currently enrolled in ${B(cls)} ${curSession ? `for the session ${B(curSession)}` : ''}. This certificate is issued on the request of the parent / guardian.`,
                appreciation: `This certificate is proudly presented to ${B(s.full_name)} of ${B(cls)} in recognition of ${B(v.achievement)}. We appreciate ${his} hard work and dedication, and wish ${his === 'her' ? 'her' : 'him'} continued success.`,
            }[v.type];
            const html = `<div class="cert"><div class="no">No. ${esc(v.cert_no)}<br>Date: ${fmt.date(v.issue_date)}</div><img class="logo" src="${esc(sch.logo)}" alt=""><h1>${esc(sch.name)}</h1><div class="addr">${esc([sch.address, sch.phone].filter(Boolean).join(' · '))}</div>
                <h2>${esc(TYPES[v.type])}</h2><p>${text}</p><div class="sign"><div>Class Teacher</div><div>Principal</div></div></div>`;
            $('#prev', view).innerHTML = `<style>${css.replace('width:270mm', 'width:100%').replace('min-height:190mm', 'min-height:0').replace(/16mm 20mm/, '28px 34px')}</style>${html}`;
            return html;
        };
        $$('input, select', f).forEach((el) => { if (el.name !== 'section') el.oninput = el.onchange = render; });
        render();
        $('#pr', view).onclick = () => { const h = render(); if (h) printWindow(TYPES[f.type.value], css, h); };
    },
});

/* ----- birthdays & dashboard ----- */
function upcomingBirthdays(list, getDob, days = 7) {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return list.map((p) => {
        const dob = getDob(p); if (!dob) return null;
        const d = fmt.parse(dob); if (!d || isNaN(d)) return null;
        let next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
        if (next < now) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
        const inDays = Math.round((next - now) / 86400000);
        return inDays <= days ? { p, inDays, age: next.getFullYear() - d.getFullYear() } : null;
    }).filter(Boolean).sort((a, b) => a.inDays - b.inDays);
}

{
    const baseDashboard = Pages.dashboard;
    Pages.dashboard = async (view, p, q) => {
        await baseDashboard(view, p, q);
        const hour = new Date().getHours();
        const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        view.insertAdjacentHTML('afterbegin', `
            <div class="welcome"><div><h2>${greet}, ${esc(App.user.name.split(' ')[0])} 👋</h2><p>${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${esc(App.school.name || '')}</p></div>
                <div class="actions"><a class="btn amber" href="#/attendance">${icon('check')} Attendance</a><a class="btn" href="#/fees?status=outstanding">${icon('wallet')} Collect fee</a><a class="btn" href="#/students">${icon('plus')} Students</a></div></div>
            <div class="quick">
                ${[['/students', 'Students', 'users', 'tone-brand'], ['/fees', 'Fee invoices', 'wallet', 'tone-ok'], ['/attendance', 'Attendance', 'check', 'tone-info'], ['/marks', 'Marks entry', 'clipboard', 'tone-warn'], ['/events', 'Calendar', 'calendar', 'tone-bad'],
                    ['/notices', 'Notices', 'bell', 'tone-brand'], ['/id-cards', 'ID cards', 'user', 'tone-info'], ['/certificates', 'Certificates', 'award', 'tone-ok'], ['/reports', 'Reports', 'report', 'tone-warn']]
                    .map(([h, l, i, t]) => `<a href="#${h}"><span class="${t}">${icon(i)}</span>${l}</a>`).join('')}
            </div>`);
        const extra = document.createElement('div');
        extra.className = 'grid-2 mt';
        extra.innerHTML = `<div class="card"><div class="card-head"><h2>Upcoming events &amp; holidays</h2><a class="btn ghost sm" href="#/events">Calendar</a></div><div id="dEv">${loadingHtml()}</div></div>
            <div class="card"><div class="card-head"><h2>🎂 Birthdays this week</h2></div><div id="dBd">${loadingHtml()}</div></div>`;
        view.appendChild(extra);
        API.get('/events/feed', { from: fmt.today() }).then(({ data }) => {
            const next = data.filter((e) => (e.end_date || e.start_date) >= fmt.today()).slice(0, 6);
            $('#dEv', extra).innerHTML = next.length ? `<ul class="list">${next.map(eventLi).join('')}</ul>` : emptyHtml('No upcoming events', 'Add holidays, PTMs and functions in the calendar.', 'calendar');
        }).catch(() => { $('#dEv', extra).innerHTML = `<div class="card-body"><div class="alert warn">${icon('alert')}<div>Run <code>php artisan migrate</code> to enable the calendar.</div></div></div>`; });
        Promise.all([Lookups.students(), Lookups.teachers()]).then(([st, te]) => {
            const list = [...upcomingBirthdays(st, (s) => s.date_of_birth).map((x) => ({ ...x, who: x.p.full_name, sub: `${x.p.school_class?.name || ''} – ${x.p.section?.name || ''}` })),
                ...upcomingBirthdays(te.filter((t) => t.status === 'active'), (t) => t.date_of_birth).map((x) => ({ ...x, who: x.p.name, sub: x.p.designation || 'Staff' }))].sort((a, b) => a.inDays - b.inDays);
            $('#dBd', extra).innerHTML = list.length ? `<ul class="list">${list.slice(0, 8).map((x) => `<li class="item-row"><div class="avatar">${esc(initials(x.who))}</div><div class="grow"><div class="title">${esc(x.who)}</div><small>${esc(x.sub)} · turns ${x.age}</small></div>${x.inDays === 0 ? badge('warn', '🎉 Today') : badge('', x.inDays === 1 ? 'Tomorrow' : `In ${x.inDays} days`)}</li>`).join('')}</ul>` : emptyHtml('No birthdays this week', '', 'user');
        }).catch(() => { $('#dBd', extra).innerHTML = ''; });
    };
    Router.routes.find((r) => r.pattern === "/").render = Pages.dashboard;
}

/* ----- global search in the top bar ----- */
{
    const baseRender = Layout.render;
    Layout.render = function () {
        baseRender.apply(this, arguments);
        if ($('.gsearch') || (typeof Platform !== 'undefined' && Platform.active) || (typeof Owner !== 'undefined' && Owner.active)) return;
        $('#pageTitle').insertAdjacentHTML('afterend', `<div class="gsearch">${icon('search')}<input id="gq" placeholder="Search students, staff, parents…" autocomplete="off"><div class="gresults hidden" id="gr"></div></div>`);
        const q = $('#gq'), box = $('#gr');
        let t, seq = 0;
        const hide = () => box.classList.add('hidden');
        q.oninput = () => {
            clearTimeout(t);
            const term = q.value.trim();
            if (term.length < 2) return hide();
            t = setTimeout(async () => {
                const my = ++seq;
                const [s, te, g] = await Promise.all([API.get('/students', { search: term, per_page: 6 }), API.get('/teachers', { search: term, per_page: 4 }), API.get('/guardians', { search: term, per_page: 4 })].map((p) => p.catch(() => ({ data: [] }))));
                if (my !== seq) return;
                const grp = (title, items) => (items.length ? `<div class="grp">${title}</div>${items.join('')}` : '');
                const html = grp('Students', s.data.map((x) => `<a href="javascript:void 0" data-s="${x.id}"><div class="avatar">${esc(initials(x.full_name))}</div><div><b>${esc(x.full_name)}</b><small>${esc(x.admission_no || '')} · ${esc(x.school_class?.name || '')} ${esc(x.section?.name || '')}</small></div></a>`))
                    + grp('Staff', te.data.map((x) => `<a href="#/teachers?search=${encodeURIComponent(x.name)}"><div class="avatar">${esc(initials(x.name))}</div><div><b>${esc(x.name)}</b><small>${esc(x.designation || '')} · ${esc(x.phone || '')}</small></div></a>`))
                    + grp('Parents', g.data.map((x) => `<a href="#/guardians?search=${encodeURIComponent(x.phone || x.name)}"><div class="avatar">${esc(initials(x.name))}</div><div><b>${esc(x.name)}</b><small>${esc(x.phone || '')} · ${(x.students || []).map((c) => esc(c.full_name)).join(', ')}</small></div></a>`));
                box.innerHTML = html || '<div class="grp">No results</div>';
                box.classList.remove('hidden');
                $$('[data-s]', box).forEach((a) => (a.onclick = () => { hide(); Pages.studentProfile(+a.dataset.s).catch((e) => toast(e.message, 'error')); }));
                $$('a[href^="#"]', box).forEach((a) => a.addEventListener('click', hide));
            }, 250);
        };
        q.onkeydown = (e) => { if (e.key === 'Escape') { q.value = ''; hide(); } };
        document.addEventListener('click', (e) => { if (!e.target.closest('.gsearch')) hide(); });
    };
}

/* ----- navigation for the new pages ----- */
{
    const after = (path, ...items) => NAV.splice(NAV.findIndex((n) => n[0] === path) + 1, 0, ...items);
    after('/staff-attendance', ['/remarks', 'Behaviour & Remarks', 'award']);
    after('/materials', ['/events', 'School Calendar', 'calendar']);
    after('/leaves', ['/id-cards', 'ID Cards', 'user'], ['/certificates', 'Certificates', 'award']);
    [['/events', 'School Calendar', Pages.events], ['/events-list', 'Events', M.eventsList], ['/remarks', 'Behaviour & Remarks', M.remarks],
        ['/id-cards', 'ID Cards', Pages.idCards], ['/certificates', 'Certificates', Pages.certificates]].forEach(([p, t, fn]) => Router.add(p, t, fn));
}

/* ===========================================================
   Multi-school: per-school settings & modules, and the
   platform super admin panel (main domain).
   =========================================================== */
const MODULE_INFO = {
    exams: ['Exams & results', ['/exams', '/exam-schedule', '/marks', '/results', '/grades']],
    homework: ['Homework & downloads', ['/homework', '/materials']],
    online_admission: ['Online admissions', ['/admissions']],
    finance: ['Income & expenses', ['/expenses', '/incomes']],
    payroll: ['Payroll', ['/payroll']],
    front_office: ['Front office', ['/enquiries', '/visitors', '/calls', '/postal', '/complaints']],
    library: ['Library', ['/books', '/library-issues']],
    transport: ['Transport', ['/transport', '/vehicles']],
    hostel: ['Hostel', ['/hostels', '/hostel-rooms', '/hostel-residents']],
    inventory: ['Inventory & assets', ['/store', '/stock', '/suppliers', '/assets']],
    sms: ['SMS / WhatsApp', ['/sms']],
    events: ['School calendar', ['/events', '/events-list']],
    remarks: ['Behaviour & remarks', ['/remarks']],
};
const PLANS = [{ id: 'basic', name: 'Basic' }, { id: 'standard', name: 'Standard' }, { id: 'premium', name: 'Premium' }, { id: 'custom', name: 'Custom' }];
const appDomain = () => location.hostname.split('.').slice(-1)[0] === 'localhost' ? 'localhost' : location.hostname.replace(/^www\./, '');
const schoolUrl = (sub, where = 'admin/') => `${location.protocol}//${sub}.${location.host.replace(/^www\./, '')}${ROOT}/${where}`;

App.loadSchool = async function () {
    if (App.schoolLoaded || !API.token() || !App.user || App.user.role === 'super_admin') return;
    try {
        const me = await API.get('/me');
        App.tenant = me.school;
        const s = (await API.get('/settings')).data;
        Object.assign(App.school, { name: s.school_name, address: s.school_address, phone: s.school_phone, logo_url: s.school_logo_url, currency: s.currency || 'PKR' });
    } catch (e) { /* suspended / expired: pages will show the message */ }
    const off = new Set((App.tenant?.disabled_modules || []).flatMap((m) => MODULE_INFO[m]?.[1] || []));
    if (off.size) {
        for (let i = NAV.length - 1; i >= 0; i--) if (off.has(NAV[i][0])) NAV.splice(i, 1);
        Router.routes = Router.routes.filter((r) => !off.has(r.pattern));
    }
    App.schoolLoaded = true;
};

{
    const baseResolve = Router.resolve;
    Router.resolve = async function () {
        const { path } = this.current();
        if (path !== '/login' && API.token()) {
            if (!App.user) { try { const me = await API.get('/me'); App.user = me.user; App.tenant = me.school; } catch (e) { return; } }
            if (App.user.role === 'super_admin') Platform.activate();
            else await App.loadSchool();
        }
        return baseResolve.call(this);
    };
    const baseLogout = Pages.logout;
    Pages.logout = async () => { await baseLogout(); location.reload(); };
}

/* ===========================================================
   Platform (super admin)
   =========================================================== */
const Platform = {
    active: false,
    activate() {
        if (this.active) return;
        this.active = true;
        NAV.length = 0;
        NAV.push(['/', 'Overview', 'grid'], ['section', 'Schools'], ['/schools', 'All schools', 'cap'], ['/schools/new', 'Add school', 'plus']);
        Router.routes = [];
        Router.add('/', 'Platform overview', Platform.overview);
        Router.add('/schools', 'Schools', Platform.schools);
        Router.add('/schools/new', 'Add school', (v) => Platform.form(v));
        Router.add('/schools/:id', 'Edit school', (v, p) => Platform.form(v, +p.id));
        App.school = { name: 'Super Admin', currency: 'PKR' };
    },

    statusBadge(s) {
        if (s.status === 'suspended') return badge('rejected', 'Suspended');
        if (s.is_expired) return badge('overdue', 'Expired');
        if (s.expires_at && fmt.parse(s.expires_at) - Date.now() < 30 * 86400000) return badge('pending', 'Expiring soon');
        return badge('active', 'Active');
    },

    async overview(view) {
        const o = await API.get('/platform/overview');
        view.innerHTML = `
        <div class="welcome"><div><h2>AAS School Manager · Platform</h2><p>Manage every school on your platform from here.</p></div>
            <div class="actions"><a class="btn amber" href="#/schools/new">${icon('plus')} Add school</a><a class="btn" href="#/schools">All schools</a></div></div>
        <div class="stats mb">
            <a class="card stat" href="#/schools"><div class="ico tone-brand">${icon('cap')}</div><div><div class="label">Schools</div><div class="value">${o.schools}</div><div class="hint">${o.active} active</div></div></a>
            <a class="card stat" href="#/schools?status=suspended"><div class="ico tone-bad">${icon('alert')}</div><div><div class="label">Suspended / expired</div><div class="value">${o.suspended + o.expired}</div><div class="hint">${o.suspended} suspended · ${o.expired} expired</div></div></a>
            <div class="card stat"><div class="ico tone-ok">${icon('users')}</div><div><div class="label">Active students</div><div class="value">${Number(o.students).toLocaleString()}</div><div class="hint">across all schools</div></div></div>
            <div class="card stat"><div class="ico tone-info">${icon('user')}</div><div><div class="label">Teachers & staff</div><div class="value">${o.teachers}</div><div class="hint">${o.users} user logins</div></div></div>
        </div>
        <div class="grid-2">
            <div class="card"><div class="card-head"><h2>Expiring in 30 days</h2></div>${o.expiring_soon.length ? `<ul class="list">${o.expiring_soon.map((s) => `<li class="item-row"><div class="grow"><a class="title" href="#/schools/${s.id}">${esc(s.name)}</a><br><small>${esc(s.subdomain)}.${appDomain()}</small></div>${badge('pending', fmt.date(s.expires_at))}</li>`).join('')}</ul>` : emptyHtml('No subscriptions expiring soon', '', 'check')}</div>
            <div class="card"><div class="card-head"><h2>Recently added</h2></div>${o.recent.length ? `<ul class="list">${o.recent.map((s) => `<li class="item-row"><div class="avatar">${esc(initials(s.name))}</div><div class="grow"><a class="title" href="#/schools/${s.id}">${esc(s.name)}</a><br><small>${esc(s.subdomain)} · ${fmt.cap(s.plan)}</small></div><small>${fmt.date(s.created_at)}</small></li>`).join('')}</ul>` : emptyHtml('No schools yet')}</div>
        </div>
        <div class="card mt"><div class="card-head"><h2>Schools by plan</h2></div><div class="card-body chips">${Object.entries(o.by_plan || {}).map(([p, n]) => `<span class="chip">${fmt.cap(p)}: <b>${n}</b></span>`).join('') || '<small>No schools yet</small>'}</div></div>`;
    },

    async schools(view, _p, q) {
        view.innerHTML = `<div class="card mb"><div class="card-body"><form class="toolbar" id="flt">
            <label class="field wide"><span>Search</span><input name="search" value="${esc(q.search || '')}" placeholder="School, sub-domain or city"></label>
            <label class="field"><span>Status</span><select name="status">${options([{ id: 'active', name: 'Active' }, { id: 'suspended', name: 'Suspended' }, { id: 'expired', name: 'Expired' }], { selected: q.status, placeholder: 'All' })}</select></label>
            <button class="btn secondary" type="submit">${icon('search')} Filter</button><a class="btn" href="#/schools/new">${icon('plus')} Add school</a></form></div></div>
            <div class="card" id="list">${loadingHtml()}</div>`;
        const flt = $('#flt', view);
        flt.onsubmit = (e) => { e.preventDefault(); go('/schools', formValues(flt)); };
        $('[name=status]', flt).onchange = () => flt.requestSubmit();
        const { data } = await API.get('/platform/schools', { search: q.search, status: q.status });
        const list = $('#list', view);
        if (!data.length) { list.innerHTML = emptyHtml('No schools found', 'Click "Add school" to register the first one.', 'cap'); return; }
        list.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>School</th><th>Address</th><th>Plan</th><th>Students</th><th>Expires</th><th>Status</th><th></th></tr></thead><tbody>
        ${data.map((s, i) => `<tr><td><b>${esc(s.name)}</b>${s.group ? ` ${badge('info', s.group.name + (s.campus_name ? ' · ' + s.campus_name : ''))}` : ''}<br><small>${esc(s.city || '')}${s.admin ? ' · ' + esc(s.admin.email) : ''}</small></td>
            <td><a href="${esc(schoolUrl(s.subdomain))}" target="_blank">${esc(s.subdomain)}.${appDomain()}</a></td>
            <td>${fmt.cap(s.plan)}</td><td>${s.students_count}${s.student_limit ? ` / ${s.student_limit}` : ''}<br><small>${s.teachers_count} staff</small></td>
            <td class="nowrap">${s.expires_at ? fmt.date(s.expires_at) : '<small>No expiry</small>'}</td><td>${Platform.statusBadge(s)}</td>
            <td class="right nowrap"><a class="btn ghost sm" href="#/schools/${s.id}" title="Edit">${icon('edit')}</a>
                <button class="btn ghost sm" data-pw="${i}" title="Reset admin password">${icon('user')}</button>
                <button class="btn ${s.status === 'active' ? 'secondary' : ''} sm" data-st="${i}">${s.status === 'active' ? 'Suspend' : 'Activate'}</button></td></tr>`).join('')}
        </tbody></table></div>`;
        const payload = (s, extra) => ({ name: s.name, subdomain: s.subdomain, email: s.email, phone: s.phone, city: s.city, address: s.address, contact_person: s.contact_person, plan: s.plan, student_limit: s.student_limit, expires_at: s.expires_at, status: s.status, disabled_modules: s.disabled_modules || [], notes: s.notes, ...extra });
        $$('[data-st]', list).forEach((b) => (b.onclick = async () => {
            const s = data[+b.dataset.st];
            const to = s.status === 'active' ? 'suspended' : 'active';
            if (!(await confirmBox(to === 'suspended' ? `Suspend ${s.name}? Its users will not be able to log in until you activate it again. No data is deleted.` : `Activate ${s.name} again?`, { okText: to === 'suspended' ? 'Suspend' : 'Activate', danger: to === 'suspended' }))) return;
            try { toast((await API.put('/platform/schools/' + s.id, payload(s, { status: to }))).message); Router.resolve(); } catch (e) { toast(e.message, 'error'); }
        }));
        $$('[data-pw]', list).forEach((b) => (b.onclick = () => {
            const s = data[+b.dataset.pw];
            formModal({ title: `Reset admin password · ${s.name}`, submitText: 'Reset password', fields: `<p>For <b>${esc(s.admin?.email || 'the school admin')}</b>. They will be logged out everywhere, and two-factor login is turned off for this account (they can turn it on again).</p>${field('New password (min 6)', inp('password', '', 'text', 'required'))}`,
                onSubmit: async (v, _f, close) => { toast((await API.post(`/platform/schools/${s.id}/admin-password`, v)).message); close(); } });
        }));
    },

    async form(view, id = null) {
        const s = id ? (await API.get('/platform/schools/' + id)).data : { plan: 'standard', status: 'active', disabled_modules: [] };
        const off = new Set(s.disabled_modules || []);
        const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
        view.innerHTML = `<form class="form" id="sf" novalidate><div class="grid-2" style="align-items:start">
            <div class="card"><div class="card-head"><h2>School</h2>${id ? `<a class="btn secondary sm" target="_blank" href="${esc(schoolUrl(s.subdomain))}">Open school ↗</a>` : ''}</div><div class="card-body form">
                ${field('School name *', inp('name', s.name, 'text', 'required'))}
                ${field('Sub-domain (school address) *', `<div class="flex"><input name="subdomain" value="${esc(s.subdomain || '')}" required placeholder="e.g. bfs" style="max-width:200px"><span class="muted">.${esc(appDomain())}</span></div>`)}
                <small id="urlPrev"></small>
                <div class="form-row">${field('Contact person', inp('contact_person', s.contact_person))}${field('Phone', inp('phone', s.phone))}</div>
                <div class="form-row">${field('Email', inp('email', s.email, 'email'))}${field('City', inp('city', s.city))}</div>
                ${field('Address', `<textarea name="address" rows="2">${esc(s.address || '')}</textarea>`)}
                ${id ? '' : `<h3 class="mt">School admin login</h3>
                <div class="form-row">${field('Admin name *', inp('admin_name', '', 'text', 'required placeholder="Principal / office"'))}${field('Admin email *', inp('admin_email', '', 'email', 'required'))}</div>
                ${field('Admin password * (min 6)', inp('admin_password', '', 'text', 'required'))}`}
            </div></div>
            <div class="grid" style="align-content:start">
                <div class="card"><div class="card-head"><h2>Plan & subscription</h2></div><div class="card-body form">
                    <div class="form-row">${field('Plan', sel('plan', options(PLANS, { selected: s.plan })))}${field('Student limit', inp('student_limit', s.student_limit ?? '', 'number', 'min="1" placeholder="No limit"'))}</div>
                    <div class="form-row">${field('Valid till', inp('expires_at', s.expires_at || (id ? '' : nextYear), 'date'))}${field('Status', sel('status', options([{ id: 'active', name: 'Active' }, { id: 'suspended', name: 'Suspended' }], { selected: s.status })))}</div>
                    ${field('Campus name (if part of a school group)', inp('campus_name', s.campus_name, 'text', 'placeholder="e.g. Gulberg Campus"'))}
                    ${field('Notes (only you see these)', `<textarea name="notes" rows="2">${esc(s.notes || '')}</textarea>`)}
                </div></div>
                <div class="card"><div class="card-head"><h2>Modules</h2><span class="flex"><button type="button" class="btn ghost sm" id="allOn">All on</button></span></div><div class="card-body">
                    <p class="muted">Core features (students, staff, classes, attendance, fees, notices, messages, reports) are always on.</p>
                    <div class="grid-2" style="gap:.4rem">${Object.entries(MODULE_INFO).map(([k, [label]]) => `<label class="check"><input type="checkbox" data-mod="${k}" ${off.has(k) ? '' : 'checked'}> ${esc(label)}</label>`).join('')}</div>
                </div></div>
                <div class="flex" style="justify-content:flex-end"><a class="btn secondary" href="#/schools">Cancel</a><button class="btn" type="submit" data-busy="Saving…">${icon('check')} ${id ? 'Save changes' : 'Create school'}</button></div>
            </div></div></form>`;
        const f = $('#sf', view);
        const prev = () => { const v = f.subdomain.value.trim().toLowerCase(); $('#urlPrev', view).innerHTML = v ? `Admin: <b>${esc(schoolUrl(v))}</b><br>Parents & teachers: <b>${esc(schoolUrl(v, 'portal/'))}</b>` : ''; };
        f.subdomain.oninput = () => { f.subdomain.value = f.subdomain.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); prev(); };
        if (!id) f.name.oninput = () => { if (!f.subdomain.dataset.touched) { f.subdomain.value = f.name.value.trim().split(/\s+/).map((w) => w[0] || '').join('').toLowerCase().replace(/[^a-z0-9]/g, ''); prev(); } };
        f.subdomain.addEventListener('keydown', () => (f.subdomain.dataset.touched = 1));
        prev();
        $('#allOn', view).onclick = () => $$('[data-mod]', f).forEach((c) => (c.checked = true));
        f.onsubmit = (e) => {
            e.preventDefault();
            busy($('button[type=submit]', f), async () => {
                try {
                    const v = clean(formValues(f));
                    Object.keys(v).filter((k) => k.startsWith('mod')).forEach((k) => delete v[k]);
                    v.disabled_modules = $$('[data-mod]', f).filter((c) => !c.checked).map((c) => c.dataset.mod);
                    const r = id ? await API.put('/platform/schools/' + id, v) : await API.post('/platform/schools', v);
                    toast(r.message);
                    if (!id) {
                        modal({ title: 'School created 🎉', body: `<p><b>${esc(v.name)}</b> is ready with default classes, subjects, grades and fee types.</p>
                            <div class="alert info">${icon('alert')}<div>Admin panel: <b>${esc(schoolUrl(v.subdomain))}</b><br>Parent / teacher portal: <b>${esc(schoolUrl(v.subdomain, 'portal/'))}</b><br>Login: <b>${esc(v.admin_email)}</b> / the password you set</div></div>
                            <p class="mt-s"><small>On a live server, point *.${esc(appDomain())} (wildcard DNS) to this server.</small></p>`, foot: `<a class="btn" href="#/schools" data-close>Done</a>` });
                    }
                    go('/schools');
                } catch (err) { showErrors(f, err); }
            });
        };
    },
};

/* ===========================================================
   Multi-campus: group owner view + super admin "School groups"
   =========================================================== */
const Owner = {
    active: false,
    campus() { try { return localStorage.getItem('aas_campus'); } catch (e) { return null; } },
    open(id) { try { localStorage.setItem('aas_campus', id); } catch (e) { /* ignore */ } location.hash = '#/'; location.reload(); },
    leave() { try { localStorage.removeItem('aas_campus'); } catch (e) { /* ignore */ } location.hash = '#/'; location.reload(); },

    /** Group-wide mode (no campus chosen). */
    activate() {
        if (this.active) return;
        this.active = true;
        NAV.length = 0;
        NAV.push(['/', 'Group overview', 'grid']);
        Router.routes = [];
        Router.add('/', 'Group overview', Owner.overview);
        App.school = { name: App.group?.name || 'All campuses', currency: App.school.currency || 'PKR' };
    },

    /** Inside one campus: add a way back to the group view. */
    campusMode() {
        if (this.campusModeOn) return;
        this.campusModeOn = true;
        NAV.unshift(['/all-campuses', 'All campuses', 'layers'], ['section', 'This campus']);
        Router.add('/all-campuses', 'All campuses', () => Owner.leave());
    },

    async overview(view) {
        const o = await API.get('/owner/overview');
        const t = o.totals;
        const money = (v) => fmt.money(v);
        const maxCol = Math.max(1, ...o.campuses.map((c) => Number(c.finance.collected_this_month || 0)));
        view.innerHTML = `
        <div class="welcome"><div><h2>${esc(o.group?.name || 'Your school group')}</h2><p>${o.campuses.length} campus${o.campuses.length === 1 ? '' : 'es'} · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            <div class="actions">${o.campuses.slice(0, 3).map((c) => `<button class="btn" data-open="${c.campus.id}">${icon('cap')} ${esc(c.campus.campus_name || c.campus.name)}</button>`).join('')}</div></div>
        <div class="stats mb">
            <div class="card stat"><div class="ico tone-brand">${icon('users')}</div><div><div class="label">Students (all campuses)</div><div class="value">${t.students.toLocaleString()}</div><div class="hint">${t.teachers} teachers & staff</div></div></div>
            <div class="card stat"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Attendance today</div><div class="value">${fmt.pct(t.attendance_percentage)}</div><div class="hint">${t.present_today} present of ${t.marked_today} marked</div></div></div>
            <div class="card stat"><div class="ico tone-info">${icon('wallet')}</div><div><div class="label">Collected this month</div><div class="value">${money(t.collected_this_month)}</div><div class="hint">${money(t.collected_today)} today · billed ${money(t.billed_this_month)}</div></div></div>
            <div class="card stat"><div class="ico tone-bad">${icon('alert')}</div><div><div class="label">Outstanding dues</div><div class="value">${money(t.outstanding_dues)}</div><div class="hint">${t.defaulter_students} students with dues</div></div></div>
        </div>
        <div class="grid-3 mb" id="campusCards">${o.campuses.map((c) => {
            const s = c.campus, f = c.finance, a = c.attendance_today;
            const state = s.status !== 'active' ? badge('rejected', 'Suspended') : s.is_expired ? badge('overdue', 'Expired') : badge('active', 'Active');
            return `<div class="card"><div class="card-head"><div><h2>${esc(s.campus_name || s.name)}</h2><small>${esc(s.campus_name ? s.name : s.subdomain)}</small></div>${state}</div>
                <div class="card-body"><div class="rc-summary">
                    <div><span>Students</span><b>${c.counts.students}</b></div>
                    <div><span>Attendance</span><b>${fmt.pct(a.percentage)}</b></div>
                    <div><span>Collected (month)</span><b>${money(f.collected_this_month)}</b></div>
                    <div><span>Dues</span><b>${money(f.outstanding_dues)}</b></div>
                </div>
                <p class="mt-s" style="margin-bottom:.8rem"><small>${c.counts.teachers} staff · ${c.pending.admission_applications} admissions & ${c.pending.leave_requests} leaves pending</small></p>
                <button class="btn block" data-open="${s.id}">Open campus ${icon('arrowLeft', '').replace('<svg', '<svg style="transform:rotate(180deg)"')}</button></div></div>`;
        }).join('') || `<div class="card">${emptyHtml('No campuses yet', 'Ask AAS School Manager to add campuses to your group.', 'cap')}</div>`}</div>
        ${o.campuses.length ? `<div class="grid-2">
            <div class="card"><div class="card-head"><h2>Fee collected this month</h2></div><div class="card-body">
                <div class="bar-chart">${o.campuses.map((c) => `<div class="bar" title="${esc(c.campus.name)}"><b>${Math.round(Number(c.finance.collected_this_month || 0) / 1000)}k</b><i style="height:${Math.round((Number(c.finance.collected_this_month || 0) / maxCol) * 100)}%"></i></div>`).join('')}</div>
                <div class="bar-labels">${o.campuses.map((c) => `<span>${esc(c.campus.campus_name || c.campus.name)}</span>`).join('')}</div></div></div>
            <div class="card"><div class="card-head"><h2>Campus comparison</h2></div><div class="table-wrap"><table class="table compact"><thead><tr><th>Campus</th><th class="num">Students</th><th class="num">Att. %</th><th class="num">Billed</th><th class="num">Collected</th><th class="num">Dues</th><th class="num">Expenses</th></tr></thead><tbody>
                ${o.campuses.map((c) => `<tr><td><a href="javascript:void 0" data-open="${c.campus.id}"><b>${esc(c.campus.campus_name || c.campus.name)}</b></a></td><td class="num">${c.counts.students}</td><td class="num">${fmt.pct(c.attendance_today.percentage)}</td>
                    <td class="num">${money(c.finance.billed_this_month)}</td><td class="num">${money(c.finance.collected_this_month)}</td><td class="num">${money(c.finance.outstanding_dues)}</td><td class="num">${money(Number(c.finance.expenses_this_month || 0) + Number(c.finance.salaries_paid_this_month || 0))}</td></tr>`).join('')}
                </tbody><tfoot><tr><td>Total</td><td class="num">${t.students}</td><td class="num">${fmt.pct(t.attendance_percentage)}</td><td class="num">${money(t.billed_this_month)}</td><td class="num">${money(t.collected_this_month)}</td><td class="num">${money(t.outstanding_dues)}</td><td class="num">${money(t.expenses_this_month + t.salaries_paid_this_month)}</td></tr></tfoot></table></div></div>
        </div>` : ''}`;
        $$('[data-open]', view).forEach((b) => (b.onclick = () => Owner.open(b.dataset.open)));
    },
};

/* ---- routing: owners see the group view or one campus ---- */
{
    const prevResolve = Router.resolve;
    Router.resolve = async function () {
        const { path } = this.current();
        if (path !== '/login' && API.token()) {
            if (!App.user) {
                try { const me = await API.get('/me'); App.user = me.user; App.tenant = me.school; App.realRole = me.real_role || me.user.role; App.group = me.group; } catch (e) {
                    if (Owner.campus()) Owner.leave();
                    return;
                }
            }
            App.realRole = App.realRole || App.user.role;
            if (App.realRole === 'owner') {
                if (!App.group) { try { App.group = (await API.get('/me')).group; } catch (e) { /* ignore */ } }
                if (Owner.campus()) Owner.campusMode(); else Owner.activate();
            }
        }
        return prevResolve.call(this);
    };
    const prevLogout = Pages.logout;
    Pages.logout = async () => { try { localStorage.removeItem('aas_campus'); } catch (e) { /* ignore */ } await prevLogout(); };

    // Campus switcher in the top bar for owners working inside a campus.
    const prevRender = Layout.render;
    Layout.render = function () {
        prevRender.apply(this, arguments);
        if (App.realRole !== 'owner' || !Owner.campus() || $('#campusSwitch')) return;
        $('#pageTitle').insertAdjacentHTML('afterend', `<label class="child-switch" id="campusSwitch" title="Switch campus" style="margin-left:auto;margin-right:.6rem">${icon('layers').replace('<svg', '<svg width="18" height="18" style="flex:none;color:#4f46e5"')}<select aria-label="Campus" style="min-width:190px"><option>Loading…</option></select></label>`);
        API.get('/owner/campuses').then(({ data }) => {
            const sel = $('#campusSwitch select');
            sel.innerHTML = `<option value="">← All campuses</option>` + options(data, { label: (c) => c.campus_name || c.name, selected: Owner.campus() });
            sel.onchange = (e) => (e.target.value ? Owner.open(e.target.value) : Owner.leave());
        }).catch(() => {});
    };
}

/* ===========================================================
   Super admin: school groups (multi-campus)
   =========================================================== */
Object.assign(Platform, {
    async groups(view) {
        const { data } = await API.get('/platform/groups');
        view.innerHTML = `<div class="alert info mb">${icon('alert')}<div>A <b>school group</b> joins several campuses (schools) under one owner. Each campus keeps its own data and admin; the owner logs in on the main address and sees every campus.</div></div>
            <div class="flex between mb"><span></span><a class="btn" href="#/groups/new">${icon('plus')} New group</a></div>
            <div class="grid-2" id="g">${data.map((g, i) => `<div class="card"><div class="card-head"><div><h2>${esc(g.name)}</h2><small>${esc([g.contact_person, g.phone].filter(Boolean).join(' · '))}</small></div><a class="btn ghost sm" href="#/groups/${g.id}">${icon('edit')}</a></div>
                <div class="card-body"><b>Campuses (${g.schools.length})</b>
                ${g.schools.length ? `<ul class="list">${g.schools.map((s) => `<li class="item-row"><div class="grow">${esc(s.campus_name || s.name)}<br><small>${esc(s.subdomain)}.${appDomain()}</small></div>${Platform.statusBadge({ ...s, is_expired: s.expires_at && s.expires_at < fmt.today() })}</li>`).join('')}</ul>` : '<p class="muted">No campuses yet. Edit the group to add schools.</p>'}
                <b class="mt">Owner logins</b>
                ${g.owners.length ? `<ul class="list">${g.owners.map((u) => `<li class="item-row"><div class="avatar">${esc(initials(u.name))}</div><div class="grow">${esc(u.name)}<br><small>${esc(u.email)}${u.last_login_at ? ' · last login ' + fmt.relative(u.last_login_at) : ''}</small></div><button class="btn ghost sm" data-rm="${g.id}:${u.id}" title="Remove owner">${icon('trash')}</button></li>`).join('')}</ul>` : '<p class="muted">No owner login yet.</p>'}
                <button class="btn secondary sm mt" data-owner="${i}">${icon('plus')} Add owner login</button></div></div>`).join('') || `<div class="card">${emptyHtml('No school groups yet', 'Create one when a school has more than one campus.', 'layers')}</div>`}</div>`;
        $$('[data-owner]', view).forEach((b) => (b.onclick = () => {
            const g = data[+b.dataset.owner];
            formModal({ title: `Owner login · ${g.name}`, submitText: 'Create login',
                fields: `<p>The owner signs in at <b>${esc(location.host + ROOT)}/admin/</b> and sees all campuses of this group.</p><div class="form-row">${field('Name *', inp('name', g.contact_person || '', 'text', 'required'))}${field('Email *', inp('email', g.email || '', 'email', 'required'))}</div>${field('Password * (min 6)', inp('password', '', 'text', 'required'))}`,
                onSubmit: async (v, _f, close) => { toast((await API.post(`/platform/groups/${g.id}/owners`, v)).message); close(); Router.resolve(); } });
        }));
        $$('[data-rm]', view).forEach((b) => (b.onclick = async () => {
            const [gid, uid] = b.dataset.rm.split(':');
            if (!(await confirmBox('Remove this owner login? The campuses and their data are not affected.', { okText: 'Remove', danger: true }))) return;
            try { toast((await API.del(`/platform/groups/${gid}/owners/${uid}`)).message); Router.resolve(); } catch (e) { toast(e.message, 'error'); }
        }));
    },

    async groupForm(view, id = null) {
        const [{ data: groups }, { data: schools }] = await Promise.all([API.get('/platform/groups'), API.get('/platform/schools')]);
        const g = id ? groups.find((x) => x.id === id) : {};
        if (id && !g) { view.innerHTML = errorHtml({ message: 'Group not found.' }); return; }
        const inGroup = new Set((g.schools || []).map((s) => s.id));
        view.innerHTML = `<form class="form" id="gf" novalidate><div class="grid-2" style="align-items:start">
            <div class="card"><div class="card-head"><h2>Group</h2></div><div class="card-body form">
                ${field('Group name *', inp('name', g.name, 'text', 'required placeholder="e.g. Bright Future Group of Schools"'))}
                <div class="form-row">${field('Contact person', inp('contact_person', g.contact_person))}${field('Phone', inp('phone', g.phone))}</div>
                ${field('Email', inp('email', g.email, 'email'))}
                ${field('Notes', `<textarea name="notes" rows="2">${esc(g.notes || '')}</textarea>`)}
                ${id ? '' : `<h3 class="mt">Owner login (optional)</h3>
                <div class="form-row">${field('Owner name', inp('owner_name'))}${field('Owner email', inp('owner_email', '', 'email'))}</div>${field('Owner password (min 6)', inp('owner_password'))}`}
            </div></div>
            <div class="card"><div class="card-head"><h2>Campuses</h2><small>Tick the schools that belong to this group</small></div><div class="card-body">
                ${schools.length ? schools.map((s) => {
                    const other = s.group_id && s.group_id !== id;
                    return `<label class="check" style="display:flex;margin-bottom:.45rem"><input type="checkbox" data-school="${s.id}" ${inGroup.has(s.id) ? 'checked' : ''}> ${esc(s.campus_name || s.name)} <small>&nbsp;${esc(s.subdomain)}${other ? ' · now in ' + esc(s.group?.name || 'another group') : ''}</small></label>`;
                }).join('') : '<p class="muted">Add schools first.</p>'}
                <p class="muted mt-s"><small>Tip: set a short "campus name" (e.g. "Gulberg Campus") on each school's edit page.</small></p>
            </div></div></div>
            <div class="flex mt" style="justify-content:flex-end"><a class="btn secondary" href="#/groups">Cancel</a><button class="btn" type="submit" data-busy="Saving…">${icon('check')} ${id ? 'Save group' : 'Create group'}</button></div></form>`;
        const f = $('#gf', view);
        f.onsubmit = (e) => {
            e.preventDefault();
            busy($('button[type=submit]', f), async () => {
                try {
                    const v = clean(formValues(f));
                    Object.keys(v).filter((k) => !['name', 'contact_person', 'phone', 'email', 'notes', 'owner_name', 'owner_email', 'owner_password'].includes(k)).forEach((k) => delete v[k]);
                    v.school_ids = $$('[data-school]', f).filter((c) => c.checked).map((c) => +c.dataset.school);
                    const r = id ? await API.put('/platform/groups/' + id, v) : await API.post('/platform/groups', v);
                    toast(r.message); go('/groups');
                } catch (err) { showErrors(f, err); }
            });
        };
    },
});
{
    const baseActivate = Platform.activate.bind(Platform);
    Platform.activate = function () {
        const was = this.active;
        baseActivate();
        if (was) return;
        NAV.push(['/groups', 'School groups', 'layers']);
        Router.add('/groups', 'School groups', Platform.groups);
        Router.add('/groups/new', 'New school group', (v) => Platform.groupForm(v));
        Router.add('/groups/:id', 'Edit school group', (v, p) => Platform.groupForm(v, +p.id));
    };
}

/* ===========================================================
   School website (public landing page on the school's sub-domain)
   =========================================================== */
Object.assign(ICONS, {
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
});
MODULE_INFO.website = ['School website', ['/website']];
{
    const i = NAV.findIndex((n) => n[0] === '/settings');
    NAV.splice(i >= 0 ? i + 1 : NAV.length, 0, ['/website', 'School Website', 'globe']);
}

const Website = {
    SECTIONS: [['about', 'About us'], ['principal', 'Principal\'s message'], ['stats', 'Numbers strip'], ['programs', 'Programs'], ['facilities', 'Facilities'], ['gallery', 'Gallery'],
        ['notices', 'Latest notices (from Notices)'], ['events', 'Upcoming events (from School Calendar)'], ['testimonials', 'Parent testimonials'], ['admission', 'Admission banner & button'], ['contact', 'Contact & map']],
    LISTS: {
        stats: { max: 4, blank: { value: '', label: '' }, fields: [['value', 'Number', 'e.g. 25+ or auto:students'], ['label', 'Label', 'e.g. Years of excellence']] },
        programs: { max: 12, blank: { title: '', text: '' }, fields: [['title', 'Title', 'e.g. Primary (Class 1–5)'], ['text', 'Short description', '', 'textarea']] },
        facilities: { max: 12, blank: { icon: '⭐', title: '', text: '' }, fields: [['icon', 'Icon (emoji)', '🔬', 'small'], ['title', 'Title', 'e.g. Computer lab'], ['text', 'Short description', '', 'textarea']] },
        testimonials: { max: 9, blank: { name: '', role: '', text: '' }, fields: [['name', 'Name', 'e.g. Mrs. Ayesha'], ['role', 'Who', 'e.g. Mother of Hamza, Class 3'], ['text', 'What they say', '', 'textarea']] },
    },
    PRESETS: [['#1d4ed8', '#f59e0b'], ['#4f46e5', '#f59e0b'], ['#047857', '#facc15'], ['#b91c1c', '#f59e0b'], ['#0e7490', '#f97316'], ['#7c3aed', '#ec4899'], ['#0f172a', '#eab308'], ['#9d174d', '#fbbf24']],

    get(o, path) { return path.split('.').reduce((x, k) => (x == null ? x : x[k]), o); },
    set(o, path, v) { const ks = path.split('.'); const last = ks.pop(); const t = ks.reduce((x, k) => (x[k] ??= {}), o); t[last] = v; },

    async page(view) {
        const r = await API.get('/website');
        const w = r.data;
        const W = Website;
        const ti = (path, label, extra = '') => field(label, `<input data-p="${path}" value="${esc(W.get(w, path) ?? '')}" ${extra}>`);
        const ta = (path, label, rows = 4, extra = '') => field(label, `<textarea data-p="${path}" rows="${rows}" ${extra}>${esc(W.get(w, path) ?? '')}</textarea>`);
        const img = (path, label, hint) => `<div class="field"><span>${esc(label)}</span><div class="ws-img" data-img="${path}">${W.imgBox(w, path)}</div>${hint ? `<small class="muted">${esc(hint)}</small>` : ''}</div>`;
        const card = (title, sub, body, id = '') => `<div class="card mb" ${id ? `id="${id}"` : ''}><div class="card-head"><div><h2>${title}</h2>${sub ? `<small>${sub}</small>` : ''}</div></div><div class="card-body form">${body}</div></div>`;

        view.innerHTML = `<div id="wsRoot"><style>
            .ws-img{display:flex;gap:.8rem;align-items:center;flex-wrap:wrap}.ws-img .th{width:150px;height:96px;border-radius:12px;background:#eef0f7 center/cover;border:1px solid var(--line,#e5e7eb);display:grid;place-items:center;color:#9aa1b5}
            .ws-img .th svg{width:28px;height:28px}.ws-row{border:1px solid var(--line,#e5e7eb);border-radius:14px;padding:.9rem 1rem;margin-bottom:.7rem;position:relative;background:#fafbff}
            .ws-row .rm{position:absolute;right:.5rem;top:.5rem}.ws-row .form-row{margin:0}.ws-gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.8rem}
            .ws-gal .g{border:1px solid var(--line,#e5e7eb);border-radius:12px;overflow:hidden;background:#fff}.ws-gal .g div{height:110px;background:#eef0f7 center/cover;position:relative}
            .ws-gal .g button{position:absolute;right:6px;top:6px}.ws-gal input{border:0;border-top:1px solid var(--line,#e5e7eb);border-radius:0;width:100%;font-size:.85rem;padding:.5rem .6rem}
            .ws-sw{display:flex;gap:.5rem;flex-wrap:wrap}.ws-sw button{width:42px;height:42px;border-radius:12px;border:2px solid #fff;box-shadow:0 0 0 1px #d6d9e6;cursor:pointer}
            .ws-save{position:sticky;bottom:0;z-index:5;background:rgba(255,255,255,.95);backdrop-filter:blur(6px);border-top:1px solid var(--line,#e5e7eb);padding:.9rem 0;display:flex;justify-content:flex-end;gap:.6rem;margin-top:.5rem}
            .ws-url{font-weight:700;word-break:break-all}</style>
        <div class="card mb"><div class="card-body" style="display:flex;gap:1rem;align-items:center;justify-content:space-between;flex-wrap:wrap">
            <div><div class="muted"><small>Your school's public website</small></div><a class="ws-url" href="${esc(r.site_url)}" target="_blank" rel="noopener">${esc(r.site_url)}</a></div>
            <div class="flex" style="gap:.6rem;align-items:center"><label class="check"><input type="checkbox" data-p="published" data-bool ${w.published ? 'checked' : ''}> Website is live</label>
            <a class="btn secondary" href="${esc(r.site_url)}" target="_blank" rel="noopener">${icon('external')} View website</a></div></div></div>
        <div class="grid-2" style="align-items:start"><div>
            ${card('Colours', 'Pick your school colours', `<div class="ws-sw">${W.PRESETS.map(([p, a]) => `<button type="button" data-preset="${p},${a}" title="${p}" style="background:linear-gradient(135deg,${p} 60%,${a} 60%)"></button>`).join('')}</div>
                <div class="form-row">${field('Main colour', `<input type="color" data-p="theme.primary" value="${esc(w.theme.primary)}">`)}${field('Highlight colour', `<input type="color" data-p="theme.accent" value="${esc(w.theme.accent)}">`)}</div>`)}
            ${card('Top banner', 'The first thing visitors see', `${ti('hero.title', 'Heading')}${ta('hero.subtitle', 'Short introduction', 3)}${ti('hero.button', 'Button text')}${img('hero.image', 'Background photo', 'A wide photo of your building or students (JPG/PNG, up to 4 MB).')}`)}
            ${card('About us', '', `${ti('about.title', 'Heading')}${ta('about.text', 'About your school (leave an empty line between paragraphs)', 7)}${img('about.image', 'Photo')}`)}
            ${card('Principal\'s message', '', `<div class="form-row">${ti('principal.name', 'Name')}${ti('principal.designation', 'Designation')}</div>${ta('principal.message', 'Message', 6)}${img('principal.photo', 'Photo')}`)}
            ${card('Contact', 'Shown at the bottom of the website', `${ta('contact.address', 'Address', 2)}<div class="form-row">${ti('contact.phone', 'Phone')}${ti('contact.whatsapp', 'WhatsApp number', 'placeholder="e.g. 0300 1234567"')}</div>
                ${ti('contact.email', 'Email', 'type="email"')}${ti('contact.timings', 'Office timings')}${ta('contact.map', 'Google Maps embed link (optional — otherwise the address is shown on the map)', 2, 'placeholder="Google Maps → Share → Embed a map → copy the link"')}
                <h3 class="mt">Social media</h3>${ti('social.facebook', 'Facebook page link', 'type="url" placeholder="https://facebook.com/…"')}${ti('social.instagram', 'Instagram link', 'type="url"')}${ti('social.youtube', 'YouTube link', 'type="url"')}`)}
        </div><div>
            ${card('Sections', 'Turn parts of the website on or off', W.SECTIONS.map(([k, l]) => `<label class="check" style="display:flex;margin-bottom:.45rem"><input type="checkbox" data-p="sections.${k}" data-bool ${w.sections?.[k] !== false ? 'checked' : ''}> ${esc(l)}</label>`).join(''))}
            ${card('Numbers strip', 'Up to 4. Type <b>auto:students</b>, <b>auto:teachers</b> or <b>auto:classes</b> to show live counts.', `<div data-list="stats"></div>`)}
            ${card('Programs', 'Classes or levels you offer', `<div data-list="programs"></div>`)}
            ${card('Facilities', '', `<div data-list="facilities"></div>`)}
            ${card('Gallery', 'Photos of events, classrooms and activities (up to 24)', `<div class="ws-gal" id="gal"></div><div class="mt-s"><button type="button" class="btn secondary" id="galAdd">${icon('upload')} Upload photos</button><input type="file" id="galFile" accept="image/*" multiple hidden></div>`)}
            ${card('Parent testimonials', 'Short reviews from parents', `<div data-list="testimonials"></div>`)}
        </div></div>
        <div class="ws-save"><a class="btn secondary" href="${esc(r.site_url)}" target="_blank" rel="noopener">${icon('external')} Preview</a><button class="btn" id="wsSave" data-busy="Saving…">${icon('check')} Save website</button></div></div>`;
        const root = $('#wsRoot', view);

        // simple fields
        root.addEventListener('input', (e) => {
            const p = e.target.dataset.p; if (!p) return;
            W.set(w, p, e.target.hasAttribute('data-bool') ? e.target.checked : e.target.value);
        });
        root.addEventListener('change', (e) => { const p = e.target.dataset.p; if (p && e.target.hasAttribute('data-bool')) W.set(w, p, e.target.checked); });
        $$('[data-preset]', view).forEach((b) => (b.onclick = () => {
            const [p, a] = b.dataset.preset.split(','); w.theme.primary = p; w.theme.accent = a;
            $('[data-p="theme.primary"]', view).value = p; $('[data-p="theme.accent"]', view).value = a;
        }));

        // single images
        const bindImg = (box) => {
            const path = box.dataset.img;
            box.innerHTML = W.imgBox(w, path);
            $('[data-up]', box).onclick = () => $('input[type=file]', box).click();
            const rm = $('[data-rm]', box); if (rm) rm.onclick = () => { W.set(w, path, ''); W.set(w, W.urlKey(path), null); bindImg(box); };
            $('input[type=file]', box).onchange = async (e) => {
                const f = e.target.files[0]; if (!f) return;
                try { const u = await W.upload(f); W.set(w, path, u.path); W.set(w, W.urlKey(path), u.url); bindImg(box); } catch (err) { toast(err.message, 'error'); }
            };
        };
        $$('[data-img]', view).forEach(bindImg);

        // repeatable lists
        const drawList = (box) => {
            const key = box.dataset.list, cfg = W.LISTS[key], rows = (w[key] ||= []);
            box.innerHTML = rows.map((row, i) => `<div class="ws-row"><button type="button" class="btn ghost sm rm" data-del="${i}" title="Remove">${icon('trash')}</button>
                <div class="form-row">${cfg.fields.filter((f) => f[3] !== 'textarea').map(([f, l, ph, t]) => field(l, `<input data-p="${key}.${i}.${f}" value="${esc(row[f] ?? '')}" placeholder="${esc(ph || '')}" ${t === 'small' ? 'style="max-width:110px"' : ''}>`, t === 'small' ? 'shrink' : '')).join('')}</div>
                ${cfg.fields.filter((f) => f[3] === 'textarea').map(([f, l]) => field(l, `<textarea data-p="${key}.${i}.${f}" rows="2">${esc(row[f] ?? '')}</textarea>`)).join('')}</div>`).join('')
                + (rows.length < cfg.max ? `<button type="button" class="btn secondary sm" data-add>${icon('plus')} Add</button>` : '');
            $$('[data-del]', box).forEach((b) => (b.onclick = () => { rows.splice(+b.dataset.del, 1); drawList(box); }));
            const add = $('[data-add]', box); if (add) add.onclick = () => { rows.push({ ...cfg.blank }); drawList(box); $$('input', box).slice(-cfg.fields.length)[0]?.focus(); };
        };
        $$('[data-list]', view).forEach(drawList);

        // gallery
        const gal = $('#gal', view);
        const drawGal = () => {
            gal.innerHTML = (w.gallery || []).map((g, i) => `<div class="g"><div style="background-image:url('${esc(g.url)}')"><button type="button" class="btn ghost sm" data-gdel="${i}" title="Remove" style="background:#fff">${icon('trash')}</button></div><input data-p="gallery.${i}.caption" value="${esc(g.caption || '')}" placeholder="Caption (optional)"></div>`).join('') || '<p class="muted">No photos yet.</p>';
            $$('[data-gdel]', gal).forEach((b) => (b.onclick = () => { w.gallery.splice(+b.dataset.gdel, 1); drawGal(); }));
        };
        drawGal();
        $('#galAdd', view).onclick = () => $('#galFile', view).click();
        $('#galFile', view).onchange = async (e) => {
            const files = [...e.target.files].slice(0, 24 - (w.gallery || []).length);
            const btn = $('#galAdd', view);
            await busy(btn, async () => {
                for (const f of files) {
                    try { const u = await W.upload(f); (w.gallery ||= []).push({ image: u.path, url: u.url, caption: '' }); drawGal(); } catch (err) { toast(`${f.name}: ${err.message}`, 'error'); }
                }
            });
            e.target.value = '';
        };

        // save
        $('#wsSave', view).onclick = (e) => busy(e.currentTarget, async () => {
            try {
                const payload = JSON.parse(JSON.stringify(w));
                payload.gallery = (payload.gallery || []).map(({ image, caption }) => ({ image, caption }));
                ['hero', 'about'].forEach((k) => delete payload[k].image_url); delete payload.principal.photo_url;
                const res = await API.put('/website', payload);
                Object.assign(w, res.data); drawGal();
                toast(res.message);
            } catch (err) {
                const first = err.errors ? Object.values(err.errors)[0]?.[0] : null;
                toast(first || err.message, 'error');
            }
        });
    },

    urlKey(path) { return path + '_url'; },
    imgBox(w, path) {
        const url = Website.get(w, Website.urlKey(path));
        return `<div class="th" style="${url ? `background-image:url('${esc(url)}')` : ''}">${url ? '' : icon('image')}</div>
            <div class="flex" style="gap:.4rem"><button type="button" class="btn secondary sm" data-up>${icon('upload')} ${url ? 'Change' : 'Upload'}</button>${url ? `<button type="button" class="btn ghost sm" data-rm>${icon('trash')} Remove</button>` : ''}</div>
            <input type="file" accept="image/*" hidden>`;
    },
    async upload(file) {
        if (file.size > 4 * 1024 * 1024) throw new Error('Image is larger than 4 MB.');
        const fd = new FormData(); fd.append('image', file);
        return API.request('POST', '/website/image', { body: fd });
    },
};
Router.add('/website', 'School Website', Website.page);

/* ===========================================================
   My account & security (password + two-factor login)
   =========================================================== */
Pages.security = async function (view) {
    const u = App.user || {};
    view.innerHTML = `<div class="grid-2" style="align-items:start">
        <div class="card"><div class="card-head"><h2>${icon('user')} ${esc(u.name || 'My account')}</h2><small>${esc(u.email || '')}</small></div><div class="card-body">
            <form class="form" id="pwForm">
                <h3>Change password</h3>
                ${field('Current password', '<input name="current_password" type="password" autocomplete="current-password" required>')}
                ${field('New password (min 8)', '<input name="password" type="password" minlength="8" autocomplete="new-password" required>')}
                ${field('Confirm new password', '<input name="password_confirmation" type="password" autocomplete="new-password" required>')}
                <div><button class="btn" type="submit" data-busy="Updating…">Update password</button></div>
            </form>
            <hr><button class="btn secondary" id="logoutAll">${icon('logout')} Log out of all devices</button></div></div>
        <div class="card" id="tfaCard"></div></div>`;
    const pw = $('#pwForm', view);
    pw.onsubmit = (e) => { e.preventDefault(); busy($('button[type=submit]', pw), async () => {
        try { await API.post('/change-password', formValues(pw)); pw.reset(); toast('Password changed. Other devices were signed out.'); } catch (err) { showErrors(pw, err); }
    }); };
    $('#logoutAll', view).onclick = async () => {
        if (!(await confirmBox('Log out from every device, including this one?'))) return;
        try { await API.post('/logout-all'); } catch (e) { /* ignore */ }
        try { localStorage.removeItem('aas_campus'); } catch (e) { /* ignore */ }
        Auth.clear(); location.reload();
    };
    if (typeof TwoFA !== 'undefined') await TwoFA.card($('#tfaCard', view));
};
{
    const addSecurity = () => {
        if (!Router.routes.some((r) => r.pattern === '/security')) Router.add('/security', 'My account & security', Pages.security);
        if (!NAV.some((n) => n[0] === '/security')) NAV.push(['section', 'My account'], ['/security', 'Security & 2FA', 'lock']);
    };
    addSecurity();
    for (const obj of [Platform, Owner]) {
        const base = obj.activate.bind(obj);
        obj.activate = function () { base(); addSecurity(); };
    }
    if (!ICONS.lock) ICONS.lock = '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
}
