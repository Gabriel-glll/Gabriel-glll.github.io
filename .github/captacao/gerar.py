"""Gerador de captações ZFF.

Lê o anúncio do imóvel (link de qualquer site), extrai dados e fotos e publica
captacao/<slug>/ no padrão da página de imóvel do site da ZFF — com contato só da ZFF.

Uso:
  python gerar.py --url <link> [--pedido ID] [--codigo CA9001] [--valor 1060000]
  python gerar.py --refazer          # re-renderiza todas as páginas com o modelo atual
"""
import argparse, datetime, hashlib, html, io, json, os, re, sys, unicodedata
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

import requests
from PIL import Image, ImageOps

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PASTA = os.path.join(RAIZ, "captacao")
MODELO = os.path.join(os.path.dirname(__file__), "modelo.html")
SITE = "https://gabriel-glll.github.io/captacao/"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/129.0 Safari/537.36")
HDR = {"User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
       "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"}
MAX_FOTOS = 60


class Falha(Exception):
    pass


# ---------------------------------------------------------------- utilidades
def sem_acento(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", sem_acento(str(s)).lower())
    return s.strip("-")


def numero(v):
    """'1.060.000,00' / '127,5' / 127 -> float"""
    if v is None or v == "":
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = re.sub(r"[^\d,.]", "", str(v))
    if not s:
        return None
    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    elif s.count(".") > 1 or re.search(r"\.\d{3}$", s):
        s = s.replace(".", "")
    try:
        return float(s)
    except ValueError:
        return None


def inteiro(v):
    n = numero(v)
    return int(n) if n is not None else None


def limpo(n):
    if n is None:
        return None
    return int(n) if float(n).is_integer() else round(n, 2)


def corrige_texto(s):
    """Texto vindo com encoding errado (Ã§, Ã£...)."""
    if s and re.search(r"Ã[\x80-\xbf§£¡©ª³µº]", s):
        try:
            return s.encode("latin-1").decode("utf-8")
        except Exception:
            pass
    return s


# Contato de terceiros nunca pode aparecer: telefones, e-mails, links, CRECI.
RE_FONE = re.compile(r"(\+?55\s*)?\(?\d{2}\)?[\s.-]*9?\s?\d{4}[\s.-]?\d{4}")
RE_MAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
RE_URL = re.compile(r"(https?://|www\.)\S+", re.I)
RE_PROIBIDO = re.compile(r"creci|whats ?app|ligue|telefone|contato|fale com|corretor|imobili[aá]ria|"
                         r"cod(igo|\.)?\s*(do )?(im[oó]vel|anuncio|ref)|refer[eê]ncia\s*:", re.I)


def higieniza(paragrafos):
    saida = []
    for p in paragrafos:
        p = corrige_texto(html.unescape(p)).strip()
        if not p:
            continue
        if RE_PROIBIDO.search(p) and (RE_FONE.search(p) or RE_MAIL.search(p) or len(p) < 120):
            continue
        p = RE_MAIL.sub("", RE_URL.sub("", RE_FONE.sub("", p)))
        p = re.sub(r"\s{2,}", " ", p).strip(" -–|•")
        if len(p) > 1:
            saida.append(p)
    return saida


def paragrafos_de_html(h):
    h = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</li>", "\n", h or "")
    t = re.sub(r"<[^>]+>", "", h)
    return [l.strip() for l in html.unescape(t).split("\n") if l.strip()]


# ---------------------------------------------------------------- leitura
def baixar_pagina(url, html_url=None):
    s = requests.Session()
    s.headers.update(HDR)
    if html_url:
        # página já aberta pelo corretor no navegador dele (sites com anti-robô)
        try:
            r = s.get(html_url, timeout=40)
        except requests.RequestException as e:
            raise Falha(f"Não consegui receber a página enviada pelo navegador ({e.__class__.__name__}).")
        if r.status_code != 200:
            raise Falha("A página enviada pelo navegador expirou. Clique de novo em 'Captar ZFF' no anúncio.")
        r.encoding = "utf-8"
        return url, r.text, s
    try:
        r = s.get(url, timeout=40, allow_redirects=True)
    except requests.RequestException as e:
        raise Falha(f"Não consegui abrir o link ({e.__class__.__name__}).")
    if r.status_code in (403, 429, 503) or "cf-chl" in r.text[:5000] or "captcha" in r.text[:20000].lower():
        raise Falha(f"BLOQUEADO|O site {urlparse(url).netloc} bloqueia leitura automática. "
                    "Abra o anúncio no navegador e clique no favorito 'Captar ZFF'.")
    if r.status_code >= 400:
        raise Falha(f"O link respondeu com erro {r.status_code}.")
    r.encoding = r.apparent_encoding if not r.encoding or r.encoding.lower() == "iso-8859-1" else r.encoding
    return r.url, r.text, s


class Coletor(HTMLParser):
    """Coleta metas, imagens, JSON embutido e texto visível."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta, self.imgs, self.scripts, self.texto = {}, [], [], []
        self._script = None
        self._pula = 0

    def handle_starttag(self, tag, a):
        a = dict(a)
        if tag == "meta":
            k = (a.get("property") or a.get("name") or a.get("itemprop") or "").lower()
            if k and a.get("content"):
                self.meta.setdefault(k, []).append(a["content"])
        elif tag in ("img", "source"):
            for k in ("data-src", "data-lazy", "data-original", "data-zoom-image", "data-full", "src"):
                if a.get(k) and not a[k].startswith("data:"):
                    self.imgs.append(a[k]); break
            for k in ("srcset", "data-srcset"):
                if a.get(k):
                    cand = [c.strip().split(" ")[0] for c in a[k].split(",") if c.strip()]
                    if cand:
                        self.imgs.append(cand[-1])
        elif tag == "a" and a.get("href") and re.search(r"\.(jpe?g|png|webp)(\?|$)", a["href"], re.I):
            self.imgs.append(a["href"])
        elif tag == "script":
            self._script = {"type": (a.get("type") or "").lower(), "id": a.get("id"), "txt": []}
        elif tag in ("style", "noscript", "svg"):
            self._pula += 1

    def handle_endtag(self, tag):
        if tag == "script" and self._script is not None:
            self.scripts.append(self._script); self._script = None
        elif tag in ("style", "noscript", "svg") and self._pula:
            self._pula -= 1

    def handle_data(self, d):
        if self._script is not None:
            self._script["txt"].append(d)
        elif not self._pula and d.strip():
            self.texto.append(d.strip())


class TextoDe(HTMLParser):
    """Texto do primeiro (ou de todos os) elemento(s) cujo id/class casa com o padrão."""
    VAZIOS = {"br", "img", "input", "meta", "link", "hr", "source", "wbr", "area", "col", "embed", "param", "track"}

    def __init__(self, padrao, todos=False):
        super().__init__(convert_charrefs=True)
        self.p, self.todos = re.compile(padrao, re.I), todos
        self.prof, self.atual, self.res = 0, None, []
        self._pula = 0

    def handle_starttag(self, tag, a):
        if tag in self.VAZIOS:
            if self.prof and tag == "br":
                self.atual.append("\n")
            return
        if self.prof:
            self.prof += 1
            if tag in ("p", "div", "li", "h1", "h2", "h3", "h4", "span", "tr"):
                self.atual.append("\n")
            if tag in ("script", "style", "button"):
                self._pula += 1
            return
        a = dict(a)
        chave = " ".join(filter(None, [a.get("id"), a.get("class")]))
        if chave and self.p.search(chave) and (self.todos or not self.res):
            self.prof, self.atual = 1, []

    def handle_endtag(self, tag):
        if tag in self.VAZIOS or not self.prof:
            return
        if tag in ("script", "style", "button") and self._pula:
            self._pula -= 1
        self.prof -= 1
        if not self.prof:
            self.res.append("".join(self.atual))

    def handle_data(self, d):
        if self.prof and not self._pula:
            self.atual.append(d)


def texto_de(h, padrao, todos=False):
    t = TextoDe(padrao, todos)
    try:
        t.feed(h)
    except Exception:
        pass
    linhas = lambda x: [re.sub(r"\s+", " ", l).strip() for l in x.split("\n") if l.strip()]
    return [linhas(x) for x in t.res] if todos else (linhas(t.res[0]) if t.res else [])


RE_LOGRADOURO = re.compile(r"(?i)(rua|r\.|av\.?|avenida|alameda|al\.|travessa|estrada|rodovia|pra[çc]a)\b")


def de_portais(h, url):
    """Imovelweb (Navent) e marcações comuns de descrição/endereço/características."""
    r = {}
    desc = texto_de(h, r"(^|\s)longDescription(\s|$)") or texto_de(h, r"description-content|descricao-imovel|property-description")
    if desc and len(" ".join(desc)) > 80:
        r["descricao"] = desc
    end = texto_de(h, r"section-location-property")
    if end:
        partes = [x.strip() for x in end[0].split(",") if x.strip()]
        if partes and RE_LOGRADOURO.match(partes[0]):
            m = re.match(r"(.+?)\s+(\d+[A-Za-z]?)$", partes[0])
            if m:
                r["endereco"], r["numero"] = m.group(1), m.group(2)
            else:
                r["endereco"] = partes[0]
        if len(partes) >= 3:
            r["bairro"], r["cidade"] = partes[-2], partes[-1]
    carac = texto_de(h, r"reactGeneralFeatures")
    if carac:
        itens = [re.sub(r"\s*\(.*?\)", "", c).strip() for c in carac]
        itens = [c for c in itens if c and not re.match(r"(?i)saiba mais|[áa]reas (comuns|privativas)$|outros$|ver (mais|menos)", c)]
        if itens:
            r["caracteristicas"] = list(dict.fromkeys(itens))
    if re.search(r"imovelweb|zapimoveis|vivareal|olx\.com", urlparse(url).netloc):
        r["iptuPeriodo"] = "mes"
    return r


def json_seguro(t):
    try:
        return json.loads(t)
    except Exception:
        return None


def percorre(o):
    pilha = [o]
    while pilha:
        x = pilha.pop()
        if isinstance(x, dict):
            yield x
            pilha.extend(x.values())
        elif isinstance(x, list):
            pilha.extend(x)


# ---------------------------------------------------------------- extratores
def de_flip(dados):
    """Sites feitos na plataforma Flip (mesma do site da ZFF)."""
    alvo = None
    for d in percorre(dados):
        if isinstance(d.get("detalhes"), dict) and ("photos" in d or "fotos" in d) and ("valorVenda" in d or "codigoImovel" in d):
            alvo = d; break
    if not alvo:
        return {}
    det = alvo.get("detalhes") or {}
    fotos = sorted(alvo.get("photos") or alvo.get("fotos") or [], key=lambda f: f.get("ordem") or 0)
    carac = [c for c in (alvo.get("caracteristicas") or []) + (alvo.get("caracteristicasCondominio") or [])
             if isinstance(c, str) and not re.match(r"(?i)área total$", c)]
    carac = [re.sub(r":(\S)", r": \1", corrige_texto(c)) for c in carac]
    cond = alvo.get("condominio")
    loc = alvo.get("localizacao") or {}
    return {
        "tipo": alvo.get("tipoImovel"),
        "finalidade": "Locação" if alvo.get("disponivelParaAluguel") and not alvo.get("disponivelParaVenda") else "Venda",
        "endereco": alvo.get("endereco"), "numero": alvo.get("numero"),
        "bairro": alvo.get("bairro"), "cidade": alvo.get("cidade"), "uf": alvo.get("estado"),
        "condominio": cond.get("nome") if isinstance(cond, dict) else (cond if isinstance(cond, str) else None),
        "areaTerreno": det.get("areaTerreno"), "areaConstruida": det.get("areaConstruida"),
        "areaUtil": det.get("areaUtil") or det.get("areaPrivativa"),
        "quartos": det.get("dormitorios"), "suites": det.get("suites"), "banheiros": det.get("banheiros"),
        "vagasCob": det.get("vagasCobertas"), "vagasDes": det.get("vagasDescobertas"),
        "valorVenda": alvo.get("valorVenda"), "valorLocacao": alvo.get("valorLocacao"),
        "valorCondominio": det.get("valorCondominio"), "valorIptu": det.get("valorIptuItr"),
        "iptuPeriodo": "mes" if (det.get("condicaoPagamentoIptuItr") or "").upper().startswith("MENS") else "ano",
        "descricao": paragrafos_de_html(det.get("observacao") or ""),
        "caracteristicas": carac,
        "fotos": [f.get("url") for f in fotos if f.get("url") and (f.get("tipo") in (None, "FOTO"))],
        "lat": loc.get("lat"), "lon": loc.get("lon"),
    }


def de_jsonld(blocos):
    r = {}
    for b in blocos:
        for d in percorre(b):
            t = d.get("@type")
            t = " ".join(t) if isinstance(t, list) else str(t or "")
            if not re.search(r"Residence|House|Apartment|Accommodation|Product|Offer|RealEstateListing|Place|SingleFamily", t):
                continue
            if re.search(r"Organization|Agent|Breadcrumb|WebSite", t):
                continue
            r.setdefault("titulo_fonte", d.get("name"))
            if d.get("description"):
                r.setdefault("descricao", paragrafos_de_html(d["description"]))
            fs = d.get("floorSize")
            if isinstance(fs, dict):
                r.setdefault("areaUtil", numero(fs.get("value")))
            for k_src, k in (("numberOfBedrooms", "quartos"), ("numberOfRooms", "quartos"),
                             ("numberOfBathroomsTotal", "banheiros"), ("numberOfBathrooms", "banheiros")):
                if d.get(k_src) is not None:
                    r.setdefault(k, inteiro(d[k_src] if not isinstance(d[k_src], dict) else d[k_src].get("value")))
            ad = d.get("address")
            if isinstance(ad, dict):
                r.setdefault("endereco", ad.get("streetAddress"))
                loc = (ad.get("addressLocality") or "").split(",")[0].strip() or None
                reg = (ad.get("addressRegion") or "").strip()
                eh_uf = len(reg) == 2 or sem_acento(reg).lower() in ("sao paulo", "minas gerais", "rio de janeiro", "parana")
                r.setdefault("bairro", ad.get("addressNeighborhood") or (None if eh_uf else reg or None))
                r.setdefault("cidade", loc)
                if eh_uf and len(reg) == 2:
                    r.setdefault("uf", reg)
            geo = d.get("geo")
            if isinstance(geo, dict) and geo.get("latitude"):
                r.setdefault("lat", numero(geo["latitude"]) * (-1 if str(geo["latitude"]).startswith("-") else 1))
                r.setdefault("lon", numero(geo["longitude"]) * (-1 if str(geo["longitude"]).startswith("-") else 1))
            of = d.get("offers")
            of = of[0] if isinstance(of, list) and of else of
            if isinstance(of, dict) and of.get("price"):
                r.setdefault("valorVenda", numero(of["price"]))
            img = d.get("image")
            imgs = img if isinstance(img, list) else [img] if img else []
            imgs = [i.get("url") if isinstance(i, dict) else i for i in imgs]
            if imgs:
                r.setdefault("fotos", [i for i in imgs if isinstance(i, str)])
    return {k: v for k, v in r.items() if v not in (None, "", [])}


CARAC_CONHECIDAS = [
    "Piscina", "Churrasqueira", "Espaço gourmet", "Varanda gourmet", "Área gourmet", "Varanda", "Sacada", "Quintal",
    "Lavabo", "Área de serviço", "Lavanderia", "Cozinha americana", "Cozinha planejada", "Armários planejados",
    "Armários na cozinha", "Armários nos dormitórios", "Closet", "Escritório", "Home office", "Ar-condicionado",
    "Aquecimento solar", "Aquecimento a gás", "Energia solar", "Piso em porcelanato", "Piso laminado", "Mobiliado",
    "Semi-mobiliado", "Aceita pets", "Edícula", "Despensa", "Hidromassagem", "Sauna", "Lareira", "Portaria 24h",
    "Segurança 24h", "Playground", "Quadra poliesportiva", "Quadra de tênis", "Campo de futebol", "Academia",
    "Salão de festas", "Salão de jogos", "Brinquedoteca", "Elevador", "Interfone", "Portão eletrônico",
    "Cerca elétrica", "Câmeras de segurança", "Pet place", "Espaço pet", "Coworking", "Bicicletário",
    "Aceita financiamento", "Aceita permuta",
]


def de_texto(texto):
    """Extração por padrões no texto visível — último recurso."""
    t = " ".join(texto)
    t = re.sub(r"\s+", " ", t)
    r = {}

    def pega(pads, conv=inteiro):
        for p in pads:
            m = re.search(p, t, re.I)
            if m:
                v = conv(m.group(1))
                if v:
                    return v
    r["quartos"] = pega([r"(\d+)\s*(?:quartos?|dormit[óo]rios?|dorms?\.?)\b", r"(?:quartos?|dormit[óo]rios?)\s*:?\s*(\d+)"])
    r["suites"] = pega([r"(\d+)\s*su[ií]tes?", r"su[ií]tes?\s*:?\s*(\d+)"])
    r["banheiros"] = pega([r"(\d+)\s*banheiros?", r"banheiros?\s*:?\s*(\d+)"])
    r["vagas"] = pega([r"(\d+)\s*vagas?", r"vagas?(?: de garagem)?\s*:?\s*(\d+)"])
    area = r"(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:\.\d+)?)\s*(?:m²|m2|metros)"
    r["areaTerreno"] = pega([r"(?:[áa]rea (?:do )?terreno|terreno)\s*:?\s*" + area, area + r"\s*(?:de )?terreno"], numero)
    r["areaConstruida"] = pega([r"[áa]rea constru[íi]da\s*:?\s*" + area, area + r"\s*(?:de [áa]rea )?constru[íi]d"], numero)
    r["areaUtil"] = pega([r"[áa]rea (?:[úu]til|privativa)\s*:?\s*" + area, area + r"\s*(?:de [áa]rea )?(?:[úu]til|[úu]teis|privativ)"], numero)
    if not any((r["areaTerreno"], r["areaConstruida"], r["areaUtil"])):
        r["areaUtil"] = pega([area], numero)
    preco = r"R\$\s*([\d.]+(?:,\d{2})?)"
    r["valorVenda"] = pega([r"(?:venda|valor|pre[çc]o)\s*:?\s*" + preco, preco], numero)
    r["valorCondominio"] = pega([r"condom[íi]nio\s*:?\s*" + preco], numero)
    r["valorIptu"] = pega([r"IPTU\s*:?\s*" + preco], numero)
    if r.get("valorVenda") and r["valorVenda"] < 20000:
        r["valorVenda"] = None
    tl = sem_acento(t).lower()
    r["caracteristicas"] = [c for c in CARAC_CONHECIDAS if sem_acento(c).lower() in tl]
    return {k: v for k, v in r.items() if v not in (None, "", [])}


def completa_caracteristicas(lista, texto):
    """Lista do anúncio + itens conhecidos citados na descrição (sem repetir)."""
    vistos = {sem_acento(c).lower() for c in lista}
    t = sem_acento(texto).lower()
    extra = [c for c in CARAC_CONHECIDAS if sem_acento(c).lower() in t and sem_acento(c).lower() not in vistos]
    sinonimos = {"espaco fitness": "Academia", "portaria 24 horas": "Portaria 24h", "planejados": "Armários planejados"}
    for k, v in sinonimos.items():
        if k in t and sem_acento(v).lower() not in vistos and v not in extra:
            extra.append(v)
    return list(lista) + extra


def tipo_de(*fontes):
    s = sem_acento(" ".join(str(f or "") for f in fontes)).lower()
    for chave, nome in (("cobertura", "Cobertura"), ("apartamento", "Apartamento"), ("apto", "Apartamento"),
                        ("sobrado", "Sobrado"), ("chacara", "Chácara"), ("sitio", "Sítio"), ("terreno", "Terreno"),
                        ("lote", "Terreno"), ("galpao", "Galpão"), ("sala comercial", "Sala"), ("kitnet", "Kitnet"),
                        ("studio", "Studio"), ("casa", "Casa")):
        if re.search(r"\b" + chave + r"\b", s):
            return nome
    return "Imóvel"


# ---------------------------------------------------------------- fotos
def url_foto_ok(u):
    ul = u.lower()
    if not re.search(r"\.(jpe?g|png|webp|avif)|/image|img|foto|photo|resize|media", ul):
        return False
    return not re.search(r"logo|icon|sprite|favicon|avatar|banner|placeholder|blank|loading|marca|selo|whatsapp|"
                         r"facebook|instagram|google|maps\.|tile\.|\.svg|\.gif|pixel|tracking|badge|flag", ul)


def candidatas(base, col, extra):
    vistos, saida = set(), []
    for u in extra + col.imgs:
        if not isinstance(u, str):
            continue
        u = html.unescape(u.strip())
        if u.startswith("//"):
            u = "https:" + u
        u = urljoin(base, u)
        if not u.startswith("http") or u in vistos or not url_foto_ok(u):
            continue
        vistos.add(u); saida.append(u)
    # URLs de imagem dentro de scripts (galerias montadas por JS)
    for s in col.scripts:
        for u in re.findall(r"https?:\\?/\\?/[^\"'\s<>]+?\.(?:jpe?g|webp|png)(?:\?[^\"'\s<>]*)?", "".join(s["txt"]), re.I):
            u = u.replace("\\/", "/").replace("\\u002F", "/")
            if u not in vistos and url_foto_ok(u):
                vistos.add(u); saida.append(u)
    return melhores_tamanhos(saida)


def _tam(u):
    m = re.search(r"/(\d{2,4})x(\d{2,4})/", u)
    return int(m.group(1)) * int(m.group(2)) if m else 0


def melhores_tamanhos(urls):
    """Mesma foto em vários tamanhos -> fica a maior; e só a galeria principal
    (pasta com mais fotos), quando dá para identificar."""
    grupos, ordem = {}, []
    for u in urls:
        nome = urlparse(u).path.rsplit("/", 1)[-1]
        if not nome:
            continue
        if nome not in grupos:
            grupos[nome] = u; ordem.append(nome)
        elif _tam(u) > _tam(grupos[nome]) or (_tam(u) == _tam(grupos[nome]) and "/resize/" in grupos[nome]):
            grupos[nome] = u
    escolhidas = [grupos[n] for n in ordem]
    pasta = lambda u: re.sub(r"/resize/|/\d{2,4}x\d{2,4}$", "/", urlparse(u).path.rsplit("/", 1)[0])
    cont = {}
    for u in escolhidas:
        cont[pasta(u)] = cont.get(pasta(u), 0) + 1
    topo, n = max(cont.items(), key=lambda x: x[1]) if cont else (None, 0)
    if n >= 5:
        escolhidas = [u for u in escolhidas if pasta(u) == topo]
    return [u.split("?")[0] if _tam(u) else u for u in escolhidas]


def ahash(im):
    g = im.convert("L").resize((12, 12))
    px = list(g.tobytes()); m = sum(px) / len(px)
    return "".join("1" if p > m else "0" for p in px)


def baixa_fotos(sess, urls, destino, referer):
    os.makedirs(destino, exist_ok=True)
    salvas, hashes = [], []
    for u in urls:
        if len(salvas) >= MAX_FOTOS:
            break
        try:
            r = sess.get(u, timeout=30, headers={"Referer": referer, "Accept": "image/avif,image/webp,image/*,*/*"})
            if r.status_code != 200 or len(r.content) < 8000:
                continue
            im = Image.open(io.BytesIO(r.content))
            im = ImageOps.exif_transpose(im)
        except Exception:
            continue
        w, h = im.size
        if w < 480 or h < 320 or w / h > 3.2 or h / w > 2.2:
            continue
        hs = ahash(im)
        dup = next((i for i, x in enumerate(hashes) if sum(a != b for a, b in zip(x, hs)) <= 10), None)
        if dup is not None:
            # mesma foto em resolução maior? troca
            if w * h > salvas[dup][1]:
                salvas[dup] = (im, w * h)
            continue
        hashes.append(hs); salvas.append((im, w * h))
    nomes = []
    for i, (im, _) in enumerate(salvas, 1):
        im = im.convert("RGB")
        im.thumbnail((1920, 1920), Image.LANCZOS)
        nome = f"{i:02d}.jpg"
        im.save(os.path.join(destino, nome), "JPEG", quality=84, optimize=True, progressive=True)
        nomes.append("fotos/" + nome)
    return nomes


# ---------------------------------------------------------------- montagem
def extrair(url, html_url=None):
    final, texto_html, sess = baixar_pagina(url, html_url)
    col = Coletor()
    col.feed(texto_html)
    m = re.search(r"<!--IMGS (\[.*?\]) -->", texto_html, re.S)
    if m:
        col.imgs += [u for u in (json_seguro(m.group(1)) or []) if isinstance(u, str)]
    dados = {}
    blocos_json, ld = [], []
    for s in col.scripts:
        t = "".join(s["txt"]).strip()
        if s["type"] == "application/ld+json":
            j = json_seguro(t)
            if j is not None:
                ld.append(j)
        elif s["type"] in ("application/json",) or s["id"] in ("__NEXT_DATA__", "__NUXT_DATA__"):
            j = json_seguro(t)
            if j is not None:
                blocos_json.append(j)
    for j in blocos_json:
        dados = de_flip(j)
        if dados:
            break
    camadas = [dados, de_portais(texto_html, final), de_jsonld(ld)]
    meta = {k: v[0] for k, v in col.meta.items()}
    camadas.append({
        "titulo_fonte": meta.get("og:title") or (col.texto[0] if col.texto else None),
        "descricao": paragrafos_de_html(meta.get("og:description") or meta.get("description") or ""),
    })
    camadas.append(de_texto(col.texto))
    junto = {}
    for c in camadas:
        for k, v in c.items():
            if junto.get(k) in (None, "", []) and v not in (None, "", []):
                junto[k] = v
    if junto.get("endereco") and not junto.get("numero"):
        m = re.match(r"(.+?),?\s+(\d+[A-Za-z]?)$", junto["endereco"])
        if m:
            junto["endereco"], junto["numero"] = m.group(1), m.group(2)
    if junto.get("quartos") and junto.get("suites") and junto["suites"] > junto["quartos"]:
        junto["suites"] = None
    estruturadas = [urljoin(final, u) for u in (dados.get("fotos") or []) if isinstance(u, str)]
    if len(estruturadas) >= 3:
        # o site entrega a lista exata de fotos do imóvel -> usa só ela (evita fotos de "imóveis similares")
        junto["_fotos_urls"] = estruturadas
    else:
        extra = list(junto.get("fotos") or []) + col.meta.get("og:image", [])
        junto["_fotos_urls"] = candidatas(final, col, extra)
    junto["_sessao"] = sess
    junto["_final"] = final
    return junto


def titulo_padrao(d):
    tipo = d["tipo"]
    fem = tipo in ("Casa", "Cobertura", "Chácara", "Sala", "Kitnet")
    partes = [f"{tipo} à venda em {d.get('cidade') or 'Campinas'}"]
    if d.get("bairro"):
        partes.append(d["bairro"])
    if d.get("quartos"):
        partes.append(f"com {d['quartos']} quarto{'s' if d['quartos'] > 1 else ''}")
    area = d.get("areaConstruida") or d.get("areaUtil") or d.get("areaTerreno")
    if area:
        partes.append(f"com {limpo(area)} m²")
    if d.get("condominio"):
        partes.append(d["condominio"])
    return ", ".join(partes)


def proximo_codigo(lista, tipo):
    pre = {"Casa": "CA", "Sobrado": "CA", "Apartamento": "AP", "Cobertura": "AP", "Studio": "AP", "Kitnet": "AP",
           "Terreno": "TE", "Chácara": "CH", "Sítio": "CH", "Sala": "SA", "Galpão": "GA"}.get(tipo, "IM")
    usados = {i["codigo"] for i in lista}
    n = 9001
    while f"{pre}{n}" in usados:
        n += 1
    return f"{pre}{n}"


def carregar_lista():
    p = os.path.join(PASTA, "lista.json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else []


def salvar_json(caminho, obj):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


def renderizar(slug):
    pasta = os.path.join(PASTA, slug)
    d = json.load(open(os.path.join(pasta, "dados.json"), encoding="utf-8"))
    m = open(MODELO, encoding="utf-8").read()
    publico = {k: v for k, v in d.items() if not k.startswith("_")}
    url = SITE + slug + "/"
    desc = " ".join(d.get("descricao") or [])[:300] or d["titulo"]
    aba = f"{d['tipo']} para {d.get('finalidade') or 'Venda'} em {d.get('bairro') or ''} - {d.get('cidade') or ''}".strip(" -")
    og = url + d["fotos"][0] if d.get("fotos") else SITE + "assets/zff-logo.jpeg"
    js = json.dumps(publico, ensure_ascii=False).replace("</", "<\\/")
    for k, v in (("{{TITULO_ABA}}", aba), ("{{DESCRICAO}}", desc), ("{{OG_IMAGEM}}", og), ("{{URL}}", url)):
        m = m.replace(k, html.escape(v, quote=True))
    m = m.replace("/*DADOS*/null/*FIM*/", js)
    open(os.path.join(pasta, "index.html"), "w", encoding="utf-8").write(m)
    return url


def gerar(url, codigo=None, valor=None, html_url=None):
    if not re.match(r"https?://", url or ""):
        url = "https://" + (url or "").strip()
    d = extrair(url, html_url)
    d["tipo"] = d.get("tipo") or tipo_de(d.get("titulo_fonte"), url, " ".join(d.get("descricao") or [])[:300])
    d["tipo"] = corrige_texto(d["tipo"]).strip().capitalize() if d["tipo"] else "Imóvel"
    for k in ("endereco", "bairro", "cidade", "condominio", "titulo_fonte"):
        if isinstance(d.get(k), str):
            d[k] = corrige_texto(d[k]).strip() or None
    if valor:
        d["valorVenda"] = numero(valor)
    lista = carregar_lista()
    codigo = (codigo or "").strip().upper() or proximo_codigo(lista, d["tipo"])
    d["titulo"] = titulo_padrao(d)
    vagas = (d.get("vagasCob") or 0) + (d.get("vagasDes") or 0) or d.get("vagas")
    area = d.get("areaConstruida") or d.get("areaUtil") or d.get("areaTerreno")
    partes = [slugify(d["tipo"]), "venda"]
    if d.get("quartos"): partes.append(f"{d['quartos']}-dormitorios")
    if vagas: partes.append(f"{vagas}-vagas")
    if area: partes.append(f"{limpo(area)}m2")
    partes += [slugify(d.get("cidade") or ""), slugify(d.get("bairro") or ""), codigo.lower()]
    slug = "-".join(p for p in partes if p)
    # mesmo código já usado em outra pasta -> remove a antiga
    for i in list(lista):
        if i["codigo"] == codigo and i["slug"] != slug:
            lista.remove(i)
    pasta = os.path.join(PASTA, slug)
    fotos_dir = os.path.join(pasta, "fotos")
    if os.path.isdir(fotos_dir):
        for f in os.listdir(fotos_dir):
            os.remove(os.path.join(fotos_dir, f))
    fotos = baixa_fotos(d["_sessao"], d["_fotos_urls"], fotos_dir, d["_final"])
    if not fotos:
        raise Falha("Não encontrei fotos do imóvel nesse link.")
    descricao = higieniza(d.get("descricao") or [])
    descricao = [re.sub(r"\s*-\s*\d{2}/\d{2}/\d{4}$", "", p) for p in descricao]
    carac = completa_caracteristicas(d.get("caracteristicas") or [], " ".join(descricao))
    # descrição curta (só meta) costuma ser o próprio título do anúncio -> descarta
    if len(" ".join(descricao)) < 60:
        descricao = []
    saida = {
        "codigo": codigo, "tipo": d["tipo"], "finalidade": d.get("finalidade") or "Venda", "titulo": d["titulo"],
        "endereco": d.get("endereco"), "numero": d.get("numero"), "bairro": d.get("bairro"),
        "cidade": d.get("cidade"), "uf": d.get("uf") or "SP", "condominio": d.get("condominio"),
        "areaTerreno": limpo(numero(d.get("areaTerreno"))), "areaConstruida": limpo(numero(d.get("areaConstruida"))),
        "areaUtil": limpo(numero(d.get("areaUtil"))) if not d.get("areaConstruida") else None,
        "quartos": inteiro(d.get("quartos")), "suites": inteiro(d.get("suites")), "banheiros": inteiro(d.get("banheiros")),
        "vagasCob": inteiro(d.get("vagasCob")), "vagasDes": inteiro(d.get("vagasDes")),
        "vagas": inteiro(d.get("vagas")) if d.get("vagasCob") is None and d.get("vagasDes") is None else None,
        "valorVenda": limpo(numero(d.get("valorVenda"))), "valorLocacao": limpo(numero(d.get("valorLocacao"))),
        "valorCondominio": limpo(numero(d.get("valorCondominio"))), "valorIptu": limpo(numero(d.get("valorIptu"))),
        "iptuPeriodo": d.get("iptuPeriodo") or "ano",
        "descricao": descricao, "caracteristicas": carac,
        "fotos": fotos, "lat": d.get("lat"), "lon": d.get("lon"),
        "atualizado": datetime.date.today().isoformat(), "slug": slug,
    }
    saida = {k: v for k, v in saida.items() if v not in (None, "", [])}
    salvar_json(os.path.join(pasta, "dados.json"), saida)
    link = renderizar(slug)
    lista = [i for i in lista if i["slug"] != slug]
    lista.insert(0, {"codigo": codigo, "slug": slug, "titulo": saida["titulo"], "capa": slug + "/" + fotos[0],
                     "valor": saida.get("valorVenda"), "data": saida["atualizado"], "fotos": len(fotos)})
    salvar_json(os.path.join(PASTA, "lista.json"), lista)
    avisos = []
    if not saida.get("valorVenda"): avisos.append("valor não encontrado (aparece 'Consulte')")
    if not saida.get("quartos") and saida["tipo"] not in ("Terreno", "Sala", "Galpão"): avisos.append("nº de quartos não encontrado")
    if not descricao: avisos.append("sem descrição")
    if not saida.get("endereco"): avisos.append("sem rua — mapa pelo bairro")
    return {"ok": True, "url": link, "slug": slug, "codigo": codigo, "titulo": saida["titulo"],
            "fotos": len(fotos), "avisos": avisos}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url"); ap.add_argument("--pedido"); ap.add_argument("--codigo"); ap.add_argument("--valor")
    ap.add_argument("--html-url"); ap.add_argument("--refazer", action="store_true")
    a = ap.parse_args()
    if a.refazer:
        for i in carregar_lista():
            print(renderizar(i["slug"]))
        return
    try:
        res = gerar(a.url, a.codigo, a.valor, a.html_url or None)
    except Falha as e:
        res = {"ok": False, "erro": str(e)}
    except Exception as e:  # erro inesperado: registra para o hub mostrar
        res = {"ok": False, "erro": f"Erro inesperado ao ler o anúncio: {e.__class__.__name__}: {e}"}
    res["quando"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if a.pedido:
        salvar_json(os.path.join(PASTA, "pedidos", re.sub(r"[^\w-]", "", a.pedido) + ".json"), res)
    print(json.dumps(res, ensure_ascii=False, indent=1))
    if not res["ok"] and not a.pedido:
        sys.exit(1)


if __name__ == "__main__":
    main()
