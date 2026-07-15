import { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';

const LANDMARKS: Record<string, { x: number; z: number; color: string; label: string }> = {
  Paula: { x: -3.2, z: -11.5, color: '#1D2E4D', label: 'Paula' },
  Jam: { x: 3.2, z: -11.5, color: '#B6A184', label: 'Jam' },
  'Welcome Basket': { x: -1.7, z: -14.2, color: '#C58A2D', label: 'Welcome Basket' },
  Buttercup: { x: 18, z: 15, color: '#F6D35E', label: 'Clover Meadow Buttercup' },
  Bluebell: { x: -14, z: 20, color: '#83AEE0', label: 'Willow Pond Bluebell' },
  Blossom: { x: -22, z: -8, color: '#EE9DB5', label: 'Orchard Blossom' },
  'Seed Packet': { x: 23.4, z: -9.5, color: '#D67B5B', label: 'Market Seed Packet' },
  Garden: { x: 9, z: -17, color: '#5D9B58', label: "Milo's Garden" },
  'Pond Memory': { x: -10.5, z: 17, color: '#8B6A4D', label: 'Pond Pawprint' },
  'Orchard Memory': { x: -14, z: -7, color: '#8B6A4D', label: 'Orchard Pawprint' },
  'Lookout Memory': { x: 0, z: 28, color: '#8B6A4D', label: 'Hilltop Pawprint' },
  'Porch Lantern': { x: -4, z: -14, color: '#FFB85C', label: 'Porch Lantern' },
  'Garden Lantern': { x: 13, z: -13, color: '#FFB85C', label: 'Garden Lantern' },
  'Pond Lantern': { x: -11, z: 13, color: '#FFB85C', label: 'Pond Lantern' },
};

const MAP_SIZE = 160;
const WORLD_SIZE = 100;
const SCALE = MAP_SIZE / WORLD_SIZE;

function clampToMap(value: number) {
  return Math.max(2, Math.min(MAP_SIZE - 2, value));
}

export function Minimap() {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const activeQuestId = useGameStore((state) => state.activeQuestId);
  const quests = useGameStore((state) => state.quests);
  const settings = useGameStore((state) => state.settings);

  const toPx = (value: number) => (value + WORLD_SIZE / 2) * SCALE;
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
    const index = quest.currentObjectiveIndex;

    if (activeQuestId === 'homecoming') return ['Paula', 'Welcome Basket', 'Jam'][index] || 'Paula';
    if (activeQuestId === 'picnic') return ['Jam', 'Buttercup', 'Bluebell', 'Blossom', 'Paula'][index] || 'Jam';
    if (activeQuestId === 'garden') return ['Paula', 'Seed Packet', 'Garden', 'Jam'][index] || 'Paula';
    if (activeQuestId === 'memories') return ['Jam', 'Pond Memory', 'Orchard Memory', 'Lookout Memory', 'Jam'][index] || 'Jam';
    if (activeQuestId === 'lanterns') return ['Paula', 'Porch Lantern', 'Garden Lantern', 'Pond Lantern', 'Paula'][index] || 'Paula';
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
    <div className="w-[160px] h-[160px] border-4 border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-full overflow-hidden relative pointer-events-auto bg-[#8CBAC0]">
      <div className="absolute inset-0 bg-[#8CBAC0]" />
      <div
        className="absolute inset-[5px] bg-[#D9C59A]"
        style={{ clipPath: 'polygon(48% 1%, 63% 5%, 74% 12%, 89% 17%, 97% 31%, 92% 44%, 98% 58%, 89% 73%, 77% 81%, 67% 94%, 51% 97%, 38% 91%, 25% 96%, 15% 86%, 6% 73%, 9% 58%, 3% 45%, 10% 31%, 14% 17%, 31% 11%)' }}
      />
      <div
        className="absolute inset-[10px] bg-[#799765]"
        style={{ clipPath: 'polygon(48% 1%, 63% 5%, 74% 12%, 89% 17%, 97% 31%, 92% 44%, 98% 58%, 89% 73%, 77% 81%, 67% 94%, 51% 97%, 38% 91%, 25% 96%, 15% 86%, 6% 73%, 9% 58%, 3% 45%, 10% 31%, 14% 17%, 31% 11%)' }}
      />
      <div className="absolute rounded-full bg-[#D9C59A]" style={circleStyle(0, 0, 12)} />

      {/* Maple House, market, orchard, meadow, pond, and lookout. */}
      <div className="absolute rounded bg-[#F2DFC0] border border-[#7A5642]" style={rectStyle(0, -19, 9, 7)} />
      <div className="absolute rounded bg-[#D67B5B]" style={rectStyle(21, -8, 8, 6)} />
      <div className="absolute rounded bg-[#4D7E4E] opacity-80" style={rectStyle(-22, -8, 18, 15)} />
      <div className="absolute rounded-full bg-[#8DBE72]" style={circleStyle(18, 17, 17)} />
      <div className="absolute rounded-full bg-[#5FA8A4] border-2 border-[#D9C59A]" style={circleStyle(-18, 18, 14)} />
      <div className="absolute rounded bg-[#6D825B]" style={rectStyle(0, 31, 13, 8)} />

      {/* Winding village walk, shown as connected trail segments. */}
      <div className="absolute bg-[#E0CFAE]" style={{ ...rectStyle(0, -9, 3.8, 18), transform: 'rotate(-4deg)' }} />
      <div className="absolute bg-[#E0CFAE]" style={{ ...rectStyle(6, -2, 15, 3.2), transform: 'rotate(-18deg)' }} />
      <div className="absolute bg-[#E0CFAE]" style={{ ...rectStyle(16, -6, 13, 3.2), transform: 'rotate(-16deg)' }} />
      <div className="absolute bg-[#E0CFAE]" style={{ ...rectStyle(10, 9, 24, 3.2), transform: 'rotate(45deg)' }} />
      <div className="absolute bg-[#E0CFAE]" style={{ ...rectStyle(-7, 8, 21, 3.2), transform: 'rotate(-50deg)' }} />
      <div className="absolute bg-[#E0CFAE]" style={{ ...rectStyle(-15, 4, 18, 3), transform: 'rotate(79deg)' }} />
      <div className="absolute bg-[#E0CFAE]" style={{ ...rectStyle(-9, -5, 20, 3), transform: 'rotate(3deg)' }} />
      <div className="absolute bg-[#E0CFAE]" style={{ ...rectStyle(1, 16, 3, 31), transform: 'rotate(4deg)' }} />

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
        const size = isTarget ? 11 : (id === 'Paula' || id === 'Jam' ? 8 : 6);
        return (
          <div
            key={id}
            className={`absolute rounded-full border border-ink ${isTarget ? 'animate-pulse z-20' : 'z-10 opacity-80'}`}
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
