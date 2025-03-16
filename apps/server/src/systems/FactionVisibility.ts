import { PlayerEntity } from '../entities/PlayerEntity';
import { Faction } from '../components/Faction';
import { StealthState } from '../components/Stealth';
import { WORLD_CONSTANTS } from '../types/common';
import { PlayerEquipmentManager } from './visibility/PlayerEquipmentManager';

/**
 * Manages visibility rules between factions
 */
export class FactionVisibility {
  // Minimum distance at which stealth can be detected regardless of equipment
  private readonly STEALTH_PROXIMITY_DETECTION = 10;
  private equipmentManager: PlayerEquipmentManager;
  
  constructor() {
    this.equipmentManager = new PlayerEquipmentManager();
  }

  /**
   * Check if an observer can see a target based on faction rules
   * @param observer The observing player
   * @param target The target player
   * @returns True if the target is visible to the observer
   */
  canSee(observer: PlayerEntity, target: PlayerEntity): boolean {
    // Same faction always visible (handled by allied view sharing)
    if (observer.faction === target.faction) {
      return true;
    }

    // Check if target has stealth active
    if (this.hasStealthActive(target)) {
      // Calculate distance between observer and target
      const distance = this.calculateDistance(observer.position, target.position);
      
      // Very close targets can be detected regardless of stealth
      if (distance <= this.STEALTH_PROXIMITY_DETECTION) {
        return true;
      }
      
      // Check if observer can detect stealth
      if (this.canDetectStealth(observer)) {
        // Get the stealth detection range
        const detectionRange = this.getStealthDetectionRange(observer);
        
        // If target is within detection range, they are visible
        if (distance <= detectionRange) {
          return true;
        }
      }
      
      // Get stealth effectiveness (0-1)
      const stealthEffectiveness = target.getStealthEffectiveness();
      
      // If not fully stealthed, there's a chance to be seen based on effectiveness
      if (stealthEffectiveness < 1.0) {
        // Calculate detection chance based on distance and stealth effectiveness
        // The further away and more effective the stealth, the lower the chance
        const detectionChance = (1 - stealthEffectiveness) * (1 - distance / WORLD_CONSTANTS.DEFAULT_VIEW_DISTANCE);
        
        // Random check for detection
        return Math.random() < detectionChance;
      }
      
      // Fully stealthed and not detected
      return false;
    }

    // No stealth active, visibility determined by distance and environmental factors
    // This is handled by the ViewDistanceManager
    return true;
  }
  
  /**
   * Check if a player has stealth active
   * @param player The player to check
   * @returns True if the player has stealth active
   */
  hasStealthActive(player: PlayerEntity): boolean {
    return player.hasStealthActive();
  }
  
  /**
   * Check if an observer can detect stealth
   * @param observer The observing player
   * @returns True if the observer can detect stealth
   */
  canDetectStealth(observer: PlayerEntity): boolean {
    // Use the equipment manager to check for stealth detection equipment and abilities
    return this.equipmentManager.canDetectStealth(observer);
  }
  
  /**
   * Get the stealth detection range for a player
   * @param observer The observing player
   * @returns The stealth detection range
   */
  getStealthDetectionRange(observer: PlayerEntity): number {
    return this.equipmentManager.getStealthDetectionRange(observer);
  }
  
  /**
   * Calculate the distance between two positions
   * @param a First position
   * @param b Second position
   * @returns The distance between the positions
   */
  private calculateDistance(a: { x: number, y: number }, b: { x: number, y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}