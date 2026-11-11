from pathlib import Path
p=Path('app/world.js');s=p.read_text(encoding='utf-8').replace("for(const x of [-3.35,0,3.35]){const r=x===0?1.65:1.3;", "for(const x of (id==='main'||id==='yongyou'?[-3.35,0,3.35]:[0])){const r=x===0?1.65:1.3;")
s=s.replace("buddha(parent,0,.9,-8.6,'standing',2.25)","buddha(parent,0,1.24,-8.6,'standing',1.6)")
s=s.replace("  tag(parent,AREAS.find(a=>a.id===id).name,[0,6.8,-6],{width:3.2});", "  // The HUD names the hall; keep floating plaques out of the altar sightline.")
p.write_text(s,encoding='utf-8')
p=Path('app/sculpture.js');s=p.read_text(encoding='utf-8').replace('o.material.metalness = .62;',"o.material.metalness = kind === 'standing' ? .3 : .62;");p.write_text(s,encoding='utf-8')
