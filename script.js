/* =========================================================
   Site configuration — edit these values only.
   ========================================================= */
const SITE_CONFIG = {
  name: 'Dharmdeepsinh Gohil',
  email: 'connect.dharmdeepsinh.gohil@gmail.com',
  linkedin: 'https://www.linkedin.com/in/dharmdeepsinh',
  emailSubject: 'Project enquiry via portfolio'
};

(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- contact wiring ---------- */
  document.querySelectorAll('[data-email]').forEach((el) => {
    const subject = el.getAttribute('data-subject') || SITE_CONFIG.emailSubject;
    el.setAttribute('href', `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(subject)}`);
    if (el.hasAttribute('data-email-text')) el.textContent = SITE_CONFIG.email;
  });
  document.querySelectorAll('[data-linkedin]').forEach((el) => {
    el.setAttribute('href', SITE_CONFIG.linkedin);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- theme toggle ---------- */
  const toggle = document.getElementById('themeToggle');
  const effectiveTheme = () => {
    const set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };
  if (toggle) {
    const sync = () => toggle.setAttribute('aria-label', effectiveTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    sync();
    toggle.addEventListener('click', () => {
      const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      sync();
      window.dispatchEvent(new CustomEvent('themechange'));
    });
  }

  /* ---------- nav ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
    if (window.scrollY < 300) document.querySelectorAll('.nav-links a.active').forEach((a) => a.classList.remove('active'));
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // active section highlight
  const linkMap = new Map();
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => linkMap.set(a.getAttribute('href').slice(1), a));
  if (linkMap.size && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          linkMap.forEach((a) => a.classList.remove('active'));
          const a = linkMap.get(e.target.id);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    linkMap.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- count-up numbers ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCount = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.firstChild.nodeValue = target + suffix; return; }
    const dur = 1400; const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- pointer glow on question cards ---------- */
  document.querySelectorAll('.q-card').forEach((card) => {
    card.addEventListener('pointermove', (ev) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${ev.clientX - r.left}px`);
      card.style.setProperty('--my', `${ev.clientY - r.top}px`);
    });
  });

  /* ---------- method rail ---------- */
  const rail = document.querySelector('.method-rail');
  if (rail) {
    const data = JSON.parse(document.getElementById('method-data').textContent);
    const panel = document.getElementById('methodPanel');
    const steps = rail.querySelectorAll('.method-step');
    const render = (i) => {
      const d = data[i];
      steps.forEach((s, j) => {
        s.setAttribute('aria-selected', String(i === j));
        s.setAttribute('tabindex', i === j ? '0' : '-1');
      });
      panel.innerHTML = `
        <div>
          <span class="phase-tag">Step ${String(i + 1).padStart(2, '0')} · ${d.phase}</span>
          <h3>${d.title}</h3>
          <p>${d.body}</p>
        </div>
        <div>
          <p class="out">What it produces</p>
          <ul>${d.outputs.map((o) => `<li>${o}</li>`).join('')}</ul>
        </div>`;
      panel.setAttribute('aria-labelledby', steps[i].id);
    };
    steps.forEach((s, i) => {
      s.addEventListener('click', () => render(i));
      s.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + steps.length) % steps.length;
          render(n); steps[n].focus();
        }
      });
    });
    render(0);
  }

  /* ---------- visualisations: init when near viewport ---------- */
  const vizEls = document.querySelectorAll('[data-viz]');
  const initViz = (el) => {
    if (el.__vizInit) return;
    const fn = window.PortfolioViz && window.PortfolioViz[el.getAttribute('data-viz')];
    if (typeof fn === 'function') { el.__vizInit = true; fn(el); }
  };
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { initViz(e.target); vio.unobserve(e.target); } });
    }, { rootMargin: '200px 0px' });
    vizEls.forEach((el) => vio.observe(el));
  } else {
    vizEls.forEach(initViz);
  }
})();
