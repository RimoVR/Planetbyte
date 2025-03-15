import { World } from '@colyseus/ecs';
import { SpatialPartitioningSystem } from './SpatialPartitioningSystem';
import { PlayerEntity } from '../entities/PlayerEntity';
import { Faction } from '../components/Faction';

describe('SpatialPartitioningSystem', () => {
  let world: World;
  let system: SpatialPartitioningSystem;

  beforeEach(() => {
    world = new World();
    system = new SpatialPartitioningSystem(world, 100, 50);
    
    // Mock sendUpdates method
    jest.spyOn(PlayerEntity.prototype, 'sendUpdates');
  });

  it('should send updates to players for relevant entities', () => {
    // Create test players
    const player1 = new PlayerEntity('p1', 0, 0, Faction.Red, 1);
    const player2 = new PlayerEntity('p2', 60, 60, Faction.Blue, 1);
    
    // Create test entities
    const entity1 = new PlayerEntity('e1', 10, 10, Faction.Red, 1);
    const entity2 = new PlayerEntity('e2', 70, 70, Faction.Blue, 1);
    const entity3 = new PlayerEntity('e3', 200, 200, Faction.Green, 1);

    // Add entities to world
    const e1 = world.createEntity();
    e1.addComponent(player1);
    
    const e2 = world.createEntity();
    e2.addComponent(player2);
    
    const e3 = world.createEntity();
    e3.addComponent(entity1);
    
    const e4 = world.createEntity();
    e4.addComponent(entity2);
    
    const e5 = world.createEntity();
    e5.addComponent(entity3);

    // Run system update
    system.execute();

    // Verify player1 received updates for entity1
    expect(player1.sendUpdates).toHaveBeenCalledWith(
      expect.arrayContaining([entity1])
    );

    // Verify player1 did not receive updates for entity2 or entity3
    expect(player1.sendUpdates).not.toHaveBeenCalledWith(
      expect.arrayContaining([entity2, entity3])
    );

    // Verify player2 received updates for entity2
    expect(player2.sendUpdates).toHaveBeenCalledWith(
      expect.arrayContaining([entity2])
    );

    // Verify player2 did not receive updates for entity1 or entity3
    expect(player2.sendUpdates).not.toHaveBeenCalledWith(
      expect.arrayContaining([entity1, entity3])
    );
  });
});