import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';
import { MiloModel } from './character/MiloModel';

export function CompanionController() {
  const hasMilo = useGameStore(state => state.hasMilo);
  
  const meshGroupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const positionRef = useRef(new THREE.Vector3());
  
  const RUN_SPEED = 6;
  const WALK_SPEED = 3.5;

  useEffect(() => {
    if (hasMilo && meshGroupRef.current) {
        // Spawn beside player
        const playerPosition = useGameStore.getState().playerPosition;
        positionRef.current.set(playerPosition.x + 1, playerPosition.y, playerPosition.z + 1);
        meshGroupRef.current.position.copy(positionRef.current);
    }
  }, [hasMilo]);

  useFrame((state, delta) => {
    if (!hasMilo || !meshGroupRef.current) return;

    const { playerPosition } = useGameStore.getState();
    const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    const miloPos = positionRef.current;

    const distance = playerPos.distanceTo(miloPos);
    const direction = new THREE.Vector3().subVectors(playerPos, miloPos);

    let speed = 0;
    
    // Follow logic
    const safeDistance = 1.8;
    const runDistance = 4.0;
    const teleportDistance = 25.0;

    if (distance > teleportDistance) {
        // Teleport if too far
        miloPos.set(playerPos.x + 1, playerPos.y, playerPos.z + 1);
        meshGroupRef.current.position.copy(miloPos);
        velocityRef.current.set(0, 0, 0);
        return;
    }

    if (distance > safeDistance) {
        // Move towards player
        direction.normalize();
        
        // Face player
        const targetAngle = Math.atan2(direction.x, direction.z);
        const currentRotation = meshGroupRef.current.rotation.y;
        let diff = targetAngle - currentRotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        meshGroupRef.current.rotation.y += diff * 10 * delta;

        speed = distance > runDistance ? RUN_SPEED : WALK_SPEED;
        
        const moveVec = direction.clone().multiplyScalar(speed * delta);
        miloPos.add(moveVec);
        meshGroupRef.current.position.copy(miloPos);
        
        // simple terrain height approximation (smooth to player y)
        miloPos.y = THREE.MathUtils.lerp(miloPos.y, playerPos.y, 5 * delta);
        
        velocityRef.current.set(direction.x * speed, 0, direction.z * speed);
    } else {
        velocityRef.current.lerp(new THREE.Vector3(0, 0, 0), 0.2);
    }
  });

  if (!hasMilo) return null;

  return (
    <group ref={meshGroupRef}>
      <MiloModel velocityRef={velocityRef} />
    </group>
  );
}
