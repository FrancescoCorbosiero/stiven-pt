// Renders the social share image and app icons with the site's own fonts and photos.
// Usage (from the repo root):  npm i -D playwright && node site/tools/render_assets.mjs
// Outputs into site/public: og-image.jpg, apple-touch-icon.png, icon-192.png, icon-512.png,
// icon-maskable-512.png, favicon.ico (PNG-in-ICO, 16/32/48).
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// CommonJS resolution so a local devDependency or a global install (NODE_PATH) both work.
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(here, '../public');
const asset = (p) => `file://${path.join(pub, p)}`;

const fonts = `
  @font-face { font-family: "Big Shoulders Display"; src: url("${asset('assets/fonts/big-shoulders-display-var.woff2')}"); font-weight: 100 900; }
  @font-face { font-family: "Inter"; src: url("${asset('assets/fonts/inter-var.woff2')}"); font-weight: 100 900; }
  @font-face { font-family: "Geist Mono"; src: url("${asset('assets/fonts/geist-mono-500.woff2')}"); font-weight: 500; }
  * { margin: 0; box-sizing: border-box; }
  body { background: transparent; }`;

const og = `<!doctype html><html><head><style>${fonts}
  .og { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #0b0a09; color: #f3efe8; font-family: Inter; }
  .og__photo { position: absolute; inset: 0 0 0 auto; width: 520px; height: 100%; object-fit: cover; object-position: 50% 14%; }
  .og__fade { position: absolute; inset: 0 0 0 auto; width: 520px; background: linear-gradient(90deg, #0b0a09 0%, rgb(11 10 9 / .55) 22%, rgb(11 10 9 / 0) 55%), linear-gradient(0deg, rgb(11 10 9 / .7) 0%, rgb(11 10 9 / 0) 35%); }
  .og__copy { position: absolute; left: 64px; top: 56px; bottom: 56px; display: flex; flex-direction: column; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 14px; }
  .mark { width: 46px; height: 46px; display: grid; place-items: center; padding-top: 3px; background: #ff4d1a; color: #0b0a09; font: 900 31px/1 "Big Shoulders Display"; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%); }
  .name { font: 800 25px/0.9 "Big Shoulders Display"; text-transform: uppercase; letter-spacing: .02em; }
  .role { margin-top: 6px; font: 500 11px/1 "Geist Mono"; letter-spacing: .22em; text-transform: uppercase; color: #969089; }
  h1 { font: 900 98px/0.86 "Big Shoulders Display"; text-transform: uppercase; letter-spacing: -.01em; }
  h1 span { display: block; } h1 .fire { color: #ff4d1a; }
  .meta { display: flex; gap: 28px; font: 500 14px/1 "Geist Mono"; letter-spacing: .14em; text-transform: uppercase; color: #c8c2b9; }
  .meta b { color: #ff4d1a; font-weight: 500; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: #ff4d1a; }
</style></head><body>
  <div class="og" id="shot">
    <img class="og__photo" src="${asset('assets/img/hero-960.webp')}" alt="">
    <div class="og__fade"></div>
    <div class="og__copy">
      <div class="logo"><span class="mark">S</span><div><div class="name">Stiven Cordonez</div><div class="role">Personal Trainer</div></div></div>
      <h1><span>Il momento giusto</span><span>non esiste.</span><span class="fire">Iniziamo subito.</span></h1>
      <div class="meta"><span><b>●</b> Milano &amp; online</span><span>Prima consulenza gratuita</span></div>
    </div>
    <div class="bar"></div>
  </div></body></html>`;

const icon = (size, glyphRatio) => `<!doctype html><html><head><style>${fonts}
  .i { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: #ff4d1a; color: #0b0a09;
       font: 900 ${Math.round(size * glyphRatio)}px/1 "Big Shoulders Display"; padding-top: ${Math.round(size * 0.04)}px; }
</style></head><body><div class="i" id="shot">S</div></body></html>`;

const favicon = (size) => `<!doctype html><html><head><style>${fonts}</style></head><body>
  <img id="shot" src="${asset('favicon.svg')}" width="${size}" height="${size}" style="display:block"></body></html>`;

/** Minimal PNG-in-ICO encoder (supported by every current browser). */
function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8); e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const tmp = await mkdtemp(path.join(tmpdir(), 'stiven-assets-'));
// Templates are written to disk and opened via file:// — an about:blank page (setContent)
// is not allowed to load the file:// fonts and photos the templates reference.
async function shoot(html, file, { type = 'png', quality, omitBackground = false } = {}) {
  const tpl = path.join(tmp, 'template.html');
  await writeFile(tpl, html);
  await page.goto(`file://${tpl}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('#shot');
  const buf = await el.screenshot({ type, quality, omitBackground });
  if (file) await writeFile(path.join(pub, file), buf);
  return buf;
}

await page.setViewportSize({ width: 1200, height: 630 });
await shoot(og, 'og-image.jpg', { type: 'jpeg', quality: 86 });
await page.setViewportSize({ width: 600, height: 600 });
await shoot(icon(180, 0.66), 'apple-touch-icon.png');
await shoot(icon(192, 0.66), 'icon-192.png');
await shoot(icon(512, 0.66), 'icon-512.png');
await shoot(icon(512, 0.5), 'icon-maskable-512.png'); // glyph inside the 80% safe zone
const icoParts = [];
for (const size of [16, 32, 48]) icoParts.push({ size, data: await shoot(favicon(size), null, { omitBackground: true }) });
await writeFile(path.join(pub, 'favicon.ico'), toIco(icoParts));
await browser.close();
await rm(tmp, { recursive: true, force: true });

const og_ = await readFile(path.join(pub, 'og-image.jpg'));
console.log(`og-image.jpg ${(og_.length / 1024).toFixed(0)} KiB, icons + favicon.ico written to ${path.relative(process.cwd(), pub)}`);
