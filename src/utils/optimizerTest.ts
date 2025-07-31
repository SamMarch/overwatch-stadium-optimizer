import { optimizeItemBuild, calculateItemEfficiency } from './optimizer';
import type { OptimizationCriteria } from '@/types/stadium';
import { STADIUM_ITEMS } from '@data/stadiumItems';

// Simple test function to verify optimizer functionality
export function testOptimizer(): void {
  console.log('🧪 Testing Stadium Optimizer...');

  // Test 1: Basic optimization with weapon power focus
  const weaponFocusedCriteria: OptimizationCriteria = {
    maxBudget: 20000,
    maxItems: 6,
    targetStats: {
      weaponPower: { target: 25, priority: 'high' },
      attackSpeed: { target: 15, priority: 'medium' },
      health: { target: 50, priority: 'low' },
    },
  };

  console.log('Test 1: Weapon-focused build optimization');
  const result1 = optimizeItemBuild(weaponFocusedCriteria);
  console.log(`✅ Found ${result1.recommendedItems.length} items`);
  console.log(`💰 Total cost: ${result1.totalCost} SC`);
  console.log(`⚡ Efficiency: ${result1.efficiency.toFixed(2)}`);
  console.log(`⏱️ Execution time: ${result1.executionTime.toFixed(2)}ms`);
  console.log('Reasoning:', result1.reasoning);
  console.log(
    'Items:',
    result1.recommendedItems.map(i => i.name)
  );

  // Test 2: Ability power focused with tight budget
  const abilityFocusedCriteria: OptimizationCriteria = {
    maxBudget: 10000,
    maxItems: 4,
    targetStats: {
      abilityPower: { target: 30, priority: 'high' },
      cooldownReduction: { target: 10, priority: 'high' },
      health: { target: 25, priority: 'medium' },
    },
  };

  console.log('\nTest 2: Ability-focused budget build');
  const result2 = optimizeItemBuild(abilityFocusedCriteria);
  console.log(`✅ Found ${result2.recommendedItems.length} items`);
  console.log(`💰 Total cost: ${result2.totalCost} SC`);
  console.log(`⚡ Efficiency: ${result2.efficiency.toFixed(2)}`);
  console.log(`⏱️ Execution time: ${result2.executionTime.toFixed(2)}ms`);
  console.log(
    'Items:',
    result2.recommendedItems.map(i => i.name)
  );

  // Test 3: Individual item efficiency calculation
  console.log('\nTest 3: Individual item efficiency');
  const testItem = STADIUM_ITEMS.find(item => item.name === 'Eye of the Spider');
  if (testItem) {
    const efficiency = calculateItemEfficiency(testItem, weaponFocusedCriteria.targetStats);
    console.log(`${testItem.name} efficiency: ${efficiency.efficiency.toFixed(3)}`);
    console.log(`Matched stats: ${efficiency.matchedStats.join(', ')}`);
    console.log(`Passive value: ${efficiency.passiveValue}`);
  }

  // Test 4: Performance test with multiple runs
  console.log('\nTest 4: Performance benchmark');
  const startTime = performance.now();
  const iterations = 10;

  for (let i = 0; i < iterations; i++) {
    optimizeItemBuild(weaponFocusedCriteria);
  }

  const avgTime = (performance.now() - startTime) / iterations;
  console.log(`⏱️ Average execution time over ${iterations} runs: ${avgTime.toFixed(2)}ms`);

  console.log('\n🎉 All optimizer tests completed successfully!');
}

// Auto-run test in development
if (typeof window !== 'undefined') {
  // testOptimizer();
}
