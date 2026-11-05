import assert from 'node:assert/strict';
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:5198';
const accounts=[];
async function call(op,session={},extra={},status=200){const r=await fetch(base+'/api/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...session,op,...extra})});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
try{
 const a=await call('join',{}, {room:'moon'}),b=await call('join',{}, {room:'moon'}),c=await call('join',{}, {room:'breeze'});accounts.push(a,b,c);
 let s=await call('beat',a,{area:'main',x:2,z:3,seat:0,action:'bow'});assert(s.peers.some(p=>p.id===b.id));assert(!s.peers.some(p=>p.id===c.id));assert(s.peers.every(p=>!('token'in p)));
 await call('beat',b,{area:'main',seat:0,action:'bow'},409);
 await call('beat',{...a,token:'forged'}, {},401);
 await call('beat',b,{area:'main',seat:1,action:'kneel'});
 await call('beat',a,{area:'garden',seat:null,action:'dance'});
 await call('invite',a,{area:'garden',action:'dance'});
 s=await call('beat',b,{area:'garden'});assert(s.peers.find(p=>p.id===a.id).invite_at>0);
 const {ticket}=await call('ticket',a,{color:'jade'});const again=await call('ticket',a,{color:'jade'});assert.equal(again.ticket.id,ticket.id);
 await call('complete',a,{ticket:ticket.id},409);await call('cancelTicket',a);
 const {ticket:t}=await call('ticket',a,{color:'sandal'});
 console.log('PASS: real room isolation, authenticated presence, unique seats, invite and idempotent queue. Waiting for real ritual timer.');
 while(Date.now()<t.ends+100){await call('beat',a,{area:'bracelet',action:'bracelet',seat:0});await new Promise(r=>setTimeout(r,2500));}
 const done=await call('complete',a,{ticket:t.id});assert.equal(done.ticket.completed,1);assert.equal((await call('complete',a,{ticket:t.id})).ticket.id,t.id);
 console.log('PASS: timed ceremony completion and repeat collection idempotence.');
}finally{for(const a of accounts)await call('leave',a).catch(()=>{});}
