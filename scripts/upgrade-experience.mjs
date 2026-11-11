import fs from 'node:fs';
const file='app/world.js';let s=fs.readFileSync(file,'utf8');
const replace=(a,b)=>{if(!s.includes(a))throw Error('Missing '+a.slice(0,90));s=s.replace(a,b);};
replace("const palette={red:'#9e493b',redLight:'#bd6950',gold:'#dbac52',goldLight:'#f0c777',green:'#496558',beam:'#4e8279',stone:'#c2b99e',cream:'#f8efd8',wood:'#765445'};","const palette={red:'#74473f',redLight:'#916459',gold:'#9c885b',goldLight:'#c3ae7b',green:'#374f4b',beam:'#48605b',stone:'#969b92',cream:'#e2dfd2',wood:'#54433a'};");
replace("ctx.fillStyle='#4c5140';ctx.font='500 32px", "ctx.fillStyle=color==='#2f514b'?'#fff9eb':'#354640';ctx.font='600 34px");
replace("s.scale.set(2.8,.67,1)","s.scale.set(2.05,.49,1)");
let start=s.indexOf('function tree('),end=s.indexOf('function hall(',start);
s=s.slice(0,start)+`function tree(parent,x,z,scale=1){
  const g=group(parent,[x,0,z]);g.scale.setScalar(scale);
  mesh(g,'cylinder',[0,2.1,0],[.17,4.2,.20],palette.wood);
  const leafGeo=new THREE.SphereGeometry(1,5,3);const foliage=new THREE.InstancedMesh(leafGeo,mat('#858a62'),340);const dummy=new THREE.Object3D();
  for(let j=0;j<7;j++){const a=j*2.4;line(g,[[0,1.7,0],[Math.cos(a)*.7,2.9,Math.sin(a)*.7],[Math.cos(a)*1.8,4+Math.sin(j)*.5,Math.sin(a)*1.8]],palette.wood,.07);}
  for(let i=0;i<340;i++){const a=i*2.399,r=2*Math.sqrt((i+.5)/340),y=4.4+Math.sin(i*1.77)*.75-r*.24;dummy.position.set(Math.cos(a)*r,y,Math.sin(a)*r);dummy.scale.set(.23+(i%4)*.04,.035,.17);dummy.rotation.set(Math.sin(i)*.6,a,Math.sin(i*3)*.4);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);foliage.setColorAt(i,new THREE.Color(['#91916b','#b2a77c','#657664','#a69c6b'][i%4]));}
  foliage.castShadow=true;foliage.receiveShadow=true;g.add(foliage);
  mesh(g,'cylinder',[0,.09,0],[1.35,.16,1.35],'#6b7466');
}
function groundTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#a4aaa5';x.fillRect(0,0,256,256);
  let seed=91;for(let i=0;i<14000;i++){seed=(seed*1664525+1013904223)>>>0;const v=seed%256; x.fillStyle='rgba('+v+','+v+','+v+',.06)';x.fillRect((seed>>>8)%256,(seed>>>16)%256,1+(i%3),1+(i%2));}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t;
}
function floorRing(parent,color,r=.58){const m=new THREE.Mesh(new THREE.RingGeometry(r,r+.035,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.10;parent.add(m);return m;}
`+s.slice(end);
replace("p.body.position.y=THREE.MathUtils.lerp(p.body.position.y,kneel?-.18:.10,.15);", "p.body.position.y=THREE.MathUtils.lerp(p.body.position.y,action==='pet'?-.24:kneel?-.18:.10,.15);");
replace("p.upper.rotation.x=action==='bow'?(.16+(1-Math.cos(t*1.8))*.45)*s:0;", "p.upper.rotation.x=action==='pet'?.5:action==='greet'?.12+Math.sin(t*2)*.025:action==='bow'?(.16+(1-Math.cos(t*1.8))*.45)*s:0;");
replace("arm.rotation.x=action==='bracelet'?-1.8:","arm.rotation.x=action==='pet'?(i===1?-1.25+Math.sin(t*5)*.10:-.3):action==='bracelet'?-1.8:");
replace("renderer.toneMappingExposure=1.18", "renderer.toneMappingExposure=.96");
replace("scene.background=new THREE.Color('#dce4ce');scene.fog=new THREE.Fog('#dce4ce',42,90);", "scene.background=new THREE.Color('#a6b4b3');scene.fog=new THREE.Fog('#a6b4b3',24,68);");
replace("const camera=new THREE.PerspectiveCamera(38,1,.1,130);camera.position.set(17,16,23);", "const camera=new THREE.PerspectiveCamera(54,1,.1,150);camera.position.set(0,4.6,15.5);");
replace("controls.setTarget(0,1.1,-1);controls.minDistance=13;controls.maxDistance=43;controls.minPolarAngle=.45;controls.maxPolarAngle=1.25", "controls.setTarget(0,1.0,4.5);controls.minDistance=5;controls.maxDistance=30;controls.minPolarAngle=.45;controls.maxPolarAngle=1.40");
replace("const amb=new THREE.HemisphereLight('#fff3d9','#7a8b66',2.4)","const amb=new THREE.HemisphereLight('#c8d9e2','#636451',1.8)");
replace("const sun=new THREE.DirectionalLight('#ffdfaa',3.0)","const sun=new THREE.DirectionalLight('#f2ddbd',1.8)");
replace("let myLabel=label(player.root,'我 · 慢慢来',[0,2.36,0]);",`let myLabel=label(player.root,'你 · 慢慢来',[0,2.36,0],'#2f514b');
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
  function homeView(){followCamera=true;const p=player.root.position;camTarget.set(p.x,1,p.z-2.0);controls.setLookAt(p.x,4.6,p.z+8.5,p.x,1,p.z-2,true);onEvent({type:'cameraMode',mode:'follow'});}
`);
replace("function resetWalk(){path=[];afterWalk=null;seat=null;action='idle';", "function resetWalk(){path=[];afterWalk=null;seat=null;action='idle';actionUntil=0;destinationRing.visible=false;");
replace("path=result;afterWalk=after;action='walk';", "path=result;afterWalk=after;action='walk';destinationRing.position.set(x,.11,z);destinationRing.visible=true;");
replace("stage=new THREE.Group();scene.add(stage);pickables=[];pets=[];residents=[];smoke=[];", "clearSelection();bubbles.length=0;stage=new THREE.Group();scene.add(stage);pickables=[];pets=[];residents=[];smoke=[];");
replace("mesh(stage,'round',[0,-.60,0],[28,1.2,26],'#9da87d');mesh(stage,'round',[0,-.10,0],[25,.22,23],'#c9c6ad');", "mesh(stage,'box',[0,-.30,0],[150,.5,150],'#6b766a');mesh(stage,'box',[0,-.10,0],[25,.22,23],'#8b938d');");
replace("tileMat=mat('#d5cfb9')", "tileMat=new THREE.MeshStandardMaterial({color:'#a5aaa2',map:groundTexture(),roughness:1})");
replace("[3.7,.07,11],'#e1dac3'", "[3.7,.07,11],'#a2a69c'");
replace("tree(stage,-8,3,1.25);tree(stage,8,1,1.1);tree(stage,-10,-9,1);tree(stage,10,-9,1.1);",`tree(stage,-8,3,1.25);tree(stage,8,1,1.1);tree(stage,-10,-9,1);tree(stage,10,-9,1.1);
    for(let i=0;i<18;i++){const x=Math.sin(i*2.4)*30,z=-24+Math.cos(i*2.4)*7;const g=group(stage,[x,0,z]);mesh(g,'cylinder',[0,3,0],[.25,6,.25],palette.wood);for(let k=0;k<3;k++)mesh(g,'cone',[0,4+k*1.2,0],[2.5-k*.5,4,2.5-k*.5],['#4b635d','#567068','#5d7469'][k]);}
    for(const x of [-4.8,4.8])for(const z of [-3,5]){const g=group(stage,[x,0,z]);mesh(g,'box',[0,.35,0],[.42,.7,.42],palette.wood);const glow=mesh(g,'box',[0,.4,0],[.33,.46,.33],'#e9d5ac');glow.material=new THREE.MeshStandardMaterial({color:'#e9d5ac',emissive:'#e9bc78',emissiveIntensity:.8});roof(g,.65,.65,.74,.12,palette.wood);const light=new THREE.PointLight('#ffd6a0',1.6,5,2);light.position.set(x,.8,z);stage.add(light);}
`);
replace("i%2?'#cbb582':'#d4bd8c'", "i%2?'#8e7969':'#9d8b76'");
replace("label(p.root,p.spec.name,[0,1.55,0]);", "p.label=label(p.root,p.spec.name,[0,1.45,0]);");
replace("p.root.position.set([-6.2,6.5,-3][i],0,[.2,2,7.8][i]);", "p.root.position.set([-2.7,3.3,-3][i],0,[3.2,2,7.8][i]);p.id='resident-'+i;p.name=['清和','听风','小满'][i];p.root.userData={kind:'person',id:p.id};pickables.push(p.root);");
replace("residents.push(p);label(p.root,'小院住客',[0,2.2,0],'#e7e7d8').scale.set(1.65,.4,1);", "residents.push(p);p.label=label(p.root,p.name+' · 住客',[0,2.3,0],'#e0e6de');");
replace("color:'#e5b94e'", "color:'#a79b6e'");
replace("const narrow=container.clientWidth<760;controls.setLookAt(narrow?13:17,narrow?22:16,narrow?32:23,0,1.1,narrow?1:-1,true);onEvent({type:'area',area:id});", "homeView();onEvent({type:'area',area:id});");
replace("ray.intersectObjects(pickables,true)", "ray.intersectObjects([...pickables,...Array.from(peers.values()).map(p=>p.root)],true)");
replace("if(hit){onEvent({type:'interact',...hit});return;}", "if(hit){if(hit.kind==='person'||hit.kind==='pet'){select(hit.id);return;}onEvent({type:'interact',...hit});return;}");
replace("seat=null;moveTo(target.x,target.z);", "clearSelection();seat=null;actionUntil=0;moveTo(target.x,target.z);");
replace("keys.add(e.key.toLowerCase());path=[];afterWalk=null;seat=null;", "keys.add(e.key.toLowerCase());clearSelection();path=[];afterWalk=null;seat=null;actionUntil=0;destinationRing.visible=false;");
replace("controls.update(dt);", `if(followCamera){const p=player.root.position;const target=p.clone().add(new THREE.Vector3(0,1,-2));camTarget.lerp(target,1-Math.exp(-dt*4));controls.moveTo(camTarget.x,camTarget.y,camTarget.z,false);}controls.update(dt);
    if(selected&&!actors().includes(selected))clearSelection();
    if(selected)selectedRing.position.set(selected.root.position.x,.11,selected.root.position.z);
    for(let i=bubbles.length-1;i>=0;i--){const q=bubbles[i];if(q.until<clock){q.parent.remove(q.b);q.b.material.map.dispose();q.b.material.dispose();bubbles.splice(i,1);}}
    if(actionUntil&&clock>actionUntil){action='idle';actionUntil=0;onEvent({type:'action',action,seat});}
    actors().forEach(p=>{if(p.label){const d=p.root.position.distanceTo(player.root.position);p.label.visible=d<7||p===selected;p.label.material.opacity=p===selected?1:Math.max(.3,1-d/12);}});
    if(Math.floor(clock*2)!==nearbyStamp){nearbyStamp=Math.floor(clock*2);onEvent({type:'nearby',items:actors().map(describe).sort((a,b)=>a.distance-b.distance)});}
`);
replace("action=afterWalk||'idle';if(['kneel'", "destinationRing.visible=false;action=afterWalk||'idle';if(action==='interact')finishInteraction();if(['kneel'");
replace("residents.forEach(p=>animatePerson(p,p.action,clock,false,reduced));", "residents.forEach(p=>{if(p.responseAt&&clock>=p.responseAt){p.action=p.responseAction;p.responseAt=0;bubble(p,p.responseAction==='dance'?'♪ 一起慢慢摇':'合掌回礼 · 愿你心安');}if(p.responseUntil&&clock>p.responseUntil){p.action='idle';p.responseUntil=0;}animatePerson(p,p.action,clock,false,reduced);});");
replace("else if(!dance&&!sleeping){", "else if(!dance&&!sleeping&&clock>(p.holdUntil||0)){");
replace("go:rebuild,", `go:rebuild,
    select,interact,clearSelection,
    receive(id,kind){const p=actor(id);if(p)bubble(p,kind==='dance'?'邀请你一起跳舞':'向你合掌问好');},
    overview(){followCamera=false;controls.setLookAt(17,19,23,0,1,-1,true);onEvent({type:'cameraMode',mode:'overview'});},
`);
replace("act(value){path=[];", "act(value){interaction=null;destinationRing.visible=false;actionUntil=0;path=[];");
replace("if(mode==='pat'){p.pettedUntil=clock+4;moveTo(p.root.position.x-.6,p.root.position.z+.7,'pet');}", "if(mode==='pat'){return interact(id,'pat');}");
replace("myLabel=label(player.root,'我 · '+name,[0,2.36,0]);", "selfName=name;myLabel=label(player.root,'你 · '+name,[0,2.36,0],'#2f514b');");
replace("label(p.root,row.name,[0,2.36,0],'#e2ebd8');peers.set(row.id,p);", "p.id=row.id;p.name=row.name;p.remote=true;p.root.userData={kind:'person',id:row.id};p.label=label(p.root,row.name,[0,2.36,0],'#e2ebd8');peers.set(row.id,p);");
start=s.indexOf('    lighting(mode){');end=s.indexOf('    quality(low)',start);
s=s.slice(0,start)+`    lighting(mode){const night=mode==='night';scene.background.set(night?'#243b45':mode==='sunset'?'#a8a5a0':'#a6b4b3');scene.fog.color.copy(scene.background);amb.intensity=night?.95:1.8;sun.intensity=night?.45:mode==='sunset'?1.55:1.8;sun.color.set(night?'#9ebbd8':mode==='sunset'?'#ebc6a2':'#f2ddbd');renderer.toneMappingExposure=night?.9:.96;},
`+s.slice(end);
start=s.indexOf('    home(){');end=s.indexOf('    zoom(',start);s=s.slice(0,start)+'    home:homeView,\n'+s.slice(end);
fs.writeFileSync(file,s);
