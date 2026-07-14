import { RigidBody, CylinderCollider } from '@react-three/rapier';
import { NPC } from '../NPC';
import { useGameStore } from '../../../store/useGameStore';
import * as THREE from 'three';
import { useEffect, useMemo } from 'react';

import { CourierHut, Bakery, MarketStall, WoodenArch } from '../objects/Buildings';
import { Mailbox, Signpost, Bench, Boat, Barrel, RopeCoil, Clothesline, WellPump, Cart, Bunting, Lantern, Crate, Campfire, ArchBridge, Streetlamp } from '../objects/Props';
import { Tree, PineTree, FlowerBed, Rock, Bush, TallGrass, Mushroom, PalmTree } from '../objects/Nature';
import { Seagull, Butterfly, Crab, Fish, Frog, Dragonfly } from '../effects/Animals';
import { Water } from './Water';

// A simple wrapper for static interactable props that the other agent added.
function CozyInteractable({ id, name, position, text }: { id: string, name: string, position: [number, number, number], text: string }) {
  return (
    <NPC id={id} name={name} position={position} color="#A8C8D9" type="secret" onInteract={() => {
        useGameStore.getState().setDialog('System', text);
    }} />
  );
}

export function PawprintBay() {
  const quests = useGameStore(state => state.quests);
  const activeQuestId = useGameStore(state => state.activeQuestId);
  const setActiveQuest = useGameStore(state => state.setActiveQuest);
  const advanceQuestObjective = useGameStore(state => state.advanceQuestObjective);
  const setDialog = useGameStore(state => state.setDialog);
  const setMiloState = useGameStore(state => state.setMiloState);
  
  const handleTaroInteract = () => {
     const prologue = quests['prologue'];
     const quest1 = quests['quest1'];
     const quest6 = quests['quest6'];

     if (prologue && prologue.status === 'available') {
         if (!activeQuestId) {
             setDialog('Taro', 'Yoshi, my boy! Are you ready for your first delivery? Put on your neckerchief in your wardrobe, practice a bark, and save your progress at the bell!', () => {
                 setActiveQuest('prologue');
                 advanceQuestObjective('prologue');
             });
         } else if (activeQuestId === 'prologue') {
             if (prologue.currentObjectiveIndex === 1) {
                 setDialog('Taro', 'Good. Now head to the wardrobe.');
             } else {
                 setDialog('Taro', 'Remember: Red neckerchief, bark, and ring the bell.');
             }
         }
     } else if (quest1 && quest1.status === 'available' && !activeQuestId) {
         setDialog('Taro', 'Excellent work on your training. Sora at Bunrise Bakery was asking for a courier. Go see what she needs.');
     } else if (quest6 && quest6.status === 'available' && !activeQuestId) {
         setDialog('Taro', 'The island is feeling whole again... I have one final letter. It\'s weathered and old. It belongs to Aoi.', () => {
              setActiveQuest('quest6');
              advanceQuestObjective('quest6');
         });
     } else if (activeQuestId === 'quest6' && quest6?.currentObjectiveIndex === 1) {
         setDialog('Taro', 'I\'ve kept this letter safe for a long time. Take Milo through the Storm Path, let the wind guide you.', () => {
             advanceQuestObjective('quest6');
         });
     } else {
         setDialog('Taro', 'Slow paws still reach the right door, pup.');
     }
  };

  const handleSoraInteract = () => {
     const quest1 = quests['quest1'];
     if (quest1 && quest1.status === 'available') {
         if (!activeQuestId) {
             setDialog('Sora', 'Oh, Yoshi! Perfect timing. Aoi at the lighthouse must be so cold up there alone.', () => {
                 setDialog('Sora', 'Could you bring her this warm melon bun? Careful! It is carrying my whole heart and also too much butter.', () => {
                     setActiveQuest('quest1');
                     useGameStore.getState().addItem('warm_melon_bun', 1);
                     useGameStore.getState().advanceQuestObjective('quest1');
                 });
             });
         } else if (activeQuestId === 'quest1') {
             if (quest1.currentObjectiveIndex === 1) {
                 setDialog('Sora', 'Hurry now! Straight to the lighthouse before it cools down!');
             }
         }
     } else if (quest1 && quest1.status === 'completed') {
         setDialog('Sora', 'Thank you again for delivering that bun, Yoshi!');
     } else {
         setDialog('Sora', 'Nothing baking right now, but it smells nice, doesn\'t it?');
     }
  };

  const handleAoiInteract = () => {
      const quest1 = quests['quest1'];
      const quest6 = quests['quest6'];
      if (activeQuestId === 'quest1' && quest1 && quest1.currentObjectiveIndex === 1) {
          setDialog('Aoi', 'Oh... a visitor? And what is this... a warm melon bun from Sora?', () => {
              useGameStore.getState().removeItem('warm_melon_bun', 1);
              setDialog('Aoi', 'The lighthouse is easy to keep. Hope is the difficult part. But this... is very kind of her.', () => {
                  useGameStore.getState().advanceQuestObjective('quest1');
                  useGameStore.getState().setQuestStatus('quest2', 'available');
                  useGameStore.getState().addStamp('Bakery Stamp');
                  setDialog('System', 'You completed "Warm Before the Wind"! Rewards: Bakery Stamp & Sailor Cap');
              });
          });
      } else if (activeQuestId === 'quest6' && quest6 && quest6.currentObjectiveIndex === 4) {
          setDialog('Aoi', 'You made it up the storm path... and Milo is with you. You have a letter?', () => {
               setDialog('Aoi', '(She unfolds the weathered paper with trembling wings.)', () => {
                    setDialog('Aoi', '"Even when the storm breaks the bridge, the light reaches the shore." ...It is from the first Lighthouse Keeper.', () => {
                         advanceQuestObjective('quest6');
                         setDialog('System', 'You completed all deliveries! Pawprint Bay is connected once more. Congratulations!');
                    });
               });
          });
      } else {
          setDialog('Aoi', 'The sea looks restless today...');
      }
  };

  const handleMiloInteract = () => {
     const quest2 = quests['quest2'];
     if (!useGameStore.getState().hasMilo) {
         if (activeQuestId === 'quest2' && quest2.currentObjectiveIndex === 1) {
             setDialog('Milo', '...I shouldn\'t be seen. The storm... it was my fault. I chose the wrong route. I even lost my brass tag to the crabs.', () => {
                  advanceQuestObjective('quest2');
             });
         } else if (activeQuestId === 'quest2' && quest2.currentObjectiveIndex === 3) {
             setDialog('Yoshi', '(You tilt your head, assuring him it\'s okay, and wag your whole body. You show him his lost brass tag.)', () => {
                  setDialog('Milo', 'My tag! You... you want me to help you deliver mail? Are you sure?', () => {
                       advanceQuestObjective('quest2');
                       setDialog('System', 'Milo has joined you as your companion! He will follow you on deliveries.', () => {
                           setMiloState(true);
                           useGameStore.getState().setQuestStatus('quest3', 'available');
                       });
                  });
             });
         } else {
             setDialog('Milo', '(A sad little dachshund is hiding behind the post.)');
         }
     } else {
         setDialog('Milo', 'Let\'s find those letters, Yoshi!');
     }
  };

  const handleNoriInteract = () => {
     const quest2 = quests['quest2'];
     const quest5 = quests['quest5'];
     if (quest2 && quest2.status === 'available' && !activeQuestId) {
         setDialog('Nori', 'The bridge has been out since the storm... But lately, I\'ve heard scratching beneath the dock. Can you investigate?', () => {
             setActiveQuest('quest2');
             advanceQuestObjective('quest2');
         });
     } else if (activeQuestId === 'quest2') {
         if (quest2.currentObjectiveIndex === 1) {
             setDialog('Nori', 'Look under the old dock. Something small is moving down there.');
         } else {
             setDialog('Nori', 'I hope you find whatever is making that noise beneath my boots.');
         }
     } else if (quest5 && quest5.status === 'available' && !activeQuestId) {
          setDialog('Nori', 'We need to repair the storm path to reach the western cliffs.', () => {
               setDialog('Nori', 'We need driftwood from Seaglass Beach and sturdy rope.', () => {
                   setActiveQuest('quest5');
                   advanceQuestObjective('quest5');
               });
          });
     } else if (activeQuestId === 'quest5') {
          if (quest5.currentObjectiveIndex === 1) {
              setDialog('Nori', 'Check Seaglass Beach for driftwood, and the Old Dock for rope.');
          } else {
              setDialog('Nori', 'We need to fix that bridge.');
          }
     } else {
         setDialog('Nori', 'Tides come and go, but lifting these boxes never stops.');
     }
  };

  const handleCrabInteract = () => {
      const quest2 = quests['quest2'];
      if (activeQuestId === 'quest2' && quest2) {
           if (quest2.currentObjectiveIndex === 2) {
                setDialog('Crab Village', '(The crabs scuttle defensively, holding up a shiny brass tag engraved with the name "Milo"!)', () => {
                     advanceQuestObjective('quest2');
                     setDialog('Yoshi', '(You gently trade them a smooth pebble for the tag.)');
                });
           } else if (quest2.currentObjectiveIndex === 1) {
                setDialog('Crab Village', '(The crabs are clicking their claws rhythmically in a circle.)');
           } else {
                setDialog('Crab Village', '(Busy crabs holding various shiny objects.)');
           }
      } else {
           setDialog('Crab Village', '(A bustling tiny city constructed entirely out of stacked sea shells and stolen buttons.)');
      }
  };

  const handleMimiInteract = () => {
       const quest3 = quests['quest3'];
       if (quest3 && quest3.status === 'available' && !activeQuestId) {
            setDialog('Mimi', 'Oh my squeak! A wind gust blew right through my kiosk and scattered three historical letters down on Seaglass beach!', () => {
                 setActiveQuest('quest3');
                 advanceQuestObjective('quest3');
            });
       } else if (activeQuestId === 'quest3') {
            if (quest3.currentObjectiveIndex === 4) {
                 setDialog('Mimi', 'You found them! All three letters! The archive is safe. Thank you, Courier Yoshi... and Assistant Milo.', () => {
                      advanceQuestObjective('quest3');
                      useGameStore.getState().setQuestStatus('quest4', 'available');
                      useGameStore.getState().addStamp('Seaglass Stamp');
                      setDialog('System', 'You completed "Letters in the Tidepools"! Rewards: Seaglass Stamp & Beach Bandana');
                 });
            } else {
                 setDialog('Mimi', 'Please hurry, before the tide washes the ink away!');
            }
       } else {
            setDialog('Mimi', 'Welcome to the archive kiosk! I keep track of letters, stamps, and history.');
       }
  };

  const handleMossInteract = () => {
       const quest4 = quests['quest4'];
       if (quest4 && quest4.status === 'available' && !activeQuestId) {
            setDialog('Moss', 'The wind chimes haven\'t been sounding right. I think the storm disrupted the petals. Milo used to walk this route...', () => {
                 setActiveQuest('quest4');
                 advanceQuestObjective('quest4');
            });
       } else if (activeQuestId === 'quest4') {
            if (quest4.currentObjectiveIndex === 3) {
                 setDialog('Moss', 'Ah, the storm petals. Thank you. Now the chimes will remember the way.', () => {
                      advanceQuestObjective('quest4');
                      useGameStore.getState().setQuestStatus('quest5', 'available');
                      useGameStore.getState().addStamp('Garden Stamp');
                      setDialog('System', 'You completed "Wind Chimes Remember"!');
                 });
            } else {
                 setDialog('Moss', 'Listen closely to the wind... it hides memories in plain sight.');
            }
       } else {
            setDialog('Moss', 'Some paths grow back when someone walks them kindly.');
       }
  };

  const handleCaptainBrineInteract = () => {
       const quest5 = quests['quest5'];
       if (activeQuestId === 'quest5' && quest5?.currentObjectiveIndex === 3) {
            setDialog('Captain Brine', 'An old route marker? Aye, I\'ve kept this one from before the storm. Take it, pup.', () => {
                 advanceQuestObjective('quest5');
            });
       } else {
            setDialog('Captain Brine', 'Ho there! I know the old routes, but my map is torn to pieces.');
       }
  };

  return (
    <group>
      {/* ── OCEAN & EFFECTS ── */}
      <Water />
      <Fish position={[-15, 0, 45]} />
      <Fish position={[15, 0, 50]} color="#D96C5B" />
      <Fish position={[40, 0, -40]} />

      {/* ── TERRAIN PLATFORMS (VARIED HEIGHTS) ── */}
      <RigidBody type="fixed" colliders={false} friction={1}>
        {/* Main Town Level (y=0) */}
        <CylinderCollider args={[0.5, 55]} position={[0, -0.5, 0]} />
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <cylinderGeometry args={[55, 60, 1, 64]} />
          <meshStandardMaterial color="#88A07A" />
        </mesh>
        
        {/* Farm / Eastern Hill (y=0.5) */}
        <CylinderCollider args={[0.5, 25]} position={[25, 0, -25]} />
        <mesh position={[25, 0, -25]} receiveShadow>
          <cylinderGeometry args={[25, 30, 1, 32]} />
          <meshStandardMaterial color="#7C9982" />
        </mesh>
        <mesh position={[10, -0.05, -10]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]} receiveShadow>
            <planeGeometry args={[15, 10]} />
            <meshStandardMaterial color="#88A07A" />
        </mesh> {/* Ramp blending area */}

        {/* Courier Hut Hill (NW) (y=1.5) */}
        <CylinderCollider args={[1.0, 20]} position={[-25, 0.5, -25]} />
        <mesh position={[-25, 0.5, -25]} receiveShadow>
          <cylinderGeometry args={[20, 25, 2, 32]} />
          <meshStandardMaterial color="#88A07A" />
        </mesh>
        {/* Ramp to Courier Hill */}
        <mesh position={[-12, 0.5, -12]} rotation={[-0.2, -Math.PI / 4, 0]} receiveShadow>
            <boxGeometry args={[10, 0.2, 12]} />
            <meshStandardMaterial color="#D9C7B0" />
        </mesh>
        <CylinderCollider args={[0.1, 5]} position={[-12, 0.5, -12]} rotation={[-0.2, -Math.PI / 4, 0]} />

        {/* Lighthouse Hill (West) (y=3.0) */}
        <CylinderCollider args={[2.0, 15]} position={[-55, 1.0, 0]} />
        <mesh position={[-55, 1.0, 0]} receiveShadow>
          <cylinderGeometry args={[15, 20, 4, 32]} />
          <meshStandardMaterial color="#7C9982" />
        </mesh>
        {/* Ramp to Lighthouse */}
        <mesh position={[-38, 1.5, 0]} rotation={[0, 0, 0.2]} receiveShadow>
            <boxGeometry args={[15, 0.2, 8]} />
            <meshStandardMaterial color="#D9C7B0" />
        </mesh>
        <CylinderCollider args={[0.1, 7.5]} position={[-38, 1.5, 0]} rotation={[0, 0, 0.2]} />

        {/* Old Dock Landing (East) (y=-0.4) */}
        <CylinderCollider args={[0.2, 12]} position={[50, -0.7, 0]} />
        <mesh position={[50, -0.7, 0]} receiveShadow>
          <cylinderGeometry args={[12, 15, 0.4, 16]} />
          <meshStandardMaterial color="#E8DCC4" />
        </mesh>

        {/* Paths (Cross shape & diagonals mapped to terrain) */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[70, 10]} />
          <meshStandardMaterial color="#E8DCC4" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
          <planeGeometry args={[70, 10]} />
          <meshStandardMaterial color="#E8DCC4" />
        </mesh>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
          <ringGeometry args={[20, 26, 4]} />
          <meshStandardMaterial color="#E8DCC4" />
        </mesh>
        {/* Central Plaza */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial color="#D9C7B0" />
        </mesh>
      </RigidBody>


      {/* ── INTENTIONAL AAA NATURE & PROP PLACEMENT ── */}
      {/* We remove all random scatters and instead craft beautiful, intentional clusters. */}
      
      {/* Central Plaza Clusters */}
      <group position={[0, 0, 0]}>
         <RigidBody type="fixed" colliders="hull">
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
               <cylinderGeometry args={[2.5, 2.5, 0.8, 16]} />
               <meshStandardMaterial color="#A68A72" />
            </mesh>
            <mesh position={[0, 1.0, 0]} castShadow>
               <cylinderGeometry args={[0.8, 0.8, 1.5, 16]} />
               <meshStandardMaterial color="#8C6B52" />
            </mesh>
            <mesh position={[0, 1.8, 0]} castShadow>
               <sphereGeometry args={[0.6, 16, 16]} />
               <meshStandardMaterial color="#A8C8D9" />
            </mesh>
            {/* Water */}
            <mesh position={[0, 0.7, 0]} receiveShadow>
               <cylinderGeometry args={[2.2, 2.2, 0.1, 16]} />
               <meshStandardMaterial color="#A8C8D9" transparent opacity={0.8} />
            </mesh>
         </RigidBody>
         
         {/* Seating under cherry blossoms */}
         <group position={[6, 0, 6]}>
            <Tree position={[0, 0, 0]} scale={1.2} blossom={true} />
            <Bench position={[-2, 0, -2]} rotation={[0, -Math.PI/4, 0]} />
            <Lantern position={[-3, 0, -1]} />
         </group>
         <group position={[-6, 0, -6]}>
            <Tree position={[0, 0, 0]} scale={1.1} blossom={true} />
            <Bench position={[2, 0, 2]} rotation={[0, Math.PI*0.75, 0]} />
            <Bush position={[2, 0, 0]} scale={1.3} />
         </group>
         
         <Streetlamp position={[6, 0, 0]} />
         <Streetlamp position={[-6, 0, 0]} />
         <Streetlamp position={[0, 0, 6]} />
         <Streetlamp position={[0, 0, -6]} />
         
         <Seagull position={[0, 4, 0]} pathRadius={5} speed={0.8} />
      </group>


      {/* ── NORTHWEST: COURIER HILL ── */}
      <group position={[-25, 1.5, -25]}>
        <RigidBody type="fixed" colliders="cuboid">
            <CourierHut position={[0, 0, 0]} rotation={[0, Math.PI/4, 0]} />
            <mesh position={[2, 0.8, -1]} rotation={[0, Math.PI/4, 0]} castShadow>
               <boxGeometry args={[1.2, 1.6, 0.6]} />
               <meshStandardMaterial color="#3A1D13" />
            </mesh>
            <NPC id="wardrobe" name="Wardrobe" position={[2, 1, -1]} color="#D93D4A" type="secret" onInteract={() => {
                useGameStore.getState().setDialog('System', 'You put on the red courier neckerchief! Looking sharp!', () => {
                   if (useGameStore.getState().activeQuestId === 'prologue' && useGameStore.getState().quests['prologue'].currentObjectiveIndex === 1) {
                       useGameStore.getState().advanceQuestObjective('prologue');
                   }
                });
            }} showQuestMarker={useGameStore.getState().activeQuestId === 'prologue' && useGameStore.getState().quests['prologue'].currentObjectiveIndex === 1} />
        </RigidBody>
        <RigidBody type="fixed" colliders="hull">
            <Mailbox position={[2, 0, 2]} rotation={[0, Math.PI/4, 0]} />
            <Campfire position={[-3, 0, 2]} />
            <Bench position={[-3, 0, 4]} rotation={[0, 0, 0]} />
            <Clothesline position={[-4, 0, -2]} rotation={[0, Math.PI/2, 0]} />
        </RigidBody>
        
        {/* Curated Pine Cluster */}
        <PineTree position={[-6, 0, -5]} scale={1.2} />
        <PineTree position={[-3, 0, -8]} scale={1.4} />
        <PineTree position={[2, 0, -6]} scale={1.1} />
        <Rock position={[-5, 0, -7]} scale={1.3} />
        <Bush position={[-2, 0, -5]} scale={1.5} />
      </group>
      <NPC id="taro" name="Taro" position={[-22, 1.5, -22]} color="#5A7D59" type="tortoise" onInteract={handleTaroInteract} showQuestMarker={quests['prologue']?.status === 'available' || (quests['quest1']?.status === 'available' && !activeQuestId) || (quests['quest6']?.status === 'available') || (activeQuestId === 'quest6' && quests['quest6']?.currentObjectiveIndex < 4)} />
      <CozyInteractable id="mail-sorting" name="Mail Sorting Table" position={[-28, 1.5, -20]} text="Every envelope has a pawprint stamp and a route ribbon. Taro runs a tidy operation." />


      {/* ── SOUTHWEST: BUNRISE BAKERY ── */}
      <group position={[-20, 0, 20]}>
        <RigidBody type="fixed" colliders="cuboid">
            <Bakery position={[0, 0, 0]} rotation={[0, -Math.PI/4, 0]} />
        </RigidBody>
        
        {/* Organized Bakery Seating and Delivery Cart */}
        <RigidBody type="fixed" colliders="hull">
           <Cart position={[-4, 0, 3]} rotation={[0, -Math.PI/6, 0]} />
           <Barrel position={[2, 0, -3]} />
           <Barrel position={[2.8, 0, -3.5]} color="#6B5440" />
           <Crate position={[-3, 0.4, 4]} rotation={[0, 0.2, 0]} />
        </RigidBody>
        <Bunting position={[2, 2.5, 2]} />
        <Bunting position={[-2, 2.5, 2]} />
        
        <Tree position={[-5, 0, -5]} scale={1.1} blossom />
        <Tree position={[2, 0, 6]} scale={1.0} blossom />
        <Bench position={[4, 0, 1]} rotation={[0, Math.PI/4, 0]} />
        <FlowerBed position={[4, 0, 4]} rotation={[0, Math.PI/4, 0]} />
      </group>
      <NPC id="sora" name="Sora" position={[-18, 0, 18]} color="#E8A95B" type="cat" onInteract={handleSoraInteract} showQuestMarker={activeQuestId === 'quest1' && quests['quest1'].currentObjectiveIndex <= 1} />
      <CozyInteractable id="tea-garden-west" name="Tea Garden" position={[-24, 0, 25]} text="Someone left sea-mint tea cooling beside a plate of tiny butter cookies." />


      {/* ── NORTHEAST: FARMING DISTRICT & ARCHIVE ── */}
      <group position={[25, 0.5, -25]}>
         {/* Archive Stall */}
         <RigidBody type="fixed" colliders="hull">
            <WoodenArch position={[-5, 0, 5]} rotation={[0, -Math.PI/4, 0]} />
            <MarketStall position={[-5, 0, 5]} rotation={[0, -Math.PI/4, 0]} color="#D96C5B" />
         </RigidBody>
         <NPC id="mimi" name="Mimi" position={[-3, 0.2, 3]} color="#D9553F" type="mouse" onInteract={handleMimiInteract} showQuestMarker={quests['quest3']?.status === 'available' || activeQuestId === 'quest3'} />

         {/* Curated Crop Rows */}
         {[0, 1, 2, 3].map((row) => (
            <group key={`crop-${row}`} position={[2 + row * 2, 0, -2]}>
               <mesh position={[0, -0.05, 0]} receiveShadow>
                   <boxGeometry args={[1.2, 0.1, 10]} />
                   <meshStandardMaterial color="#5C4D3C" />
               </mesh>
               <TallGrass position={[0, 0.1, -4]} />
               <TallGrass position={[0, 0.1, -2]} />
               <TallGrass position={[0, 0.1, 0]} />
               <TallGrass position={[0, 0.1, 2]} />
               <TallGrass position={[0, 0.1, 4]} />
            </group>
         ))}
         
         <WellPump position={[0, 0, -8]} scale={0.8} />
         <Cart position={[-3, 0, -5]} rotation={[0, Math.PI/6, 0]} />
         
         {/* Beautiful Orchard Edge */}
         <Tree position={[12, 0, 4]} scale={1.2} />
         <Tree position={[14, 0, 0]} scale={1.1} blossom />
         <Bush position={[10, 0, 6]} scale={1.4} />
         <Bush position={[13, 0, -2]} scale={1.2} />
         
         <Butterfly position={[2, 1, -2]} pathRadius={4} />
         <Dragonfly position={[4, 1.5, 0]} pathRadius={5} />
      </group>
      <CozyInteractable id="garden-journal" name="Garden Journal" position={[20, 0.5, -20]} text="The page lists windbell blooms, carrot sprouts, and a doodle of Milo chasing petals." />


      {/* ── SOUTHEAST: WINDBELL GARDENS ── */}
      <group position={[20, 0, 20]}>
         {/* Wind chimes structure */}
         <group position={[0, 1.5, 0]} rotation={[0, Math.PI/4, 0]}>
             <mesh castShadow>
                 <cylinderGeometry args={[0.05, 0.05, 3]} />
                 <meshStandardMaterial color="#5C4D3C" />
             </mesh>
             <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                 <cylinderGeometry args={[0.05, 0.05, 2]} />
                 <meshStandardMaterial color="#5C4D3C" />
             </mesh>
             <mesh position={[-0.5, 1, 0]} castShadow>
                 <cylinderGeometry args={[0.02, 0.02, 0.8]} />
                 <meshStandardMaterial color="#A68A72" />
             </mesh>
             <mesh position={[0.5, 0.7, 0]} castShadow>
                 <cylinderGeometry args={[0.02, 0.02, 1.2]} />
                 <meshStandardMaterial color="#A68A72" />
             </mesh>
             {activeQuestId === 'quest6' && (quests['quest6']?.currentObjectiveIndex === 2 || quests['quest6']?.currentObjectiveIndex === 3) && (
                 <NPC id="wind-chimes" name="Wind Chimes" position={[0, 0.5, 0]} color="#FDFBF7" type="secret" showQuestMarker onInteract={() => {
                     const q = useGameStore.getState().quests['quest6'];
                     if (q.currentObjectiveIndex === 2) {
                         useGameStore.getState().advanceQuestObjective('quest6');
                         useGameStore.getState().setDialog('Yoshi', '(The wind chimes wait for your bark...)');
                     } else if (q.currentObjectiveIndex === 3) {
                         useGameStore.getState().advanceQuestObjective('quest6');
                         useGameStore.getState().setDialog('Yoshi', '(You let out a loud BARK! The chimes sing brightly, and the path ahead seems clear!)');
                     }
                 }} />
             )}
         </group>
         
         {/* Neat Flower Layout */}
         <FlowerBed position={[4, 0, 4]} />
         <FlowerBed position={[-4, 0, -4]} />
         <FlowerBed position={[4, 0, -4]} rotation={[0, Math.PI/2, 0]} />
         <FlowerBed position={[-4, 0, 4]} rotation={[0, Math.PI/2, 0]} />
         
         <Bench position={[5, 0, 0]} rotation={[0, -Math.PI/2, 0]} />
         <Streetlamp position={[6, 0, 6]} />
         
         <Butterfly position={[0, 1.5, 0]} pathRadius={3} color="#FDFBF7" />

         {[
            [-2.5, 0.2, 2], [-1.5, 0.2, 3], [3.5, 0.2, 2]
         ].map((pos, i) => (
             <group key={`flower-${i}`} position={pos as [number, number, number]}>
                 <mesh>
                     <sphereGeometry args={[0.3]} />
                     <meshStandardMaterial color={['#D93D4A', '#E8A95B', '#FDFBF7'][i % 3]} />
                 </mesh>
                 {activeQuestId === 'quest4' && quests['quest4']?.currentObjectiveIndex >= 1 && quests['quest4']?.currentObjectiveIndex < 3 && i < 2 && (
                     <NPC id={`petal-${i}`} name="Storm Petal" position={[0, 0, 0]} color="#D93D4A" type="secret" showQuestMarker onInteract={() => {
                          useGameStore.getState().advanceQuestObjective('quest4');
                          useGameStore.getState().setDialog('Yoshi', '(You sniffed out a fallen windbell blossom!)');
                     }} />
                 )}
             </group>
         ))}
      </group>
      <NPC id="moss" name="Moss" position={[22, 0, 20]} color="#8C6B52" type="capybara" onInteract={handleMossInteract} showQuestMarker={activeQuestId === 'quest4'} />


      {/* ── WEST: LIGHTHOUSE HILL ── */}
      <group position={[-55, 3.0, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 2.5, 8, 12]} />
            <meshStandardMaterial color="#FDFBF7" />
          </mesh>
          <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1, 1.5, 1, 8]} />
            <meshStandardMaterial color="#3A1D13" />
          </mesh>
          <mesh position={[0, 9.5, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.2, 1, 8]} />
            <meshStandardMaterial color="#D93D4A" />
          </mesh>
        </RigidBody>
        <Signpost position={[3, 0, -3]} rotation={[0, Math.PI/4, 0]} />
        <Seagull position={[0, 12, 0]} pathRadius={8} speed={0.5} />
        <Seagull position={[0, 10, 0]} pathRadius={6} speed={0.7} />
        
        {/* Curated cliff foliage */}
        <PineTree position={[-4, 0, -3]} scale={1.2} />
        <PineTree position={[-2, 0, 4]} scale={1.3} />
        <Bush position={[-5, 0, 1]} scale={1.5} />
      </group>
      <NPC id="aoi" name="Aoi" position={[-52, 3.0, 2]} color="#FDFBF7" type="crane" onInteract={handleAoiInteract} showQuestMarker={(activeQuestId === 'quest1' && quests['quest1'].currentObjectiveIndex === 1) || (activeQuestId === 'quest6' && quests['quest6'].currentObjectiveIndex === 4)} />
      <CozyInteractable id="lighthouse-lookout" name="Lookout Telescope" position={[-50, 3.0, -4]} text="Through the little telescope, Pawprint Bay looks like a quilt of gardens and warm windows." />


      {/* ── EAST: OLD DOCK & CRAB VILLAGE ── */}
      <group position={[50, -0.4, 0]}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[10, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[12, 0.4, 8]} />
              <meshStandardMaterial color="#5C4D3C" />
            </mesh>
            
            {/* Organized Dock Cargo */}
            <group position={[12, 0.4, -2]}>
               <Crate position={[0, 0, 0]} />
               <Crate position={[0, 0.8, 0]} rotation={[0, 0.1, 0]} />
               <Barrel position={[-1, 0, 0.5]} />
               <Barrel position={[-1.2, 0, -0.5]} color="#6B5440" />
            </group>
            
            <RopeCoil position={[14, 0.2, 2]} />
            <RopeCoil position={[7, 0.2, 3]} />
            <Lantern position={[10, 0.2, -3]} />
            <Boat position={[10, -0.4, 5]} rotation={[0, Math.PI/4, 0]} color="#D93D4A" />
            
            {activeQuestId === 'quest5' && quests['quest5']?.currentObjectiveIndex === 2 && (
               <NPC id="rope" name="Sturdy Rope" position={[8, 0.4, -2]} color="#E8DCC4" type="secret" showQuestMarker onInteract={() => {
                   useGameStore.getState().advanceQuestObjective('quest5');
                   useGameStore.getState().setDialog('Yoshi', '(You grabbed some thick dock rope!)');
               }} />
            )}
          </RigidBody>
          <Seagull position={[10, 4, 0]} pathRadius={4} speed={1.2} />
          <group position={[10, -0.6, 2]}>
             <Crab position={[-0.5, 0, 0]} color="#D93D4A" scale={0.8} />
             <Crab position={[0.5, 0, 0.2]} color="#E8A95B" scale={0.7} />
             <NPC id="crab" name="Secret Crab Village" position={[0, 0.2, 0]} color="#D93D4A" type="secret" onInteract={handleCrabInteract} showQuestMarker={activeQuestId === 'quest2' && quests['quest2']?.currentObjectiveIndex === 2} />
          </group>
      </group>
      <NPC id="nori" name="Nori" position={[55, -0.4, 0]} color="#A68A72" type="capybara" onInteract={handleNoriInteract} showQuestMarker={quests['quest2']?.status === 'available' || (activeQuestId === 'quest2' && quests['quest2']?.currentObjectiveIndex === 0) || activeQuestId === 'quest5'} />
      <NPC id="captain-brine" name="Captain Brine" position={[60, -0.4, -2]} color="#FDFBF7" type="dog" onInteract={handleCaptainBrineInteract} showQuestMarker={activeQuestId === 'quest5' && quests['quest5']?.currentObjectiveIndex === 3} />
      {!useGameStore.getState().hasMilo && (
         <NPC id="milo-hiding" name="Hiding Dachshund" position={[60, -0.5, 2]} color="#A94F2B" type="dog" onInteract={handleMiloInteract} showQuestMarker={activeQuestId === 'quest2' && (quests['quest2'].currentObjectiveIndex === 1 || quests['quest2'].currentObjectiveIndex === 3)} />
      )}
      <CozyInteractable id="fishing-spot" name="Fishing Spot" position={[58, -0.4, -4]} text="The bobber drifts lazily. Something silver flickers under the dock." />


      {/* ── SOUTH: SEAGLASS BEACH ── */}
      <group position={[0, -0.6, 50]}>
         <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
             <planeGeometry args={[30, 20]} />
             <meshStandardMaterial color="#E8DCC4" />
         </mesh>
         {/* Tidepools */}
         <mesh position={[5, 0.05, 3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
             <planeGeometry args={[6, 6]} />
             <meshStandardMaterial color="#A8C8D9" transparent opacity={0.8} />
         </mesh>
         <mesh position={[-4, 0.05, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
             <planeGeometry args={[4, 5]} />
             <meshStandardMaterial color="#A8C8D9" transparent opacity={0.8} />
         </mesh>

         {/* Handplaced Palms and Beach details */}
         <PalmTree position={[-12, 0, -6]} scale={1.2} />
         <PalmTree position={[-8, 0, -8]} scale={1.1} />
         <PalmTree position={[14, 0, -2]} scale={1.4} />
         
         <Rock position={[-5, 0.2, 5]} scale={1.5} />
         <Rock position={[6, 0.2, -5]} scale={0.8} />

         <Crab position={[-8, 0, 2]} color="#E8A95B" />
         <Crab position={[8, 0, 4]} color="#D93D4A" />

         {activeQuestId === 'quest5' && quests['quest5']?.currentObjectiveIndex === 1 && (
             <NPC id="driftwood" name="Sturdy Driftwood" position={[-4, 0.2, 0]} color="#A68A72" type="secret" showQuestMarker onInteract={() => {
                 useGameStore.getState().advanceQuestObjective('quest5');
                 useGameStore.getState().setDialog('Yoshi', '(You found a strong piece of driftwood for the bridge!)');
             }} />
         )}

         {/* Letters */}
         {[
            [-1, 0.1, 1], [3, 0.1, -1], [1, 0.1, 3], [-3, 0.1, -2]
          ].map((pos, i) => (
             <group key={`glass-${i}`} position={pos as [number, number, number]}>
                 <mesh rotation={[Math.random(), Math.random(), 0]}>
                    <icosahedronGeometry args={[0.2, 0]} />
                    <meshStandardMaterial color={['#A8C8D9', '#7C9982', '#FDFBF7'][i % 3]} transparent opacity={0.8} />
                 </mesh>
                 {activeQuestId === 'quest3' && quests['quest3']?.currentObjectiveIndex >= 1 && quests['quest3']?.currentObjectiveIndex < 4 && i < 3 && (
                     <NPC id={`letter-${i}`} name="Wet Letter" position={[0, 0, 0]} color="#FDFBF7" type="secret" showQuestMarker={useGameStore.getState().hasMilo} onInteract={() => {
                         useGameStore.getState().advanceQuestObjective('quest3');
                         useGameStore.getState().setDialog('Yoshi', '(You carefully pick up the soggy letter!)');
                     }} />
                 )}
             </group>
          ))}
          
          <CozyInteractable id="beach-lounge-west" name="Beach Lounge" position={[-10, 0, 5]} text="A towel, a shade umbrella, and a half-built sandcastle wait for a lazy afternoon." />
      </group>


      {/* ── NORTH: MOAT & BRIDGE ── */}
      <group position={[0, 0, -50]}>
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 15]} />
          <meshStandardMaterial color="#A8C8D9" transparent opacity={0.8} />
        </mesh>
        <ArchBridge position={[0, -0.6, 0]} rotation={[0, 0, 0]} width={4} length={12} />
        
        <Frog position={[-10, -0.2, 0]} />
        <Frog position={[8, -0.2, 3]} />
        <Dragonfly position={[0, 1.5, -5]} />
      </group>

    </group>
  );
}
