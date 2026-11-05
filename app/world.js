import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { Pathfinding } from 'three-pathfinding';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { AREAS, COLORS, MATS, PETS } from './data';

CameraControls.install({THREE});
const palette={red:'#9e493b',redLight:'#bd6950',gold:'#dbac52',goldLight:'#f0c777',green:'#496558',beam:'#4e8279',stone:'#c2b99e',cream:'#f8efd8',wood:'#765445'};
const sharedGeo={ sphere:new THREE.SphereGeometry(1,20,14), box:new THREE.BoxGeometry(1,1,1), round:new RoundedBoxGeometry(1,1,1,2,.12), cylinder:new THREE.CylinderGeometry(1,1,1,20), cone:new THREE.ConeGeometry(1,1,18) };
const materials=new Map();
function mat(color,metalness=0){const key=color+metalness;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.77,metalness}));return materials.get(key);}
function mesh(parent,type,pos,scale,color,metal=0){const m=new THREE.Mesh(sharedGeo[type],mat(color,metal));m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function group(parent,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;}
function line(parent,points,color,r=.035){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,16,r,6,false),mat(color));parent.add(m);return m;}
function tag(parent,text,pos,{width=3,font=40,color='#f9edcf',bg='#354c41'}={}){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(2,2,508,124,24);ctx.fill();ctx.strokeStyle='#c9b17b';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=color;ctx.font=`600 ${font}px "Microsoft YaHei", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial({map:texture,transparent:true}));m.position.set(...pos);parent.add(m);return m;
}
function label(parent,text,pos,color='#fff9eb'){
  const c=document.createElement('canvas');c.width=384;c.height=92;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(6,6,372,80,40);ctx.fill();ctx.fillStyle='#4c5140';ctx.font='500 32px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,192,48);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.position.set(...pos);s.scale.set(2.8,.67,1);s.renderOrder=8;parent.add(s);return s;
}

function roof(parent,w,d,y,height,color=palette.gold){
  // Curved tiled slopes, with raised eaves and an ornamental ridge.
  const verts=[],idx=[];const nx=20,nz=12;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
    const x=(i/nx-.5)*w,z=(j/nz-.5)*d;
    const a=Math.abs(z/(d*.5)),b=Math.abs(x/(w*.5));
    const h=y+height*Math.pow(1-a,.75)+.35*Math.pow(a,7)+.32*Math.pow(b,8);
    verts.push(x,h,z);
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;idx.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();
  const r=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.7,side:THREE.DoubleSide}));r.castShadow=true;r.receiveShadow=true;parent.add(r);
  for(let i=0;i<=28;i++){const x=(i/28-.5)*w;for(const side of [-1,1]){
    const pts=[];for(let j=0;j<=8;j++){const a=j/8;pts.push([x,y+height*Math.pow(1-a,.75)+.35*Math.pow(a,7)+.32*Math.pow(Math.abs(x/(w*.5)),8)+.035,side*a*d*.5]);}
    line(parent,pts,i%3===0?palette.goldLight:color,.044);
  }}
  for(const side of [-1,1])line(parent,Array.from({length:9},(_,i)=>{const x=(i/8-.5)*w;return[x,y+.35+.32*Math.pow(Math.abs(x/(w*.5)),8),side*d*.5]}),palette.goldLight,.10);
  line(parent,[[-w*.39,y+height+.25,0],[0,y+height+.20,0],[w*.39,y+height+.25,0]],palette.goldLight,.15);
  for(const side of [-1,1]){mesh(parent,'sphere',[side*w*.4,y+height+.4,0],[.17,.25,.17],palette.goldLight);}
}
function buddha(parent,x,y,z,kind='seated',s=1){
  const g=group(parent,[x,y,z]);g.scale.setScalar(s);
  mesh(g,'cylinder',[0,.16,0],[1.02,.28,.75],palette.gold,.4);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const p=mesh(g,'sphere',[Math.cos(a)*.76,.39,Math.sin(a)*.58],[.29,.25,.19],i%2?palette.goldLight:palette.gold,.3);p.rotation.y=-a;}
  const stand=kind==='standing';
  mesh(g,'sphere',[0,stand?1.5:1.07,0],[.65,stand?1.18:.75,.49],'#cf963e',.35);
  if(!stand){mesh(g,'sphere',[-.45,.64,.27],[.65,.25,.49],palette.gold,.3);mesh(g,'sphere',[.45,.64,.27],[.65,.25,.49],palette.gold,.3);}
  const hy=stand?2.82:2.10;
  mesh(g,'sphere',[0,hy,0],[.47,.56,.43],palette.goldLight,.3);
  for(const s of [-1,1]){mesh(g,'sphere',[s*.47,hy-.10,0],[.13,.29,.13],palette.gold,.3);line(g,[[s*.1,hy+.02,.416],[s*.18,hy-.01,.43],[s*.26,hy+.02,.397]],'#6c5835',.018);}
  mesh(g,'sphere',[0,hy-.08,.43],[.065,.09,.06],palette.goldLight);
  line(g,[[-.11,hy-.24,.39],[0,hy-.27,.43],[.11,hy-.24,.39]],'#97723c',.013);
  mesh(g,'sphere',[0,hy+.47,-.02],[.4,.23,.36],kind==='lama'?'#e8bc42':'#816740');
  if(kind==='lama')mesh(g,'cone',[0,hy+.76,0],[.43,.75,.32],'#edc74d');
  else mesh(g,'sphere',[0,hy+.66,-.03],[.16,.20,.15],palette.gold);
  for(const side of [-1,1]){const arm=mesh(g,'sphere',[side*.58,stand?1.7:1.25,.10],[.24,.58,.24],palette.gold,.25);arm.rotation.z=side*.22;mesh(g,'sphere',[side*.30,stand?1.22:1.0,.55],[.22,.13,.17],palette.goldLight,.3);}
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.9,.035,8,52),mat('#e7be69',.4));halo.position.set(0,hy-.1,-.40);g.add(halo);
  return g;
}
function lantern(parent,x,y,z){
  const g=group(parent,[x,y,z]);mesh(g,'sphere',[0,0,0],[.30,.43,.30],palette.redLight);mesh(g,'cylinder',[0,.37,0],[.24,.07,.24],palette.gold);mesh(g,'cylinder',[0,-.37,0],[.21,.07,.21],palette.gold);line(g,[[0,-.4,0],[0,-.77,0]],palette.gold,.035);line(g,[[0,.4,0],[0,.8,0]],palette.wood,.02);
}
function tree(parent,x,z,scale=1){
  const g=group(parent,[x,0,z]);g.scale.setScalar(scale);
  mesh(g,'cylinder',[0,1.9,0],[.22,3.8,.22],palette.wood);
  for(const side of [-1,1])line(g,[[0,1.6,0],[side*.5,2.7,.1],[side*1.1,3.5,.12]],palette.wood,.1);
  const colors=['#e4ba4d','#eac860','#d1ac4f','#f0d47c'];
  for(let i=0;i<14;i++){const a=i*2.399,r=.4+(i%3)*.52;mesh(g,'sphere',[Math.cos(a)*r,3.5+Math.sin(i*1.7)*.65,Math.sin(a)*r],[1.1,.83,1.02],colors[i%4]);}
  mesh(g,'cylinder',[0,.15,0],[1.5,.28,1.5],palette.stone);
}
function hall(parent,area,clickable){
  const g=group(parent,[0,0,-7.4]);
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
  tag(g,AREAS.find(a=>a.id===area)?.name||'雍和小院',[0,4.15,2.42],{width:3.0,font:43});
  lantern(g,-4.6,3.4,2.5);lantern(g,4.6,3.4,2.5);
  if(area==='wanfu')buddha(g,0,.72,0,'standing',1.35);
  else if(area==='falun')buddha(g,0,.72,0,'lama',1.27);
  else if(area==='main'||area==='yongyou')for(const x of [-2.65,0,2.65])buddha(g,x,.72,0,'seated',x===0?1.05:.87);
  else buddha(g,0,.72,0,'seated',1.05);
  if(area==='court'){g.userData={kind:'portal',area:'main'};clickable.push(g);}
  for(const side of [-1,1]){
    const wing=group(parent,[side*10,0,-5.7]);mesh(wing,'box',[0,1.6,0],[3.4,3.2,6.5],palette.red);roof(wing,4.8,8,3.3,.7,palette.gold);
    for(let i=0;i<3;i++){mesh(wing,'box',[-side*1.74,1.8,i*1.8-1.8],[.08,1.7,1.1],palette.green);for(let j=0;j<4;j++)mesh(wing,'box',[-side*1.8,1.15+j*.4,i*1.8-1.8],[.08,.05,1.1],palette.gold);}
  }
}
function person(parent,color,variant='bun'){
  const root=group(parent),body=group(root,[0,.1,0]),upper=group(body,[0,.44,0]);
  const robe=mesh(upper,'sphere',[0,.24,0],[.40,.50,.29],color);
  mesh(upper,'round',[0,.06,.20],[.40,.50,.14],palette.cream);
  mesh(upper,'round',[0,.29,.30],[.48,.07,.09],'#c7ad72');
  const head=group(upper,[0,.96,0]);mesh(head,'sphere',[0,0,0],[.47,.47,.43],'#edc5a1');
  mesh(head,'sphere',[0,.15,-.10],[.48,.37,.37],'#50453b');
  mesh(head,'sphere',[0,-.01,.17],[.43,.37,.28],'#f1ceb1');
  if(variant==='bun')for(const side of [-1,1])mesh(head,'sphere',[side*.34,.36,-.09],[.22,.22,.20],'#50453b');
  else mesh(head,'sphere',[0,.43,-.07],[.18,.18,.18],'#50453b');
  for(const side of [-1,1]){mesh(head,'sphere',[side*.42,-.04,0],[.105,.13,.09],'#edc5a1');line(head,[[side*.10,.025,.431],[side*.16,-.003,.445],[side*.22,.02,.423]],'#3d3932',.021);mesh(head,'sphere',[side*.28,-.10,.367],[.085,.045,.016],'#dd9387');}
  line(head,[[-.055,-.15,.43],[0,-.176,.444],[.055,-.15,.43]],'#ab7161',.015);
  const arms=[];for(const side of [-1,1]){const a=group(upper,[side*.34,.53,0]);const sleeve=mesh(a,'sphere',[0,-.20,0],[.16,.3,.16],color);mesh(a,'sphere',[0,-.43,.015],[.13,.13,.12],'#f1ceb1');a.rotation.z=side*.12;arms.push(a);}
  const legs=[];for(const side of [-1,1]){const l=group(body,[side*.19,.27,0]);mesh(l,'sphere',[0,-.11,0],[.15,.25,.14],'#5c675f');mesh(l,'sphere',[0,-.24,.07],[.17,.09,.22],'#f3e6cc');legs.push(l);}
  const bracelet=group(upper,[0,.6,.55]);for(let i=0;i<12;i++){const a=i*Math.PI/6;mesh(bracelet,'sphere',[Math.cos(a)*.18,Math.sin(a)*.18,0],[.043,.043,.043],'#ac6a35');}bracelet.visible=false;
  return{root,body,upper,head,arms,legs,robe,bracelet,color,action:'idle',phase:Math.random()*6};
}
function animatePerson(p,action,t,moving=false,reduced=false){
  p.action=action;const s=reduced?.3:1,f=t*5+p.phase;
  const kneel=['kneel','bow','bracelet','beads'].includes(action);
  p.body.position.y=THREE.MathUtils.lerp(p.body.position.y,kneel?-.18:.10,.15);
  p.upper.rotation.x=action==='bow'?(.16+(1-Math.cos(t*1.8))*.45)*s:0;
  p.upper.rotation.z=action==='dance'?Math.sin(f)*.17*s:0;
  p.head.rotation.z=action==='dance'?Math.sin(f+.4)*.13*s:Math.sin(t*.8+p.phase)*.035*s;
  p.body.position.y+=action==='dance'?Math.abs(Math.sin(f))*.04*s:moving?Math.abs(Math.sin(f*1.8))*.035*s:0;
  p.bracelet.visible=action==='bracelet';
  for(let i=0;i<2;i++){const side=i===0?-1:1,arm=p.arms[i],leg=p.legs[i];
    arm.rotation.x=action==='bracelet'?-1.8:kneel||action==='greet'?-1.1:action==='dance'?Math.sin(f+i)*.65*s:moving?Math.sin(f*1.8+i*Math.PI)*.55:0;
    arm.rotation.z=action==='dance'?side*(.8+Math.sin(f)*.25)*s:kneel||action==='greet'?-side*.48:side*.12;
    leg.rotation.x=kneel?1.35:moving?Math.sin(f*1.8+i*Math.PI)*.45:0;
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
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','可探索的三维雍和小院，点地移动，拖动旋转视角');renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#dce4ce');scene.fog=new THREE.Fog('#dce4ce',42,90);
  const camera=new THREE.PerspectiveCamera(38,1,.1,130);camera.position.set(17,16,23);
  const controls=new CameraControls(camera,renderer.domElement);controls.setTarget(0,1.1,-1);controls.minDistance=13;controls.maxDistance=43;controls.minPolarAngle=.45;controls.maxPolarAngle=1.25;controls.smoothTime=.3;controls.draggingSmoothTime=.13;controls.mouseButtons.left=CameraControls.ACTION.ROTATE;controls.mouseButtons.right=CameraControls.ACTION.TRUCK;controls.touches.one=CameraControls.ACTION.TOUCH_ROTATE;controls.touches.two=CameraControls.ACTION.TOUCH_DOLLY_TRUCK;
  const amb=new THREE.HemisphereLight('#fff3d9','#7a8b66',2.4);scene.add(amb);
  const sun=new THREE.DirectionalLight('#ffdfaa',3.0);sun.position.set(-12,22,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:60});sun.shadow.normalBias=.04;sun.shadow.bias=-.0001;scene.add(sun);
  let stage=new THREE.Group();scene.add(stage);let pickables=[],pets=[],residents=[],smoke=[],incenseUntil=0,leafs,area='court',disposed=false,path=[],afterWalk=null,action='idle',seat=null,reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,hiddenUI=false,paused=false;
  const player=person(scene,COLORS.find(c=>c.id===options.color)?.hex||COLORS[0].hex);player.root.position.set(0,0,7);player.root.rotation.y=Math.PI;
  let myLabel=label(player.root,'我 · 慢慢来',[0,2.36,0]);
  const pointer=new THREE.Vector2(),ray=new THREE.Raycaster();let down={x:0,y:0};let frame=0,last=performance.now(),clock=0,lastReport=0;
  const peers=new Map(),keys=new Set(),obstacles=[{x:-8,z:3,r:1.8},{x:8,z:1,r:1.8},{x:0,z:-4.3,r:.9}];
  const pathfinder=new Pathfinding();let nav;
  function walkable(x,z){return x>-11.5&&x<11.5&&z>-4.8&&z<10.5&&!obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r);}
  function makeNav(){
    const positions=[];const step=.5;
    for(let x=-11.5;x<11.5;x+=step)for(let z=-4.5;z<10.5;z+=step){if(!walkable(x+.25,z+.25))continue;positions.push(x,0,z,x,0,z+step,x+step,0,z,x+step,0,z,x,0,z+step,x+step,0,z+step);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));pathfinder.setZoneData('court',Pathfinding.createZone(geo));nav=geo;
  }
  makeNav();
  function resetWalk(){path=[];afterWalk=null;seat=null;action='idle';onEvent({type:'action',action,seat});}
  function moveTo(x,z,after=null){
    if(!walkable(x,z)){onEvent({type:'hint',text:'这里不太好走，点一块空地试试。'});return false;}
    const start=player.root.position.clone();start.y=0;const goal=new THREE.Vector3(x,0,z);const id=pathfinder.getGroup('court',start);const result=pathfinder.findPath(start,goal,'court',id);
    if(!result){onEvent({type:'hint',text:'换一条路走走吧。'});return false;}
    path=result;afterWalk=after;action='walk';onEvent({type:'action',action,seat});return true;
  }
  function rebuild(id){
    const old=stage;scene.remove(old);old.traverse(o=>{if(o.isMesh||o.isSprite){if(o.geometry&&!Object.values(sharedGeo).includes(o.geometry))o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(![...materials.values()].includes(m)){m.map?.dispose();m.dispose();}});}});
    stage=new THREE.Group();scene.add(stage);pickables=[];pets=[];residents=[];smoke=[];incenseUntil=0;area=id;resetWalk();player.root.position.set(0,0,7);player.root.rotation.y=Math.PI;
    mesh(stage,'round',[0,-.60,0],[28,1.2,26],'#9da87d');mesh(stage,'round',[0,-.10,0],[25,.22,23],'#c9c6ad');
    const tileGeo=new THREE.BoxGeometry(1.48,.045,1.48),tileMat=mat('#d5cfb9');const paving=new THREE.InstancedMesh(tileGeo,tileMat,255);const dummy=new THREE.Object3D();let n=0;
    for(let x=-7;x<=7;x++)for(let z=-7;z<=9;z++){dummy.position.set(x*1.53,.03,z*1.53-2);dummy.updateMatrix();paving.setMatrixAt(n++,dummy.matrix);}paving.receiveShadow=true;stage.add(paving);
    mesh(stage,'box',[0,.01,5],[3.7,.07,11],'#e1dac3');
    for(const side of [-1,1]){mesh(stage,'box',[side*12.1,1.15,0],[.45,2.3,23],palette.red);mesh(stage,'box',[side*12.1,2.32,0],[.75,.19,23.2],palette.gold);for(let z=-9;z<11;z+=4){mesh(stage,'box',[side*12.1,1.3,z],[.66,2.6,.65],palette.redLight);mesh(stage,'sphere',[side*12.1,2.65,z],[.33,.16,.33],palette.gold);}}
    mesh(stage,'box',[0,1.3,-11.6],[24,2.6,.4],palette.red);
    tree(stage,-8,3,1.25);tree(stage,8,1,1.1);tree(stage,-10,-9,1);tree(stage,10,-9,1.1);
    for(const side of [-1,1]){mesh(stage,'round',[side*8,.5,6.3],[3.4,.25,.8],palette.wood);for(const x of [-1.15,1.15])mesh(stage,'box',[side*8+x,.23,6.3],[.22,.5,.55],'#a19a83');}
    if(id==='garden'){
      mesh(stage,'round',[0,.25,-6.5],[10,.5,4],palette.wood);const pergola=group(stage,[0,0,-6.5]);roof(pergola,12,5,4.3,1,palette.gold);
      for(const x of [-4.6,4.6])mesh(stage,'cylinder',[x,2.1,-6.5],[.16,4.1,.16],palette.red);
      // Roof is positioned over the courtyard stage, not the prayer halls.
      mesh(stage,'round',[0,1.1,-6.4],[3.7,1.6,1.1],palette.green);tag(stage,'月 下 乐 庭',[0,1.45,-5.82],{width:3.1,font:43});
      for(const x of [-4,4]){mesh(stage,'round',[x,1.0,-6.2],[1.0,1.8,.8],'#49504b');for(const y of [.65,1.45]){const cone=mesh(stage,'cylinder',[x,y,-5.76],[.30,.06,.30],'#718476');cone.rotation.x=Math.PI/2;}}
      const dj=person(stage,'#a57c96','top');dj.root.position.set(0,.45,-7);residents.push(dj);dj.action='dance';
      for(let i=0;i<9;i++){const x=-5+i*1.25;line(stage,[[x,4.1,-4.3],[x,3.7-Math.sin(i/8*Math.PI)*.4,-4.3]],palette.wood,.015);const lamp=mesh(stage,'sphere',[x,3.7-Math.sin(i/8*Math.PI)*.4,-4.3],[.12,.17,.12],palette.cream);lamp.material=new THREE.MeshStandardMaterial({color:'#ffe8a8',emissive:'#f2be6a',emissiveIntensity:.5});}
    }else hall(stage,id,pickables);
    if(id!=='garden'){
      const incense=group(stage,[0,0,-4.3]);mesh(incense,'sphere',[0,.72,0],[.62,.4,.49],'#6b8279',.35);mesh(incense,'cylinder',[0,.95,0],[.64,.12,.50],palette.gold,.5);for(const x of [-.4,.4])mesh(incense,'cylinder',[x,.28,0],[.09,.57,.09],'#6b8279');for(const x of [-.15,0,.15]){mesh(incense,'cylinder',[x,1.35,0],[.018,.78,.018],'#9b6247');mesh(incense,'sphere',[x,1.75,0],[.027,.035,.027],'#ecaf70');}
      incense.userData={kind:'incense'};pickables.push(incense);for(let i=0;i<9;i++){const puff=new THREE.Mesh(sharedGeo.sphere,new THREE.MeshBasicMaterial({color:'#fff9e9',transparent:true,opacity:0,depthWrite:false}));stage.add(puff);smoke.push(puff);}
      for(let i=0;i<MATS.length;i++){const {x,z}=MATS[i];const g=group(stage,[x,0,z]);mesh(g,'cylinder',[0,.12,0],[.71,.22,.71],i%2?'#cbb582':'#d4bd8c');const ring=new THREE.Mesh(new THREE.TorusGeometry(.60,.024,6,28),mat('#e8d8b0'));ring.rotation.x=Math.PI/2;ring.position.y=.23;g.add(ring);g.userData={kind:'seat',seat:i};pickables.push(g);}
    }
    if(id==='bracelet'){
      const table=group(stage,[6.5,0,-3]);mesh(table,'round',[0,.8,0],[2.5,.14,1.0],palette.wood);for(const x of [-1,1])mesh(table,'box',[x,.4,0],[.1,.8,.6],palette.wood);for(let j=0;j<3;j++){for(let i=0;i<12;i++){const a=i*Math.PI/6;mesh(table,'sphere',[(j-1)*.7+Math.cos(a)*.23,.91,Math.sin(a)*.23],[.06,.06,.06],['#af703e','#80a596','#d8a2a5'][j]);}}tag(table,'把心愿捧在手心',[0,1.7,0],{width:2.8,font:32});table.userData={kind:'bracelet'};pickables.push(table);
    }
    for(let i=0;i<3;i++){const p=pet(stage,PETS[i]);p.root.position.set([-5.8,5.8,6.9][i],0,[6.3,5.3,7.6][i]);p.home=p.root.position.clone();pets.push(p);pickables.push(p.root);label(p.root,p.spec.name,[0,1.55,0]);}
    for(let i=0;i<3;i++){const p=person(stage,COLORS[(i+1)%4].hex,i%2?'bun':'top');p.root.position.set([-6.2,6.5,-3][i],0,[.2,2,7.8][i]);p.root.rotation.y=[.3,-.4,2.1][i];p.action=id==='garden'?'dance':i===2?'idle':'kneel';residents.push(p);label(p.root,'小院住客',[0,2.2,0],'#e7e7d8').scale.set(1.65,.4,1);}
    const leafGeo=new THREE.PlaneGeometry(.13,.20),leafMat=new THREE.MeshStandardMaterial({color:'#e5b94e',side:THREE.DoubleSide});leafs=new THREE.InstancedMesh(leafGeo,leafMat,65);leafs.userData.seeds=Array.from({length:65},(_,i)=>({x:Math.sin(i*57.1)*11,z:Math.cos(i*39.7)*10,y:Math.abs(Math.sin(i))*6,phase:i*2.7}));stage.add(leafs);
    const narrow=container.clientWidth<760;controls.setLookAt(narrow?13:17,narrow?22:16,narrow?32:23,0,1.1,narrow?1:-1,true);onEvent({type:'area',area:id});
  }
  function getHit(e){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(pickables,true);for(const h of hits){let o=h.object;while(o&&o!==stage){if(o.userData.kind)return o.userData;o=o.parent;}}return null;}
  function onDown(e){down={x:e.clientX,y:e.clientY};}
  function onUp(e){if(e.button!==0||paused||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const hit=getHit(e);if(hit){onEvent({type:'interact',...hit});return;}
    const target=new THREE.Vector3();ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),target);seat=null;moveTo(target.x,target.z);
  }
  renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointerup',onUp);
  const keydown=e=>{if(paused||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase());path=[];afterWalk=null;seat=null;}};
  const keyup=e=>keys.delete(e.key.toLowerCase());const blur=()=>keys.clear();window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
  const resize=()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(container);resize();rebuild(area);
  function tick(now){if(disposed)return;frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;clock+=dt;
    controls.update(dt);
    if(!paused&&path.length){const target=path[0],delta=target.clone().sub(player.root.position);delta.y=0;const distance=delta.length();if(distance<.08){path.shift();if(!path.length){action=afterWalk||'idle';if(['kneel','bow','bracelet'].includes(action))player.root.rotation.y=Math.PI;onEvent({type:'action',action,seat});afterWalk=null;}}else{delta.normalize();player.root.position.addScaledVector(delta,Math.min(distance,dt*3.3));player.root.rotation.y=Math.atan2(delta.x,delta.z);}}
    if(!paused&&keys.size){const f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const r=new THREE.Vector3(-f.z,0,f.x);const d=new THREE.Vector3();if(keys.has('w')||keys.has('arrowup'))d.add(f);if(keys.has('s')||keys.has('arrowdown'))d.sub(f);if(keys.has('d')||keys.has('arrowright'))d.add(r);if(keys.has('a')||keys.has('arrowleft'))d.sub(r);d.normalize();const v=player.root.position.clone().addScaledVector(d,dt*3.5);if(walkable(v.x,v.z)){player.root.position.copy(v);player.root.rotation.y=Math.atan2(d.x,d.z);action='walk';}}
    else if(action==='walk'&&!path.length)action='idle';
    animatePerson(player,action,clock,action==='walk',reduced);
    residents.forEach(p=>animatePerson(p,p.action,clock,false,reduced));
    peers.forEach(p=>{p.root.position.lerp(p.target,1-Math.exp(-dt*5));p.root.rotation.y=THREE.MathUtils.lerp(p.root.rotation.y,p.yaw,dt*8);animatePerson(p,p.action,clock,p.action==='walk',reduced);});
    pets.forEach((p,i)=>{const dance=p.dance&&area==='garden';const follow=p.follow&&!dance;const sleeping=!dance&&!follow&&p.pettedUntil<=clock&&Math.floor((clock+p.phase)/18)%3===2;let walking=false;
      if(dance){const angle=(i+1)*Math.PI*.55;const target=player.root.position.clone().add(new THREE.Vector3(Math.cos(angle)*1.55,0,Math.sin(angle)*1.55));if(walkable(target.x,target.z))p.root.position.lerp(target,1-Math.exp(-dt*2));p.root.rotation.y=Math.atan2(player.root.position.x-p.root.position.x,player.root.position.z-p.root.position.z);}
      if(follow){const target=player.root.position.clone().add(new THREE.Vector3((i-1)*.8,0,1.25));const delta=target.sub(p.root.position);delta.y=0;if(delta.length()>.4){walking=true;const v=p.root.position.clone().addScaledVector(delta.normalize(),dt*2.5);if(walkable(v.x,v.z))p.root.position.copy(v);p.root.rotation.y=Math.atan2(delta.x,delta.z);}}
      else if(!dance&&!sleeping){const target=p.home.clone().add(new THREE.Vector3(Math.sin(clock*.18+p.phase)*.8,0,Math.cos(clock*.18+p.phase)*.5));const delta=target.sub(p.root.position);if(delta.length()>.08){walking=true;p.root.position.addScaledVector(delta.normalize(),dt*.45);p.root.rotation.y=Math.atan2(delta.x,delta.z);}}
      p.body.position.y=dance?.40+Math.abs(Math.sin(clock*5+i))*.25:.37;p.body.rotation.z=dance?Math.sin(clock*5+i)*.20:0;p.head.rotation.z=p.pettedUntil>clock?Math.sin(clock*4)*.15:Math.sin(clock*.7+i)*.04;p.tail.rotation.z=Math.sin(clock*(follow||dance?8:2)+i)*.3;
      p.legs.forEach((l,j)=>{l.rotation.x=walking?Math.sin(clock*9+j)*.5:0;});if(p.pettedUntil>clock)p.body.rotation.z=.10;if(sleeping){p.body.position.y=.19+Math.sin(clock)*.008;p.body.rotation.z=.28;p.head.rotation.z=.2;}
    });
    const tmp=new THREE.Object3D();leafs?.userData.seeds.forEach((p,i)=>{tmp.position.set(p.x+Math.sin(clock*.4+p.phase)*.6,reduced?.1:(p.y-clock*.28%6+6)%6,p.z);tmp.rotation.set(clock+p.phase,p.phase,clock*.3);tmp.updateMatrix();leafs.setMatrixAt(i,tmp.matrix);});if(leafs)leafs.instanceMatrix.needsUpdate=true;
    if(now-lastReport>160){lastReport=now;onEvent({type:'position',x:player.root.position.x,z:player.root.position.z,yaw:player.root.rotation.y,action,seat});}
    smoke.forEach((p,i)=>{const f=(clock*.35+i/9)%1;p.visible=clock<incenseUntil;p.position.set(Math.sin(clock+i)*.1+f*.4,1.8+f*2.4,-4.3);p.scale.setScalar(.05+f*.22);p.material.opacity=(1-f)*.22;});
    renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(tick);
  return{
    go:rebuild,
    sit(index,pose='bow'){seat=index;const p=MATS[index];return moveTo(p.x,p.z,pose);},
    act(value){path=[];afterWalk=null;action=value;if(!['bow','kneel','bracelet','beads'].includes(value))seat=null;onEvent({type:'action',action,seat});},
    pet(id,mode){const p=pets.find(p=>p.spec.id===id);if(!p)return;if(mode==='pat'){p.pettedUntil=clock+4;moveTo(p.root.position.x-.6,p.root.position.z+.7,'pet');}if(mode==='follow'){p.follow=!p.follow;return p.follow;}if(mode==='dance'){p.dance=!p.dance;return p.dance;}},
    dancePets(){pets.forEach(p=>p.dance=true);},
    lightIncense(){incenseUntil=clock+28;},
    color(id){const color=COLORS.find(c=>c.id===id)?.hex||COLORS[0].hex;player.robe.material=mat(color);player.arms.forEach(a=>a.children[0].material=mat(color));},
    setName(name){myLabel.material.map.dispose();myLabel.material.dispose();player.root.remove(myLabel);myLabel=label(player.root,'我 · '+name,[0,2.36,0]);},
    setPeers(rows){const ids=new Set();for(const row of rows){if(row.area!==area)continue;ids.add(row.id);let p=peers.get(row.id);if(!p){p=person(scene,COLORS.find(c=>c.id===row.color)?.hex||COLORS[0].hex);p.root.position.set(row.x,0,row.z);label(p.root,row.name,[0,2.36,0],'#e2ebd8');peers.set(row.id,p);}p.target=new THREE.Vector3(row.x,0,row.z);p.yaw=row.yaw;p.action=row.action;const col=COLORS.find(c=>c.id===row.color)?.hex||COLORS[0].hex;p.robe.material=mat(col);p.arms.forEach(a=>a.children[0].material=mat(col));}peers.forEach((p,id)=>{if(!ids.has(id)){scene.remove(p.root);peers.delete(id);}});},
    lighting(mode){const night=mode==='night';scene.background.set(night?'#344b58':mode==='sunset'?'#decbb5':'#dce4ce');scene.fog.color.copy(scene.background);amb.intensity=night?1.15:2.4;sun.intensity=night?.65:mode==='sunset'?2.5:3;sun.color.set(night?'#b6c8ef':mode==='sunset'?'#ffbd80':'#ffdfaa');renderer.toneMappingExposure=night?1.1:1.18;},
    quality(low){renderer.setPixelRatio(low?1:Math.min(window.devicePixelRatio,1.65));renderer.shadowMap.enabled=!low;},
    reduced(v){reduced=v;},
    pause(v){paused=v;keys.clear();controls.enabled=!v;},
    home(){const narrow=container.clientWidth<760;controls.setLookAt(narrow?13:17,narrow?22:16,narrow?32:23,0,1.1,narrow?1:-1,true);},
    zoom(amount){controls.dolly(amount,true);},
    photo(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
    dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();controls.dispose();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointerup',onUp);renderer.dispose();renderer.domElement.remove();nav?.dispose();},
  };
}
