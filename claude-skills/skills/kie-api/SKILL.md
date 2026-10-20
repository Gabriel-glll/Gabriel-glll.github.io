---
name: kie-api
description: Gera imagem (GPT Image 2) e vídeo (Seedance 2.0, e outros modelos) com IA pela Kie API (kie.ai) — alternativa bem mais barata ao Higgsfield, paga por uso — usando o script kie.py, com o Claude como "artista gráfico". Use quando o usuário pedir imagem/vídeo de IA realista, "cancela o Higgsfield", Kie, kie.ai, Seedance via API, GPT Image 2, ou quando um criativo precisar de geração por IA e houver KIE_API_KEY.
---

# Kie API: o "artista gráfico" barato

Origem: reel @euguilhermepasin ("Cancela teu Higgsfield e economiza"). A **Kie (kie.ai)** dá acesso por API aos mesmos modelos do Higgsfield (Seedance 2.0, GPT Image 2, Veo, Kling, música, LLM), pagos por uso, sem assinatura. O Claude Code chama a API, gera e baixa.

Prompt-base do vídeo (é o que ele manda para o Claude):
> You are the graphic artist for my company. Use this Kie API key to generate media. Use GPT Image 2 for images (docs.kie.ai/market/gpt/gpt-image-2-image-to-image). Use Seedance 2.0 for video (docs.kie.ai/market/bytedance/seedance-2). Read the docs first, confirm you can reach the API, then tell me you're ready and **wait for final confirmation** before you make anything. Explain each step simply.

## Configurar (o usuário faz, uma vez)
1. Criar a conta em kie.ai, colocar créditos e gerar a chave (API Key).
2. Gravar a chave numa variável de ambiente **ele mesmo** (o Claude nunca vê nem digita a chave):
   PowerShell: `[Environment]::SetEnvironmentVariable('KIE_API_KEY','SUA_CHAVE','User')`. Depois, reabrir o terminal/app.

## Script
`Documents/claude/motion-studio/kie/kie.py` (só Python padrão):
```
python kie.py imagem "prompt" --proporcao 4:5 --saida out/x.png                 # texto → imagem (gpt-image-2-text-to-image)
python kie.py imagem "edite..." --ref https://url-publica/foto.jpg --saida ...   # imagem → imagem (até 16 refs)
python kie.py video "prompt" --inicio <url quadro inicial> [--fim <url quadro final>] --duracao 8 --proporcao 9:16 --saida out/v.mp4
python kie.py video "prompt" --ref <url> --ref <url> ...                         # Seedance com imagens de referência
python kie.py ... --seco        # mostra o JSON sem gastar crédito
```
- API: `POST https://api.kie.ai/api/v1/jobs/createTask` com `{model, input}` e header `Authorization: Bearer`. Consulta em `GET /jobs/recordInfo?taskId=`, com estados waiting/queuing/generating/success/fail. O resultado vem em `resultJson.resultUrls`. **A API devolve HTTP 200 mesmo com erro: confira `code`.**
- Seedance 2.0: duração de 4–15 s, proporção 9:16/16:9/1:1…, 480p a 4k, áudio ligado por padrão. Quadro inicial/final **não** combina com `reference_*`.
- As imagens precisam estar numa **URL pública**. Fotos de lançamentos: `https://gabriel-glll.github.io/novos-lancamentos/materiais/<slug>/fotos/NN.jpg`. Arquivo local: publique antes (GitHub Pages) ou peça o link.
- O comando `saldo` usa `/chat/credit` (não verificado). Se falhar, confira o saldo no painel da Kie.

## Regras
- Gastar crédito exige OK: mostre o JSON (`--seco`) e o custo estimado e só rode depois do "sim".
- Para o reveal aéreo de prédio, use o prompt da skill `video-reveal-aereo` com `--inicio` = fachada (ou `--fim` = fachada, para terminar no prédio real).
- O resultado vai para `Documents/claude/criativos/<slug>/`. Depois dá para pôr texto e marca por cima no Remotion (`motion-design`).
