import { System, World, Component } from '@colyseus/ecs';
import { InterestManager } from './InterestManager';
import { PlayerEntity } from '../entities/PlayerEntity';

export class SpatialPartitioningSystem extends System {
  private interestManager: InterestManager;
  private players: PlayerEntity[] = [];

  constructor(world: World, gridSize: number, viewDistance: number) {
    super(world);
    this.interestManager = new InterestManager(gridSize, viewDistance);
  }

  onEntityAdded(entity: Component) {
    if (entity instanceof PlayerEntity) {
      this.players.push(entity);
    }
  }

  onEntityRemoved(entity: Component) {
    if (entity instanceof PlayerEntity) {
      this.players = this.players.filter(p => p !== entity);
    }
  }

  execute() {
    this.players.forEach(player => {
      const relevantEntities = this.interestManager.getRelevantEntities(player);
      this.sendUpdates(player, relevantEntities);
    });
  }

  private sendUpdates(player: PlayerEntity, entities: PlayerEntity[]) {
    // Send filtered updates to the player
    // TODO: Implement delta compression and network optimization
    player.sendUpdates(entities);
  }
}