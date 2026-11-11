import * as THREE from 'three';
import { Water } from './vendor/Water';
import { createKoi } from './koi';

export function terrainMaterial(kind,repeat=1){
  const loader=new THREE.TextureLoader();
  const read=channel=>{const t=loader.load(`/textures/landscape/${kind}-${channel}.webp`);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;if(channel==='color')t.colorSpace=THREE.SRGBColorSpace;return t;};
  return new THREE.MeshStandardMaterial({map:read('color'),normalMap:read('normal'),roughnessMap:read('roughness'),normalScale:new THREE.Vector2(.55,.55),roughness:1,color:'#b6b7a7'});
}

export const pondContains=(x,z)=>((x+6.3)/3.5)**2+((z-6.3)/2.55)**2<1.14;

export function createPond(parent){
  const cx=-6.3,cz=6.3,shape=new THREE.Shape();
  const shore=[];
  for(let i=0;i<=64;i++){
    const a=i/64*Math.PI*2,r=1+.055*Math.sin(a*3)+.025*Math.cos(a*7),x=Math.cos(a)*3.5*r,y=Math.sin(a)*2.55*r;
    if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);shore.push([x,y]);
  }
  const n=128,bytes=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const a=x/n*Math.PI*2,b=y/n*Math.PI*2,i=(y*n+x)*4;
    const dx=.18*Math.cos(a*4+b*3)+.08*Math.sin(a*7-b*5),dy=.16*Math.sin(b*4+a*2)+.09*Math.cos(b*9-a*3);
    const v=new THREE.Vector3(dx,dy,1).normalize();bytes.set([Math.round((v.x*.5+.5)*255),Math.round((v.y*.5+.5)*255),Math.round((v.z*.5+.5)*255),255],i);
  }
  const normals=new THREE.DataTexture(bytes,n,n,THREE.RGBAFormat);normals.wrapS=normals.wrapT=THREE.RepeatWrapping;normals.magFilter=normals.minFilter=THREE.LinearFilter;normals.needsUpdate=true;
  const water=new Water(new THREE.ShapeGeometry(shape,32),{textureWidth:256,textureHeight:256,waterNormals:normals,waterColor:'#245550',sunColor:'#c4bd9e',sunDirection:new THREE.Vector3(-.4,.8,.3),distortionScale:.65,fog:true});
  water.rotation.x=-Math.PI/2;water.position.set(cx,.16,cz);parent.add(water);
  water.material.transparent=true;water.material.depthWrite=false;water.material.uniforms.alpha.value=.58;
  const koi=createKoi(parent);water.userData.tick=time=>koi.userData.tick(time);
  water.material.uniforms.size.value=22;
  const reflect=water.onBeforeRender;let reflectedAt=-Infinity;water.onBeforeRender=function(...args){const now=performance.now();if(now-reflectedAt>100){reflectedAt=now;reflect.apply(this,args);}};
  water.userData.cleanup=()=>{water.disposeTarget();normals.dispose();};
  const rockMat=terrainMaterial('stone',.5),rockGeo=new THREE.DodecahedronGeometry(1,1);
  for(let i=0;i<shore.length-1;i+=2){const [x,y]=shore[i],stone=new THREE.Mesh(rockGeo,rockMat);stone.position.set(cx+x,.12,cz-y);stone.scale.set(.32+(i%3)*.06,.16+(i%4)*.025,.30);stone.rotation.set(i*.7,i*.43,i*.13);stone.castShadow=true;stone.receiveShadow=true;parent.add(stone);}
  const leafMat=new THREE.MeshStandardMaterial({color:'#668057',roughness:.85,side:THREE.DoubleSide});
  for(let i=0;i<18;i++){
    const a=i*2.4,r=.5+(i%4)*.55,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r*.65;
    const leaf=new THREE.Mesh(new THREE.CircleGeometry(.18+(i%3)*.04,24,.14,Math.PI*1.88),leafMat);leaf.rotation.x=-Math.PI/2;leaf.rotation.z=a;leaf.position.set(x,.19,z);parent.add(leaf);
    if(i%5===0)for(let j=0;j<7;j++){const petal=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({color:'#d8ccbd'}));const ang=j*Math.PI*2/7;petal.position.set(x+Math.cos(ang)*.09,.25,z+Math.sin(ang)*.09);petal.scale.set(.09,.045,.045);petal.rotation.y=-ang;parent.add(petal);}
  }
  // Reed clumps, with individually tapered blades at irregular banks.
  const grassMat=new THREE.MeshStandardMaterial({color:'#687957',side:THREE.DoubleSide,roughness:1});
  for(const i of [3,13,27,39,51]){const [x,y]=shore[i];for(let j=0;j<9;j++){
    const a=j*2.4,h=.35+(j%4)*.12,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.025,0,0,.025,0,0,Math.cos(a)*.22,h,Math.sin(a)*.22],3));geo.computeVertexNormals();const blade=new THREE.Mesh(geo,grassMat);blade.position.set(cx+x*1.05,.18,cz-y*1.05);parent.add(blade);
  }}
  return water;
}
