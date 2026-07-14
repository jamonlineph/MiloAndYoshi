import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore';
import { RoundedBox } from '@react-three/drei';
import { FabricMaterial, FurMaterial, LeatherMaterial } from './CharacterMaterials';

interface YoshiModelProps {
  velocityRef: React.MutableRefObject<THREE.Vector3>;
  isGrounded: boolean;
}

export function YoshiModel({ velocityRef, isGrounded }: YoshiModelProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const legFL = useRef<THREE.Group>(null);
  const legFR = useRef<THREE.Group>(null);
  const legBL = useRef<THREE.Group>(null);
  const legBR = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  
  // Scarf/Neckerchief
  const scarfRef = useRef<THREE.Group>(null);

  const yoshiOrange = '#DE824B';
  const yoshiCream = '#F7E9CE';
  const darkBrown = '#3D2923';

  const prologueQuest = useGameStore(state => state.quests['prologue']);
  const isWearingNeckerchief = prologueQuest && (prologueQuest.currentObjectiveIndex >= 2 || prologueQuest.status === 'completed');

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speed = new THREE.Vector2(velocityRef.current.x, velocityRef.current.z).length();
    
    if (speed > 0.1) {
      // Walking/Running animation
      const walkCycle = time * speed * 2;
      
      if (legFL.current && legFR.current && legBL.current && legBR.current) {
         legFL.current.rotation.x = Math.sin(walkCycle) * 0.5;
         legFR.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;
         legBL.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;
         legBR.current.rotation.x = Math.sin(walkCycle) * 0.5;
      }
      
      // Body bob
      if (bodyRef.current) {
         bodyRef.current.position.y = 0.3 + Math.abs(Math.sin(walkCycle * 2)) * 0.05;
         // Slight body tilt depending on speed
         bodyRef.current.rotation.z = Math.sin(walkCycle) * 0.02 * Math.min(speed, 5);
      }
      
      // Scarf blowing in wind
      if (scarfRef.current) {
         scarfRef.current.rotation.x = Math.PI / 4 + Math.sin(time * 10) * 0.1;
      }
      
      if (earL.current && earR.current) {
         earL.current.rotation.z = Math.sin(time * 8) * 0.1;
         earR.current.rotation.z = -Math.sin(time * 8) * 0.1;
      }
      
      if (tailRef.current) {
         tailRef.current.rotation.y = Math.sin(walkCycle * 2) * 0.4;
      }

    } else {
      // Idle animation
      if (legFL.current && legFR.current && legBL.current && legBR.current) {
         legFL.current.rotation.x = 0;
         legFR.current.rotation.x = 0;
         legBL.current.rotation.x = 0;
         legBR.current.rotation.x = 0;
      }
      
      if (bodyRef.current) {
         // Gentle breathing
         bodyRef.current.position.y = 0.3 + Math.sin(time * 3) * 0.02;
         bodyRef.current.rotation.z = 0;
         // Happy body wiggle instead of tail
         bodyRef.current.rotation.y = Math.sin(time * 4) * 0.05;
      }
      
      if (headRef.current) {
         // Look around occasionally
         headRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
         // Ear twitch / head tilt
         headRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
      }
      
      if (scarfRef.current) {
         scarfRef.current.rotation.x = Math.PI / 4;
      }

      if (earL.current && earR.current) {
         earL.current.rotation.z = Math.sin(time * 2) * 0.05;
         earR.current.rotation.z = -Math.sin(time * 2) * 0.05;
      }
      
      if (tailRef.current) {
         tailRef.current.rotation.y = Math.sin(time * 4) * 0.15;
      }
    }
  });

  return (
    <group ref={bodyRef} position={[0, 0.3, 0]}>
      {/* Torso & Belly (Combined to prevent Z-fighting) */}
      {/* Main Orange Body */}
      <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
        <RoundedBox args={[0.38, 0.35, 0.6]} radius={0.15} smoothness={4}>
          <FurMaterial color={yoshiOrange} roughness={0.86} bumpScale={0.025} />
        </RoundedBox>
      </mesh>
      
      {/* A front-only cream bib keeps Yoshi's orange coat readable from every angle. */}
      <mesh castShadow receiveShadow position={[0, -0.08, 0.275]} scale={[0.82, 1.05, 0.32]}>
        <sphereGeometry args={[0.19, 18, 14]} />
        <FurMaterial color={yoshiCream} roughness={0.9} bumpScale={0.022} />
      </mesh>

      {/* Rump / Fluff */}
      <mesh castShadow receiveShadow position={[0, 0.05, -0.28]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <FurMaterial color={yoshiOrange} roughness={0.86} bumpScale={0.025} />
      </mesh>
      
      {/* Fluffy Curled Shiba Tail */}
      <group ref={tailRef} position={[0, 0.15, -0.3]}>
         <mesh castShadow position={[0, 0.05, -0.05]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <FurMaterial color={yoshiOrange} roughness={0.86} />
         </mesh>
         <mesh castShadow position={[0, 0.12, -0.08]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <FurMaterial color={yoshiOrange} roughness={0.86} />
         </mesh>
         <mesh castShadow position={[0, 0.18, -0.02]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <FurMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
         <mesh castShadow position={[0, 0.15, 0.05]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <FurMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.265, 0.35]}>
        {/* Head Base */}
        <mesh castShadow position={[0, 0.055, 0]} scale={[1.03, 1, 0.97]}>
          <sphereGeometry args={[0.255, 20, 18]} />
          <FurMaterial color={yoshiOrange} roughness={0.84} bumpScale={0.024} />
        </mesh>
        
        {/* Cheeks */}
        <mesh castShadow position={[0.178, -0.025, 0.065]} scale={[1, 0.95, 0.9]}>
          <sphereGeometry args={[0.135, 18, 16]} />
          <FurMaterial color={yoshiCream} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.178, -0.025, 0.065]} scale={[1, 0.95, 0.9]}>
          <sphereGeometry args={[0.135, 18, 16]} />
          <FurMaterial color={yoshiCream} roughness={0.9} />
        </mesh>

        {/* Muzzle (white) */}
        <mesh castShadow position={[0, -0.055, 0.205]} scale={[1, 0.9, 0.94]}>
          <sphereGeometry args={[0.148, 18, 16]} />
          <FurMaterial color={yoshiCream} roughness={0.9} />
        </mesh>
        
        {/* Nose (black) */}
        <mesh castShadow position={[0, 0.018, 0.326]} scale={[1.12, 0.9, 0.9]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshPhysicalMaterial color={darkBrown} roughness={0.3} clearcoat={0.65} clearcoatRoughness={0.24} />
        </mesh>

        {/* Open, tongue-out smile for a friendly Shiba expression. */}
        <group position={[0, -0.13, 0.326]}>
          <mesh scale={[0.92, 0.46, 0.28]} castShadow>
            <sphereGeometry args={[0.08, 16, 10]} />
            <meshStandardMaterial color="#4B2928" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.038, 0.028]} scale={[0.58, 0.39, 0.19]}>
            <sphereGeometry args={[0.068, 12, 8]} />
            <meshStandardMaterial color="#E58E8A" roughness={0.66} />
          </mesh>
        </group>

        {[-1, 1].map((side) => (
          <mesh key={`smile-corner-${side}`} position={[side * 0.064, -0.095, 0.319]} rotation={[0, 0, side * -0.68]}>
            <capsuleGeometry args={[0.006, 0.032, 5, 7]} />
            <meshStandardMaterial color="#694039" roughness={0.78} />
          </mesh>
        ))}

        {[-0.205, 0.205].map((x) => (
          <mesh key={`blush-${x}`} position={[x, -0.043, 0.175]} scale={[1.08, 0.58, 0.25]}>
            <sphereGeometry args={[0.048, 10, 8]} />
            <meshStandardMaterial color="#EE9B88" transparent opacity={0.24} roughness={0.92} />
          </mesh>
        ))}

        {/* Large, softly oval eyes with warm irises and two-point catchlights. */}
        <mesh castShadow position={[0.125, 0.105, 0.211]} rotation={[-0.16, 0.2, -0.05]} scale={[1, 1.08, 0.78]}>
          <sphereGeometry args={[0.052, 18, 16]} />
          <meshPhysicalMaterial color="#59382D" roughness={0.2} clearcoat={0.64} clearcoatRoughness={0.16} />
        </mesh>
        <mesh castShadow position={[-0.125, 0.105, 0.211]} rotation={[-0.16, -0.2, 0.05]} scale={[1, 1.08, 0.78]}>
          <sphereGeometry args={[0.052, 18, 16]} />
          <meshPhysicalMaterial color="#59382D" roughness={0.2} clearcoat={0.64} clearcoatRoughness={0.16} />
        </mesh>
        {[0.125, -0.125].map((x) => (
          <mesh key={`pupil-${x}`} position={[x, 0.103, 0.249]} scale={[0.94, 1.04, 0.55]}>
            <sphereGeometry args={[0.033, 14, 12]} />
            <meshPhysicalMaterial color={darkBrown} roughness={0.18} clearcoat={0.72} clearcoatRoughness={0.12} />
          </mesh>
        ))}

        {/* Curved upper lids make the sparkling eyes feel happily squinted. */}
        {[0.125, -0.125].map((x) => (
          <mesh key={`lid-${x}`} position={[x, 0.115, 0.256]} rotation={[0, 0, x > 0 ? -0.08 : 0.08]} scale={[1, 0.68, 0.5]}>
            <torusGeometry args={[0.05, 0.006, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#714333" roughness={0.82} />
          </mesh>
        ))}

        {/* Eye Highlights */}
        <mesh position={[0.137, 0.128, 0.274]}>
          <sphereGeometry args={[0.013, 8, 8]} />
          <meshBasicMaterial color="#FFFDF6" />
        </mesh>
        <mesh position={[-0.113, 0.128, 0.274]}>
          <sphereGeometry args={[0.013, 8, 8]} />
          <meshBasicMaterial color="#FFFDF6" />
        </mesh>
        {[0.112, -0.138].map((x) => (
          <mesh key={`small-glint-${x}`} position={[x, 0.095, 0.276]}>
            <sphereGeometry args={[0.0055, 7, 7]} />
            <meshBasicMaterial color="#FFF7E8" />
          </mesh>
        ))}

        {/* Eyebrows */}
        <mesh castShadow position={[0.105, 0.194, 0.158]} rotation={[0, 0, Math.PI / 2 - 0.2]}>
          <capsuleGeometry args={[0.014, 0.058, 8, 8]} />
          <FurMaterial color={yoshiCream} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.105, 0.194, 0.158]} rotation={[0, 0, Math.PI / 2 + 0.2]}>
          <capsuleGeometry args={[0.014, 0.058, 8, 8]} />
          <FurMaterial color={yoshiCream} roughness={0.9} />
        </mesh>
        
        {/* Ears */}
        {/* Left Ear */}
        <group ref={earL} position={[0.15, 0.2, 0]}>
          <mesh castShadow position={[0, 0.1, 0]} rotation={[0, 0, -0.1]}>
            <coneGeometry args={[0.08, 0.2, 16]} />
            <FurMaterial color={yoshiOrange} roughness={0.86} />
          </mesh>
          {/* Inner Ear */}
          <mesh castShadow position={[0.01, 0.1, 0.03]} rotation={[0, 0, -0.1]}>
            <coneGeometry args={[0.05, 0.15, 16]} />
            <FurMaterial color="#E9A77B" roughness={0.9} bumpScale={0.014} />
          </mesh>
        </group>
        {/* Right Ear */}
        <group ref={earR} position={[-0.15, 0.2, 0]}>
          <mesh castShadow position={[0, 0.1, 0]} rotation={[0, 0, 0.1]}>
            <coneGeometry args={[0.08, 0.2, 16]} />
            <FurMaterial color={yoshiOrange} roughness={0.86} />
          </mesh>
          {/* Inner Ear */}
          <mesh castShadow position={[-0.01, 0.1, 0.03]} rotation={[0, 0, 0.1]}>
            <coneGeometry args={[0.05, 0.15, 16]} />
            <FurMaterial color="#E9A77B" roughness={0.9} bumpScale={0.014} />
          </mesh>
        </group>
      </group>

      {/* Neckerchief */}
      <group ref={scarfRef} position={[0, 0.25, 0.3]} visible={isWearingNeckerchief}>
         {/* Main loop */}
         <mesh castShadow rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.18, 0.04, 16, 32]} />
            <FabricMaterial color="#C95055" roughness={0.9} />
         </mesh>
         {/* Knot */}
         <mesh castShadow position={[0, -0.2, 0.1]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <FabricMaterial color="#C95055" roughness={0.9} />
         </mesh>
         {/* Tails */}
         <mesh castShadow position={[0.05, -0.3, 0.1]} rotation={[0, 0, -0.2]}>
            <capsuleGeometry args={[0.03, 0.1, 8, 8]} />
            <FabricMaterial color="#C95055" roughness={0.9} />
         </mesh>
         <mesh castShadow position={[-0.05, -0.28, 0.1]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.03, 0.08, 8, 8]} />
            <FabricMaterial color="#C95055" roughness={0.9} />
         </mesh>
      </group>
      
      {/* Satchel */}
      {isWearingNeckerchief && (
        <group>
          <mesh castShadow position={[0.22, 0.05, 0]} rotation={[0, -0.1, -Math.PI / 12]}>
             <RoundedBox args={[0.1, 0.25, 0.3]} radius={0.05} smoothness={4}>
               <LeatherMaterial color="#A68A72" roughness={0.9} />
             </RoundedBox>
          </mesh>
          {/* Satchel Flap */}
          <mesh castShadow position={[0.28, 0.12, 0]} rotation={[0, -0.1, 0.2]}>
             <RoundedBox args={[0.02, 0.15, 0.3]} radius={0.01} smoothness={4}>
               <LeatherMaterial color="#A68A72" roughness={0.9} />
             </RoundedBox>
          </mesh>
          {/* Buckle */}
          <mesh castShadow position={[0.29, 0.05, 0]} rotation={[0, -0.1, 0.2]}>
             <boxGeometry args={[0.02, 0.05, 0.05]} />
             <meshStandardMaterial color="#E9B85D" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Satchel Strap */}
          <mesh castShadow position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 6]}>
              <torusGeometry args={[0.25, 0.02, 8, 32]} />
              <LeatherMaterial color="#8C6B52" roughness={0.9} />
          </mesh>
          {/* Badge */}
          <mesh castShadow position={[-0.2, 0.25, 0.1]} rotation={[0, 0, Math.PI / 4]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#E9B85D" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* Legs (Shorter Corgi legs) */}
      {/* Front Left */}
      <group ref={legFL} position={[0.12, -0.1, 0.2]}>
         <mesh castShadow position={[0, -0.1, 0]}>
           <capsuleGeometry args={[0.05, 0.15, 8, 8]} />
           <FurMaterial color={yoshiOrange} roughness={0.86} />
         </mesh>
         {/* Paw */}
         <mesh castShadow position={[0, -0.18, 0.02]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <FurMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>
      
      {/* Front Right */}
      <group ref={legFR} position={[-0.12, -0.1, 0.2]}>
         <mesh castShadow position={[0, -0.1, 0]}>
           <capsuleGeometry args={[0.05, 0.15, 8, 8]} />
           <FurMaterial color={yoshiOrange} roughness={0.86} />
         </mesh>
          {/* Paw */}
          <mesh castShadow position={[0, -0.18, 0.02]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <FurMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>

      {/* Back Left */}
      <group ref={legBL} position={[0.15, -0.1, -0.2]}>
         <mesh castShadow position={[0, -0.1, 0]}>
           <capsuleGeometry args={[0.06, 0.15, 8, 8]} />
           <FurMaterial color={yoshiOrange} roughness={0.86} />
         </mesh>
          {/* Paw */}
          <mesh castShadow position={[0, -0.18, 0.02]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <FurMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>

      {/* Back Right */}
      <group ref={legBR} position={[-0.15, -0.1, -0.2]}>
         <mesh castShadow position={[0, -0.1, 0]}>
           <capsuleGeometry args={[0.06, 0.15, 8, 8]} />
           <FurMaterial color={yoshiOrange} roughness={0.86} />
         </mesh>
         {/* Paw */}
          <mesh castShadow position={[0, -0.18, 0.02]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <FurMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>

    </group>
  );
}
