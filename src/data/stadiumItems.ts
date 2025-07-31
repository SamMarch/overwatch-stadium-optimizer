import type { StadiumItem } from '@/types/stadium';

export const STADIUM_ITEMS: StadiumItem[] = [
  // WEAPON ITEMS - Common
  {
    id: 'bloodlust',
    name: 'Bloodlust',
    cost: 2000,
    category: 'weapon',
    rarity: 'common',
    description: 'Eliminations grant 10% Attack Speed and 15% Move Speed for 3s',
    stats: {
      attackSpeed: 10,
      moveSpeed: 5,
    },
    passive: 'Eliminations grant 10% Attack Speed and 15% Move Speed for 3s',
  },
  {
    id: 'medics-mindset',
    name: "Medic's Mindset",
    cost: 2500,
    category: 'weapon',
    rarity: 'common',
    description: 'After healing an ally, gain 10% Attack Speed for 3s',
    stats: {},
    passive: 'After healing an ally, gain 10% Attack Speed for 3s',
  },
  {
    id: 'armor-piercer',
    name: 'Armor Piercer',
    cost: 2500,
    category: 'weapon',
    rarity: 'common',
    description: 'Gain 15% Attack Speed for 1s after damaging Shields/Armor',
    stats: {
      attackSpeed: 5,
      maxAmmo: 25,
    },
    passive: 'Gain 15% Attack Speed for 1s after damaging Shields/Armor',
  },
  {
    id: 'shady-spectacles',
    name: 'Shady Spectacles',
    cost: 3000,
    category: 'weapon',
    rarity: 'common',
    description: 'Provides weapon power and lifesteal',
    stats: {
      weaponPower: 5,
      weaponLifesteal: 10,
    },
  },
  {
    id: 'power-playbook',
    name: 'Power Playbook',
    cost: 3500,
    category: 'weapon',
    rarity: 'common',
    description: 'Balanced weapon power and cooldown reduction',
    stats: {
      weaponPower: 10,
      cooldownReduction: 5,
    },
  },

  // WEAPON ITEMS - Rare
  {
    id: 'icy-coolant',
    name: 'Icy Coolant',
    cost: 5500,
    category: 'weapon',
    rarity: 'rare',
    description: 'High attack speed and maximum ammo increase',
    stats: {
      attackSpeed: 10,
      maxAmmo: 40,
    },
  },
  {
    id: 'talon-modification-module',
    name: 'Talon Modification Module',
    cost: 6000,
    category: 'weapon',
    rarity: 'rare',
    description: 'Combines health and weapon power',
    stats: {
      health: 25,
      weaponPower: 15,
    },
  },

  // WEAPON ITEMS - Epic
  {
    id: 'eye-of-the-spider',
    name: 'Eye of the Spider',
    cost: 14000,
    category: 'weapon',
    rarity: 'epic',
    description: 'High weapon power with critical damage boost',
    stats: {
      weaponPower: 20,
      criticalDamage: 10,
    },
  },
  {
    id: 'the-closer',
    name: 'The Closer',
    cost: 14500,
    category: 'weapon',
    rarity: 'epic',
    description: 'Deal 10% increased damage to enemies below 30% Life',
    stats: {},
    passive: 'Deal 10% increased damage to enemies below 30% Life',
  },

  // ABILITY ITEMS - Rare
  {
    id: 'multi-tool',
    name: 'Multi-Tool',
    cost: 4500,
    category: 'ability',
    rarity: 'rare',
    description: 'Balanced ability power and cooldown reduction',
    stats: {
      abilityPower: 10,
      cooldownReduction: 5,
    },
  },
  {
    id: 'nano-cola',
    name: 'Nano Cola',
    cost: 6000,
    category: 'ability',
    rarity: 'rare',
    description: 'Health boost with ability power',
    stats: {
      health: 25,
      abilityPower: 10,
    },
  },

  // ABILITY ITEMS - Epic
  {
    id: 'champions-kit',
    name: "Champion's Kit",
    cost: 14000,
    category: 'ability',
    rarity: 'epic',
    description: 'High ability power with significant cooldown reduction',
    stats: {
      abilityPower: 35,
      cooldownReduction: 10,
    },
  },

  // SURVIVAL ITEMS - Common
  {
    id: 'electrolytes',
    name: 'Electrolytes',
    cost: 1500,
    category: 'survival',
    rarity: 'common',
    description: '100 Overhealth every time you respawn',
    stats: {},
    passive: '100 Overhealth every time you respawn',
  },
  {
    id: 'adrenaline-shot',
    name: 'Adrenaline Shot',
    cost: 1500,
    category: 'survival',
    rarity: 'common',
    description: 'Simple health boost',
    stats: {
      health: 25,
    },
  },

  // SURVIVAL ITEMS - Rare
  {
    id: 'iron-eyes',
    name: 'Iron Eyes',
    cost: 4500,
    category: 'survival',
    rarity: 'rare',
    description: '20% Damage Reduction against Critical Hits',
    stats: {},
    passive: '20% Damage Reduction against Critical Hits',
  },
  {
    id: 'reinforced-titanium',
    name: 'Reinforced Titanium',
    cost: 5000,
    category: 'survival',
    rarity: 'rare',
    description: '15% Damage Reduction against Ability Damage while you have Shields',
    stats: {},
    passive: '15% Damage Reduction against Ability Damage while you have Shields',
  },

  // SURVIVAL ITEMS - Epic
  {
    id: 'bloodbound',
    name: 'Bloodbound',
    cost: 9000,
    category: 'survival',
    rarity: 'epic',
    description: 'Last enemy to kill you is Revealed, deal 10% more damage to them',
    stats: {},
    passive: 'Last enemy to kill you is Revealed, deal 10% more damage to them',
  },
  {
    id: 'geneticists-vial',
    name: "Geneticist's Vial",
    cost: 10000,
    category: 'survival',
    rarity: 'epic',
    description: 'First time you would die each round, revive with 250 Life after 3s',
    stats: {},
    passive: 'First time you would die each round, revive with 250 Life after 3s',
  },
  {
    id: 'gloomgauntlet',
    name: 'Gloomgauntlet',
    cost: 10000,
    category: 'survival',
    rarity: 'epic',
    description: 'Massive defensive stat increase',
    stats: {
      health: 15,
      armor: 15,
      shields: 15,
    },
  },
];

export const ITEMS_BY_CATEGORY = {
  weapon: STADIUM_ITEMS.filter(item => item.category === 'weapon'),
  ability: STADIUM_ITEMS.filter(item => item.category === 'ability'),
  survival: STADIUM_ITEMS.filter(item => item.category === 'survival'),
};

export const ITEMS_BY_RARITY = {
  common: STADIUM_ITEMS.filter(item => item.rarity === 'common'),
  rare: STADIUM_ITEMS.filter(item => item.rarity === 'rare'),
  epic: STADIUM_ITEMS.filter(item => item.rarity === 'epic'),
};

export const ITEMS_BY_COST = {
  budget: STADIUM_ITEMS.filter(item => item.cost <= 3000),
  moderate: STADIUM_ITEMS.filter(item => item.cost > 3000 && item.cost <= 7000),
  expensive: STADIUM_ITEMS.filter(item => item.cost > 7000),
};

export function getItemById(id: string): StadiumItem | undefined {
  return STADIUM_ITEMS.find(item => item.id === id);
}

export function getItemsByIds(ids: string[]): StadiumItem[] {
  return ids.map(id => getItemById(id)).filter(Boolean) as StadiumItem[];
}

export function sortItemsByCost(items: StadiumItem[], ascending: boolean = true): StadiumItem[] {
  return [...items].sort((a, b) => ascending ? a.cost - b.cost : b.cost - a.cost);
}

export function sortItemsByEfficiency(items: StadiumItem[], targetStat: keyof StadiumItem['stats']): StadiumItem[] {
  return [...items].sort((a, b) => {
    const aValue = a.stats[targetStat] || 0;
    const bValue = b.stats[targetStat] || 0;
    const aEfficiency = aValue / a.cost;
    const bEfficiency = bValue / b.cost;
    return bEfficiency - aEfficiency;
  });
}