import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {sans} from './fonts';
import {Word, wordFrame} from './timing';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Pílulas com gradiente que empilham conforme cada item é falado.
export const Pills: React.FC<{
  words: Word[];
  sceneFrom: number;
  items: {i: number; label: string}[];
  from: string;
  to: string;
  textColor: string;
}> = ({words, sceneFrom, items, from, to, textColor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'center'}}>
      {items.map((it, k) => {
        const start = wordFrame(words, it.i, fps) - sceneFrom - 3;
        const p = interpolate(frame, [start, start + 12], [0, 1], {...clamp, easing: Easing.spring({damping: 14})});
        const glow = interpolate(frame, [start, start + 20], [1, 0.35], clamp);
        return (
          <div
            key={k}
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 64,
              letterSpacing: '-0.02em',
              color: textColor,
              padding: '26px 64px',
              borderRadius: 999,
              background: `linear-gradient(135deg, ${from}, ${to})`,
              boxShadow: `0 0 ${80 * glow}px ${from}, inset 0 2px 0 rgba(255,255,255,0.35)`,
              opacity: Math.min(1, p * 1.5),
              scale: String(0.6 + 0.4 * p),
              translate: `${(1 - p) * (k % 2 === 0 ? -160 : 160)}px 0px`,
            }}
          >
            {it.label}
          </div>
        );
      })}
    </div>
  );
};

// Linha que risca uma palavra (ex.: "capacidade" riscada).
export const StrikeThrough: React.FC<{at: number; width: number; color: string; style?: React.CSSProperties}> = ({
  at,
  width,
  color,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 10], [0, 1], {...clamp, easing: ease});
  return (
    <div
      style={{
        height: 10,
        width: width * p,
        background: color,
        borderRadius: 6,
        boxShadow: `0 0 24px ${color}`,
        rotate: '-4deg',
        ...style,
      }}
    />
  );
};

// Anel de pontos com um faltando: visual de "falta alguma coisa".
export const DotRing: React.FC<{size: number; count: number; color: string; missingAt: number; appear: number}> = ({
  size,
  count,
  color,
  missingAt,
  appear,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [appear, appear + 24], [0, 1], {...clamp, easing: ease});
  const r = size / 2 - 20;
  return (
    <svg width={size} height={size} style={{rotate: `${frame * 0.4}deg`}}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeOpacity={0.5}
        strokeWidth={3}
        strokeDasharray={2 * Math.PI * r}
        strokeDashoffset={(1 - draw) * 2 * Math.PI * r}
      />
      {new Array(count).fill(0).map((_, k) => {
        const a = (k / count) * Math.PI * 2 - Math.PI / 2;
        const missing = k === missingAt;
        const dp = interpolate(frame, [appear + 4 + k * 2, appear + 14 + k * 2], [0, 1], clamp);
        const blink = missing ? 0.25 + 0.25 * Math.sin(frame / 4) : 1;
        return (
          <circle
            key={k}
            cx={size / 2 + Math.cos(a) * r}
            cy={size / 2 + Math.sin(a) * r}
            r={missing ? 16 : 14}
            fill={missing ? 'none' : color}
            stroke={color}
            strokeWidth={missing ? 3 : 0}
            strokeDasharray={missing ? '6 6' : undefined}
            opacity={dp * blink}
            style={{filter: missing ? undefined : `drop-shadow(0 0 12px ${color})`}}
          />
        );
      })}
    </svg>
  );
};

// Nome da marca revelado letra por letra, com espaçamento abrindo.
export const Wordmark: React.FC<{text: string; at: number; color: string; size: number}> = ({text, at, color, size}) => {
  const frame = useCurrentFrame();
  const spread = interpolate(frame, [at, at + 40], [0.02, 0.12], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', fontFamily: sans, fontWeight: 800, fontSize: size, color, letterSpacing: `${spread}em`}}>
      {text.split('').map((ch, k) => {
        const p = interpolate(frame, [at + k * 2, at + k * 2 + 10], [0, 1], {...clamp, easing: ease});
        return (
          <span
            key={k}
            style={{
              display: 'inline-block',
              opacity: p,
              translate: `0px ${(1 - p) * 60}px`,
              filter: `blur(${(1 - p) * 10}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// Botão de chamada que recebe um "toque" de um cursor.
export const CtaButton: React.FC<{label: string; at: number; tapAt: number; from: string; to: string; textColor: string}> = ({
  label,
  at,
  tapAt,
  from,
  to,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], {...clamp, easing: Easing.spring({damping: 12})});
  const press = interpolate(frame, [tapAt, tapAt + 4, tapAt + 10], [1, 0.92, 1], clamp);
  const ring = interpolate(frame, [tapAt, tapAt + 22], [0, 1], clamp);
  const cursorP = interpolate(frame, [at + 6, tapAt], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'relative', opacity: Math.min(1, p * 1.4), scale: String((0.7 + 0.3 * p) * press)}}>
      <div
        style={{
          position: 'absolute',
          inset: -10,
          borderRadius: 999,
          border: `4px solid ${from}`,
          opacity: (1 - ring) * (ring > 0 ? 1 : 0),
          scale: String(1 + ring * 0.35),
        }}
      />
      <div
        style={{
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 66,
          color: textColor,
          padding: '34px 90px',
          borderRadius: 999,
          background: `linear-gradient(135deg, ${from}, ${to})`,
          boxShadow: `0 20px 80px ${from}99, inset 0 2px 0 rgba(255,255,255,0.4)`,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
        }}
      >
        {label}
        <span style={{fontSize: 60}}>→</span>
      </div>
      <svg
        width={90}
        height={90}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          right: 40,
          bottom: -70,
          translate: `${(1 - cursorP) * 260}px ${(1 - cursorP) * 300}px`,
          opacity: cursorP,
          scale: String(press),
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
        }}
      >
        <path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#111" strokeWidth={1} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
