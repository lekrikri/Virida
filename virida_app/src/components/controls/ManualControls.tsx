import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import OpacityIcon from '@mui/icons-material/Opacity';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const ControlButton = styled(Button)(({ theme }) => ({
  background: 'rgba(46, 204, 113, 0.1)',
  borderColor: theme.palette.primary.main,
  '&:hover': {
    background: 'rgba(46, 204, 113, 0.2)',
  },
}));

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  '& .MuiSlider-thumb': {
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}20`,
    },
  },
  '& .MuiSlider-rail': {
    opacity: 0.2,
  },
}));

interface SystemStatus {
  irrigation: boolean;
  cooling: boolean;
  lighting: boolean;
  fertilization: boolean;
}

const ManualControls: React.FC = () => {
  const [systemStatus, setSystemStatus] = React.useState<SystemStatus>({
    irrigation: false,
    cooling: false,
    lighting: false,
    fertilization: false,
  });

  const [sliderValues, setSliderValues] = React.useState({
    irrigation: 50,
    cooling: 50,
    lighting: 50,
    fertilization: 50,
  });

  const handleSystemToggle = (system: keyof SystemStatus) => {
    setSystemStatus((prev) => ({
      ...prev,
      [system]: !prev[system],
    }));
  };

  const handleSliderChange = (system: keyof SystemStatus) => (
    event: Event,
    newValue: number | number[]
  ) => {
    setSliderValues((prev) => ({
      ...prev,
      [system]: newValue as number,
    }));
  };

  const systems = [
    {
      name: 'Irrigation',
      key: 'irrigation' as keyof SystemStatus,
      icon: <OpacityIcon />,
      color: '#3498db',
    },
    {
      name: 'Cooling',
      key: 'cooling' as keyof SystemStatus,
      icon: <AcUnitIcon />,
      color: '#2980b9',
    },
    {
      name: 'Lighting',
      key: 'lighting' as keyof SystemStatus,
      icon: <WbSunnyIcon />,
      color: '#f1c40f',
    },
    {
      name: 'Fertilization',
      key: 'fertilization' as keyof SystemStatus,
      icon: <LocalDrinkIcon />,
      color: '#27ae60',
    },
  ];

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Manual Controls
        </Typography>
        <Grid container spacing={3}>
          {systems.map((system) => (
            <Grid item xs={12} key={system.key}>
              <Box
                sx={{
                  p: 2,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1,
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        color: system.color,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {system.icon}
                    </Box>
                    <Typography>{system.name}</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemStatus[system.key]}
                        onChange={() => handleSystemToggle(system.key)}
                        color="primary"
                      />
                    }
                    label={systemStatus[system.key] ? 'ON' : 'OFF'}
                  />
                </Box>
                <Box px={1}>
                  <CustomSlider
                    value={sliderValues[system.key]}
                    onChange={handleSliderChange(system.key)}
                    disabled={!systemStatus[system.key]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default ManualControls;
