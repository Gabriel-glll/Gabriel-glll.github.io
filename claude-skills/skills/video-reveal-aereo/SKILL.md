---
name: video-reveal-aereo
description: Gera com IA um vídeo-criativo "reveal aéreo" de prédio/empreendimento — plano-sequência sem cortes, janela de avião → voo sobre nuvens/cidade → descida até a rua → fachada do prédio (estilo @architect.apollo). Use quando o usuário pedir "vídeo do avião até o prédio", "reveal aéreo", "criativo de lançamento em vídeo", "vídeo IA do empreendimento", "plano-sequência do prédio" ou mandar uma foto de fachada pedindo vídeo para Reels/anúncio.
---

# Vídeo "Reveal Aéreo" (avião → fachada), 100% IA

Referência: reel de @architect.apollo (instagram.com/reel/Ddiy0T9ioeV). São 10 s, 9:16, sem nenhum corte:
janela do avião (mão abre a persiana) → o prédio aparece entre as nuvens → mergulho de drone sobre a cidade, top-down → desce até a rua → travelling pela fachada no térreo → recua e revela o prédio inteiro ao entardecer.

## Ingredientes
1. **Imagem de referência**: render ou foto da fachada do empreendimento. Precisa ser nítida, com o prédio inteiro aparecendo e de preferência ao entardecer ou à noite. Para lançamentos da ZFF, use `novos-lancamentos/materiais/<slug>/fotos/01.jpg`; a URL pública é `https://gabriel-glll.github.io/novos-lancamentos/materiais/<slug>/fotos/01.jpg`.
2. **Modelo de vídeo** (via conector Figma → Weave: `weave_find_model` + `weave_run_model`):
   - **Seedance 2.0 Reference** (id `0c703c46-e0fe-4ef3-9a72-5f04c74c862c`, ~127 créditos): é a melhor opção. A imagem entra como `reference_1` e o modelo segue o prompt de vários "SHOTS" com tempos marcados. Use `duration` 10, `aspect_ratio` 9:16, `resolution` 720p ou 1080p e `generate_audio` true.
   - Alternativa mais barata: **Kling 3** (id `f3220409-436a-4585-b3d3-adca16f4db19`, ~82 créditos) com `end_image_url` = fachada, o que garante que o vídeo TERMINA no prédio real; `duration` 10.
   - Veo 3.1 I2V é mais limitado: no máximo 8 s, e o image-to-video sai em 16:9.
   - **Requisito:** vídeo no Weave só funciona em **plano pago** do Figma/Weave. Se der "Video models are only available on paid plans", existem dois caminhos:
     a) o usuário assina o Weave (app.weavy.ai) e o fluxo segue pelo conector;
     b) rota fal.ai: o usuário cria a conta e coloca a chave na variável de ambiente `FAL_KEY` (nunca colar a chave no chat). Depois disso, chame `https://queue.fal.run/bytedance/seedance-2.0/reference-to-video` (ou `fal-ai/kling-video/...`) via curl com o header `Authorization: Key $FAL_KEY`, os mesmos campos e o prompt abaixo.
     c) **GRÁTIS (preferido sem plano pago):** usar os créditos diários grátis de kling.ai (melhor opção, tem first+last frame), Dreamina/CapCut (Seedance), Hailuo, Vidu ou Gemini (Veo). O usuário faz login uma vez no navegador do app, e o Claude opera o site: sobe a foto, cola o prompt, gera e baixa. O Claude NUNCA cria conta nem digita senha. No plano grátis os vídeos têm ~5 s, então gere em 2 partes (avião→cidade, depois rua→fachada, com o último quadro da parte 1 como primeiro quadro da parte 2) e junte com ffmpeg: `ffmpeg -f concat -safe 0 -i lista.txt -c copy final.mp4`.
     d) **Muapi (pay-per-use):** com a chave configurada (ver skill `estudio-ia`), use `muapi-seedance-2` (imagem de referência + este prompt) e o vídeo sai inteiro de forma automática.
     - Rodar localmente (Wan/ComfyUI) exige GPU dedicada; o PC atual do usuário (Intel Iris Xe, 8 GB) não roda.
3. Gastar créditos exige aprovação: sempre mostre o custo ao usuário e espere o "sim" antes de passar o `acknowledgedCost`.

## Prompt-base (em inglês; os modelos respondem melhor)
Troque o que está entre [colchetes]. A estrutura (estilo + SHOTS com tempos) é a mesma do reel original.

```
Cinematic, photorealistic single continuous shot, 10 seconds total, fast-paced rhythm, professional commercial architecture visualization, shot on ARRI Alexa with anamorphic lens, shallow depth of field, natural film grain, soft realistic lighting. NO CUTS — one unbroken camera move.
The building is EXACTLY the one in the reference image: same shape, colors, materials and balconies.
SHOT 1 (0:00-0:02): Interior of an airplane cabin, close on an oval window; a hand slides the window shade up revealing golden sunset light and a sea of clouds; the building from the reference image rises through the clouds in the distance.
SHOT 2 (0:02-0:04): The camera pushes through the window and dives down through the clouds, becoming a drone shot; top-down aerial view of [Campinas] city blocks, the building's rooftop centered in frame.
SHOT 3 (0:04-0:06): Fast descent spiraling around the tower, motion blur on the facade lines, landing at street level.
SHOT 4 (0:06-0:08): Smooth tracking shot at ground level along the lobby and entrance, warm interior lights, a person walking in, trees in the foreground.
SHOT 5 (0:08-0:10): The camera pulls back and tilts up revealing the full facade at blue hour, warm window lights on, hero shot, final frame matches the reference image.
Sound: airplane cabin hum, wind whoosh through clouds, soft city ambience.
```
Negative prompt (se o modelo aceitar): `cuts, scene change, text, watermark, distorted building, extra floors, warped geometry, cartoon`.

## Passo a passo
1. Pegue a foto da fachada. Se for local, use uma URL https pública (site do GitHub Pages) ou peça o upload com `weave_upload_asset`.
2. Ajuste o prompt: cidade, horário, e o que o térreo do prédio tem (portaria, piscina, loja).
3. Chame `weave_run_model` sem `acknowledgedCost` para ver a cotação, mostre o custo ao usuário e rode depois do OK.
4. Acompanhe com `weave_get_model_run_output` e baixe o mp4 com o curl da resposta para `Documents/claude/criativos/<slug>/`.
5. Opcional: abertura e encerramento com logo, telefone e CTA ("Comenta EU QUERO") no CapCut ou com ffmpeg (drawtext). Legenda do post: gancho + CTA de comentário. O reel original usa "Comment AI".

## Dicas
- Se o prédio deformar, repita com outra seed, use a "last frame" (Kling) ou encurte o SHOT 3.
- 9:16 para Reels e Stories, 1:1 ou 4:5 para feed.
- Overlay "Animation prompt" + miniatura da referência (como no original) gera curiosidade e comentários; vale repetir.
