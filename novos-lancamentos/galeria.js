/* Galeria: carrossel com setas + zoom em tela cheia.
   Usado pelo site interno e pelas páginas de cliente (que recebem este arquivo embutido).
   Marcação esperada do carrossel:
     <div class="car" data-car><div class="car-track"><img…>…</div>
       <button class="car-btn car-prev">‹</button><button class="car-btn car-next">›</button><span class="car-count"></span></div>
   Imagens dentro de um carrossel com a classe "zoomavel" abrem o zoom ao clicar. */
(() => {
"use strict";

/* ---------- carrossel ---------- */
function carSync(car, idx){
  const t = car.querySelector(".car-track"), n = t.children.length;
  const i = idx ?? Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
  const c = car.querySelector(".car-count"); if (c) c.textContent = (i + 1) + "/" + n;
  const p = car.querySelector(".car-prev"), x = car.querySelector(".car-next");
  if (p) p.disabled = i <= 0; if (x) x.disabled = i >= n - 1;
}
function carGo(car, i){
  const t = car.querySelector(".car-track"), w = Math.max(1, t.clientWidth);
  i = Math.min(t.children.length - 1, Math.max(0, i));
  t.scrollTo({ left: i * w, behavior: "smooth" }); carSync(car, i);
}
const carIdx = car => { const t = car.querySelector(".car-track"); return Math.round(t.scrollLeft / Math.max(1, t.clientWidth)); };

document.addEventListener("click", e => {
  const b = e.target.closest(".car-btn"); if (b){
    e.preventDefault(); e.stopPropagation();
    const car = b.closest(".car"); carGo(car, carIdx(car) + (b.classList.contains("car-next") ? 1 : -1));
    return;
  }
  const img = e.target.closest(".zoomavel .car-track img");
  if (img){
    const car = img.closest(".car"), imgs = [...car.querySelectorAll(".car-track img")];
    abrir(imgs.map(x => x.currentSrc || x.src), imgs.indexOf(img), car);
  }
}, true);
document.addEventListener("scroll", e => {
  const t = e.target; if (!(t instanceof Element) || !t.classList.contains("car-track")) return;
  clearTimeout(t._h); t._h = setTimeout(() => carSync(t.closest(".car")), 60);
}, true);
document.addEventListener("keydown", e => {
  if (lb.classList.contains("on")) return;
  if ((e.key !== "ArrowLeft" && e.key !== "ArrowRight") || /input|select|textarea/i.test(e.target.tagName)) return;
  const g = document.querySelector(".galeria[data-car]"); if (!g) return;
  carGo(g, carIdx(g) + (e.key === "ArrowRight" ? 1 : -1));
});

/* ---------- zoom (lightbox) ---------- */
const st = document.createElement("style");
st.textContent = `
.lb{position:fixed;inset:0;z-index:100;background:rgba(8,9,11,.96);display:none;touch-action:none;user-select:none;-webkit-user-select:none}
.lb.on{display:block}
.lb-stage{position:absolute;inset:0;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:zoom-in}
.lb.zoom .lb-stage{cursor:grab}
.lb.drag .lb-stage{cursor:grabbing}
.lb-img{max-width:100%;max-height:100%;object-fit:contain;transform-origin:center center;will-change:transform;-webkit-user-drag:none;pointer-events:none}
.lb-btn{position:absolute;z-index:2;border:0;background:rgba(255,255,255,.1);color:#fff;width:46px;height:46px;border-radius:50%;font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lb-btn:hover{background:rgba(255,255,255,.22)}
.lb-btn[disabled]{opacity:.25;pointer-events:none}
.lb-x{top:14px;right:14px}
.lb-prev{left:14px;top:50%;transform:translateY(-50%)}
.lb-next{right:14px;top:50%;transform:translateY(-50%)}
.lb-bar{position:absolute;z-index:2;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.1);border-radius:999px;padding:5px 8px;color:#fff;font:600 13px/1 system-ui,sans-serif}
.lb-bar .lb-btn{position:static;width:34px;height:34px;font-size:19px;background:transparent}
.lb-bar .lb-btn:hover{background:rgba(255,255,255,.15)}
.lb-n{min-width:52px;text-align:center}
@media (max-width:760px){ .lb-prev,.lb-next{display:none} }`;
document.head.appendChild(st);

const lb = document.createElement("div");
lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Foto ampliada");
lb.innerHTML = `<div class="lb-stage"><img class="lb-img" alt=""></div>
  <button class="lb-btn lb-x" type="button" aria-label="Fechar">✕</button>
  <button class="lb-btn lb-prev" type="button" aria-label="Foto anterior">‹</button>
  <button class="lb-btn lb-next" type="button" aria-label="Próxima foto">›</button>
  <div class="lb-bar"><button class="lb-btn lb-out" type="button" aria-label="Diminuir zoom">−</button><span class="lb-n"></span><button class="lb-btn lb-in" type="button" aria-label="Aumentar zoom">+</button></div>`;
const mount = () => document.body.appendChild(lb);
document.body ? mount() : document.addEventListener("DOMContentLoaded", mount);

const stage = lb.querySelector(".lb-stage"), img = lb.querySelector(".lb-img");
let fotos = [], i = 0, s = 1, tx = 0, ty = 0, origem = null;
const MAX = 5;

function aplicar(anim){
  img.style.transition = anim ? "transform .18s ease" : "none";
  img.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
  lb.classList.toggle("zoom", s > 1.01);
  lb.querySelector(".lb-n").textContent = s > 1.01 ? Math.round(s * 100) + "%" : (i + 1) + " / " + fotos.length;
}
function limitar(){
  const w = img.offsetWidth * s, h = img.offsetHeight * s, W = stage.clientWidth, H = stage.clientHeight;
  const mx = Math.max(0, (w - W) / 2), my = Math.max(0, (h - H) / 2);
  tx = Math.min(mx, Math.max(-mx, tx)); ty = Math.min(my, Math.max(-my, ty));
}
function zoomEm(novo, cx, cy, anim = true){
  novo = Math.min(MAX, Math.max(1, novo));
  const r = stage.getBoundingClientRect();
  const px = (cx ?? r.left + r.width / 2) - (r.left + r.width / 2), py = (cy ?? r.top + r.height / 2) - (r.top + r.height / 2);
  tx = px - (px - tx) * novo / s; ty = py - (py - ty) * novo / s; s = novo;
  if (s === 1){ tx = 0; ty = 0; }
  limitar(); aplicar(anim);
}
function mostrar(){
  s = 1; tx = 0; ty = 0; img.src = fotos[i]; aplicar(false);
  lb.querySelector(".lb-prev").disabled = i <= 0; lb.querySelector(".lb-next").disabled = i >= fotos.length - 1;
}
function ir(d){ const n = i + d; if (n < 0 || n >= fotos.length) return; i = n; mostrar(); }
function abrir(lista, idx, car){ fotos = lista; i = Math.max(0, idx); origem = car; mostrar(); lb.classList.add("on"); document.documentElement.style.overflow = "hidden"; }
function fechar(){ lb.classList.remove("on"); document.documentElement.style.overflow = ""; if (origem) carGo(origem, i); }
window.abrirZoom = abrir;

lb.querySelector(".lb-x").onclick = fechar;
lb.querySelector(".lb-prev").onclick = () => ir(-1);
lb.querySelector(".lb-next").onclick = () => ir(1);
lb.querySelector(".lb-in").onclick = () => zoomEm(s * 1.6);
lb.querySelector(".lb-out").onclick = () => zoomEm(s / 1.6);
document.addEventListener("keydown", e => {
  if (!lb.classList.contains("on")) return;
  if (e.key === "Escape") fechar();
  else if (e.key === "ArrowRight") ir(1);
  else if (e.key === "ArrowLeft") ir(-1);
  else if (e.key === "+" || e.key === "=") zoomEm(s * 1.6);
  else if (e.key === "-") zoomEm(s / 1.6);
  else return;
  e.preventDefault();
});
stage.addEventListener("wheel", e => { e.preventDefault(); zoomEm(s * Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY, false); }, { passive: false });

// arrastar, pinça e deslizar
const pts = new Map(); let ini = null, moveu = 0;
stage.addEventListener("pointerdown", e => {
  stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  moveu = 0;
  if (pts.size === 1) ini = { x: e.clientX, y: e.clientY, tx, ty, t: Date.now() };
  if (pts.size === 2){ const [a, b] = [...pts.values()]; ini = { d: Math.hypot(a.x - b.x, a.y - b.y), s, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; }
});
stage.addEventListener("pointermove", e => {
  if (!pts.has(e.pointerId) || !ini) return;
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pts.size === 2 && ini.d){
    const [a, b] = [...pts.values()];
    zoomEm(ini.s * Math.hypot(a.x - b.x, a.y - b.y) / ini.d, ini.cx, ini.cy, false); moveu = 99; return;
  }
  const dx = e.clientX - ini.x, dy = e.clientY - ini.y; moveu = Math.max(moveu, Math.hypot(dx, dy));
  if (s > 1.01){ lb.classList.add("drag"); tx = ini.tx + dx; ty = ini.ty + dy; limitar(); aplicar(false); }
});
function solta(e){
  if (!pts.has(e.pointerId)) return;
  const eraPinca = pts.size === 2; pts.delete(e.pointerId); lb.classList.remove("drag");
  if (eraPinca){ ini = null; return; }
  if (!ini || pts.size) return;
  const dx = e.clientX - ini.x, dy = e.clientY - ini.y;
  if (s <= 1.01 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) ir(dx < 0 ? 1 : -1);
  else if (moveu < 6){ s > 1.01 ? zoomEm(1) : zoomEm(2.5, e.clientX, e.clientY); }
  ini = null;
}
stage.addEventListener("pointerup", solta);
stage.addEventListener("pointercancel", solta);
window.addEventListener("resize", () => { if (lb.classList.contains("on")){ limitar(); aplicar(false); } });
})();
