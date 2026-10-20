// Filtro dos aprendizados por tipo de projeto
(function () {
  const botoes = document.querySelectorAll('.filtro button');
  const cards = document.querySelectorAll('.ap');
  botoes.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.f;
    botoes.forEach((x) => x.classList.toggle('on', x === b));
    cards.forEach((c) => { c.hidden = f !== 'todos' && !c.dataset.bom.split(' ').includes(f); });
  }));
  // ao clicar num efeito do guia, mostra todos para o alvo não ficar escondido pelo filtro
  document.querySelectorAll('.ef').forEach((a) => a.addEventListener('click', () => botoes[0].click()));

  // prévias em vídeo: carregam e tocam só quando aparecem na tela (página leve)
  const vids = document.querySelectorAll('.pv video[data-src]');
  if (!('IntersectionObserver' in window)) { vids.forEach((v) => { v.src = v.dataset.src; v.autoplay = true; }); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
  }), { rootMargin: '150px' });
  vids.forEach((v) => io.observe(v));
})();
