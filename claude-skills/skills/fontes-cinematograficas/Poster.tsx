// Pôster/slide de carrossel no estilo "fonte cinematográfica": foto + título script grande + 3 adjetivos.
// Renderize com: npx remotion still src/index.tsx Poster out/x.png --props='{"foto":"...","titulo":"...","fonte":"elegante"}'
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont as loadYellowtail} from '@remotion/google-fonts/Yellowtail';
import {loadFont as loadPacifico} from '@remotion/google-fonts/Pacifico';
import {loadFont as loadGreatVibes} from '@remotion/google-fonts/GreatVibes';
import {loadFont as loadGrandHotel} from '@remotion/google-fonts/GrandHotel';
import {loadFont as loadDMSerif} from '@remotion/google-fonts/DMSerifDisplay';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

// Clima → fonte livre p/ uso comercial (equivalentes das fontes do carrossel)
export const FONTES = {
	dramatica: loadYellowtail().fontFamily, // ~ Blacksword: ousada, pincel
	suave: loadPacifico().fontFamily, // ~ Dollie Script: fofa, divertida
	elegante: loadGreatVibes().fontFamily, // ~ Florisel Script: romântica, fluida
	casual: loadGrandHotel().fontFamily, // ~ Hamsterly: amigável
	refinada: loadDMSerif().fontFamily, // ~ Alro Bold: serifada, sóbria
};
const {fontFamily: SANS} = loadInter('normal', {weights: ['500', '700'], subsets: ['latin']});

export type PosterProps = {
	foto: string; // arquivo em public/
	titulo: string;
	fonte: keyof typeof FONTES;
	adjetivos?: string; // "Elegante. Arejado. Seu."
	topoEsq?: string;
	topoDir?: string;
	rodape?: string;
	pagina?: string;
	posTitulo?: 'meio' | 'baixo' | 'alto';
	foco?: string; // object-position da foto
	luz?: string; // cor do brilho de fundo (opcional)
};

export const Poster: React.FC<PosterProps> = ({
	foto, titulo, fonte, adjetivos, topoEsq = 'ZFF Imóveis', topoDir = '', rodape = '', pagina = '', posTitulo = 'baixo', foco = 'center', luz,
}) => {
	const top = {alto: '20%', meio: '42%', baixo: '62%'}[posTitulo];
	const script = fonte !== 'refinada';
	return (
		<AbsoluteFill style={{background: '#0b0b10'}}>
			<Img src={staticFile(foto)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: foco}} />
			{luz && <AbsoluteFill style={{background: `radial-gradient(60% 45% at 50% ${top}, ${luz} 0%, transparent 70%)`, mixBlendMode: 'screen', opacity: 0.6}} />}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 45%, rgba(0,0,0,.7) 100%)'}} />
			<div style={{position: 'absolute', top: 56, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 500, fontSize: 26, color: '#fff', opacity: 0.9}}>
				<span>{topoEsq}</span>
				<span>{topoDir}</span>
			</div>
			<div style={{position: 'absolute', top, left: 50, right: 50, transform: 'translateY(-50%)', textAlign: 'center', color: '#fff'}}>
				<div style={{fontFamily: FONTES[fonte], fontSize: script ? 210 : 170, lineHeight: 1.05, textShadow: '0 6px 30px rgba(0,0,0,.45)', transform: script ? 'rotate(-4deg)' : 'none'}}>{titulo}</div>
				{adjetivos && <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 38, marginTop: script ? 4 : 18, textShadow: '0 2px 14px rgba(0,0,0,.7)'}}>{adjetivos}</div>}
			</div>
			<div style={{position: 'absolute', bottom: 52, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: SANS, fontSize: 24, color: '#fff'}}>
				<span style={{fontWeight: 700, maxWidth: 560, lineHeight: 1.3}}>{rodape}</span>
				<span style={{fontWeight: 700, opacity: 0.85}}>{pagina}</span>
			</div>
		</AbsoluteFill>
	);
};
