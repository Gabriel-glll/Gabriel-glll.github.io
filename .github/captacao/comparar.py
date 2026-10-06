"""Comparador de lançamentos (site Novos Lançamentos): lê a página de um empreendimento de outro site
e devolve os campos do comparativo + até 10 fotos. Reaproveita a leitura do gerar.py (Captação).

Saída: resultado e fotos vão para a Cloudflare pelo Worker (/publicar, como a Captação):
       fotos em <motor>/imovel/comparar-<pedido>/fotos/NN.jpg; o resultado é lido em /status.
       Cópia do resultado em captacao/pedidos/<pedido>.json (registrada em _mudou.txt).
Só preenche o que a página traz; o resto fica vazio para o corretor completar.

Uso: python comparar.py --url <link> [--pedido ID] [--html-url <página enviada pelo navegador>]
"""
import argparse, datetime, io, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar
from gerar import Falha, sem_acento, numero, inteiro, limpo, json_seguro, salvar_json
from PIL import Image, ImageOps

MOTOR = gerar.SITE_MOTOR
MAX_FOTOS = 10
MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto",
         "Setembro", "Outubro", "Novembro", "Dezembro"]
MES_N = {sem_acento(m).lower()[:3]: i for i, m in enumerate(MESES, 1)}
LAZER = re.compile(r"(?i)piscina|churrasq|gourmet|academia|fitness|sal[aã]o|brinquedoteca|playground|play|quadra|"
                   r"pet|cowork|sauna|spa|cinema|bicicl|lounge|deck|solarium|pub|mirante|beach|horta|pomar|"
                   r"pilates|jogos|festas|lavanderia|market|mercad|car ?wash|praça|redário|ofur|quiosque")


def m2(v):
    return f"{limpo(v):n}".replace(".", ",") if isinstance(limpo(v), float) else f"{limpo(v):,}".replace(",", ".")


def faixa(vals, sing, plur=None):
    vals = sorted({v for v in vals if v})
    if not vals:
        return ""
    plur = plur or sing + "s"
    txt = str(vals[0]) if len(vals) == 1 else ", ".join(map(str, vals[:-1])) + " e " + str(vals[-1])
    return f"{txt} {sing if vals[-1] == 1 else plur}"


def data_ext(iso):
    m = re.match(r"(\d{4})-(\d{2})", iso or "")
    return f"{MESES[int(m.group(2)) - 1]} de {m.group(1)}" if m else ""


def brl(v):
    return "R$ " + f"{int(round(v)):,}".replace(",", ".")


# ---------------------------------------------------------------- apto.vc (dados estruturados)
def de_apto(h):
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', h, re.S)
    j = json_seguro(m.group(1)) if m else None
    d = (((j or {}).get("props") or {}).get("pageProps") or {}).get("data")
    if not isinstance(d, dict) or d.get("__typename") != "Realty":
        return {}, []
    fp = d.get("floorplans") or []
    areas = sorted({limpo(numero(f.get("area"))) for f in fp if f.get("area")})
    precos = [numero(f.get("price")) for f in fp if numero(f.get("price"))]
    quartos = [inteiro(f.get("bedrooms")) for f in fp]
    suites = [inteiro(f.get("suites")) for f in fp]
    vagas = [inteiro(f.get("parking")) for f in fp]
    dor = faixa(quartos, "dormitório")
    if any(suites):
        dor += " (" + faixa(suites, "suíte") + ")"
    empresas = [c.get("name") for s in d.get("companySections") or [] for c in s.get("companies") or [] if c.get("name")]
    bairro = ((d.get("neighborhoods") or [{}])[0] or {}).get("name") or ""
    cidade = (d.get("city") or {}).get("name") or ""
    r = {
        "n": d.get("name"), "c": " e ".join(dict.fromkeys(empresas)), "st": d.get("statusLabel") or "",
        "b": bairro + (f" - {cidade}" if cidade and cidade != "Campinas" else ""),
        "end": d.get("address") or "", "ent": data_ext(d.get("ready")),
        "ter": f"{m2(numero(d['lotArea']))} m²" if numero(d.get("lotArea")) else "",
        "tor": str(d.get("towers") or "") + (f" ({d['floors']} andares)" if d.get("towers") and d.get("floors") else ""),
        "un": str(d.get("units") or ""),
        "m2": (" e ".join(m2(a) for a in areas) if len(areas) <= 3 else f"{m2(areas[0])} a {m2(areas[-1])}") + " m²" if areas else "",
        "dor": dor, "vg": faixa(vagas, "vaga"),
        "lz": "\n".join(d.get("commonAreas") or []),
        "val": "A partir de " + brl(min(precos)) if precos else "",
    }
    fotos = [x.get("url") for k in ("designImages", "apartmentImages") for x in d.get(k) or [] if x.get("url")]
    return {k: v for k, v in r.items() if v}, fotos


# ---------------------------------------------------------------- texto da página (qualquer site)
def do_texto(t):
    tl = sem_acento(t).lower()
    r = {}
    m = re.search(r"torre unica|unica torre", tl)
    if m:
        r["tor"] = "1"
    else:
        m = re.search(r"\b(\d{1,2})\s*torres\b", tl)
        if m:
            r["tor"] = m.group(1)
    m = re.search(r"\b(\d{1,2})\s*elevadores?\b", tl)
    if m:
        r["el"] = m.group(1)
    m = re.search(r"\b(\d{2,4}|\d\.\d{3})\s*(?:unidades|apartamentos|residencias|casas)\b(?!\s*(?:por|em cada))", tl)
    if m:
        r["un"] = m.group(1)
    m = re.search(r"(?:area (?:total )?do terreno|terreno)\s*(?:de|:)?\s*(\d{1,3}(?:\.\d{3})*(?:,\d+)?)\s*m", tl)
    if m:
        r["ter"] = m.group(1) + " m²"
    m = re.search(r"(?:previsao de entrega|entrega(?: prevista)?(?: para| em)?)\s*:?\s*(?:em\s*)?"
                  r"(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*\.?\s*(?:de\s*|/\s*)?(20\d\d)", tl)
    if m:
        r["ent"] = f"{MESES[MES_N[m.group(1)] - 1]} de {m.group(2)}"
    else:
        m = re.search(r"(?:previsao de entrega|entrega(?: prevista)?)\s*:?\s*(?:em\s*)?(\d{1,2})/(20\d\d)", tl)
        if m and 1 <= int(m.group(1)) <= 12:
            r["ent"] = f"{MESES[int(m.group(1)) - 1]} de {m.group(2)}"
    for chave, rot in (("pre-lancamento", "Pré-lançamento"), ("pre lancamento", "Pré-lançamento"),
                       ("breve lancamento", "Breve lançamento"), ("em obras", "Em obras"),
                       ("pronto para morar", "Pronto"), ("lancamento", "Lançamento")):
        if chave in tl[:4000]:
            r["st"] = rot
            break
    m = re.search(r"(varanda gourmet|varanda grill|varanda com churrasqueira|terraco gourmet|terraco|varanda|sacada)", tl)
    if m:
        r["var"] = "Sim — " + {"terraco gourmet": "terraço gourmet", "terraco": "terraço"}.get(m.group(1), m.group(1))
    m = re.search(r"(?:incorporacao|incorporadora|realizacao|construcao e incorporacao)\s*:\s*([a-z0-9&.\- ]{2,40}?)(?:\s{2}|\.|,|$)", tl)
    if m:
        # devolve com a grafia original
        i = tl.find(m.group(1))
        r["c"] = t[i:i + len(m.group(1))].strip().title() if i >= 0 else ""
    return {k: v for k, v in r.items() if v}


# ---------------------------------------------------------------- fotos
def salva_fotos(sess, urls, pedido, referer):
    pasta = "comparar-" + pedido.lower()
    salvas, hashes = [], []
    for u in urls:
        if len(salvas) >= MAX_FOTOS:
            break
        try:
            r = sess.get(u, timeout=30, headers={"Referer": referer, "Accept": "image/avif,image/webp,image/*,*/*"})
            if r.status_code != 200 or len(r.content) < 8000:
                continue
            im = ImageOps.exif_transpose(Image.open(io.BytesIO(r.content)))
        except Exception:
            continue
        w, h = im.size
        if w < 480 or h < 320 or w / h > 3.2 or h / w > 2.2:
            continue
        hs = gerar.ahash(im)
        if any(sum(a != b for a, b in zip(x, hs)) <= 10 for x in hashes):
            continue
        hashes.append(hs)
        im = im.convert("RGB")
        im.thumbnail((1600, 1600), Image.LANCZOS)
        nome = f"{len(salvas) + 1:02d}.jpg"
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=85, optimize=True, progressive=True)
        if gerar.cf_enviar(pedido, f"{pasta}/fotos/{nome}", buf.getvalue()):
            salvas.append(f"{MOTOR}/imovel/{pasta}/fotos/{nome}")
    return salvas


# ---------------------------------------------------------------- imóvel pronto (anúncio de revenda)
EMPREEND = ("ter", "tor", "un", "el")
SINAIS_LANC = re.compile(r"lancamento|na planta|pre-lancamento|breve lancamento|em construcao|em obras")
CONDO_GENERICO = re.compile(r"(?i)^(fechado|clube|com|de|do|da|horizontal|vertical|residencial|r\$|valor|mensal|incluso)\b")


def eh_lancamento(apto, meta, texto):
    if apto:
        return "pronto" not in sem_acento(apto.get("st", "")).lower()
    cab = sem_acento(" ".join(meta.get(k, "") for k in ("og:title", "og:description", "description", "title"))).lower()
    if SINAIS_LANC.search(cab):
        return True
    return bool(re.search(r"previsao de entrega|entrega prevista|data de entrega", sem_acento(texto).lower()))


def nome_condominio(d, meta, texto):
    if d.get("condominio"):
        return str(d["condominio"]).strip()
    fonte = " ".join([meta.get("og:title", ""), meta.get("og:description", ""), texto[:20000]])
    for m in re.finditer(r"\b(?:[Cc]ondom[ií]nio|[Ee]dif[ií]cio|[Rr]esidencial)\s+((?:[A-ZÀ-Ú0-9][\wÀ-ú'’.&-]*\s?){1,5})", fonte):
        nome = m.group(1).strip(" .-")
        if len(nome) > 2 and not CONDO_GENERICO.match(nome):
            return m.group(0).strip(" .-")
    return ""


def busca_web(q, sess):
    """Links de resultado para a pesquisa. Com BRAVE_KEY (API gratuita do Brave) é confiável;
    sem ela tenta o Bing, que costuma responder mal a robôs."""
    chave = os.environ.get("BRAVE_KEY", "").strip()
    try:
        if chave:
            r = sess.get("https://api.search.brave.com/res/v1/web/search", timeout=20,
                         params={"q": q, "country": "BR", "search_lang": "pt-br", "count": 8},
                         headers={"X-Subscription-Token": chave, "Accept": "application/json"})
            return [x.get("url") for x in ((r.json().get("web") or {}).get("results") or []) if x.get("url")]
        import base64, html as H
        r = sess.get("https://www.bing.com/search", params={"q": q, "setlang": "pt-BR", "cc": "BR"}, timeout=20)
        urls = []
        for u in re.findall(r'<h2[^>]*><a[^>]+href="(https?://[^"]+)"', r.text):
            u = H.unescape(u)
            m = re.search(r"[?&]u=a1([^&]+)", u)
            if m:
                u = base64.urlsafe_b64decode(m.group(1) + "=" * (-len(m.group(1)) % 4)).decode("utf-8", "ignore")
            urls.append(u)
        return urls[:8]
    except Exception:
        return []


def pesquisa_condominio(nome, cidade, sess, ja):
    """Terreno, torres, unidades e elevadores do condomínio, só de páginas que citam o condomínio e a cidade."""
    achado = {}
    base = re.sub(r"(?i)^(condom[ií]nio|edif[ií]cio|residencial)\s+", "", nome).strip()
    alvo, cid = sem_acento(base).lower(), sem_acento(cidade or "campinas").lower()
    for u in busca_web(f'"{base}" {cidade or "Campinas"} condomínio torres andares unidades', sess):
        if all(k in ja or k in achado for k in EMPREEND):
            break
        try:
            r = sess.get(u, timeout=20)
            col = gerar.Coletor()
            col.feed(r.text)
        except Exception:
            continue
        t = re.sub(r"\s+", " ", " ".join(col.texto))
        tl = sem_acento(t).lower()
        i = tl.find(alvo)
        if i < 0 or cid not in tl:
            continue
        trecho = t[max(0, i - 1500): i + 3000]   # só o entorno do nome do condomínio
        for k, v in do_texto(trecho).items():
            if k in EMPREEND and k not in ja and k not in achado:
                achado[k] = v
    return achado


def unidade(c):
    return not LAZER.search(c) and not re.search(r"(?i)portaria|seguran|elevador|condom|aceita|financ|permuta|interfone|port[aã]o|cerca|c[aâ]mera", c)


# ---------------------------------------------------------------- montagem
def comparar(url, pedido, html_url=None):
    if not re.match(r"https?://", url or ""):
        url = "https://" + (url or "").strip()
    pagina = {}
    original = gerar.baixar_pagina

    def baixa(u, h=None):
        res = original(u, h)
        pagina["html"] = res[1]
        return res
    gerar.baixar_pagina = baixa
    try:
        d = gerar.extrair(url, html_url)
    finally:
        gerar.baixar_pagina = original
    h = pagina.get("html") or ""
    col = gerar.Coletor()
    col.feed(h)
    texto = re.sub(r"\s+", " ", " ".join(col.texto))
    meta = {k: v[0] for k, v in col.meta.items()}

    apto, fotos_apto = de_apto(h)
    geral = {
        "n": re.split(r"\s+[|–-]\s+", gerar.corrige_texto(meta.get("og:title") or d.get("titulo_fonte") or ""))[0].strip(),
        "b": d.get("bairro") or "",
        "end": ", ".join(str(x) for x in (d.get("endereco"), d.get("numero")) if x),
        "m2": f"{m2(numero(d['areaUtil']))} m²" if numero(d.get("areaUtil")) else "",
        "dor": (f"{d['quartos']} dormitório{'s' if d['quartos'] > 1 else ''}" if d.get("quartos") else "")
               + (f" ({d['suites']} suíte{'s' if d['suites'] > 1 else ''})" if d.get("quartos") and d.get("suites") else ""),
        "vg": f"{d['vagas']} vaga{'s' if d['vagas'] > 1 else ''}" if inteiro(d.get("vagas")) else "",
        "lz": "\n".join(c for c in d.get("caracteristicas") or [] if LAZER.search(c)),
        "val": "A partir de " + brl(numero(d["valorVenda"])) if numero(d.get("valorVenda")) else "",
        "cond": brl(numero(d["valorCondominio"])) if numero(d.get("valorCondominio")) else "",
    }
    junto = {}
    pronto = not eh_lancamento(apto, meta, texto)
    if pronto:
        # imóvel pronto: sem incorporadora; status/entrega "Pronto"; empreendimento = dados do condomínio
        carac = d.get("caracteristicas") or []
        area = numero(d.get("areaUtil")) or numero(d.get("areaConstruida"))
        geral.update({
            "n": nome_condominio(d, meta, texto) or geral["n"],
            "m2": f"{m2(area)} m²" if area else "",
            "val": brl(numero(d["valorVenda"])) if numero(d.get("valorVenda")) else "",
            "dif": " · ".join(c for c in carac if unidade(c)),
        })
        junto.update({"c": "vazio", "st": "Pronto", "ent": "Pronto"})
        textuais = do_texto(texto)
        for k in EMPREEND[1:]:               # torres/unidades/elevadores citados no próprio anúncio
            if textuais.get(k):
                junto[k] = textuais[k]
        nome = nome_condominio(d, meta, texto)
        if nome:
            junto.update(pesquisa_condominio(nome, d.get("cidade"), d["_sessao"], junto))
        for k in EMPREEND:
            junto.setdefault(k, "vazio")
        if textuais.get("var"):
            junto["var"] = textuais["var"]
        camadas = (geral,)
    else:
        camadas = (apto, do_texto(texto), geral)   # o mais confiável primeiro
    for camada in camadas:
        for k, v in camada.items():
            if v and not junto.get(k):
                junto[k] = v
    junto["link"] = url
    urls = fotos_apto or d.get("_fotos_urls") or []
    junto["ft"] = salva_fotos(d["_sessao"], urls, pedido, d["_final"])
    return {"ok": True, "modo": "comparar", "projeto": junto}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True); ap.add_argument("--pedido", default="teste"); ap.add_argument("--html-url")
    a = ap.parse_args()
    pedido = re.sub(r"[^\w-]", "", a.pedido)
    try:
        res = comparar(a.url, pedido, a.html_url or None)
    except Falha as e:
        res = {"ok": False, "modo": "comparar", "erro": str(e)}
    except Exception as e:
        res = {"ok": False, "modo": "comparar", "erro": f"Erro inesperado ao ler a página: {e.__class__.__name__}: {e}"}
    res["quando"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    salvar_json(os.path.join(gerar.PASTA, "pedidos", pedido + ".json"), res)
    gerar.cf_enviar(pedido, "_resultado", json.dumps(res, ensure_ascii=False).encode("utf-8"))
    # o passo Publicar do workflow publica só o que estiver listado em captacao/_mudou.txt
    with open(os.path.join(gerar.PASTA, "_mudou.txt"), "a", encoding="utf-8") as m:
        m.write(f"captacao/pedidos/{pedido}.json\n")
    print(json.dumps(res, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
