import { Component } from '@colyseus/ecs';
import { PlayerEntity } from '../entities/PlayerEntity';
import { GridCellTracker, GridCell } from './GridCellTracker';
import { DistanceCalculator } from './DistanceCalculator';
import { FactionVisibility } from './FactionVisibility';
import { InterestMetrics } from '../types/metrics';

export class InterestManager {
  private gridCellTracker: GridCellTracker;
  private distanceCalculator: DistanceCalculator;
  private factionVisibility: FactionVisibility;
  private metrics: InterestMetrics;

  constructor(gridSize: number, viewDistance: number) {
    this.gridCellTracker = new GridCellTracker(gridSize);
    this.distanceCalculator = new DistanceCalculator(viewDistance);
    this.factionVisibility = new FactionVisibility();
    this.metrics = InterestMetrics.getInstance();
  }

  getRelevantEntities(player: PlayerEntity): PlayerEntity[] {
    // Start performance timer
    this.metrics.startProcessingTimer();
    
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
    return candidates.filter(entity => 
      this.distanceCalculator.isInRange(player, entity) &&
      this.factionVisibility.canSee(player, entity)
    );
  }
}