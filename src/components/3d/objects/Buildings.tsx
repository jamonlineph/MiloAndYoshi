import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HouseProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  roofColor?: string;
  hasChimney?: boolean;
}

/* ─────────────────────────── HOUSE ─────────────────────────── */
export function House({ position = [0, 0, 0], rotation = [0, 0, 0], color = "#FDFBF7", roofColor = "#D93D4A", hasChimney = false }: HouseProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main Base */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0, 2, 1, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.9} />
      </mesh>

      {/* Chimney */}
      {hasChimney && (
        <group position={[0.6, 2.8, -0.4]}>
          <mesh castShadow receiveShadow>
             <boxGeometry args={[0.3, 0.8, 0.3]} />
             <meshStandardMaterial color="#8C6B52" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
             <boxGeometry args={[0.4, 0.1, 0.4]} />
             <meshStandardMaterial color="#6B5440" roughness={0.9} />
          </mesh>
          {/* Static smoke puffs above chimney */}
          <mesh position={[0, 0.7, 0]}>
             <sphereGeometry args={[0.12, 6, 6]} />
             <meshStandardMaterial color="#FDFBF7" transparent opacity={0.4} depthWrite={false} />
          </mesh>
          <mesh position={[0.06, 1.0, 0.03]}>
             <sphereGeometry args={[0.1, 6, 6]} />
             <meshStandardMaterial color="#FDFBF7" transparent opacity={0.25} depthWrite={false} />
          </mesh>
          <mesh position={[-0.04, 1.3, -0.02]}>
             <sphereGeometry args={[0.08, 6, 6]} />
             <meshStandardMaterial color="#FDFBF7" transparent opacity={0.12} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* Door */}
      <mesh position={[0, 0.6, 1.01]} castShadow>
        <boxGeometry args={[0.6, 1.2, 0.05]} />
        <meshStandardMaterial color="#8C6B52" roughness={0.9} />
      </mesh>
      {/* Doorknob */}
      <mesh position={[0.2, 0.6, 1.06]} castShadow>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Welcome mat */}
      <mesh position={[0, 0.01, 1.35]} receiveShadow>
        <boxGeometry args={[0.7, 0.02, 0.35]} />
        <meshStandardMaterial color="#A68A72" roughness={1.0} />
      </mesh>

      {/* ── Right Window ── */}
      <group position={[0.6, 1.2, 1.01]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial color="#E8DCC4" roughness={0.2} />
        </mesh>
        {/* Window cross */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.42, 0.05, 0.02]} />
          <meshStandardMaterial color="#6B5440" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.05, 0.52, 0.02]} />
          <meshStandardMaterial color="#6B5440" roughness={0.9} />
        </mesh>
        {/* Shutters */}
        <mesh position={[-0.28, 0, 0.01]} castShadow>
          <boxGeometry args={[0.12, 0.52, 0.03]} />
          <meshStandardMaterial color="#4A6B82" roughness={0.9} />
        </mesh>
        <mesh position={[0.28, 0, 0.01]} castShadow>
          <boxGeometry args={[0.12, 0.52, 0.03]} />
          <meshStandardMaterial color="#4A6B82" roughness={0.9} />
        </mesh>
        {/* Window glow */}
        <pointLight position={[0, 0, -0.3]} color="#F6E5C8" intensity={0.3} distance={3} />
        {/* Window ledge / planter */}
        <mesh position={[0, -0.28, 0.1]} castShadow>
           <boxGeometry args={[0.5, 0.15, 0.2]} />
           <meshStandardMaterial color="#8C6B52" />
        </mesh>
        <mesh position={[-0.1, -0.2, 0.1]}>
           <sphereGeometry args={[0.1]} />
           <meshStandardMaterial color="#7C9982" />
        </mesh>
        <mesh position={[0.1, -0.2, 0.1]}>
           <sphereGeometry args={[0.08]} />
           <meshStandardMaterial color="#7C9982" />
        </mesh>
      </group>

      {/* ── Left Window ── */}
      <group position={[-0.6, 1.2, 1.01]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial color="#E8DCC4" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.42, 0.05, 0.02]} />
          <meshStandardMaterial color="#6B5440" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.05, 0.52, 0.02]} />
          <meshStandardMaterial color="#6B5440" roughness={0.9} />
        </mesh>
        {/* Shutters */}
        <mesh position={[-0.28, 0, 0.01]} castShadow>
          <boxGeometry args={[0.12, 0.52, 0.03]} />
          <meshStandardMaterial color="#4A6B82" roughness={0.9} />
        </mesh>
        <mesh position={[0.28, 0, 0.01]} castShadow>
          <boxGeometry args={[0.12, 0.52, 0.03]} />
          <meshStandardMaterial color="#4A6B82" roughness={0.9} />
        </mesh>
        {/* Window glow */}
        <pointLight position={[0, 0, -0.3]} color="#F6E5C8" intensity={0.3} distance={3} />
        {/* Planter */}
        <mesh position={[0, -0.28, 0.1]} castShadow>
           <boxGeometry args={[0.5, 0.15, 0.2]} />
           <meshStandardMaterial color="#8C6B52" />
        </mesh>
      </group>

      {/* ── Small front fence ── */}
      <group position={[0, 0, 1.6]}>
        {/* Fence posts */}
        <mesh position={[-0.8, 0.25, 0]} castShadow>
          <boxGeometry args={[0.06, 0.5, 0.06]} />
          <meshStandardMaterial color="#A68A72" roughness={0.9} />
        </mesh>
        <mesh position={[-0.4, 0.25, 0]} castShadow>
          <boxGeometry args={[0.06, 0.5, 0.06]} />
          <meshStandardMaterial color="#A68A72" roughness={0.9} />
        </mesh>
        <mesh position={[0.4, 0.25, 0]} castShadow>
          <boxGeometry args={[0.06, 0.5, 0.06]} />
          <meshStandardMaterial color="#A68A72" roughness={0.9} />
        </mesh>
        <mesh position={[0.8, 0.25, 0]} castShadow>
          <boxGeometry args={[0.06, 0.5, 0.06]} />
          <meshStandardMaterial color="#A68A72" roughness={0.9} />
        </mesh>
        {/* Horizontal rails — left section */}
        <mesh position={[-0.6, 0.35, 0]} castShadow>
          <boxGeometry args={[0.4, 0.04, 0.04]} />
          <meshStandardMaterial color="#8C6B52" />
        </mesh>
        <mesh position={[-0.6, 0.18, 0]} castShadow>
          <boxGeometry args={[0.4, 0.04, 0.04]} />
          <meshStandardMaterial color="#8C6B52" />
        </mesh>
        {/* Horizontal rails — right section */}
        <mesh position={[0.6, 0.35, 0]} castShadow>
          <boxGeometry args={[0.4, 0.04, 0.04]} />
          <meshStandardMaterial color="#8C6B52" />
        </mesh>
        <mesh position={[0.6, 0.18, 0]} castShadow>
          <boxGeometry args={[0.4, 0.04, 0.04]} />
          <meshStandardMaterial color="#8C6B52" />
        </mesh>
      </group>
    </group>
  );
}

/* ─────────────────────────── BAKERY ─────────────────────────── */
export function Bakery({ position = [0, 0, 0], rotation = [0, 0, 0] }: HouseProps) {
  const smokeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
      const time = state.clock.elapsedTime;
      if (smokeRef.current) {
          smokeRef.current.children.forEach((child, i) => {
              const particle = child as THREE.Mesh;
              particle.position.y += 0.008 + i * 0.001;
              particle.position.x = Math.sin(time * 1.5 + i * 1.2) * 0.12;
              particle.position.z = Math.cos(time * 1.1 + i * 0.8) * 0.06;

              const progress = particle.position.y / 2.5;
              particle.scale.setScalar(Math.max(0.05, 1 - progress * 0.8));

              const mat = (particle.material as THREE.MeshStandardMaterial);
              if (mat) {
                  mat.opacity = Math.max(0.05, 0.5 - progress * 0.4);
              }

              if (particle.position.y > 2.5) {
                  particle.position.y = 0;
                  particle.position.x = 0;
                  particle.position.z = 0;
              }
          });
      }
  });

  return (
      <group position={position} rotation={rotation}>
          <House color="#E8DCC4" roofColor="#A94F2B" hasChimney />

          {/* Interior warm glow */}
          <pointLight position={[0, 1, 0.5]} color="#F6E5C8" intensity={0.4} distance={4} />

          {/* Awning */}
          <group position={[0, 1.8, 1.3]} rotation={[-0.3, 0, 0]}>
             <mesh castShadow>
                <boxGeometry args={[2.2, 0.8, 0.1]} />
                <meshStandardMaterial color="#D93D4A" />
             </mesh>
             {/* Stripes */}
             <mesh position={[-0.5, 0, 0.02]} castShadow>
                <boxGeometry args={[0.4, 0.8, 0.1]} />
                <meshStandardMaterial color="#FDFBF7" />
             </mesh>
             <mesh position={[0.5, 0, 0.02]} castShadow>
                <boxGeometry args={[0.4, 0.8, 0.1]} />
                <meshStandardMaterial color="#FDFBF7" />
             </mesh>
          </group>

          {/* ── Hanging Wooden Sign on chain ── */}
          <group position={[1.15, 1.6, 1.05]}>
              {/* Bracket arm */}
              <mesh position={[0.15, 0, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.04, 0.04]} />
                  <meshStandardMaterial color="#3C2A1E" />
              </mesh>
              {/* Chain links */}
              <mesh position={[0.25, -0.1, 0]} castShadow>
                  <boxGeometry args={[0.03, 0.12, 0.03]} />
                  <meshStandardMaterial color="#8B919E" metalness={0.5} />
              </mesh>
              <mesh position={[0.25, -0.2, 0]} castShadow>
                  <boxGeometry args={[0.03, 0.08, 0.03]} />
                  <meshStandardMaterial color="#8B919E" metalness={0.5} />
              </mesh>
              {/* Sign board */}
              <mesh position={[0.25, -0.4, 0]} rotation={[0, 0, -0.05]} castShadow>
                  <boxGeometry args={[0.5, 0.35, 0.04]} />
                  <meshStandardMaterial color="#6B5440" />
              </mesh>
              {/* Sign text area */}
              <mesh position={[0.25, -0.4, 0.025]} rotation={[0, 0, -0.05]}>
                  <boxGeometry args={[0.4, 0.25, 0.01]} />
                  <meshStandardMaterial color="#F6E5C8" />
              </mesh>
          </group>

          {/* ── Bread Display — varied bread shapes ── */}
          <group position={[0, 0.5, 1.4]}>
              <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.5, 0.6, 0.6]} />
                  <meshStandardMaterial color="#8C6B52" />
              </mesh>
              {/* Round loaf */}
              <mesh position={[-0.5, 0.35, 0]} castShadow>
                  <sphereGeometry args={[0.15, 8, 8]} />
                  <meshStandardMaterial color="#E8A95B" />
              </mesh>
              {/* Darker roll */}
              <mesh position={[-0.15, 0.35, 0]} castShadow>
                  <sphereGeometry args={[0.12, 8, 8]} />
                  <meshStandardMaterial color="#A94F2B" />
              </mesh>
              {/* Croissant — torus */}
              <mesh position={[0.15, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <torusGeometry args={[0.08, 0.04, 6, 8, Math.PI * 1.4]} />
                  <meshStandardMaterial color="#E8A95B" />
              </mesh>
              {/* Baguette — elongated capsule */}
              <mesh position={[0.5, 0.38, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
                  <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
                  <meshStandardMaterial color="#D9773F" />
              </mesh>
          </group>

          {/* ── Outdoor Table with Umbrella ── */}
          <group position={[-1.8, 0, 0.8]}>
              {/* Table top */}
              <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.8, 0.06, 0.6]} />
                  <meshStandardMaterial color="#A68A72" />
              </mesh>
              {/* Table legs */}
              <mesh position={[-0.3, 0.3, -0.2]} castShadow>
                  <boxGeometry args={[0.06, 0.6, 0.06]} />
                  <meshStandardMaterial color="#8C6B52" />
              </mesh>
              <mesh position={[0.3, 0.3, -0.2]} castShadow>
                  <boxGeometry args={[0.06, 0.6, 0.06]} />
                  <meshStandardMaterial color="#8C6B52" />
              </mesh>
              <mesh position={[-0.3, 0.3, 0.2]} castShadow>
                  <boxGeometry args={[0.06, 0.6, 0.06]} />
                  <meshStandardMaterial color="#8C6B52" />
              </mesh>
              <mesh position={[0.3, 0.3, 0.2]} castShadow>
                  <boxGeometry args={[0.06, 0.6, 0.06]} />
                  <meshStandardMaterial color="#8C6B52" />
              </mesh>
              {/* Umbrella pole */}
              <mesh position={[0, 1.1, 0]} castShadow>
                  <cylinderGeometry args={[0.03, 0.03, 1.0, 6]} />
                  <meshStandardMaterial color="#6B5440" />
              </mesh>
              {/* Umbrella canopy */}
              <mesh position={[0, 1.65, 0]} castShadow>
                  <coneGeometry args={[0.6, 0.3, 8]} />
                  <meshStandardMaterial color="#D93D4A" />
              </mesh>
          </group>

          {/* ── Chalkboard Menu Sign ── */}
          <group position={[1.5, 0, 0.8]}>
              {/* Board */}
              <mesh position={[0, 0.5, 0]} rotation={[0, -0.3, 0]} castShadow>
                  <boxGeometry args={[0.5, 0.6, 0.04]} />
                  <meshStandardMaterial color="#211814" roughness={1.0} />
              </mesh>
              {/* Frame */}
              <mesh position={[0, 0.5, 0.025]} rotation={[0, -0.3, 0]} castShadow>
                  <boxGeometry args={[0.55, 0.04, 0.02]} />
                  <meshStandardMaterial color="#6B5440" />
              </mesh>
              <mesh position={[0, 0.78, 0.025]} rotation={[0, -0.3, 0]} castShadow>
                  <boxGeometry args={[0.55, 0.04, 0.02]} />
                  <meshStandardMaterial color="#6B5440" />
              </mesh>
              {/* A-frame legs */}
              <mesh position={[-0.12, 0.25, 0.15]} rotation={[0.25, -0.3, 0]} castShadow>
                  <boxGeometry args={[0.04, 0.5, 0.04]} />
                  <meshStandardMaterial color="#6B5440" />
              </mesh>
              <mesh position={[0.12, 0.25, 0.15]} rotation={[0.25, -0.3, 0]} castShadow>
                  <boxGeometry args={[0.04, 0.5, 0.04]} />
                  <meshStandardMaterial color="#6B5440" />
              </mesh>
              {/* Chalk scribble lines (decorative) */}
              <mesh position={[-0.05, 0.58, 0.025]} rotation={[0, -0.3, 0]}>
                  <boxGeometry args={[0.3, 0.02, 0.005]} />
                  <meshStandardMaterial color="#E8DCC4" />
              </mesh>
              <mesh position={[0.02, 0.52, 0.025]} rotation={[0, -0.3, 0]}>
                  <boxGeometry args={[0.25, 0.02, 0.005]} />
                  <meshStandardMaterial color="#E8DCC4" />
              </mesh>
              <mesh position={[-0.03, 0.46, 0.025]} rotation={[0, -0.3, 0]}>
                  <boxGeometry args={[0.28, 0.02, 0.005]} />
                  <meshStandardMaterial color="#E8DCC4" />
              </mesh>
          </group>

          {/* ── Smoke (6 particles with better fade) ── */}
          <group ref={smokeRef} position={[0.6, 3.4, -0.4]}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                  <mesh key={i} position={[0, i * 0.4, 0]}>
                      <sphereGeometry args={[0.18, 8, 8]} />
                      <meshStandardMaterial color="#FDFBF7" transparent opacity={0.5} depthWrite={false} />
                  </mesh>
              ))}
          </group>
      </group>
  );
}

/* ─────────────────────────── COURIER HUT ─────────────────────────── */
export function CourierHut({ position = [0, 0, 0], rotation = [0, 0, 0] }: HouseProps) {
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
      if (flagRef.current) {
          const time = state.clock.elapsedTime;
          flagRef.current.rotation.y = Math.sin(time * 2.5) * 0.3;
          flagRef.current.rotation.z = Math.sin(time * 3.0) * 0.1 + 0.1;
      }
  });

  return (
    <group position={position} rotation={rotation}>
       {/* Octagonal body */}
       <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
         <cylinderGeometry args={[1.4, 1.4, 1.6, 8]} />
         <meshStandardMaterial color="#FDFBF7" roughness={0.9} />
       </mesh>
       {/* Roof */}
       <mesh position={[0, 2, 0]} castShadow receiveShadow>
         <coneGeometry args={[1.8, 1.2, 8]} />
         <meshStandardMaterial color="#4A6B82" roughness={0.8} />
       </mesh>

       {/* Support beams */}
       {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
           <mesh key={i} position={[Math.sin(i * Math.PI / 4) * 1.45, 0.8, Math.cos(i * Math.PI / 4) * 1.45]} rotation={[0, i * Math.PI / 4, 0]}>
               <boxGeometry args={[0.1, 1.6, 0.1]} />
               <meshStandardMaterial color="#6B5440" />
           </mesh>
       ))}

       {/* Door */}
       <mesh position={[0, 0.6, 1.4]} castShadow>
         <boxGeometry args={[0.8, 1.2, 0.1]} />
         <meshStandardMaterial color="#8C6B52" />
       </mesh>
       {/* Door knob */}
       <mesh position={[0.25, 0.6, 1.48]} castShadow>
         <sphereGeometry args={[0.04, 6, 6]} />
         <meshStandardMaterial color="#D4AF37" metalness={0.6} roughness={0.3} />
       </mesh>

       {/* Paw print decoration on door */}
       <group position={[0, 1.0, 1.47]}>
           {/* Main pad */}
           <mesh>
               <sphereGeometry args={[0.06, 6, 6]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
           {/* Toes */}
           <mesh position={[-0.05, 0.07, 0]}>
               <sphereGeometry args={[0.03, 5, 5]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
           <mesh position={[0.05, 0.07, 0]}>
               <sphereGeometry args={[0.03, 5, 5]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
           <mesh position={[0, 0.08, 0]}>
               <sphereGeometry args={[0.025, 5, 5]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
       </group>

       {/* Mailbox attached */}
       <group position={[0.6, 0.6, 1.4]}>
          <mesh castShadow receiveShadow>
             <boxGeometry args={[0.3, 0.4, 0.3]} />
             <meshStandardMaterial color="#D93D4A" />
          </mesh>
          <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
             <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
             <meshStandardMaterial color="#D93D4A" />
          </mesh>
       </group>

       {/* ── Flag on top ── */}
       <group position={[0, 2.6, 0]}>
           {/* Pole */}
           <mesh position={[0, 0.3, 0]} castShadow>
               <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
               <meshStandardMaterial color="#6B5440" />
           </mesh>
           {/* Pole cap */}
           <mesh position={[0, 0.62, 0]} castShadow>
               <sphereGeometry args={[0.05, 6, 6]} />
               <meshStandardMaterial color="#D4AF37" metalness={0.5} />
           </mesh>
           {/* Flag (animated) — coral red game color */}
           <mesh ref={flagRef} position={[0.15, 0.48, 0]} castShadow>
               <boxGeometry args={[0.3, 0.18, 0.01]} />
               <meshStandardMaterial color="#D96C5B" side={THREE.DoubleSide} />
           </mesh>
       </group>

       {/* ── Lantern by door ── */}
       <group position={[-0.65, 1.0, 1.4]}>
           {/* Lantern frame */}
           <mesh castShadow>
               <boxGeometry args={[0.15, 0.22, 0.15]} />
               <meshStandardMaterial color="#3C2A1E" transparent opacity={0.6} />
           </mesh>
           {/* Corner posts of lantern */}
           <mesh position={[-0.06, 0, -0.06]} castShadow>
               <boxGeometry args={[0.02, 0.22, 0.02]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
           <mesh position={[0.06, 0, -0.06]} castShadow>
               <boxGeometry args={[0.02, 0.22, 0.02]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
           <mesh position={[-0.06, 0, 0.06]} castShadow>
               <boxGeometry args={[0.02, 0.22, 0.02]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
           <mesh position={[0.06, 0, 0.06]} castShadow>
               <boxGeometry args={[0.02, 0.22, 0.02]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
           {/* Lantern top */}
           <mesh position={[0, 0.14, 0]} castShadow>
               <coneGeometry args={[0.1, 0.08, 4]} />
               <meshStandardMaterial color="#3C2A1E" />
           </mesh>
           {/* Emissive glow sphere */}
           <mesh>
               <sphereGeometry args={[0.05, 6, 6]} />
               <meshStandardMaterial color="#E8A95B" emissive="#E8A95B" emissiveIntensity={0.8} />
           </mesh>
           {/* Light */}
           <pointLight color="#E8A95B" intensity={0.4} distance={3} />
       </group>

       {/* ── Porch / deck platform in front ── */}
       <group position={[0, 0, 1.8]}>
           <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
               <boxGeometry args={[1.4, 0.1, 0.6]} />
               <meshStandardMaterial color="#A68A72" roughness={0.9} />
           </mesh>
           {/* Plank lines */}
           <mesh position={[0, 0.11, 0]} receiveShadow>
               <boxGeometry args={[1.4, 0.005, 0.02]} />
               <meshStandardMaterial color="#8C6B52" />
           </mesh>
           <mesh position={[0, 0.11, 0.15]} receiveShadow>
               <boxGeometry args={[1.4, 0.005, 0.02]} />
               <meshStandardMaterial color="#8C6B52" />
           </mesh>
           <mesh position={[0, 0.11, -0.15]} receiveShadow>
               <boxGeometry args={[1.4, 0.005, 0.02]} />
               <meshStandardMaterial color="#8C6B52" />
           </mesh>
       </group>
    </group>
  );
}

/* ─────────────────────────── MARKET STALL ─────────────────────────── */
interface MarketStallProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    color?: string;
}

export function MarketStall({ position = [0, 0, 0], rotation = [0, 0, 0], color = "#D93D4A" }: MarketStallProps) {
    return (
        <group position={position} rotation={rotation}>
            {/* 4 Support posts */}
            <mesh position={[-1, 1.0, -0.6]} castShadow>
                <boxGeometry args={[0.1, 2.0, 0.1]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            <mesh position={[1, 1.0, -0.6]} castShadow>
                <boxGeometry args={[0.1, 2.0, 0.1]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            <mesh position={[-1, 1.0, 0.6]} castShadow>
                <boxGeometry args={[0.1, 2.0, 0.1]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            <mesh position={[1, 1.0, 0.6]} castShadow>
                <boxGeometry args={[0.1, 2.0, 0.1]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>

            {/* Striped canvas roof */}
            <mesh position={[0, 2.1, 0]} castShadow>
                <boxGeometry args={[2.4, 0.08, 1.5]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* White stripes */}
            <mesh position={[-0.6, 2.14, 0]}>
                <boxGeometry args={[0.4, 0.02, 1.5]} />
                <meshStandardMaterial color="#FDFBF7" />
            </mesh>
            <mesh position={[0.6, 2.14, 0]}>
                <boxGeometry args={[0.4, 0.02, 1.5]} />
                <meshStandardMaterial color="#FDFBF7" />
            </mesh>

            {/* Scalloped edge trim (front and back) */}
            {[-0.75, -0.25, 0.25, 0.75].map((x, i) => (
                <mesh key={`front-${i}`} position={[x, 2.02, 0.75]} castShadow>
                    <sphereGeometry args={[0.1, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                    <meshStandardMaterial color={i % 2 === 0 ? color : '#FDFBF7'} />
                </mesh>
            ))}
            {[-0.75, -0.25, 0.25, 0.75].map((x, i) => (
                <mesh key={`back-${i}`} position={[x, 2.02, -0.75]} rotation={[Math.PI, 0, 0]} castShadow>
                    <sphereGeometry args={[0.1, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                    <meshStandardMaterial color={i % 2 === 0 ? color : '#FDFBF7'} />
                </mesh>
            ))}

            {/* Display counter */}
            <mesh position={[0, 0.55, 0.5]} castShadow receiveShadow>
                <boxGeometry args={[2.0, 0.08, 0.6]} />
                <meshStandardMaterial color="#A68A72" />
            </mesh>
            {/* Counter front panel */}
            <mesh position={[0, 0.3, 0.75]} castShadow>
                <boxGeometry args={[2.0, 0.6, 0.06]} />
                <meshStandardMaterial color="#8C6B52" />
            </mesh>

            {/* Platform base */}
            <mesh position={[0, 0.02, 0]} receiveShadow>
                <boxGeometry args={[2.2, 0.04, 1.4]} />
                <meshStandardMaterial color="#A68A72" roughness={1.0} />
            </mesh>
        </group>
    );
}

/* ─────────────────────────── WOODEN ARCH ─────────────────────────── */
interface WoodenArchProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
}

export function WoodenArch({ position = [0, 0, 0], rotation = [0, 0, 0] }: WoodenArchProps) {
    const lanternRef = useRef<THREE.Group>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        if (lanternRef.current) {
            const time = state.clock.elapsedTime;
            lanternRef.current.rotation.z = Math.sin(time * 1.2 + initialOffset) * 0.06;
        }
    });

    return (
        <group position={position} rotation={rotation}>
            {/* Left post */}
            <mesh position={[-1.0, 1.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 2.8, 0.2]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            {/* Left post cap */}
            <mesh position={[-1.0, 2.85, 0]} castShadow>
                <boxGeometry args={[0.28, 0.1, 0.28]} />
                <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
            </mesh>

            {/* Right post */}
            <mesh position={[1.0, 1.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 2.8, 0.2]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            {/* Right post cap */}
            <mesh position={[1.0, 2.85, 0]} castShadow>
                <boxGeometry args={[0.28, 0.1, 0.28]} />
                <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
            </mesh>

            {/* Top beam */}
            <mesh position={[0, 2.9, 0]} castShadow>
                <boxGeometry args={[2.4, 0.15, 0.22]} />
                <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
            </mesh>

            {/* Cross beam decoration */}
            <mesh position={[0, 3.05, 0]} castShadow>
                <boxGeometry args={[2.6, 0.08, 0.15]} />
                <meshStandardMaterial color="#8C6B52" roughness={0.9} />
            </mesh>

            {/* Diagonal braces */}
            <mesh position={[-0.75, 2.5, 0]} rotation={[0, 0, 0.6]} castShadow>
                <boxGeometry args={[0.08, 0.6, 0.08]} />
                <meshStandardMaterial color="#8C6B52" />
            </mesh>
            <mesh position={[0.75, 2.5, 0]} rotation={[0, 0, -0.6]} castShadow>
                <boxGeometry args={[0.08, 0.6, 0.08]} />
                <meshStandardMaterial color="#8C6B52" />
            </mesh>

            {/* ── Hanging Lantern ── */}
            <group ref={lanternRef} position={[0, 2.7, 0]}>
                {/* Chain */}
                <mesh position={[0, -0.1, 0]}>
                    <boxGeometry args={[0.02, 0.2, 0.02]} />
                    <meshStandardMaterial color="#8B919E" metalness={0.5} />
                </mesh>
                {/* Lantern body */}
                <group position={[0, -0.32, 0]}>
                    {/* Frame */}
                    <mesh castShadow>
                        <boxGeometry args={[0.14, 0.2, 0.14]} />
                        <meshStandardMaterial color="#3C2A1E" transparent opacity={0.5} />
                    </mesh>
                    {/* Corner edges */}
                    <mesh position={[-0.06, 0, -0.06]}>
                        <boxGeometry args={[0.02, 0.2, 0.02]} />
                        <meshStandardMaterial color="#3C2A1E" />
                    </mesh>
                    <mesh position={[0.06, 0, -0.06]}>
                        <boxGeometry args={[0.02, 0.2, 0.02]} />
                        <meshStandardMaterial color="#3C2A1E" />
                    </mesh>
                    <mesh position={[-0.06, 0, 0.06]}>
                        <boxGeometry args={[0.02, 0.2, 0.02]} />
                        <meshStandardMaterial color="#3C2A1E" />
                    </mesh>
                    <mesh position={[0.06, 0, 0.06]}>
                        <boxGeometry args={[0.02, 0.2, 0.02]} />
                        <meshStandardMaterial color="#3C2A1E" />
                    </mesh>
                    {/* Lantern top */}
                    <mesh position={[0, 0.12, 0]} castShadow>
                        <coneGeometry args={[0.09, 0.08, 4]} />
                        <meshStandardMaterial color="#3C2A1E" />
                    </mesh>
                    {/* Glow sphere */}
                    <mesh>
                        <sphereGeometry args={[0.04, 6, 6]} />
                        <meshStandardMaterial color="#E8A95B" emissive="#E8A95B" emissiveIntensity={0.9} />
                    </mesh>
                    <pointLight color="#E8A95B" intensity={0.5} distance={4} />
                </group>
            </group>

            {/* Decorative vine/leaf accents */}
            <mesh position={[-0.85, 2.2, 0.12]} castShadow>
                <sphereGeometry args={[0.06, 5, 5]} />
                <meshStandardMaterial color="#4A9B6B" flatShading />
            </mesh>
            <mesh position={[-0.9, 2.0, 0.1]} castShadow>
                <sphereGeometry args={[0.05, 5, 5]} />
                <meshStandardMaterial color="#3C8259" flatShading />
            </mesh>
            <mesh position={[0.88, 2.3, -0.1]} castShadow>
                <sphereGeometry args={[0.055, 5, 5]} />
                <meshStandardMaterial color="#7C9982" flatShading />
            </mesh>
            <mesh position={[0.85, 2.1, -0.12]} castShadow>
                <sphereGeometry args={[0.05, 5, 5]} />
                <meshStandardMaterial color="#4A9B6B" flatShading />
            </mesh>
        </group>
    );
}
