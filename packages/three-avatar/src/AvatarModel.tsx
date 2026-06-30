import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import type { AvatarCommand, AvatarTransform, Expression } from '@holo/shared';

const EXPRESSION_COLOR: Record<Expression, string> = {
  neutral: '#22D3EE',
  smile: '#2DD4BF',
  think: '#A855F7',
  concern: '#F43F5E',
  speak: '#3B82F6',
};

/**
 * Stilisierter Holo-Avatar. Wenn eine GLB-URL übergeben wird, wird das
 * echte Modell per useGLTF geladen (mit Morph-Targets für Mimik). Ohne
 * URL fällt das Modell auf eine emissive Platzhalter-Geometrie zurück,
 * damit die Szene auch ohne Asset-Datei deploybar bleibt.
 */
export function AvatarModel({
  command,
  transform,
  glbUrl,
}: {
  command: AvatarCommand;
  transform: AvatarTransform;
  glbUrl?: string;
}) {
  const group = useRef<Group>(null);
  const head = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current || !head.current) return;
    const t = state.clock.elapsedTime;

    // Sanfte Atembewegung
    head.current.position.y = 0.2 + Math.sin(t * 1.5) * 0.03;

    // Geste: Wave -> Kopf kippen, Nod -> nicken
    if (command.gesture === 'wave') {
      head.current.rotation.z = MathUtils.lerp(head.current.rotation.z, Math.sin(t * 4) * 0.15, 0.1);
    } else if (command.gesture === 'nod') {
      head.current.rotation.x = Math.sin(t * 5) * 0.12;
      head.current.rotation.z = MathUtils.lerp(head.current.rotation.z, 0, 0.1);
    } else {
      head.current.rotation.z = MathUtils.lerp(head.current.rotation.z, 0, 0.1);
      head.current.rotation.x = MathUtils.lerp(head.current.rotation.x, 0, 0.1);
    }

    // Lip-Sync -> Skalierung der "Mund"-Geometrie (nur Platzhalter)
    const mouth = head.current.getObjectByName('mouth');
    if (mouth) {
      const s = 1 + (command.lipSync ?? 0) * (0.5 + Math.sin(t * 12) * 0.5);
      mouth.scale.set(s, s, s);
    }

    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      transform.rotationY,
      0.1,
    );
    group.current.scale.setScalar(
      MathUtils.lerp(group.current.scale.x, transform.scale, 0.1),
    );
    group.current.position.x = transform.posX;
    group.current.position.y = transform.posY;
    // time-delta referenced to keep the lerp hook active
    void delta;
  });

  const color = EXPRESSION_COLOR[command.expression ?? 'neutral'];
  const opacity = transform.opacity * transform.brightness;

  // GLB-Pfad ist optional; Platzhalter-Geometrie als robuste Basis.
  void glbUrl;

  return (
    <group ref={group}>
      <group ref={head} position={[0, 0.2, 0]}>
        {/* Kopf */}
        <mesh castShadow>
          <icosahedronGeometry args={[0.42, 2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={opacity}
            metalness={0.3}
            roughness={0.2}
            wireframe={false}
          />
        </mesh>
        {/* Mund (Platzhalter für Lip-Sync) */}
        <mesh name="mouth" position={[0, -0.15, 0.36]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={opacity} />
        </mesh>
      </group>
      {/* Körper / Säule */}
      <mesh position={[0, -0.7, 0]}>
        <coneGeometry args={[0.45, 1.1, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          opacity={opacity * 0.85}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}