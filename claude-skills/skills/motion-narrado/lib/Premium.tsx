// Peças do "nível Tiago" (referência R6): paleta única, título atrás da cabeça, letreiro em faixas,
// camadas 3D, mosaico em escala, rótulos e UI flutuante com borda luminosa.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, useCurrentFrame} from 'remotion';
import {display, heavy, sans} from './fonts';
import {Word} from './timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

export type Palette = {accent: string; soft: string; deep: string; glow: string};
export const ROXO: Palette = {accent: '#7c5cff', soft: '#b9a6ff', deep: '#120826', glow: '#d43cff'};

// entrada/saída padrão de um elemento (0..1)
const life = (frame: number, at: number, until: number, inF = 10, outF = 6) =>
  interpolate(frame, [at, at + inF], [0, 1], {...clamp, easing: ease}) *
  (1 - interpolate(frame, [until - outF, until], [0, 1], clamp));

// ---------- T26: grade de cor puxando tudo para a paleta ----------

// Fundo: tira a cor original, esmaga os pretos, desfoca (profundidade) e recolore na paleta.
export const GradedBackground: React.FC<{src: string; palette?: Palette; blur?: number}> = ({src, palette = ROXO, blur = 6}) => (
  <AbsoluteFill>
    <Img
      src={src}
      style={{width: '100%', height: '100%', objectFit: 'cover', filter: `grayscale(1) brightness(0.17) contrast(1.5) blur(${blur}px)`, scale: '1.04'}}
    />
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${palette.accent}, ${palette.deep} 60%)`, mixBlendMode: 'color'}} />
  </AbsoluteFill>
);

// "Set iluminado": faixas de LED e manchas de luz atrás da pessoa (em screen), respirando devagar.
export const SetLights: React.FC<{palette?: Palette}> = ({palette = ROXO}) => {
  const frame = useCurrentFrame();
  const breathe = (k: number) => 0.75 + 0.25 * Math.sin(frame / 40 + k);
  const strips = [560, 900, 1240];
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -200, top: 250, width: 800, height: 800, borderRadius: '50%', background: palette.glow, filter: 'blur(160px)', opacity: 0.35 * breathe(0)}} />
      <div style={{position: 'absolute', right: -250, top: 700, width: 900, height: 900, borderRadius: '50%', background: palette.accent, filter: 'blur(180px)', opacity: 0.4 * breathe(2)}} />
      {strips.map((y, k) => (
        <div key={k} style={{position: 'absolute', left: k % 2 ? 560 : -40, top: y, width: 560, height: 10, borderRadius: 10, background: palette.glow, filter: 'blur(10px)', opacity: 0.7 * breathe(k)}} />
      ))}
    </AbsoluteFill>
  );
};

// Pessoa recortada com contraste e uma luz de recorte (rim light) na cor da paleta.
export const GradedPerson: React.FC<{src: string; palette?: Palette}> = ({src, palette = ROXO}) => (
  <Img
    src={src}
    style={{
      position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
      filter: `contrast(1.08) saturate(0.9) drop-shadow(0 0 2px ${palette.soft}99) drop-shadow(0 0 26px ${palette.accent}66)`,
    }}
  />
);

// Acabamento final: pretos nas bordas (topo e base) para o texto respirar.
export const FinishGrade: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent 22%, transparent 70%, rgba(0,0,0,0.6)), radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0,0,0,0.45) 100%)',
    }}
  />
);

// ---------- T27: título atrás da cabeça (kicker + palavra gigante + pílula) ----------

export const BehindTitle: React.FC<{
  at: number;
  until: number;
  title: string;
  kicker?: string;
  pill?: string;
  pillAt?: number;
  condensed?: boolean; // contraste tipográfico do clímax (usar 1x por vídeo)
  top?: number;
  size?: number;
  palette?: Palette;
}> = ({at, until, title, kicker, pill, pillAt, condensed, top = 120, size, palette = ROXO}) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame > until) return null;
  const out = interpolate(frame, [until - 6, until], [0, 1], clamp);
  const fs = size ?? (condensed ? 300 : 170);
  const letters = [...title];
  const pa = pillAt ?? at + 8;
  const pp = interpolate(frame, [pa, pa + 10], [0, 1], {...clamp, easing: ease});
  return (
    <div
      style={{
        position: 'absolute', top, width: '100%', textAlign: 'center',
        opacity: 1 - out, filter: `blur(${out * 16}px)`,
        scale: String(1 + (frame - at) * 0.0006),
      }}
    >
      {kicker ? (
        <div style={{fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: '0.4em', color: '#fff', opacity: 0.85 * interpolate(frame, [at - 2, at + 8], [0, 1], clamp), marginBottom: 6}}>
          {kicker.toUpperCase()}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: condensed ? display : heavy, fontWeight: 900, fontSize: fs, lineHeight: 0.92, letterSpacing: condensed ? '0' : '-0.03em',
          color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: '0 18px 50px rgba(0,0,0,0.45)',
        }}
      >
        {letters.map((ch, k) => {
          const s = at + k * (condensed ? 0.8 : 1.3);
          const p = interpolate(frame, [s, s + (condensed ? 12 : 9)], [0, 1], {...clamp, easing: ease});
          return (
            <span
              key={k}
              style={{
                display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 14}px)`,
                transform: condensed ? `translateY(${(1 - p) * -140}px) scaleY(${1.25 - 0.25 * p})` : `translateY(${(1 - p) * 50}px)`,
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          );
        })}
      </div>
      {pill ? (
        <div
          style={{
            display: 'inline-block', marginTop: 4, padding: '6px 26px 10px', borderRadius: 14,
            background: palette.accent, boxShadow: `0 0 40px ${palette.accent}88`,
            fontFamily: heavy, fontWeight: 900, fontSize: fs * 0.42, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em',
            transform: `scaleX(${0.3 + 0.7 * pp})`, opacity: pp, filter: `blur(${(1 - pp) * 8}px)`,
          }}
        >
          {pill}
        </div>
      ) : null}
    </div>
  );
};

// ---------- T28: letreiro em faixas correndo atrás da pessoa ----------

export const Marquee: React.FC<{text: string; at: number; until: number; top?: number; rows?: number; palette?: Palette}> = ({
  text, at, until, top = 120, rows = 4, palette = ROXO,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > until) return null;
  const v = life(frame, at, until, 12, 8);
  const unit = `${text.toUpperCase()} · `;
  return (
    <div style={{position: 'absolute', top, left: 0, width: '100%', opacity: v, maskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)'}}>
      {Array.from({length: rows}).map((_, r) => {
        const dir = r % 2 ? 1 : -1;
        const outline = r % 2 === 1;
        const x = -600 + dir * ((frame - at) * (9 + r * 2)) + (1 - v) * dir * -300;
        return (
          <div
            key={r}
            style={{
              whiteSpace: 'nowrap', fontFamily: heavy, fontWeight: 900, fontSize: 180, lineHeight: 1.02, letterSpacing: '-0.02em',
              transform: `translateX(${x}px)`,
              color: outline ? 'transparent' : r === 0 ? '#fff' : palette.soft,
              WebkitTextStroke: outline ? `3px ${palette.soft}` : undefined,
              opacity: outline ? 0.9 : r === 0 ? 1 : 0.55,
            }}
          >
            {unit.repeat(6)}
          </div>
        );
      })}
    </div>
  );
};

// ---------- T29: camadas da composição se separando em 3D ----------

export const GlassLayers: React.FC<{
  at: number;
  layers: {name: string; node: React.ReactNode}[]; // do fundo para a frente
  caption?: string;
  palette?: Palette;
}> = ({at, layers, caption, palette = ROXO}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 36], [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});
  const drift = Math.max(0, frame - at - 36) * 0.06;
  const n = layers.length;
  return (
    <AbsoluteFill style={{perspective: 2200, perspectiveOrigin: '50% 45%'}}>
      <AbsoluteFill
        style={{
          transformStyle: 'preserve-3d',
          transform: `scale(${1 - 0.3 * p}) rotateY(${-32 * p - drift}deg) rotateX(${8 * p}deg)`,
        }}
      >
        {layers.map((l, i) => (
          <AbsoluteFill
            key={i}
            style={{
              transform: `translateZ(${(i - (n - 1) / 2) * 230 * p}px)`,
              border: `${2 * p}px solid ${palette.soft}`,
              borderRadius: 28 * p,
              boxShadow: p > 0.01 ? `0 0 ${40 * p}px ${palette.accent}88, inset 0 0 ${60 * p}px ${palette.accent}33` : undefined,
              background: i > 0 ? `rgba(30, 16, 70, ${0.12 * p})` : undefined,
              overflow: 'hidden',
            }}
          >
            {l.node}
            <div
              style={{
                position: 'absolute', top: 30, left: 30, padding: '8px 18px', borderRadius: 10, background: palette.accent,
                fontFamily: sans, fontWeight: 800, fontSize: 30, color: '#fff', letterSpacing: '0.08em', opacity: p,
              }}
            >
              {`0${i + 1} · ${l.name.toUpperCase()}`}
            </div>
          </AbsoluteFill>
        ))}
      </AbsoluteFill>
      {caption ? (
        <div
          style={{
            position: 'absolute', bottom: 150, width: '100%', textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 32,
            letterSpacing: '0.35em', color: palette.soft, opacity: interpolate(frame, [at + 24, at + 40], [0, 1], clamp),
          }}
        >
          {caption.toUpperCase()}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- T30: mosaico de miniaturas com zoom-out ("na sua escala") ----------

export const Mosaic: React.FC<{at: number; images: string[]; center: React.ReactNode; palette?: Palette}> = ({at, images, center, palette = ROXO}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 40], [0, 1], {...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1)});
  const W = 300, H = 533, G = 22, COLS = 7, ROWS = 7;
  const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
  // começa com a miniatura central ocupando a tela inteira
  const scale = interpolate(p, [0, 1], [1080 / W, 0.62]);
  return (
    <AbsoluteFill style={{background: palette.deep, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', transform: `scale(${scale}) rotate(${-7 * p}deg)`}}>
        {Array.from({length: COLS}).map((_, c) => {
          const colShift = (c % 2 ? 1 : -1) * (frame - at) * 1.6 * p;
          return Array.from({length: ROWS}).map((__, r) => {
            const isCenter = c === cx && r === cy;
            const img = images[(c * ROWS + r * 3) % images.length];
            return (
              <div
                key={`${c}-${r}`}
                style={{
                  position: 'absolute', width: W, height: H, borderRadius: 18 * p, overflow: 'hidden',
                  left: (c - cx) * (W + G) - W / 2, top: (r - cy) * (H + G) - H / 2 + (isCenter ? 0 : colShift),
                  boxShadow: isCenter ? `0 0 ${50 * p}px ${palette.accent}` : '0 10px 30px rgba(0,0,0,0.5)',
                  border: isCenter ? `${3 * p}px solid ${palette.soft}` : undefined,
                  opacity: isCenter ? 1 : p,
                }}
              >
                {isCenter ? (
                  <div style={{width: 1080, height: 1920, transform: `scale(${W / 1080})`, transformOrigin: '0 0'}}>{center}</div>
                ) : (
                  <Img src={img} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85)'}} />
                )}
              </div>
            );
          });
        })}
      </div>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${palette.deep}cc 100%)`, opacity: p}} />
    </AbsoluteFill>
  );
};

// ---------- rótulos e UI ----------

// Rótulo-pílula do sizzle (CORTES, LEGENDA, 3D...).
export const TagPill: React.FC<{text: string; at: number; top?: number; palette?: Palette}> = ({text, at, top = 150, palette = ROXO}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 8], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          padding: '10px 26px', borderRadius: 14, background: 'rgba(14,8,32,0.82)', border: `2px solid ${palette.soft}aa`,
          boxShadow: `0 0 30px ${palette.accent}66`, fontFamily: heavy, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: '0.02em',
          scale: String(0.6 + 0.4 * p), opacity: p,
        }}
      >
        {text.toUpperCase()}
      </div>
    </div>
  );
};

// Cantoneiras de foco que fecham em volta do rosto.
export const FocusBrackets: React.FC<{at: number; x: number; y: number; w: number; h: number; color?: string}> = ({at, x, y, w, h, color = '#fff'}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], {...clamp, easing: ease});
  const grow = (1 - p) * 120;
  const L = 60;
  const corner = (cx: number, cy: number, sx: number, sy: number, k: number) => (
    <div
      key={k}
      style={{
        position: 'absolute', left: cx - (sx < 0 ? L : 0) + sx * -grow, top: cy - (sy < 0 ? L : 0) + sy * -grow, width: L, height: L, opacity: p,
        borderLeft: sx > 0 ? `4px solid ${color}` : undefined, borderRight: sx < 0 ? `4px solid ${color}` : undefined,
        borderTop: sy > 0 ? `4px solid ${color}` : undefined, borderBottom: sy < 0 ? `4px solid ${color}` : undefined,
      }}
    />
  );
  return (
    <AbsoluteFill>
      {[corner(x, y, 1, 1, 0), corner(x + w, y, -1, 1, 1), corner(x, y + h, 1, -1, 2), corner(x + w, y + h, -1, -1, 3)]}
    </AbsoluteFill>
  );
};

// Card de vidro com borda luminosa, flutuando.
export const FloatCard: React.FC<{at: number; until: number; x: number; y: number; w: number; children: React.ReactNode; palette?: Palette}> = ({
  at, until, x, y, w, children, palette = ROXO,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > until) return null;
  const v = life(frame, at, until, 12, 8);
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y + Math.sin(frame / 22) * 8, width: w, padding: 28, borderRadius: 26,
        background: 'linear-gradient(160deg, rgba(40,24,90,0.78), rgba(14,8,32,0.88))', border: `2px solid ${palette.soft}88`,
        boxShadow: `0 0 50px ${palette.accent}55, 0 30px 60px rgba(0,0,0,0.5)`,
        opacity: v, scale: String(0.85 + 0.15 * v), filter: `blur(${(1 - v) * 10}px)`, rotate: `${(1 - v) * 6 + 2}deg`,
      }}
    >
      {children}
    </div>
  );
};

// Legenda discreta no peito: acumula palavra por palavra, palavra-chave na cor de destaque.
export const SmallCaption: React.FC<{words: Word[]; fps: number; highlight?: string[]; top?: number; perChunk?: number; palette?: Palette}> = ({
  words, fps, highlight = [], top = 1250, perChunk = 4, palette = ROXO,
}) => {
  const frame = useCurrentFrame();
  const ms = (frame / fps) * 1000;
  let active = -1;
  for (let i = 0; i < words.length; i++) if (words[i].startMs <= ms + 30) active = i;
  if (active < 0 || (active === words.length - 1 && ms > words[active].endMs + 600)) return null;
  const clean = (t: string) => t.replace(/[.,!?"]/g, '');
  // quebra o grupo em fim de frase também
  let start = Math.floor(active / perChunk) * perChunk;
  for (let i = active - 1; i >= start; i--) if (/[.!?]$/.test(words[i].text)) {
    start = i + 1;
    break;
  }
  const chunk = words.slice(start, active + 1);
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 46, color: '#fff', textShadow: '0 3px 14px rgba(0,0,0,0.7)', letterSpacing: '-0.01em'}}>
      {chunk.map((w, k) => {
        const f = Math.round((w.startMs / 1000) * fps);
        const p = interpolate(frame, [f - 1, f + 4], [0, 1], clamp);
        const hl = highlight.includes(clean(w.text).toLowerCase());
        return (
          <span key={k} style={{display: 'inline-block', marginRight: 12, opacity: p, transform: `translateY(${(1 - p) * 10}px)`, color: hl ? palette.soft : '#fff'}}>
            {clean(w.text)}
          </span>
        );
      })}
    </div>
  );
};

// CTA persistente embaixo da legenda.
export const CtaPill: React.FC<{at: number; text: string; top?: number; palette?: Palette}> = ({at, text, top = 1340, palette = ROXO}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 10], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
  const pulse = 1 + 0.03 * Math.sin((frame - at) / 6);
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', opacity: p}}>
      <div
        style={{
          padding: '14px 30px', borderRadius: 40, background: palette.accent, color: '#fff', fontFamily: sans, fontWeight: 700, fontSize: 32,
          boxShadow: `0 0 40px ${palette.accent}aa`, scale: String((0.7 + 0.3 * p) * pulse),
        }}
      >
        {text}
      </div>
    </div>
  );
};
