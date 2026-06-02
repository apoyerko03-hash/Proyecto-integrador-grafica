import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'

// Componente Planta3D: Visualización tridimensional de la planta de producción usando Three.js
export default function Planta3D({
  machines = [], // Lista de máquinas con su estado actual
  onMachineClick, // Callback para manejar el clic en una máquina
}) {
  const [selectedMachine, setSelectedMachine] = useState(null)

  // Coordenadas fijas para posicionar las máquinas en el espacio 3D
  const machinePositions = [
    [-4, 0, -2],
    [0, 0, -2],
    [4, 0, -2],
    [-4, 0, 2],
    [0, 0, 2],
    [4, 0, 2],
  ]

  // Etiquetas por defecto si no hay datos de máquinas
  const machineTypes = [
    'CNC Tornillo',
    'CNC Fresa',
    'Robot Soldadura',
    'Prensa',
    'Empaquetadora',
    'Almacén',
  ]

  // Sub-componente que representa una máquina individual en el espacio 3D
  const Machine = ({ position, machine, index }) => {
    const handleClick = () => {
      setSelectedMachine(machine)

      if (onMachineClick) {
        onMachineClick(machine)
      }
    }

    // El color de la máquina cambia dinámicamente según su estado operativo
    const color =
      machine?.estado === 'Activo'
        ? '#01c38e' // Verde para activo
        : machine?.estado === 'Mantenimiento'
        ? '#ffb400' // Naranja para mantenimiento
        : '#64748b' // Gris para inactivo

    return (
      <group position={position} onClick={handleClick}>
        {/* BASE de la máquina (Plataforma inferior) */}
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[1.5, 0.2, 1.5]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* CUERPO de la máquina (Bloque principal) */}
        <mesh>
          <boxGeometry args={[1, 1.2, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* LUZ indicadora (Esfera con efecto de emisión de luz) */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
          />
        </mesh>

        {/* TEXTO flotante con el nombre de la máquina */}
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.22}
          color="white"
          anchorX="center"
        >
          {machine?.nombre || machineTypes[index]}
        </Text>
      </group>
    )
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-white/10">
      {/* Contenedor del Canvas de Three.js */}
      <Canvas camera={{ position: [0, 8, 10], fov: 45 }}>
        {/* ILUMINACIÓN de la escena */}
        <ambientLight intensity={0.7} /> {/* Luz ambiental suave */}

        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
        /> {/* Luz direccional que genera sombras y relieve */}

        {/* PISO de la fábrica */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Renderizado dinámico de MAQUINAS basado en las posiciones predefinidas */}
        {machinePositions.map((position, index) => (
          <Machine
            key={index}
            position={position}
            index={index}
            machine={machines[index]}
          />
        ))}

        {/* Controles de órbita para que el usuario pueda rotar y hacer zoom */}
        <OrbitControls />
      </Canvas>

      {/* PANEL INFORMATIVO (Overlay HTML que aparece al seleccionar una máquina) */}
      {selectedMachine && (
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white w-72">
          <h3 className="text-lg font-bold mb-2">
            {selectedMachine.nombre}
          </h3>

          <p className="text-sm text-white/70 mb-1">
            Estado: {selectedMachine.estado || 'Desconocido'}
          </p>

          <p className="text-sm text-white/70 mb-1">
            Operador:{' '}
            {selectedMachine.operador || 'No asignado'}
          </p>

          {selectedMachine.eficiencia && (
            <p className="text-sm text-white/70">
              Eficiencia:{' '}
              {(selectedMachine.eficiencia * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}
    </div>
  )
}