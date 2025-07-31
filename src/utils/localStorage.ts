import type { PlayerBuild, SavedBuild } from '@/types/stadium';

const STORAGE_KEYS = {
  BUILDS: 'overwatch-stadium-builds',
  CURRENT_BUILD: 'overwatch-stadium-current-build',
  USER_PREFERENCES: 'overwatch-stadium-preferences',
} as const;

export interface UserPreferences {
  defaultBudget: number;
  autoSave: boolean;
  theme: 'light' | 'dark';
  showTooltips: boolean;
  compactView: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultBudget: 50000,
  autoSave: true,
  theme: 'dark',
  showTooltips: true,
  compactView: false,
};

// Build Management
export function saveBuild(build: PlayerBuild, name?: string, tags: string[] = []): SavedBuild {
  const savedBuild: SavedBuild = {
    id: build.id,
    name: name || build.name,
    build,
    isFavorite: false,
    tags,
  };
  
  const savedBuilds = getSavedBuilds();
  const existingIndex = savedBuilds.findIndex(b => b.id === build.id);
  
  if (existingIndex >= 0) {
    savedBuilds[existingIndex] = savedBuild;
  } else {
    savedBuilds.push(savedBuild);
  }
  
  localStorage.setItem(STORAGE_KEYS.BUILDS, JSON.stringify(savedBuilds));
  return savedBuild;
}

export function getSavedBuilds(): SavedBuild[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BUILDS);
    if (!stored) return [];
    
    const builds = JSON.parse(stored) as SavedBuild[];
    return builds.map(build => ({
      ...build,
      build: {
        ...build.build,
        createdAt: new Date(build.build.createdAt),
        updatedAt: new Date(build.build.updatedAt),
      },
    }));
  } catch (error) {
    console.error('Error loading saved builds:', error);
    return [];
  }
}

export function getSavedBuild(buildId: string): SavedBuild | null {
  const builds = getSavedBuilds();
  return builds.find(build => build.id === buildId) || null;
}

export function deleteSavedBuild(buildId: string): boolean {
  try {
    const builds = getSavedBuilds();
    const filteredBuilds = builds.filter(build => build.id !== buildId);
    
    if (filteredBuilds.length === builds.length) {
      return false; // Build not found
    }
    
    localStorage.setItem(STORAGE_KEYS.BUILDS, JSON.stringify(filteredBuilds));
    return true;
  } catch (error) {
    console.error('Error deleting build:', error);
    return false;
  }
}

export function toggleBuildFavorite(buildId: string): boolean {
  try {
    const builds = getSavedBuilds();
    const build = builds.find(b => b.id === buildId);
    
    if (!build) return false;
    
    build.isFavorite = !build.isFavorite;
    localStorage.setItem(STORAGE_KEYS.BUILDS, JSON.stringify(builds));
    return true;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
}

export function updateBuildTags(buildId: string, tags: string[]): boolean {
  try {
    const builds = getSavedBuilds();
    const build = builds.find(b => b.id === buildId);
    
    if (!build) return false;
    
    build.tags = tags;
    localStorage.setItem(STORAGE_KEYS.BUILDS, JSON.stringify(builds));
    return true;
  } catch (error) {
    console.error('Error updating tags:', error);
    return false;
  }
}

// Current Build Management
export function saveCurrentBuild(build: PlayerBuild): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BUILD, JSON.stringify(build));
  } catch (error) {
    console.error('Error saving current build:', error);
  }
}

export function getCurrentBuild(): PlayerBuild | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_BUILD);
    if (!stored) return null;
    
    const build = JSON.parse(stored) as PlayerBuild;
    return {
      ...build,
      createdAt: new Date(build.createdAt),
      updatedAt: new Date(build.updatedAt),
    };
  } catch (error) {
    console.error('Error loading current build:', error);
    return null;
  }
}

export function clearCurrentBuild(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_BUILD);
  } catch (error) {
    console.error('Error clearing current build:', error);
  }
}

// User Preferences
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  try {
    const currentPrefs = getUserPreferences();
    const updatedPrefs = { ...currentPrefs, ...preferences };
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!stored) return DEFAULT_PREFERENCES;
    
    const preferences = JSON.parse(stored) as UserPreferences;
    return { ...DEFAULT_PREFERENCES, ...preferences };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

// Export/Import Functionality
export function exportBuilds(): string {
  const builds = getSavedBuilds();
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    builds,
  };
  return JSON.stringify(exportData, null, 2);
}

export function importBuilds(jsonData: string): { success: boolean; imported: number; errors: string[] } {
  try {
    const data = JSON.parse(jsonData);
    const errors: string[] = [];
    let imported = 0;
    
    if (!data.builds || !Array.isArray(data.builds)) {
      return { success: false, imported: 0, errors: ['Invalid export format'] };
    }
    
    const currentBuilds = getSavedBuilds();
    const currentIds = new Set(currentBuilds.map(b => b.id));
    
    for (const buildData of data.builds) {
      try {
        // Validate build structure
        if (!buildData.id || !buildData.build || !buildData.build.currentItems) {
          errors.push(`Invalid build structure for build: ${buildData.name || 'unknown'}`);
          continue;
        }
        
        // Skip if already exists
        if (currentIds.has(buildData.id)) {
          errors.push(`Build already exists: ${buildData.name}`);
          continue;
        }
        
        // Convert dates
        const build: SavedBuild = {
          ...buildData,
          build: {
            ...buildData.build,
            createdAt: new Date(buildData.build.createdAt),
            updatedAt: new Date(buildData.build.updatedAt),
          },
        };
        
        currentBuilds.push(build);
        imported++;
      } catch (error) {
        errors.push(`Error importing build ${buildData.name}: ${error}`);
      }
    }
    
    if (imported > 0) {
      localStorage.setItem(STORAGE_KEYS.BUILDS, JSON.stringify(currentBuilds));
    }
    
    return { success: imported > 0, imported, errors };
  } catch (error) {
    return { success: false, imported: 0, errors: [`Invalid JSON format: ${error}`] };
  }
}

// Storage Management
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  try {
    let used = 0;
    for (const key in localStorage) {
      if (key.startsWith('overwatch-stadium')) {
        used += localStorage.getItem(key)?.length || 0;
      }
    }
    
    // Estimate total available (5MB typical browser limit)
    const total = 5 * 1024 * 1024; // 5MB in characters
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { used: 0, total: 0, percentage: 0 };
  }
}

export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}