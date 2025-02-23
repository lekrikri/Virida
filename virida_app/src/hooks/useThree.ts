import { useThree as useThreeBase } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface Sensor {
  id: string;
  type: string;
  value: number;
  position: [number, number, number];
}

interface Zone {
  id: string;
  name: string;
  position: [number, number, number];
  dimensions: [number, number, number];
}

export const useThree = () => {
  const { camera, gl, scene } = useThreeBase();
  const [sensorModels, setSensorModels] = useState<THREE.Mesh[]>([]);
  const [greenhouseModel, setGreenhouseModel] = useState<THREE.Group | null>(null);

  // Handle window resize
  const handleResize = useCallback(() => {
    const { innerWidth, innerHeight } = window;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    gl.setSize(innerWidth, innerHeight);
  }, [camera, gl]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Set rendering quality
  const setQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    const pixelRatio = quality === 'low' ? 1 : quality === 'medium' ? 1.5 : 2;
    gl.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatio));
  }, [gl]);

  // Create sensor geometries
  const sensorGeometries = useMemo(() => {
    return {
      temperature: new THREE.SphereGeometry(0.2),
      humidity: new THREE.BoxGeometry(0.3, 0.3, 0.3),
      co2: new THREE.CylinderGeometry(0.15, 0.15, 0.4),
      light: new THREE.ConeGeometry(0.2, 0.4),
    };
  }, []);

  // Create sensor materials
  const sensorMaterials = useMemo(() => {
    return {
      temperature: new THREE.MeshStandardMaterial({ color: '#e74c3c' }),
      humidity: new THREE.MeshStandardMaterial({ color: '#3498db' }),
      co2: new THREE.MeshStandardMaterial({ color: '#2ecc71' }),
      light: new THREE.MeshStandardMaterial({ color: '#f1c40f' }),
    };
  }, []);

  // Load greenhouse model
  useEffect(() => {
    const loader = new GLTFLoader();
    // Replace with your actual model path
    loader.load('/models/greenhouse.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
      setGreenhouseModel(model);
      scene.add(model);
    });
  }, [scene]);

  // Update sensor positions
  const updateSensorPositions = useCallback((sensors: Sensor[], zones: Zone[]) => {
    const newModels = sensors.map(sensor => {
      const geometry = sensorGeometries[sensor.type as keyof typeof sensorGeometries];
      const material = sensorMaterials[sensor.type as keyof typeof sensorMaterials];
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...sensor.position);
      return mesh;
    });

    // Remove old models
    sensorModels.forEach(model => scene.remove(model));
    
    // Add new models
    newModels.forEach(model => scene.add(model));
    setSensorModels(newModels);
  }, [scene, sensorGeometries, sensorMaterials, sensorModels]);

  // Handle sensor click
  const handleSensorClick = useCallback((index: number) => {
    const model = sensorModels[index];
    if (model) {
      model.scale.multiplyScalar(1.2);
      setTimeout(() => {
        model.scale.multiplyScalar(1/1.2);
      }, 200);
    }
  }, [sensorModels]);

  // Handle sensor hover
  const handleSensorHover = useCallback((index: number) => {
    const model = sensorModels[index];
    if (model) {
      const originalColor = model.material.color.clone();
      model.material.color.setHex(0xffffff);
      return () => {
        model.material.color.copy(originalColor);
      };
    }
  }, [sensorModels]);

  // Add ambient lighting
  useEffect(() => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    return () => {
      scene.remove(ambientLight);
      scene.remove(directionalLight);
    };
  }, [scene]);

  return {
    camera,
    gl,
    scene,
    setQuality,
    greenhouseModel,
    sensorModels,
    updateSensorPositions,
    handleSensorClick,
    handleSensorHover,
  };
};