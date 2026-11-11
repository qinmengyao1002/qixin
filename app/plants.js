import * as THREE from 'three';
import { Tree } from './vendor/ez-tree/tree';
import { surface } from './temple-materials';

// EZ-Tree supplies the branching skeleton. Leaf art, species settings and placement
// are original to this garden; no SANSA meshes/textures are used.
function leafCluster(species){
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
  const golden=species==='ginkgo';
  const colors=golden?['#ccaa39','#d4b448','#b79831','#e0c460','#b6a044']:['#365531','#4c693b','#657c47','#3e5d32','#6b804b'];
  ctx.strokeStyle=golden?'#7d682d':'#4c4930';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(256,490);ctx.bezierCurveTo(225,350,270,220,265,50);ctx.stroke();
  for(let i=0;i<17;i++){
    const side=i%2?1:-1,y=65+i*22,x=256+side*(45+(i%4)*18),a=side*(.55+(i%3)*.2);
    ctx.strokeStyle=golden?'#8b7835':'#526038';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(255,y+52);ctx.lineTo(x,y);ctx.stroke();
    ctx.save();ctx.translate(x,y);ctx.rotate(a);const color=colors[i%colors.length];
    const gradient=ctx.createLinearGradient(0,-56,0,20);gradient.addColorStop(0,color);gradient.addColorStop(1,golden?'#a5882a':'#293f26');ctx.fillStyle=gradient;
    ctx.beginPath();
    if(golden){ctx.moveTo(0,22);ctx.lineTo(-41,-23);ctx.quadraticCurveTo(-24,-58,-3,-41);ctx.lineTo(0,-32);ctx.lineTo(4,-42);ctx.quadraticCurveTo(27,-55,43,-21);ctx.closePath();}
    else {ctx.moveTo(0,25);ctx.bezierCurveTo(-29,2,-25,-30,0,-51);ctx.bezierCurveTo(25,-30,29,2,0,25);}
    ctx.fill();ctx.strokeStyle=golden?'#efe19945':'#afbb7b50';ctx.lineWidth=1;
    if(golden)for(let v=-3;v<=3;v++){ctx.beginPath();ctx.moveTo(0,20);ctx.lineTo(v*10,-28-Math.abs(v)*2);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(0,24);ctx.lineTo(0,-43);ctx.stroke();for(let v=0;v<4;v++)for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(0,12-v*12);ctx.lineTo(sign*15,-v*12-4);ctx.stroke();}}
    if(!golden&&i%4===0){ctx.fillStyle='#d9c69a';for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(8+Math.cos(k*2.4)*9,22+Math.sin(k*2.4)*6,3,0,Math.PI*2);ctx.fill();}}
    ctx.restore();
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}

export function plant(parent,x,z,{species='ginkgo',height=6.8,seed=17,distant=false}={}){
  const tree=new Tree(),o=tree.options,golden=species==='ginkgo';o.seed=seed;o.bark.textured=false;
  o.branch.levels=3;o.branch.length={0:8,1:golden?8:10,2:4.5,3:1.7};
  o.branch.radius={0:.52,1:.45,2:.40,3:.3};o.branch.children={0:distant?6:(golden?9:10),1:distant?3:6,2:distant?2:4};
  o.branch.start={1:golden?.40:.26,2:.30,3:.15};o.branch.angle={1:golden?57:70,2:55,3:60};
  o.branch.gnarliness={0:.035,1:.08,2:.12,3:.08};o.branch.force.strength=0;
  o.branch.sections=distant?{0:6,1:4,2:3,3:2}:{0:10,1:6,2:4,3:3};o.branch.segments=distant?{0:6,1:4,2:3,3:3}:{0:10,1:6,2:4,3:3};
  o.leaves.angle=55;o.leaves.count=distant?4:6;o.leaves.size=(golden?2.3:2.7)*(distant?1.3:1.08);o.leaves.sizeVariance=.35;o.leaves.start=.12;
  tree.generate();
  tree.branchesMesh.material.dispose();tree.branchesMesh.material=surface('wood',golden?'#655b47':'#635c4b');
  tree.leavesMesh.material.dispose();const texture=leafCluster(species);
  tree.leavesMesh.material=new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide,alphaTest:.3,alphaToCoverage:true,roughness:.88,metalness:0});
  // Soft canopy normals prevent every crossed card looking like a hard flat tile.
  const geometry=tree.leavesMesh.geometry,pos=geometry.attributes.position,norm=geometry.attributes.normal;
  const center=new THREE.Vector3(0,8,0),v=new THREE.Vector3();
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).sub(center);v.y*=.65;v.normalize();norm.setXYZ(i,v.x,v.y,v.z);}norm.needsUpdate=true;
  const bounds=new THREE.Box3().setFromObject(tree),size=bounds.getSize(new THREE.Vector3());const scale=height/size.y;
  tree.scale.setScalar(scale);tree.position.set(x,-bounds.min.y*scale,z);tree.rotation.y=seed*.73;
  tree.traverse(m=>{if(m.isMesh){m.castShadow=!distant;m.receiveShadow=true;}});
  tree.userData.plant=true;parent.add(tree);return tree;
}
