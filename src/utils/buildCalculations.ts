import type { StadiumItem, StadiumStats, PlayerBuild, BuildValidation, TargetStats } from '@/types/stadium';

export function calculateBuildStats(items: StadiumItem[]): StadiumStats {
  const stats: StadiumStats = {};
  
  for (const item of items) {
    for (const [key, value] of Object.entries(item.stats)) {
      const statKey = key as keyof StadiumStats;
      if (value !== undefined) {
        stats[statKey] = (stats[statKey] || 0) + value;
      }
    }
  }
  
  return stats;
}

export function calculateTotalCost(items: StadiumItem[]): number {
  return items.reduce((total, item) => total + item.cost, 0);
}

export function validateBuild(
  items: StadiumItem[], 
  maxBudget: number, 
  maxItems: number = 6
): BuildValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const itemCount = items.length;
  const totalCost = calculateTotalCost(items);
  const budgetRemaining = maxBudget - totalCost;
  
  // Check item limit
  if (itemCount > maxItems) {
    errors.push(`Build exceeds maximum items limit (${itemCount}/${maxItems})`);
  }
  
  // Check budget
  if (totalCost > maxBudget) {
    errors.push(`Build exceeds budget (${totalCost}/${maxBudget} Stadium Cash)`);
  }
  
  // Check for duplicate items
  const itemIds = items.map(item => item.id);
  const duplicates = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate items detected: ${duplicates.join(', ')}`);
  }
  
  // Budget efficiency warnings
  if (budgetRemaining > maxBudget * 0.3) {
    warnings.push(`Large budget remaining (${budgetRemaining} Stadium Cash). Consider adding more items.`);
  }
  
  // Category balance warnings
  const categories = items.map(item => item.category);
  const weaponCount = categories.filter(cat => cat === 'weapon').length;
  const abilityCount = categories.filter(cat => cat === 'ability').length;
  const survivalCount = categories.filter(cat => cat === 'survival').length;
  
  if (weaponCount === 0 && abilityCount === 0) {
    warnings.push('No offensive items in build. Consider adding weapon or ability items.');
  }
  
  if (survivalCount === 0 && itemCount >= 4) {
    warnings.push('No survival items in build. Consider adding defensive items.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    itemCount,
    totalCost,
    budgetRemaining,
  };
}

export function createEmptyBuild(name: string = 'New Build', maxBudget: number = 50000): PlayerBuild {
  const now = new Date();
  return {
    id: generateBuildId(),
    name,
    currentItems: [],
    totalCost: 0,
    currentStats: {},
    availableBudget: maxBudget,
    maxBudget,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateBuild(build: PlayerBuild, items: StadiumItem[]): PlayerBuild {
  const totalCost = calculateTotalCost(items);
  const currentStats = calculateBuildStats(items);
  
  return {
    ...build,
    currentItems: items,
    totalCost,
    currentStats,
    availableBudget: build.maxBudget - totalCost,
    updatedAt: new Date(),
  };
}

export function addItemToBuild(build: PlayerBuild, item: StadiumItem): PlayerBuild {
  const newItems = [...build.currentItems, item];
  return updateBuild(build, newItems);
}

export function removeItemFromBuild(build: PlayerBuild, itemId: string): PlayerBuild {
  const newItems = build.currentItems.filter(item => item.id !== itemId);
  return updateBuild(build, newItems);
}

export function replaceItemInBuild(build: PlayerBuild, oldItemId: string, newItem: StadiumItem): PlayerBuild {
  const newItems = build.currentItems.map(item => 
    item.id === oldItemId ? newItem : item
  );
  return updateBuild(build, newItems);
}

export function calculateStatEfficiency(item: StadiumItem): number {
  const stats = item.stats;
  const statValues = Object.values(stats).filter(val => val !== undefined) as number[];
  const totalStatValue = statValues.reduce((sum, val) => sum + val, 0);
  
  return item.cost > 0 ? totalStatValue / item.cost : 0;
}

export function calculateBuildEfficiency(items: StadiumItem[]): number {
  if (items.length === 0) return 0;
  
  const totalEfficiency = items.reduce((sum, item) => sum + calculateStatEfficiency(item), 0);
  return totalEfficiency / items.length;
}

export function getAffordableItems(availableItems: StadiumItem[], budget: number): StadiumItem[] {
  return availableItems.filter(item => item.cost <= budget);
}

export function suggestNextItem(
  currentBuild: PlayerBuild,
  availableItems: StadiumItem[],
  targetStats?: TargetStats
): StadiumItem[] {
  const affordableItems = getAffordableItems(availableItems, currentBuild.availableBudget);
  const currentItemIds = new Set(currentBuild.currentItems.map(item => item.id));
  const newItems = affordableItems.filter(item => !currentItemIds.has(item.id));
  
  if (!targetStats) {
    // Sort by efficiency if no target stats
    return newItems
      .sort((a, b) => calculateStatEfficiency(b) - calculateStatEfficiency(a))
      .slice(0, 5);
  }
  
  // Score items based on how well they match target stats
  const scoredItems = newItems.map(item => {
    let score = 0;
    let matchCount = 0;
    
    for (const [statKey, target] of Object.entries(targetStats)) {
      if (target && item.stats[statKey as keyof StadiumStats]) {
        const statValue = item.stats[statKey as keyof StadiumStats] || 0;
        const priorityMultiplier = target.priority === 'high' ? 3 : target.priority === 'medium' ? 2 : 1;
        score += statValue * priorityMultiplier;
        matchCount++;
      }
    }
    
    // Efficiency bonus
    const efficiency = calculateStatEfficiency(item);
    score += efficiency * 10;
    
    // Bonus for matching multiple target stats
    if (matchCount > 1) {
      score *= 1.2;
    }
    
    return { item, score };
  });
  
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
    .slice(0, 5);
}

function generateBuildId(): string {
  return `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}