from pathlib import Path
p=Path('app/temple-interior.js');s=p.read_text(encoding='utf-8').replace("map:carving,roughness:.56,metalness:.23", "map:carving,bumpMap:carving,bumpScale:.035,roughness:.56,metalness:.23")
s=s.replace("mountSculpture(room,x,1.43,-8.85,center?4.55:4.22);", "mountSculpture(room,x,1.43,-8.85,center?4.55:4.22,'seated','yonghe');")
s=s.replace("const x=side*4.4;", "const x=side*5.55;")
s=s.replace("yy=3.2+(j%2)*.25", "yy=2.95+(j%2)*.20")
p.write_text(s,encoding='utf-8')
