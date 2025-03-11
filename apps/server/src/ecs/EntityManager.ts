import { Entity } from './Entity';
import { Component, ComponentType } from './Component';
import { System } from './System';
import { logger } from '../utils/logger';

/**
 * EntityManager class
 * Manages all entities and systems in the game
 */
export class EntityManager {
  private entities: Map<number, Entity>;
  private systems: System[];
  private entitiesToAdd: Entity[];
  private entitiesToRemove: Set<number>;
  private lastUpdateTime: number;

  constructor() {
    this.entities = new Map<number, Entity>();
    this.systems = [];
    this.entitiesToAdd = [];
    this.entitiesToRemove = new Set<number>();
    this.lastUpdateTime = Date.now();
  }

  /**
   * Add an entity to the manager
   * @param entity The entity to add
   */
  addEntity(entity: Entity): void {
    // Queue entity for addition on next update
    this.entitiesToAdd.push(entity);
  }

  /**
   * Remove an entity from the manager
   * @param entityId The ID of the entity to remove
   */
  removeEntity(entityId: number): void {
    // Queue entity for removal on next update
    this.entitiesToRemove.add(entityId);
  }

  /**
   * Get an entity by ID
   * @param entityId The ID of the entity to get
   * @returns The entity or undefined if not found
   */
  getEntity(entityId: number): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Get all entities
   * @returns An array of all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get entities with specific components
   * @param componentTypes The component types to filter by
   * @returns An array of entities with all specified components
   */
  getEntitiesWithComponents(...componentTypes: ComponentType[]): Entity[] {
    return this.getAllEntities().filter(entity => 
      componentTypes.every(type => entity.hasComponent(type))
    );
  }

  /**
   * Add a system to the manager
   * @param system The system to add
   */
  addSystem(system: System): void {
    this.systems.push(system);
    
    // Initialize the system if it has an initialize method
    if (system.initialize) {
      system.initialize();
    }
    
    logger.debug(`Added system: ${system.constructor.name}`);
  }

  /**
   * Update all systems
   */
  update(): void {
    // Calculate delta time
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;
    
    // Process entity additions
    for (const entity of this.entitiesToAdd) {
      this.entities.set(entity.id, entity);
    }
    this.entitiesToAdd = [];
    
    // Process entity removals
    for (const entityId of this.entitiesToRemove) {
      this.entities.delete(entityId);
    }
    this.entitiesToRemove.clear();
    
    // Update all systems
    const entities = this.getAllEntities();
    for (const system of this.systems) {
      system.update(entities, deltaTime);
    }
  }

  /**
   * Clean up all systems and entities
   */
  cleanup(): void {
    // Clean up all systems
    for (const system of this.systems) {
      if (system.cleanup) {
        system.cleanup();
      }
    }
    
    // Clear all entities
    this.entities.clear();
    this.entitiesToAdd = [];
    this.entitiesToRemove.clear();
    
    logger.debug('Entity manager cleaned up');
  }
}