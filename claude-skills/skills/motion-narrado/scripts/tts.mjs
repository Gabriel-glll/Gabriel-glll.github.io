// Gera narração sintética (voz Edge, grátis) + tempos de cada palavra.
// Uso: node scripts/tts.mjs <nome> "<texto>" [voz] [rate]
// Saída: public/audio/<nome>.mp3 e public/audio/<nome>.words.json
import {MsEdgeTTS, OUTPUT_FORMAT} from 'msedge-tts';
import fs from 'node:fs';
import path from 'node:path';

const [name, text, voice = 'pt-BR-AntonioNeural', rate = '1.1'] = process.argv.slice(2);
if (!name || !text) {
  console.error('Uso: node scripts/tts.mjs <nome> "<texto>" [voz] [rate]');
  process.exit(1);
}
const outDir = path.join('public', 'audio');
fs.mkdirSync(outDir, {recursive: true});

// O serviço grátis às vezes limita pedidos (429): espera e tenta de novo.
let tts;
for (let attempt = 1; ; attempt++) {
  try {
    tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {wordBoundaryEnabled: true});
    break;
  } catch (e) {
    if (attempt >= 6) throw e;
    console.log(`limite do serviço, tentando de novo em ${attempt * 20}s...`);
    await new Promise((r) => setTimeout(r, attempt * 20000));
  }
}
const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const {audioStream, metadataStream} = tts.toStream(escaped, {rate: Number(rate)});

const chunks = [];
const words = [];
audioStream.on('data', (d) => chunks.push(d));
metadataStream.on('data', (d) => {
  const meta = JSON.parse(d.toString());
  for (const m of meta.Metadata ?? []) {
    if (m.Type !== 'WordBoundary') continue;
    const startMs = m.Data.Offset / 10000;
    words.push({text: m.Data.text.Text, startMs, endMs: startMs + m.Data.Duration / 10000});
  }
});
await new Promise((res, rej) => {
  audioStream.on('close', res);
  audioStream.on('error', rej);
});
fs.writeFileSync(path.join(outDir, `${name}.mp3`), Buffer.concat(chunks));
fs.writeFileSync(path.join(outDir, `${name}.words.json`), JSON.stringify(words, null, 1));
console.log(`ok: ${words.length} palavras, ${(words.at(-1)?.endMs / 1000).toFixed(1)}s`);
tts.close();
