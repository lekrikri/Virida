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
  ListItemSecondaryAction,
  Tooltip,
  Paper,
  Divider,
  Alert,
  styled,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  dependencies: string[];
  estimatedDuration: number;
  zone?: string;
  resources: string[];
  progress: number;
  tags: string[];
}

interface Resource {
  id: string;
  name: string;
  type: string;
  availability: number;
}

const AdvancedTaskScheduler: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Sensor Calibration',
      description: 'Calibrate all temperature sensors in Zone 1',
      priority: 'high',
      status: 'pending',
      assignee: 'tech@virida.com',
      dueDate: '2025-02-19T10:00:00',
      dependencies: [],
      estimatedDuration: 60,
      zone: 'Zone 1',
      resources: ['calibration-kit', 'tablet'],
      progress: 0,
      tags: ['maintenance', 'sensors'],
    },
    {
      id: '2',
      title: 'Filter Replacement',
      description: 'Replace water filters in all zones',
      priority: 'medium',
      status: 'in_progress',
      assignee: 'tech@virida.com',
      dueDate: '2025-02-19T14:00:00',
      dependencies: [],
      estimatedDuration: 120,
      resources: ['filter-kit', 'tools'],
      progress: 30,
      tags: ['maintenance', 'water-system'],
    },
    {
      id: '3',
      title: 'Nutrient Solution Update',
      description: 'Update nutrient mix according to new recipe',
      priority: 'high',
      status: 'pending',
      assignee: 'operator@virida.com',
      dueDate: '2025-02-19T16:00:00',
      dependencies: ['2'],
      estimatedDuration: 45,
      resources: ['nutrients', 'testing-kit'],
      progress: 0,
      tags: ['nutrients', 'recipe'],
    },
  ]);

  const [resources] = useState<Resource[]>([
    { id: 'calibration-kit', name: 'Calibration Kit', type: 'equipment', availability: 1 },
    { id: 'tablet', name: 'Tablet Device', type: 'device', availability: 3 },
    { id: 'filter-kit', name: 'Filter Kit', type: 'equipment', availability: 2 },
    { id: 'tools', name: 'Tool Set', type: 'equipment', availability: 4 },
    { id: 'nutrients', name: 'Nutrient Stock', type: 'consumable', availability: 100 },
    { id: 'testing-kit', name: 'Testing Kit', type: 'equipment', availability: 2 },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  useEffect(() => {
    // Check for scheduling conflicts
    const newConflicts: string[] = [];
    
    tasks.forEach(task => {
      // Check resource availability
      const resourceConflicts = checkResourceConflicts(task);
      if (resourceConflicts.length > 0) {
        newConflicts.push(
          `Task "${task.title}" has resource conflicts: ${resourceConflicts.join(', ')}`
        );
      }

      // Check dependency conflicts
      const dependencyConflicts = checkDependencyConflicts(task);
      if (dependencyConflicts) {
        newConflicts.push(dependencyConflicts);
      }
    });

    setConflicts(newConflicts);
  }, [tasks]);

  const checkResourceConflicts = (task: Task): string[] => {
    const conflicts: string[] = [];
    task.resources.forEach(resourceId => {
      const resource = resources.find(r => r.id === resourceId);
      if (resource && resource.availability < 1) {
        conflicts.push(resource.name);
      }
    });
    return conflicts;
  };

  const checkDependencyConflicts = (task: Task): string | null => {
    if (task.dependencies.length === 0) return null;

    const dependentTasks = tasks.filter(t => task.dependencies.includes(t.id));
    const unfinishedDependencies = dependentTasks.filter(
      t => t.status !== 'completed'
    );

    if (unfinishedDependencies.length > 0) {
      return `Task "${task.title}" is waiting for: ${unfinishedDependencies
        .map(t => t.title)
        .join(', ')}`;
    }

    return null;
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setOpenDialog(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setOpenDialog(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id ? { ...task, ...taskData } : task
      ));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        assignee: '',
        dueDate: new Date().toISOString(),
        dependencies: [],
        estimatedDuration: 0,
        resources: [],
        progress: 0,
        tags: [],
        ...taskData,
      };
      setTasks([...tasks, newTask]);
    }
    setOpenDialog(false);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f1c40f';
      case 'low':
        return '#2ecc71';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '#2ecc71';
      case 'in_progress':
        return '#3498db';
      case 'blocked':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Task Scheduler</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
          >
            New Task
          </Button>
        </Box>
      </Grid>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Scheduling Conflicts:</Typography>
            <List dense>
              {conflicts.map((conflict, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <PriorityHighIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={conflict} />
                </ListItem>
              ))}
            </List>
          </Alert>
        </Grid>
      )}

      {/* Task Timeline */}
      <Grid item xs={12} md={8}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Task Timeline
            </Typography>
            <Timeline position="alternate">
              {tasks
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((task) => (
                  <TimelineItem key={task.id}>
                    <TimelineSeparator>
                      <TimelineDot
                        sx={{
                          backgroundColor: getStatusColor(task.status),
                        }}
                      >
                        <AssignmentIcon />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="h6">{task.title}</Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              backgroundColor: getPriorityColor(task.priority),
                              color: '#fff',
                            }}
                          />
                        </Box>
                        <Typography color="text.secondary">
                          {task.description}
                        </Typography>
                        <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                          {task.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        <Box
                          mt={2}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Chip
                            icon={<GroupIcon />}
                            label={task.assignee}
                            size="small"
                          />
                          <Chip
                            icon={<ScheduleIcon />}
                            label={new Date(task.dueDate).toLocaleString()}
                            size="small"
                          />
                        </Box>
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))}
            </Timeline>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Resource Allocation */}
      <Grid item xs={12} md={4}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resource Allocation
            </Typography>
            <List>
              {resources.map((resource) => (
                <ListItem key={resource.id}>
                  <ListItemText
                    primary={resource.name}
                    secondary={`Type: ${resource.type}`}
                  />
                  <Chip
                    label={`Available: ${resource.availability}`}
                    color={resource.availability > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* Task Dialog */}
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
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'New Task'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Task Title"
              defaultValue={editingTask?.title}
              fullWidth
            />
            <TextField
              label="Description"
              defaultValue={editingTask?.description}
              multiline
              rows={3}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    defaultValue={editingTask?.priority || 'medium'}
                    label="Priority"
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    defaultValue={editingTask?.status || 'pending'}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Assignee"
              defaultValue={editingTask?.assignee}
              fullWidth
            />
            <TextField
              label="Due Date"
              type="datetime-local"
              defaultValue={editingTask?.dueDate.slice(0, 16)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Dependencies</InputLabel>
              <Select
                multiple
                defaultValue={editingTask?.dependencies || []}
                label="Dependencies"
                renderValue={(selected) => (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={tasks.find(t => t.id === value)?.title || value}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {tasks
                  .filter(t => t.id !== editingTask?.id)
                  .map((task) => (
                    <MenuItem key={task.id} value={task.id}>
                      {task.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Resources</InputLabel>
              <Select
                multiple
                defaultValue={editingTask?.resources || []}
                label="Resources"
                renderValue={(selected) => (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={resources.find(r => r.id === value)?.name || value}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {resources.map((resource) => (
                  <MenuItem key={resource.id} value={resource.id}>
                    {resource.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Tags (comma-separated)"
              defaultValue={editingTask?.tags.join(', ')}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleSaveTask({})}
            variant="contained"
            color="primary"
          >
            Save Task
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AdvancedTaskScheduler;
