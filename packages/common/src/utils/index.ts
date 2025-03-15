/**
 * Shared utility functions between client and server for PlanetByte game
 */

import { Vector2 } from '../types';
import { WORLD_CONSTANTS, BALANCE_CONSTANTS } from '../constants';

// Export metrics module
export * from './metrics';

// Export network module
export * from './network';

/**
 * Calculate distance between two points
 */
export function calculateDistance(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points in radians
 */
export function calculateAngle(a: Vector2, b: Vector2): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Check if two circles are colliding
 */
export function checkCircleCollision(
  a: Vector2,
  radiusA: number,
  b: Vector2,
  radiusB: number
): boolean {
  const distance = calculateDistance(a, b);
  return distance < radiusA + radiusB;
}

/**
 * Normalize a vector to have a magnitude of 1
 */
export function normalizeVector(vector: Vector2): Vector2 {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
}

/**
 * Calculate the required experience for a given level
 */
export function calculateRequiredExperience(level: number): number {
  let required = 1000; // Base XP for level 1
  for (let i = 1; i < level; i++) {
    required = Math.floor(required * BALANCE_CONSTANTS.XP_LEVEL_MULTIPLIER);
  }
  return required;
}

/**
 * Calculate Elo rating change based on match outcome
 */
export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  outcome: number // 1 for win, 0.5 for draw, 0 for loss
): number {
  const expectedOutcome =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  
  // Apply diminishing returns for high-rated players
  let kFactor = BALANCE_CONSTANTS.ELO_K_FACTOR;
  if (playerRating > BALANCE_CONSTANTS.ELO_DIMINISHING_RETURNS_THRESHOLD) {
    const excess = playerRating - BALANCE_CONSTANTS.ELO_DIMINISHING_RETURNS_THRESHOLD;
    const reductionFactor = Math.max(0.5, 1 - excess / 1000); // Minimum 50% of original K-factor
    kFactor *= reductionFactor;
  }
  
  return Math.round(kFactor * (outcome - expectedOutcome));
}

/**
 * Calculate item drop chance based on player Elo ratings
 */
export function calculateItemDropChance(
  killerRating: number,
  victimRating: number,
  repeatKillPenalty: number
): number {
  let chance = BALANCE_CONSTANTS.ITEM_DROP_BASE_CHANCE;
  
  // Bonus for killing higher-rated players
  if (victimRating > killerRating) {
    const eloDifference = victimRating - killerRating;
    chance += eloDifference * BALANCE_CONSTANTS.ITEM_DROP_ELO_BONUS_FACTOR;
  }
  
  // Apply repeat kill penalty
  chance *= Math.max(0.1, 1 - repeatKillPenalty * BALANCE_CONSTANTS.ITEM_DROP_REPEAT_PENALTY);
  
  return Math.min(1, Math.max(0, chance));
}

/**
 * Calculate map size based on player count
 */
export function calculateMapSize(playerCount: number): number {
  const { MAP_MIN_SIZE, MAP_MAX_SIZE, MAP_RESIZE_THRESHOLD_MIN, MAP_RESIZE_THRESHOLD_MAX } = WORLD_CONSTANTS;
  
  if (playerCount <= MAP_RESIZE_THRESHOLD_MIN) {
    return MAP_MIN_SIZE;
  }
  
  if (playerCount >= MAP_RESIZE_THRESHOLD_MAX) {
    return MAP_MAX_SIZE;
  }
  
  // Linear interpolation between min and max size
  const ratio = (playerCount - MAP_RESIZE_THRESHOLD_MIN) / (MAP_RESIZE_THRESHOLD_MAX - MAP_RESIZE_THRESHOLD_MIN);
  return MAP_MIN_SIZE + ratio * (MAP_MAX_SIZE - MAP_MIN_SIZE);
}

/**
 * Calculate visibility range based on time of day and player modifiers
 */
export function calculateVisibilityRange(
  isNight: boolean,
  baseVisibility: number,
  playerModifiers: number
): number {
  let visibility = baseVisibility;
  
  // Apply night-time reduction
  if (isNight) {
    visibility *= (1 - WORLD_CONSTANTS.NIGHT_VISIBILITY_REDUCTION);
  }
  
  // Apply player modifiers (abilities, items, etc.)
  visibility *= (1 + playerModifiers);
  
  return visibility;
}

/**
 * Compress game state for network transmission using delta compression
 */
export function compressGameState(currentState: any, previousState: any): any {
  if (!previousState) {
    return currentState;
  }
  
  const delta: any = {};
  
  // Recursively find differences
  Object.keys(currentState).forEach(key => {
    if (typeof currentState[key] === 'object' && currentState[key] !== null) {
      const nestedDelta = compressGameState(currentState[key], previousState[key]);
      if (Object.keys(nestedDelta).length > 0) {
        delta[key] = nestedDelta;
      }
    } else if (currentState[key] !== previousState[key]) {
      delta[key] = currentState[key];
    }
  });
  
  return delta;
}

/**
 * Apply delta update to game state
 */
export function applyDeltaUpdate(state: any, delta: any): any {
  if (!delta || Object.keys(delta).length === 0) {
    return state;
  }
  
  const newState = { ...state };
  
  Object.keys(delta).forEach(key => {
    if (typeof delta[key] === 'object' && delta[key] !== null && typeof newState[key] === 'object') {
      newState[key] = applyDeltaUpdate(newState[key], delta[key]);
    } else {
      newState[key] = delta[key];
    }
  });
  
  return newState;
}