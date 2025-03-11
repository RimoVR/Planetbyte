# PlanetByte Decision Log

This document records key decisions made during the development of PlanetByte, including technical, architectural, and implementation decisions, along with the rationale and alternatives considered.

## Architectural Decisions

### AD-001: Client-Server Architecture with Clear Separation of Concerns

**Date**: March 10, 2025

**Decision**: Implement a client-server architecture with clear separation between frontend (client) and backend (server) components.

**Context**: The game requires a multiplayer architecture that can support thousands of concurrent players while preventing cheating and ensuring fair gameplay.

**Rationale**:
- Server-authoritative model prevents client-side cheating
- Clear separation of concerns improves maintainability
- Allows independent scaling of client and server components
- Enables different optimization strategies for each component

**Alternatives Considered**:
1. **Peer-to-peer architecture**: Rejected due to security concerns, difficulty in preventing cheating, and challenges in scaling to thousands of players.
2. **Hybrid model with client authority for some actions**: Rejected to maintain a consistent security model, though client-side prediction will be used for responsiveness.

**Consequences**:
- Increased development complexity
- Additional latency compared to client-only calculations
- Need for client-side prediction and server reconciliation
- Better security and cheat prevention

### AD-002: Managed Services Approach for Infrastructure

**Date**: March 10, 2025

**Decision**: Utilize managed services (Vercel, DigitalOcean App Services, Supabase) rather than custom infrastructure.

**Context**: The project aims for rapid development and iteration while minimizing DevOps overhead.

**Rationale**:
- Reduces operational complexity and maintenance burden
- Provides cost-effective scaling during early development
- Leverages built-in security and reliability features
- Allows the team to focus on game development rather than infrastructure

**Alternatives Considered**:
1. **Custom Kubernetes deployment**: Rejected for initial development due to higher complexity and operational overhead, though may be considered for later scaling.
2. **Traditional VPS hosting**: Rejected due to increased maintenance requirements and less automatic scaling capabilities.

**Consequences**:
- Some limitations in customization compared to self-hosted infrastructure
- Potential vendor lock-in
- Simplified deployment and operations
- Reduced initial development time

### AD-003: Spatial Partitioning for Game World

**Date**: March 10, 2025

**Decision**: Implement a custom room-based architecture with grid cells and overlapping boundaries for spatial partitioning.

**Context**: The game world needs to support thousands of players while only sending relevant updates to each client.

**Rationale**:
- Enables efficient scaling to support thousands of concurrent players
- Reduces network traffic by sending only relevant updates to each client
- Allows for dynamic map scaling based on player population
- Provides a framework for authority handoff as entities move between cells

**Alternatives Considered**:
1. **Single game room for all players**: Rejected due to scaling limitations and excessive network traffic.
2. **Quad-tree partitioning**: Considered but rejected for initial implementation due to added complexity, may be revisited if grid-based approach shows performance issues.

**Consequences**:
- Increased complexity in entity management and state synchronization
- Need for authority handoff protocols
- Better performance and scalability
- More efficient network usage

### AD-004: Hybrid Map System with Central Region and Peripheral Biomes

**Date**: March 11, 2025

**Decision**: Implement a hybrid map approach with a fixed central region and three peripheral biomes arranged in a three-pronged star configuration.

**Context**: The game needs a diverse and interesting map that can support dynamic scaling based on player count while maintaining distinct faction territories.

**Rationale**:
- Provides a balanced and visually distinct area for each faction
- Allows for a fixed, carefully designed central region for intense battles
- Supports the dynamic map scaling requirement with peripheral regions
- Creates natural faction territories with the three-pronged design
- Enables efficient map generation through a combination of fixed and procedural elements

**Alternatives Considered**:
1. **Fully procedural map**: Rejected due to difficulty in ensuring balanced gameplay and faction territories.
2. **Fully fixed map**: Rejected due to lack of flexibility for dynamic scaling based on player count.
3. **Hexagonal grid arrangement**: Considered but rejected in favor of the three-pronged design that better aligns with the three-faction concept.

**Consequences**:
- More complex map generation system
- Need for careful design of the central region
- Better visual identity for each faction's territory
- More interesting and varied gameplay environments
- Support for the map shrink and regeneration mechanics

## Technical Decisions

### TD-001: Phaser 3 as Game Engine

**Date**: March 10, 2025

**Decision**: Use Phaser 3 as the primary game engine for the client-side implementation.

**Context**: The game requires a robust 2D rendering engine with good mobile support and active community.

**Rationale**:
- Mature and well-maintained 2D game framework
- Excellent support for mobile devices
- Good performance on various browsers and devices
- Strong community and documentation
- Supports multiple input methods (keyboard, mouse, touch, gamepad)

**Alternatives Considered**:
1. **PixiJS**: Considered for its rendering performance, but lacks built-in game features that Phaser provides.
2. **Custom WebGL implementation**: Rejected due to increased development time and complexity.
3. **Three.js**: Considered for potential 3D elements, but deemed unnecessary for the 2D top-down design.

**Consequences**:
- Some performance overhead compared to raw WebGL
- Faster development with built-in game features
- Better cross-platform compatibility
- Easier onboarding for new developers

### TD-002: Colyseus.js for Multiplayer Server

**Date**: March 10, 2025

**Decision**: Use Colyseus.js as the multiplayer game server framework.

**Context**: The game requires a robust, scalable multiplayer server framework that integrates well with Node.js.

**Rationale**:
- Designed specifically for real-time multiplayer games
- Provides room-based architecture that aligns with our spatial partitioning approach
- Handles WebSocket connections and state synchronization efficiently
- Good documentation and active development
- TypeScript support for type safety

**Alternatives Considered**:
1. **Socket.io**: Considered for its widespread use, but lacks game-specific features that Colyseus provides.
2. **Custom WebSocket implementation**: Rejected due to increased development time and complexity.
3. **gRPC**: Considered for performance benefits, but WebSocket better suits the real-time bidirectional nature of the game.

**Consequences**:
- Learning curve for developers unfamiliar with Colyseus
- Dependency on third-party library and its development pace
- Faster implementation of multiplayer features
- Built-in solutions for common multiplayer challenges

### TD-003: TypeScript for Type Safety

**Date**: March 10, 2025

**Decision**: Use TypeScript for both client and server development.

**Context**: The project requires a robust type system to manage complex game state and reduce runtime errors.

**Rationale**:
- Provides static typing to catch errors at compile time
- Improves code maintainability and readability
- Enhances IDE support with better autocompletion and refactoring tools
- Facilitates better documentation through type definitions
- Allows sharing of type definitions between client and server

**Alternatives Considered**:
1. **Plain JavaScript**: Rejected due to lack of static typing and increased potential for runtime errors.
2. **Flow**: Considered but rejected in favor of TypeScript's wider adoption and better tooling.

**Consequences**:
- Additional build step and configuration
- Learning curve for developers unfamiliar with TypeScript
- Reduced runtime errors and improved code quality
- Better developer experience and productivity

### TD-004: Supabase for Authentication and Persistence

**Date**: March 10, 2025

**Decision**: Use Supabase as a unified backend solution for authentication, database, and asset storage.

**Context**: The project needs a reliable and scalable solution for user authentication, persistent storage, and asset management.

**Rationale**:
- Provides PostgreSQL database with real-time capabilities
- Offers built-in authentication system with multiple providers
- Includes storage solution for game assets
- Reduces the need for multiple services and integrations
- Good free tier for early development

**Alternatives Considered**:
1. **Firebase**: Considered but rejected due to preference for PostgreSQL over NoSQL for structured game data.
2. **Custom auth + PostgreSQL**: Considered but rejected to reduce development time and security concerns.
3. **AWS services (Cognito, RDS, S3)**: Considered but rejected due to higher complexity and cost for initial development.

**Consequences**:
- Some vendor lock-in to Supabase ecosystem
- Simplified authentication and storage implementation
- Reduced initial development time
- Potential migration complexity if changing later

### TD-005: Shared Deterministic Modules

**Date**: March 11, 2025

**Decision**: Implement core logic for movement, collision, physics, and ability resolution as shared TypeScript modules between client and server.

**Context**: The game requires consistent behavior between client prediction and server validation to ensure smooth gameplay with minimal corrections.

**Rationale**:
- Ensures deterministic simulation between client and server
- Reduces code duplication and maintenance burden
- Improves client-side prediction accuracy
- Simplifies server reconciliation process
- Provides a single source of truth for game logic

**Alternatives Considered**:
1. **Separate client and server implementations**: Rejected due to potential inconsistencies and increased maintenance burden.
2. **Server-only logic with client visualization**: Rejected due to increased latency and poor responsiveness.
3. **Client-side logic with server validation**: Rejected due to increased potential for cheating and exploitation.

**Consequences**:
- More complex module design to work in both environments
- Need for careful consideration of environment-specific dependencies
- Better consistency between client and server behavior
- Improved player experience with accurate prediction
- Reduced development time for new features

## Implementation Decisions

### ID-001: Simplified Physics Model with Circular Hitboxes

**Date**: March 10, 2025

**Decision**: Use simplified circular hitboxes (50cm diameter) for all player characters.

**Context**: The game requires efficient collision detection and physics calculations for thousands of entities.

**Rationale**:
- Reduces computational complexity for physics calculations
- Simplifies collision detection algorithms
- Ensures consistent behavior across all clients
- Easier to implement and maintain
- Sufficient for the game's top-down perspective and gameplay style

**Alternatives Considered**:
1. **Complex polygon hitboxes**: Rejected due to increased computational cost and complexity.
2. **Different hitbox sizes for different character types**: Considered but rejected for initial implementation to maintain consistency and simplicity.

**Consequences**:
- Less precise collision detection compared to shaped hitboxes
- Better performance for large numbers of entities
- Consistent and predictable physics behavior
- Simplified server-side hit detection

### ID-002: Server-Authoritative Game Logic

**Date**: March 10, 2025

**Decision**: Implement fully server-authoritative game logic for all critical gameplay elements.

**Context**: The game needs to prevent cheating while maintaining responsive gameplay.

**Rationale**:
- Prevents client-side cheating and exploitation
- Ensures consistent game state across all clients
- Provides a single source of truth for conflict resolution
- Necessary for fair competitive gameplay

**Alternatives Considered**:
1. **Client-authoritative with server validation**: Rejected due to increased potential for cheating.
2. **Hybrid approach with client authority for non-critical elements**: Considered for future optimization after core systems are established.

**Consequences**:
- Increased server computational requirements
- Additional latency for player actions
- Need for client-side prediction and reconciliation
- More secure and fair gameplay

### ID-003: Discord OAuth2 for Authentication

**Date**: March 10, 2025

**Decision**: Use Discord OAuth2 as the primary authentication method.

**Context**: The game needs a reliable authentication system that integrates with community features.

**Rationale**:
- Many gamers already have Discord accounts
- Provides built-in community integration
- Reduces the need for custom account management
- Offers secure authentication without password storage
- Facilitates social features and friend connections

**Alternatives Considered**:
1. **Custom authentication system**: Rejected due to increased development time and security concerns.
2. **Multiple OAuth providers (Google, Facebook, etc.)**: Considered for future implementation after Discord integration is complete.

**Consequences**:
- Dependency on Discord's OAuth service
- Potential barrier for users without Discord accounts
- Simplified authentication implementation
- Built-in community integration

### ID-004: Component-Entity-System Architecture

**Date**: March 10, 2025

**Decision**: Implement a Component-Entity-System (CES) architecture for game object management.

**Context**: The game requires a flexible and performant architecture for managing thousands of game objects with various behaviors.

**Rationale**:
- Provides a clean separation between data (components) and behavior (systems)
- Enables more efficient memory usage through composition over inheritance
- Facilitates better parallelization of game logic
- Allows for more flexible entity composition and behavior
- Simplifies serialization and network synchronization

**Alternatives Considered**:
1. **Traditional object-oriented inheritance**: Rejected due to less flexibility and potential performance issues with deep inheritance hierarchies.
2. **Entity-Component architecture without systems**: Considered but rejected due to less clear separation of concerns.
3. **Data-oriented design**: Considered for future optimization after core systems are established.

**Consequences**:
- Increased initial development complexity
- Learning curve for developers unfamiliar with CES
- Better performance for large numbers of entities
- More flexible game object composition
- Easier serialization for network transmission

### ID-005: Grid-Based Room Architecture Implementation

**Date**: March 10, 2025

**Decision**: Implement a grid-based room architecture with the WorldManager, GridRoom, and SpatialPartitioningSystem classes.

**Context**: The spatial partitioning approach needed a concrete implementation that integrates with Colyseus.js.

**Rationale**:
- Creates a scalable structure for managing large game worlds
- Divides the world into manageable grid cells with their own processing
- Enables efficient entity management and updates
- Provides clear boundaries for authority handoff between cells
- Supports dynamic world resizing based on player population

**Implementation Details**:
1. **GridRoom class**: Extends GameRoom to represent a single grid cell in the game world
2. **WorldManager class**: Manages the creation and coordination of grid rooms
3. **SpatialPartitioningSystem**: Handles entity distribution across grid cells
4. **Entity boundary crossing**: Implements logic for transferring entities between grid cells

**Consequences**:
- More complex server architecture
- Additional overhead for cross-cell communication
- Better scalability for large player counts
- More efficient network usage through interest management
- Clearer separation of concerns in the codebase

### ID-006: TypeScript ES2015 Configuration

**Date**: March 10, 2025

**Decision**: Configure TypeScript to target ES2015 with CommonJS modules for the server.

**Context**: The server code needed to support modern JavaScript features while maintaining compatibility with Node.js.

**Rationale**:
- ES2015 provides important language features like classes, arrow functions, and promises
- CommonJS module format is well-supported by Node.js
- Balances modern syntax with runtime compatibility
- Ensures consistent behavior across development and production environments

**Implementation Details**:
1. Updated tsconfig.json with target: "ES2015" and module: "CommonJS"
2. Added moduleResolution: "node" for proper module resolution
3. Enabled esModuleInterop for better interoperability with CommonJS modules

**Consequences**:
- Better developer experience with modern JavaScript features
- Improved code readability and maintainability
- Consistent behavior across environments
- Proper support for the Colyseus.js framework

### ID-007: Client-Side Prediction and Server Reconciliation

**Date**: March 10, 2025

**Decision**: Implement client-side prediction with server reconciliation for player movement.

**Context**: The game needs to provide responsive player movement while maintaining server authority.

**Rationale**:
- Reduces perceived latency for player actions
- Improves gameplay responsiveness
- Maintains server authority for cheat prevention
- Provides smooth movement even with network jitter
- Aligns with industry best practices for multiplayer games

**Implementation Details**:
1. **Client-side prediction**: Apply player inputs immediately on the client
2. **Input sequence numbering**: Assign sequence numbers to player inputs for tracking
3. **Server processing**: Process inputs on the server and update authoritative state
4. **State synchronization**: Send authoritative state back to clients with processed input sequence
5. **Client reconciliation**: Reapply pending inputs that haven't been processed by the server

**Alternatives Considered**:
1. **Server-only processing**: Rejected due to poor responsiveness and player experience.
2. **Client authority with server validation**: Rejected due to increased potential for cheating.
3. **Lockstep synchronization**: Rejected due to poor performance with high latency.

**Consequences**:
- Increased implementation complexity
- Potential for visual corrections during reconciliation
- Better player experience with responsive controls
- Maintained server authority for game state
- Reduced impact of network latency on gameplay

### ID-008: Entity Boundary Crossing Implementation

**Date**: March 10, 2025

**Decision**: Implement entity boundary crossing between grid cells with overlap area detection.

**Context**: Entities need to move seamlessly between grid cells while maintaining proper spatial partitioning.

**Rationale**:
- Ensures entities can move throughout the game world without interruption
- Maintains proper spatial partitioning for efficient updates
- Prevents entities from disappearing when crossing cell boundaries
- Supports the overlapping boundaries approach for smooth transitions
- Enables efficient interest management for network optimization

**Implementation Details**:
1. **SpatialPartitioningSystem enhancement**: Track which grid cells an entity belongs to and handle entities in overlap areas
2. **GridRoom boundary detection**: Check if entities are leaving the current cell or entering overlap areas
3. **Entity transfer mechanism**: Safely transfer entities between grid cells while maintaining their state
4. **Overlap area handling**: Allow entities to exist in multiple cells simultaneously when in overlap areas
5. **Cell membership tracking**: Keep track of which cells each entity belongs to for efficient updates

**Consequences**:
- More complex entity management across grid cells
- Increased memory usage due to entities existing in multiple cells
- Smoother gameplay experience with no visible cell transitions
- Better performance through more precise interest management
- Reduced network traffic by only sending relevant updates

### ID-009: Item Rarity and Attribute System

**Date**: March 11, 2025

**Decision**: Implement a four-tier rarity system (Common, Uncommon, Rare, Epic) with flat stat bonuses.

**Context**: The game needs a clear progression system for items that provides meaningful upgrades without creating insurmountable advantages.

**Rationale**:
- Creates a clear hierarchy of item quality that players can easily understand
- Provides meaningful progression through item acquisition
- Flat stat bonuses are easier to balance than percentage-based or exponential bonuses
- Multiple stats can be affected to create diverse item effects
- Epic items with dual bonuses create exciting "chase" items without breaking game balance

**Implementation Details**:
1. **Rarity tiers**: Common, Uncommon, Rare, and Epic
2. **Stat bonuses**: Flat improvements to stats like damage, rate of fire, range, or reduced bullet spread
3. **Epic items**: Two bonuses with one enhanced by an additional +20%
4. **Item representation**: Color-coded outlines to indicate rarity (green for uncommon, blue for rare, violet for epic)

**Alternatives Considered**:
1. **Percentage-based bonuses**: Rejected due to potential for exponential scaling and balance issues.
2. **More rarity tiers**: Considered but rejected to keep the system simple and understandable.
3. **Random stat ranges within tiers**: Considered for future implementation to add more variety.

**Consequences**:
- Clear progression path for players
- Easier balancing compared to percentage-based systems
- Visual distinction between item rarities
- Excitement for finding higher rarity items
- Manageable power difference between new and experienced players

### ID-010: Armor Type System

**Date**: March 11, 2025

**Decision**: Implement four distinct armor types (Plasma Shield, Energy Shield, Plate, Berserk) with unique regeneration mechanics.

**Context**: The game needs diverse defensive options that support different playstyles while maintaining balance.

**Rationale**:
- Creates meaningful choices for players based on their preferred playstyle
- Provides clear trade-offs between different armor types
- Supports various combat strategies (aggressive, defensive, etc.)
- Adds depth to the gameplay without excessive complexity
- Allows for visual distinction between different armor types

**Implementation Details**:
1. **Plasma Shield**: Small shield with continuous regeneration
2. **Energy Shield**: Larger shield with delayed regeneration (starts after 10 seconds without damage)
3. **Plate**: Even more bonus health but breaks when depleted and cannot be restored
4. **Berserk**: No bonus health but kills build up regeneration that triggers after 20 seconds without damage

**Alternatives Considered**:
1. **Single armor type with different stats**: Rejected due to less interesting gameplay choices.
2. **More complex armor system with multiple slots**: Considered but rejected for initial implementation to avoid overwhelming new players.
3. **Armor with active abilities**: Considered for future expansion after core systems are established.

**Consequences**:
- More interesting gameplay decisions
- Support for different playstyles
- Visual variety in player appearances
- Potential balance challenges between armor types
- Need for careful tuning of regeneration rates and health values

### ID-011: Testing Infrastructure for Multiple Clients

**Date**: March 11, 2025

**Decision**: Create a dedicated testing infrastructure with a test script for multiple clients connecting to the server.

**Context**: The game requires testing with multiple clients to verify WebSocket connection and state synchronization.

**Rationale**:
- Enables systematic testing of multiplayer functionality
- Provides a controlled environment for reproducing and debugging issues
- Allows for automated simulation of player actions
- Helps verify server-side state synchronization and reconciliation
- Supports development of interest management and network optimization

**Implementation Details**:
1. **Tools directory**: Created a dedicated directory for development tools and test scripts
2. **test-multiple-clients.js**: Implemented a script that creates multiple Colyseus.js clients and connects them to the server
3. **Simulated movement**: Added random movement simulation for each client to test state synchronization
4. **Package configuration**: Added package.json for the tools directory with necessary dependencies
5. **Documentation**: Created README.md with instructions for using the test scripts

**Alternatives Considered**:
1. **Manual testing with multiple browsers**: Rejected due to inefficiency and lack of reproducibility.
2. **Integration with a formal testing framework**: Considered for future implementation after basic testing infrastructure is established.
3. **Headless browser testing**: Considered but rejected for initial implementation due to added complexity.

**Consequences**:
- More efficient and reproducible testing process
- Better identification of multiplayer-specific issues
- Ability to simulate various network conditions and player behaviors
- Support for future performance testing and optimization
- Foundation for more comprehensive automated testing

### ID-012: Package.json Dependency Management

**Date**: March 11, 2025

**Decision**: Remove non-existent workspace dependencies from client and server package.json files.

**Context**: The client and server package.json files contained references to workspace dependencies that didn't exist, causing TypeScript errors.

**Rationale**:
- Resolves TypeScript errors caused by missing dependencies
- Simplifies the dependency structure
- Improves build reliability
- Prevents confusion for new developers
- Allows for proper workspace package resolution

**Implementation Details**:
1. **Client package.json**: Removed references to @planetbyte/config-eslint, @planetbyte/config-prettier, and @planetbyte/config-tsconfig
2. **Server package.json**: Removed references to @planetbyte/config-eslint, @planetbyte/config-prettier, and @planetbyte/config-tsconfig
3. **Retained @planetbyte/common**: Kept the reference to the common package which contains shared types and utilities

**Alternatives Considered**:
1. **Creating the missing packages**: Considered but rejected as unnecessary for the current development phase.
2. **Using external packages instead**: Considered but rejected to maintain the monorepo structure.

**Consequences**:
- Resolved TypeScript errors
- Simplified dependency management
- Improved build process reliability
- Clearer package structure for new developers
- Potential need to reintroduce shared configuration packages in the future

## Future Decisions Pending

### FD-001: Asset Pipeline and Art Style Implementation

**Status**: Under consideration

**Context**: The game requires a consistent art style and efficient asset delivery.

**Options Being Considered**:
1. Custom asset pipeline with automated optimization
2. Third-party asset management solutions
3. Procedural generation for certain elements

**Decision Criteria**:
- Performance impact on various devices
- Development time and complexity
- Flexibility for future art style evolution
- Support for AI-generated artwork integration

### FD-002: Matchmaking and Player Distribution

**Status**: Under consideration

**Context**: The game needs to efficiently distribute players across servers and regions.

**Options Being Considered**:
1. Geographic-based distribution with region selection
2. Skill-based matchmaking within regions
3. Dynamic server allocation based on population

**Decision Criteria**:
- Latency impact on gameplay
- Balance between factions
- Server resource utilization
- Player experience and preferences