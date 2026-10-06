// Captação ZFF na Cloudflare: serve o hub e as páginas de captação (sem depender do GitHub Pages),
// guarda a chave do GitHub (GH_TOKEN) e aciona o workflow captacao.yml, que só processa as fotos.
const REPO = "Gabriel-glll/Gabriel-glll.github.io", WF = "captacao.yml";
const API = "https://api.github.com/repos/" + REPO;
const ORIGENS = [/^https:\/\/gabriel-glll\.github\.io$/, /^https:\/\/captacao-zff\.zffrealty\.workers\.dev$/,
                 /^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];
const TIPOS = { html: "text/html; charset=utf-8", json: "application/json; charset=utf-8", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const RE_ARQ = /^[a-z0-9-]+\/(index\.html|fotos\/\d{2}\.(jpg|jpeg|png|webp))$/;

export default {
  async fetch(req, env) {
    const origem = req.headers.get("Origin") || "";
    const u = new URL(req.url);
    const ok = ORIGENS.some(r => r.test(origem)) || origem === u.origin;
    const cors = { "Access-Control-Allow-Origin": ok ? origem : "https://gabriel-glll.github.io",
                   "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": TIPOS.json, "Cache-Control": "no-store" } });
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const gh = (p, init = {}) => fetch(API + p, { ...init, headers: { Authorization: "Bearer " + env.GH_TOKEN,
      Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "captacao-zff", ...(init.headers || {}) } });
    const HUB = u.origin + "/";

    // ---------- Páginas de captação (públicas, para o cliente) ----------
    // Dados de uma captação em JSON (comparador do Novos Lançamentos lê na hora, sem GitHub)
    if (req.method === "GET" && u.pathname.startsWith("/api/imovel/")) {
      const slug = u.pathname.slice(12).replace(/\/$/, "");
      if (!/^[a-z0-9-]+$/.test(slug)) return json({ erro: "Captação inválida." }, 400);
      const h = await env.PAGINAS.get("pag:" + slug + "/index.html");
      if (!h) return json({ erro: "Captação não encontrada." }, 404);
      const m = h.match(/(\{"codigo":[\s\S]*?"slug": ?"[a-z0-9-]+"\})/);
      if (!m) return json({ erro: "Dados da captação não encontrados." }, 500);
      try { return json(JSON.parse(m[1])); } catch { return json({ erro: "Dados da captação ilegíveis." }, 500); }
    }

    if (req.method === "GET" && u.pathname.startsWith("/imovel/")) {
      let caminho = decodeURIComponent(u.pathname.slice(8));
      if (/^[a-z0-9-]+$/.test(caminho)) return Response.redirect(u.origin + u.pathname + "/", 301);
      if (caminho.endsWith("/")) caminho += "index.html";
      if (!RE_ARQ.test(caminho)) return new Response("Página não encontrada.", { status: 404 });
      const v = await env.PAGINAS.get("pag:" + caminho, "arrayBuffer");
      if (!v) return new Response("Esta captação não está mais disponível.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      const ext = caminho.split(".").pop();
      return new Response(v, { headers: { "Content-Type": TIPOS[ext] || "application/octet-stream",
        "Cache-Control": ext === "html" ? "public, max-age=60" : "public, max-age=31536000, immutable" } });
    }

    // Página entregue pelo navegador do corretor (sites com anti-robô): lida pelo GitHub Actions.
    if (req.method === "GET" && u.pathname === "/pagina") {
      const k = (u.searchParams.get("pedido") || "").replace(/[^\w-]/g, "");
      const h = k && await env.PAGINAS.get(k);
      return h ? new Response(h, { headers: { "Content-Type": TIPOS.html, "Cache-Control": "no-store" } })
               : new Response("não encontrado", { status: 404 });
    }

    // Favorito "Captar ZFF": a página do anúncio chega por formulário (de qualquer site),
    // fica guardada 1 h e o hub é aberto já com o pedido. Gerar continua só pelo hub.
    if (req.method === "POST" && u.pathname === "/receber") {
      const f = await req.formData().catch(() => null);
      const html = f && f.get("html"), url = f && String(f.get("url") || "");
      if (typeof html !== "string" || html.length < 500 || html.length > 8e6 || !/^https?:\/\//.test(url))
        return new Response("Não recebi a página do anúncio.", { status: 400 });
      const ref = "r" + crypto.randomUUID().replace(/-/g, "");
      await env.PAGINAS.put(ref, html, { expirationTtl: 3600 });
      if (f.get("destino") === "comparar")   // favorito "Comparar ZFF" (comparador do Novos Lançamentos)
        return Response.redirect("https://gabriel-glll.github.io/novos-lancamentos/#/comparar?receber=" + ref + "&url=" + encodeURIComponent(url), 303);
      return Response.redirect(HUB + "#receber=" + ref + "&url=" + encodeURIComponent(url), 303);
    }

    // ---------- Publicação vinda do GitHub Actions (sem chave: só aceita durante a execução do pedido) ----------
    async function execucaoAtiva(pedido) {
      if (!pedido) return false;
      if (await env.PAGINAS.get("ok:" + pedido)) return true;
      const r = await gh(`/actions/workflows/${WF}/runs?status=in_progress&per_page=30`);
      if (!r.ok) return false;
      const ativa = (await r.json()).workflow_runs.some(x => x.display_title === "Captação " + pedido ||
        (pedido.startsWith("fila") && x.display_title === "Captação fila"));
      if (ativa) await env.PAGINAS.put("ok:" + pedido, "1", { expirationTtl: 3600 });
      return ativa;
    }
    async function apagarPasta(slug) {
      let cursor;
      do {
        const l = await env.PAGINAS.list({ prefix: "pag:" + slug + "/", cursor });
        await Promise.all(l.keys.map(k => env.PAGINAS.delete(k.name)));
        cursor = l.list_complete ? null : l.cursor;
      } while (cursor);
    }
    if (req.method === "PUT" && u.pathname === "/publicar") {
      const pedido = (u.searchParams.get("pedido") || "").replace(/[^\w-]/g, "");
      const caminho = u.searchParams.get("caminho") || "";
      if (!(await execucaoAtiva(pedido))) return json({ erro: "Pedido não está em execução." }, 403);
      const corpo = await req.arrayBuffer();
      if (corpo.byteLength > 20e6) return json({ erro: "Arquivo grande demais." }, 413);
      const txt = () => new TextDecoder().decode(corpo);
      if (RE_ARQ.test(caminho)) {
        await env.PAGINAS.put("pag:" + caminho, corpo);
      } else if (caminho === "_limpar") {          // apaga fotos antigas antes de regravar o mesmo imóvel
        const slug = txt().replace(/[^a-z0-9-]/g, "");
        if (slug) await apagarPasta(slug);
      } else if (caminho === "_lista") {           // entrada da lista de captações
        const e = JSON.parse(txt());
        const L = JSON.parse(await env.PAGINAS.get("lista") || "[]").filter(i => i.slug !== e.slug && i.codigo !== e.codigo);
        L.unshift(e);
        await env.PAGINAS.put("lista", JSON.stringify(L));
        await env.PAGINAS.put("idx:" + e.slug, "1");   // marca de "existe" (exclusões simultâneas não se atropelam)
      } else if (caminho === "_progresso") {      // o que está acontecendo agora (mostrado no hub)
        await env.PAGINAS.put("prog:" + pedido, txt().slice(0, 200), { expirationTtl: 3600 });
      } else if (caminho === "_resultado") {       // resultado do pedido (o hub lê na hora)
        await env.PAGINAS.put("res:" + pedido, txt(), { expirationTtl: 86400 * 7 });
      } else return json({ erro: "Caminho inválido." }, 400);
      return json({ ok: true });
    }

    // IA para o gerador (só durante a execução do pedido): extrair dados de texto livre
    // (legenda de Instagram, anúncio pobre) e interpretar as observações sobre as fotos.
    if (req.method === "POST" && u.pathname === "/ia") {
      let b; try { b = await req.json(); } catch { return json({ erro: "Pedido inválido." }, 400); }
      const pedido = String(b.pedido || "").replace(/[^\w-]/g, "");
      if (!(await execucaoAtiva(pedido))) return json({ erro: "Pedido não está em execução." }, 403);
      let sistema, usuario;
      if (b.tarefa === "extrair") {
        sistema = "Você extrai dados de anúncios de imóveis do Brasil. Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois. " +
          "Chaves (omita as que o texto não informa; números sem unidade, valores em reais como número inteiro): " +
          "tipo (Casa, Apartamento, Sobrado, Terreno, Cobertura, Chácara, Sala, Galpão), quartos, suites, banheiros, vagas, " +
          "areaConstruida, areaTerreno, areaUtil, valorVenda, valorCondominio, valorIptu, bairro, cidade, condominio (nome do condomínio/residencial), " +
          "endereco (rua), caracteristicas (lista curta de itens do imóvel e do condomínio, ex.: Piscina, Área gourmet). Nunca invente.";
        usuario = String(b.texto || "").slice(0, 6000);
      } else if (b.tarefa === "instrucoes") {
        const obs = await env.PAGINAS.get("obs:" + pedido);
        if (!obs) return json({ resultado: {} });
        sistema = "Você interpreta instruções de um corretor sobre as FOTOS de um anúncio. Responda SOMENTE com JSON válido no formato " +
          '{"remover_fotos": [números]} — posições começando em 1; use números negativos para contar do fim (-1 = última foto). ' +
          'Se não houver instrução sobre remover fotos, responda {"remover_fotos": []}. Ignore instruções sobre o texto ou marca d\'água.';
        usuario = obs;
      } else return json({ erro: "Tarefa inválida." }, 400);
      const r = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        max_tokens: 900, temperature: 0.1, messages: [{ role: "system", content: sistema }, { role: "user", content: usuario }]
      }).catch(() => null);
      const txt = String(r && r.response || "");
      const m = txt.match(/\{[\s\S]*\}/);
      let res = null; try { res = m ? JSON.parse(m[0]) : null; } catch {}
      return json({ resultado: res });
    }

    // Observações do corretor aplicadas à descrição (chamado pelo GitHub Actions). Só funciona
    // uma vez por pedido que tenha observações guardadas — não é uma IA aberta a terceiros.
    if (req.method === "POST" && u.pathname === "/reescrever") {
      let b; try { b = await req.json(); } catch { return json({ erro: "Pedido inválido." }, 400); }
      const pedido = String(b.pedido || "").replace(/[^\w-]/g, "");
      const obs = pedido && await env.PAGINAS.get("obs:" + pedido);
      if (!obs) return json({ erro: "Sem observações para este pedido." }, 404);
      await env.PAGINAS.delete("obs:" + pedido);
      const texto = String(b.texto || "").slice(0, 8000);
      const dados = JSON.stringify(b.dados || {}).slice(0, 1500);
      const r = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        max_tokens: 1200, temperature: 0.3,
        messages: [
          { role: "system", content: "Você edita descrições de anúncios de imóveis, em português do Brasil. " +
            "Aplique as instruções do corretor que se referem ao TEXTO (ignore as que falam de fotos ou marca d'água). " +
            "Se ele pedir para criar um texto novo, escreva com suas palavras, em tom profissional e atraente, sem copiar frases. " +
            "Não invente informações que não estejam no texto original, nos dados ou nas instruções. " +
            "Nunca inclua telefones, e-mails, links, @perfis, hashtags, emojis, nomes de imobiliárias, corretores ou CRECI. " +
            "Se as instruções não pedirem uma mudança clara (ex.: 'teste', 'ok'), devolva o texto original sem alterar. " +
            "Responda somente com o texto final da descrição, em parágrafos curtos, sem título, sem aspas e sem comentários." },
          { role: "user", content: `INSTRUÇÕES DO CORRETOR:\n${obs}\n\nDADOS DO IMÓVEL:\n${dados}\n\nTEXTO ORIGINAL:\n${texto || "(sem descrição — escreva uma curta, só com os dados acima)"}` }
        ]
      }).catch(() => null);
      return json({ texto: (r && r.response || "").trim() });
    }

    // ---------- Daqui para baixo: só o hub ----------
    if (req.method === "GET" && u.pathname === "/api/lista") {
      const vivos = new Set((await env.PAGINAS.list({ prefix: "idx:" })).keys.map(k => k.name.slice(4)));
      return json(JSON.parse(await env.PAGINAS.get("lista") || "[]").filter(i => vivos.has(i.slug)));
    }

    // andamento do pedido: só leitura (GET do próprio hub não envia Origin)
    if (req.method === "GET" && u.pathname === "/status") {
      const pedido = (u.searchParams.get("pedido") || "").replace(/[^\w-]/g, "");
      if (!pedido) return json({ erro: "Pedido ausente." }, 400);
      const k = await env.PAGINAS.get("res:" + pedido);
      if (k) return json({ estado: "pronto", resultado: JSON.parse(k) });
      const r = await gh(`/contents/captacao/pedidos/${pedido}.json?ref=main`, { headers: { Accept: "application/vnd.github.raw+json" } });
      if (r.ok) return json({ estado: "pronto", resultado: await r.json() });
      const rr = await gh(`/actions/workflows/${WF}/runs?per_page=20`);
      const run = rr.ok ? (await rr.json()).workflow_runs.find(x => x.display_title === "Captação " + pedido) : null;
      if (run && run.status === "completed" && run.conclusion !== "success")
        return json({ estado: "falhou" });
      return json({ estado: run && run.status === "queued" ? "fila" : "andamento", progresso: await env.PAGINAS.get("prog:" + pedido) });
    }
    if (!ok) return json({ erro: "Origem não autorizada." }, 403);

    // Excluir captação (botão no hub, com confirmação): some na hora da Cloudflare;
    // o GitHub apaga a cópia de reserva quando puder.
    if (req.method === "POST" && u.pathname === "/excluir") {
      let b; try { b = await req.json(); } catch { return json({ erro: "Pedido inválido." }, 400); }
      const slug = String(b.slug || "").replace(/[^a-z0-9-]/g, "");
      if (!slug || slug.length > 200) return json({ erro: "Captação inválida." }, 400);
      await apagarPasta(slug);
      await env.PAGINAS.delete("idx:" + slug);
      const L = JSON.parse(await env.PAGINAS.get("lista") || "[]").filter(i => i.slug !== slug);
      await env.PAGINAS.put("lista", JSON.stringify(L));
      const pedido = "x" + new Date().toISOString().replace(/\D/g, "").slice(0, 14) + "-" + crypto.randomUUID().slice(0, 8);
      await gh(`/actions/workflows/${WF}/dispatches`, { method: "POST",
        body: JSON.stringify({ ref: "main", inputs: { url: slug, pedido, modo: "excluir" } }) }).catch(() => null);
      return json({ ok: true });
    }

    if (req.method === "POST" && u.pathname === "/gerar") {
      let b; try { b = await req.json(); } catch { return json({ erro: "Pedido inválido." }, 400); }
      let url = String(b.url || "").trim();
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      try { new URL(url); } catch { return json({ erro: "Link inválido." }, 400); }
      if (url.length > 1500) return json({ erro: "Link longo demais." }, 400);
      let codigo = String(b.codigo || "").replace(/[^\w-]/g, "").slice(0, 12);
      const valor = String(b.valor || "").replace(/[^\d.,]/g, "").slice(0, 15);
      const pedido = new Date().toISOString().replace(/\D/g, "").slice(0, 14) + "-" + crypto.randomUUID().slice(0, 8);
      if (!codigo) {
        // número único reservado aqui (pedidos em paralelo não repetem código); o prefixo
        // (CA, AP...) é posto pelo gerador conforme o tipo do imóvel
        const n = Math.max(9004, Number(await env.PAGINAS.get("seq") || 0) + 1);
        await env.PAGINAS.put("seq", String(n));
        codigo = "#" + n;
      }
      const inputs = { url, pedido, codigo, valor };
      const obs = String(b.obs || "").trim().slice(0, 1000);
      if (obs) {
        await env.PAGINAS.put("obs:" + pedido, obs, { expirationTtl: 7200 });
        inputs.obs = "1";
      }
      if (typeof b.ref === "string" && /^r[0-9a-f]{32}$/.test(b.ref)) {
        if (!(await env.PAGINAS.get(b.ref))) return json({ erro: "A página enviada expirou. Clique de novo em 'Captar ZFF' no anúncio." }, 410);
        inputs.html_url = u.origin + "/pagina?pedido=" + b.ref;
      } else if (typeof b.html === "string" && b.html.length > 500) {
        if (b.html.length > 8e6) return json({ erro: "Página grande demais." }, 400);
        await env.PAGINAS.put(pedido, b.html, { expirationTtl: 3600 });
        inputs.html_url = u.origin + "/pagina?pedido=" + pedido;
      }
      const r = await gh(`/actions/workflows/${WF}/dispatches`, { method: "POST",
        body: JSON.stringify({ ref: "main", inputs }) });
      if (!r.ok) return json({ erro: "O GitHub recusou o pedido (erro " + r.status + "). Avise o Claude." }, 502);
      return json({ pedido });
    }

    // Comparador de lançamentos (site Novos Lançamentos): só lê o empreendimento, não publica captação.
    if (req.method === "POST" && u.pathname === "/comparar") {
      let b; try { b = await req.json(); } catch { return json({ erro: "Pedido inválido." }, 400); }
      let url = String(b.url || "").trim();
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      try { new URL(url); } catch { return json({ erro: "Link inválido." }, 400); }
      if (url.length > 1500) return json({ erro: "Link longo demais." }, 400);
      const pedido = "c" + new Date().toISOString().replace(/\D/g, "").slice(0, 14) + "-" + crypto.randomUUID().slice(0, 8);
      const inputs = { url, pedido, modo: "comparar" };
      if (typeof b.ref === "string" && /^r[0-9a-f]{32}$/.test(b.ref) && await env.PAGINAS.get(b.ref))
        inputs.html_url = u.origin + "/pagina?pedido=" + b.ref;
      const r = await gh(`/actions/workflows/${WF}/dispatches`, { method: "POST", body: JSON.stringify({ ref: "main", inputs }) });
      if (!r.ok) return json({ erro: "O GitHub recusou o pedido (erro " + r.status + ")." }, 502);
      return json({ pedido });
    }

    return json({ erro: "Não encontrado." }, 404);
  }
};
