import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  color: '#121A21',
}));

interface Schedule {
  id: number;
  plantId: number;
  time: string;
  duration: number;
  days: string[];
  enabled: boolean;
}

const IrrigationSchedule: React.FC = () => {
  const [schedules, setSchedules] = React.useState<Schedule[]>([
    {
      id: 1,
      plantId: 1,
      time: '08:00',
      duration: 15,
      days: ['Mon', 'Wed', 'Fri'],
      enabled: true,
    },
    {
      id: 2,
      plantId: 2,
      time: '16:30',
      duration: 10,
      days: ['Tue', 'Thu', 'Sat'],
      enabled: true,
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState<Schedule | null>(null);
  const [selectedTime, setSelectedTime] = React.useState('08:00');
  const [selectedDuration, setSelectedDuration] = React.useState(15);
  const [selectedDays, setSelectedDays] = React.useState<string[]>(['Mon']);

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setSelectedTime('08:00');
    setSelectedDuration(15);
    setSelectedDays(['Mon']);
    setOpenDialog(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setSelectedTime(schedule.time);
    setSelectedDuration(schedule.duration);
    setSelectedDays(schedule.days);
    setOpenDialog(true);
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
  };

  const handleSaveSchedule = () => {
    if (editingSchedule) {
      setSchedules(
        schedules.map((s) =>
          s.id === editingSchedule.id
            ? {
                ...s,
                time: selectedTime,
                duration: selectedDuration,
                days: selectedDays,
              }
            : s
        )
      );
    } else {
      setSchedules([
        ...schedules,
        {
          id: schedules.length + 1,
          plantId: 1,
          time: selectedTime,
          duration: selectedDuration,
          days: selectedDays,
          enabled: true,
        },
      ]);
    }
    setOpenDialog(false);
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Irrigation Schedule</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSchedule}
          >
            Add Schedule
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Time</StyledTableCell>
                <StyledTableCell>Duration</StyledTableCell>
                <StyledTableCell>Days</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <StyledTableCell>{schedule.time}</StyledTableCell>
                  <StyledTableCell>{schedule.duration} min</StyledTableCell>
                  <StyledTableCell>{schedule.days.join(', ')}</StyledTableCell>
                  <StyledTableCell>
                    <Switch
                      checked={schedule.enabled}
                      onChange={() =>
                        setSchedules(
                          schedules.map((s) =>
                            s.id === schedule.id
                              ? { ...s, enabled: !s.enabled }
                              : s
                          )
                        )
                      }
                      color="primary"
                    />
                  </StyledTableCell>
                  <StyledTableCell>
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
            {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} mt={2}>
              <TextField
                label="Time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 minutes
                }}
                fullWidth
              />

              <TextField
                label="Duration (minutes)"
                type="number"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value))}
                fullWidth
                InputProps={{
                  inputProps: { min: 1, max: 120 }
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Days</InputLabel>
                <Select
                  multiple
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                  label="Days"
                >
                  {daysOfWeek.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveSchedule}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </StyledCard>
  );
};

export default IrrigationSchedule;
