import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';

export const sans = loadInter('normal', {
  weights: ['400', '500', '700', '800'],
  subsets: ['latin'],
}).fontFamily;

export const display = loadAnton('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;

export const serif =loadSerif('italic', {
  weights: ['400'],
  subsets: ['latin'],
}).fontFamily;

// títulos extra-pesados (estilo "nível Tiago")
export const heavy = loadMontserrat('normal', {weights: ['800', '900'], subsets: ['latin']}).fontFamily;
