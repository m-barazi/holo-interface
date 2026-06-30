'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { AvatarModel } from './AvatarModel';
import { HoloRing } from './HoloRing';
import type { AvatarCommand, AvatarTransform } from '@holo/shared';

export interface AvatarSceneProps {
  command: AvatarCommand;
  transform: AvatarTransform;
  glbUrl?: string;
  className?: string;
}

/**
 * R3F-Canvas mit Holo-Avatar + Ring. Wird clientseitig im
 * Assistent-View gerendert. Drei.js-Initialisierung passiert
 * ausschließlich im Browser (kein SSR von WebGL).
 */
export function AvatarScene({ command, transform, glbUrl, className }: AvatarSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0.4, 3.2], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 3, 2]} intensity={1.2} color="#22D3EE" />
        <pointLight position={[-2, 1, 1]} intensity={0.8} color="#A855F7" />
        <Suspense fallback={null}>
          <AvatarModel command={command} transform={transform} glbUrl={glbUrl} />
          <HoloRing transform={transform} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}