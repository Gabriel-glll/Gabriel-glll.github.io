# Laboratório de técnicas

Cada técnica tirada das referências vira um componente/pipeline reutilizável + uma demo curta em `out/lab/`.
Status: ✅ dominada (demo renderizada) · 🔧 em construção · ⏳ falta · 🔒 depende do usuário

| # | Técnica | Referências | Ferramentas | Status |
|---|---|---|---|---|
| T01 | Texto cinético sincronizado com a voz (palavra por palavra, hierarquia sans/serif) | Reconnect HC/MD/MR, Tiago | Remotion + Whisper/TTS | ✅ `src/lib/Kinetic.tsx` |
| T02 | Câmera/fundo sempre vivos, cortes com empurrão+blur | Reconnect MD | Remotion | ✅ `SceneShell` |
| T03 | Fundo glow + swoosh de luz + grão + vinheta | Reconnect MD/MR | Remotion | ✅ `src/lib/Background.tsx` |
| T04 | Pílulas, risco, anel de pontos, logo letra a letra, CTA com cursor | Reconnect MD | Remotion | ✅ `src/lib/Elements.tsx` |
| T05 | Foto em cartão inclinado + Ken Burns, foto/vídeo em tela cheia | Reconnect HC | Remotion | ✅ `src/lib/Media.tsx` |
| T06 | Narração sintética com tempos de palavra | — | Edge TTS | ✅ `scripts/tts.mjs` |
| T07 | Transcrição local de voz real | Tiago | whisper.cpp | ✅ `scripts/transcribe.mjs` |
| T08 | Banco de fotos/vídeos/música grátis | — | Pixabay API/Music | ✅ `scripts/stock.mjs` |
| T09 | Pessoa falando: corte automático de pausas | Tiago, Gabriel, Imob | auto-editor (voz limpa) + corte pela transcrição (com música) | ✅ `src/lib/jumpcut.ts`, `out/lab/TalkLabBehind.mp4` |
| T10 | Legenda dinâmica sobre pessoa (caixa preta / hierarquia) | Gabriel, Reconnect MR | Remotion | ✅ `CaptionBox` em `src/lib/Talking.tsx` |
| T11 | Texto ATRÁS da pessoa (recorte por quadro) | Tiago | rembg (`scripts/cutout.py`) + Remotion | ✅ `PersonCutout`/`BehindWord`, `out/lab/TalkLabBehind.mp4` |
| T12 | Cards de interface animados sobre pessoa (split tela) | Gabriel, Tiago | Remotion | ✅ `UICard`, `out/lab/TalkLabCard.mp4` |
| T13 | Objeto 3D girando (cartão, produto) | Fernando | @remotion/three | ✅ `CardLab` em `src/lab/ThreeLab.tsx` |
| T14 | 3D explicativo (Terra abrindo em camadas, casa explodindo em cômodos) | Tiago | @remotion/three | ✅ `EarthLab` em `src/lab/ThreeLab.tsx` |
| T15 | Mapa animado com rotas e marcações | Tiago (documentário), Imob | SVG + d3-geo + Natural Earth (mapa antigo) · MapLibre + OpenFreeMap + Turf (rotas reais) | ✅ `out/lab/MapDocLab.mp4`, `out/lab/MapRouteLab.mp4` |
| T16 | Site gravado rolando + inserido num monitor/notebook (corner pin) | wearebrand, Nicolas, Ngoc, Fernando | Playwright quadro a quadro (`scripts/record-site.mjs`) + detecção de tela OpenCV (`scripts/find-screen.py`) + `CornerPin` | ✅ `out/lab/SiteLab.mp4` |
| T17 | Site com rolagem que anima sequência de quadros | Ngoc | Three.js/canvas + vídeo IA | ⏳ |
| T18 | Imagem por IA (produto, cena, fundo) | Imob, OFFSEN, Platter | FLUX (HF Space, `scripts/ai.py image`) | ✅ |
| T19 | Vídeo por IA a partir de imagem | OFFSEN, Imob, Ngoc | Wan 2.2 (HF Space, `scripts/ai.py video`) + RIFE/Real-ESRGAN (`scripts/enhance.sh`) | ✅ `out/lab/OffsenLab.mp4` |
| T20 | Edição de imagem por IA a partir de foto real (mockup com a arte real) | Platter, OFFSEN | FLUX Kontext / Qwen-Image-Edit (`scripts/ai.py edit`) | ✅ mockups em `public/lab/ai/` |
| T21 | Identidade de marca: logo em mockups, silhueta duotone, cortes rápidos | Platter | mockups IA + silhuetas rembg + logo extraído (OpenCV) + corte na batida (librosa `scripts/beats.py`) | ✅ `out/lab/BrandLab.mp4` |
| T22 | Texto 3D plantado em cenário real (sombra no chão) | Imob | Blender (script) | ⏳ |
| T23 | Remover fundo do vídeo e trocar por cenário 3D | Tiago | rembg + three | ⏳ |
| T24 | Documentário: câmera entrando em foto antiga, mapa envelhecido | Tiago | Remotion + IA imagem | ⏳ |
| T25 | Fotos de pessoa real (gravação do usuário) | Reconnect MR, Tiago, Gabriel | — | 🔒 precisa gravação |
| T26 | Grade de cor puxando para a paleta da marca (LUT/curvas por vídeo) | tiagolemosx R6 | ffmpeg `lut3d`/`colorbalance` ou CSS filter no Remotion | ✅ `GradedBackground`/`SetLights`/`GradedPerson`/`FinishGrade` em `src/lib/Premium.tsx`, `out/lab/PremiumTalkLab.mp4` |
| T27 | Título atrás da cabeça com kicker + pílula na 2ª linha, entrada letra a letra | tiagolemosx R6 | `BehindWord` + `PersonCutout` (recorte em resolução menor p/ ser rápido) | ✅ `BehindTitle` (kicker + título + pílula; `condensed` p/ clímax), `out/lab/PremiumTalkLab.mp4` |
| T28 | Letreiro em faixas correndo atrás da pessoa (marquee contorno/sólido) | tiagolemosx R6 | Remotion + recorte | ✅ `Marquee`, `out/lab/PremiumTalkLab.mp4` e `SizzleLab.mp4` |
| T29 | Painéis de vidro em perspectiva 3D com a pessoa dentro ("camadas") | tiagolemosx R6 | CSS 3D ou @remotion/three | ✅ `GlassLayers` (camadas reais da cena abrindo em CSS 3D), `out/lab/SizzleLab.mp4` |
| T30 | Mosaico de miniaturas com zoom-out ("na sua escala") | tiagolemosx R6 | Remotion grid | ✅ `Mosaic` (zoom-out da miniatura central), `out/lab/SizzleLab.mp4` |
| T31 | Sizzle rotulado: pílula-rótulo + demo de ~1s por técnica | tiagolemosx R6 | composição de T10–T30 | ✅ `SizzleLab` em `src/lab/TiagoLab.tsx` (+ `TagPill`, `FocusBrackets`, `FloatCard`, `SmallCaption`, `CtaPill`) |
