/* Hero: raw records (noise) → segments (structure) → one decision.
   Canvas animation with a static end state under reduced motion. */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});

  V['hero-field'] = function (host) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const indicators = document.querySelectorAll('.phase-indicator [data-phase]');
    const rand = V.rng(7);

    let W = 0, H = 0, dpr = 1, particles = [], centers = [], decision = { x: 0, y: 0 };
    let colors = {};
    const SEG_LABELS = ['Loyal core', 'Easiest win', 'Emerging', 'Nurture', 'Long-term'];

    const readColors = () => {
      colors = {
        seg: ['--s1', '--s2', '--s3', '--s5', '--s4'].map(V.css),
        muted: V.css('--muted'),
        text: V.css('--text-2'),
        decision: V.css('--decision'),
        line: V.css('--line-strong')
      };
    };

    const layout = () => {
      const r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const wide = W > 900;
      const x0 = wide ? W * 0.5 : W * 0.08;
      const x1 = wide ? W * 0.96 : W * 0.92;
      const y0 = H * 0.16, y1 = H * 0.86;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const rx = (x1 - x0) * 0.36, ry = (y1 - y0) * 0.34;
      centers = SEG_LABELS.map((label, i) => {
        const a = -Math.PI / 2 + (i / SEG_LABELS.length) * Math.PI * 2 + 0.3;
        return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, label, i };
      });
      decision = { x: cx, y: cy };

      const count = Math.round(Math.min(520, Math.max(180, (W * H) / 2600)));
      const sizes = [0.28, 0.22, 0.2, 0.18, 0.12];
      particles = [];
      for (let i = 0; i < count; i++) {
        const u = rand();
        let seg = 0, acc = 0;
        for (let s = 0; s < sizes.length; s++) { acc += sizes[s]; if (u <= acc) { seg = s; break; } }
        const c = centers[seg];
        const ang = rand() * Math.PI * 2;
        const rad = Math.sqrt(rand()) * Math.min(W, H) * (0.05 + sizes[seg] * 0.18);
        particles.push({
          seg,
          nx: x0 + rand() * (x1 - x0), ny: y0 + rand() * (y1 - y0),
          sx: c.x + Math.cos(ang) * rad, sy: c.y + Math.sin(ang) * rad * 0.8,
          x: 0, y: 0,
          ph: rand() * Math.PI * 2,
          r: 1.2 + rand() * 1.6
        });
      }
      particles.forEach((p) => { p.x = p.nx; p.y = p.ny; });
    };

    // timeline (ms)
    const T = { noise: 2600, toSeg: 1800, seg: 2200, toDec: 1200, dec: 3000, back: 1600 };
    const TOTAL = Object.values(T).reduce((a, b) => a + b, 0);
    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const lerp = (a, b, t) => a + (b - a) * t;

    const setPhase = (n) => indicators.forEach((el) => el.classList.toggle('on', Number(el.dataset.phase) <= n));

    const draw = (t, staticEnd) => {
      ctx.clearRect(0, 0, W, H);
      let m = staticEnd ? T.noise + T.toSeg + T.seg + T.toDec + 10 : t % TOTAL;
      let segT = 0, decT = 0, phase = 0;
      if (m < T.noise) { segT = 0; phase = 0; }
      else if ((m -= T.noise) < T.toSeg) { segT = ease(m / T.toSeg); phase = segT > 0.5 ? 1 : 0; }
      else if ((m -= T.toSeg) < T.seg) { segT = 1; phase = 1; }
      else if ((m -= T.seg) < T.toDec) { segT = 1; decT = ease(m / T.toDec); phase = 2; }
      else if ((m -= T.toDec) < T.dec) { segT = 1; decT = 1; phase = 2; }
      else { m -= T.dec; const b = ease(Math.min(1, m / T.back)); segT = 1 - b; decT = 1 - b; phase = b > 0.5 ? 0 : 2; }
      if (staticEnd) { segT = 1; decT = 1; phase = 2; }
      setPhase(phase);

      const time = t / 1000;
      // links from segments to the decision node
      if (decT > 0.01) {
        centers.forEach((c, i) => {
          const hot = i === 1;
          ctx.strokeStyle = hot ? colors.decision : colors.line;
          ctx.globalAlpha = decT * (hot ? 0.9 : 0.5);
          ctx.lineWidth = hot ? 1.6 : 1;
          ctx.setLineDash(hot ? [] : [3, 5]);
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(lerp(c.x, decision.x, decT), lerp(c.y, decision.y, decT));
          ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      // particles
      particles.forEach((p) => {
        const jx = Math.sin(time * 0.9 + p.ph) * (1 - segT) * 6;
        const jy = Math.cos(time * 0.7 + p.ph) * (1 - segT) * 6;
        const wob = Math.sin(time * 1.3 + p.ph) * 1.2 * segT;
        p.x = lerp(p.nx, p.sx, segT) + jx + wob;
        p.y = lerp(p.ny, p.sy, segT) + jy;
        ctx.globalAlpha = 0.35 + 0.55 * segT;
        if (decT > 0 && p.seg !== 1) ctx.globalAlpha *= 1 - decT * 0.45;
        ctx.fillStyle = segT > 0.05 ? colors.seg[p.seg] : colors.muted;
        if (segT > 0.05 && segT < 1) {
          // blend: draw muted then coloured with segT alpha
          ctx.fillStyle = colors.muted;
          ctx.globalAlpha = 0.35 * (1 - segT);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = colors.seg[p.seg];
          ctx.globalAlpha = 0.9 * segT;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // segment labels
      if (segT > 0.6 && W > 900) {
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        centers.forEach((c, i) => {
          ctx.globalAlpha = Math.min(1, (segT - 0.6) / 0.4) * (decT > 0 && i !== 1 ? 1 - decT * 0.5 : 1);
          ctx.fillStyle = colors.text;
          const off = c.y < decision.y ? -Math.min(W, H) * 0.12 : Math.min(W, H) * 0.12;
          ctx.fillText(c.label.toUpperCase(), c.x, c.y + off);
        });
        ctx.globalAlpha = 1;
      }

      // decision node
      if (decT > 0.01) {
        const pulse = 1 + Math.sin(time * 3) * 0.08;
        ctx.globalAlpha = decT;
        ctx.fillStyle = colors.decision;
        ctx.beginPath(); ctx.arc(decision.x, decision.y, 9 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = decT * 0.25;
        ctx.beginPath(); ctx.arc(decision.x, decision.y, 22 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = decT;
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = colors.decision;
        if (W > 900) ctx.fillText('DECISION', decision.x, decision.y + 42);
        ctx.font = '400 12px Inter, sans-serif';
        ctx.fillStyle = colors.text;
        if (W > 900) ctx.fillText('Prioritize the easiest win', decision.x, decision.y + 60);
        ctx.globalAlpha = 1;
      }
    };

    readColors();
    layout();

    if (V.reduceMotion) {
      draw(0, true);
      window.addEventListener('resize', () => { layout(); draw(0, true); });
      V.onTheme(() => { readColors(); draw(0, true); });
      return;
    }

    let running = true, start = performance.now(), raf = 0;
    const loop = (now) => { draw(now - start, false); if (running) raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    const setRunning = (on) => {
      if (on && !running) { running = true; raf = requestAnimationFrame(loop); }
      if (!on && running) { running = false; cancelAnimationFrame(raf); }
    };
    new IntersectionObserver((es) => setRunning(es[0].isIntersecting)).observe(host);
    document.addEventListener('visibilitychange', () => setRunning(!document.hidden));
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
    V.onTheme(readColors);
  };
})();
