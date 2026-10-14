"""Puxa o estoque do sistema atual (automaxsumare.com.br) e gera data/estoque.js.
Uso: python tools/atualizar_estoque.py
Motos e veículos extras ficam em data/extras.js (não são sobrescritos)."""
import json, re, html, urllib.request, pathlib

BASE = "https://automaxsumare.com.br"
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "estoque.js"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0", "Accept": "*/*"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")


def txt(s):
    return html.unescape(re.sub(r"<[^>]+>", " ", s)).split()


MARCAS = {"GM - Chevrolet": "Chevrolet", "VW - VolksWagen": "Volkswagen", "Citroen": "Citroën"}
COMBS = {"Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido", "Álcool"}

links = []
for p in range(1, 20):
    page = get(f"{BASE}/estoque?page={p}")
    found = re.findall(r'<article class="car-card">\s*<a href="(/veiculo/[^"]+)"', page)
    if not found:
        break
    links += [l for l in found if l not in links]

carros = []
for url in links:
    h = get(BASE + url)
    nome = html.unescape(re.search(r"<h2>(.*?)</h2>", h, re.S).group(1)).strip()
    bloco = h[h.find("<h2>"):h.find("Proposta via")]
    w = " ".join(txt(bloco))
    preco = re.search(r"R\$ ([\d.,]+)", w)
    ano = re.search(r"\b(19|20)\d{2}\b", w)
    km = re.search(r"(\d+) km", w)
    portas = re.search(r"(\d) Portas", w)
    comb = next((c for c in COMBS if f" {c} " in f" {w} "), "")
    cambio = "Automático" if re.search(r"\baut", nome, re.I) or "Automático" in w else ("Manual" if re.search(r"mec|Manual", nome + w, re.I) else "")
    linhas = [l.strip() for l in html.unescape(re.sub(r"<[^>]+>", "\n", bloco)).split("\n") if l.strip()]
    marca = next((l for l in linhas if l in MARCAS or l in ("Toyota", "Honda", "Fiat", "Ford", "Hyundai", "Renault", "Mitsubishi", "Porsche", "Land Rover", "Jeep", "Nissan", "Peugeot", "Kia", "BMW", "Audi", "Mercedes-Benz", "Yamaha", "Suzuki", "Kawasaki")), "")
    cor = linhas[-1] if linhas else ""
    fotos = list(dict.fromkeys(re.findall(r'src="(https://arquivos\.boomsistemas\.com\.br/veiculos/[^"]+)"', h)))
    carros.append({
        "id": url.split("/")[2], "tipo": "carro", "nome": nome,
        "marca": MARCAS.get(marca, marca), "ano": int(ano.group(0)) if ano else None,
        "km": int(km.group(1)) if km else None, "cambio": cambio, "combustivel": comb,
        "cor": cor, "portas": int(portas.group(1)) if portas else None,
        "preco": float(preco.group(1).replace(".", "").replace(",", ".")) if preco else None,
        "fotos": fotos,
    })
    print(f"ok  {nome}  ({len(fotos)} fotos)")

OUT.parent.mkdir(exist_ok=True)
OUT.write_text("// Gerado por tools/atualizar_estoque.py — não editar à mão\nwindow.ESTOQUE = "
               + json.dumps(carros, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
print(f"\n{len(carros)} veículos -> {OUT}")
