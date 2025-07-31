import { useState, useCallback, useEffect } from 'react';
import { Container, Typography, Grid, Box, Snackbar, Alert } from '@mui/material';
import type { StadiumItem, OptimizationResult } from '@/types/stadium';
import OptimizationForm from '../components/OptimizationForm';
import OptimizationResults from '../components/OptimizationResults';
import BuildSummary from '../components/BuildSummary';
import { saveBuild, getCurrentBuild, saveCurrentBuild } from '@/utils/localStorage';
import { createEmptyBuild } from '@/utils/buildCalculations';

export default function OptimizerPage() {
  // Core state
  const [currentBuild, setCurrentBuild] = useState<StadiumItem[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // UI state
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info';
  } | null>(null);

  // Load saved build on mount
  useEffect(() => {
    try {
      const savedBuild = getCurrentBuild();
      if (savedBuild && savedBuild.currentItems.length > 0) {
        setCurrentBuild(savedBuild.currentItems);
      }
    } catch (error) {
      console.warn('Failed to load saved build:', error);
    }
  }, []);

  const showNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
      setNotification({ message, severity });
    },
    []
  );

  const handleOptimizationResult = useCallback(
    (result: OptimizationResult) => {
      setOptimizationResult(result);
      setIsOptimizing(false);
      showNotification(
        `Found optimal build with ${result.recommendedItems.length} items (${result.executionTime?.toFixed(0)}ms)`,
        'success'
      );
    },
    [showNotification]
  );

  const handleApplyBuild = useCallback(
    (items: StadiumItem[]) => {
      setCurrentBuild(items);

      // Save to localStorage
      const build = createEmptyBuild('Applied Build', 100000);
      const updatedBuild = { ...build, currentItems: items };
      saveCurrentBuild(updatedBuild);

      showNotification(`Applied build with ${items.length} items`, 'success');
    },
    [showNotification]
  );

  const handleAddItem = useCallback(
    (item: StadiumItem) => {
      if (currentBuild.length >= 6) {
        showNotification('Cannot add more than 6 items to a build', 'error');
        return;
      }

      if (currentBuild.some(buildItem => buildItem.id === item.id)) {
        showNotification('Item is already in your build', 'error');
        return;
      }

      const newBuild = [...currentBuild, item];
      setCurrentBuild(newBuild);

      // Save to localStorage
      const build = createEmptyBuild('Current Build', 100000);
      const updatedBuild = { ...build, currentItems: newBuild };
      saveCurrentBuild(updatedBuild);

      showNotification(`Added ${item.name} to build`, 'success');
    },
    [currentBuild, showNotification]
  );

  const handleRemoveItem = useCallback(
    (item: StadiumItem) => {
      const newBuild = currentBuild.filter(buildItem => buildItem.id !== item.id);
      setCurrentBuild(newBuild);

      // Save to localStorage
      const build = createEmptyBuild('Current Build', 100000);
      const updatedBuild = { ...build, currentItems: newBuild };
      saveCurrentBuild(updatedBuild);

      showNotification(`Removed ${item.name} from build`, 'info');
    },
    [currentBuild, showNotification]
  );

  const handleClearBuild = useCallback(() => {
    setCurrentBuild([]);

    // Clear from localStorage
    const build = createEmptyBuild('Current Build', 100000);
    saveCurrentBuild(build);

    showNotification('Build cleared', 'info');
  }, [showNotification]);

  const handleSaveBuild = useCallback(
    (items: StadiumItem[]) => {
      try {
        const build = createEmptyBuild(`Stadium Build ${new Date().toLocaleDateString()}`, 100000);
        const buildToSave = { ...build, currentItems: items };

        saveBuild(buildToSave, buildToSave.name, ['optimizer', 'custom']);
        showNotification('Build saved successfully!', 'success');
      } catch {
        showNotification('Failed to save build', 'error');
      }
    },
    [showNotification]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Stadium Build Optimizer
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Optimization Form and Results */}
        <Grid item xs={12} lg={8}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Optimization Form */}
            <OptimizationForm
              onOptimizationResult={handleOptimizationResult}
              isOptimizing={isOptimizing}
            />

            {/* Optimization Results */}
            <OptimizationResults
              result={optimizationResult}
              onApplyBuild={handleApplyBuild}
              onAddItem={handleAddItem}
              isLoading={isOptimizing}
            />
          </Box>
        </Grid>

        {/* Right Column - Current Build Summary */}
        <Grid item xs={12} lg={4}>
          <Box position="sticky" top={20}>
            <BuildSummary
              currentBuild={currentBuild}
              budget={100000} // Default budget, could be made dynamic
              maxItems={6}
              onRemoveItem={handleRemoveItem}
              onClearBuild={handleClearBuild}
              onSaveBuild={handleSaveBuild}
              buildName="Current Build"
            />
          </Box>
        </Grid>
      </Grid>

      {/* Notification Snackbar */}
      {notification && (
        <Snackbar
          open={!!notification}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
}
