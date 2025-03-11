/**
 * Shared constants between client and server for PlanetByte game
 */

/**
 * Game world constants
 */
export const WORLD_CONSTANTS = {
  // Player constants
  PLAYER_HITBOX_RADIUS: 25, // 50cm diameter hitbox
  PLAYER_MOVEMENT_SPEED: 200,
  PLAYER_ROTATION_SPEED: 3,
  PLAYER_MAX_HEALTH: 100,
  PLAYER_RESPAWN_TIME: 5000, // 5 seconds

  // Map constants
  MAP_MIN_SIZE: 1000, // 1km
  MAP_MAX_SIZE: 6000, // 6km
  MAP_RESIZE_THRESHOLD_MIN: 50, // players
  MAP_RESIZE_THRESHOLD_MAX: 1000, // players
  MAP_RESIZE_TIMER: 300000, // 5 minutes

  // Base constants
  BASE_CAPTURE_RADIUS: 100,
  BASE_CAPTURE_TIME: 60000, // 1 minute
  BASE_CAPTURE_POINTS_PER_SECOND: 1,

  // Day/night cycle
  DAY_NIGHT_CYCLE_DURATION: 3600000, // 1 hour
  NIGHT_VISIBILITY_REDUCTION: 0.5, // 50% reduction

  // Grid cell constants for spatial partitioning
  GRID_CELL_SIZE: 500,
  GRID_CELL_OVERLAP: 50,

  // Network constants
  NETWORK_UPDATE_RATE: 50, // 20 updates per second
  NETWORK_INTEREST_RADIUS: 1000, // 1km
};

/**
 * Game balance constants
 */
export const BALANCE_CONSTANTS = {
  // Experience and leveling
  XP_PER_KILL: 100,
  XP_PER_ASSIST: 50,
  XP_PER_BASE_CAPTURE: 200,
  XP_LEVEL_MULTIPLIER: 1.5, // Each level requires 1.5x more XP

  // Elo system
  ELO_STARTING_VALUE: 1000,
  ELO_K_FACTOR: 32,
  ELO_DIMINISHING_RETURNS_THRESHOLD: 2000,

  // Item drop rates
  ITEM_DROP_BASE_CHANCE: 0.1, // 10% chance
  ITEM_DROP_ELO_BONUS_FACTOR: 0.0001, // +0.01% per Elo point above 1000
  ITEM_DROP_REPEAT_PENALTY: 0.5, // 50% reduction for repeated kills
  ITEM_DROP_REPEAT_RECOVERY_TIME: 300000, // 5 minutes
};

/**
 * Network message types
 */
export enum MessageType {
  PLAYER_JOIN = 'player_join',
  PLAYER_LEAVE = 'player_leave',
  PLAYER_INPUT = 'player_input',
  PLAYER_STATE = 'player_state',
  GAME_STATE = 'game_state',
  ABILITY_USE = 'ability_use',
  DAMAGE = 'damage',
  ITEM_DROP = 'item_drop',
  ITEM_PICKUP = 'item_pickup',
  BASE_CAPTURE_START = 'base_capture_start',
  BASE_CAPTURE_PROGRESS = 'base_capture_progress',
  BASE_CAPTURE_COMPLETE = 'base_capture_complete',
  MAP_RESIZE = 'map_resize',
  DAY_NIGHT_CHANGE = 'day_night_change',
}