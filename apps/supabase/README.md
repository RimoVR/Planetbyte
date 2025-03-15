# PlanetByte Supabase Configuration

This directory contains the configuration for the self-hosted Supabase instance used by PlanetByte. Supabase provides authentication, database, and storage services for the game.

## Self-Hosted Supabase

PlanetByte uses a self-hosted Supabase instance running on the Hetzner server as a Docker container, orchestrated by Coolify.

### Key Features

- **Authentication**: Handles user authentication with Discord OAuth2
- **PostgreSQL Database**: Stores persistent game data
- **Storage**: Manages game assets and user-generated content
- **Real-time Subscriptions**: Provides real-time updates for certain data

## Setup

### Prerequisites

- Docker and Docker Compose installed
- Coolify installed on the Hetzner server

### Configuration

1. Update the `config.json` file with your specific settings:
   ```json
   {
     "project_id": "planetbyte",
     "db_host": "localhost",
     "db_port": 5432,
     "db_name": "postgres",
     "db_user": "postgres",
     "auth": {
       "site_url": "https://planetbyte.com",
       "additional_redirect_urls": ["http://localhost:3000"],
       "jwt_expiry": 3600,
       "enable_signup": true,
       "providers": {
         "discord": {
           "enabled": true,
           "client_id": "YOUR_DISCORD_CLIENT_ID",
           "secret": "YOUR_DISCORD_CLIENT_SECRET"
         }
       }
     }
   }
   ```

2. Create environment variables for sensitive information:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your secrets.

## Docker Deployment

### Local Testing

You can test the Supabase configuration locally using Docker Compose:

```bash
docker-compose up -d
```

This will start a local Supabase instance with the configuration specified in `config.json`.

### Deployment with Coolify

The Supabase instance is deployed to the Hetzner server using Coolify:

```bash
# From the project root
pnpm run deploy:supabase
```

This will deploy the Supabase container to the Coolify instance running on the Hetzner server.

## Database Migrations

Database migrations are managed using the Supabase CLI:

```bash
# Generate a new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push
```

## Schema

The database schema includes the following main tables:

- `users`: Player accounts and profiles
- `factions`: The three competing factions
- `player_stats`: Player statistics and progression
- `items`: Item definitions and attributes
- `player_items`: Items owned by players
- `bases`: Capturable bases on the map
- `base_ownership`: Current ownership of bases
- `map_state`: Current state of the game map

## Backup and Restore

Regular backups are configured to run daily:

```bash
# Manual backup
pnpm run backup:supabase

# Restore from backup
pnpm run restore:supabase <backup_file>
```

## Monitoring

The self-hosted Supabase instance includes monitoring with Grafana:

- Database performance metrics
- API request metrics
- Authentication metrics
- Storage usage metrics

Access the monitoring dashboard at `https://supabase-monitoring.planetbyte.com`.

## License

This project is proprietary and confidential.