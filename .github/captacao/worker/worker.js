// Intermediário do hub de Captação ZFF: guarda a chave do GitHub (secret GH_TOKEN)
// e aciona o workflow captacao.yml. Nenhum aparelho precisa de configuração.
const REPO = "Gabriel-glll/Gabriel-glll.github.io", WF = "captacao.yml";
const API = "https://api.github.com/repos/" + REPO;
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

    if (!ok) return json({ erro: "Origem não autorizada." }, 403);

    if (req.method === "POST" && u.pathname === "/gerar") {
      let b; try { b = await req.json(); } catch { return json({ erro: "Pedido inválido." }, 400); }
      let url = String(b.url || "").trim();
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      try { new URL(url); } catch { return json({ erro: "Link inválido." }, 400); }
      if (url.length > 1500) return json({ erro: "Link longo demais." }, 400);
      const codigo = String(b.codigo || "").replace(/[^\w-]/g, "").slice(0, 12);
      const valor = String(b.valor || "").replace(/[^\d.,]/g, "").slice(0, 15);
      const pedido = new Date().toISOString().replace(/\D/g, "").slice(0, 14) + "-" + crypto.randomUUID().slice(0, 8);
      const inputs = { url, pedido, codigo, valor };
      if (typeof b.html === "string" && b.html.length > 500) {
        if (b.html.length > 8e6) return json({ erro: "Página grande demais." }, 400);
        await env.PAGINAS.put(pedido, b.html, { expirationTtl: 3600 });
        inputs.html_url = u.origin + "/pagina?pedido=" + pedido;
      }
      const r = await gh(`/actions/workflows/${WF}/dispatches`, { method: "POST",
        body: JSON.stringify({ ref: "main", inputs }) });
      if (!r.ok) return json({ erro: "O GitHub recusou o pedido (erro " + r.status + "). Avise o Claude." }, 502);
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
