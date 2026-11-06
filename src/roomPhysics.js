// Player radius is included in these furniture footprints (room coordinates).
export const obstacles = [
  [-2.9, 0.3, -2.05, -0.5], // writing desk
  [-2.13, -0.67, -0.35, 1.15], // chair
  [1.0, 2.3, 0.55, 1.85], // side table
  [2.5, 3.7, 0.15, 1.35], // plant
  [1.0, 3.4, -2.85, -1.85], // bookcase
];
export function canStand(x, z) {
  return (
    x >= -3.62 &&
    x <= 3.62 &&
    z >= -2.62 &&
    z <= 2.62 &&
    !obstacles.some(
      ([left, right, back, front]) =>
        x > left && x < right && z > back && z < front,
    )
  );
}
export function movePlayer(position, dx, dz) {
  // Substeps prevent tunnelling after a slow frame; axis separation lets players slide along furniture.
  const count = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08));
  let { x, z } = position;
  for (let i = 0; i < count; i++) {
    if (canStand(x + dx / count, z)) x += dx / count;
    if (canStand(x, z + dz / count)) z += dz / count;
  }
  return { x, z };
}
export function spreadFor(page) {
  return Math.max(1, page - ((page - 1) % 2));
}
export function nearShelf(x, z) {
  return Math.hypot(x - 2.2, z + 2.1) < 1.9;
}
