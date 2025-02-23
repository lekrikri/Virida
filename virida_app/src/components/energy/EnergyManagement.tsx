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
  Switch,
  Slider,
  Tooltip,
  styled,
} from '@mui/material';
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
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterIcon from '@mui/icons-material/Water';
import RefreshIcon from '@mui/icons-material/Refresh';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SaveIcon from '@mui/icons-material/Save';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  height: '100%',
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const EnergyManagement: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoMode, setAutoMode] = useState(true);
  const [energyData, setEnergyData] = useState({
    currentConsumption: 45.2,
    solarProduction: 32.8,
    gridConsumption: 12.4,
    batteryLevel: 85,
    batteryCharging: true,
    savings: 28,
    distribution: [
      { name: 'Lighting', value: 35 },
      { name: 'Climate Control', value: 25 },
      { name: 'Irrigation', value: 20 },
      { name: 'Ventilation', value: 15 },
      { name: 'Monitoring', value: 5 },
    ],
  });

  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize historical data
  useEffect(() => {
    const generateData = () => {
      const baseConsumption = 40;
      const baseSolar = 25;
      return Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString(),
        consumption: baseConsumption + Math.random() * 10,
        solar: (baseSolar + Math.random() * 15) * (i > 6 && i < 18 ? 1 : 0.1), // Day/night cycle
        grid: Math.max(0, (baseConsumption + Math.random() * 10) - (baseSolar + Math.random() * 15)),
      }));
    };
    setHistoricalData(generateData());
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update current metrics
      setEnergyData(prev => ({
        ...prev,
        currentConsumption: Math.max(0, prev.currentConsumption + (Math.random() - 0.5) * 2),
        solarProduction: Math.max(0, prev.solarProduction + (Math.random() - 0.5) * 1.5),
        gridConsumption: Math.max(0, prev.gridConsumption + (Math.random() - 0.5)),
        batteryLevel: Math.min(100, Math.max(0, prev.batteryLevel + (Math.random() - 0.5) * 2)),
      }));

      // Update historical data
      setHistoricalData(prev => [
        ...prev.slice(1),
        {
          time: new Date().toLocaleTimeString(),
          consumption: energyData.currentConsumption,
          solar: energyData.solarProduction,
          grid: energyData.gridConsumption,
        },
      ]);

      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [energyData]);

  const COLORS = ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f', '#9b59b6'];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Energy Management</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl variant="outlined" size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
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
        {/* Current Metrics */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>Real-time Energy Metrics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ElectricBoltIcon />
                        <Typography>Consumption</Typography>
                      </Box>
                      <Typography variant="h4">
                        {energyData.currentConsumption.toFixed(1)} kW
                      </Typography>
                    </Box>
                  </MetricCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SolarPowerIcon />
                        <Typography>Solar</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ color: '#2ecc71' }}>
                        {energyData.solarProduction.toFixed(1)} kW
                      </Typography>
                    </Box>
                  </MetricCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ElectricBoltIcon />
                        <Typography>Grid</Typography>
                      </Box>
                      <Typography variant="h4" sx={{ color: '#e74c3c' }}>
                        {energyData.gridConsumption.toFixed(1)} kW
                      </Typography>
                    </Box>
                  </MetricCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BatteryChargingFullIcon />
                        <Typography>Battery</Typography>
                      </Box>
                      <Typography variant="h4">
                        {energyData.batteryLevel}%
                      </Typography>
                      <Chip
                        label={energyData.batteryCharging ? 'Charging' : 'Discharging'}
                        color={energyData.batteryCharging ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </MetricCard>
                </Grid>
              </Grid>

              {/* Energy Distribution Chart */}
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>Energy Distribution</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={energyData.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {energyData.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(17, 34, 64, 0.95)',
                          border: '1px solid rgba(46, 204, 113, 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Energy Controls */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>Energy Controls</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography>Automatic Mode</Typography>
                <Switch
                  checked={autoMode}
                  onChange={(e) => setAutoMode(e.target.checked)}
                  color="primary"
                />
              </Box>
              <Box mb={3}>
                <Typography gutterBottom>Lighting Intensity</Typography>
                <Slider
                  defaultValue={70}
                  disabled={autoMode}
                  marks
                  step={10}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Box mb={3}>
                <Typography gutterBottom>Climate Control</Typography>
                <Slider
                  defaultValue={65}
                  disabled={autoMode}
                  marks
                  step={10}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Box mb={3}>
                <Typography gutterBottom>Battery Usage</Typography>
                <Slider
                  defaultValue={80}
                  disabled={autoMode}
                  marks
                  step={10}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={autoMode}
                startIcon={<SaveIcon />}
              >
                Save Settings
              </Button>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Historical Chart */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>Energy Consumption History</Typography>
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
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 34, 64, 0.95)',
                        border: '1px solid rgba(46, 204, 113, 0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="consumption"
                      name="Total Consumption (kW)"
                      stroke="#e74c3c"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="solar"
                      name="Solar Production (kW)"
                      stroke="#2ecc71"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="grid"
                      name="Grid Consumption (kW)"
                      stroke="#3498db"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnergyManagement;
