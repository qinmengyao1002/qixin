export const AREAS = [
  { id:'court', name:'银杏前庭', subtitle:'风吹叶落，先慢下来', deity:'一方树荫，几位新朋友', detail:'沿朱墙散步，摸摸院里的猫狗。正前方通往雍和宫殿，带着好奇心随意逛逛。', tag:'散步 · 猫狗', stamp:'杏', icon:'leaf' },
  { id:'main', name:'雍和宫殿', subtitle:'把今天的心事，轻轻放下', deity:'三世佛', detail:'雍和宫殿内供奉三世佛：释迦牟尼佛、燃灯佛与弥勒佛。这里以风格化造像表达，点一方蒲团，安静礼拜。', tag:'三世佛 · 礼拜', stamp:'和', icon:'temple' },
  { id:'yongyou', name:'永佑殿', subtitle:'愿牵挂的人，都好好的', deity:'无量寿佛、药师佛、狮吼佛', detail:'永佑殿供奉无量寿佛、药师佛和狮吼佛。你可以在这里坐一会儿，把祝愿留给牵挂的人。', tag:'静坐 · 祝愿', stamp:'佑', icon:'temple' },
  { id:'falun', name:'法轮殿', subtitle:'一念清明，一步从容', deity:'宗喀巴大师', detail:'法轮殿融合汉藏建筑元素，正中供奉宗喀巴大师像。小院保留金顶与黄帽造像的视觉线索。', tag:'金顶 · 静心', stamp:'慧', icon:'temple' },
  { id:'wanfu', name:'万福阁', subtitle:'抬头看看，也给自己一点勇气', deity:'弥勒立像', detail:'万福阁以重檐楼阁和巨大的白檀木弥勒立像闻名。小院以三重金檐、立像和两侧飞廊为灵感。', tag:'重檐 · 仰望', stamp:'福', icon:'temple' },
  { id:'bracelet', name:'手串小院', subtitle:'捧着小小的心愿，等一会儿', deity:'手串开光体验', detail:'选一串喜欢的珠子，捧在手心跪候。等候期间可以去其他院落散步，轮到你时会提醒。这里是虚拟仪式体验。', tag:'捧串 · 等候', stamp:'愿', icon:'beads' },
  { id:'garden', name:'月下乐庭', subtitle:'快乐，也是一种好好休息', deity:'院外的小小音乐会', detail:'这里离开礼拜区域。和在场的人打个招呼，邀请他们或猫狗一起跳舞。随时停下，不需要跳得很好。', tag:'共舞 · 音乐', stamp:'乐', icon:'music' },
] as const;
export type AreaId = typeof AREAS[number]['id'];
export const ROOMS = [{ id:'ginkgo',name:'银杏院' },{id:'moon',name:'月光院'},{id:'breeze',name:'清风院'}];
export const COLORS = [{id:'sage',name:'松绿',hex:'#76927a'},{id:'rose',name:'藕荷',hex:'#bb8c91'},{id:'gold',name:'杏黄',hex:'#d3aa62'},{id:'blue',name:'月白',hex:'#8cabb8'}];
export const BRACELETS = [{id:'sandal',name:'檀木暖棕',hex:'#af703e',wish:'愿你从容，心有安处。'},{id:'jade',name:'青玉微光',hex:'#80a596',wish:'愿你平安，日日有晴。'},{id:'rose',name:'莲粉清梦',hex:'#d8a2a5',wish:'愿你被爱，也记得爱自己。'}];
export const PETS = [{id:'orange',name:'柿子',kind:'橘猫',type:'cat',color:'#d49854'},{id:'white',name:'糯米',kind:'白猫',type:'cat',color:'#eee7d5'},{id:'dog',name:'来福',kind:'小黄狗',type:'dog',color:'#caa477'}];
export const MATS = Array.from({length:12},(_,i)=>({x:(i%4-1.5)*2.7,z:Math.floor(i/4)*2.5-1.8}));
