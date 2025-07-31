import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Badge,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { StadiumItem } from '@/types/stadium';
import {
  formatCurrencyWithSymbol,
  getRarityColor,
  getRarityDisplayName,
  getCategoryColor,
  getCategoryDisplayName,
  formatStatsList,
} from '@/utils/formatting';

interface ItemCardProps {
  item: StadiumItem;
  onAdd?: (item: StadiumItem) => void;
  onRemove?: (item: StadiumItem) => void;
  isInBuild?: boolean;
  buildCount?: number;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  compact?: boolean;
  efficiency?: number;
  highlighted?: boolean;
}

export default function ItemCard({
  item,
  onAdd,
  onRemove,
  isInBuild = false,
  buildCount = 0,
  showAddButton = true,
  showRemoveButton = false,
  compact = false,
  efficiency,
  highlighted = false,
}: ItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  const rarityColor = getRarityColor(item.rarity);
  const categoryColor = getCategoryColor(item.category);
  const statsList = formatStatsList(item.stats);

  const handleAddClick = () => {
    if (onAdd) {
      onAdd(item);
    }
  };

  const handleRemoveClick = () => {
    if (onRemove) {
      onRemove(item);
    }
  };

  if (compact) {
    return (
      <Card
        sx={{
          minWidth: 200,
          border: highlighted ? '2px solid' : '1px solid',
          borderColor: highlighted ? 'primary.main' : 'divider',
          backgroundColor: highlighted ? 'action.selected' : 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 600 }}>
              {item.name}
            </Typography>
            {buildCount > 0 && <Badge badgeContent={buildCount} color="primary" sx={{ ml: 1 }} />}
          </Box>

          <Box display="flex" gap={0.5} mb={1}>
            <Chip
              label={getRarityDisplayName(item.rarity)}
              size="small"
              sx={{
                backgroundColor: rarityColor + '20',
                color: rarityColor,
                borderColor: rarityColor,
                border: '1px solid',
              }}
            />
            <Chip
              label={getCategoryDisplayName(item.category)}
              size="small"
              sx={{ backgroundColor: categoryColor + '20', color: categoryColor }}
            />
          </Box>

          <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
            {formatCurrencyWithSymbol(item.cost)}
          </Typography>

          {efficiency !== undefined && (
            <Typography variant="caption" color="text.secondary">
              Efficiency: {efficiency.toFixed(3)}
            </Typography>
          )}

          {(showAddButton || showRemoveButton) && (
            <Box display="flex" justifyContent="center" mt={1}>
              {showRemoveButton && isInBuild && (
                <IconButton onClick={handleRemoveClick} color="error" size="small">
                  <RemoveIcon />
                </IconButton>
              )}
              {showAddButton && !isInBuild && (
                <IconButton onClick={handleAddClick} color="primary" size="small">
                  <AddIcon />
                </IconButton>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        width: '100%',
        border: highlighted ? '2px solid' : '1px solid',
        borderColor: highlighted ? 'primary.main' : 'divider',
        backgroundColor: highlighted ? 'action.selected' : 'background.paper',
        position: 'relative',
        '&:hover': {
          backgroundColor: 'action.hover',
          transform: 'translateY(-1px)',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 3,
        },
      }}
    >
      {/* Rarity indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: rarityColor,
        }}
      />

      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {item.name}
              </Typography>
              {buildCount > 0 && <Badge badgeContent={buildCount} color="primary" />}
              {efficiency !== undefined && efficiency > 1.5 && (
                <Tooltip title="High efficiency item">
                  <StarIcon color="warning" fontSize="small" />
                </Tooltip>
              )}
            </Box>

            <Box display="flex" gap={1} mb={2}>
              <Chip
                label={getRarityDisplayName(item.rarity)}
                size="small"
                sx={{
                  backgroundColor: rarityColor + '20',
                  color: rarityColor,
                  borderColor: rarityColor,
                  border: '1px solid',
                }}
              />
              <Chip
                label={getCategoryDisplayName(item.category)}
                size="small"
                sx={{ backgroundColor: categoryColor + '20', color: categoryColor }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {item.description}
            </Typography>
          </Box>

          <Box textAlign="right">
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
              {formatCurrencyWithSymbol(item.cost)}
            </Typography>
            {efficiency !== undefined && (
              <Typography variant="caption" color="text.secondary">
                Efficiency: {efficiency.toFixed(3)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Stats Display */}
        {statsList.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
              Stats:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {statsList.map((stat, index) => (
                <Chip key={index} label={stat} size="small" variant="outlined" color="primary" />
              ))}
            </Box>
          </Box>
        )}

        {/* Passive Effect */}
        {item.passive && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
              Passive Effect:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                p: 1.5,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                fontStyle: 'italic',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {item.passive}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1}>
            <Tooltip title="View detailed information">
              <IconButton onClick={() => setExpanded(!expanded)} size="small" color="primary">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Item information">
              <IconButton size="small" color="info">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box display="flex" gap={1}>
            {showRemoveButton && isInBuild && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<RemoveIcon />}
                onClick={handleRemoveClick}
              >
                Remove
              </Button>
            )}
            {showAddButton && !isInBuild && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
              >
                Add to Build
              </Button>
            )}
          </Box>
        </Box>

        {/* Expanded Details */}
        <Collapse in={expanded}>
          <Box mt={2} pt={2} borderTop={1} borderColor="divider">
            <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
              Item Details:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Item ID" secondary={item.id} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Category"
                  secondary={`${getCategoryDisplayName(item.category)} item`}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Rarity" secondary={getRarityDisplayName(item.rarity)} />
              </ListItem>
              {efficiency !== undefined && (
                <ListItem>
                  <ListItemText
                    primary="Cost Efficiency"
                    secondary={`${efficiency.toFixed(3)} (${efficiency > 1.5 ? 'High' : efficiency > 1.0 ? 'Good' : 'Standard'})`}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
