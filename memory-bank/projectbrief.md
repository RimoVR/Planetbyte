# PlanetByte Project Brief

## Overview

**Title:** PlanetByte  
**Genre:** 2D Top-Down Third-Person Shooter MMO  
**Art Style:** Pixelated visuals inspired by Hellgate London with AI-generated artwork  
**Core Concept:** A persistent, rogue-like world where three factions vie for territory control in dynamic battles. Resurrects arcade spirit of mid-2000s multiplayer Flash games with modern web technologies.

## Game World & Core Mechanics

### Persistent World & Faction Dynamics
- **Factions & Territories:** Three factions compete over a Planetside 2–inspired map with capture points and respawn plots. Player-driven conflict only.
- **Dynamic Map Scaling:** Map adjusts size based on player count. High density unlocks remote regions; low density triggers timer to lock remote regions (forcing respawn).

### Rogue-like Elements & Progression
- **Character Persistence:** Skills and augmentations persist through death; carried items vanish on respawn.
- **Experience & Elo System:** XP from captures, kills (bonus for seasoned foes), and support. Elo-like system applies diminishing returns on XP.
- **Item Drops & Risk:** Kills yield item drops—higher opponent Elo improves odds. Repeatedly killing same enemy reduces drop chances.
- **Team-Based Resurrection:** Fallen allies revivable in short window, but process leaves them vulnerable.

### Visibility & Awareness
- **Fog of War System:** Limited view distance affected by: items, day/night cycle, abilities, weapon attachments, and allied players.
- **Strategic Map Interface:** Shows base locations, faction ownership, contested bases, battle hotspots, and faction player concentration.

## Character Customization & Abilities

Each character has four ability slots: Movement, Offense, Defense, and Support. Abilities are modifiable via augmentations (advantages paired with disadvantages).

### Movement Abilities
- Jet Pack: Short flight bursts for navigation/repositioning
- Grappling Hook: Pulls player to target location
- Motorbike: Mountable vehicle with increased speed (disables other abilities)

### Offensive Abilities
- Standard: Grenades, Rocket Launcher, Charge, Stomp
- Additional: Chained Shot, Ricochet, EMP/Flash Grenades, Berserk Mode, Trick Shot

### Defensive Abilities
- Standard: Personal shield, deployable shield, healing pack, stealth
- Additional: Phase Shift, Reactive Armor, Mirror Shield, Decoy Drone

### Support Abilities
- Standard: Ammo drop, ally shield, healing gun, resurrection grenade
- Additional: Resonance/Healing/Boost Auras, Supply Drop, Energy Transfer, Scout Drone

## Weapon & Augmentation Systems

### Weapon Classes
- **Variety:** Sword/Shield, Mace, Gun, SMG, Shotgun, Assault Rifles, Heavy Guns, Sniper Rifles
- **Attributes:** Distinct bullet spread, range, rate of fire, and delay characteristics
- **Vision Enhancements:** Certain weapons extend view distance when scoped/aimed

### Augmentations & Trinkets
- **Customization:** Slot augmentations modify ability behaviors
- **Trade-Offs:** Trinkets add advantages tied to disadvantages (e.g., damage boost with self-damage)
- **Vision Modifiers:** Augmentations can enhance visibility or provide specialized vision types

## Environmental & Dynamic Systems

### Day and Night Cycles
- **Cyclical Gameplay:** Hourly cycle shifts between day/night
- **Night Mechanics:** Enemies more audible but less visible; special abilities mitigate low visibility; restricted fog of war

### Dynamic Hazards
- **Environmental Events:** Random meteor strikes, electrical storms, toxic gas clouds alter battlefield
- **Map Interactivity:** Destructible terrain elements modify battlefield
- **Visibility Impacts:** Some hazards temporarily reduce visibility or create concealment

## Technical Architecture

### Performance Targets
- **Frame Rate:** Minimum 60 FPS on modern mobile devices
- **Player Capacity:** Up to 10,000 concurrent players per server
- **Latency:** Maximum 50ms for responsive gameplay
- **Bandwidth:** Optimized for good 4G connections

### Client-Side
- **Technologies:** Phaser 3 for 2D game canvas; React & TypeScript for UI components
- **Frontend Hosting:** Vercel with global CDN
- **Platforms:** Browsers on PC, Mac, Android, iOS—supporting touch, mouse/keyboard, gamepad
- **Fog of War:** Client-side shader effects with server authority on visibility

### Server-Side
- **Backend Framework:** Node.js with Colyseus.js on DigitalOcean App Services
- **State & Data:** Supabase for authentication, PostgreSQL storage, asset hosting; Redis for in-memory state
- **Spatial Partitioning:** Custom room-based architecture with grid cells and overlapping boundaries
- **Physics & Hit Detection:** Server-authoritative calculations with simple circular hitboxes (50cm diameter)
- **Visibility System:** Server-authoritative calculations with optimized fog of war updates

### Infrastructure & Security
- **Managed Services:** DigitalOcean, Supabase, Vercel for minimal DevOps overhead
- **Containerization:** Managed platforms initially; Kubernetes available for scaling
- **DDoS Protection:** Cloudflare for CDN and protection
- **Cheat Prevention:** Server-side processing of critical calculations

## Game Mechanics Specifics

### Combat System
- **Damage & Health:** Integer-based values for simplified calculations
- **Hitboxes:** Uniform circular hitboxes (50cm diameter) for consistency
- **Abilities:** Numerical balancing refined during playtesting

### Movement System
- **Design Philosophy:** "Snappy" and highly responsive movement
- **Parameters:** Acceleration, top speed, ability effects determined through playtesting

### Map & Environment
- **Scale:** Maximum 6km map size with 50cm player hitbox diameter
- **Audio:** Compressed formats optimized for web with spatial effects
- **Map Dynamics:** Clear rules for dynamic resizing based on player count

### Strategic Information Systems
- **Map Interface:** Interactive map with real-time territory control and battle indicators
- **Visibility Mechanics:** Dynamic fog of war with multiple visibility modifiers
- **Team Awareness:** Partial information sharing between allied faction members

## Integration & Monetization

### Social & Authentication
- **Discord OAuth2:** User authentication with faction channel integration
- **Chat:** Discord integration for communication

### Monetization Strategy
- **Free-to-Play Model:** No purchasable gameplay advantages
- **Subscriptions:** Optional with queue prioritization benefits
- **Advertising:** Rentable in-game billboards
- **Cosmetic Shop:** Future possibility for aesthetic items

## Development Approach

### MVP Focus
- Build playable prototype with core scalable scaffold quickly
- Begin with developer art and placeholders
- Prioritize multiplayer functionality and server infrastructure

### Asset Strategy
- Simple placeholders during development
- Upgradable asset pipeline
- Gameplay mechanics before visual polish

## Implementation Steps

1. Build Basic Client with Phaser 3 Canvas & Circle Representation
2. Implement Basic Player Movement on Client
3. Setup Colyseus.js Server on DigitalOcean
4. Establish Client-Server Communication
5. Implement Basic Shooting Mechanic
6. Add Server-Side Hit Detection & Physics
7. Integrate Spatial Partitioning for Scaling
8. Refine with Debug UI & Additional Features