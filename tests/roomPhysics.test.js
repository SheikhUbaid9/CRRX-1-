import test from "node:test";
import assert from "node:assert/strict";
import {
  canStand,
  movePlayer,
  spreadFor,
  nearShelf,
} from "../src/roomPhysics.js";
test("player stops at walls even with a large movement", () => {
  const result = movePlayer({ x: 0.6, z: 2.35 }, 0, 10);
  assert.ok(result.z <= 2.62);
  assert.ok(canStand(result.x, result.z));
});
test("player cannot walk through the desk but can slide beside it", () => {
  const result = movePlayer({ x: 0.6, z: -1 }, -4, 0);
  assert.ok(result.x >= 0.3);
  assert.equal(canStand(-1, -1), false);
  const slide = movePlayer({ x: 0.35, z: -1 }, -0.1, -0.3);
  assert.ok(slide.x >= 0.3);
  assert.ok(slide.z < -1);
});
test("diagonal movement stays within the room", () => {
  const result = movePlayer({ x: 0, z: 2.3 }, -100, -100);
  assert.ok(canStand(result.x, result.z));
});
test("saved PDF pages map to the correct two-page spread", () => {
  assert.equal(spreadFor(1), 1);
  assert.equal(spreadFor(2), 1);
  assert.equal(spreadFor(3), 3);
  assert.equal(spreadFor(100), 99);
});
test("shelf pickup requires proximity", () => {
  assert.equal(nearShelf(2.2, -1.3), true);
  assert.equal(nearShelf(0.6, 2.35), false);
});
