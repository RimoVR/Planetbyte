# PlanetByte

A 2D top-down third-person shooter MMO with faction-based territorial control, built with modern web technologies.

## Overview

PlanetByte is a persistent, rogue-like world where three factions vie for territory control in dynamic, action-packed battles. The game resurrects the arcade spirit of mid-2000s multiplayer Flash games while leveraging modern web technologies for rapid, scalable development.

## Project Structure

This project is organized as a monorepo with the following structure:

- `apps/client`: Frontend application (Phaser 3, React, TypeScript) deployed to Vercel
- `apps/server`: Backend application (Node.js, Colyseus.js) deployed to DigitalOcean App Platform
- `apps/supabase`: Supabase configuration for authentication, database, and storage
- `packages/common`: Shared code between client and server
- `packages/config`: Shared configuration for ESLint, Prettier, and TypeScript
- `tools`: Development tools and scripts
- `docs`: Project documentation
- `memory-bank`: Project memory bank for persistent documentation

## Prerequisites

- Node.js (v16+)
- PNPM (v8+)
- Git
- Redis (local instance for development)
- PostgreSQL (local instance or Supabase project)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/planetbyte/planetbyte.git
cd planetbyte
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp apps/client/.env.example apps/client/.env.local
cp apps/server/.env.example apps/server/.env.local
```

4. Start the development servers:

```bash
pnpm dev
```

This will start the client, server, and any other necessary services in development mode.

## Development Workflow

### Client Development

The client is built with Phaser 3 for the game canvas and React for UI elements outside the game. TypeScript is used for type safety and better developer experience.

```bash
cd apps/client
pnpm dev
```

### Server Development

The server is built with Node.js and Colyseus.js for multiplayer game functionality. TypeScript is used for type safety and better developer experience.

```bash
cd apps/server
pnpm dev
```

### Supabase Development

Supabase is used for authentication, database, and storage. The `apps/supabase` directory contains migrations, edge functions, and seed data.

## Deployment

### Client (Vercel)

The client is deployed to Vercel. The `apps/client` directory contains the Vercel configuration.

```bash
cd apps/client
pnpm build
```

### Server (DigitalOcean App Platform)

The server is deployed to DigitalOcean App Platform. The `apps/server` directory contains the Dockerfile and configuration.

```bash
cd apps/server
pnpm build
```

### Supabase

Supabase is used for authentication, database, and storage. The `apps/supabase` directory contains the Supabase configuration.

## Documentation

For more detailed documentation, see the `docs` directory:

- [Architecture](docs/architecture/README.md)
- [API Documentation](docs/api/README.md)
- [Development Guides](docs/guides/README.md)

## Memory Bank

The `memory-bank` directory contains the project memory bank, which provides comprehensive documentation and context for the project. This is the primary source of truth for project requirements, architecture, and technical decisions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.