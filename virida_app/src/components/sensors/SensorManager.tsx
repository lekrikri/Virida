import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ScienceIcon from '@mui/icons-material/Science';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  color: '#121A21',
}));

interface Sensor {
  id: number;
  name: string;
  type: string;
  location: string;
  value: number;
  unit: string;
  batteryLevel: number;
  signalStrength: number;
  status: string;
  lastCalibration: string;
  accuracy: number;
}

const SensorManager: React.FC = () => {
  const [sensors, setSensors] = React.useState<Sensor[]>([
    {
      id: 1,
      name: 'Temp-01',
      type: 'temperature',
      location: 'Zone A',
      value: 23.5,
      unit: '°C',
      batteryLevel: 85,
      signalStrength: 92,
      status: 'active',
      lastCalibration: '2025-01-15',
      accuracy: 98,
    },
    {
      id: 2,
      name: 'Hum-01',
      type: 'humidity',
      location: 'Zone A',
      value: 65,
      unit: '%',
      batteryLevel: 72,
      signalStrength: 88,
      status: 'active',
      lastCalibration: '2025-01-15',
      accuracy: 95,
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingSensor, setEditingSensor] = React.useState<Sensor | null>(null);
  const [newSensor, setNewSensor] = React.useState<Partial<Sensor>>({
    type: 'temperature',
    status: 'active',
  });

  const sensorTypes = {
    temperature: {
      icon: <ThermostatIcon />,
      color: '#e74c3c',
      units: ['°C', '°F'],
    },
    humidity: {
      icon: <OpacityIcon />,
      color: '#3498db',
      units: ['%'],
    },
    light: {
      icon: <WbSunnyIcon />,
      color: '#f1c40f',
      units: ['lux', '%'],
    },
    ph: {
      icon: <ScienceIcon />,
      color: '#9b59b6',
      units: ['pH'],
    },
  };

  const locations = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#2ecc71';
      case 'warning':
        return '#f1c40f';
      case 'error':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 60) return '#2ecc71';
    if (level >= 30) return '#f1c40f';
    return '#e74c3c';
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return '#2ecc71';
    if (strength >= 50) return '#f1c40f';
    return '#e74c3c';
  };

  const handleAddSensor = () => {
    setEditingSensor(null);
    setNewSensor({
      type: 'temperature',
      status: 'active',
    });
    setOpenDialog(true);
  };

  const handleEditSensor = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setNewSensor(sensor);
    setOpenDialog(true);
  };

  const handleDeleteSensor = (id: number) => {
    setSensors(sensors.filter((sensor) => sensor.id !== id));
  };

  const handleCalibrateSensor = (id: number) => {
    setSensors(
      sensors.map((sensor) =>
        sensor.id === id
          ? {
              ...sensor,
              lastCalibration: new Date().toISOString().split('T')[0],
              accuracy: 100,
            }
          : sensor
      )
    );
  };

  const handleSaveSensor = () => {
    if (editingSensor) {
      setSensors(
        sensors.map((s) =>
          s.id === editingSensor.id ? { ...s, ...newSensor } as Sensor : s
        )
      );
    } else {
      setSensors([
        ...sensors,
        {
          ...newSensor,
          id: sensors.length + 1,
          batteryLevel: 100,
          signalStrength: 100,
          accuracy: 100,
          lastCalibration: new Date().toISOString().split('T')[0],
        } as Sensor,
      ]);
    }
    setOpenDialog(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Sensor Management</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddSensor}
              >
                Add Sensor
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Sensor</StyledTableCell>
                    <StyledTableCell>Location</StyledTableCell>
                    <StyledTableCell>Value</StyledTableCell>
                    <StyledTableCell>Battery</StyledTableCell>
                    <StyledTableCell>Signal</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sensors.map((sensor) => (
                    <TableRow key={sensor.id}>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {sensorTypes[sensor.type as keyof typeof sensorTypes].icon}
                          <Box>
                            <Typography variant="body2">{sensor.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {sensor.type}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>{sensor.location}</StyledTableCell>
                      <StyledTableCell>
                        <Typography variant="body2">
                          {sensor.value} {sensor.unit}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={sensor.accuracy}
                          sx={{
                            mt: 0.5,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#2ecc71',
                            },
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BatteryChargingFullIcon
                            sx={{ color: getBatteryColor(sensor.batteryLevel) }}
                          />
                          {sensor.batteryLevel}%
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <SignalCellularAltIcon
                            sx={{ color: getSignalColor(sensor.signalStrength) }}
                          />
                          {sensor.signalStrength}%
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={sensor.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(sensor.status)}20`,
                            color: getStatusColor(sensor.status),
                            borderColor: getStatusColor(sensor.status),
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Tooltip title="Calibrate">
                          <IconButton
                            size="small"
                            onClick={() => handleCalibrateSensor(sensor.id)}
                            sx={{ color: 'primary.main' }}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => handleEditSensor(sensor)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSensor(sensor.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            background: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle>
          {editingSensor ? 'Edit Sensor' : 'Add New Sensor'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Sensor Name"
              value={newSensor.name || ''}
              onChange={(e) =>
                setNewSensor((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newSensor.type || 'temperature'}
                label="Type"
                onChange={(e) =>
                  setNewSensor((prev) => ({
                    ...prev,
                    type: e.target.value,
                    unit: sensorTypes[e.target.value as keyof typeof sensorTypes].units[0],
                  }))
                }
              >
                {Object.entries(sensorTypes).map(([type, data]) => (
                  <MenuItem key={type} value={type}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {data.icon}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={newSensor.location || ''}
                label="Location"
                onChange={(e) =>
                  setNewSensor((prev) => ({ ...prev, location: e.target.value }))
                }
              >
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={newSensor.unit || ''}
                label="Unit"
                onChange={(e) =>
                  setNewSensor((prev) => ({ ...prev, unit: e.target.value }))
                }
              >
                {newSensor.type &&
                  sensorTypes[newSensor.type as keyof typeof sensorTypes].units.map(
                    (unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    )
                  )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSensor} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default SensorManager;
