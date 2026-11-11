from pathlib import Path
p=Path('app/sanctuary.tsx');s=p.read_text(encoding='utf-8').replace('W A S D 也能走','WASD 走路 · 拖动环视 · F 回正').replace('点地面走路，拖动画面转视角，双指缩放。电脑也能按 WASD 或方向键。','点地面或按 WASD / 方向键走路，镜头自动跟随并随转弯缓慢回正。拖动画面自由环视，滚轮或双指缩放；按 F 或点“找到我”回到人物身后。观景、喝茶后重新走路，会恢复跟随。');p.write_text(s,encoding='utf-8')
