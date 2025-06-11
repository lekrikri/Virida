import React, { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Palette de couleurs Virida
const VIRIDA_COLORS = {
  PRIMARY_GREEN: '#2AD388',
  LIGHT_GREEN: '#CBED82',
  DARK_GREEN: '#052E1C',
  DARK_BLUE: '#121A21',
  WHITE: '#FFFFFF',
  LIGHT_GRAY: '#F5F5F5',
};

// Modèle 3D de la serre
// Chemin relatif au fichier GLTF
const serreModelPath = new URL('./Serre_max.gltf', import.meta.url).href;

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
      glassMaterial.opacity = 0.40; // Très transparent
      
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
    
    // Parcourir la scène pour s'assurer que tous les matériaux sont correctement configurés
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Vérifier si le mesh utilise le matériau cible
        if (child.material instanceof THREE.Material && 
            materials && 
            child.material.name === '0.917647_0.917647_0.917647_0.000000_0.800000') {
          // Déjà traité ci-dessus
        } else if (Array.isArray(child.material)) {
          // Pour les meshes avec plusieurs matériaux
          child.material.forEach(mat => {
            if (mat instanceof THREE.Material && 
                materials && 
                mat.name === '0.917647_0.917647_0.917647_0.000000_0.800000') {
              // Déjà traité ci-dessus
            }
          });
        }
      }
    });
    
    // Nettoyer le renderer
    renderer.dispose();
    
    // Centrer le modèle en calculant sa boîte englobante
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    
    // Ajuster la position du modèle pour que son centre soit à l'origine
    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;
  }, [scene]);

  return <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} />;
};

const GreenhouseModel: React.FC = () => {
  return (
    <Canvas camera={{ position: [1, 1, 1], fov: 25 }} shadows>
      <color attach="background" args={[VIRIDA_COLORS.LIGHT_GRAY]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <directionalLight 
        position={[-5, 5, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      <Environment preset="sunset" />
      <Suspense fallback={null}>
        <SerreModel />
      </Suspense>
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        target={[0, 0, 0]} 
        minDistance={2} 
        maxDistance={10} 
      />
      {/* Grille aux couleurs Virida */}
      <gridHelper 
        args={[10, 10, VIRIDA_COLORS.PRIMARY_GREEN, VIRIDA_COLORS.LIGHT_GREEN]} 
        position={[0, -0.01, 0]} 
        visible={false} 
      />
    </Canvas>
  );
};

export default GreenhouseModel;
