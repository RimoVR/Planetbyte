import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';
import { WORLD_CONSTANTS, MessageType, PlayerInput, GameState as ServerGameState, Vector2 } from '@planetbyte/common';

// Define the local game context state interface
interface GameContextState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define the connection state interface
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  roomId: string | null;
}

// Define the game context interface
interface GameContextType {
  gameState: GameContextState;
  game: Phaser.Game | null;
  initializeGame: (serverUrl?: string) => void;
}

// Create the context with a default value
const GameContext = createContext<GameContextType>({
  gameState: {
    isInitialized: false,
    isLoading: false,
    error: null,
  },
  game: null,
  initializeGame: () => {},
});

// Custom hook to use the game context
export const useGame = () => useContext(GameContext);

// Main scene for the game
class MainScene extends Phaser.Scene {
  private player: Phaser.GameObjects.Arc | null = null;
  private otherPlayers: Map<string, Phaser.GameObjects.Arc> = new Map<string, Phaser.GameObjects.Arc>();
  private room: Colyseus.Room<ServerGameState> | null = null;
  private lastUpdateTime: number = 0;
  private inputSequence: number = 0;
  private pendingInputs: PlayerInput[] = [];
  private serverPosition: Vector2 | null = null;
  private serverRotation: number = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Create a circular player representation
    this.player = this.add.circle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      WORLD_CONSTANTS.PLAYER_HITBOX_RADIUS,
      0x00ff00
    );

    // Set up keyboard input
    this.setupInput();

    // Set up update event
    this.events.on('update', this.gameUpdate.bind(this));
  }

  /**
   * Set up input handling
   */
  private setupInput(): void {
    // Set up keyboard input
    const cursors = this.input.keyboard.createCursorKeys();
    
    // Store reference to cursors for use in update
    (this as any).cursors = cursors;
  }

  /**
   * Set the Colyseus room
   * @param room The Colyseus room
   */
  setRoom(room: Colyseus.Room<ServerGameState>): void {
    this.room = room;
    
    // Set up room event handlers
    this.setupRoomHandlers();
  }

  /**
   * Set up room event handlers
   */
  private setupRoomHandlers(): void {
    if (!this.room) return;

    // Handle state changes
    this.room.onStateChange((state) => {
      this.handleStateChange(state);
    });

    // Handle player join
    this.room.onMessage(MessageType.PLAYER_JOIN, (message: any) => {
      console.log('Player joined:', message);
    });

    // Handle player leave
    this.room.onMessage(MessageType.PLAYER_LEAVE, (message) => {
      console.log('Player left:', message);
      this.removeOtherPlayer(message.id);
    });
  }

  /**
   * Handle state change from the server
   * @param state The new game state
   */
  private handleStateChange(state: ServerGameState): void {
    // Update other players
    for (const playerId in state.players) {
      const playerData = state.players[playerId];
      
      // Skip the local player
      if (this.room && playerId === this.room.sessionId) {
        // Store server position for reconciliation
        this.serverPosition = { ...playerData.position };
        this.serverRotation = playerData.rotation;
        
        // Server reconciliation
        this.reconcileWithServer();
        continue;
      }
      
      // Update or create other player
      this.updateOtherPlayer(playerId, playerData.position, playerData.rotation);
    }
    
    // Remove players that are no longer in the state
    this.otherPlayers.forEach((_, playerId) => {
      if (!state.players[playerId]) {
        this.removeOtherPlayer(playerId);
      }
    });
    
    // Update game time
    this.lastUpdateTime = Date.now();
  }

  /**
   * Update or create another player
   * @param playerId The player ID
   * @param position The player position
   * @param rotation The player rotation
   */
  private updateOtherPlayer(playerId: string, position: Vector2, rotation: number): void {
    let otherPlayer = this.otherPlayers.get(playerId);
    
    if (!otherPlayer) {
      // Create new player
      otherPlayer = this.add.circle(
        position.x,
        position.y,
        WORLD_CONSTANTS.PLAYER_HITBOX_RADIUS,
        0xff0000
      );
      this.otherPlayers.set(playerId, otherPlayer);
    } else {
      // Update existing player
      otherPlayer.x = position.x;
      otherPlayer.y = position.y;
      // Could add rotation visualization here
    }
  }

  /**
   * Remove another player
   * @param playerId The player ID
   */
  private removeOtherPlayer(playerId: string): void {
    const otherPlayer = this.otherPlayers.get(playerId);
    if (otherPlayer) {
      otherPlayer.destroy();
      this.otherPlayers.delete(playerId);
    }
  }

  /**
   * Reconcile client position with server position
   */
  private reconcileWithServer(): void {
    if (!this.player || !this.serverPosition) return;
    
    // Remove inputs that have been processed by the server
    while (this.pendingInputs.length > 0) {
      const input = this.pendingInputs[0];
      this.pendingInputs.shift();
    }
    
    // Reset to server position
    this.player.x = this.serverPosition.x;
    this.player.y = this.serverPosition.y;
    
    // Reapply pending inputs
    for (const input of this.pendingInputs) {
      this.applyInput(input);
    }
  }

  /**
   * Apply input to the player
   * @param input The player input
   */
  private applyInput(input: PlayerInput): void {
    if (!this.player) return;
    
    // Apply movement
    this.player.x += input.movement.x * WORLD_CONSTANTS.PLAYER_MOVEMENT_SPEED / 60;
    this.player.y += input.movement.y * WORLD_CONSTANTS.PLAYER_MOVEMENT_SPEED / 60;
    // Could apply rotation here
  }

  /**
   * Game update function
   */
  private gameUpdate(): void {
    if (!this.player || !this.room) return;
    
    const cursors = (this as any).cursors;
    if (!cursors) return;
    
    // Create input based on keyboard state
    const input: PlayerInput = {
      movement: { x: 0, y: 0 },
      rotation: 0,
      actions: {
        primary: false,
        secondary: false,
        abilities: {
          movement: false,
          offense: false,
          defense: false,
          support: false
        }
      }
    };
    
    // Set movement based on arrow keys
    if (cursors.left.isDown) input.movement.x = -1;
    if (cursors.right.isDown) input.movement.x = 1;
    if (cursors.up.isDown) input.movement.y = -1;
    if (cursors.down.isDown) input.movement.y = 1;
    
    // Normalize diagonal movement
    if (input.movement.x !== 0 && input.movement.y !== 0) {
      const length = Math.sqrt(input.movement.x * input.movement.x + input.movement.y * input.movement.y);
      input.movement.x /= length;
      input.movement.y /= length;
    }
    
    // Apply input locally (client prediction)
    this.applyInput(input);
    
    // Add sequence number to input
    const sequencedInput = { ...input, sequence: this.inputSequence++ };
    
    // Add to pending inputs
    this.pendingInputs.push(input);
    
    // Send input to server
    this.room.send(MessageType.PLAYER_INPUT, sequencedInput);
  }

  update() {
    // This is called automatically by Phaser
  }
}

// Game provider component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }: GameProviderProps) => {
  const [game, setGame] = useState<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<GameContextState>({
    isInitialized: false,
    isLoading: false,
    error: null,
  });

  // Function to initialize the game
  const initializeGame = (serverUrl: string = 'ws://localhost:3001') => {
    if (gameState.isInitialized || gameState.isLoading) return;

    setGameState({ ...gameState, isLoading: true });

    try {
      // Configure the game
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        backgroundColor: '#000000',
        scene: [MainScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
      };

      // Create the game instance
      const gameInstance = new Phaser.Game(config);
      setGame(gameInstance);
      
      // Connect to the Colyseus server
      connectToServer(gameInstance, serverUrl);
      
    } catch (error) {
      setGameState({
        isInitialized: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize game',
      });
    }
  };
  
  // Function to connect to the Colyseus server
  const connectToServer = async (gameInstance: Phaser.Game, serverUrl: string) => {
    try {
      // Create Colyseus client
      const client = new Colyseus.Client(serverUrl);
      
      // Join a room
      const room = await client.joinOrCreate<ServerGameState>('grid_0_0');
      
      console.log('Connected to room:', room.id);
      
      // Get the main scene and set the room
      const scene = gameInstance.scene.getScene('MainScene') as MainScene;
      scene.setRoom(room);
      
      // Update game state
      setGameState({
        isInitialized: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setGameState({
        isInitialized: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize game',
      });
    }
  };

  // Clean up the game instance when the component unmounts
  useEffect(() => {
    return () => {
      if (game) {
        game.destroy(true);
        setGame(null);
        setGameState({
          isInitialized: false,
          isLoading: false,
          error: null,
        });
      }
    };
  }, [game]);

  // Provide the game context to children
  return (
    <GameContext.Provider
      value={{
        gameState,
        game,
        initializeGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};