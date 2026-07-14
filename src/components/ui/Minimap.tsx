import { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';

const LANDMARKS: Record<string, { x: number; z: number; color: string; label: string }> = {
  'Taro': { x: -21.5, z: -24.5, color: '#5A7D59', label: 'Taro' },
  'Wardrobe': { x: -23, z: -26, color: '#D93D4A', label: 'Wardrobe' },
  'Training Sign': { x: -3, z: -2.5, color: '#E8A95B', label: 'Training Sign' },
  'Courier Bell': { x: -26, z: -23, color: '#D4AF37', label: 'Courier Bell' },
  'Sora': { x: -16.5, z: 21.5, color: '#E8A95B', label: 'Sora' },
  'Aoi': { x: -51, z: 4, color: '#FDFBF7', label: 'Aoi' },
  'Nori': { x: 54, z: 2.8, color: '#A68A72', label: 'Nori' },
  'Mimi': { x: 23, z: -20.2, color: '#D9553F', label: 'Mimi' },
  'Moss': { x: 24, z: 18, color: '#8C6B52', label: 'Moss' },
  'Dock Pawprints': { x: 58, z: 2.7, color: '#5C4D3C', label: 'Dock Pawprints' },
  'Milo Check-in': { x: 56.5, z: 4.2, color: '#A94F2B', label: 'Milo Check-in' },
  'Crab Village': { x: 60, z: 2, color: '#D93D4A', label: 'Crab Village' },
  'Beach Letters': { x: 0, z: 50, color: '#FDFBF7', label: 'Seaglass Letters' },
  'Storm Petals': { x: 20, z: 20, color: '#D93D4A', label: 'Storm Petals' },
  'Driftwood': { x: -4, z: 50, color: '#A68A72', label: 'Sturdy Driftwood' },
  'Rope': { x: 58, z: -2, color: '#E8DCC4', label: 'Sturdy Rope' },
  'Bridge': { x: 0, z: -50, color: '#4A6B82', label: 'Storm Path Bridge' },
  'Wind Chimes': { x: 20, z: 20, color: '#FDFBF7', label: 'Wind Chimes' },
  'Captain Brine': { x: 57.5, z: -4.2, color: '#FDFBF7', label: 'Captain Brine' },
};

const MAP_SIZE = 160;
const WORLD_SIZE = 140;
const SCALE = MAP_SIZE / WORLD_SIZE;

function clampToMap(value: number) {
  return Math.max(2, Math.min(MAP_SIZE - 2, value));
}

export function Minimap() {
  const playerPosition = useGameStore(state => state.playerPosition);
  const activeQuestId = useGameStore(state => state.activeQuestId);
  const quests = useGameStore(state => state.quests);
  const settings = useGameStore(state => state.settings);

  const toPx = (val: number) => (val + WORLD_SIZE / 2) * SCALE;
  const rectStyle = (x: number, z: number, width: number, height: number) => ({
    left: toPx(x - width / 2),
    top: toPx(z - height / 2),
    width: width * SCALE,
    height: height * SCALE,
  });
  const circleStyle = (x: number, z: number, diameter: number) => rectStyle(x, z, diameter, diameter);

  const targetId = useMemo(() => {
    if (!activeQuestId) return null;
    const quest = quests[activeQuestId];
    if (!quest) return null;

    if (activeQuestId === 'prologue') {
      return ['Taro', 'Wardrobe', 'Training Sign', 'Courier Bell'][quest.currentObjectiveIndex] || 'Taro';
    }

    if (activeQuestId === 'quest1') {
      return quest.currentObjectiveIndex === 0 ? 'Sora' : 'Aoi';
    }

    if (activeQuestId === 'quest2') {
      return ['Nori', 'Dock Pawprints', 'Crab Village', 'Milo Check-in'][quest.currentObjectiveIndex] || 'Nori';
    }

    if (activeQuestId === 'quest3') {
      return quest.currentObjectiveIndex === 0 || quest.currentObjectiveIndex === 4 ? 'Mimi' : 'Beach Letters';
    }

    if (activeQuestId === 'quest4') {
      return quest.currentObjectiveIndex === 0 || quest.currentObjectiveIndex === 3 ? 'Moss' : 'Storm Petals';
    }

    if (activeQuestId === 'quest5') {
      return ['Nori', 'Driftwood', 'Rope', 'Captain Brine', 'Bridge'][quest.currentObjectiveIndex] || 'Nori';
    }

    if (activeQuestId === 'quest6') {
      return ['Taro', 'Bridge', 'Wind Chimes', 'Wind Chimes', 'Aoi'][quest.currentObjectiveIndex] || 'Aoi';
    }

    return null;
  }, [activeQuestId, quests]);

  if (!settings.showMinimap) return null;

  const playerX = clampToMap(toPx(playerPosition.x));
  const playerZ = clampToMap(toPx(playerPosition.z));
  const target = targetId ? LANDMARKS[targetId] : null;
  const targetX = target ? clampToMap(toPx(target.x)) : 0;
  const targetZ = target ? clampToMap(toPx(target.z)) : 0;
  const targetDx = targetX - playerX;
  const targetDz = targetZ - playerZ;
  const targetDistance = Math.hypot(targetDx, targetDz);
  const targetAngle = Math.atan2(targetDz, targetDx);

  return (
    <div className="w-[160px] h-[160px] border-4 border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-full overflow-hidden relative pointer-events-auto bg-[#A8C8D9]">
      <div className="absolute inset-0 bg-[#A8C8D9]" />

      <div className="absolute rounded-full bg-[#88A07A]" style={circleStyle(0, 0, 110)} />
      <div className="absolute rounded-full bg-[#7C9982]" style={circleStyle(-25, -25, 42)} />
      <div className="absolute rounded-full bg-[#7C9982]" style={circleStyle(25, -25, 50)} />
      <div className="absolute rounded-full bg-[#7C9982]" style={circleStyle(-55, 0, 30)} />
      <div className="absolute rounded-full bg-[#E8DCC4]" style={circleStyle(50, 0, 24)} />
      <div className="absolute rounded-[10px] bg-[#E8DCC4]" style={rectStyle(0, 50, 30, 20)} />
      <div className="absolute rounded-[10px] bg-[#A8C8D9] border border-[#6F9FB2]" style={rectStyle(0, -50, 40, 15)} />

      <div className="absolute bg-[#E8DCC4]" style={rectStyle(0, 0, 70, 10)} />
      <div className="absolute bg-[#E8DCC4]" style={rectStyle(0, 0, 10, 70)} />
      <div className="absolute bg-[#D9C7B0]" style={{ ...rectStyle(0, 0, 42, 7), transform: 'rotate(45deg)' }} />
      <div className="absolute bg-[#D9C7B0]" style={{ ...rectStyle(0, 0, 42, 7), transform: 'rotate(-45deg)' }} />
      <div className="absolute bg-[#D9C7B0]" style={{ ...rectStyle(-12, -12, 17, 8), transform: 'rotate(45deg)' }} />
      <div className="absolute bg-[#D9C7B0]" style={rectStyle(-38, 0, 18, 8)} />
      <div className="absolute bg-[#6B5440]" style={rectStyle(59, 0, 14, 5)} />
      <div className="absolute bg-[#6B5440]" style={rectStyle(0, -50, 5, 14)} />
      <div className="absolute bg-[#D9C7B0] rotate-45" style={rectStyle(0, 0, 16, 16)} />

      {target && targetDistance > 5 && (
        <div
          className="absolute h-[2px] rounded-full bg-[#D93D4A] z-10 opacity-75"
          style={{
            left: playerX,
            top: playerZ,
            width: targetDistance,
            transform: `rotate(${targetAngle}rad)`,
            transformOrigin: '0 50%',
          }}
        />
      )}

      {Object.entries(LANDMARKS).map(([id, data]) => {
        const isTarget = targetId === id;
        const size = isTarget ? 11 : 7;
        return (
          <div
            key={id}
            className={`absolute rounded-full border border-ink ${isTarget ? 'animate-pulse z-20' : 'z-10 opacity-75'}`}
            style={{
              left: clampToMap(toPx(data.x)) - size / 2,
              top: clampToMap(toPx(data.z)) - size / 2,
              width: size,
              height: size,
              backgroundColor: isTarget ? '#D93D4A' : data.color,
            }}
            title={data.label}
          />
        );
      })}

      <div
        className="absolute border-[2px] border-white z-30"
        style={{
          left: playerX - 5,
          top: playerZ - 5,
          width: 10,
          height: 10,
          backgroundColor: '#E8A95B',
          borderRadius: '50% 50% 0 50%',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 4px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
}
