from pathlib import Path
p=Path('app/world.js');s=p.read_text(encoding='utf-8').replace("mesh(parent,'box',[side*11.6,1,0],[.3,2,25],'#59443b');","mesh(parent,'box',[side*11.6,4,0],[.3,8,27],'#3d302b');")
s=s.replace("[side*11.5,4,z],[.15,3.3,4.7],'#c0c3ae'","[side*11.38,4,z],[.15,3.3,4.7],'#949d91'")
s=s.replace("amb.intensity=indoor?.85:1.8;sun.intensity=indoor?.65:1.8;scene.environmentIntensity=indoor?.4:.55;","amb.intensity=indoor?.65:1.8;sun.intensity=indoor?.55:1.8;scene.environmentIntensity=indoor?.3:.55;scene.fog.near=indoor?55:24;scene.fog.far=indoor?90:68;scene.background.set(indoor?'#302b25':'#a6b4b3');")
s=s.replace("[0,9,0],[24,.18,27],'#3f352f'", "[0,9,0],[25,.18,42],'#3f352f'")
p.write_text(s,encoding='utf-8')
