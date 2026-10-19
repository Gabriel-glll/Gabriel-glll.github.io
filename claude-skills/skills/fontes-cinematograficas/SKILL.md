---
name: fontes-cinematograficas
description: Escolhe fontes pelo "clima" (dramática, suave, elegante, casual, refinada) e gera pôsteres/slides de carrossel no estilo "fonte cinematográfica" — foto com luz forte + título script gigante + 3 adjetivos — com o componente Poster do Remotion (grátis). Use quando o usuário pedir carrossel, pôster, capa de post, "fonte bonita", tipografia, script font, ou arte de imóvel/loja com cara de cinema.
---

# Fontes cinematográficas + pôster de carrossel

Origem: carrossel @raktimcreates ("Script Fonts"). Uma fonte muda o clima da arte inteira. O layout que ele repete em todos os slides:
foto escura com luz forte, **título enorme em script** (levemente inclinado), **3 adjetivos curtos** em sans ("Bold. Edgy. Dramatic."), cabeçalho pequeno (nome · @) e rodapé pequeno (frase + nº do slide).

## Clima → fonte
As fontes do post costumam ser **grátis só para uso pessoal** (dafont e similares). Para arte de cliente ou anúncio, use as equivalentes do Google Fonts, que são livres para uso comercial:

| Clima | Fonte do post | Equivalente livre (usar) | Bom para |
|---|---|---|---|
| dramática | Blacksword | **Yellowtail** (ou Mr Dafoe, Kaushan Script) | barbearia, moda urbana, academia |
| suave | Dollie Script | **Pacifico** (ou Damion) | doceria, infantil, café |
| elegante | Florisel Script | **Great Vibes** (ou Pinyon Script, Allura) | imóvel alto padrão, noiva, estética |
| casual | Hamsterly | **Grand Hotel** (ou Caveat) | lazer, delivery, pet |
| refinada | Alro Bold | **DM Serif Display** (ou Playfair, Bodoni Moda) | imobiliária, advocacia, joalheria |

Regra: 1 fonte de destaque + 1 sans neutra (Inter). Nunca duas scripts juntas.

## Gerador (Remotion, grátis)
`Documents/claude/motion-studio/src/Poster.tsx`, registrado como `<Still id="Poster" 1080×1350>` (4:5, formato de feed).
Props:
- `foto` (arquivo em `public/`), `titulo`, `fonte` (dramatica|suave|elegante|casual|refinada), `adjetivos`
- `topoEsq`, `topoDir`, `rodape`, `pagina`
- `posTitulo` (alto|meio|baixo): ponha o título na área livre da foto, sem cobrir o assunto
- `foco` (object-position), `luz` (cor do brilho atrás do título, opcional)

```
# props por arquivo JSON, gravado em UTF-8 SEM BOM (o Set-Content do PowerShell 5 põe BOM e o render falha)
npx remotion still src/index.tsx Poster out/posters/1.png --props=out/posters/1.json
```
Exemplo: `out/posters/*.json` é o carrossel do Alentejo (elegante, casual, refinada).

## Regras de arte
- O título curto (1–3 palavras) é o herói da arte, entre 170 e 210 px.
- Adjetivos: três palavras com ponto final. Precisam ter sombra se a foto for clara.
- Use foto com contraste (entardecer, noite, luz de destaque). Foto chapada pede `luz` ou textura (skill `texturas`, por exemplo "filme" sutil).
- Carrossel: capa com o nome, depois um slide por destaque e um CTA no fim ("Comente EU QUERO").
