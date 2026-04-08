import React, { useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

function Maquina({ urlModelo, hayAnomalia }) {
  const { scene } = useGLTF(urlModelo);

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        if (!child.userData.originalEmissive) {
          child.userData.originalEmissive = child.material.emissive.clone();
        }
        // Solo tocamos emissive, nunca el color base para no perder texturas
        if (hayAnomalia) {
          child.material.emissive.setHex(0xff2200);
          child.material.emissiveIntensity = 1.5;
        } else {
          child.material.emissive.copy(child.userData.originalEmissive);
          child.material.emissiveIntensity = 0;
        }
        child.material.needsUpdate = true;
      }
    });
  }, [clonedScene, hayAnomalia]);

  return (
    <primitive
      object={clonedScene}
      scale={6}
      position={[0, 0.2, 0]}
    />
  );
}

export default function GemeloDigital({ hayAnomalia }) {
  return (
    <div style={{ width: '30%', height: '480px', float: 'left' }}>
      <Canvas camera={{ position: [0, 1, 4], fov: 42 }} style={{ background: 'transparent' }} gl={{ alpha: true }}>

        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[0, 5, 0]} intensity={hayAnomalia ? 10 : 2} color={hayAnomalia ? 'red' : 'white'} />

        <Environment preset={hayAnomalia ? 'night' : 'warehouse'} />

        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <Maquina urlModelo="/mezcladora.glb" hayAnomalia={hayAnomalia} />
        </Float>

        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={8} blur={2} far={3} color={hayAnomalia ? '#ff0000' : '#888888'} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          autoRotate={!hayAnomalia}
          autoRotateSpeed={1.2}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/mezcladora.glb');