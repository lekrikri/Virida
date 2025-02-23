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
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
  color: theme.palette.text.secondary,
}));

interface MaintenanceTask {
  id: number;
  name: string;
  system: string;
  priority: string;
  frequency: string;
  lastMaintenance: string;
  nextMaintenance: string;
  status: string;
  healthScore: number;
  description: string;
}

const MaintenanceScheduler: React.FC = () => {
  const [tasks, setTasks] = React.useState<MaintenanceTask[]>([
    {
      id: 1,
      name: 'Sensor Calibration',
      system: 'Sensors',
      priority: 'high',
      frequency: 'monthly',
      lastMaintenance: '2025-01-18',
      nextMaintenance: '2025-02-18',
      status: 'due',
      healthScore: 75,
      description: 'Calibrate all sensors for optimal performance',
    },
    {
      id: 2,
      name: 'Filter Replacement',
      system: 'Irrigation',
      priority: 'medium',
      frequency: 'quarterly',
      lastMaintenance: '2024-12-18',
      nextMaintenance: '2025-03-18',
      status: 'scheduled',
      healthScore: 85,
      description: 'Replace water filtration system filters',
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<MaintenanceTask | null>(null);
  const [newTask, setNewTask] = React.useState<Partial<MaintenanceTask>>({
    system: 'Sensors',
    priority: 'medium',
    frequency: 'monthly',
    status: 'scheduled',
  });

  const systems = [
    'Sensors',
    'Irrigation',
    'Lighting',
    'Climate Control',
    'Ventilation',
  ];

  const frequencies = [
    'daily',
    'weekly',
    'bi-weekly',
    'monthly',
    'quarterly',
    'semi-annual',
    'annual',
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#2ecc71';
      case 'due':
        return '#e74c3c';
      case 'scheduled':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return '#2ecc71';
    if (score >= 70) return '#f1c40f';
    return '#e74c3c';
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setNewTask({
      system: 'Sensors',
      priority: 'medium',
      frequency: 'monthly',
      status: 'scheduled',
    });
    setOpenDialog(true);
  };

  const handleEditTask = (task: MaintenanceTask) => {
    setEditingTask(task);
    setNewTask(task);
    setOpenDialog(true);
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleCompleteTask = (id: number) => {
    const today = new Date().toISOString().split('T')[0];
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: 'completed',
              lastMaintenance: today,
              nextMaintenance: calculateNextMaintenance(today, task.frequency),
              healthScore: 100,
            }
          : task
      )
    );
  };

  const calculateNextMaintenance = (date: string, frequency: string) => {
    const nextDate = new Date(date);
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'semi-annual':
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case 'annual':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    return nextDate.toISOString().split('T')[0];
  };

  const handleSaveTask = () => {
    const today = new Date().toISOString().split('T')[0];
    const task = {
      ...newTask,
      lastMaintenance: today,
      nextMaintenance: calculateNextMaintenance(today, newTask.frequency || 'monthly'),
      healthScore: 100,
    } as MaintenanceTask;

    if (editingTask) {
      setTasks(
        tasks.map((t) => (t.id === editingTask.id ? task : t))
      );
    } else {
      setTasks([
        ...tasks,
        {
          ...task,
          id: tasks.length + 1,
        },
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
              <Typography variant="h6">Maintenance Schedule</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddTask}
              >
                Add Task
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Task</StyledTableCell>
                    <StyledTableCell>System</StyledTableCell>
                    <StyledTableCell>Next Maintenance</StyledTableCell>
                    <StyledTableCell>Health Score</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BuildIcon sx={{ color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2">{task.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.frequency}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>{task.system}</StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon fontSize="small" />
                          {task.nextMaintenance}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box width="100%">
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">
                              {task.healthScore}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={task.healthScore}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getHealthColor(task.healthScore),
                              },
                            }}
                          />
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={task.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(task.status)}20`,
                            color: getStatusColor(task.status),
                            borderColor: getStatusColor(task.status),
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Tooltip title="Complete Task">
                          <IconButton
                            size="small"
                            onClick={() => handleCompleteTask(task.id)}
                            sx={{ color: '#2ecc71' }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => handleEditTask(task)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTask(task.id)}
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
            background: 'rgba(17, 34, 64, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(46, 204, 113, 0.1)',
          },
        }}
      >
        <DialogTitle>
          {editingTask ? 'Edit Maintenance Task' : 'Add New Maintenance Task'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Task Name"
              value={newTask.name || ''}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={newTask.description || ''}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
              multiline
              rows={3}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>System</InputLabel>
              <Select
                value={newTask.system || 'Sensors'}
                label="System"
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, system: e.target.value }))
                }
              >
                {systems.map((system) => (
                  <MenuItem key={system} value={system}>
                    {system}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newTask.frequency || 'monthly'}
                label="Frequency"
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, frequency: e.target.value }))
                }
              >
                {frequencies.map((freq) => (
                  <MenuItem key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority || 'medium'}
                label="Priority"
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, priority: e.target.value }))
                }
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default MaintenanceScheduler;
