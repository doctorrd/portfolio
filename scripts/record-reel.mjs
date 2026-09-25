/**
 * Records a ~60 s portfolio reel (hero → questions → work → AI workflow → method → drill-down → contact).
 *
 * Usage:
 *   python3 -m http.server 8123            # from the repo root, in another terminal
 *   node scripts/record-reel.mjs [baseUrl] [outDir]
 *   ffmpeg -i <outDir>/<file>.webm -c:v libx264 -pix_fmt yuv420p -crf 22 -movflags +faststart assets/media/portfolio-reel.mp4
 *
 * Requires Playwright (npm i -D playwright). Pass PLAYWRIGHT_MODULE to point at a global install if needed.
 */
const mod = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = await import(mod);

const base = process.argv[2] || 'http://localhost:8123/';
const outDir = process.argv[3] || 'reel-out';
const size = { width: 1280, height: 720 };

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: size,
  colorScheme: 'dark',
  ignoreHTTPSErrors: true,
  recordVideo: { dir: outDir, size }
});
const page = await context.newPage();

const glide = async (selector, ms = 1400, offset = 80) => {
  await page.evaluate(async ({ selector, ms, offset }) => {
    const el = document.querySelector(selector);
    const target = el.getBoundingClientRect().top + window.scrollY - offset;
    const start = window.scrollY; const t0 = performance.now();
    await new Promise((res) => {
      const step = (t) => {
        const p = Math.min(1, (t - t0) / ms);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        window.scrollTo(0, start + (target - start) * e);
        p < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
  }, { selector, ms, offset });
};
const hold = (ms) => page.waitForTimeout(ms);

await page.goto(base + 'index.html', { waitUntil: 'networkidle' });
await hold(9500);                                   // hero: noise → segments → decision
await glide('.proof'); await hold(2200);
await glide('#questions', 1600, 60); await hold(2500);
await page.hover('.q-card:nth-child(1)'); await hold(1200);
await glide('#work', 1600, 60); await hold(3000);
await glide('#ai .terminal', 1600, 100); await hold(15000);   // live SOP workflow incl. human approval
await glide('#ai .ai-row', 1200, 100); await hold(1200);
await page.fill('#effortRange', '2'); await page.dispatchEvent('#effortRange', 'input'); await hold(1800);
await glide('#method', 1600, 60); await hold(1200);
for (const i of [3, 6, 7]) { await page.click(`#ms-${i}`); await hold(1100); }
await glide('#method .qc-layout', 1400, 100); await hold(3500);

await page.goto(base + 'work/geographic-recruitment.html', { waitUntil: 'networkidle' });
await hold(2000);
await glide('[data-viz="hex-drill"]', 1600, 200); await hold(2500);
await page.click('[data-viz="hex-drill"] .seg-btn:nth-child(2)'); await hold(2600);
await page.click('[data-viz="hex-drill"] .seg-btn:nth-child(3)'); await hold(3000);

await page.goto(base + 'index.html#contact', { waitUntil: 'networkidle' });
await hold(3500);

const video = page.video();
await context.close();
console.log('Saved:', await video.path());
await browser.close();
