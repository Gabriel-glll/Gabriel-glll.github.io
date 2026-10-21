import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {display, heavy, sans, serif} from './fonts';
import {Word, wordFrame} from './timing';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Envolve cada cena: entra com zoom+desfoque, sai desfocando. Dá o "corte" premium.
export const SceneShell: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  style?: React.CSSProperties;
}> = ({children, durationInFrames, style}) => {
  const frame = useCurrentFrame();
  // Entrada: sobe de baixo desfocada. Saída: acelera para cima desfocando (efeito "empurrão").
  const inP = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: ease});
  const outP = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  // Câmera nunca para: aproxima e flutua durante toda a cena.
  const life = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: Math.min(1, inP * 1.4) * (1 - outP),
        scale: String((1.14 - 0.14 * inP) * (1 + 0.08 * outP) * (1 + 0.07 * life)),
        translate: `${life * -18}px ${(1 - inP) * 140 - outP * 220 + (0.5 - life) * 40}px`,
        rotate: `${(life - 0.5) * 1.2}deg`,
        filter: `blur(${(1 - inP) * 22 + outP * 26}px)`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export type Token = {
  i: number; // índice da palavra na narração (define quando aparece)
  text?: string; // texto exibido (padrão: a palavra falada)
  serif?: boolean; // fonte serifada itálica (contraste elegante)
  display?: boolean; // fonte condensada pesada em caixa alta (streetwear)
  heavy?: boolean; // Montserrat 900 (títulos editoriais pesados)
  accent?: boolean; // cor de destaque
  weight?: number;
  scale?: number; // tamanho relativo à linha
  pop?: boolean; // entra com "pulo" de escala
  dim?: boolean; // apagadinho (palavras de apoio)
};

// Uma palavra que aparece no exato momento em que é falada.
const AnimatedToken: React.FC<{
  token: Token;
  words: Word[];
  sceneFrom: number;
  size: number;
  accentColor: string;
  color: string;
  shadow: boolean;
}> = ({token, words, sceneFrom, size, accentColor, color, shadow}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = wordFrame(words, token.i, fps) - sceneFrom - 2;
  const p = interpolate(frame, [start, start + 14], [0, 1], {...clamp, easing: ease});
  // Depois de entrar a palavra segue viva: sobe devagar e (se destaque) cresce um pouco.
  const after = Math.max(0, frame - start - 14);
  const fontSize = size * (token.scale ?? 1) * (token.serif ? 1.18 : 1);
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: token.serif ? serif : token.display ? display : token.heavy ? heavy : sans,
        fontWeight: token.serif || token.display ? 400 : token.heavy ? 900 : (token.weight ?? 600),
        textTransform: token.display ? 'uppercase' : undefined,
        fontSize,
        lineHeight: 1.02,
        letterSpacing: token.serif ? '-0.01em' : token.display ? '0em' : token.heavy ? '-0.04em' : '-0.035em',
        color: token.accent ? accentColor : color,
        opacity: p * (token.dim ? 0.55 : 1),
        translate: `0px ${(1 - p) * 48 - after * 0.35}px`,
        scale: String((token.pop ? 1.35 - 0.35 * p : 1) * (1 + Math.min(after, 90) * (token.accent || token.pop ? 0.0007 : 0.0002))),
        filter: `blur(${(1 - p) * 12}px)`,
        textShadow: !shadow ? undefined : token.accent ? `0 0 40px ${accentColor}88` : '0 4px 30px rgba(0,0,0,0.35)',
        marginRight: fontSize * 0.24,
      }}
    >
      {token.text ?? words[token.i].text}
    </span>
  );
};

// Bloco de texto cinético: várias linhas, cada uma com seu tamanho.
export const KineticText: React.FC<{
  words: Word[];
  sceneFrom: number;
  lines: {size: number; tokens: Token[]; align?: 'left' | 'center' | 'right'}[];
  accentColor: string;
  color?: string;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({words, sceneFrom, lines, accentColor, color = '#f3f7fc', shadow = true, style}) => (
  <div style={{width: 900, display: 'flex', flexDirection: 'column', gap: 6, ...style}}>
    {lines.map((line, li) => (
      <div
        key={li}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent:
            line.align === 'left' ? 'flex-start' : line.align === 'right' ? 'flex-end' : 'center',
        }}
      >
        {line.tokens.map((t, ti) => (
          <AnimatedToken
            key={ti}
            token={t}
            words={words}
            sceneFrom={sceneFrom}
            size={line.size}
            accentColor={accentColor}
            color={color}
            shadow={shadow}
          />
        ))}
      </div>
    ))}
  </div>
);
