// Transcreve um áudio/vídeo (sua narração) e gera os tempos de cada palavra.
// Uso: node scripts/transcribe.mjs public/audio/minha-voz.m4a
// Saída: mesmo caminho com .words.json (formato igual ao de scripts/tts.mjs)
import {transcribe, toCaptions} from '@remotion/install-whisper-cpp';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2];
if (!input) {
  console.error('Uso: node scripts/transcribe.mjs <arquivo>');
  process.exit(1);
}
const wav = path.join(path.dirname(input), path.parse(input).name + '.16k.wav');
execFileSync(path.resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'), ['-y', '-v', 'error', '-i', input, '-ar', '16000', '-ac', '1', wav]);

const out = await transcribe({
  inputPath: path.resolve(wav),
  whisperPath: path.resolve('whisper.cpp'),
  whisperCppVersion: '1.5.5',
  model: 'small',
  language: 'pt',
  tokenLevelTimestamps: true,
});
const {captions} = toCaptions({whisperCppOutput: out});
// Whisper devolve pedaços de palavra; junta os que não começam com espaço.
const words = [];
for (const c of captions) {
  const t = c.text;
  if (!t.trim()) continue;
  const prev = words.at(-1);
  if (prev && !t.startsWith(' ')) {
    prev.text += t;
    prev.endMs = c.endMs;
  } else {
    words.push({text: t.trim(), startMs: c.startMs, endMs: c.endMs});
  }
}
fs.unlinkSync(wav);
const dest = path.join(path.dirname(input), path.parse(input).name + '.words.json');
fs.writeFileSync(dest, JSON.stringify(words, null, 1));
console.log(`ok: ${words.length} palavras -> ${dest}`);
console.log(words.map((w) => w.text).join(' '));
