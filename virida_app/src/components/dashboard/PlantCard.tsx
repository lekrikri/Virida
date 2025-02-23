import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PlantData } from '../../store/useViridaStore';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SettingsIcon from '@mui/icons-material/Settings';

interface PlantCardProps {
  plant: PlantData;
  onSelect: (plantId: number) => void;
}

const StyledCard = styled(Card)<{ status: string }>(({ theme, status }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: status === 'healthy' 
      ? 'linear-gradient(90deg, #27ae60, #2ecc71)'
      : status === 'attention'
      ? 'linear-gradient(90deg, #f1c40f, #f39c12)'
      : 'linear-gradient(90deg, #e74c3c, #c0392b)',
  },
}));

const PlantIcon = styled(LocalFloristIcon)(({ theme }) => ({
  fontSize: '2rem',
  color: theme.palette.primary.main,
}));

const PlantCard: React.FC<PlantCardProps> = ({ plant, onSelect }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#27ae60';
      case 'attention':
        return '#f1c40f';
      case 'critical':
        return '#e74c3c';
      default:
        return '#27ae60';
    }
  };

  return (
    <StyledCard status={plant.status}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <PlantIcon />
            <Typography variant="h6">{plant.name}</Typography>
          </Box>
          <Box>
            <Chip
              label={plant.status}
              size="small"
              sx={{
                backgroundColor: `${getStatusColor(plant.status)}20`,
                color: getStatusColor(plant.status),
                mr: 1,
              }}
            />
            <IconButton
              size="small"
              onClick={() => onSelect(plant.id)}
              sx={{ color: 'primary.main' }}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Species: {plant.species}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Planted: {plant.plantedDate.toLocaleDateString()}
        </Typography>
        
        <Box mt={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Optimal Conditions:
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Temp: {plant.optimalConditions.temperature.min}-{plant.optimalConditions.temperature.max}°C
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Humidity: {plant.optimalConditions.humidity.min}-{plant.optimalConditions.humidity.max}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              pH: {plant.optimalConditions.ph.min}-{plant.optimalConditions.ph.max}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Light: {plant.optimalConditions.light.min}-{plant.optimalConditions.light.max} lux
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default PlantCard;
