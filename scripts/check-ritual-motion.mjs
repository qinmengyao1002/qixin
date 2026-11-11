import assert from 'node:assert/strict';
import {ritualPose,RITUAL_DURATION} from '../app/ritual-motion.js';
for(const kind of Object.keys(RITUAL_DURATION)){
 const duration=RITUAL_DURATION[kind];
 assert(!ritualPose(kind,0).done);assert(ritualPose(kind,duration).done);
 for(let t=0;t<duration;t+=.01){const a=ritualPose(kind,t),b=ritualPose(kind,t+.01);assert(Number.isFinite(a.arm)&&a.release>=0&&a.release<=1);assert(Math.abs(b.arm-a.arm)<.1);}
}
assert.equal(ritualPose('incense',4.6).release,0);
assert.equal(ritualPose('incense',7.4).release,1);
assert.equal(ritualPose('lantern',3.8).release,1);
assert.equal(ritualPose('sip',0).arm,ritualPose('sip',3).arm);
console.log('PASS: continuous ritual poses, delayed incense insertion, lantern release, complete sip cycle');
