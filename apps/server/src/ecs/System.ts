import { Entity } from './Entity';
import { ComponentType } from './Component';

/**
 * System interface
 * Systems operate on entities with specific components
 */
export interface System {
  /**
   * Required component types for this system
   */
  readonly requiredComponents: ComponentType[];
  
  /**
   * Update the system
   * @param entities Entities to update
   * @param deltaTime Time since last update in seconds
   */
  update(entities: Entity[], deltaTime: number): void;
  
  /**
   * Initialize the system
   */
  initialize?(): void;
  
  /**
   * Clean up the system
   */
  cleanup?(): void;
}

/**
 * Abstract base class for systems
 */
export abstract class BaseSystem implements System {
  public readonly requiredComponents: ComponentType[];
  
  constructor(requiredComponents: ComponentType[]) {
    this.requiredComponents = requiredComponents;
  }
  
  /**
   * Check if an entity has all required components
   * @param entity Entity to check
   * @returns True if the entity has all required components
   */
  protected entityQualifies(entity: Entity): boolean {
    return this.requiredComponents.every(componentType => 
      entity.hasComponent(componentType)
    );
  }
  
  /**
   * Filter entities to only those that have all required components
   * @param entities All entities
   * @returns Filtered entities
   */
  protected filterEntities(entities: Entity[]): Entity[] {
    return entities.filter(entity => this.entityQualifies(entity));
  }
  
  /**
   * Update the system
   * @param entities Entities to update
   * @param deltaTime Time since last update in seconds
   */
  abstract update(entities: Entity[], deltaTime: number): void;
}