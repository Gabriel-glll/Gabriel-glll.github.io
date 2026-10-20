---
name: ambiente-montagem
description: Vídeo IA "montagem do ambiente" (timelapse arquitetônico): o cômodo começa VAZIO e os móveis/acabamentos se montam sozinhos até o projeto pronto, câmera travada — a partir de UMA foto do imóvel (gera a versão vazia e/ou decorada por IA e anima com primeiro+último quadro). Use quando o usuário pedir "vídeo do ambiente se montando", "home staging em vídeo", "sala vazia virando decorada", "timelapse de decoração", reels de imóvel com antes/depois de decoração.
---

# Ambiente se montando (antes vazio → depois decorado)

Origem: reel @enrriquesdesign. Usa **duas imagens do mesmo enquadramento**: o cômodo **vazio** (primeiro quadro) e o cômodo **pronto** (último quadro). Um modelo de vídeo com primeiro e último quadro (Seedance 2.0 ou Kling) anima a montagem com a **câmera travada**.

## Pipeline a partir de 1 foto do imóvel
1. **Foto do cliente/anúncio** → é o último quadro (ou gere uma versão "decorada/home staging" melhor dela).
2. **Versão vazia (primeiro quadro):** edição de imagem com IA (Nano Banana 2.1 no Weave ~7 créditos, ou GPT Image 2 na Kie via `kie.py imagem ... --ref`):
   > Remove ALL furniture, rugs, curtains' clutter, decor, plants, objects, TV and lamps from this room. Keep EXACTLY the same camera angle, focal length, framing, walls, ceiling, crown molding, windows, doors, floor material and natural light. Result: the same apartment completely empty, clean and freshly painted, photorealistic real-estate photo.
   Confira se paredes, janelas e piso continuam iguais; senão, gere de novo.
3. **Vídeo (5–8 s):** primeiro quadro = vazio, último = decorado (Seedance 2.0: `first_frame_url` + `last_frame_url`; ou Kling "First & Last Frame"), em 16:9, ou corte 9:16 para Reels.
4. Opcional: anunciar como "home staging virtual". **Avise que é ilustração** (imagem gerada por IA) no anúncio.

## Versão GRÁTIS (sem IA de vídeo), já testada
Feita com a foto de sala do Gabriel (2026-10-20): `criativos/sala-montagem/sala-montagem.mp4`.
1. Sala vazia gerada no Weave (passo 2 acima).
2. **Alinhar** a vazia sobre a original (a IA desloca um pouco o enquadramento): `python motion-studio/tools/alinhar.py original.jpg vazia.png vazia-alinhada.png --escala 1.875` (SIFT + homografia; confira o `-check.jpg`, que não pode ter janela ou porta "dupla").
3. **Máscaras** por grupo de móveis: `criativos/sala-montagem/mascaras.py` (polígonos nas coordenadas da foto → PNG com alfa e borda desfocada). Ajuste os polígonos para cada foto.
4. **Remotion** `src/Montagem.tsx` (`<Composition id="Montagem">`): vazia de fundo; cada grupo surge com opacidade + subida de 26 px na ordem das máscaras; no fim entra a foto real inteira e a luz esquenta. Assets em `public/<pasta>/` (`vazia.png`, `final.png`, máscaras).
- Limitação: os móveis "aparecem" (fade + subida); não se montam peça por peça. Para a montagem de verdade, use o vídeo de IA abaixo.

## Prompt de vídeo (adaptado do reel)
```
Create a 7-second cinematic architectural timelapse using the two provided reference images. The first image is the exact initial state of the room, completely empty and unfinished. The second image is the exact final state, fully furnished and decorated. Keep the camera completely locked in the same position, height, focal length, perspective, framing and composition for the entire animation. Do not move, zoom, rotate or change the camera.
Animate the interior progressively assembling itself in a realistic and elegant way. First the wooden floor and wall finishes settle in, then curtains slide into place, then the large sofa and rug appear, followed by the TV unit and sideboard. Then the dining table and chairs assemble piece by piece, followed by decor, plants, cushions and small objects. Finally, the lights turn on softly.
Objects should appear through believable assembly movements (slide, rise, rotate, lock into place) rather than simply popping into existence. Preserve the exact geometry, proportions, architecture, window positions and perspective from the reference images. The final frame must match the second reference image as closely as possible. Do not introduce furniture, objects or materials that are not present in the final reference.
```
(Ajuste a ordem dos elementos ao que existe na foto final.)

## Ferramentas e custos
- Imagem: Weave (Figma) Nano Banana 2.1 **funciona no plano atual** (10 créditos em 2K; sempre pedir OK). Saldo em 2026-10-20: ~129 créditos.
- **Upload da foto local sem o usuário fazer nada:** chame `weave_upload_asset` (ele devolve `submitUrl` + `token`) e envie:
  `curl -X POST <submitUrl> -H "Authorization: Bearer <token>" -F "file=@foto.jpg;type=image/jpeg"`. A resposta traz `{id, url, width, height}`; passe esse objeto em `images`.
- Vídeo: Weave exige **plano pago**. Use a Kie (`kie-api`: `python kie.py video "<prompt>" --inicio <url vazio> --fim <url decorado> --duracao 7 --proporcao 16:9`), a Muapi ou o site do Kling (grátis com créditos diários, o usuário faz login).
- Privacidade: fotos de apartamento de cliente **não vão para o GitHub Pages** para virar "URL pública". Use upload direto no serviço.
- Pasta: `Documents/claude/criativos/<nome>/` (sala-original.jpg, sala-vazia.png, montagem.mp4).
