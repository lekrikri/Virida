import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BoltIcon from '@mui/icons-material/Bolt';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Co2Icon from '@mui/icons-material/Co2';
import LightModeIcon from '@mui/icons-material/LightMode';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  height: '100%',
}));

const StatusChip = styled(Chip)<{ status: 'normal' | 'warning' | 'critical' }>(
  ({ theme, status }) => ({
    backgroundColor: status === 'normal'
      ? 'rgba(46, 204, 113, 0.1)'
      : status === 'warning'
        ? 'rgba(241, 196, 15, 0.1)'
        : 'rgba(231, 76, 60, 0.1)',
    color: status === 'normal'
      ? '#2ecc71'
      : status === 'warning'
        ? '#f1c40f'
        : '#e74c3c',
    '& .MuiChip-icon': {
      color: 'inherit',
    },
  })
);

interface SystemStatus {
  category: string;
  status: 'normal' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface ResourceMetric {
  name: string;
  type: 'water' | 'energy' | 'temperature' | 'co2' | 'light';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

const SupervisionDashboard: React.FC = () => {
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [systemStatuses, setSystemStatuses] = React.useState<SystemStatus[]>([
    {
      category: 'Environmental Control',
      status: 'normal',
      message: 'All systems operating normally',
      timestamp: '2025-02-18T13:45:00',
    },
    {
      category: 'Irrigation System',
      status: 'warning',
      message: 'Zone 2 pressure below optimal',
      timestamp: '2025-02-18T13:40:00',
    },
    {
      category: 'Lighting System',
      status: 'normal',
      message: 'Light intensity within range',
      timestamp: '2025-02-18T13:42:00',
    },
    {
      category: 'Nutrient Delivery',
      status: 'critical',
      message: 'pH level out of range in Zone 3',
      timestamp: '2025-02-18T13:30:00',
    },
  ]);

  const [alerts, setAlerts] = React.useState<Alert[]>([
    {
      id: 'alert-1',
      type: 'critical',
      message: 'High temperature detected in Zone 3',
      timestamp: '2025-02-18T13:15:00',
      acknowledged: false,
    },
    {
      id: 'alert-2',
      type: 'warning',
      message: 'CO2 levels below optimal in Zone 1',
      timestamp: '2025-02-18T13:20:00',
      acknowledged: false,
    },
    {
      id: 'alert-3',
      type: 'info',
      message: 'Scheduled maintenance due in 2 days',
      timestamp: '2025-02-18T13:25:00',
      acknowledged: true,
    },
  ]);

  const [metrics, setMetrics] = React.useState<ResourceMetric[]>([
    {
      name: 'Water Usage',
      type: 'water',
      value: 75.5,
      unit: 'L/h',
      trend: 'up',
      status: 'normal',
    },
    {
      name: 'Power Consumption',
      type: 'energy',
      value: 8.2,
      unit: 'kW',
      trend: 'down',
      status: 'warning',
    },
    {
      name: 'Average Temperature',
      type: 'temperature',
      value: 23.5,
      unit: '°C',
      trend: 'stable',
      status: 'normal',
    },
    {
      name: 'CO2 Level',
      type: 'co2',
      value: 850,
      unit: 'ppm',
      trend: 'up',
      status: 'warning',
    },
    {
      name: 'Light Intensity',
      type: 'light',
      value: 22000,
      unit: 'lux',
      trend: 'stable',
      status: 'normal',
    },
  ]);

  const performanceData = [
    { time: '00:00', energy: 7.2, water: 65, temperature: 22 },
    { time: '04:00', energy: 6.8, water: 70, temperature: 21 },
    { time: '08:00', energy: 8.5, water: 85, temperature: 23 },
    { time: '12:00', energy: 9.2, water: 80, temperature: 24 },
    { time: '16:00', energy: 8.8, water: 75, temperature: 23 },
    { time: '20:00', energy: 7.5, water: 70, temperature: 22 },
  ];

  const resourceDistribution = [
    { name: 'Zone 1', value: 35 },
    { name: 'Zone 2', value: 25 },
    { name: 'Zone 3', value: 40 },
  ];

  const COLORS = ['#2ecc71', '#3498db', '#e74c3c'];

  const getMetricIcon = (type: ResourceMetric['type']) => {
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

  const getTrendIcon = (trend: ResourceMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      case 'stable':
        return <TrendingUpIcon color="disabled" />;
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <CheckCircleIcon color="info" />;
    }
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Here you would typically fetch new data
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">System Supervision</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Grid>

      {/* System Status Overview */}
      <Grid item xs={12} md={8}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Grid container spacing={2}>
              {systemStatuses.map((status) => (
                <Grid item xs={12} sm={6} key={status.category}>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body1">{status.category}</Typography>
                      <StatusChip
                        label={status.status}
                        status={status.status}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {status.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(status.timestamp)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Active Alerts */}
      <Grid item xs={12} md={4}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            <List>
              {alerts.map((alert) => (
                <React.Fragment key={alert.id}>
                  <ListItem
                    secondaryAction={
                      !alert.acknowledged && (
                        <Button size="small" variant="outlined">
                          Acknowledge
                        </Button>
                      )
                    }
                  >
                    <ListItemIcon>{getAlertIcon(alert.type)}</ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={formatTimestamp(alert.timestamp)}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Resource Metrics */}
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resource Metrics
            </Typography>
            <Grid container spacing={2}>
              {metrics.map((metric) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={metric.name}>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        {getMetricIcon(metric.type)}
                        <Typography variant="body2">{metric.name}</Typography>
                      </Box>
                      {getTrendIcon(metric.trend)}
                    </Box>
                    <Typography variant="h5" sx={{ my: 1 }}>
                      {metric.value} {metric.unit}
                    </Typography>
                    <StatusChip
                      label={metric.status}
                      status={metric.status}
                      size="small"
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Performance Charts */}
      <Grid item xs={12} md={8}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Trends
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
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
                    dataKey="time"
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
                    dataKey="energy"
                    name="Energy (kW)"
                    stroke="#2ecc71"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="water"
                    name="Water (L/h)"
                    stroke="#3498db"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temp (°C)"
                    stroke="#e74c3c"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Resource Distribution */}
      <Grid item xs={12} md={4}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resource Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resourceDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 34, 64, 0.95)',
                      border: '1px solid rgba(46, 204, 113, 0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default SupervisionDashboard;
