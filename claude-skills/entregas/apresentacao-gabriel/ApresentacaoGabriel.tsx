import React from 'react';
import {Audio} from '@remotion/media';
import {noise2D} from '@remotion/noise';
import {getLength, getPointAtLength} from '@remotion/paths';
import {AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import wordsJson from '../../public/audio/apres-final.words.json';
import {Grain} from '../lib/Background';
import {KineticText, SceneShell} from '../lib/Kinetic';
import {heavy, sans, serif} from '../lib/fonts';
import {scenesFromWords, Word, wordFrame} from '../lib/timing';

// Estilo Editorial (apresentação pessoal) · par Orange + Milk (energia, calor).
// Assinatura: cortes secos alternando laranja / leite / tinta + flash + carimbos.
const words = wordsJson as Word[];

const BLUE = '#E8541E';
const BLUE_HI = '#FF7A3D'; // azul aceso para fundo escuro
const CREAM = '#FDFBF1';
const CREAM_DK = '#EFE6D2';
const INK = '#170B05';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const prog = (frame: number, at: number, dur = 14) => interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: ease});

const SCENE_STARTS = [0, 6, 18, 23, 30, 45, 50, 63, 71, 73, 85, 92, 98, 104, 107, 113, 122, 133, 144, 152];

export const apresentacaoDuration = (fps: number) => Math.ceil(((words[words.length - 1].endMs + 3600) / 1000) * fps);

type Mode = 'blue' | 'cream' | 'ink';
const fg = (m: Mode) => (m === 'cream' ? INK : CREAM);
const acc = (m: Mode) => (m === 'cream' ? BLUE : m === 'ink' ? BLUE_HI : CREAM);

// ---------- fundos ----------
const Bg: React.FC<{mode: Mode}> = ({mode}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (mode === 'cream') {
    return (
      <AbsoluteFill style={{backgroundColor: CREAM}}>
        {[1, 2, 3].map((k) => (
          <div key={k} style={{position: 'absolute', left: k * 270, top: 0, bottom: 0, width: 1, background: INK, opacity: 0.06}} />
        ))}
        <AbsoluteFill style={{background: `radial-gradient(ellipse at ${50 + Math.sin(t * 0.5) * 10}% 40%, transparent 40%, ${CREAM_DK} 110%)`}} />
      </AbsoluteFill>
    );
  }
  const base = mode === 'blue' ? BLUE : INK;
  const glow = mode === 'blue' ? '#FF9A5C' : BLUE;
  return (
    <AbsoluteFill style={{backgroundColor: base, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 1500,
          height: 1500,
          left: -500 + Math.sin(t * 0.7) * 200,
          top: -400 + Math.cos(t * 0.5) * 220,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow} 0%, transparent 62%)`,
          opacity: mode === 'blue' ? 0.75 : 0.6,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)'}} />
    </AbsoluteFill>
  );
};

const Chrome: React.FC<{mode: Mode; from: number; total: number}> = ({mode, from, total}) => {
  const frame = useCurrentFrame();
  const color = fg(mode);
  const label: React.CSSProperties = {fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: '0.32em', color, opacity: 0.75};
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 92, left: 64, right: 64, display: 'flex', justifyContent: 'space-between'}}>
        <span style={label}>GABRIEL</span>
        <span style={label}>PRAZER</span>
      </div>
      <div style={{position: 'absolute', top: 140, left: 64, right: 64, height: 2, background: color, opacity: 0.35}} />
      <div style={{position: 'absolute', bottom: 92, left: 64, right: 64, height: 4, background: color, opacity: 0.18}} />
      <div
        style={{
          position: 'absolute',
          bottom: 92,
          left: 64,
          height: 4,
          width: 952 * Math.min(1, (from + frame) / total),
          background: mode === 'blue' ? CREAM : mode === 'cream' ? BLUE : BLUE_HI,
        }}
      />
    </AbsoluteFill>
  );
};

const shakeAt = (frame: number, ats: number[], amp = 22) => {
  let x = 0;
  let y = 0;
  for (const at of ats) {
    const d = frame - at;
    if (d < 0 || d > 12) continue;
    const k = amp * (1 - d / 12);
    x += noise2D('sx', d * 0.9, at) * k;
    y += noise2D('sy', d * 0.9, at) * k;
  }
  return `${x}px ${y}px`;
};

const ShakeWrap: React.FC<{ats: number[]; amp?: number; children: React.ReactNode}> = ({ats, amp, children}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{translate: shakeAt(frame, ats, amp)}}>{children}</AbsoluteFill>;
};

const Flash: React.FC<{color?: string}> = ({color = CREAM}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5], [0.85, 0], clamp);
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

// bloco posicionado no eixo vertical, centralizado na horizontal
const At: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>{children}</div>
);

const Stamp: React.FC<{at: number; text: string; size: number; rotate: number; color: string; fill?: string}> = ({at, text, size, rotate, color, fill = 'transparent'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 13, mass: 0.55, stiffness: 220}});
  const id = `rough-${text.replace(/\W/g, '')}`;
  if (frame < at) return null;
  return (
    <div>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={7} />
        </filter>
      </svg>
      <div
        style={{
          fontFamily: heavy,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color,
          background: fill,
          border: `${Math.max(6, size * 0.07)}px solid ${color}`,
          borderRadius: size * 0.12,
          padding: `${size * 0.16}px ${size * 0.28}px ${size * 0.12}px`,
          whiteSpace: 'nowrap',
          rotate: `${rotate}deg`,
          scale: String(interpolate(s, [0, 1], [2.8, 1])),
          opacity: interpolate(frame - at, [0, 3], [0, 1], clamp),
          filter: `url(#${id})`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const PillWord: React.FC<{at: number; text: string; size: number; bg: string; color: string}> = ({at, text, size, bg, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12}});
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: heavy,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color,
        background: bg,
        borderRadius: 999,
        padding: `${size * 0.18}px ${size * 0.42}px ${size * 0.2}px`,
        scale: String(0.5 + 0.5 * s),
        opacity: frame < at ? 0 : Math.min(1, s * 1.6),
        rotate: `${(1 - s) * -6}deg`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

const StrikeLine: React.FC<{at: number; width: number; color: string; height?: number; rotate?: number}> = ({at, width, color, height = 12, rotate = -5}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 10);
  return <div style={{width: width * p, height, background: color, borderRadius: 6, rotate: `${rotate}deg`, boxShadow: `0 0 24px ${color}88`}} />;
};

const HouseIcon: React.FC<{size: number; color: string; fill?: string; stroke?: number}> = ({size, color, fill = 'none', stroke = 6}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <path d="M10 48 L50 12 L90 48" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round" />
    <rect x={20} y={46} width={60} height={44} fill={fill} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    <rect x={43} y={64} width={14} height={26} fill={fill === 'none' ? color : CREAM} />
  </svg>
);

// Cena com fundo + cabeçalho; o conteúdo entra com o SceneShell
const Scene: React.FC<{
  seq: {from: number; durationInFrames: number};
  total: number;
  mode: Mode;
  name: string;
  flash?: boolean;
  shake?: number[];
  children: React.ReactNode;
}> = ({seq, total, mode, name, flash, shake, children}) => (
  <Sequence {...seq} name={name}>
    <Bg mode={mode} />
    <ShakeWrap ats={shake ?? []}>
      <SceneShell durationInFrames={seq.durationInFrames}>{children}</SceneShell>
    </ShakeWrap>
    <Chrome mode={mode} from={seq.from} total={total} />
    {flash ? <Flash color={mode === 'cream' ? BLUE : CREAM} /> : null}
  </Sequence>
);


// ==========================================================
export const ApresentacaoGabriel: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const sc = scenesFromWords(words, SCENE_STARTS, fps, durationInFrames);
  const rel = (i: number, k: number) => wordFrame(words, i, fps) - sc[k].from;
  const abs = (i: number) => wordFrame(words, i, fps);
  const T = durationInFrames;
  const kt = (k: number, mode: Mode) => ({words, sceneFrom: sc[k].from, accentColor: acc(mode), color: fg(mode), shadow: mode !== 'cream'});
  const L = sc.length - 1;

  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      {/* 0 · Prazer, eu sou o Gabriel Gil. */}
      <Scene seq={sc[0]} total={T} mode="ink" name="0 · Prazer">
        <At top={300}>
          <Monogram at={0} ring="FÉ • FAMÍLIA • NEGÓCIOS • IMÓVEIS • " />
        </At>
        <At top={820}>
          <KineticText {...kt(0, 'ink')} lines={[{size: 130, tokens: [{i: 0, text: 'Prazer,', serif: true, pop: true, accent: true}]}, {size: 56, tokens: [{i: 1, dim: true}, {i: 2, dim: true}, {i: 3, dim: true}]}]} />
        </At>
        <At top={1110}>
          <NameReveal at={rel(4, 0)} color={CREAM} />
        </At>
      </Scene>

      {/* 1 · E antes de qualquer coisa… deixa eu te contar quem eu sou. */}
      <Scene seq={sc[1]} total={T} mode="cream" name="1 · Quem eu sou" flash>
        <At top={330}>
          <KineticText
            {...kt(1, 'cream')}
            lines={[
              {size: 54, tokens: [{i: 6, dim: true}, {i: 7, weight: 800}, {i: 8, dim: true}, {i: 9}, {i: 10, text: 'coisa…', dim: true}]},
              {size: 54, tokens: [{i: 11, dim: true}, {i: 12, dim: true}, {i: 13, dim: true}, {i: 14, weight: 800}]},
            ]}
          />
        </At>
        <At top={560}>
          <KineticText {...kt(1, 'cream')} lines={[{size: 190, tokens: [{i: 15, text: 'quem', heavy: true}]}, {size: 150, tokens: [{i: 16, serif: true, accent: true}, {i: 17, text: 'sou?', serif: true, accent: true, pop: true}]}]} />
        </At>
        <At top={1180}>
          <ChapterIcons ats={[rel(15, 1), rel(15, 1) + 5, rel(16, 1) + 3, rel(17, 1) + 2]} />
        </At>
      </Scene>

      {/* 2 · Sou cristão. Servo de Deus. */}
      <Scene seq={sc[2]} total={T} mode="ink" name="2 · Cristão" flash shake={[rel(20, 2) + 3]}>
        <Sunburst at={rel(19, 2) - 6} color={BLUE_HI} />
        <At top={300}>
          <DrawnCross at={rel(18, 2)} />
        </At>
        <At top={980}>
          <KineticText {...kt(2, 'ink')} lines={[{size: 70, tokens: [{i: 18, dim: true}]}, {size: 200, tokens: [{i: 19, text: 'cristão.', serif: true, accent: true, pop: true}]}]} />
        </At>
        <At top={1380}>
          <Stamp at={rel(20, 2)} text="SERVO DE DEUS" size={84} rotate={-6} color={CREAM} />
        </At>
      </Scene>

      {/* 3 · Tudo o que eu construo começa Nele. */}
      <Scene seq={sc[3]} total={T} mode="blue" name="3 · Construo" shake={[rel(29, 3) + 2]}>
        <At top={310}>
          <KineticText
            {...kt(3, 'blue')}
            lines={[
              {size: 64, tokens: [{i: 23, weight: 800}, {i: 24, dim: true}, {i: 25, dim: true}, {i: 26, dim: true}]},
              {size: 150, tokens: [{i: 27, heavy: true}]},
            ]}
          />
        </At>
        <At top={640}>
          <Foundation at={rel(27, 3) - 4} neleAt={rel(29, 3)} />
        </At>
        <At top={1400}>
          <KineticText {...kt(3, 'blue')} lines={[{size: 70, tokens: [{i: 28, dim: true}, {i: 29, text: 'Nele.', serif: true, scale: 2.2, pop: true}]}]} />
        </At>
      </Scene>

      {/* 4 · É por Ele que eu sigo, e tudo o que eu faço é para Ele. */}
      <Scene seq={sc[4]} total={T} mode="cream" name="4 · Para Ele" flash>
        <At top={300}>
          <KineticText
            {...kt(4, 'cream')}
            lines={[
              {size: 60, tokens: [{i: 30, dim: true}, {i: 31, dim: true}, {i: 32, weight: 800}, {i: 33, dim: true}, {i: 34, dim: true}, {i: 35, text: 'sigo,', serif: true, accent: true, scale: 1.6}]},
            ]}
          />
        </At>
        <At top={480}>
          <PathUp at={rel(31, 4)} />
        </At>
        <At top={1250}>
          <KineticText
            {...kt(4, 'cream')}
            lines={[
              {size: 54, tokens: [{i: 36, dim: true}, {i: 37, weight: 800}, {i: 38, dim: true}, {i: 39, dim: true}, {i: 40, dim: true}, {i: 41}, {i: 42, dim: true}]},
              {size: 190, tokens: [{i: 43, serif: true, accent: true}, {i: 44, text: 'Ele.', heavy: true, pop: true}]},
            ]}
          />
        </At>
      </Scene>

      {/* 5 · Sou casado com a Melissa, */}
      <Scene seq={sc[5]} total={T} mode="blue" name="5 · Melissa" flash>
        <At top={330}>
          <KineticText {...kt(5, 'blue')} lines={[{size: 70, tokens: [{i: 45, dim: true}, {i: 46, heavy: true, scale: 1.5}, {i: 47, dim: true}, {i: 48, dim: true}]}]} />
        </At>
        <At top={560}>
          <Rings at={rel(46, 5)} />
        </At>
        <At top={1220}>
          <KineticText {...kt(5, 'blue')} lines={[{size: 230, tokens: [{i: 49, text: 'Melissa', serif: true, pop: true}]}]} />
        </At>
      </Scene>

      {/* 6 · a mulher que Deus colocou do meu lado pra construir uma vida inteira. */}
      <Scene seq={sc[6]} total={T} mode="cream" name="6 · Vida inteira" flash>
        <At top={310}>
          <KineticText
            {...kt(6, 'cream')}
            lines={[
              {size: 58, tokens: [{i: 50, dim: true}, {i: 51, weight: 800}, {i: 52, dim: true}, {i: 53, serif: true, accent: true, scale: 1.5}, {i: 54}]},
              {size: 58, tokens: [{i: 55, dim: true}, {i: 56, dim: true}, {i: 57, text: 'lado', weight: 800}]},
            ]}
          />
        </At>
        <At top={720}>
          <LifeLine at={rel(55, 6)} endAt={rel(61, 6)} />
        </At>
        <At top={1240}>
          <KineticText {...kt(6, 'cream')} lines={[{size: 56, tokens: [{i: 58, dim: true}, {i: 59}, {i: 60, dim: true}]}, {size: 170, tokens: [{i: 61, heavy: true}, {i: 62, text: 'inteira.', serif: true, accent: true}]}]} />
        </At>
      </Scene>

      {/* 7 · Tenho muito orgulho dela, e sou muito feliz. */}
      <Scene seq={sc[7]} total={T} mode="ink" name="7 · Feliz" flash>
        <HeartBurst at={rel(65, 7)} />
        <At top={420}>
          <KineticText
            {...kt(7, 'ink')}
            lines={[
              {size: 60, tokens: [{i: 63, dim: true}, {i: 64, weight: 800}]},
              {size: 190, tokens: [{i: 65, text: 'orgulho', heavy: true}]},
              {size: 110, tokens: [{i: 66, text: 'dela.', serif: true, accent: true}]},
            ]}
          />
        </At>
        <At top={1150}>
          <KineticText {...kt(7, 'ink')} lines={[{size: 56, tokens: [{i: 67, dim: true}, {i: 68, dim: true}, {i: 69, weight: 800}]}]} />
        </At>
        <At top={1260}>
          <PillWord at={rel(69, 7) + 4} text="feliz!" size={170} bg={BLUE} color={CREAM} />
        </At>
      </Scene>

      {/* 8 · Sou empresário. */}
      <Scene seq={sc[8]} total={T} mode="blue" name="8 · Empresário" flash shake={[rel(72, 8) + 3]}>
        <Sunburst at={0} color={CREAM} />
        <At top={600}>
          <KineticText {...kt(8, 'blue')} lines={[{size: 90, tokens: [{i: 71, serif: true}]}]} />
        </At>
        <At top={820}>
          <Stamp at={rel(72, 8)} text="EMPRESÁRIO" size={104} rotate={-5} color={CREAM} />
        </At>
      </Scene>

      {/* 9 · Gosto de criar, de empreender e de transformar ideias em algo real. */}
      <Scene seq={sc[9]} total={T} mode="cream" name="9 · Criar" flash>
        <At top={300}>
          <KineticText {...kt(9, 'cream')} lines={[{size: 64, tokens: [{i: 73, weight: 800}, {i: 74, dim: true}]}]} />
        </At>
        <At top={420}>
          <Checks
            rows={[
              {n: '01', t: 'criar', at: rel(75, 9)},
              {n: '02', t: 'empreender', at: rel(77, 9)},
              {n: '03', t: 'transformar', at: rel(80, 9)},
            ]}
          />
        </At>
        <At top={1260}>
          <KineticText {...kt(9, 'cream')} lines={[{size: 60, tokens: [{i: 81, weight: 800}, {i: 82, dim: true}]}, {size: 190, tokens: [{i: 83, serif: true, accent: true}, {i: 84, text: 'real.', heavy: true, pop: true}]}]} />
        </At>
      </Scene>

      {/* 10 · Hoje tenho a minha loja de roupas… */}
      <Scene seq={sc[10]} total={T} mode="ink" name="10 · Loja" flash>
        <At top={310}>
          <KineticText {...kt(10, 'ink')} lines={[{size: 60, tokens: [{i: 85, weight: 800}, {i: 86, dim: true}, {i: 87, dim: true}, {i: 88, dim: true}]}]} />
        </At>
        <At top={470}>
          <Storefront at={rel(89, 10) - 6} />
        </At>
        <At top={1310}>
          <KineticText {...kt(10, 'ink')} lines={[{size: 120, tokens: [{i: 89, heavy: true}, {i: 90, dim: true, scale: 0.5}, {i: 91, text: 'roupas', serif: true, accent: true}]}]} />
        </At>
      </Scene>

      {/* 11 · mas isso é só o começo. */}
      <Scene seq={sc[11]} total={T} mode="blue" name="11 · Começo" flash>
        <At top={420}>
          <KineticText
            {...kt(11, 'blue')}
            lines={[
              {size: 70, tokens: [{i: 92, dim: true}, {i: 93, weight: 800}, {i: 94, dim: true}, {i: 95, heavy: true, scale: 1.6}]},
              {size: 200, tokens: [{i: 96, serif: true, scale: 0.6}, {i: 97, text: 'começo.', serif: true, pop: true}]},
            ]}
          />
        </At>
        <At top={1050}>
          <JustStarted at={rel(95, 11)} />
        </At>
      </Scene>

      {/* 12 · E agora começo um novo capítulo: */}
      <Scene seq={sc[12]} total={T} mode="cream" name="12 · Capítulo" flash>
        <At top={310}>
          <KineticText {...kt(12, 'cream')} lines={[{size: 62, tokens: [{i: 98, dim: true}, {i: 99, weight: 800}, {i: 100, dim: true}, {i: 101, dim: true}, {i: 102, serif: true, accent: true, scale: 1.6}]}]} />
        </At>
        <At top={560}>
          <BookFlip at={rel(102, 12)} />
        </At>
      </Scene>

      {/* 13 · corretor de imóveis. */}
      <Scene seq={sc[13]} total={T} mode="ink" name="13 · Corretor" flash shake={[rel(104, 13) + 3]}>
        <Sunburst at={0} color={BLUE_HI} />
        <At top={430}>
          <HouseIcon size={300} color={BLUE_HI} stroke={7} />
        </At>
        <At top={860}>
          <Stamp at={rel(104, 13)} text="CORRETOR" size={124} rotate={-4} color={CREAM} />
        </At>
        <At top={1170}>
          <PillWord at={rel(106, 13)} text="de imóveis" size={100} bg={BLUE} color={CREAM} />
        </At>
      </Scene>

      {/* 14 · Quero ajudar pessoas e famílias */}
      <Scene seq={sc[14]} total={T} mode="cream" name="14 · Famílias" flash>
        <At top={310}>
          <KineticText {...kt(14, 'cream')} lines={[{size: 64, tokens: [{i: 107, dim: true}, {i: 108, heavy: true, scale: 1.6}]}, {size: 90, tokens: [{i: 109, weight: 800}, {i: 110, dim: true}, {i: 111, text: 'famílias', serif: true, accent: true, scale: 1.3}]}]} />
        </At>
        <At top={700}>
          <FamilyHome at={rel(109, 14)} />
        </At>
      </Scene>

      {/* 15 · a encontrar o lugar onde a história delas vai acontecer. */}
      <Scene seq={sc[15]} total={T} mode="blue" name="15 · Lugar" flash>
        <At top={330}>
          <KineticText {...kt(15, 'blue')} lines={[{size: 60, tokens: [{i: 112, dim: true}, {i: 113, weight: 800}, {i: 114, dim: true}]}, {size: 200, tokens: [{i: 115, text: 'o lugar', serif: true, pop: true}]}]} />
        </At>
        <At top={720}>
          <PinDrop at={rel(115, 15)} />
        </At>
        <At top={1270}>
          <KineticText {...kt(15, 'blue')} lines={[{size: 54, tokens: [{i: 116, dim: true}, {i: 117, dim: true}, {i: 118, heavy: true, scale: 1.4}, {i: 119, dim: true}]}, {size: 120, tokens: [{i: 120, dim: true, scale: 0.5}, {i: 121, text: 'acontecer.', serif: true}]}]} />
        </At>
      </Scene>

      {/* 16 · Aqui você vai ver um pouco de tudo da minha vida: */}
      <Scene seq={sc[16]} total={T} mode="ink" name="16 · Perfil" flash>
        <At top={290}>
          <KineticText {...kt(16, 'ink')} lines={[{size: 58, tokens: [{i: 122, weight: 800}, {i: 123, dim: true}, {i: 124, dim: true}, {i: 125, dim: true}, {i: 126, dim: true}, {i: 127, dim: true}]}, {size: 130, tokens: [{i: 128, dim: true, scale: 0.5}, {i: 129, text: 'tudo', heavy: true}, {i: 130, dim: true, scale: 0.5}, {i: 131, dim: true, scale: 0.5}, {i: 132, text: 'vida', serif: true, accent: true}]}]} />
        </At>
        <At top={720}>
          <PhoneGrid at={rel(122, 16)} />
        </At>
      </Scene>

      {/* 17 · fé, casamento, negócios, imóveis… e o dia a dia de verdade. */}
      <Scene seq={sc[17]} total={T} mode="cream" name="17 · Tudo" flash>
        <At top={330}>
          <CategoryStack
            items={[
              {t: 'fé', kind: 'cross', at: rel(133, 17)},
              {t: 'casamento', kind: 'rings', at: rel(134, 17)},
              {t: 'negócios', kind: 'shirt', at: rel(135, 17)},
              {t: 'imóveis', kind: 'house', at: rel(136, 17)},
            ]}
          />
        </At>
        <At top={1330}>
          <KineticText {...kt(17, 'cream')} lines={[{size: 56, tokens: [{i: 137, dim: true}, {i: 138, dim: true}, {i: 139, weight: 800}, {i: 140, weight: 800}, {i: 141, weight: 800}]}, {size: 170, tokens: [{i: 142, dim: true, scale: 0.4}, {i: 143, text: 'verdade.', serif: true, accent: true, pop: true}]}]} />
        </At>
      </Scene>

      {/* 18 · Se faz sentido pra você, fica por aqui. */}
      <Scene seq={sc[18]} total={T} mode="blue" name="18 · Fica" flash>
        <At top={330}>
          <KineticText {...kt(18, 'blue')} lines={[{size: 62, tokens: [{i: 144, dim: true}, {i: 145, dim: true}, {i: 146, weight: 800}, {i: 147, dim: true}, {i: 148, text: 'você,', serif: true, scale: 1.5}]}, {size: 150, tokens: [{i: 149, heavy: true}, {i: 150, dim: true, scale: 0.5}, {i: 151, text: 'aqui.', serif: true}]}]} />
        </At>
        <At top={860}>
          <FollowTap at={rel(144, 18)} tapAt={rel(149, 18) + 4} />
        </At>
      </Scene>

      {/* 19 · Prazer, Gabriel Gil. */}
      <Sequence {...sc[L]} name="19 · Final">
        <Finale dur={sc[L].durationInFrames} prazerAt={rel(152, L)} euAt={rel(154, L)} nameAt={rel(153, L)} />
        <Chrome mode="ink" from={sc[L].from} total={T} />
        <Flash color={BLUE_HI} />
      </Sequence>

      <Grain opacity={0.08} />

      {/* ---------- áudio (narração PROVISÓRIA: será trocada) ---------- */}
      <Audio src={staticFile('audio/apres-final.mp3')} />
      <Audio
        src={staticFile('music/apresentacao-trilha68.mp3')}
        volume={(f) => interpolate(f, [0, 10, sc[L].from - 10, sc[L].from + 15, T - 30, T - 1], [0, 0.18, 0.18, 0.34, 0.34, 0], clamp)}
      />
      {[1, 3, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18].map((k) => (
        <Sequence key={`w${k}`} from={Math.max(0, sc[k].from - 4)} durationInFrames={30}>
          <Audio src={staticFile(k % 2 ? 'sfx/whoosh.wav' : 'sfx/alienated-warp.mp3')} volume={k % 2 ? 0.22 : 0.3} />
        </Sequence>
      ))}
      {[abs(20), abs(72), abs(104)].map((at, k) => (
        <Sequence key={`s${k}`} from={at} durationInFrames={40}>
          <Audio src={staticFile('sfx/cinestrike.mp3')} volume={0.6} />
        </Sequence>
      ))}
      {[abs(18) + 2, abs(46) + 10, abs(143)].map((at, k) => (
        <Sequence key={`g${k}`} from={at} durationInFrames={50}>
          <Audio src={staticFile('sfx/gleam-brilho.mp3')} volume={0.35} />
        </Sequence>
      ))}
      {[abs(75), abs(77), abs(80), abs(133), abs(134), abs(135), abs(136)].map((at, k) => (
        <Sequence key={`c${k}`} from={at + 6} durationInFrames={30}>
          <Audio src={staticFile('sfx/digital-click.mp3')} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={abs(102) + 4} durationInFrames={30}>
        <Audio src={staticFile('sfx/switch.mp3')} volume={0.45} />
      </Sequence>
      <Sequence from={abs(115)} durationInFrames={30}>
        <Audio src={staticFile('sfx/thump.wav')} volume={0.55} />
      </Sequence>
      <Sequence from={abs(149) + 4} durationInFrames={30}>
        <Audio src={staticFile('sfx/success-ui.mp3')} volume={0.5} />
      </Sequence>
      <Sequence from={Math.max(0, sc[L].from - 30)} durationInFrames={40}>
        <Audio src={staticFile('sfx/riser-click.mp3')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ==================== componentes das cenas ====================

// foto de perfil redonda
const Avatar: React.FC<{size: number; ring?: string}> = ({size, ring = CREAM}) => (
  <div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 0 ${Math.max(4, size * 0.035)}px ${ring}, 0 20px 50px rgba(0,0,0,0.35)`, background: BLUE}}>
    <Img src={staticFile('foto/perfil.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);

type Kind = 'cross' | 'rings' | 'shirt' | 'house';
const GLYPH: Record<Kind, string[]> = {
  cross: ['M50 10 V90', 'M24 34 H76'],
  rings: ['M38 55 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0', 'M62 55 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0'],
  shirt: ['M30 22 L42 14 Q50 24 58 14 L70 22 L84 38 L71 46 L71 88 L29 88 L29 46 L16 38 Z'],
  house: ['M10 50 L50 14 L90 50', 'M22 46 V88 H78 V46', 'M43 88 V66 H57 V88'],
};
const Glyph: React.FC<{kind: Kind; size: number; color: string; stroke?: number; p?: number}> = ({kind, size, color, stroke = 6, p = 1}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    {GLYPH[kind].map((d, k) => (
      <path key={k} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
);

// monograma com texto girando
const Monogram: React.FC<{at: number; ring: string}> = ({at, ring}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 14}});
  return (
    <div style={{width: 440, height: 440, position: 'relative', scale: String(0.6 + 0.4 * s), opacity: s}}>
      <svg width={440} height={440} viewBox="0 0 420 420" style={{position: 'absolute', rotate: `${frame * 1.1}deg`}}>
        <defs>
          <path id="ringA" d="M210,210 m-170,0 a170,170 0 1,1 340,0 a170,170 0 1,1 -340,0" />
        </defs>
        <text fill={CREAM} style={{fontFamily: sans, fontWeight: 700, fontSize: 29, letterSpacing: '0.2em'}}>
          <textPath href="#ringA">{ring}</textPath>
        </text>
      </svg>
      <div style={{position: 'absolute', inset: 80, filter: `drop-shadow(0 0 50px ${BLUE}aa)`}}>
        <Avatar size={280} ring={BLUE} />
      </div>
    </div>
  );
};

const NameReveal: React.FC<{at: number; color: string}> = ({at, color}) => {
  const frame = useCurrentFrame();
  const name = 'GABRIEL';
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', fontFamily: heavy, fontWeight: 900, fontSize: 170, color, letterSpacing: '-0.04em', lineHeight: 1}}>
        {name.split('').map((ch, k) => {
          const p = prog(frame, at - 4 + k * 1.6, 10);
          return (
            <span key={k} style={{display: 'inline-block', whiteSpace: 'pre', opacity: p, translate: `0px ${(1 - p) * 60}px`, filter: `blur(${(1 - p) * 10}px)`}}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{marginTop: 14, height: 6, width: 700 * prog(frame, at + 10, 18), background: BLUE_HI, borderRadius: 3}} />
    </div>
  );
};

const Sunburst: React.FC<{at: number; color: string}> = ({at, color}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 20);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.16 * p}}>
      <div
        style={{
          width: 2600,
          height: 2600,
          marginTop: -200,
          borderRadius: '50%',
          background: `repeating-conic-gradient(from ${frame * 0.6}deg, ${color} 0deg 7deg, transparent 7deg 22.5deg)`,
          WebkitMaskImage: 'radial-gradient(circle, black 10%, transparent 60%)',
          scale: String(0.6 + 0.4 * p),
        }}
      />
    </AbsoluteFill>
  );
};

// 1 · os 4 "capítulos" aparecendo
const ChapterIcons: React.FC<{ats: number[]}> = ({ats}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const kinds: Kind[] = ['cross', 'rings', 'shirt', 'house'];
  return (
    <div style={{display: 'flex', gap: 34}}>
      {kinds.map((k, n) => {
        const s = spring({frame: frame - ats[n], fps, config: {damping: 11, stiffness: 180}});
        return (
          <div key={k} style={{width: 180, height: 180, borderRadius: 44, background: n % 2 ? INK : BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: String(s), rotate: `${(1 - s) * (n % 2 ? 20 : -20)}deg`, boxShadow: '0 20px 40px rgba(0,0,0,0.18)'}}>
            <Glyph kind={k} size={104} color={CREAM} stroke={7} p={prog(frame, ats[n] + 2, 14)} />
          </div>
        );
      })}
    </div>
  );
};

// 2 · cruz de luz se desenhando
const DrawnCross: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 22);
  const glow = 0.6 + 0.4 * Math.sin(frame / 6);
  return (
    <svg width={460} height={620} viewBox="0 0 460 620" style={{overflow: 'visible', filter: `drop-shadow(0 0 ${30 * glow}px ${BLUE_HI})`}}>
      <path d="M230 20 V600" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} stroke={CREAM} strokeWidth={34} strokeLinecap="round" fill="none" />
      <path d="M70 200 H390" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(frame, at + 10, 18)} stroke={CREAM} strokeWidth={34} strokeLinecap="round" fill="none" />
    </svg>
  );
};

// 3 · blocos empilhando sobre a base "Nele"
const Foundation: React.FC<{at: number; neleAt: number}> = ({at, neleAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lit = prog(frame, neleAt, 12);
  const blocks = [
    {w: 520, x: 0},
    {w: 420, x: -30},
    {w: 320, x: 20},
    {w: 200, x: -10},
  ];
  return (
    <div style={{width: 900, height: 700, position: 'relative'}}>
      {blocks.map((b, k) => {
        const s = spring({frame: frame - (at + k * 6), fps, config: {damping: 12, stiffness: 170}});
        const y = 520 - (k + 1) * 104;
        return (
          <div key={k} style={{position: 'absolute', left: 450 - b.w / 2 + b.x, top: y - (1 - s) * 700, width: b.w, height: 92, borderRadius: 14, background: CREAM, opacity: frame < at + k * 6 ? 0 : 1, boxShadow: '0 14px 30px rgba(0,0,0,0.25)'}} />
        );
      })}
      <div style={{position: 'absolute', left: 90, top: 532, width: 720, height: 130, borderRadius: 18, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, boxShadow: `0 0 ${80 * lit}px ${CREAM}`}}>
        <Glyph kind="cross" size={80} color={lit > 0 ? BLUE_HI : CREAM} stroke={10} />
        <span style={{fontFamily: heavy, fontWeight: 900, fontSize: 64, color: CREAM, letterSpacing: '0.12em', opacity: 0.4 + 0.6 * lit}}>BASE</span>
      </div>
    </div>
  );
};

// 4 · caminho subindo até a luz
const PATH_UP = 'M 450 740 C 180 640, 720 520, 450 400 S 300 160, 450 40';
const PathUp: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 40);
  const len = getLength(PATH_UP);
  const pt = getPointAtLength(PATH_UP, len * p);
  const end = prog(frame, at + 34, 14);
  return (
    <svg width={900} height={780} viewBox="0 0 900 780" style={{overflow: 'visible'}}>
      <path d={PATH_UP} fill="none" stroke={INK} strokeOpacity={0.12} strokeWidth={14} strokeDasharray="2 26" strokeLinecap="round" />
      <path d={PATH_UP} fill="none" stroke={BLUE} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <circle cx={450} cy={40} r={70 * end} fill={BLUE} opacity={0.18} />
      <g transform="translate(410 0)" opacity={end}>
        <path d="M40 0 V80 M14 24 H66" stroke={BLUE} strokeWidth={10} strokeLinecap="round" />
      </g>
      <circle cx={pt.x} cy={pt.y} r={24} fill={INK} />
    </svg>
  );
};

// 5 · alianças se desenhando e entrelaçando
const Rings: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const a = prog(frame, at, 20);
  const b = prog(frame, at + 8, 20);
  const join = prog(frame, at + 12, 18);
  const spark = prog(frame, at + 26, 12);
  return (
    <svg width={700} height={560} viewBox="0 0 700 560" style={{overflow: 'visible', filter: `drop-shadow(0 0 30px ${CREAM}55)`}}>
      <circle cx={260 + 40 * (1 - join)} cy={300} r={170} fill="none" stroke={CREAM} strokeWidth={26} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} transform="rotate(-90 300 300)" />
      <circle cx={440 - 40 * (1 - join)} cy={300} r={170} fill="none" stroke={INK} strokeWidth={26} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - b} />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const ang = (k / 6) * Math.PI * 2;
        const r1 = 60 + 30 * spark;
        const r2 = r1 + 50 * spark;
        return <line key={k} x1={350 + Math.cos(ang) * r1} y1={70 + Math.sin(ang) * r1} x2={350 + Math.cos(ang) * r2} y2={70 + Math.sin(ang) * r2} stroke={CREAM} strokeWidth={8} strokeLinecap="round" opacity={spark * (1 - prog(frame, at + 40, 12))} />;
      })}
    </svg>
  );
};

// 6 · dois pontos se encontram e seguem juntos
const LifeLine: React.FC<{at: number; endAt: number}> = ({at, endAt}) => {
  const frame = useCurrentFrame();
  const meet = prog(frame, at, 18);
  const go = prog(frame, at + 14, Math.max(20, endAt - at));
  const inf = prog(frame, endAt + 4, 14);
  const x = 140 + 560 * go;
  const dot = (label: string, cx: number, bg: string) => (
    <div style={{position: 'absolute', left: cx - 70, top: 130, width: 140, height: 140, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: heavy, fontWeight: 900, fontSize: 64, color: CREAM, boxShadow: '0 16px 30px rgba(0,0,0,0.2)'}}>
      {label}
    </div>
  );
  return (
    <div style={{width: 900, height: 420, position: 'relative'}}>
      <div style={{position: 'absolute', left: 40, top: 198, width: 820, height: 4, background: INK, opacity: 0.12}} />
      <div style={{position: 'absolute', left: 140, top: 196, width: 560 * go, height: 8, borderRadius: 4, background: BLUE}} />
      {dot('G', x - 60 * (1 - 0) - 120 * (1 - meet) + 0, INK)}
      {dot('M', x + 60 + 120 * (1 - meet), BLUE)}
      <div style={{position: 'absolute', right: 30, top: 120, fontFamily: serif, fontSize: 180, color: BLUE, opacity: inf, scale: String(0.6 + 0.4 * inf)}}>∞</div>
    </div>
  );
};

// 7 · corações subindo
const HeartBurst: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(16).fill(0).map((_, k) => {
        const start = at + k * 3;
        const t = frame - start;
        if (t < 0) return null;
        const x = 80 + ((k * 137) % 920) + noise2D('hx', k, t / 40) * 60;
        const y = 1900 - t * (9 + (k % 4) * 2);
        const s = 0.6 + (k % 3) * 0.35;
        return (
          <svg key={k} width={90 * s} height={90 * s} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y, opacity: Math.min(1, t / 8) * 0.85, rotate: `${noise2D('hr', k, t / 30) * 20}deg`}}>
            <path d="M50 86 C20 64 6 44 20 28 C32 14 48 20 50 32 C52 20 68 14 80 28 C94 44 80 64 50 86 Z" fill={k % 2 ? BLUE_HI : CREAM} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

// 9 · lista numerada com check
const Checks: React.FC<{rows: {n: string; t: string; at: number}[]}> = ({rows}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{width: 900, display: 'flex', flexDirection: 'column'}}>
      <div style={{height: 3, background: INK, width: 900 * prog(frame, 0, 16)}} />
      {rows.map((r, k) => {
        const a = prog(frame, r.at - 2, 12);
        const c = prog(frame, r.at + 6, 10);
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 34, padding: '30px 0', borderBottom: `2px solid ${INK}30`, opacity: a, translate: `${(1 - a) * -60}px 0px`}}>
            <span style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: BLUE, letterSpacing: '0.1em'}}>{r.n}</span>
            <span style={{flex: 1, fontFamily: heavy, fontWeight: 900, fontSize: 92, color: INK, letterSpacing: '-0.03em'}}>{r.t}</span>
            <svg width={90} height={90} viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={44} fill={BLUE} opacity={c} />
              <path d="M28 52 L44 68 L74 36" fill="none" stroke={CREAM} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c} />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

// 10 · fachada da loja abrindo
const Storefront: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 13}});
  const aw = prog(frame, at + 6, 14);
  const swing = Math.sin((frame - at) / 7) * 8 * Math.max(0, 1 - (frame - at) / 60);
  const open = prog(frame, at + 16, 10);
  return (
    <div style={{width: 760, height: 780, position: 'relative', scale: String(0.7 + 0.3 * s), opacity: Math.min(1, s * 1.5)}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: 0, height: 110, borderRadius: 20, background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: heavy, fontWeight: 900, fontSize: 70, letterSpacing: '0.24em', color: INK}}>LOJA</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 130, height: 120 * aw, background: `repeating-linear-gradient(90deg, ${BLUE} 0 76px, ${CREAM} 76px 152px)`, borderRadius: '0 0 30px 30px', transformOrigin: 'top'}} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 250, bottom: 0, border: `10px solid ${CREAM}`, borderTop: 'none', borderRadius: '0 0 16px 16px', background: '#ffffff08'}}>
        <div style={{position: 'absolute', left: 220, top: 40, width: 4, height: 70, background: CREAM, opacity: 0.6}} />
        <div style={{position: 'absolute', left: 70, top: 100, rotate: `${swing}deg`, transformOrigin: '160px 0px'}}>
          <Glyph kind="shirt" size={320} color={BLUE_HI} stroke={7} />
        </div>
        <div style={{position: 'absolute', right: 40, bottom: 40, padding: '16px 30px', borderRadius: 12, background: open > 0.5 ? BLUE : CREAM, fontFamily: heavy, fontWeight: 900, fontSize: 40, color: open > 0.5 ? CREAM : INK, rotate: `${-6 + 12 * open}deg`}}>{open > 0.5 ? 'ABERTO' : 'FECHADO'}</div>
      </div>
    </div>
  );
};

// 11 · barra "só o começo"
const JustStarted: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 16);
  const pulse = 1 + 0.08 * Math.sin(frame / 4);
  return (
    <div style={{width: 900, display: 'flex', flexDirection: 'column', gap: 24}}>
      <div style={{position: 'relative', height: 44, borderRadius: 22, background: `${CREAM}33`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 900 * 0.1 * p, borderRadius: 22, background: CREAM}} />
        <div style={{position: 'absolute', left: 90 * p - 24, top: -14, width: 72, height: 72, borderRadius: '50%', background: INK, border: `8px solid ${CREAM}`, scale: String(pulse * p)}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: sans, fontWeight: 700, fontSize: 34, color: CREAM, letterSpacing: '0.12em', opacity: p}}>
        <span>VOCÊ ESTÁ AQUI</span>
        <span style={{opacity: 0.6}}>→ MUITO MAIS</span>
      </div>
    </div>
  );
};

// 12 · capítulo 01 vira capítulo 02
const BookFlip: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const f = prog(frame, at, 18);
  const face = (title: string, sub: string, front: boolean): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    borderRadius: 24,
    background: front ? INK : BLUE,
    backfaceVisibility: 'hidden',
    transform: front ? undefined : 'rotateY(180deg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
  });
  return (
    <div style={{width: 720, height: 900, perspective: 2400}}>
      <div style={{position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateY(${-180 * f}deg)`}}>
        <div style={face('', '', true)}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 40, letterSpacing: '0.3em', color: CREAM, opacity: 0.7}}>CAPÍTULO</span>
          <span style={{fontFamily: heavy, fontWeight: 900, fontSize: 360, color: CREAM, lineHeight: 1}}>01</span>
          <span style={{fontFamily: serif, fontSize: 80, color: BLUE_HI}}>empresário</span>
        </div>
        <div style={face('', '', false)}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 40, letterSpacing: '0.3em', color: CREAM, opacity: 0.8}}>CAPÍTULO</span>
          <span style={{fontFamily: heavy, fontWeight: 900, fontSize: 360, color: CREAM, lineHeight: 1}}>02</span>
          <span style={{fontFamily: serif, fontSize: 80, color: INK}}>novo começo</span>
        </div>
      </div>
    </div>
  );
};

// 14 · casa se desenhando e a família entrando
const FamilyHome: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const d = prog(frame, at - 10, 24);
  const people = [
    {r: 46, dx: 0},
    {r: 46, dx: 110},
    {r: 30, dx: 210},
  ];
  const walk = prog(frame, at + 10, 40);
  const light = prog(frame, at + 44, 10);
  return (
    <div style={{width: 900, height: 900, position: 'relative'}}>
      <svg width={900} height={900} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <rect x={30} y={44} width={12} height={10} fill={BLUE} opacity={light} />
        <rect x={58} y={44} width={12} height={10} fill={BLUE} opacity={light} />
        {GLYPH.house.map((p, k) => (
          <path key={k} d={p} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      {people.map((pp, k) => {
        const x = -260 + pp.dx + (450 - -260 - 120) * walk;
        const inDoor = prog(frame, at + 40 + k * 3, 8);
        return (
          <div key={k} style={{position: 'absolute', left: x, top: 790 - pp.r * 2, width: pp.r * 2, height: pp.r * 2 + 40, opacity: 1 - inDoor, translate: `0px ${Math.abs(Math.sin((frame + k * 5) / 3)) * -10}px`}}>
            <div style={{width: pp.r * 1.1, height: pp.r * 1.1, borderRadius: '50%', background: BLUE, margin: '0 auto'}} />
            <div style={{width: pp.r * 1.6, height: pp.r * 1.4, borderRadius: `${pp.r}px ${pp.r}px 10px 10px`, background: BLUE, margin: '6px auto 0'}} />
          </div>
        );
      })}
    </div>
  );
};

// 15 · pino caindo no mapa
const PinDrop: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 9, stiffness: 200}});
  const rip = (frame - at) / 26;
  return (
    <div style={{width: 900, height: 480, position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 30, backgroundImage: `linear-gradient(${CREAM}22 2px, transparent 2px), linear-gradient(90deg, ${CREAM}22 2px, transparent 2px)`, backgroundSize: '90px 90px', transform: 'perspective(900px) rotateX(48deg)', transformOrigin: 'bottom'}} />
      {[0, 1].map((k) => {
        const r = ((rip + k * 0.5) % 1) * (frame >= at ? 1 : 0);
        return <div key={k} style={{position: 'absolute', left: 450 - 160 * r, top: 400 - 50 * r, width: 320 * r, height: 100 * r, borderRadius: '50%', border: `5px solid ${CREAM}`, opacity: 1 - r}} />;
      })}
      <svg width={200} height={260} viewBox="0 0 100 130" style={{position: 'absolute', left: 350, top: 400 - 260 - (1 - s) * 500, opacity: frame < at ? 0 : 1, filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.35))'}}>
        <path d="M50 126 C50 126 8 74 8 46 A42 42 0 1 1 92 46 C92 74 50 126 50 126 Z" fill={CREAM} />
        <g transform="translate(26 22) scale(0.48)">
          <path d="M10 50 L50 14 L90 50 M22 46 V88 H78 V46" fill="none" stroke={BLUE} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

// 16 · celular com o feed se preenchendo
const PhoneGrid: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 14}});
  const kinds: Kind[] = ['cross', 'house', 'rings', 'shirt', 'cross', 'house', 'rings', 'shirt', 'house'];
  return (
    <div style={{width: 560, height: 1000, borderRadius: 70, border: `12px solid ${CREAM}`, background: '#ffffff0a', padding: 34, translate: `0px ${(1 - s) * 400}px`, opacity: s}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 20}}>
        <Avatar size={100} ring={BLUE} />
        <div style={{fontFamily: sans, fontWeight: 700, fontSize: 28, color: CREAM}}>@gabriel_gil_rodrigues</div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 40}}>
        {kinds.map((k, n) => {
          const t = spring({frame: frame - (at + 10 + n * 3), fps, config: {damping: 12}});
          return (
            <div key={n} style={{aspectRatio: '4 / 5', borderRadius: 10, background: n % 3 === 1 ? CREAM : n % 2 ? BLUE : '#ffffff22', display: 'flex', alignItems: 'center', justifyContent: 'center', scale: String(t)}}>
              <Glyph kind={k} size={70} color={n % 3 === 1 ? BLUE : CREAM} stroke={8} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 17 · as categorias empilhando
const CategoryStack: React.FC<{items: {t: string; kind: Kind; at: number}[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      {items.map((it, n) => {
        const s = spring({frame: frame - it.at, fps, config: {damping: 11, stiffness: 190}});
        const dark = n % 2 === 1;
        return (
          <div key={n} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '26px 56px 26px 34px', borderRadius: 999, background: dark ? INK : BLUE, scale: String(0.4 + 0.6 * s), opacity: frame < it.at ? 0 : 1, rotate: `${(1 - s) * (n % 2 ? 8 : -8)}deg`, boxShadow: '0 18px 36px rgba(0,0,0,0.2)'}}>
            <div style={{width: 120, height: 120, borderRadius: '50%', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Glyph kind={it.kind} size={74} color={dark ? INK : BLUE} stroke={9} />
            </div>
            <span style={{fontFamily: heavy, fontWeight: 900, fontSize: 104, color: CREAM, letterSpacing: '-0.03em'}}>{it.t}</span>
          </div>
        );
      })}
    </div>
  );
};

// 18 · cartão do perfil com o botão "Seguir" sendo tocado
const FollowTap: React.FC<{at: number; tapAt: number}> = ({at, tapAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 14}});
  const cur = prog(frame, tapAt - 20, 18);
  const tapped = frame >= tapAt;
  const press = frame >= tapAt && frame < tapAt + 6 ? 0.92 : 1;
  const burst = prog(frame, tapAt, 14);
  return (
    <div style={{width: 860, padding: 50, borderRadius: 44, background: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', translate: `0px ${(1 - s) * 300}px`, opacity: s, boxShadow: '0 40px 80px rgba(0,0,0,0.3)', position: 'relative'}}>
      <Avatar size={220} ring={BLUE} />
      <div style={{marginTop: 30, fontFamily: heavy, fontWeight: 900, fontSize: 72, color: INK, letterSpacing: '-0.03em'}}>Gabriel</div>
      <div style={{fontFamily: sans, fontWeight: 600, fontSize: 34, color: INK, opacity: 0.6}}>@gabriel_gil_rodrigues</div>
      <div style={{marginTop: 40, position: 'relative'}}>
        <div style={{fontFamily: heavy, fontWeight: 900, fontSize: 56, color: tapped ? INK : CREAM, background: tapped ? CREAM_DK : BLUE, borderRadius: 22, padding: '26px 120px', scale: String(press), whiteSpace: 'nowrap'}}>{tapped ? 'Seguindo ✓' : 'Seguir'}</div>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
          const ang = (k / 8) * Math.PI * 2;
          return <div key={k} style={{position: 'absolute', left: '50%', top: '50%', width: 16, height: 16, borderRadius: '50%', background: BLUE, translate: `${Math.cos(ang) * 260 * burst - 8}px ${Math.sin(ang) * 110 * burst - 8}px`, opacity: burst * (1 - burst)}} />;
        })}
        <svg width={90} height={110} viewBox="0 0 24 30" style={{position: 'absolute', left: 300 + (1 - cur) * 300, top: 60 + (1 - cur) * 260, opacity: cur * (1 - prog(frame, tapAt + 20, 10)), filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))'}}>
          <path d="M3 2 L3 24 L9 18 L13 27 L17 25 L13 16 L21 16 Z" fill={INK} stroke={CREAM} strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

// 19 · final
const Finale: React.FC<{dur: number; prazerAt: number; euAt: number; nameAt: number}> = ({dur, prazerAt, euAt, nameAt}) => {
  const eu = prog(useCurrentFrame(), euAt - 2, 12);
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [dur - 22, dur], [0, 1], clamp);
  const push = interpolate(frame, [0, dur], [1, 1.07]);
  const tag = prog(frame, nameAt + 18, 16);
  return (
    <AbsoluteFill>
      <Bg mode="ink" />
      <Sunburst at={0} color={BLUE_HI} />
      <AbsoluteFill style={{scale: String(push)}}>
        <At top={330}>
          <Monogram at={0} ring="FÉ • CASAMENTO • NEGÓCIOS • IMÓVEIS • " />
        </At>
        <At top={830}>
          <div style={{fontFamily: serif, fontSize: 170, color: BLUE_HI, opacity: prog(frame, prazerAt - 2, 16), translate: `0px ${(1 - prog(frame, prazerAt - 2, 16)) * 40}px`}}>Prazer…</div>
        </At>
        <At top={1030}>
          <div style={{fontFamily: sans, fontWeight: 600, fontSize: 60, color: CREAM, opacity: 0.7 * eu, translate: `0px ${(1 - eu) * 30}px`, filter: `blur(${(1 - eu) * 8}px)`}}>eu sou o</div>
        </At>
        <At top={1120}>
          <NameReveal at={nameAt} color={CREAM} />
        </At>
        <At top={1380}>
          <div style={{fontFamily: sans, fontWeight: 700, fontSize: 40, letterSpacing: '0.08em', color: CREAM, opacity: tag * 0.8, translate: `0px ${(1 - tag) * 30}px`}}>@gabriel_gil_rodrigues</div>
        </At>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};
