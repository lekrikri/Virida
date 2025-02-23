import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  height: '100%',
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  height: '100%',
}));

const PerformanceDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('24h');

  const performanceData = [
    { time: '00:00', energy: 45, temperature: 22, humidity: 65, light: 0 },
    { time: '04:00', energy: 42, temperature: 21, humidity: 68, light: 10 },
    { time: '08:00', energy: 55, temperature: 23, humidity: 70, light: 80 },
    { time: '12:00', energy: 70, temperature: 25, humidity: 62, light: 100 },
    { time: '16:00', energy: 65, temperature: 24, humidity: 64, light: 60 },
    { time: '20:00', energy: 50, temperature: 23, humidity: 66, light: 20 },
    { time: '23:59', energy: 45, temperature: 22, humidity: 65, light: 0 },
  ];

  const resourceUsage = [
    { name: 'Lighting', value: 35, color: '#f1c40f' },
    { name: 'Climate Control', value: 25, color: '#e74c3c' },
    { name: 'Irrigation', value: 20, color: '#3498db' },
    { name: 'Ventilation', value: 15, color: '#2ecc71' },
    { name: 'Other', value: 5, color: '#95a5a6' },
  ];

  const metrics = [
    {
      title: 'Energy Efficiency',
      value: 92,
      unit: '%',
      icon: <BoltIcon sx={{ color: '#f1c40f' }} />,
      color: '#f1c40f',
    },
    {
      title: 'Water Usage',
      value: 85,
      unit: '%',
      icon: <OpacityIcon sx={{ color: '#3498db' }} />,
      color: '#3498db',
    },
    {
      title: 'Plant Health',
      value: 95,
      unit: '%',
      icon: <LocalFloristIcon sx={{ color: '#2ecc71' }} />,
      color: '#2ecc71',
    },
    {
      title: 'System Uptime',
      value: 99.9,
      unit: '%',
      icon: <TimelineIcon sx={{ color: '#9b59b6' }} />,
      color: '#9b59b6',
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      {metrics.map((metric) => (
        <Grid item xs={12} sm={6} md={3} key={metric.title}>
          <MetricCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  {metric.title}
                </Typography>
                {metric.icon}
              </Box>
              <Typography variant="h4" gutterBottom>
                {metric.value}
                <Typography component="span" variant="body2" color="text.secondary">
                  {metric.unit}
                </Typography>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metric.value}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: metric.color,
                  },
                }}
              />
            </CardContent>
          </MetricCard>
        </Grid>
      ))}

      {/* Performance Chart */}
      <Grid item xs={12} md={8}>
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">System Performance</Typography>
              <Box display="flex" gap={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <MenuItem value="24h">Last 24 Hours</MenuItem>
                    <MenuItem value="7d">Last 7 Days</MenuItem>
                    <MenuItem value="30d">Last 30 Days</MenuItem>
                  </Select>
                </FormControl>
                <IconButton size="small" sx={{ color: 'primary.main' }}>
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="energy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f1c40f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f1c40f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="temperature" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="humidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3498db" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3498db" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="light" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2ecc71" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="time"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(17, 34, 64, 0.95)',
                      border: '1px solid rgba(46, 204, 113, 0.1)',
                      borderRadius: '4px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke="#f1c40f"
                    fillOpacity={1}
                    fill="url(#energy)"
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke="#e74c3c"
                    fillOpacity={1}
                    fill="url(#temperature)"
                  />
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3498db"
                    fillOpacity={1}
                    fill="url(#humidity)"
                  />
                  <Area
                    type="monotone"
                    dataKey="light"
                    stroke="#2ecc71"
                    fillOpacity={1}
                    fill="url(#light)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Resource Usage */}
      <Grid item xs={12} md={4}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resource Usage
            </Typography>
            <Box height={300} display="flex" justifyContent="center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resourceUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(17, 34, 64, 0.95)',
                      border: '1px solid rgba(46, 204, 113, 0.1)',
                      borderRadius: '4px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box mt={2}>
              {resourceUsage.map((resource) => (
                <Box
                  key={resource.name}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      width={12}
                      height={12}
                      borderRadius="50%"
                      bgcolor={resource.color}
                    />
                    <Typography variant="body2">{resource.name}</Typography>
                  </Box>
                  <Typography variant="body2">{resource.value}%</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default PerformanceDashboard;
