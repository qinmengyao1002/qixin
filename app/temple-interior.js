import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { surface } from './temple-materials';
import { mountSculpture } from './sculpture';
import { HALL_SCULPTURES } from './hall-sculptures';

// Original room design based on the documented timber, polychrome ceiling,
// gilded back screens and altar furnishings of Yonghe Temple. Not a measured replica.
export function buildTempleInterior(parent, id, pickables) {
  const room = new THREE.Group(); parent.add(room);
  const sculpture = HALL_SCULPTURES[id] || HALL_SCULPTURES.main;
  const loader = new THREE.TextureLoader();
  const texture = url => { const t=loader.load(url);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t; };
  const paint=texture('/textures/temple/painted-coffer.webp');
  const carving=texture('/textures/temple/shrine-carving.webp');
  const standard=(color,metalness=0,roughness=.75)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const M={wood:surface('wood','#39271e'),red:surface('plaster','#67352d'),jade:standard('#23483f'),blue:standard('#273c49'),
    gold:standard('#b18b49',.67,.38),oldGold:standard('#78603a',.5,.48),stone:standard('#75776b'),
    paper:standard('#aaa48b'),dark:standard('#271d1a'),silk:standard(sculpture.silk),
    backdrop:surface('plaster',sculpture.back),
    painted:new THREE.MeshStandardMaterial({map:paint,roughness:.84}),
    carved:new THREE.MeshStandardMaterial({map:carving,bumpMap:carving,bumpScale:.035,roughness:.56,metalness:.23}),
    wax:standard('#c49554'),flame:new THREE.MeshBasicMaterial({color:'#ffe6a6'})};
  const boxGeo=new THREE.BoxGeometry(1,1,1),roundGeo=new RoundedBoxGeometry(1,1,1,2,.08);
  function mesh(geo, material, xyz=[0,0,0], scale=[1,1,1], target=room){
    const m=new THREE.Mesh(geo,material);m.position.set(...xyz);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;if(scale[1]>3&&Math.max(scale[0],scale[2])>10)m.userData.cameraSolid=true;target.add(m);return m;
  }
  const box=(xyz,size,material=M.wood,target=room)=>mesh(boxGeo,material,xyz,size,target);
  const cyl=(xyz,r,h,material=M.gold,target=room)=>{const m=mesh(new THREE.CylinderGeometry(r,r,h,32),material,xyz,[1,1,1],target);if(h>3)m.userData.cameraSolid=true;return m;};
  function lathe(profile,xyz,material=M.gold,target=room){return mesh(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),48),material,xyz,[1,1,1],target);}
  function curve(points, radius, material=M.gold,target=room){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),30,radius,7,false),material,[0,0,0],[1,1,1],target);}

  // Long staggered timber boards with longitudinal grain, subtle reflected light.
  const c=document.createElement('canvas');c.width=256;c.height=1024;const ctx=c.getContext('2d');
  ctx.fillStyle='#665044';ctx.fillRect(0,0,256,1024);
  for(let i=0;i<1200;i++){const x=(i*47.27)%256;ctx.strokeStyle=i%4?'rgba(18,12,9,.13)':'rgba(219,180,134,.12)';ctx.lineWidth=.5+(i%3)*.3;ctx.beginPath();ctx.moveTo(x,0);for(let y=0;y<=1024;y+=24)ctx.lineTo(x+Math.sin(y*.008+i)*3.5,y);ctx.stroke();}
  const grain=new THREE.CanvasTexture(c);grain.colorSpace=THREE.SRGBColorSpace;
  const floorMat=new THREE.MeshStandardMaterial({map:grain,roughness:.56,color:'#a99c8c'});
  for(let x=-16;x<16;x++)for(let z=-4;z<5;z++)box([x*.69+.345,-.075,z*3.13+(x%2)*1.56],[.68,.12,3.11],floorMat);
  box([0,4.5,-12.1],[23,9,.35],M.red);
  box([0,1.0,-11.83],[22.7,2,.12],M.wood);
  // Window sills, recessed paper, separate lower and upper lattice panels.
  for(const side of [-1,1]){
    box([side*11.3,4.5,0],[.4,9,28],M.dark);
    box([side*11.05,1.1,0],[.22,2.2,28],M.red);
    for(let z=-8.5;z<=10;z+=6.1){
      const w=new THREE.Group();w.position.set(side*10.99,3.9,z);w.rotation.y=side===-1?Math.PI/2:-Math.PI/2;room.add(w);
      box([0,0,0],[4.7,4.3,.16],M.wood,w);box([0,0,.09],[4.35,3.95,.04],M.paper,w);
      for(const dx of [-2.16,0,2.16])box([dx,0,.17],[.12,4.05,.12],M.wood,w);
      for(const y of [-1.95,-.75,1.95])box([0,y,.17],[4.42,.12,.12],M.wood,w);
      for(let dx=-1.94;dx<2.1;dx+=.43)box([dx,.58,.15],[.045,2.5,.09],M.wood,w);
      for(let y=-.55;y<1.9;y+=.43)box([0,y,.15],[4.27,.045,.09],M.wood,w);
      for(let dx=-1.7;dx<2;dx+=.85){const diamond=box([dx,-1.36,.16],[.64,.64,.07],M.jade,w);diamond.rotation.z=Math.PI/4;box([dx,-1.36,.21],[.25,.25,.035],M.oldGold,w);}
      box([0,-2.22,.12],[5.0,.16,.5],M.wood,w);
      // Thin openwork transom above each window.
      for(let dx=-2.0;dx<=2.01;dx+=.4)box([dx,2.42,.04],[.035,.65,.1],M.jade,w);
    }
  }
  // Red lacquer pillars, stone plinths, stacked bracket arms and gold-edged beams.
  for(const x of [-8.6,8.6])for(const z of [-8.8,-2.2,4.4,11]){
    lathe([[.48,0],[.52,.12],[.49,.24],[.37,.38],[.34,.48]],[x,0,z],M.stone);
    cyl([x,4.15,z],.3,7.4,M.red);
    for(const y of [.55,7.52])cyl([x,y,z],.32,.085,M.oldGold);
    for(let k=0;k<4;k++){
      box([x,7.45+k*.15,z],[.66+k*.38,.17,.55],k%2?M.blue:M.jade);
      box([x,7.45+k*.15,z],[.55,.17,.66+k*.38],k%2?M.jade:M.blue);
      for(const side of [-1,1])box([x+side*(.28+k*.18),7.56+k*.15,z],[.12,.18,.62],M.oldGold);
    }
  }
  const beamLevels=[-9,-2.4,4.2,10.8];
  for(const z of beamLevels){
    box([0,8.05,z],[18.4,.52,.46],M.jade);
    for(const y of [7.81,8.29])box([0,y,z+.245],[18.3,.035,.035],M.oldGold);
    for(let x=-8;x<=8;x+=2){box([x,8.05,z+.25],[1.76,.39,.025],M.painted);}
  }
  // Coffer ceiling. Paint is a separate original asset; ribs remain real geometry.
  const ceilingY=id==='wanfu'?10.8:8.65;
  for(let x=-4;x<=4;x++)for(let z=-5;z<=5;z++){
    const tile=mesh(new THREE.PlaneGeometry(2.05,2.05),M.painted,[x*2.1,ceilingY,z*2.1]);tile.rotation.x=Math.PI/2;tile.castShadow=false;
  }
  for(let x=-4.5;x<=4.5;x++)box([x*2.1,ceilingY-.075,0],[.09,.15,24],M.jade);
  for(let z=-5.5;z<=5.5;z++)box([0,ceilingY-.075,z*2.1],[20,.15,.09],M.jade);
  box([0,ceilingY+.15,0],[24,.15,40],M.dark);

  for(let x=-10.5;x<=10.5;x+=.45){
    box([x,7.55,12.25],[.10,.15,3.4],M.wood);
  }
  box([0,7.50,13.5],[23,.28,.22],M.wood);
  box([0,7.73,12.1],[23,.14,4.2],M.dark);

  // Carved shrine screens replace the generic green rectangles.
  const triple=false;
  const positions=triple?[-4.65,0,4.65]:[0];
  for(const x of positions){
    const center=x===0;const h=center?7.4:7.0,w=center?5.0:4.6;
    box([x,.88+h/2,-11.5],[w+.12,h+.12,.28],M.wood);
    mesh(new THREE.PlaneGeometry(w,h),sculpture.screen?M.carved:M.backdrop,[x,.88+h/2,-11.34]);
    // Physical projecting jambs, beaded molding and a carved crown.
    for(const side of [-1,1]){
      box([x+side*(w/2+.03),.88+h/2,-11.22],[.08,h,.12],M.oldGold);
      for(let y=1.15;y<h+.7;y+=.18)mesh(new THREE.SphereGeometry(.045,8,6),M.gold,[x+side*(w/2-.025),y,-11.12]);
    }
    box([x,.92,-11.17],[w,.09,.21],M.gold);
    // Each scan already contains its original lotus/stone foot. A quiet stepped
    // plinth supports it without adding a second, mismatched ring of petals.
    const width=id==='yongyou'?2.15:id==='wanfu'?4.3:3.6;
    box([x,1.04,-8.85],[width+.28,.28,2.7],M.wood);
    box([x,1.24,-8.85],[width,.12,2.48],M.oldGold);
    box([x,1.37,-8.85],[width+.12,.14,2.58],M.wood);
    mountSculpture(room,x,1.44,-8.85,sculpture.height,sculpture.kind);
  }
  // Offering table separated from the sculpture plinth, with pierced-looking apron.
  box([0,.44,-8.7],[16,.88,4.0],M.wood);box([0,.88,-8.7],[16.2,.12,4.12],M.oldGold);
  for(const x of [-6.6,-3.3,0,3.3,6.6]){
    box([x,.42,-6.66],[2.85,.57,.05],M.red);
    for(const yy of [.18,.66])box([x,yy,-6.6],[2.8,.025,.025],M.oldGold);
    for(let j=-2;j<=2;j++){
      const cx=x+j*.49;
      curve([[cx-.18,.3,-6.56],[cx-.26,.48,-6.56],[cx,.57,-6.56],[cx+.22,.40,-6.56],[cx+.1,.28,-6.56]],.023,M.gold);
    }
  }
  const tableZ=-6.12;
  box([0,1.3,tableZ],[14.5,.16,1.15],M.red);
  box([0,1.40,tableZ],[14.7,.045,1.22],M.oldGold);
  for(const x of [-6.5,-2.1,2.1,6.5])box([x,.65,tableZ],[.16,1.3,.50],M.red);
  box([0,.88,tableZ+.45],[14.3,.6,.1],M.wood);
  for(let x=-6.6;x<7;x+=.68){const diamond=box([x,.9,tableZ+.52],[.35,.35,.035],M.oldGold);diamond.rotation.z=Math.PI/4;}
  // Pair of multi-part turned candlesticks with wax and flame. No flat yellow blobs.
  for(const x of [-6.5,6.5]){
    lathe([[.33,0],[.35,.07],[.23,.13],[.19,.23],[.10,.31],[.08,.62],[.14,.71],[.08,.79],[.09,.93],[.30,1.01],[.33,1.10],[.23,1.14]],[x,1.43,tableZ],M.gold);
    cyl([x,2.79,tableZ],.10,.47,M.wax);
    mesh(new THREE.SphereGeometry(1,12,10),M.flame,[x,3.10,tableZ],[.055,.13,.055]);
    const light=new THREE.PointLight('#ffb969',3.5,5,2);light.position.set(x,3.05,tableZ);room.add(light);
  }
  // A row of small water offering bowls, with polished rims and visible water.
  const water=new THREE.MeshStandardMaterial({color:'#7b897a',metalness:.72,roughness:.18});
  for(let i=-3;i<=3;i++){
    const x=i*.72;lathe([[.10,0],[.12,.035],[.09,.09],[.18,.13],[.26,.24],[.265,.27]],[x,1.43,tableZ+.05],M.gold);
    cyl([x,1.68,tableZ+.05],.235,.008,water);
  }
  // Vases and quiet lotus arrangements flank the bowls.
  for(const side of [-1,1]){
    const x=side*5.55;
    lathe([[.20,0],[.24,.07],[.21,.16],[.35,.42],[.31,.66],[.17,.83],[.16,1.0],[.23,1.04]],[x,1.43,tableZ],M.blue);
    for(let j=0;j<3;j++){
      const xx=x+(j-1)*.23,yy=2.95+(j%2)*.20;
      curve([[x,2.4,tableZ],[xx,2.85,tableZ],[xx,yy,tableZ]],.018,M.jade);
      for(let k=0;k<7;k++){const a=k*Math.PI*2/7;const p=mesh(new THREE.SphereGeometry(1,10,8),standard('#ad887d'),[xx+Math.cos(a)*.09,yy,tableZ+Math.sin(a)*.09],[.075,.18,.045]);p.rotation.z=Math.cos(a)*.4;p.rotation.x=Math.sin(a)*.4;}
    }
  }
  // Silken hanging banners at the outer shrine columns; restrained mineral colors.
  for(const side of [-1,1]){
    const x=side*7.7,z=-9.5;
    cyl([x,6.65,z],.30,.24,M.oldGold);
    for(let i=0;i<5;i++){
      const strip=box([x+(i-2)*.12,5.05,z],[.105,2.95,.025],[M.blue,M.silk,M.paper,M.jade,M.oldGold][i]);strip.rotation.z=(i-2)*.009;
      for(let k=0;k<4;k++)box([x+(i-2)*.12,5.7-k*.62,z+.023],[.09,.025,.01],M.oldGold);
      for(let j=0;j<3;j++)curve([[x+(i-2)*.12+j*.025-.025,3.57,z],[x+(i-2)*.12+j*.025-.025,3.37,z]],.006,M.oldGold);
    }
  }
  const key=new THREE.SpotLight('#ffe3b5',90,29,.78,.7,1.4);key.position.set(-4.5,7.2,-3.5);key.target.position.set(0,3.5,-9);room.add(key,key.target);
  const fill=new THREE.PointLight('#c7d7d0',30,25,2);fill.position.set(8,5.6,1);room.add(fill);
  const altarFill=new THREE.PointLight('#ffda96',10,18,2);altarFill.position.set(0,4,-5);room.add(altarFill);
  const windowLight=new THREE.DirectionalLight('#d7ded5',.9);
  windowLight.position.set(8,5.8,5);windowLight.target.position.set(0,0,0);
  windowLight.castShadow=true;windowLight.shadow.mapSize.set(1024,1024);
  Object.assign(windowLight.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.5,far:35});
  windowLight.shadow.normalBias=.025;windowLight.shadow.bias=-.0002;
  room.add(windowLight,windowLight.target);

  // Batch the architectural meshes by material, leaving interactive scene objects
  // and asynchronous sculptures independent. This keeps ornament affordable.
  const batches=new Map();room.updateMatrixWorld(true);
  const roomInverse=room.matrixWorld.clone().invert();
  room.traverse(o=>{if(!o.isMesh||o.userData.kind||o.userData.cameraSolid)return;const list=batches.get(o.material)||[];list.push(o);batches.set(o.material,list);});
  for(const [material,items] of batches){
    if(items.length<2)continue;
    const geometries=items.map(o=>{const g=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(roomInverse,o.matrixWorld));return g.index?g.toNonIndexed():g;});
    const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!merged)continue;
    const result=new THREE.Mesh(merged,material);result.castShadow=true;result.receiveShadow=true;room.add(result);
    items.forEach(o=>o.removeFromParent());
    for(const geo of new Set(items.map(o=>o.geometry)))geo.dispose();
  }
  // Interactive exit remains in the host HUD and can also be hit at the doorway.
  const exit=box([8.0,1.5,10],[.9,2.8,.35],M.red);exit.userData={kind:'portal',area:'court'};pickables.push(exit);
  return room;
}
