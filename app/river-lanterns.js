import * as THREE from 'three';
export function lotusLamp(color='#d6ac88'){
  const root=new THREE.Group(),material=new THREE.MeshStandardMaterial({color,roughness:.65,emissive:'#a96229',emissiveIntensity:.2,side:THREE.DoubleSide});
  const points=[];for(let i=0;i<=12;i++){const t=i/12;points.push(new THREE.Vector2(Math.sin(Math.PI*t)*.085,t*.31));}
  const shape=new THREE.Shape();shape.moveTo(0,0);for(const p of points)shape.lineTo(p.x,p.y);for(const p of [...points].reverse())shape.lineTo(-p.x,p.y);
  const geometry=new THREE.ShapeGeometry(shape,12);geometry.rotateX(-Math.PI/2);
  const petals=new THREE.InstancedMesh(geometry,material,18),dummy=new THREE.Object3D();
  for(let i=0;i<18;i++){const inner=i>=10,a=(i%(inner?8:10))/(inner?8:10)*Math.PI*2;dummy.position.set(Math.sin(a)*.045,inner?.065:.025,Math.cos(a)*.045);dummy.rotation.set(inner?-.65:-.25,a,0);dummy.scale.setScalar(inner?.72:1);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}petals.computeBoundingSphere();root.add(petals);
  const candle=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.06,12),new THREE.MeshStandardMaterial({color:'#ead5a4'}));candle.position.y=.07;root.add(candle);
  const flame=new THREE.Mesh(new THREE.SphereGeometry(1,8,8),new THREE.MeshBasicMaterial({color:'#ffe3a2'}));flame.scale.set(.025,.07,.025);flame.position.y=.15;root.add(flame);return root;
}
export function createRiverLanterns(parent){
  const root=new THREE.Group();parent.add(root);const poolGlow=new THREE.PointLight('#e9ba73',0,7,2);poolGlow.position.set(-6.3,1,6.3);root.add(poolGlow);const items=new Map();let offset=0;
  function remove(id){const p=items.get(id);if(!p)return;root.remove(p.root);p.root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});items.delete(id);}
  return {
    sync(rows,serverTime){offset=serverTime-Date.now();const ids=new Set(rows.map(r=>r.id));for(const id of items.keys())if(!ids.has(id))remove(id);
      for(const row of rows){if(items.has(row.id))continue;const seed=Array.from(row.id).reduce((s,c)=>s+c.charCodeAt(0),0),g=lotusLamp(['#d6ac88','#dbbd76','#c3ceb2','#dfb7b7'][seed%4]);root.add(g);items.set(row.id,{root:g,row,seed});
      }
    },
    tick(){const now=Date.now()+offset;poolGlow.intensity=Math.min(2.2,[...items.values()].filter(p=>now>=p.row.starts&&now<p.row.starts+180000).length*.6);for(const p of items.values()){const age=(now-p.row.starts)/1000;p.root.visible=age>=0&&age<180;if(!p.root.visible)continue;const a=p.seed*.19+age*.015,r=.65+(p.seed%13)/13*1.7,arrival=Math.min(1,age/12);p.root.position.set(THREE.MathUtils.lerp(-3.3,-6.3+Math.cos(a)*r,arrival),.23+Math.sin(age*1.5+p.seed)*.015,THREE.MathUtils.lerp(6.3,6.3+Math.sin(a)*r*.7,arrival));p.root.rotation.y=a;const scale=Math.min(1,(180-age)/8);p.root.scale.setScalar(Math.max(0,scale));}},
  };
}
