"""Narração (voz) com a Fish Audio — modelo gratuito s2.1-pro-free (grátis até 30/11/2026, uso justo).
Chave: variável de ambiente FISH_API_KEY (o usuário cria em fish.audio → API; nunca colar no chat).

Uso:
  python fish.py vozes "portuguese"                     # lista vozes (id, nome) para escolher
  python fish.py falar "Texto da narração" saida.mp3 --voz <reference_id> [--velocidade 1.05]
  python fish.py falar arquivo.txt saida.mp3 --voz <id>  # texto vindo de arquivo
"""
import argparse
import json
import os
import sys
import urllib.parse
import urllib.request

API = 'https://api.fish.audio'


def chave():
    k = os.environ.get('FISH_API_KEY')
    if not k:
        sys.exit('Defina FISH_API_KEY (crie a chave em fish.audio → Developer/API).')
    return k


def vozes(busca, n=15):
    q = urllib.parse.urlencode({'title': busca, 'page_size': n, 'sort_by': 'score'})
    req = urllib.request.Request(f'{API}/model?{q}', headers={'Authorization': f'Bearer {chave()}'})
    with urllib.request.urlopen(req, timeout=60) as r:
        d = json.load(r)
    for m in d.get('items', []):
        print(f"{m['_id']}  {m.get('title', '')[:40]:40}  {','.join(m.get('languages', []))}")


def falar(texto, saida, voz=None, velocidade=1.0, modelo='s2.1-pro-free'):
    if os.path.exists(texto):
        texto = open(texto, encoding='utf-8').read()
    corpo = {'text': texto, 'format': 'mp3', 'mp3_bitrate': 192, 'language': 'pt-BR', 'prosody': {'speed': velocidade}}
    if voz:
        corpo['reference_id'] = voz
    req = urllib.request.Request(f'{API}/v1/tts', data=json.dumps(corpo).encode(), method='POST', headers={
        'Authorization': f'Bearer {chave()}', 'Content-Type': 'application/json', 'model': modelo})
    try:
        with urllib.request.urlopen(req, timeout=180) as r, open(saida, 'wb') as fo:
            fo.write(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f'Erro {e.code}: {e.read().decode(errors="ignore")[:300]}')
    print('salvo:', saida)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('acao', choices=['vozes', 'falar'])
    ap.add_argument('texto')
    ap.add_argument('saida', nargs='?')
    ap.add_argument('--voz')
    ap.add_argument('--velocidade', type=float, default=1.0)
    a = ap.parse_args()
    vozes(a.texto) if a.acao == 'vozes' else falar(a.texto, a.saida or 'narracao.mp3', a.voz, a.velocidade)
