import { PlayerEntity } from '../entities/PlayerEntity';

export interface GridCell {
  x: number;
  y: number;
  entities: PlayerEntity[];
}

export class GridCellTracker {
  private gridSize: number;
  private cells: Map<string, GridCell> = new Map();

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  getCurrentCell(entity: PlayerEntity): GridCell {
    const x = Math.floor(entity.position.x / this.gridSize);
    const y = Math.floor(entity.position.y / this.gridSize);
    const key = `${x},${y}`;

    if (!this.cells.has(key)) {
      this.cells.set(key, { x, y, entities: [] });
    }

    return this.cells.get(key)!;
  }

  getNeighborCells(cell: GridCell): GridCell[] {
    const neighbors: GridCell[] = [];
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip self
        
        const key = `${cell.x + dx},${cell.y + dy}`;
        if (this.cells.has(key)) {
          neighbors.push(this.cells.get(key)!);
        }
      }
    }

    return neighbors;
  }
}