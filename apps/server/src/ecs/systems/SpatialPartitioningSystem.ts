import { BaseSystem } from '../System';
import { Entity } from '../Entity';
import { ComponentType, GridCellComponent, TransformComponent } from '../Component';
import { EntityManager } from '../EntityManager';
import { WORLD_CONSTANTS, Vector2 } from '../../types/common';
import { logger } from '../../utils/logger';

/**
 * SpatialPartitioningSystem
 * Manages the spatial partitioning grid for efficient entity updates
 */
export class SpatialPartitioningSystem extends BaseSystem {
  private gridCellSize: number;
  private gridCellOverlap: number;
  private entityManager: EntityManager;
  private gridCells: Map<string, Entity>; // Map of cell coordinates to grid cell entities
  private entityCells: Map<number, Set<string>>; // Map of entity IDs to cell keys they belong to

  constructor(entityManager: EntityManager) {
    super([ComponentType.TRANSFORM]);
    
    this.gridCellSize = 1000; // Default grid cell size
    this.entityManager = entityManager;
    this.gridCellOverlap = 100; // Default grid cell overlap
    this.gridCells = new Map<string, Entity>();
    this.entityCells = new Map<number, Set<string>>();
  }

  /**
   * Initialize the system
   */
  initialize(): void {
    logger.info(`Initializing spatial partitioning system with cell size ${this.gridCellSize} and overlap ${this.gridCellOverlap}`);
  }

  /**
   * Update the system
   * @param entities All entities
   * @param deltaTime Time since last update
   */
  update(entities: Entity[], deltaTime: number): void {
    // Get entities with transform components
    const movingEntities = this.filterEntities(entities);
    
    // Update grid cell assignments for all entities
    for (const entity of movingEntities) {
      this.updateEntityGridCell(entity);
      
      // Check if entity is in overlap area and needs to be in multiple cells
      this.handleEntityInOverlapArea(entity);
    }
  }

  /**
   * Update an entity's grid cell assignment
   * @param entity The entity to update
   */
  private updateEntityGridCell(entity: Entity): void {
    const transform = entity.getComponent<TransformComponent>(ComponentType.TRANSFORM);
    if (!transform) return;
    
    // Calculate grid cell coordinates
    const cellX = Math.floor(transform.x / this.gridCellSize);
    const cellY = Math.floor(transform.y / this.gridCellSize);
    
    // Get or create grid cell entity
    const cellKey = `${cellX},${cellY}`;
    let cellEntity = this.gridCells.get(cellKey);
    
    if (!cellEntity) {
      // Create new grid cell entity
      cellEntity = new Entity();
      const gridCell: GridCellComponent = {
        type: ComponentType.GRID_CELL,
        cellX,
        cellY,
        entities: new Set<number>(),
        neighborCells: []
      };
      
      cellEntity.addComponent(gridCell);
      this.gridCells.set(cellKey, cellEntity);
      
      // Set up neighbor relationships
      this.setupNeighborCells(cellEntity);
    }
    
    // Add entity to grid cell
    const gridCell = cellEntity.getComponent<GridCellComponent>(ComponentType.GRID_CELL);
    if (gridCell) {
      gridCell.entities.add(entity.id);
      
      // Track which cells this entity belongs to
      let entityCellSet = this.entityCells.get(entity.id);
      if (!entityCellSet) {
        entityCellSet = new Set<string>();
        this.entityCells.set(entity.id, entityCellSet);
      }
      entityCellSet.add(cellKey);
    }
  }
  
  /**
   * Handle entity that may be in overlap area between cells
   * @param entity The entity to check
   */
  private handleEntityInOverlapArea(entity: Entity): void {
    const transform = entity.getComponent<TransformComponent>(ComponentType.TRANSFORM);
    if (!transform) return;
    
    // Get the entity's position
    const position: Vector2 = { x: transform.x, y: transform.y };
    
    // Calculate primary cell coordinates
    const primaryCellX = Math.floor(position.x / this.gridCellSize);
    const primaryCellY = Math.floor(position.y / this.gridCellSize);
    const primaryCellKey = `${primaryCellX},${primaryCellY}`;
    
    // Calculate potential neighboring cells that the entity might overlap with
    const potentialOverlapCells: [number, number][] = [];
    
    // Check if entity is near the left edge of its primary cell
    if (position.x - primaryCellX * this.gridCellSize < this.gridCellOverlap) {
      potentialOverlapCells.push([primaryCellX - 1, primaryCellY]);
      
      // Check corners
      if (position.y - primaryCellY * this.gridCellSize < this.gridCellOverlap) {
        potentialOverlapCells.push([primaryCellX - 1, primaryCellY - 1]);
      }
      if ((primaryCellY + 1) * this.gridCellSize - position.y < this.gridCellOverlap) {
        potentialOverlapCells.push([primaryCellX - 1, primaryCellY + 1]);
      }
    }
    
    // Check if entity is near the right edge of its primary cell
    if ((primaryCellX + 1) * this.gridCellSize - position.x < this.gridCellOverlap) {
      potentialOverlapCells.push([primaryCellX + 1, primaryCellY]);
      
      // Check corners
      if (position.y - primaryCellY * this.gridCellSize < this.gridCellOverlap) {
        potentialOverlapCells.push([primaryCellX + 1, primaryCellY - 1]);
      }
      if ((primaryCellY + 1) * this.gridCellSize - position.y < this.gridCellOverlap) {
        potentialOverlapCells.push([primaryCellX + 1, primaryCellY + 1]);
      }
    }
    
    // Check if entity is near the top edge of its primary cell
    if (position.y - primaryCellY * this.gridCellSize < this.gridCellOverlap) {
      potentialOverlapCells.push([primaryCellX, primaryCellY - 1]);
    }
    
    // Check if entity is near the bottom edge of its primary cell
    if ((primaryCellY + 1) * this.gridCellSize - position.y < this.gridCellOverlap) {
      potentialOverlapCells.push([primaryCellX, primaryCellY + 1]);
    }
    
    // Get the current set of cells this entity belongs to
    let entityCellSet = this.entityCells.get(entity.id);
    if (!entityCellSet) {
      entityCellSet = new Set<string>();
      this.entityCells.set(entity.id, entityCellSet);
    }
    
    // Add entity to all overlapping cells
    for (const [cellX, cellY] of potentialOverlapCells) {
      const cellKey = `${cellX},${cellY}`;
      let cellEntity = this.gridCells.get(cellKey);
      
      if (cellEntity) {
        const gridCell = cellEntity.getComponent<GridCellComponent>(ComponentType.GRID_CELL);
        if (gridCell) {
          gridCell.entities.add(entity.id);
          entityCellSet.add(cellKey);
        }
      }
    }
  }

  /**
   * Set up neighbor relationships for a grid cell
   * @param cellEntity The grid cell entity
   */
  private setupNeighborCells(cellEntity: Entity): void {
    const gridCell = cellEntity.getComponent<GridCellComponent>(ComponentType.GRID_CELL);
    if (!gridCell) return;
    
    // Calculate neighbor cell coordinates
    const neighbors: [number, number][] = [
      [gridCell.cellX - 1, gridCell.cellY - 1], // Top left
      [gridCell.cellX, gridCell.cellY - 1],     // Top
      [gridCell.cellX + 1, gridCell.cellY - 1], // Top right
      [gridCell.cellX - 1, gridCell.cellY],     // Left
      [gridCell.cellX + 1, gridCell.cellY],     // Right
      [gridCell.cellX - 1, gridCell.cellY + 1], // Bottom left
      [gridCell.cellX, gridCell.cellY + 1],     // Bottom
      [gridCell.cellX + 1, gridCell.cellY + 1]  // Bottom right
    ];
    
    // Get or create neighbor cells
    for (const [x, y] of neighbors) {
      const neighborKey = `${x},${y}`;
      let neighborEntity = this.gridCells.get(neighborKey);
      
      if (!neighborEntity) {
        // Create new neighbor cell entity
        neighborEntity = new Entity();
        const neighborCell: GridCellComponent = {
          type: ComponentType.GRID_CELL,
          cellX: x,
          cellY: y,
          entities: new Set<number>(),
          neighborCells: []
        };
        
        neighborEntity.addComponent(neighborCell);
        this.gridCells.set(neighborKey, neighborEntity);
      }
      
      // Add neighbor relationship
      gridCell.neighborCells.push(neighborEntity.id);
      
      // Add reverse neighbor relationship
      const neighborGridCell = neighborEntity.getComponent<GridCellComponent>(ComponentType.GRID_CELL);
      if (neighborGridCell) {
        neighborGridCell.neighborCells.push(cellEntity.id);
      }
    }
  }

  /**
   * Remove entity from all grid cells it belongs to
   * @param entityId The ID of the entity to remove
   */
  public removeEntityFromCells(entityId: number): void {
    const entityCellSet = this.entityCells.get(entityId);
    if (!entityCellSet) return;
    
    // Remove entity from all cells it belongs to
    for (const cellKey of entityCellSet) {
      const cellEntity = this.gridCells.get(cellKey);
      if (cellEntity) {
        const gridCell = cellEntity.getComponent<GridCellComponent>(ComponentType.GRID_CELL);
        if (gridCell) {
          gridCell.entities.delete(entityId);
        }
      }
    }
    
    // Clear the entity's cell set
    this.entityCells.delete(entityId);
  }

  /**
   * Get entities in the same or neighboring cells as the given entity
   * @param entity The entity to get nearby entities for
   * @returns Array of nearby entities
   */
  getNearbyEntities(entity: Entity): Entity[] {
    const transform = entity.getComponent<TransformComponent>(ComponentType.TRANSFORM);
    if (!transform) return [];
    
    // Calculate grid cell coordinates
    const cellX = Math.floor(transform.x / this.gridCellSize);
    const cellY = Math.floor(transform.y / this.gridCellSize);
    
    // Get grid cell entity
    const cellKey = `${cellX},${cellY}`;
    const cellEntity = this.gridCells.get(cellKey);
    
    if (!cellEntity) return [];
    
    // Get grid cell component
    const gridCell = cellEntity.getComponent<GridCellComponent>(ComponentType.GRID_CELL);
    if (!gridCell) return [];
    
    // Collect entities from this cell and neighbor cells
    const nearbyEntityIds = new Set<number>(gridCell.entities);
    
    // Add entities from neighbor cells
    for (const neighborId of gridCell.neighborCells) {
      const neighborEntity = this.getEntityById(neighborId);
      if (!neighborEntity) continue;
      
      const neighborGridCell = neighborEntity.getComponent<GridCellComponent>(ComponentType.GRID_CELL);
      if (!neighborGridCell) continue;
      
      // Add all entities from neighbor cell
      for (const entityId of neighborGridCell.entities) {
        nearbyEntityIds.add(entityId);
      }
    }
    
    // Convert entity IDs to entities
    const nearbyEntities: Entity[] = [];
    for (const entityId of nearbyEntityIds) {
      const nearbyEntity = this.getEntityById(entityId);
      if (nearbyEntity) {
        nearbyEntities.push(nearbyEntity);
      }
    }
    
    return nearbyEntities;
  }

  /**
   * Get an entity by ID
   * @param entityId The ID of the entity to get
   * @returns The entity or undefined if not found
   */
  private getEntityById(entityId: number): Entity | undefined {
    return this.entityManager.getEntity(entityId);
  }

  /**
   * Clean up the system
   */
  cleanup(): void {
    this.gridCells.clear();
    this.entityCells.clear();
    logger.info('Spatial partitioning system cleaned up');
  }
}