"""Comparador de lançamentos (site Novos Lançamentos): lê a página de um empreendimento de outro site
e devolve os campos do comparativo + até 10 fotos. Reaproveita a leitura do gerar.py (Captação).

Saída: captacao/pedidos/<pedido>.json  (lido pelo Worker em /status)
       captacao/comparar/<pedido>/NN.jpg (fotos publicadas no GitHub Pages)
Só preenche o que a página traz; o resto fica vazio para o corretor completar.

Uso: python comparar.py --url <link> [--pedido ID] [--html-url <página enviada pelo navegador>]
"""
import argparse, datetime, io, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar
from gerar import Falha, sem_acento, numero, inteiro, limpo, json_seguro, salvar_json
from PIL import Image, ImageOps

PASTA = os.path.join(gerar.PASTA, "comparar")
SITE = gerar.SITE + "comparar/"
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
    destino = os.path.join(PASTA, pedido)
    os.makedirs(destino, exist_ok=True)
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
        im.save(os.path.join(destino, nome), "JPEG", quality=85, optimize=True, progressive=True)
        salvas.append(SITE + pedido + "/" + nome)
    return salvas


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
    for camada in (apto, do_texto(texto), geral):   # o mais confiável primeiro
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
    print(json.dumps(res, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
