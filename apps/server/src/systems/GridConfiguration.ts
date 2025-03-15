import { InterestMetrics } from '../types/metrics';

/**
 * Configuration for the adaptive grid cell sizing system.
 * Manages parameters that control how grid cells resize based on player density.
 */
export class GridConfiguration {
  // Minimum cell dimension in game units
  private minCellSize: number;
  
  // Maximum cell dimension in game units
  private maxCellSize: number;
  
  // Player count below which cells should expand
  private densityThresholdLow: number;
  
  // Player count above which cells should shrink
  private densityThresholdHigh: number;
  
  // How quickly cells resize (prevents abrupt changes)
  private adaptationRate: number;
  
  // Metrics instance for tracking grid configuration changes
  private metrics: InterestMetrics;
  
  /**
   * Creates a new GridConfiguration instance.
   * 
   * @param initialGridSize Initial grid cell size in game units
   * @param minCellSize Minimum cell dimension in game units
   * @param maxCellSize Maximum cell dimension in game units
   * @param densityThresholdLow Player count below which cells should expand
   * @param densityThresholdHigh Player count above which cells should shrink
   * @param adaptationRate How quickly cells resize (0-1, where 1 is immediate)
   */
  constructor(
    initialGridSize: number = 100,
    minCellSize: number = 50,
    maxCellSize: number = 200,
    densityThresholdLow: number = 3,
    densityThresholdHigh: number = 10,
    adaptationRate: number = 0.2
  ) {
    this.minCellSize = minCellSize;
    this.maxCellSize = maxCellSize;
    this.densityThresholdLow = densityThresholdLow;
    this.densityThresholdHigh = densityThresholdHigh;
    this.adaptationRate = adaptationRate;
    this.metrics = InterestMetrics.getInstance();
    
    // Log initial configuration
    console.log(`GridConfiguration initialized: size=${initialGridSize}, min=${minCellSize}, max=${maxCellSize}, lowThreshold=${densityThresholdLow}, highThreshold=${densityThresholdHigh}, adaptationRate=${adaptationRate}`);
  }
  
  /**
   * Calculates the optimal cell size based on player density.
   * 
   * @param density Number of players in the cell
   * @param currentSize Current cell size
   * @returns Optimal cell size for the given density
   */
  calculateOptimalSize(density: number, currentSize: number): number {
    let targetSize = currentSize;
    
    // If density is below the low threshold, increase cell size
    if (density < this.densityThresholdLow) {
      // Scale up proportionally to how far below threshold
      const scaleFactor = 1 + ((this.densityThresholdLow - density) / this.densityThresholdLow);
      targetSize = currentSize * scaleFactor;
    } 
    // If density is above the high threshold, decrease cell size
    else if (density > this.densityThresholdHigh) {
      // Scale down proportionally to how far above threshold
      const scaleFactor = 1 - ((density - this.densityThresholdHigh) / (density * 2));
      targetSize = currentSize * Math.max(0.5, scaleFactor); // Never scale below 50%
    }
    
    // Apply adaptation rate to smooth changes
    const newSize = currentSize + (targetSize - currentSize) * this.adaptationRate;
    
    // Clamp to min/max range
    const clampedSize = Math.max(this.minCellSize, Math.min(this.maxCellSize, newSize));
    
    // Log significant changes
    if (Math.abs(clampedSize - currentSize) > 1) {
      console.log(`Cell size adjustment: ${currentSize.toFixed(2)} -> ${clampedSize.toFixed(2)} (density: ${density})`);
    }
    
    return clampedSize;
  }
  
  /**
   * Gets the minimum cell size.
   */
  getMinCellSize(): number {
    return this.minCellSize;
  }
  
  /**
   * Gets the maximum cell size.
   */
  getMaxCellSize(): number {
    return this.maxCellSize;
  }
  
  /**
   * Gets the low density threshold.
   */
  getDensityThresholdLow(): number {
    return this.densityThresholdLow;
  }
  
  /**
   * Gets the high density threshold.
   */
  getDensityThresholdHigh(): number {
    return this.densityThresholdHigh;
  }
  
  /**
   * Gets the adaptation rate.
   */
  getAdaptationRate(): number {
    return this.adaptationRate;
  }
  
  /**
   * Updates configuration parameters.
   * 
   * @param params Object containing parameters to update
   */
  updateConfiguration(params: {
    minCellSize?: number,
    maxCellSize?: number,
    densityThresholdLow?: number,
    densityThresholdHigh?: number,
    adaptationRate?: number
  }): void {
    if (params.minCellSize !== undefined) this.minCellSize = params.minCellSize;
    if (params.maxCellSize !== undefined) this.maxCellSize = params.maxCellSize;
    if (params.densityThresholdLow !== undefined) this.densityThresholdLow = params.densityThresholdLow;
    if (params.densityThresholdHigh !== undefined) this.densityThresholdHigh = params.densityThresholdHigh;
    if (params.adaptationRate !== undefined) this.adaptationRate = params.adaptationRate;
    
    // Log configuration update
    console.log(`GridConfiguration updated: min=${this.minCellSize}, max=${this.maxCellSize}, lowThreshold=${this.densityThresholdLow}, highThreshold=${this.densityThresholdHigh}, adaptationRate=${this.adaptationRate}`);
  }
}