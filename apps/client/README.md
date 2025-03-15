# PlanetByte Game Client

This is the client-side implementation of the PlanetByte game, a 2D top-down third-person shooter MMO. The client is built using Phaser 3 for the game canvas and React for UI elements outside the game.

## Architecture

The client follows a layered architecture with clear separation between the game canvas (Phaser 3) and UI elements (React). It implements client-side prediction with server reconciliation for responsive gameplay while maintaining server authority.

### Key Features

- **Client-Side Prediction**: Applies player inputs immediately on the client for responsive gameplay
- **Server Reconciliation**: Corrects client state based on authoritative server updates
- **Component-Entity-System**: Game objects are managed using a component-entity-system architecture
- **Developer Art System**: Uses procedurally generated shapes and colors for placeholder visuals
- **Responsive UI**: Adapts to different screen sizes and devices

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration values.

## Development

Start the development server with hot reloading:

```bash
pnpm dev
```

The client will be available at http://localhost:3000 by default.

## Building for Production

Build the client for production:

```bash
pnpm build
```

The compiled files will be available in the `dist` directory.

## Docker Containerization

The client is containerized using Docker for deployment to the Hetzner server with Coolify.

### Building the Docker Image

```bash
# From the client directory
docker build -t planetbyte/client .

# Or from the project root
pnpm run docker:build
```

### Running the Docker Container Locally

```bash
docker run -p 3000:80 planetbyte/client
```

## Deployment with Coolify

The client is deployed to a Hetzner server using Coolify for container orchestration.

```bash
# From the project root
pnpm run deploy
```

This will deploy the client container to the Coolify instance running on the Hetzner server.

## Developer Art System

The client implements a developer art system for placeholder visuals that can be easily replaced with final artwork later.

### Entity Representation

- **Players**: Circular shapes with direction indicators, color-coded by faction
- **Projectiles**: Small colored dots with trail effects
- **Structures**: Simple geometric shapes color-coded by type and faction
- **Items**: Diamond shapes with color-coding based on rarity and type

### Tile System

- **Terrain Types**: Grid-based tiles with different colors and patterns
- **Biomes**: Color gradients to distinguish different map regions
- **Special Areas**: Distinct patterns for bases, capture points, and other special areas

### Asset Pipeline

The developer art system is designed with a swappable interface that will allow for easy replacement with final artwork later. All visual elements are generated procedurally with consistent naming conventions to facilitate this transition.

## Project Structure

```
src/
├── assets/              # Static assets (will be minimal with developer art)
├── components/          # React components for UI
├── game/                # Phaser game implementation
│   ├── scenes/          # Game scenes
│   ├── entities/        # Game entities
│   ├── systems/         # Game systems
│   └── art/             # Developer art generation
├── hooks/               # React hooks
├── services/            # Services for API communication
├── store/               # State management
└── utils/               # Utility functions
```

## License

This project is proprietary and confidential.