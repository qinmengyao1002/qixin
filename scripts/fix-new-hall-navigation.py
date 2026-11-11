from pathlib import Path
p=Path('app/world.js');s=p.read_text(encoding='utf-8').replace('renderer.shadowMap.type=THREE.PCFShadowMap','renderer.shadowMap.type=THREE.PCFSoftShadowMap')
s=s.replace("function walkable(x,z){return x>-11.5&&x<11.5", "function walkable(x,z){const edge=['main','yongyou','falun','wanfu'].includes(area)?10.6:11.5;return x>-edge&&x<edge")
s=s.replace("indoor?[{x:0,z:-4.3,r:.9}]:", "indoor?[{x:0,z:-4.3,r:.9},...[-8.6,8.6].flatMap(x=>[-2.2,4.4].map(z=>({x,z,r:.65})))]:")
p.write_text(s,encoding='utf-8')
