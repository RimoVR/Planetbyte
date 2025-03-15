import { Room, Client } from '@colyseus/core';
import { Dispatcher } from '@colyseus/command';
import { Entity } from '../ecs/Entity';
import { EntityManager } from '../ecs/EntityManager';
import { SpatialPartitioningSystem } from '../ecs/systems/SpatialPartitioningSystem';
import { ComponentType, TransformComponent, PlayerComponent, FactionComponent } from '../ecs/Component';
import { Faction, PlayerInput, GameState, MessageType, AbilityCategory } from '../types/common';
import { logger } from '../utils/logger';

/**
 * GameRoom class
 * Handles the multiplayer game room using Colyseus.js
 */
export class GameRoom extends Room<GameState> {
  protected entityManager: EntityManager;
  protected dispatcher: Dispatcher<GameRoom>;
  protected playerEntities: Map<string, Entity>; // Map of client IDs to player entities
  protected playerInputSequences: Map<string, number>; // Map of client IDs to last processed input sequence
  protected lastUpdateTime: number;
  protected updateRate: number; // Updates per second

  constructor() {
    super();
    this.entityManager = new EntityManager();
    this.dispatcher = new Dispatcher(this);
    this.playerInputSequences = new Map<string, number>();
    this.playerEntities = new Map<string, Entity>();
    this.lastUpdateTime = Date.now();
    this.updateRate = 20; // 20 updates per second
  }

  /**
   * Called when the room is created
   */
  onCreate(options: any): void {
    logger.info(`Creating game room: ${this.roomId}`);

    // Set initial state
    this.setState({
      players: {},
      bases: {},
      time: 0,
      isNight: false,
      mapSize: 2000 // 2km x 2km map
    });

    // Register message handlers
    this.onMessage(MessageType.PLAYER_INPUT, (client, message: PlayerInput) => {
      this.handlePlayerInput(client, message);
    });

    // Initialize systems
    this.initializeSystems();

    // Set up game loop
    this.setSimulationInterval(() => this.update());
  }

  /**
   * Initialize game systems
   */
  private initializeSystems(): void {
    // Add spatial partitioning system
    this.entityManager.addSystem(new SpatialPartitioningSystem(this.entityManager));

    // Add other systems here...
    // this.entityManager.addSystem(new PhysicsSystem());
    // this.entityManager.addSystem(new CombatSystem());
    // etc.
  }

  /**
   * Called when a client joins the room
   */
  onJoin(client: Client, options: any): void {
    logger.info(`Client joined: ${client.sessionId}`);

    // Create player entity
    const playerEntity = this.createPlayerEntity(client.sessionId, options);
    this.playerEntities.set(client.sessionId, playerEntity);
    this.playerInputSequences.set(client.sessionId, 0);
    this.entityManager.addEntity(playerEntity);

    // Add player to game state
    const transform = playerEntity.getComponent<TransformComponent>(ComponentType.TRANSFORM);
    const player = playerEntity.getComponent<PlayerComponent>(ComponentType.PLAYER);
    const faction = playerEntity.getComponent<FactionComponent>(ComponentType.FACTION);

    if (transform && player && faction) {
      this.state.players[client.sessionId] = {
        id: client.sessionId,
        username: player.username,
        faction: faction.faction as Faction,
        position: { x: transform.x, y: transform.y },
        rotation: transform.rotation,
        health: 100,
        maxHealth: 100,
        experience: 0,
        level: 1,
        eloRating: 1000,
        abilities: {
          movement: { id: 'dash', name: 'Dash', category: AbilityCategory.MOVEMENT, cooldown: 5, currentCooldown: 0, augmentations: [] },
          offense: { id: 'shoot', name: 'Shoot', category: AbilityCategory.OFFENSE, cooldown: 0.5, currentCooldown: 0, augmentations: [] },
          defense: { id: 'shield', name: 'Shield', category: AbilityCategory.DEFENSE, cooldown: 10, currentCooldown: 0, augmentations: [] },
          support: { id: 'heal', name: 'Heal', category: AbilityCategory.SUPPORT, cooldown: 15, currentCooldown: 0, augmentations: [] }
        },
        inventory: []
      };

      // Broadcast player join event
      this.broadcast(MessageType.PLAYER_JOIN, {
        id: client.sessionId,
        username: player?.username || 'Unknown',
        faction: faction?.faction || Faction.FACTION_1
      });
    }
  }

  /**
   * Called when a client leaves the room
   */
  onLeave(client: Client, consented: boolean): void {
    logger.info(`Client left: ${client.sessionId}`);

    // Remove player entity
    const playerEntity = this.playerEntities.get(client.sessionId);
    if (playerEntity) {
      this.entityManager.removeEntity(playerEntity.id);
      this.playerEntities.delete(client.sessionId);
      this.playerInputSequences.delete(client.sessionId);
    }

    // Remove player from game state
    delete this.state.players[client.sessionId];

    // Broadcast player leave event
    this.broadcast(MessageType.PLAYER_LEAVE, {
      id: client.sessionId
    });
  }

  /**
   * Called when the room is disposed
   */
  onDispose(): void {
    logger.info(`Disposing game room: ${this.roomId}`);
    
    // Clean up entity manager
    this.entityManager.cleanup();
    
    // Clean up dispatcher
    this.dispatcher.stop();
  }

  /**
   * Create a player entity
   */
  private createPlayerEntity(clientId: string, options: any): Entity {
    const entity = new Entity();
    
    // Add transform component
    const transform: TransformComponent = {
      type: ComponentType.TRANSFORM,
      x: Math.random() * 1000, // Random starting position
      y: Math.random() * 1000,
      rotation: 0,
      previousX: 0,
      previousY: 0,
      previousRotation: 0
    };
    entity.addComponent(transform);
    
    // Add player component
    const player: PlayerComponent = {
      type: ComponentType.PLAYER,
      id: clientId,
      username: options.username || `Player${Math.floor(Math.random() * 1000)}`,
      level: 1,
      experience: 0,
      eloRating: 1000,
      isBot: false,
      lastInputTime: Date.now(),
      clientSequence: 0
    };
    entity.addComponent(player);
    
    // Add faction component
    const faction: FactionComponent = {
      type: ComponentType.FACTION,
      faction: options.faction || this.getBalancedFaction(),
      joinedAt: Date.now()
    };
    entity.addComponent(faction);
    
    return entity;
  }

  /**
   * Get a balanced faction assignment
   */
  private getBalancedFaction(): string {
    // Count players in each faction
    const factionCounts: Record<string, number> = {
      [Faction.FACTION_1]: 0,
      [Faction.FACTION_2]: 0,
      [Faction.FACTION_3]: 0
    };
    
    // Count existing players
    for (const clientId in this.state.players) {
      const faction = this.state.players[clientId].faction;
      factionCounts[faction]++;
    }
    
    // Find faction with fewest players
    let minFaction = Faction.FACTION_1;
    let minCount = factionCounts[Faction.FACTION_1];
    
    if (factionCounts[Faction.FACTION_2] < minCount) {
      minFaction = Faction.FACTION_2;
      minCount = factionCounts[Faction.FACTION_2];
    }
    
    if (factionCounts[Faction.FACTION_3] < minCount) {
      minFaction = Faction.FACTION_3;
    }
    
    return minFaction;
  }

  /**
   * Handle player input
   */
  private handlePlayerInput(client: Client, input: PlayerInput): void {
    const inputSequence = (input as any).sequence || 0;
    const playerEntity = this.playerEntities.get(client.sessionId);
    if (!playerEntity) return;
    
    // Update player transform based on input
    const transform = playerEntity.getComponent<TransformComponent>(ComponentType.TRANSFORM);
    if (transform) {
      // Store previous position for reconciliation
      transform.previousX = transform.x;
      transform.previousY = transform.y;
      transform.previousRotation = transform.rotation;
      
      // Update position based on input
      // This is a simplified implementation
      // In a real implementation, this would use a physics system
      transform.x += input.movement.x * 5;
      transform.y += input.movement.y * 5;
      transform.rotation = input.rotation;
      
      // Update player state
      const player = this.state.players[client.sessionId];
      if (player) {
        player.position.x = transform.x;
        player.position.y = transform.y;
        player.rotation = transform.rotation;
        
        // Store the sequence number for this client
        this.playerInputSequences.set(client.sessionId, inputSequence);
      }
    }
    
    // Update player component
    const player = playerEntity.getComponent<PlayerComponent>(ComponentType.PLAYER);
    if (player) {
      // Update last input time and sequence
      player.lastInputTime = Date.now();
      player.clientSequence = inputSequence;
      
      // Send input acknowledgment back to the client for reconciliation
     // Only if transform exists
      if (transform) {
        this.send(client, MessageType.PLAYER_STATE, {
          id: client.sessionId,
          position: { x: transform.x, y: transform.y },
          rotation: transform.rotation,
          sequence: inputSequence
        });
      }
    }
  }

  /**
   * Update the game state
   */
  protected update(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = now;
    
    // Update entity manager
    this.entityManager.update();
    
    // Update game time
    if (this.state.time !== undefined) {
      this.state.time += deltaTime;
    } else {
      this.state.time = deltaTime;
    }
    
    // Update day/night cycle
    // Day/night cycle is 1 hour (3600 seconds)
    const dayNightCycle = 3600;
    const timeOfDay = (this.state.time as number) % dayNightCycle;
    const isNight = timeOfDay > dayNightCycle / 2;
    
    if (isNight !== this.state.isNight) {
      this.state.isNight = isNight;
      this.broadcast(MessageType.DAY_NIGHT_CHANGE, { isNight });
    }
  }
}