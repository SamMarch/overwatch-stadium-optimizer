import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Card,
  CardContent,
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { StadiumItem } from '@/types/stadium';
import ItemCard from './ItemCard';
import { 
  formatCurrencyWithSymbol,
  formatStatsList,
  formatBuildSummary,
  getStatDisplayName,
  formatStatValue
} from '@/utils/formatting';
import { validateBuild, calculateBuildStats, calculateTotalCost } from '@/utils/buildCalculations';

interface BuildSummaryProps {
  currentBuild: StadiumItem[];
  budget: number;
  maxItems?: number;
  onRemoveItem?: (item: StadiumItem) => void;
  onClearBuild?: () => void;
  onSaveBuild?: (items: StadiumItem[]) => void;
  buildName?: string;
}

interface ItemSlotProps {
  item?: StadiumItem;
  slotIndex: number;
  onRemove?: (item: StadiumItem) => void;
  isEmpty?: boolean;
}

const ItemSlot = ({ item, slotIndex, onRemove, isEmpty = false }: ItemSlotProps) => {
  if (isEmpty || !item) {
    return (
      <Card 
        variant="outlined" 
        sx={{ 
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'action.hover',
          borderStyle: 'dashed',
          borderColor: 'divider'
        }}
      >
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Slot {slotIndex + 1}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Empty
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Box position="relative">
      <ItemCard 
        item={item}
        onRemove={onRemove}
        isInBuild
        compact
        showRemoveButton
      />
      <Chip 
        label={slotIndex + 1}
        size="small"
        color="primary"
        sx={{ 
          position: 'absolute',
          top: -8,
          left: -8,
          zIndex: 1
        }}
      />
    </Box>
  );
};

export default function BuildSummary({ 
  currentBuild, 
  budget, 
  maxItems = 6,
  onRemoveItem,
  onClearBuild,
  onSaveBuild,
  buildName = "Current Build"
}: BuildSummaryProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const totalCost = calculateTotalCost(currentBuild);
  const currentStats = calculateBuildStats(currentBuild);
  const validation = validateBuild(currentBuild, budget, maxItems);
  const budgetUsage = budget > 0 ? (totalCost / budget) * 100 : 0;
  const remainingBudget = budget - totalCost;
  const statsList = formatStatsList(currentStats);

  // Fill empty slots for visual representation
  const buildSlots = [...currentBuild];
  while (buildSlots.length < maxItems) {
    buildSlots.push(undefined as any);
  }

  const handleClearBuild = () => {
    setClearDialogOpen(false);
    if (onClearBuild) {
      onClearBuild();
    }
  };

  const handleSaveBuild = () => {
    setSaveDialogOpen(false);
    if (onSaveBuild && currentBuild.length > 0) {
      onSaveBuild(currentBuild);
    }
  };

  const getValidationSeverity = () => {
    if (!validation.isValid) return 'error';
    if (validation.warnings.length > 0) return 'warning';
    return 'success';
  };

  const getValidationIcon = () => {
    if (!validation.isValid) return <ErrorIcon />;
    if (validation.warnings.length > 0) return <WarningIcon />;
    return <CheckCircleIcon />;
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom>
          {buildName}
        </Typography>
        
        <Box display="flex" gap={1}>
          {onSaveBuild && currentBuild.length > 0 && (
            <Tooltip title="Save this build">
              <IconButton 
                color="primary"
                onClick={() => setSaveDialogOpen(true)}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
          {onClearBuild && currentBuild.length > 0 && (
            <Tooltip title="Clear all items">
              <IconButton 
                color="error"
                onClick={() => setClearDialogOpen(true)}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Build Status */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h6" color="primary">
                {currentBuild.length}/{maxItems}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h6" color={totalCost > budget ? 'error' : 'primary'}>
                {formatCurrencyWithSymbol(totalCost)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h6" color={remainingBudget < 0 ? 'error' : 'success'}>
                {formatCurrencyWithSymbol(remainingBudget)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h6" color={budgetUsage > 100 ? 'error' : 'primary'}>
                {budgetUsage.toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Budget Used
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2">
            Budget Usage
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatBuildSummary(currentBuild.length, totalCost, budget)}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(budgetUsage, 100)}
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              backgroundColor: budgetUsage > 100 ? 'error.main' : 
                            budgetUsage > 80 ? 'warning.main' : 'success.main'
            }
          }}
        />
      </Box>

      {/* Validation Status */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <Alert 
          severity={getValidationSeverity()}
          icon={getValidationIcon()}
          sx={{ mb: 3 }}
        >
          <Box>
            {validation.errors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
            {validation.warnings.map((warning, index) => (
              <Typography key={index} variant="body2">
                • {warning}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {/* Item Slots */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Item Slots
        </Typography>
        <Grid container spacing={2}>
          {buildSlots.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <ItemSlot 
                item={item}
                slotIndex={index}
                onRemove={onRemoveItem}
                isEmpty={!item}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Current Stats */}
      {statsList.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Total Stats
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(currentStats).map(([statKey, value]) => {
              if (!value || value === 0) return null;
              return (
                <Chip 
                  key={statKey}
                  label={`${getStatDisplayName(statKey as any)}: ${formatStatValue(value, statKey as any)}`}
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {currentBuild.length === 0 && (
        <Box textAlign="center" py={4}>
          <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Items in Build
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the optimizer to find recommended items, or browse the item database to build manually.
          </Typography>
        </Box>
      )}

      {/* Clear Build Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear Build</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all items from your current build? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleClearBuild} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Clear Build
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Build Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Build</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Save your current build for later use? You can load saved builds from the Inventory page.
          </Typography>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Build Summary:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Items" 
                  secondary={`${currentBuild.length} items`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Total Cost" 
                  secondary={formatCurrencyWithSymbol(totalCost)}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Budget Usage" 
                  secondary={`${budgetUsage.toFixed(1)}%`}
                />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveBuild} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Build
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}