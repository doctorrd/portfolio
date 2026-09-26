/* Manual vs AI-assisted effort model.
   Indexed and illustrative: the only claim is an ESTIMATED 60–80% reduction on repetitive tasks. */
(function () {
  const V = (window.PortfolioViz = window.PortfolioViz || {});

  const TASKS = [
    { name: 'Power BI template & visual updates',
      ai: 'Applies documented label, title and layout changes across visuals from a written instruction set.',
      human: 'Checks every changed visual against the source-of-truth spec before release.' },
    { name: 'Bilingual label maintenance',
      ai: 'Drafts translated field bindings and dynamic-measure patterns, keeping English as the baseline.',
      human: 'Reviews terminology and confirms language switching behaves the same in both versions.' },
    { name: 'SOP drafting',
      ai: 'Reverse-engineers a completed project into a Markdown SOP and lists missing inputs.',
      human: 'Confirms decisions, removes debug history and approves the SOP as source of truth.' },
    { name: 'Data-review outputs',
      ai: 'Generates profiling and distribution outputs in VS Code from a defined review workflow.',
      human: 'Recreates key distributions independently in Excel before anything is relied on.' },
    { name: 'Persona drafting',
      ai: 'Drafts persona summaries from structured prompts with metric rules and differentiation checks.',
      human: 'Validates every figure against the data and edits for client context and tone.' }
  ];

  V['effort-slider'] = function (host) {
    host.innerHTML = `
      <div class="effort">
        <div>
          <label class="mono" for="effortRange" style="color:var(--muted)">Task type</label>
          <input class="effort-range" id="effortRange" type="range" min="0" max="${TASKS.length - 1}" step="1" value="0" aria-valuetext="${TASKS[0].name}">
          <div class="effort-stops">${TASKS.map((t, i) => `<span data-i="${i}">${t.name.replace(' & ', ' &amp; ')}</span>`).join('')}</div>
        </div>
        <div class="effort-bars">
          <div class="effort-row">
            <div class="lbl"><span>Manual workflow</span><span class="mono">Index 100</span></div>
            <div class="effort-track">
              <div class="effort-seg" style="width:72%;background:var(--muted)">Build &amp; edit</div>
              <div class="effort-seg" style="width:28%;background:var(--line-strong);color:var(--text)">Check</div>
            </div>
          </div>
          <div class="effort-row">
            <div class="lbl"><span>AI-assisted, governed workflow</span><span class="mono decision-text">Est. index 20–40</span></div>
            <div class="effort-track" data-ai>
              <div class="effort-seg" data-seg="0" style="width:0;background:var(--s3)" title="Prompt + SOP"></div>
              <div class="effort-seg" data-seg="1" style="width:0;background:var(--s1)" title="AI executes"></div>
              <div class="effort-seg" data-seg="2" style="width:0;background:var(--s2)" title="Human validation"></div>
              <div class="effort-band" style="left:20%;width:0"></div>
            </div>
            <div class="legend" style="margin-top:10px">
              <span><i style="background:var(--s3)"></i>Prompt + SOP</span>
              <span><i style="background:var(--s1)"></i>AI executes</span>
              <span><i style="background:var(--s2)"></i>Human validation</span>
              <span><i style="background:repeating-linear-gradient(135deg,var(--decision) 0 2px,transparent 2px 4px)"></i>Estimate range</span>
            </div>
          </div>
        </div>
        <div class="effort-detail">
          <div><b>What AI does</b><p data-ai-text></p></div>
          <div><b>What stays human</b><p data-human-text></p></div>
        </div>
        <p class="method-note"><strong>Method note:</strong> an owner estimate of an <strong>estimated 60–80% reduction in time on repetitive tasks</strong>, based on doing the same kinds of task before and after adopting the workflow. It is not a time study and does not apply to whole projects. Bars are an illustrative index. Validation time is never cut.</p>
      </div>`;

    const range = host.querySelector('#effortRange');
    const stops = host.querySelectorAll('.effort-stops span');
    const segs = host.querySelectorAll('[data-ai] .effort-seg');
    const band = host.querySelector('.effort-band');
    const aiText = host.querySelector('[data-ai-text]');
    const humanText = host.querySelector('[data-human-text]');
    let grown = false;

    const set = (i) => {
      const t = TASKS[i];
      range.value = i;
      range.setAttribute('aria-valuetext', t.name);
      stops.forEach((s, j) => s.classList.toggle('on', i === j));
      aiText.textContent = t.ai;
      humanText.textContent = t.human;
      if (!grown) {
        grown = true;
        // midpoint of the estimate (30) split into its stages; validation kept visible
        const widths = [7, 11, 12];
        requestAnimationFrame(() => {
          segs.forEach((s, j) => { s.style.width = widths[j] + '%'; });
          band.style.width = '20%';
        });
      }
    };

    range.addEventListener('input', () => set(Number(range.value)));
    stops.forEach((s) => s.addEventListener('click', () => set(Number(s.dataset.i))));
    set(0);
  };
})();
