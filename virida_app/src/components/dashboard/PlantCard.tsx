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
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  position: 'relative',
  borderTop: `2px solid ${
    status === 'healthy' 
      ? '#2AD388'
      : status === 'attention'
      ? '#f1c40f'
      : '#e74c3c'
  }`,
}));

const PlantIcon = styled(LocalFloristIcon)(({ theme }) => ({
  fontSize: '2rem',
  color: '#2AD388',
}));

const PlantCard: React.FC<PlantCardProps> = ({ plant, onSelect }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#2AD388';
      case 'attention':
        return '#f1c40f';
      case 'critical':
        return '#e74c3c';
      default:
        return '#2AD388';
    }
  };

  return (
    <StyledCard status={plant.status}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <PlantIcon />
            <Typography variant="h6" color="#121A21">{plant.name}</Typography>
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
              sx={{ color: '#2AD388' }}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body2" color="#121A21" gutterBottom>
          Species: {plant.species}
        </Typography>
        
        <Typography variant="body2" color="#121A21">
          Planted: {plant.plantedDate.toLocaleDateString()}
        </Typography>
        
        <Box mt={2}>
          <Typography variant="subtitle2" color="#121A21" gutterBottom>
            Optimal Conditions:
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
            <Typography variant="body2" color="#121A21">
              Temp: {plant.optimalConditions.temperature.min}-{plant.optimalConditions.temperature.max}°C
            </Typography>
            <Typography variant="body2" color="#121A21">
              Humidity: {plant.optimalConditions.humidity.min}-{plant.optimalConditions.humidity.max}%
            </Typography>
            <Typography variant="body2" color="#121A21">
              pH: {plant.optimalConditions.ph.min}-{plant.optimalConditions.ph.max}
            </Typography>
            <Typography variant="body2" color="#121A21">
              Light: {plant.optimalConditions.light.min}-{plant.optimalConditions.light.max} lux
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default PlantCard;
