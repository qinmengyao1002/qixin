import { env } from 'cloudflare:workers';
import { AREAS, ROOMS, COLORS, BRACELETS, BENCHES, LANTERN_WISHES } from '../../data';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
const ttl=90000;
const names=['慢慢来','一片银杏','小小云朵','晚风来信','今天也好','山间小鹿','松间月','自在小鱼'];
const allowed=new Set(['idle','walk','kneel','bow','greet','dance','bracelet','beads','pet','rest','drink','incense','lantern','receive']);
type Row={id:string;token:string;room:string;area:string;name:string;x:number;z:number;seen:number;seat:number|null};
async function digest(s:string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join(''); }
export async function POST(req:Request) {
  if(!env.DB) return json({error:'小院连接暂不可用，请稍后重试。'},503);
  if(req.headers.get('origin') && req.headers.get('origin')!==new URL(req.url).origin) return json({error:'请求来源不匹配'},403);
  let b;try { if(Number(req.headers.get('content-length')||0)>4096) return json({error:'请求过长'},413); const raw=await req.text(); if(raw.length>4096)return json({error:'请求过长'},413); b=JSON.parse(raw); }catch{return json({error:'请求格式错误'},400)}
  const db=env.DB, now=Date.now();
  try {
    await db.prepare('DELETE FROM visitors WHERE seen < ?').bind(now-ttl).run();
    if(b.op==='join') {
      const room=ROOMS.some(r=>r.id===b.room)?b.room:'ginkgo';
      const id=crypto.randomUUID(),token=crypto.randomUUID();
      const color=COLORS.some(c=>c.id===b.color)?b.color:'sage';
      const name=names[Math.floor(Math.random()*names.length)];
      const result=await db.prepare("INSERT INTO visitors(id,token,room,area,name,color,x,z,yaw,action,seen,invite_at) SELECT ?,?,?, 'court',?,?,0,7,0,'idle',?,0 WHERE (SELECT COUNT(*) FROM visitors WHERE room=?) < 24").bind(id,await digest(token),room,name,color,now,room).run();
      if(!result.meta.changes)return json({error:'这个小院坐满了，换一个院子试试。'},409);
      return json({id,token,name,room});
    }
    if(typeof b.id!=='string'||typeof b.token!=='string')return json({error:'请重新进入小院'},401);
    const me=await db.prepare('SELECT * FROM visitors WHERE id=? AND token=?').bind(b.id,await digest(b.token)).first<Row>();
    if(!me)return json({error:'连接已休息，请重新进入。'},401);
    if(b.op==='leave') { await db.prepare('DELETE FROM visitors WHERE id=?').bind(me.id).run();return json({ok:true}); }
    if(b.op==='gesture') {
      if(!['greet','dance'].includes(b.kind)||typeof b.target!=='string'||b.target===me.id)return json({error:'请选择身边的另一位访客'},400);
      const other=await db.prepare('SELECT * FROM visitors WHERE id=? AND room=? AND area=?').bind(b.target,me.room,me.area).first<Row>();
      if(!other||Math.hypot(other.x-me.x,other.z-me.z)>3.5)return json({error:'对方走远了，请再走近一点。'},409);
      if(b.kind==='dance'&&me.area!=='garden')return json({error:'请到月下乐庭再邀请共舞。'},409);
      const recent=await db.prepare('SELECT id FROM gestures WHERE sender=? AND created>?').bind(me.id,now-2500).first();
      if(recent)return json({error:'问候已送出，给对方一点回应时间。'},429);
      await db.prepare('INSERT INTO gestures(id,sender,target,room,area,name,kind,created) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),me.id,other.id,me.room,me.area,me.name,b.kind,now).run();
      return json({ok:true});
    }
    if(b.op==='lanternRound'||b.op==='releaseLantern') {
      if(!['court','bracelet','garden'].includes(me.area))return json({error:'请先回到院落的荷池旁。'},409);
      if(b.op==='lanternRound') {
        await db.prepare('INSERT INTO lantern_rounds(id,room,area,name,starts) VALUES(?,?,?,?,?) ON CONFLICT(room,area) DO UPDATE SET id=excluded.id,name=excluded.name,starts=excluded.starts WHERE lantern_rounds.starts<?').bind(crypto.randomUUID(),me.room,me.area,me.name,now+20000,now-15000).run();
        const round=await db.prepare('SELECT * FROM lantern_rounds WHERE room=? AND area=?').bind(me.room,me.area).first();
        return json({round});
      }
      if(!LANTERN_WISHES.includes(b.wish))return json({error:'请选择一句祝愿。'},400);
      const recent=await db.prepare('SELECT id FROM river_lanterns WHERE visitor=? AND created>?').bind(me.id,now-10000).first();
      if(recent)return json({error:'让这盏灯先漂远一点，十秒后再放下一盏。'},429);
      let starts=now+4200;
      if(b.round){const round=await db.prepare('SELECT starts FROM lantern_rounds WHERE id=? AND room=? AND area=?').bind(b.round,me.room,me.area).first<{starts:number}>();if(!round||round.starts<=now)return json({error:'这一场已放灯，可以发起下一场。'},409);starts=round.starts;}
      const result=await db.prepare('INSERT INTO river_lanterns(id,visitor,room,area,name,wish,starts,created) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM river_lanterns WHERE room=? AND area=? AND starts>?)<48 AND NOT EXISTS(SELECT 1 FROM river_lanterns WHERE visitor=? AND created>?)').bind(crypto.randomUUID(),me.id,me.room,me.area,me.name,b.wish,starts,now,me.room,me.area,now-180000,me.id,now-10000).run();
      if(!result.meta.changes)return json({error:'池中的灯已经很多了，请稍候再来。'},429);
      return json({ok:true,starts});
    }
    if(b.op==='ticket') {
      const existing=await db.prepare('SELECT * FROM tickets WHERE visitor=? AND completed=0 AND ends>?').bind(me.id,now-180000).first();
      if(existing)return json({ticket:existing});
      if(!BRACELETS.some(c=>c.id===b.color))return json({error:'请选择一种手串'},400);
      const starts=Math.ceil((now+10000)/45000)*45000;
      const ticket={id:crypto.randomUUID(),color:b.color,starts,ends:starts+15000,completed:0};
      await db.prepare('INSERT INTO tickets(id,visitor,room,color,starts,ends,completed) VALUES(?,?,?,?,?,?,0)').bind(ticket.id,me.id,me.room,ticket.color,starts,ticket.ends).run();
      return json({ticket});
    }
    if(b.op==='cancelTicket') { await db.prepare('DELETE FROM tickets WHERE visitor=? AND completed=0').bind(me.id).run();return json({ok:true}); }
    if(b.op==='complete') {
      const ticket=await db.prepare('SELECT * FROM tickets WHERE id=? AND visitor=?').bind(b.ticket,me.id).first<{id:string;color:string;ends:number;completed:number}>();
      if(!ticket||ticket.ends>now||me.area!=='bracelet')return json({error:'请回结缘小院，等本场仪式结束再领取。'},409);
      await db.prepare('UPDATE tickets SET completed=1 WHERE id=?').bind(ticket.id).run();return json({ticket:{...ticket,completed:1}});
    }
    const area=AREAS.some(a=>a.id===b.area)?b.area:me.area;
    const action=allowed.has(b.action)?b.action:'idle';
    const seat=Number.isInteger(b.seat)&&((b.seat>=0&&b.seat<12)||(BENCHES.some(s=>s.id===b.seat)&&['court','bracelet','garden'].includes(area)))?b.seat:null;
    const pos=(v:unknown,limit:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(-limit,Math.min(limit,v)):0;
    const invite=b.op==='invite'&&area==='garden'?now:0;
    try {
      await db.prepare('UPDATE visitors SET area=?,x=?,z=?,yaw=?,action=?,color=?,seat=?,seen=?,invite_at=CASE WHEN ?>0 THEN ? ELSE invite_at END WHERE id=?').bind(area,pos(b.x,12),pos(b.z,11),pos(b.yaw,Math.PI*2),action,COLORS.some(c=>c.id===b.color)?b.color:'sage',seat,now,invite,invite,me.id).run();
    }catch(e){ if(String(e).includes('UNIQUE'))return json({error:'这个座位有人了，旁边还有空位。',seatTaken:true},409);throw e; }
    const peers=await db.prepare('SELECT id,name,color,area,x,z,yaw,action,seat,invite_at FROM visitors WHERE room=? AND id<>?').bind(me.room,me.id).all();
    const rooms=await db.prepare('SELECT room,COUNT(*) AS count FROM visitors GROUP BY room').all();
    const queued=await db.prepare('SELECT COUNT(*) AS count FROM tickets WHERE room=? AND completed=0 AND ends>?').bind(me.room,now).first();
    await db.prepare('DELETE FROM gestures WHERE created<?').bind(now-30000).run();
    const gestures=await db.prepare('SELECT id,sender,name,kind,created FROM gestures WHERE target=? AND room=? AND area=? AND created>? ORDER BY created').bind(me.id,me.room,area,now-15000).all();
    await db.prepare('DELETE FROM river_lanterns WHERE starts<?').bind(now-180000).run();
    const lanterns=await db.prepare('SELECT id,area,name,wish,starts FROM river_lanterns WHERE room=? AND starts>? ORDER BY starts LIMIT 144').bind(me.room,now-180000).all();
    const lanternRound=await db.prepare('SELECT * FROM lantern_rounds WHERE room=? AND area=? AND starts>?').bind(me.room,area,now).first();
    return json({lanterns:lanterns.results,lanternRound,peers:peers.results,rooms:rooms.results,gestures:gestures.results,queued:Number(queued?.count||0),serverTime:now});
  }catch(e){ console.error('visit:',e instanceof Error?e.message:'database error'); return json({error:'小院正在整理，请稍后重试。'},503); }
}
