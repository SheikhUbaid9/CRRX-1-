import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, Color, Object3D, PlaneGeometry } from "three";
// All scenery is world-space geometry, visible through an actual opening in the wall.
export default function Outdoors({ night }) {
  const trees = useMemo(() => {
    let seed = 71;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    return Array.from({ length: 75 }, () => ({
      x: (random() - 0.5) * 65,
      z: -7 - random() * 48,
      height: 2 + random() * 5,
    }));
  }, []);
  const trunks = useRef(),
    crowns = useRef(),
    clouds = useRef();
  const terrain = useMemo(() => {
    const g = new PlaneGeometry(90, 75, 48, 48);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getZ(i);
      p.setY(i, -1.1 + Math.sin(x * 0.12) * Math.cos(z * 0.1) * 0.65);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => terrain.dispose(), [terrain]);
  useEffect(() => {
    const dummy = new Object3D();
    trees.forEach((t, i) => {
      dummy.position.set(t.x, t.height * 0.5 - 1, t.z);
      dummy.scale.set(0.12, t.height, 0.12);
      dummy.updateMatrix();
      trunks.current.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 3; j++) {
        dummy.position.set(
          t.x + (j - 1) * 0.45,
          t.height * (0.68 + j * 0.1) - 1,
          t.z + Math.sin(i + j) * 0.35,
        );
        dummy.scale.set(t.height * 0.28, t.height * 0.3, t.height * 0.25);
        dummy.updateMatrix();
        crowns.current.setMatrixAt(i * 3 + j, dummy.matrix);
        crowns.current.setColorAt(
          i * 3 + j,
          new Color(
            night ? "#284b45" : ["#4f744f", "#668250", "#7a925c"][i % 3],
          ),
        );
      }
    });
    trunks.current.instanceMatrix.needsUpdate = true;
    crowns.current.instanceMatrix.needsUpdate = true;
    crowns.current.instanceColor.needsUpdate = true;
    trunks.current.computeBoundingSphere();
    crowns.current.computeBoundingSphere();
  }, [trees, night]);
  useFrame(({ clock }) => {
    if (clouds.current)
      clouds.current.position.x = Math.sin(clock.elapsedTime * 0.025) * 2;
  });
  return (
    <group name="outdoor-world">
      <mesh>
        <sphereGeometry args={[110, 32, 20]} />
        <meshBasicMaterial
          color={night ? "#172b46" : "#a6c8db"}
          side={BackSide}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={terrain} position={[0, -0.15, -39]} receiveShadow>
        <meshStandardMaterial
          color={night ? "#233e36" : "#778a57"}
          roughness={1}
        />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[-35 + i * 17, 2, -58 - (i % 2) * 10]}
          scale={[16, 11 + (i % 3) * 3, 10]}
        >
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial
            color={night ? "#263e51" : ["#839d9b", "#718f90", "#91a7a2"][i % 3]}
            roughness={1}
          />
        </mesh>
      ))}
      <instancedMesh ref={trunks} args={[null, null, trees.length]}>
        <cylinderGeometry args={[0.7, 1, 1, 8]} />
        <meshStandardMaterial color="#67523d" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[null, null, trees.length * 3]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <mesh position={[20, 26, -75]}>
        <sphereGeometry args={[night ? 2 : 4, 32, 24]} />
        <meshBasicMaterial
          color={night ? "#f9eed0" : "#fff6dc"}
          toneMapped={false}
        />
      </mesh>
      <group ref={clouds}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[-35 + i * 18, 18 + (i % 2) * 5, -46 - (i % 3) * 8]}
            scale={[7, 1.2, 2]}
          >
            <sphereGeometry args={[1, 24, 12]} />
            <meshBasicMaterial
              color={night ? "#56667b" : "#eef2ee"}
              transparent
              opacity={0.65}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
