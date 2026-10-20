// Grava prévias em vídeo das páginas interativas e tira prints de sites de referência (Playwright + Chrome).
// Uso: node gravar.mjs <pasta_saida>
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
const require = createRequire(path.join(process.env.LOCALAPPDATA, 'hairline-look', 'node_modules', 'x.js'));
const pw = require('playwright-core');

const OUT = path.resolve(process.argv[2] || 'previas');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8766/aprendizados/ex/';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await pw.chromium.launch({ channel: 'chrome' }).catch(() => pw.chromium.launch());

async function gravar(nome, url, W, H, roteiro) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: 'no-preference', recordVideo: { dir: OUT, size: { width: W, height: H } } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await roteiro(page);
  const v = page.video();
  await ctx.close();
  fs.renameSync(await v.path(), path.join(OUT, nome + '.webm'));
  console.log('gravado', nome);
}

// 1. celular 3D: gira, troca de cor, vista explodida
await gravar('celular', BASE + 'celular-3d.html', 960, 720, async (p) => {
  await wait(2500);
  await p.click('.cor:nth-child(5)'); await wait(1800);
  await p.click('#bExp'); await wait(3500);
  await p.click('#bExp'); await p.click('.cor:nth-child(2)'); await wait(2500);
});

// 2. hairline: o tour automático passa pelos andares
await gravar('hairline', BASE + 'hairline-torre.html?play=1', 720, 720, async () => { await wait(9000); });

// 3. landing GSAP: rola a página devagar (hero letra a letra, galeria horizontal, números)
await gravar('landing', BASE + 'landing/index.html?animar=1', 900, 720, async (p) => {
  await wait(2200);
  const total = await p.evaluate(() => document.body.scrollHeight - innerHeight);
  const passos = 130;
  for (let i = 1; i <= passos; i++) { await p.evaluate((y) => window.scrollTo(0, y), (total * i) / passos); await wait(60); }
  await wait(1200);
});

// 4. prints de referências
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
for (const [nome, url] of [['ref-recent', 'https://recent.design'], ['ref-awwwards', 'https://www.awwwards.com'], ['ref-fontshare', 'https://www.fontshare.com']]) {
  const p = await ctx.newPage();
  try { await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); } catch { /* segue com o que carregou */ }
  await wait(2500);
  await p.screenshot({ path: path.join(OUT, nome + '.jpg'), type: 'jpeg', quality: 80 });
  console.log('print', nome);
  await p.close();
}
await browser.close();
