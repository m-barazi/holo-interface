import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import type { AvatarTransform } from '@holo/shared';

/**
 * Rotierender Holo-Ring + Partikel-Halo rund um den Avatar.
 * Rein dekorativ; orientiert sich an brightness/opacity aus dem Transform.
 */
export function HoloRing({ transform }: { transform: AvatarTransform }) {
  const ring1 = useRef<Mesh>(null);
  const ring2 = useRef<Mesh>(null);
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.6;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.4;
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  const opacity = transform.opacity * 0.5 * transform.brightness;

  return (
    <group ref={group} position={[transform.posX, transform.posY, 0]}>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.012, 16, 96]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={opacity} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.85, 0.008, 16, 96]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={opacity * 0.7} />
      </mesh>
    </group>
  );
}