from pathlib import Path
p=Path('app/world.js');s=p.read_text(encoding='utf-8');s=s.replace("import { mountSculpture } from './sculpture';", "import { mountSculpture } from './sculpture';\nimport { buildTempleInterior } from './temple-interior';")
a=s.index('function interior(parent,id,pickables){');b=s.index('function person(',a);s=s[:a]+"function interior(parent,id,pickables){return buildTempleInterior(parent,id,pickables);}\n"+s[b:]
s=s.replace("amb.intensity=indoor?.65:1.8;sun.intensity=indoor?.55:1.8;", "amb.intensity=indoor?.42:1.8;sun.intensity=indoor?.32:1.8;")
s=s.replace("indoor?(night?.35:.65)","indoor?(night?.25:.42)").replace("indoor?(night?.15:.55)","indoor?(night?.12:.32)")
p.write_text(s,encoding='utf-8')
