import { World } from '@colyseus/ecs';
import { PlayerEntity } from '../entities/PlayerEntity';
import { SpatialPartitioningSystem, SpatialPartitioningConfig } from './SpatialPartitioningSystem';
import { GridCellTracker } from './GridCellTracker';
import { GridConfiguration } from './GridConfiguration';
import { PlayerDensityAnalyzer } from './PlayerDensityAnalyzer';
import { InterestManager } from './InterestManager';
import { Faction } from '../components/Faction';

/**
 * Test utility to create a player entity at a specific position
 */
function createPlayerEntity(id: string, x: number, y: number, faction: Faction = Faction.Red): PlayerEntity {
  return new PlayerEntity(id, x, y, faction, 1.0);
}

/**
 * Test utility to create a cluster of players at a specific position
 */
function createPlayerCluster(
  baseId: string,
  centerX: number,
  centerY: number,
  count: number,
  radius: number = 10,
  faction: Faction = Faction.Red
): PlayerEntity[] {
  const players: PlayerEntity[] = [];
  
  for (let i = 0; i < count; i++) {
    // Calculate position with some randomness within the radius
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    players.push(createPlayerEntity(`${baseId}_${i}`, x, y, faction));
  }
  
  return players;
}

/**
 * Test the adaptive grid sizing implementation
 */
function testAdaptiveGridSizing(): void {
  console.log('=== ADAPTIVE GRID SIZING TEST ===');
  
  // Create world and systems
  const world = new World();
  
  // Configuration with aggressive adaptation for testing
  const config: SpatialPartitioningConfig = {
    gridSize: 100,
    viewDistance: 50,
    adaptiveGridSizing: true,
    adaptiveUpdateInterval: 1000 // 1 second for faster testing
  };
  
  // Create spatial partitioning system
  const spatialSystem = new SpatialPartitioningSystem(world, config);
  
  // Get interest manager and grid cell tracker
  const interestManager = spatialSystem.getInterestManager();
  const gridCellTracker = interestManager.getGridCellTracker();
  
  // Create initial set of evenly distributed players
  console.log('\n1. Creating initial evenly distributed players...');
  const initialPlayers: PlayerEntity[] = [];
  
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      const player = createPlayerEntity(`player_${x}_${y}`, x * 150, y * 150);
      initialPlayers.push(player);
      spatialSystem.onEntityAdded(player);
    }
  }
  
  console.log(`Created ${initialPlayers.length} evenly distributed players`);
  
  // Run a few update cycles to establish baseline
  console.log('\n2. Running initial update cycles...');
  for (let i = 0; i < 5; i++) {
    spatialSystem.execute();
  }
  
  // Check initial cell distribution
  const initialCells = gridCellTracker.getAllCells();
  console.log(`Initial cell count: ${initialCells.size}`);
  
  // Create a high-density cluster in one area
  console.log('\n3. Creating high-density player cluster...');
  const highDensityPlayers = createPlayerCluster('high_density', 300, 300, 20, 30);
  
  highDensityPlayers.forEach(player => {
    spatialSystem.onEntityAdded(player);
  });
  
  console.log(`Added ${highDensityPlayers.length} players in high-density cluster`);
  
  // Run update cycles to trigger adaptive sizing
  console.log('\n4. Running update cycles to trigger adaptive sizing...');
  for (let i = 0; i < 10; i++) {
    spatialSystem.execute();
    
    // Force cell size update on each iteration for testing
    gridCellTracker.updateCellSizes();
    
    // Small delay to simulate time passing
    console.log(`Update cycle ${i + 1} complete`);
  }
  
  // Check cell distribution after high density
  const highDensityCells = gridCellTracker.getAllCells();
  console.log(`Cell count after high-density: ${highDensityCells.size}`);
  
  // Create a low-density area by removing most players
  console.log('\n5. Creating low-density scenario by removing players...');
  
  // Remove high density players
  highDensityPlayers.forEach(player => {
    spatialSystem.onEntityRemoved(player);
  });
  
  // Remove most initial players, leaving only a few
  for (let i = 0; i < initialPlayers.length - 5; i++) {
    spatialSystem.onEntityRemoved(initialPlayers[i]);
  }
  
  console.log(`Removed ${highDensityPlayers.length + initialPlayers.length - 5} players`);
  
  // Run update cycles to trigger adaptive sizing for low density
  console.log('\n6. Running update cycles for low-density adaptation...');
  for (let i = 0; i < 10; i++) {
    spatialSystem.execute();
    
    // Force cell size update on each iteration for testing
    gridCellTracker.updateCellSizes();
    
    // Small delay to simulate time passing
    console.log(`Update cycle ${i + 1} complete`);
  }
  
  // Check cell distribution after low density
  const lowDensityCells = gridCellTracker.getAllCells();
  console.log(`Cell count after low-density: ${lowDensityCells.size}`);
  
  // Test dynamic movement by creating players that move between cells
  console.log('\n7. Testing dynamic movement between cells...');
  
  // Create players that will move
  const movingPlayers = createPlayerCluster('moving', 500, 500, 10, 20);
  
  movingPlayers.forEach(player => {
    spatialSystem.onEntityAdded(player);
  });
  
  // Run update cycles with movement
  for (let i = 0; i < 10; i++) {
    // Move players in a circular pattern
    movingPlayers.forEach((player, index) => {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 100 + index * 10;
      player.position.x = 500 + Math.cos(angle) * radius;
      player.position.y = 500 + Math.sin(angle) * radius;
    });
    
    spatialSystem.execute();
    
    // Force cell size update on each iteration for testing
    gridCellTracker.updateCellSizes();
    
    console.log(`Movement cycle ${i + 1} complete`);
  }
  
  // Final cell count
  const finalCells = gridCellTracker.getAllCells();
  console.log(`\nFinal cell count: ${finalCells.size}`);
  
  console.log('\n=== ADAPTIVE GRID SIZING TEST COMPLETE ===');
}

// Run the test
testAdaptiveGridSizing();