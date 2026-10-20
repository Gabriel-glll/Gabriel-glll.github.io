// Edição sincronizada com a música (estilo trend/AMV): um corte em cada golpe de bumbo.
// Os tempos vêm de audio/beatsync.py → public/<pasta>/cortes.json
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {Grain} from './motion';

const {fontFamily: TITLE} = loadAnton();
const {fontFamily: BODY} = loadInter('normal', {weights: ['500', '800'], subsets: ['latin']});

export type Foto = {arquivo: string; rotulo: string; foco?: string};
export type BeatEditProps = {
	pasta: string;
	audio: string;
	fotos: Foto[];
	cortes: number[]; // segundos
	fortes?: number[]; // golpes fortes (flash)
	bpm: number;
	titulo: string;
	subtitulo?: string;
	final: string;
	duracao: number;
};

// Clipe: foto com zoom contínuo (alterna aproximar/afastar), "punch" no início se for golpe forte
const Clipe: React.FC<{src: string; foco?: string; dur: number; i: number; forte: boolean; rotulo?: string}> = ({src, foco, dur, i, forte, rotulo}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = f / fps;
	const p = Math.min(1, t / Math.max(dur, 0.01));
	const dentro = i % 2 === 0;
	const zoom = dentro ? 1.06 + 0.14 * p : 1.2 - 0.14 * p;
	const punch = forte ? interpolate(t, [0, 0.12], [0.12, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}) : 0;
	const rot = (i % 3 - 1) * 0.6 * p;
	const flash = forte ? interpolate(t, [0, 0.07], [0.85, 0], {extrapolateRight: 'clamp'}) : interpolate(t, [0, 0.04], [0.25, 0], {extrapolateRight: 'clamp'});
	const eti = interpolate(t, [0.03, 0.15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<Img
				src={staticFile(src)}
				style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: foco || 'center', transform: `scale(${zoom + punch}) rotate(${rot}deg)`, filter: 'saturate(1.15) contrast(1.06)'}}
			/>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,.55) 100%)'}} />
			{rotulo && (
				<div style={{position: 'absolute', bottom: 230, width: '100%', textAlign: 'center', transform: `scale(${0.7 + 0.3 * eti})`, opacity: eti}}>
					<span style={{fontFamily: TITLE, fontSize: 110, color: '#fff', letterSpacing: 6, textShadow: '0 6px 30px rgba(0,0,0,.6)'}}>{rotulo.toUpperCase()}</span>
				</div>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

const Abertura: React.FC<{src: string; titulo: string; sub?: string; dur: number}> = ({src, titulo, sub, dur}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = f / fps;
	const p = t / dur;
	const letras = Math.floor(interpolate(t, [0.1, dur * 0.7], [0, titulo.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.25 - 0.1 * p})`, filter: 'brightness(.55) saturate(1.1)'}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
				<div style={{fontFamily: TITLE, fontSize: 150, color: '#fff', letterSpacing: 4, lineHeight: 1}}>{titulo.slice(0, letras)}</div>
				{sub && <div style={{fontFamily: BODY, fontWeight: 500, fontSize: 40, color: '#fff', opacity: interpolate(t, [dur * 0.6, dur * 0.9], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), marginTop: 20, letterSpacing: 8}}>{sub}</div>}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Final: React.FC<{texto: string}> = ({texto}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = f / fps;
	const s = interpolate(t, [0, 0.25], [1.4, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const o = interpolate(t, [0, 0.12], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.35 * o})`}}>
			<div style={{fontFamily: TITLE, fontSize: 130, color: '#fff', textAlign: 'center', lineHeight: 1.02, transform: `scale(${s})`, opacity: o, padding: 60, textShadow: '0 8px 40px rgba(0,0,0,.6)'}}>{texto}</div>
		</AbsoluteFill>
	);
};

export const BeatEdit: React.FC<BeatEditProps> = ({pasta, audio, fotos, cortes, fortes = [], titulo, subtitulo, final, duracao}) => {
	const {fps} = useVideoConfig();
	const fr = (s: number) => Math.round(s * fps);
	const fins = [...cortes, duracao]; // cada clipe vai de um corte até o próximo (o último vai até o fim)
	const ehForte = (t: number, idx: number) => idx % 3 === 0 || fortes.some((x) => Math.abs(x - t) < 0.05);
	const iniFinal = Math.max(cortes[0], duracao - 1.5); // texto final por cima dos últimos clipes
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Audio src={staticFile(`${pasta}/${audio}`)} />
			<Sequence durationInFrames={fr(cortes[0])}>
				<Abertura src={`${pasta}/${fotos[0].arquivo}`} titulo={titulo} sub={subtitulo} dur={cortes[0]} />
			</Sequence>
			{cortes.map((ini, k) => {
				const fim = fins[k + 1];
				const foto = fotos[(k + 1) % fotos.length];
				return (
					<Sequence key={k} from={fr(ini)} durationInFrames={Math.max(1, fr(fim) - fr(ini))}>
						<Clipe src={`${pasta}/${foto.arquivo}`} foco={foto.foco} dur={fim - ini} i={k} forte={ehForte(ini, k)} rotulo={fim <= iniFinal + 0.05 ? foto.rotulo : undefined} />
					</Sequence>
				);
			})}
			<Sequence from={fr(iniFinal)} durationInFrames={fr(duracao) - fr(iniFinal)}>
				<Final texto={final} />
			</Sequence>
			<Grain opacity={0.18} />
		</AbsoluteFill>
	);
};
