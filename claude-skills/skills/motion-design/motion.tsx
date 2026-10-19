// Dicionário de efeitos Motion em componentes Remotion.
// Todos os tempos (at, dur, each...) são em SEGUNDOS, relativos à <Sequence> em que o componente está.
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Ease = (t: number) => number;
export const EASE = {
	out: Easing.bezier(0.16, 1, 0.3, 1), // freia no fim (entradas)
	in: Easing.bezier(0.7, 0, 0.84, 0), // começa devagar (saídas)
	inOut: Easing.bezier(0.65, 0, 0.35, 1), // devagar → acelera → freia
	linear: Easing.linear,
	bounce: Easing.bounce, // quica antes de parar
};

export const useSec = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return f / fps;
};

export const prog = (t: number, at: number, dur: number, ease: Ease = EASE.out) =>
	interpolate(t, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// Mola: damping baixo = mais overshoot/balanço
export const useSpring = (at: number, config: {damping?: number; stiffness?: number; mass?: number} = {}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: Math.max(0, f - at * fps), fps, config: {damping: 12, stiffness: 140, mass: 1, ...config}});
};

type Base = {at?: number; dur?: number; ease?: Ease; style?: React.CSSProperties; children?: React.ReactNode};

// ── Entradas suaves ──────────────────────────────────────────────
export const FadeIn: React.FC<Base> = ({at = 0, dur = 0.5, ease = EASE.out, style, children}) => {
	const p = prog(useSec(), at, dur, ease);
	return <div style={{opacity: p, ...style}}>{children}</div>;
};

export const SlideIn: React.FC<Base & {from?: 'left' | 'right' | 'up' | 'down'; dist?: number}> = ({
	at = 0, dur = 0.4, ease = EASE.out, from = 'left', dist = 140, style, children,
}) => {
	const p = prog(useSec(), at, dur, ease);
	const d = (1 - p) * dist;
	const tr = {left: `translateX(${-d}px)`, right: `translateX(${d}px)`, up: `translateY(${d}px)`, down: `translateY(${-d}px)`}[from];
	return <div style={{opacity: p, transform: tr, ...style}}>{children}</div>;
};

export const BlurIn: React.FC<Base & {blur?: number}> = ({at = 0, dur = 0.6, ease = EASE.out, blur = 24, style, children}) => {
	const p = prog(useSec(), at, dur, ease);
	return <div style={{opacity: p, filter: `blur(${(1 - p) * blur}px)`, ...style}}>{children}</div>;
};

// ── Entradas com impacto ─────────────────────────────────────────
export const PopIn: React.FC<Base & {from?: number; damping?: number}> = ({at = 0, from = 0.3, damping = 9, style, children}) => {
	const s = useSpring(at, {damping, stiffness: 180});
	return <div style={{opacity: Math.min(1, s * 4), transform: `scale(${from + (1 - from) * s})`, ...style}}>{children}</div>;
};

export const ScaleUp: React.FC<Base & {from?: number; origin?: string}> = ({at = 0, dur = 0.5, ease = EASE.out, from = 0, origin = 'center', style, children}) => {
	const p = prog(useSec(), at, dur, ease);
	return <div style={{transform: `scale(${from + (1 - from) * p})`, transformOrigin: origin, ...style}}>{children}</div>;
};

// Cada filho entra `each` segundos depois do anterior, com o efeito escolhido
export const Stagger: React.FC<{at?: number; each?: number; effect?: React.FC<any>; effectProps?: object; children: React.ReactNode; style?: React.CSSProperties}> = ({
	at = 0, each = 0.15, effect: Fx = SlideIn, effectProps = {}, children, style,
}) => (
	<div style={style}>
		{React.Children.toArray(children).map((c, i) => (
			<Fx key={i} at={at + i * each} {...effectProps}>{c}</Fx>
		))}
	</div>
);

// ── Ritmo do movimento ───────────────────────────────────────────
export const Overshoot: React.FC<Base & {dist?: number; from?: 'left' | 'up'}> = ({at = 0, dist = 300, from = 'left', style, children}) => {
	const s = useSpring(at, {damping: 8, stiffness: 120}); // passa do destino e volta
	const d = (1 - s) * dist;
	return <div style={{opacity: Math.min(1, s * 3), transform: from === 'left' ? `translateX(${-d}px)` : `translateY(${d}px)`, ...style}}>{children}</div>;
};

export const Bounce: React.FC<Base & {height?: number}> = ({at = 0, dur = 1, height = 500, style, children}) => {
	const p = prog(useSec(), at, dur, EASE.bounce);
	const t = useSec();
	return <div style={{opacity: t >= at ? 1 : 0, transform: `translateY(${-(1 - p) * height}px)`, ...style}}>{children}</div>;
};

// ── Texto em movimento ───────────────────────────────────────────
export const Typewriter: React.FC<{text: string; at?: number; cps?: number; caret?: string; style?: React.CSSProperties}> = ({text, at = 0, cps = 20, caret = '#fff', style}) => {
	const t = useSec();
	const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
	const blink = Math.floor(t * 2.5) % 2 === 0 || n < text.length;
	return (
		<span style={style}>
			{text.slice(0, n)}
			<span style={{display: 'inline-block', width: '0.08em', height: '1em', marginLeft: '0.05em', verticalAlign: '-0.1em', background: caret, opacity: t >= at && blink ? 1 : 0}} />
		</span>
	);
};

export const WordReveal: React.FC<{text: string; at?: number; each?: number; dur?: number; style?: React.CSSProperties; wordStyle?: (i: number) => React.CSSProperties}> = ({
	text, at = 0, each = 0.18, dur = 0.35, style, wordStyle,
}) => {
	const t = useSec();
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', gap: '0 0.25em', ...style}}>
			{text.split(' ').map((w, i) => {
				const p = prog(t, at + i * each, dur);
				return <span key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, display: 'inline-block', ...(wordStyle ? wordStyle(i) : {})}}>{w}</span>;
			})}
		</div>
	);
};

export const TextSwap: React.FC<{words: string[]; at?: number; every?: number; dur?: number; style?: React.CSSProperties}> = ({words, at = 0, every = 0.8, dur = 0.35, style}) => {
	const t = useSec();
	const idx = Math.max(0, Math.min(words.length - 1, Math.floor((t - at) / every)));
	const p = prog(t - idx * every, at, dur, EASE.inOut);
	const prev = idx > 0 ? words[idx - 1] : null;
	return (
		<span style={{display: 'inline-grid', overflow: 'hidden', verticalAlign: 'bottom', ...style}}>
			{prev && <span style={{gridArea: '1/1', transform: `translateY(${-p * 100}%)`, opacity: 1 - p}}>{prev}</span>}
			<span style={{gridArea: '1/1', transform: `translateY(${(1 - p) * 100}%)`, opacity: p}}>{words[idx]}</span>
		</span>
	);
};

// ── Formas que mudam ─────────────────────────────────────────────
export const DrawOn: React.FC<{d: string; at?: number; dur?: number; ease?: Ease; color?: string; width?: number; viewBox?: string; style?: React.CSSProperties}> = ({
	d, at = 0, dur = 0.8, ease = EASE.inOut, color = '#C85A2A', width = 10, viewBox = '0 0 100 100', style,
}) => {
	const p = prog(useSec(), at, dur, ease);
	return (
		<svg viewBox={viewBox} style={{overflow: 'visible', ...style}}>
			<path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - p} />
		</svg>
	);
};

export const Morph: React.FC<Base & {w0?: number; h0?: number; w1?: number; h1?: number; r0?: number; r1?: number; color?: string}> = ({
	at = 0, dur = 0.6, ease = EASE.inOut, w0 = 140, h0 = 140, w1 = 700, h1 = 140, r0 = 70, r1 = 28, color = '#111', style, children,
}) => {
	const p = prog(useSec(), at, dur, ease);
	const L = (a: number, b: number) => a + (b - a) * p;
	return (
		<div style={{width: L(w0, w1), height: L(h0, h1), borderRadius: L(r0, r1), background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style}}>
			{children}
		</div>
	);
};

export const BarGrow: React.FC<Base & {value?: number; color?: string; track?: string; height?: number}> = ({
	at = 0, dur = 0.8, ease = EASE.out, value = 1, color = '#C85A2A', track = 'rgba(0,0,0,.08)', height = 28, style,
}) => {
	const p = prog(useSec(), at, dur, ease);
	return (
		<div style={{height, background: track, borderRadius: height / 2, overflow: 'hidden', ...style}}>
			<div style={{height: '100%', width: `${p * value * 100}%`, background: color, borderRadius: height / 2}} />
		</div>
	);
};

// ── Transições de cena ───────────────────────────────────────────
// Máscara abre do centro (vertical ou horizontal)
export const MaskReveal: React.FC<Base & {dir?: 'vertical' | 'horizontal'}> = ({at = 0, dur = 0.7, ease = EASE.inOut, dir = 'vertical', style, children}) => {
	const c = (1 - prog(useSec(), at, dur, ease)) * 50;
	const clip = dir === 'vertical' ? `inset(${c}% 0 ${c}% 0)` : `inset(0 ${c}% 0 ${c}%)`;
	return <div style={{position: 'absolute', inset: 0, clipPath: clip, ...style}}>{children}</div>;
};

// Faixa que troca uma cena pela outra (coloque a cena nova dentro)
export const Wipe: React.FC<Base & {from?: 'left' | 'right'; bar?: string}> = ({at = 0, dur = 0.6, ease = EASE.inOut, from = 'left', bar = '#C85A2A', style, children}) => {
	const p = prog(useSec(), at, dur, ease);
	const rest = (1 - p) * 100;
	const clip = from === 'left' ? `inset(0 ${rest}% 0 0)` : `inset(0 0 0 ${rest}%)`;
	const edge = from === 'left' ? {left: `${p * 100}%`} : {right: `${p * 100}%`};
	return (
		<div style={{position: 'absolute', inset: 0, ...style}}>
			<div style={{position: 'absolute', inset: 0, clipPath: clip}}>{children}</div>
			{p > 0 && p < 1 && <div style={{position: 'absolute', top: 0, bottom: 0, width: 18, marginLeft: -9, background: bar, ...edge}} />}
		</div>
	);
};

// Zoom rápido para dar impacto
export const PunchZoom: React.FC<Base & {to?: number}> = ({at = 0, dur = 0.22, ease = EASE.out, to = 1.3, style, children}) => {
	const p = prog(useSec(), at, dur, ease);
	return <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + (to - 1) * p})`, ...style}}>{children}</div>;
};

// Zoom lento em foto (respiração da cena)
export const KenBurns: React.FC<Base & {from?: number; to?: number; origin?: string}> = ({at = 0, dur = 4, from = 1, to = 1.12, origin = 'center', style, children}) => {
	const p = prog(useSec(), at, dur, EASE.linear);
	return <div style={{position: 'absolute', inset: 0, transform: `scale(${from + (to - from) * p})`, transformOrigin: origin, ...style}}>{children}</div>;
};
