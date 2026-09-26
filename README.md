# Dharmdeepsinh Gohil: Portfolio

A static portfolio site (HTML, CSS and vanilla JS, with no build step) for an **AI Strategy & Insights Consultant**. It is ready for GitHub Pages.

Design concept: **"Signal from Noise"**. Each visual moves from scattered data to structure and then to a decision.

## Structure

```
index.html                 Home: hero, questions, work, method, AI ops, capabilities,
                           sectors, career, services, evidence standard, notes, about, contact
work/*.html                Five anonymized case studies (B, A, C, D, E)
styles.css                 Design tokens (dark + light), layout and components
script.js                  SITE_CONFIG, theme, nav, reveals, count-ups, method rail, viz loader
assets/js/viz/*.js         One file per visual (synthetic data only)
assets/img/og.png          Social share image (1200×630)
assets/media/              Portfolio reel (MP4 + poster) for LinkedIn Featured
scripts/record-reel.mjs    Playwright script that records the reel
scripts/claim-audit.sh     Fails if internal-only figures or removed content appear
404.html, robots.txt, sitemap.xml
```

## Before going live: edit these

1. **Contact:** `email` and `linkedin` live in `SITE_CONFIG` at the top of `script.js`. Every "Email me" and LinkedIn link on every page reads from it.
2. **Headshot:** the About section shows an SVG emblem for now. To use a photo, add `assets/img/headshot.jpg` and swap the emblem for the `<img>` tag given in the comment there.
3. **Domain:** the site is currently served at `https://doctorrd.github.io/portfolio/`. To move to a custom domain: buy it, point DNS at GitHub Pages, add a `CNAME` file with the domain, and search-and-replace `https://doctorrd.github.io/portfolio` with the new URL.
4. **Field notes:** the three essay cards say "Coming soon". Link them once the articles are written.

## Content rules (from Master Career Report v0.5)

- Use only the **public wording** from the claim register (Appendix B): "nearly 6,000 labels", "100+ locations", "10,000+ prospects", "3,000+ donors", "~85% checkpoint" and so on.
- "Estimated 60–80%" always appears with its scope (repetitive tasks) and the method note.
- Targets (automated report production, Python data review) appear only as **Roadmap**.
- Never publish client names, gift values or exact counts that could identify a client. All charts use synthetic data.

Run the audit before every push:

```bash
./scripts/claim-audit.sh
```

## Local preview

```bash
python3 -m http.server 8123
# open http://localhost:8123
```

## Re-recording the reel

```bash
python3 -m http.server 8123 &
npm i -D playwright            # or set PLAYWRIGHT_MODULE to a global install
node scripts/record-reel.mjs http://localhost:8123/ reel-out
ffmpeg -i reel-out/*.webm -c:v libx264 -pix_fmt yuv420p -crf 23 -movflags +faststart -an assets/media/portfolio-reel.mp4
```

## Accessibility and performance

- Respects `prefers-reduced-motion`: every animation has a static end state.
- Light and dark themes follow the OS setting, and the toggle overrides it. The chart palette was checked for colour-vision deficiency and contrast in both themes.
- Charts have hover or focus tooltips, legends and a "View as table" option where the data is tabular.
- No frameworks or chart libraries. Fonts come from Google Fonts.
