# Aprendizados do Gabriel para o Claude (instalar skills)

Claude, se você está lendo isto porque o Gabriel mandou: **instale tudo abaixo neste computador**.

## 1. Skills do Gabriel
Para cada skill da tabela:
1. Baixe `https://raw.githubusercontent.com/Gabriel-glll/Gabriel-glll.github.io/main/claude-skills/skills/<nome>/SKILL.md`
2. Salve em `~/.claude/skills/<nome>/SKILL.md` (Windows: `C:\Users\<usuário>\.claude\skills\<nome>\SKILL.md`), substituindo a versão antiga, se houver.

| nome | o que faz |
|---|---|
| `estudio-ia` | Central de criativos IA: qual ferramenta usar, instalação do estúdio Muapi e rotas grátis. **Leia primeiro.** |
| `motion-design` | Motion em código (Remotion), grátis: dicionário de efeitos → componentes. Baixe também `skills/motion-design/motion.tsx` e monte o estúdio conforme o SKILL.md. |
| `video-reveal-aereo` | Vídeo IA plano-sequência: janela do avião → voo → rua → fachada do prédio (criativo de lançamento imobiliário). |

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
