import { followHeading } from './follow-camera';
import { usableHit } from './interaction-picking';
import * as THREE from 'three';
import { batchStatic } from './render-budget';
import { ritualPose } from './ritual-motion';
import { lotusLamp } from './river-lanterns';
import CameraControls from 'camera-controls';
import { Pathfinding } from 'three-pathfinding';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mountSculpture } from './sculpture';
import { terrainMaterial, pondContains } from './landscape';
import { plant } from './plants';
import { surface } from './temple-materials';
import { daylight } from './daylight';
import { buildCourtyard } from './courtyard';
import { buildTempleInterior } from './temple-interior';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { AREAS, COLORS, MATS, PETS, BENCHES, DRINKS } from './data';

CameraControls.install({THREE});
const palette={red:'#74473f',redLight:'#916459',gold:'#9b7b3b',goldLight:'#ac8b48',green:'#374f4b',beam:'#48605b',stone:'#969b92',cream:'#e2dfd2',wood:'#54433a'};
const sharedGeo={ sphere:new THREE.SphereGeometry(1,20,14), box:new THREE.BoxGeometry(1,1,1), round:new RoundedBoxGeometry(1,1,1,2,.12), cylinder:new THREE.CylinderGeometry(1,1,1,20), cone:new THREE.ConeGeometry(1,1,18) };
const materials=new Map();
function mat(color,metalness=0){const key=color+metalness;if(!materials.has(key))materials.set(key,metalness?new THREE.MeshStandardMaterial({color,roughness:.66,metalness}):[palette.red,palette.redLight].includes(color)?surface('plaster',color):[palette.wood,palette.beam].includes(color)?surface('wood',color):new THREE.MeshStandardMaterial({color,roughness:.87}));return materials.get(key);}
function mesh(parent,type,pos,scale,color,metal=0){const m=new THREE.Mesh(sharedGeo[type],mat(color,metal));m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;if(type==='box'&&pos[1]>.6&&(scale[0]>2||scale[2]>2||(scale[1]>.8&&scale[0]>.4&&scale[2]>.4)))m.userData.cameraSolid=true;parent.add(m);return m;}
function group(parent,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;}
function line(parent,points,color,r=.035){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,16,r,6,false),mat(color));parent.add(m);return m;}
function tag(parent,text,pos,{width=3,font=40,color='#f9edcf',bg='#354c41'}={}){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(2,2,508,124,24);ctx.fill();ctx.strokeStyle='#c9b17b';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=color;ctx.font=`600 ${font}px "Microsoft YaHei", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial({map:texture,transparent:true}));m.position.set(...pos);parent.add(m);return m;
}
function label(parent,text,pos,color='#fff9eb'){
  const c=document.createElement('canvas');c.width=384;c.height=92;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(6,6,372,80,40);ctx.fill();ctx.fillStyle=color==='#2f514b'?'#fff9eb':'#354640';ctx.font='600 34px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,192,48);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.position.set(...pos);s.scale.set(1.50,.36,1);s.renderOrder=8;parent.add(s);return s;
}

function roof(parent,w,d,y,height,color=palette.gold){
  // Curved tiled slopes, with raised eaves and an ornamental ridge.
  const verts=[],idx=[],uv=[];const nx=32,nz=16;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
    const x=(i/nx-.5)*w,z=(j/nz-.5)*d;
    const a=Math.abs(z/(d*.5)),b=Math.abs(x/(w*.5));
    const h=y+height*Math.pow(1-a,.75)+.35*Math.pow(a,7)+.32*Math.pow(b,8);
    verts.push(x,h,z);uv.push(i/nx*w/4,j/nz*d/4);
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;idx.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const r=new THREE.Mesh(geo,surface('tile',color));r.material.side=THREE.DoubleSide;r.userData.cameraSolid=true;r.castShadow=true;r.receiveShadow=true;parent.add(r);
  const tileCount=Math.max(4,Math.round(w/.28));for(let i=0;i<=tileCount;i++){const x=(i/tileCount-.5)*w;for(const side of [-1,1]){
    const pts=[];for(let j=0;j<=8;j++){const a=j/8;pts.push([x,y+height*Math.pow(1-a,.75)+.35*Math.pow(a,7)+.32*Math.pow(Math.abs(x/(w*.5)),8)+.035,side*a*d*.5]);}
    line(parent,pts,color,.052);
  }}
  for(const side of [-1,1])line(parent,Array.from({length:9},(_,i)=>{const x=(i/8-.5)*w;return[x,y+.35+.32*Math.pow(Math.abs(x/(w*.5)),8),side*d*.5]}),color,.075);
  line(parent,[[-w*.39,y+height+.25,0],[0,y+height+.20,0],[w*.39,y+height+.25,0]],color,.11);
  for(const side of [-1,1]){
    mesh(parent,'box',[0,y+.15,side*d*.46],[w,.22,.16],palette.wood);
    for(let i=0;i<=Math.floor(w/.45);i++){
      const x=-w*.47+i*.45;if(x>w*.48)continue;
      line(parent,[[x,y+height-.14,0],[x,y+height*.50-.14,side*d*.25],[x,y+.19,side*d*.49]],palette.wood,.045);
    }
  }
  for(const side of [-1,1])line(parent,[[side*w*.39,y+height+.2,0],[side*w*.44,y+height+.34,0],[side*w*.45,y+height+.52,0]],color,.08);
}
function disposeTree(root){root.traverse(o=>{o.userData.cleanup?.();if(!o.isMesh&&!o.isSprite)return;if(o.geometry&&!Object.values(sharedGeo).includes(o.geometry))o.geometry.dispose();for(const m of(Array.isArray(o.material)?o.material:[o.material])){if([...materials.values()].includes(m))continue;for(const key of ['map','bumpMap','normalMap','roughnessMap','metalnessMap','aoMap'])m[key]?.dispose();m.dispose();}});}
function buddha(parent,x,y,z,kind='seated',s=1){
  return mountSculpture(parent,x,y,z,(kind==='standing'?3.6:2.75)*s,kind==='standing'?'standing':'seated');
}
function lantern(parent,x,y,z){
  const g=group(parent,[x,y,z]);mesh(g,'sphere',[0,0,0],[.30,.43,.30],palette.redLight);mesh(g,'cylinder',[0,.37,0],[.24,.07,.24],palette.gold);mesh(g,'cylinder',[0,-.37,0],[.21,.07,.21],palette.gold);line(g,[[0,-.4,0],[0,-.77,0]],palette.gold,.035);line(g,[[0,.4,0],[0,.8,0]],palette.wood,.02);
}
function tree(parent,x,z,scale=1){
  return plant(parent,x,z,{species:x<0?'ginkgo':'osmanthus',height:6.6*scale,seed:Math.round(Math.abs(x*37+z*19))+17});
}
function groundTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#a4aaa5';x.fillRect(0,0,256,256);
  let seed=91;for(let i=0;i<14000;i++){seed=(seed*1664525+1013904223)>>>0;const v=seed%256; x.fillStyle='rgba('+v+','+v+','+v+',.06)';x.fillRect((seed>>>8)%256,(seed>>>16)%256,1+(i%3),1+(i%2));}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t;
}
let fabric;
function clothMaterial(){if(fabric)return fabric;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#818572';x.fillRect(0,0,128,128);for(let i=0;i<128;i+=3){x.fillStyle='#989b871f';x.fillRect(i,0,1,128);x.fillStyle='#303a2e22';x.fillRect(0,i,128,1);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;fabric=new THREE.MeshStandardMaterial({map:t,roughness:1});materials.set('fabric',fabric);return fabric;}
function floorRing(parent,color,r=.58){const m=new THREE.Mesh(new THREE.RingGeometry(r,r+.035,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.10;parent.add(m);return m;}
function hall(parent,area,clickable){
  const g=group(parent,[0,0,-7.4]);g.scale.y=1.20;
  const large=area==='wanfu', w=large?10.7:12.4;
  mesh(g,'round',[0,.28,0],[w+1,.55,6.3],'#bcb79f');
  mesh(g,'box',[0,.58,0],[w,.22,5.5],palette.wood);
  mesh(g,'box',[0,2.6,-2.4],[w,4.0,.35],palette.red);
  for(const x of [-w/2+.3,w/2-.3])mesh(g,'box',[x,2.4,-.5],[.35,3.6,4.0],palette.red);
  for(const x of [-w*.45,-w*.30,w*.30,w*.45]){
    mesh(g,'cylinder',[x,2.4,2.0],[.19,3.8,.19],palette.red);
    mesh(g,'cylinder',[x,.79,2.0],[.31,.22,.31],'#a49b82');
    for(let j=0;j<3;j++)mesh(g,'round',[x,4.18+j*.14,2.0],[.55+j*.19,.14,.6],j%2?palette.gold:palette.beam);
  }
  mesh(g,'box',[0,4.33,2.1],[w,.35,.45],palette.beam);
  for(let x=-w*.4;x<=w*.4;x+=.72)mesh(g,'round',[x,4.33,2.36],[.38,.16,.07],palette.gold);
  roof(g,w+2,7,4.48,1.4);
  if(large){mesh(g,'box',[0,6.35,0],[7.3,1.4,3.6],palette.red);roof(g,9.7,5.6,7.0,1.15);mesh(g,'box',[0,8.65,0],[5.7,1.3,2.8],palette.red);roof(g,7.8,4.9,9.3,1.1);}
  if(area==='falun')for(const x of [-4,-2,0,2,4]){mesh(g,'sphere',[x,6.2,0],[.32,.38,.32],palette.gold,.5);mesh(g,'cone',[x,6.7,0],[.17,.58,.17],palette.goldLight,.5);}
  for(let i=0;i<3;i++)mesh(g,'box',[0,.12+i*.12,3.38-i*.3],[5,.12+i*.12,.9],'#d7ccb0');
  tag(g,area==='court'?'礼佛殿':AREAS.find(a=>a.id===area)?.name||'栖心禅院',[0,4.15,2.42],{width:3.0,font:43});
  lantern(g,-4.6,3.4,2.5);lantern(g,4.6,3.4,2.5);
  if(area==='wanfu')buddha(g,0,.72,0,'standing',1.35);
  else if(area==='falun')buddha(g,0,.72,0,'lama',1.27);
  else if(area==='main'||area==='yongyou')for(const x of [-2.65,0,2.65])buddha(g,x,.72,0,'seated',x===0?1.05:.87);
  else if(area!=='court')buddha(g,0,.72,0,'seated',1.05);
  if(area==='court'){
    for(const side of [-1,1]){
      mesh(g,'box',[side*4.0,2.4,1.65],[3.3,3.3,.18],palette.wood);
      mesh(g,'box',[side*4.0,2.7,1.77],[2.9,2.3,.05],'#b1aa8c');
      for(let k=0;k<8;k++)mesh(g,'box',[side*4.0-1.4+k*.4,2.7,1.83],[.045,2.3,.06],palette.wood);
      for(let k=0;k<6;k++)mesh(g,'box',[side*4.0,1.6+k*.4,1.83],[2.9,.045,.06],palette.wood);
    }
    mesh(g,'box',[0,2.3,-2.2],[4.6,3.4,.15],'#292a20');mesh(g,'box',[0,.85,-.5],[3,.4,1.7],palette.wood);buddha(g,0,1.05,-.7,'seated',.82);tag(g,'入 殿 礼 拜',[2.1,1.6,2.42],{width:1.6,font:35});
    g.userData={kind:'portal',area:'main'};clickable.push(g);}
  for(const side of [-1,1]){
    const wing=group(parent,[side*10,0,-5.7]);mesh(wing,'box',[0,1.6,0],[3.4,3.2,6.5],palette.red);roof(wing,4.8,8,3.3,.7,palette.gold);
    for(let i=0;i<3;i++){mesh(wing,'box',[-side*1.74,1.8,i*1.8-1.8],[.08,1.7,1.1],palette.green);for(let j=0;j<4;j++)mesh(wing,'box',[-side*1.8,1.15+j*.4,i*1.8-1.8],[.08,.05,1.1],palette.gold);}
  }
}

function buildForecourtBase(stage){
    const terrain=mesh(stage,'box',[0,-.30,0],[150,.5,150],'#6b766a');terrain.material=terrainMaterial('forest',28);const earth=mesh(stage,'box',[0,-.10,0],[25,.22,23],'#8b938d');earth.material=terrainMaterial('forest',5);
    const tileGeo=new THREE.BoxGeometry(1.48,.045,1.48),tileMat=terrainMaterial('stone',.65);const paving=new THREE.InstancedMesh(tileGeo,tileMat,255);const dummy=new THREE.Object3D();let n=0;
    for(let x=-7;x<=7;x++)for(let z=-7;z<=9;z++){if(Math.abs(x)>1&&z!==3&&!(x>=4&&z>=3&&z<=7))continue;dummy.position.set(x*1.53,.03,z*1.53-2);dummy.updateMatrix();paving.setMatrixAt(n++,dummy.matrix);}paving.count=n;paving.receiveShadow=true;stage.add(paving);
    
    for(const side of [-1,1]){
      mesh(stage,'box',[side*12.1,1.15,0],[.45,2.3,23],palette.red);
      mesh(stage,'box',[side*12.1,.28,0],[.57,.56,23],'#666b60');
      const coping=group(stage,[side*12.1,0,0]);coping.rotation.y=Math.PI/2;roof(coping,23.4,.85,2.3,.16,'#525b50');
      for(let z=-9;z<11;z+=4)mesh(stage,'box',[side*12.1,1.2,z],[.62,2.4,.55],palette.red);
    }
    mesh(stage,'box',[0,1.3,-32],[28,2.6,.4],palette.red);
    mesh(stage,'box',[0,.27,-32],[28,.54,.55],'#666b60');
    tree(stage,-9,.5,1.05);tree(stage,18,-5,1.1);tree(stage,-19,-15,1);tree(stage,19,-15,1.1);

    for(const x of [-4.8,4.8])for(const z of [-3,2.5]){const g=group(stage,[x,0,z]);mesh(g,'box',[0,.35,0],[.42,.7,.42],palette.wood);const glow=mesh(g,'box',[0,.4,0],[.33,.46,.33],'#e9d5ac');glow.material=new THREE.MeshStandardMaterial({color:'#e9d5ac',emissive:'#e9bc78',emissiveIntensity:.8});const cap=mesh(g,'cone',[0,.82,0],[.43,.22,.43],palette.wood);cap.geometry=new THREE.ConeGeometry(1,1,4);cap.rotation.y=Math.PI/4;const light=new THREE.PointLight('#ffd6a0',1.6,5,2);light.position.set(x,.8,z);stage.add(light);}


}
function hallEnvelope(parent,id,pickables){
  const front=group(parent);
  for(const side of [-1,1]){
    mesh(front,'box',[side*8,3.6,12.1],[6.5,7.2,.3],palette.red);
    mesh(front,'box',[side*8,3.8,12.28],[5.9,4.9,.08],'#aaa48b');
    for(let j=-6;j<=6;j++)mesh(front,'box',[side*8+j*.44,3.8,12.36],[.055,4.9,.08],palette.wood);
    for(let j=0;j<9;j++)mesh(front,'box',[side*8,1.45+j*.57,12.37],[5.9,.055,.08],palette.wood);
    mesh(front,'cylinder',[side*4.55,3.7,12.2],[.23,7.4,.23],palette.red);
    // Open leaves have depth and show the same doorway on both sides.
    const door=group(front,[side*4.35,0,12.05]);door.rotation.y=side*1.02;
    mesh(door,'box',[-side*.7,3.0,0],[1.4,6,.15],palette.wood);
    for(let j=0;j<6;j++)mesh(door,'box',[-side*.7,1+j*.8,.09],[1.25,.04,.04],palette.gold);
    mesh(front,'box',[side*5.1,1.0,13.15],[.48,2,.48],palette.wood);
    const glow=mesh(front,'box',[side*5.1,1.25,13.15],[.34,.65,.34],'#e4ceb0');glow.material=new THREE.MeshStandardMaterial({color:'#e4ceb0',emissive:'#e2b773',emissiveIntensity:.65});
  }
  mesh(front,'box',[0,7.65,12.15],[23,.7,.45],palette.beam);
  tag(front,AREAS.find(a=>a.id===id)?.name||'礼佛殿',[0,7.56,12.42],{width:3.8,font:44});
  roof(parent,25.5,29.5,9.0,2.25,palette.gold);
  const threshold=mesh(front,'box',[0,.025,12.5],[8.5,.05,.6],'#8d8978');
  const approach=mesh(front,'box',[0,-.045,13.25],[9,.12,1.0],'#8d8978');approach.material=terrainMaterial('stone',2);
  threshold.userData={kind:'portal',area:id};pickables.push(threshold);
  return front;
}

function interior(parent,id,pickables){return buildTempleInterior(parent,id,pickables);}
function person(parent,color,variant='bun'){
  const root=group(parent),body=group(root,[0,.1,0]),upper=group(body,[0,.44,0]);root.scale.setScalar(.78);
  const garment=new THREE.LatheGeometry([new THREE.Vector2(.39,-.30),new THREE.Vector2(.40,-.23),new THREE.Vector2(.35,.1),new THREE.Vector2(.33,.43),new THREE.Vector2(.26,.56),new THREE.Vector2(.16,.59)],32);const robe=new THREE.Mesh(garment,mat(color));robe.scale.z=.72;robe.castShadow=true;upper.add(robe);
  const hem=mesh(upper,'cylinder',[0,-.19,0],[.42,.22,.31],color);
  for(const side of [-1,1]){const collar=mesh(upper,'round',[side*.105,.48,.265],[.075,.43,.055],'#dbd8c8');collar.rotation.z=side*.48;}
  line(upper,[[.21,.26,.27],[-.20,.01,.27],[-.25,-.28,.27]],'#b2b5a5',.014);
  mesh(upper,'round',[0,-.02,0],[.73,.085,.52],'#5c655c');
  const pouch=mesh(upper,'round',[-.36,-.18,.1],[.20,.25,.13],'#9e9078');

  
  
  const head=group(upper,[0,.96,0]);mesh(head,'sphere',[0,0,0],[.47,.47,.43],'#edc5a1');
  mesh(head,'sphere',[0,.15,-.10],[.48,.37,.37],'#50453b');
  mesh(head,'sphere',[0,-.01,.17],[.43,.37,.28],'#f1ceb1');
  if(variant==='bun')for(const side of [-1,1])mesh(head,'sphere',[side*.34,.36,-.09],[.13,.13,.13],'#50453b');
  else mesh(head,'sphere',[0,.43,-.07],[.18,.18,.18],'#50453b');
  for(const side of [-1,1]){mesh(head,'sphere',[side*.42,-.04,0],[.105,.13,.09],'#edc5a1');line(head,[[side*.10,.025,.431],[side*.16,-.003,.445],[side*.22,.02,.423]],'#3d3932',.021);mesh(head,'sphere',[side*.28,-.10,.367],[.085,.045,.016],'#dd9387');}
  line(head,[[-.055,-.15,.43],[0,-.176,.444],[.055,-.15,.43]],'#ab7161',.015);
  const arms=[];for(const side of [-1,1]){const a=group(upper,[side*.34,.53,0]);const sleeve=mesh(a,'round',[0,-.20,0],[.36,.52,.34],color);mesh(a,'sphere',[0,-.43,.015],[.13,.13,.12],'#f1ceb1');a.rotation.z=side*.12;arms.push(a);}
  const legs=[];for(const side of [-1,1]){const l=group(body,[side*.19,.27,0]);mesh(l,'sphere',[0,-.11,0],[.15,.25,.14],'#5c675f');mesh(l,'sphere',[0,-.24,.07],[.17,.09,.22],'#454d47');legs.push(l);}
  const bracelet=group(upper,[0,.6,.55]);for(let i=0;i<12;i++){const a=i*Math.PI/6;mesh(bracelet,'sphere',[Math.cos(a)*.18,Math.sin(a)*.18,0],[.043,.043,.043],'#ac6a35');}bracelet.visible=false;
  return{root,body,upper,head,arms,legs,robe,hem,bracelet,color,action:'idle',phase:Math.random()*6};
}
function animatePerson(p,action,t,moving=false,reduced=false){
  p.action=action;const s=reduced?.3:1,f=t*5+p.phase;
  const kneel=['kneel','bow','bracelet','beads'].includes(action);
  p.body.position.y=THREE.MathUtils.lerp(p.body.position.y,(action==='rest'||(action==='drink'&&p.seated))?.65:action==='pet'?-.24:kneel?-.18:.10,.15);
  p.upper.rotation.x=action==='pet'?.5:action==='greet'?.12+Math.sin(t*2)*.025:action==='bow'?(.16+(1-Math.cos(t*1.8))*.45)*s:0;
  p.upper.rotation.z=action==='dance'?Math.sin(f)*.17*s:0;
  p.head.rotation.z=action==='dance'?Math.sin(f+.4)*.13*s:Math.sin(t*.8+p.phase)*.035*s;
  p.body.position.y+=action==='dance'?Math.abs(Math.sin(f))*.04*s:moving?Math.abs(Math.sin(f*1.8))*.035*s:0;
  p.bracelet.visible=['bracelet','beads'].includes(action);p.bracelet.rotation.z=action==='beads'?t*.5:0;
  for(let i=0;i<2;i++){const side=i===0?-1:1,arm=p.arms[i],leg=p.legs[i];
    arm.rotation.x=action==='pet'?(i===1?-1.25+Math.sin(t*5)*.10:-.3):['incense','lantern','receive'].includes(action)?-1.5:action==='drink'?-1.8:action==='bracelet'?-1.8:kneel||action==='greet'?-1.1:action==='dance'?Math.sin(f+i)*.65*s:moving?Math.sin(f*1.8+i*Math.PI)*.55:0;
    arm.rotation.z=action==='dance'?side*(.8+Math.sin(f)*.25)*s:kneel||action==='greet'?-side*.48:side*.12;
    leg.rotation.x=(action==='rest'||(action==='drink'&&p.seated))?-1.3:kneel?1.35:moving?Math.sin(f*1.8+i*Math.PI)*.45:0;
    leg.rotation.z=action==='dance'?side*.13:0;
  }
}
function pet(parent,spec){
  const root=group(parent),body=group(root,[0,.37,0]);const dog=spec.type==='dog';
  mesh(body,'sphere',[0,0,-.1],[.34,.30,.51],spec.color);const head=group(body,[0,.25,.35]);mesh(head,'sphere',[0,0,0],[.38,.33,.32],spec.color);
  for(const side of [-1,1]){
    if(dog){const ear=mesh(head,'sphere',[side*.32,.05,-.03],[.15,.32,.13],'#8a6147');ear.rotation.z=side*.3;}
    else{const ear=mesh(head,'cone',[side*.23,.29,-.025],[.17,.32,.13],spec.color);ear.rotation.z=-side*.18;mesh(head,'cone',[side*.23,.29,.04],[.09,.19,.04],'#d8a79c');}
    mesh(head,'sphere',[side*.14,.015,.29],[.035,.052,.025],'#3f3d35');mesh(head,'sphere',[side*.19,-.09,.28],[.06,.03,.015],'#dea99b');
    if(!dog)for(let j=0;j<2;j++)line(head,[[side*.23,-.1,.27],[side*.47,-.08+j*.07,.25]],'#9a8e7c',.009);
  }
  mesh(head,'sphere',[0,-.11,.30],[.17,.11,.12],'#f4e9d0');mesh(head,'sphere',[0,-.07,.408],[.055,.035,.025],'#6d5549');
  if(dog){mesh(head,'sphere',[0,-.19,.37],[.053,.08,.023],'#d98c85');mesh(body,'round',[0,.19,.28],[.57,.11,.34],palette.redLight);}
  if(spec.id==='orange')for(let i=0;i<3;i++)mesh(body,'sphere',[0,.27,-.2+i*.23],[.31,.018,.055],'#aa7346');
  const legs=[];for(const x of [-.21,.21])for(const z of [-.38,.22]){const l=mesh(root,'sphere',[x,.18,z],[.10,.18,.12],spec.color);legs.push(l);}
  const tail=group(body,[0,.06,-.52]);line(tail,[[0,0,0],[.10,.30,-.15],[.25,.55,-.18],[.35,.62,-.10]],spec.color,dog?.11:.075);
  root.userData={kind:'pet',id:spec.id};return{root,body,head,legs,tail,spec,phase:Math.random()*6,follow:false,pettedUntil:0};
}

export function createWorld(container,onEvent,options={}){
  const assetError=e=>onEvent({type:'hint',text:e.detail});window.addEventListener('sanctuary-asset-error',assetError);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.35));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','可探索的三维栖心禅院，点地移动，拖动旋转视角');renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;
  // Opt-in production recorder captures the live WebGL canvas.
  let stopCapture=()=>{};
  if(new URLSearchParams(location.search).get('capture')==='1'){
    const dock=document.createElement('div');dock.style.cssText='position:fixed;top:90px;right:20px;z-index:9999;background:#fff;padding:10px;border-radius:12px;color:#193d32';
    const button=document.createElement('button');button.textContent='开始录制画面';dock.appendChild(button);container.appendChild(dock);
    let recorder,stream,href;const chunks=[];
    button.onclick=()=>{
      if(recorder?.state==='recording'){recorder.stop();button.textContent='开始录制画面';return;}
      dock.querySelector('a')?.remove();if(href)URL.revokeObjectURL(href);chunks.length=0;
      stream=renderer.domElement.captureStream(30);const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
      recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:10000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());href=URL.createObjectURL(new Blob(chunks,{type:mimeType}));const a=document.createElement('a');a.href=href;a.download=`yonghe-${Date.now()}.webm`;a.textContent='保存录屏';a.style.marginLeft='12px';dock.appendChild(a);};
      recorder.start(1000);button.textContent='停止录制画面';
    };
    stopCapture=()=>{if(recorder?.state==='recording'){recorder.onstop=null;recorder.stop();}stream?.getTracks().forEach(t=>t.stop());if(href)URL.revokeObjectURL(href);dock.remove();};
  }
  const scene=new THREE.Scene();const pmrem=new THREE.PMREMGenerator(renderer);const environment=new RoomEnvironment();const envTarget=pmrem.fromScene(environment,.04);scene.environment=envTarget.texture;scene.environmentIntensity=.55;environment.dispose();pmrem.dispose();scene.background=new THREE.Color('#a6b4b3');scene.fog=new THREE.Fog('#a6b4b3',24,68);
  const camera=new THREE.PerspectiveCamera(49,1,.1,150);camera.position.set(0,4.6,15.5);
  const controls=new CameraControls(camera,renderer.domElement);controls.setTarget(0,1.0,4.5);controls.minDistance=3;controls.maxDistance=25;controls.minPolarAngle=.45;controls.maxPolarAngle=1.40;controls.smoothTime=.3;controls.draggingSmoothTime=.13;controls.mouseButtons.left=CameraControls.ACTION.ROTATE;controls.mouseButtons.right=CameraControls.ACTION.ROTATE;controls.touches.one=CameraControls.ACTION.TOUCH_ROTATE;controls.touches.two=CameraControls.ACTION.TOUCH_DOLLY_ROTATE;
  const amb=new THREE.HemisphereLight('#c8d9e2','#636451',1.8);scene.add(amb);
  const sun=new THREE.DirectionalLight('#f2ddbd',1.8);sun.position.set(-12,22,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:60});sun.shadow.normalBias=.04;sun.shadow.bias=-.0001;scene.add(sun);
  let lightMode='auto',gardenDetails=null,teaUntil=0,heldDrink=null,order=null,brewAt=0,lanternRows=[],lanternTime=Date.now();
  let stage=new THREE.Group();scene.add(stage);let pickables=[],pets=[],residents=[],smoke=[],incenseUntil=0,leafs,area='court',disposed=false,path=[],afterWalk=null,action='idle',seat=null,reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,hiddenUI=false,paused=false;
  const player=person(scene,COLORS.find(c=>c.id===options.color)?.hex||COLORS[0].hex);player.root.position.set(0,0,5);player.root.rotation.y=Math.PI;
  let sequence=null,arrivalResolve=null,placedIncense=null,stockIncense=null,carryingIncense=false;
  const heldLamp=lotusLamp();player.root.add(heldLamp);heldLamp.scale.setScalar(1/.78);heldLamp.visible=false;
  const incenseProp=group(player.root);for(const x of [-.065,0,.065]){mesh(incenseProp,'cylinder',[x,.24,0],[.012,.56,.012],'#9b6247');mesh(incenseProp,'sphere',[x,.525,0],[.019,.025,.019],'#e8a45a');}incenseProp.visible=false;incenseProp.scale.setScalar(1/.78);
  const teaCup=group(player.root,[0,1.05,.38]);mesh(teaCup,'cylinder',[0,0,0],[.13,.17,.13],'#d8d7c4');mesh(teaCup,'cylinder',[0,.09,0],[.105,.007,.105],'#827048');teaCup.visible=false;
  let myLabel=label(player.root,'你 · 慢慢来',[0,2.36,0],'#2f514b');
  const selfRing=floorRing(player.root,'#c5f0df',.59);const selectedRing=floorRing(scene,'#e4c897',.68);selectedRing.visible=false;
  const destinationRing=floorRing(scene,'#d5e8dc',.27);destinationRing.visible=false;
  let selected=null,interaction=null,actionUntil=0,followCamera=true,nearbyStamp='',selfName='慢慢来';
  const camTarget=new THREE.Vector3(0,1,4.5),bubbles=[];
  function bubble(p,text){const b=label(p.root,text,[0,p.spec?1.8:2.9,0],'#f4e9d1');b.scale.set(2.7,.65,1);bubbles.push({b,parent:p.root,until:clock+4.5});}
  function actors(){return [...residents.filter(p=>p.id),...pets,...peers.values()];}
  function actor(id){return actors().find(p=>(p.id||p.spec?.id)===id);}
  function describe(p){return {id:p.id||p.spec.id,name:p.name||p.spec.name,kind:p.spec?'pet':p.remote?'peer':'resident',detail:p.spec?p.spec.kind:p.remote?'在线访客':'小院住客 · NPC',distance:Math.round(p.root.position.distanceTo(player.root.position)*10)/10};}
  function select(id){const p=actor(id);if(!p)return;selected=p;selectedRing.visible=true;onEvent({type:'selected',target:describe(p)});}
  function clearSelection(){selected=null;selectedRing.visible=false;interaction=null;onEvent({type:'selected',target:null});}
  function face(a,b){a.root.rotation.y=Math.atan2(b.root.position.x-a.root.position.x,b.root.position.z-a.root.position.z);}
  function interact(id,mode){const p=actor(id);if(!p){onEvent({type:'hint',text:'对方已经离开这里了。'});clearSelection();return false;}
    select(id);resetWalk();p.holdUntil=clock+25;interaction={p,mode};
    const d=player.root.position.clone().sub(p.root.position);d.y=0;if(d.length()<.1)d.set(0,0,1);d.normalize();const radius=p.spec?1.0:1.35;
    let goal=null;for(let i=0;i<12;i++){const a=Math.atan2(d.x,d.z)+i*Math.PI/6;const x=p.root.position.x+Math.sin(a)*radius,z=p.root.position.z+Math.cos(a)*radius;if(walkable(x,z)){goal={x,z};break;}}
    if(!goal||!moveTo(goal.x,goal.z,'interact')){interaction=null;return false;}
    onEvent({type:'interactionPhase',phase:'walking',text:'正在走近 '+describe(p).name+'…'});return true;
  }
  function finishInteraction(){if(!interaction)return;const {p,mode}=interaction;if(!actors().includes(p)){clearSelection();return;}
    if(player.root.position.distanceTo(p.root.position)>2.8){interaction=null;onEvent({type:'hint',text:'对方走远了，重新点一下可以跟上。'});return;}
    face(player,p);if(!p.remote)face(p,player);action=mode==='pat'?'pet':mode==='dance'?'dance':'greet';actionUntil=clock+(mode==='dance'?3600:4.5);seat=null;
    if(p.spec){p.holdUntil=clock+5;p.pettedUntil=clock+5;if(mode==='follow')p.follow=!p.follow;if(mode==='dance'){p.dance=!p.dance;action=p.dance?'dance':'idle';}bubble(p,mode==='pat'?'♡ 蹭蹭你的手':mode==='follow'?(p.follow?'跟着你，慢慢走':'在这里等你'):'♪ 一起摇摇');}
    else if(!p.remote){p.responseAt=clock+.65;p.responseUntil=clock+5;p.responseAction=mode==='dance'?'dance':'greet';bubble(player,'向 '+p.name+' 合掌问好');}
    else onEvent({type:'sendGesture',target:p.id,kind:mode==='dance'?'dance':'greet'});
    onEvent({type:'interactionPhase',phase:'done',text:p.remote?'已向 '+p.name+' 问好，等待对方回应':p.spec?'你正在和 '+p.spec.name+' 互动':p.name+' 正在回应你'});onEvent({type:'action',action,seat});interaction=null;
  }
  let cameraHeld=false,manualCameraUntil=0;
  const keyboardForward=new THREE.Vector3(),followTarget=new THREE.Vector3();
  function resumeFollow(){
    if(followCamera)return;
    controls.getTarget(camTarget);followCamera=true;
    controls.dollyTo(6,true);controls.rotateTo(controls.azimuthAngle,1.18,true);
    onEvent({type:'cameraMode',mode:'follow'});
  }
  function homeView(){
    followCamera=true;manualCameraUntil=0;const p=player.root.position,yaw=player.root.rotation.y;
    camTarget.set(p.x,1.6,p.z);
    controls.setLookAt(p.x-Math.sin(yaw)*5.8,3.8,p.z-Math.cos(yaw)*5.8,p.x,1.6,p.z,true);
    onEvent({type:'cameraMode',mode:'follow'});
  }
  const cameraStart=()=>{cameraHeld=true;};
  const cameraEnd=()=>{cameraHeld=false;manualCameraUntil=clock+1.8;};
  controls.addEventListener('controlstart',cameraStart);controls.addEventListener('controlend',cameraEnd);


  const pointer=new THREE.Vector2(),ray=new THREE.Raycaster();let down={x:0,y:0};let frame=0,last=performance.now(),clock=0,lastReport=0,perfAt=performance.now(),perfFrames=0,lastShadow=0;
  const peers=new Map(),keys=new Set(),obstacles=[{x:-9,z:.5,r:1.5},{x:7.2,z:.2,r:2.3},{x:-1.7,z:-4.3,r:.65},{x:0,z:-4.3,r:.9}];
  const pathfinder=new Pathfinding();let nav;
  function walkable(x,z){const edge=['main','yongyou','falun','wanfu'].includes(area)?10.6:11.5;return x>-edge&&x<edge&&z>-4.8&&z<10.5&&(['main','yongyou','falun','wanfu'].includes(area)||!pondContains(x,z))&&!obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r);}
  function makeNav(){
    const positions=[];const step=.5;
    for(let x=-11.5;x<11.5;x+=step)for(let z=-4.5;z<10.5;z+=step){if(!walkable(x+.25,z+.25))continue;positions.push(x,0,z,x,0,z+step,x+step,0,z,x+step,0,z,x,0,z+step,x+step,0,z+step);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));pathfinder.setZoneData('court',Pathfinding.createZone(geo));nav=geo;
  }
  makeNav();
  function cancelSequence(){if(sequence?.kind==='receive'&&heldDrink)onEvent({type:'drinkReady',drink:heldDrink});sequence=null;carryingIncense=false;if(stockIncense)stockIncense.visible=true;incenseProp.visible=false;heldLamp.visible=false;if(arrivalResolve){arrivalResolve(false);arrivalResolve=null;}player.head.rotation.x=0;}
  function startSequence(kind,complete=null){sequence={kind,at:clock,complete,label:null};action=kind==='sip'?'drink':kind==='pickup'?'incense':kind;actionUntil=0;}
  function resetWalk(){cancelSequence();if(order){order=null;brewAt=0;onEvent({type:'drinkCancelled'});}path=[];afterWalk=null;seat=null;action='idle';actionUntil=0;teaUntil=0;destinationRing.visible=false;onEvent({type:'action',action,seat});}
  function moveTo(x,z,after=null){
    if(!walkable(x,z)){onEvent({type:'hint',text:'这里不太好走，点一块空地试试。'});return false;}
    const start=player.root.position.clone();start.y=0;const goal=new THREE.Vector3(x,0,z);const id=pathfinder.getGroup('court',start);const result=pathfinder.findPath(start,goal,'court',id);
    if(!result){onEvent({type:'hint',text:'换一条路走走吧。'});return false;}
    resumeFollow();path=result.length?result:[goal];afterWalk=after;action='walk';destinationRing.position.set(x,.11,z);destinationRing.visible=true;onEvent({type:'action',action,seat});return true;
  }
  function rebuild(id,options={}){order=null;brewAt=0;onEvent({type:'drinkCancelled'});
    const old=stage;scene.remove(old);disposeTree(old);
    clearSelection();bubbles.length=0;stage=new THREE.Group();scene.add(stage);pickables=[];pets=[];residents=[];smoke=[];incenseUntil=0;gardenDetails=null;teaUntil=0;area=id;resetWalk();player.root.position.set(0,0,5);player.root.rotation.y=Math.PI;
    buildForecourtBase(stage);
    if(id==='garden'){
      mesh(stage,'round',[0,.25,-6.5],[10,.5,4],palette.wood);const pergola=group(stage,[0,0,-6.5]);roof(pergola,12,5,4.3,1,palette.gold);
      for(const x of [-4.6,4.6])mesh(stage,'cylinder',[x,2.1,-6.5],[.16,4.1,.16],palette.red);
      // Roof is positioned over the courtyard stage, not the prayer halls.
      mesh(stage,'round',[0,1.1,-6.4],[3.7,1.6,1.1],palette.green);tag(stage,'月 下 乐 庭',[0,1.45,-5.82],{width:3.1,font:43});
      for(const x of [-4,4]){mesh(stage,'round',[x,1.0,-6.2],[1.0,1.8,.8],'#49504b');for(const y of [.65,1.45]){const cone=mesh(stage,'cylinder',[x,y,-5.76],[.30,.06,.30],'#718476');cone.rotation.x=Math.PI/2;}}
      const dj=person(stage,'#a57c96','top');dj.root.position.set(0,.45,-7);residents.push(dj);dj.action='dance';
      for(let i=0;i<9;i++){const x=-5+i*1.25;line(stage,[[x,4.1,-4.3],[x,3.7-Math.sin(i/8*Math.PI)*.4,-4.3]],palette.wood,.015);const lamp=mesh(stage,'sphere',[x,3.7-Math.sin(i/8*Math.PI)*.4,-4.3],[.12,.17,.12],palette.cream);lamp.material=new THREE.MeshStandardMaterial({color:'#ffe8a8',emissive:'#f2be6a',emissiveIntensity:.5});}
    }else if(id==='court'){const building=group(stage,[0,0,-17]);interior(building,'main',[]);hallEnvelope(building,'main',pickables);for(const p of MATS){const cushion=mesh(building,'round',[p.x,.085,p.z],[1.25,.16,1.04],'#777c6a');cushion.material=clothMaterial();cushion.userData={kind:'portal',area:'main'};pickables.push(cushion);}}else hall(stage,id,pickables);
    if(id!=='garden'){
      const incense=group(stage,[0,0,-4.3]);mesh(incense,'sphere',[0,.72,0],[.62,.4,.49],'#6b8279',.35);mesh(incense,'cylinder',[0,.95,0],[.64,.12,.50],palette.gold,.5);for(const x of [-.4,.4])mesh(incense,'cylinder',[x,.28,0],[.09,.57,.09],'#6b8279');placedIncense=group(incense);placedIncense.visible=false;placedIncense.userData.dynamic=true;for(const x of [-.065,0,.065]){mesh(placedIncense,'cylinder',[x,1.24,0],[.012,.56,.012],'#9b6247');mesh(placedIncense,'sphere',[x,1.525,0],[.019,.025,.019],'#e8a45a');}
      const supply=group(stage,[-1.7,0,-4.3]);supply.userData={kind:'incense'};pickables.push(supply);
      for(const x of [-.48,.48])for(const z of [-.25,.25])mesh(supply,'box',[x,.4,z],[.075,.8,.075],palette.wood);
      mesh(supply,'round',[0,.82,0],[1.2,.12,.75],palette.wood);mesh(supply,'round',[0,.90,0],[.88,.035,.36],'#aa8f5c');
      for(const z of [-.19,.19])mesh(supply,'box',[0,.94,z],[.94,.06,.035],'#785b39');
      tag(supply,'取 香 处',[0,1.26,-.22],{width:1,font:32});
      stockIncense=group(supply,[0,.94,.03]);stockIncense.userData.dynamic=true;
      for(const z of [-.065,0,.065]){const stick=mesh(stockIncense,'cylinder',[0,0,z],[.012,.56,.012],'#9b6247');stick.rotation.z=Math.PI/2;}
      for(let i=0;i<5;i++){const spare=mesh(supply,'cylinder',[-.22+i*.04,.95,-.1],[.009,.38,.009],'#b18962');spare.rotation.z=Math.PI/2;}
      incense.userData={kind:'incense'};pickables.push(incense);for(let i=0;i<9;i++){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(234,229,214,.4)');gradient.addColorStop(.45,'rgba(234,229,214,.16)');gradient.addColorStop(1,'rgba(234,229,214,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const puff=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,opacity:0,depthWrite:false}));stage.add(puff);smoke.push(puff);}
      if(id!=='court')for(let i=0;i<MATS.length;i++){const {x,z}=MATS[i];const g=group(stage,[x,0,z]);const cushion=mesh(g,'round',[0,.085,0],[1.25,.16,1.04],i%2?'#777c6a':'#858876');cushion.material=clothMaterial();const seam=mesh(g,'round',[0,.045,0],[1.29,.065,1.08],'#565b4b');g.userData={kind:'seat',seat:i};pickables.push(g);}
    }
    if(id==='bracelet'){
      const table=group(stage,[6.5,0,-3]);mesh(table,'round',[0,.8,0],[2.5,.14,1.0],palette.wood);for(const x of [-1,1])mesh(table,'box',[x,.4,0],[.1,.8,.6],palette.wood);for(let j=0;j<3;j++){for(let i=0;i<12;i++){const a=i*Math.PI/6;mesh(table,'sphere',[(j-1)*.7+Math.cos(a)*.23,.91,Math.sin(a)*.23],[.06,.06,.06],['#af703e','#80a596','#d8a2a5'][j]);}}tag(table,'把心愿捧在手心',[0,1.7,0],{width:2.8,font:32});table.userData={kind:'bracelet'};pickables.push(table);
    }
    for(let i=0;i<3;i++){const p=pet(stage,PETS[i]);p.root.position.set([-4.4,5.8,6.9][i],0,[2.6,5.3,7.6][i]);p.home=p.root.position.clone();pets.push(p);pickables.push(p.root);p.label=label(p.root,p.spec.name,[0,1.45,0]);}
    for(let i=0;i<3;i++){const p=person(stage,COLORS[(i+1)%4].hex,i%2?'bun':'top');p.root.position.set([-2.7,3.3,-1.4][i],0,[3.2,2,8.0][i]);p.id='resident-'+i;p.name=['清和','听风','小满'][i];p.root.userData={kind:'person',id:p.id};pickables.push(p.root);p.root.rotation.y=[.3,-.4,2.1][i];p.action=id==='garden'?'dance':id==='court'||i===2?'idle':'kneel';residents.push(p);p.label=label(p.root,p.name+' · 住客',[0,2.3,0],'#e0e6de');}
    const leafGeo=new THREE.CircleGeometry(.045,7,Math.PI*.15,Math.PI*.7),leafMat=new THREE.MeshStandardMaterial({color:'#a79b6e',side:THREE.DoubleSide});leafs=new THREE.InstancedMesh(leafGeo,leafMat,65);leafs.userData.seeds=Array.from({length:65},(_,i)=>({x:Math.sin(i*57.1)*11,z:Math.cos(i*39.7)*10,y:Math.abs(Math.sin(i))*6,phase:i*2.7}));stage.add(leafs);
    if(['main','yongyou','falun','wanfu'].includes(id)){
      const keep=new Set([...smoke,...pets.map(p=>p.root),...residents.map(p=>p.root),...pickables.filter(p=>['seat','incense'].includes(p.userData.kind))]);
      for(const o of [...stage.children])if(!keep.has(o)){stage.remove(o);disposeTree(o);}
      pickables=pickables.filter(p=>keep.has(p));leafs=null;
      interior(stage,id,pickables);
      hallEnvelope(stage,id,[]);
      const outside=group(stage,[0,0,17]);buildForecourtBase(outside);
      gardenDetails=buildCourtyard(outside,[],{mesh,group,roof,tag,line},'court');
      gardenDetails.riverLanterns.sync(lanternRows.filter(r=>r.area==='court'),lanternTime);
      // The hall remains a quiet worship space; animals stay in the courtyard.
      for(const p of pets){stage.remove(p.root);disposeTree(p.root);}pets=[];
      pickables=pickables.filter(p=>p.userData.kind!=='pet');
      residents.forEach((p,i)=>{p.root.position.set([-6.1,6.1,6.1][i],0,[1.5,-1.2,5][i]);p.root.rotation.y=Math.PI;p.action='kneel';});

    }
    const indoor=['main','yongyou','falun','wanfu'].includes(id);
    batchStatic(stage,[...residents.map(p=>p.root),...pets.map(p=>p.root),...smoke,leafs,gardenDetails?.water]);renderer.shadowMap.needsUpdate=true;
    if(!indoor){gardenDetails=buildCourtyard(stage,pickables,{mesh,group,roof,tag,line},id);gardenDetails.riverLanterns.sync(lanternRows.filter(r=>r.area===id),lanternTime);}
    controls.setBoundary(new THREE.Box3(new THREE.Vector3(indoor?-10.6:-24,.5,indoor?-5.2:-23),new THREE.Vector3(indoor?10.6:24,indoor?7.7:23,indoor?15.5:24)));controls.boundaryEnclosesCamera=true;controls.maxDistance=indoor?14:25;controls.maxPolarAngle=indoor?2.25:1.45;controls.colliderMeshes=[];stage.updateMatrixWorld(true);stage.traverse(o=>{if(o.isMesh&&o.userData.cameraSolid)controls.colliderMeshes.push(o);});
    obstacles.splice(0,obstacles.length,...(indoor?[{x:-1.7,z:-4.3,r:.65},{x:0,z:-4.3,r:.9},...[-8.6,8.6].flatMap(x=>[-2.2,4.4].map(z=>({x,z,r:.65})))]:[{x:-9,z:.5,r:1.5},{x:7.2,z:.2,r:2.3},{x:-1.7,z:-4.3,r:.65},{x:0,z:-4.3,r:.9}]));nav?.dispose();makeNav();
    amb.intensity=indoor?.42:1.8;sun.intensity=indoor?.32:1.8;scene.environmentIntensity=indoor?.3:.35;scene.fog.near=indoor?55:42;scene.fog.far=indoor?90:95;scene.background.set(indoor?'#302b25':'#a6b4b3');
    controls.stop();
    if(indoor){player.root.position.set(0,0,10.0);player.root.rotation.y=Math.PI;followCamera=false;controls.setLookAt(0,3.2,14.3,0,2.8,-7,false);onEvent({type:'cameraMode',mode:'overview'});}
    else if(options.door){player.root.position.set(0,0,-2.5);player.root.rotation.y=0;followCamera=false;controls.setLookAt(0,3.2,-7.0,0,1.2,5,false);onEvent({type:'cameraMode',mode:'overview'});}
    else homeView();onEvent({type:'area',area:id});

  }
  function traverseDoor(destination,pray=false){
    clearSelection();resetWalk();
    const indoor=['main','yongyou','falun','wanfu'].includes(area);
    if((area==='court'&&destination==='main')||(indoor&&destination==='court')){
      followCamera=false;controls.setLookAt(0,3.2,indoor?6.5:4.7,0,2.4,indoor?17:-10,true);onEvent({type:'cameraMode',mode:'overview'});
      return moveTo(0,indoor?9.8:-3.2,{destination,pray});
    }
    onEvent({type:'navigate',area:destination,pray});return true;
  }
  function getHit(e){
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    ray.setFromCamera(pointer,camera);
    const ground=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3());
    const maxDistance=ground?ground.distanceTo(ray.ray.origin):Infinity;
    const hits=ray.intersectObjects([...pickables,...Array.from(peers.values()).map(p=>p.root)],true);
    for(const h of hits){
      if(!usableHit(h,maxDistance))continue;
      let o=h.object;
      while(o&&o!==stage){if(o.userData.kind)return o.userData;o=o.parent;}
    }
    return null;
  }
  function onDown(e){renderer.domElement.focus({preventScroll:true});down={x:e.clientX,y:e.clientY};}
  function onUp(e){if(e.button!==0||paused||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const hit=getHit(e);if(hit){if(hit.kind==='portal'){traverseDoor(hit.area,false);return;}if(hit.kind==='pond'){onEvent({type:'interact',kind:'lantern'});return;}if(hit.kind==='pondLegacy'){clearSelection();resetWalk();if(moveTo(-2.2,6.3,'pond')){followCamera=false;controls.setLookAt(3.0,5.0,9.5,-5.7,.65,6.3,true);onEvent({type:'cameraMode',mode:'overview'});onEvent({type:'hint',text:'走到池岸，停下来看看水与树影。'});}return;}if(hit.kind==='tea'){clearSelection();resetWalk();if(moveTo(hit.x,hit.z,'tea'))onEvent({type:'hint',text:'走到茶桌旁，等一盏茶。'});return;}if(hit.kind==='person'||hit.kind==='pet'){select(hit.id);return;}onEvent({type:'interact',...hit});return;}
    const target=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3());
    if(!target)return;
    if(order){order=null;brewAt=0;onEvent({type:'drinkCancelled'});}resetWalk();clearSelection();moveTo(target.x,target.z);
  }
  renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','三维院落：WASD走路，拖动环视，F回到身后');renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointerup',onUp);
  const keydown=e=>{if(paused||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable)return;if(e.key.toLowerCase()==='f'){e.preventDefault();homeView();return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();if(!keys.size){camera.getWorldDirection(keyboardForward);keyboardForward.y=0;keyboardForward.normalize();}resumeFollow();resetWalk();keys.add(e.key.toLowerCase());clearSelection();path=[];afterWalk=null;seat=null;actionUntil=0;destinationRing.visible=false;}};
  const keyup=e=>keys.delete(e.key.toLowerCase());const blur=()=>keys.clear();window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
  const resize=()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(container);resize();rebuild(area);
  const skyNight=new THREE.Color('#172d39'),skyDay=new THREE.Color('#b5c5c0'),skyWarm=new THREE.Color('#b6a591');
  function applyDaylight(dt){
    const v=daylight(Date.now(),lightMode),indoor=['main','yongyou','falun','wanfu'].includes(area),k=1-Math.exp(-dt*1.6);
    const sky=skyNight.clone().lerp(skyDay,v.day).lerp(skyWarm,v.warm*.32);
    scene.background.lerp(sky,k);scene.fog.color.copy(scene.background);scene.environmentIntensity=THREE.MathUtils.lerp(scene.environmentIntensity,indoor?.22:.07+v.day*.30,k);
    amb.intensity=THREE.MathUtils.lerp(amb.intensity,indoor?.26+v.day*.16:.25+v.day*.85,k);
    sun.intensity=THREE.MathUtils.lerp(sun.intensity,indoor?.10+v.day*.22:.12+v.day*2.1,k);
    sun.color.lerp(new THREE.Color('#a4bed3').lerp(new THREE.Color('#f1dfbf'),v.day).lerp(new THREE.Color('#eabd8e'),v.warm*.55),k);
    if(gardenDetails?.water?.material.uniforms)gardenDetails.water.material.uniforms.sunColor.value.copy(sun.color).multiplyScalar(.18+v.day*.6);
    if(gardenDetails)for(const {light,bulb} of gardenDetails.lamps){light.intensity=2.5*v.lamps;bulb.material.emissiveIntensity=.12+1.4*v.lamps;}
  }
  function tick(now){if(disposed)return;frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;clock+=dt;
    applyDaylight(dt);if(gardenDetails?.water?.material.uniforms)gardenDetails.water.material.uniforms.time.value=reduced?0:clock*.28;gardenDetails?.water?.userData.tick?.(reduced?0:clock);gardenDetails?.riverLanterns.tick();teaCup.visible=!!heldDrink&&!['bow','kneel','bracelet','beads','pet','dance','incense','lantern'].includes(action);teaCup.position.y=action==='drink'?1.35:action==='rest'?1.12:1.05;
    if(brewAt&&clock>=brewAt){brewAt=0;heldDrink=order;order=null;startSequence('receive',()=>{onEvent({type:'drinkReady',drink:heldDrink});bubble(player,'茶好了，去树下坐坐。');});}
    if(teaUntil&&action!=='greet')teaUntil=0;
    if(teaUntil&&clock>teaUntil){teaUntil=0;action='idle';bubble(player,'茶喝完了，继续慢慢逛。');}

    // Camera updates after player movement below, so there is no one-frame follow lag.
    if(selected&&!actors().includes(selected))clearSelection();
    if(selected)selectedRing.position.set(selected.root.position.x,.11,selected.root.position.z);
    for(let i=bubbles.length-1;i>=0;i--){const q=bubbles[i];if(q.until<clock){q.parent.remove(q.b);q.b.material.map.dispose();q.b.material.dispose();bubbles.splice(i,1);}}
    if(actionUntil&&clock>actionUntil){action=seat>=100?'rest':'idle';actionUntil=0;onEvent({type:'action',action,seat});}
    actors().forEach(p=>{if(p.label){const d=p.root.position.distanceTo(player.root.position);p.label.visible=(followCamera&&d<4.5)||p===selected;p.label.material.opacity=p===selected?1:Math.max(.3,1-d/12);}});
    if(Math.floor(clock*2)!==nearbyStamp){nearbyStamp=Math.floor(clock*2);onEvent({type:'nearby',items:actors().map(describe).sort((a,b)=>a.distance-b.distance)});}

    if(!paused&&path.length){const target=path[0],delta=target.clone().sub(player.root.position);delta.y=0;const distance=delta.length();if(distance<.08){path.shift();if(!path.length){destinationRing.visible=false;if(afterWalk&&typeof afterWalk==='object'){const crossing=afterWalk;afterWalk=null;action='idle';onEvent({type:'navigate',area:crossing.destination,pray:crossing.pray});return;}action=afterWalk||'idle';if(action==='interact')finishInteraction();if(action==='rest'){const b=BENCHES.find(b=>b.id===seat);player.root.rotation.y=b?.yaw||0;if(b){followCamera=false;controls.setLookAt(b.x+(b.x>0?-3.5:3.5),3.4,b.z+.7,b.x,.9,b.z,true);onEvent({type:'cameraMode',mode:'overview'});}}if(action==='pickup'){player.root.rotation.y=Math.PI;startSequence('pickup',()=>{carryingIncense=true;if(!moveTo(0,-3.2,'incense'))cancelSequence();onEvent({type:'hint',text:'双手拿稳，慢慢走到香炉前。'});});}else if(action==='incense'){player.root.rotation.y=Math.PI;startSequence('incense',()=>{onEvent({type:'hint',text:'香已插好，愿你此刻心安。'});});}if(action==='returnCup'){
      player.root.rotation.y=Math.PI/2;
      startSequence('returnCup',()=>{
        const returned=teaCup.clone();
        stage.add(returned);
        const previous=stage.getObjectByName('returned-cup');
        if(previous)stage.remove(previous);
        returned.name='returned-cup';returned.visible=true;
        returned.position.set(6.56,.86,8.6);returned.rotation.set(0,0,0);
        heldDrink=null;teaCup.visible=false;
        onEvent({type:'cupReturned'});
      });
    }if(action==='lampReady'){action='idle';player.root.rotation.y=-Math.PI/2;if(arrivalResolve){arrivalResolve(true);arrivalResolve=null;}}if(action==='brew'){action='idle';player.root.rotation.y=Math.PI;followCamera=false;controls.setLookAt(3.5,2.6,4.5,6.2,1.35,1.7,true);onEvent({type:'cameraMode',mode:'overview'});brewAt=clock+3;gardenDetails?.teaService?.start(clock);onEvent({type:'hint',text:'正在为你备茶，稍等三秒。'});}if(action==='pond'){action='idle';player.root.rotation.y=-Math.PI/2;}if(action==='tea'){action='greet';player.root.rotation.y=0;teaUntil=clock+9;bubble(player,'捧一盏茶 · 慢慢喝');onEvent({type:'hint',text:'松风茶已备好，停留片刻。点空地即可离开。'});}if(['kneel','bow','bracelet'].includes(action))player.root.rotation.y=Math.PI;onEvent({type:'action',action,seat});afterWalk=null;}}else{delta.normalize();player.root.position.addScaledVector(delta,Math.min(distance,dt*3.3));player.root.rotation.y+=Math.atan2(Math.sin(Math.atan2(delta.x,delta.z)-player.root.rotation.y),Math.cos(Math.atan2(delta.x,delta.z)-player.root.rotation.y))*(1-Math.exp(-dt*12));}}
    if(!paused&&keys.size){const f=keyboardForward;const r=new THREE.Vector3(-f.z,0,f.x);const d=new THREE.Vector3();if(keys.has('w')||keys.has('arrowup'))d.add(f);if(keys.has('s')||keys.has('arrowdown'))d.sub(f);if(keys.has('d')||keys.has('arrowright'))d.add(r);if(keys.has('a')||keys.has('arrowleft'))d.sub(r);d.normalize();const v=player.root.position.clone().addScaledVector(d,dt*3.5);if(walkable(v.x,v.z)){player.root.position.copy(v);player.root.rotation.y=Math.atan2(d.x,d.z);action='walk';}}
    else if(action==='walk'&&!path.length)action='idle';
    if(followCamera){
      followTarget.copy(player.root.position);followTarget.y+=1.6;
      camTarget.lerp(followTarget,1-Math.exp(-dt*9));
      controls.moveTo(camTarget.x,camTarget.y,camTarget.z,false);
      if(action==='walk'&&!cameraHeld&&clock>manualCameraUntil){
        controls.rotateTo(followHeading(controls.azimuthAngle,player.root.rotation.y,dt),controls.polarAngle,false);
      }
    }
    controls.update(dt);
    animatePerson(player,action,clock,action==='walk',reduced);
    gardenDetails?.teaService?.tick(clock,!!order);
    if(sequence){
      const current=sequence,pose=ritualPose(current.kind,current.at>clock&&current.kind==='lantern'?1:clock-current.at);
      player.upper.rotation.x=pose.bend;player.head.rotation.x=current.kind==='sip'?-.06:pose.bend*.15;
      player.arms.forEach((arm,i)=>{arm.rotation.x=pose.arm;arm.rotation.z=(i===0?1:-1)*.42;});
      player.root.updateMatrixWorld(true);
      const hands=player.arms.map(arm=>arm.localToWorld(new THREE.Vector3(0,-.43,.015)));
      const center=hands[0].add(hands[1]).multiplyScalar(.5);
      if(current.kind==='pickup'){const t=clock-current.at;incenseProp.visible=t>=1.3;if(stockIncense)stockIncense.visible=t<1.3;const f=THREE.MathUtils.smoothstep(t,1.3,3.1);center.lerp(new THREE.Vector3(-1.7,.94,-4.27),1-f);incenseProp.position.copy(player.root.worldToLocal(center));incenseProp.rotation.z=(1-f)*Math.PI/2;}
      if(current.kind==='incense'){incenseProp.rotation.z=0;incenseProp.visible=pose.release<1;const place=new THREE.Vector3(0,1.32,-4.3);const reach=THREE.MathUtils.smoothstep(clock-current.at,3.2,5.4);center.lerp(place,reach);center.y-=.32*THREE.MathUtils.smoothstep(clock-current.at,5.4,7.4);incenseProp.position.copy(player.root.worldToLocal(center));if(pose.release>=1&&carryingIncense&&placedIncense){carryingIncense=false;placedIncense.visible=true;incenseUntil=clock+28;renderer.shadowMap.needsUpdate=true;}}
      if(current.kind==='returnCup'){
        center.lerp(new THREE.Vector3(6.56,.86,8.6),pose.release);
        teaCup.visible=true;teaCup.position.copy(player.root.worldToLocal(center));
      }
      if(current.kind==='lantern'){heldLamp.visible=clock-current.at<3.8;center.lerp(new THREE.Vector3(-3.3,.23,6.3),pose.release);heldLamp.position.copy(player.root.worldToLocal(center));}
      if(current.kind==='sip'||current.kind==='receive'){teaCup.visible=!!heldDrink;teaCup.position.copy(player.root.worldToLocal(center));teaCup.position.y+=.06;teaCup.rotation.x=current.kind==='sip'?Math.sin(Math.min(1,(clock-current.at)/3)*Math.PI)*.22:0;}
      if(current.label!==pose.label){current.label=pose.label;onEvent({type:'hint',text:pose.label+' · 点空地可停下'});}
      if(pose.done){sequence=null;incenseProp.visible=false;heldLamp.visible=false;player.head.rotation.x=0;action=seat>=100?'rest':'idle';current.complete?.();}
    }else{teaCup.rotation.x=0;teaCup.position.set(0,action==='rest'?1.12:1.05,.38);if(heldDrink&&!carryingIncense&&!['bow','kneel','bracelet','beads','pet','dance','incense','lantern'].includes(action)){player.arms.forEach((arm,i)=>{arm.rotation.x=-1.25;arm.rotation.z=(i===0?1:-1)*.42;});player.root.updateMatrixWorld(true);const left=player.arms[0].localToWorld(new THREE.Vector3(0,-.43,.015)),right=player.arms[1].localToWorld(new THREE.Vector3(0,-.43,.015));teaCup.position.copy(player.root.worldToLocal(left.add(right).multiplyScalar(.5)));teaCup.position.y+=.06;}}
    if(carryingIncense&&!sequence){player.arms.forEach((arm,i)=>{arm.rotation.x=-1.45;arm.rotation.z=(i===0?1:-1)*.42;});player.root.updateMatrixWorld(true);const a=player.arms[0].localToWorld(new THREE.Vector3(0,-.43,.015)),b=player.arms[1].localToWorld(new THREE.Vector3(0,-.43,.015));incenseProp.visible=true;incenseProp.rotation.z=0;incenseProp.position.copy(player.root.worldToLocal(a.add(b).multiplyScalar(.5)));teaCup.visible=false;}
    residents.forEach(p=>{if(p.responseAt&&clock>=p.responseAt){p.action=p.responseAction;p.responseAt=0;bubble(p,p.responseAction==='dance'?'♪ 一起慢慢摇':'合掌回礼 · 愿你心安');}if(p.responseUntil&&clock>p.responseUntil){p.action='idle';p.responseUntil=0;}animatePerson(p,p.action,clock,false,reduced);});
    peers.forEach(p=>{p.root.position.lerp(p.target,1-Math.exp(-dt*5));p.root.rotation.y=THREE.MathUtils.lerp(p.root.rotation.y,p.yaw,dt*8);animatePerson(p,p.action,clock,p.action==='walk',reduced);});
    pets.forEach((p,i)=>{const dance=p.dance&&area==='garden';const follow=p.follow&&!dance;const sleeping=!dance&&!follow&&p.pettedUntil<=clock&&Math.floor((clock+p.phase)/18)%3===2;let walking=false;
      if(dance){const angle=(i+1)*Math.PI*.55;const target=player.root.position.clone().add(new THREE.Vector3(Math.cos(angle)*1.55,0,Math.sin(angle)*1.55));if(walkable(target.x,target.z))p.root.position.lerp(target,1-Math.exp(-dt*2));p.root.rotation.y=Math.atan2(player.root.position.x-p.root.position.x,player.root.position.z-p.root.position.z);}
      if(follow){const target=player.root.position.clone().add(new THREE.Vector3((i-1)*.8,0,1.25));const delta=target.sub(p.root.position);delta.y=0;if(delta.length()>.4){walking=true;const v=p.root.position.clone().addScaledVector(delta.normalize(),dt*2.5);if(walkable(v.x,v.z))p.root.position.copy(v);p.root.rotation.y=Math.atan2(delta.x,delta.z);}}
      else if(!dance&&!sleeping&&clock>(p.holdUntil||0)){const target=p.home.clone().add(new THREE.Vector3(Math.sin(clock*.18+p.phase)*.8,0,Math.cos(clock*.18+p.phase)*.5));const delta=target.sub(p.root.position);if(delta.length()>.08){walking=true;p.root.position.addScaledVector(delta.normalize(),dt*.45);p.root.rotation.y=Math.atan2(delta.x,delta.z);}}
      p.body.position.y=dance?.40+Math.abs(Math.sin(clock*5+i))*.25:.37;p.body.rotation.z=dance?Math.sin(clock*5+i)*.20:0;p.head.rotation.z=p.pettedUntil>clock?Math.sin(clock*4)*.15:Math.sin(clock*.7+i)*.04;p.tail.rotation.z=Math.sin(clock*(follow||dance?8:2)+i)*.3;
      p.legs.forEach((l,j)=>{l.rotation.x=walking?Math.sin(clock*9+j)*.5:0;});if(p.pettedUntil>clock)p.body.rotation.z=.10;if(sleeping){p.body.position.y=.19+Math.sin(clock)*.008;p.body.rotation.z=.28;p.head.rotation.z=.2;}
    });
    const tmp=new THREE.Object3D();leafs?.userData.seeds.forEach((p,i)=>{tmp.position.set(p.x+Math.sin(clock*.4+p.phase)*.6,reduced?.1:(p.y-clock*.28%6+6)%6,p.z);tmp.rotation.set(clock+p.phase,p.phase,clock*.3);tmp.updateMatrix();leafs.setMatrixAt(i,tmp.matrix);});if(leafs)leafs.instanceMatrix.needsUpdate=true;
    if(now-lastReport>160){lastReport=now;renderer.domElement.dataset.camera=JSON.stringify({mode:followCamera?'follow':'overview',player:player.root.position.toArray(),target:controls.getTarget(followTarget).toArray(),position:camera.position.toArray(),heading:player.root.rotation.y});onEvent({type:'position',x:player.root.position.x,z:player.root.position.z,yaw:player.root.rotation.y,action,seat});}
    smoke.forEach((p,i)=>{const f=(clock*.35+i/9)%1;p.visible=clock<incenseUntil;p.position.set(Math.sin(clock+i)*.1+f*.4,1.55+f*2.4,-4.3);p.scale.set(.13+f*.4,.28+f*.75,1);p.material.opacity=(1-f)*.55;});
    if(now-lastShadow>125){renderer.shadowMap.needsUpdate=true;lastShadow=now;}renderer.render(scene,camera);perfFrames++;if(now-perfAt>2000){renderer.domElement.dataset.performance=JSON.stringify({fps:Math.round(perfFrames*1000/(now-perfAt)),focused:document.hasFocus(),dpr:renderer.getPixelRatio(),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures});perfAt=now;perfFrames=0;}
  }
  frame=requestAnimationFrame(tick);
  return{
    go:rebuild,
    traverseDoor,
    lookOutside(){followCamera=false;controls.setLookAt(0,3.1,8.0,0,1.5,24,true);onEvent({type:'cameraMode',mode:'overview'});},
    faceAltar(){followCamera=false;controls.setLookAt(0,4.2,2.8,0,4.2,-8.85,true);onEvent({type:"cameraMode",mode:"overview"});},
    restBench(id){const b=BENCHES.find(b=>b.id===id);if(!b)return false;resetWalk();seat=id;return moveTo(b.x,b.z,'rest');},
    orderDrink(id){if(!DRINKS.some(d=>d.id===id))return false;resetWalk();order=id;brewAt=0;heldDrink=null;homeView();return moveTo(6.3,2.9,'brew');},
    sip(){if(!heldDrink||path.length||sequence)return false;player.seated=seat>=100;startSequence('sip');return true;},
    returnCup(){
      if (!heldDrink || area !== 'court') return false;
      resetWalk();
      return moveTo(6.3,8.6,'returnCup');
    },
    putCup(){heldDrink=null;},
    cancelDrink(){cancelSequence();heldDrink=null;order=null;brewAt=0;if(afterWalk==='brew')resetWalk();},
    visitPond(){resetWalk();moveTo(-2.2,6.3,'pond');followCamera=false;controls.setLookAt(3,5,9.5,-5.7,.65,6.3,true);onEvent({type:'cameraMode',mode:'overview'});},
    setLanterns(rows,serverTime){lanternRows=rows;lanternTime=serverTime;gardenDetails?.riverLanterns.sync(rows.filter(r=>r.area===(['main','yongyou','falun','wanfu'].includes(area)?'court':area)),serverTime);},

    select,interact,clearSelection,
    receive(id,kind){const p=actor(id);if(p)bubble(p,kind==='dance'?'邀请你一起跳舞':'向你合掌问好');},
    overview(){followCamera=false;const inside=['main','yongyou','falun','wanfu'].includes(area);controls.setLookAt(inside?8:17,inside?6:19,inside?10:23,0,1,-1,true);onEvent({type:'cameraMode',mode:'overview'});},

    sit(index,pose='bow'){if(['main','yongyou','falun','wanfu'].includes(area)){followCamera=false;controls.setLookAt(0,3.2,9.8,0,1.1,-7,true);onEvent({type:'cameraMode',mode:'overview'});}seat=index;const p=MATS[index];return moveTo(p.x,p.z,pose);},
    act(value){cancelSequence();interaction=null;destinationRing.visible=false;actionUntil=0;path=[];afterWalk=null;action=value;if(!['bow','kneel','bracelet','beads'].includes(value))seat=null;onEvent({type:'action',action,seat});},
    pet(id,mode){const p=pets.find(p=>p.spec.id===id);if(!p)return;if(mode==='pat'){return interact(id,'pat');}if(mode==='follow'){p.follow=!p.follow;return p.follow;}if(mode==='dance'){p.dance=!p.dance;return p.dance;}},
    dancePets(){pets.forEach(p=>p.dance=true);},
    lightIncense(){resetWalk();clearSelection();if(!moveTo(-1.7,-3.3,'pickup'))return false;followCamera=false;controls.setLookAt(3.3,2.6,-5.8,0,1.2,-3.5,true);onEvent({type:'cameraMode',mode:'overview'});onEvent({type:'hint',text:'先到香炉旁的取香台，伸手取香。'});return true;},
    launchLantern(starts,serverOffset=0){startSequence('lantern');sequence.at=clock+Math.max(0,(starts-Date.now()-serverOffset)/1000-3.8);},
    prepareLantern(){resetWalk();return new Promise(resolve=>{arrivalResolve=resolve;if(!moveTo(-2.2,6.3,'lampReady')){arrivalResolve=null;resolve(false);}else{followCamera=false;controls.setLookAt(1,3.8,9,-3.8,.8,6.3,true);}});},
    color(id){const color=COLORS.find(c=>c.id===id)?.hex||COLORS[0].hex;player.robe.material=mat(color);player.hem.material=mat(color);player.arms.forEach(a=>a.children[0].material=mat(color));},
    setName(name){myLabel.material.map.dispose();myLabel.material.dispose();player.root.remove(myLabel);selfName=name;myLabel=label(player.root,'你 · '+name,[0,2.36,0],'#2f514b');},
    setPeers(rows){const ids=new Set();for(const row of rows){if(row.area!==area)continue;ids.add(row.id);let p=peers.get(row.id);if(!p){p=person(scene,COLORS.find(c=>c.id===row.color)?.hex||COLORS[0].hex);p.root.position.set(row.x,0,row.z);p.id=row.id;p.name=row.name;p.remote=true;p.root.userData={kind:'person',id:row.id};p.label=label(p.root,row.name,[0,2.36,0],'#e2ebd8');peers.set(row.id,p);}p.target=new THREE.Vector3(row.x,0,row.z);p.yaw=row.yaw;p.action=row.action;p.seated=row.seat>=100&&row.action!=='walk';const col=COLORS.find(c=>c.id===row.color)?.hex||COLORS[0].hex;p.robe.material=mat(col);p.hem.material=mat(col);p.arms.forEach(a=>a.children[0].material=mat(col));}peers.forEach((p,id)=>{if(!ids.has(id)){scene.remove(p.root);peers.delete(id);}});},
    lighting(mode){lightMode=mode;},
    quality(low){renderer.setPixelRatio(low?1:Math.min(window.devicePixelRatio,1.35));renderer.shadowMap.enabled=!low;},
    reduced(v){reduced=v;},
    pause(v){paused=v;keys.clear();controls.enabled=!v;},
    lookUp(){followCamera=false;const p=player.root.position;controls.setLookAt(p.x,1.7,p.z+1,p.x,6.3,p.z-6,true);onEvent({type:'cameraMode',mode:'overview'});},
    home:homeView,
    zoom(amount){controls.dolly(amount,true);},
    photo(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
    dispose(){stopCapture();cancelSequence();disposed=true;window.removeEventListener('sanctuary-asset-error',assetError);cancelAnimationFrame(frame);ro.disconnect();controls.removeEventListener('controlstart',cameraStart);controls.removeEventListener('controlend',cameraEnd);controls.dispose();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointerup',onUp);disposeTree(stage);disposeTree(player.root);for(const p of peers.values())disposeTree(p.root);envTarget.dispose();renderer.dispose();renderer.domElement.remove();nav?.dispose();},
  };
}
