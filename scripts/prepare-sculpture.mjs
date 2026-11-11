import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, simplify, prune, textureCompress, meshopt, compactPrimitive } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs/promises';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder,
});
const name=process.argv[2] || 'seated-buddha';
const doc = await io.read('../asset-sources/'+name+'-source.glb');
// Remove the scanned museum support below the lotus, not the sculpture itself.
if (name === 'shakyamuni') {
  const entries=[]; let min=Infinity,max=-Infinity;
  for(const node of doc.getRoot().listNodes()) for(const prim of node.getMesh()?.listPrimitives() || []) {
    const pos=prim.getAttribute('POSITION'), matrix=node.getWorldMatrix();
    const ys=Array.from({length:pos.getCount()},(_,i)=>{const p=pos.getElement(i,[]);return matrix[1]*p[0]+matrix[5]*p[1]+matrix[9]*p[2]+matrix[13];});
    for(const y of ys){min=Math.min(min,y);max=Math.max(max,y);} entries.push({prim,ys});
  }
  const cutoff=min+(max-min)*.18;
  for(const {prim,ys} of entries){
    const indices=prim.getIndices(), old=indices.getArray(), kept=[];
    for(let i=0;i<old.length;i+=3)if(ys[old[i]]>=cutoff&&ys[old[i+1]]>=cutoff&&ys[old[i+2]]>=cutoff)kept.push(old[i],old[i+1],old[i+2]);
    prim.setIndices(indices.clone().setArray(new Uint32Array(kept))); compactPrimitive(prim);
  }
}
await doc.transform(dedup(), weld(), simplify({simplifier:MeshoptSimplifier,ratio:Number(process.argv[3] || .055),error:.001}), prune(),
  textureCompress({encoder:sharp, targetFormat:'webp', resize:[2048,2048]}),
  meshopt({encoder:MeshoptEncoder,level:'high'}));
await fs.mkdir('public/models',{recursive:true});
await io.write('public/models/'+name+'.glb',doc);
console.log(JSON.stringify({bytes:(await fs.stat('public/models/'+name+'.glb')).size,
  triangles:doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((sum,p)=>sum+(p.getIndices()?.getCount()||0)/3,0)}));
