---
name: produto-3d
description: Cria visualizadores 3D INTERATIVOS em Three.js (uma página HTML) — produto ou prédio girando 360°, troca de cor em tempo real, vista explodida das peças/andares, luz dia/entardecer/noite — para e-commerce, maquete digital de lançamento imobiliário ou demo de site. Use quando o usuário pedir 3D, Three.js, maquete 3D, "produto girando", vista explodida, configurador de cor, mockup 3D.
---

# Produto/maquete 3D interativo (Three.js)

Origem: reel @tetra.ia. O Claude cria protótipos 3D interativos de produto (o exemplo é um smartwatch) com **rotação 360°, troca de cor em tempo real e "exploded view"**. No reel ele usa o conector **"Three.js 3D Viewer"** do diretório de conectores do Claude Desktop (Conectores → Descobrir → buscar "Three.js").
Aqui **não precisa do conector**: o Claude escreve o Three.js direto numa página HTML.

Prompt do reel (adaptável):
> Use Three.js para criar um protótipo de visualizador 3D de produto para e-commerce. Crie um modelo 3D de [produto] flutuando no centro, com iluminação de estúdio. Painel de controle para: 1) mudar a cor do produto em tempo real; 2) modo "Exploded View" (as peças se separam para mostrar a engenharia interna) ao clicar; 3) rotação automática suave de 360°. Deve parecer um site de luxo.

## Modelo pronto: maquete de prédio
`Documents/claude/criativos/3d/predio-3d.html` (também está ao lado deste SKILL.md).
- O prédio é procedural: andares com laje, faixa de vidro e guarda-corpo, mais praça, piscina e árvores.
- Painel de controle: cores de fachada (pares parede + destaque), luz (Dia / Entardecer / Noite, com janelas acesas), "Explodir andares" (cada andar sobe e gira de leve) e "Girar".
- Por URL: `?nome=Alentejo&andares=12&luz=Noite&explodido=1`. Paleta e andares ficam em `CFG` no topo do script.
- Para ver localmente: servidor `criativos` no `.claude/launch.json` (porta 8780), abrindo `http://localhost:8780/3d/predio-3d.html`.

## Como fazer um novo
1. Uma página HTML só, com Three.js por importmap (`cdn.jsdelivr.net/npm/three@0.160.0`) e `OrbitControls` (`autoRotate`, damping, `maxPolarAngle` < 90°).
2. Monte o objeto com primitivas agrupadas por **peça** (um `Group` por peça/andar). A vista explodida é cada grupo saindo para `posição base + direção × e`, com `e` animado por easing.
3. Para trocar a cor, troque `material.color.set()` nos materiais compartilhados. Para a luz, ajuste céu, intensidade e cor do sol, `emissive` das janelas e `toneMappingExposure`.
4. Use `ACESFilmicToneMapping`, sombras suaves (`PCFSoftShadowMap`) e um piso que recebe sombra.
5. Teste no navegador do app: os três estados, o console sem erros e a largura de celular. O painel fica embaixo, `width: min(760px, 100% - 32px)`.

## Usos
- **Lançamento (ZFF):** maquete com as cores da fachada real, para mandar o link a clientes ou embutir no site de Novos Lançamentos.
- **Negócio de sites:** um configurador 3D do produto da loja (tênis, garrafa, móvel) impressiona na demo.
- **Vídeo:** grave a tela girando ou faça um turntable no Remotion (`motion-design`) para Reels.
- Publicar: GitHub Pages (pasta no repo) ou Artifact. Pergunte antes de publicar.
