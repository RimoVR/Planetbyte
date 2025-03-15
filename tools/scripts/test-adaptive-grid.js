/**
 * Test script for adaptive grid sizing
 * 
 * This script runs the AdaptiveGridSizing.test.ts file to test the adaptive grid sizing implementation.
 * It compiles the TypeScript file on-the-fly and executes it.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the test file
const testFilePath = path.resolve(__dirname, '../../apps/server/src/systems/AdaptiveGridSizing.test.ts');

// Check if the test file exists
if (!fs.existsSync(testFilePath)) {
  console.error(`Test file not found: ${testFilePath}`);
  process.exit(1);
}

console.log('=== ADAPTIVE GRID SIZING TEST ===');
console.log(`Test file: ${testFilePath}`);
console.log('Compiling and running test...\n');

try {
  // Compile and run the TypeScript file using ts-node
  const result = execSync(`npx ts-node ${testFilePath}`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../..')
  });
  
  console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
} catch (error) {
  console.error('\n=== TEST FAILED ===');
  console.error(error.message);
  process.exit(1);
}