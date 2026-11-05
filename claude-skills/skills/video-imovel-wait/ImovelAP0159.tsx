import React from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, Img, Sequence, staticFile} from 'remotion';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';

// Reels AP0159 (Cambuí, Campinas) no modelo do reel DfCzIDpzgIT ("Wait if you love Japan").
// 0–4 s: o vídeo da panela da própria referência (texto em inglês apagado, refs/DfCzIDpzgIT/hook_clean.py)
// com o texto em português; depois fotos PARADAS nos mesmos tempos de corte da referência.
// Áudio: o da referência.

const bold = loadMontserrat('normal', {weights: ['700'], subsets: ['latin']}).fontFamily;

const FPS = 30;
const fr = (sec: number) => Math.round(sec * FPS);
// cortes medidos na referência (select='gt(scene,0.25)')
const CUTS = [0, 4, 4.5, 4.967, 5.367, 5.9, 6.233, 6.567, 6.833, 7.333, 7.8, 8.067, 8.333, 8.667, 9.133, 9.667, 10, 10.267, 10.567, 11.067, 11.469];
// 19 fotos paradas depois do gancho, na ordem dos cortes (chegada → lobby → apartamento → lazer → torre).
// Cada uma refeita em 9:16 no Google Flow (Nano Banana Pro, 0 crédito) com o cômodo inteiro, depois
// ampliada (Real-ESRGAN) e com cor leve (cine-grade --forca 0.6): public/imoveis/ap0159/final/NN.jpg
export const AP0159_PLANOS = ['31', '02', '19', '03', '04', '06', '10', '13', '11', '15', '16', '17', '20', '21', '22', '24', '26', '23', '32'];

const Bandeira: React.FC = () => (
  <svg width={64} height={46} viewBox="0 0 64 46" style={{marginLeft: 16, verticalAlign: '-4px', borderRadius: 6}}>
    <rect width={64} height={46} fill="#009c3b" />
    <polygon points="32,5 59,23 32,41 5,23" fill="#ffdf00" />
    <circle cx={32} cy={23} r={10} fill="#002776" />
  </svg>
);

const Texto: React.FC = () => (
  <div
    style={{
      position: 'absolute', top: 400, width: '100%', textAlign: 'center', color: '#fff',
      fontFamily: bold, fontWeight: 700, fontSize: 64, lineHeight: 1.18,
      textShadow: '0 2px 10px rgba(0,0,0,0.35)',
    }}
  >
    Espera se você
    <br />
    ama o Cambuí
    <Bandeira />
  </div>
);

export const imovelAP0159Duration = () => fr(CUTS[CUTS.length - 1]);

export const ImovelAP0159: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence from={0} durationInFrames={fr(CUTS[1])}>
      <Video src={staticFile('ref-japan/hook.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <Texto />
    </Sequence>
    {AP0159_PLANOS.map((n, i) => (
      <Sequence key={n} from={fr(CUTS[i + 1])} durationInFrames={fr(CUTS[i + 2]) - fr(CUTS[i + 1])}>
        <Img src={staticFile(`imoveis/ap0159/final/${n}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Sequence>
    ))}
    <Audio src={staticFile('ref-japan/audio.mp3')} />
  </AbsoluteFill>
);
