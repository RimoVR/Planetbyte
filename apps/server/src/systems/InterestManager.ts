import { Component } from '@colyseus/ecs';
import { PlayerEntity } from '../entities/PlayerEntity';
import { GridCellTracker, GridCell } from './GridCellTracker';
import { DistanceCalculator } from './DistanceCalculator';
import { FactionVisibility } from './FactionVisibility';
import { InterestMetrics } from '../types/metrics';
import { GridConfiguration } from './GridConfiguration';
import { PlayerDensityAnalyzer } from './PlayerDensityAnalyzer';

export class InterestManager {
  private gridCellTracker: GridCellTracker;
  private distanceCalculator: DistanceCalculator;
  private factionVisibility: FactionVisibility;
  private metrics: InterestMetrics;
  private lastAdaptiveUpdateTime: number = 0;
  private adaptiveUpdateInterval: number = 60000; // 1 minute

  constructor(
    gridSize: number,
    viewDistance: number,
    adaptiveGridSizing: boolean = true
  ) {
    // Create grid configuration if using adaptive sizing
    const gridConfig = adaptiveGridSizing ? new GridConfiguration(gridSize) : undefined;
    
    // Create density analyzer if using adaptive sizing
    const densityAnalyzer = adaptiveGridSizing ? new PlayerDensityAnalyzer() : undefined;
    
    // Create grid cell tracker with optional adaptive components
    this.gridCellTracker = new GridCellTracker(gridSize, gridConfig, densityAnalyzer);
    
    this.distanceCalculator = new DistanceCalculator(viewDistance);
    this.factionVisibility = new FactionVisibility();
    this.metrics = InterestMetrics.getInstance();
    
    console.log(`InterestManager initialized with ${adaptiveGridSizing ? 'adaptive' : 'fixed'} grid sizing`);
  }

  getRelevantEntities(player: PlayerEntity): PlayerEntity[] {
    // Start performance timer
    this.metrics.startProcessingTimer();
    
    // Check if we should update adaptive grid sizing
    this.checkAdaptiveGridUpdate();
    
    const currentCell = this.gridCellTracker.getCurrentCell(player);
    const neighbors = this.gridCellTracker.getNeighborCells(currentCell);
    
    // Record grid cell density
    this.metrics.recordGridCellDensity(currentCell.entities.length);
    
    // Get all candidate entities from current cell and neighbors
    const candidateEntities = [
      ...currentCell.entities,
      ...neighbors.flatMap((c: GridCell) => c.entities)
    ];
    
    // Filter entities based on distance and visibility
    const relevantEntities = this.filterEntities(player, candidateEntities);
    
    // Record entity counts for metrics
    this.metrics.recordEntityCounts(candidateEntities.length, relevantEntities.length);
    
    // Stop performance timer
    this.metrics.stopProcessingTimer();
    
    return relevantEntities;
  }

  private filterEntities(player: PlayerEntity, candidates: PlayerEntity[]): PlayerEntity[] {
    // Remove duplicates (an entity might be in multiple cells with adaptive sizing)
    const uniqueCandidates = Array.from(new Set(candidates));
    
    return uniqueCandidates.filter(entity =>
      entity !== player && // Don't include self
      this.distanceCalculator.isInRange(player, entity) &&
      this.factionVisibility.canSee(player, entity)
    );
  }
  
  /**
   * Checks if adaptive grid update should be performed and triggers it if needed.
   */
  private checkAdaptiveGridUpdate(): void {
    const now = Date.now();
    if (now - this.lastAdaptiveUpdateTime >= this.adaptiveUpdateInterval) {
      this.lastAdaptiveUpdateTime = now;
      
      // Update cell sizes based on player density
      this.gridCellTracker.updateCellSizes();
    }
  }
  
  /**
   * Sets the adaptive update interval.
   *
   * @param interval New interval in milliseconds
   */
  setAdaptiveUpdateInterval(interval: number): void {
    this.adaptiveUpdateInterval = interval;
    console.log(`InterestManager adaptive update interval set to ${interval}ms`);
  }
  
  /**
   * Gets the grid cell tracker.
   */
  getGridCellTracker(): GridCellTracker {
    return this.gridCellTracker;
  }
  
  /**
   * Gets the distance calculator.
   */
  getDistanceCalculator(): DistanceCalculator {
    return this.distanceCalculator;
  }
  
  /**
   * Gets the faction visibility.
   */
  getFactionVisibility(): FactionVisibility {
    return this.factionVisibility;
  }
}