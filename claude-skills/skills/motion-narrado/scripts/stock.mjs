// Busca e baixa fotos/vídeos de banco gratuito para public/stock/<pasta>/.
// Uso: node scripts/stock.mjs <foto|video> "<busca em inglês>" [quantidade] [pasta]
// Com PIXABAY_API_KEY no .env usa Pixabay (melhor qualidade, sem crédito obrigatório, tem vídeo).
// Sem chave usa Openverse (só fotos; licenças CC — o crédito vai em credits.json).
import fs from 'node:fs';
import path from 'node:path';

const env = Object.fromEntries(
  (fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '')
    .split('\n')
    .map((l) => l.trim().split('='))
    .filter(([k, v]) => k && v),
);
const [kind = 'foto', query, count = '5', folder = 'geral'] = process.argv.slice(2);
if (!query) {
  console.error('Uso: node scripts/stock.mjs <foto|video> "<busca>" [quantidade] [pasta]');
  process.exit(1);
}
const n = Number(count);
const outDir = path.join('public', 'stock', folder);
fs.mkdirSync(outDir, {recursive: true});
const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const pixabay = async () => {
  const key = env.PIXABAY_API_KEY;
  const base = kind === 'video' ? 'https://pixabay.com/api/videos/' : 'https://pixabay.com/api/';
  const url = `${base}?key=${key}&q=${encodeURIComponent(query)}&per_page=${Math.max(3, n)}&safesearch=true${kind === 'video' ? '' : '&image_type=photo'}`;
  const j = await (await fetch(url)).json();
  return j.hits.slice(0, n).map((h) => ({
    url: kind === 'video' ? (h.videos.large?.url || h.videos.medium.url) : h.largeImageURL,
    ext: kind === 'video' ? 'mp4' : 'jpg',
    credit: `Pixabay — ${h.user} (${h.pageURL})`,
  }));
};

const openverse = async () => {
  if (kind === 'video') throw new Error('Openverse não tem vídeo. Coloque PIXABAY_API_KEY no .env.');
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&page_size=${n}&size=large`;
  const j = await (await fetch(url)).json();
  return j.results.map((r) => ({
    url: r.url,
    ext: (r.filetype || 'jpg').replace('jpeg', 'jpg'),
    credit: `${r.title} — ${r.creator} (${r.license.toUpperCase()} ${r.license_version}) ${r.foreign_landing_url}`,
  }));
};

const items = env.PIXABAY_API_KEY ? await pixabay() : await openverse();
const creditsFile = path.join(outDir, 'credits.json');
const credits = fs.existsSync(creditsFile) ? JSON.parse(fs.readFileSync(creditsFile, 'utf8')) : {};
let k = 0;
for (const it of items) {
  k++;
  const name = `${slug}-${k}.${it.ext}`;
  const res = await fetch(it.url);
  if (!res.ok) continue;
  fs.writeFileSync(path.join(outDir, name), Buffer.from(await res.arrayBuffer()));
  credits[name] = it.credit;
  console.log('ok', path.join(outDir, name));
}
fs.writeFileSync(creditsFile, JSON.stringify(credits, null, 1));
console.log(`fonte: ${env.PIXABAY_API_KEY ? 'Pixabay' : 'Openverse'}`);
