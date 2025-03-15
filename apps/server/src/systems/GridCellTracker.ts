import { PlayerEntity } from '../entities/PlayerEntity';
import { GridConfiguration } from './GridConfiguration';
import { PlayerDensityAnalyzer } from './PlayerDensityAnalyzer';
import { InterestMetrics } from '../types/metrics';

export interface GridCell {
  x: number;
  y: number;
  entities: PlayerEntity[];
  width: number;
  height: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export class GridCellTracker {
  private defaultGridSize: number;
  private cells: Map<string, GridCell> = new Map();
  private gridConfig: GridConfiguration;
  private densityAnalyzer: PlayerDensityAnalyzer;
  private metrics: InterestMetrics;
  private lastResizeTime: number = 0;
  private resizeInterval: number = 60000; // 1 minute

  constructor(
    defaultGridSize: number,
    gridConfig?: GridConfiguration,
    densityAnalyzer?: PlayerDensityAnalyzer
  ) {
    this.defaultGridSize = defaultGridSize;
    this.gridConfig = gridConfig || new GridConfiguration(defaultGridSize);
    this.densityAnalyzer = densityAnalyzer || new PlayerDensityAnalyzer();
    this.metrics = InterestMetrics.getInstance();
    
    console.log(`GridCellTracker initialized with default size: ${defaultGridSize}`);
  }

  /**
   * Gets the current cell for an entity based on its position.
   * Creates the cell if it doesn't exist.
   */
  getCurrentCell(entity: PlayerEntity): GridCell {
    // Find the cell that contains this position
    const cellKey = this.getCellKeyForPosition(entity.position);
    
    // Create cell if it doesn't exist
    if (!this.cells.has(cellKey)) {
      const [x, y] = cellKey.split(',').map(Number);
      this.cells.set(cellKey, {
        x,
        y,
        entities: [],
        width: this.defaultGridSize,
        height: this.defaultGridSize
      });
    }
    
    const cell = this.cells.get(cellKey)!;
    
    // Add entity to cell if not already present
    if (!cell.entities.includes(entity)) {
      // Remove from any other cells first
      this.removeEntityFromAllCells(entity);
      cell.entities.push(entity);
    }
    
    return cell;
  }

  /**
   * Gets neighboring cells for a given cell.
   * Handles variable-sized cells by checking actual boundaries.
   */
  getNeighborCells(cell: GridCell): GridCell[] {
    const neighbors: GridCell[] = [];
    const cellBounds = this.getCellBounds(cell);
    
    // Check all cells to find neighbors (less efficient but handles variable sizes)
    this.cells.forEach((otherCell, key) => {
      if (otherCell === cell) return; // Skip self
      
      const otherBounds = this.getCellBounds(otherCell);
      
      // Check if cells are adjacent (boundaries touch or overlap)
      if (this.areCellsAdjacent(cellBounds, otherBounds)) {
        neighbors.push(otherCell);
      }
    });
    
    return neighbors;
  }
  
  /**
   * Gets all cells currently tracked.
   */
  getAllCells(): Map<string, GridCell> {
    return this.cells;
  }
  
  /**
   * Updates cell sizes based on player density.
   * Should be called periodically to adapt the grid.
   */
  updateCellSizes(): void {
    const now = Date.now();
    if (now - this.lastResizeTime < this.resizeInterval) {
      return; // Don't resize too frequently
    }
    
    this.lastResizeTime = now;
    console.log('Updating grid cell sizes based on player density...');
    
    // Analyze density across all cells
    const performedFullAnalysis = this.densityAnalyzer.analyzeDensity(this.cells, true);
    
    if (!performedFullAnalysis) {
      return; // Skip if full analysis wasn't performed
    }
    
    // Get hotspots and coldspots
    const hotspots = this.densityAnalyzer.getDensityHotspots();
    const coldspots = this.densityAnalyzer.getDensityColdspots();
    
    // Resize hotspot cells (shrink)
    hotspots.forEach(hotspot => {
      const cell = this.cells.get(hotspot.cellKey);
      if (cell) {
        const newSize = this.gridConfig.calculateOptimalSize(hotspot.density, cell.width);
        this.resizeCell(cell, newSize, newSize);
      }
    });
    
    // Resize coldspot cells (expand)
    coldspots.forEach(coldspot => {
      const cell = this.cells.get(coldspot.cellKey);
      if (cell) {
        const newSize = this.gridConfig.calculateOptimalSize(coldspot.density, cell.width);
        this.resizeCell(cell, newSize, newSize);
      }
    });
    
    // Redistribute entities after resizing
    this.redistributeEntities();
    
    console.log(`Cell size update complete. Cells: ${this.cells.size}`);
  }
  
  /**
   * Resizes a specific cell to new dimensions.
   */
  private resizeCell(cell: GridCell, newWidth: number, newHeight: number): void {
    const oldWidth = cell.width;
    const oldHeight = cell.height;
    
    // Only resize if there's a significant change
    if (Math.abs(newWidth - oldWidth) < 1 && Math.abs(newHeight - oldHeight) < 1) {
      return;
    }
    
    cell.width = newWidth;
    cell.height = newHeight;
    
    console.log(`Resized cell (${cell.x},${cell.y}): ${oldWidth.toFixed(2)}x${oldHeight.toFixed(2)} -> ${newWidth.toFixed(2)}x${newHeight.toFixed(2)}`);
  }
  
  /**
   * Redistributes entities after cell resizing to ensure they're in the correct cells.
   */
  private redistributeEntities(): void {
    // Collect all entities
    const allEntities: PlayerEntity[] = [];
    this.cells.forEach(cell => {
      allEntities.push(...cell.entities);
      cell.entities = []; // Clear cell
    });
    
    // Reassign entities to cells
    allEntities.forEach(entity => {
      const cell = this.getCurrentCell(entity);
      if (!cell.entities.includes(entity)) {
        cell.entities.push(entity);
      }
    });
  }
  
  /**
   * Gets the key for the cell that contains the given position.
   */
  private getCellKeyForPosition(position: { x: number, y: number }): string {
    // Find the cell that contains this position by checking all cells
    // This is less efficient than a direct calculation but handles variable-sized cells
    
    // First try a quick lookup based on default grid size
    const defaultX = Math.floor(position.x / this.defaultGridSize);
    const defaultY = Math.floor(position.y / this.defaultGridSize);
    const defaultKey = `${defaultX},${defaultY}`;
    
    // If we have this cell and position is within its bounds, return it
    if (this.cells.has(defaultKey)) {
      const cell = this.cells.get(defaultKey)!;
      const bounds = this.getCellBounds(cell);
      
      if (
        position.x >= bounds.minX &&
        position.x < bounds.maxX &&
        position.y >= bounds.minY &&
        position.y < bounds.maxY
      ) {
        return defaultKey;
      }
    }
    
    // Otherwise, check all cells
    for (const [key, cell] of this.cells.entries()) {
      const bounds = this.getCellBounds(cell);
      
      if (
        position.x >= bounds.minX &&
        position.x < bounds.maxX &&
        position.y >= bounds.minY &&
        position.y < bounds.maxY
      ) {
        return key;
      }
    }
    
    // If no matching cell found, create a new one based on default grid size
    return defaultKey;
  }
  
  /**
   * Gets the bounds of a cell.
   */
  private getCellBounds(cell: GridCell): { minX: number, maxX: number, minY: number, maxY: number } {
    return {
      minX: cell.x * this.defaultGridSize,
      maxX: cell.x * this.defaultGridSize + cell.width,
      minY: cell.y * this.defaultGridSize,
      maxY: cell.y * this.defaultGridSize + cell.height
    };
  }
  
  /**
   * Checks if two cells are adjacent (boundaries touch or overlap).
   */
  private areCellsAdjacent(
    bounds1: { minX: number, maxX: number, minY: number, maxY: number },
    bounds2: { minX: number, maxX: number, minY: number, maxY: number }
  ): boolean {
    // Check if cells are adjacent horizontally or vertically
    const horizontalOverlap =
      bounds1.maxX >= bounds2.minX && bounds1.minX <= bounds2.maxX;
    
    const verticalOverlap =
      bounds1.maxY >= bounds2.minY && bounds1.minY <= bounds2.maxY;
    
    // Cells are adjacent if they overlap in one dimension and are adjacent or overlapping in the other
    return horizontalOverlap && verticalOverlap;
  }
  
  /**
   * Removes an entity from all cells.
   */
  private removeEntityFromAllCells(entity: PlayerEntity): void {
    this.cells.forEach(cell => {
      cell.entities = cell.entities.filter(e => e !== entity);
    });
  }
  
  /**
   * Sets the resize interval.
   */
  setResizeInterval(interval: number): void {
    this.resizeInterval = interval;
    console.log(`GridCellTracker resize interval updated: ${interval}ms`);
  }
  
  /**
   * Gets the grid configuration.
   */
  getGridConfig(): GridConfiguration {
    return this.gridConfig;
  }
  
  /**
   * Gets the density analyzer.
   */
  getDensityAnalyzer(): PlayerDensityAnalyzer {
    return this.densityAnalyzer;
  }
}