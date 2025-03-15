/**
 * Performance Test Script for PlanetByte
 * 
 * This script tests the performance of the interest management and delta compression systems
 * by simulating multiple clients connecting to the server and moving around.
 */

const { Room, Client } = require('colyseus.js');
const WebSocket = require('ws');

// Configuration
const SERVER_URL = 'ws://localhost:3000';
const NUM_CLIENTS = 10;
const TEST_DURATION_MS = 30000; // 30 seconds
const MOVEMENT_INTERVAL_MS = 100; // 100ms between movements
const PRINT_STATS_INTERVAL_MS = 5000; // 5 seconds between stats

// Stats tracking
let totalBytesSent = 0;
let totalMessages = 0;
let startTime = Date.now();

// Create clients
const clients = [];

async function runTest() {
  console.log(`Starting performance test with ${NUM_CLIENTS} clients for ${TEST_DURATION_MS / 1000} seconds`);
  
  // Connect clients
  for (let i = 0; i < NUM_CLIENTS; i++) {
    try {
      const client = new Client(SERVER_URL);
      const room = await client.joinOrCreate('game');
      
      clients.push({
        id: `client-${i}`,
        client,
        room,
        position: { x: Math.random() * 1000, y: Math.random() * 1000 },
        bytesSent: 0,
        messagesReceived: 0
      });
      
      // Set up message handler
      room.onMessage('*', (type, message) => {
        const messageSize = JSON.stringify(message).length;
        clients[i].bytesSent += messageSize;
        clients[i].messagesReceived++;
        totalBytesSent += messageSize;
        totalMessages++;
      });
      
      console.log(`Client ${i} connected`);
    } catch (error) {
      console.error(`Error connecting client ${i}:`, error);
    }
  }
  
  // Set up movement simulation
  const movementInterval = setInterval(() => {
    clients.forEach(client => {
      // Random movement
      const dx = (Math.random() - 0.5) * 10;
      const dy = (Math.random() - 0.5) * 10;
      
      client.position.x += dx;
      client.position.y += dy;
      
      // Send movement to server
      client.room.send('PLAYER_INPUT', {
        movement: { x: dx, y: dy },
        rotation: Math.random() * Math.PI * 2,
        actions: {
          primary: Math.random() > 0.9,
          secondary: Math.random() > 0.9,
          abilities: {
            movement: Math.random() > 0.95,
            offense: Math.random() > 0.95,
            defense: Math.random() > 0.95,
            support: Math.random() > 0.95
          }
        }
      });
    });
  }, MOVEMENT_INTERVAL_MS);
  
  // Set up stats printing
  const statsInterval = setInterval(() => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const bytesPerSecond = totalBytesSent / elapsedSeconds;
    const messagesPerSecond = totalMessages / elapsedSeconds;
    
    console.log(`\n--- Performance Stats (${elapsedSeconds.toFixed(1)}s elapsed) ---`);
    console.log(`Total Bytes Sent: ${totalBytesSent} (${(bytesPerSecond / 1024).toFixed(2)} KB/s)`);
    console.log(`Total Messages: ${totalMessages} (${messagesPerSecond.toFixed(2)} msgs/s)`);
    console.log(`Average Message Size: ${(totalBytesSent / totalMessages).toFixed(2)} bytes`);
    
    // Per-client stats
    console.log('\nPer-Client Stats:');
    clients.forEach(client => {
      const clientBytesPerSecond = client.bytesSent / elapsedSeconds;
      const clientMessagesPerSecond = client.messagesReceived / elapsedSeconds;
      
      console.log(`${client.id}: ${(clientBytesPerSecond / 1024).toFixed(2)} KB/s, ${clientMessagesPerSecond.toFixed(2)} msgs/s`);
    });
  }, PRINT_STATS_INTERVAL_MS);
  
  // End test after duration
  setTimeout(() => {
    clearInterval(movementInterval);
    clearInterval(statsInterval);
    
    // Print final stats
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const bytesPerSecond = totalBytesSent / elapsedSeconds;
    const messagesPerSecond = totalMessages / elapsedSeconds;
    
    console.log(`\n=== Final Performance Stats (${elapsedSeconds.toFixed(1)}s elapsed) ===`);
    console.log(`Total Bytes Sent: ${totalBytesSent} (${(bytesPerSecond / 1024).toFixed(2)} KB/s)`);
    console.log(`Total Messages: ${totalMessages} (${messagesPerSecond.toFixed(2)} msgs/s)`);
    console.log(`Average Message Size: ${(totalBytesSent / totalMessages).toFixed(2)} bytes`);
    
    // Disconnect clients
    clients.forEach(client => {
      client.room.leave();
    });
    
    console.log('\nTest completed. All clients disconnected.');
  }, TEST_DURATION_MS);
}

// Run the test
runTest().catch(error => {
  console.error('Test failed:', error);
});