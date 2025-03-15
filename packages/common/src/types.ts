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