import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimalProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    color?: string;
    pathRadius?: number;
    speed?: number;
    heightOffset?: number;
}

/* ─────────────────────────  SEAGULL  ───────────────────────── */
export function Seagull({ position = [0, 5, 0], scale = 1, pathRadius = 10, speed = 1, heightOffset = 0 }: AnimalProps) {
    const groupRef = useRef<THREE.Group>(null);
    const leftWingRef = useRef<THREE.Group>(null);
    const rightWingRef = useRef<THREE.Group>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const t = time + initialOffset;

        if (groupRef.current) {
            // Circular flight path
            const angle = t * speed;
            groupRef.current.position.x = position[0] + Math.cos(angle) * pathRadius;
            groupRef.current.position.z = position[2] + Math.sin(angle) * pathRadius;
            // Gentle altitude variation
            groupRef.current.position.y = position[1] + heightOffset + Math.sin(t * 1.5) * 0.5;
            // Face tangent to circle
            groupRef.current.rotation.y = -angle;
            // Slight banking on turns
            groupRef.current.rotation.z = Math.cos(t * speed) * 0.08;
        }

        // Wing flapping with occasional glide
        if (leftWingRef.current && rightWingRef.current) {
            // Glide cycle: reduce flap every ~4 seconds for ~1 second
            const glidePhase = Math.sin(t * 0.8);
            const flapAmplitude = glidePhase > 0.6 ? 0.1 : 0.45; // reduced during glide
            const flapSpeed = glidePhase > 0.6 ? 4 : 10;
            const flap = Math.sin(t * flapSpeed) * flapAmplitude;
            leftWingRef.current.rotation.z = flap;
            rightWingRef.current.rotation.z = -flap;
        }
    });

    return (
        <group ref={groupRef} scale={scale}>
            {/* Body — capsule shape */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.08, 0.3, 6, 8]} />
                <meshStandardMaterial color="#FDFBF7" roughness={0.6} />
            </mesh>
            {/* Belly shading */}
            <mesh position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <capsuleGeometry args={[0.065, 0.2, 5, 7]} />
                <meshStandardMaterial color="#E8DCC4" roughness={0.7} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.04, 0.2]} castShadow>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color="#FDFBF7" roughness={0.6} />
            </mesh>
            {/* Eyes */}
            <mesh position={[0.04, 0.06, 0.25]}>
                <sphereGeometry args={[0.012, 5, 5]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            <mesh position={[-0.04, 0.06, 0.25]}>
                <sphereGeometry args={[0.012, 5, 5]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            {/* Beak */}
            <mesh position={[0, 0.02, 0.3]} rotation={[-Math.PI / 2 + 0.3, 0, 0]} castShadow>
                <coneGeometry args={[0.025, 0.12, 4]} />
                <meshStandardMaterial color="#E8A95B" />
            </mesh>
            {/* Beak tip */}
            <mesh position={[0, 0.0, 0.36]} rotation={[-Math.PI / 2 + 0.3, 0, 0]}>
                <coneGeometry args={[0.012, 0.04, 4]} />
                <meshStandardMaterial color="#D9773F" />
            </mesh>

            {/* Left wing assembly */}
            <group position={[-0.08, 0.02, 0]}>
                <group ref={leftWingRef}>
                    {/* Inner wing */}
                    <mesh position={[-0.15, 0, 0]} castShadow>
                        <boxGeometry args={[0.28, 0.025, 0.18]} />
                        <meshStandardMaterial color="#FDFBF7" />
                    </mesh>
                    {/* Outer wing (tip) */}
                    <mesh position={[-0.32, 0.01, -0.02]} castShadow>
                        <boxGeometry args={[0.12, 0.02, 0.12]} />
                        <meshStandardMaterial color="#E8DCC4" />
                    </mesh>
                    {/* Wing tip dark marking */}
                    <mesh position={[-0.36, 0.015, -0.03]}>
                        <boxGeometry args={[0.06, 0.015, 0.08]} />
                        <meshStandardMaterial color="#5C5C5C" />
                    </mesh>
                </group>
            </group>

            {/* Right wing assembly */}
            <group position={[0.08, 0.02, 0]}>
                <group ref={rightWingRef}>
                    <mesh position={[0.15, 0, 0]} castShadow>
                        <boxGeometry args={[0.28, 0.025, 0.18]} />
                        <meshStandardMaterial color="#FDFBF7" />
                    </mesh>
                    <mesh position={[0.32, 0.01, -0.02]} castShadow>
                        <boxGeometry args={[0.12, 0.02, 0.12]} />
                        <meshStandardMaterial color="#E8DCC4" />
                    </mesh>
                    <mesh position={[0.36, 0.015, -0.03]}>
                        <boxGeometry args={[0.06, 0.015, 0.08]} />
                        <meshStandardMaterial color="#5C5C5C" />
                    </mesh>
                </group>
            </group>

            {/* Tail feathers */}
            <mesh position={[0, 0.02, -0.22]} rotation={[0.2, 0, 0]} castShadow>
                <coneGeometry args={[0.04, 0.12, 4]} />
                <meshStandardMaterial color="#FDFBF7" />
            </mesh>
            <mesh position={[-0.02, 0.025, -0.25]} rotation={[0.3, 0.15, 0]} castShadow>
                <coneGeometry args={[0.025, 0.08, 3]} />
                <meshStandardMaterial color="#E8DCC4" />
            </mesh>
            <mesh position={[0.02, 0.025, -0.25]} rotation={[0.3, -0.15, 0]} castShadow>
                <coneGeometry args={[0.025, 0.08, 3]} />
                <meshStandardMaterial color="#E8DCC4" />
            </mesh>

            {/* Feet — tucked underneath */}
            {[-0.03, 0.03].map((x, i) => (
                <group key={`foot-${i}`} position={[x, -0.08, -0.05]}>
                    <mesh rotation={[0.4, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.008, 0.008, 0.06, 4]} />
                        <meshStandardMaterial color="#E8A95B" />
                    </mesh>
                    {/* Foot paddle */}
                    <mesh position={[0, -0.035, 0.015]}>
                        <boxGeometry args={[0.025, 0.006, 0.03]} />
                        <meshStandardMaterial color="#E8A95B" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* ─────────────────────────  CRAB  ───────────────────────── */
export function Crab({ position = [0, 0, 0], scale = 1, color = "#D93D4A" }: AnimalProps) {
    const groupRef = useRef<THREE.Group>(null);
    const leftClawRef = useRef<THREE.Group>(null);
    const rightClawRef = useRef<THREE.Group>(null);
    const legRefs = useRef<(THREE.Group | null)[]>([]);
    const bubbleRefs = useRef<(THREE.Mesh | null)[]>([]);

    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const startPos = useRef(new THREE.Vector3(...position));
    const bubbleSeeds = useMemo(() => [
        Math.random() * 10,
        Math.random() * 10 + 3,
        Math.random() * 10 + 7,
    ], []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const t = time + initialOffset;

        if (groupRef.current) {
            // Side-to-side scurry
            groupRef.current.position.z = startPos.current.z + Math.sin(t * 3) * 0.3;
            // Little hops
            groupRef.current.position.y = startPos.current.y + Math.abs(Math.sin(t * 6)) * 0.04;
        }

        // Claw snapping
        if (leftClawRef.current) {
            leftClawRef.current.rotation.z = Math.sin(t * 4) * 0.2;
        }
        if (rightClawRef.current) {
            rightClawRef.current.rotation.z = -Math.sin(t * 4 + 1) * 0.2;
        }

        // Leg wiggling
        legRefs.current.forEach((ref, i) => {
            if (ref) {
                const side = i < 3 ? 1 : -1;
                ref.rotation.z = Math.sin(t * 8 + i * 1.5) * 0.15 * side;
            }
        });

        // Bubble particles — float up periodically
        bubbleRefs.current.forEach((ref, i) => {
            if (ref) {
                const seed = bubbleSeeds[i];
                // Each bubble has its own cycle: ~8 second period
                const cycle = ((time + seed) % 8) / 8;
                if (cycle < 0.3) {
                    // Visible and rising
                    const progress = cycle / 0.3;
                    ref.position.y = 0.15 + progress * 0.4;
                    ref.position.x = Math.sin(progress * 4 + seed) * 0.03;
                    const s = (1 - progress) * 0.012;
                    ref.scale.set(s / 0.012, s / 0.012, s / 0.012);
                    ref.visible = true;
                } else {
                    ref.visible = false;
                }
            }
        });
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Body — rounded shell */}
            <mesh position={[0, 0.06, 0]} castShadow>
                <sphereGeometry args={[0.1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={color} flatShading />
            </mesh>
            {/* Body bottom */}
            <mesh position={[0, 0.05, 0]} castShadow>
                <boxGeometry args={[0.18, 0.06, 0.14]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Shell pattern dot */}
            <mesh position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.025, 5, 5]} />
                <meshStandardMaterial color="#B82D3A" />
            </mesh>

            {/* Eye stalks */}
            {[-0.05, 0.05].map((x, i) => (
                <group key={`eye-${i}`} position={[x, 0.1, 0.06]}>
                    {/* Stalk */}
                    <mesh castShadow>
                        <cylinderGeometry args={[0.008, 0.01, 0.06, 5]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    {/* Eye ball */}
                    <mesh position={[0, 0.04, 0]}>
                        <sphereGeometry args={[0.015, 6, 6]} />
                        <meshStandardMaterial color="#FDFBF7" />
                    </mesh>
                    {/* Pupil */}
                    <mesh position={[0, 0.04, 0.012]}>
                        <sphereGeometry args={[0.008, 5, 5]} />
                        <meshStandardMaterial color="#211814" />
                    </mesh>
                </group>
            ))}

            {/* Left claw */}
            <group ref={leftClawRef} position={[-0.1, 0.06, 0.08]}>
                {/* Arm */}
                <mesh position={[-0.04, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
                    <capsuleGeometry args={[0.015, 0.05, 4, 5]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Pincer top */}
                <mesh position={[-0.08, 0.01, 0]} castShadow>
                    <boxGeometry args={[0.06, 0.02, 0.03]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Pincer bottom */}
                <mesh position={[-0.08, -0.01, 0]} castShadow>
                    <boxGeometry args={[0.05, 0.015, 0.025]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>

            {/* Right claw */}
            <group ref={rightClawRef} position={[0.1, 0.06, 0.08]}>
                <mesh position={[0.04, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
                    <capsuleGeometry args={[0.015, 0.05, 4, 5]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0.08, 0.01, 0]} castShadow>
                    <boxGeometry args={[0.06, 0.02, 0.03]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0.08, -0.01, 0]} castShadow>
                    <boxGeometry args={[0.05, 0.015, 0.025]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>

            {/* Legs — 3 pairs */}
            {[0, 1, 2].map((i) => {
                const zOff = -0.02 + i * -0.035;
                return (
                    <group key={`legs-${i}`}>
                        {/* Left leg */}
                        <group
                            ref={(el) => { legRefs.current[i] = el; }}
                            position={[-0.09, 0.03, zOff]}
                        >
                            <mesh rotation={[0, 0, 0.5]} castShadow>
                                <capsuleGeometry args={[0.007, 0.06, 3, 5]} />
                                <meshStandardMaterial color={color} />
                            </mesh>
                        </group>
                        {/* Right leg */}
                        <group
                            ref={(el) => { legRefs.current[i + 3] = el; }}
                            position={[0.09, 0.03, zOff]}
                        >
                            <mesh rotation={[0, 0, -0.5]} castShadow>
                                <capsuleGeometry args={[0.007, 0.06, 3, 5]} />
                                <meshStandardMaterial color={color} />
                            </mesh>
                        </group>
                    </group>
                );
            })}

            {/* Bubble particles */}
            {[0, 1, 2].map((i) => (
                <mesh
                    key={`bubble-${i}`}
                    ref={(el) => { bubbleRefs.current[i] = el; }}
                    position={[0, 0.15, 0.05]}
                    visible={false}
                >
                    <sphereGeometry args={[0.012, 6, 6]} />
                    <meshStandardMaterial
                        color="#A8C8D9"
                        transparent
                        opacity={0.4}
                    />
                </mesh>
            ))}
        </group>
    );
}

/* ─────────────────────────  BUTTERFLY  ───────────────────────── */
export function Butterfly({ position = [0, 1, 0], scale = 1, color = "#FFB870" }: AnimalProps) {
    const groupRef = useRef<THREE.Group>(null);
    const leftWingRef = useRef<THREE.Group>(null);
    const rightWingRef = useRef<THREE.Group>(null);

    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const startPos = useRef(new THREE.Vector3(...position));
    // Subtle random variation seeds for organic flight
    const drift = useMemo(() => ({
        a: 0.7 + Math.random() * 0.6,
        b: 0.5 + Math.random() * 0.4,
        c: 0.6 + Math.random() * 0.5,
    }), []);

    // Derive a slightly different secondary wing color
    const secondaryColor = useMemo(() => {
        const c = new THREE.Color(color);
        c.offsetHSL(0.05, -0.1, 0.08);
        return '#' + c.getHexString();
    }, [color]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const t = time + initialOffset;

        if (groupRef.current) {
            // Organic flight path with multiple sine waves
            groupRef.current.position.x = startPos.current.x +
                Math.sin(t * drift.a) * 0.5 +
                Math.sin(t * 2.3) * 0.1;
            groupRef.current.position.y = startPos.current.y +
                Math.sin(t * 2 * drift.b) * 0.2 +
                Math.cos(t * 1.1) * 0.08;
            groupRef.current.position.z = startPos.current.z +
                Math.cos(t * 0.8 * drift.c) * 0.5 +
                Math.sin(t * 1.7) * 0.12;

            // Face direction of movement
            groupRef.current.rotation.y = t * drift.a;
            // Slight body tilt when turning
            groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.15;
        }

        // Wing flap
        if (leftWingRef.current && rightWingRef.current) {
            const flap = Math.abs(Math.sin(t * 14)) * (Math.PI / 3.5);
            leftWingRef.current.rotation.z = flap;
            rightWingRef.current.rotation.z = -flap;
        }
    });

    return (
        <group ref={groupRef} scale={scale}>
            {/* Body */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.008, 0.06, 4, 5]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0, 0.04]} castShadow>
                <sphereGeometry args={[0.012, 5, 5]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            {/* Antennae */}
            <mesh position={[-0.01, 0.01, 0.05]} rotation={[-0.5, -0.3, 0]} castShadow>
                <cylinderGeometry args={[0.002, 0.002, 0.05, 3]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            <mesh position={[0.01, 0.01, 0.05]} rotation={[-0.5, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.002, 0.002, 0.05, 3]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            {/* Antenna tips */}
            <mesh position={[-0.022, 0.035, 0.065]}>
                <sphereGeometry args={[0.004, 4, 4]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            <mesh position={[0.022, 0.035, 0.065]}>
                <sphereGeometry args={[0.004, 4, 4]} />
                <meshStandardMaterial color="#211814" />
            </mesh>

            {/* Left wing group */}
            <group position={[-0.008, 0, 0]}>
                <group ref={leftWingRef}>
                    {/* Outer wing layer */}
                    <mesh position={[-0.05, 0, 0.01]} castShadow>
                        <planeGeometry args={[0.1, 0.08]} />
                        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Inner wing layer — slightly different color, slightly offset */}
                    <mesh position={[-0.045, 0.002, 0.008]}>
                        <planeGeometry args={[0.08, 0.06]} />
                        <meshStandardMaterial color={secondaryColor} side={THREE.DoubleSide} transparent opacity={0.85} />
                    </mesh>
                    {/* Wing pattern dots */}
                    <mesh position={[-0.04, 0.003, 0.015]}>
                        <sphereGeometry args={[0.006, 4, 4]} />
                        <meshStandardMaterial color="#211814" />
                    </mesh>
                    <mesh position={[-0.06, 0.003, 0.005]}>
                        <sphereGeometry args={[0.004, 4, 4]} />
                        <meshStandardMaterial color="#FDFBF7" />
                    </mesh>
                </group>
            </group>

            {/* Right wing group */}
            <group position={[0.008, 0, 0]}>
                <group ref={rightWingRef}>
                    <mesh position={[0.05, 0, 0.01]} castShadow>
                        <planeGeometry args={[0.1, 0.08]} />
                        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0.045, 0.002, 0.008]}>
                        <planeGeometry args={[0.08, 0.06]} />
                        <meshStandardMaterial color={secondaryColor} side={THREE.DoubleSide} transparent opacity={0.85} />
                    </mesh>
                    <mesh position={[0.04, 0.003, 0.015]}>
                        <sphereGeometry args={[0.006, 4, 4]} />
                        <meshStandardMaterial color="#211814" />
                    </mesh>
                    <mesh position={[0.06, 0.003, 0.005]}>
                        <sphereGeometry args={[0.004, 4, 4]} />
                        <meshStandardMaterial color="#FDFBF7" />
                    </mesh>
                </group>
            </group>
        </group>
    );
}

/* ─────────────────────────  FISH  ───────────────────────── */
export function Fish({ position = [0, 0, 0], scale = 1, color = "#89C4D9" }: AnimalProps) {
    const groupRef = useRef<THREE.Group>(null);
    const initialDelay = useMemo(() => Math.random() * 8, []);
    const jumpPeriod = useMemo(() => 6 + Math.random() * 4, []); // 6-10 seconds

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (!groupRef.current) return;

        // Phase in the jump cycle
        const cycleTime = ((time + initialDelay) % jumpPeriod) / jumpPeriod;

        if (cycleTime < 0.2) {
            // Jump phase (0 to 0.2 of the cycle = ~1-2 seconds)
            const jumpProgress = cycleTime / 0.2;
            // Parabolic arc: y = -4*(x-0.5)^2 + 1  goes 0 -> 1 -> 0
            const arcY = -4 * (jumpProgress - 0.5) ** 2 + 1;
            groupRef.current.position.y = position[1] - 0.3 + arcY * 1.2;
            // Move forward during jump
            groupRef.current.position.z = position[2] + (jumpProgress - 0.5) * 0.5;
            // Rotation: flip forward during jump
            groupRef.current.rotation.x = -jumpProgress * Math.PI * 0.6;
            groupRef.current.visible = true;
        } else {
            // Underwater — hidden
            groupRef.current.position.y = position[1] - 0.5;
            groupRef.current.rotation.x = 0;
            groupRef.current.visible = false;
        }
    });

    return (
        <group ref={groupRef} position={[position[0], position[1] - 0.5, position[2]]} scale={scale}>
            {/* Body */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <capsuleGeometry args={[0.05, 0.12, 6, 8]} />
                <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
            </mesh>
            {/* Belly */}
            <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.035, 0.08, 5, 6]} />
                <meshStandardMaterial color="#C8DDE8" metalness={0.2} roughness={0.5} />
            </mesh>
            {/* Tail fin */}
            <mesh position={[0, 0, -0.1]} rotation={[0, 0, Math.PI / 4]} castShadow>
                <boxGeometry args={[0.08, 0.08, 0.01]} />
                <meshStandardMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
            {/* Tail fin 2 */}
            <mesh position={[0, 0, -0.1]} rotation={[0, 0, -Math.PI / 4]} castShadow>
                <boxGeometry args={[0.08, 0.08, 0.01]} />
                <meshStandardMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
            {/* Dorsal fin */}
            <mesh position={[0, 0.06, -0.02]} rotation={[0.2, 0, 0]} castShadow>
                <coneGeometry args={[0.03, 0.05, 3]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Side fins */}
            <mesh position={[-0.045, -0.01, 0.02]} rotation={[0, 0, 0.5]} castShadow>
                <boxGeometry args={[0.04, 0.02, 0.03]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.045, -0.01, 0.02]} rotation={[0, 0, -0.5]} castShadow>
                <boxGeometry args={[0.04, 0.02, 0.03]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Eye */}
            <mesh position={[0.035, 0.015, 0.06]}>
                <sphereGeometry args={[0.01, 5, 5]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            <mesh position={[-0.035, 0.015, 0.06]}>
                <sphereGeometry args={[0.01, 5, 5]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            {/* Scales shimmer — tiny highlights */}
            {[0.02, -0.01, -0.04].map((z, i) => (
                <mesh key={`scale-${i}`} position={[0.04, 0.01, z]}>
                    <sphereGeometry args={[0.005, 3, 3]} />
                    <meshStandardMaterial color="#FDFBF7" metalness={0.5} transparent opacity={0.4} />
                </mesh>
            ))}
        </group>
    );
}

/* ─────────────────────────  FROG  ───────────────────────── */
export function Frog({ position = [0, 0, 0], scale = 1, color = "#4A9B6B" }: AnimalProps) {
    const groupRef = useRef<THREE.Group>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const startPos = useRef(new THREE.Vector3(...position));
    const hopPeriod = useMemo(() => 4 + Math.random() * 4, []); // 4-8 seconds

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (!groupRef.current) return;

        const cycleTime = ((time + initialOffset) % hopPeriod) / hopPeriod;

        if (cycleTime < 0.08) {
            // Hop phase — quick up-down
            const hopProgress = cycleTime / 0.08;
            const arcY = -4 * (hopProgress - 0.5) ** 2 + 1;
            groupRef.current.position.y = startPos.current.y + arcY * 0.12;
            groupRef.current.position.z = startPos.current.z + hopProgress * 0.05;
        } else {
            groupRef.current.position.y = startPos.current.y;
            groupRef.current.position.z = startPos.current.z;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Body */}
            <mesh position={[0, 0.05, 0]} castShadow>
                <sphereGeometry args={[0.06, 7, 7]} />
                <meshStandardMaterial color={color} flatShading />
            </mesh>
            {/* Belly */}
            <mesh position={[0, 0.03, 0.01]}>
                <sphereGeometry args={[0.045, 6, 6]} />
                <meshStandardMaterial color="#8FBF9A" flatShading />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.07, 0.05]} castShadow>
                <sphereGeometry args={[0.04, 7, 7]} />
                <meshStandardMaterial color={color} flatShading />
            </mesh>
            {/* Big eyes on top */}
            {[-0.025, 0.025].map((x, i) => (
                <group key={`eye-${i}`} position={[x, 0.1, 0.06]}>
                    <mesh>
                        <sphereGeometry args={[0.018, 6, 6]} />
                        <meshStandardMaterial color="#FDFBF7" />
                    </mesh>
                    <mesh position={[0, 0, 0.014]}>
                        <sphereGeometry args={[0.009, 5, 5]} />
                        <meshStandardMaterial color="#211814" />
                    </mesh>
                </group>
            ))}
            {/* Mouth line */}
            <mesh position={[0, 0.055, 0.088]}>
                <boxGeometry args={[0.04, 0.003, 0.003]} />
                <meshStandardMaterial color="#3C8259" />
            </mesh>
            {/* Front legs */}
            {[-0.04, 0.04].map((x, i) => (
                <mesh key={`fl-${i}`} position={[x, 0.01, 0.04]} rotation={[0.3, 0, x > 0 ? -0.4 : 0.4]} castShadow>
                    <capsuleGeometry args={[0.01, 0.04, 3, 5]} />
                    <meshStandardMaterial color={color} flatShading />
                </mesh>
            ))}
            {/* Back legs — bigger */}
            {[-0.05, 0.05].map((x, i) => (
                <group key={`bl-${i}`} position={[x, 0.02, -0.04]}>
                    {/* Thigh */}
                    <mesh rotation={[0.8, 0, x > 0 ? -0.3 : 0.3]} castShadow>
                        <capsuleGeometry args={[0.012, 0.04, 3, 5]} />
                        <meshStandardMaterial color={color} flatShading />
                    </mesh>
                    {/* Shin */}
                    <mesh position={[x > 0 ? 0.02 : -0.02, -0.02, 0.02]} rotation={[-0.5, 0, x > 0 ? 0.3 : -0.3]} castShadow>
                        <capsuleGeometry args={[0.01, 0.035, 3, 5]} />
                        <meshStandardMaterial color={color} flatShading />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* ─────────────────────────  DRAGONFLY  ───────────────────────── */
export function Dragonfly({ position = [0, 1.5, 0], scale = 1, color = "#4A8B82" }: AnimalProps) {
    const groupRef = useRef<THREE.Group>(null);
    const wing1Ref = useRef<THREE.Group>(null);
    const wing2Ref = useRef<THREE.Group>(null);
    const wing3Ref = useRef<THREE.Group>(null);
    const wing4Ref = useRef<THREE.Group>(null);

    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);
    const startPos = useRef(new THREE.Vector3(...position));

    // Unique flight parameters
    const drift = useMemo(() => ({
        a: 1.0 + Math.random() * 0.8,
        b: 0.6 + Math.random() * 0.5,
        c: 0.8 + Math.random() * 0.6,
    }), []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const t = time + initialOffset;

        if (groupRef.current) {
            // Darting flight pattern — quick sudden moves with pauses
            const dartX = Math.sin(t * drift.a * 1.8) * 0.8 + Math.sin(t * 3.7) * 0.15;
            const dartZ = Math.cos(t * drift.c * 1.4) * 0.8 + Math.cos(t * 2.9) * 0.2;
            const dartY = Math.sin(t * drift.b * 2.2) * 0.3;

            groupRef.current.position.x = startPos.current.x + dartX;
            groupRef.current.position.z = startPos.current.z + dartZ;
            groupRef.current.position.y = startPos.current.y + dartY;

            // Face movement direction
            groupRef.current.rotation.y = -t * drift.a * 1.5;
            // Body tilt
            groupRef.current.rotation.x = Math.sin(t * 2) * 0.1;
        }

        // Very fast wing flapping — 4 independent wings
        const flapSpeed = 25;
        if (wing1Ref.current) wing1Ref.current.rotation.z = Math.sin(t * flapSpeed) * 0.3;
        if (wing2Ref.current) wing2Ref.current.rotation.z = -Math.sin(t * flapSpeed) * 0.3;
        if (wing3Ref.current) wing3Ref.current.rotation.z = Math.sin(t * flapSpeed + 0.5) * 0.3;
        if (wing4Ref.current) wing4Ref.current.rotation.z = -Math.sin(t * flapSpeed + 0.5) * 0.3;
    });

    return (
        <group ref={groupRef} scale={scale}>
            {/* Long body — segmented */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <capsuleGeometry args={[0.012, 0.1, 5, 6]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
            </mesh>
            {/* Tail / abdomen — longer thin section */}
            <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <capsuleGeometry args={[0.008, 0.12, 4, 5]} />
                <meshStandardMaterial color="#3C7B72" metalness={0.4} roughness={0.4} />
            </mesh>
            {/* Tail tip */}
            <mesh position={[0, 0, -0.18]} castShadow>
                <sphereGeometry args={[0.008, 5, 5]} />
                <meshStandardMaterial color="#2C6B62" metalness={0.3} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0, 0.06]} castShadow>
                <sphereGeometry args={[0.018, 6, 6]} />
                <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
            </mesh>
            {/* Compound eyes — large and bulbous */}
            <mesh position={[-0.015, 0.005, 0.07]}>
                <sphereGeometry args={[0.012, 5, 5]} />
                <meshStandardMaterial color="#4A6B82" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0.015, 0.005, 0.07]}>
                <sphereGeometry args={[0.012, 5, 5]} />
                <meshStandardMaterial color="#4A6B82" metalness={0.5} roughness={0.3} />
            </mesh>

            {/* Front left wing */}
            <group position={[-0.01, 0.01, 0.02]}>
                <group ref={wing1Ref}>
                    <mesh position={[-0.05, 0, 0.01]} castShadow>
                        <planeGeometry args={[0.1, 0.03]} />
                        <meshStandardMaterial
                            color="#A8E8D8"
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.5}
                            metalness={0.3}
                        />
                    </mesh>
                </group>
            </group>
            {/* Front right wing */}
            <group position={[0.01, 0.01, 0.02]}>
                <group ref={wing2Ref}>
                    <mesh position={[0.05, 0, 0.01]} castShadow>
                        <planeGeometry args={[0.1, 0.03]} />
                        <meshStandardMaterial
                            color="#A8E8D8"
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.5}
                            metalness={0.3}
                        />
                    </mesh>
                </group>
            </group>
            {/* Back left wing */}
            <group position={[-0.01, 0.01, -0.02]}>
                <group ref={wing3Ref}>
                    <mesh position={[-0.045, 0, -0.005]} castShadow>
                        <planeGeometry args={[0.09, 0.025]} />
                        <meshStandardMaterial
                            color="#98D8C8"
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.45}
                            metalness={0.3}
                        />
                    </mesh>
                </group>
            </group>
            {/* Back right wing */}
            <group position={[0.01, 0.01, -0.02]}>
                <group ref={wing4Ref}>
                    <mesh position={[0.045, 0, -0.005]} castShadow>
                        <planeGeometry args={[0.09, 0.025]} />
                        <meshStandardMaterial
                            color="#98D8C8"
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.45}
                            metalness={0.3}
                        />
                    </mesh>
                </group>
            </group>
        </group>
    );
}
