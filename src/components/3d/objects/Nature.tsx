import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

const _geoCache = {};
const _matCache = {};

function getGeo(type, args) {
    const key = type + '-' + args.join('-');
    if (!_geoCache[key]) {
        if (type === 'cylinder') _geoCache[key] = new THREE.CylinderGeometry(...args);
        else if (type === 'sphere') _geoCache[key] = new THREE.SphereGeometry(...args);
        else if (type === 'icosahedron') _geoCache[key] = new THREE.IcosahedronGeometry(...args);
        else if (type === 'box') _geoCache[key] = new THREE.BoxGeometry(...args);
        else if (type === 'cone') _geoCache[key] = new THREE.ConeGeometry(...args);
        else if (type === 'dodecahedron') _geoCache[key] = new THREE.DodecahedronGeometry(...args);
        else if (type === 'torus') _geoCache[key] = new THREE.TorusGeometry(...args);
        else if (type === 'circle') _geoCache[key] = new THREE.CircleGeometry(...args);
        else if (type === 'ring') _geoCache[key] = new THREE.RingGeometry(...args);
    }
    return _geoCache[key];
}

function getMat(color: string, roughness = 1, flatShading = false, side: THREE.Side = THREE.FrontSide) {
    const key = color + '-' + roughness + '-' + flatShading + '-' + side;
    if (!_matCache[key]) {
        _matCache[key] = new THREE.MeshStandardMaterial({ 
            color, 
            roughness, 
            flatShading,
            side
        });
    }
    return _matCache[key];
}

interface NatureProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    blossom?: boolean;
    color?: string;
}

/* ─────────────────────────── TREE ─────────────────────────── */
export function Tree({ position = [0, 0, 0], scale = 1, blossom = false }: NatureProps) {
    const leavesRef = useRef<THREE.Group>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const hasFruit = useMemo(() => Math.random() > 0.5 && !blossom, [blossom]);
    const hasNest = useMemo(() => Math.random() > 0.65, []);

    const leafColors = useMemo(() => {
        if (blossom) {
            return ["#FFB7C5", "#FFA1B8", "#FF8DA1", "#FFC0CB", "#FFE4E1"];
        }
        return ["#7C9982", "#4A9B6B", "#3C8259", "#68806D", "#8FA895"];
    }, [blossom]);

    useFrame((state) => {
        if (leavesRef.current) {
            const time = state.clock.elapsedTime;
            leavesRef.current.rotation.y = Math.sin(time * 0.5 + initialOffset) * 0.05;
            leavesRef.current.rotation.z = Math.sin(time * 0.8 + initialOffset) * 0.02;
            leavesRef.current.rotation.x = Math.sin(time * 0.3 + initialOffset * 0.7) * 0.015;
        }
    });

    return (
        <RigidBody type="fixed" colliders="hull" position={position} scale={scale as any}>
        <group>
            {/* Trunk with slight bend */}
            <mesh position={[0, 0.25, 0]} castShadow receiveShadow geometry={getGeo('cylinder', [0.1, 0.18, 0.5])} material={getMat(blossom ? "#8A6D5E" : "#6B5440", 0.95)} />
            <mesh position={[0.03, 0.6, 0.01]} rotation={[0.05, 0, 0.08]} castShadow receiveShadow geometry={getGeo('cylinder', [0.08, 0.12, 0.5])} material={getMat(blossom ? "#73584A" : "#5C4D3C", 0.95)} />

            {/* Exposed root bumps */}
            <mesh position={[0.12, 0.04, 0.08]} castShadow geometry={getGeo('sphere', [0.08, 6, 6])} material={getMat(blossom ? "#73584A" : "#5C4D3C", 1.0)} />
            <mesh position={[-0.1, 0.03, -0.06]} castShadow geometry={getGeo('sphere', [0.07, 6, 6])} material={getMat(blossom ? "#8A6D5E" : "#6B5440", 1.0)} />
            <mesh position={[0.02, 0.03, -0.12]} castShadow geometry={getGeo('sphere', [0.06, 6, 6])} material={getMat(blossom ? "#73584A" : "#5C4D3C", 1.0)} />

            {/* Leaf clusters — 5 clusters with color variation */}
            <group ref={leavesRef}>
                <mesh position={[0, 1.2, 0]} castShadow geometry={getGeo('icosahedron', [0.75, 1])} material={getMat(leafColors[0], 1, true)} />
                <mesh position={[0.35, 1.5, 0.2]} castShadow geometry={getGeo('icosahedron', [0.5, 1])} material={getMat(leafColors[1], 1, true)} />
                <mesh position={[-0.4, 1.0, -0.2]} castShadow geometry={getGeo('icosahedron', [0.6, 1])} material={getMat(leafColors[2], 1, true)} />
                <mesh position={[-0.2, 1.55, 0.3]} castShadow geometry={getGeo('icosahedron', [0.4, 1])} material={getMat(leafColors[3], 1, true)} />
                <mesh position={[0.25, 0.9, -0.35]} castShadow geometry={getGeo('icosahedron', [0.45, 1])} material={getMat(leafColors[4], 1, true)} />

                {/* Fruit / berries on some leaf clusters */}
                {hasFruit && (
                    <>
                        <mesh position={[0.4, 0.95, 0.35]} castShadow geometry={getGeo('sphere', [0.07, 6, 6])} material={getMat("#D93D4A")} />
                        <mesh position={[-0.2, 0.85, 0.15]} castShadow geometry={getGeo('sphere', [0.06, 6, 6])} material={getMat("#D9773F")} />
                        <mesh position={[0.15, 1.05, -0.3]} castShadow geometry={getGeo('sphere', [0.065, 6, 6])} material={getMat("#D93D4A")} />
                    </>
                )}

                {/* Bird's nest tucked into a leaf cluster */}
                {hasNest && (
                    <group position={[-0.3, 1.4, 0.2]} rotation={[0.2, 0.5, 0.1]}>
                        {/* Nest bowl (torus) */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow geometry={getGeo('torus', [0.1, 0.035, 6, 8])} material={getMat("#5C4D3C", 1.0)} />
                        {/* Tiny eggs */}
                        <mesh position={[-0.04, 0.02, 0.02]} castShadow geometry={getGeo('sphere', [0.025, 5, 5])} material={getMat("#C8E6EC")} />
                        <mesh position={[0.03, 0.02, -0.02]} castShadow geometry={getGeo('sphere', [0.025, 5, 5])} material={getMat("#C8E6EC")} />
                        <mesh position={[0.0, 0.02, 0.04]} castShadow geometry={getGeo('sphere', [0.022, 5, 5])} material={getMat("#D4E8ED")} />
                    </group>
                )}
            </group>
        </group>
        </RigidBody>
    );
}

/* ─────────────────────────── PINE TREE ─────────────────────────── */
export function PineTree({ position = [0, 0, 0], scale = 1 }: NatureProps) {
    const leavesRef = useRef<THREE.Group>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        if (leavesRef.current) {
            const time = state.clock.elapsedTime;
            leavesRef.current.rotation.x = Math.sin(time * 0.6 + initialOffset) * 0.03;
            leavesRef.current.rotation.z = Math.cos(time * 0.7 + initialOffset) * 0.03;
            leavesRef.current.rotation.y = Math.sin(time * 0.25 + initialOffset * 1.3) * 0.01;
        }
    });

    return (
        <RigidBody type="fixed" colliders="hull" position={position} scale={scale as any}>
        <group>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow geometry={getGeo('cylinder', [0.12, 0.22, 1])} material={getMat("#2E1F14", 1.0)} />
            <mesh position={[0, 0.3, 0.14]} castShadow geometry={getGeo('box', [0.06, 0.12, 0.04])} material={getMat("#1E1510", 1.0)} />
            <mesh position={[-0.12, 0.6, 0.06]} castShadow geometry={getGeo('box', [0.04, 0.1, 0.04])} material={getMat("#1E1510", 1.0)} />

            <group ref={leavesRef}>
                <mesh position={[0, 1.5, 0]} castShadow geometry={getGeo('cone', [1.2, 1.5, 8])} material={getMat("#3C8259", 1, true)} />
                <mesh position={[0, 2.2, 0]} castShadow geometry={getGeo('cone', [0.9, 1.2, 8])} material={getMat("#4A9B6B", 1, true)} />
                <mesh position={[0, 3.0, 0]} castShadow geometry={getGeo('cone', [0.6, 1.0, 8])} material={getMat("#A0C4A8", 1, true)} />
                <mesh position={[0, 3.55, 0]} castShadow geometry={getGeo('cone', [0.3, 0.3, 6])} material={getMat("#E8EFEC")} />

                <mesh position={[0.8, 1.15, 0.4]} castShadow geometry={getGeo('sphere', [0.08, 6, 6])} material={getMat("#6B5440", 1.0)} />
                <mesh position={[-0.6, 1.2, -0.5]} castShadow geometry={getGeo('sphere', [0.07, 6, 6])} material={getMat("#5C4D3C", 1.0)} />
                <mesh position={[0.3, 1.1, -0.7]} castShadow geometry={getGeo('sphere', [0.065, 6, 6])} material={getMat("#6B5440", 1.0)} />
            </group>
        </group>
        </RigidBody>
    );
}

/* ─────────────────────────── ROCK ─────────────────────────── */
export function Rock({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: NatureProps) {
    return (
        <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation} scale={scale as any}>
        <group>
            <mesh position={[0, 0.3, 0]} rotation={[0.15, 0.3, 0.1]} castShadow receiveShadow geometry={getGeo('dodecahedron', [0.4, 1])} material={getMat("#9B9284", 0.9, true)} />
            <mesh position={[0.25, 0.2, 0.15]} rotation={[0.2, 0.8, -0.1]} castShadow receiveShadow geometry={getGeo('dodecahedron', [0.25, 1])} material={getMat("#827B70", 1.0, true)} />
            <mesh position={[-0.22, 0.15, -0.1]} rotation={[-0.15, 1.2, 0.2]} castShadow receiveShadow geometry={getGeo('dodecahedron', [0.3, 1])} material={getMat("#B2A897", 0.9, true)} />

            <mesh position={[0.05, 0.55, 0.05]} geometry={getGeo('sphere', [0.15, 6, 4])} material={getMat("#4A9B6B", 1, true)} />
            <mesh position={[-0.1, 0.48, -0.08]} geometry={getGeo('sphere', [0.1, 6, 4])} material={getMat("#3C8259", 1, true)} />
            <mesh position={[0.2, 0.38, 0.15]} geometry={getGeo('sphere', [0.08, 5, 4])} material={getMat("#68806D", 1, true)} />

            {/* Ivy vine draped across the top */}
            <mesh position={[-0.05, 0.52, 0.12]} rotation={[0.4, 0.6, 1.2]} castShadow geometry={getGeo('cylinder', [0.015, 0.02, 0.4])} material={getMat("#3C8259")} />

            <mesh position={[0.35, 0.04, 0.25]} castShadow geometry={getGeo('dodecahedron', [0.06, 0])} material={getMat("#9B9284", 1.0)} />
            <mesh position={[-0.3, 0.04, 0.2]} castShadow geometry={getGeo('dodecahedron', [0.05, 0])} material={getMat("#827B70", 1.0)} />
            <mesh position={[0.15, 0.03, -0.3]} castShadow geometry={getGeo('dodecahedron', [0.04, 0])} material={getMat("#B2A897", 1.0)} />
            <mesh position={[-0.1, 0.03, 0.32]} castShadow geometry={getGeo('dodecahedron', [0.045, 0])} material={getMat("#9B9284", 1.0)} />
        </group>
        </RigidBody>
    );
}

/* ─────────────────────────── BUSH ─────────────────────────── */
export function Bush({ position = [0, 0, 0], scale = 1 }: NatureProps) {
    return (
        <RigidBody type="fixed" colliders="hull" position={position} scale={scale as any}>
        <group>
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow geometry={getGeo('icosahedron', [0.4, 1])} material={getMat("#4A9B6B", 1, true)} />
            <mesh position={[0.22, 0.22, 0.18]} castShadow receiveShadow geometry={getGeo('icosahedron', [0.3, 1])} material={getMat("#3C8259", 1, true)} />
            <mesh position={[-0.2, 0.25, -0.1]} castShadow receiveShadow geometry={getGeo('icosahedron', [0.35, 1])} material={getMat("#7C9982", 1, true)} />
            <mesh position={[0.1, 0.15, -0.22]} castShadow receiveShadow geometry={getGeo('icosahedron', [0.25, 1])} material={getMat("#68806D", 1, true)} />
            <mesh position={[-0.12, 0.35, 0.15]} castShadow receiveShadow geometry={getGeo('icosahedron', [0.22, 1])} material={getMat("#8FA895", 1, true)} />

            <mesh position={[0.18, 0.5, 0.12]} castShadow geometry={getGeo('sphere', [0.04, 5, 5])} material={getMat("#D93D4A")} />
            <mesh position={[0.22, 0.48, 0.08]} castShadow geometry={getGeo('sphere', [0.035, 5, 5])} material={getMat("#D93D4A")} />
            <mesh position={[-0.15, 0.45, -0.05]} castShadow geometry={getGeo('sphere', [0.04, 5, 5])} material={getMat("#8B3A8B")} />
            <mesh position={[-0.1, 0.43, -0.08]} castShadow geometry={getGeo('sphere', [0.035, 5, 5])} material={getMat("#8B3A8B")} />
            <mesh position={[0.05, 0.47, -0.18]} castShadow geometry={getGeo('sphere', [0.038, 5, 5])} material={getMat("#D93D4A")} />

            <mesh position={[-0.08, 0.55, 0.1]} castShadow geometry={getGeo('sphere', [0.06, 6, 6])} material={getMat("#FDFBF7")} />
            <mesh position={[-0.08, 0.56, 0.1]} castShadow geometry={getGeo('sphere', [0.025, 5, 5])} material={getMat("#E8A95B")} />
            <mesh position={[0.12, 0.52, -0.06]} castShadow geometry={getGeo('sphere', [0.05, 6, 6])} material={getMat("#F6E5C8")} />
            <mesh position={[0.12, 0.53, -0.06]} castShadow geometry={getGeo('sphere', [0.02, 5, 5])} material={getMat("#E8A95B")} />
        </group>
        </RigidBody>
    );
}

/* ─────────────────────────── FLOWER BED ─────────────────────────── */
export function FlowerBed({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: NatureProps) {
    const flowerData = useMemo(() => [
        { x: -0.7, z: 0.05, color: '#D93D4A', height: 0.35 },
        { x: -0.4, z: -0.1, color: '#E8A95B', height: 0.4 },
        { x: -0.1, z: 0.08, color: '#FDFBF7', height: 0.45 },
        { x: 0.15, z: -0.05, color: '#D93D4A', height: 0.38 },
        { x: 0.4, z: 0.1, color: '#4A6B82', height: 0.42 },
        { x: 0.6, z: -0.08, color: '#E8A95B', height: 0.36 },
        { x: 0.0, z: -0.15, color: '#D4AF37', height: 0.32 },
    ], []);

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <mesh position={[0, 0.05, 0]} receiveShadow geometry={getGeo('box', [1.8, 0.1, 0.8])} material={getMat("#3C2A1E")} />
            <mesh position={[0, 0.1, 0.45]} castShadow geometry={getGeo('box', [2, 0.2, 0.1])} material={getMat("#8C6B52")} />
            <mesh position={[0, 0.1, -0.45]} castShadow geometry={getGeo('box', [2, 0.2, 0.1])} material={getMat("#8C6B52")} />
            <mesh position={[0.95, 0.1, 0]} castShadow geometry={getGeo('box', [0.1, 0.2, 0.8])} material={getMat("#8C6B52")} />
            <mesh position={[-0.95, 0.1, 0]} castShadow geometry={getGeo('box', [0.1, 0.2, 0.8])} material={getMat("#8C6B52")} />

            <group>
                {flowerData.map((flower, i) => (
                    <group key={i} position={[flower.x, 0.15, flower.z]}>
                        <mesh position={[0, flower.height / 2, 0]} castShadow geometry={getGeo('cylinder', [0.015, 0.02, flower.height])} material={getMat("#4A9B6B")} />
                        <mesh position={[0.04, flower.height * 0.35, 0]} rotation={[0, 0, 0.4]} castShadow geometry={getGeo('box', [0.08, 0.04, 0.02])} material={getMat("#3C8259")} />
                        <mesh position={[0, flower.height + 0.05, 0]} castShadow geometry={getGeo('sphere', [0.1, 8, 8])} material={getMat(flower.color)} />
                        <mesh position={[0, flower.height + 0.1, 0]} castShadow geometry={getGeo('sphere', [0.04, 6, 6])} material={getMat("#E8A95B")} />
                    </group>
                ))}
            </group>

            <group position={[0.75, 0.15, 0]}>
                <mesh position={[0, 0.2, 0]} castShadow geometry={getGeo('box', [0.04, 0.4, 0.02])} material={getMat("#A68A72")} />
                <mesh position={[0, 0.42, 0]} castShadow geometry={getGeo('cone', [0.04, 0.06, 4])} material={getMat("#A68A72")} />
                <mesh position={[0, 0.32, 0.02]} castShadow geometry={getGeo('box', [0.12, 0.08, 0.02])} material={getMat("#F6E5C8")} />
            </group>
        </group>
    );
}

/* ─────────────────────────── TALL GRASS ─────────────────────────── */
export function TallGrass({ position = [0, 0, 0], scale = 1 }: NatureProps) {
    const groupRef = useRef<THREE.Group>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const blades = useMemo(() => {
        const count = 5 + Math.floor(Math.random() * 4); // 5-8 blades
        return Array.from({ length: count }, (_, i) => ({
            x: (Math.random() - 0.5) * 0.3,
            z: (Math.random() - 0.5) * 0.3,
            height: 0.25 + Math.random() * 0.3,
            lean: (Math.random() - 0.5) * 0.3,
            leanZ: (Math.random() - 0.5) * 0.2,
            color: ['#7C9982', '#4A9B6B', '#3C8259', '#68806D', '#8FA895'][i % 5],
        }));
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.elapsedTime;
            groupRef.current.rotation.x = Math.sin(time * 1.2 + initialOffset) * 0.06;
            groupRef.current.rotation.z = Math.sin(time * 0.9 + initialOffset * 0.5) * 0.03;
        }
    });

    return (
        <group position={position} scale={scale}>
            <group ref={groupRef}>
                {blades.map((blade, i) => (
                    <mesh key={i} position={[blade.x, blade.height / 2, blade.z]} rotation={[blade.lean, 0, blade.leanZ]} castShadow geometry={getGeo('cone', [0.02, blade.height, 4])} material={getMat(blade.color, 1, true)} />
                ))}
            </group>
        </group>
    );
}

/* ─────────────────────────── MUSHROOM ─────────────────────────── */
export function Mushroom({ position = [0, 0, 0], scale = 1, color }: NatureProps) {
    const isRed = useMemo(() => {
        if (color) return color === '#D93D4A';
        return Math.random() > 0.4;
    }, [color]);

    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 0.08, 0]} castShadow receiveShadow geometry={getGeo('cylinder', [0.04, 0.06, 0.16, 8])} material={getMat("#F6E5C8", 0.7)} />
            <mesh position={[0, 0.18, 0]} castShadow geometry={getGeo('sphere', [0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55])} material={getMat(isRed ? '#D93D4A' : '#8C6B52', 1, true)} />

            {isRed && (
                <>
                    <mesh position={[0.04, 0.24, 0.06]} geometry={getGeo('sphere', [0.025, 5, 5])} material={getMat("#FDFBF7")} />
                    <mesh position={[-0.06, 0.22, -0.03]} geometry={getGeo('sphere', [0.02, 5, 5])} material={getMat("#FDFBF7")} />
                    <mesh position={[0.01, 0.25, -0.06]} geometry={getGeo('sphere', [0.022, 5, 5])} material={getMat("#FDFBF7")} />
                    <mesh position={[-0.02, 0.24, 0.08]} geometry={getGeo('sphere', [0.018, 5, 5])} material={getMat("#FDFBF7")} />
                </>
            )}

            <mesh position={[0, 0.15, 0]} castShadow geometry={getGeo('cylinder', [0.12, 0.1, 0.02, 8])} material={getMat(isRed ? '#C43040' : '#6B5440')} />
        </group>
    );
}

/* ─────────────────────────── LILY PAD ─────────────────────────── */
interface LilyPadProps extends NatureProps {
    hasFlower?: boolean;
}

export function LilyPad({ position = [0, 0, 0], scale = 1, hasFlower = false }: LilyPadProps) {
    return (
        <group position={position} scale={scale}>
            <group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow geometry={getGeo('circle', [0.2, 12])} material={getMat("#3C8259", 1, true, THREE.DoubleSide)} />
                <mesh position={[0.15, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={getGeo('ring', [0.16, 0.2, 12])} material={getMat("#4A9B6B", 1, false, THREE.DoubleSide)} />
                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={getGeo('circle', [0.03, 6])} material={getMat("#68806D")} />

                {hasFlower && (
                    <group position={[0.05, 0.02, -0.02]}>
                        <mesh position={[0, 0.08, 0]} castShadow geometry={getGeo('cylinder', [0.01, 0.012, 0.16, 6])} material={getMat("#4A9B6B")} />
                        <mesh position={[0, 0.18, 0]} castShadow geometry={getGeo('sphere', [0.06, 6, 6])} material={getMat("#FDFBF7")} />
                        <mesh position={[0.04, 0.17, 0.02]} castShadow geometry={getGeo('sphere', [0.04, 5, 5])} material={getMat("#F6E5C8")} />
                        <mesh position={[-0.03, 0.17, -0.02]} castShadow geometry={getGeo('sphere', [0.04, 5, 5])} material={getMat("#F6E5C8")} />
                        <mesh position={[0, 0.2, 0]} castShadow geometry={getGeo('sphere', [0.025, 5, 5])} material={getMat("#E8A95B")} />
                    </group>
                )}
            </group>
        </group>
    );
}

/* ─────────────────────────── PALM TREE ─────────────────────────── */
export function PalmTree({ position = [0, 0, 0], scale = 1 }: NatureProps) {
    const leavesRef = useRef<THREE.Group>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        if (leavesRef.current) {
            const time = state.clock.elapsedTime;
            leavesRef.current.rotation.y = Math.sin(time * 0.4 + initialOffset) * 0.03;
            leavesRef.current.rotation.z = Math.cos(time * 0.5 + initialOffset) * 0.02;
        }
    });

    return (
        <RigidBody type="fixed" colliders="hull" position={position} scale={scale as any}>
        <group>
            {/* Trunk segments to create a curve */}
            <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow geometry={getGeo('cylinder', [0.12, 0.16, 0.6])} material={getMat("#A68A72", 1.0)} />
            <mesh position={[0.06, 0.8, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow geometry={getGeo('cylinder', [0.1, 0.12, 0.6])} material={getMat("#A68A72", 1.0)} />
            <mesh position={[0.18, 1.3, 0]} rotation={[0, 0, 0.3]} castShadow receiveShadow geometry={getGeo('cylinder', [0.08, 0.1, 0.6])} material={getMat("#A68A72", 1.0)} />

            {/* Coconuts */}
            <mesh position={[0.1, 1.5, 0.15]} castShadow geometry={getGeo('sphere', [0.1, 6, 6])} material={getMat("#5C4D3C", 1.0)} />
            <mesh position={[0.25, 1.45, -0.1]} castShadow geometry={getGeo('sphere', [0.12, 6, 6])} material={getMat("#5C4D3C", 1.0)} />
            <mesh position={[0.3, 1.55, 0.05]} castShadow geometry={getGeo('sphere', [0.1, 6, 6])} material={getMat("#5C4D3C", 1.0)} />

            {/* Fronds — elongated flat leaf shapes */}
            <group ref={leavesRef} position={[0.2, 1.6, 0]}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <mesh key={i} rotation={[1.2, i * ((Math.PI * 2) / 5), 0]} position={[0, 0.2, 0]} castShadow geometry={getGeo('box', [0.08, 0.02, 1.0])} material={getMat(i % 2 === 0 ? "#4A9B6B" : "#3C8259", 1, true)} />
                ))}
                {/* Secondary shorter fronds for fullness */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <mesh key={`inner-${i}`} rotation={[1.0, i * ((Math.PI * 2) / 5) + 0.3, 0]} position={[0, 0.15, 0]} castShadow geometry={getGeo('box', [0.06, 0.02, 0.7])} material={getMat(i % 2 === 0 ? "#68806D" : "#4A9B6B", 1, true)} />
                ))}
            </group>
        </group>
        </RigidBody>
    );
}

/* ─────────────────────────── KELP ─────────────────────────── */
export function Kelp({ position = [0, 0, 0], scale = 1 }: NatureProps) {
    return (
        <group position={position} scale={scale}>
            {/* Base */}
            <mesh position={[0, 0.1, 0]} castShadow geometry={getGeo('sphere', [0.15, 5, 5])} material={getMat("#2C5E43", 1, true)} />
            {/* Wavy segments */}
            <mesh position={[0.05, 0.4, 0]} rotation={[0, 0, -0.2]} geometry={getGeo('cylinder', [0.04, 0.06, 0.6])} material={getMat("#3C8259", 1, true)} />
            <mesh position={[-0.05, 0.9, 0]} rotation={[0, 0, 0.2]} geometry={getGeo('cylinder', [0.03, 0.04, 0.6])} material={getMat("#4A9B6B", 1, true)} />
            <mesh position={[0.05, 1.4, 0]} rotation={[0, 0, -0.1]} geometry={getGeo('cylinder', [0.01, 0.03, 0.6])} material={getMat("#3C8259", 1, true)} />
            
            <mesh position={[-0.15, 0.3, 0.1]} rotation={[0.2, 0, 0.3]} geometry={getGeo('cylinder', [0.03, 0.05, 0.5])} material={getMat("#4A9B6B", 1, true)} />
            <mesh position={[-0.2, 0.7, 0.15]} rotation={[0.1, 0, -0.1]} geometry={getGeo('cylinder', [0.01, 0.03, 0.5])} material={getMat("#2C5E43", 1, true)} />
        </group>
    );
}
