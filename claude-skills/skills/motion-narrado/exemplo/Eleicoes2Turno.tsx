import React from 'react';
import {Audio} from '@remotion/media';
import {noise2D} from '@remotion/noise';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import wordsJson from '../../public/audio/eleicoes.words.json';
import {Grain} from '../lib/Background';
import {KineticText, SceneShell} from '../lib/Kinetic';
import {heavy, sans, serif} from '../lib/fonts';
import {scenesFromWords, Word, wordFrame} from '../lib/timing';

// Estilo Editorial (opinião/documentário) · par Wine Red + Light Sand.
// Assinatura: cortes secos alternando bloco de cor (vinho / areia / tinta) + carimbos.
const words = wordsJson as Word[];

const WINE = '#7F011F';
const WINE_HI = '#C2122F'; // vinho aceso para fundo escuro
const SAND = '#F5EBD0';
const SAND_DK = '#D9C9A3';
const INK = '#170408';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const prog = (frame: number, at: number, dur = 14) => interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: ease});

// Índice da 1ª palavra de cada cena
const SCENE_STARTS = [0, 7, 20, 30, 38, 46, 60, 70, 78, 86, 95, 103, 110, 127, 147, 158, 165, 171];

export const eleicoesDuration = (fps: number) => Math.ceil(((words[words.length - 1].endMs + 3200) / 1000) * fps);

type Mode = 'wine' | 'sand' | 'ink';

// ---------- fundos ----------
const Bg: React.FC<{mode: Mode}> = ({mode}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (mode === 'sand') {
    return (
      <AbsoluteFill style={{backgroundColor: SAND}}>
        {/* grade editorial de colunas, quase invisível */}
        {[1, 2, 3].map((k) => (
          <div key={k} style={{position: 'absolute', left: k * 270, top: 0, bottom: 0, width: 1, background: INK, opacity: 0.06}} />
        ))}
        <AbsoluteFill style={{background: `radial-gradient(ellipse at ${50 + Math.sin(t * 0.5) * 10}% 40%, transparent 40%, ${SAND_DK} 110%)`}} />
      </AbsoluteFill>
    );
  }
  const base = mode === 'wine' ? WINE : INK;
  const glow = mode === 'wine' ? '#B0182F' : WINE;
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
          opacity: mode === 'wine' ? 0.7 : 0.55,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// Cabeçalho de jornal + barra de progresso (fica em todas as cenas)
const Chrome: React.FC<{mode: Mode; from: number; total: number}> = ({mode, from, total}) => {
  const frame = useCurrentFrame();
  const color = mode === 'sand' ? INK : SAND;
  const label: React.CSSProperties = {fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: '0.32em', color, opacity: 0.75};
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 92, left: 64, right: 64, display: 'flex', justifyContent: 'space-between'}}>
        <span style={label}>ELEIÇÕES 2026</span>
        <span style={label}>2º TURNO</span>
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
          background: mode === 'wine' ? SAND : mode === 'sand' ? WINE : WINE_HI,
        }}
      />
    </AbsoluteFill>
  );
};

// Tremida de impacto (decai em ~10 quadros)
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

// Flash curto no começo da cena (corte seco com "estalo")
const Flash: React.FC<{color?: string}> = ({color = SAND}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5], [0.85, 0], clamp);
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

// Carimbo que bate na tela
const Stamp: React.FC<{
  at: number;
  text: string;
  size: number;
  rotate: number;
  color: string;
  fill?: string;
  style?: React.CSSProperties;
}> = ({at, text, size, rotate, color, fill = 'transparent', style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 13, mass: 0.55, stiffness: 220}});
  const id = `rough-${text.replace(/\W/g, '')}`;
  if (frame < at) return null;
  return (
    <div style={{position: 'absolute', ...style}}>
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
          boxShadow: fill === 'transparent' ? undefined : '0 30px 80px rgba(0,0,0,0.45)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Palavra dentro de pílula (entra com pulo)
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
      }}
    >
      {text}
    </div>
  );
};

// Linha que se desenha (régua editorial)
const Rule: React.FC<{at: number; width: number; color: string; top: number}> = ({at, width, color, top}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 18);
  return <div style={{position: 'absolute', top, left: (1080 - width) / 2, width: width * p, height: 3, background: color}} />;
};

// Cruz desenhada por traço
const DrawnCross: React.FC<{at: number; size: number; color: string; glow?: boolean}> = ({at, size, color, glow}) => {
  const frame = useCurrentFrame();
  const v = prog(frame, at, 22);
  const h = prog(frame, at + 12, 18);
  const w = size * 0.6;
  return (
    <svg width={w} height={size} style={{overflow: 'visible', filter: glow ? `drop-shadow(0 0 30px ${color})` : undefined}}>
      <line x1={w / 2} y1={0} x2={w / 2} y2={size * v} stroke={color} strokeWidth={size * 0.07} strokeLinecap="round" />
      <line x1={w / 2 - (w / 2) * h} y1={size * 0.3} x2={w / 2 + (w / 2) * h} y2={size * 0.3} stroke={color} strokeWidth={size * 0.07} strokeLinecap="round" />
    </svg>
  );
};

// Quadro antigo em tela cheia (Ken Burns + grade vinho)
const Painting: React.FC<{dark?: boolean; panFrom: number; panTo: number; zoom: [number, number]; dur: number}> = ({dark, panFrom, panTo, zoom, dur}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: INK}}>
      <Img
        src={staticFile('eleicoes/bastilha.jpg')}
        style={{
          position: 'absolute',
          height: 1920,
          width: 2435,
          left: -panFrom - (panTo - panFrom) * p,
          top: 0,
          scale: String(zoom[0] + (zoom[1] - zoom[0]) * p),
          filter: dark
            ? 'grayscale(1) contrast(1.25) brightness(0.45)'
            : 'sepia(0.55) contrast(1.12) brightness(0.72) saturate(0.85)',
        }}
      />
      <AbsoluteFill style={{background: WINE, mixBlendMode: 'multiply', opacity: dark ? 0.75 : 0.4}} />
      <AbsoluteFill
        style={{background: `linear-gradient(180deg, ${INK}ee 0%, transparent 28%, transparent 55%, ${INK}f2 100%)`}}
      />
    </AbsoluteFill>
  );
};

// Cena com fundo + cabeçalho; o conteúdo entra com o SceneShell
const Scene: React.FC<{
  seq: {from: number; durationInFrames: number};
  total: number;
  mode: Mode;
  name: string;
  flash?: boolean;
  children: React.ReactNode;
}> = ({seq, total, mode, name, flash, children}) => (
  <Sequence {...seq} name={name}>
    <Bg mode={mode} />
    <SceneShell durationInFrames={seq.durationInFrames}>{children}</SceneShell>
    <Chrome mode={mode} from={seq.from} total={total} />
    {flash ? <Flash color={mode === 'sand' ? WINE : SAND} /> : null}
  </Sequence>
);

// ==========================================================
export const Eleicoes2Turno: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const sc = scenesFromWords(words, SCENE_STARTS, fps, durationInFrames);
  const rel = (i: number, k: number) => wordFrame(words, i, fps) - sc[k].from;

  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      {/* 0 · O Brasil vai ter um segundo turno */}
      <Scene seq={sc[0]} total={durationInFrames} mode="wine" name="0 · 2º turno">
        <Hook rel={(i) => rel(i, 0)} />
      </Scene>

      {/* 1 · A Bíblia nos ensina que devemos nos posicionar, e isso inclui a política */}
      <Scene seq={sc[1]} total={durationInFrames} mode="sand" name="1 · Posicionar" flash>
        <div style={{position: 'absolute', top: 330}}>
          <OpenBook at={0} />
        </div>
        <KineticText
          words={words}
          sceneFrom={sc[1].from}
          accentColor={WINE}
          color={INK}
          shadow={false}
          style={{marginTop: 260}}
          lines={[
            {size: 62, tokens: [{i: 7}, {i: 8, weight: 800}, {i: 9}, {i: 10}]},
            {size: 62, tokens: [{i: 11, dim: true}, {i: 12}, {i: 13, dim: true}]},
            {size: 176, tokens: [{i: 14, text: 'posicionar', serif: true, accent: true, pop: true}]},
            {size: 52, tokens: [{i: 15, dim: true}, {i: 16, dim: true}, {i: 17}, {i: 18, dim: true}]},
          ]}
        />
        <div style={{position: 'absolute', top: 1390}}>
          <PillWord at={rel(19, 1)} text="política." size={110} bg={WINE} color={SAND} />
        </div>
      </Scene>

      {/* 2 · cenário político muito caótico */}
      <Scene seq={sc[2]} total={durationInFrames} mode="ink" name="2 · Caótico" flash>
        <ChaosField at={rel(29, 2)} />
        <KineticText
          words={words}
          sceneFrom={sc[2].from}
          accentColor={WINE_HI}
          style={{marginTop: -260}}
          lines={[
            {size: 60, tokens: [{i: 20, dim: true}, {i: 21, weight: 800}, {i: 22, dim: true}, {i: 23, dim: true}]},
            {size: 60, tokens: [{i: 24, dim: true}, {i: 25, dim: true}, {i: 26}, {i: 27, serif: true, accent: true, scale: 1.3}]},
            {size: 60, tokens: [{i: 28, dim: true}]},
          ]}
        />
        <div style={{position: 'absolute', top: 1040}}>
          <ChaosWord at={rel(29, 2)} />
        </div>
      </Scene>

      {/* 3 · ou você escolhe a esquerda ou a direita */}
      <Sequence {...sc[3]} name="3 · Esquerda ou direita">
        <SplitChoice leftAt={rel(32, 3)} rightAt={rel(37, 3)} ouAt={rel(35, 3)} dur={sc[3].durationInFrames} />
        <Chrome mode="ink" from={sc[3].from} total={durationInFrames} />
      </Sequence>

      {/* 4 · ou uma opção ruim, ou uma ainda pior */}
      <Scene seq={sc[4]} total={durationInFrames} mode="sand" name="4 · Ruim ou pior" flash>
        <BadCards ruimAt={rel(41, 4)} piorAt={rel(45, 4)} rel={(i) => rel(i, 4)} />
      </Scene>

      {/* 5 · cristão atento, nenhum dos lados é o ideal */}
      <Scene seq={sc[5]} total={durationInFrames} mode="ink" name="5 · Nenhum é ideal">
        <div style={{position: 'absolute', top: 300}}>
          <DrawnCross at={rel(50, 5) - 4} size={420} color={SAND} glow />
        </div>
        <KineticText
          words={words}
          sceneFrom={sc[5].from}
          accentColor={WINE_HI}
          style={{marginTop: 520}}
          lines={[
            {size: 58, tokens: [{i: 46, dim: true}, {i: 47, dim: true}, {i: 48, dim: true}, {i: 49, dim: true}, {i: 50, serif: true, scale: 1.35}, {i: 51, weight: 800}]},
            {size: 58, tokens: [{i: 52, dim: true}, {i: 53, dim: true}, {i: 54, heavy: true, text: 'NENHUM', accent: true}, {i: 55, dim: true}, {i: 56, dim: true}]},
            {size: 150, tokens: [{i: 57, serif: true}, {i: 58, serif: true}, {i: 59, text: 'ideal.', serif: true}]},
          ]}
        />
        <StrikeLine at={rel(59, 5) + 12} top={1335} width={620} color={WINE_HI} />
      </Scene>

      {/* 6 · Porém, tem sim um lado que o cristão NÃO VOTA */}
      <Sequence {...sc[6]} name="6 · Não vota">
        <Bg mode="wine" />
        <ShakeWrap ats={[rel(68, 6) + 4]}>
          <SceneShell durationInFrames={sc[6].durationInFrames}>
            <KineticText
              words={words}
              sceneFrom={sc[6].from}
              accentColor={SAND}
              style={{marginTop: -420}}
              lines={[
                {size: 150, tokens: [{i: 60, text: 'Porém,', serif: true, pop: true}]},
                {size: 60, tokens: [{i: 61}, {i: 62, weight: 800}, {i: 63}, {i: 64, weight: 800}]},
                {size: 60, tokens: [{i: 65, dim: true}, {i: 66, dim: true}, {i: 67, serif: true, scale: 1.35}]},
              ]}
            />
            <Stamp at={rel(68, 6)} text="NÃO VOTA" size={138} rotate={-7} color={SAND} style={{top: 1060}} />
          </SceneShell>
        </ShakeWrap>
        <Chrome mode="wine" from={sc[6].from} total={durationInFrames} />
        <Flash />
      </Sequence>

      {/* 7 · Em meados de 1790, ocorre a Revolução Francesa */}
      <Sequence {...sc[7]} name="7 · 1790">
        <Rewind sceneDur={sc[7].durationInFrames} startAt={rel(70, 7)} landAt={rel(73, 7)} revAt={rel(76, 7)} fraAt={rel(77, 7)} />
        <Chrome mode="ink" from={sc[7].from} total={durationInFrames} />
        <Flash color={WINE} />
      </Sequence>

      {/* 8 · onde surge essa ideia de esquerda e direita (Assembleia) */}
      <Scene seq={sc[8]} total={durationInFrames} mode="sand" name="8 · Assembleia" flash>
        <KineticText
          words={words}
          sceneFrom={sc[8].from}
          accentColor={WINE}
          color={INK}
          shadow={false}
          style={{position: 'absolute', top: 260}}
          lines={[
            {size: 56, tokens: [{i: 78, dim: true}, {i: 79}, {i: 80, dim: true}, {i: 81, weight: 800}, {i: 82, dim: true}]},
            {size: 132, tokens: [{i: 83, serif: true, accent: true}, {i: 84, dim: true, scale: 0.5}, {i: 85, heavy: true, text: 'direita'}]},
          ]}
        />
        <Hemicycle leftAt={rel(83, 8)} rightAt={rel(85, 8)} />
      </Scene>

      {/* 9 · A esquerda vem com uma ideia de estado revolucionário */}
      <Scene seq={sc[9]} total={durationInFrames} mode="ink" name="9 · Estado revolucionário" flash>
        <Sunburst at={rel(93, 9)} />
        <KineticText
          words={words}
          sceneFrom={sc[9].from}
          accentColor={WINE_HI}
          lines={[
            {size: 60, tokens: [{i: 86, dim: true}, {i: 87, weight: 800}, {i: 88, dim: true}, {i: 89, dim: true}]},
            {size: 60, tokens: [{i: 90, dim: true}, {i: 91}, {i: 92, dim: true}]},
            {size: 200, tokens: [{i: 93, text: 'ESTADO', heavy: true, pop: true}]},
            {size: 112, tokens: [{i: 94, serif: true, accent: true}]},
          ]}
        />
      </Scene>

      {/* 10 · e nessa revolução o cristianismo não se encaixava */}
      <Sequence {...sc[10]} name="10 · Não se encaixava">
        <Bg mode="ink" />
        <ShakeWrap ats={[rel(100, 10) + 6, rel(102, 10) + 2]}>
          <SceneShell durationInFrames={sc[10].durationInFrames}>
            <MisFit dropAt={rel(98, 10)} hitAt={rel(100, 10) + 6} rejectAt={rel(102, 10) + 2} />
            <KineticText
              words={words}
              sceneFrom={sc[10].from}
              accentColor={WINE_HI}
              style={{position: 'absolute', top: 1180}}
              lines={[
                {size: 54, tokens: [{i: 95, dim: true}, {i: 96, dim: true}, {i: 97, text: 'revolução,', dim: true}]},
                {size: 124, tokens: [{i: 98, serif: true}, {i: 99, serif: true}]},
                {size: 92, tokens: [{i: 100, heavy: true, accent: true}, {i: 101, heavy: true, accent: true}, {i: 102, text: 'encaixava.', heavy: true, accent: true}]},
              ]}
            />
          </SceneShell>
        </ShakeWrap>
        <Chrome mode="ink" from={sc[10].from} total={durationInFrames} />
      </Sequence>

      {/* 11 · Igrejas fechadas, cristãos sendo perseguidos e exilados */}
      <Sequence {...sc[11]} name="11 · Perseguição">
        <Painting dark panFrom={1300} panTo={1100} zoom={[1.15, 1.35]} dur={sc[11].durationInFrames} />
        <ShakeWrap ats={[rel(103, 11) + 2, rel(107, 11) + 2, rel(109, 11) + 2]}>
          <AbsoluteFill style={{alignItems: 'center'}}>
            <Stamp at={rel(103, 11)} text="IGREJAS FECHADAS" size={92} rotate={-6} color={SAND} fill={WINE} style={{top: 470}} />
            <Stamp at={rel(107, 11)} text="CRISTÃOS PERSEGUIDOS" size={78} rotate={4} color={SAND} fill={WINE} style={{top: 820}} />
            <Stamp at={rel(109, 11)} text="EXILADOS" size={140} rotate={-3} color={SAND} fill={WINE} style={{top: 1170}} />
          </AbsoluteFill>
        </ShakeWrap>
        <Grain opacity={0.12} />
        <Chrome mode="ink" from={sc[11].from} total={durationInFrames} />
        <Flash />
      </Sequence>

      {/* 12 · esquerda e Cristo não andam juntos */}
      <Scene seq={sc[12]} total={durationInFrames} mode="sand" name="12 · Esquerda ≠ Cristo" flash>
        <NotEqual rel={(i) => rel(i, 12)} sceneFrom={sc[12].from} />
      </Scene>

      {/* 13 · a esquerda dos dias de hoje apoia: lista */}
      <Scene seq={sc[13]} total={durationInFrames} mode="ink" name="13 · Lista">
        <Ledger rel={(i) => rel(i, 13)} sceneFrom={sc[13].from} />
      </Scene>

      {/* 14 · pequenos furtos, deturpações dos princípios e valores */}
      <Scene seq={sc[14]} total={durationInFrames} mode="wine" name="14 · Deturpações" flash>
        <Distorted rel={(i) => rel(i, 14)} sceneFrom={sc[14].from} />
      </Scene>

      {/* 15 · Não quero te dizer em quem votar */}
      <Scene seq={sc[15]} total={durationInFrames} mode="sand" name="15 · Em quem votar" flash>
        <BallotCard at={rel(158, 15)} />
        <KineticText
          words={words}
          sceneFrom={sc[15].from}
          accentColor={WINE}
          color={INK}
          shadow={false}
          style={{position: 'absolute', top: 1130}}
          lines={[
            {size: 66, tokens: [{i: 158, weight: 800}, {i: 159}, {i: 160, dim: true}, {i: 161}]},
            {size: 66, tokens: [{i: 162, dim: true}, {i: 163}]},
            {size: 190, tokens: [{i: 164, text: 'votar.', serif: true, accent: true, pop: true}]},
          ]}
        />
      </Scene>

      {/* 16 · Mas, se você vota na esquerda, */}
      <Scene seq={sc[16]} total={durationInFrames} mode="ink" name="16 · Se você vota">
        <KineticText
          words={words}
          sceneFrom={sc[16].from}
          accentColor={WINE_HI}
          lines={[
            {size: 160, tokens: [{i: 165, text: 'Mas,', serif: true}]},
            {size: 70, tokens: [{i: 166, dim: true}, {i: 167}, {i: 168, weight: 800}, {i: 169, dim: true}]},
            {size: 140, tokens: [{i: 170, text: 'ESQUERDA,', heavy: true, accent: true, pop: true}]},
          ]}
        />
      </Scene>

      {/* 17 · cristão você não é. */}
      <Sequence {...sc[17]} name="17 · Final">
        <Finale rel={(i) => rel(i, 17)} dur={sc[17].durationInFrames} sceneFrom={sc[17].from} />
        <Chrome mode="ink" from={sc[17].from} total={durationInFrames} />
        <Flash color={WINE_HI} />
      </Sequence>

      <Grain opacity={0.08} />

      {/* ---------- áudio ---------- */}
      <Audio src={staticFile('audio/eleicoes.mp3')} />
      <Audio
        src={staticFile('music/dramatic-cinematic-documentary.mp3')}
        trimBefore={16 * fps}
        volume={(f) =>
          interpolate(
            f,
            [0, 15, sc[7].from, sc[7].from + 20, durationInFrames - 100, durationInFrames - 70, durationInFrames - 1],
            [0, 0.16, 0.16, 0.2, 0.2, 0.32, 0],
            clamp,
          )
        }
      />
      {[2, 4, 8, 9, 12, 13, 14, 15, 16].map((k) => (
        <Sequence key={k} from={Math.max(0, sc[k].from - 4)} durationInFrames={20}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />
        </Sequence>
      ))}
      <Sequence from={sc[7].from} durationInFrames={30}>
        <Audio src={staticFile('sfx/whip.wav')} volume={0.4} />
      </Sequence>
      {[
        sc[6].from + rel(68, 6),
        sc[10].from + rel(100, 10) + 6,
        sc[11].from + rel(103, 11),
        sc[11].from + rel(107, 11),
        sc[11].from + rel(109, 11),
        sc[17].from,
      ].map((at, k) => (
        <Sequence key={`t${k}`} from={at} durationInFrames={25}>
          <Audio src={staticFile('sfx/thump.wav')} volume={0.7} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ==================== componentes das cenas ====================

const ShakeWrap: React.FC<{ats: number[]; children: React.ReactNode}> = ({ats, children}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{translate: shakeAt(frame, ats)}}>{children}</AbsoluteFill>;
};

// 0 · gancho: "1º" vira "2º" quando ele fala "segundo"
const Hook: React.FC<{rel: (i: number) => number}> = ({rel}) => {
  const frame = useCurrentFrame();
  const flip = prog(frame, rel(5) - 2, 10);
  const turno = prog(frame, rel(6) - 2, 14);
  const punch = interpolate(frame, [0, 8], [1.25, 1], {...clamp, easing: ease});
  const num: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    fontFamily: heavy,
    fontWeight: 900,
    fontSize: 560,
    lineHeight: '600px',
    letterSpacing: '-0.06em',
    textAlign: 'center',
    color: SAND,
  };
  return (
    <AbsoluteFill style={{alignItems: 'center', scale: String(punch)}}>
      <div style={{position: 'absolute', top: 360, display: 'flex', gap: 18}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const p = prog(frame, rel(i) - 2, 12);
          return (
            <span key={i} style={{fontFamily: sans, fontWeight: i === 1 ? 800 : 500, fontSize: 64, color: SAND, opacity: p, translate: `0 ${(1 - p) * 30}px`}}>
              {words[i].text}
            </span>
          );
        })}
      </div>
      <Rule at={4} width={760} color={SAND} top={480} />
      <div style={{position: 'absolute', top: 520, width: 1080, height: 600, overflow: 'hidden'}}>
        <div style={{...num, translate: `0 ${-flip * 600}px`, opacity: 0.35 + 0.65 * (1 - flip)}}>1º</div>
        <div style={{...num, translate: `0 ${(1 - flip) * 600}px`, textShadow: `0 20px 80px rgba(0,0,0,0.35)`}}>2º</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1110,
          fontFamily: serif,
          fontSize: 260,
          color: SAND,
          opacity: turno,
          letterSpacing: `${(1 - turno) * 0.3}em`,
          filter: `blur(${(1 - turno) * 14}px)`,
        }}
      >
        turno.
      </div>
    </AbsoluteFill>
  );
};

// 1 · Bíblia aberta em traço
const OpenBook: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 30);
  const len = 1400;
  return (
    <svg width={460} height={260} viewBox="0 0 460 260" style={{overflow: 'visible'}}>
      {['M230 40 C 170 10, 80 10, 20 30 L 20 230 C 80 210, 170 210, 230 240 Z', 'M230 40 C 290 10, 380 10, 440 30 L 440 230 C 380 210, 290 210, 230 240 Z'].map((d, k) => (
        <path key={k} d={d} fill="none" stroke={WINE} strokeWidth={8} strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={(1 - p) * len} />
      ))}
      <line x1={230} y1={40} x2={230} y2={240 * p + 40 * (1 - p)} stroke={WINE} strokeWidth={8} />
      {[70, 110, 150].map((y, k) => {
        const q = prog(frame, at + 16 + k * 4, 14);
        return (
          <g key={y} stroke={WINE} strokeWidth={5} strokeLinecap="round" opacity={0.6}>
            <line x1={55} y1={y} x2={55 + 130 * q} y2={y - 6} />
            <line x1={275} y1={y - 6} x2={275 + 130 * q} y2={y} />
          </g>
        );
      })}
    </svg>
  );
};

// 2 · campo de traços desordenados (fica mais caótico na palavra)
const ChaosField: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const amp = interpolate(frame, [at - 10, at + 6], [0.25, 1], clamp);
  return (
    <AbsoluteFill>
      {Array.from({length: 46}).map((_, k) => {
        const x = (k * 197) % 1080;
        const y = 180 + ((k * 331) % 1600);
        const r = noise2D('r', k, frame * 0.02 * (1 + amp * 3)) * 180 * amp;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 60 + (k % 5) * 30,
              height: 4,
              background: k % 4 === 0 ? WINE_HI : SAND,
              opacity: 0.18 + 0.2 * amp,
              rotate: `${r}deg`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ChaosWord: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at - 2, 10);
  const j = (s: string) => noise2D(s, frame * 0.6, 0) * 14 * p;
  const style: React.CSSProperties = {fontFamily: heavy, fontWeight: 900, fontSize: 200, letterSpacing: '-0.05em', lineHeight: 1};
  return (
    <div style={{position: 'relative', opacity: p, scale: String(1.6 - 0.6 * p)}}>
      <div style={{...style, position: 'absolute', color: WINE_HI, translate: `${j('a') - 10}px ${j('b')}px`, opacity: 0.8}}>CAÓTICO</div>
      <div style={{...style, position: 'absolute', color: '#4b7bff', translate: `${j('c') + 10}px ${j('d')}px`, opacity: 0.35, mixBlendMode: 'screen'}}>CAÓTICO</div>
      <div style={{...style, color: SAND, translate: `${j('e')}px ${j('f')}px`, rotate: `${noise2D('g', frame * 0.3, 1) * 3}deg`}}>CAÓTICO</div>
    </div>
  );
};

// 3 · tela dividida esquerda | direita
const SplitChoice: React.FC<{leftAt: number; rightAt: number; ouAt: number; dur: number}> = ({leftAt, rightAt, ouAt, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const l = spring({frame: frame - leftAt + 4, fps, config: {damping: 16}});
  const r = spring({frame: frame - rightAt + 4, fps, config: {damping: 16}});
  const ou = spring({frame: frame - ouAt, fps, config: {damping: 10}});
  const drift = frame * 0.6;
  const intro = prog(frame, 0, 12);
  const vert = (color: string, text: string, rot: number, p: number): React.CSSProperties => ({
    position: 'absolute',
    top: 960,
    left: 270,
    translate: '-50% -50%',
    rotate: `${rot}deg`,
    fontFamily: heavy,
    fontWeight: 900,
    fontSize: 250,
    letterSpacing: '-0.04em',
    color,
    whiteSpace: 'nowrap',
    opacity: p,
  });
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1920, background: WINE, translate: `${(l - 1) * 540}px 0`, overflow: 'hidden'}}>
        <div style={{...vert(SAND, 'ESQUERDA', -90, l), translate: `-50% calc(-50% + ${drift}px)`}}>ESQUERDA</div>
      </div>
      <div style={{position: 'absolute', left: 540, top: 0, width: 540, height: 1920, background: SAND, translate: `${(1 - r) * 540}px 0`, overflow: 'hidden'}}>
        <div style={{...vert(INK, 'DIREITA', 90, r), translate: `-50% calc(-50% - ${drift}px)`}}>DIREITA</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 540,
          translate: '-50% 0',
          padding: '18px 44px',
          borderRadius: 999,
          background: INK,
          whiteSpace: 'nowrap',
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 50,
          color: SAND,
          opacity: intro,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}
      >
        ou você escolhe…
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540 - 110,
          top: 960 - 110,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: INK,
          border: `6px solid ${SAND}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: serif,
          fontSize: 120,
          color: SAND,
          scale: String(ou),
          opacity: frame < ouAt ? 0 : 1,
          boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
        }}
      >
        ou
      </div>
      <AbsoluteFill style={{background: SAND, opacity: interpolate(frame, [dur - 4, dur], [0, 0.6], clamp)}} />
    </AbsoluteFill>
  );
};

// 4 · cartas "ruim" e "pior"
const BadCards: React.FC<{ruimAt: number; piorAt: number; rel: (i: number) => number}> = ({ruimAt, piorAt, rel}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: frame - ruimAt + 6, fps, config: {damping: 14}});
  const b = spring({frame: frame - piorAt + 4, fps, config: {damping: 11, mass: 0.8}});
  const card = (bg: string, fg: string, kicker: string, big: string, s: number, rot: number, top: number, w: number): React.ReactNode => (
    <div
      style={{
        position: 'absolute',
        top,
        left: 540 - w / 2,
        width: w,
        padding: '50px 60px 60px',
        background: bg,
        borderRadius: 36,
        boxShadow: '0 40px 90px rgba(23,4,8,0.35)',
        rotate: `${rot + (1 - s) * 20}deg`,
        translate: `${(1 - s) * 700}px ${(1 - s) * 200}px`,
        opacity: s > 0.01 ? 1 : 0,
      }}
    >
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 36, letterSpacing: '0.25em', color: fg, opacity: 0.7}}>{kicker}</div>
      <div style={{fontFamily: heavy, fontWeight: 900, fontSize: 190, letterSpacing: '-0.05em', color: fg, lineHeight: 1.05}}>{big}</div>
      <ThumbDown color={fg} />
    </div>
  );
  const ou1 = prog(frame, rel(38) - 2, 12);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, width: 1080, textAlign: 'center', fontFamily: serif, fontSize: 110, color: INK, opacity: ou1}}>
        ou uma opção…
      </div>
      {card('#fffaf0', INK, 'OPÇÃO', 'RUIM', a, -6, 560, 720)}
      {card(WINE, SAND, 'OU AINDA', 'PIOR', b, 5, 960, 800)}
    </AbsoluteFill>
  );
};

const ThumbDown: React.FC<{color: string}> = ({color}) => (
  <svg width={120} height={120} viewBox="0 0 24 24" style={{position: 'absolute', right: 50, top: 50, opacity: 0.85}}>
    <path
      d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </svg>
);

const StrikeLine: React.FC<{at: number; top: number; width: number; color: string}> = ({at, top, width, color}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 10);
  return (
    <div style={{position: 'absolute', top, left: 540 - width / 2, width: width * p, height: 12, background: color, borderRadius: 6, rotate: '-5deg', boxShadow: `0 0 30px ${color}`}} />
  );
};

// 7 · contador volta de 2026 para 1790 e o quadro abre em íris
const Rewind: React.FC<{sceneDur: number; startAt: number; landAt: number; revAt: number; fraAt: number}> = ({sceneDur, startAt, landAt, revAt, fraAt}) => {
  const frame = useCurrentFrame();
  const yearAt = (f: number) => Math.round(interpolate(f, [startAt, landAt], [2026, 1790], {...clamp, easing: Easing.out(Easing.cubic)}));
  const year = yearAt(frame);
  const speed = Math.abs(yearAt(frame + 1) - year);
  const iris = interpolate(frame, [landAt - 2, landAt + 16], [0, 1500], {...clamp, easing: ease});
  const land = spring({frame: frame - landAt, fps: 30, config: {damping: 9}});
  const rev = prog(frame, revAt - 2, 14);
  const fra = prog(frame, fraAt - 2, 14);
  return (
    <AbsoluteFill>
      <Bg mode="ink" />
      <AbsoluteFill style={{clipPath: `circle(${iris}px at 50% 50%)`}}>
        <Painting panFrom={0} panTo={700} zoom={[1.05, 1.18]} dur={sceneDur} />
      </AbsoluteFill>
      {/* riscos de "rebobinar" enquanto conta */}
      {speed > 0
        ? Array.from({length: 8}).map((_, k) => (
            <div
              key={k}
              style={{position: 'absolute', left: 0, right: 0, top: ((k * 263 + frame * 90) % 1920), height: 2 + (k % 3) * 3, background: SAND, opacity: 0.12}}
            />
          ))
        : null}
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{position: 'absolute', top: 330, fontFamily: sans, fontWeight: 700, fontSize: 34, letterSpacing: '0.4em', color: SAND, opacity: 0.85}}>
          EM MEADOS DE
        </div>
        <div
          style={{
            position: 'absolute',
            top: 380,
            fontFamily: heavy,
            fontWeight: 900,
            fontSize: 300,
            letterSpacing: '-0.05em',
            fontVariantNumeric: 'tabular-nums',
            color: SAND,
            filter: `blur(${Math.min(8, speed * 0.25)}px)`,
            scale: String(frame >= landAt ? 1 + (1 - land) * 0.25 : 1),
            textShadow: '0 20px 70px rgba(0,0,0,0.6)',
          }}
        >
          {year}
        </div>
        <div style={{position: 'absolute', top: 1360, textAlign: 'center'}}>
          <div style={{fontFamily: serif, fontSize: 170, color: SAND, opacity: rev, translate: `0 ${(1 - rev) * 40}px`, lineHeight: 1}}>Revolução</div>
          <div
            style={{
              fontFamily: heavy,
              fontWeight: 900,
              fontSize: 118,
              letterSpacing: `${0.02 + (1 - fra) * 0.4}em`,
              color: WINE_HI,
              opacity: fra,
              lineHeight: 1.1,
              textShadow: '0 6px 40px rgba(0,0,0,0.6)',
            }}
          >
            FRANCESA
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 8 · Assembleia em semicírculo: esquerda enche de vinho, direita de tinta
const Hemicycle: React.FC<{leftAt: number; rightAt: number}> = ({leftAt, rightAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cx = 540;
  const cy = 1230;
  const seats: {x: number; y: number; ang: number; k: number}[] = [];
  let k = 0;
  for (let row = 0; row < 5; row++) {
    const R = 210 + row * 72;
    const n = 11 + row * 3;
    for (let s = 0; s < n; s++) {
      const ang = Math.PI - (s / (n - 1)) * Math.PI;
      seats.push({x: cx + Math.cos(ang) * R, y: cy - Math.sin(ang) * R, ang, k: k++});
    }
  }
  const foot = prog(frame, rightAt + 10, 16);
  return (
    <AbsoluteFill>
      {seats.map((s) => {
        const appear = spring({frame: frame - 2 - s.k * 0.25, fps, config: {damping: 14}});
        const left = s.ang > Math.PI / 2 + 0.01;
        const right = s.ang < Math.PI / 2 - 0.01;
        const order = left ? (Math.PI - s.ang) * 8 : s.ang * 8; // de fora para o centro
        const fillL = left ? prog(frame, leftAt - 4 + order, 8) : 0;
        const fillR = right ? prog(frame, rightAt - 4 + order, 8) : 0;
        const bg = fillL > 0 ? WINE : fillR > 0 ? INK : SAND_DK;
        return (
          <div
            key={s.k}
            style={{
              position: 'absolute',
              left: s.x - 19,
              top: s.y - 19,
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: bg,
              scale: String(appear * (1 + 0.35 * Math.sin(Math.max(fillL, fillR) * Math.PI))),
            }}
          />
        );
      })}
      {/* tribuna */}
      <div style={{position: 'absolute', left: cx - 70, top: cy - 20, width: 140, height: 40, borderRadius: 8, background: INK, opacity: 0.85}} />
      <div style={{position: 'absolute', top: cy + 60, left: 100, fontFamily: sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.3em', color: WINE, opacity: prog(frame, leftAt, 12)}}>
        ESQUERDA
      </div>
      <div style={{position: 'absolute', top: cy + 60, right: 100, fontFamily: sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.3em', color: INK, opacity: prog(frame, rightAt, 12)}}>
        DIREITA
      </div>
      <div
        style={{
          position: 'absolute',
          top: cy + 170,
          left: 120,
          right: 120,
          textAlign: 'center',
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.4,
          color: INK,
          opacity: 0.75 * foot,
        }}
      >
        Assembleia Nacional, 1789: os revolucionários sentavam à esquerda; os defensores do rei, à direita.
      </div>
    </AbsoluteFill>
  );
};

// 9 · raios girando (revolução = girar)
const Sunburst: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at - 6, 20);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.35 * p}}>
      <div
        style={{
          width: 2600,
          height: 2600,
          borderRadius: '50%',
          background: `repeating-conic-gradient(${WINE} 0deg 7deg, transparent 7deg 15deg)`,
          rotate: `${frame * 0.6}deg`,
          scale: String(0.6 + 0.4 * p),
          maskImage: 'radial-gradient(circle, black 0%, transparent 60%)',
        }}
      />
    </AbsoluteFill>
  );
};

// 10 · a cruz não cabe no encaixe quadrado
const MisFit: React.FC<{dropAt: number; hitAt: number; rejectAt: number}> = ({dropAt, hitAt, rejectAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const holeTop = 760;
  const crossH = 460;
  const barY = crossH * 0.28;
  const hover = holeTop - crossH + 40; // braço horizontal acima do encaixe
  const contact = holeTop - barY - 18; // braço encosta na borda
  const yDrop = interpolate(frame, [dropAt - 6, dropAt + 14], [-700, hover], {...clamp, easing: ease});
  const yHit = interpolate(frame, [hitAt - 6, hitAt], [0, contact - hover], {...clamp, easing: Easing.in(Easing.quad)});
  const rej = spring({frame: frame - rejectAt, fps, config: {damping: 9}});
  const y = yDrop + yHit - (frame >= rejectAt ? rej * 260 : 0);
  const rot = frame >= rejectAt ? rej * -16 : 0;
  const hitFlash = interpolate(frame, [hitAt, hitAt + 12], [1, 0], clamp) * (frame >= hitAt ? 1 : 0);
  const board = prog(frame, 0, 14);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, width: 1080, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 28, letterSpacing: '0.35em', color: SAND, opacity: 0.7 * board}}>
        ESTADO REVOLUCIONÁRIO
      </div>
      {/* placa com o encaixe quadrado */}
      <div style={{position: 'absolute', top: holeTop, left: 140, width: 800, height: 300, borderTop: `6px solid ${SAND}`, opacity: board}} />
      <div
        style={{
          position: 'absolute',
          top: holeTop - 3,
          left: 540 - 75,
          width: 150,
          height: 240,
          background: INK,
          border: `6px solid ${hitFlash > 0 ? WINE_HI : SAND}`,
          borderTop: 'none',
          boxShadow: hitFlash > 0 ? `0 0 ${60 * hitFlash}px ${WINE_HI}` : undefined,
          opacity: board,
        }}
      />
      {/* cruz */}
      <div style={{position: 'absolute', left: 540 - 210, top: y, width: 420, height: crossH, rotate: `${rot}deg`, transformOrigin: '50% 30%'}}>
        <div style={{position: 'absolute', left: 210 - 55, top: 0, width: 110, height: crossH, background: SAND, borderRadius: 8}} />
        <div style={{position: 'absolute', left: 0, top: barY - 55, width: 420, height: 110, background: SAND, borderRadius: 8}} />
      </div>
      {/* X vermelho quando é rejeitada */}
      <div
        style={{
          position: 'absolute',
          top: holeTop - 330,
          left: 540 + 230,
          fontFamily: heavy,
          fontWeight: 900,
          fontSize: 200,
          color: WINE_HI,
          opacity: frame >= rejectAt ? 1 : 0,
          scale: String(0.4 + 0.6 * rej),
          textShadow: `0 0 40px ${WINE_HI}`,
        }}
      >
        ✕
      </div>
    </AbsoluteFill>
  );
};

// 12 · ESQUERDA ≠ Cristo
const NotEqual: React.FC<{rel: (i: number) => number; sceneFrom: number}> = ({rel, sceneFrom}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const esq = prog(frame, rel(121) - 2, 14);
  const cri = prog(frame, rel(123) - 2, 14);
  const sep = spring({frame: frame - rel(124), fps, config: {damping: 15}});
  const bars = prog(frame, rel(122) - 2, 10);
  const slash = prog(frame, rel(124), 10);
  const juntos = prog(frame, rel(125) - 2, 14);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <KineticText
        words={words}
        sceneFrom={sceneFrom}
        accentColor={WINE}
        color={INK}
        shadow={false}
        style={{position: 'absolute', top: 310}}
        lines={[
          {size: 50, tokens: [{i: 110, weight: 800}, {i: 111, dim: true}, {i: 112, dim: true}, {i: 113, dim: true}, {i: 114, dim: true}, {i: 115, dim: true}, {i: 116, dim: true}]},
          {size: 50, tokens: [{i: 117, serif: true, accent: true, scale: 1.4}, {i: 118, dim: true}, {i: 119, weight: 800}, {i: 120, dim: true}]},
        ]}
      />
      <div style={{position: 'absolute', top: 560 - sep * 70, fontFamily: heavy, fontWeight: 900, fontSize: 170, letterSpacing: '-0.05em', color: INK, opacity: esq, translate: `${(1 - esq) * -120}px 0`}}>
        ESQUERDA
      </div>
      <svg width={300} height={220} style={{position: 'absolute', top: 820, overflow: 'visible'}}>
        <line x1={20} y1={80} x2={20 + 260 * bars} y2={80} stroke={WINE} strokeWidth={22} strokeLinecap="round" />
        <line x1={20} y1={150} x2={20 + 260 * bars} y2={150} stroke={WINE} strokeWidth={22} strokeLinecap="round" />
        <line x1={210} y1={0} x2={210 - 120 * slash} y2={230 * slash} stroke={WINE} strokeWidth={22} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', top: 1040 + sep * 70, fontFamily: serif, fontSize: 280, color: WINE, opacity: cri, translate: `${(1 - cri) * 120}px 0`, lineHeight: 1}}>
        Cristo
      </div>
      <div style={{position: 'absolute', top: 1500, fontFamily: sans, fontWeight: 800, fontSize: 64, color: INK, opacity: juntos, letterSpacing: `${(1 - juntos) * 0.3}em`}}>
        não andam juntos.
      </div>
    </AbsoluteFill>
  );
};

// 13 · lista estilo tabela de jornal, com X marcando cada item
const Ledger: React.FC<{rel: (i: number) => number; sceneFrom: number}> = ({rel, sceneFrom}) => {
  const frame = useCurrentFrame();
  const items = [
    {i: 137, label: 'Aborto'},
    {i: 138, label: 'Igualdade de gênero'},
    {i: 141, label: 'Feminismo'},
    {i: 142, label: 'Doutrinas distorcidas nas escolas'},
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <KineticText
        words={words}
        sceneFrom={sceneFrom}
        accentColor={WINE_HI}
        style={{position: 'absolute', top: 300}}
        lines={[
          {size: 56, tokens: [{i: 127, serif: true, scale: 1.3}, {i: 128, dim: true}, {i: 129, text: 'disso,', dim: true}]},
          {size: 56, tokens: [{i: 130, dim: true}, {i: 131, weight: 800}, {i: 132, dim: true}, {i: 133, dim: true}, {i: 134, dim: true}]},
        ]}
      />
      <div style={{position: 'absolute', top: 460}}>
        <PillWord at={rel(135)} text="HOJE" size={120} bg={WINE_HI} color={SAND} />
      </div>
      <div style={{position: 'absolute', top: 680, fontFamily: serif, fontSize: 84, color: SAND, opacity: prog(frame, rel(136) - 2, 12)}}>apoia:</div>
      <div style={{position: 'absolute', top: 820, left: 80, right: 80}}>
        {items.map((it, k) => {
          const p = prog(frame, rel(it.i) - 3, 12);
          const x = prog(frame, rel(it.i) + 6, 8);
          return (
            <div
              key={k}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: '30px 0',
                borderBottom: `2px solid rgba(245,235,208,${0.25 * p})`,
                opacity: p,
                translate: `${(1 - p) * -80}px 0`,
              }}
            >
              <span style={{fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', color: WINE_HI, width: 70}}>{String(k + 1).padStart(2, '0')}</span>
              <span style={{flex: 1, fontFamily: heavy, fontWeight: 800, fontSize: it.label.length > 22 ? 50 : 66, letterSpacing: '-0.03em', color: SAND, lineHeight: 1.1}}>
                {it.label}
              </span>
              <svg width={70} height={70} style={{overflow: 'visible'}}>
                <line x1={8} y1={8} x2={8 + 54 * x} y2={8 + 54 * x} stroke={WINE_HI} strokeWidth={12} strokeLinecap="round" />
                <line x1={62} y1={8} x2={62 - 54 * Math.max(0, x * 2 - 1)} y2={8 + 54 * Math.max(0, x * 2 - 1)} stroke={WINE_HI} strokeWidth={12} strokeLinecap="round" />
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 14 · "deturpações" se deforma de verdade
const Distorted: React.FC<{rel: (i: number) => number; sceneFrom: number}> = ({rel, sceneFrom}) => {
  const frame = useCurrentFrame();
  const furtos = prog(frame, rel(147) - 3, 12);
  const det = prog(frame, rel(152) - 2, 12);
  const warp = interpolate(frame, [rel(152), rel(152) + 20, rel(153) + 10], [0, 38, 16], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="detwarp">
          <feTurbulence type="turbulence" baseFrequency={`0.012 ${0.04 + Math.sin(frame * 0.2) * 0.01}`} numOctaves={2} seed={frame % 7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={warp} />
        </filter>
      </svg>
      <div style={{position: 'absolute', top: 280, left: 80, right: 80, display: 'flex', alignItems: 'center', gap: 30, paddingBottom: 30, borderBottom: `2px solid rgba(245,235,208,0.3)`, opacity: furtos, translate: `${(1 - furtos) * -80}px 0`}}>
        <span style={{fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', color: SAND, opacity: 0.7, width: 70}}>05</span>
        <span style={{flex: 1, fontFamily: heavy, fontWeight: 800, fontSize: 66, letterSpacing: '-0.03em', color: SAND}}>Pequenos furtos</span>
        <span style={{fontFamily: heavy, fontWeight: 900, fontSize: 70, color: SAND}}>✕</span>
      </div>
      <KineticText
        words={words}
        sceneFrom={sceneFrom}
        accentColor={SAND}
        style={{position: 'absolute', top: 560}}
        lines={[{size: 60, tokens: [{i: 149, dim: true}, {i: 150}, {i: 151, dim: true}]}]}
      />
      <div
        style={{
          position: 'absolute',
          top: 680,
          fontFamily: heavy,
          fontWeight: 900,
          fontSize: 132,
          letterSpacing: '-0.05em',
          color: SAND,
          opacity: det,
          scale: String(1.3 - 0.3 * det),
          filter: 'url(#detwarp)',
        }}
      >
        deturpações
      </div>
      <KineticText
        words={words}
        sceneFrom={sceneFrom}
        accentColor={SAND}
        style={{position: 'absolute', top: 960}}
        lines={[
          {size: 60, tokens: [{i: 153, dim: true}, {i: 154}]},
          {size: 150, tokens: [{i: 155, serif: true, pop: true}]},
          {size: 60, tokens: [{i: 156, dim: true}]},
          {size: 150, tokens: [{i: 157, text: 'valores.', serif: true, pop: true}]},
        ]}
      />
    </AbsoluteFill>
  );
};

// 15 · cédula com dois quadrados vazios; a caneta passeia mas não marca
const BallotCard: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at + 4, fps, config: {damping: 14}});
  const penX = 610 + Math.sin(frame * 0.07) * 20;
  const penY = -40 + Math.sin(frame * 0.11) * 40;
  return (
    <div
      style={{
        position: 'absolute',
        top: 330,
        left: 540 - 330,
        width: 660,
        height: 640,
        background: '#fffaf0',
        borderRadius: 28,
        boxShadow: '0 40px 100px rgba(23,4,8,0.25)',
        rotate: `${-4 + (1 - s) * 10}deg`,
        translate: `0 ${(1 - s) * 400}px`,
        opacity: Math.min(1, s * 2),
        padding: '50px 60px',
      }}
    >
      <div style={{fontFamily: sans, fontWeight: 800, fontSize: 32, letterSpacing: '0.3em', color: WINE}}>CÉDULA · 2º TURNO</div>
      <div style={{height: 2, background: INK, opacity: 0.2, margin: '26px 0 40px'}} />
      {[0, 1].map((k) => (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 36, marginBottom: 56}}>
          <div style={{width: 100, height: 100, border: `6px solid ${INK}`, borderRadius: 14}} />
          <div style={{flex: 1}}>
            <div style={{height: 22, width: '80%', background: INK, opacity: 0.18, borderRadius: 11, marginBottom: 16}} />
            <div style={{height: 22, width: '50%', background: INK, opacity: 0.1, borderRadius: 11}} />
          </div>
        </div>
      ))}
      {/* caneta */}
      <div style={{position: 'absolute', left: penX, top: penY, rotate: '28deg', transformOrigin: '50% 100%'}}>
        <div style={{width: 26, height: 260, background: WINE, borderRadius: 13}} />
        <div style={{width: 0, height: 0, borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderTop: `34px solid ${INK}`}} />
      </div>
    </div>
  );
};

// 17 · final: cruz acesa ao fundo e a frase pesando
const Finale: React.FC<{rel: (i: number) => number; dur: number; sceneFrom: number}> = ({rel, dur, sceneFrom}) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, dur], [1, 1.12], {...clamp, easing: Easing.inOut(Easing.sin)});
  const out = interpolate(frame, [dur - 25, dur], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Bg mode="ink" />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', scale: String(push)}}>
        <div style={{position: 'absolute', top: 360, opacity: 0.22}}>
          <DrawnCross at={4} size={1000} color={WINE_HI} glow />
        </div>
        <KineticText
          words={words}
          sceneFrom={sceneFrom}
          accentColor={WINE_HI}
          lines={[
            {size: 260, tokens: [{i: 171, serif: true, pop: true}]},
            {size: 150, tokens: [{i: 172, heavy: true, text: 'você'}]},
            {size: 150, tokens: [{i: 173, heavy: true, accent: true, text: 'não'}, {i: 174, heavy: true, text: 'é.'}]},
          ]}
        />
        <Rule at={rel(174) + 14} width={600} color={WINE_HI} top={1500} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: out}} />
    </AbsoluteFill>
  );
};
