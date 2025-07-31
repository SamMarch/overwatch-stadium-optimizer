import { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  Grid,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { PlayArrow, Refresh, TrendingUp } from '@mui/icons-material';
import type { TargetStats, OptimizationCriteria, OptimizationResult } from '@/types/stadium';
import { optimizeItemBuildDebounced } from '@/utils/optimizer';
import { formatCurrency } from '@/utils/formatting';

interface OptimizationFormProps {
  onOptimizationResult: (result: OptimizationResult) => void;
  isOptimizing?: boolean;
}

interface StatSliderProps {
  label: string;
  value: number;
  priority: 'low' | 'medium' | 'high';
  onChange: (value: number) => void;
  onPriorityChange: (priority: 'low' | 'medium' | 'high') => void;
  unit?: string;
  min?: number;
  max?: number;
}

const StatSlider = ({ 
  label, 
  value, 
  priority, 
  onChange, 
  onPriorityChange, 
  unit = '%',
  min = 0,
  max = 100
}: StatSliderProps) => {
  const priorityColors = {
    high: 'error',
    medium: 'warning', 
    low: 'info'
  } as const;

  return (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle2" color="text.primary">
          {label}
        </Typography>
        <Chip 
          label={priority.toUpperCase()} 
          color={priorityColors[priority]}
          size="small"
          variant="outlined"
        />
      </Box>
      
      <Slider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        min={min}
        max={max}
        step={1}
        valueLabelDisplay="on"
        valueLabelFormat={(val) => `${val}${unit}`}
        sx={{
          mb: 1,
          '& .MuiSlider-thumb': {
            backgroundColor: priority === 'high' ? '#f44336' : 
                            priority === 'medium' ? '#ff9800' : '#2196f3'
          },
          '& .MuiSlider-track': {
            backgroundColor: priority === 'high' ? '#f44336' : 
                            priority === 'medium' ? '#ff9800' : '#2196f3'
          }
        }}
      />
      
      <FormControl component="fieldset" size="small">
        <RadioGroup
          row
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as 'low' | 'medium' | 'high')}
        >
          <FormControlLabel 
            value="low" 
            control={<Radio size="small" />} 
            label="Low" 
            sx={{ mr: 2 }}
          />
          <FormControlLabel 
            value="medium" 
            control={<Radio size="small" />} 
            label="Medium" 
            sx={{ mr: 2 }}
          />
          <FormControlLabel 
            value="high" 
            control={<Radio size="small" />} 
            label="High" 
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default function OptimizationForm({ onOptimizationResult, isOptimizing = false }: OptimizationFormProps) {
  // Budget state
  const [budget, setBudget] = useState(50000);
  const [maxItems, setMaxItems] = useState(6);
  
  // Target stats state
  const [weaponPower, setWeaponPower] = useState<{ value: number; priority: 'low' | 'medium' | 'high' }>({ value: 20, priority: 'medium' });
  const [abilityPower, setAbilityPower] = useState<{ value: number; priority: 'low' | 'medium' | 'high' }>({ value: 15, priority: 'medium' });
  const [attackSpeed, setAttackSpeed] = useState<{ value: number; priority: 'low' | 'medium' | 'high' }>({ value: 10, priority: 'low' });
  const [health, setHealth] = useState<{ value: number; priority: 'low' | 'medium' | 'high' }>({ value: 50, priority: 'low' });
  const [cooldownReduction, setCooldownReduction] = useState<{ value: number; priority: 'low' | 'medium' | 'high' }>({ value: 8, priority: 'low' });
  
  // UI state
  const [lastOptimizationTime, setLastOptimizationTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Preset configurations
  const presets = {
    dps: {
      weaponPower: { value: 35, priority: 'high' as 'low' | 'medium' | 'high' },
      abilityPower: { value: 10, priority: 'low' as 'low' | 'medium' | 'high' },
      attackSpeed: { value: 25, priority: 'high' as 'low' | 'medium' | 'high' },
      health: { value: 30, priority: 'medium' as 'low' | 'medium' | 'high' },
      cooldownReduction: { value: 5, priority: 'low' as 'low' | 'medium' | 'high' }
    },
    tank: {
      weaponPower: { value: 10, priority: 'low' as 'low' | 'medium' | 'high' },
      abilityPower: { value: 20, priority: 'medium' as 'low' | 'medium' | 'high' },
      attackSpeed: { value: 5, priority: 'low' as 'low' | 'medium' | 'high' },
      health: { value: 80, priority: 'high' as 'low' | 'medium' | 'high' },
      cooldownReduction: { value: 15, priority: 'high' as 'low' | 'medium' | 'high' }
    },
    support: {
      weaponPower: { value: 8, priority: 'low' as 'low' | 'medium' | 'high' },
      abilityPower: { value: 30, priority: 'high' as 'low' | 'medium' | 'high' },
      attackSpeed: { value: 8, priority: 'low' as 'low' | 'medium' | 'high' },
      health: { value: 40, priority: 'medium' as 'low' | 'medium' | 'high' },
      cooldownReduction: { value: 20, priority: 'high' as 'low' | 'medium' | 'high' }
    }
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    setWeaponPower(preset.weaponPower);
    setAbilityPower(preset.abilityPower);
    setAttackSpeed(preset.attackSpeed);
    setHealth(preset.health);
    setCooldownReduction(preset.cooldownReduction);
  };

  const buildTargetStats = (): TargetStats => ({
    weaponPower: weaponPower.value > 0 ? { target: weaponPower.value, priority: weaponPower.priority } : undefined,
    abilityPower: abilityPower.value > 0 ? { target: abilityPower.value, priority: abilityPower.priority } : undefined,
    attackSpeed: attackSpeed.value > 0 ? { target: attackSpeed.value, priority: attackSpeed.priority } : undefined,
    health: health.value > 0 ? { target: health.value, priority: health.priority } : undefined,
    cooldownReduction: cooldownReduction.value > 0 ? { target: cooldownReduction.value, priority: cooldownReduction.priority } : undefined,
  });

  const handleOptimize = useCallback(() => {
    const targetStats = buildTargetStats();
    
    // Validate that at least one stat is set
    const hasValidStats = Object.values(targetStats).some(stat => stat && stat.target > 0);
    if (!hasValidStats) {
      setError('Please set at least one target stat above 0');
      return;
    }

    setError(null);
    
    const criteria: OptimizationCriteria = {
      maxBudget: budget,
      maxItems,
      targetStats,
      prioritizeEfficiency: true
    };

    optimizeItemBuildDebounced(criteria, (result) => {
      setLastOptimizationTime(Date.now());
      onOptimizationResult(result);
    }, 300);
  }, [budget, maxItems, weaponPower, abilityPower, attackSpeed, health, cooldownReduction, onOptimizationResult]);

  // Auto-optimize when parameters change (debounced)
  const handleAutoOptimize = useCallback(() => {
    if (lastOptimizationTime > 0) { // Only auto-optimize if user has manually optimized at least once
      handleOptimize();
    }
  }, [handleOptimize, lastOptimizationTime]);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp color="primary" />
        Build Optimizer
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Budget Configuration */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Budget Settings
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel sx={{ mb: 1 }}>
                Stadium Cash Budget: {formatCurrency(budget)} SC
              </FormLabel>
              <Slider
                value={budget}
                onChange={(_, value) => setBudget(value as number)}
                min={5000}
                max={100000}
                step={1000}
                valueLabelDisplay="on"
                marks={[
                  { value: 10000, label: '10K' },
                  { value: 25000, label: '25K' },
                  { value: 50000, label: '50K' },
                  { value: 75000, label: '75K' },
                  { value: 100000, label: '100K' }
                ]}
                valueLabelFormat={(value) => `${formatCurrency(value)} SC`}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>
                Maximum Items: {maxItems}
              </FormLabel>
              <Slider
                value={maxItems}
                onChange={(_, value) => setMaxItems(value as number)}
                min={1}
                max={6}
                step={1}
                valueLabelDisplay="on"
                marks
              />
            </FormControl>
          </Paper>
        </Grid>

        {/* Target Stats Configuration */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Target Stats & Priority
              </Typography>
              
              <Box display="flex" gap={1}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => applyPreset('dps')}
                  color="error"
                >
                  DPS Focus
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => applyPreset('tank')}
                  color="info"
                >
                  Tank Focus
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => applyPreset('support')}
                  color="success"
                >
                  Support Focus
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StatSlider
                  label="Weapon Power"
                  value={weaponPower.value}
                  priority={weaponPower.priority}
                  onChange={(value) => {
                    setWeaponPower({ ...weaponPower, value });
                    handleAutoOptimize();
                  }}
                  onPriorityChange={(priority) => {
                    setWeaponPower({ ...weaponPower, priority });
                    handleAutoOptimize();
                  }}
                  max={50}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StatSlider
                  label="Ability Power"
                  value={abilityPower.value}
                  priority={abilityPower.priority}
                  onChange={(value) => {
                    setAbilityPower({ ...abilityPower, value });
                    handleAutoOptimize();
                  }}
                  onPriorityChange={(priority) => {
                    setAbilityPower({ ...abilityPower, priority });
                    handleAutoOptimize();
                  }}
                  max={50}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StatSlider
                  label="Attack Speed"
                  value={attackSpeed.value}
                  priority={attackSpeed.priority}
                  onChange={(value) => {
                    setAttackSpeed({ ...attackSpeed, value });
                    handleAutoOptimize();
                  }}
                  onPriorityChange={(priority) => {
                    setAttackSpeed({ ...attackSpeed, priority });
                    handleAutoOptimize();
                  }}
                  max={30}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StatSlider
                  label="Health"
                  value={health.value}
                  priority={health.priority}
                  onChange={(value) => {
                    setHealth({ ...health, value });
                    handleAutoOptimize();
                  }}
                  onPriorityChange={(priority) => {
                    setHealth({ ...health, priority });
                    handleAutoOptimize();
                  }}
                  unit=""
                  max={150}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StatSlider
                  label="Cooldown Reduction"
                  value={cooldownReduction.value}
                  priority={cooldownReduction.priority}
                  onChange={(value) => {
                    setCooldownReduction({ ...cooldownReduction, value });
                    handleAutoOptimize();
                  }}
                  onPriorityChange={(priority) => {
                    setCooldownReduction({ ...cooldownReduction, priority });
                    handleAutoOptimize();
                  }}
                  max={25}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Box display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={isOptimizing ? <Refresh /> : <PlayArrow />}
          onClick={handleOptimize}
          disabled={isOptimizing}
          sx={{ px: 4 }}
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Build'}
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          startIcon={<Refresh />}
          onClick={() => {
            setBudget(50000);
            setMaxItems(6);
            setWeaponPower({ value: 20, priority: 'medium' });
            setAbilityPower({ value: 15, priority: 'medium' });
            setAttackSpeed({ value: 10, priority: 'low' });
            setHealth({ value: 50, priority: 'low' });
            setCooldownReduction({ value: 8, priority: 'low' });
            setError(null);
          }}
        >
          Reset to Defaults
        </Button>
      </Box>
    </Paper>
  );
}