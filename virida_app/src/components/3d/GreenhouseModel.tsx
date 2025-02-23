import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const GreenhouseModel: React.FC = () => {
  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#88c9a1" transparent opacity={0.6} />
      </mesh>
      <OrbitControls />
    </Canvas>
  );
};

export default GreenhouseModel;
