import { Client } from '@colyseus/core';
import { GameRoom } from './GameRoom';
import { EntityManager } from '../ecs/EntityManager';
import { SpatialPartitioningSystem } from '../ecs/systems/SpatialPartitioningSystem';
import { Entity } from '../ecs/Entity';
import { ComponentType, GridCellComponent, TransformComponent } from '../ecs/Component';
import { WORLD_CONSTANTS, Vector2, GameState, MessageType } from '@planetbyte/common';
import { logger } from '../utils/logger';

/**
 * GridRoom class
 * Represents a grid cell in the game world
 * Extends GameRoom to inherit basic game room functionality
 */
export class GridRoom extends GameRoom {
  private cellX: number;
  private cellY: number;
  private neighborRooms: Map<string, GridRoom>;
  private spatialPartitioningSystem: SpatialPartitioningSystem;

  constructor(cellX: number, cellY: number) {
    super();
    this.cellX = cellX;
    this.cellY = cellY;
    this.neighborRooms = new Map<string, GridRoom>();
    
    // Create a new SpatialPartitioningSystem for this grid cell
    this.spatialPartitioningSystem = new SpatialPartitioningSystem(this.entityManager);
  }

  /**
   * Called when the room is created
   */
  onCreate(options: any): void {
    super.onCreate(options);
    
    logger.info(`Creating grid room for cell (${this.cellX}, ${this.cellY})`);
    
    // Add the spatial partitioning system to the entity manager
    this.entityManager.addSystem(this.spatialPartitioningSystem);
    
    // Create grid cell entity
    this.createGridCellEntity();
  }

  /**
   * Create a grid cell entity
   */
  private createGridCellEntity(): void {
    const entity = new Entity();
    
    // Add grid cell component
    const gridCell: GridCellComponent = {
      type: ComponentType.GRID_CELL,
      cellX: this.cellX,
      cellY: this.cellY,
      entities: new Set<number>(),
      neighborCells: []
    };
    entity.addComponent(gridCell);
    
    // Add entity to entity manager
    this.entityManager.addEntity(entity);
  }

  /**
   * Add a neighbor room
   * @param direction Direction of the neighbor room
   * @param room The neighbor room
   */
  addNeighborRoom(direction: 'north' | 'east' | 'south' | 'west' | 'northeast' | 'southeast' | 'southwest' | 'northwest', room: GridRoom): void {
    this.neighborRooms.set(direction, room);
  }

  /**
   * Check if a position is within this grid cell
   * @param position The position to check
   * @returns True if the position is within this grid cell
   */
  isPositionInCell(position: Vector2): boolean {
    const cellSize = WORLD_CONSTANTS.GRID_CELL_SIZE;
    const minX = this.cellX * cellSize;
    const maxX = (this.cellX + 1) * cellSize;
    const minY = this.cellY * cellSize;
    const maxY = (this.cellY + 1) * cellSize;
    
    return position.x >= minX && position.x < maxX && position.y >= minY && position.y < maxY;
  }

  /**
   * Check if a position is within the overlap area of this grid cell
   * @param position The position to check
   * @returns True if the position is within the overlap area
   */
  isPositionInOverlap(position: Vector2): boolean {
    const cellSize = WORLD_CONSTANTS.GRID_CELL_SIZE;
    const overlap = WORLD_CONSTANTS.GRID_CELL_OVERLAP;
    
    const minX = this.cellX * cellSize - overlap;
    const maxX = (this.cellX + 1) * cellSize + overlap;
    const minY = this.cellY * cellSize - overlap;
    const maxY = (this.cellY + 1) * cellSize + overlap;
    
    return position.x >= minX && position.x < maxX && position.y >= minY && position.y < maxY;
  }

  /**
   * Handle entity crossing cell boundary
   * @param entity The entity crossing the boundary
   * @param newPosition The new position of the entity
   * @returns True if the entity was transferred to another cell
   */
  handleEntityCrossingBoundary(entity: Entity, newPosition: Vector2): boolean {
    // Get the entity's transform component
    const transform = entity.getComponent<TransformComponent>(ComponentType.TRANSFORM);
    if (!transform) return false;
    
    // Find the grid cell that contains the new position
    let transferred = false;
    for (const [direction, room] of this.neighborRooms.entries()) {
      if (room.isPositionInCell(newPosition)) {
        // Transfer entity to the new room
        transferred = this.transferEntityToRoom(entity, room);
        if (transferred) {
          break;
        }
      }
    }
    
    return transferred;
  }

  /**
   * Transfer an entity to another room
   * @param entity The entity to transfer
   * @param targetRoom The target room
   * @returns True if the entity was transferred successfully
   */
  private transferEntityToRoom(entity: Entity, targetRoom: GridRoom): boolean {
    try {
      // Remove entity from all grid cells it belongs to
      this.spatialPartitioningSystem.removeEntityFromCells(entity.id);
      
      // Remove entity from this room entity manager
      this.entityManager.removeEntity(entity.id);
      
      // Add entity to target room entity manager
      targetRoom.entityManager.addEntity(entity);
      
      logger.info(`Transferred entity ${entity.id} from cell (${this.cellX}, ${this.cellY}) to cell (${targetRoom.cellX}, ${targetRoom.cellY})`);
      
      return true;
    } catch (error) {
      logger.error(`Error transferring entity ${entity.id}: ${error}`);
      return false;
    }
  }
  
  /**
   * Check if an entity is in the overlap area with any neighboring cells
   * @param entity The entity to check
   * @returns True if the entity is in an overlap area
   */
  isEntityInOverlapArea(entity: Entity): boolean {
    const transform = entity.getComponent<TransformComponent>(ComponentType.TRANSFORM);
    if (!transform) return false;
    
    const position: Vector2 = { x: transform.x, y: transform.y };
    const cellSize = WORLD_CONSTANTS.GRID_CELL_SIZE;
    const overlap = WORLD_CONSTANTS.GRID_CELL_OVERLAP;
    
    // Check if entity is near any edge of its cell
    const distanceFromLeftEdge = position.x - (this.cellX * cellSize);
    const distanceFromRightEdge = ((this.cellX + 1) * cellSize) - position.x;
    const distanceFromTopEdge = position.y - (this.cellY * cellSize);
    const distanceFromBottomEdge = ((this.cellY + 1) * cellSize) - position.y;
    
    return (
      distanceFromLeftEdge < overlap ||
      distanceFromRightEdge < overlap ||
      distanceFromTopEdge < overlap ||
      distanceFromBottomEdge < overlap
    );
  }

  /**
   * Update the room
   */
  update(): void {
    super.update();

    // Check for entities crossing boundaries
    const entities = this.entityManager.getAllEntities();
    for (const entity of entities) {
      const transform = entity.getComponent<TransformComponent>(ComponentType.TRANSFORM);
      if (!transform) continue;

      const position = { x: transform.x, y: transform.y };

      // If the entity is not in this cell, handle boundary crossing
      if (!this.isPositionInCell(position)) {
        const transferred = this.handleEntityCrossingBoundary(entity, position);
        
        // If the entity wasn't transferred but is in an overlap area,
        // it might be in multiple cells simultaneously
        if (!transferred && this.isEntityInOverlapArea(entity)) {
          // The entity is in an overlap area but still primarily in this cell
          // The SpatialPartitioningSystem will handle adding it to multiple cells
        }
      }
    }
  }
}