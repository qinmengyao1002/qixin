import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const sources = new Map();
export function loadSculpture(kind = 'seated', low = false) {
  const key=kind+(low?'-lod':'');
  let source = sources.get(key);
  if (!source) source = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    .loadAsync('/models/'+(kind === 'standing'?'gilded-buddha':kind === 'seated'?'seated-buddha':kind)+(low?'-lod':'')+'.glb').then(gltf => gltf.scene)
    .catch(error => { sources.delete(key); throw error; });
  sources.set(key, source);
  return source;
}

// Every instance owns its geometry/materials so area disposal cannot invalidate
// the cached source or statues being loaded into another room.
export function mountSculpture(parent, x, y, z, height, kind = 'seated', appearance = 'original') {
  const holder = new THREE.LOD();
  holder.position.set(x, y, z);
  parent.add(holder);
  const mountLevel = (source, distance) => {
    let root = parent;
    while (root.parent) root = root.parent;
    if (!root.isScene) return;
    const model = source.clone(true);
    // Scan coordinate frames differ; orient before measuring the display bounds.
    if (kind === 'shakyamuni' || kind === 'medicine-buddha') model.rotation.y -= Math.PI / 2;
    model.updateMatrixWorld(true);
    model.traverse(o => {
      if (!o.isMesh) return;
      o.geometry = o.geometry.clone();
      o.material = o.material.clone();
      for (const key of ['map','normalMap','roughnessMap','metalnessMap','aoMap']) {
        if (o.material[key]) o.material[key] = o.material[key].clone();
      }
      const legacy = kind === 'standing' || kind === 'seated';
      o.material.metalness = legacy ? (kind === 'standing' ? .3 : .55) : Math.min(o.material.metalness,.35);
      o.material.roughness = legacy ? .45 : Math.max(o.material.roughness,.48);
      o.material.envMapIntensity = .7;
      if (legacy && !o.material.map) o.material.color.set('#b68b42');
      o.castShadow = true;
      o.receiveShadow = true;
    });
    const box = new THREE.Box3().setFromObject(model, true);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // A reversible painted finish, guided by the blue hair / gilded face in
    // Yonghe's documented seated figures. Geometry remains the credited scan.
    if (['yonghe','medicine','longevity'].includes(appearance) && kind === 'seated') {
      const gold = new THREE.Color('#bfa062'), blue = new THREE.Color('#263e4c');
      const point = new THREE.Vector3(), color = new THREE.Color();
      model.traverse(o => {
        if (!o.isMesh || o.material.map) return;
        const positions = o.geometry.getAttribute('position');
        const colors = new Float32Array(positions.count * 3);
        for (let i=0;i<positions.count;i++) {
          point.fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld);
          const relativeY=(point.y-box.min.y)/size.y;
          const amount=THREE.MathUtils.smoothstep(relativeY,.852,.868);
          color.copy(gold).lerp(blue,amount);
          color.toArray(colors,i*3);
        }
        o.geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
        o.material.color.set('#ffffff');o.material.vertexColors=true;
        o.material.roughness=.48;o.material.metalness=.5;
      });
    }
    const scale = height / size.y;
    model.scale.multiplyScalar(scale);
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    holder.addLevel(model,distance,.15);
  };
  loadSculpture(kind,true).then(source=>mountLevel(source,28)).catch(()=>{});
  loadSculpture(kind).then(source=>mountLevel(source,0)).catch(error => {
    console.error('佛像模型加载失败', error);
    window.dispatchEvent(new CustomEvent('sanctuary-asset-error', {detail:'佛像暂未加载成功，请刷新后重试。'}));
  });
  return holder;
}
