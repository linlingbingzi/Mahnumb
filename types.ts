
export type Suit = 'MAN' | 'PIN' | 'SOU' | 'HONOR';

export interface Tile {
  id: string;
  suit: Suit;
  value: number; // 1-9 for suits, 1-7 for Honors
  label: string;
  isDora?: boolean;
}

export interface Meld {
  id: string;
  type: 'PUNG' | 'KONG' | 'CHOW';
  tiles: Tile[];
}

export interface PigeonDoc {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: 'Common' | 'Uncommon' | 'Rare';
  effectType: 'chips' | 'mult' | 'xMult' | 'special';
  value: number;
}

export type GameState = 'MENU' | 'ONBOARDING' | 'PLAYING' | 'SHOP' | 'GAMEOVER' | 'VICTORY';

export interface WorkplaceMessage {
  id: string;
  sender: string;
  role: 'USER' | 'BOSS' | 'SYSTEM';
  content: string;
  time: string;
  type: 'chat' | 'system' | 'result' | 'meld';
  details?: {
    chips: number;
    mult: number;
    total: number;
    name: string;
    tiles?: Tile[];
  };
}

export interface SubmittedMessage {
  id: string;
  name: string;
  total: number;
  chips: number;
  mult: number;
  timestamp: number;
}
