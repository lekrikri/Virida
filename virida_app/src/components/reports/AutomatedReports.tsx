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
  Switch,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import BoltIcon from '@mui/icons-material/Bolt';
import OpacityIcon from '@mui/icons-material/Opacity';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import NotificationsIcon from '@mui/icons-material/Notifications';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  color: '#121A21',
}));

interface ReportSchedule {
  id: number;
  name: string;
  type: string;
  frequency: string;
  recipients: string[];
  sections: string[];
  format: string;
  enabled: boolean;
  lastGenerated: string;
  nextGeneration: string;
}

const AutomatedReports: React.FC = () => {
  const [schedules, setSchedules] = React.useState<ReportSchedule[]>([
    {
      id: 1,
      name: 'Daily Performance Report',
      type: 'performance',
      frequency: 'daily',
      recipients: ['john@virida.com', 'sarah@virida.com'],
      sections: ['energy', 'water', 'growth'],
      format: 'pdf',
      enabled: true,
      lastGenerated: '2025-02-18T08:00:00',
      nextGeneration: '2025-02-19T08:00:00',
    },
    {
      id: 2,
      name: 'Weekly Maintenance Summary',
      type: 'maintenance',
      frequency: 'weekly',
      recipients: ['maintenance@virida.com'],
      sections: ['tasks', 'issues', 'calibration'],
      format: 'excel',
      enabled: true,
      lastGenerated: '2025-02-11T08:00:00',
      nextGeneration: '2025-02-18T08:00:00',
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState<ReportSchedule | null>(null);
  const [newSchedule, setNewSchedule] = React.useState<Partial<ReportSchedule>>({
    type: 'performance',
    frequency: 'daily',
    sections: [],
    format: 'pdf',
    enabled: true,
  });

  const reportTypes = {
    performance: {
      icon: <BarChartIcon />,
      color: '#3498db',
      sections: ['energy', 'water', 'growth', 'environment'],
    },
    maintenance: {
      icon: <AssessmentIcon />,
      color: '#e74c3c',
      sections: ['tasks', 'issues', 'calibration', 'inventory'],
    },
    alerts: {
      icon: <NotificationsIcon />,
      color: '#f1c40f',
      sections: ['critical', 'warnings', 'resolved', 'trends'],
    },
  };

  const frequencies = [
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'html', label: 'HTML Report' },
  ];

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setNewSchedule({
      type: 'performance',
      frequency: 'daily',
      sections: [],
      format: 'pdf',
      enabled: true,
    });
    setOpenDialog(true);
  };

  const handleEditSchedule = (schedule: ReportSchedule) => {
    setEditingSchedule(schedule);
    setNewSchedule(schedule);
    setOpenDialog(true);
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
  };

  const handleToggleSchedule = (id: number) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  const handleSaveSchedule = () => {
    const now = new Date();
    const nextGen = new Date(now);
    
    switch (newSchedule.frequency) {
      case 'hourly':
        nextGen.setHours(nextGen.getHours() + 1);
        break;
      case 'daily':
        nextGen.setDate(nextGen.getDate() + 1);
        break;
      case 'weekly':
        nextGen.setDate(nextGen.getDate() + 7);
        break;
      case 'monthly':
        nextGen.setMonth(nextGen.getMonth() + 1);
        break;
    }

    if (editingSchedule) {
      setSchedules(
        schedules.map((s) =>
          s.id === editingSchedule.id
            ? {
                ...s,
                ...newSchedule,
                lastGenerated: now.toISOString(),
                nextGeneration: nextGen.toISOString(),
              }
            : s
        )
      );
    } else {
      setSchedules([
        ...schedules,
        {
          ...newSchedule,
          id: schedules.length + 1,
          lastGenerated: now.toISOString(),
          nextGeneration: nextGen.toISOString(),
        } as ReportSchedule,
      ]);
    }
    setOpenDialog(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Automated Reports</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddSchedule}
              >
                New Schedule
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Report</StyledTableCell>
                    <StyledTableCell>Schedule</StyledTableCell>
                    <StyledTableCell>Recipients</StyledTableCell>
                    <StyledTableCell>Last Generated</StyledTableCell>
                    <StyledTableCell>Next Generation</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          {reportTypes[schedule.type as keyof typeof reportTypes].icon}
                          <Box>
                            <Typography variant="body2">{schedule.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {schedule.type}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ScheduleIcon fontSize="small" />
                          {schedule.frequency}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {schedule.recipients.map((email) => (
                            <Chip
                              key={email}
                              label={email}
                              size="small"
                              icon={<EmailIcon />}
                              sx={{
                                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                borderColor: 'primary.main',
                              }}
                            />
                          ))}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        {formatDate(schedule.lastGenerated)}
                      </StyledTableCell>
                      <StyledTableCell>
                        {formatDate(schedule.nextGeneration)}
                      </StyledTableCell>
                      <StyledTableCell>
                        <Switch
                          checked={schedule.enabled}
                          onChange={() => handleToggleSchedule(schedule.id)}
                          color="primary"
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Tooltip title="Download Last Report">
                          <IconButton
                            size="small"
                            sx={{ color: 'primary.main' }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => handleEditSchedule(schedule)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSchedule(schedule.id)}
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle>
          {editingSchedule ? 'Edit Report Schedule' : 'New Report Schedule'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Report Name"
              value={newSchedule.name || ''}
              onChange={(e) =>
                setNewSchedule((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={newSchedule.type || 'performance'}
                label="Report Type"
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    type: e.target.value,
                    sections: [],
                  }))
                }
              >
                {Object.entries(reportTypes).map(([type, data]) => (
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
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newSchedule.frequency || 'daily'}
                label="Frequency"
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    frequency: e.target.value,
                  }))
                }
              >
                {frequencies.map((freq) => (
                  <MenuItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Report Format</InputLabel>
              <Select
                value={newSchedule.format || 'pdf'}
                label="Report Format"
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    format: e.target.value,
                  }))
                }
              >
                {formats.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Sections</InputLabel>
              <Select
                multiple
                value={newSchedule.sections || []}
                label="Sections"
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    sections: e.target.value as string[],
                  }))
                }
                renderValue={(selected) => (
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {newSchedule.type &&
                  reportTypes[
                    newSchedule.type as keyof typeof reportTypes
                  ].sections.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label="Recipients (comma-separated emails)"
              value={newSchedule.recipients?.join(', ') || ''}
              onChange={(e) =>
                setNewSchedule((prev) => ({
                  ...prev,
                  recipients: e.target.value.split(',').map((email) => email.trim()),
                }))
              }
              fullWidth
              helperText="Enter email addresses separated by commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSchedule} variant="contained" color="primary">
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AutomatedReports;
