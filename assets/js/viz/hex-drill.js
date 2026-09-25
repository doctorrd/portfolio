/* Case D: quantify-and-locate drill-down. Region → city → postal areas (abstract hex geography, synthetic). */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});
  const RAMP = ['--q1', '--q2', '--q3', '--q4', '--q5'];

  V['hex-drill'] = function (host) {
    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Geographic level');
    const LEVELS = ['1 · Region', '2 · City', '3 · Postal areas'];
    controls.innerHTML = LEVELS.map((l, i) => `<button class="seg-btn" type="button" aria-pressed="${i === 0}">${l}</button>`).join('');
    host.appendChild(controls);
    const caption = document.createElement('p');
    caption.className = 'viz-sub';
    caption.style.margin = '14px 0 10px';
    host.appendChild(caption);
    const stage = document.createElement('div');
    stage.style.position = 'relative';
    host.appendChild(stage);
    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.style.marginTop = '12px';
    host.appendChild(legend);
    const tip = V.tooltip(stage);
    const W = 720, H = 360;

    const hex = (cx, cy, r) => {
      const pts = [];
      for (let k = 0; k < 6; k++) { const a = Math.PI / 180 * (60 * k - 30); pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`); }
      return pts.join(' ');
    };
    const bin = (v) => Math.min(4, Math.floor(v / 20));
    const rampLegend = (label) => `<span>${label}</span>` + RAMP.map((c, i) => `<span><i style="background:var(${c})"></i>${i === 0 ? 'Low' : i === 4 ? 'High' : ''}</span>`).join('');

    const drawGrid = (svg, cols, rows, r, field, hot, dots) => {
      const w = Math.sqrt(3) * r, ox = (W - cols * w) / 2 + w / 2, oy = (H - rows * r * 1.5) / 2 + r;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const cx = ox + i * w + (j % 2 ? w / 2 : 0), cy = oy + j * r * 1.5;
        const v = field(i / (cols - 1), j / (rows - 1));
        if (v < 0) continue;
        const p = V.el('polygon', { points: hex(cx, cy, r - 1), fill: `var(${RAMP[bin(v)]})`, stroke: 'var(--surface)', 'stroke-width': 2 }, svg);
        let html = `<b>Lookalike potential: ${Math.round(v)}</b>index, synthetic`;
        if (dots) {
          const a = dots(i / (cols - 1), j / (rows - 1), v);
          V.el('circle', { cx, cy, r: 2 + a / 14, fill: 'var(--decision)', 'pointer-events': 'none' }, svg);
          html += `<br>Application activity: ${Math.round(a)}`;
        }
        V.hover(p, tip, html);
        if (hot && hot(i / (cols - 1), j / (rows - 1))) p.setAttribute('stroke', 'var(--decision)');
      }
    };

    const blob = (u, v, cx, cy, s) => Math.exp(-(((u - cx) ** 2) + ((v - cy) ** 2)) / s);

    const renders = [
      () => {
        const svg = V.svg(stage, W, H, 'Hex map (synthetic): lookalike potential across a region, with one high-potential city cluster highlighted.');
        const mask = (u, v) => blob(u, v, 0.5, 0.5, 0.22) > 0.18;
        drawGrid(svg, 18, 10, 20, (u, v) => (mask(u, v) ? 12 + 88 * Math.max(blob(u, v, 0.66, 0.42, 0.012), 0.55 * blob(u, v, 0.3, 0.6, 0.03), 0.25 * blob(u, v, 0.5, 0.5, 0.2)) : -1),
          (u, v) => blob(u, v, 0.66, 0.42, 0.012) > 0.45);
        caption.textContent = 'Quantify: across the region, high-potential lookalikes of the priority audience cluster in a handful of places. One city stands out.';
        legend.innerHTML = rampLegend('Lookalike potential');
      },
      () => {
        const svg = V.svg(stage, W, H, 'Hex map (synthetic): within the city, lookalike potential shown as fill and application activity as dots.');
        drawGrid(svg, 14, 8, 26,
          (u, v) => 15 + 85 * Math.max(blob(u, v, 0.3, 0.35, 0.03), blob(u, v, 0.7, 0.3, 0.025), blob(u, v, 0.55, 0.75, 0.03), 0.2),
          null,
          (u, v, pot) => pot * (blob(u, v, 0.3, 0.35, 0.05) > 0.3 ? 0.95 : 0.35));
        caption.textContent = 'Locate: inside the city (10,000+ prospects sized), potential is high in several places, but applications only follow it in one.';
        legend.innerHTML = rampLegend('Lookalike potential') + '<span><i style="background:var(--decision);border-radius:50%"></i>Application activity (dot size)</span>';
      },
      () => {
        const areas = [
          { k: 'Postal area A', p: 100, a: 92, s: 'Healthy traction: sustain.' },
          { k: 'Postal area B', p: 88, a: 41, s: 'Weaker activity: activation priority.' },
          { k: 'Postal area C', p: 81, a: 35, s: 'Weaker activity: activation priority.' }
        ];
        const svg = V.svg(stage, W, H, 'Grouped bar chart (synthetic index): three postal areas; A shows healthy application traction, B and C show potential well above application activity.');
        const L = 140, R = 40, T = 20, B = 40, x = (v) => L + (v / 100) * (W - L - R), bh = 26;
        [0, 25, 50, 75, 100].forEach((g) => { V.el('line', { x1: x(g), x2: x(g), y1: T, y2: H - B, stroke: 'var(--grid)' }, svg); V.text(svg, x(g), H - B + 18, String(g), 'svg-mono', { 'text-anchor': 'middle' }); });
        areas.forEach((d, i) => {
          const y0 = T + 20 + i * 100;
          V.text(svg, L - 14, y0 + bh + 4, d.k, 'svg-label-strong', { 'text-anchor': 'end' });
          [['p', 'var(--s1)', 'Lookalike potential'], ['a', 'var(--s2)', 'Application activity']].forEach(([key, c, name], j) => {
            const r = V.el('rect', { x: x(0), y: y0 + j * (bh + 2), width: 0, height: bh, rx: 4, fill: c }, svg);
            V.tween(700, (t) => r.setAttribute('width', (x(d[key]) - x(0)) * t));
            V.hover(r, tip, `<b>${d.k}: ${name}</b>Index ${d[key]}<br>${d.s}`);
          });
          if (i > 0) V.text(svg, x(d.a) + 10, y0 + bh + 20, '◆ ACTIVATION PRIORITY', 'svg-mono', { fill: 'var(--decision)' });
          else V.text(svg, x(d.a) + 10, y0 + bh + 20, '✓ HEALTHY', 'svg-mono', { fill: 'var(--signal)' });
        });
        caption.textContent = 'Act: of three postal areas with meaningful eligible populations, one converts well and two lag. Outreach can be tested where it is most likely to help.';
        legend.innerHTML = '<span><i style="background:var(--s1)"></i>Lookalike potential (index)</span><span><i style="background:var(--s2)"></i>Application activity (index)</span>';
      }
    ];

    const buttons = controls.querySelectorAll('button');
    const show = (n) => {
      stage.querySelectorAll('svg').forEach((s) => s.remove());
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === n)));
      renders[n]();
    };
    buttons.forEach((b, i) => b.addEventListener('click', () => { clearInterval(auto); show(i); }));
    show(0);
    let n = 0;
    const auto = V.reduceMotion ? null : setInterval(() => { n = (n + 1) % 3; show(n); }, 6000);
    host.addEventListener('pointerenter', () => clearInterval(auto), { once: true });
  };
})();
