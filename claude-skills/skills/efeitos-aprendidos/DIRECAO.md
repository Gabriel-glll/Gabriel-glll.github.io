# Direção de edição — "edite esse vídeo"

Quando o usuário mandar só um vídeo (ou um tema) sem pedir efeitos, agir como editor. Não perguntar quais efeitos usar. Seguir este roteiro e depois mostrar o resultado; a correção do usuário vira regra no SKILL.md.

## 1. Entender o material (antes de escolher qualquer efeito)

1. Transcrever (`scripts/transcribe.mjs`) e extrair quadros (ffmpeg `fps=1` + tile) para ver o que existe.
2. Classificar o vídeo:
   | Tipo | Sinais | Referência-modelo |
   |---|---|---|
   | Pessoa falando (talking head) | rosto na câmera, fala contínua | Tiago, Gabriel, Reconnect Motion Reels |
   | Venda direta / anúncio (copy) | narração de oferta, preço, CTA | Reconnect Hard Copy Motion |
   | Marca premium / institucional | sem fala ou fala curta, produto, logo | Reconnect Motion Design, Platter, OFFSEN |
   | Produto / moda | peça, detalhe, textura | OFFSEN, VM |
   | Tutorial / explicativo | passos, números, conceitos | Tiago (3D/mapa), Imob |
   | Site / app / digital | telas, interface | wearebrand, Nicolas, Ngoc, Shivansh |
   | Lista de ferramentas/dicas (série) | "pt.N", várias ferramentas citadas | Tales, Maximiliano, Gabriel |
   | Marca de roupa / lifestyle sem fala | peças, etiqueta, modelos, só música | WRN, Platter, OFFSEN |
   | Produto físico viral (IA) | joia, acessório, objeto pequeno | Soliê (chaos trend) |
3. Definir o tom (energia): calmo-premium · confiante · enérgico-viral. Isso decide velocidade de corte e intensidade dos efeitos (tabela 3).
4. Mapear os momentos da fala (marcar índice da palavra):
   - **Gancho** (primeiros 1–2s), **palavra-chave** (substantivo forte, verbo de ação), **número/preço/prazo**, **lista** (3+ itens), **contraste** ("não é X, é Y"), **mudança de assunto**, **prova** (cliente, resultado, depoimento), **objeto citado** (produto, lugar, ferramenta), **CTA** (final).

## 1b. Estilo e cor (OBRIGATÓRIO, automático — ver `CORES-E-DESIGN.md`)

Antes de qualquer efeito: escolher **1 estilo de design** (dos 20) e **1 par de cor** (cor profunda + neutro quente, nunca branco puro) que combinem com o assunto e o tom; a marca do cliente manda quando existir. Tipografia = sans pesada + 1 palavra em serif itálica na cor. Tudo (fundo, legenda, pílula, card) só nessas cores. Informar na entrega: "estilo X, par Y".

## 2. Momento → efeito (escolher 1 por momento, sem empilhar)

| Momento | Efeito principal | Alternativas | Evitar |
|---|---|---|---|
| Gancho (0–1,5s) | Zoom punch (E02) + palavra grande com pop | Flash (E14), texto atrás da pessoa (L07) | começar parado, logo antes do gancho |
| Palavra-chave | Palavra grande destacada (serif itálica ou display) na legenda | Texto atrás da pessoa (L07), neon (E08) se o fundo for escuro | destacar mais de 1 palavra por frase |
| Número / preço / prazo | Contador (E10) | Pílula com número, texto neon (E08) | número estático sem animação |
| Lista de 3+ itens | Pílulas empilhando (L02) | Card de UI com check (L08), notificações (E13) | todos os itens de uma vez |
| Contraste "não é X" | Risco sobre X + Y entra com pop | Glitch curto (E16) em X | — |
| Mudança de assunto | Whip pan (E15) | Light leak (E03), corte com flash (E14) | fade simples (parece amador) |
| Prova social | Notificações empilhando (E13) | Card de UI (L08), foto em cartão inclinado (L04) | — |
| Objeto/produto citado | Foto em cartão inclinado (L04) / produto IA girando (L15) | Objeto 3D (L10), shine passando (E04) | foto parada em tela cheia |
| Lugar / localização | Mapa com rota (L13) | Mapa antigo (L12) em tom documental | — |
| Conceito abstrato | 3D explicativo (L11) | Linha que se desenha (E12) | — |
| Digital (site/app) | Site no monitor (L09) | Celular/notebook 3D (HyperFrames `vfx-iphone-device`) | print estático |
| CTA final | Botão com cursor tocando (L03) + logo desenhando (L06) | Logo letra a letra | terminar sem movimento |

## 2b. Formato → estrutura (ver detalhes em REFERENCIAS.md)

| Formato | Estrutura |
|---|---|
| Pessoa + lista | tela dividida (B-roll em cima, pessoa embaixo), legenda na emenda com palavra-chave laranja, badge "#n" por item, corte a cada ~1,3s (Maximiliano) |
| Série de dicas | 3s de rosto com gancho + título serif fixo no topo; 1 bloco de ~4–5s por item (título + subtítulo + tela rolando); CTA escrito no último bloco (Tales) |
| Showcase de site | uma tomada só, frase-gancho fixa no topo o vídeo inteiro, rolagem lenta mostrando muitas telas, tremida leve (Shivansh) |
| Marca de roupa | montagem em rampa de cortes (0,067s acelerado → desacelera ×1,2 até segurar no logo), positivo/negativo alternado, monocromático (WRN) |
| Produto viral | tomada contínua por IA: vida normal → acidente em câmera lenta → produto arrumado como vitrine; marca aparece no celular/sacola/caixa (Soliê) |

## 3. Tom → intensidade

| Tom | Corte médio | Efeitos permitidos | Música |
|---|---|---|---|
| Calmo-premium | 2–3s | glow suave, gobo (E11), rack focus (E17), light leak, tracking abrindo (E09), duotone | lenta / ambiente |
| Confiante | 1,5–2s | cartões, pílulas, whip pan, shine, contador | hip-hop / corporate moderno |
| Enérgico-viral | 0,4–1s, corte na batida (L14) | zoom punch, flash, glitch, aberração cromática (E01), lente (E05), rampa de velocidade (E18) | trap / batida forte |

## 4. Regras fixas (aprendidas)

- Sempre algo em movimento: câmera viva em todo plano; checar `freezedetect` (0 trechos > 0,25s).
- Primeiro segundo nunca é tela vazia: o gancho já entra no quadro 0.
- Um efeito "assinatura" por vídeo (o que se repete e vira identidade); os outros só pontuam.
- Legenda sempre presente em vídeo com fala; hierarquia: palavra-chave grande, apoio pequeno.
- Música baixa sob a voz (~0,2), sobe nos trechos sem fala; cortes no tempo da batida quando não há fala (`scripts/beats.py`).
- Cores e fontes da marca do cliente (ver CLAUDE.md > Marcas); sem marca definida, usar a paleta mais próxima da referência-modelo.
- Material com legenda gravada: ampliar 1,14x a partir do topo.

## 4b. Checklist "nível Tiago" (R6 — opcional: usar só quando o vídeo combinar com esse estilo)

Antes de entregar talking head, conferir:
- [ ] Uma paleta (1 cor de destaque) em TODOS os gráficos + grade de cor puxando o vídeo para ela (pretos fundos, destaque saturado).
- [ ] Título atrás da cabeça no topo em cada frase-chave (kicker pequeno + palavra gigante + pílula colorida na 2ª linha).
- [ ] Legenda pequena no peito, palavra-chave na cor de destaque — título e legenda nunca do mesmo tamanho.
- [ ] Um momento de contraste tipográfico (outra família, condensada) só no clímax.
- [ ] UI flutuando ao lado/atrás da cabeça com borda luminosa quando a fala cita algo (página, produto, número).
- [ ] Zero gráfico estático; push-in lento na tomada.
- [ ] CTA persistente nos últimos ~8s + cartão final com logo/slogan.

## 5. Entrega

Renderizar, medir parados, gerar folha de quadros para conferir, e mostrar ao usuário com uma lista curta: "decisões de edição" (momento → efeito usado). A resposta dele atualiza este guia.
