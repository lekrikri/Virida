import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { styled } from '@mui/material/styles';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import BiotechIcon from '@mui/icons-material/Biotech';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

interface SensorProps {
  sensor: {
    id: number;
    type: string;
    value: number;
    unit: string;
    status: 'normal' | 'warning' | 'alert';
  };
}

const StyledCard = styled(Card)<{ status: string }>(({ theme, status }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: status === 'normal' 
      ? 'linear-gradient(90deg, #27ae60, #2ecc71)'
      : status === 'warning'
      ? 'linear-gradient(90deg, #f1c40f, #f39c12)'
      : 'linear-gradient(90deg, #e74c3c, #c0392b)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-20px',
  right: '20px',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
}));

const ValueDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  background: 'linear-gradient(45deg, #27ae60 30%, #2ecc71 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const mockData = Array.from({ length: 10 }, (_, i) => ({
  time: i,
  value: Math.random() * 10 + 20,
}));

const getSensorIcon = (type: string) => {
  switch (type) {
    case 'temperature':
      return <DeviceThermostatIcon />;
    case 'humidity':
      return <OpacityIcon />;
    case 'ph':
      return <BiotechIcon />;
    case 'light':
      return <WbSunnyIcon />;
    default:
      return <DeviceThermostatIcon />;
  }
};

const SensorCard: React.FC<SensorProps> = ({ sensor }) => {
  return (
    <StyledCard status={sensor.status}>
      <IconWrapper>
        {getSensorIcon(sensor.type)}
      </IconWrapper>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <ValueDisplay variant="h3">
            {sensor.value}
          </ValueDisplay>
          <Typography variant="subtitle1" color="text.secondary">
            {sensor.unit}
          </Typography>
        </Box>
        <Box sx={{ height: 100 }}>
          <ResponsiveContainer>
            <LineChart data={mockData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#27ae60"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default SensorCard;
