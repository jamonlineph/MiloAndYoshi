import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Foam particle data (shoreline bubbles) ──────────────────────────────────
const FOAM_COUNT = 160;
const SPARKLE_COUNT = 240;

function makeFoamData() {
  return Array.from({ length: FOAM_COUNT }, (_, i) => {
    const angle = (i / FOAM_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const radius = i % 4 === 0 ? 90 + Math.random() * 70 : 54 + Math.random() * 18;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.8,
      baseScale: 0.1 + Math.random() * 0.13,
    };
  });
}

function makeSparkleData() {
  return Array.from({ length: SPARKLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 180;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
      baseScale: 0.03 + Math.random() * 0.05,
    };
  });
}

// ── Materials (created once, shared) ─────────────────────────────────────────
const deepWaterMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#2F7893'),
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide,
  roughness: 0.18,
  metalness: 0.02,
  transmission: 0.1,
  thickness: 2.2,
  ior: 1.333,
  clearcoat: 1,
  clearcoatRoughness: 0.14,
  reflectivity: 0.72,
  envMapIntensity: 1.45,
  attenuationColor: new THREE.Color('#2A7D89'),
  attenuationDistance: 7,
});

const surfaceShimmerMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#B9E8EF'),
  transparent: true,
  opacity: 0.14,
  side: THREE.DoubleSide,
  roughness: 0.08,
  metalness: 0.05,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
  envMapIntensity: 1.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const shoreTintMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#EAF7F9'),
  transparent: true,
  opacity: 0.16,
  side: THREE.DoubleSide,
  depthWrite: false,
});

const foamMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#FFFFFF'),
  transparent: true,
  opacity: 0.7,
  emissive: new THREE.Color('#E0F0FF'),
  emissiveIntensity: 0.15,
  roughness: 1,
});

const sparkleMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#FFFDE8'),
  transparent: true,
  opacity: 0.55,
  side: THREE.DoubleSide,
  depthWrite: false,
});

const seabedMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#17475A'),
  roughness: 1,
  metalness: 0,
  envMapIntensity: 0.2,
});

// ── Geometry (created once, shared) ──────────────────────────────────────────
const foamGeometry = new THREE.SphereGeometry(1, 6, 6);
const sparkleGeometry = new THREE.PlaneGeometry(1, 1);

export function Water() {
  const deepRef = useRef<THREE.Mesh>(null);
  const shimmerRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.InstancedMesh>(null);
  const sparkleRef = useRef<THREE.InstancedMesh>(null);

  // Store particle data in refs so they persist across frames
  const foamData = useRef(makeFoamData());
  const sparkleData = useRef(makeSparkleData());

  // Create low-segment geometries and animate only the base layer.
  const deepGeometry = useMemo(() => {
    const geometry = new THREE.CircleGeometry(180, 72, 0, Math.PI * 2);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const shimmerGeometry = useMemo(() => {
    return new THREE.CircleGeometry(175, 48, 0, Math.PI * 2);
  }, []);

  const shoreTintGeometry = useMemo(() => {
    return new THREE.RingGeometry(54, 69, 96);
  }, []);

  // Store original positions for wave computation
  const deepOriginalPositions = useMemo(() => {
    const pos = deepGeometry.attributes.position;
    return new Float32Array(pos.array);
  }, [deepGeometry]);

  // Reusable Object3D for instanced mesh transforms
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // ── Wave displacement on deep water ──────────────────────────────────
    if (deepRef.current) {
      const posAttr = deepRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const ox = deepOriginalPositions[i];
        const oy = deepOriginalPositions[i + 1];
        // Compose multiple sine waves for organic motion
        const wave1 = Math.sin(ox * 0.08 + time * 0.6) * 0.15;
        const wave2 = Math.cos(oy * 0.06 + time * 0.45) * 0.12;
        const wave3 = Math.sin((ox + oy) * 0.05 + time * 0.8) * 0.08;
        positions[i + 2] = wave1 + wave2 + wave3;
      }
      posAttr.needsUpdate = true;
    }

    // ── Cheap shimmer layer motion ────────────────────────────────────────
    if (shimmerRef.current) {
      shimmerRef.current.rotation.z = time * 0.015;
      shimmerRef.current.position.y = -0.82 + Math.sin(time * 0.45) * 0.025;
    }

    // ── Foam bobbing ─────────────────────────────────────────────────────
    if (foamRef.current) {
      foamData.current.forEach((data, i) => {
        const bob = Math.sin(time * data.speed + data.phase) * 0.15;
        const sway = Math.cos(time * data.speed * 0.5 + data.phase) * 0.3;
        const yPos = -0.76 + bob;

        dummy.position.set(data.x + sway, yPos, data.z);

        // Pulse scale for liveliness
        const scalePulse = data.baseScale * (0.8 + 0.4 * Math.sin(time * data.speed * 1.5 + data.phase));
        dummy.scale.setScalar(scalePulse);

        dummy.rotation.set(
          Math.sin(time * 0.3 + data.phase) * 0.3,
          time * 0.2 + data.phase,
          0
        );

        dummy.updateMatrix();
        foamRef.current!.setMatrixAt(i, dummy.matrix);
      });
      foamRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Caustic sparkles ─────────────────────────────────────────────────
    if (sparkleRef.current) {
      sparkleData.current.forEach((data, i) => {
        const yPos = -0.81 + Math.sin(time * 0.3 + data.phase) * 0.05;

        dummy.position.set(data.x, yPos, data.z);

        // Twinkle: fade in and out by modulating scale
        const twinkle = Math.max(0, Math.sin(time * data.speed + data.phase));
        const s = data.baseScale * twinkle;
        dummy.scale.set(s, s, s);

        // Face upward-ish with slight wobble
        dummy.rotation.set(
          -Math.PI / 2 + Math.sin(time * 0.2 + data.phase) * 0.1,
          time * 0.1 + data.phase,
          0
        );

        dummy.updateMatrix();
        sparkleRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sparkleRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* The dark seabed gives the translucent surface readable depth. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.6, 0]} material={seabedMaterial} receiveShadow>
        <circleGeometry args={[182, 72]} />
      </mesh>

      {/* ── Deep water layer ────────────────────────────────────────────── */}
      <mesh
        ref={deepRef}
        geometry={deepGeometry}
        material={deepWaterMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.9, 0]}
        receiveShadow
      />

      {/* ── Surface shimmer layer ───────────────────────────────────────── */}
      <mesh
        ref={shimmerRef}
        geometry={shimmerGeometry}
        material={surfaceShimmerMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.82, 0]}
        receiveShadow
      />

      {/* ── Soft shoreline tint around the main island ───────────────────── */}
      <mesh
        geometry={shoreTintGeometry}
        material={shoreTintMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.79, 0]}
      />

      {/* ── Shoreline foam spheres ──────────────────────────────────────── */}
      <instancedMesh
        ref={foamRef}
        args={[foamGeometry, foamMaterial, FOAM_COUNT]}
        frustumCulled={false}
      />

      {/* ── Water caustic sparkles ──────────────────────────────────────── */}
      <instancedMesh
        ref={sparkleRef}
        args={[sparkleGeometry, sparkleMaterial, SPARKLE_COUNT]}
        frustumCulled={false}
      />

      {/* ── Underwater glow light ───────────────────────────────────────── */}
      <pointLight
        position={[0, -2.5, 0]}
        color="#70D1D8"
        intensity={0.45}
        distance={46}
        decay={2}
      />
    </group>
  );
}
