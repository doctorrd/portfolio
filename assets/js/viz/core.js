/* Shared helpers for the portfolio visualisations.
   Every chart on the site uses synthetic data only. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const V = (window.PortfolioViz = window.PortfolioViz || {});

  V.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  V.css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  V.el = (tag, attrs, parent) => {
    const node = document.createElementNS(NS, tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (parent) parent.appendChild(node);
    return node;
  };

  V.svg = (container, w, h, label) => {
    const s = V.el('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': label || '' });
    if (w >= 600) s.classList.add('wide');
    container.appendChild(s);
    return s;
  };

  V.text = (parent, x, y, str, cls, extra) => {
    const t = V.el('text', Object.assign({ x, y, class: cls || 'svg-label' }, extra || {}), parent);
    t.textContent = str;
    return t;
  };

  // Tooltip bound to a positioned container.
  V.tooltip = (container) => {
    container.style.position = container.style.position || 'relative';
    const tip = document.createElement('div');
    tip.className = 'viz-tip';
    tip.setAttribute('role', 'status');
    container.appendChild(tip);
    return {
      show(html, evt) {
        tip.innerHTML = html;
        tip.classList.add('show');
        const r = container.getBoundingClientRect();
        let x = evt.clientX - r.left + 14;
        let y = evt.clientY - r.top + 14;
        const tw = tip.offsetWidth; const th = tip.offsetHeight;
        if (x + tw > r.width) x = evt.clientX - r.left - tw - 14;
        if (y + th > r.height) y = evt.clientY - r.top - th - 14;
        tip.style.left = Math.max(0, x) + 'px';
        tip.style.top = Math.max(0, y) + 'px';
      },
      hide() { tip.classList.remove('show'); }
    };
  };

  // Attach hover tooltip to an SVG node (with an enlarged hit target where needed).
  V.hover = (node, tip, html) => {
    node.style.cursor = 'default';
    node.addEventListener('pointermove', (e) => tip.show(typeof html === 'function' ? html() : html, e));
    node.addEventListener('pointerleave', () => tip.hide());
    node.setAttribute('tabindex', '0');
    node.addEventListener('focus', () => {
      const b = node.getBoundingClientRect();
      tip.show(typeof html === 'function' ? html() : html, { clientX: b.left + b.width / 2, clientY: b.top });
    });
    node.addEventListener('blur', () => tip.hide());
  };

  // Seeded PRNG so synthetic data is stable between loads.
  V.rng = (seed) => {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  };

  V.tween = (dur, onFrame, done) => {
    if (V.reduceMotion) { onFrame(1); if (done) done(); return; }
    const start = performance.now();
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      onFrame(ease(p));
      if (p < 1) requestAnimationFrame(tick); else if (done) done();
    };
    requestAnimationFrame(tick);
  };

  V.onTheme = (fn) => window.addEventListener('themechange', fn);
})();
