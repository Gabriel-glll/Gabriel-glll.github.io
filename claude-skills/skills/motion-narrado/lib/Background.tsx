import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Fundo escuro com manchas de luz que flutuam (estilo "glow" dos motion premium).
export const GlowBackground: React.FC<{
  base: string;
  glow: string;
  glow2: string;
}> = ({base, glow, glow2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{backgroundColor: base, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 1400,
          height: 1400,
          left: -300 + Math.sin(t * 0.9) * 320,
          top: 1100 + Math.cos(t * 0.7) * 260,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
          opacity: 0.55,
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          left: 400 + Math.cos(t * 0.8) * 300,
          top: -350 + Math.sin(t * 0.6) * 240,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow2} 0%, transparent 65%)`,
          opacity: 0.45,
          filter: 'blur(50px)',
        }}
      />
    </AbsoluteFill>
  );
};

// Curva de luz que se desenha na tela (o "swoosh" brilhante).
export const LightSwoosh: React.FC<{color: string; drawFrames?: number; opacity?: number}> = ({
  color,
  drawFrames = 30,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const draw = interpolate(frame, [0, drawFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const d = `M -200 ${height * 0.82} C ${width * 0.3} ${height * 0.72}, ${width * 0.55} ${height * 0.3}, ${width + 200} ${height * 0.12}`;
  const len = 3000;

  return (
    <AbsoluteFill style={{opacity, rotate: `${frame * 0.12}deg`, scale: '1.15'}}>
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={160}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={draw * len}
          style={{filter: 'blur(70px)', opacity: 0.55}}
        />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={26}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={draw * len}
          style={{filter: 'blur(14px)'}}
        />
        <path
          d={d}
          fill="none"
          stroke="#fff"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={draw * len}
          style={{opacity: 0.8}}
        />
      </svg>
    </AbsoluteFill>
  );
};

// Granulado de filme sutil, muda a cada frame.
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 50} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// Escurece as bordas para dar profundidade.
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)',
      pointerEvents: 'none',
    }}
  />
);
