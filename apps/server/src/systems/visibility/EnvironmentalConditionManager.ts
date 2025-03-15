import { Vector2, WORLD_CONSTANTS } from '../../types/common';

/**
 * Manages environmental conditions that affect visibility
 */
export class EnvironmentalConditionManager {
  private isNight: boolean = false;
  private currentWeather: WeatherCondition | null = null;
  private activeHazards: Map<string, EnvironmentalHazard> = new Map();
  private lastDayNightUpdate: number = Date.now();
  private lastWeatherUpdate: number = Date.now();
  private lastHazardCheck: number = Date.now();

  /**
   * Initialize the environmental condition manager
   */
  initialize(): void {
    // Set initial day/night state
    this.updateDayNightCycle();
    
    // Set initial weather
    this.updateWeather();
    
    // Start periodic updates
    setInterval(() => this.updateDayNightCycle(), 60000); // Check every minute
    setInterval(() => this.updateWeather(), WORLD_CONSTANTS.WEATHER_UPDATE_INTERVAL);
    setInterval(() => this.checkForHazards(), WORLD_CONSTANTS.HAZARD_CHECK_INTERVAL);
    
    console.log('EnvironmentalConditionManager initialized');
  }
  
  /**
   * Get the visibility modifier for a specific position
   * @param position The position to check
   * @returns The visibility modifier (negative values reduce view distance)
   */
  getVisibilityModifier(position: Vector2): number {
    let modifier = 0;
    
    // Apply day/night modifier
    if (this.isNight) {
      modifier += WORLD_CONSTANTS.NIGHT_VIEW_DISTANCE_MODIFIER;
    }
    
    // Apply weather modifier
    if (this.currentWeather) {
      modifier += this.getWeatherModifier(this.currentWeather);
    }
    
    // Apply hazard modifiers for hazards affecting this position
    for (const hazard of this.activeHazards.values()) {
      if (this.isPositionAffectedByHazard(position, hazard)) {
        modifier += this.getHazardModifier(hazard);
      }
    }
    
    return modifier;
  }
  
  /**
   * Update the day/night cycle
   */
  private updateDayNightCycle(): void {
    const now = Date.now();
    const elapsed = now - this.lastDayNightUpdate;
    this.lastDayNightUpdate = now;
    
    // Calculate day/night based on cycle duration
    const cyclePosition = (now % WORLD_CONSTANTS.DAY_NIGHT_CYCLE_DURATION) / WORLD_CONSTANTS.DAY_NIGHT_CYCLE_DURATION;
    const wasNight = this.isNight;
    this.isNight = cyclePosition >= 0.5; // Night for half the cycle
    
    // Log change if state changed
    if (wasNight !== this.isNight) {
      console.log(`Day/night cycle changed to ${this.isNight ? 'night' : 'day'}`);
    }
  }
  
  /**
   * Update the current weather
   */
  private updateWeather(): void {
    const now = Date.now();
    this.lastWeatherUpdate = now;
    
    // Random chance to change weather
    const changeWeather = Math.random() < 0.3; // 30% chance to change weather
    
    if (changeWeather || !this.currentWeather) {
      const previousWeather = this.currentWeather;
      
      // Select a random weather condition
      const weatherTypes: WeatherCondition[] = ['clear', 'fog', 'rain', 'storm'];
      const weights = [0.5, 0.2, 0.2, 0.1]; // Probabilities for each type
      
      this.currentWeather = this.weightedRandomSelection(weatherTypes, weights);
      
      if (previousWeather !== this.currentWeather) {
        console.log(`Weather changed from ${previousWeather || 'none'} to ${this.currentWeather}`);
      }
    }
  }
  
  /**
   * Check for environmental hazards
   */
  private checkForHazards(): void {
    const now = Date.now();
    this.lastHazardCheck = now;
    
    // Random chance to spawn a new hazard
    const spawnHazard = Math.random() < 0.1; // 10% chance to spawn a hazard
    
    if (spawnHazard) {
      const hazardTypes: HazardType[] = ['toxic_gas', 'meteor_strike', 'electrical_storm'];
      const weights = [0.4, 0.3, 0.3]; // Probabilities for each type
      
      const hazardType = this.weightedRandomSelection(hazardTypes, weights);
      const hazardId = `${hazardType}_${now}`;
      
      // Create a random position for the hazard
      const position: Vector2 = {
        x: Math.random() * WORLD_CONSTANTS.MAP_WIDTH * WORLD_CONSTANTS.TILE_SIZE,
        y: Math.random() * WORLD_CONSTANTS.MAP_HEIGHT * WORLD_CONSTANTS.TILE_SIZE
      };
      
      // Create the hazard with a random radius and duration
      const hazard: EnvironmentalHazard = {
        id: hazardId,
        type: hazardType,
        position,
        radius: 500 + Math.random() * 1000, // 500-1500 units
        startTime: now,
        duration: 300000 + Math.random() * 600000 // 5-15 minutes
      };
      
      this.activeHazards.set(hazardId, hazard);
      console.log(`New environmental hazard: ${hazardType} at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`);
      
      // Set timeout to remove the hazard when it expires
      setTimeout(() => {
        this.activeHazards.delete(hazardId);
        console.log(`Environmental hazard ${hazardId} has dissipated`);
      }, hazard.duration);
    }
    
    // Clean up expired hazards
    for (const [id, hazard] of this.activeHazards.entries()) {
      if (now - hazard.startTime > hazard.duration) {
        this.activeHazards.delete(id);
        console.log(`Environmental hazard ${id} has dissipated`);
      }
    }
  }
  
  /**
   * Check if a position is affected by a hazard
   * @param position The position to check
   * @param hazard The hazard to check against
   * @returns True if the position is affected by the hazard
   */
  private isPositionAffectedByHazard(position: Vector2, hazard: EnvironmentalHazard): boolean {
    const dx = position.x - hazard.position.x;
    const dy = position.y - hazard.position.y;
    const distanceSquared = dx * dx + dy * dy;
    
    return distanceSquared <= hazard.radius * hazard.radius;
  }
  
  /**
   * Get the visibility modifier for a weather condition
   * @param weather The weather condition
   * @returns The visibility modifier
   */
  private getWeatherModifier(weather: WeatherCondition): number {
    switch (weather) {
      case 'fog':
        return WORLD_CONSTANTS.FOG_VIEW_DISTANCE_MODIFIER;
      case 'rain':
        return WORLD_CONSTANTS.RAIN_VIEW_DISTANCE_MODIFIER;
      case 'storm':
        return WORLD_CONSTANTS.STORM_VIEW_DISTANCE_MODIFIER;
      case 'clear':
      default:
        return 0;
    }
  }
  
  /**
   * Get the visibility modifier for a hazard
   * @param hazard The environmental hazard
   * @returns The visibility modifier
   */
  private getHazardModifier(hazard: EnvironmentalHazard): number {
    switch (hazard.type) {
      case 'toxic_gas':
        return WORLD_CONSTANTS.TOXIC_GAS_VIEW_DISTANCE_MODIFIER;
      case 'meteor_strike':
        return WORLD_CONSTANTS.METEOR_STRIKE_VIEW_DISTANCE_MODIFIER;
      case 'electrical_storm':
        return WORLD_CONSTANTS.STORM_VIEW_DISTANCE_MODIFIER;
      default:
        return 0;
    }
  }
  
  /**
   * Select a random item from an array based on weights
   * @param items The array of items
   * @param weights The array of weights
   * @returns A randomly selected item
   */
  private weightedRandomSelection<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[0]; // Fallback
  }
  
  /**
   * Get the current day/night state
   * @returns True if it's night, false if it's day
   */
  isNighttime(): boolean {
    return this.isNight;
  }
  
  /**
   * Get the current weather condition
   * @returns The current weather condition
   */
  getCurrentWeather(): WeatherCondition | null {
    return this.currentWeather;
  }
  
  /**
   * Get all active environmental hazards
   * @returns A map of active hazards
   */
  getActiveHazards(): Map<string, EnvironmentalHazard> {
    return this.activeHazards;
  }
}

// Types
export type WeatherCondition = 'clear' | 'fog' | 'rain' | 'storm';
export type HazardType = 'toxic_gas' | 'meteor_strike' | 'electrical_storm';

export interface EnvironmentalHazard {
  id: string;
  type: HazardType;
  position: Vector2;
  radius: number;
  startTime: number;
  duration: number;
}