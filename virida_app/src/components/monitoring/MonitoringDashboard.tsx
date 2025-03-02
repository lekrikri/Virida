import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Alert,
  styled,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import Co2Icon from '@mui/icons-material/Co2';
import LightModeIcon from '@mui/icons-material/LightMode';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import { mockSensors, mockAlerts, generateHistoricalData } from '../../data/mockData';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  height: '100%',
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

interface ZoneMetrics {
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  energy: number;
  water: number;
  plantHealth: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  zone: string;
}

const MonitoringDashboard: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState('all');
  const [metrics, setMetrics] = useState<Record<string, ZoneMetrics>>({
    'Zone 1': {
      temperature: 23.5,
      humidity: 65,
      co2: 800,
      light: 75,
      energy: 85,
      water: 70,
      plantHealth: 90,
    },
    'Zone 2': {
      temperature: 22.8,
      humidity: 62,
      co2: 750,
      light: 80,
      energy: 78,
      water: 65,
      plantHealth: 85,
    },
    'Zone 3': {
      temperature: 24.2,
      humidity: 68,
      co2: 820,
      light: 70,
      energy: 92,
      water: 75,
      plantHealth: 88,
    },
  });
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize historical data
  useEffect(() => {
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString(),
      temperature: 22 + Math.random() * 3,
      humidity: 60 + Math.random() * 10,
      co2: 750 + Math.random() * 100,
      light: 70 + Math.random() * 20,
    }));
    setHistoricalData(data);

    // Initialize alerts
    setAlerts(mockAlerts);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics
      setMetrics(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(zone => {
          updated[zone] = {
            temperature: updated[zone].temperature + (Math.random() - 0.5),
            humidity: updated[zone].humidity + (Math.random() - 0.5) * 2,
            co2: updated[zone].co2 + (Math.random() - 0.5) * 10,
            light: updated[zone].light + (Math.random() - 0.5) * 5,
            energy: updated[zone].energy + (Math.random() - 0.5) * 3,
            water: updated[zone].water + (Math.random() - 0.5) * 2,
            plantHealth: Math.min(100, Math.max(0, updated[zone].plantHealth + (Math.random() - 0.5))),
          };
        });
        return updated;
      });

      // Update historical data
      setHistoricalData(prev => [
        ...prev.slice(1),
        {
          time: new Date().toLocaleTimeString(),
          temperature: metrics['Zone 1'].temperature,
          humidity: metrics['Zone 1'].humidity,
          co2: metrics['Zone 1'].co2,
          light: metrics['Zone 1'].light,
        },
      ]);

      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [metrics]);

  const getStatusColor = (value: number, type: string) => {
    const ranges = {
      temperature: { min: 20, max: 26 },
      humidity: { min: 55, max: 75 },
      co2: { min: 600, max: 1000 },
      light: { min: 60, max: 85 },
      energy: { min: 70, max: 90 },
      water: { min: 60, max: 80 },
      plantHealth: { min: 80, max: 100 },
    };

    const range = ranges[type as keyof typeof ranges];
    if (value < range.min) return '#e74c3c';
    if (value > range.max) return '#e74c3c';
    return '#2ecc71';
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Monitoring Dashboard</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl variant="outlined" size="small">
            <InputLabel>Zone</InputLabel>
            <Select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              label="Zone"
            >
              <MenuItem value="all">All Zones</MenuItem>
              {Object.keys(metrics).map((zone) => (
                <MenuItem key={zone} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <IconButton onClick={() => setLastUpdate(new Date())}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Real-time Metrics */}
        {(selectedZone === 'all' ? Object.entries(metrics) : [[selectedZone, metrics[selectedZone]]]).map(
          ([zone, zoneMetrics]) => (
            <Grid item xs={12} md={selectedZone === 'all' ? 4 : 12} key={zone}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {zone}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MetricCard>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ThermostatIcon />
                          <Typography>Temperature</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: getStatusColor(zoneMetrics.temperature, 'temperature') }}>
                          {zoneMetrics.temperature.toFixed(1)}°C
                        </Typography>
                      </MetricCard>
                    </Grid>
                    <Grid item xs={6}>
                      <MetricCard>
                        <Box display="flex" alignItems="center" gap={1}>
                          <OpacityIcon />
                          <Typography>Humidity</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: getStatusColor(zoneMetrics.humidity, 'humidity') }}>
                          {zoneMetrics.humidity.toFixed(1)}%
                        </Typography>
                      </MetricCard>
                    </Grid>
                    <Grid item xs={6}>
                      <MetricCard>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Co2Icon />
                          <Typography>CO2</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: getStatusColor(zoneMetrics.co2, 'co2') }}>
                          {zoneMetrics.co2.toFixed(0)} ppm
                        </Typography>
                      </MetricCard>
                    </Grid>
                    <Grid item xs={6}>
                      <MetricCard>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LightModeIcon />
                          <Typography>Light</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ color: getStatusColor(zoneMetrics.light, 'light') }}>
                          {zoneMetrics.light.toFixed(1)}%
                        </Typography>
                      </MetricCard>
                    </Grid>
                    <Grid item xs={12}>
                      <Box mt={2}>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <ElectricBoltIcon />
                              <Typography variant="body2">
                                Energy: {zoneMetrics.energy.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <WaterDropIcon />
                              <Typography variant="body2">
                                Water: {zoneMetrics.water.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LocalFloristIcon />
                              <Typography variant="body2">
                                Health: {zoneMetrics.plantHealth.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            </Grid>
          )
        )}

        {/* Historical Data Chart */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historical Data
              </Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicalData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 34, 64, 0.95)',
                        border: '1px solid rgba(46, 204, 113, 0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature (°C)"
                      stroke="#e74c3c"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      name="Humidity (%)"
                      stroke="#3498db"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="co2"
                      name="CO2 (ppm)"
                      stroke="#2ecc71"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="light"
                      name="Light (%)"
                      stroke="#f1c40f"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Alerts</Typography>
                <Chip
                  label={`${alerts.filter(a => a.type === 'critical').length} Critical`}
                  color="error"
                  size="small"
                />
              </Box>
              <Grid container spacing={2}>
                {alerts.slice(0, 4).map((alert) => (
                  <Grid item xs={12} md={6} key={alert.id}>
                    <Alert
                      severity={alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">{alert.message}</Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                          <Chip label={alert.zone} size="small" />
                        </Box>
                      </Box>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonitoringDashboard;
