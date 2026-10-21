export type Word = {text: string; startMs: number; endMs: number};

export const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

// Frame em que a palavra i começa a ser falada (relativo ao vídeo inteiro).
export const wordFrame = (words: Word[], i: number, fps: number) =>
  msToFrame(words[i].startMs, fps);

// Divide o vídeo em cenas a partir do índice da primeira palavra de cada cena.
// Cada cena começa um pouco antes da sua primeira palavra e termina onde a próxima começa.
export const scenesFromWords = (
  words: Word[],
  firstWordOfEachScene: number[],
  fps: number,
  totalFrames: number,
  leadFrames = 4,
) =>
  firstWordOfEachScene.map((w, i) => {
    const from = i === 0 ? 0 : Math.max(0, wordFrame(words, w, fps) - leadFrames);
    const next = firstWordOfEachScene[i + 1];
    const to = next === undefined ? totalFrames : wordFrame(words, next, fps) - leadFrames;
    return {from, durationInFrames: Math.max(1, to - from)};
  });
