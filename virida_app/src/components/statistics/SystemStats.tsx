import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import OpacityIcon from '@mui/icons-material/Opacity';
import BoltIcon from '@mui/icons-material/Bolt';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  height: '100%',
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ResourceProgress = styled(Box)(({ theme }) => ({
  width: '100%',
  '& .MuiLinearProgress-root': {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const COLORS = ['#27ae60', '#2ecc71', '#3498db', '#e74c3c'];

const SystemStats: React.FC = () => {
  // Exemple de données pour les statistiques
  const resourceUsage = [
    { name: 'Water', value: 75, icon: <OpacityIcon />, color: '#3498db' },
    { name: 'Energy', value: 60, icon: <BoltIcon />, color: '#f1c40f' },
    { name: 'Temperature', value: 85, icon: <ThermostatIcon />, color: '#e74c3c' },
    { name: 'Light', value: 45, icon: <WbSunnyIcon />, color: '#f39c12' },
  ];

  const weeklyData = [
    { name: 'Mon', water: 30, energy: 40, temp: 25, light: 60 },
    { name: 'Tue', water: 45, energy: 35, temp: 28, light: 65 },
    { name: 'Wed', water: 35, energy: 45, temp: 22, light: 55 },
    { name: 'Thu', water: 40, energy: 50, temp: 24, light: 70 },
    { name: 'Fri', water: 35, energy: 45, temp: 26, light: 60 },
    { name: 'Sat', water: 30, energy: 40, temp: 23, light: 50 },
    { name: 'Sun', water: 25, energy: 35, temp: 25, light: 55 },
  ];

  const systemHealth = [
    { name: 'Optimal', value: 65 },
    { name: 'Warning', value: 25 },
    { name: 'Critical', value: 10 },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weekly Resource Usage
            </Typography>
            <Box height={300}>
              <ResponsiveContainer>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Bar dataKey="water" fill="#3498db" stackId="a" />
                  <Bar dataKey="energy" fill="#f1c40f" stackId="a" />
                  <Bar dataKey="temp" fill="#e74c3c" stackId="a" />
                  <Bar dataKey="light" fill="#f39c12" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={systemHealth}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {systemHealth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box display="flex" justifyContent="center" gap={2} mt={2}>
              {systemHealth.map((entry, index) => (
                <Box key={entry.name} display="flex" alignItems="center" gap={1}>
                  <Box
                    width={12}
                    height={12}
                    borderRadius="50%"
                    bgcolor={COLORS[index % COLORS.length]}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {entry.name} ({entry.value}%)
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Resource Usage
            </Typography>
            <Grid container spacing={3}>
              {resourceUsage.map((resource) => (
                <Grid item xs={12} sm={6} md={3} key={resource.name}>
                  <StatBox>
                    <Box color={resource.color}>{resource.icon}</Box>
                    <ResourceProgress>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">{resource.name}</Typography>
                        <Typography variant="body2">{resource.value}%</Typography>
                      </Box>
                      <Tooltip title={`${resource.value}% used`}>
                        <LinearProgress
                          variant="determinate"
                          value={resource.value}
                          sx={{
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: resource.color,
                            },
                          }}
                        />
                      </Tooltip>
                    </ResourceProgress>
                  </StatBox>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default SystemStats;
