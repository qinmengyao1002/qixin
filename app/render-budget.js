import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Small spatial batches preserve frustum culling. Interactive and animated roots
// stay separate, as do camera collision surfaces and independently lit materials.
export function batchStatic(root, excluded = []) {
  root.updateMatrixWorld(true);
  const skip = new Set(excluded.filter(Boolean)), buckets = new Map();
  const inverse = root.matrixWorld.clone().invert(), position = new THREE.Vector3();
  root.traverse(mesh => {
    if (!mesh.isMesh || mesh.isInstancedMesh || mesh.isSkinnedMesh || mesh.userData.cameraSolid || Array.isArray(mesh.material) || mesh.material.transparent || mesh.material.isShaderMaterial) return;
    for (let p = mesh; p && p !== root; p = p.parent) if (skip.has(p) || p.userData.kind || p.userData.dynamic) return;
    if (!mesh.visible || (mesh.material.emissive?.getHex() && mesh.material.emissiveIntensity > 0)) return;
    mesh.getWorldPosition(position);
    const attributes = Object.keys(mesh.geometry.attributes).sort().map(k => `${k}:${mesh.geometry.attributes[k].itemSize}`).join(',');
    const key = [mesh.material.uuid, Math.floor(position.x / 8), Math.floor(position.z / 8), mesh.castShadow, mesh.receiveShadow, attributes].join('|');
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(mesh);
  });
  let removed = 0;
  for (const meshes of buckets.values()) {
    if (meshes.length < 3) continue;
    const copies = meshes.map(mesh => {
      const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      return geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
    });
    const geometry = mergeGeometries(copies, false);
    copies.forEach(g => g.dispose());
    if (!geometry) continue;
    const batch = new THREE.Mesh(geometry, meshes[0].material);
    batch.castShadow = meshes[0].castShadow; batch.receiveShadow = meshes[0].receiveShadow;
    geometry.computeBoundingSphere(); root.add(batch);
    // Detached geometry never reached the GPU; shared primitive ownership remains
    // with the world. Collision surfaces were deliberately excluded above.
    meshes.forEach(mesh => mesh.removeFromParent()); removed += meshes.length - 1;
  }
  return removed;
}
