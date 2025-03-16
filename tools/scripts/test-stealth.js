/**
 * Test script for stealth functionality
 * 
 * This script tests the stealth system by creating players with different
 * stealth states and checking visibility between them.
 */

const { PlayerEntity } = require('../../apps/server/src/entities/PlayerEntity');
const { Faction } = require('../../apps/server/src/components/Faction');
const { ViewDistanceManager } = require('../../apps/server/src/systems/visibility/ViewDistanceManager');
const { StealthState } = require('../../apps/server/src/components/Stealth');

// Create a view distance manager
const viewDistanceManager = new ViewDistanceManager();
viewDistanceManager.initialize();

// Create players for testing
const players = [
  // Red faction players
  new PlayerEntity('red1', 0, 0, Faction.Red, 50),
  new PlayerEntity('red2', 30, 30, Faction.Red, 50),
  // Blue faction players
  new PlayerEntity('blue1', 100, 0, Faction.Blue, 50),
  new PlayerEntity('blue2', 130, 30, Faction.Blue, 50),
  // Green faction players
  new PlayerEntity('green1', 0, 100, Faction.Green, 50),
  new PlayerEntity('green2', 30, 130, Faction.Green, 50)
];

// Set rotations for view cone testing
players[0].rotation = 0;       // Red1 facing right (0 degrees)
players[1].rotation = Math.PI; // Red2 facing left (180 degrees)
players[2].rotation = Math.PI / 2; // Blue1 facing down (90 degrees)
players[3].rotation = -Math.PI / 2; // Blue2 facing up (270 degrees)
players[4].rotation = Math.PI / 4; // Green1 facing down-right (45 degrees)
players[5].rotation = -Math.PI / 4; // Green2 facing up-right (315 degrees)

// Test basic visibility without stealth
console.log('\n--- Testing basic visibility without stealth ---');
testVisibility();

// Activate stealth on some players
console.log('\n--- Activating stealth on some players ---');
players[1].activateStealth(); // Red2
players[3].activateStealth(); // Blue2
players[5].activateStealth(); // Green2

console.log('Red2 stealth active:', players[1].hasStealthActive());
console.log('Blue2 stealth active:', players[3].hasStealthActive());
console.log('Green2 stealth active:', players[5].hasStealthActive());

// Test visibility with stealth
console.log('\n--- Testing visibility with stealth active ---');
testVisibility();

// Test stealth detection at close range
console.log('\n--- Testing stealth detection at close range ---');
// Move blue1 very close to red2 (who has stealth active)
players[2].position.x = players[1].position.x + 5;
players[2].position.y = players[1].position.y + 5;
console.log(`Blue1 moved close to Red2 (distance: ${calculateDistance(players[2].position, players[1].position)})`);
testVisibilityBetween(players[2], players[1]);

// Test stealth state changes
console.log('\n--- Testing stealth state changes ---');
// Deactivate stealth on red2
players[1].deactivateStealth();
console.log('Red2 stealth deactivated');
console.log('Red2 stealth active:', players[1].hasStealthActive());
testVisibilityBetween(players[2], players[1]);

// Test stealth cooldown
console.log('\n--- Testing stealth cooldown ---');
console.log('Attempting to reactivate Red2 stealth immediately after deactivation:');
const reactivated = players[1].activateStealth();
console.log('Stealth reactivated:', reactivated);
console.log('Red2 stealth active:', players[1].hasStealthActive());

// Test stealth duration
console.log('\n--- Testing stealth duration ---');
console.log('Blue2 stealth active:', players[3].hasStealthActive());
console.log('Simulating time passing (11 seconds)...');
// Simulate 11 seconds passing (stealth duration is 10 seconds by default)
players[3].stealth.durationRemaining = 0;
players[3].update(11000);
console.log('Blue2 stealth active after duration expired:', players[3].hasStealthActive());

// Helper function to test visibility between all players
function testVisibility() {
  for (const observer of players) {
    for (const target of players) {
      if (observer !== target) {
        testVisibilityBetween(observer, target);
      }
    }
  }
}

// Helper function to test visibility between two players
function testVisibilityBetween(observer, target) {
  const isVisible = viewDistanceManager.isVisible(observer, target, players);
  console.log(`${observer.id} can${isVisible ? '' : 'not'} see ${target.id} (stealth: ${target.hasStealthActive()})`);
}

// Helper function to calculate distance between two positions
function calculateDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Print debug information for all players
console.log('\n--- Debug Information ---');
for (const player of players) {
  const debugInfo = viewDistanceManager.getDebugInfo(player.id);
  if (debugInfo) {
    console.log(`${player.id} debug info:`, JSON.stringify(debugInfo, null, 2));
  }
}

console.log('\nStealth test completed');