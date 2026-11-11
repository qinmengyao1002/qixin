from pathlib import Path
p=Path('app/world.js')
s=p.read_text(encoding='utf-8')
start=s.index("    const terrain=mesh(stage,'box'")
end=s.index("    if(id==='garden'){",start)
base=s[start:end]
# One authoritative forecourt, used outside and seen through the hall doorway.
s=s[:start]+"    buildForecourtBase(stage);\n"+s[end:]
helper="""
function buildForecourtBase(stage){
BASE
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
  tag(front,AREAS.find(a=>a.id===id)?.name||'雍和宫殿',[0,7.56,12.42],{width:3.8,font:44});
  roof(parent,25.5,29.5,9.0,2.25,palette.gold);
  const threshold=mesh(front,'box',[0,.025,12.5],[8.5,.05,.6],'#8d8978');
  const approach=mesh(front,'box',[0,-.045,13.25],[9,.12,1.0],'#8d8978');approach.material=terrainMaterial('stone',2);
  threshold.userData={kind:'portal',area:id};pickables.push(threshold);
  return front;
}
""".replace('BASE',base)
s=s.replace('function interior(parent,id,pickables)',helper+'\nfunction interior(parent,id,pickables)')
s=s.replace("}else hall(stage,id,pickables);", "}else if(id==='court'){const building=group(stage,[0,0,-17]);interior(building,'main',[]);hallEnvelope(building,'main',pickables);}else hall(stage,id,pickables);")
# Replace the placeholder exterior, preserving the complete entrance and courtyard.
a=s.index('      // Finish the entrance elevation')
b=s.index('\n    }\n    const indoor=',a)
s=s[:a]+"""      hallEnvelope(stage,id,[]);
      const outside=group(stage,[0,0,17]);buildForecourtBase(outside);
      gardenDetails=buildCourtyard(outside,[],{mesh,group,roof,tag,line},'court');
      gardenDetails.riverLanterns.sync(lanternRows.filter(r=>r.area==='court'),lanternTime);
      // The hall remains a quiet worship space; animals stay in the courtyard.
      for(const p of pets){stage.remove(p.root);disposeTree(p.root);}pets=[];
      pickables=pickables.filter(p=>p.userData.kind!=='pet');
      residents.forEach((p,i)=>{p.root.position.set([-6.1,6.1,6.1][i],0,[1.5,-1.2,5][i]);p.root.rotation.y=Math.PI;p.action='kneel';});
"""+s[b:]
s=s.replace('function rebuild(id){','function rebuild(id,options={}){')
s=s.replace("    homeView();onEvent({type:'area',area:id});", """    controls.stop();
    if(indoor){player.root.position.set(0,0,8.2);player.root.rotation.y=Math.PI;followCamera=false;controls.setLookAt(0,3.2,10.3,0,2.8,-7,false);onEvent({type:'cameraMode',mode:'overview'});}
    else if(options.door){player.root.position.set(0,0,-2.5);player.root.rotation.y=0;followCamera=false;controls.setLookAt(0,3.2,-4.6,0,1.2,5,false);onEvent({type:'cameraMode',mode:'overview'});}
    else homeView();onEvent({type:'area',area:id});
""")
# Walk to the threshold before changing zones, keeping a clear entry direction.
s=s.replace("  function getHit(e){", """  function traverseDoor(destination,pray=false){
    clearSelection();resetWalk();
    const indoor=['main','yongyou','falun','wanfu'].includes(area);
    if((area==='court'&&destination==='main')||(indoor&&destination==='court')){
      followCamera=false;controls.setLookAt(0,3.2,indoor?6.5:4.7,0,2.4,indoor?17:-10,true);onEvent({type:'cameraMode',mode:'overview'});
      return moveTo(0,indoor?9.8:-3.2,{destination,pray});
    }
    onEvent({type:'navigate',area:destination,pray});return true;
  }
  function getHit(e){""")
s=s.replace("if(hit.kind==='pond'){", "if(hit.kind==='portal'){traverseDoor(hit.area,false);return;}if(hit.kind==='pond'){")
s=s.replace("action=afterWalk||'idle';if(action==='interact')", "if(afterWalk&&typeof afterWalk==='object'){const crossing=afterWalk;afterWalk=null;action='idle';onEvent({type:'navigate',area:crossing.destination,pray:crossing.pray});return;}action=afterWalk||'idle';if(action==='interact')")
s=s.replace('    go:rebuild,','    go:rebuild,\n    traverseDoor,\n    faceAltar(){followCamera=false;const p=player.root.position;controls.setLookAt(p.x*.4,3.1,Math.min(10.3,p.z+5),0,2.7,-7,true);onEvent({type:"cameraMode",mode:"overview"});},')
s=s.replace("sit(index,pose='bow'){seat=index;", "sit(index,pose='bow'){if(['main','yongyou','falun','wanfu'].includes(area)){followCamera=false;controls.setLookAt(0,3.2,9.8,0,2.5,-7,true);onEvent({type:'cameraMode',mode:'overview'});}seat=index;")
s=s.replace("rows.filter(r=>r.area===area),serverTime", "rows.filter(r=>r.area===(['main','yongyou','falun','wanfu'].includes(area)?'court':area)),serverTime")
p.write_text(s,encoding='utf-8')
