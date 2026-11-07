import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { FirstPerson, HandsRig } from "./FirstPerson";
import { useSurface, Curtains } from "./RoomMaterials";
import Outdoors from "./Outdoors";
import PhysicalBook from "./PhysicalBook";
function Box({ at, size, color, ...rest }) {
  const wood = useSurface("wood"),
    plaster = useSurface("plaster");
  const timber = [
    "#a48260",
    "#a77c52",
    "#73583e",
    "#87674b",
    "#987657",
    "#a7815c",
    "#795c43",
    "#907456",
  ].includes(color);
  return (
    <mesh position={at} castShadow receiveShadow {...rest}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={timber ? wood : plaster}
        color={color}
        roughness={timber ? 0.65 : 0.95}
      />
    </mesh>
  );
}
const CAMERA = { position: [8, 6.5, 10], fov: 38 };
const palette = [
  "#b16e4f",
  "#d4ad70",
  "#66786a",
  "#d7c9a7",
  "#8c5550",
  "#76818a",
];
function Plant({ at, scale = 1 }) {
  return (
    <group position={at} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.17, 0.4, 20]} />
        <meshStandardMaterial color="#c4a186" />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2.4) * 0.18,
            0.55 + (i % 3) * 0.12,
            Math.cos(i * 2.4) * 0.18,
          ]}
          rotation={[i * 0.3, 0, i * 0.5]}
          castShadow
        >
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color={i % 2 ? "#52694b" : "#718365"} />
        </mesh>
      ))}
    </group>
  );
}
function Scene({ night, onShelf, walking, children, books, onPick, onSit }) {
  return (
    <>
      <color attach="background" args={[night ? "#292d36" : "#e8e4da"]} />
      <ambientLight intensity={night ? 0.65 : 1.4} />
      <directionalLight
        position={[2, 7, 4]}
        intensity={night ? 0.5 : 2.6}
        color={night ? "#a8bbdf" : "#fff2d6"}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[-1.5, 2.8, -2.3]}
        color={night ? "#839fbe" : "#ffe4b2"}
        intensity={night ? 1 : 5}
        distance={8}
        decay={2}
      />
      <group position={[0, -0.15, 0]}>
        <Box at={[0, 0.1, -2.86]} size={[8, 0.2, 0.1]} color="#87674b" />
        <Box at={[-3.86, 0.1, 0]} size={[0.1, 0.2, 6]} color="#87674b" />
        <Box at={[0, -0.13, 0]} size={[8, 0.25, 6]} color="#a48260" />
        {Array.from({ length: 16 }, (_, i) => (
          <Box
            key={i}
            at={[-3.8 + i * 0.5, 0.005, 0]}
            size={[0.018, 0.01, 6]}
            color="#937252"
          />
        ))}
        {/* Four wall sections leave a real 3.28 x 2.12 window opening. */}
        <Box at={[-3.605, 2, -3]} size={[0.79, 4, 0.16]} color="#d5d0bd" />
        <Box at={[2.105, 2, -3]} size={[3.79, 4, 0.16]} color="#d5d0bd" />
        <Box at={[-1.5, 0.645, -3]} size={[3.28, 1.29, 0.16]} color="#d5d0bd" />
        <Box at={[-1.5, 3.705, -3]} size={[3.28, 0.59, 0.16]} color="#d5d0bd" />
        <Box at={[-4, 2, 0]} size={[0.16, 4, 6]} color="#ded8c7" />
        {walking && (
          <>
            <Box at={[4, 2, 0]} size={[0.16, 4, 6]} color="#ded8c7" />
            <Box at={[0, 2, 3]} size={[8, 4, 0.16]} color="#d5d0bd" />
            <Box at={[0, 1.2, 2.9]} size={[1.05, 2.5, 0.07]} color="#907456" />
            <Box
              at={[0.35, 1.2, 2.8]}
              size={[0.06, 0.06, 0.06]}
              color="#d1bd8b"
            />
            <Box at={[0, 4, 0]} size={[8, 0.12, 6]} color="#e5dfcf" />
          </>
        )}
        <Outdoors night={night} />
        {[-3.2, 0.2].map((x) => (
          <Box
            key={x}
            at={[x, 2.35, -2.9]}
            size={[0.12, 2.3, 0.16]}
            color="#87674b"
          />
        ))}
        {[1.25, 3.45].map((y) => (
          <Box
            key={y}
            at={[-1.5, y, -2.9]}
            size={[3.5, 0.12, 0.16]}
            color="#87674b"
          />
        ))}
        <Box
          at={[-1.5, 2.35, -2.63]}
          size={[0.065, 2.2, 0.1]}
          color="#eee4cf"
        />
        <Box
          at={[-1.5, 2.35, -2.63]}
          size={[3.35, 0.065, 0.1]}
          color="#eee4cf"
        />
        <Box at={[-1.5, 1.2, -2.58]} size={[3.7, 0.12, 0.4]} color="#b7a17b" />
        <Curtains />
        <group
          position={[2.2, 0, -2.42]}
          onClick={(e) => {
            e.stopPropagation();
            onShelf();
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
        >
          {[-0.94, 0.94].map((x) => (
            <Box
              key={x}
              at={[x, 1.52, 0]}
              size={[0.12, 3.04, 0.52]}
              color="#87674b"
            />
          ))}
          {[0.16, 1.05, 1.95, 2.94].map((y, row) => (
            <group key={y}>
              <Box at={[0, y, 0]} size={[1.95, 0.1, 0.6]} color="#987657" />
              {row < 3 &&
                Array.from({ length: 10 }, (_, i) => (
                  <Box
                    key={i}
                    at={[-0.78 + i * 0.17, y + 0.3 + (i % 3) * 0.035, 0.025]}
                    size={[0.12, 0.5 + (i % 3) * 0.07, 0.32]}
                    color={
                      books[row * 10 + i]?.color || palette[(i + row * 2) % 6]
                    }
                    onClick={(e) => {
                      if (books[row * 10 + i]) {
                        e.stopPropagation();
                        onPick(books[row * 10 + i]);
                      }
                    }}
                    rotation={[0, 0, i === 8 ? -0.15 : 0]}
                  />
                ))}
            </group>
          ))}
        </group>
        <mesh
          position={[-0.1, 0.035, 0.55]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[2, 64]} />
          <meshStandardMaterial color="#d8cbb2" />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={i}
            position={[-0.1, 0.04, 0.55]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[1.1 + i * 0.13, 1.115 + i * 0.13, 64]} />
            <meshStandardMaterial color="#b5a186" />
          </mesh>
        ))}
        <group position={[-1.3, 0, -1.18]}>
          <Box at={[0, 1.15, 0]} size={[2.7, 0.16, 1.12]} color="#a77c52" />
          {[-1.1, 1.1].flatMap((x) =>
            [-0.4, 0.4].map((z) => (
              <Box
                key={`${x}${z}`}
                at={[x, 0.55, z]}
                size={[0.1, 1.1, 0.1]}
                color="#73583e"
              />
            )),
          )}
          <Box
            at={[0.55, 1.27, 0.05]}
            size={[0.48, 0.07, 0.34]}
            color="#677566"
          />
          <Box
            at={[0.5, 1.33, 0.05]}
            size={[0.48, 0.045, 0.34]}
            color="#d5bb8b"
          />
          <mesh position={[-0.5, 1.38, 0.05]}>
            <cylinderGeometry args={[0.095, 0.085, 0.27, 24]} />
            <meshStandardMaterial color="#eee6d5" />
          </mesh>
          <group position={[-0.95, 1.25, -0.25]}>
            <mesh position={[0, 0.32, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.65]} />
              <meshStandardMaterial color="#5f654a" />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
              <coneGeometry args={[0.28, 0.3, 32, 1, true]} />
              <meshStandardMaterial color="#718064" side={2} />
            </mesh>
            <pointLight
              position={[0, 0.51, 0]}
              intensity={night ? 9 : 1}
              color="#ffce83"
              distance={5}
            />
          </group>
        </group>
        <group
          position={[-1.4, 0, 0.35]}
          rotation={[0, 0.2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSit();
          }}
        >
          <Box at={[0, 0.65, 0]} size={[0.85, 0.18, 0.85]} color="#7d886b" />
          <Box at={[0, 1.13, 0.38]} size={[0.85, 0.9, 0.14]} color="#7d886b" />
          {[-0.33, 0.33].flatMap((x) =>
            [-0.3, 0.3].map((z) => (
              <Box
                key={`${x}${z}`}
                at={[x, 0.3, z]}
                size={[0.07, 0.6, 0.07]}
                color="#70573d"
              />
            )),
          )}
        </group>
        <Plant at={[3.1, 0, 0.75]} scale={1.7} />
        <Plant at={[-2.7, 1.25, -2.5]} scale={0.65} />
        <group position={[1.65, 0, 1.2]}>
          <mesh position={[0, 0.56, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.1, 40]} />
            <meshStandardMaterial color="#a7815c" />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.09, 0.2, 0.54, 24]} />
            <meshStandardMaterial color="#795c43" />
          </mesh>
          <Box at={[0, 0.65, 0]} size={[0.42, 0.08, 0.3]} color="#ab765a" />
        </group>
        <Box at={[-3.87, 2.4, 0.3]} size={[0.08, 1.1, 0.85]} color="#937658" />
        <Box at={[-3.81, 2.4, 0.3]} size={[0.02, 0.91, 0.67]} color="#eee4cd" />
      </group>
      <ContactShadows
        frames={1}
        position={[0, -0.25, 0]}
        opacity={0.25}
        scale={14}
        blur={2.5}
        far={6}
      />
      {children}
      {!walking && (
        <OrbitControls
          makeDefault
          target={[0, 1, 0]}
          minDistance={6}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={0.35}
          enablePan={false}
        />
      )}
    </>
  );
}
export default function Room({
  night,
  onShelf,
  books = [],
  onRead,
  onUpdate,
  onImport,
}) {
  const [walking, setWalking] = useState(false),
    [locked, setLocked] = useState(false),
    [near, setNear] = useState(false),
    [shelfOpen, setShelfOpen] = useState(false),
    [held, setHeld] = useState(null),
    [command, setCommand] = useState({ id: 0, direction: 1 }),
    [status, setStatus] = useState({ loading: true }),
    [turning, setTurning] = useState(false),
    [reading, setReading] = useState(true),
    [bookZoom, setBookZoom] = useState(1),
    [bookPan, setBookPan] = useState({ x: 0, y: 0 }),
    [seated, setSeated] = useState(false),
    [ink, setInk] = useState(1.2);
  const drag = useRef(null);
  const region = useRef();
  const unlock = () => {
    setLocked(false);
    if (document.pointerLockElement) document.exitPointerLock();
  };
  function browse() {
    unlock();
    setShelfOpen(true);
  }
  function pick(book) {
    unlock();
    setHeld(book);
    setReading(true);
    setBookZoom(1);
    setBookPan({ x: 0, y: 0 });
    setStatus({ loading: true });
    setTurning(false);
    setWalking(true);
    setShelfOpen(false);
  }
  function putDown() {
    setHeld(null);
    setTurning(false);
  }
  function leave() {
    unlock();
    setWalking(false);
    setSeated(false);
    setShelfOpen(false);
    putDown();
    setNear(false);
  }
  function turn(direction) {
    if (!held || turning || status.loading || status.error) return;
    setCommand((c) => ({ id: c.id + 1, direction }));
  }
  function read() {
    if (!held) return;
    unlock();
    if (document.fullscreenElement) document.exitFullscreen?.();
    onRead(held);
    leave();
  }
  function toggleReading() {
    if (!held) return;
    unlock();
    setReading((r) => !r);
  }
  function interact(close) {
    if (held) {
      putDown();
      return;
    }
    if (close) browse();
  }
  useEffect(() => {
    if (walking)
      region.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [walking]);
  useEffect(
    () => () => {
      document.body.style.cursor = "auto";
    },
    [],
  );
  return (
    <div
      ref={region}
      className={
        walking
          ? `immersive-room walking-room ${held && reading ? "reading-in-room" : ""}`
          : "immersive-room"
      }
    >
      <Canvas
        frameloop={walking && (locked || turning) ? "always" : "demand"}
        shadows
        camera={CAMERA}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Scene
            night={night}
            books={books}
            walking={walking}
            onPick={pick}
            onSit={() => {
              unlock();
              setWalking(true);
              setSeated(true);
            }}
            onShelf={walking ? browse : onShelf}
          >
            {walking && (
              <>
                <FirstPerson
                  onLocked={setLocked}
                  onNear={setNear}
                  onInteract={interact}
                  onTurn={turn}
                  onRead={read}
                  blocked={shelfOpen || (reading && !!held)}
                  onReading={toggleReading}
                  seated={seated}
                />
                <HandsRig>
                  {held && (
                    <PhysicalBook
                      key={held.id}
                      book={held}
                      reading={reading}
                      ink={ink}
                      zoom={bookZoom}
                      pan={bookPan}
                      command={command}
                      onUpdate={(b) => {
                        setHeld(b);
                        onUpdate(b);
                      }}
                      onStatus={setStatus}
                      onTurning={setTurning}
                    />
                  )}
                </HandsRig>
              </>
            )}
          </Scene>
        </Suspense>
      </Canvas>
      {!walking && (
        <button className="enter-room primary" onClick={() => setWalking(true)}>
          Enter the room <span>→</span>
        </button>
      )}
      {walking && (
        <>
          {held && reading && bookZoom > 1 && (
            <div
              className="book-pan-surface"
              aria-label="Drag to move the enlarged book"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                const dx =
                    (e.clientX - drag.current.x) / e.currentTarget.clientHeight,
                  dy =
                    (e.clientY - drag.current.y) / e.currentTarget.clientHeight;
                drag.current = { x: e.clientX, y: e.clientY };
                setBookPan((p) => ({
                  x: Math.max(-1.5, Math.min(1.5, p.x + dx)),
                  y: Math.max(-1.5, Math.min(1.5, p.y - dy)),
                }));
              }}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
            >
              <span>Drag to move around the page</span>
            </div>
          )}
          <div className="walk-top">
            <button
              className="walk-button"
              onClick={() => {
                unlock();
                setSeated((s) => !s);
              }}
            >
              {seated ? "Stand up" : "Sit at desk"}
            </button>
            <span className="walk-label">
              {seated ? "STILLROOM / SEATED" : "STILLROOM / FIRST PERSON"}
            </span>
            <button className="walk-button" onClick={leave}>
              Exit room
            </button>
          </div>
          {!locked && !shelfOpen && !(held && reading) && (
            <div className="walk-pause">
              <h3>
                {held
                  ? "Your next world is in your hands."
                  : "Step into your quiet corner."}
              </h3>
              <p>
                Click inside the room to capture your mouse.
                <br />
                WASD to walk · Mouse to look · Esc to release
              </p>
              <button className="walk-button" onClick={browse}>
                Browse your books
              </button>
              <small>
                Keyboard & mouse recommended. Allow mouse capture if prompted.
              </small>
            </div>
          )}
          {locked && (
            <>
              <div className="crosshair" />
              <div className="interaction-hint">
                {held
                  ? "← / → Pages · R Enlarge book · F Highlight · E Put away"
                  : seated
                    ? "Seated · Mouse look · Stand up to walk"
                    : near
                      ? "E · Pick a book from the shelf"
                      : "WASD Walk · Mouse Look · Find a book at the shelf"}
                <small>ESC releases your mouse</small>
              </div>
            </>
          )}
          {held && (
            <div className="held-controls">
              <div>
                <strong>{held.title}</strong>
                <span>
                  {status.error
                    ? `PDF error: ${status.error}`
                    : status.loading
                      ? "Preparing PDF pages…"
                      : `Pages ${status.page}–${Math.min(status.page + 1, status.total)} of ${status.total}`}
                </span>
              </div>
              <button
                aria-label="Previous spread"
                disabled={
                  turning || status.loading || status.error || status.page <= 1
                }
                onClick={() => turn(-1)}
              >
                ←
              </button>
              <button
                aria-label="Next spread"
                disabled={
                  turning ||
                  status.loading ||
                  status.error ||
                  status.page + 2 > status.total
                }
                onClick={() => turn(1)}
              >
                →
              </button>
              {reading && (
                <div className="book-zoom">
                  <button
                    aria-label="Zoom book out"
                    disabled={bookZoom <= 1}
                    onClick={() => {
                      setBookZoom((z) => Math.max(1, z - 0.25));
                      setBookPan({ x: 0, y: 0 });
                    }}
                  >
                    −
                  </button>
                  <span>{Math.round(bookZoom * 100)}%</span>
                  <button
                    aria-label="Zoom book in"
                    disabled={bookZoom >= 2.5}
                    onClick={() => setBookZoom((z) => Math.min(2.5, z + 0.25))}
                  >
                    +
                  </button>
                </div>
              )}
              <label className="ink-control">
                Ink
                <input
                  aria-label="Ink contrast"
                  type="range"
                  min="1"
                  max="2"
                  step=".1"
                  value={ink}
                  onChange={(e) => setInk(Number(e.target.value))}
                />
              </label>
              <button onClick={toggleReading}>
                {reading ? "Hold & walk" : "Read in room"}
              </button>
              <button onClick={read}>Focus & highlight</button>
              <button onClick={putDown}>Put away</button>
            </div>
          )}
          {shelfOpen && (
            <div className="shelf-picker">
              <div className="shelf-picker-panel">
                <div className="shelf-picker-header">
                  <div>
                    <small>YOUR PERSONAL LIBRARY</small>
                    <h3>Pick your next world.</h3>
                  </div>
                  <button
                    className="walk-button"
                    onClick={() => setShelfOpen(false)}
                    aria-label="Close bookshelf"
                  >
                    ✕
                  </button>
                </div>
                <p>Choose a PDF to hold and leaf through inside the room.</p>
                <div className="shelf-picks">
                  {books.map((b) => (
                    <button key={b.id} onClick={() => pick(b)}>
                      <span style={{ background: b.color }}>✳</span>
                      <div>
                        <strong>{b.title}</strong>
                        <small>
                          {b.pages} pages · Resume at page {b.page || 1}
                        </small>
                      </div>
                      <span className="pick-arrow">↗</span>
                    </button>
                  ))}
                </div>
                {!books.length && (
                  <p className="shelf-empty">
                    Your shelf is waiting for its first book.
                  </p>
                )}
                <button
                  className="primary"
                  onClick={() => {
                    setShelfOpen(false);
                    onImport();
                  }}
                >
                  + Import a PDF
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
