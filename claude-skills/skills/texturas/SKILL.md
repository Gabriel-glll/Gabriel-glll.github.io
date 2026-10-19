---
name: texturas
description: Aplica TEXTURA em artes, fotos e vídeos para tirar o aspecto "genérico" (concreto, grunge, papel, madeira, mármore, vidro canelado, metal, ruído/film dust, halftone e combinações), de graça, com o script texturizar.py e o <Grain> do Remotion. Use quando o usuário pedir textura, "deixa menos genérico", efeito analógico/filme/granulado, papel, grunge, halftone, vidro canelado, ou acabamento de direção de arte.
---

# Texturas na arte

Origem: carrossel @tatidesigner.ia. Às vezes o que falta na arte não é mais um elemento, é **textura**. Cada uma passa uma sensação:

| Textura | Sensação | Modo de mesclagem |
|---|---|---|
| Concreto | urbano, brutalista | overlay |
| Grunge | desgastado, underground | multiply |
| Papel | editorial, artesanal | multiply |
| Madeira | natural, acolhedora | overlay |
| Mármore | sofisticado, premium | multiply |
| Vidro (canelado) | moderno, tecnológico | deslocamento em faixas |
| Metal (escovado) | industrial, futurista | soft light |
| Ruído / Film dust | filme, foto analógica | overlay / screen |
| Halftone (extra) | pôster, retícula de impressão | multiply |

Combinações que funcionam: **papel + grunge**, **metal + ruído** (cromado), **vidro + filme** (reflexos), **concreto + ruído**.
Para imóveis: mármore ou papel para alto padrão, concreto para loft/brutalista, filme sutil para um ar "lifestyle".

## Ferramentas (grátis)
Script: `Documents/claude/motion-studio/texturas/texturizar.py`. Só precisa de Pillow e numpy.
```
python texturizar.py entrada.jpg saida.jpg --textura papel+grunge+filme --forca 0.6
python texturizar.py entrada.jpg pasta/ --amostras --forca 0.6        # uma versão por textura, para o cliente escolher
python texturizar.py saida.png --gerar filme --tamanho 1080x1920      # só a textura, para usar como overlay
```
- `--forca` vai de 0 a 1. Use 0,3–0,6 para algo sutil (o normal) e 0,8+ para um estilo forte.
- Texturas: `ruido filme papel grunge concreto madeira marmore metal vidro halftone`.

Em vídeo (Remotion, skill `motion-design`), em `src/motion.tsx`:
- `<Grain opacity={0.3} />` é o granulado de filme animado. Coloque como último filho da composição.
- `<TextureOverlay src={staticFile('papel.png')} blend="multiply" opacity={0.5} />` usa uma textura estática gerada pelo script.
- O overlay quase não aparece sobre fundo claro e liso. Nesse caso use `blend="multiply"` com opacity 0,15–0,25.

## Regras
- Textura é tempero: sutil por padrão. Se o texto ficar difícil de ler, reduza a força.
- Aplique a textura na arte final e deixe logo e telefone limpos por cima.
- Mostre 2–3 opções lado a lado (`--amostras`) em vez de uma só.
