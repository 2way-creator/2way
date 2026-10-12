import { BottleSkinOption } from '../types';

import tequilaImg from '../assets/images/bottle_tequila_glass_1791777762492.jpg';
import champagneImg from '../assets/images/bottle_champagne_luxury_1791777771767.jpg';
import arenaTableImg from '../assets/images/party_vip_table_arena_1791777781344.jpg';
import legoBottleImg from '../assets/images/bottle_lego_bricks_1791781935490.jpg';

export { tequilaImg, champagneImg, arenaTableImg, legoBottleImg };

export const BOTTLE_SKINS: BottleSkinOption[] = [
  {
    id: 'lego',
    name: 'Botella de Bloques Lego',
    description: 'Construida 100% con piezas y studs Lego de lujo',
    image: legoBottleImg,
    accentColor: '#f59e0b',
  },
  {
    id: 'tequila',
    name: 'Tequila Don Oro',
    description: 'Vidrio labrado ámbar de fiesta artesanal',
    image: tequilaImg,
    accentColor: '#f59e0b',
  },
  {
    id: 'champagne',
    name: 'Champaña Moët VIP',
    description: 'Elegancia nocturna con cuello dorado',
    image: champagneImg,
    accentColor: '#10b981',
  },
  {
    id: 'neon',
    name: 'Cyberpunk Glow',
    description: 'Silueta vector neón con estela lumínica',
    accentColor: '#ec4899',
  },
  {
    id: 'beer',
    name: 'Cerveza Corona Party',
    description: 'La botella clásica para la previa con amigos',
    accentColor: '#38bdf8',
  },
];
