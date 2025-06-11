/// <reference types="vite/client" />

// Déclaration pour les fichiers GLTF
declare module '*.gltf' {
  const src: string;
  export default src;
}
