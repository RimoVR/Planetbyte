import { PlayerEntity } from '../../entities/PlayerEntity';
import { Vector2, WORLD_CONSTANTS } from '../../types/common';
import { EnvironmentalConditionManager } from './EnvironmentalConditionManager';
import { PlayerEquipmentManager } from './PlayerEquipmentManager';
import { AlliedViewSharing } from './AlliedViewSharing';
import { DistanceCalculator } from '../DistanceCalculator';
import { ViewDistanceMetrics } from '../../types/metrics';
import { FactionVisibility } from '../FactionVisibility';

/**
 * Manages view distance calculations for all players
 */
export class ViewDistanceManager {
  private environmentalManager: EnvironmentalConditionManager;
  private equipmentManager: PlayerEquipmentManager;
  private alliedViewSharing: AlliedViewSharing;
  private factionVisibility: FactionVisibility;
  private distanceCalculator: DistanceCalculator | null = null;
  private metrics: ViewDistanceMetrics;
  
  // Cache view distances to avoid recalculating every frame
  private viewDistanceCache: Map<string, ViewDistanceCacheEntry> = new Map();
  private cacheExpiryTime: number = 1000; // Cache expires after 1 second
  private cachePriorityThreshold: number = 5000; // Number of entries before priority-based eviction
  
  constructor() {
    this.environmentalManager = new EnvironmentalConditionManager();
    this.equipmentManager = new PlayerEquipmentManager();
    this.alliedViewSharing = new AlliedViewSharing();
    this.factionVisibility = new FactionVisibility();
    this.metrics = ViewDistanceMetrics.getInstance();
    
    console.log('ViewDistanceManager initialized');
  }
  
  /**
   * Set the distance calculator
   * @param calculator The distance calculator instance
   */
  setDistanceCalculator(calculator: DistanceCalculator): void {
    this.distanceCalculator = calculator;
    console.log('ViewDistanceManager: DistanceCalculator set');
  }
  
  /**
   * Initialize the view distance manager
   */
  initialize(): void {
    this.environmentalManager.initialize();
    
    // Set up periodic cache maintenance
    setInterval(() => this.maintainCache(), 5000);
    
    // Initialize the allied view sharing
    this.alliedViewSharing.clearCache();
    
    console.log('ViewDistanceManager fully initialized');
  }
  
  /**
   * Calculate the effective view distance for a player
   * @param player The player entity
   * @param allPlayers All player entities (for allied view sharing)
   * @returns The effective view distance
   */
  calculateViewDistance(player: PlayerEntity, allPlayers: PlayerEntity[]): number {
    const playerId = player.id;
    const now = Date.now();
    const startTime = performance.now();
    
    // Check if we have a cached value that's still valid
    if (
      this.viewDistanceCache.has(playerId) &&
      now - this.viewDistanceCache.get(playerId)!.timestamp < this.cacheExpiryTime
    ) {
      // Record cache hit
      this.metrics.recordCacheHit();
      return this.viewDistanceCache.get(playerId)!.viewDistance;
    }
    
    // Record cache miss
    this.metrics.recordCacheMiss();
    
    // Start with base view distance
    let viewDistance = WORLD_CONSTANTS.DEFAULT_VIEW_DISTANCE;
    
    // Apply environmental modifiers
    const environmentalModifier = this.environmentalManager.getVisibilityModifier(player.position);
    viewDistance += environmentalModifier;
    
    // Apply equipment and ability modifiers
    const equipmentModifier = this.equipmentManager.getViewDistanceModifier(player);
    viewDistance += equipmentModifier;
    
    // Apply allied view sharing
    const alliedModifier = this.alliedViewSharing.getAdditionalViewDistance(player, allPlayers);
    viewDistance += alliedModifier;
    
    // Ensure view distance is within bounds
    viewDistance = Math.max(WORLD_CONSTANTS.MIN_VIEW_DISTANCE, Math.min(WORLD_CONSTANTS.MAX_VIEW_DISTANCE, viewDistance));
    
    // Cache the calculated view distance
    this.viewDistanceCache.set(playerId, {
      viewDistance,
      timestamp: now,
      environmentalModifier,
      equipmentModifier,
      alliedModifier,
      // Default view cone values (will be updated in calculateViewCone)
      hasViewCone: false
    });
    
    // Record metrics
    const calculationTime = performance.now() - startTime;
    this.metrics.recordCalculationTime(calculationTime);
    this.metrics.recordViewDistance(viewDistance);
    this.metrics.recordCacheSize(this.viewDistanceCache.size);
    
    return viewDistance;
  }
  
  /**
   * Check if a target is visible to an observer
   * @param observer The observing player
   * @param target The target to check visibility for
   * @param allPlayers All player entities
   * @returns True if the target is visible
   */
  isVisible(observer: PlayerEntity, target: PlayerEntity, allPlayers: PlayerEntity[]): boolean {
    // First check faction-specific visibility rules (like stealth)
    if (!this.factionVisibility.canSee(observer, target)) {
      return false;
    }
    
    // If same faction, check direct visibility and allied visibility
    if (observer.faction === target.faction) {
      // Calculate distance between observer and target
      const distance = this.calculateDistance(observer.position, target.position);
      
      // Get observer's view distance
      const viewDistance = this.calculateViewDistance(observer, allPlayers);
      
      // Check direct visibility
      if (distance <= viewDistance) {
        return true;
      }
      
      // Check visibility through allies
      return this.alliedViewSharing.isVisibleThroughAllies(observer, target, allPlayers);
    }
    // If different faction, check direct visibility and view cone
    else {
      // Calculate distance between observer and target
      const distance = this.calculateDistance(observer.position, target.position);
      
      // Get observer's view distance
      const viewDistance = this.calculateViewDistance(observer, allPlayers);
      
      // Check if target is within base view distance
      if (distance <= viewDistance) {
        return true;
      }
      
      // Check if target is within view cone (extended visibility in facing direction)
      return this.isInViewCone(observer, target, allPlayers);
    }
  }
  
  /**
   * Check if a target is within the observer's view cone
   * @param observer The observing player
   * @param target The target to check
   * @param allPlayers All player entities
   * @returns True if the target is within the view cone
   */
  private isInViewCone(observer: PlayerEntity, target: PlayerEntity, allPlayers: PlayerEntity[]): boolean {
    // Use the player's rotation from the entity
    const rotation = observer.rotation;
    
    // Calculate view cone parameters if not already cached
    this.calculateViewCone(observer, allPlayers);
    
    // Get the cached entry
    const cacheEntry = this.viewDistanceCache.get(observer.id);
    if (!cacheEntry || !cacheEntry.hasViewCone) {
      return false;
    }
    
    // Calculate vector from observer to target
    const toTarget: Vector2 = {
      x: target.position.x - observer.position.x,
      y: target.position.y - observer.position.y
    };
    
    // Calculate distance to target
    const distance = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y);
    
    // If target is beyond the extended view cone distance, it's not visible
    if (distance > cacheEntry.viewConeDistance!) {
      return false;
    }
    
    // Calculate the angle between the observer's facing direction and the target
    const facingDirection = cacheEntry.viewConeDirection!;
    
    // Calculate dot product for angle comparison
    const dotProduct = (toTarget.x * facingDirection.x + toTarget.y * facingDirection.y) / distance;
    
    // Convert to angle in radians
    const angle = Math.acos(Math.min(1, Math.max(-1, dotProduct)));
    
    // Check if target is within the view cone angle
    const isInCone = angle <= cacheEntry.viewConeAngle! / 2;
    
    // Record metrics
    this.metrics.recordViewConeCheck(isInCone);
    
    return isInCone;
  }
  
  /**
   * Calculate and cache the view cone for a player
   * @param player The player entity
   * @param allPlayers All player entities
   */
  private calculateViewCone(player: PlayerEntity, allPlayers: PlayerEntity[]): void {
    const playerId = player.id;
    
    // If we don't have a cache entry or it doesn't have view cone data, calculate it
    if (!this.viewDistanceCache.has(playerId) || !this.viewDistanceCache.get(playerId)!.hasViewCone) {
      // Get the base view distance
      const viewDistance = this.calculateViewDistance(player, allPlayers);
      
      // Calculate facing direction vector from player's rotation
      const rotation = player.rotation;
      const facingDirection: Vector2 = {
        x: Math.cos(rotation),
        y: Math.sin(rotation)
      };
      
      // Define view cone parameters using constants
      const viewConeAngle = WORLD_CONSTANTS.VIEW_CONE_ANGLE;
      const viewConeDistance = viewDistance * WORLD_CONSTANTS.VIEW_CONE_DISTANCE_MULTIPLIER;
      
      // Update or create cache entry
      const cacheEntry = this.viewDistanceCache.get(playerId);
      if (cacheEntry) {
        // Update existing entry
        cacheEntry.hasViewCone = true;
        cacheEntry.viewConeDirection = facingDirection;
        cacheEntry.viewConeAngle = viewConeAngle;
        cacheEntry.viewConeDistance = viewConeDistance;
      } else {
        // Create new entry (shouldn't happen normally as calculateViewDistance should be called first)
        this.viewDistanceCache.set(playerId, {
          viewDistance,
          timestamp: Date.now(),
          environmentalModifier: 0,
          equipmentModifier: 0,
          alliedModifier: 0,
          hasViewCone: true,
          viewConeDirection: facingDirection,
          viewConeAngle: viewConeAngle,
          viewConeDistance: viewConeDistance
        });
      }
    }
  }
  
  /**
   * Calculate the distance between two positions
   * @param a First position
   * @param b Second position
   * @returns The distance between the positions
   */
  private calculateDistance(a: Vector2, b: Vector2): number {
    // Use the distance calculator if available
    if (this.distanceCalculator) {
      return this.distanceCalculator.calculateDistance(a, b);
    }
    
    // Fallback to direct calculation
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Maintain the view distance cache
   * - Remove expired entries
   * - Enforce cache size limits using priority-based eviction
   */
  private maintainCache(): void {
    const now = Date.now();
    
    // Remove expired entries
    for (const [playerId, entry] of this.viewDistanceCache.entries()) {
      if (now - entry.timestamp > this.cacheExpiryTime) {
        this.viewDistanceCache.delete(playerId);
      }
    }
    
    // If cache is still too large, evict entries based on priority
    if (this.viewDistanceCache.size > this.cachePriorityThreshold) {
      // Convert to array for sorting
      const entries = Array.from(this.viewDistanceCache.entries());
      
      // Sort by age (oldest first) and then by importance (least important first)
      entries.sort((a, b) => {
        // First compare by age
        const ageA = now - a[1].timestamp;
        const ageB = now - b[1].timestamp;
        
        if (ageA !== ageB) {
          return ageB - ageA; // Older entries first
        }
        
        // Then compare by importance (total modifier magnitude)
        const importanceA = Math.abs(a[1].environmentalModifier) +
                           Math.abs(a[1].equipmentModifier) +
                           Math.abs(a[1].alliedModifier);
        const importanceB = Math.abs(b[1].environmentalModifier) +
                           Math.abs(b[1].equipmentModifier) +
                           Math.abs(b[1].alliedModifier);
        
        return importanceA - importanceB; // Less important entries first
      });
      
      // Remove oldest, least important entries until we're under the threshold
      const entriesToRemove = entries.slice(0, entries.length - this.cachePriorityThreshold);
      for (const [playerId] of entriesToRemove) {
        this.viewDistanceCache.delete(playerId);
      }
    }
  }
  
  /**
   * Clear the view distance cache
   */
  clearCache(): void {
    this.viewDistanceCache.clear();
    this.alliedViewSharing.clearCache();
  }
  
  /**
   * Get the environmental condition manager
   */
  getEnvironmentalManager(): EnvironmentalConditionManager {
    return this.environmentalManager;
  }
  
  /**
   * Get the player equipment manager
   */
  getEquipmentManager(): PlayerEquipmentManager {
    return this.equipmentManager;
  }
  
  /**
   * Get the allied view sharing manager
   */
  getAlliedViewSharing(): AlliedViewSharing {
    return this.alliedViewSharing;
  }
  
  /**
   * Get the faction visibility manager
   */
  getFactionVisibility(): FactionVisibility {
    return this.factionVisibility;
  }
  
  /**
   * Get debug information about a player's view distance
   * @param playerId The player ID
   * @returns Debug information about the player's view distance
   */
  getDebugInfo(playerId: string): ViewDistanceDebugInfo | null {
    if (!this.viewDistanceCache.has(playerId)) {
      return null;
    }
    
    const entry = this.viewDistanceCache.get(playerId)!;
    
    // Find the player entity to get stealth information
    // This would be replaced with a proper entity lookup in a real implementation
    let stealthInfo = {
      hasStealthActive: false,
      stealthEffectiveness: 0,
      stealthState: 'UNKNOWN'
    };
    
    // In a real implementation, we would look up the player entity
    // For now, we'll just provide placeholder stealth information
    
    return {
      playerId,
      totalViewDistance: entry.viewDistance,
      baseViewDistance: WORLD_CONSTANTS.DEFAULT_VIEW_DISTANCE,
      environmentalModifier: entry.environmentalModifier,
      equipmentModifier: entry.equipmentModifier,
      alliedModifier: entry.alliedModifier,
      timestamp: entry.timestamp,
      age: Date.now() - entry.timestamp,
      // Include view cone information if available
      hasViewCone: entry.hasViewCone,
      viewConeAngle: entry.viewConeAngle,
      viewConeDistance: entry.viewConeDistance,
      // Include stealth information
      hasStealthActive: stealthInfo.hasStealthActive,
      stealthEffectiveness: stealthInfo.stealthEffectiveness,
      stealthState: stealthInfo.stealthState
    };
  }
  
  /**
   * Get performance metrics for the view distance system
   * @returns Performance metrics
   */
  getMetrics(): any {
    return this.metrics.getMetrics();
  }
  
  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getCacheStats(): any {
    return {
      size: this.viewDistanceCache.size,
      hitRate: this.metrics.getCacheHitRate(),
      viewConeHitRate: this.metrics.getViewConeHitRate()
    };
  }
}

/**
 * Cache entry for player view distance
 */
interface ViewDistanceCacheEntry {
  viewDistance: number;
  timestamp: number;
  environmentalModifier: number;
  equipmentModifier: number;
  alliedModifier: number;
  // View cone related fields
  hasViewCone: boolean;
  viewConeDirection?: Vector2;
  viewConeAngle?: number;
  viewConeDistance?: number;
}

/**
 * Debug information about a player's view distance
 */
export interface ViewDistanceDebugInfo {
  playerId: string;
  totalViewDistance: number;
  baseViewDistance: number;
  environmentalModifier: number;
  equipmentModifier: number;
  alliedModifier: number;
  timestamp: number;
  age: number;
  // View cone information
  hasViewCone?: boolean;
  viewConeAngle?: number;
  viewConeDistance?: number;
  // Stealth information
  hasStealthActive?: boolean;
  stealthEffectiveness?: number;
  stealthState?: string;
}