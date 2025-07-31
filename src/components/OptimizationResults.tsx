import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import type { OptimizationResult, StadiumItem } from '@/types/stadium';
import ItemCard from './ItemCard';
import { 
  formatCurrencyWithSymbol,
  formatStatsList,
  getStatDisplayName,
  formatPercentage
} from '@/utils/formatting';

interface OptimizationResultsProps {
  result: OptimizationResult | null;
  onApplyBuild?: (items: StadiumItem[]) => void;
  onAddItem?: (item: StadiumItem) => void;
  isLoading?: boolean;
}

export default function OptimizationResults({ 
  result, 
  onApplyBuild, 
  onAddItem,
  isLoading = false 
}: OptimizationResultsProps) {
  const [showAlternative, setShowAlternative] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState('');

  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon color="primary" />
          Optimizing Build...
        </Typography>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Finding the best item combination for your target stats...
        </Typography>
      </Paper>
    );
  }

  if (!result) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Set your target stats and budget, then click "Optimize Build" to see recommendations.
        </Typography>
      </Paper>
    );
  }

  const handleApplyBuild = () => {
    if (onApplyBuild) {
      onApplyBuild(result.recommendedItems);
    }
  };

  const handleCopyBuild = async () => {
    const buildText = result.recommendedItems.map(item => `${item.name} (${formatCurrencyWithSymbol(item.cost)})`).join('\n');
    const fullText = `Overwatch Stadium Build - ${formatCurrencyWithSymbol(result.totalCost)}\n\n${buildText}\n\nEfficiency: ${result.efficiency.toFixed(2)}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedMessage('Build copied to clipboard!');
      setTimeout(() => setCopiedMessage(''), 3000);
    } catch (err) {
      setCopiedMessage('Copy failed');
      setTimeout(() => setCopiedMessage(''), 3000);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 2.0) return 'success';
    if (efficiency >= 1.0) return 'warning';
    return 'error';
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 2.0) return 'Excellent';
    if (efficiency >= 1.5) return 'Very Good';
    if (efficiency >= 1.0) return 'Good';
    if (efficiency >= 0.5) return 'Fair';
    return 'Poor';
  };

  return (
    <Box>
      {/* Main Results Header */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" />
              Optimization Complete
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Found optimal build with {result.recommendedItems.length} items
            </Typography>
          </Box>

          <Box textAlign="right">
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              {formatCurrencyWithSymbol(result.totalCost)}
            </Typography>
            <Chip 
              label={`${getEfficiencyLabel(result.efficiency)} Efficiency`}
              color={getEfficiencyColor(result.efficiency)}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h6" color="primary">
                  {result.recommendedItems.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h6" color="primary">
                  {result.efficiency.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Efficiency
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h6" color="primary">
                  {result.executionTime?.toFixed(0) || 0}ms
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Calc Time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h6" color="primary">
                  {Object.keys(result.statCoverage).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Stats Covered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            size="large"
            startIcon={<AssignmentIcon />}
            onClick={handleApplyBuild}
            sx={{ flexGrow: 1, minWidth: 200 }}
          >
            Apply This Build
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyBuild}
          >
            Copy Build
          </Button>
          {result.alternativeBuild && (
            <Button
              variant="outlined"
              startIcon={<CompareIcon />}
              onClick={() => setShowAlternative(!showAlternative)}
            >
              {showAlternative ? 'Hide' : 'Show'} Alternative
            </Button>
          )}
        </Box>

        {copiedMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {copiedMessage}
          </Alert>
        )}
      </Paper>

      {/* Recommended Items */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          Recommended Items
        </Typography>
        
        <Grid container spacing={2}>
          {result.recommendedItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <ItemCard 
                item={item}
                onAdd={onAddItem}
                compact
                highlighted
                showAddButton={!!onAddItem}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Stat Coverage Analysis */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Target Stats Coverage
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(result.statCoverage).map(([statKey, coverage]) => (
            <Grid item xs={12} sm={6} md={4} key={statKey}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">
                    {getStatDisplayName(statKey as any)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {coverage.achieved}/{coverage.target}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(coverage.percentage, 100)}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: coverage.percentage >= 100 ? 'success.main' : 
                                    coverage.percentage >= 75 ? 'warning.main' : 'error.main'
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatPercentage(coverage.percentage)} of target
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Optimization Reasoning */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Why These Items? (AI Reasoning)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {result.reasoning.map((reason, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={reason} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Alternative Build */}
      {result.alternativeBuild && showAlternative && (
        <Paper sx={{ p: 3, mt: 2, backgroundColor: 'action.hover' }}>
          <Typography variant="h6" gutterBottom>
            Alternative Build - {result.alternativeBuild.reason}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="secondary">
              {formatCurrencyWithSymbol(result.alternativeBuild.cost)}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onApplyBuild?.(result.alternativeBuild!.items)}
            >
              Apply Alternative
            </Button>
          </Box>

          <Grid container spacing={2}>
            {result.alternativeBuild.items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <ItemCard 
                  item={item}
                  onAdd={onAddItem}
                  compact
                  showAddButton={!!onAddItem}
                />
              </Grid>
            ))}
          </Grid>

          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Alternative Build Stats:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {formatStatsList(result.alternativeBuild.stats).map((stat, index) => (
                <Chip 
                  key={index}
                  label={stat}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              ))}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}