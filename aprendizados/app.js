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
  document.querySelectorAll('.proj a').forEach((a) => a.addEventListener('click', () => {
    botoes[0].click();
  }));
})();
