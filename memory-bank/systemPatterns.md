# PlanetByte System Patterns

## System Architecture

PlanetByte follows a client-server architecture with clear separation between frontend and backend components, designed for scalability, performance, and maintainability.

### High-Level Architecture

```
┌─────────────────────┐      ┌─────────────────────┐
│  CLIENT (Vercel)    │      │ SERVER (DigitalOcean)│
│                     │      │                      │
│  ┌─────────┐ ┌─────┐│      │┌─────────┐ ┌───────┐│
│  │Phaser 3 │ │React││      ││Colyseus │ │Node.js││
│  │Game     │ │UI   ││      ││Game     │ │API    ││
│  │Canvas   │ │Layer││◄─────┤│Server   │ │Layer  ││
│  └─────────┘ └─────┘│      │└─────────┘ └───────┘│
└─────────────────────┘      └──────┬──────────────┘
                                    │
                             ┌──────┴───────────┐
                             │  ┌─────────────┐ │
                             │  │  Supabase   │ │
                             │  │(Auth, DB)   │ │
                             │  └─────────────┘ │
                             │  ┌─────────────┐ │
                             │  │    Redis    │ │
                             │  │(State, Pub/Sub)│
                             │  └─────────────┘ │
                             └──────────────────┘
```

### Client-Side Architecture

1. **Game Layer (Phaser 3)**
   - Handles rendering, physics, input processing
   - Manages game state synchronization with server
   - Implements client-side prediction

2. **UI Layer (React & TypeScript)**
   - Provides UI outside the game canvas
   - Handles menus, settings, non-gameplay interactions
   - Communicates with game layer through defined interface

3. **Communication Layer**
   - WebSocket for real-time game state updates
   - HTTP requests for non-real-time operations
   - Connection management and reconnection logic

### Server-Side Architecture

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

## Technologies Used

### Frontend Technologies

- **Phaser 3**: Primary framework for 2D game canvas
  - 2D rendering, sprite management, animation
  - Built-in physics systems (custom physics for multiplayer)
  - Multiple input methods support

- **React**: Component-based UI library
  - Manages non-gameplay interfaces
  - Responsive design for different screen sizes
  - Integrates with game canvas through refs

- **TypeScript**: Strongly-typed JavaScript
  - Type safety across codebase
  - Better tooling and IDE support
  - Code organization and maintainability

### Backend Technologies

- **Colyseus.js**: Multiplayer game server framework
  - Room-based architecture for game instances
  - WebSocket connections and state synchronization
  - Built-in room and state management

- **Node.js**: JavaScript runtime
  - Powers game server and API endpoints
  - Asynchronous I/O for concurrent connections
  - Shares language with frontend for code reuse

- **Redis**: In-memory data store
  - Fast state management and caching
  - Pub/sub messaging for real-time communication
  - Session management and temporary data

- **Supabase**: Backend-as-a-Service
  - PostgreSQL database for persistent storage
  - Authentication services for user management
  - Storage functionality for asset hosting

### Infrastructure & Deployment

- **Vercel**: Frontend hosting
  - Global CDN for fast content delivery
  - Continuous deployment from Git

- **DigitalOcean App Services**: Backend hosting
  - Scalable infrastructure for multiplayer backend
  - Managed environment for Node.js applications

- **Cloudflare**: Security services
  - DDoS protection
  - Additional CDN capabilities
  - Security features (WAF, bot protection)

## Key Technical Decisions

### 1. Server-Authoritative Model

**Decision:** Implement fully server-authoritative model for game physics, hit detection, and critical game state.

**Rationale:**
- Prevents cheating and ensures fair gameplay
- Provides consistent experience across clients
- Simplifies conflict resolution

**Implementation:**
- Critical calculations performed server-side
- Client-side prediction for responsive feel
- Server reconciliation to correct prediction errors

### 2. Spatial Partitioning

**Decision:** Implement custom room-based architecture with grid cells and overlapping boundaries.

**Rationale:**
- Enables scaling to thousands of concurrent players
- Reduces network traffic with relevant-only updates
- Allows dynamic map scaling based on player population

**Implementation:**
- Map divided into grid cells with authority handoff protocols
- Interest management system to filter updates by relevance
- Overlapping boundaries for smooth entity transitions

### 3. Managed Services Approach

**Decision:** Utilize managed services (Vercel, DigitalOcean, Supabase) rather than custom infrastructure.

**Rationale:**
- Reduces DevOps overhead and complexity
- Cost-effective scaling during early development
- Leverages built-in security and reliability features

**Implementation:**
- Frontend on Vercel with global CDN
- Game server on DigitalOcean App Services
- Authentication and persistence via Supabase

### 4. Simplified Physics Model

**Decision:** Use simplified circular hitboxes (50cm diameter) for all player characters.

**Rationale:**
- Reduces computational complexity
- Ensures consistent collision detection
- Simplifies server-side hit detection algorithms

**Implementation:**
- Uniform hitbox size for all character types
- Server-authoritative collision detection
- Optimized algorithms for large entity numbers

### 5. Hybrid Map System

**Decision:** Implement hybrid map with fixed central region and three peripheral biomes in three-pronged star configuration.

**Rationale:**
- Balanced and distinct areas for each faction
- Fixed central region for intense battles
- Supports dynamic map scaling
- Creates natural faction territories

**Implementation:**
- Three-pronged design aligns with three-faction concept
- Combination of fixed and procedural elements
- Support for map shrink/regeneration mechanics

## Design Patterns

### 1. Observer Pattern
- Game state synchronization between server and clients
- Server maintains authoritative state
- Clients observe and render state changes
- Optimized delta updates to minimize bandwidth

### 2. Command Pattern
- Player input handling and action execution
- Client captures input as commands
- Commands sent to server for validation
- Server broadcasts resulting state changes

### 3. Component-Entity-System (CES)
- Game object management and behavior
- Entities represent game objects
- Components define behaviors and properties
- Systems process entities with specific component combinations

### 4. Factory Pattern
- Creation of game entities and abilities
- Factories for different entity types
- Ability factories for creating/configuring abilities
- Consistent entity creation and initialization

### 5. Pub/Sub Pattern
- Event handling and cross-component communication
- Redis-based pub/sub for server-side events
- In-memory event bus for client-side communication
- Decouples components and systems

## Component Relationships

### Game State Management
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Client State│◄────┤ Server State│────►│ Persistence │
│ (Phaser.js) │     │ (Colyseus)  │     │ (Supabase)  │
└─────┬───────┘     └─────┬───────┘     └─────┬───────┘
      │                   │                   │
┌─────┴───────┐     ┌─────┴───────┐     ┌─────┴───────┐
│ Input       │────►│ Game Logic  │────►│ State       │
│ Handler     │     │ (Server)    │     │ Updates     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Player Ability System
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Ability Slot│────►│ Ability Base│◄────┤Augmentation │
│ (Container) │     │ (Behavior)  │     │ (Modifier)  │
└─────────────┘     └─────┬───────┘     └─────────────┘
                          │
                    ┌─────┴───────┐
                    │ Effect      │
                    │ System      │
                    └─────┬───────┘
                          │
              ┌───────────┴───────────┐
              │                       │
        ┌─────┴───────┐         ┌─────┴───────┐
        │ Self Effects│         │ World       │
        │ (Player)    │         │ Effects     │
        └─────────────┘         └─────────────┘
```

## Performance Optimization

### Client-Side Optimizations
- Efficient sprite batching for rendering
- Asset preloading and caching
- Visibility culling for off-screen entities
- Throttled network updates based on relevance

### Server-Side Optimizations
- Interest management to filter updates by proximity
- Spatial partitioning for efficient entity lookup
- Optimized physics with simplified hitboxes
- Batched database operations for persistence

### Network Optimizations
- Delta compression for state updates
- Binary protocol for efficient data transfer
- Prioritized updates based on gameplay relevance
- Adaptive update rates based on connection quality

## Performance Monitoring Systems

### Metrics Collection System
- Centralized metrics collection and aggregation
- Multiple metric types: counters, gauges, histograms, timers
- Automatic snapshotting and historical data retention
- Specialized metrics for interest management system

### Delta Compression System
- Multiple compression levels (none, basic, advanced, binary)
- Type-specific optimizations for game data
- Compression statistics tracking
- Special handling for common game data types

### Testing and Monitoring
- Performance test scripts for simulating multiple clients
- Realistic player movement patterns
- Bandwidth usage tracking
- Compression ratio monitoring

## Development Setup

### Local Development Environment
- Node.js (v16+)
- npm or yarn
- Git
- Redis (local instance)
- PostgreSQL (local or Supabase)

### Frontend Setup
```bash
git clone https://github.com/planetbyte/planetbyte-client.git
cd planetbyte-client
npm install
npm run dev
```

### Backend Setup
```bash
git clone https://github.com/planetbyte/planetbyte-server.git
cd planetbyte-server
npm install
cp .env.example .env
# Edit .env with configuration
npm run dev
```

## Deployment Architecture

```
┌─────────────────┐
│    Internet     │
└────────┬────────┘
         │
┌────────┴────────┐
│  Cloudflare CDN │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴───┐ ┌───┴────┐
│ Vercel│ │Digital │
│Frontend│ │Ocean   │
└───┬───┘ └───┬────┘
    │         │
    │     ┌───┴────┐
    │     │ Redis  │
    │     └───┬────┘
    └─────┬───┘
          │
    ┌─────┴─────┐
    │  Supabase │
    │(Auth,DB,CDN)
    └───────────┘
```

### Scaling Strategy
- Horizontal scaling of game servers
- Redis cluster for increased throughput
- Database sharding for high player counts
- Multiple geographic regions with player routing

## Security Considerations

### Authentication & Authorization
- Discord OAuth2 for primary authentication
- JWT tokens for session management
- Role-based access for administrative functions

### Game Security
- Server authority for all critical logic
- Input validation for all client inputs
- Rate limiting to prevent abuse
- DDoS protection via Cloudflare
- TLS encryption for all communications

## MCP Integration

PlanetByte leverages several Model Context Protocol (MCP) servers:

### Sequential Thinking MCP Server
- Facilitates complex problem-solving
- Breaking down problems into manageable steps
- Revising thoughts as understanding deepens

### GitHub MCP Server
- Git operations and repository management
- File operations (create, update, read)
- Issue and PR handling
- Code search capabilities

### Brave Search MCP Server
- Web and local search capabilities
- Research for technical solutions
- Finding implementation examples

### Supabase MCP Server
- Database operations through SQL
- Schema exploration
- Data manipulation operations