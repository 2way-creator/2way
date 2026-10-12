import legoGentlemanImg from '../assets/images/lego_minifig_gentleman_1791781417316.jpg';
import legoLadyImg from '../assets/images/lego_minifig_lady_1791781426266.jpg';
import legoRockerImg from '../assets/images/lego_minifig_rocker_1791781434367.jpg';
import legoGlamourImg from '../assets/images/lego_minifig_glamour_1791781443236.jpg';
import legoDjImg from '../assets/images/lego_minifig_dj_1791781845220.jpg';
import legoChicImg from '../assets/images/lego_minifig_chic_1791781854237.jpg';
import legoPirateImg from '../assets/images/lego_minifig_pirate_1791781863087.jpg';
import legoRebelImg from '../assets/images/lego_minifig_rebel_1791781871375.jpg';
import legoCosmicImg from '../assets/images/lego_minifig_cosmic_1791781918694.jpg';

export {
  legoGentlemanImg,
  legoLadyImg,
  legoRockerImg,
  legoGlamourImg,
  legoDjImg,
  legoChicImg,
  legoPirateImg,
  legoRebelImg,
  legoCosmicImg,
};

export interface LegoMinifigAvatar {
  id: string;
  name: string;
  gender: 'hombre' | 'mujer' | 'otro';
  image: string;
  emojiFallback: string;
  tagline: string;
  accentColor: string;
}

export const LEGO_AVATARS: LegoMinifigAvatar[] = [
  {
    id: 'lego-gentleman',
    name: 'Lego Galán VIP',
    gender: 'hombre',
    image: legoGentlemanImg,
    emojiFallback: '🤵‍♂️',
    tagline: 'Elegancia de traje y corbata',
    accentColor: '#38bdf8',
  },
  {
    id: 'lego-lady',
    name: 'Lego Dama Roja',
    gender: 'mujer',
    image: legoLadyImg,
    emojiFallback: '💃',
    tagline: 'Vestido rojo y sonrisa encantadora',
    accentColor: '#f43f5e',
  },
  {
    id: 'lego-rocker',
    name: 'Lego Rockero VIP',
    gender: 'hombre',
    image: legoRockerImg,
    emojiFallback: '😎',
    tagline: 'Gafas de sol y chaqueta de cuero',
    accentColor: '#fbbf24',
  },
  {
    id: 'lego-glamour',
    name: 'Lego Glamour',
    gender: 'mujer',
    image: legoGlamourImg,
    emojiFallback: '✨',
    tagline: 'Top dorado de lentejuelas y guiño',
    accentColor: '#ec4899',
  },
  {
    id: 'lego-dj',
    name: 'Lego DJ Neon',
    gender: 'hombre',
    image: legoDjImg,
    emojiFallback: '🎧',
    tagline: 'Auriculares, tornamesa y puro ritmo',
    accentColor: '#a855f7',
  },
  {
    id: 'lego-chic',
    name: 'Lego Influencer Chic',
    gender: 'mujer',
    image: legoChicImg,
    emojiFallback: '💅',
    tagline: 'Estilo de fiesta, bolso y glamour',
    accentColor: '#c084fc',
  },
  {
    id: 'lego-pirate',
    name: 'Lego Pirata Fiestero',
    gender: 'hombre',
    image: legoPirateImg,
    emojiFallback: '🏴‍☠️',
    tagline: 'Pañuelo rojo, cerveza y cero filtros',
    accentColor: '#ef4444',
  },
  {
    id: 'lego-rebel',
    name: 'Lego Skate & Rebelde',
    gender: 'mujer',
    image: legoRebelImg,
    emojiFallback: '🧢',
    tagline: 'Gorra moderna, patineta y actitud audaz',
    accentColor: '#10b981',
  },
  {
    id: 'lego-cosmic',
    name: 'Lego Astronauta Galáctico',
    gender: 'otro',
    image: legoCosmicImg,
    emojiFallback: '🚀',
    tagline: 'Casco dorado, sable de luz y vibra cósmica',
    accentColor: '#06b6d4',
  },
];
