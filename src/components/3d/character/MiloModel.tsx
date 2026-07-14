import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LeatherMaterial, ShortFurMaterial } from './CharacterMaterials';

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

  const coatBlack = '#5A3029';
  const coatTan = '#C87952';
  const coatShadow = '#3C211E';
  const darkBrown = '#211514';
  const collarGreen = '#3F7B59';
  const brass = '#D4AF58';

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
        <ShortFurMaterial color={coatBlack} roughness={0.84} bumpScale={0.019} />
      </mesh>

      {/* A darker dorsal ribbon gives the long coat natural depth. */}
      <mesh castShadow receiveShadow position={[0, 0.225, -0.08]} rotation={[Math.PI / 2, 0, 0]} scale={[0.9, 1, 0.72]}>
        <capsuleGeometry args={[0.095, 0.38, 14, 16]} />
        <ShortFurMaterial color={coatShadow} roughness={0.86} bumpScale={0.016} />
      </mesh>
      
      {/* Deep Chest (Keel) */}
      <mesh castShadow receiveShadow position={[0, 0.06, 0.18]} rotation={[Math.PI / 2.2, 0, 0]}>
        <capsuleGeometry args={[0.14, 0.15, 16, 16]} />
        <ShortFurMaterial color={coatBlack} roughness={0.84} />
      </mesh>

      {/* Tan Chest Points (Classic dachshund markings) */}
      <mesh castShadow receiveShadow position={[0.06, 0.04, 0.26]} rotation={[Math.PI / 2, 0.2, 0]}>
        <capsuleGeometry args={[0.05, 0.08, 16, 16]} />
        <ShortFurMaterial color={coatTan} roughness={0.88} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.06, 0.04, 0.26]} rotation={[Math.PI / 2, -0.2, 0]}>
        <capsuleGeometry args={[0.05, 0.08, 16, 16]} />
        <ShortFurMaterial color={coatTan} roughness={0.88} />
      </mesh>

      {/* Rump / Hindquarters */}
      <mesh castShadow receiveShadow position={[0, 0.13, -0.35]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <ShortFurMaterial color={coatBlack} roughness={0.84} />
      </mesh>
      
      {/* Tucked Abdomen (Tan) */}
      <mesh castShadow receiveShadow position={[0, 0.05, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.11, 0.2, 16, 16]} />
        <ShortFurMaterial color={coatTan} roughness={0.88} />
      </mesh>

      {/* --- HEAD --- */}
      <group ref={headRef} position={[0, 0.27, 0.33]}>
        {/* Skull Dome */}
        <mesh castShadow position={[0, 0.065, 0]} scale={[1.06, 1, 0.96]}>
          <sphereGeometry args={[0.14, 18, 16]} />
          <ShortFurMaterial color={coatBlack} roughness={0.82} />
        </mesh>
        
        {/* Long Tapered Muzzle (Black base) */}
        <mesh castShadow position={[0, 0.018, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.074, 0.17, 16, 16]} />
          <ShortFurMaterial color={coatBlack} roughness={0.82} />
        </mesh>

        {/* Tan Muzzle Sides & Jaw */}
        <mesh castShadow position={[0, -0.025, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.07, 0.16, 16, 16]} />
          <ShortFurMaterial color={coatTan} roughness={0.88} />
        </mesh>
        <mesh castShadow position={[0.04, 0.02, 0.14]} rotation={[Math.PI / 2, 0, 0.2]}>
          <capsuleGeometry args={[0.04, 0.14, 16, 16]} />
          <ShortFurMaterial color={coatTan} roughness={0.88} />
        </mesh>
        <mesh castShadow position={[-0.04, 0.02, 0.14]} rotation={[Math.PI / 2, 0, -0.2]}>
          <capsuleGeometry args={[0.04, 0.14, 16, 16]} />
          <ShortFurMaterial color={coatTan} roughness={0.88} />
        </mesh>
        
        {/* Nose (Black) */}
        <mesh castShadow position={[0, 0.05, 0.265]} scale={[1.12, 0.9, 0.9]}>
          <sphereGeometry args={[0.038, 16, 16]} />
          <meshPhysicalMaterial color={darkBrown} roughness={0.28} clearcoat={0.7} clearcoatRoughness={0.2} />
        </mesh>

        {/* A small open grin and tongue keep Milo's curious face cheerful. */}
        <group position={[0, -0.075, 0.26]}>
          <mesh scale={[0.86, 0.42, 0.28]} castShadow>
            <sphereGeometry args={[0.068, 14, 10]} />
            <meshStandardMaterial color="#3E2222" roughness={0.72} />
          </mesh>
          <mesh position={[0, -0.034, 0.025]} scale={[0.53, 0.36, 0.19]}>
            <sphereGeometry args={[0.061, 12, 8]} />
            <meshStandardMaterial color="#E48B8A" roughness={0.68} />
          </mesh>
        </group>

        {/* Tiny lifted mouth corners and warm cheeks keep the long muzzle sweet. */}
        {[-1, 1].map((side) => (
          <mesh key={`smile-${side}`} position={[side * 0.053, -0.045, 0.266]} rotation={[0, 0, side * -0.72]}>
            <capsuleGeometry args={[0.0055, 0.027, 5, 7]} />
            <meshStandardMaterial color="#5A302D" roughness={0.76} />
          </mesh>
        ))}
        {[-0.095, 0.095].map((x) => (
          <mesh key={`blush-${x}`} position={[x, -0.012, 0.154]} scale={[1.1, 0.62, 0.3]}>
            <sphereGeometry args={[0.032, 10, 8]} />
            <meshStandardMaterial color="#E38B76" transparent opacity={0.2} roughness={0.92} />
          </mesh>
        ))}

        {/* Tan Eyebrow Dots */}
        <mesh castShadow position={[0.068, 0.15, 0.082]} rotation={[-0.2, 0.2, -0.2]}>
          <capsuleGeometry args={[0.017, 0.028, 8, 8]} />
          <ShortFurMaterial color={coatTan} roughness={0.88} />
        </mesh>
        <mesh castShadow position={[-0.068, 0.15, 0.082]} rotation={[-0.2, -0.2, 0.2]}>
          <capsuleGeometry args={[0.017, 0.028, 8, 8]} />
          <ShortFurMaterial color={coatTan} roughness={0.88} />
        </mesh>

        {/* Oversized glossy almond eyes stay expressive from the follow camera. */}
        <mesh castShadow position={[0.084, 0.09, 0.112]} rotation={[-0.1, 0.28, -0.08]} scale={[1, 1.12, 0.72]}>
          <capsuleGeometry args={[0.026, 0.038, 10, 10]} />
          <meshPhysicalMaterial color={darkBrown} roughness={0.2} clearcoat={0.62} clearcoatRoughness={0.16} />
        </mesh>
        <mesh castShadow position={[-0.084, 0.09, 0.112]} rotation={[-0.1, -0.28, 0.08]} scale={[1, 1.12, 0.72]}>
          <capsuleGeometry args={[0.026, 0.038, 10, 10]} />
          <meshPhysicalMaterial color={darkBrown} roughness={0.2} clearcoat={0.62} clearcoatRoughness={0.16} />
        </mesh>
        
        {/* Eye Catchlights */}
        <mesh position={[0.09, 0.108, 0.136]}>
          <sphereGeometry args={[0.009, 8, 8]} />
          <meshBasicMaterial color="#FFFDF6" />
        </mesh>
        <mesh position={[-0.078, 0.108, 0.136]}>
          <sphereGeometry args={[0.009, 8, 8]} />
          <meshBasicMaterial color="#FFFDF6" />
        </mesh>
        {[0.076, -0.092].map((x) => (
          <mesh key={`small-glint-${x}`} position={[x, 0.079, 0.138]}>
            <sphereGeometry args={[0.004, 7, 7]} />
            <meshBasicMaterial color="#FFF6E9" />
          </mesh>
        ))}
        
        {/* Collar & Brass Tag */}
        <mesh castShadow position={[0, -0.06, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.025, 16, 32]} />
          <LeatherMaterial color={collarGreen} roughness={0.82} />
        </mesh>
        <mesh castShadow position={[0, -0.11, 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.02, 0.05, 8, 8]} />
          <meshStandardMaterial color={brass} roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Floppy Broad Ears */}
        {/* Left Ear */}
        <group position={[0.115, 0.06, -0.025]}>
           <mesh ref={earLRef} castShadow position={[0.03, -0.105, 0]} rotation={[0, 0, -0.12]} scale={[0.68, 1, 0.76]}>
             <capsuleGeometry args={[0.08, 0.195, 10, 12]} />
             <ShortFurMaterial color={coatShadow} roughness={0.88} />
           </mesh>
        </group>
         {/* Right Ear */}
        <group position={[-0.115, 0.06, -0.025]}>
           <mesh ref={earRRef} castShadow position={[-0.03, -0.105, 0]} rotation={[0, 0, 0.12]} scale={[0.68, 1, 0.76]}>
             <capsuleGeometry args={[0.08, 0.195, 10, 12]} />
             <ShortFurMaterial color={coatShadow} roughness={0.88} />
           </mesh>
        </group>
      </group>

      {/* --- TAIL --- */}
      {/* Long, gently curving tail */}
      <group ref={tailRef} position={[0, 0.15, -0.48]}>
         <mesh castShadow position={[0, 0.02, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
           <capsuleGeometry args={[0.02, 0.25, 8, 8]} />
           <ShortFurMaterial color={coatBlack} roughness={0.86} />
         </mesh>
      </group>

      {/* --- LEGS --- (Short, sturdy) */}
      {/* Front Left */}
      <group ref={legFL} position={[0.08, 0, 0.18]}>
         <mesh castShadow position={[0, -0.05, 0]}>
           <capsuleGeometry args={[0.035, 0.08, 8, 8]} />
           <ShortFurMaterial color={coatBlack} roughness={0.86} />
         </mesh>
         {/* Tan Paw */}
         <mesh castShadow position={[0, -0.1, 0.02]}>
           <capsuleGeometry args={[0.036, 0.04, 8, 8]} />
           <ShortFurMaterial color={coatTan} roughness={0.88} />
         </mesh>
      </group>
      
      {/* Front Right */}
      <group ref={legFR} position={[-0.08, 0, 0.18]}>
         <mesh castShadow position={[0, -0.05, 0]}>
           <capsuleGeometry args={[0.035, 0.08, 8, 8]} />
           <ShortFurMaterial color={coatBlack} roughness={0.86} />
         </mesh>
         {/* Tan Paw */}
         <mesh castShadow position={[0, -0.1, 0.02]}>
           <capsuleGeometry args={[0.036, 0.04, 8, 8]} />
           <ShortFurMaterial color={coatTan} roughness={0.88} />
         </mesh>
      </group>

      {/* Back Left */}
      <group ref={legBL} position={[0.08, 0.02, -0.28]}>
         <mesh castShadow position={[0, -0.06, 0]} rotation={[0.2, 0, 0]}>
           <capsuleGeometry args={[0.04, 0.1, 8, 8]} />
           <ShortFurMaterial color={coatBlack} roughness={0.86} />
         </mesh>
         {/* Tan Paw */}
         <mesh castShadow position={[0, -0.12, 0.02]}>
           <capsuleGeometry args={[0.036, 0.04, 8, 8]} />
           <ShortFurMaterial color={coatTan} roughness={0.88} />
         </mesh>
      </group>

      {/* Back Right */}
      <group ref={legBR} position={[-0.08, 0.02, -0.28]}>
         <mesh castShadow position={[0, -0.06, 0]} rotation={[0.2, 0, 0]}>
           <capsuleGeometry args={[0.04, 0.1, 8, 8]} />
           <ShortFurMaterial color={coatBlack} roughness={0.86} />
         </mesh>
         {/* Tan Paw */}
         <mesh castShadow position={[0, -0.12, 0.02]}>
           <capsuleGeometry args={[0.036, 0.04, 8, 8]} />
           <ShortFurMaterial color={coatTan} roughness={0.88} />
         </mesh>
      </group>

    </group>
  );
}
