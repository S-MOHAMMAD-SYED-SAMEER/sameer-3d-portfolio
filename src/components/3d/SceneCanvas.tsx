import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, type ReactNode } from 'react'

interface SceneCanvasProps {
  children: ReactNode
}

/**
 * The single WebGL boundary for the whole application.
 *
 * Nothing above this component touches Three.js, and nothing inside it
 * renders DOM UI — overlays are ordinary DOM siblings positioned over the
 * canvas. Mount this only on routes that need 3D so that leaving the
 * experience unmounts the renderer and frees the GPU context.
 */
export function SceneCanvas({ children }: SceneCanvasProps) {
  return (
    <Canvas
      // Cap the pixel ratio so high-DPI phones do not render 3x the pixels.
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      className="absolute inset-0"
    >
      <Suspense fallback={null}>{children}</Suspense>
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  )
}
