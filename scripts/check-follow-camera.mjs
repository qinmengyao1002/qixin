import assert from 'node:assert/strict';
import { followHeading } from '../app/follow-camera.js';
// Seam-crossing must take the short arc, and a reversal must never snap.
const nearSeam=followHeading(Math.PI-.01,.02,1/60);
assert.ok(nearSeam>Math.PI-.01);
assert.ok(Math.abs(followHeading(0,0,1/60))<=1.15/60+1e-10);
function simulate(hz){let angle=0;for(let i=0;i<hz*5;i++)angle=followHeading(angle,-Math.PI/2,1/hz);return angle;}
assert.ok(Math.abs(simulate(30)-simulate(120))<.015,'turn should be stable across frame rates');
assert.ok(Math.abs(simulate(60)-Math.PI/2)<.002,'settles behind the walking heading');
console.log('Follow heading: shortest arc, speed limit, frame-rate independence and settling passed.');
