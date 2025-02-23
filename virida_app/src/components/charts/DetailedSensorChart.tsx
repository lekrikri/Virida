import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ButtonGroup,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useViridaStore, SensorData } from '../../store';

interface DetailedSensorChartProps {
  sensor: SensorData;
}

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const TimeButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  borderColor: 'rgba(46, 204, 113, 0.2)',
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const CustomTooltip = styled(Box)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}));

const DetailedSensorChart: React.FC<DetailedSensorChartProps> = ({ sensor }) => {
  const [timeRange, setTimeRange] = React.useState<'1h' | '24h' | '7d' | '30d'>('1h');

  // Simulate different time ranges of data
  const generateData = (range: string) => {
    const now = new Date();
    const data = [];
    let points;
    let interval;

    switch (range) {
      case '1h':
        points = 60;
        interval = 60000; // 1 minute
        break;
      case '24h':
        points = 24;
        interval = 3600000; // 1 hour
        break;
      case '7d':
        points = 7;
        interval = 86400000; // 1 day
        break;
      case '30d':
        points = 30;
        interval = 86400000; // 1 day
        break;
      default:
        points = 60;
        interval = 60000;
    }

    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * interval));
      data.push({
        timestamp: time,
        value: sensor.value + (Math.random() - 0.5) * 5,
      });
    }

    return data;
  };

  const data = generateData(timeRange);

  const formatXAxis = (timestamp: Date) => {
    switch (timeRange) {
      case '1h':
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '24h':
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '7d':
      case '30d':
        return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return '';
    }
  };

  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltip>
          <Typography variant="body2" color="text.primary">
            {new Date(label).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="primary">
            {payload[0].value.toFixed(1)} {sensor.unit}
          </Typography>
        </CustomTooltip>
      );
    }
    return null;
  };

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">{sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)} History</Typography>
          <ButtonGroup size="small" variant="outlined">
            <TimeButton
              className={timeRange === '1h' ? 'active' : ''}
              onClick={() => setTimeRange('1h')}
            >
              1H
            </TimeButton>
            <TimeButton
              className={timeRange === '24h' ? 'active' : ''}
              onClick={() => setTimeRange('24h')}
            >
              24H
            </TimeButton>
            <TimeButton
              className={timeRange === '7d' ? 'active' : ''}
              onClick={() => setTimeRange('7d')}
            >
              7D
            </TimeButton>
            <TimeButton
              className={timeRange === '30d' ? 'active' : ''}
              onClick={() => setTimeRange('30d')}
            >
              30D
            </TimeButton>
          </ButtonGroup>
        </Box>

        <Box height={300}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#27ae60" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#27ae60" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="rgba(255,255,255,0.5)"
              />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip content={CustomTooltipContent} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#27ae60"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default DetailedSensorChart;
