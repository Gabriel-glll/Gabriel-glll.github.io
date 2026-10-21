# motion-studio

Fábrica de vídeos verticais (Reels, 1080x1920, 30fps) feitos em código com Remotion 4.0.536.
Skills oficiais do Remotion em `.claude/skills/` — carregar `remotion-best-practices` antes de mexer no código.

## Fluxo

1. Narração:
   - voz real do usuário: salvar em `public/audio/<nome>.m4a|mp3` → `node scripts/transcribe.mjs public/audio/<nome>.m4a` (Whisper local, modelo `small`, gera `<nome>.words.json`)
   - voz sintética de teste: `node scripts/tts.mjs <nome> "<texto>" [voz] [rate]` (Edge TTS grátis, `pt-BR-AntonioNeural` / `pt-BR-FranciscaNeural`; já gera `.words.json`)
2. Ler os índices das palavras e criar o vídeo em `src/videos/<Nome>.tsx`: cenas definidas pelo índice da 1ª palavra (`scenesFromWords`), cada palavra aparece no instante em que é falada (`KineticText`).
3. Registrar em `src/Root.tsx`. Revisar com `npx remotion still <Id> out/stills/fN.jpg --frame=N --scale=0.5` antes de renderizar.
4. Render: `npx remotion render <Id> out/<nome>.mp4 --crf=18`.

Banco de imagens: `node scripts/stock.mjs <foto|video> "<busca em inglês>" [qtd] [pasta]` → `public/stock/<pasta>/` (Pixabay se `PIXABAY_API_KEY` no `.env`, senão Openverse só fotos com crédito em `credits.json`). Pexels pausou novas chaves de API em out/2026.

FFmpeg completo instalado via winget (Gyan.FFmpeg); o PATH pode não estar atualizado na sessão — usar `node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe` como alternativa.

## Lições técnicas (não repetir erros)

- 3D: renderizar com `--gl=angle`. Textura de imagem: carregar FORA do `<ThreeCanvas>` com `delayRender` e só chamar `continueRender` depois que o React aplicou a textura (2x requestAnimationFrame) — ver `useTexture` em `src/lab/ThreeLab.tsx`. Trocar `map` depois exige recriar o material (`key`). `useLoader`/Suspense NÃO segura o render.
- Textura gerada (CanvasTexture via canvas 2D) funciona direto — ótimo para cartões, rótulos, cortes.
- Vídeo com legenda gravada embaixo: `scale 1.14` com `transformOrigin 50% 0%` empurra a legenda para fora do quadro.
- Corte de pausas: auto-editor só funciona com voz limpa; com música de fundo usar `buildCut` (pela transcrição).
- ffmpeg do Remotion é reduzido (sem fps/jpg/drawtext) — para processar mídia usar o ffmpeg completo do winget.

- IA de vídeo (Wan): pedir "no particles" se não quiser partículas; a estampa pode "pular" para a frente ao girar 180° (limitação do modelo) — preferir giros curtos.
- Ferramentas locais em `tools/`: RIFE (`rife-ncnn-vulkan`, interpolação de quadros) e Real-ESRGAN (`realesrgan-ncnn-vulkan`, ampliação), rodam na GPU AMD via Vulkan. ~4 min para 4s de vídeo.

- Vídeo de celular/WhatsApp (baixa resolução): ampliar com Real-ESRGAN `realesr-animevideov3 -s 2` (~2,5s/quadro na GPU AMD); `realesrgan-x4plus` é inviável (~90s/quadro). Ampliar só os quadros que sobram após o corte.
- Pausas: whisper.cpp estica o fim da palavra até a próxima → não serve para achar pausa. Usar energia do áudio (RMS a cada 0,1s, limiar = piso + 35% até a fala) — ver `public/edit/whats1/gaps.json` e a edição `src/edits/EditWhats1.tsx`. Depois cortar o áudio, limpar (afftdn + highpass + loudnorm) e transcrever DE NOVO o áudio cortado para a legenda.
- Rastreamento de mão: MediaPipe Tasks (`scripts/track-hand.py`, modelo em `tools/models/hand_landmarker.task`). O C++ do MediaPipe não abre caminho com acento: carregar modelo e imagem em memória (já feito no script). "Left" do MediaPipe = mão que aparece à direita na tela.
- Troca de cenário: recorte por quadro (`scripts/cutout-dir.py`, retoma de onde parou) + `scripts/refine-alpha.py` (erode 2px + blur) para tirar halo da parede antiga; cenário desfocado (blur 5px) e pessoa com sepia/brilho para casar a luz; sombra borrada da própria silhueta atrás.
- Efeito em cima de mão/objeto: vídeo de elemento com fundo preto (Pixabay) + `mixBlendMode: screen` + máscara radial, posicionado pela palma suavizada (±4 quadros), luz do elemento como radial-gradient em screen sobre a pessoa.

## Marcas

- **VM** (`public/marcas/vm/`): fotos de estúdio em `modelos/` (fundo branco, 4672x7008 — usar cópias reduzidas em `sel/`), vídeos em `videos/` (Reels 1 tem o logo se desenhando em 12.9–14.5s; making-of tem a rosa sendo pintada em ~35.6s). Paleta preto #0d0d0d / branco #efeeea / vermelho #c8141d; fontes Anton (display) + Instrument Serif itálico. Tagline "Only you have". Site vmoficial.com.br. Mensagem cristã sutil, nunca pregação. Vídeo: `src/videos/VmReels1.tsx`.
- Arquivos do OneDrive que estão só na nuvem não podem ser lidos daqui ("operação de nuvem malsucedida") — o usuário precisa marcar a pasta como "Sempre manter neste dispositivo".

## Biblioteca (`src/lib`)

- `Background.tsx`: `GlowBackground` (manchas de luz flutuando), `LightSwoosh` (curva de luz que se desenha), `Grain`, `Vignette`
- `Kinetic.tsx`: `SceneShell` (entrada zoom+blur, saída blur), `KineticText` (tokens: serif/accent/pop/dim/scale/heavy)
- `src/videos/Eleicoes2Turno.tsx` (estilo Editorial, vinho+areia): componentes prontos p/ reaproveitar — `Stamp` (carimbo com borda áspera), `Rewind` (ano voltando + íris abrindo quadro antigo), `Hemicycle` (assembleia em semicírculo), `SplitChoice` (tela dividida com texto vertical), `MisFit` (objeto que não encaixa), `Ledger` (lista de jornal com X), palavra deformada por feDisplacementMap, `Chrome` (cabeçalho de jornal + barra de progresso)
- `Elements.tsx`: `Pills`, `StrikeThrough`, `DotRing`, `Wordmark`, `CtaButton` (com cursor tocando)
- `Premium.tsx` (nível Tiago, paleta `ROXO`): `GradedBackground`+`SetLights`+`GradedPerson`+`FinishGrade` (cena puxada p/ a paleta, precisa do recorte da pessoa), `BehindTitle`, `Marquee`, `GlassLayers`, `Mosaic`, `TagPill`, `FocusBrackets`, `FloatCard`, `SmallCaption`, `CtaPill`. Demo: `src/lab/TiagoLab.tsx`. Fonte `heavy` (Montserrat 900) em `fonts.ts`.
- `public/sfx/`: whoosh, whip, mouse-click, ding, switch

## Ferramentas instaladas

- Python 3.12 em `%LOCALAPPDATA%\Programs\Python\Python312\python.exe` (fora do PATH — chamar pelo caminho completo)
  - `auto-editor`: corta pausas/silêncio de gravações (`python -m auto_editor arquivo.mp4`)
  - `rembg` (modelo `u2net_human_seg`): recorta pessoa do fundo → texto ATRÁS da pessoa (testado em foto36)
- Remotion extras: `@remotion/three` + three + @react-three/fiber (3D), `@remotion/lottie`, `@remotion/gif`, `@remotion/motion-blur`
- Playwright + Chromium: gravar sites rolando (para vídeos tipo "site 3D no monitor")
- Blender 5.2.2 LTS em `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe` (dá para rodar por script: `blender -b -P script.py`) para 3D pesado/texto 3D em cenário
- Skill `instagram-marketing` (sergebulaev) em `.claude/skills` — legendas, ganchos, carrosséis. Não configurar chaves de terceiros (Publora/Apify/Pixfaro) sem o usuário pedir.
- Gemini API (`GEMINI_API_KEY` no .env, `scripts/gen-image.mjs`, `scripts/check-keys.mjs`): chave válida, mas em out/2026 o plano GRÁTIS tem cota 0 para todos os modelos de imagem (gemini-2.5-flash-image, 3.1-flash-image, 3.1-flash-lite-image) → 429. Veo também é pago. Imagem grátis = gemini.google.com no navegador do app (login do usuário).
- Música: `public/music/` + `credits.json`. Usuário autorizou baixar da Pixabay Music sempre que precisar. A URL do mp3 está no HTML da página da faixa (cdn.pixabay.com/download/audio/...).
- Hugging Face (`HF_TOKEN`, read, conta GabrielGil, plano free): Inference Providers SEM crédito (402). O que FUNCIONA grátis são Spaces via `gradio_client` (Python) com cota diária ZeroGPU:
  - imagem: `black-forest-labs/FLUX.1-schnell` api `/infer` (prompt, seed, width, height, num_inference_steps=4) — testado, ótimo
  - TROCA DE PERSONAGEM em vídeo (trend "Genjutsu"/Higgsfield): `Iceyy4400/wan22-animate-character-replace` api `/generate_video` (reference_image, video={"video":...}, 480x832, frame_load_cap, prompts) — script em `public/ozil` / scratchpad `wanrep.py`. Rodar com `python -I -X utf8`. Cota grátis acaba rápido (conta e anônimo por IP); o oficial `Wan-AI/Wan2.2-Animate` saiu do ar. Face swap local (insightface + inswapper) NÃO serve p/ rosto pequeno de transmissão.
  - vídeo a partir de imagem: `zerogpu-aoti/wan2-2-fp8da-aoti-faster` api `/generate_video` (input_image, prompt, steps=6, duration_seconds≤~5) → 480x832 16fps — testado (camiseta girando). Alternativa: `Lightricks/ltx-video-distilled` /image_to_video
- Kling (`KLING_API_KEY`, Bearer, domínio https://api-singapore.klingai.com): chave válida (GET /account/costs = 200) mas SEM pacote de recursos; API só funciona comprando pacote (inclusive o de teste). Créditos diários grátis valem só no site kling.ai.
- Weave (Figma MCP, `weave_run_model`): imagem funciona com créditos grátis (Nano Banana Pro 11 cr); Kling/Veo dão erro "only available on paid plans". Upload de mídia: POST multipart em `submitUrl` do `weave_upload_asset` com `token` + `file`.
- Trend Ozil AI goal: receita em `ia-video/jesus-gol/RECEITA.md`, script `scripts/wan-replace.py`.
- pollinations.ai sem chave: testado, qualidade ruim + marca d'água — não usar.

## Referências do Instagram estudadas (out/2026)

0. tiagolemosx (Dd7zohQgyyQ, "Claude 5.5 Editando") — FERRAMENTA REVELADA: Claude + um estúdio de vídeo em código rodando local (localhost:3240, projeto "TesteDeFogo", com timeline) — mesma categoria do nosso Remotion Studio. Fez: remover fundo do vídeo e reconstruir cenário 3D iluminado, casa 3D explodindo em cômodos sincronizada com a fala, documentário com mapa antigo e câmera entrando na foto, Terra 3D abrindo em camadas, cards em camadas ("cinco camadas"). Diz que é "instalar um sistema e orientar" o Claude/ChatGPT.
1. tiagolemosx — VSL editada por IA: pessoa falando + corte de pausas + legenda + texto atrás da pessoa + molduras/cards 3D roxos. (auto-editor + rembg + Remotion)
2. Gabriel Tomaz — pessoa embaixo, cards de UI animados em cima (fundo claro), legenda em caixa preta. (Remotion)
3. wearebrand — sites 3D premium filmados no monitor. (Three.js/GSAP + Playwright + mockup)
4. Fernando Rank — anúncio motion feito pelo Claude: amarelo, tipografia gigante, cartão 3D girando. (Remotion + @remotion/three)
5. Rafael/Imob Labs — imagens/vídeos gerados por IA: texto 3D no terreno, mapa com rotas, renders de casa, piscina enchendo. (precisa IA generativa de imagem/vídeo)
6. Nicolas — site feito com Claude Code + Flow (vídeo IA), letras 3D caindo na abertura. (site + IA de vídeo)
7. Ngoc Phan — site com rolagem que anima sequência de quadros de vídeo IA (terno montando). (IA de vídeo + canvas)
8. The Platter — identidade de marca: logo em mockups (camiseta, tag, copo, boné), silhuetas duotone, cortes rápidos. (IA de imagem para mockups + Remotion)
9. OFFSEN — linha de bordado se formando em macro numa jaqueta, produto flutuando com spot. Muito próximo da VM. (IA de vídeo)

## Referências estudadas (Reconnect Studios — bibliotecareconnectstudios.com.br)

- **Hard Copy Motion** (R$70): fundo branco ou azul-escuro, texto palavra-por-palavra seguindo a voz, objetos 3D recortados (engrenagem, dinheiro, megafone), fotos em cards inclinados com sombra, logo fixo embaixo, corte a cada ~2s.
- **Motion Design** (R$300): 100% animado. Gradientes escuros com glow (azul/roxo/laranja), swoosh de luz, sombra de janela/folhas (gobo) sobre fundo cinza claro, mistura sans bold + serif itálica, pílulas com gradiente, cards de notificação de WhatsApp empilhados, mockups de celular/notebook/dashboard, anel com pontos, revelação do logo no fim.
- **Motion Reels**: pessoa falando para a câmera (gravação do cliente) + legenda dinâmica com hierarquia (palavra-chave grande, apoio pequeno, serif itálica no destaque) + inserts de motion entre as falas (fundo preto com swoosh colorido, cards de UI, fundo claro com estrelas/linhas).
- Ritmo geral: troca de cena a cada 1,5–3s, 25–70s de duração, CTA final ("clique agora", "toque no link").

## Vídeo imobiliário — foto → movimento (ordem de preferência)
1. Filmagem real do usuário (gimbal) — sempre melhor.
2. MCP `runway` (mcp.runwayml.com, login da conta Runway em /mcp, usa os créditos do plano) ou MCP `fal` (Kling/Veo, pago por clipe). Links de saída do Runway expiram em 24h: baixar na hora.
3. `scripts/wan-*.py` → Wan 2.2 via ZeroGPU do Hugging Face (grátis, cota limitada).
4. `scripts/parallax.py` → paralaxe 2.5D local (Depth Anything V2). Grátis, só para movimentos curtos.
GPU local é AMD integrada: modelos de vídeo locais (Wan/LTX) não rodam aqui.
