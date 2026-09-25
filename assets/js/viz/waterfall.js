/* Case A: from raw operational labels to a defensible analytical universe (synthetic index). */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});
  const STEPS = [
    { k: 'Raw operational labels', v: 100, type: 'total', c: 'var(--muted)', note: 'Every distinct label as it arrived from the source systems.' },
    { k: 'Administrative / deprecated codes', v: -16, c: 'var(--s4)', note: 'Excluded with a recorded reason, not silently dropped.' },
    { k: 'Temporary users & non-members', v: -22, c: 'var(--s3)', note: 'Operational records that are not ongoing members.' },
    { k: 'No surviving records', v: -14, c: 'var(--s5)', note: 'Labels with no records left in the final universe.' },
    { k: 'Ambiguous: routed for decision', v: -8, c: 'var(--s2)', note: 'Held in the pending decision log; the client decides, the logic re-runs.' },
    { k: 'Analytical universe', v: 40, type: 'total', c: 'var(--s1)', note: 'Every remaining label classified once and applied consistently.' }
  ];

  V.waterfall = function (host) {
    const W = 720, rowH = 40, top = 10, left = 250, right = 60;
    const H = top + STEPS.length * rowH + 30;
    const svg = V.svg(host, W, H, 'Waterfall chart (synthetic index): raw labels 100, minus administrative 16, temporary and non-members 22, no surviving records 14, ambiguous routed for decision 8, leaving an analytical universe of 40.');
    const tip = V.tooltip(host);
    const x = (v) => left + (v / 100) * (W - left - right);

    [0, 25, 50, 75, 100].forEach((g) => {
      V.el('line', { x1: x(g), x2: x(g), y1: top, y2: H - 24, stroke: 'var(--grid)' }, svg);
      V.text(svg, x(g), H - 8, String(g), 'svg-mono', { 'text-anchor': 'middle' });
    });

    let running = 0;
    const bars = STEPS.map((s, i) => {
      const y = top + i * rowH + 8;
      let from, to;
      if (s.type === 'total') { from = 0; to = s.v; running = s.v; }
      else { from = running + s.v; to = running; running = from; }
      V.text(svg, left - 14, y + 17, s.k, i === STEPS.length - 1 ? 'svg-label-strong' : 'svg-label', { 'text-anchor': 'end' });
      const r = V.el('rect', { x: x(from), y, width: 0, height: rowH - 16, rx: 4, fill: s.c }, svg);
      const lbl = V.text(svg, x(to) + 8, y + 17, s.type === 'total' ? String(s.v) : '−' + Math.abs(s.v), 'svg-mono', { opacity: 0 });
      if (i < STEPS.length - 1) {
        const nx = s.type === 'total' ? to : from;
        V.el('line', { x1: x(nx), x2: x(nx), y1: y + rowH - 16, y2: y + rowH + 8, stroke: 'var(--line-strong)', 'stroke-dasharray': '2 3' }, svg);
      }
      const hit = V.el('rect', { x: 0, y: y - 6, width: W, height: rowH, fill: 'transparent' }, svg);
      V.hover(hit, tip, `<b>${s.k}: ${s.type === 'total' ? s.v : s.v} (index)</b>${s.note}`);
      return { r, lbl, from, to };
    });

    bars.forEach((b, i) => {
      setTimeout(() => V.tween(600, (t) => {
        b.r.setAttribute('width', Math.max(0, (x(b.to) - x(b.from)) * t));
        b.lbl.setAttribute('opacity', t);
      }), V.reduceMotion ? 0 : i * 260);
    });
  };
})();
