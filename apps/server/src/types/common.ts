// Local definitions for types and constants from @planetbyte/common
// This is a temporary solution until the module resolution issues are fixed

export enum MessageType {
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  MOVE = 'MOVE',
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  CHAT = 'CHAT',
  PLAYER_INPUT = 'PLAYER_INPUT',
  PLAYER_JOIN = 'PLAYER_JOIN',
  PLAYER_LEAVE = 'PLAYER_LEAVE',
  PLAYER_STATE = 'PLAYER_STATE',
  DAY_NIGHT_CHANGE = 'DAY_NIGHT_CHANGE'
}

export enum Faction {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  FACTION_1 = 'faction_1',
  FACTION_2 = 'faction_2',
  FACTION_3 = 'faction_3'
}

export enum AbilityCategory {
  MOVEMENT = 'movement',
  OFFENSE = 'offense',
  DEFENSE = 'defense',
  SUPPORT = 'support'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerInput {
  movement: Vector2;
  rotation: number;
  actions: {
    primary: boolean;
    secondary: boolean;
    abilities: {
      movement: boolean;
      offense: boolean;
      defense: boolean;
      support: boolean;
    }
  }
}

export interface Ability {
  id: string;
  name: string;
  category: AbilityCategory;
  cooldown: number;
  currentCooldown: number;
  augmentations: any[];
}

export interface Item {
  id: string;
  name: string;
  type: string;
  rarity: string;
  effects: Record<string, number>;
}

export interface PlayerState {
  id: string;
  username?: string;
  position: Vector2;
  health: number;
  maxHealth?: number;
  faction: Faction;
  rotation: number;
  experience?: number;
  level?: number;
  eloRating?: number;
  abilities?: Record<AbilityCategory, Ability>;
  inventory?: Item[];
}

export interface Base {
  id: string;
  name: string;
  position: Vector2;
  radius: number;
  controllingFaction: Faction | null;
  captureProgress: Record<string, number>;
}

export interface GameState {
  players: Record<string, PlayerState>;
  bases?: Record<string, Base>;
  time?: number;
  isNight?: boolean;
  mapSize?: number;
}

export const WORLD_CONSTANTS = {
  TILE_SIZE: 50,
  MAP_WIDTH: 100,
  MAP_HEIGHT: 100,
  MAX_PLAYERS: 100,
  VIEW_DISTANCE: 10,
  MAP_MIN_SIZE: 50,
  MAP_MAX_SIZE: 200,
  MAP_RESIZE_THRESHOLD_MIN: 0.2,
  MAP_RESIZE_THRESHOLD_MAX: 0.8,
  NIGHT_VISIBILITY_REDUCTION: 0.3,
  PLAYER_HITBOX_RADIUS: 25,
  PLAYER_MOVEMENT_SPEED: 200,
  GRID_CELL_SIZE: 1000,
  GRID_CELL_OVERLAP: 100
};

export const BALANCE_CONSTANTS = {
  BASE_HEALTH: 100,
  BASE_DAMAGE: 10,
  BASE_SPEED: 1.0,
  XP_LEVEL_MULTIPLIER: 1.2,
  ELO_K_FACTOR: 32,
  ELO_DIMINISHING_RETURNS_THRESHOLD: 2000,
  ITEM_DROP_BASE_CHANCE: 0.1,
  ITEM_DROP_ELO_BONUS_FACTOR: 0.0001,
  ITEM_DROP_REPEAT_PENALTY: 0.5
};