export type ItemCategory = 'weapon' | 'ability' | 'survival';
export type ItemRarity = 'common' | 'rare' | 'epic';

export interface StadiumStats {
  weaponPower?: number;
  abilityPower?: number;
  attackSpeed?: number;
  health?: number;
  armor?: number;
  shields?: number;
  cooldownReduction?: number;
  moveSpeed?: number;
  maxAmmo?: number;
  weaponLifesteal?: number;
  criticalDamage?: number;
}

export interface StadiumItem {
  id: string;
  name: string;
  cost: number;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  stats: StadiumStats;
  passive?: string;
}

export interface PlayerBuild {
  id: string;
  name: string;
  currentItems: StadiumItem[];
  totalCost: number;
  currentStats: StadiumStats;
  availableBudget: number;
  maxBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TargetStats {
  weaponPower?: {
    target: number;
    priority: 'low' | 'medium' | 'high';
  };
  abilityPower?: {
    target: number;
    priority: 'low' | 'medium' | 'high';
  };
  attackSpeed?: {
    target: number;
    priority: 'low' | 'medium' | 'high';
  };
  health?: {
    target: number;
    priority: 'low' | 'medium' | 'high';
  };
  armor?: {
    target: number;
    priority: 'low' | 'medium' | 'high';
  };
  shields?: {
    target: number;
    priority: 'low' | 'medium' | 'high';
  };
  cooldownReduction?: {
    target: number;
    priority: 'low' | 'medium' | 'high';
  };
  moveSpeed?: {
    target: number;
    priority: 'low' | 'medium' | 'high';
  };
}

export interface OptimizationCriteria {
  maxBudget: number;
  maxItems: number;
  targetStats: TargetStats;
  allowDuplicates?: boolean;
  prioritizeEfficiency?: boolean;
}

export interface OptimizationResult {
  recommendedItems: StadiumItem[];
  totalCost: number;
  achievedStats: StadiumStats;
  efficiency: number;
  statCoverage: {
    [key in keyof TargetStats]: {
      achieved: number;
      target: number;
      percentage: number;
    };
  };
  alternativeBuild?: {
    items: StadiumItem[];
    cost: number;
    stats: StadiumStats;
    reason: string;
  };
  reasoning: string[];
  executionTime: number;
}

export interface BuildValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  itemCount: number;
  totalCost: number;
  budgetRemaining: number;
}

export interface SavedBuild {
  id: string;
  name: string;
  build: PlayerBuild;
  isFavorite: boolean;
  tags: string[];
}