import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
  color: theme.palette.text.secondary,
}));

interface MaintenanceRecord {
  id: number;
  taskName: string;
  system: string;
  date: string;
  technician: string;
  duration: number;
  type: string;
  status: string;
  findings: string[];
  actions: string[];
  parts: string[];
}

const MaintenanceHistory: React.FC = () => {
  const [records, setRecords] = React.useState<MaintenanceRecord[]>([
    {
      id: 1,
      taskName: 'Sensor Calibration',
      system: 'Sensors',
      date: '2025-02-18',
      technician: 'John Smith',
      duration: 45,
      type: 'preventive',
      status: 'completed',
      findings: [
        'Slight drift in temperature readings',
        'Humidity sensor within normal range',
        'pH sensor requires recalibration',
      ],
      actions: [
        'Calibrated temperature sensors',
        'Adjusted pH sensor settings',
        'Updated firmware',
      ],
      parts: ['Calibration solution', 'Sensor cleaning kit'],
    },
    {
      id: 2,
      taskName: 'Emergency Pump Repair',
      system: 'Irrigation',
      date: '2025-02-15',
      technician: 'Sarah Johnson',
      duration: 120,
      type: 'corrective',
      status: 'completed',
      findings: [
        'Pump motor overheating',
        'Worn out bearings',
        'Clogged filter',
      ],
      actions: [
        'Replaced pump bearings',
        'Cleaned and replaced filter',
        'Tested pump operation',
      ],
      parts: ['Pump bearings', 'New filter', 'Lubricant'],
    },
  ]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRecord, setSelectedRecord] = React.useState<MaintenanceRecord | null>(
    null
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preventive':
        return '#2ecc71';
      case 'corrective':
        return '#e74c3c';
      case 'predictive':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.technician.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Maintenance History</Typography>
              <TextField
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Task</StyledTableCell>
                    <StyledTableCell>System</StyledTableCell>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>Technician</StyledTableCell>
                    <StyledTableCell>Type</StyledTableCell>
                    <StyledTableCell>Duration</StyledTableCell>
                    <StyledTableCell>Details</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BuildIcon sx={{ color: 'primary.main' }} />
                          {record.taskName}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>{record.system}</StyledTableCell>
                      <StyledTableCell>{record.date}</StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon fontSize="small" />
                          {record.technician}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={record.type}
                          size="small"
                          sx={{
                            backgroundColor: `${getTypeColor(record.type)}20`,
                            color: getTypeColor(record.type),
                            borderColor: getTypeColor(record.type),
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>{record.duration} min</StyledTableCell>
                      <StyledTableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedRecord(record)}
                            sx={{ color: 'primary.main' }}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
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
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
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
        {selectedRecord && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <BuildIcon sx={{ color: 'primary.main' }} />
                {selectedRecord.taskName}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(46, 204, 113, 0.1)',
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Findings
                    </Typography>
                    <List dense>
                      {selectedRecord.findings.map((finding, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <TimelineIcon sx={{ color: '#3498db' }} />
                          </ListItemIcon>
                          <ListItemText primary={finding} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(46, 204, 113, 0.1)',
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Actions Taken
                    </Typography>
                    <List dense>
                      {selectedRecord.actions.map((action, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleIcon sx={{ color: '#2ecc71' }} />
                          </ListItemIcon>
                          <ListItemText primary={action} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(46, 204, 113, 0.1)',
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Parts Used
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {selectedRecord.parts.map((part, index) => (
                        <Chip
                          key={index}
                          label={part}
                          size="small"
                          icon={<BuildIcon />}
                          sx={{
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'primary.main',
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Grid>
  );
};

export default MaintenanceHistory;
