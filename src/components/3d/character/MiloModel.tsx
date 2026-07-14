import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MiloModelProps {
  velocityRef: React.MutableRefObject<THREE.Vector3>;
  isGrounded?: boolean;
}

export function MiloModel({ velocityRef, isGrounded }: MiloModelProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const earLRef = useRef<THREE.Group>(null);
  const earRRef = useRef<THREE.Group>(null);
  const legFL = useRef<THREE.Group>(null);
  const legFR = useRef<THREE.Group>(null);
  const legBL = useRef<THREE.Group>(null);
  const legBR = useRef<THREE.Group>(null);

  // Realistic Reddish-Brown Dachshund Colors
  const coatBlack = "#8A3324"; // Rich reddish-brown main coat
  const coatTan = "#C86240";   // Lighter red/tan for points
  const darkBrown = "#0A0A0A";
  const collarGreen = "#3C8259";
  const brass = "#D4AF37";

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speed = new THREE.Vector2(velocityRef.current.x, velocityRef.current.z).length();
    
    if (speed > 0.1) {
      // Scurry animation for short legs (very fast cycle)
      const walkCycle = time * speed * 4;
      
      if (legFL.current && legFR.current && legBL.current && legBR.current) {
         legFL.current.rotation.x = Math.sin(walkCycle) * 0.7;
         legFR.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.7;
         legBL.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.7;
         legBR.current.rotation.x = Math.sin(walkCycle) * 0.7;
      }
      
      // Body bob & wiggle (dachshunds wiggle their whole body when running)
      if (bodyRef.current) {
         bodyRef.current.position.y = 0.18 + Math.abs(Math.sin(walkCycle * 2)) * 0.03;
         bodyRef.current.rotation.z = Math.sin(walkCycle) * 0.05;
         bodyRef.current.rotation.x = Math.sin(walkCycle * 2) * 0.02;
      }
      
      // Tail streams behind but still wags slightly
      if (tailRef.current) {
        tailRef.current.rotation.x = -Math.PI / 6; // Lift tail
        tailRef.current.rotation.y = Math.sin(time * 25) * 0.2;
      }

      // Floppy ears flapping wildly
      if (earLRef.current && earRRef.current) {
         earLRef.current.rotation.z = Math.abs(Math.sin(walkCycle * 2)) * 0.4;
         earRRef.current.rotation.z = -Math.abs(Math.sin(walkCycle * 2)) * 0.4;
      }
      
      // Head tracks slightly with movement
      if (headRef.current) {
         headRef.current.rotation.y = Math.sin(walkCycle) * 0.1;
         headRef.current.rotation.x = Math.sin(walkCycle * 2) * 0.05;
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
         // Deep chest breathing
         bodyRef.current.position.y = 0.18;
         bodyRef.current.rotation.z = 0;
         bodyRef.current.rotation.x = Math.sin(time * 2) * 0.01;
      }
      
      if (tailRef.current) {
        // Relaxed tail wag
        tailRef.current.rotation.x = -Math.PI / 8;
        tailRef.current.rotation.y = Math.sin(time * 5) * 0.3;
      }
      
      if (headRef.current) {
         // Curious head tilts
         headRef.current.rotation.y = Math.sin(time * 1.2) * 0.15;
         headRef.current.rotation.z = Math.sin(time * 0.8) * 0.05;
         headRef.current.rotation.x = 0;
      }

      if (earLRef.current && earRRef.current) {
         earLRef.current.rotation.z = 0;
         earRRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group ref={bodyRef} position={[0, 0.18, 0]}>
      {/* --- BODY --- */}
      {/* Main Ribcage / Back (Long) */}
      <mesh castShadow receiveShadow position={[0, 0.12, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.13, 0.45, 16, 16]} />
        <meshStandardMaterial color={coatBlack} roughness={0.8} />
      </mesh>
      
      {/* Deep Chest (Keel) */}
      <mesh castShadow receiveShadow position={[0, 0.06, 0.18]} rotation={[Math.PI / 2.2, 0, 0]}>
        <capsuleGeometry args={[0.14, 0.15, 16, 16]} />
        <meshStandardMaterial color={coatBlack} roughness={0.8} />
      </mesh>

      {/* Tan Chest Points (Classic dachshund markings) */}
      <mesh castShadow receiveShadow position={[0.06, 0.04, 0.26]} rotation={[Math.PI / 2, 0.2, 0]}>
        <capsuleGeometry args={[0.05, 0.08, 16, 16]} />
        <meshStandardMaterial color={coatTan} roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.06, 0.04, 0.26]} rotation={[Math.PI / 2, -0.2, 0]}>
        <capsuleGeometry args={[0.05, 0.08, 16, 16]} />
        <meshStandardMaterial color={coatTan} roughness={0.9} />
      </mesh>

      {/* Rump / Hindquarters */}
      <mesh castShadow receiveShadow position={[0, 0.13, -0.35]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={coatBlack} roughness={0.8} />
      </mesh>
      
      {/* Tucked Abdomen (Tan) */}
      <mesh castShadow receiveShadow position={[0, 0.05, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.11, 0.2, 16, 16]} />
        <meshStandardMaterial color={coatTan} roughness={0.9} />
      </mesh>

      {/* --- HEAD --- */}
      <group ref={headRef} position={[0, 0.25, 0.32]}>
        {/* Skull Dome */}
        <mesh castShadow position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={coatBlack} roughness={0.7} />
        </mesh>
        
        {/* Long Tapered Muzzle (Black base) */}
        <mesh castShadow position={[0, 0.02, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.07, 0.18, 16, 16]} />
          <meshStandardMaterial color={coatBlack} roughness={0.7} />
        </mesh>

        {/* Tan Muzzle Sides & Jaw */}
        <mesh castShadow position={[0, -0.02, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.065, 0.17, 16, 16]} />
          <meshStandardMaterial color={coatTan} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.04, 0.02, 0.14]} rotation={[Math.PI / 2, 0, 0.2]}>
          <capsuleGeometry args={[0.04, 0.14, 16, 16]} />
          <meshStandardMaterial color={coatTan} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.04, 0.02, 0.14]} rotation={[Math.PI / 2, 0, -0.2]}>
          <capsuleGeometry args={[0.04, 0.14, 16, 16]} />
          <meshStandardMaterial color={coatTan} roughness={0.9} />
        </mesh>
        
        {/* Nose (Black) */}
        <mesh castShadow position={[0, 0.05, 0.26]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={darkBrown} roughness={0.4} />
        </mesh>

        {/* Tan Eyebrow Dots */}
        <mesh castShadow position={[0.06, 0.14, 0.08]} rotation={[-0.2, 0.2, 0]}>
          <capsuleGeometry args={[0.015, 0.02, 8, 8]} />
          <meshStandardMaterial color={coatTan} roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.06, 0.14, 0.08]} rotation={[-0.2, -0.2, 0]}>
          <capsuleGeometry args={[0.015, 0.02, 8, 8]} />
          <meshStandardMaterial color={coatTan} roughness={0.9} />
        </mesh>

        {/* Eyes (Dark Almond) */}
        <mesh castShadow position={[0.08, 0.08, 0.09]} rotation={[-0.1, 0.3, 0]}>
          <capsuleGeometry args={[0.018, 0.03, 8, 8]} />
          <meshStandardMaterial color={darkBrown} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[-0.08, 0.08, 0.09]} rotation={[-0.1, -0.3, 0]}>
          <capsuleGeometry args={[0.018, 0.03, 8, 8]} />
          <meshStandardMaterial color={darkBrown} roughness={0.2} />
        </mesh>
        
        {/* Eye Catchlights */}
        <mesh castShadow position={[0.085, 0.09, 0.10]} rotation={[-0.1, 0.3, 0]}>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshStandardMaterial color="white" roughness={0.1} />
        </mesh>
        <mesh castShadow position={[-0.085, 0.09, 0.10]} rotation={[-0.1, -0.3, 0]}>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshStandardMaterial color="white" roughness={0.1} />
        </mesh>
        
        {/* Collar & Brass Tag */}
        <mesh castShadow position={[0, -0.06, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.025, 16, 32]} />
          <meshStandardMaterial color={collarGreen} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.11, 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.02, 0.05, 8, 8]} />
          <meshStandardMaterial color={brass} roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Floppy Broad Ears */}
        {/* Left Ear */}
        <group position={[0.1, 0.05, -0.02]}>
           <mesh ref={earLRef} castShadow position={[0.03, -0.1, 0]} rotation={[0, 0, -0.1]}>
             <boxGeometry args={[0.04, 0.22, 0.12]} />
             <meshStandardMaterial color={coatBlack} roughness={0.8} />
           </mesh>
        </group>
         {/* Right Ear */}
        <group position={[-0.1, 0.05, -0.02]}>
           <mesh ref={earRRef} castShadow position={[-0.03, -0.1, 0]} rotation={[0, 0, 0.1]}>
             <boxGeometry args={[0.04, 0.22, 0.12]} />
             <meshStandardMaterial color={coatBlack} roughness={0.8} />
           </mesh>
        </group>
      </group>

      {/* --- TAIL --- */}
      {/* Long, gently curving tail */}
      <group ref={tailRef} position={[0, 0.15, -0.48]}>
         <mesh castShadow position={[0, 0.02, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
           <capsuleGeometry args={[0.02, 0.25, 8, 8]} />
           <meshStandardMaterial color={coatBlack} roughness={0.8} />
         </mesh>
      </group>

      {/* --- LEGS --- (Short, sturdy) */}
      {/* Front Left */}
      <group ref={legFL} position={[0.08, 0, 0.18]}>
         <mesh castShadow position={[0, -0.05, 0]}>
           <capsuleGeometry args={[0.035, 0.08, 8, 8]} />
           <meshStandardMaterial color={coatBlack} roughness={0.8} />
         </mesh>
         {/* Tan Paw */}
         <mesh castShadow position={[0, -0.1, 0.02]}>
           <capsuleGeometry args={[0.036, 0.04, 8, 8]} />
           <meshStandardMaterial color={coatTan} roughness={0.9} />
         </mesh>
      </group>
      
      {/* Front Right */}
      <group ref={legFR} position={[-0.08, 0, 0.18]}>
         <mesh castShadow position={[0, -0.05, 0]}>
           <capsuleGeometry args={[0.035, 0.08, 8, 8]} />
           <meshStandardMaterial color={coatBlack} roughness={0.8} />
         </mesh>
         {/* Tan Paw */}
         <mesh castShadow position={[0, -0.1, 0.02]}>
           <capsuleGeometry args={[0.036, 0.04, 8, 8]} />
           <meshStandardMaterial color={coatTan} roughness={0.9} />
         </mesh>
      </group>

      {/* Back Left */}
      <group ref={legBL} position={[0.08, 0.02, -0.28]}>
         <mesh castShadow position={[0, -0.06, 0]} rotation={[0.2, 0, 0]}>
           <capsuleGeometry args={[0.04, 0.1, 8, 8]} />
           <meshStandardMaterial color={coatBlack} roughness={0.8} />
         </mesh>
         {/* Tan Paw */}
         <mesh castShadow position={[0, -0.12, 0.02]}>
           <capsuleGeometry args={[0.036, 0.04, 8, 8]} />
           <meshStandardMaterial color={coatTan} roughness={0.9} />
         </mesh>
      </group>

      {/* Back Right */}
      <group ref={legBR} position={[-0.08, 0.02, -0.28]}>
         <mesh castShadow position={[0, -0.06, 0]} rotation={[0.2, 0, 0]}>
           <capsuleGeometry args={[0.04, 0.1, 8, 8]} />
           <meshStandardMaterial color={coatBlack} roughness={0.8} />
         </mesh>
         {/* Tan Paw */}
         <mesh castShadow position={[0, -0.12, 0.02]}>
           <capsuleGeometry args={[0.036, 0.04, 8, 8]} />
           <meshStandardMaterial color={coatTan} roughness={0.9} />
         </mesh>
      </group>

    </group>
  );
}
