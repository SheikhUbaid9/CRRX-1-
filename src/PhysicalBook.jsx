import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  CanvasTexture,
  FrontSide,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import * as pdfjs from "pdfjs-dist";
import { spreadFor } from "./roomPhysics";
const WIDTH = 0.29,
  HEIGHT = 0.405;
function Page({ texture, x, onClick }) {
  return (
    <mesh position={[x, 0, 0.012]} onClick={onClick}>
      <planeGeometry args={[WIDTH, HEIGHT]} />
      <meshBasicMaterial
        key={texture?.uuid || "blank"}
        map={texture}
        color={texture ? "#ffffff" : "#f3eddd"}
      />
    </mesh>
  );
}
function TurningLeaf({ front, back, direction, onComplete }) {
  const progress = useRef(0),
    done = useRef(false);
  const geometries = useMemo(() => {
    const a = new PlaneGeometry(WIDTH, HEIGHT, 30, 8);
    a.translate(WIDTH / 2, 0, 0);
    const b = a.clone();
    const uv = b.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    return [a, b];
  }, []);
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  useFrame((_, dt) => {
    if (done.current) return;
    progress.current = Math.min(
      1,
      progress.current + Math.min(dt, 0.05) / 0.85,
    );
    const t = progress.current,
      e = t * t * (3 - 2 * t),
      angle = (direction === 1 ? e : 1 - e) * Math.PI;
    for (const geo of geometries) {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = (i % 31) / 30; // PlaneGeometry vertices are ordered by row, left to right.
        const x = u * WIDTH;
        const curl = Math.sin(t * Math.PI) * Math.sin(u * Math.PI) * 0.075;
        pos.setXYZ(
          i,
          x * Math.cos(angle),
          HEIGHT / 2 - (Math.floor(i / 31) / 8) * HEIGHT,
          Math.sin(angle) * x + curl + 0.016,
        );
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
    }
    if (t === 1) {
      done.current = true;
      onComplete();
    }
  });
  return (
    <group>
      <mesh geometry={geometries[0]}>
        <meshBasicMaterial map={front} side={FrontSide} />
      </mesh>
      <mesh geometry={geometries[1]}>
        <meshBasicMaterial
          map={back}
          side={BackSide}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
    </group>
  );
}
export default function PhysicalBook({
  book,
  command,
  onUpdate,
  onStatus,
  onTurning,
}) {
  const [doc, setDoc] = useState(null),
    [spread, setSpread] = useState(() => spreadFor(book.page || 1)),
    [assets, setAssets] = useState(null),
    [turn, setTurn] = useState(null),
    [error, setError] = useState("");
  const latest = useRef();
  latest.current = { book, onUpdate };
  const textures = useRef(new Set());
  useEffect(() => {
    let cancelled = false;
    const task = pdfjs.getDocument({ data: book.data.slice(0) });
    task.promise
      .then((d) => {
        if (!cancelled) setDoc(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
      task.destroy();
      textures.current.forEach((t) => t.dispose());
      textures.current.clear();
    };
  }, [book.id]);
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    const renderTasks = [];
    const created = [];
    setError("");
    onStatus({ page: spread, total: doc.numPages, loading: true });
    (async () => {
      const pages = {};
      for (let n = spread - 2; n <= spread + 3; n++) {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 1100;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fffdf6";
        ctx.fillRect(0, 0, 800, 1100);
        if (n >= 1 && n <= doc.numPages) {
          const p = await doc.getPage(n);
          if (cancelled) return;
          const base = p.getViewport({ scale: 1 });
          const scale = Math.min(800 / base.width, 1100 / base.height);
          const viewport = p.getViewport({ scale });
          const job = p.render({
            canvasContext: ctx,
            viewport,
            transform: [
              1,
              0,
              0,
              1,
              (800 - viewport.width) / 2,
              (1100 - viewport.height) / 2,
            ],
            background: "#fffdf6",
          });
          renderTasks.push(job);
          await job.promise;
        } else {
          ctx.fillStyle = "#b3ac98";
          ctx.font = "14px serif";
          ctx.textAlign = "center";
          ctx.fillText("STILLROOM", 400, 550);
        }
        if (cancelled) return;
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        pages[n] = texture;
        textures.current.add(texture);
        created.push(texture);
      }
      if (cancelled) return;
      setAssets({ at: spread, pages });
      onStatus({ page: spread, total: doc.numPages, loading: false });
    })().catch((e) => {
      if (!cancelled && e.name !== "RenderingCancelledException")
        setError(e.message);
    });
    return () => {
      cancelled = true;
      renderTasks.forEach((t) => t.cancel());
      created.forEach((t) => {
        t.dispose();
        textures.current.delete(t);
      });
    };
  }, [doc, spread, onStatus]);
  useEffect(() => {
    if (error)
      onStatus({
        page: spread,
        total: doc?.numPages || book.pages,
        loading: false,
        error,
      });
  }, [error, spread, doc, book.pages, onStatus]);
  function start(direction) {
    if (turn || !assets || assets.at !== spread || error) return;
    const target = spread + direction * 2;
    if (target < 1 || target > doc.numPages) return;
    setTurn({ direction, target });
    onTurning(true);
  }
  useEffect(() => {
    if (command.id) start(command.direction);
  }, [command.id]);
  function finish() {
    const page = turn.target;
    setSpread(page);
    setTurn(null);
    onTurning(false);
    latest.current.onUpdate({ ...latest.current.book, page });
  }
  const maps = assets?.at === spread ? assets.pages : null;
  const left = turn?.direction === -1 ? maps?.[spread - 2] : maps?.[spread];
  const right = turn?.direction === 1 ? maps?.[spread + 3] : maps?.[spread + 1];
  return (
    <group position={[0, -0.225, -0.77]} rotation={[-0.12, 0, 0]}>
      <mesh position={[0, 0, -0.016]}>
        <boxGeometry args={[WIDTH * 2 + 0.035, HEIGHT + 0.035, 0.025]} />
        <meshStandardMaterial color={book.color || "#60725a"} roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (WIDTH / 2 + 0.002), 0, -0.001]}>
          <boxGeometry args={[WIDTH, HEIGHT, 0.018]} />
          <meshStandardMaterial color="#dfdacb" />
        </mesh>
      ))}
      <Page texture={left} x={-WIDTH / 2} onClick={() => start(-1)} />
      <Page texture={right} x={WIDTH / 2} onClick={() => start(1)} />
      <mesh position={[0, 0, 0.013]}>
        <boxGeometry args={[0.004, HEIGHT, 0.004]} />
        <meshBasicMaterial color="#c5bba3" />
      </mesh>
      {turn && maps && (
        <TurningLeaf
          key={`${spread}-${turn.direction}`}
          direction={turn.direction}
          front={maps[turn.direction === 1 ? spread + 1 : spread - 1]}
          back={maps[turn.direction === 1 ? spread + 2 : spread]}
          onComplete={finish}
        />
      )}
    </group>
  );
}
