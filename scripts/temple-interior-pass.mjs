import fs from 'node:fs';let s=fs.readFileSync('app/world.js','utf8');
const r=(a,b)=>{if(!s.includes(a))throw Error(a.slice(0,80));s=s.replace(a,b);};
r("const robe=mesh(upper,'sphere',[0,.24,0],[.40,.50,.29],color);",`const robe=mesh(upper,'round',[0,.17,0],[.72,.94,.49],color);
  const hem=mesh(upper,'cylinder',[0,-.19,0],[.42,.22,.31],color);
  for(const side of [-1,1]){const collar=mesh(upper,'round',[side*.105,.48,.265],[.075,.43,.055],'#dbd8c8');collar.rotation.z=side*.48;}
  line(upper,[[.21,.26,.27],[-.20,.01,.27],[-.25,-.28,.27]],'#b2b5a5',.014);
  mesh(upper,'round',[0,-.02,0],[.73,.085,.52],'#5c655c');
  const pouch=mesh(upper,'round',[-.36,-.18,.1],[.20,.25,.13],'#9e9078');
`);
r("mesh(upper,'round',[0,.06,.20],[.40,.50,.14],palette.cream);",'');r("mesh(upper,'round',[0,.29,.30],[.48,.07,.09],'#c7ad72');",'');
r("[.22,.22,.20],'#50453b'","[.13,.13,.13],'#50453b'");
r("mesh(a,'sphere',[0,-.20,0],[.16,.3,.16],color)","mesh(a,'round',[0,-.20,0],[.36,.52,.34],color)");
r("[.17,.09,.22],'#f3e6cc'","[.17,.09,.22],'#454d47'");
r("mat('#858a62')","mat('#ffffff')");r("renderer.shadowMap.type=THREE.PCFSoftShadowMap","renderer.shadowMap.type=THREE.PCFShadowMap");
const pos=s.indexOf('function person(');
s=s.slice(0,pos)+`function interior(parent,id,pickables){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;const ctx=canvas.getContext('2d');ctx.fillStyle='#716052';ctx.fillRect(0,0,256,1024);
  for(let i=0;i<900;i++){const x=i*31.71%256;ctx.strokeStyle=i%3?'rgba(30,20,16,.13)':'rgba(224,205,166,.10)';ctx.lineWidth=.3+(i%4)*.3;ctx.beginPath();ctx.moveTo(x,0);for(let y=0;y<=1024;y+=32)ctx.lineTo(x+Math.sin(y*.01+i)*2,y);ctx.stroke();}
  const wood=new THREE.CanvasTexture(canvas);wood.colorSpace=THREE.SRGBColorSpace;const woodMat=new THREE.MeshStandardMaterial({map:wood,roughness:.8});
  const floor=new THREE.InstancedMesh(new THREE.BoxGeometry(.73,.10,3.0),woodMat,270),d=new THREE.Object3D();let n=0;
  for(let x=0;x<30;x++)for(let z=0;z<9;z++){d.position.set((x-14.5)*.75,-.04,(z-4)*3.03);d.updateMatrix();floor.setMatrixAt(n,d.matrix);floor.setColorAt(n,new THREE.Color().setRGB(.82+(x%3)*.05,.82+(x%3)*.05,.82+(x%3)*.05));n++;}floor.receiveShadow=true;parent.add(floor);
  mesh(parent,'box',[0,4,-12],[24,8,.4],'#54433a');
  for(const side of [-1,1]){
    mesh(parent,'box',[side*11.6,1,0],[.3,2,25],'#59443b');
    for(let z=-9;z<=9;z+=6){
      mesh(parent,'cylinder',[side*9.4,3.6,z],[.28,7.2,.28],'#513b30');mesh(parent,'cylinder',[side*9.4,.2,z],[.43,.4,.43],'#777b70');
      mesh(parent,'box',[side*11.5,4,z],[.15,3.3,4.7],'#c0c3ae');
      for(let j=0;j<9;j++)mesh(parent,'box',[side*11.3,4,z-2.1+j*.52],[.15,3.4,.045],'#5b5141');
      for(let y=2.5;y<5.8;y+=.55)mesh(parent,'box',[side*11.25,y,z],[.15,.045,4.7],'#5b5141');
      for(let k=0;k<3;k++)mesh(parent,'box',[side*9.4,6.8+k*.17,z],[1.1+k*.3,.16,.9],k%2?'#9b865d':'#3e5b55');
    }
  }
  for(let z=-10;z<=12;z+=3){mesh(parent,'box',[0,7.2,z],[23,.28,.27],'#48372f');for(const side of [-1,1]){const beam=mesh(parent,'box',[side*5.5,8.1,z],[11.8,.18,.19],'#4c3b32');beam.rotation.z=-side*.16;}}
  mesh(parent,'box',[0,9,0],[24,.18,27],'#3f352f');
  mesh(parent,'round',[0,.38,-8.6],[11,.76,3.8],'#56473b');mesh(parent,'box',[0,.81,-8.6],[11.3,.13,4],'#92794f');
  for(const x of [-3.3,0,3.3]){const panel=group(parent,[x,0,-11.7]);mesh(panel,'box',[0,3.7,0],[3.05,5.9,.06],'#3f5147');for(const a of [-1,1])mesh(panel,'box',[a*1.45,3.7,.06],[.06,5.7,.06],'#b59c68');const halo=new THREE.Mesh(new THREE.TorusGeometry(1.35,.025,8,80),mat('#ab9260',.25));halo.position.set(0,4.5,.1);panel.add(halo);for(let k=0;k<16;k++){const a=k*Math.PI/8;const petal=mesh(panel,'sphere',[Math.sin(a)*1.12,4.5+Math.cos(a)*1.12,.1],[.13,.30,.035],'#887c50');petal.rotation.z=-a;}}
  if(id==='wanfu')buddha(parent,0,.9,-8.6,'standing',2.25);else if(id==='falun')buddha(parent,0,.9,-8.6,'lama',1.9);else for(const x of [-3.3,0,3.3])buddha(parent,x,.9,-8.6,'seated',x===0?1.7:1.4);
  for(const x of [-4.8,4.8]){mesh(parent,'cylinder',[x,1.1,-6.5],[.12,.6,.12],'#a28a55');const lamp=mesh(parent,'sphere',[x,1.5,-6.5],[.10,.20,.10],'#ffe2a2');lamp.material=new THREE.MeshStandardMaterial({color:'#ffe2a2',emissive:'#ffc16a',emissiveIntensity:2});}
  const key=new THREE.PointLight('#ffe1ad',40,20,2);key.position.set(0,5,-5);parent.add(key);const fill=new THREE.PointLight('#c8dde1',28,24,2);fill.position.set(7,4,3);parent.add(fill);
  tag(parent,AREAS.find(a=>a.id===id).name,[0,6.8,-6],{width:3.2});
  const exit=group(parent,[0,1.6,10]);tag(exit,'返回银杏前庭',[0,0,0],{width:2.5});exit.userData={kind:'portal',area:'court'};pickables.push(exit);
}
`+s.slice(pos);
r("homeView();onEvent({type:'area',area:id});",`if(['main','yongyou','falun','wanfu'].includes(id)){
      const keep=new Set([...pets.map(p=>p.root),...residents.map(p=>p.root),...pickables.filter(p=>['seat','incense'].includes(p.userData.kind))]);
      for(const o of [...stage.children])if(!keep.has(o))stage.remove(o);
      pickables=pickables.filter(p=>keep.has(p));leafs=null;smoke=[];
      interior(stage,id,pickables);
    }
    homeView();onEvent({type:'area',area:id});`);
fs.writeFileSync('app/world.js',s);
