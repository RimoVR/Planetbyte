import { Component } from '@colyseus/ecs';
import { PlayerEntity } from '../entities/PlayerEntity';
import { GridCellTracker } from './GridCellTracker';
import { DistanceCalculator } from './DistanceCalculator';
import { FactionVisibility } from './FactionVisibility';

export class InterestManager {
  private gridCellTracker: GridCellTracker;
  private distanceCalculator: DistanceCalculator;
  private factionVisibility: FactionVisibility;

  constructor(gridSize: number, viewDistance: number) {
    this.gridCellTracker = new GridCellTracker(gridSize);
    this.distanceCalculator = new DistanceCalculator(viewDistance);
    this.factionVisibility = new FactionVisibility();
  }

  getRelevantEntities(player: PlayerEntity): PlayerEntity[] {
    const currentCell = this.gridCellTracker.getCurrentCell(player);
    const neighbors = this.gridCellTracker.getNeighborCells(currentCell);
    
    return this.filterEntities(
      player,
      [...currentCell.entities, ...neighbors.flatMap((c: GridCell) => c.entities)]
    );
  }

  private filterEntities(player: PlayerEntity, candidates: PlayerEntity[]): PlayerEntity[] {
    return candidates.filter(entity => 
      this.distanceCalculator.isInRange(player, entity) &&
      this.factionVisibility.canSee(player, entity)
    );
  }
}