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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ScienceIcon from '@mui/icons-material/Science';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
  color: theme.palette.text.secondary,
}));

interface AlertRule {
  id: number;
  name: string;
  type: string;
  parameter: string;
  condition: string;
  value: number;
  unit: string;
  priority: string;
  enabled: boolean;
}

const AlertManager: React.FC = () => {
  const [rules, setRules] = React.useState<AlertRule[]>([
    {
      id: 1,
      name: 'High Temperature Alert',
      type: 'temperature',
      parameter: 'temperature',
      condition: '>',
      value: 30,
      unit: '°C',
      priority: 'high',
      enabled: true,
    },
    {
      id: 2,
      name: 'Low Humidity Warning',
      type: 'humidity',
      parameter: 'humidity',
      condition: '<',
      value: 40,
      unit: '%',
      priority: 'medium',
      enabled: true,
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<AlertRule | null>(null);
  const [newRule, setNewRule] = React.useState<Partial<AlertRule>>({
    type: 'temperature',
    condition: '>',
    priority: 'medium',
    enabled: true,
  });

  const parameters = {
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

  const handleAddRule = () => {
    setEditingRule(null);
    setNewRule({
      type: 'temperature',
      condition: '>',
      priority: 'medium',
      enabled: true,
    });
    setOpenDialog(true);
  };

  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setOpenDialog(true);
  };

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleSaveRule = () => {
    if (editingRule) {
      setRules(
        rules.map((rule) =>
          rule.id === editingRule.id ? { ...rule, ...newRule } as AlertRule : rule
        )
      );
    } else {
      setRules([
        ...rules,
        {
          ...newRule,
          id: rules.length + 1,
        } as AlertRule,
      ]);
    }
    setOpenDialog(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f1c40f';
      case 'low':
        return '#2ecc71';
      default:
        return '#95a5a6';
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Alert Rules</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddRule}
              >
                Add Rule
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell>Parameter</StyledTableCell>
                    <StyledTableCell>Condition</StyledTableCell>
                    <StyledTableCell>Priority</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <StyledTableCell>{rule.name}</StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {parameters[rule.type as keyof typeof parameters].icon}
                          <span>
                            {rule.value} {rule.unit}
                          </span>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>{`${rule.condition} ${rule.value}${rule.unit}`}</StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={rule.priority}
                          size="small"
                          sx={{
                            backgroundColor: `${getPriorityColor(rule.priority)}20`,
                            color: getPriorityColor(rule.priority),
                            borderColor: getPriorityColor(rule.priority),
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Switch
                          checked={rule.enabled}
                          onChange={() =>
                            setRules(
                              rules.map((r) =>
                                r.id === rule.id
                                  ? { ...r, enabled: !r.enabled }
                                  : r
                              )
                            )
                          }
                          color="primary"
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditRule(rule)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRule(rule.id)}
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
          {editingRule ? 'Edit Alert Rule' : 'Add New Alert Rule'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Rule Name"
              value={newRule.name || ''}
              onChange={(e) =>
                setNewRule((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Parameter</InputLabel>
              <Select
                value={newRule.type || 'temperature'}
                label="Parameter"
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <MenuItem value="temperature">Temperature</MenuItem>
                <MenuItem value="humidity">Humidity</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="ph">pH</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2}>
              <FormControl sx={{ width: 120 }}>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={newRule.condition || '>'}
                  label="Condition"
                  onChange={(e) =>
                    setNewRule((prev) => ({ ...prev, condition: e.target.value }))
                  }
                >
                  <MenuItem value=">">Above</MenuItem>
                  <MenuItem value="<">Below</MenuItem>
                  <MenuItem value="=">Equals</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Value"
                type="number"
                value={newRule.value || ''}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    value: Number(e.target.value),
                  }))
                }
                sx={{ flex: 1 }}
              />

              <FormControl sx={{ width: 120 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={newRule.unit || '°C'}
                  label="Unit"
                  onChange={(e) =>
                    setNewRule((prev) => ({ ...prev, unit: e.target.value }))
                  }
                >
                  {parameters[newRule.type as keyof typeof parameters]?.units.map(
                    (unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newRule.priority || 'medium'}
                label="Priority"
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, priority: e.target.value }))
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
          <Button onClick={handleSaveRule} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AlertManager;
