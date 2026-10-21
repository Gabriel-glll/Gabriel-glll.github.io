import {Word} from './timing';

export type Segment = {startMs: number; endMs: number};

// Corta as pausas usando a transcrição (funciona mesmo com música de fundo,
// onde o corte por volume não acha silêncio). Palavras separadas por menos de
// maxGapMs ficam no mesmo trecho; cada trecho ganha um respiro de padMs.
export const buildCut = (words: Word[], {maxGapMs = 350, padMs = 90} = {}) => {
  const segments: Segment[] = [];
  for (const w of words) {
    const last = segments[segments.length - 1];
    if (last && w.startMs - last.endMs <= maxGapMs) {
      last.endMs = w.endMs;
    } else {
      segments.push({startMs: w.startMs, endMs: w.endMs});
    }
  }
  const padded = segments.map((s) => ({startMs: Math.max(0, s.startMs - padMs), endMs: s.endMs + padMs}));

  // Reposiciona as palavras na linha do tempo já cortada (para as legendas).
  let offset = 0;
  const starts = padded.map((s) => {
    const at = offset;
    offset += s.endMs - s.startMs;
    return at;
  });
  const toCut = (ms: number) => {
    const k = padded.findIndex((s) => ms >= s.startMs && ms <= s.endMs);
    return k < 0 ? ms : starts[k] + (ms - padded[k].startMs);
  };
  const cutWords = words.map((w) => ({...w, startMs: toCut(w.startMs), endMs: toCut(w.endMs)}));

  // Converte um instante do vídeo cortado no instante correspondente do original.
  const toSource = (cutMs: number) => {
    for (let k = padded.length - 1; k >= 0; k--) {
      if (cutMs >= starts[k]) return padded[k].startMs + (cutMs - starts[k]);
    }
    return cutMs;
  };

  return {segments: padded, starts, words: cutWords, totalMs: offset, toSource};
};
