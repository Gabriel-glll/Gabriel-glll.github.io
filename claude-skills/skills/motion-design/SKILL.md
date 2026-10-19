---
name: motion-design
description: Faz vídeos de motion design (texto e formas animadas, anúncios 9:16, vinhetas, Reels de imóvel) em CÓDIGO com Remotion, de graça, e traduz pedidos usando o "dicionário de efeitos motion" (fade/slide/blur in, pop in, scale up, stagger, ease, overshoot, bounce, typewriter, word reveal, text swap, draw-on, morph, bar grow, mask reveal, wipe, punch zoom). Use quando o usuário pedir motion, vídeo animado, anúncio animado, "anima esse texto", vinheta, ou citar qualquer um desses efeitos.
---

# Motion design em código (Remotion), sem custo

Origem: carrossel @omatheusdaia "Dicionário de efeitos Motion". A ideia: pedir "um vídeo bonito" não funciona; o pedido precisa nomear **efeito + tempo + easing**. Exemplo:
> "Título entra com **slide in em 0,4 s e ease out**. Benefícios com **stagger de 0,15 s**. Termina com **punch zoom** no produto."

## Estúdio
Fica em `Documents/claude/motion-studio`, um projeto Remotion 4 com React 18 e `@remotion/google-fonts`.
- `src/motion.tsx`: a biblioteca com um componente por efeito. Todos os tempos são em **segundos** e relativos à `<Sequence>`.
- `src/<Projeto>.tsx`: o vídeo. Registre-o em `src/index.tsx` como `<Composition id=... width=1080 height=1920 fps=30>`.
- As imagens ficam em `public/` e entram com `staticFile('arquivo.jpg')`.
- Para conferir antes, renderize quadros soltos: `npx remotion still src/index.tsx <Id> out/f.png --frame=N --scale=0.5`.
- Renderização final: `npx remotion render src/index.tsx <Id> out/<nome>.mp4`. O Remotion já traz ffmpeg e Chrome próprios.

### Montar num PC novo
```
mkdir motion-studio && cd motion-studio && npm init -y
npm i remotion@4 @remotion/cli@4 @remotion/google-fonts@4 react@18 react-dom@18
npm approve-scripts esbuild && npm rebuild esbuild     # npm 11 bloqueia o postinstall do esbuild
```
Depois baixe `motion.tsx` (está ao lado deste SKILL.md no repo claude-skills) para `src/motion.tsx`.

## Dicionário → componente (`motion.tsx`)
| Efeito | O que é | Componente / padrão |
|---|---|---|
| Fade in | aparece aos poucos | `<FadeIn at dur>` (0,4–0,6 s) |
| Slide in | entra deslizando | `<SlideIn from="left|right|up|down" dist>` (0,4 s ease out) |
| Blur in | do borrado ao nítido | `<BlurIn blur=24>` |
| Pop in | surge com salto de escala | `<PopIn>` (mola, damping 9) |
| Scale up | cresce até o tamanho final | `<ScaleUp from=0>` |
| Stagger | um depois do outro | `<Stagger each={0.15} effect={SlideIn}>` |
| Ease in-out | devagar → acelera → freia | `EASE.inOut` (`out` para entradas, `in` para saídas) |
| Overshoot | passa do destino e volta | `<Overshoot>` (mola, damping 8) |
| Bounce | quica antes de parar | `<Bounce height>` |
| Typewriter | letra a letra | `<Typewriter text cps=20>` |
| Word reveal | palavra a palavra | `<WordReveal text each=0.18>` |
| Text swap | uma palavra troca por outra | `<TextSwap words every=0.8>` |
| Draw-on | o traço se desenha | `<DrawOn d viewBox>` (SVG pathLength) |
| Morph | forma vira outra | `<Morph w0 h0 r0 → w1 h1 r1>` (círculo → botão) |
| Bar grow | barra cresce até o valor | `<BarGrow value=0..1>` |
| Mask reveal | máscara revela | `<MaskReveal dir>` (clip-path do centro) |
| Wipe | faixa troca a cena | `<Wipe from>` (a cena nova fica dentro) |
| Punch zoom | zoom rápido de impacto | `<PunchZoom to=1.3 dur=0.22>` |
| (extra) Ken Burns | zoom lento em foto | `<KenBurns to=1.1>` |

## Regras
- **Simples primeiro** (pedido do usuário): 3 cenas e 1–2 efeitos por cena bastam. Não enfie o dicionário inteiro num vídeo.
- Tempos de referência: entradas 0,3–0,5 s; stagger 0,1–0,2 s; cena 2,5–3,5 s; Reels de 6–15 s.
- Uma cena de transição deve começar ~0,3 s antes da anterior acabar (sobreposição de `<Sequence>`).
- Estilo do carrossel: fundo creme `#F4EEE3`, laranja `#C85A2A`, preto, título Anton e texto Inter.
- No Windows, **não edite .tsx com `Get-Content`/`Set-Content` do PowerShell 5**: estraga os acentos. Use Write/Edit.
- Exemplo pronto: `src/Alentejo.tsx` (fachada com mask reveal + slide in → wipe + stagger → pop in, 8 s).
- Entregue o mp4 com SendUserFile. Para vídeo com IA (gerar cenas realistas), veja a skill `estudio-ia`.
