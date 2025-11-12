/* global window, document, URLSearchParams */
(function () {
  'use strict';

  const root = document.getElementById('project-root');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /** @type {any[]} */
  const data = Array.isArray(window.projects) ? window.projects : [];
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // Normalize any YouTube URL to a privacy-friendly, non-autoplay embed.
  function ytEmbedURL(raw) {
    if (!raw) return '';
    try {
      const u = new URL(raw);
      let id = '';
      if (u.hostname.includes('youtu.be')) {
        id = u.pathname.slice(1);
      } else if (u.pathname.startsWith('/watch')) {
        id = u.searchParams.get('v') || '';
      } else if (u.pathname.startsWith('/embed/')) {
        id = u.pathname.split('/').pop() || '';
      }
      const start = u.searchParams.get('t') || u.searchParams.get('start');
      const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
      if (start) params.set('start', String(parseInt(start, 10) || 0));
      return id ? `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}` : '';
    } catch {
      return '';
    }
  }

  if (!slug) {
    root.innerHTML = '<p class="blurb">No project specified.</p>';
    document.title = 'Not found';
    return;
  }

  const p = data.find((x) => x.slug === slug);
  if (!p) {
    root.innerHTML = '<p class="blurb">Project not found.</p>';
    document.title = 'Not found';
    return;
  }

  document.title = p.title;

  // meta line (role • year • type)
  const metaBits = [];
  if (p.role) metaBits.push(esc(p.role));
  if (p.year) metaBits.push(esc(String(p.year)));
  if (p.type) metaBits.push(esc(p.type));
  const metaHTML = metaBits.map((bit) => `<span>${bit}</span>`).join('');

  // hero thumb
  const heroThumb = p.thumb
    ? `<div class="hero-thumb"><img src="${esc(p.thumb)}" alt="${esc(p.title)} cover"></div>`
    : '';

  // action buttons
  function link(href, label, primary) {
    if (!href) return '';
    const cls = primary ? 'btn primary' : 'btn';
    return `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`;
  }
  const buttons = [
    link(p?.links?.play, 'Play', true),
    link(p?.links?.demo, 'Live demo', false),
    link(p?.links?.readme, 'README', false),
    link(p?.links?.repo, 'Source', false),
    link(p?.links?.npm, 'npm', false),
    link(p?.links?.docs, 'Docs', false),
    link(p?.links?.itch, 'Itch.io', false),
    link(p?.links?.steam, 'Steam', false),
    link(p?.links?.crates, 'crates.io', false),
    link(p?.links?.video, 'Video', false),
    link(p?.links?.world, 'World', false)
  ].filter(Boolean).join('');

  // highlights block (Goal / Approach / Outcome)
  const highlightsHTML = (arr) =>
    Array.isArray(arr) && arr.length
      ? `<div class="keylines">${arr.map((h) => {
          const parts = h.split(':');
          if (parts.length >= 2) {
            return `<div class="keyline"><span class="key">${esc(parts[0])}:</span><span class="val">${esc(parts.slice(1).join(':').trim())}</span></div>`;
          }
          return `<div class="keyline"><span class="val">${esc(h)}</span></div>`;
        }).join('')}</div>`
      : '';

  // description paragraphs
  const descriptionHTML = Array.isArray(p.description)
    ? p.description.map((para) => `<p>${esc(para)}</p>`).join('')
    : (p.description ? `<p>${esc(p.description)}</p>` : '');

  // overview assembly with divider between highlights and description
  const hl = highlightsHTML(p.highlights);
  let overviewHTML = '';
  if (hl && descriptionHTML) {
    overviewHTML = hl + `<div class="section-sep"></div>` + `<div class="desc">${descriptionHTML}</div>`;
  } else if (hl) {
    overviewHTML = hl;
  } else if (descriptionHTML) {
    overviewHTML = descriptionHTML;
  } else if (p.blurb) {
    overviewHTML = `<p>${esc(p.blurb)}</p>`;
  } else {
    overviewHTML = '<p>No description provided yet.</p>';
  }

  // Software Stack section (chips)
  const stackHTML =
    Array.isArray(p.stack) && p.stack.length
      ? `<h2>Software Stack</h2><div class="tags" aria-label="Software stack">${
          p.stack.map((s) => `<span class="tag-chip">${esc(s)}</span>`).join('')
        }</div>`
      : '';

  // Examples section (schema-driven code blocks)
  let examplesHTML = '';
  if (Array.isArray(p.examples) && p.examples.length) {
    const many = p.examples.length > 1;
    const items = p.examples.map((ex) => {
      const title = ex.title ? `<h3>${esc(ex.title)}</h3>` : (many ? '<h3>Example</h3>' : '');
      const langAttr = ex.language ? ` data-lang="${esc(ex.language)}"` : '';
      // Escape code content to keep it safe; preserve newlines
      const code = typeof ex.code === 'string' ? esc(ex.code) : '';
      return `${title}<pre class="codeblock"${langAttr}><code>${code}</code></pre>`;
    }).join('');
    examplesHTML = `<h2>Example${p.examples.length > 1 ? 's' : ''}</h2>${items}`;
  }

  // gallery renderer (images + YouTube embeds)
  const gallery = Array.isArray(p.gallery)
    ? p.gallery.map((item) => {
        if (item.type === 'image') {
          return `<div class="shot"><img src="${esc(item.src)}" alt="${esc(item.alt || p.title)}" loading="lazy" decoding="async" fetchpriority="low"></div>`;
        }
        if (item.type === 'video') {
          const safe = ytEmbedURL(item.src);
          return safe
            ? `<div class="shot" style="aspect-ratio:16/9">
                 <iframe
                   src="${esc(safe)}"
                   title="${esc(item.title || p.title)}"
                   loading="lazy"
                   frameborder="0"
                   allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowfullscreen>
                 </iframe>
               </div>`
            : '';
        }
        return '';
      }).join('')
    : '';

  // final render
  root.innerHTML = `
    <section class="project-hero">
      ${heroThumb}
      <div class="hero-overlay">
        <div>
          <div class="project-title">${esc(p.title)}</div>
          <div class="kv">${metaHTML}</div>
          <div class="tags">${(p.tags || []).map((t) => `<span class="tag-chip">${esc(t)}</span>`).join('')}</div>
          <div class="links" style="margin-top:10px">${buttons}</div>
        </div>
      </div>
    </section>

    <section class="project-body">
      <h2>Overview</h2>
      ${overviewHTML}

      ${stackHTML}

      ${examplesHTML ? '<div class="section-sep"></div>' + examplesHTML : ''}

      ${gallery ? '<div class="section-sep"></div><h2>Media</h2>' : ''}
      <div class="gallery">${gallery}</div>
    </section>
  `;
})();
