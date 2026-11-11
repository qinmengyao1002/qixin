from pathlib import Path
p=Path('app/world.js');s=p.read_text(encoding='utf-8')
s=s.replace("lighting(mode){const night=mode==='night';", "lighting(mode){const indoor=['main','yongyou','falun','wanfu'].includes(area);const night=mode==='night';")
s=s.replace("amb.intensity=night?.95:1.8;sun.intensity=night?.45:mode==='sunset'?1.55:1.8;", "amb.intensity=indoor?(night?.35:.65):(night?.95:1.8);sun.intensity=indoor?(night?.15:.55):(night?.45:mode==='sunset'?1.55:1.8);")
p.write_text(s,encoding='utf-8')
p=Path('app/data.ts');s=p.read_text(encoding='utf-8').replace('小院保留金顶与黄帽造像的视觉线索。','小院借鉴其金顶建筑元素，当前造像为授权雕塑的艺术化示意。');p.write_text(s,encoding='utf-8')
