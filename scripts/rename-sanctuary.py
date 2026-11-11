from pathlib import Path
root=Path(__file__).resolve().parents[1]
mapping={'雍和小院':'栖心禅院','雍和宫殿':'礼佛殿','永佑殿':'延寿殿','法轮殿':'药师殿','万福阁':'慈愿阁','手串小院':'结缘小院'}
for folder in ['app','public']:
 for p in (root/folder).rglob('*'):
  if p.suffix not in ['.js','.ts','.tsx','.html','.svg','.json']:continue
  s=p.read_text(encoding='utf-8');old=s
  for a,b in mapping.items():s=s.replace(a,b)
  s=s.replace('className="seal">雍','className="seal">栖').replace('雍和宫灵感 · 自在漫游','中式禅院 · 自在漫游')
  if p.name=='layout.tsx':s=s.replace('在雍和宫灵感的小院里','在独立设计的中式禅院里')
  if s!=old:p.write_text(s,encoding='utf-8')
p=root/'app/data.ts';s=p.read_text(encoding='utf-8');a=s.index("  { id:'main'");b=s.index("  { id:'bracelet'")
s=s[:a]+'''  { id:'main', name:'礼佛殿', subtitle:'一礼从容，一念清明', deity:'释迦牟尼佛', detail:'以释迦牟尼佛为礼拜主题，参考传统跏趺坐、螺发与袈裟造像。现有授权扫描像经材质适配用于艺术化表达，并非雍和宫原像复刻。可礼拜、拨珠与敲木鱼。', tag:'释迦佛 · 礼拜', stamp:'礼', icon:'temple' },
  { id:'yongyou', name:'延寿殿', subtitle:'愿牵挂的人，岁岁安宁', deity:'无量寿佛 · 造像参考', detail:'参考雍和宫无量寿佛主题，以及传统宝冠、宝瓶与结跏趺坐造像。场景为扫描底模与原创冠饰、宝瓶的艺术化改作，不是文物级复原。可静坐，为牵挂的人留下一份祝愿。', tag:'无量寿 · 祝愿', stamp:'寿', icon:'temple' },
  { id:'falun', name:'药师殿', subtitle:'愿身心安宁，日子从容', deity:'药师佛 · 造像参考', detail:'参考雍和宫的药师佛主题，以药钵作为识别线索。现有扫描底模与原创药钵是艺术化改作，手印仍待专门模型完善。这里适合安静坐一会儿，表达平安祝愿。', tag:'药师佛 · 静心', stamp:'安', icon:'temple' },
  { id:'wanfu', name:'慈愿阁', subtitle:'心怀善意，也给明天一点期待', deity:'弥勒佛 · 文化参考', detail:'以雍和宫高大弥勒立像的空间气势为灵感。当前陈设为授权佛教立像，不将其身份或细节冒称为雍和宫弥勒原像；专门的弥勒造像仍待补充。可登阁仰望，了解相关文化。', tag:'立像 · 仰望', stamp:'慈', icon:'temple' },
'''+s[b:];p.write_text(s,encoding='utf-8')
p=root/'app/garden-map.tsx';s=p.read_text(encoding='utf-8').replace('仰望弥勒立像','仰望立像 · 弥勒文化').replace("name:'药师殿',note:'入殿静心'","name:'药师殿',note:'药师佛主题 · 静心'").replace("name:'延寿殿',note:'静坐与祝愿'","name:'延寿殿',note:'无量寿佛主题 · 祝愿'").replace("name:'礼佛殿',note:'入殿礼拜'","name:'礼佛殿',note:'释迦牟尼佛 · 礼拜'").replace('独自放灯，也可以一起','观锦鲤 · 独自或一起放灯');p.write_text(s,encoding='utf-8')
