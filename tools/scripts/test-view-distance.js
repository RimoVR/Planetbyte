/**
 * Test script for the view distance optimization system
 *
 * This script simulates different environmental conditions, player equipment,
 * and view cone functionality to test the view distance optimization system.
 */

const { performance } = require('perf_hooks');

// Mock player entities
const createMockPlayer = (id, x, y, faction, viewDistance = 1.0, rotation = 0) => ({
  id,
  position: { x, y },
  faction,
  viewDistance,
  rotation
});

// Mock environmental conditions
const mockEnvironmentalConditions = [
  { name: 'Day (Clear)', isNight: false, weather: 'clear', hazards: [] },
  { name: 'Night (Clear)', isNight: true, weather: 'clear', hazards: [] },
  { name: 'Day (Fog)', isNight: false, weather: 'fog', hazards: [] },
  { name: 'Night (Storm)', isNight: true, weather: 'storm', hazards: [] },
  { name: 'Toxic Gas Hazard', isNight: false, weather: 'clear', hazards: ['toxic_gas'] }
];

// Mock player equipment
const mockEquipment = [
  { name: 'No Equipment', items: [] },
  { name: 'Sniper Scope', items: ['sniper_scope'] },
  { name: 'Thermal Goggles', items: ['thermal_goggles'] },
  { name: 'Scout Drone', items: ['scout_drone'] },
  { name: 'Full Equipment', items: ['sniper_scope', 'thermal_goggles', 'scout_drone'] }
];

// Mock allied formations
const mockAlliedFormations = [
  { name: 'No Allies', allies: [] },
  { name: 'Close Allies', allies: [
    { distance: 5, viewDistance: 1.0 },
    { distance: 8, viewDistance: 1.2 }
  ]},
  { name: 'Distant Allies', allies: [
    { distance: 15, viewDistance: 1.5 },
    { distance: 20, viewDistance: 2.0 }
  ]},
  { name: 'Mixed Allies', allies: [
    { distance: 5, viewDistance: 1.0 },
    { distance: 15, viewDistance: 1.5 },
    { distance: 25, viewDistance: 2.0 }
  ]}
];

/**
 * Mock implementation of the view distance calculation
 */
function calculateViewDistance(baseViewDistance, player, environment, equipment, allies) {
  // Start with base view distance
  let viewDistance = baseViewDistance;
  
  // Apply environmental modifiers
  if (environment.isNight) {
    viewDistance += -15; // Night view distance reduction
  }
  
  if (environment.weather === 'fog') {
    viewDistance += -20; // Fog view distance reduction
  } else if (environment.weather === 'rain') {
    viewDistance += -10; // Rain view distance reduction
  } else if (environment.weather === 'storm') {
    viewDistance += -25; // Storm view distance reduction
  }
  
  // Apply hazard modifiers
  if (environment.hazards.includes('toxic_gas')) {
    viewDistance += -30; // Toxic gas view distance reduction
  }
  
  // Apply equipment modifiers
  if (equipment.includes('sniper_scope')) {
    viewDistance += 30; // Sniper scope view distance increase
  }
  
  if (equipment.includes('thermal_goggles')) {
    viewDistance += 15; // Thermal goggles view distance increase
  }
  
  if (equipment.includes('scout_drone')) {
    viewDistance += 20; // Scout drone view distance increase
  }
  
  // Apply allied view sharing
  let alliedBonus = 0;
  for (const ally of allies) {
    // Calculate share percentage based on distance
    const sharePercentage = Math.max(0, 1 - (ally.distance / 30)); // 30 is the max share distance
    
    // Add ally's contribution
    const allyContribution = ally.viewDistance * sharePercentage * 0.5; // 0.5 is the share percentage
    alliedBonus += allyContribution;
  }
  
  viewDistance += alliedBonus;
  
  // Ensure view distance is within bounds
  viewDistance = Math.max(20, Math.min(100, viewDistance));
  
  return viewDistance;
}

/**
 * Run the view distance tests
 */
async function runTests() {
  console.log('=== View Distance Optimization System Test ===\n');
  
  const baseViewDistance = 50;
  console.log(`Base View Distance: ${baseViewDistance}\n`);
  
  // Test environmental conditions
  console.log('=== Environmental Conditions Tests ===');
  for (const environment of mockEnvironmentalConditions) {
    const player = createMockPlayer('player1', 0, 0, 'RED');
    const viewDistance = calculateViewDistance(baseViewDistance, player, environment, [], []);
    
    console.log(`${environment.name}: ${viewDistance.toFixed(2)} units (${(viewDistance - baseViewDistance >= 0 ? '+' : '')}${(viewDistance - baseViewDistance).toFixed(2)})`);
  }
  
  console.log('\n=== Equipment Tests ===');
  const defaultEnvironment = { isNight: false, weather: 'clear', hazards: [] };
  for (const equipment of mockEquipment) {
    const player = createMockPlayer('player1', 0, 0, 'RED');
    const viewDistance = calculateViewDistance(baseViewDistance, player, defaultEnvironment, equipment.items, []);
    
    console.log(`${equipment.name}: ${viewDistance.toFixed(2)} units (${(viewDistance - baseViewDistance >= 0 ? '+' : '')}${(viewDistance - baseViewDistance).toFixed(2)})`);
  }
  
  console.log('\n=== Allied View Sharing Tests ===');
  for (const formation of mockAlliedFormations) {
    const player = createMockPlayer('player1', 0, 0, 'RED');
    const viewDistance = calculateViewDistance(baseViewDistance, player, defaultEnvironment, [], formation.allies);
    
    console.log(`${formation.name}: ${viewDistance.toFixed(2)} units (${(viewDistance - baseViewDistance >= 0 ? '+' : '')}${(viewDistance - baseViewDistance).toFixed(2)})`);
  }
  
  console.log('\n=== Combined Scenarios ===');
  
  // Scenario 1: Night combat with equipment
  const scenario1Environment = { isNight: true, weather: 'clear', hazards: [] };
  const scenario1Equipment = ['sniper_scope', 'thermal_goggles'];
  const scenario1Allies = [
    { distance: 5, viewDistance: 1.0 },
    { distance: 10, viewDistance: 1.2 }
  ];
  
  const scenario1ViewDistance = calculateViewDistance(
    baseViewDistance,
    createMockPlayer('player1', 0, 0, 'RED'),
    scenario1Environment,
    scenario1Equipment,
    scenario1Allies
  );
  
  console.log(`Night Combat with Equipment: ${scenario1ViewDistance.toFixed(2)} units (${(scenario1ViewDistance - baseViewDistance >= 0 ? '+' : '')}${(scenario1ViewDistance - baseViewDistance).toFixed(2)})`);
  
  // Scenario 2: Fog with allies
  const scenario2Environment = { isNight: false, weather: 'fog', hazards: [] };
  const scenario2Equipment = [];
  const scenario2Allies = [
    { distance: 5, viewDistance: 1.0 },
    { distance: 8, viewDistance: 1.2 },
    { distance: 12, viewDistance: 1.5 }
  ];
  
  const scenario2ViewDistance = calculateViewDistance(
    baseViewDistance,
    createMockPlayer('player1', 0, 0, 'RED'),
    scenario2Environment,
    scenario2Equipment,
    scenario2Allies
  );
  
  console.log(`Fog with Allies: ${scenario2ViewDistance.toFixed(2)} units (${(scenario2ViewDistance - baseViewDistance >= 0 ? '+' : '')}${(scenario2ViewDistance - baseViewDistance).toFixed(2)})`);
  
  // Scenario 3: Toxic hazard with full equipment
  const scenario3Environment = { isNight: false, weather: 'clear', hazards: ['toxic_gas'] };
  const scenario3Equipment = ['sniper_scope', 'thermal_goggles', 'scout_drone'];
  const scenario3Allies = [];
  
  const scenario3ViewDistance = calculateViewDistance(
    baseViewDistance,
    createMockPlayer('player1', 0, 0, 'RED'),
    scenario3Environment,
    scenario3Equipment,
    scenario3Allies
  );
  
  console.log(`Toxic Hazard with Full Equipment: ${scenario3ViewDistance.toFixed(2)} units (${(scenario3ViewDistance - baseViewDistance >= 0 ? '+' : '')}${(scenario3ViewDistance - baseViewDistance).toFixed(2)})`);
  
  // Scenario 4: Worst case (night, storm, toxic gas, no equipment)
  const scenario4Environment = { isNight: true, weather: 'storm', hazards: ['toxic_gas'] };
  const scenario4Equipment = [];
  const scenario4Allies = [];
  
  const scenario4ViewDistance = calculateViewDistance(
    baseViewDistance,
    createMockPlayer('player1', 0, 0, 'RED'),
    scenario4Environment,
    scenario4Equipment,
    scenario4Allies
  );
  
  console.log(`Worst Case Scenario: ${scenario4ViewDistance.toFixed(2)} units (${(scenario4ViewDistance - baseViewDistance >= 0 ? '+' : '')}${(scenario4ViewDistance - baseViewDistance).toFixed(2)})`);
  
  // Scenario 5: Best case (day, clear, full equipment, close allies)
  const scenario5Environment = { isNight: false, weather: 'clear', hazards: [] };
  const scenario5Equipment = ['sniper_scope', 'thermal_goggles', 'scout_drone'];
  const scenario5Allies = [
    { distance: 5, viewDistance: 1.0 },
    { distance: 8, viewDistance: 1.2 },
    { distance: 12, viewDistance: 1.5 }
  ];
  
  const scenario5ViewDistance = calculateViewDistance(
    baseViewDistance,
    createMockPlayer('player1', 0, 0, 'RED'),
    scenario5Environment,
    scenario5Equipment,
    scenario5Allies
  );
  
  console.log(`Best Case Scenario: ${scenario5ViewDistance.toFixed(2)} units (${(scenario5ViewDistance - baseViewDistance >= 0 ? '+' : '')}${(scenario5ViewDistance - baseViewDistance).toFixed(2)})`);
  
  console.log('\n=== Performance Test ===');
  
  // Create a large number of players for performance testing
  const players = [];
  for (let i = 0; i < 1000; i++) {
    const faction = i % 3 === 0 ? 'RED' : (i % 3 === 1 ? 'BLUE' : 'GREEN');
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const viewDistance = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    
    players.push(createMockPlayer(`player${i}`, x, y, faction, viewDistance));
  }
  
  // Measure performance
  const startTime = performance.now();
  
  // Calculate view distance for all players
  for (const player of players) {
    // Randomly select environment, equipment, and allies
    const environment = mockEnvironmentalConditions[Math.floor(Math.random() * mockEnvironmentalConditions.length)];
    const equipment = mockEquipment[Math.floor(Math.random() * mockEquipment.length)].items;
    const formation = mockAlliedFormations[Math.floor(Math.random() * mockAlliedFormations.length)];
    
    calculateViewDistance(baseViewDistance, player, environment, equipment, formation.allies);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Calculated view distances for ${players.length} players in ${duration.toFixed(2)}ms`);
  console.log(`Average time per player: ${(duration / players.length).toFixed(3)}ms`);
  
  console.log('\n=== View Cone Tests ===');
  
  // Test view cone functionality
  function testViewCone() {
    console.log('Testing view cone functionality...');
    
    // Create an observer at the origin
    const observer = createMockPlayer('observer', 0, 0, 'RED', 1.0, 0); // Facing right (0 radians)
    
    // Create targets at different angles and distances
    const targets = [
      { name: 'In front (within cone)', player: createMockPlayer('target1', 80, 0, 'BLUE') },
      { name: 'In front (beyond cone)', player: createMockPlayer('target2', 120, 0, 'BLUE') },
      { name: 'Slight angle (within cone)', player: createMockPlayer('target3', 70, 20, 'BLUE') },
      { name: 'Wide angle (outside cone)', player: createMockPlayer('target4', 50, 50, 'BLUE') },
      { name: 'Behind (outside cone)', player: createMockPlayer('target5', -50, 0, 'BLUE') }
    ];
    
    // Mock view cone calculation
    function isInViewCone(observer, target) {
      // Base view distance from WORLD_CONSTANTS
      const baseViewDistance = 50; // Same as WORLD_CONSTANTS.DEFAULT_VIEW_DISTANCE
      // Extended view distance in cone is 50% further
      const viewConeDistance = baseViewDistance * 1.5; // Same as WORLD_CONSTANTS.VIEW_CONE_DISTANCE_MULTIPLIER
      // View cone angle is 60 degrees (π/3 radians)
      const viewConeAngle = Math.PI / 3; // Same as WORLD_CONSTANTS.VIEW_CONE_ANGLE
      
      // Calculate vector from observer to target
      const toTarget = {
        x: target.player.position.x - observer.position.x,
        y: target.player.position.y - observer.position.y
      };
      
      // Calculate distance to target
      const distance = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y);
      
      // If target is beyond the extended view cone distance, it's not visible
      if (distance > viewConeDistance) {
        return false;
      }
      
      // If target is within base view distance, it's visible regardless of angle
      if (distance <= baseViewDistance) {
        return true;
      }
      
      // Calculate the angle between the observer's facing direction and the target
      // Observer is facing right (1,0) with rotation 0
      const facingDirection = {
        x: Math.cos(observer.rotation),
        y: Math.sin(observer.rotation)
      };
      
      // Calculate dot product for angle comparison
      const dotProduct = (toTarget.x * facingDirection.x + toTarget.y * facingDirection.y) / distance;
      
      // Convert to angle in radians
      const angle = Math.acos(Math.min(1, Math.max(-1, dotProduct)));
      
      // Check if target is within the view cone angle
      return angle <= viewConeAngle / 2;
    }
    
    // Test each target
    for (const target of targets) {
      const visible = isInViewCone(observer, target);
      console.log(`${target.name}: ${visible ? 'Visible' : 'Not visible'} in view cone`);
    }
    
    // Test with different observer rotations
    console.log('\nTesting different observer rotations:');
    
    const rotations = [
      { name: 'Facing right', rotation: 0 },
      { name: 'Facing up', rotation: Math.PI / 2 },
      { name: 'Facing left', rotation: Math.PI },
      { name: 'Facing down', rotation: 3 * Math.PI / 2 }
    ];
    
    const fixedTarget = createMockPlayer('fixedTarget', 70, 20, 'BLUE');
    
    for (const rot of rotations) {
      observer.rotation = rot.rotation;
      const visible = isInViewCone(observer, { name: 'Fixed target', player: fixedTarget });
      console.log(`${rot.name}: Fixed target is ${visible ? 'visible' : 'not visible'} in view cone`);
    }
  }
  
  // Run view cone tests
  testViewCone();
  
  console.log('\n=== Test Complete ===');
}

// Run the tests
runTests().catch(console.error);