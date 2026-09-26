/* Case E: transaction-level gifts roll up into donor-level records, then reconcile (synthetic). */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});

  V['donor-rollup'] = function (host) {
    const W = 720, H = 320;
    const svg = V.svg(host, W, H, 'Animated diagram (synthetic): 60 gift transactions merge into 12 donor records sized by number of gifts, followed by a reconciliation check.');
    const tip = V.tooltip(host);
    const rand = V.rng(11);
    const DONORS = 12, GIFTS = 60;

    V.text(svg, 40, 24, 'GIFT TRANSACTIONS', 'svg-mono');
    V.text(svg, 470, 24, 'DONOR-LEVEL RECORDS', 'svg-mono');
    V.el('line', { x1: 300, x2: 420, y1: H / 2, y2: H / 2, stroke: 'var(--line-strong)', 'stroke-dasharray': '3 5' }, svg);
    V.text(svg, 360, H / 2 - 10, 'rules → rollup', 'svg-mono', { 'text-anchor': 'middle' });

    const counts = new Array(DONORS).fill(0);
    const gifts = [];
    for (let i = 0; i < GIFTS; i++) {
      const d = Math.min(DONORS - 1, Math.floor(Math.pow(rand(), 1.8) * DONORS));
      counts[d]++;
      gifts.push({ d, x: 40 + rand() * 220, y: 44 + rand() * (H - 70) });
    }
    const donors = counts.map((c, i) => ({
      c, x: 500 + (i % 3) * 70, y: 60 + Math.floor(i / 3) * 62, r: 5 + Math.sqrt(c) * 4
    }));

    const donorEls = donors.map((d, i) => {
      const role = i < 3 ? 'var(--s1)' : i < 7 ? 'var(--s3)' : 'var(--s5)';
      const c = V.el('circle', { cx: d.x, cy: d.y, r: 0, fill: role }, svg);
      V.hover(c, tip, `<b>Donor ${String(i + 1).padStart(2, '0')}</b>${d.c} gift${d.c === 1 ? '' : 's'} rolled up<br>recency · frequency · value derived`);
      return c;
    });
    const giftEls = gifts.map((g) => V.el('circle', { cx: g.x, cy: g.y, r: 3, fill: 'var(--muted)', 'pointer-events': 'none' }, svg));
    const check = V.text(svg, 690, H - 18, '✓ Σ gifts = Σ donor totals', 'svg-label', { 'text-anchor': 'end', fill: 'var(--signal)', opacity: 0 });

    const run = () => {
      giftEls.forEach((el, i) => { el.setAttribute('cx', gifts[i].x); el.setAttribute('cy', gifts[i].y); el.setAttribute('opacity', 1); });
      donorEls.forEach((el) => el.setAttribute('r', 0));
      check.setAttribute('opacity', 0);
      setTimeout(() => V.tween(1600, (t) => {
        giftEls.forEach((el, i) => {
          const g = gifts[i], d = donors[g.d];
          const k = Math.min(1, Math.max(0, t * 1.4 - (i / GIFTS) * 0.4));
          el.setAttribute('cx', g.x + (d.x - g.x) * k);
          el.setAttribute('cy', g.y + (d.y - g.y) * k);
          el.setAttribute('opacity', 1 - k * 0.9);
        });
        donorEls.forEach((el, i) => el.setAttribute('r', donors[i].r * t));
      }, () => V.tween(500, (t) => check.setAttribute('opacity', t))), V.reduceMotion ? 0 : 500);
    };
    run();
    const btn = host.closest('.viz-card') && host.closest('.viz-card').querySelector('[data-replay]');
    if (btn) btn.addEventListener('click', run);
  };
})();
