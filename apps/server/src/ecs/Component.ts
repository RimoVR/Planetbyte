/**
 * Base Component interface
 * Components are pure data containers with no behavior
 */
export interface Component {
  type: string;
}

/**
 * Component types enum
 */
export enum ComponentType {
  TRANSFORM = 'transform',
  PHYSICS = 'physics',
  PLAYER = 'player',
  HEALTH = 'health',
  ABILITY = 'ability',
  INVENTORY = 'inventory',
  FACTION = 'faction',
  BASE = 'base',
  GRID_CELL = 'grid_cell',
  VISIBILITY = 'visibility',
}

/**
 * Transform component for position and rotation
 */
export interface TransformComponent extends Component {
  type: ComponentType.TRANSFORM;
  x: number;
  y: number;
  rotation: number;
  previousX: number;
  previousY: number;
  previousRotation: number;
}

/**
 * Physics component for movement and collision
 */
export interface PhysicsComponent extends Component {
  type: ComponentType.PHYSICS;
  velocityX: number;
  velocityY: number;
  radius: number; // Circular hitbox
  mass: number;
  isStatic: boolean;
}

/**
 * Player component for player-specific data
 */
export interface PlayerComponent extends Component {
  type: ComponentType.PLAYER;
  id: string;
  username: string;
  level: number;
  experience: number;
  eloRating: number;
  isBot: boolean;
  lastInputTime: number;
  clientSequence: number;
}

/**
 * Health component for health and damage
 */
export interface HealthComponent extends Component {
  type: ComponentType.HEALTH;
  health: number;
  maxHealth: number;
  lastDamageTime: number;
  lastDamageSource: string | null;
  isInvulnerable: boolean;
  invulnerabilityEndTime: number;
}

/**
 * Faction component for team affiliation
 */
export interface FactionComponent extends Component {
  type: ComponentType.FACTION;
  faction: string;
  joinedAt: number;
}

/**
 * Base component for capturable bases
 */
export interface BaseComponent extends Component {
  type: ComponentType.BASE;
  id: string;
  name: string;
  controllingFaction: string | null;
  captureProgress: Record<string, number>;
  lastCaptureTime: number;
  isContested: boolean;
}

/**
 * Grid cell component for spatial partitioning
 */
export interface GridCellComponent extends Component {
  type: ComponentType.GRID_CELL;
  cellX: number;
  cellY: number;
  entities: Set<number>; // Entity IDs in this cell
  neighborCells: number[]; // Cell entity IDs
}

/**
 * Visibility component for fog of war
 */
export interface VisibilityComponent extends Component {
  type: ComponentType.VISIBILITY;
  visibleEntities: Set<number>; // Entity IDs visible to this entity
  visibilityRadius: number;
  lastVisibilityUpdate: number;
}