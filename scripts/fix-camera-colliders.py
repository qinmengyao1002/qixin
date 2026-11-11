from pathlib import Path
p=Path('app/world.js');s=p.read_text(encoding='utf-8')
s=s.replace('if(!indoor)stage.traverse','stage.traverse').replace('indoor?-4.0:-23','indoor?-5.2:-23')
s=s.replace("type==='box'&&pos[1]>.6&&(scale[0]>2||scale[2]>2)","type==='box'&&pos[1]>.6&&(scale[0]>2||scale[2]>2||(scale[1]>.8&&scale[0]>.4&&scale[2]>.4))")
s=s.replace("if(now-lastReport>160){lastReport=now;onEvent", "if(now-lastReport>160){lastReport=now;renderer.domElement.dataset.camera=JSON.stringify({mode:followCamera?'follow':'overview',player:player.root.position.toArray(),target:controls.getTarget(followTarget).toArray(),position:camera.position.toArray(),heading:player.root.rotation.y});onEvent")
p.write_text(s,encoding='utf-8')
