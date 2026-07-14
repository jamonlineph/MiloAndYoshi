import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useInputStore } from '../../store/useInputStore';
import { YoshiModel } from './character/YoshiModel';

import { sfx } from '../../audio/sfx';

const WALK_SPEED = 4;
const RUN_SPEED = 7;
const JUMP_FORCE = 6;
const LERP_SPEED = 0.1;
const CAMERA_OFFSET = new THREE.Vector3(0, 4.25, 7.25);

export function PlayerController() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const { camera } = useThree();
  const spawnPoint = useGameStore(state => state.spawnPoint);

  // States
  const [grounded, setGrounded] = useState(true);
  const velocityRef = useRef(new THREE.Vector3());
  const lastBarkTime = useRef(0);
  const lastInteractTime = useRef(0);

  // Refs for tracking camera and movement
  const currentCameraPos = useRef(new THREE.Vector3());
  const targetCameraPos = useRef(new THREE.Vector3());
  const cameraLookAt = useRef(new THREE.Vector3());
  
  // Vectors for calculation to avoid garbage collection
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const velocity = new THREE.Vector3();

  useEffect(() => {
    // Reset position to spawn point on mount
    if (bodyRef.current) {
      bodyRef.current.setTranslation(spawnPoint, true);
    }
  }, [spawnPoint]);

  useFrame((state, delta) => {
    if (!bodyRef.current) return;

    const keys = getKeys();
    const position = bodyRef.current.translation();
    const linvel = bodyRef.current.linvel();
    
    // Check grounded state
    const rayOrigin = { x: position.x, y: position.y - 0.6, z: position.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const hit = world.castRay(new rapier.Ray(rayOrigin, rayDir), 0.2, true);
    const isGrounded = hit !== null;
    setGrounded(isGrounded);

    // Respawn if falling endlessly
    if (position.y < -10) {
       bodyRef.current.setTranslation(spawnPoint, true);
       bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
       return;
    }

    // Update global state without triggering React re-renders unnecessarily if possible
    useGameStore.getState().setPlayerPosition(position);

    // If dialog is active, prevent movement but keep camera & physics
    const storeState = useGameStore.getState();
    if (storeState.activeDialog) {
       bodyRef.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
       velocityRef.current.set(0, linvel.y, 0);
       return;
    }

    const { joystickLine, virtualButtons } = useInputStore.getState();

    // Calculate movement
    const isRunning = keys.run || virtualButtons.run;
    const speed = isRunning ? RUN_SPEED : WALK_SPEED;
    
    // Combine keyboard input with virtual joystick
    const kForward = keys.forward ? 1 : 0;
    const kBackward = keys.backward ? 1 : 0;
    const kLeft = keys.left ? 1 : 0;
    const kRight = keys.right ? 1 : 0;

    let inputZ = kBackward - kForward;
    let inputX = kLeft - kRight;

    if (Math.abs(joystickLine.x) > 0.05 || Math.abs(joystickLine.y) > 0.05) {
        inputX = -joystickLine.x; // left joystick is negative x, so flip
        inputZ = joystickLine.y;  // down is positive y
    }

    frontVector.set(0, 0, inputZ);
    sideVector.set(inputX, 0, 0);

    // Make movement camera-relative
    direction.subVectors(frontVector, sideVector);
    
    if (direction.length() > 1) {
        direction.normalize();
    }
    
    // Apply camera rotation to movement direction
    const cameraAngle = Math.atan2(camera.position.x - position.x, camera.position.z - position.z);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle);
    
    direction.multiplyScalar(speed);

    // Apply movement
    bodyRef.current.setLinvel({
      x: direction.x,
      y: linvel.y, // Preserve vertical velocity (gravity/jump)
      z: direction.z
    }, true);
    
    // Pass velocity to ref for YoshiModel animations
    velocityRef.current.set(direction.x, linvel.y, direction.z);

    // Jumping
    const isJumping = keys.jump || virtualButtons.jump;
    if (isJumping && isGrounded) {
       bodyRef.current.setLinvel({ x: linvel.x, y: JUMP_FORCE, z: linvel.z }, true);
    }
    
    // Barking
    const isBarking = keys.bark || virtualButtons.bark;
    if (isBarking && state.clock.elapsedTime - lastBarkTime.current > 0.5) {
       sfx.playBark();
       lastBarkTime.current = state.clock.elapsedTime;
       
       if (storeState.activeQuestId === 'prologue' && storeState.quests['prologue'].currentObjectiveIndex === 2) {
            // Found training sign bark
            const distToSign = Math.sqrt(Math.pow(-3 - position.x, 2) + Math.pow(-2.5 - position.z, 2));
            if (distToSign < 5) {
                storeState.advanceQuestObjective('prologue');
                storeState.setDialog('Yoshi', '(You give a confident courier bark. The training sign wobbles approvingly!)');
            }
       }

       if (storeState.activeQuestId === 'quest6' && storeState.quests['quest6'].currentObjectiveIndex === 3) {
            const distToChimes = Math.sqrt(Math.pow(20 - position.x, 2) + Math.pow(20 - position.z, 2));
            if (distToChimes < 5) {
                storeState.advanceQuestObjective('quest6');
                storeState.setDialog('Yoshi', '(You let out a loud BARK! The chimes sing brightly, and the path ahead seems clear!)');
            }
       }
    }

    // Commmanding Milo removed so he always follows

    // Facing direction and footsteps
    if (direction.lengthSq() > 0.1 && meshGroupRef.current) {
       // Handled footstep audio based on time
       if (state.clock.elapsedTime - (meshGroupRef.current.userData.lastStepTime || 0) > (keys.run ? 0.3 : 0.45) && isGrounded) {
           sfx.playFootstep();
           meshGroupRef.current.userData.lastStepTime = state.clock.elapsedTime;
       }

       // Look exactly where we are moving
       const targetPoint = new THREE.Vector3(
           position.x + direction.x,
           position.y,
           position.z + direction.z
       );
       
       const angle = Math.atan2(direction.x, direction.z);
       const currentRotation = meshGroupRef.current.rotation.y;
       let diff = angle - currentRotation;
       while (diff < -Math.PI) diff += Math.PI * 2;
       while (diff > Math.PI) diff -= Math.PI * 2;
       
       meshGroupRef.current.rotation.y += diff * 15 * delta;
    }

    // Proximity Interaction Check (every frame but mostly lightweight)
    let minDistance = 2.5; // Action radius
    let closestId: string | null = null;
    let closestPrompt: string | null = null;

    for (const [id, interactable] of storeState.interactables.entries()) {
       const dist = Math.sqrt(
           Math.pow(interactable.position.x - position.x, 2) +
           Math.pow(interactable.position.y - position.y, 2) +
           Math.pow(interactable.position.z - position.z, 2)
       );
       if (dist < minDistance) {
          minDistance = dist;
          closestId = id;
          closestPrompt = interactable.prompt;
       }
    }

    if (storeState.closestInteractableId !== closestId) {
       storeState.setClosestInteractableId(closestId);
       storeState.setInteractPrompt(closestPrompt);
    }
    
    // Add interact key cooldown
    const isInteracting = keys.interact || virtualButtons.interact;
    if (isInteracting && state.clock.elapsedTime - (lastInteractTime.current || 0) > 0.5) {
       lastInteractTime.current = state.clock.elapsedTime;
       if (closestId && !storeState.activeDialog) {
           const interactable = storeState.interactables.get(closestId);
           if (interactable) {
              interactable.onInteract();
           }
       }
    }
    
    // Camera Logic
    // Follow distance and height
    // Calculate target camera position
    targetCameraPos.current.set(position.x, position.y, position.z).add(CAMERA_OFFSET);
    
    // Smooth damp camera position
    state.camera.position.lerp(targetCameraPos.current, 0.1);
    
    // Look at player offset slightly up
    cameraLookAt.current.set(position.x, position.y + 1, position.z);
    state.camera.lookAt(cameraLookAt.current);
    
    // Update player position in store for companion
    useGameStore.setState({ playerPosition: { x: position.x, y: position.y, z: position.z } });
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      mass={1}
      lockRotations
      friction={0}
      restitution={0}
      position={[spawnPoint.x, spawnPoint.y, spawnPoint.z]}
    >
      <CapsuleCollider args={[0.3, 0.3]} position={[0, 0.6, 0]} />
      <group ref={meshGroupRef}>
        <YoshiModel velocityRef={velocityRef} isGrounded={grounded} />
      </group>
    </RigidBody>
  );
}
