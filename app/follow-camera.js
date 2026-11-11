// Shortest-arc, time-based heading damping. Never spin 360° at the ±π seam.
export function followHeading(current, heading, dt) {
  const delta = Math.atan2(Math.sin(heading + Math.PI - current), Math.cos(heading + Math.PI - current));
  const step = delta * (1 - Math.exp(-2.4 * dt));
  const limit = 1.15 * dt;
  return current + Math.max(-limit, Math.min(limit, step));
}
