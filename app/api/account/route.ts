import { env } from 'cloudflare:workers';
const out=(v:unknown,status=200,cookie?:string)=>Response.json(v,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function token(req:Request){return req.headers.get('cookie')?.match(/(?:^|;\s*)yh_account=([^;]+)/)?.[1]||'';}
function cookie(req:Request,value:string,age=604800){return `yh_account=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
export async function GET(req:Request){if(!env.DB)return out({error:'账户服务暂不可用'},503);const t=token(req);if(!t)return out({user:null});const user=await env.DB.prepare('SELECT a.email,a.verified FROM accounts a JOIN account_sessions s ON s.account=a.id WHERE s.token=? AND s.expires>?').bind(await hash(t),Date.now()).first();return out({user});}
export async function POST(req:Request){if(!env.DB)return out({error:'账户服务暂不可用'},503);
 if(req.headers.get('origin')!==new URL(req.url).origin)return out({error:'请求来源不匹配'},403);
 try{
 const raw=await req.text();if(raw.length>4096)return out({error:'请求过长'},413);const b=JSON.parse(raw);
 if(b.op==='logout'){await env.DB.prepare('DELETE FROM account_sessions WHERE token=?').bind(await hash(token(req))).run();return out({ok:true},200,cookie(req,'',0));}
 const email=typeof b.email==='string'?b.email.trim().toLowerCase():'';const password=typeof b.password==='string'?b.password:'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return out({error:'请输入完整的邮箱地址'},400);
 if(password.length<10||password.length>128)return out({error:'密码需要 10–128 个字符'},400);
 if(!['register','login'].includes(b.op))return out({error:'未知操作'},400);
 const now=Date.now(),bucket=await hash(email+'|'+(req.headers.get('cf-connecting-ip')||'local'));
 await env.DB.prepare('DELETE FROM account_attempts WHERE created<?').bind(now-900000).run();
 const attempts=await env.DB.prepare('SELECT COUNT(*) AS n FROM account_attempts WHERE bucket=?').bind(bucket).first<{n:number}>();if((attempts?.n||0)>=8)return out({error:'尝试次数较多，请 15 分钟后再试'},429);
 await env.DB.prepare('INSERT INTO account_attempts(bucket,created) VALUES(?,?)').bind(bucket,now).run();
 let user=await env.DB.prepare('SELECT * FROM accounts WHERE email=?').bind(email).first<{id:string;email:string;salt:string;password:string}>();
 if(b.op==='register'){
 if(user)return out({error:'这个邮箱无法重复注册，请尝试登录'},409);
 const salt=crypto.randomUUID(),id=crypto.randomUUID(),digest=await passwordHash(password,salt);
 await env.DB.prepare('INSERT INTO accounts(id,email,salt,password,verified,created) VALUES(?,?,?,?,0,?)').bind(id,email,salt,digest,now).run();user={id,email,salt,password:digest};
 }else{const digest=await passwordHash(password,user?.salt||'missing-account');let diff=0;const expected=user?.password||'0'.repeat(64);for(let i=0;i<64;i++)diff|=digest.charCodeAt(i)^expected.charCodeAt(i);if(!user||diff)return out({error:'邮箱或密码不正确'},401);}
 const session=crypto.randomUUID()+crypto.randomUUID();await env.DB.prepare('DELETE FROM account_sessions WHERE expires<?').bind(now).run();await env.DB.prepare('INSERT INTO account_sessions(token,account,expires) VALUES(?,?,?)').bind(await hash(session),user.id,now+604800000).run();
 return out({user:{email:user.email,verified:0}},200,cookie(req,session));
 }catch{return out({error:'账户服务暂时不可用，请稍后再试'},503);}
}

