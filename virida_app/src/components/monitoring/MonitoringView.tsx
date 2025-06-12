import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Box, Typography, IconButton, Chip, Paper, styled } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment } from '@react-three/drei';
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
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
}));

const InfoPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(2),
  background: '#FFFFFF',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  zIndex: 1000,
  maxWidth: 300,
}));

const SensorTooltip = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  padding: theme.spacing(1),
  background: '#FFFFFF',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  zIndex: 1000,
  pointerEvents: 'none',
}));

// Chemin relatif au fichier GLTF
const serreModelPath = new URL('../3d/Serre_max.gltf', import.meta.url).href;

// Composant pour le modèle 3D de la serre
const SerreModel = () => {
  const { scene, materials } = useGLTF(serreModelPath);
  
  useEffect(() => {
    // Configuration pour les reflets
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1, 1); // Taille minimale pour éviter les erreurs
    
    // Appliquer l'effet plexiglas/verre uniquement au matériau spécifique
    if (materials && materials['0.917647_0.917647_0.917647_0.000000_0.800000']) {
      const glassMaterial = materials['0.917647_0.917647_0.917647_0.000000_0.800000'];
      
      // Appliquer l'effet plexiglas/verre
      glassMaterial.transparent = true;
      glassMaterial.opacity = 0.10; // Très transparent
      
      // Appliquer des propriétés spécifiques selon le type de matériau
      if (glassMaterial instanceof THREE.MeshStandardMaterial) {
        glassMaterial.roughness = 0.05; // Très lisse
        glassMaterial.metalness = 0.2; // Légèrement métallique
        glassMaterial.envMapIntensity = 1.8; // Intensifier les reflets
        
        // Ajouter une légère teinte bleutée pour l'effet verre
        const glassColor = new THREE.Color(0xc4e0f9); // Bleu très pâle
        glassMaterial.color.lerp(glassColor, 0.5); // Mélanger avec la couleur existante
      }
      
      if (glassMaterial instanceof THREE.MeshPhongMaterial) {
        glassMaterial.shininess = 100;
        glassMaterial.specular = new THREE.Color(0xffffff);
        
        // Ajouter une légère teinte bleutée pour l'effet verre si c'est un matériau Phong
        // Vérification de type plus précise pour éviter l'erreur TypeScript
        if ('color' in glassMaterial && glassMaterial.color instanceof THREE.Color) {
          const glassColor = new THREE.Color(0xc4e0f9); // Bleu très pâle
          glassMaterial.color.lerp(glassColor, 0.5); // Mélanger avec la couleur existante
        }
      }
    }
    
    // Nettoyer le renderer
    renderer.dispose();
    
    // Centrer le modèle en calculant sa boîte englobante
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    
    // Ajuster la position du modèle pour que son centre soit à l'origine
    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;
    
    // Ajuster l'échelle pour qu'elle corresponde à la taille de la scène existante
    // Une échelle plus grande pour que la serre soit bien visible
    scene.scale.set(2.2, 2.2, 2.2);
    
    // Positionner le modèle pour que les capteurs soient à l'intérieur
    scene.position.y = 0.4;
  }, [scene, materials]);

  return <primitive object={scene} position={[-0.02, 2, 0]} />;
};

// Composant pour la scène 3D
const Scene = () => {
  const { sensors, zones } = useViridaStore();
  const [hoveredSensor, setHoveredSensor] = useState<any>(null);

  // Créer les géométries des capteurs (plus petites pour mieux s'intégrer dans la serre)
  const sensorGeometries = {
    temperature: new THREE.SphereGeometry(0.1),
    humidity: new THREE.BoxGeometry(0.15, 0.15, 0.15),
    co2: new THREE.CylinderGeometry(0.08, 0.08, 0.2),
    light: new THREE.ConeGeometry(0.1, 0.2),
  };

  // Créer les matériaux des capteurs avec des propriétés améliorées pour une meilleure visibilité
  const sensorMaterials = {
    temperature: new THREE.MeshStandardMaterial({ 
      color: '#e74c3c', 
      emissive: '#e74c3c', 
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.7
    }),
    humidity: new THREE.MeshStandardMaterial({ 
      color: '#3498db', 
      emissive: '#3498db', 
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.7
    }),
    co2: new THREE.MeshStandardMaterial({ 
      color: '#2ecc71', 
      emissive: '#2ecc71', 
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.7
    }),
    light: new THREE.MeshStandardMaterial({ 
      color: '#f1c40f', 
      emissive: '#f1c40f', 
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.7
    }),
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 5]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      {/* Ambient Light */}
      <ambientLight intensity={0.8} />
      
      {/* Directional Light */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      <pointLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.6} castShadow color="#f0f8ff" />
      
      {/* Environment pour les reflets */}
      <Environment preset="sunset" />
      
      {/* Modèle 3D de la serre */}
      <Suspense fallback={null}>
        <SerreModel />
      </Suspense>
      
      {/* Sensors - Utilisation directe des positions définies dans mockData.ts */}
      {sensors.map((sensor, index) => {
        // Réduire la taille des capteurs pour qu'ils s'intègrent mieux dans la serre
        const sensorScale = 0.8;
        
        // Utiliser directement la position définie dans les données du capteur
        // Cela permet de personnaliser la position de chaque capteur dans le fichier mockData.ts
        return (
          <mesh
            key={sensor.id}
            position={sensor.position}
            geometry={sensorGeometries[sensor.type as keyof typeof sensorGeometries]}
            material={sensorMaterials[sensor.type as keyof typeof sensorMaterials]}
            onPointerOver={() => setHoveredSensor(sensor)}
            onPointerOut={() => setHoveredSensor(null)}
            scale={[sensorScale, sensorScale, sensorScale]}
            // Ajouter une légère rotation pour plus de dynamisme
            rotation={[0, Math.PI * (index * 0.25), 0]}
            // Ajouter des ombres pour une meilleure intégration visuelle
            castShadow
          />
        );
      })}

      {/* Zones - Supprimées pour ne garder que la serre GLTF */}
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
        <Typography variant="h4" color="#121A21">Monitoring 3D</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => window.location.reload()} sx={{ color: '#2AD388' }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <StyledBox onMouseMove={handleMouseMove}>
        <Canvas ref={canvasRef} shadows>
          <Scene />
        </Canvas>

        {/* Info Panel */}
        <InfoPanel>
          <Typography variant="h6" gutterBottom color="#121A21">
            Zone Information
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <ThermostatIcon sx={{ color: '#2AD388' }} />
              <Typography color="#121A21">
                Temperature: {sensors[0]?.value.toFixed(1)}°C
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <OpacityIcon sx={{ color: '#2AD388' }} />
              <Typography color="#121A21">
                Humidity: {sensors[1]?.value.toFixed(1)}%
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Co2Icon sx={{ color: '#2AD388' }} />
              <Typography color="#121A21">
                CO2: {sensors[2]?.value.toFixed(0)} ppm
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LightModeIcon sx={{ color: '#2AD388' }} />
              <Typography color="#121A21">
                Light: {sensors[3]?.value.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom color="#121A21">
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
                  sx={{
                    backgroundColor: selectedZone === zone.id ? '#2AD388' : '#f5f5f5',
                    color: selectedZone === zone.id ? '#FFFFFF' : '#121A21',
                  }}
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
            <Typography variant="subtitle2" color="#121A21">
              {hoveredSensor.name}
            </Typography>
            <Typography variant="body2" color="#121A21">
              Type: {hoveredSensor.type}
            </Typography>
            <Typography variant="body2" color="#121A21">
              Value: {hoveredSensor.value.toFixed(1)} {hoveredSensor.unit}
            </Typography>
          </SensorTooltip>
        )}
      </StyledBox>
    </Box>
  );
};

export default MonitoringView;
