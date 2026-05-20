import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, MeshStandardMaterial, Group, Text, Font, AmbientLight, DirectionalLight, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

export default function Planta3D({ machines = [], onMachineClick }) {
  const [hoveredMachine, setHoveredMachine] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const cameraRef = useRef();
  
  // Create machine positions in a factory layout
  const machinePositions = [
    { x: -4, y: 0, z: -2 }, // CNC Tornillo
    { x: 0, y: 0, z: -2 },  // CNC Fresa
    { x: 4, y: 0, z: -2 },  // Robot Soldadura
    { x: -4, y: 0, z: 2 },  // Prensa Hidráulica
    { x: 0, y: 0, z: 2 },   // Empaquetadora
    { x: 4, y: 0, z: 2 }    // Almacén
  ];

  const machineTypes = [
    { name: 'CNC Tornillo 1', color: '#01c38e', icon: 'cog' },
    { name: 'CNC Fresa 2', color: '#01c38e', icon: 'cog' },
    { name: 'Robot Soldadura 3', color: '#01c38e', icon: 'robot' },
    { name: 'Prensa Hidráulica 4', color: '#01c38e', icon: 'triangle' },
    { name: 'Empaquetadora Automática 5', color: '#01c38e', icon: 'box' },
    { name: 'Almacén de Productos', color: '#64748b', icon: 'package' }
  ];

  // Create a simple factory floor
  const FactoryFloor = () => (
    <Mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      scale={[10, 1, 10]}
    >
      <BoxGeometry args={[10, 1, 10]} />
      <MeshStandardMaterial 
        color="#0f172a" 
        roughness={0.8} 
        metalness={0.2}
      />
    </Mesh>
  );

  // Create a machine station
  const MachineStation = ({ index, machineData }) => {
    const [hovered, setHover] = useState(false);
    const [hoverClass, set] = useSpring(() => ({ scale: 1 }));
    const [color, setColor] = useSpring(() => ({ color: '#01c38e' }));
    
    // Update spring values based on hover state
    useEffect(() => {
      set({ scale: hovered ? 1.1 : 1 });
    }, [hovered]);
    
    useEffect(() => {
      const baseColor = machineData?.color || machineTypes[index]?.color || '#01c38e';
      setColor({ color: hovered ? baseColor : baseColor });
    }, [hovered, machineData, index]);

    const handleClick = () => {
      setSelectedMachine(machineData || machineTypes[index]);
      if (onMachineClick) {
        onMachineClick(machineData || machineTypes[index]);
      }
    };

    const handlePointerOver = () => {
      setHoveredMachine(machineData?.nombre || machineTypes[index].name);
      setHover(true);
      setHoverClass({ scale: 1.1 });
    };

    const handlePointerOut = () => {
      setHoveredMachine(null);
      setHover(false);
      setHoverClass({ scale: 1 });
    };

    const statusColor = machineData?.estado === 'Activo' 
      ? '#01c38e' 
      : machineData?.estado === 'Mantenimiento' 
        ? '#ffb400' 
        : '#ff4d4d';

    return (
      <Group
        position={machinePositions[index]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        cursor="pointer"
      >
        {/* Machine Base */}
        <Mesh 
          scale={[1.2, 0.2, 1.2]}
          color={hovered ? '#01c38e' : '#334155'}
        >
          <BoxGeometry />
          <MeshStandardMaterial 
            color={hovered ? '#01c38e' : '#334155'}
            opacity={0.8}
          />
        </Mesh>
        
        {/* Machine Body */}
        <Mesh 
          scale={[1, 1.5, 1]}
          color={machineData?.color || machineTypes[index].color || '#01c38e'}
        >
          <BoxGeometry />
          <MeshStandardMaterial 
            color={machineData?.color || machineTypes[index].color || '#01c38e'}
            metalness={0.3}
            roughness={0.4}
          />
        </Mesh>
        
        {/* Machine Details */}
        <Group position={[0, 0.9, 0]}>
          {/* Status Indicator */}
          <Mesh 
            scale={[0.3, 0.3, 0.3]}
            position={[0, 0.6, 0]}
          >
            <SphereGeometry />
            <MeshStandardMaterial 
              color={statusColor}
              emissive={statusColor}
              emissiveIntensity={0.5}
            />
          </Mesh>
          
          {/* Machine Icon (simplified) */}
          <Mesh 
            scale={[0.6, 0.1, 0.6]}
            position={[0, 0.2, 0]}
          >
            <BoxGeometry />
            <MeshStandardMaterial 
              color="#1e293b"
            />
          </Mesh>
        </Group>
        
        {/* Machine Label */}
        <mesh>
          <text 
            position={[0, -0.8, 0.1]}
            rotation={[0, 0, 0]}
            fontSize={0.2}
          >
            <string>{machineData?.nombre || machineTypes[index].name}</string>
          </text>
          <MeshStandardMaterial 
            color="#ffffff"
            opacity={0.9}
          />
        </mesh>
      </Group>
    );
  };

  return (
    <div className="relative">
      <Canvas 
        camera={{ position: [0, 8, 12], fov: 45 }}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Lights */}
        <AmbientLight intensity={0.6} color="#ffffff" />
        <DirectionalLight 
          position={[10, 10, 5]} 
          intensity={0.8} 
          color="#ffffff"
          castShadow
        />
        <SpotLight 
          position={[0, 15, 0]} 
          target={[0, 0, 0]}
          intensity={1.2}
          color="#ffffff"
          penumbra={0.5}
          castShadow
        />
        
        {/* Factory Floor */}
        <FactoryFloor />
        
        {/* Machine Stations */}
        {machinePositions.map((pos, index) => (
          <MachineStation 
            key={index} 
            index={index} 
            machineData={machines[index] || null}
          />
        ))}
        
        {/* Hover Info Panel */}
        {hoveredMachine && (
          <div 
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-card-primary/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-center font-medium text-sm whitespace-nowrap"
          >
            {hoveredMachine}
          </div>
        )}
        
        {/* Selected Machine Info Panel */}
        {selectedMachine && (
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card-primary/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg max-w-xs text-center font-medium"
          >
            <div className="font-bold text-accent-primary mb-2">
              {selectedMachine.nombre}
            </div>
            <div className="text-white/80 mb-2">
              Estado: {selectedMachine.estado || 'Desconocido'}
            </div>
            <div className="text-white/80 mb-2">
              Operador: {selectedMachine.operador || 'Asignar operador'}
            </div>
            {selectedMachine.eficiencia !== undefined && (
              <div className="text-white/80 mb-2">
                Eficiencia: {(selectedMachine.eficiencia * 100).toFixed(1)}%
              </div>
            )}
            {selectedMachine.produccionHoy !== undefined && (
              <div className="text-white/80">
                Producción hoy: {selectedMachine.produccionHoy} unidades
              </div>
            )}
          </div>
        )}
      </Canvas>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white/70 px-3 py-1 rounded text-xs">
        Haz clic en una máquina para ver detalles
      </div>
    </div>
  );
}