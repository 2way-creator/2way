export type Gender = 'hombre' | 'mujer' | 'otro';

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  avatar: string;
  avatarImage?: string;
  color: string;
  score: number;
  shotsCount: number;
  daresCompleted: number;
  truthsAnswered: number;
}

export type GameIntensity = 'soft' | 'party' | 'hot' | 'custom';

export type SpinMode = 'single' | 'duo'; // single: 1 persona (punta), duo: punta (víctima) y base (retador/cómplice)

export type CardType = 'truth' | 'dare' | 'kiss';

export type GameCategory =
  | 'icebreaker'   // Rompehielos & Primeras Impresiones
  | 'flirt'        // Coqueteo & Tensión Mixta
  | 'kisses'       // Besos, Caricias & Contacto Físico
  | 'hot_intimate' // Confesiones Íntimas & Secretos de Cama (+18)
  | 'party_dares'  // Retos Locos & Penitencias con Tragos
  | 'duo_mix';     // Dúos Mixtos & Parejas Cruzadas

export interface CategoryInfo {
  id: GameCategory;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export interface QuestionDareItem {
  id: string;
  type: CardType;
  category: GameCategory;
  intensity: GameIntensity;
  text: string;
  targetGender?: 'all' | 'hombre' | 'mujer' | 'duo';
  shotsPenalty: number;
  isCustom?: boolean;
}

export type BottleSkin = 'tequila' | 'champagne' | 'neon' | 'beer' | 'lego';

export interface BottleSkinOption {
  id: BottleSkin;
  name: string;
  description: string;
  image?: string;
  accentColor: string;
}
