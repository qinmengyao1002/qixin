from pathlib import Path
p=Path('app/sculpture.js');s=p.read_text(encoding='utf-8').replace('smoothstep(relativeY,.875,.895)','smoothstep(relativeY,.852,.868)');p.write_text(s,encoding='utf-8')
p=Path('app/sanctuary.tsx');s=p.read_text(encoding='utf-8').replace('建筑、角色与声景为本项目创作；','建筑、角色与声景为本项目创作；雕花背龛和天花彩绘使用参考中国寺院形制的原创 AI 辅助材质，并非实景照片；');p.write_text(s,encoding='utf-8')
