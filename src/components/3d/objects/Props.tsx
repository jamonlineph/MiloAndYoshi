import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CylinderCollider } from '@react-three/rapier';

interface PropProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    color?: string;
}

/* ─────────────────────────  BENCH  ───────────────────────── */
export function Bench({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Seat planks */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.6, 0.08, 0.5]} />
                <meshStandardMaterial color="#6B5440" roughness={0.85} />
            </mesh>
            {/* Wood grain lines on seat */}
            {[-0.5, 0.0, 0.5].map((x, i) => (
                <mesh key={`grain-${i}`} position={[x, 0.441, 0]} castShadow>
                    <boxGeometry args={[0.02, 0.005, 0.48]} />
                    <meshStandardMaterial color="#50402F" roughness={1} />
                </mesh>
            ))}
            {/* Backrest */}
            <mesh position={[0, 0.7, -0.2]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.6, 0.35, 0.05]} />
                <meshStandardMaterial color="#6B5440" roughness={0.85} />
            </mesh>
            {/* Backrest grain */}
            {[-0.4, 0.2].map((x, i) => (
                <mesh key={`bgrain-${i}`} position={[x, 0.7, -0.17]} rotation={[0.1, 0, 0]} castShadow>
                    <boxGeometry args={[0.015, 0.33, 0.005]} />
                    <meshStandardMaterial color="#50402F" roughness={1} />
                </mesh>
            ))}
            {/* Legs */}
            {[-0.6, 0.6].map((x, i) => (
                <mesh key={`leg-${i}`} position={[x, 0.2, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.4, 0.4]} />
                    <meshStandardMaterial color="#3C2A1E" roughness={0.9} />
                </mesh>
            ))}
            {/* Armrests */}
            {[-0.7, 0.7].map((x, i) => (
                <mesh key={`arm-${i}`} position={[x, 0.55, 0.0]} castShadow>
                    <boxGeometry args={[0.12, 0.08, 0.35]} />
                    <meshStandardMaterial color="#5C4D3C" roughness={0.85} />
                </mesh>
            ))}
            {/* Armrest support posts */}
            {[-0.7, 0.7].map((x, i) => (
                <mesh key={`armpost-${i}`} position={[x, 0.48, 0.1]} castShadow>
                    <boxGeometry args={[0.06, 0.12, 0.06]} />
                    <meshStandardMaterial color="#3C2A1E" roughness={0.9} />
                </mesh>
            ))}
            {/* Decorative metal brackets on legs */}
            {[-0.6, 0.6].map((x, i) => (
                <mesh key={`bracket-${i}`} position={[x, 0.38, 0.0]} castShadow>
                    <boxGeometry args={[0.14, 0.02, 0.44]} />
                    <meshStandardMaterial color="#3C3C3C" roughness={0.4} metalness={0.7} />
                </mesh>
            ))}
            {/* Small bolts on brackets */}
            {([-0.6, 0.6] as number[]).flatMap((x, xi) =>
                ([-0.15, 0.15] as number[]).map((z, zi) => (
                    <mesh key={`bolt-${xi}-${zi}`} position={[x, 0.39, z]} castShadow>
                        <sphereGeometry args={[0.012, 6, 6]} />
                        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.3} />
                    </mesh>
                ))
            )}
        </group>
    );
}

/* ─────────────────────────  CRATE  ───────────────────────── */
export function Crate({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Main body */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshStandardMaterial color="#8C6B52" roughness={0.9} />
            </mesh>
            {/* Slightly weathered top */}
            <mesh position={[0, 0.601, 0]} castShadow>
                <boxGeometry args={[0.6, 0.005, 0.6]} />
                <meshStandardMaterial color="#9A7A60" roughness={1} />
            </mesh>
            {/* Slats on front */}
            {[0.1, 0.3, 0.5].map((y, i) => (
                <mesh key={`slat-${i}`} position={[0, y, 0.31]} castShadow>
                    <boxGeometry args={[0.6, 0.04, 0.02]} />
                    <meshStandardMaterial color="#6B5440" />
                </mesh>
            ))}
            {/* Slats on back */}
            {[0.1, 0.3, 0.5].map((y, i) => (
                <mesh key={`slatb-${i}`} position={[0, y, -0.31]} castShadow>
                    <boxGeometry args={[0.6, 0.04, 0.02]} />
                    <meshStandardMaterial color="#6B5440" />
                </mesh>
            ))}
            {/* Rope band around middle */}
            <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.38, 0.018, 6, 4]} />
                <meshStandardMaterial color="#A68A72" roughness={1} />
            </mesh>
            {/* Rope band near top */}
            <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.38, 0.015, 6, 4]} />
                <meshStandardMaterial color="#A68A72" roughness={1} />
            </mesh>
            {/* Stencil marking on side — small colored square */}
            <mesh position={[0.305, 0.3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <planeGeometry args={[0.15, 0.15]} />
                <meshStandardMaterial color="#D9773F" roughness={0.6} />
            </mesh>
            {/* Inner stencil dot */}
            <mesh position={[0.306, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.06, 0.06]} />
                <meshStandardMaterial color="#A94F2B" roughness={0.6} />
            </mesh>
            {/* Corner reinforcements */}
            {([-0.3, 0.3] as number[]).flatMap((x, xi) =>
                ([-0.3, 0.3] as number[]).map((z, zi) => (
                    <mesh key={`corner-${xi}-${zi}`} position={[x, 0.3, z]} castShadow>
                        <boxGeometry args={[0.04, 0.62, 0.04]} />
                        <meshStandardMaterial color="#5C4D3C" roughness={0.85} />
                    </mesh>
                ))
            )}
        </group>
    );
}

/* ─────────────────────────  MAILBOX  ───────────────────────── */
export function Mailbox({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Post */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
                <meshStandardMaterial color="#6B5440" />
            </mesh>
            {/* Main box */}
            <group position={[0, 0.9, 0]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.3, 0.3, 0.5]} />
                    <meshStandardMaterial color="#D93D4A" />
                </mesh>
                {/* Rounded top */}
                <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.3, 12, 1, false, 0, Math.PI]} />
                    <meshStandardMaterial color="#D93D4A" />
                </mesh>
                {/* Door slit */}
                <mesh position={[0, -0.02, 0.251]}>
                    <boxGeometry args={[0.2, 0.02, 0.01]} />
                    <meshStandardMaterial color="#211814" />
                </mesh>
                {/* Flag */}
                <mesh position={[0.16, 0.1, -0.1]} rotation={[0, 0, 0.2]} castShadow>
                    <boxGeometry args={[0.04, 0.25, 0.02]} />
                    <meshStandardMaterial color="#E8A95B" />
                </mesh>
                {/* Flag tip */}
                <mesh position={[0.18, 0.22, -0.1]} rotation={[0, 0, 0.2]} castShadow>
                    <boxGeometry args={[0.08, 0.04, 0.02]} />
                    <meshStandardMaterial color="#E8A95B" />
                </mesh>
                {/* Letter peeking out */}
                <mesh position={[0, -0.02, 0.3]} rotation={[0.15, 0.08, 0.05]} castShadow>
                    <boxGeometry args={[0.16, 0.12, 0.008]} />
                    <meshStandardMaterial color="#FDFBF7" roughness={0.5} />
                </mesh>
                {/* Envelope flap line */}
                <mesh position={[0, 0.02, 0.305]} rotation={[0.15, 0.08, 0.05]}>
                    <boxGeometry args={[0.14, 0.003, 0.009]} />
                    <meshStandardMaterial color="#E8DCC4" />
                </mesh>
                {/* Tiny paw print on side — pad arrangement */}
                <group position={[-0.151, 0.0, 0.05]}>
                    {/* Main pad */}
                    <mesh rotation={[0, Math.PI / 2, 0]}>
                        <sphereGeometry args={[0.025, 6, 6]} />
                        <meshStandardMaterial color="#B82D3A" />
                    </mesh>
                    {/* Toes */}
                    {[[-0.001, 0.03, -0.02], [-0.001, 0.04, 0.005], [-0.001, 0.03, 0.03]].map(([x, y, z], i) => (
                        <mesh key={`paw-${i}`} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
                            <sphereGeometry args={[0.013, 5, 5]} />
                            <meshStandardMaterial color="#B82D3A" />
                        </mesh>
                    ))}
                </group>
            </group>
            {/* Post base */}
            <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.08, 0.1, 0.04, 8]} />
                <meshStandardMaterial color="#6B5440" />
            </mesh>
        </group>
    );
}

/* ─────────────────────────  SIGNPOST  ───────────────────────── */
export function Signpost({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Pole */}
            <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.05, 0.06, 1.3, 8]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            {/* Pole cap */}
            <mesh position={[0, 1.26, 0]} castShadow>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#5C4D3C" roughness={0.85} />
            </mesh>
            {/* Sign 1 — pointing right */}
            <group position={[0, 1.1, 0]} rotation={[0, 0.2, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.8, 0.18, 0.04]} />
                    <meshStandardMaterial color="#E8DCC4" roughness={0.7} />
                </mesh>
                {/* Arrow tip */}
                <mesh position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                    <boxGeometry args={[0.12, 0.12, 0.04]} />
                    <meshStandardMaterial color="#E8DCC4" roughness={0.7} />
                </mesh>
                {/* Text line */}
                <mesh position={[0, 0, 0.021]}>
                    <boxGeometry args={[0.4, 0.03, 0.005]} />
                    <meshStandardMaterial color="#8C6B52" />
                </mesh>
            </group>
            {/* Sign 2 — pointing left */}
            <group position={[0, 0.85, 0]} rotation={[0, -0.5, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.65, 0.15, 0.04]} />
                    <meshStandardMaterial color="#F6E5C8" roughness={0.7} />
                </mesh>
                {/* Arrow tip */}
                <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                    <boxGeometry args={[0.1, 0.1, 0.04]} />
                    <meshStandardMaterial color="#F6E5C8" roughness={0.7} />
                </mesh>
                {/* Text lines */}
                <mesh position={[0.05, 0, 0.021]}>
                    <boxGeometry args={[0.3, 0.025, 0.005]} />
                    <meshStandardMaterial color="#8C6B52" />
                </mesh>
            </group>
            {/* Sign 3 — pointing slightly back-right */}
            <group position={[0, 0.62, 0]} rotation={[0, 0.8, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.55, 0.14, 0.04]} />
                    <meshStandardMaterial color="#D9C9A4" roughness={0.7} />
                </mesh>
                <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
                    <boxGeometry args={[0.09, 0.09, 0.04]} />
                    <meshStandardMaterial color="#D9C9A4" roughness={0.7} />
                </mesh>
                <mesh position={[-0.05, 0, 0.021]}>
                    <boxGeometry args={[0.25, 0.02, 0.005]} />
                    <meshStandardMaterial color="#8C6B52" />
                </mesh>
            </group>
            {/* Small bird perched on top */}
            <group position={[0.03, 1.35, 0.02]}>
                {/* Bird body */}
                <mesh castShadow>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#E8A95B" roughness={0.7} />
                </mesh>
                {/* Bird head */}
                <mesh position={[0, 0.04, 0.025]} castShadow>
                    <sphereGeometry args={[0.025, 7, 7]} />
                    <meshStandardMaterial color="#E8A95B" roughness={0.7} />
                </mesh>
                {/* Bird beak */}
                <mesh position={[0, 0.035, 0.055]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <coneGeometry args={[0.01, 0.03, 4]} />
                    <meshStandardMaterial color="#D9773F" />
                </mesh>
                {/* Bird eye */}
                <mesh position={[0.012, 0.048, 0.04]}>
                    <sphereGeometry args={[0.005, 5, 5]} />
                    <meshStandardMaterial color="#211814" />
                </mesh>
                {/* Bird tail */}
                <mesh position={[0, 0.01, -0.05]} rotation={[0.4, 0, 0]} castShadow>
                    <coneGeometry args={[0.02, 0.06, 4]} />
                    <meshStandardMaterial color="#D9773F" />
                </mesh>
            </group>
        </group>
    );
}

/* ─────────────────────────  LANTERN  ───────────────────────── */
export function Lantern({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    const lightRef = useRef<THREE.PointLight>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        if (lightRef.current) {
            const t = state.clock.elapsedTime + initialOffset;
            // Flicker: base intensity + fast noise + slow pulse
            lightRef.current.intensity =
                0.5 +
                Math.sin(t * 12.3) * 0.08 +
                Math.sin(t * 7.7) * 0.06 +
                Math.sin(t * 1.2) * 0.1;
        }
    });

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Pole */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.07, 2, 8]} />
                <meshStandardMaterial color="#211814" roughness={0.7} metalness={0.8} />
            </mesh>
            {/* Pole base */}
            <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.12, 0.14, 0.04, 8]} />
                <meshStandardMaterial color="#211814" roughness={0.7} metalness={0.8} />
            </mesh>
            {/* Hanging chain — 3 small torus links */}
            {[0, 1, 2].map((i) => (
                <mesh
                    key={`chain-${i}`}
                    position={[0, 2.0 - i * 0.06, 0]}
                    rotation={[Math.PI / 2, i % 2 === 0 ? 0 : Math.PI / 2, 0]}
                    castShadow
                >
                    <torusGeometry args={[0.025, 0.006, 6, 8]} />
                    <meshStandardMaterial color="#3C3C3C" metalness={0.9} roughness={0.3} />
                </mesh>
            ))}
            {/* Lantern top cap */}
            <mesh position={[0, 2.3, 0]} castShadow>
                <coneGeometry args={[0.18, 0.18, 4]} />
                <meshStandardMaterial color="#211814" roughness={0.6} metalness={0.7} />
            </mesh>
            {/* Lantern glass body */}
            <mesh position={[0, 2.1, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.17, 0.28, 6]} />
                <meshStandardMaterial
                    color="#FDFBF7"
                    transparent
                    opacity={0.7}
                    emissive="#F6E5C8"
                    emissiveIntensity={0.6}
                />
            </mesh>
            {/* Cage frame — 4 vertical bars */}
            {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
                <mesh
                    key={`bar-${i}`}
                    position={[
                        Math.cos(angle) * 0.15,
                        2.1,
                        Math.sin(angle) * 0.15,
                    ]}
                    castShadow
                >
                    <boxGeometry args={[0.015, 0.3, 0.015]} />
                    <meshStandardMaterial color="#211814" metalness={0.7} roughness={0.5} />
                </mesh>
            ))}
            {/* Bottom ring */}
            <mesh position={[0, 1.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.15, 0.012, 6, 6]} />
                <meshStandardMaterial color="#211814" metalness={0.7} roughness={0.5} />
            </mesh>
            {/* Top ring */}
            <mesh position={[0, 2.24, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.13, 0.012, 6, 6]} />
                <meshStandardMaterial color="#211814" metalness={0.7} roughness={0.5} />
            </mesh>
            {/* Point light */}
            <pointLight ref={lightRef} position={[0, 2.1, 0]} color="#F6E5C8" intensity={0.5} distance={6} castShadow />
        </group>
    );
}

/* ─────────────────────────  WATER PLANT  ───────────────────────── */
export function WaterPlant({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Lily pad 1 — large */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[0.28, 12]} />
                <meshStandardMaterial color="#3C8259" transparent opacity={0.92} side={THREE.DoubleSide} />
            </mesh>
            {/* Lily pad 2 — medium, offset */}
            <mesh position={[0.22, 0.005, 0.12]} rotation={[-Math.PI / 2, 0, 0.4]} receiveShadow>
                <circleGeometry args={[0.2, 10]} />
                <meshStandardMaterial color="#4A9B6B" transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
            {/* Lily pad 3 — small, other side */}
            <mesh position={[-0.18, 0.003, 0.18]} rotation={[-Math.PI / 2, 0, -0.6]} receiveShadow>
                <circleGeometry args={[0.15, 9]} />
                <meshStandardMaterial color="#68806D" transparent opacity={0.88} side={THREE.DoubleSide} />
            </mesh>

            {/* Water lily flower — layered cone petals */}
            <group position={[-0.05, 0.04, -0.05]}>
                {/* Outer petals */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const ang = (i / 6) * Math.PI * 2;
                    return (
                        <mesh
                            key={`petal-o-${i}`}
                            position={[Math.cos(ang) * 0.06, 0, Math.sin(ang) * 0.06]}
                            rotation={[-0.6, ang, 0]}
                            castShadow
                        >
                            <coneGeometry args={[0.03, 0.07, 4]} />
                            <meshStandardMaterial color="#FDFBF7" />
                        </mesh>
                    );
                })}
                {/* Inner petals */}
                {[0, 1, 2, 3].map((i) => {
                    const ang = (i / 4) * Math.PI * 2 + 0.4;
                    return (
                        <mesh
                            key={`petal-i-${i}`}
                            position={[Math.cos(ang) * 0.03, 0.02, Math.sin(ang) * 0.03]}
                            rotation={[-0.3, ang, 0]}
                            castShadow
                        >
                            <coneGeometry args={[0.02, 0.05, 4]} />
                            <meshStandardMaterial color="#FFE4E8" />
                        </mesh>
                    );
                })}
                {/* Center */}
                <mesh position={[0, 0.03, 0]} castShadow>
                    <sphereGeometry args={[0.018, 6, 6]} />
                    <meshStandardMaterial color="#E8A95B" />
                </mesh>
            </group>

            {/* Small frog on pad 2 */}
            <group position={[0.2, 0.03, 0.1]}>
                {/* Body */}
                <mesh castShadow>
                    <sphereGeometry args={[0.04, 7, 7]} />
                    <meshStandardMaterial color="#4A9B6B" flatShading />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.02, 0.035]} castShadow>
                    <sphereGeometry args={[0.028, 7, 7]} />
                    <meshStandardMaterial color="#4A9B6B" flatShading />
                </mesh>
                {/* Eyes */}
                {[-0.015, 0.015].map((x, i) => (
                    <mesh key={`frog-eye-${i}`} position={[x, 0.045, 0.04]}>
                        <sphereGeometry args={[0.01, 5, 5]} />
                        <meshStandardMaterial color="#FDFBF7" />
                    </mesh>
                ))}
                {/* Pupils */}
                {[-0.015, 0.015].map((x, i) => (
                    <mesh key={`frog-pupil-${i}`} position={[x, 0.045, 0.049]}>
                        <sphereGeometry args={[0.005, 4, 4]} />
                        <meshStandardMaterial color="#211814" />
                    </mesh>
                ))}
                {/* Front legs */}
                {[-0.03, 0.03].map((x, i) => (
                    <mesh key={`frog-fl-${i}`} position={[x, -0.02, 0.02]} rotation={[0.3, 0, x > 0 ? -0.3 : 0.3]} castShadow>
                        <capsuleGeometry args={[0.008, 0.03, 3, 5]} />
                        <meshStandardMaterial color="#3C8259" flatShading />
                    </mesh>
                ))}
            </group>

            {/* Small stems under water */}
            <mesh position={[0, -0.15, 0]} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.3, 5]} />
                <meshStandardMaterial color="#3C8259" />
            </mesh>
            <mesh position={[0.22, -0.12, 0.12]} rotation={[0.1, 0, 0.1]} castShadow>
                <cylinderGeometry args={[0.006, 0.006, 0.24, 5]} />
                <meshStandardMaterial color="#4A9B6B" />
            </mesh>
        </group>
    );
}

/* ─────────────────────────  BOAT  ───────────────────────── */
export function Boat({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = "#4A6B82" }: PropProps) {
    const groupRef = useRef<THREE.Group>(null);
    const flagRef = useRef<THREE.Mesh>(null);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(t * 2 + initialOffset) * 0.05;
            groupRef.current.rotation.z = Math.cos(t * 1.5 + initialOffset) * 0.02;
            groupRef.current.rotation.x = Math.sin(t * 1.8 + initialOffset) * 0.02;
        }
        if (flagRef.current) {
            flagRef.current.rotation.y = Math.sin(t * 3) * 0.3;
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            {/* Main hull — wider at center, narrow at ends */}
            <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.2, 0.3, 2.4]} />
                <meshStandardMaterial color="#8C6B52" />
            </mesh>
            {/* Hull taper front */}
            <mesh position={[0, 0.15, 1.45]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.85, 0.3, 0.85]} />
                <meshStandardMaterial color="#8C6B52" />
            </mesh>
            {/* Hull taper back */}
            <mesh position={[0, 0.15, -1.35]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.7, 0.3, 0.7]} />
                <meshStandardMaterial color="#8C6B52" />
            </mesh>
            {/* Keel strip */}
            <mesh position={[0, 0.0, 0]} castShadow>
                <boxGeometry args={[0.08, 0.04, 2.8]} />
                <meshStandardMaterial color="#5C4D3C" />
            </mesh>
            {/* Color stripe */}
            <mesh position={[0, 0.25, 0]} castShadow>
                <boxGeometry args={[1.24, 0.08, 2.44]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Stripe front */}
            <mesh position={[0, 0.25, 1.45]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <boxGeometry args={[0.88, 0.08, 0.88]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Inside floor */}
            <mesh position={[0, 0.31, 0.1]} castShadow>
                <boxGeometry args={[1.0, 0.04, 2.0]} />
                <meshStandardMaterial color="#5C4D3C" />
            </mesh>
            {/* Seat near back */}
            <mesh position={[0, 0.38, -0.6]} castShadow>
                <boxGeometry args={[1.1, 0.05, 0.35]} />
                <meshStandardMaterial color="#A68A72" />
            </mesh>
            {/* Seat near front */}
            <mesh position={[0, 0.38, 0.7]} castShadow>
                <boxGeometry args={[1.0, 0.05, 0.3]} />
                <meshStandardMaterial color="#A68A72" />
            </mesh>

            {/* Mast */}
            <mesh position={[0, 1.2, 0.1]} castShadow>
                <cylinderGeometry args={[0.03, 0.04, 1.7, 8]} />
                <meshStandardMaterial color="#6B5440" />
            </mesh>
            {/* Sail — triangular shape approximated by thin wedge */}
            <mesh position={[0.01, 1.1, 0.4]} rotation={[0, -0.1, 0]} castShadow>
                <coneGeometry args={[0.5, 1.2, 3]} />
                <meshStandardMaterial
                    color="#FDFBF7"
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.92}
                    roughness={0.8}
                />
            </mesh>
            {/* Small flag on top */}
            <mesh ref={flagRef} position={[0.08, 2.05, 0.1]} castShadow>
                <boxGeometry args={[0.15, 0.08, 0.005]} />
                <meshStandardMaterial color="#D93D4A" side={THREE.DoubleSide} />
            </mesh>
            {/* Flag pennant tail */}
            <mesh position={[0.18, 2.05, 0.1]} castShadow>
                <boxGeometry args={[0.05, 0.04, 0.005]} />
                <meshStandardMaterial color="#D93D4A" side={THREE.DoubleSide} />
            </mesh>

            {/* Rope coil in boat */}
            <mesh position={[0.3, 0.38, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.08, 0.02, 6, 12]} />
                <meshStandardMaterial color="#A68A72" roughness={1} />
            </mesh>
            {/* Second rope coil */}
            <mesh position={[0.3, 0.40, -0.2]} rotation={[Math.PI / 2, 0, 0.3]} castShadow>
                <torusGeometry args={[0.06, 0.018, 6, 12]} />
                <meshStandardMaterial color="#A68A72" roughness={1} />
            </mesh>

            {/* Gunwale trim — left */}
            <mesh position={[-0.6, 0.32, 0]} castShadow>
                <boxGeometry args={[0.04, 0.06, 2.4]} />
                <meshStandardMaterial color="#6B5440" />
            </mesh>
            {/* Gunwale trim — right */}
            <mesh position={[0.6, 0.32, 0]} castShadow>
                <boxGeometry args={[0.04, 0.06, 2.4]} />
                <meshStandardMaterial color="#6B5440" />
            </mesh>
        </group>
    );
}

/* ─────────────────────────  BARREL  ───────────────────────── */
export function Barrel({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = "#8C6B52" }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Body — slightly bulging cylinder */}
            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.25, 0.25, 0.7, 10]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Bulge ring — middle */}
            <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.27, 0.27, 0.2, 10]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Top cap */}
            <mesh position={[0, 0.7, 0]} castShadow>
                <cylinderGeometry args={[0.24, 0.24, 0.02, 10]} />
                <meshStandardMaterial color="#A68A72" roughness={0.85} />
            </mesh>
            {/* Metal band top */}
            <mesh position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.26, 0.015, 6, 16]} />
                <meshStandardMaterial color="#3C3C3C" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Metal band bottom */}
            <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.26, 0.015, 6, 16]} />
                <meshStandardMaterial color="#3C3C3C" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Wood stave lines */}
            {[0, 1, 2, 3, 4].map((i) => {
                const ang = (i / 5) * Math.PI * 2;
                return (
                    <mesh
                        key={`stave-${i}`}
                        position={[Math.cos(ang) * 0.26, 0.35, Math.sin(ang) * 0.26]}
                        rotation={[0, -ang + Math.PI / 2, 0]}
                        castShadow
                    >
                        <boxGeometry args={[0.005, 0.68, 0.01]} />
                        <meshStandardMaterial color="#6B5440" roughness={1} />
                    </mesh>
                );
            })}
        </group>
    );
}

/* ─────────────────────────  ROPE COIL  ───────────────────────── */
export function RopeCoil({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Main coil */}
            <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <torusGeometry args={[0.12, 0.025, 8, 16]} />
                <meshStandardMaterial color="#A68A72" roughness={1} />
            </mesh>
            {/* Inner coil */}
            <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0.5]} castShadow>
                <torusGeometry args={[0.08, 0.022, 8, 16]} />
                <meshStandardMaterial color="#9A7E66" roughness={1} />
            </mesh>
            {/* Trailing end */}
            <mesh position={[0.15, 0.02, 0.05]} rotation={[0.2, 0.5, Math.PI / 2]} castShadow>
                <capsuleGeometry args={[0.015, 0.12, 4, 6]} />
                <meshStandardMaterial color="#A68A72" roughness={1} />
            </mesh>
        </group>
    );
}

/* ─────────────────────────  CLOTHESLINE  ───────────────────────── */
export function Clothesline({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    const fabricRefs = useRef<(THREE.Mesh | null)[]>([]);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    const fabricColors = useMemo(() => ['#FDFBF7', '#A8C8D9', '#E8A95B', '#D93D4A'], []);
    const fabricPositions = useMemo(() => [-0.6, -0.2, 0.2, 0.6], []);

    useFrame((state) => {
        const t = state.clock.elapsedTime + initialOffset;
        fabricRefs.current.forEach((ref, i) => {
            if (ref) {
                ref.rotation.z = Math.sin(t * 1.5 + i * 1.2) * 0.1;
                ref.rotation.x = Math.sin(t * 1.2 + i * 0.8) * 0.05;
            }
        });
    });

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Left post */}
            <mesh position={[-1, 0.6, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.05, 1.2, 6]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            {/* Right post */}
            <mesh position={[1, 0.6, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.04, 0.05, 1.2, 6]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            {/* Post caps */}
            {[-1, 1].map((x, i) => (
                <mesh key={`cap-${i}`} position={[x, 1.22, 0]} castShadow>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshStandardMaterial color="#5C4D3C" />
                </mesh>
            ))}
            {/* Line (thin cylinder) */}
            <mesh position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 2, 6]} />
                <meshStandardMaterial color="#A68A72" roughness={1} />
            </mesh>
            {/* Hanging fabric pieces */}
            {fabricPositions.map((x, i) => (
                <mesh
                    key={`fabric-${i}`}
                    ref={(el) => { fabricRefs.current[i] = el; }}
                    position={[x, 0.92, 0.01]}
                    castShadow
                >
                    <boxGeometry args={[0.22, 0.4 + (i % 2) * 0.1, 0.01]} />
                    <meshStandardMaterial
                        color={fabricColors[i]}
                        side={THREE.DoubleSide}
                        roughness={0.8}
                    />
                </mesh>
            ))}
            {/* Clothespins */}
            {fabricPositions.map((x, i) => (
                <mesh key={`pin-${i}`} position={[x, 1.13, 0]} castShadow>
                    <boxGeometry args={[0.02, 0.06, 0.02]} />
                    <meshStandardMaterial color="#A68A72" />
                </mesh>
            ))}
        </group>
    );
}

/* ─────────────────────────  WELL PUMP  ───────────────────────── */
export function WellPump({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Stone base cylinder */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.55, 0.6, 10]} />
                <meshStandardMaterial color="#8A8A82" roughness={1} flatShading />
            </mesh>
            {/* Stone top rim */}
            <mesh position={[0, 0.62, 0]} castShadow>
                <cylinderGeometry args={[0.55, 0.52, 0.06, 10]} />
                <meshStandardMaterial color="#7A7A72" roughness={1} flatShading />
            </mesh>
            {/* Inner darkness (fake depth) */}
            <mesh position={[0, 0.61, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 0.04, 10]} />
                <meshStandardMaterial color="#211814" />
            </mesh>
            {/* Water surface inside */}
            <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.4, 10]} />
                <meshStandardMaterial color="#6BA3BE" transparent opacity={0.6} />
            </mesh>

            {/* Wooden frame — left post */}
            <mesh position={[-0.45, 1.0, 0]} castShadow>
                <boxGeometry args={[0.08, 1.0, 0.08]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            {/* Right post */}
            <mesh position={[0.45, 1.0, 0]} castShadow>
                <boxGeometry args={[0.08, 1.0, 0.08]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            {/* Cross beam */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1.0, 0.08, 0.08]} />
                <meshStandardMaterial color="#6B5440" roughness={0.9} />
            </mesh>
            {/* Roof — small A-frame */}
            <mesh position={[0, 1.65, 0]} castShadow>
                <coneGeometry args={[0.6, 0.3, 4]} />
                <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
            </mesh>

            {/* Crank axle */}
            <mesh position={[0, 1.48, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 1.1, 6]} />
                <meshStandardMaterial color="#3C3C3C" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Crank handle */}
            <mesh position={[0.6, 1.48, 0]} castShadow>
                <boxGeometry args={[0.04, 0.15, 0.04]} />
                <meshStandardMaterial color="#3C3C3C" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Crank knob */}
            <mesh position={[0.6, 1.56, 0]} castShadow>
                <sphereGeometry args={[0.025, 6, 6]} />
                <meshStandardMaterial color="#6B5440" />
            </mesh>

            {/* Bucket hanging */}
            <group position={[0, 0.8, 0]}>
                {/* Rope */}
                <mesh position={[0, 0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.008, 0.008, 0.7, 5]} />
                    <meshStandardMaterial color="#A68A72" roughness={1} />
                </mesh>
                {/* Bucket body */}
                <mesh castShadow>
                    <cylinderGeometry args={[0.1, 0.08, 0.15, 8]} />
                    <meshStandardMaterial color="#6B5440" roughness={0.9} />
                </mesh>
                {/* Bucket rim */}
                <mesh position={[0, 0.075, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <torusGeometry args={[0.1, 0.01, 5, 10]} />
                    <meshStandardMaterial color="#3C3C3C" metalness={0.7} roughness={0.4} />
                </mesh>
                {/* Bucket handle */}
                <mesh position={[0, 0.12, 0]} rotation={[0, 0, 0]} castShadow>
                    <torusGeometry args={[0.08, 0.008, 5, 8, Math.PI]} />
                    <meshStandardMaterial color="#3C3C3C" metalness={0.7} roughness={0.4} />
                </mesh>
            </group>

            {/* Decorative stones around base */}
            {[0, 1.2, 2.4, 3.6, 5.0].map((ang, i) => (
                <mesh
                    key={`stone-${i}`}
                    position={[Math.cos(ang) * 0.6, 0.06, Math.sin(ang) * 0.6]}
                    castShadow receiveShadow
                >
                    <sphereGeometry args={[0.06 + (i % 2) * 0.02, 5, 5]} />
                    <meshStandardMaterial color="#7A7A72" roughness={1} flatShading />
                </mesh>
            ))}
        </group>
    );
}

/* ─────────────────────────  CART  ───────────────────────── */
export function Cart({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = "#8C6B52" }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Bed / platform */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.8, 0.06, 1.2]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Bed planks detail */}
            {[-0.25, 0, 0.25].map((x, i) => (
                <mesh key={`plank-${i}`} position={[x, 0.431, 0]} castShadow>
                    <boxGeometry args={[0.01, 0.005, 1.18]} />
                    <meshStandardMaterial color="#6B5440" roughness={1} />
                </mesh>
            ))}
            {/* Left side wall */}
            <mesh position={[-0.38, 0.55, 0]} castShadow>
                <boxGeometry args={[0.04, 0.25, 1.2]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Right side wall */}
            <mesh position={[0.38, 0.55, 0]} castShadow>
                <boxGeometry args={[0.04, 0.25, 1.2]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Back wall */}
            <mesh position={[0, 0.55, -0.58]} castShadow>
                <boxGeometry args={[0.8, 0.25, 0.04]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Front wall (lower) */}
            <mesh position={[0, 0.48, 0.58]} castShadow>
                <boxGeometry args={[0.8, 0.12, 0.04]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>

            {/* Axle */}
            <mesh position={[0, 0.22, -0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 1.0, 6]} />
                <meshStandardMaterial color="#3C3C3C" metalness={0.7} roughness={0.4} />
            </mesh>

            {/* Left wheel */}
            <group position={[-0.48, 0.22, -0.3]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <torusGeometry args={[0.18, 0.03, 6, 12]} />
                    <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
                </mesh>
                {/* Spokes */}
                {[0, 1, 2, 3].map((i) => (
                    <mesh
                        key={`spoke-l-${i}`}
                        rotation={[0, 0, Math.PI / 2 + (i / 4) * Math.PI * 2]}
                        position={[0, 0, 0]}
                        castShadow
                    >
                        <boxGeometry args={[0.36, 0.02, 0.02]} />
                        <meshStandardMaterial color="#6B5440" />
                    </mesh>
                ))}
                {/* Hub */}
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.035, 0.035, 0.04, 6]} />
                    <meshStandardMaterial color="#3C3C3C" metalness={0.6} roughness={0.4} />
                </mesh>
            </group>

            {/* Right wheel */}
            <group position={[0.48, 0.22, -0.3]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <torusGeometry args={[0.18, 0.03, 6, 12]} />
                    <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
                </mesh>
                {[0, 1, 2, 3].map((i) => (
                    <mesh
                        key={`spoke-r-${i}`}
                        rotation={[0, 0, Math.PI / 2 + (i / 4) * Math.PI * 2]}
                        castShadow
                    >
                        <boxGeometry args={[0.36, 0.02, 0.02]} />
                        <meshStandardMaterial color="#6B5440" />
                    </mesh>
                ))}
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.035, 0.035, 0.04, 6]} />
                    <meshStandardMaterial color="#3C3C3C" metalness={0.6} roughness={0.4} />
                </mesh>
            </group>

            {/* Handle shafts */}
            {[-0.25, 0.25].map((x, i) => (
                <mesh key={`handle-${i}`} position={[x, 0.38, 0.9]} rotation={[0.15, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
                    <meshStandardMaterial color="#6B5440" roughness={0.9} />
                </mesh>
            ))}
            {/* Handle grip */}
            <mesh position={[0, 0.42, 1.18]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.55, 6]} />
                <meshStandardMaterial color="#5C4D3C" roughness={0.85} />
            </mesh>

            {/* Metal corner reinforcements */}
            {([-0.38, 0.38] as number[]).flatMap((x, xi) =>
                ([-0.58, 0.58] as number[]).map((z, zi) => (
                    <mesh key={`metal-${xi}-${zi}`} position={[x, 0.5, z]} castShadow>
                        <boxGeometry args={[0.06, 0.2, 0.06]} />
                        <meshStandardMaterial color="#4A4A4A" metalness={0.6} roughness={0.4} />
                    </mesh>
                ))
            )}
        </group>
    );
}

/* ─────────────────────────  BUNTING  ───────────────────────── */
export function Bunting({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    const flagRefs = useRef<(THREE.Mesh | null)[]>([]);
    const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

    const flagColors = useMemo(() => ['#D93D4A', '#E8A95B', '#4A9B6B', '#4A6B82', '#D9773F', '#D4AF37'], []);
    const flagCount = 6;
    const span = 2.0; // total width of bunting

    useFrame((state) => {
        const t = state.clock.elapsedTime + initialOffset;
        flagRefs.current.forEach((ref, i) => {
            if (ref) {
                ref.rotation.z = Math.sin(t * 2.0 + i * 0.9) * 0.12;
                ref.rotation.x = Math.sin(t * 1.6 + i * 1.1) * 0.06;
            }
        });
    });

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Left anchor */}
            <mesh position={[-span / 2, 0, 0]} castShadow>
                <sphereGeometry args={[0.025, 5, 5]} />
                <meshStandardMaterial color="#6B5440" />
            </mesh>
            {/* Right anchor */}
            <mesh position={[span / 2, 0, 0]} castShadow>
                <sphereGeometry args={[0.025, 5, 5]} />
                <meshStandardMaterial color="#6B5440" />
            </mesh>
            {/* String — sagging line approximated by segments */}
            {[0, 1, 2, 3, 4].map((i) => {
                const t = (i + 0.5) / 5;
                const x = -span / 2 + t * span;
                const sag = -Math.sin(t * Math.PI) * 0.15;
                const nextT = (i + 1.5) / 5;
                const nextX = -span / 2 + nextT * span;
                const nextSag = -Math.sin(nextT * Math.PI) * 0.15;
                const midX = (x + nextX) / 2;
                const midY = (sag + nextSag) / 2;
                const len = Math.sqrt((nextX - x) ** 2 + (nextSag - sag) ** 2);
                const angle = Math.atan2(nextSag - sag, nextX - x);
                return (
                    <mesh key={`str-${i}`} position={[midX, midY, 0]} rotation={[0, 0, angle]}>
                        <cylinderGeometry args={[0.005, 0.005, len, 4]} />
                        <meshStandardMaterial color="#A68A72" roughness={1} />
                    </mesh>
                );
            })}
            {/* Pennant flags */}
            {Array.from({ length: flagCount }).map((_, i) => {
                const t = (i + 0.5) / flagCount;
                const x = -span / 2 + t * span;
                const sag = -Math.sin(t * Math.PI) * 0.15;
                return (
                    <mesh
                        key={`flag-${i}`}
                        ref={(el) => { flagRefs.current[i] = el; }}
                        position={[x, sag - 0.08, 0]}
                        castShadow
                    >
                        <coneGeometry args={[0.06, 0.14, 3]} />
                        <meshStandardMaterial
                            color={flagColors[i % flagColors.length]}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

/* ─────────────────────────  CAMPFIRE  ───────────────────────── */
export function Campfire({ position = [0, 0, 0], scale = 1 }: PropProps) {
    const lightRef = useRef<THREE.PointLight>(null);
    const flameRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (lightRef.current) {
            lightRef.current.intensity = 0.8 + Math.sin(time * 15) * 0.15 + Math.cos(time * 22) * 0.05;
        }
        if (flameRef.current) {
            flameRef.current.children.forEach((child, i) => {
                const t = time * 3 + i * 1.5;
                child.scale.setScalar((0.85 + Math.sin(t) * 0.1) * (scale as number));
                child.position.y = (0.2 + Math.cos(t) * 0.03) * (scale as number);
            });
        }
    });

    return (
        <group position={position}>
            {/* Stone Ring */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 0.55 * (scale as number);
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius]}
                        castShadow
                    >
                        <sphereGeometry args={[0.1 * (scale as number), 6, 6]} />
                        <meshStandardMaterial color="#8C8A82" roughness={0.9} flatShading />
                    </mesh>
                );
            })}

            {/* Logs */}
            <mesh position={[0, 0.08, 0]} rotation={[0.4, 0.5, 0.3]} castShadow>
                <cylinderGeometry args={[0.04 * (scale as number), 0.04 * (scale as number), 0.6 * (scale as number), 6]} />
                <meshStandardMaterial color="#3C2A1E" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.08, 0]} rotation={[0.4, -0.9, -0.3]} castShadow>
                <cylinderGeometry args={[0.04 * (scale as number), 0.04 * (scale as number), 0.6 * (scale as number), 6]} />
                <meshStandardMaterial color="#3C2A1E" roughness={0.9} />
            </mesh>

            {/* Flames */}
            <group ref={flameRef}>
                <mesh position={[0, 0.2, 0]} castShadow>
                    <coneGeometry args={[0.15 * (scale as number), 0.45 * (scale as number), 5]} />
                    <meshStandardMaterial color="#D9553F" emissive="#D9553F" emissiveIntensity={0.8} />
                </mesh>
                <mesh position={[0.05, 0.18, -0.05]} rotation={[0.2, 0, 0.2]} castShadow>
                    <coneGeometry args={[0.1 * (scale as number), 0.3 * (scale as number), 5]} />
                    <meshStandardMaterial color="#E8A95B" emissive="#E8A95B" emissiveIntensity={0.9} />
                </mesh>
                <mesh position={[-0.05, 0.18, 0.05]} rotation={[-0.2, 0, -0.2]} castShadow>
                    <coneGeometry args={[0.08 * (scale as number), 0.25 * (scale as number), 5]} />
                    <meshStandardMaterial color="#E06D53" emissive="#E06D53" emissiveIntensity={0.8} />
                </mesh>
            </group>

            {/* Warm glow */}
            <pointLight
                ref={lightRef}
                position={[0, 0.5, 0]}
                color="#FFA500"
                intensity={1.0}
                distance={6}
                castShadow
                shadow-bias={-0.002}
            />
        </group>
    );
}

/* ─────────────────────────  BOARDWALK  ───────────────────────── */
interface BoardwalkProps extends PropProps {
    width?: number;
    length?: number;
}

export function Boardwalk({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, width = 3, length = 6 }: BoardwalkProps) {
    const planksCount = Math.floor(length * 2.5);
    const postSpacing = 3;
    const postCount = Math.ceil(length / postSpacing) + 1;

    return (
        <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation} scale={scale as any}>
            <group>
                {/* Walkway planks */}
                {Array.from({ length: planksCount }).map((_, i) => {
                    const z = -length / 2 + (i / (planksCount - 1)) * length;
                    const plankRotationY = (Math.random() - 0.5) * 0.02;
                    const plankRotationZ = (Math.random() - 0.5) * 0.01;
                    return (
                        <mesh
                            key={`plank-${i}`}
                            position={[0, 0.05, z]}
                            rotation={[0, plankRotationY, plankRotationZ]}
                            castShadow
                            receiveShadow
                        >
                            <boxGeometry args={[width, 0.08, 0.32]} />
                            <meshStandardMaterial color={i % 2 === 0 ? "#7C6450" : "#6B5440"} roughness={0.9} />
                        </mesh>
                    );
                })}

                {/* Longitudinal Support Beams */}
                <mesh position={[-width / 2 + 0.3, -0.1, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.15, 0.2, length]} />
                    <meshStandardMaterial color="#5C4D3C" roughness={0.95} />
                </mesh>
                <mesh position={[width / 2 - 0.3, -0.1, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.15, 0.2, length]} />
                    <meshStandardMaterial color="#5C4D3C" roughness={0.95} />
                </mesh>

                {/* Support Stilts (Pilings) */}
                {Array.from({ length: postCount }).map((_, i) => {
                    const z = -length / 2 + (i / (postCount - 1)) * length;
                    return (
                        <group key={`piling-${i}`} position={[0, 0, z]}>
                            {/* Left stilt */}
                            <mesh position={[-width / 2 + 0.15, -1.2, 0]} castShadow>
                                <cylinderGeometry args={[0.12, 0.12, 2.4, 8]} />
                                <meshStandardMaterial color="#3A2D23" roughness={1.0} />
                            </mesh>
                            {/* Right stilt */}
                            <mesh position={[width / 2 - 0.15, -1.2, 0]} castShadow>
                                <cylinderGeometry args={[0.12, 0.12, 2.4, 8]} />
                                <meshStandardMaterial color="#3A2D23" roughness={1.0} />
                            </mesh>
                            
                            {/* Left handrail post */}
                            <mesh position={[-width / 2 + 0.1, 0.6, 0]} castShadow>
                                <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
                                <meshStandardMaterial color="#6B5440" roughness={0.9} />
                            </mesh>
                            {/* Right handrail post */}
                            <mesh position={[width / 2 - 0.1, 0.6, 0]} castShadow>
                                <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
                                <meshStandardMaterial color="#6B5440" roughness={0.9} />
                            </mesh>
                        </group>
                    );
                })}

                {/* Rope Handrails */}
                <mesh position={[-width / 2 + 0.1, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.025, 0.025, length, 6]} />
                    <meshStandardMaterial color="#A68A72" roughness={1.0} />
                </mesh>
                <mesh position={[width / 2 - 0.1, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.025, 0.025, length, 6]} />
                    <meshStandardMaterial color="#A68A72" roughness={1.0} />
                </mesh>
            </group>
        </RigidBody>
    );
}

/* ─────────────────────────  ARCH BRIDGE  ───────────────────────── */
interface ArchBridgeProps extends PropProps {
    width?: number;
    length?: number;
}

export function ArchBridge({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, width = 2.5, length = 7 }: ArchBridgeProps) {
    const steps = 8;
    return (
        <RigidBody type="fixed" colliders="trimesh" position={position} rotation={rotation} scale={scale as any}>
            <group>
                {/* Curved walkway boards */}
                {Array.from({ length: steps }).map((_, i) => {
                    const t = i / (steps - 1);
                    const angle = -Math.PI / 4 + t * (Math.PI / 2);
                    const z = Math.sin(angle) * (length / 2);
                    const y = (Math.cos(angle) - Math.cos(Math.PI / 4)) * 0.8;
                    const rotX = -angle;
                    return (
                        <mesh
                            key={`bridge-plank-${i}`}
                            position={[0, y, z]}
                            rotation={[rotX, 0, 0]}
                            castShadow
                            receiveShadow
                        >
                            <boxGeometry args={[width, 0.08, 0.82]} />
                            <meshStandardMaterial color={i % 2 === 0 ? "#8C6B52" : "#6B5440"} roughness={0.9} />
                        </mesh>
                    );
                })}

                {/* Rail posts */}
                {Array.from({ length: steps }).map((_, i) => {
                    const t = i / (steps - 1);
                    const angle = -Math.PI / 4 + t * (Math.PI / 2);
                    const z = Math.sin(angle) * (length / 2);
                    const y = (Math.cos(angle) - Math.cos(Math.PI / 4)) * 0.8;
                    return (
                        <group key={`rail-${i}`} position={[0, y, z]}>
                            <mesh position={[-width / 2 + 0.1, 0.4, 0]} castShadow>
                                <cylinderGeometry args={[0.04, 0.04, 0.8, 6]} />
                                <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
                            </mesh>
                            <mesh position={[width / 2 - 0.1, 0.4, 0]} castShadow>
                                <cylinderGeometry args={[0.04, 0.04, 0.8, 6]} />
                                <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
                            </mesh>
                        </group>
                    );
                })}

                {/* Handrail curve segments */}
                {Array.from({ length: 4 }).map((_, i) => {
                    const t1 = i / 4;
                    const t2 = (i + 1) / 4;
                    const angle1 = -Math.PI / 4 + t1 * (Math.PI / 2);
                    const angle2 = -Math.PI / 4 + t2 * (Math.PI / 2);
                    const z1 = Math.sin(angle1) * (length / 2);
                    const y1 = (Math.cos(angle1) - Math.cos(Math.PI / 4)) * 0.8 + 0.7;
                    const z2 = Math.sin(angle2) * (length / 2);
                    const y2 = (Math.cos(angle2) - Math.cos(Math.PI / 4)) * 0.8 + 0.7;

                    const midZ = (z1 + z2) / 2;
                    const midY = (y1 + y2) / 2;
                    const len = Math.sqrt((z2 - z1) ** 2 + (y2 - y1) ** 2);
                    const rotX = -Math.atan2(y2 - y1, z2 - z1);

                    return (
                        <group key={`handrail-seg-${i}`}>
                            <mesh position={[-width / 2 + 0.1, midY, midZ]} rotation={[rotX, 0, 0]} castShadow>
                                <boxGeometry args={[0.08, 0.06, len + 0.05]} />
                                <meshStandardMaterial color="#8C6B52" />
                            </mesh>
                            <mesh position={[width / 2 - 0.1, midY, midZ]} rotation={[rotX, 0, 0]} castShadow>
                                <boxGeometry args={[0.08, 0.06, len + 0.05]} />
                                <meshStandardMaterial color="#8C6B52" />
                            </mesh>
                        </group>
                    );
                })}
            </group>
        </RigidBody>
    );
}

/* ─────────────────────────  STREETLAMP  ───────────────────────── */
export function Streetlamp({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Tall post */}
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.06, 0.08, 2.4, 8]} />
                <meshStandardMaterial color="#4C3D32" roughness={0.9} />
            </mesh>
            {/* Base */}
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.15, 0.2, 0.2, 8]} />
                <meshStandardMaterial color="#3C2A1E" roughness={0.95} />
            </mesh>
            {/* Decorative rings */}
            <mesh position={[0, 0.8, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.09, 0.08, 8]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.6, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.08, 8]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.2} />
            </mesh>

            {/* Crossbar on top */}
            <mesh position={[0, 2.3, 0]} castShadow>
                <boxGeometry args={[0.9, 0.06, 0.06]} />
                <meshStandardMaterial color="#3C2A1E" />
            </mesh>

            {/* Left Hanging Lantern */}
            <group position={[-0.4, 2.05, 0]}>
                <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.1, 4]} />
                    <meshStandardMaterial color="#6B5440" />
                </mesh>
                <mesh position={[0, 0.08, 0]} castShadow>
                    <coneGeometry args={[0.1, 0.06, 6]} />
                    <meshStandardMaterial color="#3C2A1E" />
                </mesh>
                <mesh position={[0, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.07, 0.07, 0.12, 6]} />
                    <meshStandardMaterial color="#FDFBF7" transparent opacity={0.4} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshStandardMaterial color="#FFA500" emissive="#FFA500" emissiveIntensity={1.2} />
                </mesh>
                <pointLight color="#FFF3D6" intensity={0.5} distance={4} />
            </group>

            {/* Right Hanging Lantern */}
            <group position={[0.4, 2.05, 0]}>
                <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.1, 4]} />
                    <meshStandardMaterial color="#6B5440" />
                </mesh>
                <mesh position={[0, 0.08, 0]} castShadow>
                    <coneGeometry args={[0.1, 0.06, 6]} />
                    <meshStandardMaterial color="#3C2A1E" />
                </mesh>
                <mesh position={[0, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.07, 0.07, 0.12, 6]} />
                    <meshStandardMaterial color="#FDFBF7" transparent opacity={0.4} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshStandardMaterial color="#FFA500" emissive="#FFA500" emissiveIntensity={1.2} />
                </mesh>
                <pointLight color="#FFF3D6" intensity={0.5} distance={4} />
            </group>
        </group>
    );
}


/* ─────────────────────────  FOUNTAIN  ───────────────────────── */
export function Fountain({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: PropProps) {
    const waterRef = useRef<THREE.Mesh>(null);
    const spoutRef = useRef<THREE.Mesh>(null);
    const timeOffset = useMemo(() => Math.random() * 100, []);
    
    useFrame((state) => {
        const t = state.clock.elapsedTime + timeOffset;
        if (waterRef.current) {
            waterRef.current.position.y = 0.65 + Math.sin(t * 2) * 0.02;
            waterRef.current.rotation.y = t * 0.2;
        }
        if (spoutRef.current) {
            spoutRef.current.scale.y = 1 + Math.sin(t * 15) * 0.1;
            spoutRef.current.position.y = 2.45 + (Math.sin(t * 15) * 0.1 * 0.2);
        }
    });

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <RigidBody type="fixed" colliders={false}>
                {/* Base rim (half height, radius) */}
                <CylinderCollider args={[0.4, 2.5]} position={[0, 0.4, 0]} />
                {/* Center pillar (half height, radius) */}
                <CylinderCollider args={[0.75, 0.8]} position={[0, 1.0, 0]} />
            </RigidBody>
            
            {/* Base basin */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[2.5, 2.5, 0.8, 16]} />
                <meshStandardMaterial color="#B8AA8F" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.75, 0]}>
                <cylinderGeometry args={[2.2, 2.2, 0.11, 16]} />
                <meshStandardMaterial color="#7FAEC0" transparent opacity={0.72} roughness={0.45} />
            </mesh>

            {/* Inner Pillar */}
            <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.8, 0.8, 1.5, 16]} />
                <meshStandardMaterial color="#A68A72" roughness={0.9} />
            </mesh>

            {/* Middle tier */}
            <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.5, 0.6, 0.3, 16]} />
                <meshStandardMaterial color="#B8AA8F" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.75, 0]}>
                <cylinderGeometry args={[1.3, 1.3, 0.05, 16]} />
                <meshStandardMaterial color="#7FAEC0" transparent opacity={0.72} roughness={0.45} />
            </mesh>

            {/* Top Sphere */}
            <mesh position={[0, 2.1, 0]} castShadow>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color="#A68A72" roughness={0.9} />
            </mesh>

            {/* Main Pool Water */}
            <mesh ref={waterRef} position={[0, 0.65, 0]} receiveShadow>
                <cylinderGeometry args={[2.2, 2.2, 0.05, 16]} />
                <meshStandardMaterial color="#9BD4DF" transparent opacity={0.82} roughness={0.25} />
            </mesh>

            {/* Middle Tier Water */}
            <mesh position={[0, 1.72, 0]} receiveShadow>
                <cylinderGeometry args={[1.3, 1.3, 0.05, 16]} />
                <meshStandardMaterial color="#9BD4DF" transparent opacity={0.82} roughness={0.25} />
            </mesh>

            {/* Water Spout */}
            <mesh ref={spoutRef} position={[0, 2.45, 0]} castShadow>
                <coneGeometry args={[0.15, 0.4, 8]} />
                <meshStandardMaterial color="#EAF7F9" transparent opacity={0.68} />
            </mesh>
            <pointLight position={[0, 2.6, 0]} color="#A8C8D9" intensity={0.4} distance={4} />
        </group>
    );
}
