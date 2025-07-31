import type { StadiumStats, ItemRarity, ItemCategory } from '@/types/stadium';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyWithSymbol(amount: number): string {
  return `${formatCurrency(amount)} SC`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatStatValue(value: number, statType: keyof StadiumStats): string {
  switch (statType) {
    case 'weaponPower':
    case 'abilityPower':
    case 'attackSpeed':
    case 'cooldownReduction':
    case 'moveSpeed':
    case 'weaponLifesteal':
    case 'criticalDamage':
      return formatPercentage(value);
    case 'health':
    case 'armor':
    case 'shields':
    case 'maxAmmo':
      return value.toString();
    default:
      return value.toString();
  }
}

export function getStatDisplayName(statType: keyof StadiumStats): string {
  const displayNames: Record<keyof StadiumStats, string> = {
    weaponPower: 'Weapon Power',
    abilityPower: 'Ability Power',
    attackSpeed: 'Attack Speed',
    health: 'Health',
    armor: 'Armor',
    shields: 'Shields',
    cooldownReduction: 'Cooldown Reduction',
    moveSpeed: 'Move Speed',
    maxAmmo: 'Max Ammo',
    weaponLifesteal: 'Weapon Lifesteal',
    criticalDamage: 'Critical Damage',
  };

  return displayNames[statType] || statType;
}

export function getStatUnit(statType: keyof StadiumStats): string {
  switch (statType) {
    case 'weaponPower':
    case 'abilityPower':
    case 'attackSpeed':
    case 'cooldownReduction':
    case 'moveSpeed':
    case 'weaponLifesteal':
    case 'criticalDamage':
      return '%';
    case 'health':
    case 'armor':
    case 'shields':
    case 'maxAmmo':
      return '';
    default:
      return '';
  }
}

export function getRarityColor(rarity: ItemRarity): string {
  const colors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
  };
  return colors[rarity];
}

export function getRarityDisplayName(rarity: ItemRarity): string {
  const names = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
  };
  return names[rarity];
}

export function getCategoryColor(category: ItemCategory): string {
  const colors = {
    weapon: '#EF4444',
    ability: '#10B981',
    survival: '#F59E0B',
  };
  return colors[category];
}

export function getCategoryDisplayName(category: ItemCategory): string {
  const names = {
    weapon: 'Weapon',
    ability: 'Ability',
    survival: 'Survival',
  };
  return names[category];
}

export function formatEfficiency(efficiency: number): string {
  return efficiency.toFixed(3);
}

export function formatBuildSummary(itemCount: number, totalCost: number, budget: number): string {
  const budgetUsed = ((totalCost / budget) * 100).toFixed(1);
  return `${itemCount}/6 items • ${formatCurrencyWithSymbol(totalCost)} (${budgetUsed}% of budget)`;
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  return date.toLocaleDateString();
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(1)} ${sizes[i]}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function formatStatsList(stats: StadiumStats): string[] {
  const formatted: string[] = [];

  for (const [key, value] of Object.entries(stats)) {
    if (value && value > 0) {
      const statKey = key as keyof StadiumStats;
      const displayName = getStatDisplayName(statKey);
      const formattedValue = formatStatValue(value, statKey);
      formatted.push(`${displayName}: ${formattedValue}`);
    }
  }

  return formatted;
}

export function getItemTooltip(cost: number, rarity: ItemRarity, category: ItemCategory): string {
  const rarityName = getRarityDisplayName(rarity);
  const categoryName = getCategoryDisplayName(category);
  const formattedCost = formatCurrencyWithSymbol(cost);

  return `${rarityName} ${categoryName} • ${formattedCost}`;
}
