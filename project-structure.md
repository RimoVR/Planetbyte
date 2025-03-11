# PlanetByte Project Structure

This document outlines the project structure for PlanetByte, designed to support deployment to multiple platforms.

## Repository Structure

The project is organized as a monorepo with the following structure:

```
planetbyte/                      # Root directory (master folder)
├── .github/                     # GitHub workflows and configuration
│   └── workflows/               # CI/CD workflows
│
├── packages/                    # Shared packages
│   ├── common/                  # Shared code between client and server
│   │   ├── src/                 # Source code
│   │   │   ├── types/           # Shared TypeScript types
│   │   │   ├── constants/       # Shared constants
│   │   │   └── utils/           # Shared utility functions
│   │   ├── package.json         # Package configuration
│   │   └── tsconfig.json        # TypeScript configuration
│   │
│   └── config/                  # Shared configuration
│       ├── eslint/              # ESLint configuration
│       ├── prettier/            # Prettier configuration
│       └── tsconfig/            # Base TypeScript configuration
│
├── apps/                        # Application code
│   ├── client/                  # Frontend application (Vercel)
│   │   ├── public/              # Static assets
│   │   ├── src/                 # Source code
│   │   │   ├── assets/          # Game assets
│   │   │   ├── components/      # React components
│   │   │   ├── game/            # Phaser game implementation
│   │   │   │   ├── scenes/      # Game scenes
│   │   │   │   ├── entities/    # Game entities
│   │   │   │   ├── systems/     # Game systems
│   │   │   │   └── utils/       # Game utilities
│   │   │   ├── hooks/           # React hooks
│   │   │   ├── services/        # API services
│   │   │   ├── store/           # State management
│   │   │   └── utils/           # Utility functions
│   │   ├── package.json         # Package configuration
│   │   ├── tsconfig.json        # TypeScript configuration
│   │   └── vite.config.ts       # Vite configuration
│   │
│   ├── server/                  # Backend application (DigitalOcean)
│   │   ├── src/                 # Source code
│   │   │   ├── rooms/           # Colyseus room definitions
│   │   │   ├── entities/        # Game entities
│   │   │   ├── systems/         # Game systems
│   │   │   ├── services/        # External services integration
│   │   │   ├── utils/           # Utility functions
│   │   │   └── index.ts         # Entry point
│   │   ├── package.json         # Package configuration
│   │   ├── tsconfig.json        # TypeScript configuration
│   │   └── Dockerfile           # Docker configuration
│   │
│   └── supabase/                # Supabase configuration
│       ├── migrations/          # Database migrations
│       ├── functions/           # Edge functions
│       ├── seed/                # Seed data
│       └── config.json          # Supabase configuration
│
├── tools/                       # Development tools
│   ├── scripts/                 # Build and deployment scripts
│   └── generators/              # Code generators
│
├── docs/                        # Documentation
│   ├── architecture/            # Architecture documentation
│   ├── api/                     # API documentation
│   └── guides/                  # Development guides
│
├── memory-bank/                 # Project memory bank
│
├── package.json                 # Root package configuration
├── turbo.json                   # Turborepo configuration
├── pnpm-workspace.yaml          # PNPM workspace configuration
└── README.md                    # Project overview
```

## Deployment Strategy

### Frontend (Vercel)

The `apps/client` directory contains the frontend application built with Phaser 3, React, and TypeScript. This will be deployed to Vercel.

### Backend (DigitalOcean App Platform)

The `apps/server` directory contains the backend application built with Node.js, Colyseus.js, and TypeScript. This will be deployed to DigitalOcean App Platform.

### Database and Authentication (Supabase)

The `apps/supabase` directory contains the Supabase configuration, including database migrations, edge functions, and seed data.

## Package Management

The project uses PNPM workspaces for package management, allowing for efficient dependency management across the monorepo.

## Build and Development

Turborepo is used for build orchestration, providing efficient caching and parallel execution of build tasks.

## Shared Code

Common code is shared between the client and server through the `packages/common` directory, ensuring type safety and consistency across the application.

## Configuration

Shared configuration for ESLint, Prettier, and TypeScript is maintained in the `packages/config` directory, ensuring consistent code style and quality across the project.

## Continuous Integration and Deployment

GitHub Actions workflows in the `.github/workflows` directory automate testing, building, and deployment to the respective platforms.