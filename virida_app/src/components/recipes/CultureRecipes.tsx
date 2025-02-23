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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tooltip,
  Slider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ScienceIcon from '@mui/icons-material/Science';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
  color: theme.palette.text.secondary,
}));

interface CultureRecipe {
  id: number;
  name: string;
  description: string;
  plant: string;
  duration: number;
  temperature: {
    day: number;
    night: number;
  };
  humidity: {
    min: number;
    max: number;
  };
  light: {
    intensity: number;
    duration: number;
  };
  irrigation: {
    frequency: number;
    amount: number;
  };
  nutrients: {
    name: string;
    amount: number;
    unit: string;
  }[];
  stages: {
    name: string;
    duration: number;
    description: string;
    conditions: string[];
  }[];
  status: string;
  author: string;
  createdAt: string;
  lastModified: string;
}

const CultureRecipes: React.FC = () => {
  const [recipes, setRecipes] = React.useState<CultureRecipe[]>([
    {
      id: 1,
      name: 'Tomato Fast Growth',
      description: 'Optimized recipe for rapid tomato growth in controlled environment',
      plant: 'Tomato',
      duration: 90,
      temperature: {
        day: 25,
        night: 18,
      },
      humidity: {
        min: 60,
        max: 80,
      },
      light: {
        intensity: 85,
        duration: 16,
      },
      irrigation: {
        frequency: 3,
        amount: 250,
      },
      nutrients: [
        { name: 'Nitrogen', amount: 200, unit: 'ppm' },
        { name: 'Phosphorus', amount: 50, unit: 'ppm' },
        { name: 'Potassium', amount: 150, unit: 'ppm' },
      ],
      stages: [
        {
          name: 'Seedling',
          duration: 14,
          description: 'Initial growth phase',
          conditions: ['High humidity', 'Moderate light'],
        },
        {
          name: 'Vegetative',
          duration: 30,
          description: 'Rapid growth phase',
          conditions: ['Full light', 'Regular fertilization'],
        },
        {
          name: 'Flowering',
          duration: 46,
          description: 'Fruit development phase',
          conditions: ['Reduced nitrogen', 'Increased potassium'],
        },
      ],
      status: 'active',
      author: 'John Smith',
      createdAt: '2025-01-15',
      lastModified: '2025-02-18',
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingRecipe, setEditingRecipe] = React.useState<CultureRecipe | null>(null);
  const [newRecipe, setNewRecipe] = React.useState<Partial<CultureRecipe>>({
    temperature: { day: 23, night: 18 },
    humidity: { min: 60, max: 80 },
    light: { intensity: 80, duration: 16 },
    irrigation: { frequency: 2, amount: 200 },
    nutrients: [],
    stages: [],
    status: 'draft',
  });

  const plants = ['Tomato', 'Lettuce', 'Cucumber', 'Strawberry', 'Basil', 'Pepper'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#2ecc71';
      case 'draft':
        return '#f1c40f';
      case 'archived':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const handleAddRecipe = () => {
    setEditingRecipe(null);
    setNewRecipe({
      temperature: { day: 23, night: 18 },
      humidity: { min: 60, max: 80 },
      light: { intensity: 80, duration: 16 },
      irrigation: { frequency: 2, amount: 200 },
      nutrients: [],
      stages: [],
      status: 'draft',
    });
    setOpenDialog(true);
  };

  const handleEditRecipe = (recipe: CultureRecipe) => {
    setEditingRecipe(recipe);
    setNewRecipe(recipe);
    setOpenDialog(true);
  };

  const handleDeleteRecipe = (id: number) => {
    setRecipes(recipes.filter((recipe) => recipe.id !== id));
  };

  const handleDuplicateRecipe = (recipe: CultureRecipe) => {
    const newId = Math.max(...recipes.map((r) => r.id)) + 1;
    setRecipes([
      ...recipes,
      {
        ...recipe,
        id: newId,
        name: `${recipe.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const handleSaveRecipe = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (editingRecipe) {
      setRecipes(
        recipes.map((r) =>
          r.id === editingRecipe.id
            ? { ...r, ...newRecipe, lastModified: currentDate }
            : r
        )
      );
    } else {
      setRecipes([
        ...recipes,
        {
          ...newRecipe,
          id: recipes.length + 1,
          createdAt: currentDate,
          lastModified: currentDate,
        } as CultureRecipe,
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
              <Typography variant="h6">Culture Recipes</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddRecipe}
              >
                New Recipe
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Recipe</StyledTableCell>
                    <StyledTableCell>Plant</StyledTableCell>
                    <StyledTableCell>Duration</StyledTableCell>
                    <StyledTableCell>Conditions</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <LocalFloristIcon sx={{ color: '#2ecc71' }} />
                          <Box>
                            <Typography variant="body2">{recipe.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {recipe.author}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>{recipe.plant}</StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <TimerIcon fontSize="small" />
                          {recipe.duration} days
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title={`${recipe.temperature.day}°C day / ${recipe.temperature.night}°C night`}>
                            <Chip
                              icon={<ThermostatIcon />}
                              label="Temp"
                              size="small"
                              sx={{ backgroundColor: 'rgba(231, 76, 60, 0.1)' }}
                            />
                          </Tooltip>
                          <Tooltip title={`${recipe.humidity.min}% - ${recipe.humidity.max}%`}>
                            <Chip
                              icon={<OpacityIcon />}
                              label="Humidity"
                              size="small"
                              sx={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}
                            />
                          </Tooltip>
                          <Tooltip title={`${recipe.light.intensity}% for ${recipe.light.duration}h`}>
                            <Chip
                              icon={<WbSunnyIcon />}
                              label="Light"
                              size="small"
                              sx={{ backgroundColor: 'rgba(241, 196, 15, 0.1)' }}
                            />
                          </Tooltip>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={recipe.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(recipe.status)}20`,
                            color: getStatusColor(recipe.status),
                            borderColor: getStatusColor(recipe.status),
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Tooltip title="Apply Recipe">
                          <IconButton
                            size="small"
                            sx={{ color: '#2ecc71' }}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicateRecipe(recipe)}
                            sx={{ color: 'primary.main' }}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => handleEditRecipe(recipe)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRecipe(recipe.id)}
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
            background: 'rgba(17, 34, 64, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(46, 204, 113, 0.1)',
          },
        }}
      >
        <DialogTitle>
          {editingRecipe ? 'Edit Recipe' : 'New Culture Recipe'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Recipe Name"
                  value={newRecipe.name || ''}
                  onChange={(e) =>
                    setNewRecipe((prev) => ({ ...prev, name: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Plant Type</InputLabel>
                  <Select
                    value={newRecipe.plant || ''}
                    label="Plant Type"
                    onChange={(e) =>
                      setNewRecipe((prev) => ({ ...prev, plant: e.target.value }))
                    }
                  >
                    {plants.map((plant) => (
                      <MenuItem key={plant} value={plant}>
                        {plant}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={newRecipe.description || ''}
                  onChange={(e) =>
                    setNewRecipe((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Growth Duration (days)
                </Typography>
                <Slider
                  value={newRecipe.duration || 90}
                  onChange={(_, value) =>
                    setNewRecipe((prev) => ({ ...prev, duration: value as number }))
                  }
                  min={30}
                  max={180}
                  valueLabelDisplay="auto"
                  sx={{
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#2ecc71',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#2ecc71',
                    },
                  }}
                />
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
                    Temperature Control
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="caption">Day (°C)</Typography>
                      <Slider
                        value={newRecipe.temperature?.day || 23}
                        onChange={(_, value) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            temperature: {
                              ...prev.temperature,
                              day: value as number,
                            },
                          }))
                        }
                        min={15}
                        max={35}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption">Night (°C)</Typography>
                      <Slider
                        value={newRecipe.temperature?.night || 18}
                        onChange={(_, value) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            temperature: {
                              ...prev.temperature,
                              night: value as number,
                            },
                          }))
                        }
                        min={10}
                        max={30}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Box>
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
                    Humidity Control
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="caption">Range (%)</Typography>
                      <Slider
                        value={[
                          newRecipe.humidity?.min || 60,
                          newRecipe.humidity?.max || 80,
                        ]}
                        onChange={(_, value) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            humidity: {
                              min: (value as number[])[0],
                              max: (value as number[])[1],
                            },
                          }))
                        }
                        min={30}
                        max={90}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Box>
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
                    Light Control
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="caption">Intensity (%)</Typography>
                      <Slider
                        value={newRecipe.light?.intensity || 80}
                        onChange={(_, value) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            light: {
                              ...prev.light,
                              intensity: value as number,
                            },
                          }))
                        }
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption">Duration (hours)</Typography>
                      <Slider
                        value={newRecipe.light?.duration || 16}
                        onChange={(_, value) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            light: {
                              ...prev.light,
                              duration: value as number,
                            },
                          }))
                        }
                        min={8}
                        max={24}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Box>
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
                    Irrigation Control
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="caption">
                        Frequency (times per day)
                      </Typography>
                      <Slider
                        value={newRecipe.irrigation?.frequency || 2}
                        onChange={(_, value) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            irrigation: {
                              ...prev.irrigation,
                              frequency: value as number,
                            },
                          }))
                        }
                        min={1}
                        max={6}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption">Amount (ml)</Typography>
                      <Slider
                        value={newRecipe.irrigation?.amount || 200}
                        onChange={(_, value) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            irrigation: {
                              ...prev.irrigation,
                              amount: value as number,
                            },
                          }))
                        }
                        min={50}
                        max={500}
                        step={50}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRecipe} variant="contained" color="primary">
            Save Recipe
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CultureRecipes;
