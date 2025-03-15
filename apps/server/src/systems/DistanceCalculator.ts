import { PlayerEntity } from '../entities/PlayerEntity';
import { Vector2 } from '../types/common';
import { ViewDistanceManager } from './visibility/ViewDistanceManager';

export class DistanceCalculator {
  private baseViewDistance: number;
  private viewDistanceManager: ViewDistanceManager | null = null;
  private allPlayers: PlayerEntity[] = [];

  constructor(baseViewDistance: number) {
    this.baseViewDistance = baseViewDistance;
  }

  /**
   * Set the view distance manager
   * @param manager The view distance manager
   */
  setViewDistanceManager(manager: ViewDistanceManager): void {
    this.viewDistanceManager = manager;
    console.log('DistanceCalculator: ViewDistanceManager set');
  }

  /**
   * Set all players (needed for allied view sharing)
   * @param players All player entities
   */
  setAllPlayers(players: PlayerEntity[]): void {
    this.allPlayers = players;
  }

  /**
   * Check if a target is in range of an observer
   * @param observer The observing player
   * @param target The target player
   * @returns True if the target is in range
   */
  isInRange(observer: PlayerEntity, target: PlayerEntity): boolean {
    const distance = this.calculateDistance(observer.position, target.position);
    const effectiveViewDistance = this.getEffectiveViewDistance(observer);
    return distance <= effectiveViewDistance;
  }

  /**
   * Calculate the distance between two positions
   * @param a First position
   * @param b Second position
   * @returns The distance between the positions
   */
  calculateDistance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Filter entities by distance from an observer
   * @param observer The observing player
   * @param entities The entities to filter
   * @param maxDistance The maximum distance (if not provided, uses the observer's view distance)
   * @returns Entities within the specified distance
   */
  filterByDistance(observer: PlayerEntity, entities: PlayerEntity[], maxDistance?: number): PlayerEntity[] {
    const viewDistance = maxDistance !== undefined ? maxDistance : this.getEffectiveViewDistance(observer);
    
    return entities.filter(entity => {
      if (entity === observer) return false; // Skip self
      
      const distance = this.calculateDistance(observer.position, entity.position);
      return distance <= viewDistance;
    });
  }

  /**
   * Get the effective view distance for a player
   * @param player The player entity
   * @returns The effective view distance
   */
  private getEffectiveViewDistance(player: PlayerEntity): number {
    // If we have a view distance manager, use it
    if (this.viewDistanceManager) {
      return this.viewDistanceManager.calculateViewDistance(player, this.allPlayers);
    }
    
    // Fallback to simple calculation
    let viewDistance = this.baseViewDistance;

    // Apply player-specific modifiers
    viewDistance *= player.viewDistance;

    return viewDistance;
  }
}