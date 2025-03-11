import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from '@colyseus/monitor';
import { config } from 'dotenv';
import { WorldManager } from './rooms/WorldManager';
import { WORLD_CONSTANTS } from '@planetbyte/common';
import { logger } from './utils/logger';

// Load environment variables
config();

// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Create Colyseus server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  }),
});

// Create and initialize world manager
const worldManager = new WorldManager(
  gameServer,
  Number(process.env.WORLD_WIDTH) || WORLD_CONSTANTS.MAP_MAX_SIZE,
  Number(process.env.WORLD_HEIGHT) || WORLD_CONSTANTS.MAP_MAX_SIZE
);
worldManager.initialize();

logger.info('🌍 World manager initialized');

// Register routes
app.get('/', (req, res) => {
  res.send('PlanetByte Game Server');
});

// Register Colyseus monitor (admin panel)
if (process.env.NODE_ENV !== 'production') {
  app.use('/colyseus', monitor());
}

// Start server
const port = Number(process.env.PORT) || 3001;
gameServer.listen(port).then(() => {
  logger.info(`🚀 Game server started on port ${port}`);
  logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}).catch((err) => {
  logger.error(`❌ Error starting server: ${err.message}`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  logger.info('🛑 Shutting down server...');
  gameServer.gracefullyShutdown().then(() => {
    logger.info('👋 Server shut down successfully');
    process.exit(0);
  }).catch((err) => {
    logger.error(`❌ Error shutting down server: ${err.message}`);
    process.exit(1);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);