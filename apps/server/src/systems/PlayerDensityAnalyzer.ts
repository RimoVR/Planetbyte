import { GridCell } from './GridCellTracker';
import { InterestMetrics } from '../types/metrics';

/**
 * Interface for density hotspot information
 */
export interface DensityHotspot {
  cellKey: string;
  density: number;
  x: number;
  y: number;
}

/**
 * Analyzes player density across grid cells to identify hotspots and coldspots.
 * This information is used to drive adaptive grid cell sizing.
 */
export class PlayerDensityAnalyzer {
  // Map of cell keys to their current density
  private cellDensities: Map<string, number> = new Map();
  
  // Timestamp of last density analysis
  private lastAnalysisTime: number = 0;
  
  // Analysis interval in milliseconds
  private analysisInterval: number = 30000; // 30 seconds
  
  // Metrics instance for tracking density information
  private metrics: InterestMetrics;
  
  /**
   * Creates a new PlayerDensityAnalyzer instance.
   * 
   * @param analysisInterval How often to perform full analysis (ms)
   */
  constructor(analysisInterval: number = 30000) {
    this.analysisInterval = analysisInterval;
    this.metrics = InterestMetrics.getInstance();
    console.log(`PlayerDensityAnalyzer initialized with interval: ${analysisInterval}ms`);
  }
  
  /**
   * Analyzes player density across a collection of grid cells.
   * 
   * @param cells Map of cell keys to grid cells
   * @param forceFullAnalysis Whether to force a full analysis regardless of time
   * @returns Whether a full analysis was performed
   */
  analyzeDensity(cells: Map<string, GridCell>, forceFullAnalysis: boolean = false): boolean {
    const now = Date.now();
    const timeSinceLastAnalysis = now - this.lastAnalysisTime;
    
    // Check if we should perform a full analysis
    const shouldPerformFullAnalysis = forceFullAnalysis || timeSinceLastAnalysis >= this.analysisInterval;
    
    // Update density information for all cells
    let totalEntities = 0;
    let cellCount = 0;
    
    cells.forEach((cell, key) => {
      const density = cell.entities.length;
      this.cellDensities.set(key, density);
      totalEntities += density;
      cellCount++;
    });
    
    // Calculate average density
    const averageDensity = cellCount > 0 ? totalEntities / cellCount : 0;
    
    // If performing full analysis, log detailed information
    if (shouldPerformFullAnalysis) {
      this.lastAnalysisTime = now;
      
      // Get hotspots and coldspots
      const hotspots = this.getDensityHotspots();
      const coldspots = this.getDensityColdspots();
      
      // Log analysis results
      console.log(`Density analysis: ${totalEntities} entities in ${cellCount} cells (avg: ${averageDensity.toFixed(2)})`);
      console.log(`Hotspots: ${hotspots.length}, Coldspots: ${coldspots.length}`);
      
      // Log top 3 hotspots and coldspots
      if (hotspots.length > 0) {
        console.log(`Top hotspots: ${hotspots.slice(0, 3).map(h => `(${h.x},${h.y}): ${h.density}`).join(', ')}`);
      }
      
      if (coldspots.length > 0) {
        console.log(`Top coldspots: ${coldspots.slice(0, 3).map(c => `(${c.x},${c.y}): ${c.density}`).join(', ')}`);
      }
    }
    
    return shouldPerformFullAnalysis;
  }
  
  /**
   * Gets density hotspots (cells with higher than average density).
   * 
   * @param limit Maximum number of hotspots to return
   * @returns Array of density hotspots, sorted by density (highest first)
   */
  getDensityHotspots(limit: number = 10): DensityHotspot[] {
    // Calculate average density
    let totalDensity = 0;
    this.cellDensities.forEach(density => totalDensity += density);
    const averageDensity = this.cellDensities.size > 0 ? totalDensity / this.cellDensities.size : 0;
    
    // Find cells with above average density
    const hotspots: DensityHotspot[] = [];
    
    this.cellDensities.forEach((density, key) => {
      if (density > averageDensity) {
        const [x, y] = key.split(',').map(Number);
        hotspots.push({ cellKey: key, density, x, y });
      }
    });
    
    // Sort by density (highest first) and limit results
    return hotspots
      .sort((a, b) => b.density - a.density)
      .slice(0, limit);
  }
  
  /**
   * Gets density coldspots (cells with lower than average density).
   * 
   * @param limit Maximum number of coldspots to return
   * @returns Array of density coldspots, sorted by density (lowest first)
   */
  getDensityColdspots(limit: number = 10): DensityHotspot[] {
    // Calculate average density
    let totalDensity = 0;
    this.cellDensities.forEach(density => totalDensity += density);
    const averageDensity = this.cellDensities.size > 0 ? totalDensity / this.cellDensities.size : 0;
    
    // Find cells with below average density
    const coldspots: DensityHotspot[] = [];
    
    this.cellDensities.forEach((density, key) => {
      if (density < averageDensity && density > 0) { // Only include cells with at least one entity
        const [x, y] = key.split(',').map(Number);
        coldspots.push({ cellKey: key, density, x, y });
      }
    });
    
    // Sort by density (lowest first) and limit results
    return coldspots
      .sort((a, b) => a.density - b.density)
      .slice(0, limit);
  }
  
  /**
   * Gets the density for a specific cell.
   * 
   * @param cellKey Key of the cell to get density for
   * @returns Density of the cell, or 0 if not found
   */
  getCellDensity(cellKey: string): number {
    return this.cellDensities.get(cellKey) || 0;
  }
  
  /**
   * Gets the average density across all cells.
   * 
   * @returns Average density
   */
  getAverageDensity(): number {
    let totalDensity = 0;
    this.cellDensities.forEach(density => totalDensity += density);
    return this.cellDensities.size > 0 ? totalDensity / this.cellDensities.size : 0;
  }
  
  /**
   * Sets the analysis interval.
   * 
   * @param interval New interval in milliseconds
   */
  setAnalysisInterval(interval: number): void {
    this.analysisInterval = interval;
    console.log(`PlayerDensityAnalyzer interval updated: ${interval}ms`);
  }
}