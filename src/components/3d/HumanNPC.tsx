import { Html } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { sfx } from '../../audio/sfx';
import {
  FabricMaterial,
  HairMaterial,
  LeatherMaterial,
  SkinMaterial,
} from './character/CharacterMaterials';

type HumanVariant = 'paula' | 'jam';

interface HumanNPCProps {
  id: string;
  name: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  variant: HumanVariant;
  onInteract: () => void;
  showQuestMarker?: boolean;
}

interface EyeProps {
  x: number;
  y?: number;
  iris?: string;
  narrow?: boolean;
}

function Eye({ x, y = 1.72, iris = '#2C211E', narrow = false }: EyeProps) {
  return (
    <group position={[x, y, 0.305]}>
      <mesh scale={[1.2, narrow ? 0.58 : 0.72, 0.42]} castShadow>
        <sphereGeometry args={[0.047, 14, 10]} />
        <meshStandardMaterial color="#FFF8ED" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.002, 0.036]} scale={[1, narrow ? 0.82 : 1, 0.42]}>
        <sphereGeometry args={[0.026, 12, 10]} />
        <meshStandardMaterial color={iris} roughness={0.32} />
      </mesh>
      <mesh position={[0.009, 0.008, 0.049]}>
        <sphereGeometry args={[0.007, 7, 6]} />
        <meshBasicMaterial color="#FFF8EB" />
      </mesh>
    </group>
  );
}

function OpenSmile({ y = 1.575, width = 1 }: { y?: number; width?: number }) {
  return (
    <group position={[0, y, 0.31]}>
      <mesh scale={[width, 0.5, 0.3]} castShadow>
        <sphereGeometry args={[0.105, 16, 10]} />
        <meshStandardMaterial color="#5B2B2B" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.025, 0.029]} scale={[width * 0.92, 0.24, 0.18]}>
        <sphereGeometry args={[0.095, 14, 8]} />
        <meshStandardMaterial color="#FFF9EF" roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.035, 0.025]} scale={[width * 0.5, 0.14, 0.16]}>
        <sphereGeometry args={[0.08, 12, 8]} />
        <meshStandardMaterial color="#C97876" roughness={0.65} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.093 * width, 0.025, 0.012]} rotation={[0, 0, side * -0.55]}>
          <capsuleGeometry args={[0.007, 0.025, 5, 7]} />
          <meshStandardMaterial color="#713E39" roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function Glasses() {
  const frame = '#151417';
  return (
    <group position={[0, 1.72, 0.343]}>
      {[-0.105, 0.105].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.064, 0]}><boxGeometry args={[0.19, 0.026, 0.026]} /><meshStandardMaterial color={frame} roughness={0.28} /></mesh>
          <mesh position={[0, -0.064, 0]}><boxGeometry args={[0.19, 0.026, 0.026]} /><meshStandardMaterial color={frame} roughness={0.28} /></mesh>
          <mesh position={[-0.082, 0, 0]}><boxGeometry args={[0.026, 0.128, 0.026]} /><meshStandardMaterial color={frame} roughness={0.28} /></mesh>
          <mesh position={[0.082, 0, 0]}><boxGeometry args={[0.026, 0.128, 0.026]} /><meshStandardMaterial color={frame} roughness={0.28} /></mesh>
          <mesh position={[0, 0, -0.009]}>
            <planeGeometry args={[0.145, 0.098]} />
            <meshPhysicalMaterial color="#C8E3E5" transparent opacity={0.13} roughness={0.03} />
          </mesh>
          <mesh position={[-0.045, 0.027, 0.008]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.055, 0.009, 0.006]} />
            <meshBasicMaterial color="#EFFBFA" transparent opacity={0.45} />
          </mesh>
        </group>
      ))}
      <mesh><boxGeometry args={[0.045, 0.021, 0.028]} /><meshStandardMaterial color={frame} roughness={0.25} /></mesh>
      {[-0.265, 0.265].map((x) => (
        <mesh key={`temple-${x}`} position={[x, 0.015, -0.035]} rotation={[0, x < 0 ? -0.52 : 0.52, 0]}>
          <boxGeometry args={[0.15, 0.022, 0.024]} />
          <meshStandardMaterial color={frame} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

interface PortraitFaceProps {
  variant: HumanVariant;
  skin: string;
  skinShadow: string;
}

function PortraitFace({ variant, skin, skinShadow }: PortraitFaceProps) {
  const isJam = variant === 'jam';
  const earX = isJam ? 0.306 : 0.286;
  return (
    <group>
      {[-earX, earX].map((x) => (
        <mesh key={`ear-${x}`} position={[x, 1.69, -0.005]} scale={[0.62, 1, 0.5]} castShadow>
          <sphereGeometry args={[0.075, 12, 9]} />
          <SkinMaterial color={skinShadow} roughness={0.78} />
        </mesh>
      ))}
      <Eye x={isJam ? -0.103 : -0.094} y={isJam ? 1.72 : 1.725} iris={isJam ? '#241C18' : '#3A2620'} narrow={!isJam} />
      <Eye x={isJam ? 0.103 : 0.094} y={isJam ? 1.72 : 1.725} iris={isJam ? '#241C18' : '#3A2620'} narrow={!isJam} />
      {[-0.1, 0.1].map((x) => (
        <mesh
          key={`brow-${x}`}
          position={[x, 1.81, 0.302]}
          rotation={[0, 0, Math.PI / 2 + (x < 0 ? -0.1 : 0.1)]}
        >
          <capsuleGeometry args={[isJam ? 0.013 : 0.01, isJam ? 0.105 : 0.095, 6, 8]} />
          <meshStandardMaterial color={isJam ? '#211A18' : '#4A2D27'} roughness={0.86} />
        </mesh>
      ))}
      <mesh position={[0, 1.65, 0.322]} scale={[0.7, 1, 0.72]} castShadow>
        <sphereGeometry args={[isJam ? 0.052 : 0.045, 12, 9]} />
        <SkinMaterial color={skinShadow} roughness={0.72} />
      </mesh>
      {[-0.17, 0.17].map((x) => (
        <mesh key={`cheek-${x}`} position={[x, 1.625, 0.287]} scale={[1.15, 0.7, 0.3]}>
          <sphereGeometry args={[0.047, 10, 8]} />
          <meshStandardMaterial color={isJam ? '#D88468' : '#EC9D91'} transparent opacity={0.2} roughness={0.9} />
        </mesh>
      ))}
      <OpenSmile y={isJam ? 1.555 : 1.565} width={isJam ? 1.02 : 0.84} />
      {!isJam && [-0.289, 0.289].map((x) => (
        <mesh key={`stud-${x}`} position={[x, 1.665, 0.055]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshStandardMaterial color="#D9B06C" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
      {isJam && <Glasses />}
    </group>
  );
}

function JamModel() {
  const skin = '#B87858';
  const skinShadow = '#A8664B';
  const jacket = '#B8A487';
  return (
    <group>
      {/* Ochre backpack peeking out behind the warm field jacket. */}
      <mesh position={[0, 1.02, -0.29]} scale={[0.88, 1.06, 0.48]} castShadow>
        <capsuleGeometry args={[0.29, 0.55, 10, 14]} />
        <LeatherMaterial color="#B77926" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.82, -0.45]} castShadow>
        <boxGeometry args={[0.44, 0.25, 0.08]} />
        <LeatherMaterial color="#925C1E" roughness={0.92} />
      </mesh>
      {[-0.15, 0.15].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.33, 0]} castShadow><capsuleGeometry args={[0.11, 0.43, 8, 12]} /><FabricMaterial color="#332F30" roughness={0.86} /></mesh>
          <mesh position={[x, 0.09, 0.065]} scale={[1, 0.52, 1.42]} castShadow><sphereGeometry args={[0.135, 12, 9]} /><LeatherMaterial color="#3D2C25" roughness={0.9} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.92, 0]} scale={[1, 1.08, 0.72]} castShadow receiveShadow>
        <capsuleGeometry args={[0.34, 0.62, 12, 18]} />
        <FabricMaterial color={jacket} roughness={0.88} />
      </mesh>
      {/* Brown mock neck and olive plaid overshirt visible between the lapels. */}
      <mesh position={[0, 1.26, 0.292]} castShadow>
        <boxGeometry args={[0.31, 0.29, 0.075]} />
        <FabricMaterial color="#342721" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.08, 0.325]} castShadow>
        <boxGeometry args={[0.36, 0.35, 0.07]} />
        <FabricMaterial color="#686354" roughness={0.94} />
      </mesh>
      {[-0.11, 0.11].map((x) => (
        <mesh key={`plaid-v-${x}`} position={[x, 1.08, 0.365]}>
          <boxGeometry args={[0.025, 0.34, 0.012]} />
          <FabricMaterial color="#49463C" roughness={0.92} bumpScale={0.01} />
        </mesh>
      ))}
      {[0.98, 1.09, 1.2].map((y) => (
        <mesh key={`plaid-h-${y}`} position={[0, y, 0.366]}>
          <boxGeometry args={[0.34, 0.014, 0.012]} />
          <FabricMaterial color="#77715E" roughness={0.92} bumpScale={0.01} />
        </mesh>
      ))}
      {/* Wide brown collar, tailored front panels, pockets, and backpack straps. */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={`collar-${x}`} position={[x, 1.37, 0.24]} rotation={[0, 0, x < 0 ? -0.36 : 0.36]} castShadow>
          <boxGeometry args={[0.27, 0.17, 0.1]} />
          <FabricMaterial color="#88694F" roughness={0.95} />
        </mesh>
      ))}
      {[-0.19, 0.19].map((x) => (
        <mesh key={`lapel-${x}`} position={[x, 1.18, 0.315]} rotation={[0, 0, x < 0 ? -0.34 : 0.34]} castShadow>
          <boxGeometry args={[0.18, 0.36, 0.065]} />
          <FabricMaterial color="#A28B70" roughness={0.92} />
        </mesh>
      ))}
      {[-0.19, 0.19].map((x) => (
        <mesh key={`strap-${x}`} position={[x, 1.04, 0.34]} rotation={[0, 0, x < 0 ? -0.09 : 0.09]} castShadow>
          <boxGeometry args={[0.07, 0.76, 0.045]} />
          <LeatherMaterial color="#C58A2D" roughness={0.76} />
        </mesh>
      ))}
      {[-0.2, 0.2].map((x) => (
        <mesh key={`pocket-${x}`} position={[x, 0.78, 0.315]} castShadow>
          <boxGeometry args={[0.2, 0.17, 0.055]} />
          <FabricMaterial color="#A99579" roughness={0.94} />
        </mesh>
      ))}
      {[0.77, 0.97, 1.17].map((y) => (
        <mesh key={`button-${y}`} position={[0.035, y, 0.36]}>
          <cylinderGeometry args={[0.022, 0.022, 0.018, 10]} />
          <meshStandardMaterial color="#5C493B" roughness={0.65} />
        </mesh>
      ))}
      {[-0.43, 0.43].map((x) => (
        <mesh key={`arm-${x}`} position={[x, 0.96, 0]} rotation={[0, 0, x < 0 ? -0.12 : 0.12]} castShadow>
          <capsuleGeometry args={[0.11, 0.62, 8, 12]} />
          <FabricMaterial color={jacket} roughness={0.92} />
        </mesh>
      ))}
      {[-0.46, 0.46].map((x) => (
        <mesh key={`hand-${x}`} position={[x, 0.57, 0.025]} scale={[0.85, 1, 0.8]} castShadow>
          <sphereGeometry args={[0.105, 12, 9]} />
          <SkinMaterial color={skin} roughness={0.78} />
        </mesh>
      ))}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.14, 0.18, 12]} />
        <SkinMaterial color={skinShadow} roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.68, 0]} scale={[0.98, 1.06, 0.92]} castShadow>
        <sphereGeometry args={[0.31, 20, 16]} />
        <SkinMaterial color={skin} roughness={0.72} />
      </mesh>
      {/* Short black side-part with tapered sides and a swept front. */}
      <mesh position={[0, 1.9, -0.018]} scale={[1.02, 0.43, 0.98]} castShadow>
        <sphereGeometry args={[0.32, 16, 12]} />
        <HairMaterial color="#1B1A1A" roughness={0.88} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={`fade-${x}`} position={[x, 1.79, -0.03]} scale={[0.45, 0.78, 0.65]} castShadow>
          <sphereGeometry args={[0.16, 12, 9]} />
          <HairMaterial color="#242120" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-0.12, 1.89, 0.21]} rotation={[0.18, 0.04, 0.2]} castShadow>
        <boxGeometry args={[0.27, 0.13, 0.105]} />
        <HairMaterial color="#181718" roughness={0.88} />
      </mesh>
      <mesh position={[0.11, 1.91, 0.205]} rotation={[0.15, -0.03, -0.1]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.1]} />
        <HairMaterial color="#1E1C1C" roughness={0.88} />
      </mesh>
      <PortraitFace variant="jam" skin={skin} skinShadow={skinShadow} />
    </group>
  );
}

function PaulaModel() {
  const skin = '#D99A78';
  const skinShadow = '#C88367';
  return (
    <group>
      {/* Shoulder-length brown hair and a small tied-back section. */}
      <mesh position={[0, 1.62, -0.11]} scale={[1.03, 1.38, 0.78]} castShadow>
        <sphereGeometry args={[0.31, 18, 14]} />
        <HairMaterial color="#3D2926" roughness={0.93} />
      </mesh>
      <mesh position={[0, 1.39, -0.28]} rotation={[0.25, 0, 0]} scale={[0.82, 1.05, 0.72]} castShadow>
        <capsuleGeometry args={[0.13, 0.28, 8, 12]} />
        <HairMaterial color="#352320" roughness={0.94} />
      </mesh>
      {[-0.13, 0.13].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.31, 0]} castShadow><capsuleGeometry args={[0.09, 0.44, 8, 12]} /><FabricMaterial color="#252735" roughness={0.84} /></mesh>
          <mesh position={[x, 0.07, 0.05]} scale={[1, 0.5, 1.3]} castShadow><sphereGeometry args={[0.12, 10, 8]} /><LeatherMaterial color="#302A2D" roughness={0.9} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.92, 0]} scale={[0.94, 1.08, 0.7]} castShadow receiveShadow>
        <capsuleGeometry args={[0.32, 0.65, 12, 18]} />
        <FabricMaterial color="#1D2E4D" roughness={0.84} />
      </mesh>
      {/* Navy sweater, crisp white collar, and plush black coat from the photo. */}
      <mesh position={[0, 1.21, 0.29]} castShadow>
        <boxGeometry args={[0.37, 0.31, 0.07]} />
        <FabricMaterial color="#F3F0E9" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.08, 0.33]} castShadow>
        <boxGeometry args={[0.4, 0.36, 0.075]} />
        <FabricMaterial color="#1D2E4D" roughness={0.88} />
      </mesh>
      {[-0.245, 0.245].map((x) => (
        <mesh key={`coat-${x}`} position={[x, 0.98, 0.16]} scale={[0.7, 1, 0.65]} castShadow>
          <capsuleGeometry args={[0.18, 0.67, 10, 14]} />
          <FabricMaterial color={x < 0 ? '#1F2025' : '#191A1E'} roughness={0.98} bumpScale={0.024} />
        </mesh>
      ))}
      <mesh position={[-0.1, 1.31, 0.31]} rotation={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[0.27, 0.13, 0.055]} />
        <FabricMaterial color="#F4F0E8" roughness={0.82} />
      </mesh>
      <mesh position={[0.1, 1.31, 0.31]} rotation={[0, 0, 0.42]} castShadow>
        <boxGeometry args={[0.27, 0.13, 0.055]} />
        <FabricMaterial color="#F4F0E8" roughness={0.82} />
      </mesh>
      {[-0.17, 0.17].map((x) => (
        <mesh key={`lapel-${x}`} position={[x, 1.16, 0.335]} rotation={[0, 0, x < 0 ? -0.42 : 0.42]} castShadow>
          <boxGeometry args={[0.16, 0.38, 0.055]} />
          <FabricMaterial color="#24252A" roughness={0.96} />
        </mesh>
      ))}
      {[0.8, 1.02].map((y) => (
        <mesh key={`coat-button-${y}`} position={[0.02, y, 0.37]}>
          <cylinderGeometry args={[0.021, 0.021, 0.018, 10]} />
          <meshStandardMaterial color="#0E0F12" roughness={0.6} />
        </mesh>
      ))}
      {[-0.41, 0.41].map((x) => (
        <mesh key={`arm-${x}`} position={[x, 0.94, 0]} rotation={[0, 0, x < 0 ? -0.08 : 0.08]} castShadow>
          <capsuleGeometry args={[0.1, 0.62, 8, 12]} />
          <FabricMaterial color="#202126" roughness={0.92} bumpScale={0.024} />
        </mesh>
      ))}
      {[-0.43, 0.43].map((x) => (
        <mesh key={`hand-${x}`} position={[x, 0.56, 0.02]} scale={[0.82, 1, 0.78]} castShadow>
          <sphereGeometry args={[0.098, 12, 9]} />
          <SkinMaterial color={skin} roughness={0.76} />
        </mesh>
      ))}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.115, 0.125, 0.18, 12]} />
        <SkinMaterial color={skinShadow} roughness={0.76} />
      </mesh>
      <mesh position={[0, 1.68, 0.015]} scale={[0.9, 1.12, 0.87]} castShadow>
        <sphereGeometry args={[0.3, 20, 16]} />
        <SkinMaterial color={skin} roughness={0.7} />
      </mesh>
      {/* Center-parted crown and face-framing strands. */}
      <mesh position={[0, 1.89, -0.03]} scale={[1.02, 0.43, 0.98]} castShadow>
        <sphereGeometry args={[0.31, 18, 14]} />
        <HairMaterial color="#49312B" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.925, 0.252]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.014, 0.13, 0.018]} />
        <SkinMaterial color={skinShadow} roughness={0.8} />
      </mesh>
      {[-0.245, 0.245].map((x) => (
        <mesh key={`hair-${x}`} position={[x, 1.61, 0.015]} rotation={[0.03, 0, x < 0 ? -0.1 : 0.1]} castShadow>
          <capsuleGeometry args={[0.082, 0.48, 8, 12]} />
          <HairMaterial color={x < 0 ? '#51362F' : '#402A26'} roughness={0.93} />
        </mesh>
      ))}
      <mesh position={[-0.12, 1.84, 0.235]} rotation={[0.15, 0.05, -0.44]} castShadow>
        <capsuleGeometry args={[0.043, 0.22, 8, 10]} />
        <HairMaterial color="#553832" roughness={0.92} />
      </mesh>
      <mesh position={[0.12, 1.84, 0.235]} rotation={[0.15, -0.05, 0.44]} castShadow>
        <capsuleGeometry args={[0.043, 0.22, 8, 10]} />
        <HairMaterial color="#402A26" roughness={0.92} />
      </mesh>
      <PortraitFace variant="paula" skin={skin} skinShadow={skinShadow} />
    </group>
  );
}

export function HumanNPC({ id, name, position, rotation = [0, 0, 0], variant, onInteract, showQuestMarker = false }: HumanNPCProps) {
  const outerRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const isClosest = useGameStore((state) => state.closestInteractableId === id);

  useEffect(() => {
    const store = useGameStore.getState();
    const interact = () => {
      sfx.playPop();
      onInteract();
    };
    store.registerInteractable(id, { x: position[0], y: position[1] + 0.9, z: position[2] }, 'Talk', interact);
    return () => store.unregisterInteractable(id);
  }, [id, onInteract, position]);

  useFrame((state, delta) => {
    if (!modelRef.current) return;
    const player = useGameStore.getState().playerPosition;
    const distance = Math.hypot(player.x - position[0], player.z - position[2]);
    if (distance < 4) {
      const target = Math.atan2(player.x - position[0], player.z - position[2]);
      let difference = target - modelRef.current.rotation.y;
      while (difference < -Math.PI) difference += Math.PI * 2;
      while (difference > Math.PI) difference -= Math.PI * 2;
      modelRef.current.rotation.y += difference * Math.min(1, delta * 4);
    }
    modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.7 + (variant === 'paula' ? 0 : 1.4)) * 0.015;
  });

  return (
    <group ref={outerRef} position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders="cuboid">
        <group ref={modelRef}>{variant === 'paula' ? <PaulaModel /> : <JamModel />}</group>
      </RigidBody>
      {isClosest && (
        <Html position={[0, 2.35, 0]} center>
          <div className="bg-paper px-3 py-2 shadow-[4px_4px_0_var(--color-ink)] text-xs font-bold text-ink whitespace-nowrap pointer-events-none border-2 border-ink">
            {name}
            <div className="text-[10px] text-center opacity-70 uppercase tracking-widest mt-1">Press E to talk</div>
          </div>
        </Html>
      )}
      {showQuestMarker && (
        <Html position={[0, 2.65, 0]} center>
          <div className="text-3xl animate-bounce text-terracotta drop-shadow-[2px_2px_0_var(--color-ink)] font-display font-extrabold">!</div>
        </Html>
      )}
    </group>
  );
}
