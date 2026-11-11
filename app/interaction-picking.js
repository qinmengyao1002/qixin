// Raycaster also intersects invisible objects. Reject dormant effects and invalid
// transforms before they can swallow a ground click (NaN does not sort by depth).
export function usableHit(hit, maxDistance = Infinity) {
  if (!Number.isFinite(hit.distance) || hit.distance > maxDistance + .02 ||
      ![hit.point.x, hit.point.y, hit.point.z].every(Number.isFinite)) return false;
  for (let object = hit.object; object; object = object.parent) {
    if (!object.visible) return false;
  }
  return true;
}
