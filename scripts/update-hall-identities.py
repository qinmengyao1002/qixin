from pathlib import Path
p=Path('app/data.ts');s=p.read_text(encoding='utf-8')
lines=s.splitlines()
replacements={
'main': "  { id:'main', name:'礼佛殿', subtitle:'一礼从容，一念清明', deity:'释迦牟尼佛', detail:'陈设参考杭州雷峰塔出土、浙江省博物馆藏的释迦牟尼鎏金铜像，采用 Di Luo 罗迪发布的完整扫描模型。保留说法手印、袈裟、莲座与火焰背光。可礼拜、拨珠与敲木鱼。', tag:'释迦佛 · 礼拜', stamp:'礼', icon:'temple' },",
'yongyou': "  { id:'yongyou', name:'净愿殿', subtitle:'愿牵挂的人，岁岁安宁', deity:'阿弥陀佛', detail:'采用 Amitabha Buddhist New Zealand 发布的阿弥陀佛完整立像扫描，保留浅色材质、衣褶与莲座。这里可静坐、祝愿。本殿不作为雍和宫无量寿佛宝冠持瓶造像的复刻。', tag:'弥陀 · 祝愿', stamp:'净', icon:'temple' },",
'falun': "  { id:'falun', name:'药师殿', subtitle:'愿身心安宁，日子从容', deity:'药师佛', detail:'采用英国科学博物馆集团发布的药师佛完整扫描；原像于2018年在中国制作。手印、持物和莲座均来自原始造像，保留铜色表面。这里适合静坐片刻、表达平安祝愿。', tag:'药师佛 · 静心', stamp:'安', icon:'temple' },",
'wanfu': "  { id:'wanfu', name:'慈愿阁', subtitle:'心怀善意，也给明天一点期待', deity:'弥勒造像碑', detail:'采用明尼阿波利斯艺术博物馆发布的公元563年中国弥勒造像碑扫描，保留主尊、胁侍、背光和石刻细节。它是中国古代弥勒造像的另一种形式，并非雍和宫万福阁的檀木立像。', tag:'弥勒 · 观像', stamp:'慈', icon:'temple' },",
}
for i,line in enumerate(lines):
    for key,value in replacements.items():
        if "{ id:'"+key+"'" in line: lines[i]=value
p.write_text('\n'.join(lines)+'\n',encoding='utf-8')
p=Path('app/garden-map.tsx');s=p.read_text(encoding='utf-8').replace('延寿殿','净愿殿').replace('无量寿佛主题 · 祝愿','阿弥陀佛 · 静坐祝愿').replace('仰望立像 · 弥勒文化','弥勒造像碑 · 观像');p.write_text(s,encoding='utf-8')
p=Path('public/models/credits.html');s=p.read_text(encoding='utf-8')
assets=[('释迦牟尼铜像','Di Luo 罗迪','7d0cbc0e0d034e63a02274ab8af70eee','CC BY 4.0'),('阿弥陀佛立像','Amitabha Buddhist New Zealand','76b657d020934c3b928c0c05517d99c5','CC BY 4.0'),('药师佛','Science Museum Group','93c2236f3f0a4ea1a76cfa0fca24c581','CC BY 4.0'),('弥勒造像碑','Minneapolis Institute of Art','6f341339440b4626b42e5c7148470014','CC0 1.0')]
section='<section><h2>四殿独立造像 · 2026-11-06</h2><p>完整模型经 Artheon 的公开可下载归档取得，按文件内嵌原始许可署名；归档网页通用的 CC0 标签不覆盖原作者的 CC BY 许可。以下均非雍和宫文物扫描。</p>'
for title,author,uid,license in assets:
    link='https://creativecommons.org/publicdomain/zero/1.0/' if license.startswith('CC0') else 'https://creativecommons.org/licenses/by/4.0/'
    section+=f'<article><h3>{title}</h3><p>{author} · <a href="{link}">{license}</a></p><a href="https://sketchfab.com/models/{uid}">原作与作者</a></article>'
section+='<p>修改：减面、纹理压缩、Meshopt、远近精度、尺寸与朝向适配及场景照明。未拼接、更改手印或替换持物。原作者及机构不代表认可本游戏。</p></section>'
s=s.replace('</html>',section+'</html>');p.write_text(s,encoding='utf-8')
