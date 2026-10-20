---
name: ui-animada
description: Guia das 5 skills de animação de interface (GSAP oficial, Three.js Skills, Design DNA, LottieFiles motion-design, Genjutsu) — qual usar, como instalar num PC novo e o modelo pronto de landing page animada com scroll. Use quando o usuário pedir site/landing "animado", "efeito no scroll", parallax, seção que trava e anda pro lado, texto que aparece letra a letra, "copiar o estilo desse site", microinterações, acabamento premium de interface.
---

# Interface animada: as 5 skills

Origem: carrossel @guilhermemorais.ia ("5 skills de animação pro Claude Code"). Todas estão instaladas globalmente:

| Skill (nome no Claude) | Repo | Para que serve |
|---|---|---|
| `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-utils`, `gsap-performance`, `gsap-frameworks` | greensock/gsap-skills (oficial) | animações, timelines, **scroll** (pin, scrub, horizontal), SplitText (texto letra a letra) |
| `threejs-*` (13 skills: fundamentals, materials, lighting, shaders, postprocessing, loaders, interaction...) | cloudai-x/threejs-skills | 3D em tempo real no site (combina com a skill `produto-3d`) |
| `design-dna` | zanwei/design-dna | extrai o "DNA" de um site ou print de referência (tokens, estilo, efeitos) em JSON e gera UI no mesmo estilo |
| `lottie-motion-design` | LottieFiles/motion-design-skill (**renomeada**: o original se chama `motion-design` e conflita com a nossa skill de Remotion) | princípios de motion: tempo, easing, coreografia |
| `cast`, `paint`, `bunshin` | AThevon/genjutsu | `cast` = microinterações e "uau" numa UI existente; `paint` = direção de arte completa anti-"cara de IA"; `bunshin` = site inteiro com vários agentes (caro: avisa o custo e pede confirmação 2×) |

## Quando usar qual
- **"Deixa esse site animado / efeito no scroll"** → GSAP (`gsap-scrolltrigger` + `gsap-core`). Modelo pronto abaixo.
- **"Faz no estilo deste site/print"** → `design-dna` primeiro (extrai o JSON), depois gera a página.
- **"Dá um acabamento premium / microinterações"** → `cast` (genjutsu).
- **"Coloca 3D"** → `threejs-*` + `produto-3d`.
- Sempre que for definir tempos e easing → `lottie-motion-design` (ou a tabela do `motion-design`).

## Modelo pronto: landing de lançamento com scroll
`Documents/claude/criativos/gsap-lazur/index.html`, com GSAP 3.13 + ScrollTrigger + SplitText (agora gratuitos), via `cdn.jsdelivr.net/npm/gsap@3.13.0/dist/`:
1. Hero: título com letras subindo (SplitText `mask: 'chars'`), parallax só por deslocamento (sem zoom).
2. Manifesto: palavras "acendem" conforme a rolagem (`scrub`).
3. **Galeria horizontal fixada**: `pin` + trilho com `x` e `ease: 'none'`. Legendas animadas com `containerAnimation`. **Texto fica fora da foto** (preferência do Gabriel).
4. Números que contam ao aparecer (`once: true`).
5. Cards com `ScrollTrigger.batch`.
6. CTA com revelação por linhas.
- Usa `gsap.matchMedia()` e respeita "reduzir movimento". **O Windows deste PC está com reduzir movimento ligado**, então as animações não aparecem nele. Para demonstrar, abra com `?animar=1`.
- Servidor local: `criativos` (porta 8780) → `http://localhost:8780/gsap-lazur/index.html?animar=1`.
- Armadilha: o painel do navegador do app congela o `requestAnimationFrame` em segundo plano. Para verificar, avance as animações por JS (`tween.progress(1)`) e cheque posições e `transform` em vez de screenshot.

## Instalar num PC novo
```
npx -y skills add greensock/gsap-skills --all -g -a claude-code -y
npx -y skills add zanwei/design-dna --all -g -a claude-code -y
npx -y skills add AThevon/genjutsu --all -g -a claude-code -y
npx -y skills add cloudai-x/threejs-skills --all -g -a claude-code -y
# LottieFiles: instalar numa pasta temporária (sem -g) e copiar como ~/.claude/skills/lottie-motion-design,
# trocando "name: motion-design" por "name: lottie-motion-design" no SKILL.md (não sobrescrever a nossa motion-design!)
```
