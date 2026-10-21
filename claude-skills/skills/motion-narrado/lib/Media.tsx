import React from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Foto em cartão inclinado: entra deslizando/girando e a imagem aproxima devagar (Ken Burns).
export const PhotoCard: React.FC<{
  src: string;
  width: number;
  height: number;
  at?: number; // frame de entrada
  tilt?: number; // inclinação final em graus
  from?: 'left' | 'right' | 'bottom';
  objectPosition?: string;
  style?: React.CSSProperties;
}> = ({src, width, height, at = 0, tilt = -4, from = 'bottom', objectPosition = '50% 50%', style}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 16], [0, 1], {...clamp, easing: ease});
  const life = Math.max(0, frame - at);
  const dx = from === 'left' ? -700 : from === 'right' ? 700 : 0;
  const dy = from === 'bottom' ? 900 : 0;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: '0 40px 90px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25)',
        opacity: Math.min(1, p * 2),
        translate: `${dx * (1 - p)}px ${dy * (1 - p) - life * 0.4}px`,
        rotate: `${tilt + (1 - p) * tilt * 4 + life * 0.02}deg`,
        ...style,
      }}
    >
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition,
          scale: String(1.18 - 0.08 * p + life * 0.0012),
        }}
      />
    </div>
  );
};

// Foto ou vídeo ocupando a tela toda, sempre aproximando devagar.
export const FullBleed: React.FC<{
  src: string;
  video?: boolean;
  playbackRate?: number;
  objectPosition?: string;
  zoomFrom?: number;
  zoomTo?: number;
  darken?: number; // 0..1, escurece para o texto aparecer
}> = ({src, video, playbackRate = 1, objectPosition = '50% 50%', zoomFrom = 1.05, zoomTo = 1.18, darken = 0}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], clamp);
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition,
    scale: String(z),
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {video ? (
        <Video src={src} muted playbackRate={playbackRate} objectFit="cover" style={style} />
      ) : (
        <Img src={src} style={style} />
      )}
      {darken > 0 ? (
        <AbsoluteFill
          style={{background: `linear-gradient(180deg, rgba(0,0,0,${darken * 0.3}) 0%, rgba(0,0,0,${darken}) 100%)`}}
        />
      ) : null}
    </AbsoluteFill>
  );
};
