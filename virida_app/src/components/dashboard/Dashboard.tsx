import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import GreenhouseModel from '../3d/GreenhouseModel';
import SensorCard from './SensorCard';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: '#FFFFFF',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
}));

const GridOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `
    linear-gradient(90deg, rgba(42, 211, 136, 0.03) 1px, transparent 1px),
    linear-gradient(0deg, rgba(42, 211, 136, 0.03) 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px',
  pointerEvents: 'none',
}));

const Dashboard: React.FC = () => {
  const mockSensors = [
    { id: 1, type: 'temperature', value: 24.5, unit: '°C', status: 'normal' },
    { id: 2, type: 'humidity', value: 65, unit: '%', status: 'warning' },
    { id: 3, type: 'ph', value: 6.5, unit: 'pH', status: 'normal' },
    { id: 4, type: 'light', value: 850, unit: 'lux', status: 'alert' },
  ];

  return (
    <Box sx={{ p: 3, minHeight: '100vh', position: 'relative', background: '#FFFFFF' }}>
      <GridOverlay />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ mb: 3, color: '#121A21' }}>
            Greenhouse Monitor
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <StyledPaper sx={{ p: 2, height: '70vh' }}>
            <GreenhouseModel />
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {mockSensors.map((sensor) => (
              <Grid item xs={12} key={sensor.id}>
                <SensorCard sensor={sensor} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
