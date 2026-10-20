---
name: edicao-beat-sync
description: Edição de vídeo com CORTES SINCRONIZADOS NA MÚSICA (estilo trend/AMV/"edit" de Reels) — detecta BPM e os golpes de bumbo de qualquer música, encaixa os cortes na grade rítmica e monta no Remotion: foto/clipe por batida, zoom contínuo, flash nos golpes fortes, rótulo e texto final. Use quando o usuário pedir "edit sincronizado", "cortes na batida", "vídeo no ritmo da música", "trend de fotos", "montagem de viagem/fotos com música", AMV, beat sync.
---

# Edição sincronizada com a música (beat sync)

Origem: reel @madforamv (edit de olhos de anime). Os cortes caem nos **golpes do bumbo**, não em todo tempo da música. Ali o padrão é **6+4+6 semicolcheias** a ~153 BPM (variação do 3+3+2, típica de phonk e funk). O que mais pesa:
1. **Série visual coerente:** imagens do mesmo tipo e enquadramento parecido (olhos, paisagens), para um corte "rimar" com o outro.
2. **Movimento contínuo dentro de cada clipe:** zoom lento, alternando aproximar e afastar, com leve rotação.
3. **Corte seco no golpe**, com flash branco curto nos golpes fortes (início do compasso).
4. **Cortar ~1 quadro antes do golpe** (o editor do reel corta ~50 ms antes): a imagem já está na tela quando o som bate.

## Ferramentas (em `Documents/claude/motion-studio/`)
| Arquivo | O que faz |
|---|---|
| `audio/beatsync.py` | música → `cortes.json` (bpm, cortes, fortes). Precisa de `pip install librosa soundfile` |
| `src/BeatEdit.tsx` | composição Remotion genérica: abertura com título, um clipe por corte, flash, rótulo, texto final e granulado |
| `tools/fotos_hd.py` | baixa fotos HD livres do Wikimedia Commons ("Featured pictures") + `creditos.json` |

### beatsync.py
```
python audio/beatsync.py musica.wav public/<pasta>/cortes.json --ajuste -0.05
```
- Modo `grave` (padrão): ouve só os graves (bumbo/808), recua até o ataque (no máximo 50 ms), refina o BPM (passo de 0,05) e a fase da grade de semicolcheias e **regulariza o padrão** (as posições do compasso que aparecem em ≥60% dos compassos se repetem em todos).
- Outros modos: `batida` (todo tempo), `meia` (a cada 2 tempos), `percussao`. Use `--livre` para não regularizar e `--inicio/--fim` para pegar um trecho.
- `--ajuste -0.05` corta 1 quadro antes. É a prática de editor e também compensa o atraso (~46 ms) do áudio AAC do Instagram.
- **Validação feita:** na batida de teste, 28 de 28 bumbos com erro médio de 11 ms. Na música do reel, padrão idêntico ao do editor (21 cortes) e o vídeo final ficou a **14 ms em média** dos cortes originais (máximo 34 ms, ou seja, dentro de 1 quadro).

### Montar o vídeo
1. Fotos em `public/<pasta>/`. Exclua as fora do tema e as panorâmicas demais para 9:16 (altura menor que ~1200 px).
2. Música em `public/<pasta>/musica.wav` (converter: `ffmpeg -i entrada -ac 2 -ar 44100 musica.wav`).
3. `props.json` com `{pasta, audio, fotos:[{arquivo, rotulo, foco?}], cortes, fortes, bpm, titulo, subtitulo, final, duracao}`, registrado em `src/index.tsx` como `<Composition id=... component={BeatEdit} durationInFrames={ceil(duracao*30)}>`.
4. Confira quadros soltos e depois renderize: `npx remotion render src/index.tsx <Id> saida.mp4`. Para o Instagram, recomprima: `ffmpeg -i in.mp4 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart out.mp4`.
5. Para checar a sincronia no arquivo final: `ffmpeg -i out.mp4 -vf "select='gt(scene,0.25)',showinfo" -f null -` lista os tempos dos cortes; compare com `cortes.json`.

## Música
- Pegar o áudio de um reel (só para teste local, quando o usuário pedir): no navegador, `performance.getEntriesByType('resource')` lista os `.mp4` do fbcdn. A faixa de áudio tem `efg` (base64) contendo `heaac..._audio`. Tire `bytestart`/`byteend` da URL e baixe.
- **Para postar:** use a mesma música pela biblioteca do Instagram (licenciada), senão o Reels pode ser silenciado. Os cortes continuam batendo porque seguem o BPM e a fase.
- Música própria sem copyright: `audio/batida_phonk.py --bpm 153 --compassos 10`.

## Fotos HD (Wikimedia)
`python tools/fotos_hd.py public/<pasta> "Eiffel Tower Paris|França" "Santorini Oia|Grécia" ... --por 2 --largura 3840`
- Só "Featured pictures" (curadas, livres). Créditos ficam em `creditos.json`; coloque-os na legenda (CC BY-SA exige).
- O Wikimedia **bloqueia o download do arquivo original** por scripts (429). O script usa miniaturas em tamanho padrão (960/1280/1920/3840, nunca maior que a original), faz pausas e tenta de novo após 429. Sempre revise as fotos numa grade e descarte as fora do tema (a busca às vezes traz avião, ilustração etc.).

Exemplo pronto: `criativos/viagem-beat/viagem-beat-insta.mp4` (Volta ao Mundo, 12 países, 11 s).
