# PlanetByte Development Tools

This directory contains various tools and utilities to help with PlanetByte development.

## Test Scripts

### Multiple Client Test

The `test-multiple-clients.js` script creates multiple Colyseus.js clients and connects them to the server to test state synchronization and client-server communication.

#### Prerequisites

- Node.js installed
- Server running locally on port 3001

#### Installation

```bash
# Install dependencies
pnpm install
```

#### Usage

1. Start the server in a separate terminal:

```powershell
# From the project root
cd apps/server
;
pnpm run dev
```

2. Run the test script:

```powershell
# From the tools directory
pnpm run test-clients
```

The script will:
- Create 3 clients (configurable in the script)
- Connect them to the server
- Simulate random movement for each client
- Log state updates and messages received from the server

Press Enter to disconnect all clients and exit the script.

#### Configuration

You can modify the following variables in the script:

- `SERVER_URL`: The URL of the server (default: `ws://localhost:3001`)
- `ROOM_NAME`: The name of the room to join (default: `grid_0_0`)
- `NUM_CLIENTS`: The number of clients to create (default: `3`)
- `MOVEMENT_INTERVAL`: The interval between movement updates in milliseconds (default: `500`)

## Docker and Containerization Tools

### Docker Build Scripts

The `docker-build.js` script automates the process of building Docker images for all components of the PlanetByte project.

#### Prerequisites

- Docker installed
- Node.js installed

#### Usage

```bash
# From the project root
pnpm run docker:build
```

The script will:
- Build Docker images for the client, server, and other components
- Tag the images appropriately
- Optimize the build process for faster iterations

### Coolify Deployment Scripts

The `coolify-deploy.js` script handles deployment to the Coolify instance running on the Hetzner server.

#### Prerequisites

- Coolify CLI installed
- Proper authentication configured

#### Usage

```bash
# From the project root
pnpm run deploy
```

The script will:
- Connect to the Coolify instance
- Deploy the latest Docker images
- Configure networking and environment variables
- Verify the deployment status

## Adding New Tools

To add a new tool:

1. Create a new script in the `scripts` directory
2. Add a new script entry in `package.json`
3. Document the tool in this README