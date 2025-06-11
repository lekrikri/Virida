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
  const { scene } = useGLTF(serreModelPath);
  
  useEffect(() => {
    // Configuration pour les reflets
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1, 1); // Taille minimale pour éviter les erreurs
    
    // Ajuster les matériaux si nécessaire
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Fonction pour appliquer l'effet plexiglas/verre aux matériaux marron/mauves
        const applyGlassEffect = (material: THREE.Material) => {
          // Vérifier si c'est un matériau avec couleur
          if ('color' in material && material.color instanceof THREE.Color) {
            const color = material.color;
            
            // Détecter les couleurs marron/mauves (valeurs ajustées pour le modèle)
            // Valeurs RGB pour les tons marron/mauve
            const isBrownOrPurple = (
              // Détection plus large des tons marron/mauve
              (color.r > 0.3 && color.g < 0.3 && color.b < 0.3) || // Marron
              (color.r > 0.2 && color.g < 0.2 && color.b > 0.2) || // Mauve
              (color.r > 0.3 && color.g > 0.2 && color.g < 0.5 && color.b < 0.4) // Marron clair
            );
            
            if (isBrownOrPurple) {
              // Appliquer l'effet plexiglas/verre
              material.transparent = true;
              material.opacity = 0.12; // Extrêmement transparent
              
              // Appliquer des propriétés spécifiques selon le type de matériau
              if (material instanceof THREE.MeshStandardMaterial) {
                // Propriétés spécifiques au matériau standard
                material.roughness = 0.1;
                material.metalness = 0.2;
              }
              
              if (material instanceof THREE.MeshPhongMaterial) {
                // Propriétés spécifiques au matériau phong
                material.shininess = 100;
                material.specular = new THREE.Color(0xffffff);
              }
              
              // Ajouter une légère teinte bleutée pour l'effet verre
              // Utiliser une couleur légèrement bleutée pour l'effet verre
              const glassColor = new THREE.Color(0xc4e0f9); // Bleu très pâle
              material.color.lerp(glassColor, 0.7); // Mélanger avec la couleur existante
            } else {
              // Pour les autres matériaux (structure), les garder opaques
              material.transparent = false;
              material.opacity = 1.0;
            }
          }
        };
        
        // Appliquer aux matériaux
        if (child.material instanceof THREE.Material) {
          applyGlassEffect(child.material);
        } else if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat instanceof THREE.Material) {
              applyGlassEffect(mat);
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
