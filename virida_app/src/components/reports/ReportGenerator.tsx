import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BoltIcon from '@mui/icons-material/Bolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
}));

const PreviewCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  height: '100%',
  minHeight: 400,
}));

interface ReportSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const ReportGenerator: React.FC = () => {
  const [reportType, setReportType] = React.useState('daily');
  const [dateRange, setDateRange] = React.useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedSections, setSelectedSections] = React.useState<string[]>([
    'energy',
    'water',
    'plants',
  ]);

  const sections: ReportSection[] = [
    { id: 'energy', name: 'Energy Consumption', icon: <BoltIcon />, color: '#f1c40f' },
    { id: 'water', name: 'Water Usage', icon: <WaterDropIcon />, color: '#3498db' },
    { id: 'plants', name: 'Plant Health', icon: <LocalFloristIcon />, color: '#2ecc71' },
  ];

  const handleGenerateReport = () => {
    // Ici, nous ajouterons la logique de génération de rapport
    console.log('Generating report with:', {
      type: reportType,
      dateRange,
      sections: selectedSections,
    });
  };

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Configuration
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="daily">Daily Report</MenuItem>
                    <MenuItem value="weekly">Weekly Report</MenuItem>
                    <MenuItem value="monthly">Monthly Report</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" gap={2}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, start: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Report Sections
                </Typography>
                <FormGroup row>
                  {sections.map((section) => (
                    <FormControlLabel
                      key={section.id}
                      control={
                        <Checkbox
                          checked={selectedSections.includes(section.id)}
                          onChange={() => handleSectionToggle(section.id)}
                          icon={section.icon}
                          checkedIcon={section.icon}
                          sx={{
                            color: 'text.secondary',
                            '&.Mui-checked': {
                              color: section.color,
                            },
                          }}
                        />
                      }
                      label={section.name}
                    />
                  ))}
                </FormGroup>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleGenerateReport}
                  >
                    Generate Report
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <PreviewCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Preview
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ opacity: 0.7 }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <AssessmentIcon />
                <Typography variant="subtitle1">
                  {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarTodayIcon />
                <Typography variant="body2">
                  {dateRange.start} to {dateRange.end}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Selected Sections:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {selectedSections.map((sectionId) => {
                  const section = sections.find((s) => s.id === sectionId);
                  if (!section) return null;
                  return (
                    <Chip
                      key={sectionId}
                      icon={section.icon}
                      label={section.name}
                      sx={{
                        backgroundColor: `${section.color}20`,
                        borderColor: section.color,
                        '& .MuiChip-icon': {
                          color: section.color,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </CardContent>
        </PreviewCard>
      </Grid>
    </Grid>
  );
};

export default ReportGenerator;
