/* global window, document */
(function () {
  'use strict';

  const grid = document.getElementById('grid');
  const search = document.getElementById('search');
  const pills = Array.from(document.querySelectorAll('.pill'));
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /** @type {{ q: string, filter: 'all'|'game'|'tool'|'vr', data: any[] }} */
  const state = { q: '', filter: 'all', data: Array.isArray(window.projects) ? window.projects : [] };

  // Stable placeholder generator so cards always have a graphic
  const placeholder = (slug) => `https://picsum.photos/seed/${encodeURIComponent(slug || 'portfolio')}/800/450`;

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function linkButton(href, label, primary) {
    if (!href) return '';
    const cls = primary ? 'btn primary' : 'btn';
    return `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`;
  }

  function cardHTML(p) {
    const metaBits = [];
    if (p.role) metaBits.push(esc(p.role));
    if (p.year) metaBits.push(esc(String(p.year)));
    if (p.type) metaBits.push(esc(p.type));
    const metaHTML = metaBits.map((bit, i) => (i === 0 ? `<span>${bit}</span>` : `<span class="dot"></span><span>${bit}</span>`)).join('');

    const imgSrc = p.thumb || placeholder(p.slug);
    const thumbHTML = `<img src="${esc(imgSrc)}" alt="${esc(p.title)} thumbnail">`;
    const href = `project.html?slug=${encodeURIComponent(p.slug)}`;

    const linksHTML = [
      linkButton(p?.links?.demo || p?.links?.readme, p?.links?.demo ? 'Live demo' : p?.links?.readme ? 'README' : '', true),
      linkButton(p?.links?.repo, 'Source', false)
    ].filter(Boolean).join('');

    return `
      <article class="card" aria-label="${esc(p.title)}">
        <a href="${href}" class="thumb" aria-hidden="true" tabindex="-1">${thumbHTML}</a>
        <div class="content">
          <div class="title"><a class="linklike" href="${href}">${esc(p.title)}</a></div>
          <div class="meta">${metaHTML}</div>
          <p class="blurb">${esc(p.blurb || '')}</p>
          <div class="tags">${(p.tags || []).map((t) => `<span class="tag-chip">${esc(t)}</span>`).join('')}</div>
          <div class="links">${linksHTML}</div>
        </div>
      </article>
    `;
  }

  function render() {
    const q = state.q.trim().toLowerCase();

    // Respect explicit order if present; otherwise preserve original order.
    const withIndex = state.data.map((p, idx) => ({ p, idx }));
    withIndex.sort((a, b) => {
      const ao = (typeof a.p.order === 'number') ? a.p.order : Number.POSITIVE_INFINITY;
      const bo = (typeof b.p.order === 'number') ? b.p.order : Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      return a.idx - b.idx; // stable
    });

    const list = withIndex
      .map(x => x.p)
      .filter((p) => state.filter === 'all' || p.type === state.filter)
      .filter((p) => {
        if (!q) return true;
        const hay = [
          p.title, p.blurb, p.role, String(p.year || ''),
          ...(p.tags || []),
          ...(p.stack || [])
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });

    grid.innerHTML = list.map(cardHTML).join('');
  }

  if (search) {
    search.addEventListener('input', (e) => {
      state.q = /** @type {HTMLInputElement} */ (e.target).value;
      render();
    });
  }

  pills.forEach((btn) => {
    btn.addEventListener('click', () => {
      pills.forEach((b) => b.setAttribute('data-active', 'false'));
      btn.setAttribute('data-active', 'true');
      // note: 'tool' (singular) matches your schema
      state.filter = /** @type {typeof state.filter} */ (btn.getAttribute('data-filter') || 'all');
      render();
    });
  });

  render();
})();
