# Use official Node.js image
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/client/package.json ./apps/client/
COPY packages/common/package.json ./packages/common/
COPY packages/config/eslint/package.json ./packages/config/eslint/
COPY packages/config/prettier/package.json ./packages/config/prettier/
COPY packages/config/tsconfig/package.json ./packages/config/tsconfig/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Now copy the rest of the source files
COPY . .

# Fix the tsconfig.json in the common package to use a relative path
RUN sed -i 's/"extends": "@planetbyte\/config-tsconfig\/base.json"/"extends": "..\/..\/packages\/config\/tsconfig\/base.json"/g' packages/common/tsconfig.json

# Install missing dependencies
RUN pnpm add -w esbuild

# Expose port
EXPOSE 3000

# Start the application (This will need to be adjusted to start the client specifically)
CMD ["pnpm", "--filter", "@planetbyte/client", "dev"]