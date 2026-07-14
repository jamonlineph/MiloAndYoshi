import { RigidBody } from '@react-three/rapier';

export function TownLayout() {
  return (
    <group>
      {/* Foundational Placeholders */}
      
      {/* Courier Cove */}
      <group position={[-5, 0, -2]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[5, 3, 5]} />
            <meshStandardMaterial color="#8C6B52" />
          </mesh>
          <mesh position={[0, 4, 0]} receiveShadow castShadow>
            <coneGeometry args={[4, 2, 6]} />
            <meshStandardMaterial color="#D93D4A" />
          </mesh>
          {/* Deck/Platform */}
          <mesh position={[0, 0.2, 3]} receiveShadow castShadow>
            <boxGeometry args={[4, 0.5, 3]} />
            <meshStandardMaterial color="#6B5440" />
          </mesh>
        </RigidBody>
      </group>

      {/* Tidewhistle Square */}
      <group position={[0, 0, 4]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[3.5, 3.5, 0.4, 16]} />
            <meshStandardMaterial color="#A68A72" />
          </mesh>
          <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
            <meshStandardMaterial color="#8C6B52" />
          </mesh>
        </RigidBody>
      </group>

      {/* Bunrise Bakery */}
      <group position={[5, 0, 9]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[2, 1.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[6, 3, 4]} />
            <meshStandardMaterial color="#E8A95B" />
          </mesh>
          <mesh position={[2, 3.5, 0]} receiveShadow castShadow>
            <coneGeometry args={[4.5, 2, 4.5]} />
            <meshStandardMaterial color="#A94F2B" />
          </mesh>
          {/* Awning placeholder */}
          <mesh position={[2, 2.2, 2.5]} rotation={[-Math.PI / 4, 0, 0]} receiveShadow castShadow>
             <boxGeometry args={[5, 1.8, 0.2]} />
             <meshStandardMaterial color="#D93D4A" />
          </mesh>
        </RigidBody>
      </group>

    </group>
  );
}
