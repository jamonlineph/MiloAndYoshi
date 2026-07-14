import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore';
import { RoundedBox } from '@react-three/drei';

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

  const yoshiOrange = "#D9773F";
  const yoshiCream = "#F6E5C8";
  const darkBrown = "#4A2D23";

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
          <meshStandardMaterial color={yoshiOrange} roughness={0.8} />
        </RoundedBox>
      </mesh>
      
      {/* Cream Belly & Chest Plaque (Slightly embedded to avoid edge clipping) */}
      <mesh castShadow receiveShadow position={[0, -0.1, 0.05]} rotation={[-0.1, 0, 0]}>
        <RoundedBox args={[0.36, 0.28, 0.58]} radius={0.12} smoothness={4}>
          <meshStandardMaterial color={yoshiCream} roughness={0.9} />
        </RoundedBox>
      </mesh>

      {/* Rump / Fluff */}
      <mesh castShadow receiveShadow position={[0, 0.05, -0.28]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={yoshiOrange} roughness={0.8} />
      </mesh>
      
      {/* Fluffy Curled Shiba Tail */}
      <group ref={tailRef} position={[0, 0.15, -0.3]}>
         <mesh castShadow position={[0, 0.05, -0.05]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={yoshiOrange} roughness={0.8} />
         </mesh>
         <mesh castShadow position={[0, 0.12, -0.08]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color={yoshiOrange} roughness={0.8} />
         </mesh>
         <mesh castShadow position={[0, 0.18, -0.02]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
         <mesh castShadow position={[0, 0.15, 0.05]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.25, 0.35]}>
        {/* Head Base */}
        <mesh castShadow position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshStandardMaterial color={yoshiOrange} roughness={0.7} />
        </mesh>
        
        {/* Cheeks */}
        <mesh castShadow position={[0.18, -0.02, 0.05]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={yoshiCream} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.18, -0.02, 0.05]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={yoshiCream} roughness={0.9} />
        </mesh>

        {/* Muzzle (white) */}
        <mesh castShadow position={[0, -0.05, 0.2]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color={yoshiCream} roughness={0.9} />
        </mesh>
        
        {/* Nose (black) */}
        <mesh castShadow position={[0, 0.02, 0.32]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={darkBrown} roughness={0.4} />
        </mesh>

        {/* Eyes (dark round) */}
        <mesh castShadow position={[0.12, 0.1, 0.2]} rotation={[-0.2, 0.2, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={darkBrown} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[-0.12, 0.1, 0.2]} rotation={[-0.2, -0.2, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={darkBrown} roughness={0.2} />
        </mesh>
        
        {/* Eye Highlights */}
        <mesh castShadow position={[0.13, 0.12, 0.22]} rotation={[-0.2, 0.2, 0]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial color="white" roughness={0.1} />
        </mesh>
        <mesh castShadow position={[-0.11, 0.12, 0.22]} rotation={[-0.2, -0.2, 0]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial color="white" roughness={0.1} />
        </mesh>

        {/* Eyebrows */}
        <mesh castShadow position={[0.1, 0.18, 0.15]} rotation={[0, 0, -0.1]}>
          <capsuleGeometry args={[0.015, 0.04, 8, 8]} />
          <meshStandardMaterial color={yoshiCream} />
        </mesh>
        <mesh castShadow position={[-0.1, 0.18, 0.15]} rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.015, 0.04, 8, 8]} />
          <meshStandardMaterial color={yoshiCream} />
        </mesh>
        
        {/* Ears */}
        {/* Left Ear */}
        <group ref={earL} position={[0.15, 0.2, 0]}>
          <mesh castShadow position={[0, 0.1, 0]} rotation={[0, 0, -0.1]}>
            <coneGeometry args={[0.08, 0.2, 16]} />
            <meshStandardMaterial color={yoshiOrange} roughness={0.7} />
          </mesh>
          {/* Inner Ear */}
          <mesh castShadow position={[0.01, 0.1, 0.03]} rotation={[0, 0, -0.1]}>
            <coneGeometry args={[0.05, 0.15, 16]} />
            <meshStandardMaterial color="#E8A95B" roughness={0.9} />
          </mesh>
        </group>
        {/* Right Ear */}
        <group ref={earR} position={[-0.15, 0.2, 0]}>
          <mesh castShadow position={[0, 0.1, 0]} rotation={[0, 0, 0.1]}>
            <coneGeometry args={[0.08, 0.2, 16]} />
            <meshStandardMaterial color={yoshiOrange} roughness={0.7} />
          </mesh>
          {/* Inner Ear */}
          <mesh castShadow position={[-0.01, 0.1, 0.03]} rotation={[0, 0, 0.1]}>
            <coneGeometry args={[0.05, 0.15, 16]} />
            <meshStandardMaterial color="#E8A95B" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Neckerchief */}
      <group ref={scarfRef} position={[0, 0.25, 0.3]} visible={isWearingNeckerchief}>
         {/* Main loop */}
         <mesh castShadow rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.18, 0.04, 16, 32]} />
            <meshStandardMaterial color="#D93D4A" roughness={0.8} />
         </mesh>
         {/* Knot */}
         <mesh castShadow position={[0, -0.2, 0.1]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#D93D4A" roughness={0.8} />
         </mesh>
         {/* Tails */}
         <mesh castShadow position={[0.05, -0.3, 0.1]} rotation={[0, 0, -0.2]}>
            <capsuleGeometry args={[0.03, 0.1, 8, 8]} />
            <meshStandardMaterial color="#D93D4A" roughness={0.8} />
         </mesh>
         <mesh castShadow position={[-0.05, -0.28, 0.1]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.03, 0.08, 8, 8]} />
            <meshStandardMaterial color="#D93D4A" roughness={0.8} />
         </mesh>
      </group>
      
      {/* Satchel */}
      {isWearingNeckerchief && (
        <group>
          <mesh castShadow position={[0.22, 0.05, 0]} rotation={[0, -0.1, -Math.PI / 12]}>
             <RoundedBox args={[0.1, 0.25, 0.3]} radius={0.05} smoothness={4}>
               <meshStandardMaterial color="#A68A72" roughness={0.9} />
             </RoundedBox>
          </mesh>
          {/* Satchel Flap */}
          <mesh castShadow position={[0.28, 0.12, 0]} rotation={[0, -0.1, 0.2]}>
             <RoundedBox args={[0.02, 0.15, 0.3]} radius={0.01} smoothness={4}>
               <meshStandardMaterial color="#A68A72" roughness={0.9} />
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
              <meshStandardMaterial color="#8C6B52" roughness={0.9} />
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
           <meshStandardMaterial color={yoshiOrange} roughness={0.8} />
         </mesh>
         {/* Paw */}
         <mesh castShadow position={[0, -0.18, 0.02]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <meshStandardMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>
      
      {/* Front Right */}
      <group ref={legFR} position={[-0.12, -0.1, 0.2]}>
         <mesh castShadow position={[0, -0.1, 0]}>
           <capsuleGeometry args={[0.05, 0.15, 8, 8]} />
           <meshStandardMaterial color={yoshiOrange} roughness={0.8} />
         </mesh>
          {/* Paw */}
          <mesh castShadow position={[0, -0.18, 0.02]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <meshStandardMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>

      {/* Back Left */}
      <group ref={legBL} position={[0.15, -0.1, -0.2]}>
         <mesh castShadow position={[0, -0.1, 0]}>
           <capsuleGeometry args={[0.06, 0.15, 8, 8]} />
           <meshStandardMaterial color={yoshiOrange} roughness={0.8} />
         </mesh>
          {/* Paw */}
          <mesh castShadow position={[0, -0.18, 0.02]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <meshStandardMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>

      {/* Back Right */}
      <group ref={legBR} position={[-0.15, -0.1, -0.2]}>
         <mesh castShadow position={[0, -0.1, 0]}>
           <capsuleGeometry args={[0.06, 0.15, 8, 8]} />
           <meshStandardMaterial color={yoshiOrange} roughness={0.8} />
         </mesh>
         {/* Paw */}
          <mesh castShadow position={[0, -0.18, 0.02]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <meshStandardMaterial color={yoshiCream} roughness={0.9} />
         </mesh>
      </group>

    </group>
  );
}
