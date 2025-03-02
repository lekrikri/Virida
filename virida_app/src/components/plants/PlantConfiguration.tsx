import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useViridaStore } from '../../store/useViridaStore';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: '#FFFFFF',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    minWidth: 600,
  },
}));

const RangeInput = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  '& .MuiTextField-root': {
    width: 100,
  },
}));

interface PlantConfigurationProps {
  open: boolean;
  onClose: () => void;
  editPlant?: PlantData;
}

const plantSpecies = [
  { label: 'Tomato', optimal: { temp: [20, 25], humidity: [60, 80], ph: [6.0, 6.8], light: [3000, 6000] } },
  { label: 'Lettuce', optimal: { temp: [15, 20], humidity: [60, 70], ph: [6.0, 7.0], light: [2500, 5000] } },
  { label: 'Basil', optimal: { temp: [18, 24], humidity: [40, 60], ph: [6.0, 7.5], light: [2000, 4000] } },
  { label: 'Strawberry', optimal: { temp: [20, 26], humidity: [65, 75], ph: [5.5, 6.8], light: [2000, 4000] } },
];

const PlantConfiguration: React.FC<PlantConfigurationProps> = ({
  open,
  onClose,
  editPlant,
}) => {
  const { addPlant } = useViridaStore();
  const [formData, setFormData] = React.useState({
    name: '',
    species: '',
    temperature: { min: 20, max: 25 },
    humidity: { min: 60, max: 80 },
    ph: { min: 6.0, max: 6.8 },
    light: { min: 3000, max: 6000 },
  });

  React.useEffect(() => {
    if (editPlant) {
      setFormData({
        name: editPlant.name,
        species: editPlant.species,
        temperature: editPlant.optimalConditions.temperature,
        humidity: editPlant.optimalConditions.humidity,
        ph: editPlant.optimalConditions.ph,
        light: editPlant.optimalConditions.light,
      });
    }
  }, [editPlant]);

  const handleSpeciesChange = (_: any, value: any) => {
    if (value) {
      const { optimal } = value;
      setFormData((prev) => ({
        ...prev,
        species: value.label,
        temperature: { min: optimal.temp[0], max: optimal.temp[1] },
        humidity: { min: optimal.humidity[0], max: optimal.humidity[1] },
        ph: { min: optimal.ph[0], max: optimal.ph[1] },
        light: { min: optimal.light[0], max: optimal.light[1] },
      }));
    }
  };

  const handleSubmit = () => {
    const newPlant = {
      name: formData.name,
      species: formData.species,
      plantedDate: new Date(),
      status: 'healthy' as const,
      optimalConditions: {
        temperature: formData.temperature,
        humidity: formData.humidity,
        ph: formData.ph,
        light: formData.light,
      },
    };

    addPlant(newPlant);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>
        {editPlant ? 'Edit Plant' : 'Add New Plant'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Plant Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={plantSpecies}
              getOptionLabel={(option) => option.label}
              onChange={handleSpeciesChange}
              value={plantSpecies.find((s) => s.label === formData.species) || null}
              renderInput={(params) => (
                <TextField {...params} label="Species" margin="normal" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Optimal Conditions
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Temperature Range (°C)
            </Typography>
            <RangeInput>
              <TextField
                type="number"
                label="Min"
                value={formData.temperature.min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: { ...formData.temperature, min: Number(e.target.value) },
                  })
                }
              />
              <Typography>-</Typography>
              <TextField
                type="number"
                label="Max"
                value={formData.temperature.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: { ...formData.temperature, max: Number(e.target.value) },
                  })
                }
              />
            </RangeInput>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Humidity Range (%)
            </Typography>
            <RangeInput>
              <TextField
                type="number"
                label="Min"
                value={formData.humidity.min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    humidity: { ...formData.humidity, min: Number(e.target.value) },
                  })
                }
              />
              <Typography>-</Typography>
              <TextField
                type="number"
                label="Max"
                value={formData.humidity.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    humidity: { ...formData.humidity, max: Number(e.target.value) },
                  })
                }
              />
            </RangeInput>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              pH Range
            </Typography>
            <RangeInput>
              <TextField
                type="number"
                label="Min"
                value={formData.ph.min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ph: { ...formData.ph, min: Number(e.target.value) },
                  })
                }
              />
              <Typography>-</Typography>
              <TextField
                type="number"
                label="Max"
                value={formData.ph.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ph: { ...formData.ph, max: Number(e.target.value) },
                  })
                }
              />
            </RangeInput>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Light Range (lux)
            </Typography>
            <RangeInput>
              <TextField
                type="number"
                label="Min"
                value={formData.light.min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    light: { ...formData.light, min: Number(e.target.value) },
                  })
                }
              />
              <Typography>-</Typography>
              <TextField
                type="number"
                label="Max"
                value={formData.light.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    light: { ...formData.light, max: Number(e.target.value) },
                  })
                }
              />
            </RangeInput>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!formData.name || !formData.species}
        >
          {editPlant ? 'Update' : 'Add'} Plant
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PlantConfiguration;
