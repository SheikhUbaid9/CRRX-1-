import React, { useEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Euler, MathUtils, Scene } from "three";
import { movePlayer, nearShelf } from "./roomPhysics";
export function FirstPerson({
  onLocked,
  onNear,
  onInteract,
  onTurn,
  onRead,
  blocked,
  onReading,
}) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set()),
    locked = useRef(false),
    angles = useRef(new Euler(0, 0, 0, "YXZ"));
  const latest = useRef();
  latest.current = {
    onLocked,
    onNear,
    onInteract,
    onTurn,
    onRead,
    blocked,
    onReading,
  };
  useEffect(() => {
    camera.position.set(0.6, 1.55, 2.35);
    camera.rotation.set(-0.07, 0, 0, "YXZ");
    camera.fov = 67;
    camera.near = 0.03;
    camera.updateProjectionMatrix();
    angles.current.copy(camera.rotation);
    let near = false;
    const update = () => {
      locked.current = document.pointerLockElement === gl.domElement;
      if (!locked.current) keys.current.clear();
      latest.current.onLocked(locked.current);
    };
    const click = () => {
      if (latest.current.blocked || locked.current) return;
      try {
        const request = gl.domElement.requestPointerLock();
        request?.catch?.(() => latest.current.onLocked(false));
      } catch {
        latest.current.onLocked(false);
      }
    };
    const mouse = (e) => {
      if (document.pointerLockElement !== gl.domElement) return;
      angles.current.y -= e.movementX * 0.002;
      angles.current.x = MathUtils.clamp(
        angles.current.x - e.movementY * 0.002,
        -1.15,
        1.15,
      );
      camera.quaternion.setFromEuler(angles.current);
    };
    const down = (e) => {
      if (document.pointerLockElement !== gl.domElement) return;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
        ].includes(e.code)
      )
        e.preventDefault();
      keys.current.add(e.code);
      if (e.repeat) return;
      if (e.code === "KeyE")
        latest.current.onInteract(
          nearShelf(camera.position.x, camera.position.z),
        );
      if (e.code === "ArrowRight") latest.current.onTurn(1);
      if (e.code === "ArrowLeft") latest.current.onTurn(-1);
      if (e.code === "KeyF") latest.current.onRead();
      if (e.code === "KeyR") latest.current.onReading();
    };
    const up = (e) => keys.current.delete(e.code);
    const blur = () => {
      keys.current.clear();
      if (document.pointerLockElement === gl.domElement)
        document.exitPointerLock();
    };
    document.addEventListener("pointerlockchange", update);
    document.addEventListener("mousemove", mouse);
    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    gl.domElement.addEventListener("click", click);
    const timer = setInterval(() => {
      const next = nearShelf(camera.position.x, camera.position.z);
      if (next !== near) {
        near = next;
        latest.current.onNear(next);
      }
    }, 150);
    return () => {
      clearInterval(timer);
      blur();
      document.removeEventListener("pointerlockchange", update);
      document.removeEventListener("mousemove", mouse);
      document.removeEventListener("keydown", down);
      document.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      gl.domElement.removeEventListener("click", click);
      camera.fov = 38;
      camera.position.set(8, 6.5, 10);
      camera.lookAt(0, 1, 0);
      camera.updateProjectionMatrix();
    };
  }, [camera, gl]);
  useFrame((_, dt) => {
    if (document.pointerLockElement !== gl.domElement || latest.current.blocked)
      return;
    const k = keys.current;
    let x = Number(k.has("KeyD")) - Number(k.has("KeyA")),
      z = Number(k.has("KeyW")) - Number(k.has("KeyS"));
    const len = Math.hypot(x, z);
    if (!len) return;
    x /= len;
    z /= len;
    const speed = Math.min(dt, 0.05) * (k.has("ShiftLeft") ? 2.5 : 1.65),
      yaw = angles.current.y;
    const next = movePlayer(
      camera.position,
      (x * Math.cos(yaw) - z * Math.sin(yaw)) * speed,
      (-x * Math.sin(yaw) - z * Math.cos(yaw)) * speed,
    );
    camera.position.x = next.x;
    camera.position.z = next.z;
  });
  return null;
}
function Hand({ side, holding, turning }) {
  const hand = useRef();
  useFrame(({ clock }, dt) => {
    if (!hand.current) return;
    const target = side === 1 && turning ? 0.11 : 0;
    hand.current.position.y = MathUtils.damp(
      hand.current.position.y,
      target,
      8,
      dt,
    );
    hand.current.rotation.z =
      side * (0.13 + Math.sin(clock.elapsedTime * 1.5) * 0.015);
  });
  return (
    <group
      position={[
        side * (holding ? 0.305 : 0.28),
        holding ? -0.42 : -0.53,
        holding ? -0.64 : -0.62,
      ]}
      rotation={[0.2, side * -0.3, side * 0.1]}
    >
      <group ref={hand}>
        <mesh position={[0, -0.18, 0.05]} rotation={[-0.25, 0, 0]}>
          <capsuleGeometry args={[0.046, 0.26, 6, 12]} />
          <meshStandardMaterial color="#77816a" roughness={0.9} />
        </mesh>
        <mesh scale={[0.058, 0.09, 0.035]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#cb9977" roughness={0.85} />
        </mesh>
        {Array.from({ length: 4 }, (_, i) => (
          <group
            key={i}
            position={[(i - 1.5) * 0.024, 0.068, -0.004]}
            rotation={[-0.6, 0, (i - 1.5) * -0.07]}
          >
            <mesh position={[0, 0.03, 0]}>
              <capsuleGeometry
                args={[0.011, 0.046 - (i === 3 ? 0.014 : 0), 4, 8]}
              />
              <meshStandardMaterial color="#d7a583" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.055, -0.016]} rotation={[-0.9, 0, 0]}>
              <capsuleGeometry args={[0.01, 0.025, 4, 8]} />
              <meshStandardMaterial color="#d7a583" roughness={0.8} />
            </mesh>
          </group>
        ))}
        <mesh
          position={[-side * 0.055, 0.01, 0.018]}
          rotation={[0.4, 0, side * 0.7]}
        >
          <capsuleGeometry args={[0.016, 0.045, 5, 10]} />
          <meshStandardMaterial color="#d7a583" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
export function HandsRig({ holding, turning, children }) {
  const rig = useRef();
  const foreground = useMemo(() => new Scene(), []);
  useFrame(({ camera }) => {
    rig.current.position.copy(camera.position);
    rig.current.quaternion.copy(camera.quaternion);
  });
  // Standard first-person viewmodel pass: world depth must not cut through held objects.
  useFrame(({ gl, scene, camera }) => {
    const autoClear = gl.autoClear;
    gl.autoClear = true;
    gl.render(scene, camera);
    gl.autoClear = false;
    gl.clearDepth();
    gl.render(foreground, camera);
    gl.autoClear = autoClear;
  }, 1);
  return createPortal(
    <group ref={rig}>
      <ambientLight intensity={1.8} />
      <pointLight
        position={[0, 0.1, -0.4]}
        intensity={0.5}
        distance={1.8}
        color="#fff0d6"
      />
      <Hand side={-1} holding={holding} />
      <Hand side={1} holding={holding} turning={turning} />
      {children}
    </group>,
    foreground,
  );
}
