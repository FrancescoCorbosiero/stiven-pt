# Stiven Cordonez — Personal Trainer · new site

A production-ready rebuild of the website in the repository root. The root files are the **spec** and are left untouched; everything new lives in `site/`.

- **Publish `site/public/`** as-is to any static host. There is no framework, no build step and no runtime dependency. It's three hand-written files (`index.html`, `assets/css/main.css`, `assets/js/main.js`) plus fonts and images.
- **`site/tools/`** contains the scripts that generate the images and icons from the original photos in `media/`. You only need them when photos or branding change.

```
site/
├── public/                  ← deploy this folder
│   ├── index.html           one page, 8 sections, Italian copy
│   ├── privacy.html  404.html
│   ├── assets/css/main.css  design system + all styles (cascade layers)
│   ├── assets/js/main.js    interactions (ES module, ~380 lines, no deps)
│   ├── assets/fonts/        self-hosted woff2 (OFL) — see LICENSES.md
│   ├── assets/img/          AVIF + WebP, several widths, metadata stripped
│   ├── og-image.jpg  favicon.svg  favicon.ico  *.png  site.webmanifest
│   ├── robots.txt  sitemap.xml
│   └── .htaccess  _headers  caching, compression, security headers (Apache / Netlify + Cloudflare Pages)
└── tools/
    ├── build_images.py      crops, grades and exports every photo
    └── render_assets.mjs    share image, app icons, favicon.ico
```

## Run it locally

```bash
python3 -m http.server 8080 -d site/public
```

Then open http://localhost:8080.

## Design system

| | |
|---|---|
| **Concept** | "Iron & fire, refined": the spec's dark, aggressive identity, turned into an editorial campaign look. |
| **Colour** | Warm near-black inks (`--ink-0…3`), warm off-white text (`--bone`, `--bone-2`, `--bone-3`, all WCAG AA on every ink), one accent `--fire #ff4d1a`. Text on fire is always ink (5.9:1). |
| **Type** | Big Shoulders Display (condensed, industrial) for headlines · Inter for text · Geist Mono for labels. All self-hosted, Latin subset, ~93 KB total. |
| **Motif** | One bevelled corner (`--cut`), carried through buttons, image frames, cards, the logo mark and the favicon. |
| **Photography** | Every photo of Stiven gets the same warm-monochrome grade (`tools/build_images.py`), so phone shots from different years read as one shoot and the orange accent stays the only colour. |
| **Motion** | Masked headline rise, staged fades, scroll reveals, marquee, timeline progress, slider nudge. Everything is disabled under `prefers-reduced-motion`, and content stays fully visible without JavaScript. |

## Features

- **Before/after slider.** The 2019 and today photos are cropped so head size and position match, which keeps the comparison fair. It works with mouse, touch (vertical scrolling still works) and keyboard.
- **"Inizia da qui" quiz.** Four questions open WhatsApp (or email) with a pre-filled message, so leads arrive pre-qualified. No backend, and nothing leaves the browser until the visitor sends it. Mouse clicks auto-advance; keyboard users choose with the arrow keys and confirm with Enter or "Avanti".
- **Journey timeline.** A progress line fills as you scroll and lights each step.
- **Certificate.** The real Invictus Academy certificate opens in a native `<dialog>`.
- **Mobile.** A full-screen menu (rest of the page made `inert`, closes with Esc) and a sticky WhatsApp CTA that hides wherever another CTA is on screen.
- **SEO.** JSON-LD (`Person` + `LocalBusiness` + `WebSite`), a designed share image, a sitemap, and no fake ratings.

## Quality (measured)

| Check | Result |
|---|---|
| Lighthouse, mobile (production-like headers: Brotli, caching, CSP) | Performance **99** · Accessibility **100** · Best practices **100** · SEO **100** — LCP 2.0 s, CLS 0, TBT 0 ms |
| Lighthouse, desktop | **100 · 100 · 100 · 100** — LCP 0.4 s |
| Page weight (first load, mobile) | **~198 KB** total. HTML + CSS + JS are ~23 KB with Brotli. The original site was 9.2 MB and showed a black loader for ~40 s on the same throttled mobile profile. |
| Accessibility | axe-core WCAG 2.2 AA + best practices: **0 violations** on all pages, desktop and mobile, including the quiz's dynamic summary |
| Content-Security-Policy | Strict same-origin policy, **0 violations** with every feature exercised |
| Interactions | 29 automated browser checks pass (header, menu, reveals, counters, timeline, slider by mouse/touch/keyboard, quiz by mouse/keyboard, FAQ, dialog, sticky CTA, active nav) |
| Third-party requests | **None.** No CDNs, no Google Fonts, no trackers, no cookies. |

## Publishing

- **Netlify / Cloudflare Pages**: set the publish directory to `site/public`. `_headers` is picked up automatically.
- **Apache / shared hosting**: upload the contents of `site/public` (including the hidden `.htaccess`).
- **Domain**: canonical URLs, share tags, JSON-LD and the sitemap use `https://stivenpt.com/`. Search-and-replace it if the domain is different. `404.html` uses root-absolute paths, so the site expects to live at the domain root.
- **Content-Security-Policy**: the CSP in `.htaccess` / `_headers` allows only same-origin resources plus the SHA-256 of the small inline script in `index.html`. If you edit that script, update the hash (the command is in the header comment of both files). Adding third-party scripts such as analytics also means updating the CSP, and under Italian rules it means adding a consent banner.

## Regenerating assets

```bash
pip install "pillow>=11"               # needs AVIF support
python3 site/tools/build_images.py     # all photos → site/public/assets/img

npm i -D playwright                    # once
node site/tools/render_assets.mjs      # og-image.jpg, icons, favicon.ico
```

## Re-skinning for another trainer

1. **Brand.** Change the colour tokens at the top of `main.css`. Fonts and the `--cut` motif are tokens too.
2. **Photos.** Replace the files in `media/`, adjust crop boxes in `tools/build_images.py`, and run both tools.
3. **Copy and contacts.** Update the copy in `index.html`, the contact constants at the top of `main.js` (`WHATSAPP`, `EMAIL`), the JSON-LD, the meta tags and `privacy.html`.

## To confirm with Stiven before going live

- **"Nel 2019 ero così"**: the year comes from the photo's metadata (before: Nov 2019, after: Jan 2025).
- **"Livello 3"**: kept from the spec; confirm what it refers to. The certificate shown is the Invictus Academy qualification of 7 Sept 2024.
- **Spec figures**: "100+ clienti seguiti", "4+ anni nel fitness" and the hours (Mon–Sat 6:00–22:00) are carried over from the spec.
- **Barbell photo**: `media/hero.jpg` is a stock photo used as a background. Check its licence.
- **`privacy.html`**: written to match exactly what this site does (no cookies, no tracking, no forms). Have it reviewed before publishing.
