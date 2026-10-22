---
name: viabilidade-primeiro
description: Regra do Gabriel para QUALQUER pedido de conteúdo (vídeo, trend, motion, post, carrossel, edição, IA) — antes de executar, decidir se dá para entregar EXATAMENTE como ele pediu com o que está pago/configurado hoje. Se dá, faz direto. Se não dá, NÃO entrega versão parecida: diz na hora que não consegue e aponta o caminho que funciona (ferramenta, plano, preço, como assinar). Carregar SEMPRE antes de começar um criativo, uma trend ou qualquer pedido "faz igual a esse".
---

# Viabilidade primeiro: faz igual ou aponta o caminho

Origem: em 22/10/2026 o Gabriel pediu a trend do "gol do Özil". Eu gerei vídeos do zero no Google Flow, que não tinham nada a ver com a trend, e depois tentei editar o clipe original no Omni, que recusou. O resultado foi tempo perdido. A correção dele:

> "Se consegue fazer, faça. Se não consegue, aponta o caminho que funciona da forma que eu quero."

## Regra
1. **Entender o pedido exato antes de agir.** Se é uma trend ou referência, descubra COMO ela é feita: veja o vídeo ou o site, ou pesquise. Qual técnica, qual modelo, e qual é o insumo (clipe original, foto, voz). Isso leva 1 a 2 minutos, e não vale chutar.
2. **Checar se dá com o que existe hoje.** Use a tabela abaixo e confira o que está configurado: `KIE_API_KEY`, `FISH_API_KEY`, o login no Flow e os créditos.
3. **Decidir:**
   - **Dá para fazer igual →** faça direto, sem perguntar (veja preferencias-gabriel).
   - **Não dá →** responda em até 5 linhas, no formato abaixo, e NÃO comece a gerar.
4. **Nunca entregar "uma versão parecida" que ele não pediu**, como gerar do zero o que deveria ser edição do clipe real, ou outro estilo. Alternativa só se ele aceitar.
5. **Não gastar crédito em tentativa provável de falhar.** Se um filtro conhecido bloqueia (veja Limites conhecidos), avise antes.
6. **Se der errado no meio,** pare, diga em uma frase o motivo e aponte o caminho. Não fique tentando contornar.

### Formato da resposta quando NÃO dá
```
Não consigo fazer igual com o que temos hoje.
Motivo: <1 linha, ex.: a trend troca o jogador no clipe real; o Flow bloqueia pessoa famosa>.
Para ficar igual: <ferramenta/plano> — <preço> — <como: link + passo>.
Com isso pronto eu faço sozinho: <o que eu entrego>.
```

## Mapa: o que sai igual hoje x o que precisa pagar
Use os dados de 22/10/2026 e reconfira preço ou plano se tiver mudado.

| Pedido | Dá hoje? | Como / o que falta |
|---|---|---|
| Reels motion / motion design narrado | ✅ grátis | Remotion (motion-narrado, motion-design) + voz TTS grátis |
| Post estático / pôster | ✅ grátis | fontes-cinematograficas, texturas, feedback-criativos |
| Carrossel que ensina | ✅ grátis | fontes-cinematograficas (Poster) |
| Edição e cortes na batida com material dele | ✅ grátis | edicao-beat-sync + ffmpeg |
| Vídeo de imóvel com fotos e vídeos dele | ✅ grátis | Remotion / HyperFrames |
| Imagem por IA (ambiente decorado, vazio, render) | ✅ grátis | Google Flow, Nano Banana (0 crédito, navegador do app logado) |
| Vídeo IA criado do zero (cena, reveal aéreo, ambiente se montando) | ✅ grátis, com limite | Google Flow, Veo 3.1 Lite: 50 créditos por dia (~10 a 20 por vídeo), 720p |
| **Trend que troca pessoa ou personagem num clipe REAL** (gol do Özil, dancinhas, cenas de filme) | ❌ | Flow Omni recusa pessoa famosa. **Precisa da Kie (kie.ai), modelo Wan Animate**: pay-per-use, US$ 5 a 10 já servem. Passo: conta em kie.ai → crédito → API Key → `[Environment]::SetEnvironmentVariable('KIE_API_KEY','CHAVE','User')` → reabrir o app. Alternativa sem API: assinatura do site da trend (ex.: GoEnhance), em que ele mesmo sobe a foto. |
| Vídeo IA em 1080p, mais longo ou com mais qualidade (Seedance 2, Kling, Veo Quality) | ❌ | Kie (pay-per-use) ou plano Google AI Pro/Ultra (mais créditos e Veo Quality no Flow) |
| Narração com voz realista PT-BR | ⚠️ falta chave | Fish Audio: grátis, mas ele cria a conta e grava `FISH_API_KEY` |
| Música original do vídeo de referência | ✅ | Baixar da referência (edicao-beat-sync) |

## Limites conhecidos (não tentar de novo)
- **Google Flow / Omni:** recusa editar vídeo com pessoa famosa real ("prominent people"). Os créditos voltam, mas o tempo é perdido.
- **Navegador do app:** não consegue escolher arquivo do PC. Para subir mídia no Flow, quem clica em Upload é o Gabriel, e eu aviso logo no começo, não no meio.
- **Veo criado do zero ≠ trend.** Trend de "você no lugar do jogador/ator" é sempre edição do clipe original.
- **Conta, senha e chave:** o Gabriel cria e grava. Eu nunca digito.

## Exemplo correto (como deveria ter sido o do Özil)
> Não consigo fazer igual com o que temos hoje.
> Motivo: a trend troca o jogador no clipe real do gol; o Flow grátis bloqueia vídeo com pessoa famosa e o Veo do zero não reproduz a jogada.
> Para ficar igual: Kie (kie.ai), modelo Wan Animate, pay-per-use, US$ 5–10 de crédito. Crie a conta, gere a API Key e grave `KIE_API_KEY`.
> Com isso pronto eu baixo o clipe, gero a referência do Jesus e entrego o vídeo de 14 s igual à trend.
