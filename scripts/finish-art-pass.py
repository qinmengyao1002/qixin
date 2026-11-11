from pathlib import Path
p=Path('app/world.js');s=p.read_text(encoding='utf-8')
s=s.replace("ctx.fillStyle='#716052'", "ctx.fillStyle='#4d4036'")
s=s.replace("[0,4,-12],[24,8,.4],'#54433a'", "[0,4,-12],[24,8,.4],'#372d28'")
s=s.replace("[0,3.7,0],[3.05,5.9,.06],'#3f5147'", "[0,3.7,0],[3.05,5.9,.06],'#263d38'")
# Carved wood altar facing; repetitive architectural detail rather than toy geometry.
needle="  for(const x of [-3.3,0,3.3]){const panel="
insert="""  for(let x=-4.7;x<=4.8;x+=1.18){mesh(parent,'round',[x,.39,-6.65],[.98,.42,.045],'#372d24');for(const side of [-1,1])mesh(parent,'box',[x+side*.43,.39,-6.61],[.025,.35,.025],'#8e754b');}
  for(const x of [-3.35,0,3.35]){const r=x===0?1.65:1.3;const base=group(parent,[x,.89,-8.6]);mesh(base,'cylinder',[0,.14,0],[r,.28,r*.73],'#725637',.35);mesh(base,'cylinder',[0,.3,0],[r*1.03,.10,r*.76],'#af8e52',.5);}
"""
s=s.replace(needle,insert+needle)
s=s.replace("mountSculpture(parent,x,.9,-8.6", "mountSculpture(parent,x,1.24,-8.6")
s=s.replace("function buddha(parent", "function disposeTree(root){root.traverse(o=>{if(!o.isMesh&&!o.isSprite)return;if(o.geometry&&!Object.values(sharedGeo).includes(o.geometry))o.geometry.dispose();for(const m of(Array.isArray(o.material)?o.material:[o.material])){if([...materials.values()].includes(m))continue;for(const key of ['map','normalMap','roughnessMap','metalnessMap','aoMap'])m[key]?.dispose();m.dispose();}});}\nfunction buddha(parent")
a=s.index('    const old=stage;scene.remove(old);old.traverse(');b=s.index('\n    clearSelection()',a)
s=s[:a]+"    const old=stage;scene.remove(old);disposeTree(old);"+s[b:]
s=s.replace("for(const o of [...stage.children])if(!keep.has(o))stage.remove(o);", "for(const o of [...stage.children])if(!keep.has(o)){stage.remove(o);disposeTree(o);}")
s=s.replace("  const renderer=new THREE.WebGLRenderer", "  const assetError=e=>onEvent({type:'hint',text:e.detail});window.addEventListener('sanctuary-asset-error',assetError);\n  const renderer=new THREE.WebGLRenderer")
s=s.replace("dispose(){disposed=true;", "dispose(){disposed=true;window.removeEventListener('sanctuary-asset-error',assetError);")
p.write_text(s,encoding='utf-8')
