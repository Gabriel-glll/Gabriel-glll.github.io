---
name: efeitos-aprendidos
description: Receitas de efeitos de motion que o usuário ensinou a partir de referências (Reels/anúncios). Carregar SEMPRE antes de criar ou editar qualquer vídeo no motion-studio, e ao receber uma nova referência de efeito para aprender.
---

# Efeitos aprendidos (caderno de receitas do usuário)

Este é o canal de ensino do usuário. Cada efeito vira uma receita: de onde veio, como reproduzir, e o que o usuário aprovou ou corrigiu. O usuário ensina enviando referências; a receita só é "aprovada" quando ele diz.

## Como aprender um efeito novo (fluxo obrigatório)

1. Baixar a referência (`og:video` ou `video_versions` da página do Instagram) para o scratchpad.
2. Extrair quadros densos do trecho (ffmpeg `fps=10` no trecho indicado) e descrever o efeito em termos técnicos: o que se move, curva de easing, duração em quadros, camadas, desfoque/brilho/cor.
3. Procurar implementação pronta antes de escrever do zero:
   - HyperFrames: `npx hyperframes catalog <palavra>` (447 blocos/componentes: transições shader, light leak, whip pan, glitch, lower thirds, 3D, mapas...)
   - Remotion: efeitos de `@remotion/effects` (glow, lightLeak, chromaticAberration, zoomBlur, motion blur...) e `@remotion/transitions`
   - Biblioteca própria: `src/lib/*`
4. Reproduzir isolado em `src/efeitos/<slug>.tsx` (Remotion) ou bloco HyperFrames, render curto em `out/efeitos/<slug>.mp4`.
5. Gerar comparação lado a lado (referência x reprodução) e registrar abaixo com status `🔧 aguardando aprovação`.
6. Quando o usuário aprovar/corrigir, atualizar o status e anotar a correção (a correção vale mais que a receita).

## Catálogo e retorno do usuário

- Página: https://claude.ai/artifact/5rUSNQZBPxQ6Ewj67Qgjq8 (fonte `out/efeitos/catalogo.html`, prévias em `out/efeitos/prev/`).
- As respostas ficam no banco da página, coleção `avaliacoes` (doc id = id do efeito; campos `status` aprovado|refazer, `nota`). Ler com a ferramenta `ArtifactData` action `list`. Toda nota de "refazer" vira correção nesta skill e o efeito é refeito.
- Efeitos novos: componente em `src/efeitos/`, registrar em `CATALOGO_NOVOS`, renderizar com `node scripts/render-efeitos.mjs <prefixo>`, adicionar na lista `EFEITOS` do `catalogo.html` e republicar no mesmo caminho.
- Guia para "edite esse vídeo": `DIRECAO.md` nesta pasta.
- Cores e estilos de design: `CORES-E-DESIGN.md` (7 pares de cor, 20 estilos, fórmula de motion em 5 decisões). Aplicar em TODA edição sem o usuário pedir.
- Como cada referência foi feita (análise quadro a quadro): `REFERENCIAS.md`. O usuário prefere que eu APRENDA (registre a técnica) em vez de reproduzir demos de cada referência.

## Receitas

| Efeito | Referência (onde aparece) | Como fazer | Status |
|---|---|---|---|
| Palavra entra com blur + sobe | Reconnect MD/MR | `KineticText` (`src/lib/Kinetic.tsx`), 14 quadros, bezier(0.16,1,0.3,1), segue subindo depois | ✅ |
| Cena nunca para (câmera viva) | Reconnect MD | `SceneShell`: push-in + drift + rotação leve; corte = empurrão vertical + blur | ✅ (correção do usuário: "pareceu travado") |
| Texto atrás da pessoa | Tiago | rembg por quadro (`scripts/cutout.py`) + `BehindWord` + `PersonCutout` | 🔧 |
| Card de UI sobre pessoa | Gabriel | `UICard` + `CaptionBox` | 🔧 |
| Site dentro do monitor | wearebrand/Nicolas | `record-site.mjs` + `find-screen.py` + `CornerPin` | 🔧 |
| Corte na batida | Platter | `scripts/beats.py` (librosa) | 🔧 |
| Rampa de cortes desacelerando + positivo/negativo | WRN | intervalos 0,067s → ×1,2 até o logo; `invert` alternado | 📘 aprendido |
| Tomada contínua "chaos" de produto (IA) | Soliê | quadros-chave inicial/final + IA de vídeo first/last frame, encadear clipes | 📘 aprendido |
| Tela dividida + legenda na emenda com palavra laranja + badge #n | Maximiliano | `TalkLabCard` + `CaptionBox` adaptado | 📘 aprendido |
| Série de dicas com título serif fixo | Tales | 3s de gancho + blocos de 4–5s | 📘 aprendido |
| Showcase em uma tomada com frase fixa | Shivansh | `record-site` + `CornerPin` + tremida | 📘 aprendido |
| Tour imobiliário "chave do futuro lar": gancho com personagem IA jogando a chave + flash de luz quente + giros/chicotes com blur no corte + texto 3D deitado no piso + cartão PIP encolhendo + revelação final | xepafilmes DarDTUlu4e9 (17/10) | `src/videos/ImovelCA0036.tsx` (`Shot` enter/exit, `GroundText`, `LightLeak`, `PipCard`); personagem = FLUX Kontext sobre a foto real + Wan i2v + `scripts/enhance.sh`; cortes a cada 2 batidas | ❌ reprovado 17/10 ("ficou bem feio, tem que ser mais parecida"): foto parada não substitui câmera andando |
| Foto → clipe com câmera 3D (paralaxe 2.5D) | necessidade do lote 4 | `scripts/parallax.py` (Depth Anything V2 ONNX local + remap; dolly/truck/orbit/crane) | 🔧 teste enviado |
| Holograma saindo da tela → maquete → casa real (corte casado) | ar.amegh_ajay R8 | mão + render ciano em `screen` + IA de vídeo com quadro inicial/final | 📘 aprendido |
| Voo contínuo de IA + neon laranja (contorno, rotas, bolhas com cômodos) + dia→noite | montani3d R9 | clipes de IA encadeados + `evolvePath`/glow/`stroke-dasharray` no Remotion | 📘 aprendido |
| Tour cinematográfico sem texto: gimbal lento, contra-plongée, objeto em 1º plano limpando a tela, cor quente suave | anielsciunitti R10 | precisa de filmagem; com fotos, paralaxe + wipe por objeto + gradação quente | 📘 aprendido |
| Acabamento "nível Tiago": paleta única + título atrás + letreiro + camadas 3D + mosaico + sizzle rotulado | tiagolemosx R6 | `src/lib/Premium.tsx`; demos `PremiumTalkLab`/`SizzleLab` (`src/lab/TiagoLab.tsx`); checklist em DIRECAO.md 4b | ✅ aprovado 17/10 ("ficou no nível") |

**Vídeo imobiliário (regra do usuário, 17/10):** ficar PARECIDO com a referência. Nunca entregar foto parada com zoom + cartões; antes de editar, garantir movimento real (filmagem, IA de vídeo ou paralaxe) e comparar lado a lado com a referência (`REFERENCIAS.md` lote 4).

## Correções do usuário (regras)

- Sempre algo em movimento; medir com `ffmpeg freezedetect` (alvo: 0 trechos parados > 0,25s).
- O objetivo é aprender EFEITOS isolados das referências, não fazer vídeos inteiros de marca.
- Tempo de entrega importa: etapa que leva muito tempo (ex.: recorte por quadro de ~1000 quadros ≈ 60 min na CPU) deve ser avisada ANTES, com a alternativa rápida. Na edição de 17/10 o usuário preferiu abrir mão da troca de cenário a esperar 60 min. Para trocar cenário rápido no futuro: testar onnxruntime-directml (GPU AMD) ou recortar em resolução menor.
