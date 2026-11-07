import React, { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  PlaneGeometry,
  DoubleSide,
} from "three";
const surfaces = new Map();
export function useSurface(kind) {
  const texture = useMemo(() => {
    if (surfaces.has(kind)) return surfaces.get(kind);
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d");
    let seed = 42;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    ctx.fillStyle =
      kind === "wood" ? "#b59675" : kind === "fabric" ? "#b7b4a1" : "#e1d9c7";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 12000; i++) {
      const x = random() * 512,
        y = random() * 512;
      ctx.strokeStyle = `rgba(${kind === "wood" ? "63,38,19" : "75,66,51"},${random() * 0.1})`;
      ctx.lineWidth = kind === "wood" ? random() * 1.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + (kind === "wood" ? 60 + random() * 180 : 2),
        y + (kind === "wood" ? Math.sin(x) * 2 : 2),
      );
      ctx.stroke();
    }
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(kind === "wood" ? 2 : 4, kind === "wood" ? 3 : 4);
    surfaces.set(kind, t);
    return t;
  }, [kind]);
  return texture;
}
export function Curtains() {
  const fabric = useSurface("fabric");
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(0.55, 2.65, 24, 12);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(i, Math.sin(p.getX(i) * 65) * 0.055);
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <>
      {[-3.38, 0.38].map((x) => (
        <mesh
          key={x}
          geometry={geometry}
          position={[x, 2.35, -2.47]}
          castShadow
        >
          <meshStandardMaterial
            map={fabric}
            color="#f0e7d2"
            side={DoubleSide}
            roughness={1}
          />
        </mesh>
      ))}
      <mesh position={[-1.5, 3.72, -2.48]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, 4.3, 16]} />
        <meshStandardMaterial
          color="#65543e"
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>
    </>
  );
}
