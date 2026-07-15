import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  cliffMaterial,
  grassMaterial,
  pathMaterial,
  sandMaterial,
} from './materials';

interface SculptedIslandProps {
  position: [number, number, number];
  radiusTop: number;
  radiusBottom: number;
  height: number;
  segments?: number;
  seed?: number;
  irregularity?: number;
  scaleX?: number;
  scaleZ?: number;
  topMaterial?: THREE.Material;
}

function coastRadius(angle: number, radius: number, seed: number, irregularity: number) {
  const broadCoves = Math.sin(angle * 2 + seed * 0.43) * 0.46;
  const headlands = Math.sin(angle * 3 - seed * 0.27) * 0.28;
  const smallBays = Math.cos(angle * 5 + seed * 0.61) * 0.18;
  const rockyNotches = Math.sin(angle * 7 - seed * 0.11) * 0.08;
  return radius * (1 + (broadCoves + headlands + smallBays + rockyNotches) * irregularity);
}

export function SculptedIsland({
  position,
  radiusTop,
  radiusBottom,
  height,
  segments = 96,
  seed = 0,
  irregularity = 0.04,
  scaleX = 1,
  scaleZ = 1,
  topMaterial = grassMaterial,
}: SculptedIslandProps) {
  const geometry = useMemo(() => {
    const result = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 4, false);
    const positions = result.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const angle = Math.atan2(z, x);
      const sourceRadius = Math.hypot(x, z);
      const edgeVariation = sourceRadius > 0
        ? coastRadius(angle, sourceRadius, seed, irregularity) / sourceRadius
        : 1;
      const ledge = 1 + (0.5 - Math.abs(y / height)) * 0.012;
      positions.setXYZ(
        i,
        x * edgeVariation * ledge * scaleX,
        y,
        z * edgeVariation * ledge * scaleZ,
      );
    }

    positions.needsUpdate = true;
    result.computeVertexNormals();
    return result;
  }, [height, irregularity, radiusBottom, radiusTop, scaleX, scaleZ, seed, segments]);

  const materials = useMemo(
    () => [cliffMaterial, topMaterial, cliffMaterial],
    [topMaterial],
  );

  return (
    <mesh
      geometry={geometry}
      material={materials}
      position={position}
      castShadow
      receiveShadow
    />
  );
}

interface TerrainMoundProps {
  position: [number, number, number];
  radiusX: number;
  radiusZ: number;
  height: number;
  seed?: number;
  material?: THREE.Material;
}

export function TerrainMound({
  position,
  radiusX,
  radiusZ,
  height,
  seed = 0,
  material = grassMaterial,
}: TerrainMoundProps) {
  const geometry = useMemo(() => {
    const segments = 64;
    const rings = 14;
    const vertices: number[] = [0, height, 0];
    const uvs: number[] = [0.5, 0.5];
    const indices: number[] = [];

    for (let ring = 1; ring <= rings; ring += 1) {
      const progress = ring / rings;
      const slopeProgress = THREE.MathUtils.clamp((progress - 0.22) / 0.78, 0, 1);
      const smoothSlope = slopeProgress * slopeProgress * (3 - 2 * slopeProgress);
      const easedHeight = (1 - smoothSlope) * height;

      for (let segment = 0; segment < segments; segment += 1) {
        const angle = (segment / segments) * Math.PI * 2;
        const edgeVariation = 1 + (
          Math.sin(angle * 3 + seed) * 0.035 +
          Math.cos(angle * 5 - seed * 0.4) * 0.018
        ) * progress;
        const x = Math.cos(angle) * radiusX * progress * edgeVariation;
        const z = Math.sin(angle) * radiusZ * progress * edgeVariation;
        vertices.push(x, easedHeight + 0.015, z);
        uvs.push(0.5 + x / (radiusX * 2), 0.5 + z / (radiusZ * 2));
      }
    }

    for (let segment = 0; segment < segments; segment += 1) {
      indices.push(0, 1 + ((segment + 1) % segments), 1 + segment);
    }

    for (let ring = 1; ring < rings; ring += 1) {
      const current = 1 + (ring - 1) * segments;
      const next = current + segments;
      for (let segment = 0; segment < segments; segment += 1) {
        const nextSegment = (segment + 1) % segments;
        indices.push(
          current + segment,
          current + nextSegment,
          next + segment,
          current + nextSegment,
          next + nextSegment,
          next + segment,
        );
      }
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    result.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, [height, radiusX, radiusZ, seed]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      castShadow
      receiveShadow
    />
  );
}

interface CurvedPathProps {
  points: [number, number, number][];
  width?: number;
  y?: number;
}

export function CurvedPath({ points, width = 5, y = 0.04 }: CurvedPathProps) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, pointY, z]) => new THREE.Vector3(x, pointY + y, z)),
      false,
      'catmullrom',
      0.35,
    );
    const samples = Math.max(16, points.length * 12);
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const lateral = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const edgeSoftening = Math.sin(Math.PI * t) * 0.08;
      const halfWidth = width * (0.5 + edgeSoftening);
      const left = point.clone().addScaledVector(lateral, halfWidth);
      const right = point.clone().addScaledVector(lateral, -halfWidth);
      vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, t * 5, 1, t * 5);

      if (i < samples) {
        const base = i * 2;
        indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      }
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    result.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, [points, width, y]);

  return <mesh geometry={geometry} material={pathMaterial} receiveShadow />;
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

interface ScatterPoint {
  position: THREE.Vector3;
  rotation: number;
  scale: number;
  tint: THREE.Color;
}

interface ScatterCluster {
  x: number;
  z: number;
  radius: number;
}

const GROUND_COVER_CLUSTERS: ScatterCluster[] = [
  { x: -35, z: -25, radius: 8 },
  { x: 35, z: -27, radius: 8 },
  { x: 38, z: 17, radius: 8 },
  { x: 27, z: 35, radius: 7 },
  { x: -29, z: 34, radius: 8 },
  { x: -39, z: 10, radius: 7 },
];

function makeClusteredScatter(count: number, seed: number, radiusScale = 1) {
  const random = mulberry32(seed);
  const result: ScatterPoint[] = [];

  while (result.length < count) {
    const cluster = GROUND_COVER_CLUSTERS[Math.floor(random() * GROUND_COVER_CLUSTERS.length)];
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * cluster.radius * radiusScale;
    const x = cluster.x + Math.cos(angle) * radius;
    const z = cluster.z + Math.sin(angle) * radius;

    result.push({
      position: new THREE.Vector3(x, 0.12, z),
      rotation: random() * Math.PI * 2,
      scale: THREE.MathUtils.lerp(0.45, 1.25, random()),
      tint: new THREE.Color().setHSL(
        THREE.MathUtils.lerp(0.23, 0.31, random()),
        THREE.MathUtils.lerp(0.28, 0.48, random()),
        THREE.MathUtils.lerp(0.26, 0.44, random()),
      ),
    });
  }
  return result;
}

export function LandscapeDetail() {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const rockRef = useRef<THREE.InstancedMesh>(null);
  // Keep the island edges alive without letting background scatter compete with
  // the village routes and the quest spaces.
  const grass = useMemo(() => makeClusteredScatter(96, 1138), []);
  const rocks = useMemo(() => makeClusteredScatter(16, 7331, 0.8), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (grassRef.current) {
      grass.forEach((point, index) => {
        dummy.position.copy(point.position);
        dummy.rotation.set(0, point.rotation, 0);
        dummy.scale.set(point.scale * 0.5, point.scale, point.scale * 0.5);
        dummy.updateMatrix();
        grassRef.current!.setMatrixAt(index, dummy.matrix);
        grassRef.current!.setColorAt(index, point.tint);
      });
      grassRef.current.instanceMatrix.needsUpdate = true;
      if (grassRef.current.instanceColor) grassRef.current.instanceColor.needsUpdate = true;
    }

    if (rockRef.current) {
      rocks.forEach((point, index) => {
        dummy.position.set(point.position.x, 0.16, point.position.z);
        dummy.rotation.set(point.rotation * 0.15, point.rotation, point.rotation * 0.08);
        dummy.scale.setScalar(point.scale * 0.34);
        dummy.updateMatrix();
        rockRef.current!.setMatrixAt(index, dummy.matrix);
      });
      rockRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, grass, rocks]);

  return (
    <group>
      <instancedMesh ref={grassRef} args={[undefined, undefined, grass.length]} castShadow receiveShadow>
        <coneGeometry args={[0.12, 0.72, 3]} />
        <meshStandardMaterial vertexColors roughness={0.96} color="#ffffff" />
      </instancedMesh>
      <instancedMesh ref={rockRef} args={[undefined, undefined, rocks.length]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#756f63" roughness={0.96} bumpMap={cliffMaterial.bumpMap} bumpScale={0.25} />
      </instancedMesh>
    </group>
  );
}

interface ShorelineProps {
  innerRadius?: number;
  outerRadius?: number;
  seed?: number;
  irregularity?: number;
  scaleX?: number;
  scaleZ?: number;
}

export function Shoreline({
  innerRadius = 49.5,
  outerRadius = 55.4,
  seed = 0,
  irregularity = 0.04,
  scaleX = 1,
  scaleZ = 1,
}: ShorelineProps) {
  const geometry = useMemo(() => {
    const segments = 160;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let segment = 0; segment <= segments; segment += 1) {
      const progress = segment / segments;
      const angle = progress * Math.PI * 2;
      const inner = coastRadius(angle, innerRadius, seed, irregularity);
      const outer = coastRadius(angle, outerRadius, seed, irregularity);
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      vertices.push(
        cosine * inner * scaleX, 0, sine * inner * scaleZ,
        cosine * outer * scaleX, 0, sine * outer * scaleZ,
      );
      uvs.push(0, progress * 8, 1, progress * 8);

      if (segment < segments) {
        const base = segment * 2;
        indices.push(base, base + 2, base + 1, base + 2, base + 3, base + 1);
      }
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    result.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, [innerRadius, irregularity, outerRadius, scaleX, scaleZ, seed]);

  return (
    <mesh geometry={geometry} position={[0, 0.012, 0]} material={sandMaterial} receiveShadow />
  );
}
