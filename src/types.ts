/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GraphicQuality = 'low' | 'medium' | 'high';

export interface GameSettings {
  graphicsQuality: GraphicQuality;
  sensitivity: number;
  adsSensitivity: number;
  gyroEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  hudLayout: HUDButtonPos[];
}

export interface HUDButtonPos {
  id: string;
  name: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  size: number; // multiplier/scale (0.5 to 2.0)
  opacity: number; // (0.1 to 1.0)
}

export interface Operator {
  id: string;
  name: string;
  codename: string;
  gender: 'male' | 'female';
  bio: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  // Procedural 3D customization config
  headType: 'tactical_helmet' | 'cap' | 'gas_mask' | 'beret' | 'spec_ops';
  armorType: 'light' | 'tactical_vest' | 'heavy_plate';
  skinColor: string; // hex
  hairColor: string; // hex
  armorColor: string; // hex
  pantsColor: string; // hex
  backpackColor: string; // hex
  gloveColor: string; // hex
  backpackType: 'none' | 'small' | 'tactical' | 'heavy';
  unlocked: boolean;
  cost: number;
  voicePack: string;
}

export type WeaponCategory = 'Assault Rifle' | 'SMG' | 'Sniper' | 'Shotgun' | 'Pistol' | 'LMG';

export interface Attachment {
  id: string;
  name: string;
  category: 'scope' | 'barrel' | 'muzzle' | 'stock' | 'laser' | 'grip' | 'magazine';
  statModifiers: {
    damage?: number;
    range?: number;
    accuracy?: number;
    mobility?: number;
    fireRate?: number;
    control?: number;
  };
  meshType: string; // procedural 3D drawing handle
  cost: number;
  unlocked: boolean;
}

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  // Base Stats (range 0-100)
  damage: number;
  range: number;
  accuracy: number;
  mobility: number;
  fireRate: number;
  control: number;
  magazineSize: number;
  reloadTime: number; // in seconds
  recoilX: number; // side-to-side
  recoilY: number; // rise
  // Current equipped attachment IDs
  attachments: {
    scope: string | null;
    barrel: string | null;
    muzzle: string | null;
    stock: string | null;
    laser: string | null;
    grip: string | null;
    magazine: string | null;
  };
  unlocked: boolean;
  cost: number;
  currentSkin: string; // 'none' | hex color | patterns
}

export interface GameMap {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  image: string; // inline/procedural
  colorTheme: string; // 'desert' | 'urban' | 'industrial' | 'forest'
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  scoreLimit: number;
  timeLimit: number; // in seconds
}

export interface PlayerStats {
  username: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
  credits: number; // Premium
  kills: number;
  deaths: number;
  kdRatio: number;
  matchesPlayed: number;
  wins: number;
  winRate: number;
  rankPoints: number; // Elo
  rankTier: string; // "Recruit", "SpecOps", "Legend"
  selectedOperatorId: string;
  selectedWeaponId: string;
}

export type MenuScreen = 
  | 'lobby' 
  | 'operators' 
  | 'weapons' 
  | 'loadout' 
  | 'gunsmith' 
  | 'settings' 
  | 'hud-editor' 
  | 'gameplay' 
  | 'profile'
  | 'matchmaker';
