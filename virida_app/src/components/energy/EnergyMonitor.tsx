import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WaterIcon from '@mui/icons-material/Water';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import InfoIcon from '@mui/icons-material/Info';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  height: '100%',
}));

const EnergySystemCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(2),
}));

interface EnergyData {
  timestamp: string;
  lighting: number;
  cooling: number;
  irrigation: number;
  ventilation: number;
}

interface SystemStatus {
  name: string;
  icon: React.ReactNode;
  power: number;
  efficiency: number;
  color: string;
}

const EnergyMonitor: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('24h');
  
  // Exemple de données de consommation d'énergie
  const energyData: EnergyData[] = [
    { timestamp: '00:00', lighting: 45, cooling: 30, irrigation: 20, ventilation: 25 },
    { timestamp: '04:00', lighting: 20, cooling: 35, irrigation: 25, ventilation: 30 },
    { timestamp: '08:00', lighting: 60, cooling: 45, irrigation: 30, ventilation: 35 },
    { timestamp: '12:00', lighting: 80, cooling: 60, irrigation: 35, ventilation: 40 },
    { timestamp: '16:00', lighting: 65, cooling: 50, irrigation: 30, ventilation: 35 },
    { timestamp: '20:00', lighting: 50, cooling: 40, irrigation: 25, ventilation: 30 },
  ];

  const systems: SystemStatus[] = [
    {
      name: 'Lighting',
      icon: <LightbulbIcon />,
      power: 850,
      efficiency: 92,
      color: '#f1c40f',
    },
    {
      name: 'Cooling',
      icon: <AcUnitIcon />,
      power: 1200,
      efficiency: 85,
      color: '#3498db',
    },
    {
      name: 'Irrigation',
      icon: <WaterIcon />,
      power: 400,
      efficiency: 95,
      color: '#2ecc71',
    },
    {
      name: 'Ventilation',
      icon: <LocalFloristIcon />,
      power: 300,
      efficiency: 88,
      color: '#9b59b6',
    },
  ];

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return '#2ecc71';
    if (efficiency >= 80) return '#f1c40f';
    return '#e74c3c';
  };

  const getTotalConsumption = () => {
    return systems.reduce((total, system) => total + system.power, 0);
  };

  const getRecommendations = (system: SystemStatus) => {
    if (system.efficiency < 90) {
      return [
        'Consider maintenance check',
        'Optimize operation schedule',
        'Check for system updates',
      ];
    }
    return ['System operating at optimal efficiency'];
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Energy Consumption Overview</Typography>
              <FormControl sx={{ minWidth: 120 }}>
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
            </Box>
            <Box height={300}>
              <ResponsiveContainer>
                <AreaChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    label={{ value: 'Power (W)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: 'rgba(17, 34, 64, 0.95)',
                      border: '1px solid rgba(46, 204, 113, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lighting"
                    stackId="1"
                    stroke="#f1c40f"
                    fill="#f1c40f"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="cooling"
                    stackId="1"
                    stroke="#3498db"
                    fill="#3498db"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="irrigation"
                    stackId="1"
                    stroke="#2ecc71"
                    fill="#2ecc71"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="ventilation"
                    stackId="1"
                    stroke="#9b59b6"
                    fill="#9b59b6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        <Grid container spacing={3}>
          {systems.map((system) => (
            <Grid item xs={12} sm={6} md={3} key={system.name}>
              <EnergySystemCard>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Box color={system.color}>{system.icon}</Box>
                  <Typography variant="subtitle1">{system.name}</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Current Power: {system.power}W
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Efficiency: {system.efficiency}%
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Recommendations:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {getRecommendations(system).map((rec, index) => (
                            <li key={index}>
                              <Typography variant="body2">{rec}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    }
                  >
                    <IconButton size="small" sx={{ ml: 'auto' }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Power Usage
                    </Typography>
                    <Typography variant="body2">
                      {system.power}W
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(system.power / getTotalConsumption()) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: system.color,
                      },
                    }}
                  />
                </Box>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Efficiency
                    </Typography>
                    <Typography variant="body2">
                      {system.efficiency}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={system.efficiency}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getEfficiencyColor(system.efficiency),
                      },
                    }}
                  />
                </Box>
              </EnergySystemCard>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default EnergyMonitor;
