import { System, World, Component } from '@colyseus/ecs';
import { InterestManager } from './InterestManager';
import { PlayerEntity } from '../entities/PlayerEntity';
import { DeltaCompression, CompressionLevel, InterestMetrics } from '../types/metrics';

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
  gridInfo?: {
    cellCount: number;
    averageDensity: number;
  };
}

export interface SpatialPartitioningConfig {
  gridSize: number;
  viewDistance: number;
  adaptiveGridSizing: boolean;
  adaptiveUpdateInterval: number;
}

export class SpatialPartitioningSystem extends System {
  private interestManager: InterestManager;
  private deltaCompression: DeltaCompression;
  private metrics: InterestMetrics;
  private players: PlayerEntity[] = [];
  private previousStates: Map<string, GameState> = new Map();
  private config: SpatialPartitioningConfig;

  constructor(
    world: World,
    config: SpatialPartitioningConfig | number,
    viewDistance?: number
  ) {
    super(world);
    
    // Handle both new config object and legacy parameters
    if (typeof config === 'object') {
      this.config = config;
    } else {
      this.config = {
        gridSize: config,
        viewDistance: viewDistance || 50,
        adaptiveGridSizing: true,
        adaptiveUpdateInterval: 60000
      };
    }
    
    // Initialize interest manager with adaptive grid sizing if enabled
    this.interestManager = new InterestManager(
      this.config.gridSize,
      this.config.viewDistance,
      this.config.adaptiveGridSizing
    );
    
    // Set adaptive update interval if specified
    if (this.config.adaptiveGridSizing && this.config.adaptiveUpdateInterval) {
      this.interestManager.setAdaptiveUpdateInterval(this.config.adaptiveUpdateInterval);
    }
    
    this.deltaCompression = DeltaCompression.getInstance();
    this.metrics = InterestMetrics.getInstance();
    
    console.log(`SpatialPartitioningSystem initialized with ${this.config.adaptiveGridSizing ? 'adaptive' : 'fixed'} grid sizing`);
  }

  onEntityAdded(entity: Component) {
    if (entity instanceof PlayerEntity) {
      this.players.push(entity);
      console.log(`Player ${entity.id} added to spatial partitioning system`);
    }
  }

  onEntityRemoved(entity: Component) {
    if (entity instanceof PlayerEntity) {
      this.players = this.players.filter(p => p !== entity);
      // Clean up previous state when player is removed
      this.previousStates.delete(entity.id);
      console.log(`Player ${entity.id} removed from spatial partitioning system`);
    }
  }

  execute() {
    // Track memory usage before processing
    const memoryBefore = process.memoryUsage().heapUsed;
    
    // Process each player
    this.players.forEach(player => {
      const relevantEntities = this.interestManager.getRelevantEntities(player);
      this.sendUpdates(player, relevantEntities);
    });
    
    // Track memory usage after processing
    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryDelta = memoryAfter - memoryBefore;
    
    // Log memory usage periodically (every 100 executions)
    if (Math.random() < 0.01) { // ~1% of executions
      this.metrics.recordMemoryUsage(memoryAfter);
      console.log(`Memory delta during execution: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);
    }
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
      
      // Track network usage
      this.metrics.recordNetworkUsage(compressedSize, originalSize - compressedSize);
      
      // Log detailed stats periodically
      if (Math.random() < 0.05) { // ~5% of updates
        console.log(`Player ${player.id} update: ${compressedSize}/${originalSize} bytes (${compressionRatio.toFixed(2)}x compression)`);
      }
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
    
    // Add grid information if using adaptive grid sizing
    if (this.config.adaptiveGridSizing) {
      const gridCellTracker = this.interestManager.getGridCellTracker();
      const densityAnalyzer = gridCellTracker.getDensityAnalyzer();
      
      state.gridInfo = {
        cellCount: gridCellTracker.getAllCells().size,
        averageDensity: densityAnalyzer.getAverageDensity()
      };
    }
    
    return state;
  }

  private sendDeltaUpdate(player: PlayerEntity, deltaUpdate: any): void {
    // In a real implementation, this would send the delta update to the client
    // For now, just log that we're sending an update
    if (Math.random() < 0.01) { // Log only ~1% of updates to reduce noise
      console.log(`Sending delta update to player ${player.id} (${JSON.stringify(deltaUpdate.delta).length} bytes)`);
    }
    
    // Call the player's sendUpdates method
    player.sendUpdates([deltaUpdate]);
  }
  
  /**
   * Updates the spatial partitioning configuration.
   *
   * @param config New configuration parameters
   */
  updateConfig(config: Partial<SpatialPartitioningConfig>): void {
    // Update local config
    this.config = { ...this.config, ...config };
    
    // Update interest manager if adaptive update interval changed
    if (config.adaptiveUpdateInterval !== undefined) {
      this.interestManager.setAdaptiveUpdateInterval(config.adaptiveUpdateInterval);
    }
    
    console.log('SpatialPartitioningSystem configuration updated:', config);
  }
  
  /**
   * Gets the current configuration.
   */
  getConfig(): SpatialPartitioningConfig {
    return { ...this.config };
  }
  
  /**
   * Gets the interest manager.
   */
  getInterestManager(): InterestManager {
    return this.interestManager;
  }
}