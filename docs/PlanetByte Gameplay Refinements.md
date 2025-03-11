Below is a comprehensive, integrated plan that combines all the detailed ideas from second round of gameplay planning. This plan is organized into clear sections that cover core systems, gameplay mechanics, item/progression systems, visual/audio design, and technical architecture. It emphasizes modularity, reusability, and efficient implementation using common classes, functions, and an ECS‐style framework.

  

⸻

  

1. Overview

  

PlanetByte is a persistent, rogue-like, top‐down third-person shooter MMO where three factions (differing only by color initially) battle for territory and control. The game blends classic arcade multiplayer spirit with modern, scalable web technologies. The design incorporates dynamic maps, modular systems, real‐time statistics (including K/D over the last hour and online Elo ratings), and a deep customization layer for abilities, items, and progression.

  

⸻

  

2. Core Systems

  

2.1. Statistics & Elo System

• Real-Time Aggregation:

• Use Supabase to continuously collect and update player statistics such as K/D (last hour) and Elo ratings.

• Design the database schema to be extensible (supporting assists, objective captures, damage dealt, etc.) for future expansions.

• Public Access:

• Expose these stats through API endpoints for in-game dashboards and leaderboards.

  

2.2. Map Generation & Tile System

• Hybrid Map Approach:

• Central Region:

• A fixed, designable area (modeled after a postapocalyptic city) generated from a low‐poly image.

• Each pixel in the input image represents a tile; the RGB values indicate the tile type and orientation.

• Periphery Biomes:

• Three fixed biomes (desert, forest, violet fungal/mycel) arranged in a three‐pronged star configuration (like thirds of a pie).

• Use a small set of modular tile assets to dynamically stitch together walls, buildings (with windows and doors), and natural obstacles.

• Tile Texture Variables:

• Embed gameplay variables directly into a dedicated channel on each tile texture (e.g., a channel value marks a tile as “shoot-through but non-traversable” like rivers, chasms, dunes, or windows).

• Preprocess the low‐poly image on load into an efficient in‑memory 2D tilemap structure for rapid runtime lookups.

• Data-Driven Configuration:

• Define tile types, building modules, and barrier properties via JSON so that new assets or behavior adjustments require no core code changes.

  

2.3. Spawn, Base & Capture Mechanics

• Dynamic Base Graph & Node System:

• Represent each base as a node in a dynamic graph. Bases may have multiple capture points and spawn locations.

• Nodes are connected with constraints (e.g., bases must be at least 100 meters apart), and respawns are allowed only at connected bases unless none exist.

• Capture Points & Timers:

• Some bases have multiple capture points; a faction must hold a majority to capture or defend a base.

• A timer system accelerates the capture process as more points fall under one faction’s control.

• Capture points can change ownership if a majority of players nearby belong to one faction.

• Spawn Buildings & Energy Shields:

• Spawn buildings are equipped with a shared energy shield (displayed in the faction’s color) that can be shot through only by the owning faction—minimizing spawn camping.

• Bases are designed with more than one spawn, placed away from capture points, and the faction’s main spawn (the one nearest the map edge or biome center) is invulnerable to capture.

• When the map shrinks (see below), main spawns are re-assigned based on occupancy.

• Map Shrink & Regeneration:

• Every few hours, regardless of population, the map shrinks to force an epic battle for the center.

• At shrink time, the periphery regenerates, and main spawns cycle so that every faction gets a chance to call a different biome “home.”

  

2.4. Strategic Map Interface & Spawn Selection

• Overview Map:

• Provide a real-time, interactive map showing the overall layout of biomes, bases, and node connections.

• Each base displays its current owner and connectivity, allowing players to quickly gauge control and battle hotspots.

• Spawn Selection:

• The strategic map serves as the spawn hub where players can choose a base (from among those owned by their faction) as their spawn point.

• The map dynamically adapts to changes (map shrinkage, base captures, and regenerations) so that the spawn options are always current.

  

⸻

  

3. Gameplay Mechanics

  

3.1. Player Movement & Interaction

• Movement & Mounting:

• Players can “mount up” to traverse between battles more quickly. Mounting requires standing still and restricts actions (unless an augmentation permits partial actions).

• Movement is designed to be “snappy” with responsive, but not instantaneous, turning (no 180° snap).

• View Distance & Fog of War:

• The default view distance is defined by a circular radius around the player plus an extended cone in the facing direction.

• Fog of war is dynamically updated based on obstacles (walls, trees) and indoor/outdoor transitions (e.g., players inside buildings see limited exterior views through windows/doors).

• Allies contribute to extending the visible area (their view circles can overlap).

• Aim Reward Mechanism:

• Since headshots aren’t possible in a 2D top-down view, implement a multiplier for bullets striking the center (a smaller inner circle) of an enemy’s hitbox.

  

3.2. Abilities & Augmentations

• Common Ability Class:

• Implement a shared “Ability” class for movement, offensive, defensive, and support abilities.

• Each ability handles activation, cooldowns, and effect resolution, and is attached as a component in the ECS.

• Augmentation System:

• Augmentations are designed as modifiers (decorators or wrappers) that can adjust ability parameters (damage, range, cooldown) or alter behavior entirely.

• For example, while mounting up players might not normally fire, an augmentation could allow limited shooting.

• Additional Support Abilities:

• Flashlight: Projects a cone-shaped view extension at night for the player (visible to both allies and enemies).

• Night Vision: Increases overall view distance during nighttime.

• Radar: Sweeps a line around the player that temporarily reveals enemy positions.

  

⸻

  

4. Item, Equipment & Progression Systems

  

4.1. Item Rarity & Attributes

• Rarity Tiers:

• Items are classified as Common, Uncommon, Rare, and Epic.

• Each rarity level provides flat stat bonuses (e.g., +10% improvement to a random stat such as damage, rate, range, or reduced bullet spread).

• Epic items offer two bonuses, with one bonus being enhanced by an additional +20%.

  

4.2. Armor Types

• Plasma Shield:

• Small shield providing bonus health that continuously regenerates (only the shield, not lost health). Rarity increases the regeneration rate.

• Energy Shield:

• Larger shield with slower regeneration (starts after 10 seconds without damage); rarity increases the overall shield amount.

• Plate:

• Offers even more bonus health but “breaks” (shows cracks) when depleted; it cannot be restored—only exchanged. Rarity increases the bonus amount.

• Berserk:

• No bonus health but kills build up a regenerative effect on normal health that triggers after 20 seconds without taking damage; rarity increases the regeneration amount and decreases the delay.

  

4.3. Trinkets (Unique Modifiers)

• Trinkets alter playstyle through inherent advantages/disadvantages and are only found in the world (not selectable at spawn). Examples include:

• The Blip: Teleports the player to the corpse of a slain enemy (10s cooldown).

• Vampirism: Reduces base health but heals a portion of damage dealt.

• Glass Canon: Grants a huge damage boost at the cost of a very small health pool.

• Road Runner: Reduces base speed but triggers a temporary speed burst after a kill.

• Tasmanian Devil: Increases base speed but slows briefly after a kill.

• Mirror Cabinet: Causes shots to be fired to the back as well, with input directions mirrored.

• Unstable: Shots build up stored damage that, if filled too quickly, erupts to damage the player and nearby enemies.

• Rigid: Drastically reduces bullet spread but restricts movement/aim to the four cardinal directions.

• Medium: Reduces view distance overall but provides extra view distance around allies.

• Egocentric: Increases view distance for the user, but does not grant extra view distance around allies.

• Backstabber: Increases damage when attacking from behind, but reduces damage when attacking from the front.

• Giant: Slightly increases damage and health, at the expense of a larger hitbox and sprite.

  

4.4. Item Drops & Inventory

• Drop Mechanics:

• Items drop from enemy corpses, defeated foes, or upon capturing points.

• Drop chances are weighted by enemy Elo and involvement (rewarding support roles).

• Items are visible only to individual players and despawn after 3 minutes or if the player moves too far away.

• Inventory & Loadout:

• Players can equip one weapon, one armor, and one trinket, with one additional item stored in their inventory.

• Common rarity armor and weapons may also be obtained at spawn points, allowing players to switch playstyles without dying.

  

4.5. Weapons & Progression

• Weapon Characteristics:

• Weapons vary in ammunition count, magazine size, and reload time.

• Ammunition may be replenished via certain abilities or by restocking at spawn.

• Progression:

• Players start with a basic gun and energy armor.

• XP is gathered rapidly at first, unlocking additional armor types, weapons, abilities, and augmentations.

• Unlock costs scale exponentially (e.g., 5 unlocks for a few dozen kills, 10 for ~100 kills, 15 for ~1000 kills, 20 for ~5000 kills), and players may reskill periodically (e.g., once a month).

  

⸻

  

5. Visual & Audio Design

  

5.1. Sprites & Terrain

• Top-Down, No Perspective:

• All sprites are strictly top-down with a modular design.

• Terrain tiles are modular and can be rotated/mirrored to increase variety.

• Player Sprites:

• Sprites are centered on a 50 cm circular hitbox; the armor and weapon sprites are oriented to always point forward relative to movement/aim.

• Weapons are “glued” to the right side of the armor sprite, while trinkets are rendered as small, unique icons on the left.

• Rarity above common is indicated by a colored outline (e.g., uncommon = green, rare = blue, epic = violet).

• Nameplates:

• Each player’s permanent nickname is displayed above their hitbox, tinted in their faction (or mercenary) color.

  

5.2. Fog of War & View Distance

• Dynamic Visibility:

• Default view is defined by a circular area around the player plus a larger cone in the facing direction, making orientation relevant.

• Players can also see what nearby allies see, effectively merging view areas.

• Support Ability Effects:

• Flashlight: Projects an extended cone of visibility at night, visible to all nearby (allies and enemies).

• Night Vision: Increases overall view distance in darkness.

• Radar: Periodically sweeps a circular line that temporarily reveals enemy positions.

  

5.3. Audio

• Spatial Audio:

• Use compressed, spatially aware audio formats optimized for web delivery, ensuring positional audio enhances immersion.

  

⸻

  

6. Technical Architecture & Shared Logic

  

6.1. Entity Component System (ECS)

• Modularity & Reuse:

• All game entities (players, projectiles, items, barriers, etc.) are built using a component-based architecture that supports dynamic attachment of movement, collision, rendering, abilities, and more.

• This approach ensures that common functionality is centralized and easily reusable.

  

6.2. Shared Deterministic Modules

• Client-Server Consistency:

• Core logic for movement, collision (using a 50 cm circular hitbox standard), physics, and ability resolution is written in TypeScript and shared between client and server.

• This ensures deterministic simulation, robust client-side prediction, and accurate server reconciliation.

  

6.3. Networking & Interest Management

• Efficient Data Distribution:

• Use spatial partitioning (room-based with overlapping grid cells) and interest management systems so clients receive only relevant updates.

• Real-time state management is handled via Redis, with persistent data stored in Supabase/PostgreSQL.

  

6.4. Security & Cheat Prevention

• Server-Authoritative Logic:

• All critical calculations (hit detection, physics) are processed on the server to prevent client-side manipulation, while deterministic modules facilitate fast client prediction.