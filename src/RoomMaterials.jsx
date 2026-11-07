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
export function ScenicWindow({ night }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1536;
    c.height = 1024;
    const x = c.getContext("2d");
    const sky = x.createLinearGradient(0, 0, 0, 1024);
    sky.addColorStop(0, night ? "#14243b" : "#86b2cc");
    sky.addColorStop(0.65, night ? "#536479" : "#f4dfb0");
    sky.addColorStop(1, night ? "#263d43" : "#829b89");
    x.fillStyle = sky;
    x.fillRect(0, 0, 1536, 1024);
    let seed = 52;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    if (night) {
      x.fillStyle = "#f6edce";
      for (let i = 0; i < 140; i++)
        x.fillRect(rand() * 1536, rand() * 420, rand() * 2 + 1, 1.5);
    }
    x.fillStyle = night ? "#fff0cf" : "#fff3d2";
    x.beginPath();
    x.arc(1140, 230, night ? 39 : 65, 0, Math.PI * 2);
    x.fill();
    for (let layer = 0; layer < 6; layer++) {
      x.fillStyle = night
        ? ["#536377", "#455769", "#384c5b", "#2c4350", "#223c41", "#183735"][
            layer
          ]
        : ["#a3b7b6", "#8ba7a8", "#729692", "#5f8577", "#4b705b", "#37533e"][
            layer
          ];
      x.beginPath();
      x.moveTo(0, 1024);
      for (let i = 0; i <= 80; i++) {
        const px = (i / 80) * 1536;
        const y =
          500 +
          layer * 65 +
          Math.sin(i * 0.12 + layer * 2) * 95 +
          Math.sin(i * 0.31 + layer) * 38;
        x.lineTo(px, y);
      }
      x.lineTo(1536, 1024);
      x.fill();
      if (layer > 2) {
        for (let i = 0; i < 80; i++) {
          const px = rand() * 1536,
            y = 650 + layer * 52 + rand() * 50,
            h = 30 + rand() * 90;
          x.fillStyle = night ? "#1c3333" : "#3d6047";
          x.fillRect(px - 1, y, 2, h);
          for (let j = 0; j < 4; j++) {
            const top = y - h + j * h * 0.19;
            x.beginPath();
            x.moveTo(px, top);
            x.lineTo(px - h * (0.12 + j * 0.03), top + h * 0.36);
            x.lineTo(px + h * (0.12 + j * 0.03), top + h * 0.36);
            x.fill();
          }
        }
      }
    }
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [night]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[-1.5, 2.35, -2.76]}>
      <planeGeometry args={[3.28, 2.12]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
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
