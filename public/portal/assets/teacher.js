/* ===========================================================
   Teacher portal
   =========================================================== */
'use strict';

const TeacherPortal = {
    /** Sections, subjects and section+subject combinations this teacher works with. */
    async scope() {
        if (App.tscope) return App.tscope;
        if (TeacherPortal._pending) return TeacherPortal._pending;
        TeacherPortal._pending = API.get('/teacher/classes').then((d) => {
            const sections = new Map();
            const addSection = (sec, cls, classTeacher = false) => {
                const prev = sections.get(sec.id);
                sections.set(sec.id, {
                    id: sec.id, name: sec.name, class_id: cls?.id, class_name: cls?.name || '',
                    label: `${cls?.name || ''} – ${sec.name}`,
                    isClassTeacher: classTeacher || prev?.isClassTeacher || false,
                    students: sec.students_count ?? prev?.students,
                });
            };
            (d.class_teacher_of || []).forEach((s) => addSection(s, s.school_class, true));
            const combos = [];
            (d.subjects || []).forEach((cs) => {
                (cs.school_class?.sections || []).forEach((sec) => {
                    addSection(sec, cs.school_class);
                    combos.push({
                        key: `${sec.id}:${cs.subject.id}`, section_id: sec.id, subject_id: cs.subject.id, class_id: cs.school_class.id,
                        subject: cs.subject.name, label: `${cs.school_class.name} – ${sec.name} · ${cs.subject.name}`,
                    });
                });
            });
            const sorted = [...sections.values()].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
            App.tscope = { teacher: d.teacher, sections: sorted, combos, raw: d };
            return App.tscope;
        }).finally(() => { TeacherPortal._pending = null; });
        return TeacherPortal._pending;
    },

    /** Subjects the teacher can enter marks for in a section (all class subjects if class teacher). */
    async subjectsFor(sectionId) {
        const s = await TeacherPortal.scope();
        const sec = s.sections.find((x) => String(x.id) === String(sectionId));
        if (!sec) return [];
        if (sec.isClassTeacher) {
            try {
                const { data } = await API.get('/class-subjects', { school_class_id: sec.class_id, all: 1 });
                return data.map((cs) => ({ id: cs.subject.id, name: cs.subject.name }));
            } catch (e) { /* fall through */ }
        }
        return s.combos.filter((c) => String(c.section_id) === String(sectionId)).map((c) => ({ id: c.subject_id, name: c.subject }));
    },

    noClasses(view) {
        view.innerHTML = `<div class="card">${emptyHtml('No classes assigned yet', 'Ask the school admin to assign you as a class teacher or subject teacher.', 'users')}</div>`;
    },

    /* ---------------- pages ---------------- */
    async home(view) {
        const [scope, tt, notices] = await Promise.all([
            TeacherPortal.scope(),
            API.get('/teacher/timetable').catch(() => ({ data: {} })),
            API.get('/notices/feed', { per_page: 4 }).catch(() => ({ data: [] })),
        ]);
        const today = tt.data[fmt.todayName()] || [];
        const subjects = new Set(scope.combos.map((c) => c.subject_id));
        const myStudents = scope.sections.filter((s) => s.isClassTeacher).reduce((n, s) => n + (s.students || 0), 0);
        const hour = new Date().getHours();
        const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

        view.innerHTML = `
        <div class="page-head"><div><h2>${greet}, ${esc(App.user.name.split(' ')[0])}</h2><p>${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            <a class="btn" href="#/attendance">${icon('check')} Take attendance</a></div>
        <div class="stats mb">
            <div class="card stat"><div class="ico tone-brand">${icon('users')}</div><div><div class="label">Sections</div><div class="value">${scope.sections.length}</div><div class="hint">${scope.sections.filter((s) => s.isClassTeacher).length} as class teacher</div></div></div>
            <div class="card stat"><div class="ico tone-info">${icon('book')}</div><div><div class="label">Subjects taught</div><div class="value">${subjects.size}</div></div></div>
            <div class="card stat"><div class="ico tone-warn">${icon('clock')}</div><div><div class="label">Periods today</div><div class="value">${today.length}</div></div></div>
            <div class="card stat"><div class="ico tone-ok">${icon('cap')}</div><div><div class="label">My class students</div><div class="value">${myStudents}</div></div></div>
        </div>
        <div class="grid-2">
            <div class="card"><div class="card-head"><h2>Today's schedule</h2><a href="#/timetable" class="btn ghost sm">Week</a></div>
                <div class="card-body">${today.length ? today.map((p) => `<div class="period"><div class="time">${fmt.time(p.start_time)} – ${fmt.time(p.end_time)}</div>
                    <div class="grow"><div class="subj">${esc(p.subject?.name)}</div><small>${esc(p.section?.school_class?.name || '')} – ${esc(p.section?.name || '')}${p.room ? ' · Room ' + esc(p.room) : ''}</small></div></div>`).join('')
                    : '<p class="muted" style="margin:0">No periods scheduled today.</p>'}</div></div>
            <div class="grid" style="align-content:start">
                <div class="card"><div class="card-head"><h2>My classes</h2></div>
                    ${scope.sections.length ? `<ul class="list">${scope.sections.map((s) => `<li><div class="flex between flex-wrap">
                        <div><span class="title">${esc(s.label)}</span> ${s.isClassTeacher ? badge('brand', 'Class teacher') : ''}<br>
                        <small>${scope.combos.filter((c) => c.section_id === s.id).map((c) => esc(c.subject)).join(', ') || '—'}</small></div>
                        <div class="flex"><a class="btn secondary sm" href="#/attendance?section=${s.id}">Attendance</a><a class="btn secondary sm" href="#/marks?section=${s.id}">Marks</a></div></div></li>`).join('')}</ul>`
                        : `<div class="card-body">${emptyHtml('No classes assigned', '', 'users')}</div>`}</div>
                <div class="card"><div class="card-head"><h2>Notices</h2><a href="#/notices" class="btn ghost sm">View all</a></div>
                    ${notices.data.length ? `<ul class="list">${notices.data.map((n) => `<li><div class="title">${esc(n.title)}</div><div class="clamp muted">${esc(n.body)}</div><small>${fmt.date(n.publish_date)}</small></li>`).join('')}</ul>`
                        : `<div class="card-body"><p class="muted" style="margin:0">No notices.</p></div>`}</div>
            </div>
        </div>`;
    },

    /* ---------- attendance ---------- */
    async attendance(view, params, query) {
        const scope = await TeacherPortal.scope();
        if (!scope.sections.length) return TeacherPortal.noClasses(view);
        const tab = query.tab || 'mark';
        const sectionId = query.section || (scope.sections.find((s) => s.isClassTeacher) || scope.sections[0]).id;
        const date = query.date || fmt.today();
        const month = query.month || fmt.thisMonth();
        const go = (changes) => Router.navigate('/attendance?' + new URLSearchParams({ tab, section: sectionId, date, month, ...changes }));

        view.innerHTML = `
        <div class="tabs"><button data-tab="mark" class="${tab === 'mark' ? 'active' : ''}">Mark attendance</button><button data-tab="register" class="${tab === 'register' ? 'active' : ''}">Monthly register</button></div>
        <div class="card mb"><div class="card-body"><div class="toolbar">
            <label class="field wide"><span>Class / section</span><select id="secSel">${options(scope.sections, { label: 'label', selected: sectionId })}</select></label>
            ${tab === 'mark' ? `<label class="field"><span>Date</span><input type="date" id="datePick" value="${date}" max="${fmt.today()}"></label>`
                : `<label class="field"><span>Month</span><input type="month" id="monthPick" value="${month}" max="${fmt.thisMonth()}"></label>
                   <button class="btn secondary" id="csvBtn" data-busy="Exporting…">${icon('download')} Export to Excel</button>`}
        </div></div></div>
        <div id="attBody">${loadingHtml()}</div>`;

        $$('[data-tab]', view).forEach((t) => (t.onclick = () => go({ tab: t.dataset.tab })));
        $('#secSel', view).onchange = (e) => go({ section: e.target.value });
        if ($('#datePick', view)) $('#datePick', view).onchange = (e) => e.target.value && go({ date: e.target.value });
        if ($('#monthPick', view)) $('#monthPick', view).onchange = (e) => e.target.value && go({ month: e.target.value });
        if ($('#csvBtn', view)) $('#csvBtn', view).onclick = (e) => busy(e.currentTarget, () => API.download('/attendance/report', { section_id: sectionId, month, export: 'csv' }, `attendance-${month}.csv`).catch((err) => toast(err.message, 'error')));

        const body = $('#attBody', view);
        try {
            if (tab === 'register') return TeacherPortal.register(body, sectionId, month);
            const sheet = await API.get('/attendance', { section_id: sectionId, date });
            if (!sheet.data.length) { body.innerHTML = `<div class="card">${emptyHtml('No students in this section')}</div>`; return; }
            const state = sheet.data.map((r) => ({ ...r, status: r.status || 'present' }));
            const STAT = [['present', 'P'], ['absent', 'A'], ['late', 'L'], ['leave', 'LV']];

            const counts = () => STAT.map(([k]) => [k, state.filter((r) => r.status === k).length]);
            body.innerHTML = `
            ${sheet.is_marked ? `<div class="alert info mb">${icon('alert')}<div>Attendance for ${fmt.date(date)} is already saved. Saving again will update it.</div></div>` : ''}
            <div class="card"><div class="card-head"><h2>${esc(sheet.section?.school_class?.name || '')} – ${esc(sheet.section?.name || '')} · ${fmt.date(date)}</h2>
                <div class="flex"><button class="btn secondary sm" id="allPresent">Mark all present</button></div></div>
            <div class="table-wrap"><table class="table"><thead><tr><th style="width:60px">Roll</th><th>Student</th><th>Status</th><th class="hide-sm">Remarks</th></tr></thead><tbody>
            ${state.map((r, i) => `<tr><td>${esc(r.roll_no || '—')}</td><td><b>${esc(r.name)}</b><br><small class="hide-sm">${esc(r.admission_no)}</small></td>
                <td><div class="seg" data-row="${i}">${STAT.map(([k, l]) => `<button type="button" data-st="${k}" class="${k} ${r.status === k ? 'on' : ''}" title="${fmt.cap(k)}">${l}</button>`).join('')}</div></td>
                <td class="hide-sm"><input data-remark="${i}" value="${esc(r.remarks || '')}" placeholder="Optional" style="min-height:34px;padding:.35rem .55rem"></td></tr>`).join('')}
            </tbody></table></div>
            <div class="sticky-bar"><span id="attCounts" class="grow"></span>
                <label class="check"><input type="checkbox" id="notify" checked> SMS parents of absent students</label>
                <button class="btn" id="saveAtt" data-busy="Saving…">${icon('check')} Save attendance</button></div></div>`;

            const paint = () => {
                $('#attCounts', view).innerHTML = counts().map(([k, n]) => `${badge(k, `${fmt.cap(k)}: ${n}`)}`).join(' ');
                $$('.seg', body).forEach((seg) => {
                    const r = state[+seg.dataset.row];
                    $$('button', seg).forEach((b) => b.classList.toggle('on', b.dataset.st === r.status));
                });
            };
            paint();
            $$('.seg button', body).forEach((b) => (b.onclick = () => { state[+b.parentElement.dataset.row].status = b.dataset.st; paint(); }));
            $$('[data-remark]', body).forEach((inp) => (inp.oninput = () => (state[+inp.dataset.remark].remarks = inp.value)));
            $('#allPresent', view).onclick = () => { state.forEach((r) => (r.status = 'present')); paint(); };
            $('#saveAtt', view).onclick = (e) => busy(e.currentTarget, async () => {
                try {
                    const res = await API.post('/attendance', {
                        section_id: +sectionId, date, notify_absent: $('#notify', view).checked,
                        records: state.map((r) => ({ student_id: r.student_id, status: r.status, remarks: r.remarks || null })),
                    });
                    toast(res.message + (res.sms_sent ? ` ${res.sms_sent} parent(s) notified.` : ''));
                    sheet.is_marked = true;
                } catch (err) { toast(err.message, 'error'); }
            });
        } catch (err) { body.innerHTML = errorHtml(err); }
    },

    async register(body, sectionId, month) {
        const res = await API.get('/attendance/report', { section_id: sectionId, month });
        if (!res.data.length) { body.innerHTML = `<div class="card">${emptyHtml('No students in this section')}</div>`; return; }
        const days = Array.from({ length: res.days_in_month }, (_, i) => i + 1);
        const tone = { P: 'var(--ok)', A: 'var(--bad)', L: 'var(--accent)', LV: 'var(--info)' };
        body.innerHTML = `<div class="card"><div class="card-head"><h2>${fmt.month(month)}</h2><small>${res.working_days} working day(s) marked</small></div>
            <div class="table-wrap"><table class="table compact"><thead><tr><th>Roll</th><th>Student</th>${days.map((d) => `<th class="center">${d}</th>`).join('')}
            <th class="num">P</th><th class="num">A</th><th class="num">L</th><th class="num">LV</th><th class="num">%</th></tr></thead><tbody>
            ${res.data.map((r) => `<tr><td>${esc(r.roll_no || '')}</td><td class="nowrap"><b>${esc(r.name)}</b></td>
                ${days.map((d) => { const v = r.days[d] || r.days[String(d)]; return `<td class="center" style="color:${tone[v] || 'var(--ink-3)'};font-weight:700">${v || '·'}</td>`; }).join('')}
                <td class="num">${r.present}</td><td class="num">${r.absent}</td><td class="num">${r.late}</td><td class="num">${r.leave}</td>
                <td class="num"><b style="color:${r.percentage !== null && r.percentage < 75 ? 'var(--bad)' : 'inherit'}">${fmt.pct(r.percentage)}</b></td></tr>`).join('')}
            </tbody></table></div></div>`;
    },

    /* ---------- marks entry ---------- */
    async marks(view, params, query) {
        const scope = await TeacherPortal.scope();
        if (!scope.sections.length) return TeacherPortal.noClasses(view);
        const exams = (await API.get('/exams', { all: 1 })).data;
        const examId = query.exam || exams[0]?.id || '';
        const sectionId = query.section || scope.sections[0].id;
        const subjects = await TeacherPortal.subjectsFor(sectionId);
        const subjectId = query.subject && subjects.some((s) => String(s.id) === String(query.subject)) ? query.subject : (subjects[0]?.id || '');
        const go = (changes) => Router.navigate('/marks?' + new URLSearchParams({ exam: examId, section: sectionId, subject: subjectId, ...changes }));

        view.innerHTML = `
        <div class="card mb"><div class="card-body"><div class="toolbar">
            <label class="field"><span>Exam</span><select id="examSel">${options(exams, { label: (e) => e.name + (e.academic_session ? ' · ' + e.academic_session.name : ''), selected: examId, placeholder: exams.length ? '' : 'No exams created' })}</select></label>
            <label class="field wide"><span>Class / section</span><select id="secSel">${options(scope.sections, { label: 'label', selected: sectionId })}</select></label>
            <label class="field"><span>Subject</span><select id="subSel">${options(subjects, { selected: subjectId, placeholder: subjects.length ? '' : 'No subjects' })}</select></label>
        </div></div></div><div id="marksBody"></div>`;
        $('#examSel', view).onchange = (e) => go({ exam: e.target.value });
        $('#secSel', view).onchange = (e) => go({ section: e.target.value, subject: '' });
        $('#subSel', view).onchange = (e) => go({ subject: e.target.value });

        const body = $('#marksBody', view);
        if (!examId || !subjectId) { body.innerHTML = `<div class="card">${emptyHtml('Select an exam, section and subject')}</div>`; return; }
        body.innerHTML = loadingHtml();
        try {
            const sheet = await API.get('/marks/sheet', { exam_id: examId, section_id: sectionId, subject_id: subjectId });
            if (!sheet.data.length) { body.innerHTML = `<div class="card">${emptyHtml('No students in this section')}</div>`; return; }
            const total = sheet.total_marks || 100;
            body.innerHTML = `<div class="card"><div class="card-head"><h2>Enter marks</h2>
                <label class="flex"><span class="muted">Total marks</span><input id="totalMarks" type="number" min="1" max="1000" value="${fmt.num(total)}" style="width:100px"></label></div>
                <form id="marksForm"><div class="table-wrap"><table class="table"><thead><tr><th style="width:60px">Roll</th><th>Student</th><th>Obtained</th><th>Absent</th><th class="hide-sm">Remarks</th></tr></thead><tbody>
                ${sheet.data.map((r, i) => `<tr data-i="${i}"><td>${esc(r.roll_no || '—')}</td><td><b>${esc(r.name)}</b><br><small class="hide-sm">${esc(r.admission_no)}</small></td>
                    <td><input class="cell" type="number" step="0.5" min="0" name="m${i}" value="${r.obtained_marks ?? ''}" ${r.is_absent ? 'disabled' : ''} inputmode="decimal"></td>
                    <td><input type="checkbox" name="a${i}" ${r.is_absent ? 'checked' : ''}></td>
                    <td class="hide-sm"><input name="r${i}" value="${esc(r.remarks || '')}" placeholder="Optional" style="min-height:34px;padding:.35rem .55rem"></td></tr>`).join('')}
                </tbody></table></div>
                <div class="sticky-bar"><span class="grow muted" id="marksInfo"></span><button class="btn" type="submit" data-busy="Saving…">${icon('check')} Save marks</button></div></form></div>`;

            const form = $('#marksForm', view);
            const info = () => {
                const vals = sheet.data.map((_, i) => form[`a${i}`].checked ? null : form[`m${i}`].value).filter((v) => v !== null && v !== '');
                const avg = vals.length ? vals.reduce((a, b) => a + +b, 0) / vals.length : 0;
                $('#marksInfo', view).textContent = `${vals.length} of ${sheet.data.length} entered${vals.length ? ` · class average ${fmt.num(avg.toFixed(1))}` : ''}`;
            };
            info();
            form.addEventListener('input', info);
            sheet.data.forEach((_, i) => {
                form[`a${i}`].onchange = (e) => { form[`m${i}`].disabled = e.target.checked; if (e.target.checked) form[`m${i}`].value = ''; info(); };
            });
            // Enter moves to the next student's marks box.
            $$('input.cell', form).forEach((inp, i, all) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); (all[i + 1] || inp).focus(); } }));

            form.onsubmit = async (e) => {
                e.preventDefault();
                const totalMarks = +$('#totalMarks', view).value;
                let bad = false;
                $$('.is-invalid', form).forEach((x) => x.classList.remove('is-invalid'));
                const records = sheet.data.map((r, i) => {
                    const absent = form[`a${i}`].checked;
                    const v = form[`m${i}`].value;
                    if (!absent && v !== '' && (+v < 0 || +v > totalMarks)) { form[`m${i}`].classList.add('is-invalid'); bad = true; }
                    return { student_id: r.student_id, obtained_marks: absent || v === '' ? null : +v, is_absent: absent, remarks: form[`r${i}`].value || null };
                });
                if (!totalMarks || totalMarks < 1) return toast('Enter total marks.', 'error');
                if (bad) return toast(`Marks must be between 0 and ${totalMarks}.`, 'error');
                await busy($('button[type=submit]', form), async () => {
                    try {
                        const res = await API.post('/marks', { exam_id: +examId, section_id: +sectionId, subject_id: +subjectId, total_marks: totalMarks, records });
                        toast(res.message);
                    } catch (err) { toast(err.message, 'error'); }
                });
            };
        } catch (err) { body.innerHTML = errorHtml(err); }
    },

    /* ---------- results ---------- */
    async results(view, params, query) {
        const scope = await TeacherPortal.scope();
        if (!scope.sections.length) return TeacherPortal.noClasses(view);
        const exams = (await API.get('/exams', { all: 1 })).data;
        const examId = query.exam || exams[0]?.id || '';
        const sectionId = query.section || (scope.sections.find((s) => s.isClassTeacher) || scope.sections[0]).id;
        const go = (c) => Router.navigate('/results?' + new URLSearchParams({ exam: examId, section: sectionId, ...c }));

        view.innerHTML = `<div class="card mb"><div class="card-body"><div class="toolbar">
            <label class="field"><span>Exam</span><select id="examSel">${options(exams, { selected: examId, placeholder: exams.length ? '' : 'No exams created' })}</select></label>
            <label class="field wide"><span>Class / section</span><select id="secSel">${options(scope.sections, { label: 'label', selected: sectionId })}</select></label>
            <button class="btn secondary" id="csvBtn" data-busy="Exporting…">${icon('download')} Export to Excel</button>
        </div></div></div><div id="resBody">${examId ? loadingHtml() : ''}</div>`;
        $('#examSel', view).onchange = (e) => go({ exam: e.target.value });
        $('#secSel', view).onchange = (e) => go({ section: e.target.value });
        $('#csvBtn', view).onclick = (e) => busy(e.currentTarget, () => API.download('/results/section', { exam_id: examId, section_id: sectionId, export: 'csv' }, 'result.csv').catch((err) => toast(err.message, 'error')));
        if (!examId) { $('#resBody', view).innerHTML = `<div class="card">${emptyHtml('No exams yet')}</div>`; return; }

        const res = await API.get('/results/section', { exam_id: examId, section_id: sectionId });
        const subjects = [...new Set(res.data.flatMap((r) => r.subjects.map((s) => s.subject)))];
        const s = res.summary;
        $('#resBody', view).innerHTML = `
        <div class="stats mb">
            <div class="card stat"><div class="ico tone-brand">${icon('users')}</div><div><div class="label">Students</div><div class="value">${s.students}</div></div></div>
            <div class="card stat"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Passed</div><div class="value">${s.passed}</div></div></div>
            <div class="card stat"><div class="ico tone-bad">${icon('x')}</div><div><div class="label">Failed</div><div class="value">${s.failed}</div></div></div>
            <div class="card stat"><div class="ico tone-info">${icon('chart')}</div><div><div class="label">Class average</div><div class="value">${fmt.pct(s.average_percentage)}</div></div></div>
        </div>
        <div class="card">${res.data.length ? `<div class="table-wrap"><table class="table compact"><thead><tr><th>Pos.</th><th>Roll</th><th>Student</th>
            ${subjects.map((x) => `<th class="num">${esc(x)}</th>`).join('')}<th class="num">Total</th><th class="num">%</th><th>Grade</th><th>Result</th><th></th></tr></thead><tbody>
            ${res.data.map((r) => {
                const bySub = Object.fromEntries(r.subjects.map((x) => [x.subject, x]));
                return `<tr><td><b>${r.position ?? '—'}</b></td><td>${esc(r.student.roll_no || '')}</td><td class="nowrap"><b>${esc(r.student.name)}</b></td>
                ${subjects.map((x) => { const m = bySub[x]; return `<td class="num" style="${m && !m.passed ? 'color:var(--bad)' : ''}">${m ? (m.is_absent ? 'Abs' : fmt.num(m.obtained_marks)) : '—'}</td>`; }).join('')}
                <td class="num">${fmt.num(r.obtained_marks)}/${fmt.num(r.total_marks)}</td><td class="num"><b>${fmt.pct(r.percentage)}</b></td><td>${esc(r.grade || '')}</td>
                <td>${badge(r.result)}</td><td>${r.subjects.length ? `<button class="btn ghost sm" data-card="${r.student.id}" data-busy="…">${icon('download')} Card</button>` : ''}</td></tr>`;
            }).join('')}</tbody></table></div>` : emptyHtml('No marks entered yet', 'Enter marks from the Marks Entry page.', 'clipboard')}</div>`;
        $$('[data-card]', view).forEach((b) => (b.onclick = () => busy(b, () =>
            API.download('/results/report-card', { exam_id: examId, student_id: b.dataset.card, pdf: 1 }, 'report-card.pdf').catch((e) => toast(e.message, 'error')))));
    },

    /* ---------- homework ---------- */
    async homework(view, params, query) {
        const scope = await TeacherPortal.scope();
        const res = await API.get('/homework', { page: query.page || 1 });
        view.innerHTML = `
        <div class="page-head"><div><p>Homework you have assigned. Open one to see submissions and give marks.</p></div>
            <button class="btn" id="newHw" ${scope.combos.length ? '' : 'disabled title="No subjects assigned"'}>${icon('plus')} New homework</button></div>
        <div class="card">${res.data.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Title</th><th>Class</th><th>Subject</th><th>Given</th><th>Due</th><th class="num">Submitted</th><th></th></tr></thead><tbody>
            ${res.data.map((h) => `<tr><td><a href="#/homework/${h.id}"><b>${esc(h.title)}</b></a>${h.attachment ? ` <small>📎</small>` : ''}</td>
                <td class="nowrap">${esc(h.section?.school_class?.name || '')} – ${esc(h.section?.name || '')}</td><td>${esc(h.subject?.name || '')}</td>
                <td class="nowrap">${fmt.dateShort(h.assigned_date)}</td><td class="nowrap">${h.due_date ? fmt.date(h.due_date) : '—'}${h.due_date && h.due_date < fmt.today() ? ' ' + badge('closed', 'Closed') : ''}</td>
                <td class="num">${h.submissions_count ?? '—'}</td>
                <td class="right nowrap"><a class="btn secondary sm" href="#/homework/${h.id}">Submissions</a>
                <button class="btn ghost sm" data-del="${h.id}" style="color:var(--bad)" title="Delete">${icon('trash')}</button></td></tr>`).join('')}
            </tbody></table></div>` : emptyHtml('No homework yet', 'Click “New homework” to assign work to a class.', 'book')}${pagerHtml(res)}</div>`;
        bindPager(view, (p) => Router.navigate('/homework?page=' + p));
        $$('[data-del]', view).forEach((b) => (b.onclick = async () => {
            if (!(await confirmBox('Delete this homework and all its submissions?', { danger: true, okText: 'Delete' }))) return;
            try { await API.del('/homework/' + b.dataset.del); toast('Homework deleted.'); TeacherPortal.homework(view, params, query); } catch (e) { toast(e.message, 'error'); }
        }));
        $('#newHw', view).onclick = () => {
            const m = modal({
                title: 'New homework', wide: true,
                body: `<form class="form" id="hwForm">
                    <label class="field"><span>Class & subject <em>*</em></span><select name="combo" required>${options(scope.combos, { value: 'key', label: 'label', placeholder: 'Select' })}</select></label>
                    <label class="field"><span>Title <em>*</em></span><input name="title" required maxlength="255"></label>
                    <label class="field"><span>Instructions</span><textarea name="description" rows="4"></textarea></label>
                    <div class="form-row"><label class="field"><span>Due date</span><input type="date" name="due_date" min="${fmt.today()}"></label>
                    <label class="field"><span>Attachment</span><input type="file" name="attachment"></label></div>
                    <div class="flex" style="justify-content:flex-end"><button class="btn secondary" type="button" data-close>Cancel</button><button class="btn" type="submit" data-busy="Saving…">Assign homework</button></div></form>`,
            });
            const form = $('#hwForm', m.el);
            form.onsubmit = async (e) => {
                e.preventDefault();
                const [sectionId, subjectId] = form.combo.value.split(':');
                const fd = new FormData(form);
                fd.delete('combo');
                fd.append('section_id', sectionId);
                fd.append('subject_id', subjectId);
                if (!fd.get('attachment')?.size) fd.delete('attachment');
                if (!fd.get('due_date')) fd.delete('due_date');
                await busy($('button[type=submit]', form), async () => {
                    try { await API.post('/homework', fd); m.close(); toast('Homework assigned.'); TeacherPortal.homework(view, params, query); } catch (err) { showErrors(form, err); }
                });
            };
        };
    },

    async submissions(view, params) {
        const res = await API.get(`/homework/${params.id}/submissions`);
        const h = res.homework;
        const s = res.summary;
        const tone = { pending: '', submitted: 'submitted', late: 'late', evaluated: 'evaluated' };
        view.innerHTML = `
        <div class="page-head"><div><a href="#/homework" class="btn ghost sm">${icon('arrowLeft')} Homework</a>
            <h2 class="mt-s">${esc(h.title)}</h2><p>${esc(h.section?.school_class?.name || '')} – ${esc(h.section?.name || '')} · ${esc(h.subject?.name || '')}${h.due_date ? ' · Due ' + fmt.date(h.due_date) : ''}</p></div></div>
        ${h.description ? `<div class="card card-pad mb pre">${esc(h.description)}</div>` : ''}
        <div class="stats mb">
            <div class="card stat"><div class="ico tone-ok">${icon('check')}</div><div><div class="label">Submitted</div><div class="value">${s.submitted} / ${s.students}</div></div></div>
            <div class="card stat"><div class="ico tone-warn">${icon('clock')}</div><div><div class="label">Pending</div><div class="value">${s.pending}</div></div></div>
            <div class="card stat"><div class="ico tone-bad">${icon('alert')}</div><div><div class="label">Late</div><div class="value">${s.late}</div></div></div>
            <div class="card stat"><div class="ico tone-brand">${icon('award')}</div><div><div class="label">Checked</div><div class="value">${s.evaluated}</div></div></div>
        </div>
        <div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Roll</th><th>Student</th><th>Status</th><th>Submitted</th><th>Work</th><th class="num">Marks</th><th></th></tr></thead><tbody>
        ${res.data.map((r) => { const sub = r.submission; return `<tr><td>${esc(r.roll_no || '')}</td><td><b>${esc(r.name)}</b></td>
            <td>${badge(tone[r.status] || r.status, r.status === 'pending' ? 'Not submitted' : null)}</td><td class="nowrap">${sub ? fmt.datetime(sub.submitted_at) : '—'}</td>
            <td>${sub ? `${sub.content ? `<span class="clamp">${esc(sub.content)}</span>` : ''}${sub.attachment ? `<a href="${esc(storageUrl(sub.attachment))}" target="_blank" rel="noopener">${icon('file', 'inline')} Open file</a>` : ''}` : ''}</td>
            <td class="num">${sub?.marks !== null && sub?.marks !== undefined ? fmt.num(sub.marks) : '—'}</td>
            <td class="right">${sub ? `<button class="btn ${sub.status === 'evaluated' ? 'secondary' : ''} sm" data-eval="${sub.id}">${sub.status === 'evaluated' ? 'Edit' : 'Check'}</button>` : ''}</td></tr>`; }).join('')}
        </tbody></table></div></div>`;
        $$('svg.inline', view).forEach((sv) => { sv.style.width = '14px'; sv.style.height = '14px'; sv.style.verticalAlign = '-2px'; });
        $$('[data-eval]', view).forEach((b) => (b.onclick = () => {
            const row = res.data.find((r) => r.submission && String(r.submission.id) === b.dataset.eval);
            const sub = row.submission;
            const m = modal({
                title: 'Check: ' + row.name,
                body: `${sub.content ? `<div class="card card-pad mb pre">${esc(sub.content)}</div>` : ''}
                    ${sub.attachment ? `<p><a class="btn secondary sm" href="${esc(storageUrl(sub.attachment))}" target="_blank" rel="noopener">${icon('file')} Open submitted file</a></p>` : ''}
                    <form class="form" id="evalForm"><label class="field"><span>Marks</span><input type="number" name="marks" min="0" step="0.5" value="${sub.marks ?? ''}"></label>
                    <label class="field"><span>Feedback</span><textarea name="feedback" rows="3">${esc(sub.feedback || '')}</textarea></label>
                    <div class="flex" style="justify-content:flex-end"><button class="btn secondary" type="button" data-close>Cancel</button><button class="btn" type="submit" data-busy="Saving…">Save</button></div></form>`,
            });
            const form = $('#evalForm', m.el);
            form.onsubmit = async (e) => {
                e.preventDefault();
                const v = formValues(form);
                await busy($('button[type=submit]', form), async () => {
                    try {
                        await API.post(`/homework-submissions/${sub.id}/evaluate`, { marks: v.marks === '' ? null : +v.marks, feedback: v.feedback || null });
                        m.close(); toast('Saved.'); TeacherPortal.submissions(view, params);
                    } catch (err) { showErrors(form, err); }
                });
            };
        }));
    },

    /* ---------- download center ---------- */
    async downloads(view, params, query) {
        const scope = await TeacherPortal.scope();
        const res = await API.get('/study-materials', { uploaded_by: App.user.id, page: query.page || 1 });
        view.innerHTML = `<div class="page-head"><div><p>Share syllabus, assignments, notes and circulars with students and parents.</p></div>
            <button class="btn" id="upBtn">${icon('upload')} Upload</button></div>
            <div class="card">${materialList(res.data, { deletable: true })}${pagerHtml(res)}</div>`;
        bindPager(view, (p) => Router.navigate('/downloads?page=' + p));
        $$('[data-del]', view).forEach((b) => (b.onclick = async () => {
            if (!(await confirmBox('Delete this file?', { danger: true, okText: 'Delete' }))) return;
            try { await API.del('/study-materials/' + b.dataset.del); toast('Deleted.'); TeacherPortal.downloads(view, params, query); } catch (e) { toast(e.message, 'error'); }
        }));
        const classes = [...new Map(scope.sections.map((s) => [s.class_id, { id: s.class_id, name: s.class_name }])).values()];
        const subjects = [...new Map(scope.combos.map((c) => [c.subject_id, { id: c.subject_id, name: c.subject }])).values()];
        $('#upBtn', view).onclick = () => {
            const m = modal({
                title: 'Upload to download center', wide: true,
                body: `<form class="form" id="dlForm">
                    <div class="form-row"><label class="field"><span>Title <em>*</em></span><input name="title" required></label>
                    <label class="field"><span>Type <em>*</em></span><select name="type"><option value="study_material">Study material</option><option value="assignment">Assignment</option><option value="syllabus">Syllabus</option><option value="circular">Circular</option><option value="other">Other</option></select></label></div>
                    <div class="form-row"><label class="field"><span>Class</span><select name="school_class_id">${options(classes, { placeholder: 'All classes' })}</select></label>
                    <label class="field"><span>Section</span><select name="section_id"><option value="">All sections</option></select></label></div>
                    <label class="field"><span>Subject</span><select name="subject_id">${options(subjects, { placeholder: 'General' })}</select></label>
                    <label class="field"><span>Description</span><textarea name="description" rows="3"></textarea></label>
                    <div class="form-row"><label class="field"><span>File</span><input type="file" name="file"></label>
                    <label class="field"><span>…or a link</span><input type="url" name="link" placeholder="https://"></label></div>
                    <label class="check"><input type="checkbox" name="is_public" checked> Visible to students and parents</label>
                    <div class="flex" style="justify-content:flex-end"><button class="btn secondary" type="button" data-close>Cancel</button><button class="btn" type="submit" data-busy="Uploading…">Upload</button></div></form>`,
            });
            const form = $('#dlForm', m.el);
            form.school_class_id.onchange = (e) => {
                const secs = scope.sections.filter((s) => String(s.class_id) === e.target.value);
                form.section_id.innerHTML = options(secs, { label: 'name', placeholder: 'All sections' });
            };
            form.onsubmit = async (e) => {
                e.preventDefault();
                const fd = new FormData(form);
                ['school_class_id', 'section_id', 'subject_id', 'link', 'description'].forEach((k) => { if (!fd.get(k)) fd.delete(k); });
                if (!fd.get('file')?.size) fd.delete('file');
                if (!fd.get('file') && !fd.get('link')) return showErrors(form, { errors: { file: ['Attach a file or enter a link.'] } });
                fd.set('is_public', form.is_public.checked ? '1' : '0');
                await busy($('button[type=submit]', form), async () => {
                    try { await API.post('/study-materials', fd); m.close(); toast('Uploaded.'); TeacherPortal.downloads(view, params, query); } catch (err) { showErrors(form, err); }
                });
            };
        };
    },

    async timetable(view, params, query) {
        const { data } = await API.get('/teacher/timetable');
        renderWeek(view, data, query, '/timetable', (p) => `<div class="subj">${esc(p.subject?.name)}</div><small>${esc(p.section?.school_class?.name || '')} – ${esc(p.section?.name || '')}${p.room ? ' · Room ' + esc(p.room) : ''}</small>`);
    },
};

Router.add('teacher', '/', 'Dashboard', TeacherPortal.home);
Router.add('teacher', '/attendance', 'Attendance', TeacherPortal.attendance);
Router.add('teacher', '/marks', 'Marks Entry', TeacherPortal.marks);
Router.add('teacher', '/results', 'Results', TeacherPortal.results);
Router.add('teacher', '/homework', 'Homework', TeacherPortal.homework);
Router.add('teacher', '/homework/:id', 'Homework Submissions', TeacherPortal.submissions);
Router.add('teacher', '/downloads', 'Download Center', TeacherPortal.downloads);
Router.add('teacher', '/timetable', 'My Timetable', TeacherPortal.timetable);
