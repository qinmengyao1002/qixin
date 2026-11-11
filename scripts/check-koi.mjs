import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createKoi} from '../app/koi.js';
const parent=new THREE.Group(),root=createKoi(parent);
assert.equal(root.children.length,5);
root.userData.tick(0);const starts=root.children.map(g=>g.position.clone());
for(let t=0;t<600;t+=.25){root.userData.tick(t);for(const g of root.children){assert.ok(((g.position.x+6.3)/3.5)**2+((g.position.z-6.3)/2.55)**2<.7);assert.ok(g.position.y+.06<.16);}}
assert.ok(root.children.every((g,i)=>g.position.distanceTo(starts[i])>.1));
console.log('Five fish stay below water and inside the shore throughout ten simulated minutes.');
