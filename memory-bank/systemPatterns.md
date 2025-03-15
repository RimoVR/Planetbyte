# PlanetByte System Patterns

## System Architecture

PlanetByte follows a client-server architecture with clear separation of concerns between frontend and backend components. The architecture is designed for scalability, performance, and maintainability.

### High-Level Architecture

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│           CLIENT (Vercel)           │      │          SERVER (DigitalOcean)       │
│                                     │      │                                      │
│  ┌─────────────┐    ┌────────────┐  │      │  ┌─────────────┐    ┌────────────┐  │
│  │  Phaser 3   │    │   React    │  │      │  │ Colyseus.js │    │   Node.js  │  │
│  │  Game Canvas│    │   UI Layer │  │      │  │ Game Server │    │  API Layer │  │
│  └─────────────┘    └────────────┘  │      │  └─────────────┘    └────────────┘  │
│          │                │         │      │          │                │         │
│          └────────┬───────┘         │      │          └────────┬───────┘         │
│                   │                 │      │                   │                 │
│          ┌────────────────┐         │      │          ┌────────────────┐         │
│          │  WebSocket &   │         │◄─────┼─────────►│  WebSocket &   │         │
│          │   HTTP Client  │         │      │          │   HTTP Server  │         │
│          └────────────────┘         │      │          └────────────────┘         │
└─────────────────────────────────────┘      └─────────────────────────────────────┘
                                                              │
                                                              │
                                             ┌────────────────┴───────────────┐
                                             │                                │
                                             │  ┌──────────────────────────┐  │
                                             │  │        Supabase          │  │
                                             │  │ (Auth, PostgreSQL, CDN)  │  │
                                             │  └──────────────────────────┘  │
                                             │                                │
                                             │  ┌──────────────────────────┐  │
                                             │  │          Redis           │  │
                                             │  │  (State & Pub/Sub)       │  │
                                             │  └──────────────────────────┘  │
                                             │                                │
                                             └────────────────────────────────┘
```

### Client-Side Architecture

The client-side architecture follows a layered approach:

1. **Game Layer (Phaser 3)**
   - Handles game rendering, physics, and input processing
   - Manages game state synchronization with server
   - Implements client-side prediction for responsive gameplay

2. **UI Layer (React & TypeScript)**
   - Provides user interface outside the game canvas
   - Handles menus, settings, and non-gameplay interactions
   - Communicates with the game layer through a well-defined interface

3. **Communication Layer**
   - WebSocket connection for real-time game state updates
   - HTTP requests for non-real-time operations
   - Handles connection management and reconnection logic

### Server-Side Architecture

The server architecture is designed for scalability and real-time performance:

1. **Game Server (Colyseus.js on Node.js)**
   - Manages game rooms and player connections
   - Implements authoritative game logic and physics
   - Handles spatial partitioning for efficient updates

2. **State Management**
   - Redis for in-memory state and pub/sub messaging
   - Supabase PostgreSQL for persistent storage
   - Clear separation between ephemeral and persistent data

3. **Authentication & Asset Delivery**
   - Supabase for user authentication and management
   - CDN integration for efficient asset delivery
   - Discord OAuth2 for social integration

## Key Technical Decisions

### 1. Server-Authoritative Model

**Decision:** Implement a fully server-authoritative model for game physics, hit detection, and critical game state.

**Rationale:**
- Prevents cheating and ensures fair gameplay
- Provides consistent experience across all clients
- Simplifies conflict resolution in a multiplayer environment

**Implementation:**
- All critical calculations performed server-side
- Client-side prediction for responsive feel
- Server reconciliation to correct client prediction errors

### 2. Spatial Partitioning

**Decision:** Implement a custom room-based architecture with grid cells and overlapping boundaries.

**Rationale:**
- Enables efficient scaling to support thousands of concurrent players
- Reduces network traffic by sending only relevant updates to each client
- Allows for dynamic map scaling based on player population

**Implementation:**
- Map divided into grid cells with authority handoff protocols
- Interest management system to filter updates by relevance
- Overlapping boundaries to handle entity transitions smoothly

### 3. Managed Services Approach

**Decision:** Utilize managed services (Vercel, DigitalOcean App Services, Supabase) rather than custom infrastructure.

**Rationale:**
- Reduces DevOps overhead and operational complexity
- Provides cost-effective scaling during early development
- Leverages built-in security and reliability features

**Implementation:**
- Frontend hosted on Vercel with global CDN
- Game server deployed on DigitalOcean App Services
- Authentication and persistence handled by Supabase

### 4. Simplified Physics Model

**Decision:** Use simplified circular hitboxes (50cm diameter) for all player characters.

**Rationale:**
- Reduces computational complexity for physics calculations
- Ensures consistent collision detection across all clients
- Simplifies server-side hit detection algorithms

**Implementation:**
- Uniform hitbox size for all character types
- Server-authoritative collision detection
- Optimized algorithms for large numbers of entities

## Design Patterns

### 1. Observer Pattern

**Usage:** Game state synchronization between server and clients.

**Implementation:**
- Server maintains authoritative game state
- Clients observe and render state changes
- Optimized delta updates to minimize bandwidth

### 2. Command Pattern

**Usage:** Player input handling and action execution.

**Implementation:**
- Client captures input as commands
- Commands sent to server for validation and execution
- Server broadcasts resulting state changes

### 3. Component-Entity-System (CES)

**Usage:** Game object management and behavior implementation.

**Implementation:**
- Entities represent game objects (players, projectiles, etc.)
- Components define behaviors and properties
- Systems process entities with specific component combinations

### 4. Factory Pattern

**Usage:** Creation of game entities and abilities.

**Implementation:**
- Factories for different entity types (players, projectiles, etc.)
- Ability factories for creating and configuring player abilities
- Ensures consistent entity creation and initialization

### 5. Pub/Sub Pattern

**Usage:** Event handling and cross-component communication.

**Implementation:**
- Redis-based pub/sub for server-side events
- In-memory event bus for client-side communication
- Decouples components and systems for better maintainability

## Component Relationships

### Game State Management

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client State   │◄────┤  Server State   │────►│  Persistence    │
│  (Phaser.js)    │     │  (Colyseus.js)  │     │  (Supabase)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲                       ▲
        │                       │                       │
        │                       │                       │
        │                       │                       │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Input Handler  │────►│  Game Logic     │────►│  State Updates  │
│  (Client)       │     │  (Server)       │     │  (Redis)        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Player Ability System

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Ability Slot   │────►│  Ability Base   │◄────┤  Augmentation   │
│  (Container)    │     │  (Behavior)     │     │  (Modifier)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                │
                                ▼
                        ┌─────────────────┐
                        │                 │
                        │  Effect System  │
                        │  (Application)  │
                        │                 │
                        └─────────────────┘
                                │
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
        ┌─────────────────┐             ┌─────────────────┐
        │                 │             │                 │
        │  Self Effects   │             │  World Effects  │
        │  (Player)       │             │  (Environment)  │
        │                 │             │                 │
        └─────────────────┘             └─────────────────┘
```

### Visibility System

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Player View    │◄────┤  Server Auth    │────►│  Map Status     │
│  (Client)       │     │  (Visibility)   │     │  (Strategic)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲                       ▲
        │                       │                       │
        │                       │                       │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Fog of War     │     │  Visibility     │     │  Battle         │
│  (Renderer)     │     │  Modifiers      │     │  Detection      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Performance Considerations

### Client-Side Optimizations
- Efficient sprite batching for rendering
- Asset preloading and caching
- Visibility culling for off-screen entities
- Throttled network updates based on relevance

### Server-Side Optimizations
- Interest management to filter updates by proximity
- Spatial partitioning for efficient entity lookup
- Optimized physics calculations with simplified hitboxes
- Batched database operations for persistence

### Network Optimizations
- Delta compression for state updates
- Binary protocol for efficient data transfer
- Prioritized updates based on gameplay relevance
- Adaptive update rates based on connection quality

## Performance Monitoring and Optimization

[Previous content remains unchanged]

## Adaptive Grid Cell Sizing

### Overview

Adaptive Grid Cell Sizing dynamically adjusts the size of grid cells in the spatial partitioning system based on player density. This optimization:

- Reduces computational load in low-density areas by using larger cells
- Improves precision in high-density areas by using smaller cells
- Optimizes network traffic by focusing resources where needed
- Adapts automatically to changing player distributions

### Architecture

```mermaid
classDiagram
    SpatialPartitioningSystem --> InterestManager
    InterestManager --> GridCellTracker
    InterestManager --> DistanceCalculator
    InterestManager --> FactionVisibility
    GridCellTracker --> GridConfiguration
    GridCellTracker --> PlayerDensityAnalyzer
    
    class SpatialPartitioningSystem {
        -InterestManager interestManager
        -DeltaCompression deltaCompression
        -players: PlayerEntity[]
        +execute()
        +onEntityAdded(entity)
        +onEntityRemoved(entity)
    }
    
    class InterestManager {
        -GridCellTracker gridCellTracker
        -DistanceCalculator distanceCalculator
        -FactionVisibility factionVisibility
        +getRelevantEntities(player)
    }
    
    class GridCellTracker {
        -GridConfiguration gridConfig
        -PlayerDensityAnalyzer densityAnalyzer
        -cells: Map~string, GridCell~
        +getCurrentCell(entity)
        +getNeighborCells(cell)
        +updateCellSizes()
    }
    
    class GridConfiguration {
        -minCellSize: number
        -maxCellSize: number
        -densityThresholdLow: number
        -densityThresholdHigh: number
        -adaptationRate: number
        +calculateOptimalSize(density, currentSize)
    }
    
    class PlayerDensityAnalyzer {
        -cellDensities: Map~string, number~
        +analyzeDensity(cells)
        +getDensityHotspots()
        +getDensityColdspots()
    }
```

### Key Components

#### GridConfiguration
Manages parameters that control how grid cells resize based on player density:

- `minCellSize`: Minimum cell dimension in game units
- `maxCellSize`: Maximum cell dimension in game units
- `densityThresholdLow`: Player count below which cells should expand
- `densityThresholdHigh`: Player count above which cells should shrink
- `adaptationRate`: How quickly cells resize (prevents abrupt changes)

#### PlayerDensityAnalyzer
Analyzes player density across grid cells to identify hotspots and coldspots:

- Tracks density per cell
- Identifies high-density areas (hotspots)
- Identifies low-density areas (coldspots)
- Provides density metrics for optimization

#### GridCellTracker
Manages grid cells with variable sizes:

- Tracks entity membership in cells
- Handles cell resizing based on density
- Manages entity redistribution after resizing
- Determines cell adjacency for variable-sized cells

#### InterestManager
Coordinates the interest management system with adaptive grid sizing:

- Triggers adaptive grid updates at appropriate intervals
- Uses grid cells for initial entity filtering
- Combines with distance and faction visibility filtering

### Configuration Options

The adaptive grid sizing system can be configured through the `SpatialPartitioningConfig` interface:

```typescript
interface SpatialPartitioningConfig {
  gridSize: number;           // Default grid cell size
  viewDistance: number;       // Base view distance
  adaptiveGridSizing: boolean; // Enable/disable adaptive sizing
  adaptiveUpdateInterval: number; // How often to update cell sizes (ms)
}
```

### Performance Considerations

- **Computational Overhead**: The density analysis runs periodically, not on every frame
- **Transition Cost**: Entity redistribution has a cost - batched updates minimize impact
- **Memory Usage**: Variable cell sizes may increase memory overhead - implemented pooling
- **Network Traffic**: Cell size changes are communicated efficiently with delta compression

### Future Improvements

- Dynamic adaptation rate based on player count
- Machine learning-based prediction of player movement patterns
- Integration with day/night cycle for visibility-based adjustments
- Region-specific adaptation based on map features