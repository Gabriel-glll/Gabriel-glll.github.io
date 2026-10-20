"""Baixa fotos HD de licença livre do Wikimedia Commons (só "Featured pictures") + créditos.
Uso: python fotos_hd.py pasta_saida "Eiffel Tower|França" "Santorini|Grécia" ... [--por 2] [--largura 1600]
Gera <pasta>/NN-slug.jpg e <pasta>/creditos.json (autor, licença, link) — mantenha os créditos na legenda/descrição.
"""
import argparse
import json
import os
import re
import time
import urllib.parse
import urllib.request
import urllib.error

API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'criativos-gabriel/1.0 (uso pessoal; contato via github Gabriel-glll)'}


def abrir(url, tentativas=5):
    for k in range(tentativas):  # o Wikimedia devolve 429 se pedir rápido demais: espera e tenta de novo
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120)
        except urllib.error.HTTPError as e:
            if e.code != 429 or k == tentativas - 1:
                raise
            time.sleep(20 * (k + 1))


def get(params):
    url = API + '?' + urllib.parse.urlencode({**params, 'format': 'json'})
    with abrir(url) as r:
        return json.load(r)


def limpar(html):
    return re.sub('<[^>]+>', '', html or '').strip()


def buscar(termo, n, largura):
    d = get({'action': 'query', 'generator': 'search', 'gsrnamespace': 6, 'gsrlimit': 12,
             'gsrsearch': f'{termo} incategory:Featured_pictures_on_Wikimedia_Commons',
             'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': largura})
    pags = sorted((d.get('query') or {}).get('pages', {}).values(), key=lambda p: p.get('index', 99))
    out = []
    for p in pags:
        ii = (p.get('imageinfo') or [{}])[0]
        if ii.get('mime') != 'image/jpeg' or ii.get('width', 0) < 1600:
            continue
        m = ii.get('extmetadata', {})
        w0 = ii.get('width', 0)
        if w0 > largura:
            url = ii['thumburl']
        else:  # original é bloqueado p/ scripts: usa a maior miniatura PADRÃO que caiba (sem ampliar)
            std = max([s for s in (960, 1280, 1920, 3840) if s < w0] or [960])
            orig = ii['url'].split('?')[0]
            nome = orig.rsplit('/', 1)[1]
            url = orig.replace('/wikipedia/commons/', '/wikipedia/commons/thumb/') + f'/{std}px-{nome}'
        out.append({'titulo': p['title'], 'url': url, 'pagina': ii.get('descriptionurl'),
                    'autor': limpar(m.get('Artist', {}).get('value')), 'licenca': m.get('LicenseShortName', {}).get('value', '')})
        if len(out) >= n:
            break
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('saida')
    ap.add_argument('itens', nargs='+', help='"termo de busca|rótulo"')
    ap.add_argument('--por', type=int, default=2)
    ap.add_argument('--largura', type=int, default=1600)
    a = ap.parse_args()
    os.makedirs(a.saida, exist_ok=True)
    creditos, k = [], 0
    for item in a.itens:
        termo, _, rotulo = item.partition('|')
        time.sleep(5)
        achou = buscar(termo, a.por, a.largura)
        print(f'{rotulo or termo}: {len(achou)} foto(s)')
        for f in achou:
            k += 1
            slug = re.sub(r'[^a-z0-9]+', '-', (rotulo or termo).lower()).strip('-')
            nome = f'{k:02d}-{slug}.jpg'
            if not os.path.exists(os.path.join(a.saida, nome)):
                time.sleep(5)
                with abrir(f['url']) as r, open(os.path.join(a.saida, nome), 'wb') as fo:
                    fo.write(r.read())
            creditos.append({'arquivo': nome, 'rotulo': rotulo or termo, **f})
    with open(os.path.join(a.saida, 'creditos.json'), 'w', encoding='utf-8') as fo:
        json.dump(creditos, fo, ensure_ascii=False, indent=1)
    print('total:', k)


if __name__ == '__main__':
    main()
