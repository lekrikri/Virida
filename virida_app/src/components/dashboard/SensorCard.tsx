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
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'visible',
  borderTop: `2px solid ${
    status === 'normal' 
      ? '#2AD388'
      : status === 'warning'
      ? '#f1c40f'
      : '#e74c3c'
  }`,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '-20px',
  right: '20px',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid #2AD388`,
  color: '#2AD388',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
}));

const ValueDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: '#2AD388',
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
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#121A21' }}>
          {sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <ValueDisplay variant="h3">
            {sensor.value}
          </ValueDisplay>
          <Typography variant="subtitle1" color="#121A21">
            {sensor.unit}
          </Typography>
        </Box>
        <Box sx={{ height: 100 }}>
          <ResponsiveContainer>
            <LineChart data={mockData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2AD388"
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
