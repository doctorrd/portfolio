/* Case C: invented segments on recent acquisition × product depth, coloured by strategic role. */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});
  const ROLES = {
    core: { name: 'Loyal core', c: 'var(--s1)' },
    grow: { name: 'Clearest growth opportunity', c: 'var(--s2)' },
    emerge: { name: 'Emerging audience', c: 'var(--s3)' },
    deepen: { name: 'Product-depth opportunity', c: 'var(--s5)' }
  };
  const SEGS = [
    { n: 'Settled Homeowners', x: 22, y: 80, s: 24, r: 'core', a: 'Protect preferred access; branch and advice matter.' },
    { n: 'Country Traditionalists', x: 12, y: 62, s: 14, r: 'core', a: 'Keep service familiar and in person.' },
    { n: 'Rising Families', x: 66, y: 56, s: 18, r: 'grow', a: 'Proven fit and growing: lead acquisition here.' },
    { n: 'Digital Newcomers', x: 86, y: 24, s: 12, r: 'emerge', a: 'Nurture through early tenure with digital-first journeys.' },
    { n: 'Early-Career Urbanites', x: 74, y: 14, s: 11, r: 'emerge', a: 'Adapt outreach; build everyday-banking habits.' },
    { n: 'Comfortable Empty-Nesters', x: 34, y: 38, s: 15, r: 'deepen', a: 'Deepen wallet share with advisory and investment products.' }
  ];

  V['segment-matrix'] = function (host) {
    const W = 720, H = 440, L = 60, R = 30, T = 20, B = 50;
    const svg = V.svg(host, W, H, 'Scatter plot (synthetic): six invented segments by share of recent acquisition and product depth, grouped into loyal core, growth, emerging and product-depth roles.');
    const tip = V.tooltip(host);
    const x = (v) => L + (v / 100) * (W - L - R);
    const y = (v) => H - B - (v / 100) * (H - T - B);

    // quadrants
    V.el('line', { x1: x(50), x2: x(50), y1: y(100), y2: y(0), stroke: 'var(--line-strong)', 'stroke-dasharray': '3 5' }, svg);
    V.el('line', { x1: x(0), x2: x(100), y1: y(50), y2: y(50), stroke: 'var(--line-strong)', 'stroke-dasharray': '3 5' }, svg);
    V.el('line', { x1: x(0), x2: x(100), y1: y(0), y2: y(0), stroke: 'var(--line-strong)' }, svg);
    V.el('line', { x1: x(0), x2: x(0), y1: y(0), y2: y(100), stroke: 'var(--line-strong)' }, svg);
    [['PROTECT', 3, 97, 'start'], ['GROW', 97, 97, 'end'], ['DEEPEN', 3, 4, 'start'], ['NURTURE', 97, 4, 'end']].forEach(([t, qx, qy, anchor]) =>
      V.text(svg, x(qx), y(qy) + (qy > 50 ? 10 : -4), t, 'svg-mono', { 'text-anchor': anchor, style: 'letter-spacing:.12em' }));
    V.text(svg, x(50), H - 12, 'SHARE OF RECENT ACQUISITION  →', 'axis-label', { 'text-anchor': 'middle' });
    V.text(svg, 18, y(50), 'PRODUCT DEPTH  →', 'axis-label', { 'text-anchor': 'middle', transform: `rotate(-90 18 ${y(50)})` });

    const nodes = SEGS.map((s, i) => {
      const role = ROLES[s.r];
      const g = V.el('g', { opacity: 0 }, svg);
      const rad = 6 + s.s * 0.9;
      V.el('circle', { cx: x(s.x), cy: y(s.y), r: rad, fill: role.c, 'fill-opacity': 0.85, stroke: 'var(--surface)', 'stroke-width': 2 }, g);
      const right = s.x < 70;
      V.text(g, x(s.x) + (right ? rad + 8 : -rad - 8), y(s.y) + 4, s.n, 'svg-label', { 'text-anchor': right ? 'start' : 'end' });
      const hit = V.el('circle', { cx: x(s.x), cy: y(s.y), r: rad + 8, fill: 'transparent' }, g);
      V.hover(hit, tip, `<b>${s.n}</b>${role.name}<br>${s.a}`);
      setTimeout(() => V.tween(500, (t) => g.setAttribute('opacity', t)), V.reduceMotion ? 0 : 150 * i);
      return g;
    });
    return nodes;
  };
})();
