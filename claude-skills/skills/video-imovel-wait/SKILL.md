---
name: video-imovel-wait
description: Reels de imóvel no modelo "Wait if you love Japan" (ref. instagram.com/reel/DfCzIDpzgIT), aprovado no AP0159 em 04/11/2026. São 4 s do vídeo da panela com gotas e o texto "Espera se você ama o <bairro>" + bandeira, depois 19 fotos PARADAS cortadas no ritmo da música original. As fotos são refeitas em 9:16 com qualidade de cinema no Google Flow (Nano Banana Pro, 0 crédito). Use quando o Gabriel pedir "faz o modelo do Japão / da panela / wait if you love" com um imóvel (link zffrealty/Flip) ou fotos de imóvel em qualidade cinematográfica na vertical.
---

# Vídeo de imóvel "Espera se você ama o <bairro>"

Vídeo aprovado: AP0159 (apto Cambuí, Campinas), 11,5 s, 1080x1920. Tudo é grátis.

## O que o Gabriel aprovou e o que reprovou
- ✅ **Começo:** o vídeo ORIGINAL da panela (`hook.mp4`, texto em inglês já apagado) com texto em PT: Montserrat 700, 64 px, top 400, e bandeira do Brasil em SVG. Emoji de bandeira não aparece no render.
- ✅ **Fotos:** PARADAS, sem movimento, nos cortes exatos da referência, com o áudio da referência (`audio.mp3`).
- ✅ **Fotos refeitas no Flow em 9:16,** com o cômodo inteiro, luz e nitidez de cinema.
- ❌ **Recortar foto horizontal para 9:16:** o Gabriel disse "cômodo cortado no meio".
- ❌ **Só aumentar a resolução (ESRGAN) e mexer na cor:** ele disse "qualidade não está tratada".
- ❌ **Movimento nas fotos** (paralaxe ou câmera 2D) e vídeo de comparação: ele não quer. Entregar só o vídeo final.

## Passo a passo
1. **Fotos:** baixar todas do anúncio. As URLs `flip-prod-fotos` estão no HTML da página zffrealty.
2. **Escolher 19 fotos** em ordem de visita: vista aérea → fachada → lobby → sala → jantar → cozinha → escritório → quartos → suíte → banheiros → piscina → gourmet → terraço → salão → academia → torre do alto.
   - Fora: planta baixa, lavanderia, bicicletário, playground, fotos repetidas.
   - Uma das primeiras deve ser a cozinha ou o cooktop, que combina com a panela.
3. **Subir as fotos para o Flow:**
   - O navegador do app não escolhe arquivo do PC, e o flow.google.com bloqueia fetch para 127.0.0.1.
   - Mande as fotos com `gh api -X PUT repos/Gabriel-glll/Gabriel-glll.github.io/contents/tmp-flow/<imovel>/NN.jpg` (conteúdo em base64).
   - Depois rode o bloco 1 de `flow-helpers.js` no projeto do Flow.
   - **Apague a pasta `tmp-flow/` no final.**
4. **Gerar no Flow** (navegador do app logado no Google, flow.google.com):
   - Abra uma foto clicando no tile e rode os blocos 2 e 3 de `flow-helpers.js`.
   - Para cada foto, faça um `browser_batch` com:
     - `__prep('NN')`,
     - um screenshot (confira Nano Banana Pro, 9:16 e 0 credits),
     - o CLIQUE REAL na seta de enviar,
     - `__wait()`.
   - O prompt de cada foto precisa descrever o que está NELA.
   - Não use o agente de chat do Flow: ele se perde nos nomes dos arquivos.
5. **Baixar e finalizar:**
   - Baixe com `curl` cada URL de `window.__urls` para `public/imoveis/<imovel>/flow/NN.jpg`.
   - Rode `python finalizar.py flow final`, que faz Lanczos para 1080x1920, nitidez e `cine-grade --forca 0.6`.
   - Olhe todas as fotos: nenhuma pode ter cômodo cortado, texto ou coisa inventada. Refaça a que estiver ruim.
6. **Montar o vídeo:**
   - Copie `ImovelAP0159.tsx` para `src/videos/Imovel<COD>.tsx` e troque estes pontos:
     - o texto (bairro),
     - `AP0159_PLANOS` (ordem das fotos),
     - o caminho `imoveis/<cod>/final`.
   - `hook.mp4` e `audio.mp3` vão para `public/ref-japan/`.
   - Registre no `Root.tsx`: 1080x1920, 30 fps, `durationInFrames={imovelAP0159Duration()}`.
   - Renderize com `npx remotion render Imovel<COD> out/imovel-<cod>.mp4`.
   - Antes de entregar, confira um quadro de cada foto em uma folha de contato.

## Arquivos desta skill
| arquivo | vai para | o que é |
|---|---|---|
| `ImovelAP0159.tsx` | `motion-studio/src/videos/` | composição pronta: cortes da referência (`CUTS`), gancho, texto e bandeira |
| `hook.mp4`, `audio.mp3` | `motion-studio/public/ref-japan/` | 4 s da panela sem o texto em inglês e áudio da referência |
| `flow-helpers.js` | (colar no Flow) | subir as fotos, prompts, `__prep`/`__wait` |
| `finalizar.py`, `cine-grade.py` | `motion-studio/scripts/` | 768x1376 → 1080x1920 com cor de cinema (`pip install pillow numpy`) |
| `hook_clean.py` | referência | como o texto foi apagado do gancho (inpaint OpenCV), para repetir com outra referência |

**Para outra referência no mesmo estilo:**
- Baixe com `yt-dlp`.
- Ache os cortes com `ffmpeg -i ref.mp4 -vf "select='gt(scene,0.25)',showinfo" -f null -`.
- Troque `CUTS` e o gancho.
