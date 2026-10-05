// Intermediário do hub de Captação ZFF: guarda a chave do GitHub (secret GH_TOKEN)
// e aciona o workflow captacao.yml. Nenhum aparelho precisa de configuração.
const REPO = "Gabriel-glll/Gabriel-glll.github.io", WF = "captacao.yml";
const API = "https://api.github.com/repos/" + REPO;
const HUB = "https://gabriel-glll.github.io/novos-lancamentos/captacao.html";
const ORIGENS = [/^https:\/\/gabriel-glll\.github\.io$/, /^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];

export default {
  async fetch(req, env) {
    const origem = req.headers.get("Origin") || "";
    const ok = ORIGENS.some(r => r.test(origem));
    const cors = { "Access-Control-Allow-Origin": ok ? origem : "https://gabriel-glll.github.io",
                   "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const gh = (p, init = {}) => fetch(API + p, { ...init, headers: { Authorization: "Bearer " + env.GH_TOKEN,
      Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "captacao-zff", ...(init.headers || {}) } });
    const u = new URL(req.url);

    // Página entregue pelo navegador do corretor (sites com anti-robô): lida pelo GitHub Actions.
    if (req.method === "GET" && u.pathname === "/pagina") {
      const k = (u.searchParams.get("pedido") || "").replace(/[^\w-]/g, "");
      const h = k && await env.PAGINAS.get(k);
      return h ? new Response(h, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } })
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
      return Response.redirect(HUB + "#receber=" + ref + "&url=" + encodeURIComponent(url), 303);
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
            "Aplique exatamente as instruções do corretor. Não invente nada que não esteja no texto original, nos dados " +
            "ou nas instruções. Nunca inclua telefones, e-mails, links, nomes de imobiliárias, corretores ou CRECI. " +
            "Responda somente com o texto final da descrição, em parágrafos curtos, sem título, sem aspas e sem comentários." },
          { role: "user", content: `INSTRUÇÕES DO CORRETOR:
${obs}

DADOS DO IMÓVEL:
${dados}

TEXTO ORIGINAL:
${texto || "(sem descrição — escreva uma curta, só com os dados acima)"}` }
        ]
      }).catch(() => null);
      return json({ texto: (r && r.response || "").trim() });
    }

    if (!ok) return json({ erro: "Origem não autorizada." }, 403);

    // Excluir captação (botão no hub, com confirmação)
    if (req.method === "POST" && u.pathname === "/excluir") {
      let b; try { b = await req.json(); } catch { return json({ erro: "Pedido inválido." }, 400); }
      const slug = String(b.slug || "").replace(/[^a-z0-9-]/g, "");
      if (!slug || slug.length > 200) return json({ erro: "Captação inválida." }, 400);
      const pedido = "x" + new Date().toISOString().replace(/\D/g, "").slice(0, 14) + "-" + crypto.randomUUID().slice(0, 8);
      const r = await gh(`/actions/workflows/${WF}/dispatches`, { method: "POST",
        body: JSON.stringify({ ref: "main", inputs: { url: slug, pedido, modo: "excluir" } }) });
      if (!r.ok) return json({ erro: "O GitHub recusou o pedido (erro " + r.status + ")." }, 502);
      return json({ pedido });
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

    if (req.method === "GET" && u.pathname === "/status") {
      const pedido = (u.searchParams.get("pedido") || "").replace(/[^\w-]/g, "");
      if (!pedido) return json({ erro: "Pedido ausente." }, 400);
      const r = await gh(`/contents/captacao/pedidos/${pedido}.json?ref=main`, { headers: { Accept: "application/vnd.github.raw+json" } });
      if (r.ok) return json({ estado: "pronto", resultado: await r.json() });
      const rr = await gh(`/actions/workflows/${WF}/runs?per_page=20`);
      const run = rr.ok ? (await rr.json()).workflow_runs.find(x => x.display_title === "Captação " + pedido) : null;
      if (run && run.status === "completed" && run.conclusion !== "success")
        return json({ estado: "falhou" });
      return json({ estado: "andamento" });
    }
    return json({ erro: "Não encontrado." }, 404);
  }
};
