import assert from 'node:assert/strict';
const base='http://127.0.0.1:5198';const sessions=[];
async function call(op,s={},extra={},status=200){const r=await fetch(base+'/api/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...s,op,...extra})});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
try{
const a=await call('join',{}, {room:'moon'}),b=await call('join',{}, {room:'moon'}),c=await call('join',{}, {room:'breeze'});sessions.push(a,b,c);
await call('beat',a,{area:'court',seat:100,action:'rest'});await call('beat',b,{area:'court',seat:100,action:'rest'},409);await call('beat',a,{area:'court',seat:null});await call('beat',b,{area:'court',seat:100,action:'rest'});
const {round}=await call('lanternRound',a);assert.equal((await call('lanternRound',b)).round.id,round.id);
await call('releaseLantern',a,{round:round.id,wish:'愿家人平安'});await call('releaseLantern',b,{round:round.id,wish:'愿心有所安'});await call('releaseLantern',a,{wish:'愿家人平安'},429);
await call('releaseLantern',c,{round:round.id,wish:'愿家人平安'},409);await call('releaseLantern',{...a,token:'forged'},{wish:'愿家人平安'},401);
const pa=await call('beat',a,{area:'court'}),pb=await call('beat',b,{area:'court'}),pc=await call('beat',c,{area:'court'});assert.deepEqual(pa.lanterns,pb.lanterns);assert(pa.lanterns.filter(l=>l.starts===round.starts).length>=2);assert(!pc.lanterns.some(l=>pa.lanterns.some(x=>x.id===l.id)));
console.log('PASS: bench occupancy and release, shared launch time, authenticated lanterns, room isolation, rate limit.');
}finally{for(const s of sessions)await call('leave',s).catch(()=>{});}
