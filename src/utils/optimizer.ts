import type {
  StadiumItem,
  TargetStats,
  OptimizationResult,
  OptimizationCriteria,
  StadiumStats,
  PlayerBuild,
} from '@/types/stadium';
import { STADIUM_ITEMS } from '@data/stadiumItems';
import { calculateBuildStats, calculateTotalCost } from './buildCalculations';

// Memoization cache for performance optimization
const memoCache = new Map<string, KnapsackResult>();
const CACHE_MAX_SIZE = 1000;

interface ItemEfficiency {
  item: StadiumItem;
  efficiency: number;
  matchedStats: string[];
  passiveValue: number;
}

interface OptimizationStep {
  action: 'buy' | 'sell';
  item: StadiumItem;
  reason: string;
  cost: number;
  budgetAfter: number;
}

interface KnapsackResult {
  items: StadiumItem[];
  value: number;
  cost: number;
}

// Performance timing for optimization monitoring
let optimizationStartTime = 0;

export function optimizeItemBuild(criteria: OptimizationCriteria): OptimizationResult {
  optimizationStartTime = performance.now();

  try {
    // Input validation
    const validationResult = validateOptimizationCriteria(criteria);
    if (!validationResult.isValid) {
      throw new Error(`Invalid optimization criteria: ${validationResult.errors.join(', ')}`);
    }

    // Calculate efficiency scores for all items
    const itemEfficiencies = calculateAllItemEfficiencies(criteria.targetStats);

    // Apply budget and availability filters
    const availableItems = filterAvailableItems(itemEfficiencies, criteria.maxBudget);

    // Run 3D knapsack optimization (items × budget × item count)
    const knapsackResult = solve3DKnapsack(
      availableItems,
      criteria.maxBudget,
      criteria.maxItems || 6
    );

    // Calculate achieved stats and efficiency
    const achievedStats = calculateBuildStats(knapsackResult.items);
    const efficiency = calculateOptimizationEfficiency(knapsackResult.items, criteria.targetStats);

    // Generate stat coverage analysis
    const statCoverage = calculateStatCoverage(achievedStats, criteria.targetStats);

    // Find alternative build for comparison
    const alternativeBuild = findAlternativeBuild(availableItems, knapsackResult, criteria);

    const executionTime = performance.now() - optimizationStartTime;

    return {
      recommendedItems: knapsackResult.items,
      totalCost: knapsackResult.cost,
      achievedStats,
      efficiency,
      statCoverage,
      alternativeBuild,
      executionTime,
      reasoning: explainOptimization(knapsackResult.items, criteria.targetStats, efficiency),
    };
  } catch (error) {
    console.error('Optimization error:', error);
    return createFallbackResult(criteria);
  }
}

export function optimizeBuySequence(
  currentBuild: PlayerBuild,
  targetBuild: StadiumItem[],
  budget: number
): OptimizationStep[] {
  const steps: OptimizationStep[] = [];
  let currentItems = [...currentBuild.currentItems];
  let currentBudget = budget;

  // Calculate items to remove
  const itemsToSell = findItemsToSell(currentItems, targetBuild);

  // Add sell steps
  for (const item of itemsToSell) {
    steps.push({
      action: 'sell',
      item,
      reason: `Remove ${item.name} to make room for better optimization`,
      cost: -item.cost, // Refund
      budgetAfter: currentBudget + item.cost,
    });
    currentBudget += item.cost;
    currentItems = currentItems.filter(i => i.id !== item.id);
  }

  // Calculate items to buy
  const itemsToBuy = targetBuild.filter(
    targetItem => !currentItems.some(current => current.id === targetItem.id)
  );

  // Sort by priority (efficiency and cost)
  const sortedItemsToBuy = itemsToBuy.sort((a, b) => {
    const aEfficiency = calculateItemEfficiency(a, getDefaultTargetStats()).efficiency;
    const bEfficiency = calculateItemEfficiency(b, getDefaultTargetStats()).efficiency;
    return bEfficiency - aEfficiency;
  });

  // Add buy steps
  for (const item of sortedItemsToBuy) {
    if (currentBudget >= item.cost && currentItems.length < 6) {
      steps.push({
        action: 'buy',
        item,
        reason: `Purchase ${item.name} for optimal stat combination`,
        cost: item.cost,
        budgetAfter: currentBudget - item.cost,
      });
      currentBudget -= item.cost;
      currentItems.push(item);
    }
  }

  return steps;
}

function solve3DKnapsack(
  items: ItemEfficiency[],
  maxBudget: number,
  maxItems: number
): KnapsackResult {
  const cacheKey = `knapsack_${JSON.stringify(items.map(i => i.item.id))}_${maxBudget}_${maxItems}`;

  if (memoCache.has(cacheKey)) {
    return memoCache.get(cacheKey)!;
  }

  // DP table: [item_index][budget][item_count]
  const n = items.length;
  const dp: number[][][] = Array(n + 1)
    .fill(null)
    .map(() =>
      Array(maxBudget + 1)
        .fill(null)
        .map(() => Array(maxItems + 1).fill(0))
    );

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    const cost = item.item.cost;
    const value = item.efficiency;

    for (let budget = 0; budget <= maxBudget; budget++) {
      for (let itemCount = 0; itemCount <= maxItems; itemCount++) {
        // Don't take current item
        dp[i][budget][itemCount] = dp[i - 1][budget][itemCount];

        // Take current item if possible
        if (cost <= budget && itemCount > 0) {
          const newValue = dp[i - 1][budget - cost][itemCount - 1] + value;
          if (newValue > dp[i][budget][itemCount]) {
            dp[i][budget][itemCount] = newValue;
          }
        }
      }
    }
  }

  // Backtrack to find selected items
  const selectedItems: StadiumItem[] = [];
  let currentBudget = maxBudget;
  let currentItemCount = maxItems;

  for (let i = n; i > 0 && currentItemCount > 0; i--) {
    if (dp[i][currentBudget][currentItemCount] !== dp[i - 1][currentBudget][currentItemCount]) {
      const item = items[i - 1].item;
      selectedItems.push(item);
      currentBudget -= item.cost;
      currentItemCount--;
    }
  }

  const result: KnapsackResult = {
    items: selectedItems,
    value: dp[n][maxBudget][maxItems],
    cost: calculateTotalCost(selectedItems),
  };

  // Cache result
  if (memoCache.size >= CACHE_MAX_SIZE) {
    const firstKey = memoCache.keys().next().value;
    if (firstKey !== undefined) {
      memoCache.delete(firstKey);
    }
  }
  memoCache.set(cacheKey, result);

  return result;
}

export function calculateItemEfficiency(
  item: StadiumItem,
  targetStats: TargetStats
): ItemEfficiency {
  let efficiency = 0;
  let passiveValue = 0;
  const matchedStats: string[] = [];

  // Calculate base stat efficiency with diminishing returns
  for (const [statKey, target] of Object.entries(targetStats)) {
    if (!target) continue;

    const statValue = item.stats[statKey as keyof StadiumStats] || 0;
    if (statValue > 0) {
      // Use square root scaling for diminishing returns
      const scaledValue = Math.sqrt(statValue) * target.target;
      const priorityMultiplier = getPriorityMultiplier(target.priority);

      efficiency += scaledValue * priorityMultiplier;
      matchedStats.push(statKey);
    }
  }

  // Add passive effect value estimation
  if (item.passive) {
    passiveValue = estimatePassiveValue(item);
    efficiency += passiveValue;
  }

  // Apply cost efficiency
  const costEfficiency = item.cost > 0 ? efficiency / Math.sqrt(item.cost) : 0;

  return {
    item,
    efficiency: costEfficiency,
    matchedStats,
    passiveValue,
  };
}

function estimatePassiveValue(item: StadiumItem): number {
  if (!item.passive) return 0;

  const passive = item.passive.toLowerCase();

  // Elimination-based effects (high value in combat)
  if (passive.includes('elimination')) return 50;

  // Damage reduction effects
  if (passive.includes('damage reduction')) return 40;

  // Revival/survival effects
  if (passive.includes('revive') || passive.includes('die')) return 60;

  // Damage increase effects
  if (passive.includes('increased damage') || passive.includes('more damage')) return 35;

  // Utility effects (healing, reveal, etc.)
  if (passive.includes('healing') || passive.includes('reveal')) return 25;

  // Overhealth and defensive buffs
  if (passive.includes('overhealth')) return 30;

  return 20; // Default passive value
}

function getPriorityMultiplier(priority: 'low' | 'medium' | 'high'): number {
  switch (priority) {
    case 'high':
      return 3.0;
    case 'medium':
      return 2.0;
    case 'low':
      return 1.0;
    default:
      return 1.0;
  }
}

function calculateAllItemEfficiencies(targetStats: TargetStats): ItemEfficiency[] {
  return STADIUM_ITEMS.map(item => calculateItemEfficiency(item, targetStats));
}

function filterAvailableItems(
  itemEfficiencies: ItemEfficiency[],
  maxBudget: number
): ItemEfficiency[] {
  return itemEfficiencies
    .filter(ie => ie.item.cost <= maxBudget)
    .sort((a, b) => b.efficiency - a.efficiency);
}

function calculateOptimizationEfficiency(items: StadiumItem[], targetStats: TargetStats): number {
  if (items.length === 0) return 0;

  const totalEfficiency = items.reduce((sum, item) => {
    const itemEfficiency = calculateItemEfficiency(item, targetStats);
    return sum + itemEfficiency.efficiency;
  }, 0);

  return totalEfficiency / items.length;
}

function calculateStatCoverage(
  achievedStats: StadiumStats,
  targetStats: TargetStats
): OptimizationResult['statCoverage'] {
  const coverage: OptimizationResult['statCoverage'] = {};

  for (const [statKey, target] of Object.entries(targetStats)) {
    if (!target) continue;

    const achieved = achievedStats[statKey as keyof StadiumStats] || 0;
    const percentage = target.target > 0 ? Math.min((achieved / target.target) * 100, 100) : 0;

    coverage[statKey as keyof TargetStats] = {
      achieved,
      target: target.target,
      percentage,
    };
  }

  return coverage;
}

function findAlternativeBuild(
  availableItems: ItemEfficiency[],
  primaryResult: KnapsackResult,
  criteria: OptimizationCriteria
): OptimizationResult['alternativeBuild'] {
  // Try to find a more budget-efficient alternative
  const budgetTarget = Math.floor(criteria.maxBudget * 0.7); // 70% of budget

  const alternativeResult = solve3DKnapsack(
    availableItems.filter(ie => ie.item.cost <= budgetTarget),
    budgetTarget,
    criteria.maxItems || 6
  );

  if (alternativeResult.items.length > 0 && alternativeResult.cost < primaryResult.cost) {
    return {
      items: alternativeResult.items,
      cost: alternativeResult.cost,
      stats: calculateBuildStats(alternativeResult.items),
      reason: `Budget-efficient alternative using ${Math.round((alternativeResult.cost / criteria.maxBudget) * 100)}% of budget`,
    };
  }

  return undefined;
}

function findItemsToSell(currentItems: StadiumItem[], targetItems: StadiumItem[]): StadiumItem[] {
  const targetIds = new Set(targetItems.map(item => item.id));
  return currentItems.filter(item => !targetIds.has(item.id));
}

function explainOptimization(
  items: StadiumItem[],
  targetStats: TargetStats,
  efficiency: number
): string[] {
  const explanations: string[] = [];

  if (items.length === 0) {
    explanations.push('No items found within budget constraints.');
    return explanations;
  }

  // Analyze category distribution
  const categories = items.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryNames = Object.keys(categories);
  if (categoryNames.length > 1) {
    explanations.push(
      `Balanced build with ${categoryNames.join(', ')} items for comprehensive coverage.`
    );
  }

  // Analyze stat focus
  const statFocus = Object.entries(targetStats)
    .filter(([_, target]) => target && target.priority === 'high')
    .map(([stat, _]) => stat);

  if (statFocus.length > 0) {
    explanations.push(`Optimized for high-priority stats: ${statFocus.join(', ')}.`);
  }

  // Efficiency assessment
  if (efficiency > 2.0) {
    explanations.push('Highly efficient item combination with excellent cost-to-benefit ratio.');
  } else if (efficiency > 1.0) {
    explanations.push('Good efficiency balance between cost and stat benefits.');
  } else {
    explanations.push('Budget-focused selection prioritizing essential stats.');
  }

  // Passive effect analysis
  const passiveItems = items.filter(item => item.passive);
  if (passiveItems.length > 0) {
    explanations.push(
      `Includes ${passiveItems.length} items with special passive effects for tactical advantage.`
    );
  }

  return explanations;
}

function validateOptimizationCriteria(criteria: OptimizationCriteria): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (criteria.maxBudget <= 0) {
    errors.push('Budget must be greater than 0');
  }

  if (criteria.maxItems && criteria.maxItems < 1) {
    errors.push('Maximum items must be at least 1');
  }

  if (criteria.maxItems && criteria.maxItems > 6) {
    errors.push('Maximum items cannot exceed 6');
  }

  const hasTargetStats = Object.values(criteria.targetStats).some(
    target => target && target.target > 0
  );

  if (!hasTargetStats) {
    errors.push('At least one target stat must be specified');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function createFallbackResult(criteria: OptimizationCriteria): OptimizationResult {
  // Return a safe fallback with budget-efficient common items
  const fallbackItems = STADIUM_ITEMS.filter(
    item => item.cost <= criteria.maxBudget && item.rarity === 'common'
  ).slice(0, Math.min(3, criteria.maxItems || 6));

  return {
    recommendedItems: fallbackItems,
    totalCost: calculateTotalCost(fallbackItems),
    achievedStats: calculateBuildStats(fallbackItems),
    efficiency: 0.5,
    statCoverage: {},
    reasoning: ['Fallback optimization due to error in primary algorithm'],
    executionTime: performance.now() - optimizationStartTime,
  };
}

function getDefaultTargetStats(): TargetStats {
  return {
    weaponPower: { target: 20, priority: 'medium' },
    abilityPower: { target: 15, priority: 'medium' },
    attackSpeed: { target: 10, priority: 'low' },
    health: { target: 50, priority: 'medium' },
  };
}

// Debounced optimization for real-time updates
let optimizationTimeout: number | null = null;

export function optimizeItemBuildDebounced(
  criteria: OptimizationCriteria,
  callback: (result: OptimizationResult) => void,
  delay: number = 150
): void {
  if (optimizationTimeout) {
    window.clearTimeout(optimizationTimeout);
  }

  optimizationTimeout = window.setTimeout(() => {
    const result = optimizeItemBuild(criteria);
    callback(result);
  }, delay);
}

// Cache management
export function clearOptimizationCache(): void {
  memoCache.clear();
}

export function getOptimizationCacheSize(): number {
  return memoCache.size;
}
