const fs = require('fs');
const path = require('path');

const npcCode = `import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import { Html } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sfx } from '../../audio/sfx';

export interface NPCProps {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  type: 'cat' | 'capybara' | 'crane' | 'secret' | 'dog' | 'tortoise' | 'fox' | 'mouse';
  onInteract?: () => void;
  showQuestMarker?: boolean;
}

export function NPC({ id, name, position, color, type, onInteract, showQuestMarker }: NPCProps) {
  const setDialog = useGameStore(state => state.setDialog);
  const outerGroupRef = useRef<THREE.Group>(null);
  const npcRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<RapierRigidBody>(null);
  
  // AI Wandering state
  const spawnPos = useRef(new THREE.Vector3(...position));
  const targetPos = useRef(new THREE.Vector3(...position));
  const stateRef = useRef<'idle' | 'walking'>('idle');
  const timer = useRef(Math.random() * 2);
  const tailRef = useRef<THREE.Group>(null);
  
  // Register interactable
  useEffect(() => {
    if (!outerGroupRef.current) return;
    
    const store = useGameStore.getState();
    const handleInteractFallback = () => {
      sfx.playPop();
      if (onInteract) {
         onInteract();
      } else {
         if (id === 'crab') {
            setDialog(name, \`(Tiny clicking sounds) You found us!\`);
         } else {
            setDialog(name, \`Nice day for a walk, isn't it?\`);
         }
      }
    };
    
    const timerId = setTimeout(() => {
        if (!outerGroupRef.current) return;
        const worldPos = new THREE.Vector3();
        outerGroupRef.current.getWorldPosition(worldPos);
        store.registerInteractable(id, { x: worldPos.x, y: worldPos.y, z: worldPos.z }, 'Talk', handleInteractFallback);
    }, 100);
    
    return () => {
        clearTimeout(timerId);
        store.unregisterInteractable(id);
    };
  }, [id, onInteract, name, setDialog]);

  const isClosest = useGameStore(state => state.closestInteractableId === id);

  useFrame((state, delta) => {
    if (type === 'secret') {
        // Floating for secrets only
        if (npcRef.current) npcRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.2;
        return;
    }

    if (!bodyRef.current || !npcRef.current) return;
    
    const pos = bodyRef.current.translation();
    const linvel = bodyRef.current.linvel();
    
    // AI Wandering Logic
    timer.current -= delta;
    if (timer.current <= 0) {
       if (stateRef.current === 'idle') {
          stateRef.current = 'walking';
          timer.current = 1 + Math.random() * 2;
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 3;
          targetPos.current.set(spawnPos.current.x + Math.cos(angle) * dist, spawnPos.current.y, spawnPos.current.z + Math.sin(angle) * dist);
       } else {
          stateRef.current = 'idle';
          timer.current = 2 + Math.random() * 3;
       }
    }
    
    let isWalking = stateRef.current === 'walking';
    
    const playerPos = useGameStore.getState().playerPosition;
    const distToPlayer = playerPos ? Math.hypot(playerPos.x - pos.x, playerPos.z - pos.z) : 100;
    
    let targetAngle = npcRef.current.rotation.y;
    let speed = 0;
    
    if (distToPlayer < 3) {
        // Look at player, stop walking
        isWalking = false;
        if (playerPos) targetAngle = Math.atan2(playerPos.x - pos.x, playerPos.z - pos.z);
    } else if (isWalking) {
        const dx = targetPos.current.x - pos.x;
        const dz = targetPos.current.z - pos.z;
        const distToTarget = Math.hypot(dx, dz);
        if (distToTarget > 0.5) {
            targetAngle = Math.atan2(dx, dz);
            // Tortoise walks slower
            speed = type === 'tortoise' ? 0.4 : 1.5;
        } else {
            isWalking = false;
        }
    }

    // Apply physics movement
    bodyRef.current.setLinvel({
       x: Math.sin(targetAngle) * speed,
       y: linvel.y,
       z: Math.cos(targetAngle) * speed
    }, true);
    
    // Smooth rotation
    const currentRot = npcRef.current.rotation.y;
    let diff = targetAngle - currentRot;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    npcRef.current.rotation.y += diff * 5 * delta;
    
    // Animations
    const time = state.clock.elapsedTime;
    
    // Base Y offset so feet touch ground exactly
    const baseYOffsets = {
       'cat': 0.125,
       'capybara': 0.3,
       'dog': 0.225,
       'fox': 0.325,
       'crane': 0.56,
       'tortoise': 0.08,
       'mouse': 0.22,
       'secret': 0
    };
    const baseY = baseYOffsets[type] || 0;

    if (isWalking) {
        npcRef.current.position.y = baseY + Math.abs(Math.sin(time * (type === 'tortoise' ? 5 : 12))) * 0.1;
        npcRef.current.rotation.z = Math.sin(time * (type === 'tortoise' ? 5 : 12)) * 0.05;
        
        if (tailRef.current) {
            tailRef.current.rotation.y = Math.sin(time * 15) * 0.3;
        }
    } else {
        npcRef.current.position.y = baseY + Math.sin(time * 3) * 0.015; // Gentle breathe
        npcRef.current.rotation.z = 0;
        
        if (tailRef.current) {
            // Happy wag if looking at player, otherwise idle wag
            const wagSpeed = distToPlayer < 3 ? 12 : 3;
            tailRef.current.rotation.y = Math.sin(time * wagSpeed) * 0.15;
        }
    }
  });

  return (
    <group ref={outerGroupRef}>
      <RigidBody ref={bodyRef} type={type === 'secret' ? 'fixed' : 'dynamic'} colliders="cuboid" lockRotations mass={2} friction={0.5} position={position}>
         <group ref={npcRef} position={[0, 0, 0]}>
            {type === 'cat' && (
               <group>
                 <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.2, 0.35, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.1, 0.15]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.18, 0.3, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.9} />
                 </mesh>
                 <mesh position={[0, 0.5, 0.1]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
                   <sphereGeometry args={[0.24, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0.16, 0.45, 0.2]} castShadow>
                   <sphereGeometry args={[0.12, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.9} />
                 </mesh>
                 <mesh position={[-0.16, 0.45, 0.2]} castShadow>
                   <sphereGeometry args={[0.12, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.9} />
                 </mesh>
                 <mesh position={[0, 0.42, 0.3]} castShadow>
                   <sphereGeometry args={[0.14, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.9} />
                 </mesh>
                 {/* Cute Cat Nose */}
                 <mesh position={[0, 0.46, 0.42]} castShadow rotation={[Math.PI, 0, 0]}>
                   <coneGeometry args={[0.03, 0.03, 3]} />
                   <meshStandardMaterial color="#FF9B9B" roughness={0.4} />
                 </mesh>
                 {/* Wide, soft ears */}
                 <mesh position={[-0.18, 0.7, 0.05]} rotation={[0, 0, 0.3]} castShadow>
                   <coneGeometry args={[0.1, 0.15, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0.18, 0.7, 0.05]} rotation={[0, 0, -0.3]} castShadow>
                   <coneGeometry args={[0.1, 0.15, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.16, 0.7, 0.1]} rotation={[0, 0, 0.3]} castShadow>
                   <coneGeometry args={[0.06, 0.12, 16]} />
                   <meshStandardMaterial color="#FFB8B8" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.16, 0.7, 0.1]} rotation={[0, 0, -0.3]} castShadow>
                   <coneGeometry args={[0.06, 0.12, 16]} />
                   <meshStandardMaterial color="#FFB8B8" roughness={0.8} />
                 </mesh>
                 {/* Rounder Eyes */}
                 <mesh position={[-0.1, 0.55, 0.3]}>
                   <sphereGeometry args={[0.03, 16, 16]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[0.1, 0.55, 0.3]}>
                   <sphereGeometry args={[0.03, 16, 16]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 {/* Eye highlights */}
                 <mesh position={[-0.09, 0.56, 0.32]}>
                   <sphereGeometry args={[0.01, 8, 8]} />
                   <meshStandardMaterial color="white" roughness={0.1} />
                 </mesh>
                 <mesh position={[0.11, 0.56, 0.32]}>
                   <sphereGeometry args={[0.01, 8, 8]} />
                   <meshStandardMaterial color="white" roughness={0.1} />
                 </mesh>
                 {/* Long curved tail */}
                 <group ref={tailRef} position={[0, -0.05, -0.15]}>
                     <mesh position={[0, 0.15, -0.1]} rotation={[0.4, 0, 0]} castShadow>
                       <capsuleGeometry args={[0.03, 0.4, 8, 8]} />
                       <meshStandardMaterial color={color} roughness={0.8} />
                     </mesh>
                 </group>
                 <mesh position={[-0.1, -0.05, 0.1]} castShadow>
                   <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.1, -0.05, 0.1]} castShadow>
                   <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.25, 0.2, 0.05]} rotation={[0, 0, -0.5]} castShadow>
                   <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.25, 0.2, 0.05]} rotation={[0, 0, 0.5]} castShadow>
                   <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
               </group>
            )}

            {type === 'capybara' && (
               <group>
                 <mesh position={[0, 0, 0]} rotation={[1.57, 0, 0]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.3, 0.4, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.9} />
                 </mesh>
                 <mesh position={[0, 0.15, 0.35]} castShadow receiveShadow>
                   <sphereGeometry args={[0.25, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.9} />
                 </mesh>
                 <mesh position={[0, 0.05, 0.55]} castShadow receiveShadow>
                   <boxGeometry args={[0.3, 0.25, 0.35]} />
                   <meshStandardMaterial color={color} roughness={0.9} />
                 </mesh>
                 <mesh position={[-0.18, 0.3, 0.3]} rotation={[0, 0, 0.5]} castShadow>
                   <sphereGeometry args={[0.06, 8, 8]} />
                   <meshStandardMaterial color={color} roughness={0.9} />
                 </mesh>
                 <mesh position={[0.18, 0.3, 0.3]} rotation={[0, 0, -0.5]} castShadow>
                   <sphereGeometry args={[0.06, 8, 8]} />
                   <meshStandardMaterial color={color} roughness={0.9} />
                 </mesh>
                 {/* Sleepy Capybara Eyes (horizontal dash) */}
                 <mesh position={[-0.15, 0.2, 0.5]} rotation={[0, 0, 1.57]}>
                   <capsuleGeometry args={[0.01, 0.04, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[0.15, 0.2, 0.5]} rotation={[0, 0, 1.57]}>
                   <capsuleGeometry args={[0.01, 0.04, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[-0.2, 0.12, 0.48]}>
                   <sphereGeometry args={[0.06, 8, 8]} />
                   <meshStandardMaterial color="#FFB8B8" roughness={0.9} />
                 </mesh>
                 <mesh position={[0.2, 0.12, 0.48]}>
                   <sphereGeometry args={[0.06, 8, 8]} />
                   <meshStandardMaterial color="#FFB8B8" roughness={0.9} />
                 </mesh>
                 {/* Nostrils */}
                 <mesh position={[-0.05, 0.15, 0.72]}>
                   <boxGeometry args={[0.02, 0.04, 0.02]} />
                   <meshStandardMaterial color="#211814" roughness={0.4} />
                 </mesh>
                 <mesh position={[0.05, 0.15, 0.72]}>
                   <boxGeometry args={[0.02, 0.04, 0.02]} />
                   <meshStandardMaterial color="#211814" roughness={0.4} />
                 </mesh>
                 <mesh position={[-0.15, -0.2, 0.2]} castShadow>
                   <capsuleGeometry args={[0.06, 0.2, 8, 8]} />
                   <meshStandardMaterial color="#4A3B32" roughness={0.9} />
                 </mesh>
                 <mesh position={[0.15, -0.2, 0.2]} castShadow>
                   <capsuleGeometry args={[0.06, 0.2, 8, 8]} />
                   <meshStandardMaterial color="#4A3B32" roughness={0.9} />
                 </mesh>
                 <mesh position={[-0.15, -0.2, -0.2]} castShadow>
                   <capsuleGeometry args={[0.06, 0.2, 8, 8]} />
                   <meshStandardMaterial color="#4A3B32" roughness={0.9} />
                 </mesh>
                 <mesh position={[0.15, -0.2, -0.2]} castShadow>
                   <capsuleGeometry args={[0.06, 0.2, 8, 8]} />
                   <meshStandardMaterial color="#4A3B32" roughness={0.9} />
                 </mesh>
                 {/* Orange Slice Hat */}
                 <mesh position={[0, 0.4, 0.35]} rotation={[-0.2, 0, 0]} castShadow>
                   <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
                   <meshStandardMaterial color="#FF9B21" roughness={0.7} />
                 </mesh>
                 <mesh position={[0, 0.41, 0.35]} rotation={[-0.2, 0, 0]}>
                   <cylinderGeometry args={[0.1, 0.1, 0.025, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.7} />
                 </mesh>
                 <mesh position={[0, 0.415, 0.35]} rotation={[-0.2, 0, 0]}>
                   <cylinderGeometry args={[0.02, 0.02, 0.03, 8]} />
                   <meshStandardMaterial color="#FF9B21" roughness={0.7} />
                 </mesh>
               </group>
            )}

            {type === 'dog' && (
               <group>
                 <mesh position={[0, 0, 0]} rotation={[1.57, 0, 0]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.18, 0.55, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0, -0.1, 0]} rotation={[1.57, 0, 0]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.16, 0.53, 16, 16]} />
                   <meshStandardMaterial color="#E8DCC4" roughness={0.9} />
                 </mesh>
                 <mesh position={[0, 0.2, 0.35]} castShadow receiveShadow>
                   <sphereGeometry args={[0.18, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.15, 0.5]} rotation={[1.57, 0, 0]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.08, 0.18, 16, 16]} />
                   <meshStandardMaterial color="#E8DCC4" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.15, 0.2, 0.3]} rotation={[-0.2, 0, 0.4]} castShadow>
                   <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
                   <meshStandardMaterial color="#6B5440" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.15, 0.2, 0.3]} rotation={[-0.2, 0, -0.4]} castShadow>
                   <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
                   <meshStandardMaterial color="#6B5440" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.08, 0.25, 0.48]}>
                   <sphereGeometry args={[0.02, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[0.08, 0.25, 0.48]}>
                   <sphereGeometry args={[0.02, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[-0.07, 0.26, 0.49]}>
                   <sphereGeometry args={[0.008, 8, 8]} />
                   <meshStandardMaterial color="white" roughness={0.1} />
                 </mesh>
                 <mesh position={[0.09, 0.26, 0.49]}>
                   <sphereGeometry args={[0.008, 8, 8]} />
                   <meshStandardMaterial color="white" roughness={0.1} />
                 </mesh>
                 <mesh position={[0, 0.18, 0.62]}>
                   <sphereGeometry args={[0.025, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.4} />
                 </mesh>
                 <mesh position={[-0.1, -0.15, 0.2]} castShadow>
                   <capsuleGeometry args={[0.05, 0.15, 8, 8]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0.1, -0.15, 0.2]} castShadow>
                   <capsuleGeometry args={[0.05, 0.15, 8, 8]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.1, -0.15, -0.2]} castShadow>
                   <capsuleGeometry args={[0.05, 0.15, 8, 8]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0.1, -0.15, -0.2]} castShadow>
                   <capsuleGeometry args={[0.05, 0.15, 8, 8]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <group ref={tailRef} position={[0, 0.1, -0.35]} rotation={[0.4, 0, 0]}>
                   <mesh castShadow>
                     <capsuleGeometry args={[0.02, 0.35, 8, 8]} />
                     <meshStandardMaterial color={color} roughness={0.8} />
                   </mesh>
                 </group>
                 <group position={[0, 0.35, 0.3]} rotation={[-0.1, 0, 0]}>
                   <mesh castShadow>
                     <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
                     <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                   </mesh>
                   <mesh position={[0, -0.02, 0]} castShadow>
                     <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
                     <meshStandardMaterial color="#D93D4A" roughness={0.8} />
                   </mesh>
                   <mesh position={[0, -0.05, -0.1]} rotation={[0.4, 0, 0]} castShadow>
                     <boxGeometry args={[0.05, 0.15, 0.02]} />
                     <meshStandardMaterial color="#D93D4A" roughness={0.8} />
                   </mesh>
                 </group>
                 <mesh position={[0, 0.1, 0.3]} rotation={[1.2, 0, 0]} castShadow>
                    <torusGeometry args={[0.15, 0.02, 8, 16]} />
                    <meshStandardMaterial color="#4A6B82" roughness={0.8} />
                 </mesh>
               </group>
            )}
            
            {type === 'fox' && (
               <group>
                 <mesh position={[0, 0, 0]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.2, 0.3, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0, -0.05, 0.1]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.18, 0.25, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.9} />
                 </mesh>
                 <mesh position={[0, 0.35, 0.1]} castShadow receiveShadow>
                   <sphereGeometry args={[0.2, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.28, 0.15]} castShadow>
                   <sphereGeometry args={[0.15, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.3, 0.22]} rotation={[1.57, 0, 0]} castShadow>
                   <capsuleGeometry args={[0.08, 0.25, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.32, 0.35]}>
                   <sphereGeometry args={[0.025, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.4} />
                 </mesh>
                 <mesh position={[-0.14, 0.52, 0.1]} castShadow rotation={[0, 0, 0.2]}>
                   <coneGeometry args={[0.08, 0.25, 8]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0.14, 0.52, 0.1]} castShadow rotation={[0, 0, -0.2]}>
                   <coneGeometry args={[0.08, 0.25, 8]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.13, 0.52, 0.13]} castShadow rotation={[0, 0, 0.2]}>
                   <coneGeometry args={[0.05, 0.22, 8]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.13, 0.52, 0.13]} castShadow rotation={[0, 0, -0.2]}>
                   <coneGeometry args={[0.05, 0.22, 8]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.1, 0.38, 0.26]}>
                   <sphereGeometry args={[0.02, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[0.1, 0.38, 0.26]}>
                   <sphereGeometry args={[0.02, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <group position={[0, 0.45, 0.2]} rotation={[-0.2, 0, 0]}>
                    <mesh position={[-0.1, 0, 0]} castShadow>
                       <torusGeometry args={[0.05, 0.02, 8, 16]} />
                       <meshStandardMaterial color="#8C6B52" roughness={0.4} />
                    </mesh>
                    <mesh position={[0.1, 0, 0]} castShadow>
                       <torusGeometry args={[0.05, 0.02, 8, 16]} />
                       <meshStandardMaterial color="#8C6B52" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 0, 0]} castShadow>
                       <boxGeometry args={[0.1, 0.02, 0.02]} />
                       <meshStandardMaterial color="#8C6B52" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 0, -0.05]} rotation={[1.57, 0, 0]} castShadow>
                       <torusGeometry args={[0.18, 0.01, 8, 32]} />
                       <meshStandardMaterial color="#211814" roughness={0.8} />
                    </mesh>
                 </group>
                 <mesh position={[-0.1, -0.25, 0.1]} castShadow>
                   <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.1, -0.25, 0.1]} castShadow>
                   <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.1, -0.25, -0.1]} castShadow>
                   <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.1, -0.25, -0.1]} castShadow>
                   <capsuleGeometry args={[0.04, 0.15, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.8} />
                 </mesh>
                 <group ref={tailRef} position={[0, -0.1, -0.25]} rotation={[0.4, 0, 0]}>
                   <mesh castShadow>
                     <capsuleGeometry args={[0.12, 0.35, 16, 16]} />
                     <meshStandardMaterial color={color} roughness={0.8} />
                   </mesh>
                   <mesh position={[0, -0.2, -0.02]} castShadow>
                     <sphereGeometry args={[0.12, 16, 16]} />
                     <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                   </mesh>
                 </group>
                 <group position={[0.2, 0, 0.1]} rotation={[0.2, 0.5, 0.2]}>
                    <mesh castShadow>
                       <boxGeometry args={[0.15, 0.2, 0.1]} />
                       <meshStandardMaterial color="#E8A95B" roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.12, 0]} rotation={[0.2, 0, 0]} castShadow>
                       <boxGeometry args={[0.15, 0.1, 0.11]} />
                       <meshStandardMaterial color="#A94F2B" roughness={0.9} />
                    </mesh>
                 </group>
                 <mesh position={[-0.05, 0.15, 0]} rotation={[0, 0, -0.6]} castShadow>
                     <torusGeometry args={[0.2, 0.02, 8, 32]} />
                     <meshStandardMaterial color="#A94F2B" roughness={0.9} />
                 </mesh>
               </group>
            )}

            {type === 'crane' && (
               <group>
                 <mesh position={[0, 0, 0]} rotation={[0.5, 0, 0]} castShadow receiveShadow>
                   <capsuleGeometry args={[0.18, 0.3, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.15, 0.05, 0]} rotation={[0.5, 0, -0.2]} castShadow>
                   <capsuleGeometry args={[0.08, 0.3, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.15, 0.05, 0]} rotation={[0.5, 0, 0.2]} castShadow>
                   <capsuleGeometry args={[0.08, 0.3, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.15, -0.1, -0.1]} rotation={[0.6, 0, -0.2]} castShadow>
                   <coneGeometry args={[0.08, 0.2, 16]} />
                   <meshStandardMaterial color="#211814" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.15, -0.1, -0.1]} rotation={[0.6, 0, 0.2]} castShadow>
                   <coneGeometry args={[0.08, 0.2, 16]} />
                   <meshStandardMaterial color="#211814" roughness={0.8} />
                 </mesh>
                 <mesh position={[0, -0.1, -0.2]} rotation={[0.8, 0, 0]} castShadow>
                   <coneGeometry args={[0.08, 0.25, 16]} />
                   <meshStandardMaterial color="#211814" roughness={0.8} />
                 </mesh>
                 <group position={[0, 0.2, 0.1]} rotation={[0.1, 0, 0]}>
                    <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
                      <capsuleGeometry args={[0.05, 0.4, 16, 16]} />
                      <meshStandardMaterial color="#211814" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.4, 0.05]} castShadow receiveShadow>
                      <sphereGeometry args={[0.12, 16, 16]} />
                      <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.5, 0.02]} castShadow>
                      <sphereGeometry args={[0.06, 16, 16]} />
                      <meshStandardMaterial color="#D93D4A" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.4, 0.2]} rotation={[1.57, 0, 0]} castShadow>
                      <coneGeometry args={[0.03, 0.3, 16]} />
                      <meshStandardMaterial color="#E8A95B" roughness={0.6} />
                    </mesh>
                    <mesh position={[-0.08, 0.43, 0.1]}>
                      <sphereGeometry args={[0.015, 8, 8]} />
                      <meshStandardMaterial color="#211814" roughness={0.2} />
                    </mesh>
                    <mesh position={[0.08, 0.43, 0.1]}>
                      <sphereGeometry args={[0.015, 8, 8]} />
                      <meshStandardMaterial color="#211814" roughness={0.2} />
                    </mesh>
                    <mesh position={[-0.1, 0.38, 0.1]}>
                      <sphereGeometry args={[0.03, 8, 8]} />
                      <meshStandardMaterial color="#FFB8B8" roughness={0.8} />
                    </mesh>
                    <mesh position={[0.1, 0.38, 0.1]}>
                      <sphereGeometry args={[0.03, 8, 8]} />
                      <meshStandardMaterial color="#FFB8B8" roughness={0.8} />
                    </mesh>
                 </group>
                 <mesh position={[-0.06, -0.2, -0.05]} rotation={[-0.2, 0, 0]} castShadow>
                   <capsuleGeometry args={[0.03, 0.2, 8, 8]} />
                   <meshStandardMaterial color="#A94F2B" roughness={0.6} />
                 </mesh>
                 <mesh position={[0.06, -0.2, -0.05]} rotation={[-0.2, 0, 0]} castShadow>
                   <capsuleGeometry args={[0.03, 0.2, 8, 8]} />
                   <meshStandardMaterial color="#A94F2B" roughness={0.6} />
                 </mesh>
                 <mesh position={[-0.06, -0.4, 0.05]} rotation={[0.2, 0, 0]} castShadow>
                   <cylinderGeometry args={[0.015, 0.015, 0.3]} />
                   <meshStandardMaterial color="#211814" roughness={0.6} />
                 </mesh>
                 <mesh position={[0.06, -0.4, 0.05]} rotation={[0.2, 0, 0]} castShadow>
                   <cylinderGeometry args={[0.015, 0.015, 0.3]} />
                   <meshStandardMaterial color="#211814" roughness={0.6} />
                 </mesh>
                 <mesh position={[-0.06, -0.55, 0.1]} castShadow>
                   <boxGeometry args={[0.04, 0.02, 0.1]} />
                   <meshStandardMaterial color="#211814" roughness={0.6} />
                 </mesh>
                 <mesh position={[0.06, -0.55, 0.1]} castShadow>
                   <boxGeometry args={[0.04, 0.02, 0.1]} />
                   <meshStandardMaterial color="#211814" roughness={0.6} />
                 </mesh>
               </group>
            )}

            {type === 'tortoise' && (
               <group>
                 <mesh castShadow receiveShadow position={[0, 0.05, 0]} scale={[1, 0.6, 1]}>
                   <sphereGeometry args={[0.4, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.9} />
                 </mesh>
                 <mesh position={[0, -0.05, 0]} scale={[1, 0.3, 1]}>
                    <sphereGeometry args={[0.42, 16, 16]} />
                    <meshStandardMaterial color="#E8DCC4" roughness={0.9} />
                 </mesh>
                 <mesh position={[0, 0.25, 0]} rotation={[-0.2, 0, 0]} castShadow>
                     <cylinderGeometry args={[0.15, 0.15, 0.05, 6]} />
                     <meshStandardMaterial color="#4A6B82" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.2, 0.15, 0]} rotation={[0, 0, -0.4]} castShadow>
                     <cylinderGeometry args={[0.12, 0.12, 0.05, 6]} />
                     <meshStandardMaterial color="#4A6B82" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.2, 0.15, 0]} rotation={[0, 0, 0.4]} castShadow>
                     <cylinderGeometry args={[0.12, 0.12, 0.05, 6]} />
                     <meshStandardMaterial color="#4A6B82" roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.15, 0.2]} rotation={[0.4, 0, 0]} castShadow>
                     <cylinderGeometry args={[0.12, 0.12, 0.05, 6]} />
                     <meshStandardMaterial color="#4A6B82" roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.15, -0.2]} rotation={[-0.4, 0, 0]} castShadow>
                     <cylinderGeometry args={[0.12, 0.12, 0.05, 6]} />
                     <meshStandardMaterial color="#4A6B82" roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.1, 0.4]} castShadow receiveShadow>
                   <sphereGeometry args={[0.18, 16, 16]} />
                   <meshStandardMaterial color="#A68A72" roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.1, 0.5]}>
                   <sphereGeometry args={[0.15, 16, 16]} />
                   <meshStandardMaterial color="#E8DCC4" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.1, 0.15, 0.52]}>
                   <sphereGeometry args={[0.02, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[0.1, 0.15, 0.52]}>
                   <sphereGeometry args={[0.02, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[-0.09, 0.16, 0.53]}>
                   <sphereGeometry args={[0.006, 8, 8]} />
                   <meshStandardMaterial color="white" roughness={0.1} />
                 </mesh>
                 <mesh position={[0.11, 0.16, 0.53]}>
                   <sphereGeometry args={[0.006, 8, 8]} />
                   <meshStandardMaterial color="white" roughness={0.1} />
                 </mesh>
                 <mesh position={[-0.15, 0.1, 0.52]}>
                   <sphereGeometry args={[0.04, 8, 8]} />
                   <meshStandardMaterial color="#FFB8B8" roughness={0.9} />
                 </mesh>
                 <mesh position={[0.15, 0.1, 0.52]}>
                   <sphereGeometry args={[0.04, 8, 8]} />
                   <meshStandardMaterial color="#FFB8B8" roughness={0.9} />
                 </mesh>
                 <mesh position={[-0.2, -0.1, 0.25]} rotation={[0, 0, -0.2]} castShadow>
                   <sphereGeometry args={[0.12, 16, 16]} />
                   <meshStandardMaterial color="#A68A72" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.2, -0.1, 0.25]} rotation={[0, 0, 0.2]} castShadow>
                   <sphereGeometry args={[0.12, 16, 16]} />
                   <meshStandardMaterial color="#A68A72" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.2, -0.1, -0.25]} rotation={[0, 0, -0.2]} castShadow>
                   <sphereGeometry args={[0.12, 16, 16]} />
                   <meshStandardMaterial color="#A68A72" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.2, -0.1, -0.25]} rotation={[0, 0, 0.2]} castShadow>
                   <sphereGeometry args={[0.12, 16, 16]} />
                   <meshStandardMaterial color="#A68A72" roughness={0.8} />
                 </mesh>
                 <group ref={tailRef} position={[0, -0.05, -0.38]}>
                     <mesh castShadow>
                       <coneGeometry args={[0.06, 0.15, 8]} />
                       <meshStandardMaterial color="#A68A72" roughness={0.8} />
                     </mesh>
                 </group>
                 <group position={[0, 0.25, 0.4]} rotation={[-0.1, 0, 0]}>
                    <mesh castShadow>
                       <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
                       <meshStandardMaterial color="#211814" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, -0.04, 0]} castShadow>
                       <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
                       <meshStandardMaterial color="#211814" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, -0.02, 0]} castShadow>
                       <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
                       <meshStandardMaterial color="#D93D4A" roughness={0.8} />
                    </mesh>
                 </group>
               </group>
            )}

            {type === 'mouse' && (
               <group>
                 <mesh position={[0, 0, 0]} castShadow receiveShadow>
                   <sphereGeometry args={[0.18, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0, -0.05, 0.05]} castShadow receiveShadow>
                   <sphereGeometry args={[0.15, 16, 16]} />
                   <meshStandardMaterial color="#FDFBF7" roughness={0.8} />
                 </mesh>
                 <mesh position={[0, 0.1, 0.1]} castShadow receiveShadow>
                   <sphereGeometry args={[0.14, 16, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.12, 0.22, 0.05]} rotation={[0, 0, 0.2]} castShadow>
                   <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0.12, 0.22, 0.05]} rotation={[0, 0, -0.2]} castShadow>
                   <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.12, 0.22, 0.06]} rotation={[0, 0, 0.2]} castShadow>
                   <cylinderGeometry args={[0.07, 0.07, 0.025, 16]} />
                   <meshStandardMaterial color="#FFB8B8" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.12, 0.22, 0.06]} rotation={[0, 0, -0.2]} castShadow>
                   <cylinderGeometry args={[0.07, 0.07, 0.025, 16]} />
                   <meshStandardMaterial color="#FFB8B8" roughness={0.8} />
                 </mesh>
                 <group position={[0, 0.15, 0.22]} rotation={[-0.1, 0, 0]}>
                    <mesh position={[-0.06, 0, 0]} castShadow>
                       <torusGeometry args={[0.04, 0.015, 8, 16]} />
                       <meshStandardMaterial color="#D93D4A" roughness={0.4} />
                    </mesh>
                    <mesh position={[0.06, 0, 0]} castShadow>
                       <torusGeometry args={[0.04, 0.015, 8, 16]} />
                       <meshStandardMaterial color="#D93D4A" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 0, 0]} castShadow>
                       <boxGeometry args={[0.05, 0.01, 0.01]} />
                       <meshStandardMaterial color="#D93D4A" roughness={0.4} />
                    </mesh>
                    <mesh position={[-0.06, 0, -0.005]}>
                       <cylinderGeometry args={[0.04, 0.04, 0.005, 16]} />
                       <meshStandardMaterial color="#E8F4FA" transparent opacity={0.6} />
                    </mesh>
                    <mesh position={[0.06, 0, -0.005]}>
                       <cylinderGeometry args={[0.04, 0.04, 0.005, 16]} />
                       <meshStandardMaterial color="#E8F4FA" transparent opacity={0.6} />
                    </mesh>
                 </group>
                 <mesh position={[-0.06, 0.15, 0.22]}>
                   <sphereGeometry args={[0.015, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[0.06, 0.15, 0.22]}>
                   <sphereGeometry args={[0.015, 8, 8]} />
                   <meshStandardMaterial color="#211814" roughness={0.2} />
                 </mesh>
                 <mesh position={[0, 0.08, 0.24]}>
                   <sphereGeometry args={[0.015, 8, 8]} />
                   <meshStandardMaterial color="#FF9B9B" roughness={0.4} />
                 </mesh>
                 {/* Long curly mouse tail */}
                 <group ref={tailRef} position={[0, -0.15, -0.15]} rotation={[1.57, 0, 0]}>
                     <mesh castShadow>
                       <capsuleGeometry args={[0.015, 0.4, 8, 8]} />
                       <meshStandardMaterial color="#FF9B9B" roughness={0.8} />
                     </mesh>
                 </group>
                 <mesh position={[-0.08, -0.18, 0.05]} castShadow>
                   <capsuleGeometry args={[0.02, 0.08, 8, 8]} />
                   <meshStandardMaterial color="#FF9B9B" roughness={0.8} />
                 </mesh>
                 <mesh position={[0.08, -0.18, 0.05]} castShadow>
                   <capsuleGeometry args={[0.02, 0.08, 8, 8]} />
                   <meshStandardMaterial color="#FF9B9B" roughness={0.8} />
                 </mesh>
                 <mesh position={[-0.15, -0.05, 0.1]} rotation={[0, 0, -0.5]} castShadow>
                   <capsuleGeometry args={[0.015, 0.1, 8, 8]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
                 <mesh position={[0.15, -0.05, 0.1]} rotation={[0, 0, 0.5]} castShadow>
                   <capsuleGeometry args={[0.015, 0.1, 8, 8]} />
                   <meshStandardMaterial color={color} roughness={0.8} />
                 </mesh>
               </group>
            )}

            {type === 'secret' && (
               <mesh visible={false}>
                   <boxGeometry args={[1, 1, 1]} />
                   <meshBasicMaterial transparent opacity={0} />
               </mesh>
            )}

         </group>
      </RigidBody>
         
      {isClosest && (
        <Html position={[0, 1.5, 0]} center>
           <div className="bg-paper px-3 py-2 rounded-sm shadow-[4px_4px_0_var(--color-ink)] text-xs font-bold text-ink whitespace-nowrap pointer-events-none border-2 border-ink">
             {name}
             <div className="text-[10px] sm:hidden text-center text-ink opacity-80 uppercase tracking-widest mt-1">Tap to Talk</div>
             <div className="text-[10px] hidden sm:block text-center text-ink opacity-80 uppercase tracking-widest mt-1">Press E to Talk</div>
           </div>
        </Html>
      )}
      
      {showQuestMarker && (
         <Html position={[0, 2, 0]} center>
             <div className="text-3xl animate-bounce text-terracotta drop-shadow-[2px_2px_0_var(--color-ink)] font-display font-extrabold">!</div>
         </Html>
      )}
    </group>
  );
}
\`;

fs.writeFileSync(path.join('/Users/jamancheta/antigravity/Untitled/src/components/3d', 'NPC.tsx'), npcCode);
console.log('Successfully updated NPC.tsx!');
