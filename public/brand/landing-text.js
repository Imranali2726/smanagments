/* Shared by the landing page and the super admin "Landing page" editor.
   Finds the editable texts of every section in a stable order, so the editor and the page agree on keys.
   Markup used in edited text: *highlight*  **bold**  and new lines. */
window.LandingText = {
    EXCL: '.mock,.panel,.shot,.float,.bubble,details,#plans,.pnotes,.contact,.vidbox,.mod,#tabs,[data-c]',
    PICK: '.eyebrow,h1,h2,h3,p,li,.chip',
    ALLOWED: ['EM', 'B', 'STRONG', 'BR'],
    sections(doc) {
        return [...doc.querySelectorAll('section[data-sec], .cta-band[data-sec]')];
    },
    simple(el) {
        if (!el.textContent.trim()) return false;
        return [...el.children].every((c) => this.ALLOWED.includes(c.tagName) || (c.tagName === 'I' && !c.textContent.trim()));
    },
    kind(el) {
        if (el.classList.contains('eyebrow')) return 'Small label';
        if (el.classList.contains('chip')) return 'Chip';
        return { H1: 'Main heading', H2: 'Heading', H3: 'Sub-heading', P: 'Text', LI: 'List item' }[el.tagName] || 'Text';
    },
    toMark(el) {
        const walk = (node) => [...node.childNodes].map((c) => {
            if (c.nodeType === 3) return c.textContent.replace(/\s+/g, ' ');
            if (c.nodeType !== 1) return '';
            const t = c.tagName;
            if (t === 'BR') return '\n';
            const inner = walk(c);
            if (t === 'EM') return '*' + inner.trim() + '*';
            if (t === 'B' || t === 'STRONG') return '**' + inner.trim() + '**';
            return inner;
        }).join('');
        return walk(el).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).join('\n').trim();
    },
    esc(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    fromMark(s) {
        return this.esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
    },
    nodes(doc) {
        const out = [];
        this.sections(doc).forEach((sec) => {
            const s = sec.dataset.sec;
            let n = 0;
            sec.querySelectorAll(this.PICK).forEach((el) => {
                if (el.closest(this.EXCL) || !this.simple(el)) return;
                out.push({ key: `${s}.${n++}`, sec: s, el, kind: this.kind(el), text: this.toMark(el) });
            });
        });
        return out;
    },
    /* Apply saved texts. An edit is used only while the original wording is unchanged,
       so later changes to landing.html never put a text in the wrong place. */
    apply(doc, texts) {
        if (!texts) return;
        this.nodes(doc).forEach((n) => {
            const o = texts[n.key];
            if (!o || typeof o.to !== 'string' || o.from !== n.text) return;
            const dot = [...n.el.children].some((c) => c.tagName === 'I' && !c.textContent.trim());
            n.el.innerHTML = (dot ? '<i></i>' : '') + this.fromMark(o.to);
        });
    },
};
