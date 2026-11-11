import fs from 'node:fs/promises';
import sharp from 'sharp';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const root='public/textures/landscape';await fs.mkdir(root,{recursive:true});
const manifest=[];
for(const [asset,name] of [['forrest_ground_01','forest'],['rock_tile_floor','stone']]){
 const meta=await(await fetch('https://api.polyhaven.com/files/'+asset)).json();
 for(const [channel,out] of [['Diffuse','color'],['nor_gl','normal'],['Rough','roughness']]){
  const item=meta[channel]?.['1k']?.jpg;if(!item)throw new Error('Missing '+asset+' '+channel);
  try{await fs.access(root+'/'+name+'-'+out+'.webp');manifest.push({asset,channel,source:item.url,file:name+'-'+out+'.webp'});console.log('cached',name,out);continue;}catch{}
  const temp=root+'/'+name+'-'+out+'-source.jpg';
  await run('curl.exe',['-f','-L','--retry','2','--connect-timeout','15','--max-time','90','-o',temp,item.url]);
  const buffer=await fs.readFile(temp);await sharp(buffer).webp({quality:out==='normal'?93:88}).toFile(root+'/'+name+'-'+out+'.webp');
  manifest.push({asset,channel,source:item.url,file:name+'-'+out+'.webp'});console.log(name,out,buffer.length);
 }
}
await fs.writeFile(root+'/sources.json',JSON.stringify({license:'CC0',provider:'Poly Haven',assets:manifest},null,2));
