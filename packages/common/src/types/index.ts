/**
 * Shared types between client and server for PlanetByte game
 */

/**
 * Player faction enum
 */
export enum Faction {
  FACTION_1 = 'faction_1',
  FACTION_2 = 'faction_2',
  FACTION_3 = 'faction_3',
}

/**
 * Ability category enum
 */
export enum AbilityCategory {
  MOVEMENT = 'movement',
  OFFENSE = 'offense',
  DEFENSE = 'defense',
  SUPPORT = 'support',
}

/**
 * Player interface
 */
export interface Player {
  id: string;
  username: string;
  faction: Faction;
  position: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  experience: number;
  level: number;
  eloRating: number;
  abilities: Record<AbilityCategory, Ability>;
  inventory: Item[];
}

/**
 * Vector2 interface for positions and directions
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Ability interface
 */
export interface Ability {
  id: string;
  name: string;
  category: AbilityCategory;
  cooldown: number;
  currentCooldown: number;
  augmentations: Augmentation[];
}

/**
 * Augmentation interface
 */
export interface Augmentation {
  id: string;
  name: string;
  advantages: string[];
  disadvantages: string[];
}

/**
 * Item interface
 */
export interface Item {
  id: string;
  name: string;
  type: string;
  rarity: string;
  effects: Record<string, number>;
}

/**
 * Base interface
 */
export interface Base {
  id: string;
  name: string;
  position: Vector2;
  radius: number;
  controllingFaction: Faction | null;
  captureProgress: Record<Faction, number>;
}

/**
 * Game state interface
 */
export interface GameState {
  players: Record<string, Player>;
  bases: Record<string, Base>;
  time: number;
  isNight: boolean;
  mapSize: number;
}

/**
 * Player input interface
 */
export interface PlayerInput {
  movement: Vector2;
  rotation: number;
  actions: {
    primary: boolean;
    secondary: boolean;
    abilities: Record<AbilityCategory, boolean>;
  };
}

/**
 * Game event interface
 */
export interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
}