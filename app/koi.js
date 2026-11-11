import * as THREE from 'three';

// Five small fish, shared fin material and deterministic paths; no physics or textures.
export function createKoi(parent){
 const root=new THREE.Group();root.userData.dynamic=true;root.name='听荷池锦鲤';parent.add(root);
 const fins=new THREE.MeshStandardMaterial({color:'#e8bc87',side:THREE.DoubleSide,transparent:true,opacity:.76,roughness:.65});
 const eyeMat=new THREE.MeshStandardMaterial({color:'#182e29',roughness:.3});
 const fishes=[];
 for(let k=0;k<5;k++){
  const g=new THREE.Group();root.add(g);
  const geo=new THREE.SphereGeometry(1,20,12);geo.scale(.10,.045,.31);
  const pos=geo.attributes.position,colors=[];const ivory=new THREE.Color(k===3?'#d7a74e':'#e7e0c8'),red=new THREE.Color(k===4?'#394039':'#b95432');
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i);
   const patch=Math.sin(z*24+k*2)+Math.cos(x*46+k)+Math.sin(z*43-x*18);
   const c=ivory.clone().lerp(red,THREE.MathUtils.smoothstep(patch,.25,.8));c.multiplyScalar(.82+Math.max(0,y)/.045*.18);colors.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const body=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:.06}));g.add(body);
  const tail=new THREE.Group();tail.position.z=-.25;g.add(tail);
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(-.06,-.12,-.145,-.20);shape.lineTo(0,-.15);shape.lineTo(.145,-.20);shape.quadraticCurveTo(.06,-.12,0,0);
  const fan=new THREE.Mesh(new THREE.ShapeGeometry(shape,8),fins);fan.rotation.x=Math.PI/2;tail.add(fan);
  const finGeo=new THREE.BufferGeometry();finGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.15,-.01,-.07,.09,0,.055],3));finGeo.computeVertexNormals();
  const pair=[];for(const side of [-1,1]){const fin=new THREE.Mesh(finGeo,fins);fin.position.set(side*.075,0,.08);fin.scale.x=side;g.add(fin);pair.push(fin);const eye=new THREE.Mesh(new THREE.SphereGeometry(.012,6,4),eyeMat);eye.position.set(side*.065,.025,.22);g.add(eye);}
  g.scale.setScalar(.88+k*.065);fishes.push({g,tail,pair,phase:k*1.29,r:1.05+k*.26,speed:.085+k*.009});
 }
 root.userData.tick=(time)=>{
  for(const {g,tail,pair,phase,r,speed} of fishes){const a=time*speed+phase;
   const x=-6.3+Math.cos(a)*r,z=6.3+Math.sin(a)*r*.62;
   g.position.set(x,.085+Math.sin(time*.8+phase)*.008,z);g.rotation.y=Math.atan2(-Math.sin(a),Math.cos(a)*.62);
   tail.rotation.y=Math.sin(time*3.6+phase)*.24;g.rotation.z=Math.sin(time*1.8+phase)*.025;
   pair.forEach((f,i)=>f.rotation.z=Math.sin(time*2.4+phase+i)*.14);
  }
 };
 return root;
}
