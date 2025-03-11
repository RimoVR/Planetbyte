# PlanetByte Project Brief

## Overview

**Title:** PlanetByte

**Genre:** 2D Top-Down Third-Person Shooter MMO

**Art Style:** Pixelated visuals inspired by Hellgate London with AI-generated artwork

**Core Concept:** A persistent, rogue-like world where three factions vie for territory control in dynamic, action-packed battles. The game resurrects the arcade spirit of mid-2000s multiplayer Flash games while leveraging modern web technologies for rapid, scalable development.

## Game World & Core Mechanics

### Persistent World & Faction Dynamics
- **Factions & Territories:** Three factions compete over a Planetside 2–inspired map featuring bases with capture points and respawn plots. No NPCs—only player-driven conflict.
- **Dynamic Map Scaling:** The map automatically adjusts in size based on player count. When player density is high, remote regions are unlocked, adding extra battlefronts. When too few players are present, a timer begins, and remote regions are temporarily locked (forcing any player inside to respawn).

### Rogue-like Elements & Progression
- **Character Persistence:** Skills and certain augmentations persist through death, while carried items vanish on respawn.
- **Experience & Elo System:** Experience is earned through base captures, kills (with bonus XP for eliminating more seasoned foes), and supporting teammates. An Elo-like system applies diminishing returns on XP as players progress, preventing runaway leveling.
- **Item Drops & Risk:** Killing enemy players yields a chance for item drops—the higher the opponent's Elo, the better the drop odds. Repeatedly killing the same enemy drastically reduces drop chances (which then gradually recuperate), encouraging varied matchups.
- **Team-Based Resurrection:** Fallen allies can be revived in a short window, but the resurrection process leaves them temporarily vulnerable.

### Visibility & Awareness
- **Fog of War System:** Players have a limited view distance that can be affected by multiple factors: items that extend or reduce visibility range, day/night cycle (reduced visibility at night), abilities that enhance or impair vision, weapon attachments (e.g., scopes on sniper rifles extending vision range), allied players partially extending visibility in their vicinity.
- **Strategic Map Interface:** Players can access a map showing: base locations across the game world, current faction ownership of each base, contested bases (currently being captured), battle hotspots showing active conflict areas, their own faction's player concentration (general indicators, not exact positions).

## Character Customization & Abilities

Each character features four triggerable ability slots categorized as follows: Movement, Offense, Defense, and Support. Abilities are modifiable via an augmentation system that introduces trade-offs (advantages paired with disadvantages).

### Movement Abilities
- Jet Pack: Grants short bursts of flight to navigate obstacles or reposition rapidly.
- Grappling Hook: Pulls the player to a target location for swift repositioning.
- Motorbike: Mountable vehicle providing increased speed (though disallowing other abilities while in use).

### Offensive Abilities
- Standard Offense: Grenades, Rocket Launcher, Charge, Stomp.
- Additional Offensive Abilities: Chained Shot, Ricochet, EMP Grenade, Flash Grenade, Berserk Mode, Trick Shot.

### Defensive Abilities
- Standard Defense: Temporary personal shield, deployable directional shield, healing pack, stealth.
- Additional Defensive Abilities: Phase Shift, Reactive Armor, Mirror Shield, Decoy Drone.

### Support Abilities
- Standard Support: Supply ammunition drop, granting a temporary shield to nearby allies, healing gun, resurrection grenade.
- Additional Support Abilities: Resonance Aura, Healing Aura, Supply Drop, Energy Transfer, Boost Aura, Scout Drone.

## Weapon & Augmentation Systems

### Weapon Classes
- **Variety:** Sword and Shield, Mace, Gun, SMG, Shotgun, Assault Rifles, Heavy Guns, and Sniper Rifles.
- **Attributes:** Each class has distinct bullet spread, range, rate of fire, and delay characteristics, influencing playstyle and situational effectiveness.
- **Vision Enhancements:** Certain weapons (particularly sniper rifles) can temporarily extend view distance when scoped or aimed.

### Augmentations & Trinkets
- **Customization:** Players can slot augmentations that modify both general and specific ability behaviors.
- **Trade-Offs:** Trinkets add advantages tied to disadvantages (e.g., a damage boost that self-inflicts a percentage of damage, or a lifedrain effect balanced by reduced speed).
- **Vision Modifiers:** Specific augmentations can enhance visibility range or provide specialized vision types (infrared, pulse detection, etc.).

## Environmental & Dynamic Systems

### Day and Night Cycles
- **Cyclical Gameplay:** An hourly cycle shifts between day and night.
- **Night Mechanics:** At night, enemies become audible over longer distances but are less visible. Special abilities (e.g., infrared vision or light-based enhancements) can mitigate low visibility. Fog of war is naturally more restrictive at night, reducing standard view distance.

### Dynamic Hazards
- **Environmental Events:** Randomized events such as meteor strikes, electrical storms, or toxic gas clouds alter battlefield conditions. These hazards force players to adapt tactics, provide opportunities for ambushes, or create temporary safe zones.
- **Map Interactivity:** Destructible terrain elements allow players to modify the battlefield (e.g., blowing up barriers or creating new pathways).
- **Visibility Impacts:** Some environmental hazards may temporarily reduce visibility or create areas of enhanced concealment.

## Technical Architecture

### Performance Targets
- **Frame Rate:** Minimum 60 FPS on modern mobile devices with integrated graphics.
- **Player Capacity:** Up to 10,000 concurrent players per server.
- **Latency:** Maximum 50ms latency tolerance for responsive gameplay.
- **Bandwidth:** Optimized for good 4G connections (limiting packet size and update frequency).

### Client-Side
- **Technologies:** Phaser 3 as primary framework for the 2D game canvas with excellent mobile support. React & TypeScript for UI components outside the game canvas, ensuring type safety and maintainability.
- **Frontend Hosting:** React/TypeScript UI and static game assets are hosted on Vercel. Its generous free tier and global CDN ensure fast, reliable delivery and simplified Git integration for continuous deployment.
- **Platforms:** Playable in browsers on PC, Mac, Android, and iOS—with support for touch, mouse/keyboard, and gamepad (twin-stick shooter style).
- **Fog of War Implementation:** Client-side shader effects for fog of war with server authority on visibility determination.

### Server-Side
- **Backend Framework:** Node.js with Colyseus.js. The multiplayer game server is built using Colyseus.js, deployed on DigitalOcean App Services. This managed environment supports low-latency, persistent WebSocket connections for real-time interactions while remaining cost-effective and scalable.
- **State & Data Management:** Supabase used as a unified backend solution for authentication, PostgreSQL-based persistent storage, and asset hosting via a built-in CDN. Redis provides fast in-memory state management and pub/sub messaging for real-time session handling.
- **Spatial Partitioning:** A custom room-based architecture divides the map into grid cells with overlapping boundaries. Authority handoff protocols manage entities crossing boundaries. An interest management system ensures only relevant updates are sent to each client.
- **Physics & Hit Detection:** Fully server-authoritative calculations (potentially GPU-accelerated) ensure fairness and minimize latency. Simple circular hitboxes (50cm diameter) are used for consistent and optimized collision detection.
- **Visibility System:** Server-authoritative calculations determine each player's view. Optimized updates reveal fog of war sections. Battle detection and map status systems support the strategic overview map.

### Infrastructure & Security
- **Managed Services & Cost Efficiency:** Leveraging DigitalOcean App Services, Supabase, and Vercel minimizes DevOps overhead while keeping operational costs low during early development and scaling.
- **Containerization & Orchestration:** While Kubernetes is available for scalable container management, the initial deployment uses managed platforms to reduce setup complexity.
- **DDoS Protection & CDN:** Cloudflare (or similar services) is used to provide CDN functionality and robust DDoS protection.
- **Cheat Prevention:** All critical calculations (hit detection, physics) are processed server-side to prevent client-side manipulation.

## Game Mechanics Specifics

### Combat System
- **Damage & Health:** Integer-based health and damage values to simplify calculations and reduce server load.
- **Hitboxes:** Uniform circular hitboxes (50cm diameter) for all player characters ensure simplicity and consistency.
- **Abilities:** Numerical balancing for abilities will be refined during playtesting.

### Movement System
- **Design Philosophy:** Movement should feel "snappy" and highly responsive.
- **Parameters:** Exact values for acceleration, top speed, and ability effects will be determined through iterative playtesting.

### Map & Environment
- **Scale:** Maximum map size of approximately 6km with player hitbox diameter of 50cm.
- **Audio:** Compressed audio formats optimized for web delivery with appropriate spatial audio effects.
- **Map Dynamics:** Clear rules govern dynamic resizing based on player count.

### Strategic Information Systems
- **Map Interface:** An interactive map displays real-time territory control and battle indicators.
- **Visibility Mechanics:** A dynamic fog of war system factors in multiple visibility modifiers.
- **Team Awareness:** Partial information sharing between allied faction members enhances strategic coordination.

## Integration & Monetization

### Social & Authentication
- **Discord OAuth2:** Used for user authentication with integration into dedicated faction voice/text channels.
- **Chat:** Although there is no built-in in-game chat, Discord integration provides seamless communication.

### Monetization Strategy
- **Free-to-Play Model:** No purchasable gameplay advantages to maintain fairness.
- **Subscriptions:** Optional subscription offers benefits like queue prioritization.
- **Advertising:** Rentable billboards within the game environment.
- **Cosmetic Shop:** Future possibilities include cosmetic item purchases that are purely aesthetic.

## Development Approach

### MVP Focus
- Build a playable prototype focusing on the core scalable scaffold as quickly as possible.
- Begin with developer art and placeholders, refining design and features iteratively.
- Prioritize core multiplayer functionality and robust server infrastructure over peripheral features.

### Asset Strategy
- Start with simple placeholder assets during development.
- Implement an asset pipeline that can easily be upgraded as the game matures.
- Focus on gameplay mechanics before visual polish.

## Implementation Steps

1. Build Basic Client with Phaser 3 Canvas & Circle Representation
2. Implement Basic Player Movement on Client
3. Setup Colyseus.js Server on DigitalOcean App Services
4. Establish Client-Server Communication (Real-Time Sync)
5. Implement Basic Shooting Mechanic on Client
6. Add Server-Side Hit Detection & Game Physics
7. Integrate Spatial Partitioning for Multiplayer Scaling
8. Refine with Debug UI & Additional Features