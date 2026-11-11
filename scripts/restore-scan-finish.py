from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'app/sculpture.js';s=p.read_text(encoding='utf-8')
a=s.index('  // Iconographic studies,');b=s.index('  return holder;',a);s=s[:a]+s[b:]
s=s.replace('mountLevel(source,10)','mountLevel(source,28)').replace("kind === 'standing' ? .3 : .42","kind === 'standing' ? .3 : .55").replace('o.material.roughness = .61','o.material.roughness = .45').replace('o.material.envMapIntensity = .55','o.material.envMapIntensity = .7').replace("'#b39258'","'#bfa062'").replace("'#343731'","'#263e4c'").replace('o.material.roughness=.64;o.material.metalness=.38','o.material.roughness=.48;o.material.metalness=.5')
p.write_text(s,encoding='utf-8')
p=root/'app/data.ts';s=p.read_text(encoding='utf-8').replace('场景为扫描底模与原创冠饰、宝瓶的艺术化改作，不是文物级复原。','当前保留完整扫描坐佛作艺术陈设，不以拼装冠饰和宝瓶冒充专门造像；无量寿佛专用模型待补充。').replace('现有扫描底模与原创药钵是艺术化改作，手印仍待专门模型完善。','当前保留完整扫描坐佛作艺术陈设；药师佛特有持物与手印仍待专门模型完善。');p.write_text(s,encoding='utf-8')
