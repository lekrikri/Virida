import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Paper,
  Divider,
  Alert,
  LinearProgress,
  styled,
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import Co2Icon from '@mui/icons-material/Co2';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import BuildIcon from '@mui/icons-material/Build';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockSensors, generateHistoricalData } from '../../data/mockData';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  height: '100%',
}));

interface SensorData {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light';
  zone: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  accuracy: number;
  lastCalibration: string;
  nextCalibration: string;
  maintenanceHistory: {
    date: string;
    action: string;
    technician: string;
  }[];
  history: {
    timestamp: string;
    value: number;
  }[];
}

const EnhancedSensorManager: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize with mock data
  useEffect(() => {
    const initialSensors: SensorData[] = mockSensors.map(sensor => ({
      ...sensor,
      accuracy: 95 + Math.random() * 4,
      lastCalibration: '2025-02-01T10:00:00',
      nextCalibration: '2025-03-01T10:00:00',
      maintenanceHistory: [
        {
          date: '2025-02-01T10:00:00',
          action: 'Calibration',
          technician: 'tech@virida.com',
        },
        {
          date: '2025-01-15T14:30:00',
          action: 'Firmware Update',
          technician: 'tech@virida.com',
        },
      ],
      history: generateHistoricalData(
        sensor.value,
        sensor.type === 'temperature' ? 2 : 
        sensor.type === 'humidity' ? 5 :
        sensor.type === 'co2' ? 50 : 1000,
        24
      ),
    }));
    setSensors(initialSensors);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev =>
        prev.map(sensor => ({
          ...sensor,
          value: sensor.value + (Math.random() - 0.5) * 2,
          history: [
            ...sensor.history.slice(1),
            {
              timestamp: new Date().toISOString(),
              value: sensor.value + (Math.random() - 0.5) * 2,
            },
          ],
        }))
      );
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSensorIcon = (type: SensorData['type']) => {
    switch (type) {
      case 'temperature':
        return <ThermostatIcon />;
      case 'humidity':
        return <OpacityIcon />;
      case 'co2':
        return <Co2Icon />;
      case 'light':
        return <LightModeIcon />;
    }
  };

  const getStatusColor = (status: SensorData['status']) => {
    switch (status) {
      case 'normal':
        return '#2ecc71';
      case 'warning':
        return '#f1c40f';
      case 'critical':
        return '#e74c3c';
    }
  };

  const handleSensorClick = (sensor: SensorData) => {
    setSelectedSensor(sensor);
    setOpenDialog(true);
  };

  const handleCalibrate = (sensorId: string) => {
    setSensors(prev =>
      prev.map(s =>
        s.id === sensorId
          ? {
              ...s,
              accuracy: 98 + Math.random(),
              lastCalibration: new Date().toISOString(),
              nextCalibration: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              maintenanceHistory: [
                {
                  date: new Date().toISOString(),
                  action: 'Calibration',
                  technician: 'tech@virida.com',
                },
                ...s.maintenanceHistory,
              ],
            }
          : s
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Sensor Management</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
            <IconButton onClick={() => setLastUpdate(new Date())}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Grid>

      {/* Sensor Grid */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {sensors.map((sensor) => (
            <Grid item xs={12} sm={6} md={4} key={sensor.id}>
              <StyledCard>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {getSensorIcon(sensor.type)}
                      <Typography variant="h6">{sensor.name}</Typography>
                    </Box>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleSensorClick(sensor)}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Calibrate">
                        <IconButton
                          size="small"
                          onClick={() => handleCalibrate(sensor.id)}
                        >
                          <BuildIcon />
                        </IconButton>
                      </Tooltip>
                      {sensor.status !== 'normal' && (
                        <Tooltip title={`Status: ${sensor.status}`}>
                          <IconButton
                            size="small"
                            sx={{ color: getStatusColor(sensor.status) }}
                          >
                            <WarningIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="h4">
                      {sensor.value.toFixed(1)} {sensor.unit}
                    </Typography>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={1}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Accuracy: {sensor.accuracy.toFixed(1)}%
                      </Typography>
                      <Chip
                        label={sensor.zone}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        }}
                      />
                    </Box>
                  </Box>

                  <Box height={100}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sensor.history.slice(-20)}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2ecc71"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Last Calibration: {formatDate(sensor.lastCalibration)}
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Sensor Details Dialog */}
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
        {selectedSensor && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {getSensorIcon(selectedSensor.type)}
                {selectedSensor.name} Details
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box height={300} mt={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={selectedSensor.history}
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
                      name={`${selectedSensor.type} (${selectedSensor.unit})`}
                      stroke="#2ecc71"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Grid container spacing={3} mt={2}>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Sensor Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Type"
                          secondary={selectedSensor.type}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Zone"
                          secondary={selectedSensor.zone}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Accuracy"
                          secondary={`${selectedSensor.accuracy.toFixed(1)}%`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Status"
                          secondary={selectedSensor.status}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Maintenance History
                    </Typography>
                    <List dense>
                      {selectedSensor.maintenanceHistory.map((record, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <BuildIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={record.action}
                            secondary={`${formatDate(record.date)} by ${
                              record.technician
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button
                onClick={() => handleCalibrate(selectedSensor.id)}
                variant="contained"
                color="primary"
                startIcon={<BuildIcon />}
              >
                Calibrate
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Grid>
  );
};

export default EnhancedSensorManager;
