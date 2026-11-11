import * as THREE from 'three';

// Original tile/wood/plaster surfaces; small variation rather than flat toy colors.
export function surface(kind,color){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle=color;x.fillRect(0,0,512,512);
  let seed=741;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<18000;i++){const v=rand()>.5?255:0;x.fillStyle=`rgba(${v},${v},${v},${kind==='wood'?.008:.015})`;x.fillRect(rand()*512,rand()*512,1+rand()*3,kind==='wood'?15+rand()*90:1+rand()*3);}
  if(kind==='tile')for(let y=0;y<512;y+=64){
    const grad=x.createLinearGradient(0,y,0,y+64);grad.addColorStop(0,'#00000038');grad.addColorStop(.15,'#ffffff18');grad.addColorStop(1,'#00000008');x.fillStyle=grad;x.fillRect(0,y,512,64);
    x.strokeStyle='#1b241b70';x.lineWidth=2;x.beginPath();x.moveTo(0,y+62);x.lineTo(512,y+62);x.stroke();
  }
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
  const bump=map.clone();bump.colorSpace=THREE.NoColorSpace;bump.needsUpdate=true;
  return new THREE.MeshStandardMaterial({map,bumpMap:bump,bumpScale:kind==='plaster'?.008:kind==='wood'?.003:.009,roughness:kind==='tile'?.66:.88,color:'#ffffff'});
}
