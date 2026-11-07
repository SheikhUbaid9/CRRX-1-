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
  seated,
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
    seated,
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
  useEffect(() => {
    keys.current.clear();
    camera.position.set(
      seated ? -1.4 : 0.6,
      seated ? 1.35 : 1.55,
      seated ? 0.15 : 2.35,
    );
    camera.rotation.set(seated ? -0.08 : -0.07, 0, 0, "YXZ");
    angles.current.copy(camera.rotation);
  }, [seated, camera]);
  useFrame((_, dt) => {
    if (
      document.pointerLockElement !== gl.domElement ||
      latest.current.blocked ||
      latest.current.seated
    )
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
export function HandsRig({ children }) {
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

      {children}
    </group>,
    foreground,
  );
}
