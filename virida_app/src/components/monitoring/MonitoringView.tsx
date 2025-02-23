import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton, Chip, Paper, styled } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useViridaStore } from '../../store/useViridaStore';
import { useThree } from '../../hooks/useThree';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import Co2Icon from '@mui/icons-material/Co2';
import LightModeIcon from '@mui/icons-material/LightMode';
import RefreshIcon from '@mui/icons-material/Refresh';

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 'calc(100vh - 100px)',
  position: 'relative',
  backgroundColor: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  borderRadius: theme.shape.borderRadius,
}));

const InfoPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(17, 34, 64, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  zIndex: 1000,
  maxWidth: 300,
}));

const SensorTooltip = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  padding: theme.spacing(1),
  background: 'rgba(17, 34, 64, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  zIndex: 1000,
  pointerEvents: 'none',
}));

const MonitoringView: React.FC = () => {
  const { sensors, zones, selectedZone, setSelectedZone } = useViridaStore();
  const [hoveredSensor, setHoveredSensor] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    greenhouseModel,
    sensorModels,
    updateSensorPositions,
    handleSensorClick,
    handleSensorHover,
  } = useThree();

  useEffect(() => {
    // Update sensor positions when sensors or zones change
    updateSensorPositions(sensors, zones);
  }, [sensors, zones, updateSensorPositions]);

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Monitoring 3D</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <StyledBox onMouseMove={handleMouseMove}>
        <Canvas ref={canvasRef}>
          <PerspectiveCamera makeDefault position={[0, 5, 10]} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          
          {/* Ambient Light */}
          <ambientLight intensity={0.5} />
          
          {/* Directional Light */}
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* Greenhouse Model */}
          {greenhouseModel}
          
          {/* Sensor Models */}
          {sensorModels.map((model, index) => (
            <group
              key={index}
              position={model.position}
              onClick={() => handleSensorClick(index)}
              onPointerOver={() => handleSensorHover(index)}
              onPointerOut={() => setHoveredSensor(null)}
            >
              {model.mesh}
            </group>
          ))}
        </Canvas>

        {/* Info Panel */}
        <InfoPanel>
          <Typography variant="h6" gutterBottom>
            Zone Information
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <ThermostatIcon />
              <Typography>
                Temperature: {sensors[0]?.value.toFixed(1)}°C
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <OpacityIcon />
              <Typography>
                Humidity: {sensors[1]?.value.toFixed(1)}%
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Co2Icon />
              <Typography>
                CO2: {sensors[2]?.value.toFixed(0)} ppm
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LightModeIcon />
              <Typography>
                Light: {sensors[3]?.value.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Active Zones
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {zones.map((zone) => (
                <Chip
                  key={zone.id}
                  label={zone.name}
                  onClick={() => setSelectedZone(zone.id)}
                  color={selectedZone === zone.id ? 'primary' : 'default'}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </InfoPanel>

        {/* Sensor Tooltip */}
        {hoveredSensor && (
          <SensorTooltip
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y + 10,
            }}
          >
            <Typography variant="subtitle2">
              {hoveredSensor.name}
            </Typography>
            <Typography variant="body2">
              {hoveredSensor.value.toFixed(1)} {hoveredSensor.unit}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </SensorTooltip>
        )}
      </StyledBox>
    </Box>
  );
};

export default MonitoringView;
