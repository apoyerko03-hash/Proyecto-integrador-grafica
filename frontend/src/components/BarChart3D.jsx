import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

function Bar({ position, height, color, label, value, index }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const targetHeight = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    targetHeight.current += (height - targetHeight.current) * 0.08;
    meshRef.current.scale.y = Math.max(targetHeight.current, 0.01);
    meshRef.current.position.y = (targetHeight.current * height) / 2;
  });

  const barColor = hovered ? '#ffffff' : color;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial
          color={barColor}
          emissive={barColor}
          emissiveIntensity={hovered ? 0.4 : 0.15}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {/* Top glow cap */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[0.62, 0.06, 0.62]} />
        <meshStandardMaterial color={barColor} emissive={barColor} emissiveIntensity={0.8} />
      </mesh>
      {/* Label below */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.22}
        color="rgba(255,255,255,0.5)"
        anchorX="center"
        anchorY="top"
        font={undefined}
      >
        {label}
      </Text>
      {/* Value above */}
      {hovered && (
        <Text
          position={[0, height + 0.4, 0]}
          fontSize={0.25}
          color="#01c38e"
          anchorX="center"
          anchorY="bottom"
        >
          {value}
        </Text>
      )}
    </group>
  );
}

function GridFloor() {
  return (
    <gridHelper
      args={[10, 10, 'rgba(1,195,142,0.15)', 'rgba(255,255,255,0.04)']}
      position={[0, -0.01, 0]}
    />
  );
}

function Scene({ data }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const colors = ['#01c38e', '#63b3ed', '#fbbf24', '#f87171', '#a78bfa', '#34d399'];
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const spacing = 1.1;
  const totalWidth = (data.length - 1) * spacing;

  return (
    <group ref={groupRef}>
      <GridFloor />
      {data.map((d, i) => (
        <Bar
          key={d.label}
          position={[i * spacing - totalWidth / 2, 0, 0]}
          height={(d.value / maxVal) * 3.5 + 0.2}
          color={colors[i % colors.length]}
          label={d.label}
          value={d.value}
          index={i}
        />
      ))}
    </group>
  );
}

export default function BarChart3D({ data = [], title = 'Gráfico 3D' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-heading font-semibold text-sm">{title}</h3>
        <span className="text-[10px] text-accent-primary font-mono border border-accent-primary/20 px-2 py-0.5 rounded-full bg-accent-primary/5">
          3D LIVE
        </span>
      </div>

      <div style={{ height: 280, position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 3, 7], fov: 45 }}
          shadows
          style={{ borderRadius: 8, background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
          <pointLight position={[-4, 4, -4]} intensity={0.5} color="#01c38e" />
          <Scene data={data} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {data.map((d, i) => {
          const colors = ['#01c38e', '#63b3ed', '#fbbf24', '#f87171', '#a78bfa', '#34d399'];
          return (
            <div key={d.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
              <span className="text-xs text-white/50 font-mono">{d.label}: <span className="text-white/80">{d.value}</span></span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
