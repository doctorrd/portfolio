/* Case A: why source-aware keys matter. Three states: collision → source-aware key → entity hierarchy. */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});

  V['entity-key'] = function (host) {
    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Diagram stage');
    const labels = ['1 · The collision', '2 · Source-aware key', '3 · Person, household, address'];
    controls.innerHTML = labels.map((l, i) => `<button class="seg-btn" type="button" aria-pressed="${i === 0}">${l}</button>`).join('');
    host.appendChild(controls);
    const caption = document.createElement('p');
    caption.className = 'viz-sub';
    caption.style.margin = '14px 0 4px';
    host.appendChild(caption);

    const W = 720, H = 280;
    const svg = V.svg(host, W, H, 'Diagram: records from two source systems share an ID. Without source-aware keys they collide; with them they stay distinct and roll up into households and addresses.');

    const box = (g, x, y, w, h, stroke) => V.el('rect', { x, y, width: w, height: h, rx: 10, fill: 'var(--surface-2)', stroke: stroke || 'var(--line-strong)' }, g);
    // sources (always visible)
    const src = V.el('g', {}, svg);
    [['SOURCE SYSTEM A', 30], ['SOURCE SYSTEM B', 170]].forEach(([name, y]) => {
      box(src, 20, y, 190, 90);
      V.text(src, 36, y + 24, name, 'svg-mono');
      V.text(src, 36, y + 52, 'id: 1042', 'svg-label-strong', { style: 'font-family:var(--font-mono)' });
      V.text(src, 36, y + 72, y < 100 ? 'Person P · age band 35–44' : 'Person Q · age band 18–24', 'svg-label');
    });

    const stages = [V.el('g', {}, svg), V.el('g', {}, svg), V.el('g', {}, svg)];

    // Stage 1: collision
    const s1 = stages[0];
    V.el('path', { d: 'M210 75 C 300 75, 330 140, 400 140', fill: 'none', stroke: 'var(--risk)', 'stroke-width': 1.5 }, s1);
    V.el('path', { d: 'M210 215 C 300 215, 330 140, 400 140', fill: 'none', stroke: 'var(--risk)', 'stroke-width': 1.5 }, s1);
    box(s1, 400, 105, 180, 70, 'var(--risk)');
    V.text(s1, 416, 132, 'key: 1042', 'svg-label-strong', { style: 'font-family:var(--font-mono)' });
    V.text(s1, 416, 156, '✕ two people counted as one', 'svg-label', { fill: 'var(--risk)' });
    V.text(s1, 600, 145, 'Profiles distorted', 'svg-mono', { fill: 'var(--risk)' });

    // Stage 2: source-aware key
    const s2 = stages[1];
    V.el('path', { d: 'M210 75 H400', stroke: 'var(--s1)', 'stroke-width': 1.5 }, s2);
    V.el('path', { d: 'M210 215 H400', stroke: 'var(--s1)', 'stroke-width': 1.5 }, s2);
    box(s2, 400, 45, 190, 60, 'var(--s1)');
    box(s2, 400, 185, 190, 60, 'var(--s1)');
    V.text(s2, 416, 80, 'key: A·1042', 'svg-label-strong', { style: 'font-family:var(--font-mono)' });
    V.text(s2, 416, 220, 'key: B·1042', 'svg-label-strong', { style: 'font-family:var(--font-mono)' });
    V.text(s2, 495, 150, '✓ two distinct people', 'svg-label', { fill: 'var(--signal)', 'text-anchor': 'middle' });

    // Stage 3: hierarchy
    const s3 = stages[2];
    V.el('path', { d: 'M210 75 H300', stroke: 'var(--s1)', 'stroke-width': 1.5 }, s3);
    V.el('path', { d: 'M210 215 H300', stroke: 'var(--s1)', 'stroke-width': 1.5 }, s3);
    box(s3, 300, 50, 130, 50, 'var(--s1)'); V.text(s3, 314, 80, 'Individual A·1042', 'svg-label');
    box(s3, 300, 190, 130, 50, 'var(--s1)'); V.text(s3, 314, 220, 'Individual B·1042', 'svg-label');
    V.el('path', { d: 'M430 75 C 470 75, 470 140, 500 140 M430 215 C 470 215, 470 140, 500 140', fill: 'none', stroke: 'var(--s3)', 'stroke-width': 1.5 }, s3);
    box(s3, 500, 115, 100, 50, 'var(--s3)'); V.text(s3, 514, 145, 'Household', 'svg-label');
    V.el('path', { d: 'M600 140 H630', stroke: 'var(--s2)', 'stroke-width': 1.5 }, s3);
    box(s3, 630, 115, 80, 50, 'var(--s2)'); V.text(s3, 644, 145, 'Address', 'svg-label');

    const captions = [
      'The same ID in two systems belongs to two different people. Keyed on the ID alone, they merge and every profile built on them is wrong.',
      'Prefixing each ID with its source keeps both people distinct, and the logic can be applied consistently at national scale.',
      'Separating individuals, households and addresses means each question is answered at the right unit of analysis.'
    ];
    const buttons = controls.querySelectorAll('button');
    const show = (n) => {
      stages.forEach((g, i) => {
        g.style.transition = V.reduceMotion ? 'none' : 'opacity .45s';
        g.style.opacity = i === n ? 1 : 0;
        g.style.pointerEvents = i === n ? 'auto' : 'none';
      });
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === n)));
      caption.textContent = captions[n];
    };
    buttons.forEach((b, i) => b.addEventListener('click', () => { clearInterval(auto); show(i); }));
    show(0);
    let n = 0;
    const auto = V.reduceMotion ? null : setInterval(() => { n = (n + 1) % 3; show(n); }, 4200);
  };
})();
