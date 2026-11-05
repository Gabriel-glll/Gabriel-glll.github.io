// Funções coladas no flow.google.com (navegador do app logado no Google) via javascript_tool.
// Usadas no AP0159 (04/11/2026) para refazer 19 fotos em 9:16 com Nano Banana Pro (0 crédito).
// Troque o prefixo "ap0159" pelo código do imóvel nos nomes dos arquivos e nas regex.

// ── 1. SUBIR AS FOTOS (depois de `gh api PUT` em Gabriel-glll.github.io/tmp-flow/<imovel>/NN.jpg)
// Rodar com o projeto do Flow aberto (tela "Start creating or drop media").
const ids = ['31', '02', '19' /* ... */];
const dt = new DataTransfer();
for (const n of ids) {
  const b = await (await fetch(`https://raw.githubusercontent.com/Gabriel-glll/Gabriel-glll.github.io/main/tmp-flow/ap0159/${n}.jpg`)).blob();
  dt.items.add(new File([b], `ap0159-${n}.jpg`, {type: 'image/jpeg'}));
}
const el = [...document.querySelectorAll('*')].find(e => e.childElementCount < 3 && /Start creating or drop media/.test(e.textContent)) || document.querySelector('main') || document.body;
const r = el.getBoundingClientRect();
const opts = {bubbles: true, cancelable: true, dataTransfer: dt, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2};
for (const t of ['dragenter', 'dragover', 'drop']) el.dispatchEvent(new DragEvent(t, opts));

// ── 2. PROMPTS (base + descrição do que REALMENTE está na foto, senão a IA inventa)
window.__P = 'Recompose this exact space as a vertical 9:16 photo: keep the same architecture, furniture, materials and layout, nothing added or removed, the whole space shown balanced and nothing cut in half. High-end cinematic architectural photograph: ultra sharp 4K detail, clean textures, soft natural light, deep contrast, subtle teal shadows and warm highlights, straight vertical lines, no fisheye distortion, no text, no people. ';
window.__D = {
  '31': 'Aerial view of the slim residential tower among the city of Campinas, golden hour sky.',
  '02': 'Low-angle view of the residential tower facade against a deep blue sky.',
  '06': 'Gourmet kitchen island with black gas cooktop, wooden cutting board and city view.',
  // ... uma linha por foto
};
window.__urls = window.__urls || {};

// ── 3. HELPERS do editor (abrir uma foto: clicar no tile dela uma vez; depois as miniaturas ficam no topo)
window.__getThumbs = () => [...document.querySelectorAll('img')].filter(i => {
  const r = i.getBoundingClientRect();
  return r.y < 70 && r.height < 50 && r.height > 10 && !/googleusercontent/.test(i.src); // googleusercontent = avatar da conta
});
// __prep(n): acha a miniatura ap0159-n.jpg, põe Nano Banana Pro em 9:16 e escreve o prompt. NÃO envia.
window.__prep = async (n) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  window.__thumbs = window.__getThumbs();
  let found = false;
  for (const t of window.__thumbs) {
    t.click(); await sleep(450);
    if ((document.body.innerText.match(/ap0159-\d+\.jpg/) || [''])[0] === `ap0159-${n}.jpg`) { found = true; break; }
  }
  if (!found) return 'nao achei ' + n;
  window.__before = new Set([...document.querySelectorAll('img')].map(i => i.src.split('?')[0]));
  const chip = [...document.querySelectorAll('button,[role=button]')].filter(b => /Nano Banana/.test(b.innerText || '') && (b.innerText || '').length < 60).pop();
  let r916 = [...document.querySelectorAll('button[role=radio]')].find(b => /9:16/.test(b.innerText));
  if (!r916) { chip.click(); await sleep(700); r916 = [...document.querySelectorAll('button[role=radio]')].find(b => /9:16/.test(b.innerText)); }
  r916.click(); await sleep(300); chip.click(); await sleep(300); // fecha o menu clicando no chip (Escape por JS FECHA O EDITOR)
  const ed = document.querySelector('div[contenteditable=true]');
  ed.focus(); document.execCommand('selectAll'); document.execCommand('insertText', false, window.__P + window.__D[n]);
  await sleep(300);
  window.__cur = n;
  return [document.body.innerText.match(/ap0159-\d+\.jpg/)?.[0], (document.body.innerText.match(/Nano Banana (Pro|2\.1|2 Lite)/) || [''])[0], r916.getAttribute('aria-checked')];
};
// Depois do __prep: CLIQUE REAL (computer left_click) no botão de enviar (seta "Start generation").
// button.click() por JS NÃO envia. Confira "Nano Banana Pro", 9:16 e "0 credits" no screenshot antes.
// __wait(): espera a imagem nova (vertical, ≥700 px de largura) e guarda o src.
window.__wait = async () => {
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const im = [...document.querySelectorAll('img')].find(im => !window.__before.has(im.src.split('?')[0]) && im.naturalHeight > im.naturalWidth && im.naturalWidth >= 700);
    if (im) { window.__urls[window.__cur] = im.src; return window.__cur + ' ok ' + im.naturalWidth + 'x' + im.naturalHeight; }
  }
  return 'ainda gerando'; // chamar de novo
};
// javascript_tool corta em ~45 s: rode __prep, o clique e __wait como passos separados de um browser_batch.
// No fim: JSON.stringify(window.__urls) → curl de cada URL (flow-content.google é assinada, baixa sem login).
