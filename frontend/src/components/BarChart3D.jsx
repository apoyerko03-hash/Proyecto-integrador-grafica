import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { motion } from 'framer-motion'

function Bar({
  position,
  height,
  color,
  label,
  value,
}) {
  const meshRef = useRef()

  const [hovered, setHovered] = useState(false)

  const barColor = hovered ? '#ffffff' : color

  return (
    <group position={position}>
      {/* BARRA */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.6, height, 0.6]} />

        <meshStandardMaterial
          color={barColor}
          emissive={barColor}
          emissiveIntensity={hovered ? 0.35 : 0.1}
          metalness={0.25}
          roughness={0.45}
        />
      </mesh>

      {/* CAPA SUPERIOR */}
      <mesh position={[0, height + 0.03, 0]}>
        <boxGeometry args={[0.62, 0.05, 0.62]} />

        <meshStandardMaterial
          color={barColor}
          emissive={barColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* LABEL */}
      <Text
        position={[0, -0.35, 0]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>

      {/* VALOR */}
      {hovered && (
        <Text
          position={[0, height + 0.35, 0]}
          fontSize={0.22}
          color="#01c38e"
          anchorX="center"
          anchorY="bottom"
        >
          {value}
        </Text>
      )}
    </group>
  )
}

function GridFloor() {
  return (
    <gridHelper
      args={[12, 12, '#01c38e', '#334155']}
      position={[0, 0, 0]}
    />
  )
}

function Scene({ data }) {
  const colors = [
    '#01c38e',
    '#63b3ed',
    '#fbbf24',
    '#f87171',
    '#a78bfa',
    '#34d399',
  ]

  const maxVal = Math.max(
    ...data.map((d) => d.value),
    1
  )

  const spacing = 1.2

  const totalWidth =
    (data.length - 1) * spacing

  return (
    <group>
      <GridFloor />

      {data.map((d, i) => {
        const normalizedHeight =
          (d.value / maxVal) * 3.5 + 0.2

        return (
          <Bar
            key={d.label}
            position={[
              i * spacing - totalWidth / 2,
              0,
              0,
            ]}
            height={normalizedHeight}
            color={colors[i % colors.length]}
            label={d.label}
            value={d.value}
          />
        )
      })}
    </group>
  )
}

export default function BarChart3D({
  data = [],
  title = 'Gráfico 3D',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="p-5 rounded-2xl border border-white/10 bg-[#111827]"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">
          {title}
        </h3>

        <span className="text-[10px] px-2 py-1 rounded-full border border-[#01c38e]/30 text-[#01c38e] bg-[#01c38e]/10 font-mono">
          3D LIVE
        </span>
      </div>

      {/* CANVAS */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          height: 280,
          background:
            'linear-gradient(to bottom, #0f172a, #111827)',
        }}
      >
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            powerPreference: 'default',
          }}
          camera={{
            position: [0, 3, 7],
            fov: 45,
          }}
        >
          {/* LUCES */}
          <ambientLight intensity={0.55} />

          <directionalLight
            position={[5, 8, 5]}
            intensity={1.1}
          />

          <pointLight
            position={[-4, 4, -4]}
            intensity={0.4}
            color="#01c38e"
          />

          {/* ESCENA */}
          <Scene data={data} />

          {/* CONTROLES */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={false}
            enableDamping={false}
          />
        </Canvas>
      </div>

      {/* LEYENDA */}
      <div className="flex flex-wrap gap-3 mt-4">
        {data.map((d, i) => {
          const colors = [
            '#01c38e',
            '#63b3ed',
            '#fbbf24',
            '#f87171',
            '#a78bfa',
            '#34d399',
          ]

          return (
            <div
              key={d.label}
              className="flex items-center gap-2"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    colors[i % colors.length],
                }}
              />

              <span className="text-xs text-white/60 font-mono">
                {d.label}:{' '}
                <span className="text-white">
                  {d.value}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}