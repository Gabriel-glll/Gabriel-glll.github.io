---
name: estudio-ia
description: Central de criativos com IA (imagem, vídeo, motion, áudio) — diz qual ferramenta/skill usar, como instalar o estúdio Muapi (Open-Higgsfield / Open Generative AI + 62 skills muapi-*) num PC novo e como gerar grátis. Use quando o usuário pedir criativo, vídeo IA, motion, anúncio, "estúdio de cinema", Higgsfield, Seedance, Kling, Veo, ou quando uma skill muapi-* falhar por falta de chave/CLI.
---

# Estúdio IA — o que usar e como montar

Origem: reel @felipetambara.ia ("comenta CINEMA"). Ele apresenta o **Open-Higgsfield-AI**, hoje chamado **Open Generative AI** (github.com/Anil-matcha/Open-Generative-AI, ~30 mil estrelas, MIT). É o "estúdio de cinema do Higgsfield" de graça e open source: 600+ modelos (Seedance 2.0/2.5, Kling 3, Veo 3, Sora 2, Wan, Hailuo, Flux, Nano Banana, Midjourney...) e um Cinema Studio com câmera, lente, focal e abertura.
O app é grátis; **gerar custa créditos Muapi (pay-per-use, sem crédito grátis)**. Gerar localmente exige GPU NVIDIA/AMD.

## Para o Claude: a parte que importa
Os mesmos modelos estão disponíveis para o Claude via **muapi-cli + skills `muapi-*`** (repo SamurAIGPT/muapi-skills).

### Instalar num PC (Windows)
```
python -m pip install --user muapi-cli
# adicionar ao PATH do usuário: %APPDATA%\Python\Python3xx\Scripts  (o npm install -g muapi-cli FALHA no Windows: 404 no binário)
npx -y skills add SamurAIGPT/muapi-skills --all -a claude-code -g -y
```
Os erros "Eve/PromptScript does not support global" podem ser ignorados. As skills vão para `~/.claude/skills/muapi-*` (62 no total).

### Chave (o usuário faz, o Claude nunca cria conta nem digita a chave)
1. O usuário cria a conta em muapi.ai e coloca créditos em muapi.ai/topup.
2. Gera a chave em muapi.ai/access-keys e roda **ele mesmo** no terminal: `muapi auth configure --api-key "SUA_CHAVE"` (ou cria a variável de ambiente `MUAPI_API_KEY`).
3. Teste com `muapi account balance`.
4. Antes de gerar, sempre mostre o preço (`muapi-models` estima o custo) e espere o OK.

## Qual skill usar
| Pedido | Skill |
|---|---|
| Vídeo plano-sequência / reveal de prédio | `video-reveal-aereo` (prompt) + `muapi-seedance-2` ou `muapi-one-shot-video` |
| Drone / aéreo de empreendimento | `muapi-drone-style-video` |
| Direção de cena, câmera, lente | `muapi-cinema-director` |
| Anúncio Meta/Google (imagem + copy) | `muapi-ad-creative`, `muapi-instagram-post` |
| Vídeo de redes com marca | `muapi-social-media-video` |
| UGC (pessoa + produto) | `muapi-ugc-video-factory` |
| Planta → render 3D / decoração | `muapi-floor-plan-rendering`, `muapi-interior-design-visualizer` |
| Folder de imóvel | `muapi-brochures` |
| Cortes de vídeo longo para Reels | `muapi-youtube-shorts`, `muapi-ai-clipping` |
| Logo animado | `muapi-3d-logo-animation` |
| Qualquer modelo avulso | `muapi-models` |
| Motion (texto/formas animadas, anúncio com fotos) — GRÁTIS | `motion-design` (Remotion) |
| Textura / acabamento (papel, grunge, filme, halftone...) — GRÁTIS | `texturas` |
| Vídeo de lançamento de site/app (/brag) — GRÁTIS | `video-lancamento-site` |
| Carrossel/pôster com tipografia de impacto — GRÁTIS | `fontes-cinematograficas` |

## Rotas por custo
1. **Grátis:** créditos diários de kling.ai, Dreamina/CapCut (Seedance), Hailuo, Vidu e Gemini (Veo). O usuário loga uma vez no navegador do app e o Claude opera o site. Os vídeos têm ~5 s, marca d'água e 720p.
2. **Pay-per-use mais barato (Kie):** skill `kie-api` (`kie.py`): Seedance 2.0 e GPT Image 2 via `KIE_API_KEY`. Prefira a Kie à Muapi quando a chave existir.
2b. **Pay-per-use (Muapi):** as skills `muapi-*` acima, totalmente automáticas.
3. **Conector Figma/Weave:** já está conectado, mas vídeo exige plano pago do Figma.
