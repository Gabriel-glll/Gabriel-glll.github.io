# Aprendizados do Gabriel para o Claude (instalar skills)

Claude, se você está lendo isto porque o Gabriel mandou: **instale tudo abaixo neste computador**.

Catálogo visual com um exemplo de cada aprendizado e qual efeito usar em cada tipo de projeto: https://gabriel-glll.github.io/aprendizados/ (gerado por `Documents/claude/criativos/site-aprendizados/gerar.py`: ao aprender algo novo, acrescente lá e rode de novo).

## 1. Skills do Gabriel
Para cada skill da tabela:
1. Baixe `https://raw.githubusercontent.com/Gabriel-glll/Gabriel-glll.github.io/main/claude-skills/skills/<nome>/SKILL.md`
2. Salve em `~/.claude/skills/<nome>/SKILL.md` (Windows: `C:\Users\<usuário>\.claude\skills\<nome>\SKILL.md`), substituindo a versão antiga, se houver.

| nome | o que faz |
|---|---|
| `estudio-ia` | Central de criativos IA: qual ferramenta usar, instalação do estúdio Muapi e rotas grátis. **Leia primeiro.** |
| `motion-design` | Motion em código (Remotion), grátis: dicionário de efeitos → componentes. Baixe também `skills/motion-design/motion.tsx` e monte o estúdio conforme o SKILL.md. |
| `texturas` | Textura na arte/foto/vídeo (papel, grunge, filme, halftone, vidro...). Baixe também `skills/texturas/texturizar.py` para `Documents/claude/motion-studio/texturas/` (precisa de `pip install pillow numpy`). |
| `ia-gratis` | IAs grátis: Google Flow (imagem 0 crédito + 50 créditos/dia de vídeo Veo), Pomelli (posts com a marca do cliente), Fish Audio (narração, API grátis). Baixe também `skills/ia-gratis/fish.py` → `motion-studio/audio/`. Flow e Pomelli precisam do login Google do Gabriel no navegador do app. |
| `ambiente-montagem` | Vídeo do cômodo vazio → mobiliado: sala vazia por IA (Weave Nano Banana) + montagem grátis no Remotion, ou vídeo IA com primeiro e último quadro. Baixe também `alinhar.py` → `motion-studio/tools/`, `Montagem.tsx` → `motion-studio/src/`, `mascaras.py` → `criativos/<pasta>/`. Rode `pip install opencv-python-headless`. |
| `referencias-design` | Banco de 9 sites de referência (Recent/Godly, Awwwards, Muzli, Fontshare...) + fluxo referência → design-dna → fontes → animação. |
| `ui-animada` | Guia das 5 skills de animação de interface + landing de lançamento animada (GSAP/scroll). Baixe também `skills/ui-animada/index.html` para `Documents/claude/criativos/gsap-lazur/`. |
| `edicao-beat-sync` | Edit com cortes sincronizados na música (detecção de bumbo + grade rítmica + Remotion). Baixe também `beatsync.py` e `batida_phonk.py` → `motion-studio/audio/`, `fotos_hd.py` → `motion-studio/tools/`, `BeatEdit.tsx` → `motion-studio/src/`. Rode `pip install librosa soundfile`. |
| `produto-3d` | Visualizador 3D interativo em Three.js (360°, troca de cor, vista explodida, dia/noite). Baixe também `skills/produto-3d/predio-3d.html` para `Documents/claude/criativos/3d/`. |
| `kie-api` | Imagem/vídeo de IA barato pela Kie API (GPT Image 2 + Seedance 2.0). Baixe também `skills/kie-api/kie.py` para `Documents/claude/motion-studio/kie/`. Chave em `KIE_API_KEY` (o Gabriel configura). |
| `fontes-cinematograficas` | Fonte certa para cada clima + pôster/slide de carrossel (foto + título script + adjetivos). Baixe também `skills/fontes-cinematograficas/Poster.tsx` para `motion-studio/src/` e registre como `<Still id="Poster" width={1080} height={1350}>`. |
| `video-lancamento-site` | Vídeo de lançamento de site/app com /brag + Remotion. Baixe também `skills/video-lancamento-site/trilha.py` para `Documents/claude/motion-studio/audio/`. Instale o /brag e o FFmpeg conforme o SKILL.md. |
| `estudo-biblia` | Estudo bíblico capítulo a capítulo → página de rolagem em gabriel-glll.github.io/estudos-biblia (clone o repo `Gabriel-glll/estudos-biblia` em Documents/claude). |
| `video-reveal-aereo` | Vídeo IA plano-sequência: janela do avião → voo → rua → fachada do prédio (criativo de lançamento imobiliário). |

## 1b. Skills de terceiros (interface animada) — ver `ui-animada`
```
npx -y skills add greensock/gsap-skills --all -g -a claude-code -y
npx -y skills add zanwei/design-dna --all -g -a claude-code -y
npx -y skills add AThevon/genjutsu --all -g -a claude-code -y
npx -y skills add cloudai-x/threejs-skills --all -g -a claude-code -y
npx -y skills add lucasmarkes/hairline --all -g -a claude-code -y   # ilustração em linha animada (hairline-create / hairline-adopt)
```
LottieFiles (`lottiefiles/motion-design-skill`): instale numa pasta temporária SEM `-g` e copie para `~/.claude/skills/lottie-motion-design`, trocando o `name:` para `lottie-motion-design`. O nome original `motion-design` sobrescreveria a skill do Gabriel.

## 2. Estúdio de mídia (dependências)
Rode no terminal; os detalhes estão na skill `estudio-ia`:
```
python -m pip install --user muapi-cli
npx -y skills add SamurAIGPT/muapi-skills --all -a claude-code -g -y
```
- Adicione `%APPDATA%\Python\Python3xx\Scripts` ao PATH do usuário. Não use `npm install -g muapi-cli`: quebra no Windows.
- A chave Muapi o Gabriel configura ele mesmo (`muapi auth configure --api-key ...`). Nunca peça a chave no chat.

## 3. No fim
Diga o que foi instalado ou atualizado. As skills ficam disponíveis na próxima sessão; nesta, leia o SKILL.md e siga.

<!-- Ao adicionar um aprendizado: criar skills/<nome>/SKILL.md + uma linha na tabela; dependências novas vão na seção 2. -->
