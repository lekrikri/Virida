import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip,
  Chip,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BoltIcon from '@mui/icons-material/Bolt';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Co2Icon from '@mui/icons-material/Co2';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Line } from 'recharts';
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  height: '100%',
}));

const ResourceChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(46, 204, 113, 0.1)',
  borderColor: theme.palette.primary.main,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

interface Resource {
  id: string;
  name: string;
  type: 'water' | 'energy' | 'temperature' | 'co2' | 'light';
  currentValue: number;
  unit: string;
  optimal: number;
  min: number;
  max: number;
  status: 'normal' | 'warning' | 'critical';
  consumption: number;
  history: Array<{ timestamp: string; value: number }>;
}

const ResourceManager: React.FC = () => {
  const [resources, setResources] = React.useState<Resource[]>([
    {
      id: 'water-main',
      name: 'Water Supply',
      type: 'water',
      currentValue: 75,
      unit: 'L/h',
      optimal: 80,
      min: 60,
      max: 100,
      status: 'normal',
      consumption: 450,
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        value: 70 + Math.random() * 20,
      })),
    },
    {
      id: 'energy-main',
      name: 'Power Consumption',
      type: 'energy',
      currentValue: 8.5,
      unit: 'kW',
      optimal: 7.5,
      min: 5,
      max: 10,
      status: 'warning',
      consumption: 204,
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        value: 7 + Math.random() * 3,
      })),
    },
    {
      id: 'temp-zone1',
      name: 'Zone 1 Temperature',
      type: 'temperature',
      currentValue: 23,
      unit: '°C',
      optimal: 22,
      min: 18,
      max: 26,
      status: 'normal',
      consumption: 0,
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        value: 22 + Math.random() * 2,
      })),
    },
    {
      id: 'co2-main',
      name: 'CO2 Level',
      type: 'co2',
      currentValue: 800,
      unit: 'ppm',
      optimal: 1000,
      min: 400,
      max: 1500,
      status: 'warning',
      consumption: 0,
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        value: 800 + Math.random() * 400,
      })),
    },
    {
      id: 'light-zone1',
      name: 'Zone 1 Light Intensity',
      type: 'light',
      currentValue: 20000,
      unit: 'lux',
      optimal: 25000,
      min: 15000,
      max: 30000,
      status: 'normal',
      consumption: 120,
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        value: 20000 + Math.random() * 5000,
      })),
    },
  ]);

  const [selectedResource, setSelectedResource] = React.useState<Resource | null>(
    null
  );
  const [openDialog, setOpenDialog] = React.useState(false);

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'water':
        return <WaterDropIcon />;
      case 'energy':
        return <BoltIcon />;
      case 'temperature':
        return <ThermostatIcon />;
      case 'co2':
        return <Co2Icon />;
      case 'light':
        return <LightModeIcon />;
    }
  };

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'normal':
        return '#2ecc71';
      case 'warning':
        return '#f1c40f';
      case 'critical':
        return '#e74c3c';
    }
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setOpenDialog(true);
  };

  const formatValue = (value: number, unit: string) => {
    return `${value.toLocaleString()} ${unit}`;
  };

  return (
    <Grid container spacing={3}>
      {resources.map((resource) => (
        <Grid item xs={12} md={6} lg={4} key={resource.id}>
          <StyledCard>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ResourceChip
                    icon={getResourceIcon(resource.type)}
                    label={resource.name}
                  />
                </Box>
                <Box>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <TimelineIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Configure">
                    <IconButton size="small">
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                  {resource.status !== 'normal' && (
                    <Tooltip title={`Status: ${resource.status}`}>
                      <IconButton
                        size="small"
                        sx={{ color: getStatusColor(resource.status) }}
                      >
                        <NotificationsIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="h4" gutterBottom>
                  {formatValue(resource.currentValue, resource.unit)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    ((resource.currentValue - resource.min) /
                      (resource.max - resource.min)) *
                    100
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStatusColor(resource.status),
                    },
                  }}
                />
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="caption" color="text.secondary">
                  Optimal: {formatValue(resource.optimal, resource.unit)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Range: {formatValue(resource.min, resource.unit)} -{' '}
                  {formatValue(resource.max, resource.unit)}
                </Typography>
              </Box>

              {resource.consumption > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Daily Consumption:{' '}
                  {resource.type === 'energy'
                    ? `${resource.consumption} kWh`
                    : `${resource.consumption} L`}
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      ))}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(17, 34, 64, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(46, 204, 113, 0.1)',
          },
        }}
      >
        {selectedResource && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {getResourceIcon(selectedResource.type)}
                {selectedResource.name} History
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box height={400} mt={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={selectedResource.history}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="timestamp"
                      stroke="rgba(255,255,255,0.5)"
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 34, 64, 0.95)',
                        border: '1px solid rgba(46, 204, 113, 0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={`${selectedResource.name} (${selectedResource.unit})`}
                      stroke="#2ecc71"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Resource Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper
                      sx={{
                        p: 2,
                        background: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Current Value
                      </Typography>
                      <Typography variant="h6">
                        {formatValue(
                          selectedResource.currentValue,
                          selectedResource.unit
                        )}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      sx={{
                        p: 2,
                        background: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Optimal Value
                      </Typography>
                      <Typography variant="h6">
                        {formatValue(
                          selectedResource.optimal,
                          selectedResource.unit
                        )}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      sx={{
                        p: 2,
                        background: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: getStatusColor(selectedResource.status),
                        }}
                      >
                        {selectedResource.status.toUpperCase()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      sx={{
                        p: 2,
                        background: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Daily Consumption
                      </Typography>
                      <Typography variant="h6">
                        {selectedResource.consumption > 0
                          ? selectedResource.type === 'energy'
                            ? `${selectedResource.consumption} kWh`
                            : `${selectedResource.consumption} L`
                          : 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Grid>
  );
};

export default ResourceManager;
