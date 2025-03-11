/**
 * Test script for multiple clients connecting to the server
 * This script creates multiple Colyseus.js clients and connects them to the server
 * to test state synchronization and client-server communication.
 */

const { Client } = require('colyseus.js');
const readline = require('readline');

// Configuration
const SERVER_URL = 'ws://localhost:3001';
const ROOM_NAME = 'grid_0_0';
const NUM_CLIENTS = 3;
const MOVEMENT_INTERVAL = 500; // ms

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Array to store client connections
const clients = [];

// Function to create a client and connect to the server
async function createClient(index) {
  try {
    console.log(`Creating client ${index}...`);
    const client = new Client(SERVER_URL);
    
    // Join or create a room
    const room = await client.joinOrCreate(ROOM_NAME);
    
    console.log(`Client ${index} connected to room ${room.id}`);
    
    // Set up event handlers
    room.onStateChange((state) => {
      console.log(`Client ${index} received state update:`, 
        Object.keys(state.players).length, 'players in the room');
    });
    
    room.onMessage('*', (type, message) => {
      console.log(`Client ${index} received message:`, type, message);
    });
    
    // Store client and room for later use
    clients.push({ client, room, index });
    
    return { client, room };
  } catch (error) {
    console.error(`Error creating client ${index}:`, error.message);
    throw error;
  }
}

// Function to simulate random movement for a client
function simulateMovement(room, index) {
  setInterval(() => {
    // Generate random movement
    const movement = {
      x: Math.random() * 2 - 1, // -1 to 1
      y: Math.random() * 2 - 1  // -1 to 1
    };
    
    // Normalize movement vector
    const length = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
    if (length > 0) {
      movement.x /= length;
      movement.y /= length;
    }
    
    // Create input message
    const input = {
      movement,
      rotation: Math.random() * Math.PI * 2, // 0 to 2π
      actions: {
        primary: Math.random() > 0.9, // 10% chance of primary action
        secondary: Math.random() > 0.9, // 10% chance of secondary action
        abilities: {
          movement: Math.random() > 0.95, // 5% chance of movement ability
          offense: Math.random() > 0.95, // 5% chance of offense ability
          defense: Math.random() > 0.95, // 5% chance of defense ability
          support: Math.random() > 0.95  // 5% chance of support ability
        }
      },
      sequence: Date.now() // Use timestamp as sequence number
    };
    
    // Send input to server
    room.send('player_input', input);
    console.log(`Client ${index} sent movement:`, 
      `x: ${movement.x.toFixed(2)}, y: ${movement.y.toFixed(2)}`);
  }, MOVEMENT_INTERVAL);
}

// Main function
async function main() {
  try {
    console.log(`Testing ${NUM_CLIENTS} clients connecting to ${SERVER_URL}`);
    
    // Create clients
    for (let i = 0; i < NUM_CLIENTS; i++) {
      const { room } = await createClient(i);
      
      // Start simulating movement after a delay
      setTimeout(() => {
        simulateMovement(room, i);
      }, 1000 + i * 500); // Stagger movement simulation
    }
    
    console.log(`All ${NUM_CLIENTS} clients connected successfully`);
    console.log('Press Enter to disconnect all clients and exit');
    
    // Wait for user input to exit
    rl.question('', () => {
      // Disconnect all clients
      clients.forEach(({ room, index }) => {
        console.log(`Disconnecting client ${index}...`);
        room.leave();
      });
      
      console.log('All clients disconnected');
      rl.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error in main function:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);