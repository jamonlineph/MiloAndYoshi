import { PlayerController } from './PlayerController';
import { CompanionController } from './CompanionController';
import { PawprintBay } from './environment/PawprintBay';
import { useGameStore, Quest } from '../../store/useGameStore';
import { useEffect } from 'react';

export function GameScene() {
  const initQuests = useGameStore(state => state.initQuests);

  useEffect(() => {
    const initialQuests: Record<string, Quest> = {
      'prologue': {
        id: 'prologue',
        title: 'The Courier Without a Wag',
        description: 'Taro has a special job for you. Talk to him in Courier Cove.',
        status: 'available',
        currentObjectiveIndex: 0,
        objectives: [
          'Speak with Taro.',
          'Equip the red neckerchief at the wardrobe.',
          'Practice barking at the training sign.',
          'Ring the courier bell to save.'
        ]
      },
      'quest1': {
        id: 'quest1',
        title: 'Warm Before the Wind',
        description: 'Sora wants to send a warm bun to Aoi at the lighthouse.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Speak with Sora at the bakery.',
          'Deliver the warm melon bun to Aoi at the lighthouse.'
        ],
        rewardDescription: 'Bakery Stamp & Sailor Cap'
      },
      'quest2': {
        id: 'quest2',
        title: 'The Brass Tag Under the Dock',
        description: 'Help Milo investigate the strange noises beneath the Old Dock and recover his missing brass tag.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Speak with Nori about the dock noises.',
          'Investigate the old dock with Milo.',
          'Retrieve Milo\'s brass tag from the Crab Village.',
          'Regroup with Milo at the old dock.'
        ],
        rewardDescription: 'Milo friendship grows!'
      },
      'quest3': {
        id: 'quest3',
        title: 'Letters in the Tidepools',
        description: 'Find Mimi\'s missing historical letters on Seaglass beach.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Speak with Mimi.',
          'Search Seaglass Beach for missing letters.',
          'Find another missing letter.',
          'Find the last missing letter.',
          'Return the letters to Mimi.'
        ],
        rewardDescription: 'Seaglass Stamp & Beach Bandana'
      },
      'quest4': {
        id: 'quest4',
        title: 'Wind Chimes Remember',
        description: 'Help Moss repair the wind chimes.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Speak with Moss.',
          'Find a fallen windbell blossom.',
          'Find another fallen windbell blossom.',
          'Return the petals to Moss.'
        ],
        rewardDescription: 'Garden Stamp'
      },
      'quest5': {
        id: 'quest5',
        title: 'Sturdy Bridge',
        description: 'Repair the storm path to reach the western cliffs.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Speak to Nori about the storm path.',
          'Find sturdy driftwood on Seaglass Beach.',
          'Find sturdy rope on the Old Dock.',
          'Ask Captain Brine for an old route marker.',
          'Repair the broken bridge to the storm path.'
        ],
        rewardDescription: 'Dock Stamp & Storm Path unlocked'
      },
      'quest6': {
        id: 'quest6',
        title: 'Final Letter for Aoi',
        description: 'Deliver the final weathered letter to Aoi.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Speak to Taro.',
          'Take Milo to the Storm Path.',
          'Investigate the Wind Chimes.',
          'Bark to clear the path.',
          'Deliver the final letter to Aoi.'
        ],
        rewardDescription: 'All deliveries complete!'
      }
    };
    initQuests(initialQuests);
  }, [initQuests]);

  return (
    <group>
      <PlayerController />
      <CompanionController />
      <PawprintBay />
    </group>
  );
}
