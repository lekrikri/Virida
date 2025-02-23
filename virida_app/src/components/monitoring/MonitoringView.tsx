import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton, Chip, Paper, styled } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useViridaStore } from '../../store/useViridaStore';
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

// Composant pour la scène 3D
const Scene = () => {
  const { sensors, zones } = useViridaStore();
  const [hoveredSensor, setHoveredSensor] = useState<any>(null);

  // Créer les géométries des capteurs
  const sensorGeometries = {
    temperature: new THREE.SphereGeometry(0.2),
    humidity: new THREE.BoxGeometry(0.3, 0.3, 0.3),
    co2: new THREE.CylinderGeometry(0.15, 0.15, 0.4),
    light: new THREE.ConeGeometry(0.2, 0.4),
  };

  // Créer les matériaux des capteurs
  const sensorMaterials = {
    temperature: new THREE.MeshStandardMaterial({ color: '#e74c3c' }),
    humidity: new THREE.MeshStandardMaterial({ color: '#3498db' }),
    co2: new THREE.MeshStandardMaterial({ color: '#2ecc71' }),
    light: new THREE.MeshStandardMaterial({ color: '#f1c40f' }),
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      {/* Ambient Light */}
      <ambientLight intensity={0.5} />
      
      {/* Directional Light */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Greenhouse Base */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Greenhouse Walls */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[10, 4, 10]} />
        <meshStandardMaterial color="#34495e" transparent opacity={0.3} />
      </mesh>
      
      {/* Sensors */}
      {sensors.map((sensor, index) => (
        <mesh
          key={sensor.id}
          position={sensor.position}
          geometry={sensorGeometries[sensor.type as keyof typeof sensorGeometries]}
          material={sensorMaterials[sensor.type as keyof typeof sensorMaterials]}
          onPointerOver={() => setHoveredSensor(sensor)}
          onPointerOut={() => setHoveredSensor(null)}
        />
      ))}

      {/* Zones */}
      {zones.map((zone) => (
        <mesh key={zone.id} position={zone.position}>
          <boxGeometry args={zone.dimensions} />
          <meshStandardMaterial color="#27ae60" transparent opacity={0.1} />
        </mesh>
      ))}
    </>
  );
};

const MonitoringView: React.FC = () => {
  const { sensors, zones, selectedZone, setSelectedZone } = useViridaStore();
  const [hoveredSensor, setHoveredSensor] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          <Scene />
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
