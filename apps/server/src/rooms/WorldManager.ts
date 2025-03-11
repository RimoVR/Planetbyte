import { Server } from '@colyseus/core';
import { GridRoom } from './GridRoom';
import { WORLD_CONSTANTS } from '@planetbyte/common';
import { logger } from '../utils/logger';

/**
 * WorldManager class
 * Manages the grid rooms and handles the creation and distribution of rooms
 * based on the game world size
 */
export class WorldManager {
  private server: Server;
  private gridRooms: Map<string, GridRoom>;
  private worldWidth: number;
  private worldHeight: number;
  private cellSize: number;

  constructor(server: Server, worldWidth: number = WORLD_CONSTANTS.MAP_MAX_SIZE, worldHeight: number = WORLD_CONSTANTS.MAP_MAX_SIZE) {
    this.server = server;
    this.gridRooms = new Map<string, GridRoom>();
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.cellSize = WORLD_CONSTANTS.GRID_CELL_SIZE;
  }

  /**
   * Initialize the world manager
   */
  initialize(): void {
    logger.info(`Initializing world manager with world size ${this.worldWidth}x${this.worldHeight} and cell size ${this.cellSize}`);
    
    // Calculate the number of cells in each dimension
    const numCellsX = Math.ceil(this.worldWidth / this.cellSize);
    const numCellsY = Math.ceil(this.worldHeight / this.cellSize);
    
    logger.info(`Creating ${numCellsX}x${numCellsY} grid cells`);
    
    // Create grid rooms
    for (let y = 0; y < numCellsY; y++) {
      for (let x = 0; x < numCellsX; x++) {
        this.createGridRoom(x, y);
      }
    }
    
    // Set up neighbor relationships
    for (let y = 0; y < numCellsY; y++) {
      for (let x = 0; x < numCellsX; x++) {
        this.setupNeighborRelationships(x, y, numCellsX, numCellsY);
      }
    }
  }

  /**
   * Create a grid room
   * @param cellX X coordinate of the cell
   * @param cellY Y coordinate of the cell
   */
  private createGridRoom(cellX: number, cellY: number): void {
    // Create a unique room name based on cell coordinates
    const roomName = `grid_${cellX}_${cellY}`;
    
    // Define the room in the Colyseus server
    this.server.define(roomName, GridRoom, { cellX, cellY });
    
    // Create the grid room instance
    const room = new GridRoom(cellX, cellY);
    
    // Store the room in the map
    this.gridRooms.set(roomName, room);
    
    logger.info(`Created grid room ${roomName} for cell (${cellX}, ${cellY})`);
  }

  /**
   * Set up neighbor relationships for a grid cell
   * @param cellX X coordinate of the cell
   * @param cellY Y coordinate of the cell
   * @param numCellsX Number of cells in the X dimension
   * @param numCellsY Number of cells in the Y dimension
   */
  private setupNeighborRelationships(cellX: number, cellY: number, numCellsX: number, numCellsY: number): void {
    const roomName = `grid_${cellX}_${cellY}`;
    const room = this.gridRooms.get(roomName);
    
    if (!room) {
      logger.error(`Room ${roomName} not found when setting up neighbor relationships`);
      return;
    }
    
    // Define neighbor directions and coordinates
    const neighbors = [
      { direction: 'north', x: cellX, y: cellY - 1 },
      { direction: 'northeast', x: cellX + 1, y: cellY - 1 },
      { direction: 'east', x: cellX + 1, y: cellY },
      { direction: 'southeast', x: cellX + 1, y: cellY + 1 },
      { direction: 'south', x: cellX, y: cellY + 1 },
      { direction: 'southwest', x: cellX - 1, y: cellY + 1 },
      { direction: 'west', x: cellX - 1, y: cellY },
      { direction: 'northwest', x: cellX - 1, y: cellY - 1 }
    ];
    
    // Add neighbor relationships
    for (const neighbor of neighbors) {
      // Skip if neighbor is out of bounds
      if (neighbor.x < 0 || neighbor.x >= numCellsX || neighbor.y < 0 || neighbor.y >= numCellsY) {
        continue;
      }
      
      const neighborRoomName = `grid_${neighbor.x}_${neighbor.y}`;
      const neighborRoom = this.gridRooms.get(neighborRoomName);
      
      if (neighborRoom) {
        room.addNeighborRoom(neighbor.direction as any, neighborRoom);
        logger.debug(`Added ${neighbor.direction} neighbor ${neighborRoomName} to room ${roomName}`);
      }
    }
  }

  /**
   * Resize the world
   * @param newWidth New world width
   * @param newHeight New world height
   */
  resizeWorld(newWidth: number, newHeight: number): void {
    logger.info(`Resizing world from ${this.worldWidth}x${this.worldHeight} to ${newWidth}x${newHeight}`);
    
    // Store old dimensions
    const oldWidth = this.worldWidth;
    const oldHeight = this.worldHeight;
    
    // Update dimensions
    this.worldWidth = newWidth;
    this.worldHeight = newHeight;
    
    // Calculate the number of cells in each dimension
    const oldNumCellsX = Math.ceil(oldWidth / this.cellSize);
    const oldNumCellsY = Math.ceil(oldHeight / this.cellSize);
    const newNumCellsX = Math.ceil(newWidth / this.cellSize);
    const newNumCellsY = Math.ceil(newHeight / this.cellSize);
    
    // If the world is growing, create new grid rooms
    if (newNumCellsX > oldNumCellsX || newNumCellsY > oldNumCellsY) {
      // Create new grid rooms
      for (let y = 0; y < newNumCellsY; y++) {
        for (let x = 0; x < newNumCellsX; x++) {
          // Skip if the cell already exists
          if (x < oldNumCellsX && y < oldNumCellsY) {
            continue;
          }
          
          this.createGridRoom(x, y);
        }
      }
      
      // Set up neighbor relationships for all cells
      for (let y = 0; y < newNumCellsY; y++) {
        for (let x = 0; x < newNumCellsX; x++) {
          this.setupNeighborRelationships(x, y, newNumCellsX, newNumCellsY);
        }
      }
    }
    // If the world is shrinking, remove grid rooms
    else if (newNumCellsX < oldNumCellsX || newNumCellsY < oldNumCellsY) {
      // Remove grid rooms
      for (let y = 0; y < oldNumCellsY; y++) {
        for (let x = 0; x < oldNumCellsX; x++) {
          // Skip if the cell should still exist
          if (x < newNumCellsX && y < newNumCellsY) {
            continue;
          }
          
          const roomName = `grid_${x}_${y}`;
          this.gridRooms.delete(roomName);
          
          logger.info(`Removed grid room ${roomName} for cell (${x}, ${y})`);
        }
      }
      
      // Update neighbor relationships for remaining cells
      for (let y = 0; y < newNumCellsY; y++) {
        for (let x = 0; x < newNumCellsX; x++) {
          this.setupNeighborRelationships(x, y, newNumCellsX, newNumCellsY);
        }
      }
    }
  }

  /**
   * Get a grid room by cell coordinates
   * @param cellX X coordinate of the cell
   * @param cellY Y coordinate of the cell
   * @returns The grid room or undefined if not found
   */
  getGridRoom(cellX: number, cellY: number): GridRoom | undefined {
    const roomName = `grid_${cellX}_${cellY}`;
    return this.gridRooms.get(roomName);
  }

  /**
   * Get the grid room that contains a position
   * @param x X coordinate
   * @param y Y coordinate
   * @returns The grid room or undefined if not found
   */
  getGridRoomAtPosition(x: number, y: number): GridRoom | undefined {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return this.getGridRoom(cellX, cellY);
  }
}