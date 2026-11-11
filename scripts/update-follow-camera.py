from pathlib import Path
p=Path('app/world.js');s=p.read_text(encoding='utf-8')
s="import { followHeading } from './follow-camera';\n"+s
s=s.replace("function homeView(){followCamera=true;const p=player.root.position;camTarget.set(p.x,2.1,p.z);controls.setLookAt(p.x,2.8,p.z+5,p.x,2.1,p.z,true);onEvent({type:'cameraMode',mode:'follow'});}","""let cameraHeld=false,manualCameraUntil=0;
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
""")
s=s.replace("path=result.length?result:[goal];afterWalk", "resumeFollow();path=result.length?result:[goal];afterWalk")
s=s.replace("function onDown(e){down={x:e.clientX,y:e.clientY};}","function onDown(e){renderer.domElement.focus({preventScroll:true});down={x:e.clientX,y:e.clientY};}")
s=s.replace("renderer.domElement.addEventListener('pointerdown',onDown);", "renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','三维院落：WASD走路，拖动环视，F回到身后');renderer.domElement.addEventListener('pointerdown',onDown);")
s=s.replace("if(paused||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName))return;if(['ArrowUp'", "if(paused||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable)return;if(e.key.toLowerCase()==='f'){e.preventDefault();homeView();return;}if(['ArrowUp'")
s=s.replace("e.preventDefault();resetWalk();keys.add(e.key.toLowerCase());", "e.preventDefault();if(!keys.size){camera.getWorldDirection(keyboardForward);keyboardForward.y=0;keyboardForward.normalize();}resumeFollow();resetWalk();keys.add(e.key.toLowerCase());")
s=s.replace("if(followCamera){const p=player.root.position;const target=p.clone().add(new THREE.Vector3(0,2.1,0));camTarget.lerp(target,1-Math.exp(-dt*4));controls.moveTo(camTarget.x,camTarget.y,camTarget.z,false);}controls.update(dt);", "// Camera updates after player movement below, so there is no one-frame follow lag.")
s=s.replace("const f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const r=", "const f=keyboardForward;const r=")
needle="    animatePerson(player,action,clock,action==='walk',reduced);"
insert="""    if(followCamera){
      followTarget.copy(player.root.position);followTarget.y+=1.6;
      camTarget.lerp(followTarget,1-Math.exp(-dt*9));
      controls.moveTo(camTarget.x,camTarget.y,camTarget.z,false);
      if(action==='walk'&&!cameraHeld&&clock>manualCameraUntil){
        controls.rotateTo(followHeading(controls.azimuthAngle,player.root.rotation.y,dt),controls.polarAngle,false);
      }
    }
    controls.update(dt);
"""
s=s.replace(needle,insert+needle)
s=s.replace("controls.dispose();window.removeEventListener('keydown'", "controls.removeEventListener('controlstart',cameraStart);controls.removeEventListener('controlend',cameraEnd);controls.dispose();window.removeEventListener('keydown'")
# Allow the follow pivot to reach the entire traversable hall, including side aisles.
s=s.replace("indoor?-7.7:-24", "indoor?-10.6:-24").replace("indoor?7.7:24", "indoor?10.6:24")
p.write_text(s,encoding='utf-8')
p=Path('app/sanctuary.tsx');s=p.read_text(encoding='utf-8');s=s.replace('<div className="view-tools hud">','<div className="view-tools hud"><button className="camera-mode-label" aria-label={cameraMode===\'follow\'?\'当前跟随视角，切换全景\':\'当前观景视角，恢复跟随\'} onClick={()=>cameraMode===\'follow\'?world.current?.overview():world.current?.home()}>{cameraMode===\'follow\'?\'跟随中\':\'回到身后\'}</button>');s=s.replace('title="找到我 · 跟随视角"','title="回到人物身后 · F"');p.write_text(s,encoding='utf-8')
p=Path('app/globals.css');s=p.read_text(encoding='utf-8');s+='\n.view-tools .camera-mode-label{position:absolute;right:0;bottom:calc(100% + 8px);width:88px;height:30px;border-radius:16px;background:#29473ee8;color:#f4f1de;font-size:11px;white-space:nowrap;border:1px solid #d6dfc455}\n';p.write_text(s,encoding='utf-8')
