# Decision Log

## Docker Configuration Decisions

### Initial Infrastructure Approach
- **Decision:** Use containerization with Docker and Coolify on a single Hetzner server.
- **Rationale:**
  - Provides better control over infrastructure and deployment
  - Reduces operational costs compared to multiple managed services
  - Enables consistent environments across development and production
  - Simplifies scaling and management through containerization

### Local Development Environment
- **Decision:** Use Docker for local development environment to simulate production setup
- **Rationale:**
  - Ensures consistency between development and production environments
  - Simplifies setup and dependency management
  - Allows for easy collaboration and sharing of the development environment

### Docker Troubleshooting Steps
- **Problem:** Initial Docker build failing due to `supabase/postgres:latest` image not found.
- **Solution:** Switched to using the official `postgres:15` image and configured PostgreSQL separately.
- **Problem:** Docker build failing due to pnpm workspace dependencies not being resolved.
- **Solution:**
  - Set the build context to the root directory in `docker-compose.yml`.
  - Modified the Dockerfile to copy all necessary files from the root directory.
  - Ensured that the `pnpm install` command is run at the root level.
- **Problem:** Docker build failing because TypeScript cannot be found.
-   **Solution:** Added `RUN npm install -g turbo` to the Dockerfile to ensure turbo is installed globally.
-   **Problem:** Docker build failing because the client was referencing the source files of the common package instead of the built files.
-   **Solution:** Updated the `tsconfig.json` in the client to point to the `dist` directory of the `common` package.
-   **Problem:** Docker build failing because the turbo.json file was not being included in the build context.
-   **Solution:** Added COPY turbo.json . to the Dockerfile to ensure turbo.json is included in the build context.
-   **Problem:** Docker build failing because the pnpm-lock.yaml file was not up to date with the apps/client/package.json
-   **Solution:** Run pnpm install at the root level to update the lockfile.