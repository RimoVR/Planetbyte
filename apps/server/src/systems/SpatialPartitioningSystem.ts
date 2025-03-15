import { System, World, Component } from '@colyseus/ecs';
import { InterestManager } from './InterestManager';
import { PlayerEntity } from '../entities/PlayerEntity';
import { DeltaCompression, CompressionLevel } from '../types/metrics';

// Define interfaces for state objects
interface PlayerState {
  id: string;
  position: { x: number; y: number };
  faction: string;
  // Add other properties as needed
}

interface GameState {
  players: Record<string, PlayerState>;
  timestamp: number;
}

export class SpatialPartitioningSystem extends System {
  private interestManager: InterestManager;
  private deltaCompression: DeltaCompression;
  private players: PlayerEntity[] = [];
  private previousStates: Map<string, GameState> = new Map();

  constructor(world: World, gridSize: number, viewDistance: number) {
    super(world);
    this.interestManager = new InterestManager(gridSize, viewDistance);
    this.deltaCompression = DeltaCompression.getInstance();
  }

  onEntityAdded(entity: Component) {
    if (entity instanceof PlayerEntity) {
      this.players.push(entity);
    }
  }

  onEntityRemoved(entity: Component) {
    if (entity instanceof PlayerEntity) {
      this.players = this.players.filter(p => p !== entity);
      // Clean up previous state when player is removed
      this.previousStates.delete(entity.id);
    }
  }

  execute() {
    this.players.forEach(player => {
      const relevantEntities = this.interestManager.getRelevantEntities(player);
      this.sendUpdates(player, relevantEntities);
    });
  }

  private sendUpdates(player: PlayerEntity, entities: PlayerEntity[]) {
    // Convert entities to a serializable state object
    const currentState = this.createStateFromEntities(entities);
    
    // Get previous state for this player
    const previousState = this.previousStates.get(player.id);
    
    // Create delta update using compression
    const deltaUpdate = this.deltaCompression.createDelta(
      currentState,
      previousState,
      { level: CompressionLevel.ADVANCED }
    );
    
    // Store current state as previous for next update
    this.previousStates.set(player.id, currentState);
    
    // Send the delta update to the player
    this.sendDeltaUpdate(player, deltaUpdate);
    
    // Log compression stats if available
    if (deltaUpdate.stats) {
      const { originalSize, compressedSize, compressionRatio } = deltaUpdate.stats;
      console.log(`Player ${player.id} update: ${compressedSize}/${originalSize} bytes (${compressionRatio.toFixed(2)}x compression)`);
    }
  }

  private createStateFromEntities(entities: PlayerEntity[]): GameState {
    // Create a serializable state object from entities
    const state: GameState = {
      players: {},
      timestamp: Date.now()
    };
    
    entities.forEach(entity => {
      state.players[entity.id] = {
        id: entity.id,
        position: { x: entity.position.x, y: entity.position.y },
        faction: entity.faction
        // Add other properties as needed
      };
    });
    
    return state;
  }

  private sendDeltaUpdate(player: PlayerEntity, deltaUpdate: any): void {
    // In a real implementation, this would send the delta update to the client
    // For now, just log that we're sending an update
    console.log(`Sending delta update to player ${player.id} (${JSON.stringify(deltaUpdate.delta).length} bytes)`);
    
    // Call the player's sendUpdates method
    player.sendUpdates([deltaUpdate]);
  }
}