export const AREAS = [
  { id:'court', name:'银杏前庭', subtitle:'风吹叶落，先慢下来', deity:'一方树荫，几位新朋友', detail:'沿朱墙散步，摸摸院里的猫狗。正前方通往礼佛殿，带着好奇心随意逛逛。', tag:'散步 · 猫狗', stamp:'杏', icon:'leaf' },
  { id:'main', name:'礼佛殿', subtitle:'一礼从容，一念清明', deity:'释迦牟尼佛', detail:'陈设参考杭州雷峰塔出土、浙江省博物馆藏的释迦牟尼鎏金铜像，采用 Di Luo 罗迪发布的完整扫描模型。保留说法手印、袈裟、莲座与火焰背光。可礼拜、拨珠与敲木鱼。', tag:'释迦佛 · 礼拜', stamp:'礼', icon:'temple' },
  { id:'yongyou', name:'净愿殿', subtitle:'愿牵挂的人，岁岁安宁', deity:'阿弥陀佛', detail:'采用 Amitabha Buddhist New Zealand 发布的阿弥陀佛完整立像扫描，保留浅色材质、衣褶与莲座。这里可静坐、祝愿。本殿不作为雍和宫无量寿佛宝冠持瓶造像的复刻。', tag:'弥陀 · 祝愿', stamp:'净', icon:'temple' },
  { id:'falun', name:'药师殿', subtitle:'愿身心安宁，日子从容', deity:'药师佛', detail:'采用英国科学博物馆集团发布的药师佛完整扫描；原像于2018年在中国制作。手印、持物和莲座均来自原始造像，保留铜色表面。这里适合静坐片刻、表达平安祝愿。', tag:'药师佛 · 静心', stamp:'安', icon:'temple' },
  { id:'wanfu', name:'慈愿阁', subtitle:'心怀善意，也给明天一点期待', deity:'弥勒造像碑', detail:'采用明尼阿波利斯艺术博物馆发布的公元563年中国弥勒造像碑扫描，保留主尊、胁侍、背光和石刻细节。它是中国古代弥勒造像的另一种形式，并非雍和宫万福阁的檀木立像。', tag:'弥勒 · 观像', stamp:'慈', icon:'temple' },
  { id:'bracelet', name:'结缘小院', subtitle:'捧着小小的心愿，等一会儿', deity:'手串开光体验', detail:'选一串喜欢的珠子，捧在手心跪候。等候期间可以去其他院落散步，轮到你时会提醒。这里是虚拟仪式体验。', tag:'捧串 · 等候', stamp:'愿', icon:'beads' },
  { id:'garden', name:'月下乐庭', subtitle:'快乐，也是一种好好休息', deity:'院外的小小音乐会', detail:'这里离开礼拜区域。和在场的人打个招呼，邀请他们或猫狗一起跳舞。随时停下，不需要跳得很好。', tag:'共舞 · 音乐', stamp:'乐', icon:'music' },
] as const;
export type AreaId = typeof AREAS[number]['id'];
export const ROOMS = [{ id:'ginkgo',name:'银杏院' },{id:'moon',name:'月光院'},{id:'breeze',name:'清风院'}];
export const COLORS = [{id:'sage',name:'松绿',hex:'#76927a'},{id:'rose',name:'藕荷',hex:'#bb8c91'},{id:'gold',name:'杏黄',hex:'#d3aa62'},{id:'blue',name:'月白',hex:'#8cabb8'}];
export const BRACELETS = [{id:'sandal',name:'檀木暖棕',hex:'#af703e',wish:'愿你从容，心有安处。'},{id:'jade',name:'青玉微光',hex:'#80a596',wish:'愿你平安，日日有晴。'},{id:'rose',name:'莲粉清梦',hex:'#d8a2a5',wish:'愿你被爱，也记得爱自己。'}];
export const PETS = [{id:'orange',name:'柿子',kind:'橘猫',type:'cat',color:'#d49854'},{id:'white',name:'糯米',kind:'白猫',type:'cat',color:'#eee7d5'},{id:'dog',name:'来福',kind:'小黄狗',type:'dog',color:'#caa477'}];
export const MATS = Array.from({length:12},(_,i)=>({x:(i%4-1.5)*2.7,z:Math.floor(i/4)*2.5-1.8}));
export const DRINKS=[{id:'osmanthus',name:'桂花乌龙奶茶',note:'桂香轻甜 · 温热',color:'#d8bd87'},{id:'latte',name:'松风拿铁',note:'咖啡与绵密奶香',color:'#ac8262'},{id:'tea',name:'桂花清茶',note:'清茶一盏 · 无奶',color:'#b99958'},{id:'plum',name:'青梅冷萃',note:'青梅微酸 · 清凉',color:'#a5b68b'}];
export const BENCHES=[{id:100,x:6.05,z:8.6,yaw:Math.PI/2,name:'茶桌西座'},{id:101,x:7.95,z:8.6,yaw:-Math.PI/2,name:'茶桌东座'},{id:102,x:10,z:5,yaw:-Math.PI/2,name:'东廊听风'},{id:103,x:10,z:8,yaw:-Math.PI/2,name:'东廊树影'},{id:104,x:-6.4,z:9.8,yaw:Math.PI,name:'听荷池畔'},{id:105,x:-10,z:9,yaw:Math.PI/2,name:'西廊晚照'}];
export const LANTERN_WISHES=['愿家人平安','愿心有所安','愿相遇皆暖','愿明日从容'];
