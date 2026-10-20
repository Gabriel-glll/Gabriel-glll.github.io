"""Cliente mínimo da Kie API (kie.ai): gera imagem (GPT Image 2) e vídeo (Seedance 2.0) e baixa o resultado.
Chave: variável de ambiente KIE_API_KEY (o usuário define; nunca colar no chat nem no código).

Exemplos:
  python kie.py imagem "fachada de prédio ao entardecer, foto realista" --proporcao 4:5 --saida out/img.png
  python kie.py imagem "troque o céu por pôr do sol" --ref https://site/foto.jpg --saida out/img2.png
  python kie.py video "drone sobe revelando o prédio..." --inicio https://site/fachada.jpg --duracao 8 --proporcao 9:16 --saida out/v.mp4
  python kie.py saldo
  python kie.py ... --seco     # só mostra o JSON que seria enviado (não gasta crédito)
"""
import argparse
import json
import os
import sys
import time
import urllib.request

BASE = 'https://api.kie.ai/api/v1'


def chamar(metodo, caminho, corpo=None):
    chave = os.environ.get('KIE_API_KEY')
    if not chave:
        sys.exit('Defina a variável de ambiente KIE_API_KEY (pegue a chave em kie.ai → API Key).')
    req = urllib.request.Request(BASE + caminho, method=metodo, data=json.dumps(corpo).encode() if corpo else None,
                                 headers={'Authorization': f'Bearer {chave}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.load(r)
    if resp.get('code') != 200:  # a Kie devolve HTTP 200 mesmo com erro
        sys.exit(f"Erro da API: {resp.get('code')} {resp.get('msg')}")
    return resp.get('data')


def esperar(task_id, intervalo=6, limite=900):
    t0 = time.time()
    while time.time() - t0 < limite:
        d = chamar('GET', f'/jobs/recordInfo?taskId={task_id}')
        estado = d.get('state')
        print(f'  {estado}...', flush=True)
        if estado == 'success':
            res = json.loads(d['resultJson']) if d.get('resultJson') else d.get('response', {})
            print(f"  créditos usados: {d.get('creditsConsumed')}")
            return res.get('resultUrls') or []
        if estado == 'fail':
            sys.exit(f"Falhou: {d.get('failCode')} {d.get('failMsg')}")
        time.sleep(intervalo)
    sys.exit('Tempo esgotado esperando a tarefa.')


def baixar(urls, saida):
    os.makedirs(os.path.dirname(os.path.abspath(saida)), exist_ok=True)
    base, ext = os.path.splitext(saida)
    for i, u in enumerate(urls):
        dest = saida if i == 0 else f'{base}-{i + 1}{ext}'
        urllib.request.urlretrieve(u, dest)
        print('salvo:', dest)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('tipo', choices=['imagem', 'video', 'saldo'])
    ap.add_argument('prompt', nargs='?')
    ap.add_argument('--ref', action='append', default=[], help='URL pública de imagem de referência (imagem: edição; vídeo: referência)')
    ap.add_argument('--inicio', help='URL do primeiro quadro (vídeo)')
    ap.add_argument('--fim', help='URL do último quadro (vídeo)')
    ap.add_argument('--proporcao', default=None)
    ap.add_argument('--duracao', type=int, default=5)
    ap.add_argument('--resolucao', default=None)
    ap.add_argument('--sem-audio', action='store_true')
    ap.add_argument('--saida', default='out/kie')
    ap.add_argument('--seco', action='store_true')
    a = ap.parse_args()

    if a.tipo == 'saldo':
        print('créditos:', chamar('GET', '/chat/credit'))
        return

    if a.tipo == 'imagem':
        inp = {'prompt': a.prompt, 'aspect_ratio': a.proporcao or 'auto', 'resolution': a.resolucao or '1K'}
        if a.ref:
            model, inp['input_urls'] = 'gpt-image-2-image-to-image', a.ref
        else:
            model = 'gpt-image-2-text-to-image'
    else:
        model = 'bytedance/seedance-2'
        inp = {'prompt': a.prompt, 'duration': a.duracao, 'aspect_ratio': a.proporcao or '9:16',
               'resolution': a.resolucao or '720p', 'generate_audio': not a.sem_audio}
        if a.inicio or a.fim:  # quadros inicial/final não combinam com referências
            if a.inicio:
                inp['first_frame_url'] = a.inicio
            if a.fim:
                inp['last_frame_url'] = a.fim
        elif a.ref:
            inp['reference_image_urls'] = a.ref

    corpo = {'model': model, 'input': inp}
    if a.seco:
        print(json.dumps(corpo, ensure_ascii=False, indent=2))
        return
    d = chamar('POST', '/jobs/createTask', corpo)
    print('tarefa:', d['taskId'])
    baixar(esperar(d['taskId']), a.saida)


if __name__ == '__main__':
    main()
