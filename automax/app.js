(() => {
  const L = window.LOJA;
  const todos = [...(window.EXTRAS || []), ...(window.ESTOQUE || [])].map((v, i) => ({ ...v, tipo: v.tipo || "carro", _ord: i }));
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const brl = n => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const km = n => n ? n.toLocaleString("pt-BR") + " km" : "Consulte";
  const preco = v => v.preco ? brl(v.preco) : "Consulte";
  const waLink = (msg, num = L.whatsapp) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  const titulo = v => v.nome.replace(/\s+/g, " ").trim();

  // contatos globais
  $$("[data-wa]").forEach(a => { a.href = waLink(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; });
  $("#cEnd").textContent = L.endereco;
  $("#cTel").textContent = L.telefone; $("#cTel").href = "tel:+" + L.whatsapp;
  $("#cMail").textContent = L.email; $("#cMail").href = "mailto:" + L.email;
  $("#cHora").textContent = L.horario;
  $("#mapa").src = L.mapa;
  $("#fIg").href = L.instagram;
  $("#vendedores").innerHTML = L.vendedores.map(v =>
    `<a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink("Olá, " + v.nome + "! Vim pelo site da Automax.", v.whatsapp)}"><svg viewBox="0 0 24 24"><use href="#i-wa"/></svg> ${v.nome}</a>`).join("");
  $("#selVend").innerHTML = L.vendedores.map((v, i) => `<option value="${i}">${v.nome}</option>`).join("");
  $("#nTotal").textContent = todos.length;

  // menu mobile
  $("#burger").onclick = () => $("#menu").classList.toggle("open");
  $$("#menu a").forEach(a => a.onclick = () => $("#menu").classList.remove("open"));

  // hero com fotos do estoque
  const destaques = todos.filter(v => v.fotos?.length && v.preco >= 90000);
  let hi = 0;
  const trocaHero = () => { if (destaques.length) $("#heroBg").style.backgroundImage = `url("${destaques[hi++ % destaques.length].fotos[0]}")`; };
  trocaHero(); setInterval(trocaHero, 6000);

  // filtros
  const st = { tipo: "todos", q: "", marca: "", preco: "", cambio: "", ordem: "rec" };
  const marcas = [...new Set(todos.map(v => v.marca).filter(Boolean))].sort();
  $("#fMarca").innerHTML += marcas.map(m => `<option>${m}</option>`).join("");

  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function filtrar() {
    let r = todos.filter(v =>
      (st.tipo === "todos" || v.tipo === st.tipo) &&
      (!st.marca || v.marca === st.marca) &&
      (!st.cambio || v.cambio === st.cambio) &&
      (!st.q || norm(v.nome + " " + v.marca).includes(norm(st.q))));
    if (st.preco) {
      const [a, b] = st.preco.split("-").map(Number);
      r = r.filter(v => v.preco && v.preco >= a && v.preco < b);
    }
    const o = { menor: (a, b) => (a.preco || 9e9) - (b.preco || 9e9), maior: (a, b) => (b.preco || 0) - (a.preco || 0), ano: (a, b) => b.ano - a.ano, km: (a, b) => (a.km || 9e9) - (b.km || 9e9), rec: (a, b) => a._ord - b._ord };
    return r.sort(o[st.ordem]);
  }

  function card(v) {
    const novo = v.ano >= new Date().getFullYear() - 2;
    const tag = v.tipo === "moto" ? `<span class="tag tag--red">Moto</span>` : novo ? `<span class="tag tag--red">Seminovo ${v.ano}</span>` : v.ano < 1990 ? `<span class="tag">Clássico</span>` : "";
    return `<article class="car" data-id="${v.id}" tabindex="0">
      <div class="car__img"><img loading="lazy" src="${v.fotos?.[0] || "img/logo.png"}" alt="${titulo(v)}">${tag}<span class="car__fotos">${v.fotos?.length || 0} fotos</span></div>
      <div class="car__body">
        <span class="car__marca">${v.marca}</span>
        <h3>${titulo(v)}</h3>
        <div class="car__meta">
          <span><svg><use href="#i-cal"/></svg>${v.ano}</span>
          <span><svg><use href="#i-road"/></svg>${km(v.km)}</span>
          ${v.cambio ? `<span><svg><use href="#i-gear"/></svg>${v.cambio}</span>` : ""}
          ${v.combustivel ? `<span><svg><use href="#i-fuel"/></svg>${v.combustivel}</span>` : ""}
        </div>
        <div class="car__foot"><span class="preco ${v.preco ? "" : "preco--c"}">${preco(v)}</span><span class="car__go">Ver detalhes →</span></div>
      </div></article>`;
  }

  function render() {
    const r = filtrar();
    $("#grid").innerHTML = r.map(card).join("");
    $("#count").textContent = `${r.length} ${r.length === 1 ? "veículo" : "veículos"}`;
    const vazio = !r.length;
    $("#vazio").hidden = !vazio;
    if (vazio) {
      const moto = st.tipo === "moto";
      $("#vazioTit").textContent = moto ? "Motos: fale com a gente" : "Nenhum veículo encontrado";
      $("#vazioTxt").textContent = moto ? "Nosso estoque de motos gira rápido. Diga o modelo que você procura e um vendedor te avisa assim que chegar." : "Não achou o que procura? A gente encontra para você.";
      $("#vazioBtn").href = waLink(moto ? "Olá! Estou procurando uma moto. Vocês têm alguma disponível?" : `Olá! Procuro um veículo${st.q ? " (" + st.q + ")" : ""} e não encontrei no site. Podem me ajudar?`);
      $("#vazioBtn").target = "_blank";
    }
  }

  function setTipo(t) {
    st.tipo = t;
    $$(".seg [data-tipo]").forEach(b => b.classList.toggle("on", b.dataset.tipo === t));
    render();
  }
  $$("[data-tipo]").forEach(b => b.onclick = () => setTipo(b.dataset.tipo));
  $("#q").oninput = e => { st.q = e.target.value; render(); };
  $("#fMarca").onchange = e => { st.marca = e.target.value; render(); };
  $("#fPreco").onchange = e => { st.preco = e.target.value; render(); };
  $("#fCambio").onchange = e => { st.cambio = e.target.value; render(); };
  $("#fOrdem").onchange = e => { st.ordem = e.target.value; render(); };
  $("#buscaHero").onsubmit = e => {
    e.preventDefault(); st.q = $("#q").value = $("#qHero").value; render();
    $("#estoque").scrollIntoView();
  };

  // modal / detalhe
  let atual = null, fi = 0;
  function abrir(id, push = true) {
    const v = todos.find(x => String(x.id) === String(id)); if (!v) return;
    atual = v; fi = 0;
    $("#dMarca").textContent = v.marca + (v.tipo === "moto" ? " · Moto" : "");
    $("#dNome").textContent = titulo(v);
    $("#dPreco").textContent = preco(v);
    const specs = [["Ano", v.ano], ["Quilometragem", km(v.km)], ["Câmbio", v.cambio], ["Combustível", v.combustivel], ["Cor", v.cor], [v.tipo === "moto" ? "Cilindradas" : "Portas", v.tipo === "moto" ? (v.cilindradas && v.cilindradas + " cc") : v.portas]];
    $("#dSpecs").innerHTML = specs.filter(s => s[1]).map(([k, x]) => `<li>${k}<b>${x}</b></li>`).join("");
    $("#gThumbs").innerHTML = (v.fotos || []).map((f, i) => `<img src="${f}" data-i="${i}" loading="lazy" alt="">`).join("");
    foto(0);
    $("#dWa").href = waLink(`Olá! Tenho interesse no ${titulo(v)} ${v.ano} (${preco(v)}) que vi no site da Automax. Ainda está disponível?\n${linkVeic(v)}`);
    $("#dWa").target = "_blank";
    $("#formProp").reset(); $(".troca").hidden = true;
    $("#modal").hidden = false; document.body.style.overflow = "hidden";
    if (push) history.replaceState(null, "", "#v=" + v.id);
  }
  function fechar() {
    $("#modal").hidden = true; document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname + location.search);
  }
  function foto(i) {
    const f = atual.fotos || []; if (!f.length) { $("#gImg").src = "img/logo.png"; $("#gCnt").textContent = ""; return; }
    fi = (i + f.length) % f.length;
    $("#gImg").src = f[fi];
    $("#gCnt").textContent = `${fi + 1} / ${f.length}`;
    $$("#gThumbs img").forEach(t => t.classList.toggle("on", +t.dataset.i === fi));
    $(`#gThumbs img[data-i="${fi}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }
  const linkVeic = v => location.origin + location.pathname + "#v=" + v.id;

  $("#grid").onclick = e => { const c = e.target.closest(".car"); if (c) abrir(c.dataset.id); };
  $("#grid").onkeydown = e => { if (e.key === "Enter") { const c = e.target.closest(".car"); if (c) abrir(c.dataset.id); } };
  $("#gThumbs").onclick = e => { if (e.target.dataset.i) foto(+e.target.dataset.i); };
  $("#gPrev").onclick = () => foto(fi - 1);
  $("#gNext").onclick = () => foto(fi + 1);
  $("#fechar").onclick = fechar;
  $("#modal").onclick = e => { if (e.target.id === "modal") fechar(); };
  document.addEventListener("keydown", e => {
    if ($("#modal").hidden) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowLeft") foto(fi - 1);
    if (e.key === "ArrowRight") foto(fi + 1);
  });
  // swipe na galeria
  let x0 = null;
  $("#gImg").addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
  $("#gImg").addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) foto(fi + (d < 0 ? 1 : -1)); x0 = null; });

  $("#dShare").onclick = async () => {
    const url = linkVeic(atual), t = `${titulo(atual)} ${atual.ano} — Automax`;
    if (navigator.share) { try { await navigator.share({ title: t, url }); } catch { } }
    else { await navigator.clipboard?.writeText(url); $("#dShare").textContent = "Link copiado!"; setTimeout(() => $("#dShare").textContent = "Compartilhar", 1800); }
  };

  // proposta
  const fp = $("#formProp");
  fp.pag.onchange = () => { $(".troca").hidden = !fp.pag.value.includes("Troca"); };
  fp.valor.oninput = e => {
    const n = e.target.value.replace(/\D/g, "");
    e.target.value = n ? brl(+n) : "";
  };
  fp.onsubmit = e => {
    e.preventDefault();
    const v = atual, vend = L.vendedores[+fp.vend.value] || L.vendedores[0];
    const msg = [
      `*PROPOSTA PELO SITE — Automax*`,
      ``,
      `*Veículo:* ${titulo(v)} ${v.ano}`,
      `*Anunciado por:* ${preco(v)}`,
      `*Minha proposta:* ${fp.valor.value}`,
      `*Pagamento:* ${fp.pag.value}`,
      fp.pag.value.includes("Troca") && fp.troca.value ? `*Na troca:* ${fp.troca.value}` : null,
      ``,
      `*Nome:* ${fp.nome.value}`,
      `*WhatsApp:* ${fp.tel.value}`,
      linkVeic(v)
    ].filter(x => x !== null).join("\n");
    window.open(waLink(msg, vend.whatsapp), "_blank");
  };

  // vender / trocar / consignar
  const fv = $("#formVender"); let op = "Vender";
  $$("#segOp button").forEach(b => b.onclick = () => { op = b.dataset.v; $$("#segOp button").forEach(x => x.classList.toggle("on", x === b)); });
  fv.onsubmit = e => {
    e.preventDefault();
    const msg = [`*AVALIAÇÃO PELO SITE — quero ${op.toUpperCase()}*`, ``,
      `*Veículo:* ${fv.modelo.value}`, `*Ano:* ${fv.ano.value}`, fv.km.value ? `*Km:* ${fv.km.value}` : null,
      fv.obs.value ? `*Obs.:* ${fv.obs.value}` : null, ``,
      `*Nome:* ${fv.nome.value}`, `*WhatsApp:* ${fv.tel.value}`, ``, `Vou enviar as fotos em seguida.`].filter(x => x !== null).join("\n");
    window.open(waLink(msg), "_blank");
  };

  // simulador
  const TAXA = 0.0189; let prazo = 48;
  function sim() {
    const val = +$("#sValor").value, ent = val * $("#sEntrada").value / 100, pv = val - ent;
    const p = pv <= 0 ? 0 : pv * TAXA / (1 - Math.pow(1 + TAXA, -prazo));
    $("#oValor").textContent = brl(val);
    $("#oEntrada").textContent = `${$("#sEntrada").value}% · ${brl(ent)}`;
    $("#oParcela").textContent = `${prazo}x ${brl(p)}`;
  }
  $("#sValor").oninput = $("#sEntrada").oninput = sim;
  $$("#prazos button").forEach(b => b.onclick = () => { prazo = +b.dataset.p; $$("#prazos button").forEach(x => x.classList.toggle("on", x === b)); sim(); });
  sim();

  render();
  const m = location.hash.match(/^#v=(.+)/);
  if (m) abrir(decodeURIComponent(m[1]), false);
})();
