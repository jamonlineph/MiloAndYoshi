import { Html } from '@react-three/drei';
import { CylinderCollider, MeshCollider, RigidBody } from '@react-three/rapier';
import { useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore';
import { HumanNPC } from '../HumanNPC';
import { NPC } from '../NPC';
import { Bakery, House, MarketStall, WoodenArch } from '../objects/Buildings';
import {
  ArchBridge,
  Barrel,
  Bench,
  Bunting,
  Campfire,
  Cart,
  Clothesline,
  Crate,
  Fountain,
  Lantern,
  Mailbox,
  Signpost,
  Streetlamp,
  WellPump,
} from '../objects/Props';
import {
  Bush,
  FlowerBed,
  Mushroom,
  PineTree,
  Rock,
  TallGrass,
  Tree,
} from '../objects/Nature';
import { Butterfly, Dragonfly, Frog, Seagull } from '../effects/Animals';
import { Atmosphere } from '../effects/Atmosphere';
import {
  CurvedPath,
  LandscapeDetail,
  SculptedIsland,
  Shoreline,
  TerrainMound,
} from './Landscape';
import { grassMaterial, hillGrassMaterial, plazaMaterial, sandMaterial, soilMaterial } from './materials';
import { Water } from './Water';

type Position = [number, number, number];

const WOODLAND_TREES: Array<{ position: Position; pine?: boolean; blossom?: boolean; scale: number }> = [
  // Cedar Hollow rises behind Maple House instead of forming a tree ring.
  { position: [-36, 0.78, -27], pine: true, scale: 1.55 },
  { position: [-31, 0.46, -29], pine: true, scale: 1.25 },
  { position: [-39, 0.34, -23], scale: 1.35 },
  { position: [-34, 0.3, -32], pine: true, scale: 1.25 },
  { position: [-27, 0, -36], scale: 1.25 },
  { position: [-42, 0, -17], pine: true, scale: 1.35 },
  // A windbreak gives the market a wooded backdrop while leaving its entrance open.
  { position: [29, 0, -37], pine: true, scale: 1.35 },
  { position: [35, 0, -33], scale: 1.25 },
  { position: [40, 0, -27], pine: true, scale: 1.45 },
  { position: [43, 0, -19], scale: 1.3 },
  { position: [35, 0, -25], pine: true, scale: 1.2 },
  // Meadow Ridge is a clustered grove on a low rise.
  { position: [36, 0.98, 18], scale: 1.5 },
  { position: [32, 0.56, 16], pine: true, scale: 1.2 },
  { position: [40, 0.5, 21], scale: 1.3 },
  { position: [35, 0.54, 24], blossom: true, scale: 1.25 },
  { position: [42, 0.18, 13], pine: true, scale: 1.3 },
  { position: [39, 0.18, 8], scale: 1.2 },
  // Pond Grove frames the western water without closing off the bridge view.
  { position: [-42, 0, 9], pine: true, scale: 1.3 },
  { position: [-44, 0, 18], scale: 1.35 },
  { position: [-40, 0, 26], pine: true, scale: 1.4 },
  { position: [-34, 0, 32], scale: 1.25 },
  { position: [-29, 0, 36], pine: true, scale: 1.25 },
  // Two small copses frame the lookout while preserving the ocean horizon.
  { position: [-20, 0, 41], scale: 1.25 },
  { position: [-13, 0, 43], pine: true, scale: 1.3 },
  { position: [13, 0, 43], scale: 1.2 },
  { position: [21, 0, 40], pine: true, scale: 1.3 },
];

const ORCHARD_TREES: Position[] = [
  [-28, 0, -14], [-22.5, 0, -15], [-17, 0, -13.5],
  [-29, 0, -7], [-23, 0, -8], [-16.5, 0, -7],
  [-27.5, 0, -1], [-21.5, 0, -2], [-16, 0, -1],
];

interface FenceRunProps {
  position: Position;
  length: number;
  rotation?: number;
}

function FenceRun({ position, length, rotation = 0 }: FenceRunProps) {
  const postCount = Math.max(2, Math.ceil(length / 2.2) + 1);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[0.32, 0.67].map((height) => (
        <mesh key={height} position={[0, height, 0]} castShadow>
          <boxGeometry args={[length, 0.11, 0.13]} />
          <meshStandardMaterial color="#8A6241" roughness={0.94} />
        </mesh>
      ))}
      {Array.from({ length: postCount }).map((_, index) => (
        <group key={index} position={[-length / 2 + (index * length) / (postCount - 1), 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.17, 1, 0.17]} />
            <meshStandardMaterial color="#6E4B34" roughness={0.95} />
          </mesh>
          <mesh position={[0, 1.04, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.16, 0.18, 4]} />
            <meshStandardMaterial color="#6E4B34" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface InteractionAnchorProps {
  id: string;
  label: string;
  position: Position;
  onInteract: () => void;
  showQuestMarker?: boolean;
}

function InteractionAnchor({ id, label, position, onInteract, showQuestMarker = false }: InteractionAnchorProps) {
  const isClosest = useGameStore((state) => state.closestInteractableId === id);

  useEffect(() => {
    const store = useGameStore.getState();
    store.registerInteractable(id, { x: position[0], y: position[1], z: position[2] }, label, onInteract);
    return () => store.unregisterInteractable(id);
  }, [id, label, onInteract, position]);

  return (
    <group position={position}>
      {isClosest && (
        <Html position={[0, 1.2, 0]} center>
          <div className="bg-paper px-3 py-2 shadow-[3px_3px_0_var(--color-ink)] text-xs font-bold text-ink whitespace-nowrap pointer-events-none border-2 border-ink">
            {label}
          </div>
        </Html>
      )}
      {showQuestMarker && (
        <Html position={[0, 1.55, 0]} center>
          <div className="text-3xl animate-bounce text-terracotta drop-shadow-[2px_2px_0_var(--color-ink)] font-display font-extrabold">!</div>
        </Html>
      )}
    </group>
  );
}

function WelcomeBasket({ opened }: { opened: boolean }) {
  return (
    <group position={[-1.7, 0, -14.2]} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.34, 0.45, 12]} />
        <meshStandardMaterial color="#A87848" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.32, 0.035, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#704A2F" roughness={0.9} />
      </mesh>
      {!opened && (
        <>
          <mesh position={[-0.13, 0.48, 0]} rotation={[0.2, 0.1, -0.1]} castShadow>
            <boxGeometry args={[0.22, 0.1, 0.26]} />
            <meshStandardMaterial color="#D96C5B" roughness={0.85} />
          </mesh>
          <mesh position={[0.15, 0.48, 0.02]} rotation={[-0.1, -0.2, 0.08]} castShadow>
            <boxGeometry args={[0.22, 0.1, 0.26]} />
            <meshStandardMaterial color="#E8DCC4" roughness={0.9} />
          </mesh>
        </>
      )}
    </group>
  );
}

function PicnicBlanket() {
  return (
    <group position={[7, 0.04, 7.5]} rotation={[0, -0.18, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#D96C5B" roughness={0.96} />
      </mesh>
      {[-1.5, -0.5, 0.5, 1.5].flatMap((x) =>
        [-1.5, -0.5, 0.5, 1.5].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.82, 0.82]} />
            <meshStandardMaterial color={(Math.round(x + z) % 2 === 0) ? '#F5E9D2' : '#C84F48'} roughness={0.98} />
          </mesh>
        )),
      )}
      <mesh position={[1.8, 0.22, 1.2]} castShadow>
        <cylinderGeometry args={[0.38, 0.3, 0.4, 12]} />
        <meshStandardMaterial color="#A87848" roughness={0.92} />
      </mesh>
      <mesh position={[1.8, 0.48, 1.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.28, 0.03, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#704A2F" roughness={0.9} />
      </mesh>
    </group>
  );
}

function GardenPatch({ watered }: { watered: boolean }) {
  return (
    <group position={[9, 0, -17]}>
      {[0, 1, 2].map((row) => (
        <group key={row} position={[-2 + row * 2, 0, 0]}>
          <mesh material={soilMaterial} position={[0, 0.06, 0]} receiveShadow>
            <boxGeometry args={[1.35, 0.12, 5]} />
          </mesh>
          {watered && [-1.6, -0.8, 0, 0.8, 1.6].map((z, index) => (
            <group key={z} position={[0, 0.16, z]}>
              <mesh rotation={[0, 0, -0.48]} castShadow><capsuleGeometry args={[0.035, 0.22, 6, 6]} /><meshStandardMaterial color="#5D9B58" roughness={0.9} /></mesh>
              <mesh rotation={[0, 0, 0.48]} castShadow><capsuleGeometry args={[0.035, 0.22, 6, 6]} /><meshStandardMaterial color={index % 2 ? '#79B76E' : '#4F8D4D'} roughness={0.9} /></mesh>
            </group>
          ))}
        </group>
      ))}
      <WellPump position={[4.2, 0, 0]} scale={0.75} />
      <Barrel position={[4.2, 0, 1.5]} scale={0.7} />
    </group>
  );
}

function PawToken({ position, found, color }: { position: Position; found: boolean; color: string }) {
  const opacity = found ? 0.3 : 1;
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0.15]}>
      <mesh scale={[0.7, 0.85, 0.18]} castShadow>
        <sphereGeometry args={[0.42, 12, 10]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.88} />
      </mesh>
      {[[-0.38, 0.42], [-0.13, 0.58], [0.14, 0.58], [0.4, 0.4]].map(([x, y], index) => (
        <mesh key={index} position={[x, y, 0]} scale={[0.25, 0.3, 0.18]} castShadow>
          <sphereGeometry args={[0.42, 10, 8]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.88} />
        </mesh>
      ))}
    </group>
  );
}

function QuestLantern({ position, lit }: { position: Position; lit: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.48, 0]} castShadow><cylinderGeometry args={[0.04, 0.055, 0.95, 8]} /><meshStandardMaterial color="#574334" roughness={0.86} /></mesh>
      <mesh position={[0, 1.08, 0]} castShadow><cylinderGeometry args={[0.17, 0.12, 0.35, 8]} /><meshStandardMaterial color={lit ? '#FFD785' : '#8F8575'} emissive={lit ? '#FFB84F' : '#000000'} emissiveIntensity={lit ? 1.8 : 0} roughness={0.3} /></mesh>
      <mesh position={[0, 1.3, 0]} castShadow><coneGeometry args={[0.23, 0.18, 8]} /><meshStandardMaterial color="#3D3028" roughness={0.9} /></mesh>
      {lit && <pointLight position={[0, 1.1, 0]} color="#FFB85C" intensity={1.25} distance={7} decay={2} />}
    </group>
  );
}

function FlowerQuestSpot({ position, color, picked }: { position: Position; color: string; picked: boolean }) {
  return (
    <group position={position} scale={picked ? 0.5 : 1}>
      <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.025, 0.04, 0.6, 7]} /><meshStandardMaterial color="#4D8C4F" roughness={0.9} /></mesh>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.15, 0.62, Math.sin(angle) * 0.15]} scale={[1, 0.45, 1]} castShadow>
            <sphereGeometry args={[0.13, 9, 7]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.62, 0]} castShadow><sphereGeometry args={[0.09, 9, 7]} /><meshStandardMaterial color="#F2C14E" roughness={0.75} /></mesh>
    </group>
  );
}

export function PawprintBay() {
  const quests = useGameStore((state) => state.quests);
  const activeQuestId = useGameStore((state) => state.activeQuestId);
  const worldFlags = useGameStore((state) => state.worldFlags);
  const setDialog = useGameStore((state) => state.setDialog);
  const setActiveQuest = useGameStore((state) => state.setActiveQuest);
  const advanceQuestObjective = useGameStore((state) => state.advanceQuestObjective);
  const setQuestStatus = useGameStore((state) => state.setQuestStatus);
  const setWorldFlag = useGameStore((state) => state.setWorldFlag);
  const addStamp = useGameStore((state) => state.addStamp);
  const setTimeOfDay = useGameStore((state) => state.setTimeOfDay);

  const homecoming = quests.homecoming;
  const picnic = quests.picnic;
  const garden = quests.garden;
  const memories = quests.memories;
  const lanterns = quests.lanterns;

  const startQuest = (id: string, speaker: string, text: string) => {
    setDialog(speaker, text, () => {
      setActiveQuest(id);
      advanceQuestObjective(id);
    });
  };

  const handlePaulaInteract = () => {
    if (homecoming?.status === 'available' && !activeQuestId) {
      startQuest('homecoming', 'Paula', 'Good morning, Yoshi! Jam and I made a welcome basket for you and Milo. Have a sniff on the porch, then meet us by the garden gate. No hurry—today belongs to you two.');
      return;
    }
    if (activeQuestId === 'picnic' && picnic?.currentObjectiveIndex === 4) {
      setDialog('Paula', 'These are the exact colors from our favorite walks. Let us put them beside the picnic blanket so everyone can enjoy them.', () => {
        advanceQuestObjective('picnic');
        setQuestStatus('garden', 'available');
        addStamp('Sunshine Picnic Stamp');
      });
      return;
    }
    if (garden?.status === 'available' && !activeQuestId) {
      startQuest('garden', 'Paula', 'Milo keeps visiting the sunny patch beside the house. I think he wants a garden of his own. Could you fetch the seed packet from Sora’s market cart?');
      return;
    }
    if (lanterns?.status === 'available' && !activeQuestId) {
      startQuest('lanterns', 'Paula', 'The village always feels coziest when the lanterns lead home. Light the porch, garden, and pond lanterns, then come back before sunset.');
      return;
    }
    if (activeQuestId === 'lanterns' && lanterns?.currentObjectiveIndex === 4) {
      setDialog('Paula', 'There you both are. Every light is glowing, Jam has the kettle on, and home is exactly where it should be.', () => {
        advanceQuestObjective('lanterns');
        addStamp('Home Together Stamp');
        setTimeOfDay('sunset');
      });
      return;
    }
    setDialog('Paula', activeQuestId ? 'You and Milo make even the smallest errand feel like an adventure.' : 'Come sit with us whenever your paws need a rest.');
  };

  const handleJamInteract = () => {
    if (activeQuestId === 'homecoming' && homecoming?.currentObjectiveIndex === 2) {
      setDialog('Jam', 'There are my two trail buddies! Paula has breakfast ready, but first—look at that happy tail. Welcome home, boys.', () => {
        advanceQuestObjective('homecoming');
        setQuestStatus('picnic', 'available');
        addStamp('Maple House Stamp');
      });
      return;
    }
    if (picnic?.status === 'available' && !activeQuestId) {
      startQuest('picnic', 'Jam', 'I want to surprise Paula with a picnic. Help me gather three little flowers: a buttercup, a pond bluebell, and one pink orchard blossom. Milo knows every shortcut.');
      return;
    }
    if (activeQuestId === 'garden' && garden?.currentObjectiveIndex === 3) {
      setDialog('Jam', 'Milo grew those? I knew he had excellent taste in digging spots. We will make a tiny wooden sign for his garden.', () => {
        advanceQuestObjective('garden');
        setQuestStatus('memories', 'available');
        addStamp('Little Sprout Stamp');
      });
      return;
    }
    if (memories?.status === 'available' && !activeQuestId) {
      startQuest('memories', 'Jam', 'I placed three wooden pawprints along our favorite family walk: pond, orchard, and hilltop. Find them in that order and bring Milo back to me.');
      return;
    }
    if (activeQuestId === 'memories' && memories?.currentObjectiveIndex === 4) {
      setDialog('Jam', 'You found the whole trail. Those places mattered before, but they feel even better now that the four of us have walked them together.', () => {
        advanceQuestObjective('memories');
        setQuestStatus('lanterns', 'available');
        addStamp('Family Trail Stamp');
      });
      return;
    }
    setDialog('Jam', activeQuestId ? 'Take your time. The best walks are the ones where you stop to sniff everything.' : 'I saved a spot for both of you by the fire.');
  };

  const collectFlower = (index: number, flag: string, name: string) => {
    if (activeQuestId !== 'picnic' || picnic?.currentObjectiveIndex !== index) {
      setDialog('Yoshi', worldFlags[flag] ? `(The ${name} still smells lovely.)` : `(A lovely ${name}. Maybe it is for another part of the walk.)`);
      return;
    }
    setWorldFlag(flag, true);
    useGameStore.getState().addItem('picnic-flower', 1);
    setDialog('Yoshi', `(You carefully pick the ${name}. Milo approves with one very serious sniff.)`, () => advanceQuestObjective('picnic'));
  };

  const findMemory = (index: number, flag: string, place: string) => {
    if (activeQuestId !== 'memories' || memories?.currentObjectiveIndex !== index) {
      setDialog('Jam’s Pawprint', worldFlags[flag] ? `(You remember finding this one near ${place}.)` : `(A carved pawprint points farther along the family trail.)`);
      return;
    }
    setWorldFlag(flag, true);
    setDialog('Jam’s Pawprint', `(A tiny carving reads: “For the walks that always bring us back together.”)`, () => advanceQuestObjective('memories'));
  };

  const lightLantern = (index: number, flag: string, place: string) => {
    if (activeQuestId !== 'lanterns' || lanterns?.currentObjectiveIndex !== index) {
      setDialog('Lantern', worldFlags[flag] ? `(The ${place} lantern glows warmly.)` : `(This lantern is waiting for the evening walk.)`);
      return;
    }
    setWorldFlag(flag, true);
    setDialog('Lantern', `(The ${place} lantern flickers on, painting a little pool of gold across the path.)`, () => advanceQuestObjective('lanterns'));
  };

  const paulaMarker = homecoming?.status === 'available' ||
    (activeQuestId === 'picnic' && picnic?.currentObjectiveIndex === 4) ||
    garden?.status === 'available' || lanterns?.status === 'available' ||
    (activeQuestId === 'lanterns' && lanterns?.currentObjectiveIndex === 4);
  const jamMarker = (activeQuestId === 'homecoming' && homecoming?.currentObjectiveIndex === 2) ||
    picnic?.status === 'available' ||
    (activeQuestId === 'garden' && garden?.currentObjectiveIndex === 3) ||
    memories?.status === 'available' ||
    (activeQuestId === 'memories' && memories?.currentObjectiveIndex === 4);

  return (
    <group>
      <Water />
      <Atmosphere />

      {/* An asymmetric island with coves, headlands, and a winding village walk. */}
      <RigidBody type="fixed" colliders={false} friction={1}>
        <CylinderCollider args={[0.5, 40.5]} position={[0, -0.5, 0]} />
        <SculptedIsland
          position={[0, -0.5, 0]}
          radiusTop={46}
          radiusBottom={50}
          height={1}
          seed={13}
          irregularity={0.12}
          scaleX={1.06}
          scaleZ={0.96}
        />
        <Shoreline
          innerRadius={40.5}
          outerRadius={46.5}
          seed={13}
          irregularity={0.12}
          scaleX={1.06}
          scaleZ={0.96}
        />

        <CurvedPath points={[[0, 0, -17], [0.5, 0, -10], [-1.5, 0, -4], [-1, 0, 1]]} width={3.35} />
        <CurvedPath points={[[-1, 0, 1], [5, 0, -1], [10, 0, -5], [16, 0, -8], [22, 0, -8]]} width={3.15} />
        <CurvedPath points={[[3, 0, 3], [8, 0, 7], [13, 0, 12], [18, 0, 18]]} width={3.05} />
        <CurvedPath points={[[-2, 0, 2], [-6, 0, 6], [-10, 0, 12], [-11, 0, 18]]} width={3.05} />
        <CurvedPath points={[[-11, 0, 13], [-15, 0, 8], [-17, 0, 2], [-18, 0, -5]]} width={2.9} />
        <CurvedPath points={[[-18, 0, -5], [-12, 0, -6], [-7, 0, -5], [-1.5, 0, -4]]} width={2.9} />
        <CurvedPath points={[[-17, 0, 2], [-22, 0, 3], [-27, 0, 5], [-31, 0, 6]]} width={2.7} />
        <CurvedPath points={[[2, 0, 3], [4, 0, 9], [2, 0.04, 16], [0.5, 0.3, 22], [0, 1.2, 25], [0, 1.72, 29]]} width={2.95} />

        <TerrainMound
          position={[-1, 0.018, 1]}
          radiusX={7.2}
          radiusZ={5.6}
          height={0.06}
          seed={28}
          material={plazaMaterial}
        />
      </RigidBody>

      {/* Collision-backed elevation makes the hill walk and the wooded ridges feel grounded. */}
      <RigidBody type="fixed" colliders={false} friction={1}>
        <MeshCollider type="trimesh">
          <TerrainMound position={[0, 0, 30]} radiusX={10.5} radiusZ={11.5} height={1.72} seed={7} material={hillGrassMaterial} />
        </MeshCollider>
      </RigidBody>
      <RigidBody type="fixed" colliders={false} friction={1}>
        <MeshCollider type="trimesh">
          <TerrainMound position={[-35, 0, -27]} radiusX={9.5} radiusZ={7} height={0.78} seed={18} material={hillGrassMaterial} />
        </MeshCollider>
      </RigidBody>
      <RigidBody type="fixed" colliders={false} friction={1}>
        <MeshCollider type="trimesh">
          <TerrainMound position={[36, 0, 18]} radiusX={9} radiusZ={10} height={0.98} seed={25} material={hillGrassMaterial} />
        </MeshCollider>
      </RigidBody>

      <LandscapeDetail />

      {/* Maple House — Paula, Jam, Yoshi, and Milo's home base. */}
      <group position={[0, 0, -19]}>
        <RigidBody type="fixed" colliders="cuboid">
          <group scale={1.7}>
            <House color="#F6E8CD" roofColor="#C95B50" hasChimney />
          </group>
        </RigidBody>
        <Mailbox position={[-3.2, 0, 3]} rotation={[0, 0.2, 0]} />
        <Clothesline position={[5.5, 0, -1.5]} rotation={[0, Math.PI / 2, 0]} />
        <FlowerBed position={[-4.3, 0, 1.2]} rotation={[0, 0.2, 0]} />
        <FlowerBed position={[4.2, 0, 1.2]} rotation={[0, -0.2, 0]} />
        <Bench position={[-5.1, 0, 3.7]} rotation={[0, 0.55, 0]} />
        <Bunting position={[0, 3.8, 2.6]} scale={1.2} />
      </group>
      <FenceRun position={[-6.2, 0, -13.2]} length={6.8} />
      <FenceRun position={[6.2, 0, -13.2]} length={6.8} />
      <group position={[0, 0, -13.15]} scale={0.74}>
        <WoodenArch />
      </group>

      <HumanNPC id="paula" name="Paula" position={[-3.2, 0, -11.5]} variant="paula" onInteract={handlePaulaInteract} showQuestMarker={paulaMarker} />
      <HumanNPC id="jam" name="Jam" position={[3.2, 0, -11.5]} variant="jam" onInteract={handleJamInteract} showQuestMarker={jamMarker} />

      <WelcomeBasket opened={Boolean(worldFlags.welcome_basket)} />
      <InteractionAnchor
        id="welcome-basket"
        label="Sniff welcome basket"
        position={[-1.7, 0.4, -14.2]}
        showQuestMarker={activeQuestId === 'homecoming' && homecoming?.currentObjectiveIndex === 1}
        onInteract={() => {
          if (activeQuestId === 'homecoming' && homecoming?.currentObjectiveIndex === 1) {
            setWorldFlag('welcome_basket', true);
            setDialog('Yoshi', '(Fresh biscuits, two soft bandanas, and a note: “For our very good boys.”)', () => advanceQuestObjective('homecoming'));
          } else {
            setDialog('Yoshi', '(The basket smells like home, biscuits, and a little bit of Milo.)');
          }
        }}
      />

      {/* Village green and picnic lawn. */}
      <PicnicBlanket />
      <Tree position={[-6.7, 0, 5.2]} scale={1.25} blossom />
      <Tree position={[8.8, 0, 6.4]} scale={1.15} />
      <TerrainMound position={[-7.2, 0, 5.8]} radiusX={4.4} radiusZ={2.8} height={0.24} seed={82} material={grassMaterial} />
      <TerrainMound position={[7.2, 0, 6.2]} radiusX={4.8} radiusZ={3.1} height={0.2} seed={91} material={grassMaterial} />
      <Bench position={[-5.3, 0, 1.5]} rotation={[0, 0.12, 0]} />
      <Fountain position={[-1, 0.06, 1]} scale={0.72} />
      <Lantern position={[-2.6, 0, -6.2]} />
      <Lantern position={[2.6, 0, -6.2]} />
      <Campfire position={[9, 0, 8]} scale={0.78} />
      <Crate position={[10.8, 0, 8.8]} scale={0.55} />
      <Barrel position={[8.1, 0, 9.4]} scale={0.55} />

      {/* Market lane and garden neighborhood. */}
      <group position={[21, 0, -8]}>
        <TerrainMound
          position={[0, 0.018, 0]}
          radiusX={7}
          radiusZ={4.2}
          height={0}
          seed={41}
          material={plazaMaterial}
        />
        <RigidBody type="fixed" colliders="cuboid">
          <MarketStall color="#D67B5B" />
        </RigidBody>
        <WoodenArch position={[-3.8, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Cart position={[3.2, 0, 1.2]} rotation={[0, -0.25, 0]} scale={0.8} />
        <Crate position={[2.5, 0, -1.45]} scale={0.75} />
        <Crate position={[3.25, 0, -1.25]} scale={0.55} />
        <Barrel position={[4.2, 0, -0.9]} scale={0.62} />
        <Bunting position={[0, 2.6, 1]} />
        <FlowerBed position={[-1.8, 0, 2]} />
        <Streetlamp position={[-5.3, 0, -2]} />
      </group>
      <NPC id="sora" name="Sora" position={[19, 0, -5]} color="#E8A95B" type="cat" onInteract={() => setDialog('Sora', 'Paula chose carrot seeds, Jam chose sunflowers, and Milo tried to choose the whole basket.')} />
      <GardenPatch watered={Boolean(worldFlags.garden_watered)} />
      <FenceRun position={[9, 0, -20.2]} length={9} />
      <FenceRun position={[14.4, 0, -17.2]} length={6.2} rotation={Math.PI / 2} />
      <InteractionAnchor
        id="seed-packet"
        label="Pick up seed packet"
        position={[23.4, 0.8, -9.5]}
        showQuestMarker={activeQuestId === 'garden' && garden?.currentObjectiveIndex === 1}
        onInteract={() => {
          if (activeQuestId === 'garden' && garden?.currentObjectiveIndex === 1) {
            setWorldFlag('seed_packet', true);
            useGameStore.getState().addItem('seed-packet', 1);
            setDialog('Sora', 'One packet of dog-safe meadow flowers, tied with Paula’s blue ribbon.', () => advanceQuestObjective('garden'));
          } else setDialog('Sora', 'These seeds are waiting for a sunny patch and a patient pup.');
        }}
      />
      <InteractionAnchor
        id="milo-garden"
        label="Water Milo's garden"
        position={[9, 0.5, -17]}
        showQuestMarker={activeQuestId === 'garden' && garden?.currentObjectiveIndex === 2}
        onInteract={() => {
          if (activeQuestId === 'garden' && garden?.currentObjectiveIndex === 2) {
            setWorldFlag('garden_watered', true);
            setDialog('Milo', '(Milo supervises each drop. Tiny green shoots uncurl from the warm soil.)', () => advanceQuestObjective('garden'));
          } else setDialog('Yoshi', worldFlags.garden_watered ? '(Milo’s little garden is already growing.)' : '(The soil is soft and sunny—perfect for a small garden.)');
        }}
      />

      {/* Clover Meadow — dense but readable gathering space. */}
      <group position={[18, 0, 17]}>
        {[[-6, -4], [-2, 2], [3, 4], [5, -1], [0, 6], [-5, 6]].map(([x, z], index) => (
          <TallGrass key={`${x}-${z}`} position={[x, 0, z]} scale={0.8 + (index % 3) * 0.15} />
        ))}
        <FlowerBed position={[-4, 0, 0]} rotation={[0, 0.3, 0]} />
        <FlowerBed position={[4, 0, 5]} rotation={[0, -0.4, 0]} />
        <Bush position={[7, 0, 3]} scale={1.2} />
        <Rock position={[-7, 0, 5]} scale={1.1} />
        <Butterfly position={[0, 1.2, 0]} pathRadius={5} color="#F6D35E" />
        <Butterfly position={[4, 1, 4]} pathRadius={3} color="#A7C7E7" />
        <Dragonfly position={[-4, 1.4, 3]} pathRadius={4} />
      </group>

      {/* Willow Pond and footbridge. */}
      <group position={[-18, 0, 18]}>
        <SculptedIsland
          position={[0, 0.045, 0]}
          radiusTop={7.6}
          radiusBottom={7.9}
          height={0.14}
          seed={53}
          irregularity={0.1}
          scaleX={1.08}
          scaleZ={0.9}
          topMaterial={sandMaterial}
        />
        <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.08, 0.9, 1]} receiveShadow>
          <circleGeometry args={[6.5, 48]} />
          <meshPhysicalMaterial color="#5FA8A4" transparent opacity={0.9} roughness={0.12} clearcoat={1} envMapIntensity={1.3} />
        </mesh>
        <ArchBridge position={[0, 0.11, 0]} rotation={[0, Math.PI / 2, 0]} width={2.4} length={8} />
        <Tree position={[-7, 0, -2]} scale={1.45} />
        <Tree position={[7, 0, 3]} scale={1.3} blossom />
        <Bench position={[-6, 0, 4]} rotation={[0, 2.2, 0]} />
        <Rock position={[6, 0, -4]} scale={1.4} />
        <Rock position={[-7, 0, 2]} scale={0.85} />
        <TallGrass position={[-5.5, 0, -4.8]} scale={0.75} />
        <TallGrass position={[-1.5, 0, 6]} scale={0.68} />
        <TallGrass position={[4.8, 0, 4.6]} scale={0.8} />
        <TallGrass position={[5.6, 0, -2]} scale={0.7} />
        <Frog position={[-3, 0.15, 2]} />
        <Dragonfly position={[0, 1.5, 0]} pathRadius={5} />
        {[-5, -3, 4, 6].map((x, index) => <Mushroom key={x} position={[x, 0, index % 2 ? 6 : -6]} scale={0.7 + index * 0.08} color={index % 2 ? '#D96C5B' : '#E8A95B'} />)}
      </group>
      <NPC id="taro" name="Taro" position={[-12, 0, 18]} color="#5A7D59" type="tortoise" onInteract={() => setDialog('Taro', 'I have watched many families cross this bridge. The happiest ones always stop for the ducks.')} />

      {/* Applebell Orchard and bakery cottage. */}
      <group>
        {ORCHARD_TREES.map((position, index) => <Tree key={`${position[0]}-${position[2]}`} position={position} scale={0.95 + (index % 3) * 0.12} blossom={index % 4 === 0} />)}
        <FenceRun position={[-23, 0, -17.4]} length={15} />
        <FenceRun position={[-13.4, 0, -13.1]} length={6} rotation={Math.PI / 2} />
        <FenceRun position={[-13.4, 0, -1.8]} length={5} rotation={Math.PI / 2} />
        <Cart position={[-24, 0, -3]} rotation={[0, 0.35, 0]} scale={0.8} />
        <Crate position={[-25, 0, -1.8]} scale={0.65} />
        <Barrel position={[-23, 0, -1.4]} scale={0.65} />
        <Signpost position={[-13, 0, -5]} rotation={[0, -0.4, 0]} />
      </group>
      <group position={[-31, 0, 6]}>
        <TerrainMound
          position={[0, 0.018, 0.5]}
          radiusX={5}
          radiusZ={3.7}
          height={0}
          seed={67}
          material={plazaMaterial}
        />
        <RigidBody type="fixed" colliders="cuboid"><Bakery rotation={[0, 0.6, 0]} /></RigidBody>
        <Bunting position={[0, 2.8, 1]} />
        <FlowerBed position={[3, 0, 1]} />
        <Bench position={[4, 0, -1]} rotation={[0, -1.2, 0]} />
      </group>
      <NPC id="mimi" name="Mimi" position={[-18, 0, -5]} color="#D9553F" type="mouse" onInteract={() => setDialog('Mimi', 'The orchard keeps a scrapbook in smells: apple peel, rain, warm bread, and happy dogs.')} />

      {/* Hilltop lookout, kept close enough to see from home. */}
      <group position={[0, 0, 31]}>
        <WoodenArch position={[0, 1.74, -3]} />
        <Bench position={[0, 1.73, 2]} rotation={[0, Math.PI, 0]} />
        <Streetlamp position={[-3.5, 1.63, 0]} />
        <Streetlamp position={[3.5, 1.63, 0]} />
        <PineTree position={[-6, 0.67, 3]} scale={1.2} />
        <PineTree position={[6, 0.58, 4]} scale={1.25} />
        <Rock position={[-5, 1.25, -2]} scale={1.3} />
        <Rock position={[5, 1.25, -2]} scale={1.1} />
        <Seagull position={[0, 5, 0]} pathRadius={7} speed={0.55} />
      </group>

      {/* Sequential picnic flowers. */}
      <FlowerQuestSpot position={[18, 0, 15]} color="#F6D35E" picked={Boolean(worldFlags.flower_buttercup)} />
      <InteractionAnchor id="flower-buttercup" label="Pick buttercup" position={[18, 0.6, 15]} showQuestMarker={activeQuestId === 'picnic' && picnic?.currentObjectiveIndex === 1} onInteract={() => collectFlower(1, 'flower_buttercup', 'buttercup')} />
      <FlowerQuestSpot position={[-14, 0, 20]} color="#83AEE0" picked={Boolean(worldFlags.flower_bluebell)} />
      <InteractionAnchor id="flower-bluebell" label="Pick bluebell" position={[-14, 0.6, 20]} showQuestMarker={activeQuestId === 'picnic' && picnic?.currentObjectiveIndex === 2} onInteract={() => collectFlower(2, 'flower_bluebell', 'bluebell')} />
      <FlowerQuestSpot position={[-22, 0, -8]} color="#EE9DB5" picked={Boolean(worldFlags.flower_orchard)} />
      <InteractionAnchor id="flower-orchard" label="Pick pink blossom" position={[-22, 0.6, -8]} showQuestMarker={activeQuestId === 'picnic' && picnic?.currentObjectiveIndex === 3} onInteract={() => collectFlower(3, 'flower_orchard', 'pink orchard blossom')} />

      {/* Memory trail. */}
      <PawToken position={[-10.5, 0.12, 17]} found={Boolean(worldFlags.memory_pond)} color="#8B6A4D" />
      <InteractionAnchor id="memory-pond" label="Remember pond walk" position={[-10.5, 0.5, 17]} showQuestMarker={activeQuestId === 'memories' && memories?.currentObjectiveIndex === 1} onInteract={() => findMemory(1, 'memory_pond', 'Willow Pond')} />
      <PawToken position={[-14, 0.12, -7]} found={Boolean(worldFlags.memory_orchard)} color="#8B6A4D" />
      <InteractionAnchor id="memory-orchard" label="Remember orchard walk" position={[-14, 0.5, -7]} showQuestMarker={activeQuestId === 'memories' && memories?.currentObjectiveIndex === 2} onInteract={() => findMemory(2, 'memory_orchard', 'Applebell Orchard')} />
      <PawToken position={[0, 1.86, 28]} found={Boolean(worldFlags.memory_lookout)} color="#8B6A4D" />
      <InteractionAnchor id="memory-lookout" label="Remember hilltop walk" position={[0, 2.1, 28]} showQuestMarker={activeQuestId === 'memories' && memories?.currentObjectiveIndex === 3} onInteract={() => findMemory(3, 'memory_lookout', 'the hilltop')} />

      {/* Final evening lantern route. */}
      <QuestLantern position={[-4, 0, -14]} lit={Boolean(worldFlags.lantern_porch)} />
      <InteractionAnchor id="lantern-porch" label="Light porch lantern" position={[-4, 1, -14]} showQuestMarker={activeQuestId === 'lanterns' && lanterns?.currentObjectiveIndex === 1} onInteract={() => lightLantern(1, 'lantern_porch', 'porch')} />
      <QuestLantern position={[13, 0, -13]} lit={Boolean(worldFlags.lantern_garden)} />
      <InteractionAnchor id="lantern-garden" label="Light garden lantern" position={[13, 1, -13]} showQuestMarker={activeQuestId === 'lanterns' && lanterns?.currentObjectiveIndex === 2} onInteract={() => lightLantern(2, 'lantern_garden', 'garden')} />
      <QuestLantern position={[-11, 0, 13]} lit={Boolean(worldFlags.lantern_pond)} />
      <InteractionAnchor id="lantern-pond" label="Light pond lantern" position={[-11, 1, 13]} showQuestMarker={activeQuestId === 'lanterns' && lanterns?.currentObjectiveIndex === 3} onInteract={() => lightLantern(3, 'lantern_pond', 'pond')} />

      {/* Clustered woodland masses frame sightlines instead of tracing the island rim. */}
      {WOODLAND_TREES.map(({ position, pine, blossom, scale }) => (
        pine
          ? <PineTree key={`${position[0]}-${position[2]}`} position={position} scale={scale} />
          : <Tree key={`${position[0]}-${position[2]}`} position={position} scale={scale} blossom={blossom} />
      ))}
      {[[-33, 0, 18], [31, 0, 18], [30, 0, -19], [-32, 0, -22]].map((position, index) => (
        <Bush key={index} position={position as Position} scale={1.25 + index * 0.08} />
      ))}
    </group>
  );
}
