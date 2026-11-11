import * as THREE from 'three';
import { terrainMaterial, createPond } from './landscape';
import { buildTeaCourt } from './tea-court';
import { createRiverLanterns } from './river-lanterns';
import { plant } from './plants';

// Original garden composition: Chinese covered walks, a lotus pond and tea court.
export function buildCourtyard(stage,pickables,{mesh,group,roof,tag,line},area){
  const lamps=[];
  const gray='#626d68',red='#754b40',wood='#51483d';
  function pavilion(x,z,w,d,title){
    const g=group(stage,[x,0,z]);const platform=mesh(g,'box',[0,.12,0],[w+.6,.25,d+.6],'#9a9c8e');platform.material=terrainMaterial('stone',2);
    for(const sx of [-1,1])for(const sz of [-1,1]){
      mesh(g,'cylinder',[sx*(w/2-.4),1.8,sz*(d/2-.4)],[.13,3.4,.13],red);
      mesh(g,'cylinder',[sx*(w/2-.4),.3,sz*(d/2-.4)],[.23,.32,.23],'#999b8d');
    }
    roof(g,w+1,d+1,3.5,.85,gray);
    for(const side of [-1,1]){mesh(g,'box',[0,3.25,side*(d/2-.4)],[w,.22,.18],wood);mesh(g,'box',[side*(w/2-.4),3.25,0],[.18,.22,d],wood);}
    if(title)tag(g,title,[0,3.2,d/2+.09],{width:2.5,font:38});
    return g;
  }
  // Both sides and the entrance have full silhouettes when the camera rotates.
  for(const side of [-1,1]){
    pavilion(side*10,6,3.2,8,'');

    for(const z of [-1,8])plant(stage,side*14,z,{species:'osmanthus',height:2.6,seed:Math.round(z+side*100+300),distant:true});

  }
  const gate=pavilion(0,12,6,2.3,'雍 和 小 院');
  for(const side of [-1,1]){mesh(stage,'box',[side*8,1.2,12],[10,2.4,.4],red);roof(group(stage,[side*8,0,12]),10.4,.8,2.4,.25,gray);}
  // Outside the enclosure: a composed landscape in every direction, no blank back side.
  for(let i=0;i<30;i++){
    const a=i*Math.PI*2/30,r=23+(i%3)*3;
    if(Math.abs(Math.cos(a)*r)<19&&Math.sin(a)*r<-3)continue;
    plant(stage,Math.cos(a)*r,Math.sin(a)*r,{species:i%5===0?'ginkgo':'osmanthus',height:9+(i%4)*1.0,seed:73+i*29,distant:true});
  }
  // A walk-up lotus pond with an irregular stone bank and reflected scenery.
  const water=createPond(stage);water.userData.kind='pond';pickables.push(water);
  pavilion(-6.4,10.5,4,2.1,'听 荷');
  // A reachable tea table on the east side, with a dedicated approach point.
  const tea=group(stage,[7,0,8.6]);
  mesh(tea,'cylinder',[0,.7,0],[.7,.12,.7],wood);mesh(tea,'cylinder',[0,.34,0],[.15,.65,.15],wood);

  mesh(tea,'sphere',[0,.9,0],[.21,.17,.21],'#b8b09a');mesh(tea,'cylinder',[0,1.06,0],[.13,.04,.13],wood);
  for(const x of [-.35,.35]){mesh(tea,'cylinder',[x,.84,.24],[.09,.12,.09],'#d8d7c4');mesh(tea,'cylinder',[x,.905,.24],[.075,.006,.075],'#827048');}
  tea.userData={kind:'cafe'};pickables.push(tea);
  // tag(tea,'松风茶 · 点此歇脚',[0,1.7,0],{width:2.6,font:30});tea.userData={kind:'cafe'};pickables.push(tea);
  for(const [x,z] of [[-10,2],[10,2],[-10,10],[10,10],[-4,11],[4,11]]){
    mesh(stage,'box',[x,.4,z],[.4,.8,.4],wood);
    const bulb=mesh(stage,'box',[x,.55,z],[.28,.38,.28],'#eedbb2');bulb.material=new THREE.MeshStandardMaterial({color:'#e3d5b6',emissive:'#ffd39a',emissiveIntensity:1});
    const cap=mesh(stage,'cone',[x,.92,z],[.43,.20,.43],gray);cap.geometry=new THREE.ConeGeometry(1,1,4);cap.rotation.y=Math.PI/4;
    const light=new THREE.PointLight('#ffd39a',2,5,2);light.position.set(x,1,z);stage.add(light);lamps.push({light,bulb});
  }
  const teaService=buildTeaCourt(stage,pickables,{mesh,group,roof,tag,line});
  const riverLanterns=createRiverLanterns(stage);
  return {lamps,water,riverLanterns,teaService};
}
