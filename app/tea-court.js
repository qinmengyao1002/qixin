import * as THREE from 'three';
import { BENCHES } from './data';

// A Chinese garden tea kiosk: full tiled roof, timber joinery, lattice and serving counter.
export function buildTeaCourt(stage,pickables,{mesh,group,roof,tag,line}){
  const wood='#54433a',jade='#48605b',cream='#d4ceba';
  const cafe=group(stage,[7.2,0,.2]);
  mesh(cafe,'box',[0,.14,0],[4.5,.28,3.4],'#8f9187');
  mesh(cafe,'box',[0,1.7,-1.4],[4.1,3.2,.18],cream);
  for(const x of [-2,2]){mesh(cafe,'box',[x,1.7,0],[.16,3.2,2.8],cream);for(const z of [-1.4,1.4])mesh(cafe,'cylinder',[x,1.8,z],[.12,3.3,.12],wood);}
  mesh(cafe,'box',[0,3.25,1.4],[4.3,.25,.22],jade);roof(cafe,5.1,4.1,3.45,.85,'#626d68');
  tag(cafe,'桂 隐 · 茶 咖',[0,2.96,1.55],{width:2.6,font:42});
  mesh(cafe,'box',[0,.75,1.2],[3.7,1.15,.65],jade);mesh(cafe,'round',[0,1.36,1.2],[3.95,.13,.85],wood);
  for(let i=0;i<15;i++)mesh(cafe,'box',[-1.7+i*.24,.78,1.54],[.055,.95,.045],wood);
  for(const x of [-1.5,-.5,.5,1.5]){mesh(cafe,'box',[x,2,-1.25],[.035,1.7,.05],wood);}
  for(const y of [1.2,1.65,2.1,2.55])mesh(cafe,'box',[0,y,-1.25],[3.8,.045,.05],wood);
  mesh(cafe,'box',[-1.05,1.75,.7],[.75,.65,.6],'#6d7771');mesh(cafe,'box',[-1.05,1.65,1.02],[.6,.25,.05],'#303e39');
  for(const x of [-1.22,-.88]){mesh(cafe,'cylinder',[x,1.44,1.12],[.09,.14,.09],cream);line(cafe,[[x,1.86,1.02],[x,1.75,1.14]],'#a6aaa0',.025);}
  const service=group(cafe);service.userData.dynamic=true;
  const stream=mesh(service,'cylinder',[-1.22,1.64,1.12],[.014,.23,.014],'#b28c57');stream.visible=false;
  const steam=[];for(let i=0;i<4;i++){const puff=mesh(service,'sphere',[-1.22,1.63,1.12],[.045,.055,.045],'#eee6cf');puff.material=new THREE.MeshBasicMaterial({color:'#e6e1cf',transparent:true,opacity:0,depthWrite:false});puff.castShadow=false;steam.push(puff);}
  let started=null;
  for(let i=0;i<4;i++){const x=.1+i*.38;mesh(cafe,'cylinder',[x,1.58,.85],[.12,.35,.12],i%2?'#9c8e65':'#bbaa80');mesh(cafe,'cylinder',[x,1.77,.85],[.13,.04,.13],wood);}
  tag(cafe,'桂花奶茶 · 咖啡 · 清茶',[.7,2.2,-1.12],{width:2.3,font:30});
  const menu=group(stage,[4.4,0,2.3]);for(const x of [-.28,.28])mesh(menu,'box',[x,.6,0],[.06,1.2,.08],wood);tag(menu,'点 单 · 取 茶',[0,1.1,.03],{width:1.2,font:36});menu.userData={kind:'cafe'};pickables.push(menu);
  cafe.userData={kind:'cafe'};pickables.push(cafe);
  for(const b of BENCHES){const chair=group(stage,[b.x,0,b.z]);chair.rotation.y=b.yaw;
    for(const x of [-.32,.32])for(const z of [-.25,.25])mesh(chair,'box',[x,.27,z],[.065,.54,.065],wood);
    for(let i=0;i<5;i++)mesh(chair,'round',[-.32+i*.16,.55,0],[.14,.08,.62],wood);
    for(const x of [-.37,.37])mesh(chair,'box',[x,.72,-.27],[.055,.95,.06],wood);
    for(const y of [.83,1.08])mesh(chair,'round',[0,y,-.27],[.78,.065,.06],wood);
    mesh(chair,'round',[0,.61,0],[.62,.045,.48],'#8e9c83');
    chair.userData={kind:'bench',seat:b.id};pickables.push(chair);
  }
  return {start(time){started=time;},tick(time,active){
    // Unstarted steam must retain finite transforms even while hidden: Three's
    // raycaster does not use visibility to exclude objects from intersections.
    const running=Boolean(active)&&started!==null&&Number.isFinite(time);
    const t=running?Math.max(0,time-started):0;
    stream.visible=running&&t>.35&&t<2.5;
    if(!running){for(const p of steam){p.visible=false;p.material.opacity=0;}return;}
    stream.scale.x=stream.scale.z=.014*(.8+.2*Math.sin(time*15));
    for(let i=0;i<steam.length;i++){const f=(t*.65+i/4)%1;const p=steam[i];p.visible=t>0;p.position.set(-1.22+Math.sin(time+i)*f*.045,1.62+f*.35,1.12);p.scale.setScalar(.025+f*.045);p.material.opacity=(1-f)*.15;}
  }};
}
