---
name: reel-explicativo
description: Reel explicativo em motion feito 100% em código com o HyperFrames (HeyGen, open source), sem crédito de IA de vídeo — estilo "creator tech": fundo creme, um laranja de destaque, títulos bold com palavra-chave colorida, cards de interface (navegador, celular, painel com contador e gráfico), texto riscado que vira pill, selos com check, celulares orbitando e CTA "Comenta X". Use para reels de venda/educação (negócio de sites, ZFF, dicas), "reel ilimitado", HyperFrames, vídeo explicativo, faceless explainer.
---

# Reel explicativo em código (HyperFrames)

Origem: reel @viniciusguimaraes.ia ("Reel feito pelo Claude em código, sem pagar crédito de IA de vídeo"). É a skill **HyperFrames**: HTML + GSAP viram MP4. Tem um Studio com linha do tempo (preview editável) e 21 skills instaladas (`hyperframes`, `hyperframes-core`, `faceless-explainer`, `motion-graphics`, `product-launch-video`, `hyperframes-animation`, `hyperframes-registry` com ~400 blocos prontos...).

## Linguagem visual da referência
- Fundo creme `#f4efe7` + linha de prédios (skyline) bem clara no rodapé, fixa em todas as cenas.
- **Um** laranja de destaque (`#d4642a`, contraste aprovado no `check`), títulos Inter 900 com a palavra-chave em laranja.
- Cards brancos arredondados com sombra suave: **navegador** com o site real rolando, **celular** com busca digitando, **painel escuro** com contador subindo + gráfico de área laranja desenhando.
- Texto entre aspas que é **riscado** por uma barra laranja e trocado por uma **pill** ("não resolve não").
- Selos/pills com ✓ verde entrando em sequência.
- Fecho: hub com celulares orbitando um ícone central + "Comenta **PALAVRA**" (pill) + promessa.
- 6 cenas em ~20 s: gancho → problema → solução (prova real) → número → oferta → CTA.

## Como fazer (caminho enxuto)
Modelo pronto: `Documents/claude/criativos/hyperframes-reel-sites/` (`index.html`, `fonts/`, `assets/`).
1. Copie a pasta; troque textos, cores e o print (`_captura.mjs` tira print mobile de um site com Playwright: troque a URL).
2. Regras do contrato (`hyperframes-core`): root `data-composition-id` + `data-width/height/duration`; cada cena é `<section class="clip" data-start data-duration>`; **uma** `gsap.timeline({paused:true})` registrada em `window.__timelines["<id>"]`; nada de `<br>` em texto corrido, `Math.random` ou relógio; tweens só com `fromTo` (sem `transform` inicial no CSS); não animar `visibility`/`autoAlpha` do `.clip`.
3. **Fonte:** precisa de `@font-face` com arquivo local. A fonte variável do Google renderizou fina, então use **um arquivo por peso** (`Inter-500/800/900.ttf`, baixados da CSS do Google Fonts com `wght@500;800;900`). Fontes OFL podem ir no projeto.
4. `npx hyperframes check` → 0 erros (corrija os avisos de contraste) → `npx hyperframes snapshot --at 2,6,10,...` e veja o `contact-sheet.jpg` → `npx hyperframes render --output reel.mp4`.
5. Se quiser editar à mão: `npx hyperframes preview` abre o Studio (clicar e editar texto e tempo). O app desktop "Framey" permite editar conversando.
- Sem narração por padrão (TTS Kokoro não instalado). Música: use a da biblioteca do Instagram.
- Não invente dados como se fossem reais (domínio, números de visitas): deixe claro que é exemplo, ou use números do cliente.

## Quando usar × outras skills
- Reel explicativo/venda com interface e números → **esta**.
- Fotos cortando na batida → `edicao-beat-sync`. Anúncio animado simples → `motion-design` (Remotion). Vídeo do site do cliente → `video-lancamento-site` (/brag, também usa HyperFrames por baixo).
