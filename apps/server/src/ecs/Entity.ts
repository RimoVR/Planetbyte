import { Component, ComponentType } from './Component';

/**
 * Entity class
 * Entities are just IDs with a collection of components
 */
export class Entity {
  private static nextId = 1;
  public readonly id: number;
  private components: Map<string, Component>;
  private tags: Set<string>;

  constructor() {
    this.id = Entity.nextId++;
    this.components = new Map<string, Component>();
    this.tags = new Set<string>();
  }

  /**
   * Add a component to the entity
   * @param component The component to add
   * @returns The entity for chaining
   */
  addComponent(component: Component): Entity {
    this.components.set(component.type, component);
    return this;
  }

  /**
   * Remove a component from the entity
   * @param componentType The type of component to remove
   * @returns The entity for chaining
   */
  removeComponent(componentType: string): Entity {
    this.components.delete(componentType);
    return this;
  }

  /**
   * Get a component from the entity
   * @param componentType The type of component to get
   * @returns The component or undefined if not found
   */
  getComponent<T extends Component>(componentType: string): T | undefined {
    return this.components.get(componentType) as T | undefined;
  }

  /**
   * Check if the entity has a component
   * @param componentType The type of component to check for
   * @returns True if the entity has the component, false otherwise
   */
  hasComponent(componentType: string): boolean {
    return this.components.has(componentType);
  }

  /**
   * Get all components
   * @returns An array of all components
   */
  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Add a tag to the entity
   * @param tag The tag to add
   * @returns The entity for chaining
   */
  addTag(tag: string): Entity {
    this.tags.add(tag);
    return this;
  }

  /**
   * Remove a tag from the entity
   * @param tag The tag to remove
   * @returns The entity for chaining
   */
  removeTag(tag: string): Entity {
    this.tags.delete(tag);
    return this;
  }

  /**
   * Check if the entity has a tag
   * @param tag The tag to check for
   * @returns True if the entity has the tag, false otherwise
   */
  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * Get all tags
   * @returns An array of all tags
   */
  getAllTags(): string[] {
    return Array.from(this.tags);
  }
}