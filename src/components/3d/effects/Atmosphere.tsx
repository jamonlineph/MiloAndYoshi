import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════
const DUST_COUNT = 160;
const FIREFLY_COUNT = 36;
const DANDELION_COUNT = 16;
const WATER_SPARKLE_COUNT = 24;

// ═══════════════════════════════════════════════════════════════════════════
// Cloud definitions — 12 clouds, each with 4–5 sub-spheres
// ═══════════════════════════════════════════════════════════════════════════
interface CloudSphere {
  offset: [number, number, number];
  radius: number;
}

interface CloudDef {
  position: [number, number, number];
  scale: number;
  driftSpeedX: number;
  driftSpeedZ: number;
  bobSpeed: number;
  bobAmount: number;
  spheres: CloudSphere[];
}

function makeCloudDefs(): CloudDef[] {
  const positions: [number, number, number][] = [
    [-15, 16, -25],
    [10, 13, -35],
    [30, 19, -15],
    [-25, 15, 12],
    [5, 17, 28],
    [-35, 21, -5],
    [0, 19, -45],
    [20, 14, 20],
    [-40, 17, -30],
    [35, 22, -25],
    [-10, 20, 35],
    [15, 16, -10],
  ];

  return positions.map((pos, idx) => {
    // Each cloud gets 4-5 overlapping spheres
    const sphereCount = 4 + (idx % 2); // alternates 4 or 5
    const spheres: CloudSphere[] = [];
    for (let s = 0; s < sphereCount; s++) {
      const angle = (s / sphereCount) * Math.PI * 2;
      const spread = 1.2 + Math.sin(idx + s) * 0.6;
      spheres.push({
        offset: [
          Math.cos(angle) * spread,
          (Math.sin(idx * 3 + s) * 0.4) - 0.2,
          Math.sin(angle) * spread * 0.7,
        ],
        radius: 1.4 + Math.sin(idx + s * 2) * 0.8,
      });
    }

    return {
      position: pos,
      scale: 0.9 + (Math.sin(idx * 1.7) * 0.5 + 0.5) * 0.8,
      driftSpeedX: 0.15 + Math.abs(Math.sin(idx * 2.3)) * 0.25,
      driftSpeedZ: 0.05 + Math.abs(Math.cos(idx * 1.7)) * 0.15,
      bobSpeed: 0.2 + Math.sin(idx) * 0.1,
      bobAmount: 0.3 + Math.sin(idx * 0.7) * 0.15,
      spheres,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Particle data generators
// ═══════════════════════════════════════════════════════════════════════════
function makeDustData() {
  return Array.from({ length: DUST_COUNT }, (_, i) => ({
    x: (Math.random() - 0.5) * 60,
    y: Math.random() * 16,
    z: (Math.random() - 0.5) * 60,
    speed: 0.15 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    spiralRadius: 0.3 + Math.random() * 0.8,
    spiralSpeed: 0.3 + Math.random() * 0.6,
    baseScale: 0.03 + Math.random() * 0.06,
  }));
}

function makeFireflyData() {
  return Array.from({ length: FIREFLY_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 20;
    return {
      baseX: Math.cos(angle) * radius,
      baseY: 0.5 + Math.random() * 2.5,
      baseZ: Math.sin(angle) * radius,
      phase: Math.random() * Math.PI * 2,
      wanderSpeed: 0.3 + Math.random() * 0.7,
      wanderRadius: 0.8 + Math.random() * 1.5,
      pulseSpeed: 1.5 + Math.random() * 2.5,
      pulsePhase: Math.random() * Math.PI * 2,
      figure8Speed: 0.2 + Math.random() * 0.4,
    };
  });
}

function makeDandelionData() {
  return Array.from({ length: DANDELION_COUNT }, () => ({
    x: (Math.random() - 0.5) * 40,
    y: Math.random() * 8,
    z: (Math.random() - 0.5) * 40,
    phase: Math.random() * Math.PI * 2,
    swaySpeed: 0.3 + Math.random() * 0.5,
    swayAmount: 0.5 + Math.random() * 1.0,
    riseSpeed: 0.08 + Math.random() * 0.12,
    baseScale: 0.04 + Math.random() * 0.04,
  }));
}

function makeWaterSparkleData() {
  return Array.from({ length: WATER_SPARKLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 22;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 2.0,
      baseScale: 0.06 + Math.random() * 0.08,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Shared materials (created once, not per-frame)
// ═══════════════════════════════════════════════════════════════════════════
const cloudMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#FFFFFF'),
  transparent: true,
  opacity: 0.85,
  roughness: 1,
  metalness: 0,
  flatShading: true,
});

const dustMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#FFF5D6'),
  emissive: new THREE.Color('#E8A95B'),
  emissiveIntensity: 0.6,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide,
});

const fireflyMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#D4FF80'),
  emissive: new THREE.Color('#AADD44'),
  emissiveIntensity: 1.5,
  transparent: true,
  opacity: 0.9,
});

const dandelionMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#FFFEF5'),
  emissive: new THREE.Color('#FFF8E0'),
  emissiveIntensity: 0.3,
  transparent: true,
  opacity: 0.75,
  side: THREE.DoubleSide,
});

const waterSparkleMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#FFFDE8'),
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide,
});

// ═══════════════════════════════════════════════════════════════════════════
// Shared geometries
// ═══════════════════════════════════════════════════════════════════════════
const dustGeometry = new THREE.PlaneGeometry(1, 1);
const fireflyGeometry = new THREE.SphereGeometry(1, 6, 6);
const dandelionGeometry = new THREE.PlaneGeometry(1, 1);
const waterSparkleGeometry = new THREE.PlaneGeometry(1, 1);

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════
export function Atmosphere() {
  // ── Refs ──────────────────────────────────────────────────────────────
  const cloudGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const dustRef = useRef<THREE.InstancedMesh>(null);
  const fireflyRef = useRef<THREE.InstancedMesh>(null);
  const dandelionRef = useRef<THREE.InstancedMesh>(null);
  const waterSparkleRef = useRef<THREE.InstancedMesh>(null);

  // ── Stable data ──────────────────────────────────────────────────────
  const cloudDefs = useMemo(() => makeCloudDefs(), []);
  const dustData = useRef(makeDustData());
  const fireflyData = useRef(makeFireflyData());
  const dandelionData = useRef(makeDandelionData());
  const waterSparkleData = useRef(makeWaterSparkleData());

  // ── Reusable Object3D for instanced mesh transforms ──────────────────
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // ── Animation loop ───────────────────────────────────────────────────
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // ── Clouds: independent drift and bob ────────────────────────────
    cloudDefs.forEach((cloud, i) => {
      const group = cloudGroupRefs.current[i];
      if (!group) return;

      // Drift slowly — wrap around when too far
      const driftX = cloud.position[0] + Math.sin(time * cloud.driftSpeedX + i * 1.3) * 8;
      const driftZ = cloud.position[2] + Math.cos(time * cloud.driftSpeedZ + i * 0.9) * 5;
      const bob = cloud.position[1] + Math.sin(time * cloud.bobSpeed + i * 2.0) * cloud.bobAmount;

      group.position.set(driftX, bob, driftZ);
    });

    // ── Golden pollen / dust with spiral motion ──────────────────────
    if (dustRef.current) {
      dustData.current.forEach((data, i) => {
        const spiralAngle = time * data.spiralSpeed + data.phase;
        const spiralX = Math.cos(spiralAngle) * data.spiralRadius;
        const spiralZ = Math.sin(spiralAngle) * data.spiralRadius;

        data.x += Math.sin(time * 0.5 + i * 0.1) * delta * data.speed;
        data.y -= delta * 0.15;
        data.z += Math.cos(time * 0.3 + i * 0.1) * delta * data.speed;

        // Wrap around
        if (data.y < 0) data.y = 16;
        if (data.x > 30) data.x = -30;
        if (data.x < -30) data.x = 30;
        if (data.z > 30) data.z = -30;
        if (data.z < -30) data.z = 30;

        dummy.position.set(data.x + spiralX, data.y, data.z + spiralZ);

        // Vary scale over time
        const s = data.baseScale * (0.7 + 0.6 * Math.sin(time * 1.2 + data.phase));
        dummy.scale.set(s, s, s);

        dummy.rotation.set(0, time * 0.5 + data.phase, Math.sin(time + data.phase) * 0.5);
        dummy.updateMatrix();
        dustRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dustRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Fireflies: figure-8 paths with pulsing glow ─────────────────
    if (fireflyRef.current) {
      fireflyData.current.forEach((data, i) => {
        const t = time * data.figure8Speed + data.phase;

        // Figure-8 / lemniscate path
        const figureX = Math.sin(t) * data.wanderRadius;
        const figureZ = Math.sin(t * 2) * data.wanderRadius * 0.5;

        // Additional gentle random walk
        const wanderX = Math.sin(time * data.wanderSpeed + data.phase * 3) * 0.5;
        const wanderY = Math.cos(time * data.wanderSpeed * 0.7 + data.phase * 5) * 0.3;
        const wanderZ = Math.sin(time * data.wanderSpeed * 0.5 + data.phase * 7) * 0.5;

        dummy.position.set(
          data.baseX + figureX + wanderX,
          data.baseY + wanderY,
          data.baseZ + figureZ + wanderZ
        );

        // Pulse emissive intensity via scale
        const pulse = 0.4 + 0.6 * (Math.sin(time * data.pulseSpeed + data.pulsePhase) * 0.5 + 0.5);
        const s = 0.04 * pulse;
        dummy.scale.set(s, s, s);

        dummy.updateMatrix();
        fireflyRef.current!.setMatrixAt(i, dummy.matrix);
      });
      fireflyRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Dandelion seeds: slow rise with gentle sway ─────────────────
    if (dandelionRef.current) {
      dandelionData.current.forEach((data, i) => {
        data.y += delta * data.riseSpeed;
        if (data.y > 14) {
          data.y = 0.5;
          data.x = (Math.random() - 0.5) * 40;
          data.z = (Math.random() - 0.5) * 40;
        }

        const swayX = Math.sin(time * data.swaySpeed + data.phase) * data.swayAmount;
        const swayZ = Math.cos(time * data.swaySpeed * 0.8 + data.phase + 1) * data.swayAmount * 0.7;

        dummy.position.set(data.x + swayX, data.y, data.z + swayZ);

        const s = data.baseScale;
        dummy.scale.set(s, s, s);

        // Gently tumble
        dummy.rotation.set(
          time * 0.3 + data.phase,
          time * 0.2 + data.phase * 2,
          Math.sin(time * 0.4 + data.phase) * 0.3
        );

        dummy.updateMatrix();
        dandelionRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dandelionRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Water sparkles: shimmer by modulating scale ─────────────────
    if (waterSparkleRef.current) {
      waterSparkleData.current.forEach((data, i) => {
        const yPos = -0.5 + Math.sin(time * 0.4 + data.phase) * 0.25;

        dummy.position.set(data.x, yPos, data.z);

        // Twinkle effect
        const twinkle = Math.max(0, Math.sin(time * data.speed + data.phase));
        const s = data.baseScale * twinkle * twinkle; // Squared for sharper on/off
        dummy.scale.set(s, s, s);

        // Face mostly upward
        dummy.rotation.set(-Math.PI / 2, 0, time * 0.1 + data.phase);

        dummy.updateMatrix();
        waterSparkleRef.current!.setMatrixAt(i, dummy.matrix);
      });
      waterSparkleRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ── Clouds ──────────────────────────────────────────────────────── */}
      {cloudDefs.map((cloud, i) => (
        <group
          key={`cloud-${i}`}
          ref={(el) => { cloudGroupRefs.current[i] = el; }}
          position={cloud.position}
          scale={cloud.scale}
        >
          {cloud.spheres.map((sphere, s) => (
            <mesh
              key={`cloud-${i}-sphere-${s}`}
              position={sphere.offset}
              material={cloudMaterial}
            >
              <sphereGeometry args={[sphere.radius, 12, 12]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Golden pollen / dust ────────────────────────────────────────── */}
      <instancedMesh
        ref={dustRef}
        args={[dustGeometry, dustMaterial, DUST_COUNT]}
        frustumCulled={false}
      />

      {/* ── Fireflies ───────────────────────────────────────────────────── */}
      <instancedMesh
        ref={fireflyRef}
        args={[fireflyGeometry, fireflyMaterial, FIREFLY_COUNT]}
        frustumCulled={false}
      />

      {/* ── Dandelion seeds ─────────────────────────────────────────────── */}
      <instancedMesh
        ref={dandelionRef}
        args={[dandelionGeometry, dandelionMaterial, DANDELION_COUNT]}
        frustumCulled={false}
      />

      {/* ── Water sparkles ──────────────────────────────────────────────── */}
      <instancedMesh
        ref={waterSparkleRef}
        args={[waterSparkleGeometry, waterSparkleMaterial, WATER_SPARKLE_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}
