import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {simplify, prune, meshopt} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
for (const name of (process.argv.slice(2).length ? process.argv.slice(2) : ['seated-buddha', 'gilded-buddha'])) {
  const doc = await io.read(`public/models/${name}.glb`);
  await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:.16,error:.002}),prune(),meshopt({encoder:MeshoptEncoder,level:'high'}));
  await io.write(`public/models/${name}-lod.glb`,doc);
  console.log(name,doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+(p.getIndices()?.getCount()||0)/3,0),'triangles');
}
