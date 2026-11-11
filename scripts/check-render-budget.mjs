import assert from 'node:assert/strict';
import * as THREE from 'three';
import {batchStatic} from '../app/render-budget.js';
const root=new THREE.Group();root.position.set(10,0,-4);
const material=new THREE.MeshStandardMaterial(), geometry=new THREE.BoxGeometry();
const before=new THREE.Box3();
for(let i=0;i<12;i++){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(i*.15,1,0);root.add(mesh);}
root.updateMatrixWorld(true);for(const mesh of root.children)before.union(new THREE.Box3().setFromObject(mesh));
const actor=new THREE.Group();actor.userData.kind='person';root.add(actor);const head=new THREE.Mesh(geometry,material);actor.add(head);
const collider=new THREE.Mesh(geometry,material);collider.userData.cameraSolid=true;root.add(collider);
assert.equal(batchStatic(root),11);
assert.equal(head.parent,actor);assert.equal(collider.parent,root);
const combined=root.children.find(o=>o.isMesh&&o!==collider);
const after=new THREE.Box3().setFromObject(combined);
assert(before.min.distanceTo(after.min)<1e-5&&before.max.distanceTo(after.max)<1e-5,'nested transforms must be preserved');
assert.equal(combined.geometry.attributes.position.count,12*36);
assert.equal(batchStatic(root),0,'batching is idempotent');
console.log('PASS: batching reduces 12 static meshes to 1, preserves world bounds and interactive/collision objects');
