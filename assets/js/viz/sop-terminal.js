/* Live workflow: business request → SOP → clarification → execution → validation → documented output.
   A Markdown SOP writes itself step by step with a human-approval gate. */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});

  const STEPS = [
    { label: 'Analyze existing work', lines: [
      ['c-h', '# SOP: Donor-level profile build'],
      ['c-m', '<!-- reverse-engineered from a completed, validated project -->'],
      ['', '## 1. Context'],
      ['', 'Request: turn transaction-level gifts into donor profiles for segmentation.']
    ]},
    { label: 'Generate SOP', lines: [
      ['', '## 2. Method'],
      ['', '- Apply population rules BEFORE rollup'],
      ['', '- Aggregate gifts by <span class="c-k">unique_donor_id</span>'],
      ['', '- Derive recency · frequency · value · category'],
      ['', '- Exclude non-analytical fields']
    ]},
    { label: 'Identify missing inputs', lines: [
      ['', '## 3. Open questions'],
      ['c-q', '? Which date window defines an "active" donor?'],
      ['c-q', '? Are pledges counted as gifts?']
    ]},
    { label: 'Update source of truth', lines: [
      ['', '## 4. Decisions (source of truth)'],
      ['c-ok', '✓ Confirmed: rolling window agreed with stakeholder'],
      ['c-ok', '✓ Confirmed: pledges excluded until paid']
    ]},
    { label: 'Execute step by step', lines: [
      ['c-m', '$ run step 4.1 rollup --dry-run'],
      ['', 'rows in → donors out   <span class="c-m">[synthetic demo]</span>'],
      ['c-m', '$ run step 4.2 profile-variables']
    ]},
    { label: 'Human validation', human: true, lines: [
      ['', '## 5. Validation'],
      ['', '- Recreate distribution independently in Excel / Power BI'],
      ['c-warn', '! Totals must reconcile before anything is trusted'],
      ['approval', '']
    ]},
    { label: 'Document outputs', lines: [
      ['', '## 6. Outputs'],
      ['c-ok', '✓ Reconciled donor base · ✓ SOP v1.0 committed'],
      ['c-m', '→ Reusable by the next analyst, not locked in chat history']
    ]}
  ];

  V['sop-terminal'] = function (host) {
    const stepsEl = host.querySelector('.term-steps');
    const code = host.querySelector('.term-code');
    const replay = host.querySelector('.term-replay');
    stepsEl.innerHTML = STEPS.map((s, i) =>
      `<li class="${s.human ? 'human' : ''}"><span class="idx">${s.human ? '◆' : i + 1}</span><span class="label">${s.label}</span></li>`
    ).join('');
    const items = stepsEl.querySelectorAll('li');
    let timer = null, token = 0;

    const lineHTML = ([cls, html]) => {
      if (cls === 'approval') return '<span class="approval" data-approval>◆ Human approval required: reviewer checks reconciliation</span>';
      return cls ? `<span class="${cls}">${html}</span>` : html;
    };

    const renderAll = () => {
      items.forEach((li) => { li.classList.add('done'); li.classList.remove('active'); });
      code.innerHTML = STEPS.map((s) => s.lines.map(lineHTML).join('\n')).join('\n\n')
        .replace('<span class="approval" data-approval>◆ Human approval required: reviewer checks reconciliation</span>',
          '<span class="approval ok">✓ Approved by reviewer: totals reconcile</span>');
    };

    const sleep = (ms, my) => new Promise((res) => { timer = setTimeout(() => res(my === token), ms); });

    const typeInto = async (target, html, my) => {
      // type visible characters, keep tags intact
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const full = tmp.textContent;
      const span = document.createElement('span');
      target.appendChild(span);
      for (let i = 1; i <= full.length; i += 2) {
        if (my !== token) return false;
        span.textContent = full.slice(0, i);
        code.scrollTop = code.scrollHeight;
        await sleep(12, my);
      }
      span.outerHTML = html;
      return true;
    };

    const play = async () => {
      const my = ++token;
      clearTimeout(timer);
      code.innerHTML = '';
      items.forEach((li) => li.classList.remove('done', 'active'));
      const caret = document.createElement('span'); caret.className = 'caret';
      for (let i = 0; i < STEPS.length; i++) {
        items.forEach((li, j) => { li.classList.toggle('active', j === i); if (j < i) li.classList.add('done'); });
        caret.remove();
        if (i > 0) code.insertAdjacentText('beforeend', '\n\n');
        for (let k = 0; k < STEPS[i].lines.length; k++) {
          const line = STEPS[i].lines[k];
          caret.remove();
          if (k > 0) code.insertAdjacentText('beforeend', '\n');
          if (line[0] === 'approval') {
            code.insertAdjacentHTML('beforeend', lineHTML(line));
            const badge = code.querySelector('[data-approval]');
            if (!(await sleep(2200, my))) return;
            code.scrollTop = code.scrollHeight;
            badge.classList.add('ok');
            badge.textContent = '✓ Approved by reviewer: totals reconcile';
            if (!(await sleep(700, my))) return;
          } else {
            if (!(await typeInto(code, lineHTML(line), my))) return;
            code.appendChild(caret);
          }
        }
        if (!(await sleep(650, my))) return;
        caret.remove();
      }
      items.forEach((li) => { li.classList.remove('active'); li.classList.add('done'); });
      if (!(await sleep(6000, my))) return;
      play();
    };

    if (replay) replay.addEventListener('click', () => (V.reduceMotion ? renderAll() : play()));

    if (V.reduceMotion) { renderAll(); return; }
    // pause when off-screen
    let started = false;
    new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !started) { started = true; play(); }
      else if (!es[0].isIntersecting && started) { started = false; token++; clearTimeout(timer); renderAll(); }
    }, { threshold: 0.25 }).observe(host);
  };
})();
