/* Four-layer QC: records pass Data → Analytical → Insight → Delivery gates.
   One item fails a gate and is routed back instead of slipping through. */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});
  const GATES = [
    { name: 'Data QC', q: 'Is the universe valid?' },
    { name: 'Analytical QC', q: 'Are the calculations right?' },
    { name: 'Insight QC', q: 'Does the story follow the evidence?' },
    { name: 'Delivery QC', q: 'Does it answer the brief?' }
  ];

  V['qc-gates'] = function (host) {
    const W = 720, H = 230, y = 96;
    const svg = V.svg(host, W, H, 'Animated diagram: work items pass four quality gates; one flagged item is routed back for correction.');
    const xs = [170, 310, 450, 590];
    const tip = V.tooltip(host);

    // track
    V.el('line', { x1: 20, y1: y, x2: 700, y2: y, stroke: 'var(--line-strong)', 'stroke-width': 1, 'stroke-dasharray': '2 5' }, svg);
    // return path
    const ret = V.el('path', { d: `M ${xs[1]} ${y + 22} C ${xs[1]} ${y + 90}, 40 ${y + 90}, 40 ${y + 22}`, fill: 'none', stroke: 'var(--risk)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: 0.35 }, svg);
    V.text(svg, (xs[1] + 40) / 2, y + 104, 'Flagged → corrected → re-run', 'svg-mono', { 'text-anchor': 'middle', fill: 'var(--risk)' });

    const gateEls = GATES.map((g, i) => {
      const grp = V.el('g', {}, svg);
      const r = V.el('rect', { x: xs[i] - 5, y: y - 46, width: 10, height: 92, rx: 5, fill: 'var(--surface-2)', stroke: 'var(--line-strong)' }, grp);
      V.text(grp, xs[i], y - 60, g.name, 'svg-label-strong', { 'text-anchor': 'middle' });
      V.text(grp, xs[i], 24, String(i + 1).padStart(2, '0'), 'svg-mono', { 'text-anchor': 'middle' });
      const hit = V.el('rect', { x: xs[i] - 50, y: 10, width: 100, height: 150, fill: 'transparent' }, grp);
      V.hover(hit, tip, `<b>${g.name}</b>${g.q}`);
      return r;
    });
    V.text(svg, 20, y - 14, 'IN', 'svg-mono');
    V.text(svg, 700, y - 14, 'CLIENT', 'svg-mono', { 'text-anchor': 'end' });

    const tokens = [];
    const layer = V.el('g', {}, svg);
    const spawn = (bad, offset) => {
      const c = V.el('circle', { cx: 20, cy: y, r: 6, fill: 'var(--s1)' }, layer);
      tokens.push({ c, x: 20 - (offset || 0), bad, state: 'fwd', t: 0 });
    };

    const light = (i, color) => {
      gateEls[i].setAttribute('fill', color);
      clearTimeout(gateEls[i].__t);
      gateEls[i].__t = setTimeout(() => gateEls[i].setAttribute('fill', 'var(--surface-2)'), 260);
    };

    if (V.reduceMotion) {
      [60, 230, 380, 520, 650].forEach((x, i) => V.el('circle', { cx: x, cy: y, r: 6, fill: i === 4 ? 'var(--decision)' : 'var(--s1)' }, layer));
      V.el('circle', { cx: 120, cy: y + 72, r: 6, fill: 'var(--risk)' }, layer);
      return;
    }

    let n = 0;
    const speed = 2.2;
    let last = performance.now(), spawnAcc = 0, running = true;
    const tick = (now) => {
      const dt = Math.min(50, now - last); last = now;
      spawnAcc += dt;
      if (spawnAcc > 700) { spawnAcc = 0; n++; spawn(n % 5 === 3); }
      for (let k = tokens.length - 1; k >= 0; k--) {
        const tk = tokens[k];
        if (tk.state === 'fwd') {
          const prev = tk.x;
          tk.x += speed * dt / 16;
          xs.forEach((gx, gi) => {
            if (prev < gx && tk.x >= gx) {
              if (tk.bad && gi === 1) {
                tk.state = 'back'; tk.t = 0; tk.x = gx;
                tk.c.setAttribute('fill', 'var(--risk)');
                light(gi, 'var(--risk)');
              } else light(gi, 'var(--s1)');
            }
          });
          if (tk.x > 690) tk.c.setAttribute('fill', 'var(--decision)');
          if (tk.x > 720) { tk.c.remove(); tokens.splice(k, 1); continue; }
          tk.c.setAttribute('cx', tk.x); tk.c.setAttribute('cy', y);
        } else {
          tk.t += dt / 1600;
          const p = ret.getPointAtLength(Math.min(1, tk.t) * ret.getTotalLength());
          tk.c.setAttribute('cx', p.x); tk.c.setAttribute('cy', p.y);
          if (tk.t >= 1) { tk.state = 'fwd'; tk.bad = false; tk.x = 40; tk.c.setAttribute('fill', 'var(--s1)'); }
        }
      }
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    new IntersectionObserver((es) => {
      const vis = es[0].isIntersecting;
      if (vis && !running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
      if (!vis) running = false;
    }).observe(host);
  };
})();
