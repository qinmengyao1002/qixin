import { env } from 'cloudflare:workers';
import { AREAS, ROOMS, COLORS, BRACELETS } from '../../data';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
const ttl=90000;
const names=['慢慢来','一片银杏','小小云朵','晚风来信','今天也好','山间小鹿','松间月','自在小鱼'];
const allowed=new Set(['idle','walk','kneel','bow','greet','dance','bracelet','beads','pet']);
type Row={id:string;token:string;room:string;area:string;seen:number;seat:number|null};
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
      if(!ticket||ticket.ends>now||me.area!=='bracelet')return json({error:'请回手串小院，等本场仪式结束再领取。'},409);
      await db.prepare('UPDATE tickets SET completed=1 WHERE id=?').bind(ticket.id).run();return json({ticket:{...ticket,completed:1}});
    }
    const area=AREAS.some(a=>a.id===b.area)?b.area:me.area;
    const action=allowed.has(b.action)?b.action:'idle';
    const seat=Number.isInteger(b.seat)&&b.seat>=0&&b.seat<12?b.seat:null;
    const pos=(v:unknown,limit:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(-limit,Math.min(limit,v)):0;
    const invite=b.op==='invite'&&area==='garden'?now:0;
    try {
      await db.prepare('UPDATE visitors SET area=?,x=?,z=?,yaw=?,action=?,color=?,seat=?,seen=?,invite_at=CASE WHEN ?>0 THEN ? ELSE invite_at END WHERE id=?').bind(area,pos(b.x,12),pos(b.z,11),pos(b.yaw,Math.PI*2),action,COLORS.some(c=>c.id===b.color)?b.color:'sage',seat,now,invite,invite,me.id).run();
    }catch(e){ if(String(e).includes('UNIQUE'))return json({error:'这方蒲团有人了，旁边还有空位。',seatTaken:true},409);throw e; }
    const peers=await db.prepare('SELECT id,name,color,area,x,z,yaw,action,seat,invite_at FROM visitors WHERE room=? AND id<>?').bind(me.room,me.id).all();
    const rooms=await db.prepare('SELECT room,COUNT(*) AS count FROM visitors GROUP BY room').all();
    const queued=await db.prepare('SELECT COUNT(*) AS count FROM tickets WHERE room=? AND completed=0 AND ends>?').bind(me.room,now).first();
    return json({peers:peers.results,rooms:rooms.results,queued:Number(queued?.count||0),serverTime:now});
  }catch(e){ console.error('visit:',e instanceof Error?e.message:'database error'); return json({error:'小院正在整理，请稍后重试。'},503); }
}
