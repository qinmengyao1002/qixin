import fs from 'node:fs';let s=fs.readFileSync('app/sanctuary.tsx','utf8');const r=(a,b)=>{if(!s.includes(a))throw Error(a.slice(0,100));s=s.replace(a,b);};
r("const [wood,setWood]",`const [target,setTarget]=useState<any>(null),[nearby,setNearby]=useState<any[]>([]),[chooser,setChooser]=useState<'people'|'pets'|null>(null),[interactionText,setInteractionText]=useState(''),[cameraMode,setCameraMode]=useState('follow'),[greeting,setGreeting]=useState<any>(null);
  const seenGestures=useRef(new Set<string>());
  const [wood,setWood]`);
r("if(fresh){lastInvite.current=fresh.invite_at;setInvite(fresh);}",`if(fresh){lastInvite.current=fresh.invite_at;setInvite(fresh);}
    for(const g of data.gestures||[]){if(!seenGestures.current.has(g.id)){seenGestures.current.add(g.id);setGreeting(g);world.current?.receive(g.sender,g.kind);notify(g.name+(g.kind==='dance'?'邀请你一起跳舞':'向你合掌问好'));}}`);
r("if(e.type==='hint')notify(e.text);",`if(e.type==='hint')notify(e.text);
    if(e.type==='selected'){setTarget(e.target);setChooser(null);setInteractionText(e.target?'选一个动作，会自动走到对方面前':'');}
    if(e.type==='nearby')setNearby(e.items);
    if(e.type==='cameraMode')setCameraMode(e.mode);
    if(e.type==='interactionPhase')setInteractionText(e.text);
    if(e.type==='sendGesture')void api('gesture',{target:e.target,kind:e.kind}).catch(err=>notify(err.message));`);
r("function greet(){world.current?.act('greet');sound.current?.bell();notify('向同院的人合掌问好。');}",`function greet(){setChooser('people');setTarget(null);setGuide(false);world.current?.clearSelection();notify('先点一个人，再向 TA 合掌问好。');}
  function choose(id:string){world.current?.select(id);setChooser(null);}
  function withTarget(mode:string){if(!target)return;if(mode==='dance'&&area!=='garden'){notify('礼拜院里保持安静。先到月下乐庭，再邀请同伴跳舞。');return;}world.current?.interact(target.id,mode);if(mode==='dance'&&!audio){setAudio(true);sound.current?.enable(true);}}
  function closeTarget(){world.current?.clearSelection();world.current?.act('idle');setTarget(null);setChooser(null);setInteractionText('');}`);
r("<main className={`sanctuary ${!hud?'zen-mode':''}`}>","<main className={`sanctuary immersive ${!hud?'zen-mode':''}`}>");
r("<button aria-label=\"回到默认视角\" onClick={()=>world.current?.home()}><RotateCcw size={16}/></button>","<button aria-label=\"找到我\" title=\"找到我 · 跟随视角\" onClick={()=>world.current?.home()}><Home size={18}/></button><button aria-label=\"切换全景视角\" title=\"全景 / 跟随\" onClick={()=>cameraMode==='follow'?world.current?.overview():world.current?.home()}><Map size={17}/></button>");
r("<strong>{name}</strong><small>{actionNames[action]||'自在休息'}</small>","<strong>你 · {name}</strong><small>{actionNames[action]||'自在休息'}</small>");
r("<button onClick={()=>setPanel('pets')}><PawPrint/><span>猫猫狗狗</span></button>","<button onClick={()=>{setChooser('pets');setTarget(null);setGuide(false);world.current?.clearSelection();}}><PawPrint/><span>猫猫狗狗</span></button>");
r("{area==='garden'?'音乐在这里，快乐也在这里':'点地漫步，或选一个动作慢慢待着'}", "{target?'已选中 '+target.name:area==='garden'?'点一个同伴，一起跳舞':'点地走路 · 点人物或猫狗，走近互动'}");
r("{guide&&ready&&",`{chooser&&<section className="nearby-card hud" aria-label="选择互动对象"><div className="social-heading"><span>{chooser==='pets'?'院里的毛茸茸':'想和谁打个招呼？'}</span><button aria-label="关闭对象选择" onClick={()=>setChooser(null)}><X size={18}/></button></div><p>点名字选中，脚下的光圈会告诉你是谁。</p><div className="nearby-list">{nearby.filter(p=>chooser==='pets'?p.kind==='pet':p.kind!=='pet').map(p=><button key={p.id} onClick={()=>choose(p.id)}><span className="companion-icon">{p.kind==='pet'?<PawPrint size={20}/>:<HandHeart size={20}/>}</span><span><strong>{p.name}</strong><small>{p.detail}</small></span><span className="distance">{p.distance} 米<ChevronRight size={14}/></span></button>)}</div></section>}
    {target&&<section className="interaction-card hud" aria-label="与选中对象互动"><div className="social-heading"><span><strong>{target.name}</strong><small>{target.detail}</small></span><button aria-label="取消当前互动" onClick={closeTarget}><X size={18}/></button></div><p role="status">{interactionText}</p><div className="context-actions">{target.kind==='pet'?<><button onClick={()=>withTarget('pat')}><Heart size={18}/>走近摸摸</button><button onClick={()=>withTarget('follow')}><Footprints size={18}/>跟随 / 休息</button></>:<button onClick={()=>withTarget('greet')}><HandHeart size={18}/>向 {target.name} 合掌</button>}{area==='garden'&&<button onClick={()=>withTarget('dance')}><Music2 size={18}/>{target.kind==='peer'?'邀请共舞':'一起跳舞'}</button>}</div>{area!=='garden'&&<button className="social-link" onClick={()=>go('garden')}>去月下乐庭，认识跳舞的同伴<ChevronRight size={14}/></button>}</section>}
    {greeting&&now-greeting.created<15000&&<section className="greeting-card hud"><span>{greeting.name}{greeting.kind==='dance'?'邀请你共舞':'向你合掌问好'}</span><button onClick={()=>{world.current?.interact(greeting.sender,greeting.kind);setGreeting(null);}}>回应 TA</button><button aria-label="忽略问好" onClick={()=>setGreeting(null)}><X size={15}/></button></section>}
    {guide&&!chooser&&!target&&ready&&`);
r("点空地走路 · 拖动转视角 · 点蒲团坐下", "深绿色「你」是自己 · 点人或猫狗互动");
r("<strong>慢慢来，这里没有任务</strong>","<strong>先认识一下自己和身边的朋友</strong>");
fs.writeFileSync('app/sanctuary.tsx',s);
