// "Ambiente se montando" (versão gratuita, sem IA de vídeo): parte da sala vazia e cada grupo de móveis
// surge no lugar em sequência (máscara suave + leve subida), câmera travada. No fim, luz mais quente.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type MontagemProps = {pasta: string; grupos: string[]; inicio?: number; intervalo?: number; dur?: number};

const Peca: React.FC<{pasta: string; mascara: string; at: number; dur: number}> = ({pasta, mascara, at, dur}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = f / fps;
	const p = interpolate(t, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const m = staticFile(`${pasta}/${mascara}.png`);
	return (
		<AbsoluteFill style={{opacity: p, transform: `translateY(${(1 - p) * 26}px)`, WebkitMaskImage: `url(${m})`, maskImage: `url(${m})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%'}}>
			<Img src={staticFile(`${pasta}/final.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</AbsoluteFill>
	);
};

export const Montagem: React.FC<MontagemProps> = ({pasta, grupos, inicio = 0.9, intervalo = 0.75, dur = 0.7}) => {
	const f = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = f / fps;
	const fimMontagem = inicio + grupos.length * intervalo + dur;
	// ao final, a foto real inteira assume (garante o último quadro idêntico) e a luz esquenta
	const fecha = interpolate(t, [fimMontagem, fimMontagem + 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const quente = interpolate(t, [fimMontagem + 0.3, durationInFrames / fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Img src={staticFile(`${pasta}/vazia.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			{grupos.map((g, i) => (
				<Peca key={g} pasta={pasta} mascara={g} at={inicio + i * intervalo} dur={dur} />
			))}
			<AbsoluteFill style={{opacity: fecha}}>
				<Img src={staticFile(`${pasta}/final.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `saturate(${1 + 0.1 * quente}) brightness(${1 + 0.04 * quente})`}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(70% 60% at 50% 45%, rgba(255,190,120,.16), rgba(0,0,0,0) 70%)', opacity: quente, mixBlendMode: 'soft-light'}} />
		</AbsoluteFill>
	);
};
