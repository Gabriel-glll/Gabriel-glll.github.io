import React from 'react';
import {Video} from '@remotion/media';
import {Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {display, sans} from './fonts';
import {Segment} from './jumpcut';
import {Word} from './timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Toca só os trechos com fala, colados um após o outro (jump cut).
export const JumpCutVideo: React.FC<{
  src: string;
  segments: Segment[];
  starts: number[];
  style?: React.CSSProperties;
}> = ({src, segments, starts, style}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {segments.map((s, k) => (
        <Sequence
          key={k}
          from={Math.round((starts[k] / 1000) * fps)}
          durationInFrames={Math.max(1, Math.round(((s.endMs - s.startMs) / 1000) * fps))}
        >
          <Video
            src={src}
            trimBefore={Math.round((s.startMs / 1000) * fps)}
            objectFit="cover"
            style={{position: 'absolute', width: '100%', height: '100%', ...style}}
          />
        </Sequence>
      ))}
    </>
  );
};

// Pessoa recortada (PNGs com fundo transparente), sincronizada com o vídeo original.
export const PersonCutout: React.FC<{
  dir: string; // pasta em public/ com 0001.png, 0002.png...
  sourceStartMs: number; // instante do vídeo original que corresponde ao 0001.png
  frameCount: number;
  toSource: (cutMs: number) => number;
  style?: React.CSSProperties;
}> = ({dir, sourceStartMs, frameCount, toSource, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const srcMs = toSource((frame / fps) * 1000);
  const idx = Math.min(frameCount, Math.max(1, Math.round(((srcMs - sourceStartMs) / 1000) * fps) + 1));
  return (
    <Img
      src={staticFile(`${dir}/${String(idx).padStart(4, '0')}.png`)}
      style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', ...style}}
    />
  );
};

// Legenda em caixa preta, 3 palavras por vez, cada palavra entra quando é falada.
export const CaptionBox: React.FC<{
  words: Word[];
  perChunk?: number;
  highlight?: string[]; // palavras que ganham destaque de cor
  accent?: string;
  style?: React.CSSProperties;
}> = ({words, perChunk = 3, highlight = [], accent = '#ffd400', style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = (frame / fps) * 1000;
  let active = -1;
  for (let i = 0; i < words.length; i++) if (words[i].startMs <= ms + 40) active = i;
  if (active < 0) return null;
  const last = words[active];
  if (ms > last.endMs + 700 && active === words.length - 1) return null;
  const chunkStart = Math.floor(active / perChunk) * perChunk;
  const chunk = words.slice(chunkStart, Math.min(words.length, chunkStart + perChunk));
  const chunkFrame = Math.round((words[chunkStart].startMs / 1000) * fps);
  const pop = interpolate(frame, [chunkFrame - 1, chunkFrame + 5], [0.85, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const clean = (t: string) => t.replace(/[.,!?"]/g, '');
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        translate: '-50% 0',
        scale: String(pop),
        display: 'flex',
        gap: 14,
        background: '#000',
        padding: '14px 26px',
        borderRadius: 8,
        fontFamily: sans,
        fontWeight: 800,
        fontSize: 58,
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {chunk.map((w, k) => {
        const i = chunkStart + k;
        const shown = i <= active;
        const hl = highlight.includes(clean(w.text).toLowerCase());
        return (
          <span key={k} style={{color: hl ? accent : '#fff', opacity: shown ? 1 : 0.25}}>
            {clean(w.text)}
          </span>
        );
      })}
    </div>
  );
};

// Palavra gigante que fica ATRÁS da pessoa (camada entre o vídeo e o recorte).
export const BehindWord: React.FC<{
  text: string;
  at: number; // frame de entrada
  until: number; // frame de saída
  color?: string;
  size?: number;
  top?: number;
}> = ({text, at, until, color = '#fff', size = 330, top = 230}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], {...clamp, easing: ease});
  const out = interpolate(frame, [until - 6, until], [0, 1], clamp);
  if (frame < at || frame > until) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        width: '100%',
        textAlign: 'center',
        fontFamily: display,
        fontSize: size,
        lineHeight: 0.9,
        textTransform: 'uppercase',
        color,
        opacity: p * (1 - out),
        letterSpacing: `${0.02 + (1 - p) * 0.25}em`,
        scale: String(1.15 - 0.15 * p + (frame - at) * 0.0008),
        filter: `blur(${(1 - p) * 14}px)`,
        textShadow: '0 20px 60px rgba(0,0,0,0.35)',
      }}
    >
      {text}
    </div>
  );
};

// Card de interface (estilo app) com itens que marcam quando são falados.
export const UICard: React.FC<{
  title: string;
  items: {label: string; at: number}[];
  appear: number;
  style?: React.CSSProperties;
}> = ({title, items, appear, style}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [appear, appear + 14], [0, 1], {...clamp, easing: ease});
  return (
    <div
      style={{
        width: 820,
        background: '#fff',
        borderRadius: 34,
        padding: '40px 46px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.12), 0 2px 0 rgba(0,0,0,0.04)',
        fontFamily: sans,
        opacity: p,
        translate: `0px ${(1 - p) * 80}px`,
        scale: String(0.94 + 0.06 * p),
        ...style,
      }}
    >
      <div style={{fontSize: 30, fontWeight: 600, color: '#9a9a9a', letterSpacing: '0.12em', marginBottom: 26}}>
        {title.toUpperCase()}
      </div>
      {items.map((it, k) => {
        const q = interpolate(frame, [it.at, it.at + 10], [0, 1], {...clamp, easing: ease});
        const check = interpolate(frame, [it.at + 4, it.at + 12], [0, 1], clamp);
        return (
          <div
            key={k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '20px 0',
              borderTop: k ? '2px solid #f1f1f1' : undefined,
              opacity: 0.3 + 0.7 * q,
              translate: `${(1 - q) * 30}px 0px`,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: check > 0.5 ? '#111' : '#eee',
                color: '#fff',
                fontSize: 30,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scale: String(0.7 + 0.3 * check),
              }}
            >
              {check > 0.5 ? '✓' : ''}
            </div>
            <div style={{fontSize: 46, fontWeight: 700, color: '#111', letterSpacing: '-0.02em'}}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};
