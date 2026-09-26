/* Auditable address matching: confident / review / unmatched — proportions only (~70 / ~15 / ~15). */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});
  const DATA = [
    { k: 'High-confidence match', v: 70, c: 'var(--s1)', note: 'Assigned automatically; threshold documented.' },
    { k: 'Routed to review', v: 15, c: 'var(--s2)', note: 'Plausible but uncertain; a human decides.' },
    { k: 'Left unmatched', v: 15, c: 'var(--s3)', note: 'Not forced; reported transparently.' }
  ];

  V['match-donut'] = function (host) {
    const S = 240, R = 96, r = 66, cx = S / 2, cy = S / 2;
    const svg = V.svg(host, S, S, 'Donut chart: about 70% high-confidence matches, about 15% routed to review, about 15% left unmatched.');
    svg.style.maxWidth = '260px'; svg.style.margin = '0 auto';
    const tip = V.tooltip(host);
    const total = DATA.reduce((a, d) => a + d.v, 0);
    const gap = 0.025;
    let a0 = -Math.PI / 2;
    const arcs = DATA.map((d) => {
      const a1 = a0 + (d.v / total) * Math.PI * 2;
      const p = V.el('path', { fill: d.c, stroke: 'var(--surface)', 'stroke-width': 2 }, svg);
      const seg = { p, s: a0 + gap, e: a1 - gap, d };
      a0 = a1;
      V.hover(p, tip, `<b>${d.k}: ~${d.v}%</b>${d.note}`);
      return seg;
    });
    const arcPath = (s, e) => {
      const large = e - s > Math.PI ? 1 : 0;
      const P = (ang, rad) => `${cx + Math.cos(ang) * rad} ${cy + Math.sin(ang) * rad}`;
      return `M ${P(s, R)} A ${R} ${R} 0 ${large} 1 ${P(e, R)} L ${P(e, r)} A ${r} ${r} 0 ${large} 0 ${P(s, r)} Z`;
    };
    V.text(svg, cx, cy - 2, '~70%', 'svg-label-strong', { 'text-anchor': 'middle', style: 'font-family:var(--font-display);font-size:34px;font-weight:500' });
    V.text(svg, cx, cy + 22, 'HIGH CONFIDENCE', 'svg-mono', { 'text-anchor': 'middle' });

    V.tween(1100, (t) => arcs.forEach((a) => a.p.setAttribute('d', arcPath(a.s, a.s + Math.max(0.001, (a.e - a.s) * t)))));
  };
})();
