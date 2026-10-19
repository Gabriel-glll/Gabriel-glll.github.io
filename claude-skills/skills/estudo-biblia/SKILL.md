---
name: estudo-biblia
description: Estudo bíblico do Gabriel, capítulo por capítulo, publicado como página visual de rolagem no site gabriel-glll.github.io/estudos-biblia. Use SEMPRE que ele disser "hoje vamos estudar <livro> <capítulo>", "vamos ler <livro> <cap>", "estudo de hoje", pedir um capítulo da Bíblia para estudar ou tirar dúvida sobre um estudo já feito.
---

# Estudo bíblico (site de rolagem)

O Gabriel estuda a Bíblia com você. Ele fala o livro e o capítulo; você entrega **o link publicado** de uma
página nova que se desenvolve rolando (sem clique). Resposta no chat: curta (link + 3-4 linhas do que tem).
Dúvidas depois: responda no chat; se a resposta for boa para o estudo, acrescente no próprio estudo.

## O que todo estudo precisa ter
1. **Introdução** (4 cartões): quem escreveu · para quem · quando + contexto da época · língua original.
2. **Contexto da época** (parágrafos + imagem + linha do tempo, destacando o momento do capítulo).
3. **Texto puro** (sem nenhuma anotação), dividido em parágrafos.
4. **Texto anotado**: blocos de versículos; ao lado, resumo + notas por versículo + comparação ARA × NAA × original.
5. **Palavras-chave na língua original** (hebraico/aramaico/grego + transliteração + sentido).
6. **Curiosidade**: UMA só, simples e leve, ligada ao texto (arqueologia, história, cultura), com foto.
7. **Para levar** (frase final) + fontes.

## Visual (padrão, baseado no demo gabriel-glll.github.io/vm-scroll)
O motor `assets/estudo.js` + `estudo.css` já faz tudo, igual para todo estudo — só preencha os dados:
capa com a foto dentro do número do capítulo + anel de texto girando + mergulho na imagem; faixas que
aceleram com a rolagem; cartões empilhados; palavras acendendo; linha do tempo horizontal; versículo do
centro aceso; palavras originais em tela cheia; curiosidade abrindo em círculo; **loop infinito** (no fim,
a capa reaparece e a página volta ao topo). GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13, carregados pelo JS.
Ignora "reduzir movimento" do Windows de propósito (ele quer os efeitos); `?simples` na URL desliga.
Melhorias de efeito vão no motor (valem para todos os estudos), nunca em um estudo só.

## Tradução — regra de direitos autorais
ARA e NAA são © Sociedade Bíblica do Brasil: **não copiar o capítulo inteiro** delas no site (é público).
- Texto puro e texto anotado: **Bíblia Livre 2018** (revisão aberta da Almeida, CC BY), gerado automaticamente.
- ARA/NAA: só palavras ou expressões curtas nas comparações, dizendo qual encaixa melhor naquele ponto, + links
  `https://www.bibliaonline.com.br/ara/<abrev>/<cap>` e `/naa/<abrev>/<cap>` na nota da versão.
- Para conferir palavras da NAA: WebFetch na página da NAA pedindo SÓ as palavras-chave (não o texto todo).

## Fontes (PDFs do Gabriel, já extraídos em texto)
`Documents/claude/biblia-fontes/` (fora do repo, nunca publicar):
- `almeida.txt` — Bíblia de Estudo Almeida (ARA, SBB): introdução de cada livro + notas. Achar o livro:
  `grep -n "^ *ISAÍAS *$" almeida.txt` (cabeçalho em maiúsculas); o capítulo é uma linha só com o número,
  seguida do título da seção. As notas ficam misturadas no texto (formato `a a 13.1-22 ...`).
- `expositor.txt` — Bíblia de Estudo do Expositor (Swaggart; tradução automática, KJV + notas entre parênteses,
  linha pentecostal/dispensacionalista). Capítulos: `CAPÍTULO 13` + data entre parênteses. Página do livro no
  Sumário (início do arquivo); o texto do livro começa ~1 página PDF antes (páginas separadas por `\f`).
  Ex.: Isaías 13 está perto da linha 85915.
- `blivre/porbr2018_vpl.txt` — Bíblia Livre, uma linha por versículo (`ISA 13:1 ...`).
Se os .txt não existirem (outro PC): `pdftotext -enc UTF-8 -layout <pdf> almeida.txt` com os PDFs de Downloads,
e a Bíblia Livre de `https://ebible.org/Scriptures/porbr2018_vpl.zip`.
Cruze as duas bíblias de estudo + seu conhecimento. Quando divergirem (ex.: histórico × escatológico),
mostre as duas leituras de forma justa. Nunca invente citação, data ou dado arqueológico.

## Passo a passo
Repo: `Documents/claude/estudos-biblia` (GitHub `Gabriel-glll/estudos-biblia`, Pages na `main`).
1. `python -I tools/novo_estudo.py "Isaías" 13` → cria `estudos/isaias-13.html` com os versículos.
2. Leia as notas nas fontes (sed nas linhas achadas pelo grep).
3. Imagens (2 a 4): Wikimedia Commons. Buscar:
   `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=5&format=json&srsearch=<termo>`
   Baixar: `https://commons.wikimedia.org/wiki/Special:FilePath/<arquivo>?width=1600` (User-Agent próprio) para `img/`,
   conferir (folha de miniaturas) e comprimir com PIL (1600px, q78). Capa = pintura/gravura clássica da cena;
   preferir arqueologia (objetos, ruínas, manuscritos) nas outras.
4. Escreva o conteúdo num JSON no scratchpad (mesmo formato de `estudos/isaias-13.html`, sem `versos`) e aplique:
   `python -I tools/montar.py isaias-13 <json>` (também atualiza `estudos/lista.js`, o índice).
   Campos: titulo, subtitulo, data, capa{src,credito}, introducao{autor,destinatarios,epoca,lingua{titulo,texto},
   contexto{titulo,paragrafos[],imagem{src,legenda}}}, linhaDoTempo[{ano,evento,destaque}], paragrafos["1-5",...],
   notaVersao, blocos[{versos,titulo,resumo,destaques[],notas[{v,texto}],comparacao[{v,texto}],imagem}],
   palavras[{original,translit,sentido}], curiosidade{titulo,texto,imagem}, paraLevar{texto,ref}, fontes[].
   Texto aceita **negrito**, *itálico* e [link](url). `destaques` = trechos exatos da Bíblia Livre a marcar.
5. Conferir rápido: `preview_start` "estudos-biblia" → página do estudo, console sem erro, 1 screenshot.
6. `git add . && git commit` (com Co-Authored-By) `&& git push` → link `https://gabriel-glll.github.io/estudos-biblia/estudos/<slug>.html`
   (esperar dar 200).

Tom: português simples e direto, frases curtas, sem jargão sem explicar. Linguagem respeitosa e de fé,
sem empurrar uma denominação.
