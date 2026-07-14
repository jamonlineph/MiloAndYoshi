import { PlayerController } from './PlayerController';
import { CompanionController } from './CompanionController';
import { PawprintBay } from './environment/PawprintBay';
import { useGameStore, Quest } from '../../store/useGameStore';
import { useEffect } from 'react';

export function GameScene() {
  const initQuests = useGameStore(state => state.initQuests);

  useEffect(() => {
    const initialQuests: Record<string, Quest> = {
      'homecoming': {
        id: 'homecoming',
        title: 'Home Is Where the Paws Are',
        description: 'Paula and Jam have planned a gentle first morning for their two favorite dogs.',
        status: 'available',
        currentObjectiveIndex: 0,
        objectives: [
          'Greet Paula outside Maple House.',
          'Sniff the welcome basket on the porch.',
          'Bring Milo to Jam at the garden gate.'
        ],
        rewardDescription: 'Maple House Stamp'
      },
      'picnic': {
        id: 'picnic',
        title: 'A Blanket Full of Sunshine',
        description: 'Jam wants to surprise Paula with a picnic made from meadow colors and happy memories.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Ask Jam about his picnic idea.',
          'Find a buttercup in Clover Meadow.',
          'Find a bluebell beside the pond.',
          'Find a pink blossom in the orchard.',
          'Bring the little bouquet to Paula.'
        ],
        rewardDescription: 'Sunshine Picnic Stamp'
      },
      'garden': {
        id: 'garden',
        title: "Milo's Pocket Garden",
        description: 'Paula found a sunny patch where Milo can grow something small, stubborn, and wonderful.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Ask Paula about the empty garden patch.',
          'Pick up the seed packet at the market cart.',
          'Water Milo\'s new garden beside Maple House.',
          'Show the tiny sprouts to Jam.'
        ],
        rewardDescription: 'Little Sprout Stamp'
      },
      'memories': {
        id: 'memories',
        title: 'The Trail We Remember',
        description: 'Jam has marked three favorite family walks with wooden pawprints for Yoshi and Milo to rediscover.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Ask Jam about the memory trail.',
          'Find the pawprint near Willow Pond.',
          'Find the pawprint in Applebell Orchard.',
          'Find the pawprint at the hilltop lookout.',
          'Return to Jam with Milo.'
        ],
        rewardDescription: 'Family Trail Stamp'
      },
      'lanterns': {
        id: 'lanterns',
        title: 'Lanterns Lead Us Home',
        description: 'Paula wants to end the day with a glowing path home for every wandering paw.',
        status: 'locked',
        currentObjectiveIndex: 0,
        objectives: [
          'Ask Paula about the evening lantern walk.',
          'Light the lantern on the Maple House porch.',
          'Light the lantern at the garden gate.',
          'Light the lantern beside Willow Pond.',
          'Return home to Paula and Jam.'
        ],
        rewardDescription: 'Home Together Stamp'
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
