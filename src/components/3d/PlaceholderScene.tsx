import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

/**
 * Phase 1 placeholder. Exists only to prove the render loop, lighting and
 * per-frame animation are wired correctly — the real environment replaces
 * this entirely in a later phase.
 *
 * Animation is written straight to the object's transform. Never call
 * setState from useFrame: it would re-render React 60 times a second.
 */
export function PlaceholderScene() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_state, delta) => {
    const mesh = meshRef.current
    if (mesh === null) return

    mesh.rotation.x += delta * 0.15
    mesh.rotation.y += delta * 0.2
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />

      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial color="#5fe3c8" wireframe />
      </mesh>
    </>
  )
}
