/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Operator, Weapon, Attachment, GameMap, GameMode, GameSettings, PlayerStats, HUDButtonPos } from './types';

export const OPERATORS_DATA: Operator[] = [
  {
    id: 'op_echo',
    name: 'Ghost / Echo',
    codename: 'ECHO-01',
    gender: 'male',
    bio: 'Command team commander. Elite tracking specialist formerly of the Secret Service Tactical Unit.',
    rarity: 'legendary',
    headType: 'tactical_helmet',
    armorType: 'tactical_vest',
    skinColor: '#dcb8a3',
    hairColor: '#4f3824',
    armorColor: '#3d4a3e', // Dark olive web
    pantsColor: '#1a1f1a', // Black operations pants
    backpackColor: '#2b352c',
    gloveColor: '#121212',
    backpackType: 'tactical',
    unlocked: true,
    cost: 0,
    voicePack: 'Echo - Alpha Tactical'
  },
  {
    id: 'op_valkyrie',
    name: 'Valkyrie / Recon',
    codename: 'VALK-07',
    gender: 'female',
    bio: 'Stealth and scouting expert. Capable of navigating extreme environments with zero thermal signature.',
    rarity: 'epic',
    headType: 'spec_ops',
    armorType: 'light',
    skinColor: '#f3cfbe',
    hairColor: '#e0b869',
    armorColor: '#413c58', // Slate combat corset
    pantsColor: '#2a2640',
    backpackColor: '#3c3a4x',
    gloveColor: '#413c58',
    backpackType: 'small',
    unlocked: true,
    cost: 0,
    voicePack: 'Valkyrie - Recon Scout'
  },
  {
    id: 'op_titan',
    name: 'Titan / Juggernaut',
    codename: 'TITAN-04',
    gender: 'male',
    bio: 'Heavy support gunner who values raw ballistic protection over high-speed maneuvers.',
    rarity: 'rare',
    headType: 'gas_mask',
    armorType: 'heavy_plate',
    skinColor: '#ae8c7c',
    hairColor: '#111111',
    armorColor: '#36302e', // Rust black heavy sheets
    pantsColor: '#252120',
    backpackColor: '#36302e',
    gloveColor: '#1c1817',
    backpackType: 'heavy',
    unlocked: false,
    cost: 4500,
    voicePack: 'Titan - Heavy Artillery'
  },
  {
    id: 'op_wraith',
    name: 'Wraith / Shadow',
    codename: 'WRAITH-11',
    gender: 'female',
    bio: 'Infiltration and electronic countermeasure operative with silent step capabilities.',
    rarity: 'legendary',
    headType: 'beret',
    armorType: 'light',
    skinColor: '#f1d9cc',
    hairColor: '#222222',
    armorColor: '#1c1c1c', // Sleek carbon stealth
    pantsColor: '#151515',
    backpackColor: '#1c1c1c',
    gloveColor: '#0a0a0a',
    backpackType: 'none',
    unlocked: false,
    cost: 8000,
    voicePack: 'Wraith - Infiltrate Sector'
  }
];

export const ATTACHMENTS_DATA: Attachment[] = [
  // Optics / Scopes
  {
    id: 'att_red_dot',
    name: 'Holosun Red Dot',
    category: 'scope',
    statModifiers: { accuracy: 8, control: 4, mobility: -2 },
    meshType: 'red_dot',
    cost: 500,
    unlocked: true,
  },
  {
    id: 'att_acog',
    name: 'ACOG 4x Scope',
    category: 'scope',
    statModifiers: { accuracy: 15, range: 12, mobility: -5, control: -2 },
    meshType: 'acog',
    cost: 1200,
    unlocked: false,
  },
  {
    id: 'att_sniper_8x',
    name: 'Apex 8x Zoom Scope',
    category: 'scope',
    statModifiers: { accuracy: 25, range: 25, mobility: -10, control: -8 },
    meshType: 'sniper_scope',
    cost: 1800,
    unlocked: false,
  },

  // Barrel
  {
    id: 'att_barrel_tactical',
    name: 'Tactical Suppressed Barrel',
    category: 'barrel',
    statModifiers: { accuracy: 4, range: 10, control: 6, mobility: -4 },
    meshType: 'barrel_tactical',
    cost: 750,
    unlocked: true,
  },
  {
    id: 'att_barrel_short',
    name: 'CQB Short Barrel',
    category: 'barrel',
    statModifiers: { mobility: 12, control: -8, accuracy: -6, range: -10 },
    meshType: 'barrel_short',
    cost: 600,
    unlocked: false,
  },

  // Muzzle
  {
    id: 'att_muzzle_compensator',
    name: 'Breaker Compensator',
    category: 'muzzle',
    statModifiers: { control: 15, accuracy: 5, range: -2 },
    meshType: 'compensator',
    cost: 400,
    unlocked: true,
  },
  {
    id: 'att_muzzle_suppressor',
    name: 'Shadow Silencer',
    category: 'muzzle',
    statModifiers: { range: -5, control: 5, accuracy: 2 }, // Suppresses noise/flash index
    meshType: 'suppressor',
    cost: 950,
    unlocked: false,
  },

  // Grips
  {
    id: 'att_grip_vertical',
    name: 'Ranger Vertical Foregrip',
    category: 'grip',
    statModifiers: { control: 12, accuracy: 6, mobility: -3 },
    meshType: 'vertical_grip',
    cost: 500,
    unlocked: true,
  },
  {
    id: 'att_grip_angled',
    name: 'Ergonomic Angled Grip',
    category: 'grip',
    statModifiers: { mobility: 6, control: 5, accuracy: 2 },
    meshType: 'angled_grip',
    cost: 650,
    unlocked: false,
  },

  // Stock
  {
    id: 'att_stock_skeleton',
    name: 'Vented Skeleton Stock',
    category: 'stock',
    statModifiers: { mobility: 15, control: -8, accuracy: -4 },
    meshType: 'skeleton_stock',
    cost: 800,
    unlocked: false,
  },
  {
    id: 'att_stock_tactical',
    name: 'Padded CQB stock',
    category: 'stock',
    statModifiers: { control: 10, accuracy: 5, mobility: -5 },
    meshType: 'heavy_stock',
    cost: 600,
    unlocked: true,
  },

  // Lasers
  {
    id: 'att_laser_red',
    name: 'Tactical Red Laser 5mW',
    category: 'laser',
    statModifiers: { accuracy: 8, control: 4, range: 2 },
    meshType: 'red_laser',
    cost: 300,
    unlocked: true,
  },
  {
    id: 'att_laser_green',
    name: 'High-Intensity Green Laser',
    category: 'laser',
    statModifiers: { accuracy: 12, control: 6, mobility: 2 },
    meshType: 'green_laser',
    cost: 900,
    unlocked: false,
  },

  // Magazine
  {
    id: 'att_mag_extended',
    name: '45-Round Extended Drum',
    category: 'magazine',
    statModifiers: { fireRate: -2, mobility: -8, control: -3 }, // larger capacity but heavier
    meshType: 'extended_mag',
    cost: 700,
    unlocked: true,
  },
  {
    id: 'att_mag_fast',
    name: 'Magpul Dual Fastloader',
    category: 'magazine',
    statModifiers: { mobility: 2, control: 2 }, // Faster reloads trigger in math
    meshType: 'fast_mag',
    cost: 850,
    unlocked: false,
  }
];

export const WEAPONS_DATA: Weapon[] = [
  {
    id: 'wp_m4a1',
    name: 'M4A1 Assault',
    category: 'Assault Rifle',
    rarity: 'rare',
    damage: 38,
    range: 65,
    accuracy: 72,
    mobility: 68,
    fireRate: 80,
    control: 70,
    magazineSize: 30,
    reloadTime: 2.1,
    recoilX: 3.5,
    recoilY: 7.0,
    attachments: { scope: null, barrel: null, muzzle: null, stock: null, laser: null, grip: null, magazine: null },
    unlocked: true,
    cost: 0,
    currentSkin: 'none'
  },
  {
    id: 'wp_awp',
    name: 'L115A3 Sniper',
    category: 'Sniper',
    rarity: 'legendary',
    damage: 98,
    range: 95,
    accuracy: 92,
    mobility: 35,
    fireRate: 15,
    control: 40,
    magazineSize: 5,
    reloadTime: 3.4,
    recoilX: 10.0,
    recoilY: 25.0,
    attachments: { scope: null, barrel: null, muzzle: null, stock: null, laser: null, grip: null, magazine: null },
    unlocked: true,
    cost: 0,
    currentSkin: 'none'
  },
  {
    id: 'wp_mp5',
    name: 'MP5-A4 Tactical SMG',
    category: 'SMG',
    rarity: 'epic',
    damage: 32,
    range: 40,
    accuracy: 64,
    mobility: 88,
    fireRate: 90,
    control: 82,
    magazineSize: 30,
    reloadTime: 1.8,
    recoilX: 1.8,
    recoilY: 4.5,
    attachments: { scope: null, barrel: null, muzzle: null, stock: null, laser: null, grip: null, magazine: null },
    unlocked: false,
    cost: 3200,
    currentSkin: 'none'
  },
  {
    id: 'wp_m1014',
    name: 'M1014 Semi-Shotgun',
    category: 'Shotgun',
    rarity: 'rare',
    damage: 85,
    range: 18,
    accuracy: 42,
    mobility: 62,
    fireRate: 35,
    control: 50,
    magazineSize: 6,
    reloadTime: 4.0, // shell-by-shell simulated
    recoilX: 8.0,
    recoilY: 18.0,
    attachments: { scope: null, barrel: null, muzzle: null, stock: null, laser: null, grip: null, magazine: null },
    unlocked: false,
    cost: 1800,
    currentSkin: 'none'
  },
  {
    id: 'wp_g18',
    name: 'G18 Auto Pistol',
    category: 'Pistol',
    rarity: 'common',
    damage: 22,
    range: 25,
    accuracy: 55,
    mobility: 95,
    fireRate: 95,
    control: 52,
    magazineSize: 17,
    reloadTime: 1.3,
    recoilX: 4.5,
    recoilY: 9.0,
    attachments: { scope: null, barrel: null, muzzle: null, stock: null, laser: null, grip: null, magazine: null },
    unlocked: true,
    cost: 0,
    currentSkin: 'none'
  },
  {
    id: 'wp_m249',
    name: 'M249 Heavy LMG',
    category: 'LMG',
    rarity: 'epic',
    damage: 42,
    range: 75,
    accuracy: 60,
    mobility: 40,
    fireRate: 75,
    control: 45,
    magazineSize: 100,
    reloadTime: 6.2,
    recoilX: 5.5,
    recoilY: 10.0,
    attachments: { scope: null, barrel: null, muzzle: null, stock: null, laser: null, grip: null, magazine: null },
    unlocked: false,
    cost: 4800,
    currentSkin: 'none'
  }
];

export const MAPS_DATA: GameMap[] = [
  {
    id: 'map_desert',
    name: 'Desert Outpost',
    description: 'A dusty, sun-scorched military defense base surrounded by rolling dunes and shipping structures.',
    difficulty: '★☆☆ Easy',
    image: '#FFC890',
    colorTheme: 'desert'
  },
  {
    id: 'map_urban',
    name: 'Downtown City Streets',
    description: 'Challenging rain-swept alleys and tall concrete skyscrapers featuring intense close-quarter corridors.',
    difficulty: '★★☆ Medium',
    image: '#4D4B54',
    colorTheme: 'urban'
  },
  {
    id: 'map_factory',
    name: 'Industrial Compound',
    description: 'Rusting steam warehouses and multilevel steel gantries. Perfect for tacticians holding the high ground.',
    difficulty: '★★★ Hard',
    image: '#3C403E',
    colorTheme: 'industrial'
  },
  {
    id: 'map_forest',
    name: 'Overcast Forest Camp',
    description: 'A deep wilderness outpost blanketed in thick redwood trees, tactical sniper ridges, and low ambient fog.',
    difficulty: '★★☆ Medium',
    image: '#1E351F',
    colorTheme: 'forest'
  }
];

export const MODES_DATA: GameMode[] = [
  {
    id: 'mode_tdm',
    name: 'Team Deathmatch',
    description: 'Work with squadmates to eliminate operational targets. First team to reach 50 kills wins.',
    scoreLimit: 50,
    timeLimit: 300
  },
  {
    id: 'mode_ffa',
    name: 'Free For All',
    description: 'Solo operative mission. Every player is hostile. Eliminate everyone and reach 30 points to win.',
    scoreLimit: 30,
    timeLimit: 300
  },
  {
    id: 'mode_dom',
    name: 'Domination (Control)',
    description: 'Capture and defend target flags A, B, and C to passively score. Reach 150 points to win.',
    scoreLimit: 150,
    timeLimit: 420
  },
  {
    id: 'mode_practice',
    name: 'Practice Ranges',
    description: 'Enter a safe shooting course to fine-tune aim sensitivity, weapon recoil patterns, and scopes.',
    scoreLimit: 999,
    timeLimit: 9999
  }
];

export const WEAPON_SKINS = [
  { id: 'none', name: 'Standard Black', color: '#1B1C1D', description: 'Factory issued matte black oxide coating.' },
  { id: 'desert_camo', name: 'Sandstorm Camouflage', color: '#C2B280', description: 'Dual-tone brush strokes for arid zones.' },
  { id: 'neon_cyber', name: 'Hologram Neon Volt', color: '#FF007F', description: 'Glow-reactive carbon mesh with vibrant trim lines.' },
  { id: 'carbon_steel', name: 'Brushed Carbon Fiber', color: '#404040', description: 'High-density weave with steel-plated structural caps.' },
  { id: 'arctic_digital', name: 'Blizzard Digital', color: '#E5E4E2', description: 'Pixelated white-grey camouflage for sub-zero deployments.' },
  { id: 'gold_elite', name: '24K Golden Gilt', color: '#D4AF37', description: 'Custom engraved gold alloy celebrating superior marksmen.' }
];

export const DEFAULT_HUD_LAYOUT: HUDButtonPos[] = [
  { id: 'btn_joystick', name: 'Movement Joystick', x: 18, y: 70, size: 1.2, opacity: 0.8 },
  { id: 'btn_fire', name: 'Primary Fire', x: 82, y: 70, size: 1.4, opacity: 0.9 },
  { id: 'btn_ads', name: 'ADS (Scope Zoom)', x: 84, y: 38, size: 1.1, opacity: 0.8 },
  { id: 'btn_jump', name: 'Jump Sprint', x: 92, y: 55, size: 1.0, opacity: 0.75 },
  { id: 'btn_crouch', name: 'Slide / Crouch', x: 74, y: 85, size: 1.0, opacity: 0.75 },
  { id: 'btn_reload', name: 'Tactical Reload', x: 65, y: 72, size: 1.0, opacity: 0.8 },
  { id: 'btn_grenade', name: 'Frag Grenade', x: 50, y: 88, size: 0.9, opacity: 0.7 },
  { id: 'btn_knife', name: 'Combative Melee', x: 93, y: 15, size: 0.9, opacity: 0.75 }
];

export const INITIAL_PLAYER_STATS: PlayerStats = {
  username: 'Vanguard_Ghost#4412',
  level: 14,
  xp: 4200,
  nextLevelXp: 10000,
  gold: 2450,
  credits: 320,
  kills: 342,
  deaths: 201,
  kdRatio: 1.70,
  matchesPlayed: 48,
  wins: 32,
  winRate: 66.7,
  rankPoints: 1240,
  rankTier: 'Tier IV - SpecOps II',
  selectedOperatorId: 'op_echo',
  selectedWeaponId: 'wp_m4a1'
};

export const INITIAL_SETTINGS: GameSettings = {
  graphicsQuality: 'high',
  sensitivity: 5.0,
  adsSensitivity: 3.5,
  gyroEnabled: false,
  musicVolume: 60,
  sfxVolume: 80,
  voiceVolume: 50,
  hudLayout: [...DEFAULT_HUD_LAYOUT]
};
