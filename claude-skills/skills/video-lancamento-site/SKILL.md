---
name: video-lancamento-site
description: Faz o VÍDEO DE LANÇAMENTO (15–25 s, com música, animação e legenda, nas cores e fontes da marca) de um site, app ou projeto, via skill open source /brag (latent-spaces/brag) + estúdio Remotion. Use quando o usuário pedir "vídeo de lançamento", "/brag", "faz um vídeo desse site", "vídeo pra mostrar o site pro cliente", ou ao entregar um site-demo (negócio de sites) para gerar um Reels de apresentação.
---

# Vídeo de lançamento de site (/brag)

Origem: reel @99hud. O **/brag** (github.com/latent-spaces/brag, MIT, ~11 mil estrelas) é uma skill do Claude que lê o código ou o site, planeja e renderiza um vídeo de lançamento curto, nas cores e fontes da marca. Não é um slideshow.

## Instalação (Windows)
```
winget install --id Gyan.FFmpeg -e --source winget      # FFmpeg no PATH (reabrir o shell)
npx -y skills add https://github.com/latent-spaces/brag --skill brag -g -a claude-code -y
npx -y skills add https://github.com/latent-spaces/brag --skill brag-slim -g -a claude-code -y
npx -y hyperframes doctor      # basta ✓ FFmpeg/FFprobe/Chrome; whisper, Kokoro, MusicGen e Docker são opcionais
```
Precisa de Node 22+. Com 8 GB de RAM o doctor avisa "Low memory", mas a renderização funciona.

## Como rodar
- Chame a skill `brag` passando a pasta do projeto, o idioma (PT-BR), o formato (vertical para Reels) e "sem voz".
- No **Opus 5.5** o /brag desvia para o **brag-slim** (`<skill-dir>/slim.md`): o próprio Claude monta o vídeo com as ferramentas da máquina. Aqui isso significa:
  - Composição em `Documents/claude/motion-studio/src/<Nome>.tsx`, usando `motion.tsx` (skill `motion-design`). Registre em `src/index.tsx`.
  - Assets do projeto em `public/<slug>/`, com as cores e fontes exatas do CSS do site (`@remotion/google-fonts`).
  - Trilha sem copyright: `python audio/trilha.py public/<slug>/trilha.wav --dur 18 --pops <tempos dos cliques> --whoosh <tempos das transições>`. Use `<Audio src={staticFile(...)}>`.
  - Antes do render, confira quadros soltos de cada cena e do meio das transições (`npx remotion still ... --frame=N --scale=0.4`).
  - Render: `npx remotion render src/index.tsx <Id> <saida>/work/brag_raw.mp4`.
  - Capa: o melhor quadro já assentado vai para `brag.jpg` e é gravado como frame 0:
    `ffmpeg -i work/brag_raw.mp4 -i brag.jpg -filter_complex "[1:v]scale=1080:1920[p];[0:v][p]overlay=enable='eq(n,0)'" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac brag.mp4`
  - Escreva `share-copy.txt` com 1–3 frases prontas para postar.
- **Saída:** `Documents/claude/criativos/<slug>/brag-output/`. **Nunca** dentro do repo do site, que é publicado no GitHub Pages.
- Pela web, sem instalar nada: letsbrag.app gera a partir do link do site.

## Fórmula (leis do /brag)
Gancho (2–3 s) → revelação (2–4 s) → 2–3 destaques → fechamento (2–4 s). Total de 15–25 s, idealmente 18.
- **Mostre a coisa em uso:** a função real do site (ex.: montar o pedido → "Finalizar pelo WhatsApp" → mensagem pronta), com clique simulado e digitação. Nada de slide parado.
- Use a copy real do site, sem frases genéricas, e preços e dados do próprio config do site.
- Legível: cada frase fica na tela ~0,3 s por palavra depois de assentar.
- Toda imagem parada precisa ser postável.

## Uso no negócio de sites
Ao entregar um site-demo (skill `site-demo`), ofereça este vídeo: ele vai junto da mensagem para o cliente, para postar no Instagram dele, e ajuda a vender o site.
Exemplo pronto: Bolêros (`motion-studio/src/Boleros.tsx`, saída em `criativos/bolerosbom/brag-output/`).
