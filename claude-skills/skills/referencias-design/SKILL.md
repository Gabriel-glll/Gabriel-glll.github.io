---
name: referencias-design
description: Banco de sites de REFERÊNCIA de design (Godly/Recent, Awwwards, Muzli, Fontshare, SaaS Frame, Inspotype, Jitter, Design Reviewed, Brik Space) + fluxo para transformar uma referência em trabalho (design-dna → fontes Fontshare → animação). Use quando o usuário pedir referência, inspiração, "um site bonito tipo...", fonte gratuita boa, paleta/combinação de fontes, ou antes de criar um site-demo, landing, carrossel ou pôster que precise de direção de arte.
---

# Banco de referências de design

Origem: carrossel @kacio.filipe ("Sites proibidos pra quem não é designer").

| Site | URL | Para que usar |
|---|---|---|
| **Godly** (agora redireciona para **Recent**) | recent.design | sites modernos e interativos, com animações. Tem filtros Web, Interface, Branding, Motion, Posters e Print |
| **Awwwards** | awwwards.com | os sites mais premiados: o "nível máximo" para comparar |
| **Muzli** | muz.li | inspiração diária (também é extensão do Chrome que troca a nova aba) |
| **Fontshare** | fontshare.com | fontes premium **grátis inclusive para uso comercial** (Satoshi, Clash Display, General Sans, Cabinet Grotesk...) |
| **SaaS Frame** | saasframe.io | telas reais de SaaS, dashboards, formulários e onboarding (bloqueia robôs: abra no navegador) |
| **Inspotype** | inspotype.com | combinações de fontes + paletas para testar na hora |
| **Jitter** | jitter.video | animações e microinterações de UI sem After Effects (exporta MP4/GIF/Lottie) |
| **Design Reviewed** | designreviewed.com | acervo histórico com 150+ anos de design gráfico (cartazes, capas): ótimo para pôster e carrossel com cara de época |
| **Brik Space** | brik.space | efeitos visuais, tipografia cinética e ferramentas interativas rápidas |

## Fluxo: referência → trabalho
1. **Escolher a referência** conforme o pedido:
   - site de comércio ou demo → Recent (filtro Web) e Awwwards;
   - painel ou sistema → SaaS Frame;
   - carrossel ou pôster → Recent (Posters) e Design Reviewed.
   Abra no navegador do app e mostre 2–3 opções ao usuário.
2. **Extrair o estilo** com a skill `design-dna` (URL ou print → JSON com tokens, estilo e efeitos). Nunca copie o site: só a linguagem visual (cores, ritmo, tipografia, espaçamento).
3. **Fontes:** Fontshare carregado pelo link oficial (**não baixar nem hospedar os arquivos**: a licença ITF FFL proíbe redistribuir):
   ```html
   <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=clash-display@600&display=swap" rel="stylesheet">
   ```
   Para combinar fontes e cores, teste no Inspotype. Alternativa sem restrição nenhuma: Google Fonts.
4. **Movimento:** GSAP (skill `ui-animada`) no site. Para animar um logo ou ícone rápido, Jitter (o usuário faz no navegador) ou Remotion (`motion-design`).
5. **Conferir o nível:** comparar lado a lado com a referência do Awwwards/Recent antes de entregar.

## Regras
- Referência inspira, não se copia: nada de pegar textos, imagens ou logos do site de referência.
- Fontes de cliente: prefira Fontshare (via link) ou Google Fonts. Fontes "grátis para uso pessoal" (dafont etc.) não servem para cliente (ver `fontes-cinematograficas`).
