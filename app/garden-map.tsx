'use client';
import {useState,useRef} from 'react';
import {Coffee,Flame,Flower2,PawPrint,Music2,Armchair,HandHeart,Gift,Church,MapPin,Disc3} from 'lucide-react';
import type {AreaId} from './data';
export type MapDestination={id:string;name:string;note:string;area:AreaId;panel?:string;x:number;y:number;icon:typeof Coffee};
const destinations:MapDestination[]=[
 {id:'wanfu',name:'慈愿阁',note:'弥勒造像碑 · 观像',area:'wanfu',x:300,y:78,icon:Church},
 {id:'falun',name:'药师殿',note:'药师佛主题 · 静心',area:'falun',x:300,y:150,icon:Church},
 {id:'yongyou',name:'净愿殿',note:'阿弥陀佛 · 静坐祝愿',area:'yongyou',x:300,y:222,icon:Church},
 {id:'main',name:'礼佛殿',note:'释迦牟尼佛 · 礼拜',area:'main',x:300,y:305,icon:HandHeart},
 {id:'bracelet',name:'结缘小院',note:'选手串 · 捧串等候',area:'bracelet',panel:'bracelet',x:108,y:263,icon:Gift},
 {id:'dance',name:'月下乐庭',note:'和朋友、猫狗一起跳舞',area:'garden',x:515,y:332,icon:Music2},
 {id:'incense',name:'取香台与香炉',note:'台前取香 · 缓缓插香',area:'court',panel:'incense',x:300,y:388,icon:Flame},
 {id:'pond',name:'听荷池 · 放莲灯',note:'观锦鲤 · 独自或一起放灯',area:'court',panel:'lantern',x:153,y:457,icon:Flower2},
 {id:'cafe',name:'桂隐茶咖',note:'桂花奶茶 · 咖啡 · 清茶',area:'court',panel:'cafe',x:450,y:448,icon:Coffee},
 {id:'pets',name:'银杏树下',note:'摸摸猫狗 · 一起散步',area:'court',panel:'pets',x:205,y:540,icon:PawPrint},
 {id:'rest',name:'廊下与茶桌',note:'选一处空座，喝茶歇脚',area:'court',panel:'rest',x:428,y:540,icon:Armchair},
 {id:'woodfish',name:'敲木鱼',note:'礼佛殿内的安静时刻',area:'main',panel:'woodfish',x:394,y:302,icon:Disc3},
];
function Roof({x,y,w=120,name}:{x:number;y:number;w?:number;name?:string}){return <g transform={`translate(${x} ${y})`}>
 <ellipse cy="27" rx={w*.55} ry="12" fill="#536354" opacity=".12"/>
 <rect x={-w/2+8} y="-6" width={w-16} height="35" rx="3" fill="#d9cbb0" stroke="#917f61"/>
 <path d={`M ${-w/2+6} 24 H ${w/2-6}`} stroke="#a25645" strokeWidth="7"/>
 <path d={`M ${-w/2-8} 4 Q ${-w/2+4} 1 ${-w/2+12} -16 L ${w/2-12} -16 Q ${w/2-4} 1 ${w/2+8} 4 L ${w/2-3} 11 L ${-w/2+3} 11 Z`} fill="#7a897b" stroke="#4e665c" strokeWidth="2"/>
 <path d={`M ${-w/2+12} -17 H ${w/2-12}`} stroke="#b6b391" strokeWidth="4"/>
 {Array.from({length:9},(_,i)=><path key={i} d={`M ${-w*.35+i*w*.0875} -13 l ${(i-4)*.6} 18`} stroke="#b3b8a2" opacity=".55"/>)}
 {name&&<text y="42" textAnchor="middle" fill="#506252" fontSize="13" fontFamily="SimSun,serif">{name}</text>}
 </g>}
function Tree({x,y,gold=false,s=1}:{x:number;y:number;gold?:boolean;s?:number}){return <g transform={`translate(${x} ${y}) scale(${s})`}>
 <ellipse cy="11" rx="21" ry="9" fill="#718169" opacity=".13"/><path d="M0 10V-12 M0-3L-11-14 M0-5L9-20" stroke="#847859" strokeWidth="3"/>
 {[[-10,-16,13],[8,-22,15],[-2,-31,12],[15,-9,10],[-15,-4,10]].map(([a,b,r],i)=><circle key={i} cx={a} cy={b} r={r} fill={gold?['#c9b76e','#d8c781','#c2aa59'][i%3]:['#889d7b','#9cae8a','#718c70'][i%3]} stroke={gold?'#b4a160':'#718a70'} strokeWidth=".6"/>)}
 </g>}
export default function GardenMap({area,onTravel}:{area:AreaId;onTravel:(d:MapDestination)=>void}){
 const [selected,setSelected]=useState<string|null>(null),touch=useRef(false);const chosen=destinations.find(d=>d.id===selected);
 const here=destinations.find(d=>d.area===area&&!d.panel)||destinations.find(d=>d.area===area);
 return <><div className="game-map" aria-label="小院互动地图">
 <svg viewBox="0 0 600 620" aria-hidden="true" className="game-map-art">
 <defs><pattern id="map-paving" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#e2dcc6"/><path d="M0 0H18V12 M9 0V12" fill="none" stroke="#d4ceb8" strokeWidth=".7"/></pattern><pattern id="map-grain" width="37" height="31" patternUnits="userSpaceOnUse"><circle cx="9" cy="7" r=".7" fill="#9da383" opacity=".16"/><circle cx="29" cy="23" r=".6" fill="#9da383" opacity=".16"/></pattern></defs>
 <rect width="600" height="620" rx="25" fill="#ecebdc"/><rect width="600" height="620" rx="25" fill="url(#map-grain)"/>
 <path d="M56 576V375H195V37H409V375H482V576H334 M266 576H56" fill="#dde3ce" stroke="#a09a80" strokeWidth="5" strokeLinejoin="round"/>
 <path d="M56 575V375H195V37H409V375H482V575" fill="none" stroke="#c9b59a" strokeWidth="2"/>
 <path d="M300 46V580 M110 272H300 M300 330H515V390 M130 454H455 M205 540H428" stroke="url(#map-paving)" strokeWidth="28" fill="none" strokeLinejoin="round"/>
 <path d="M300 46V580 M110 272H300 M300 330H515V390 M130 454H455 M205 540H428" stroke="#fff9e6" strokeWidth="1" strokeDasharray="2 8" opacity=".6" fill="none"/>
 <rect x="66" y="233" width="86" height="69" rx="5" fill="#d2dcc5" stroke="#a5b294"/>
 <Roof x={300} y={65} name="慈愿阁"/><Roof x={300} y={137} name="药师殿"/><Roof x={300} y={209} name="净愿殿"/><Roof x={300} y={289} w={156} name="礼佛殿"/>
 <Roof x={108} y={247} w={85} name="结缘小院"/>
 <ellipse cx="518" cy="333" rx="55" ry="47" fill="#d8ddcb" stroke="#a5b599"/>
 <path d="M474 320Q516 283 559 319" fill="none" stroke="#9a8c69" strokeWidth="4"/><path d="M480 311Q518 326 552 309" fill="none" stroke="#b7a16d"/>
 {[484,500,516,532,548].map((x,i)=><circle key={x} cx={x} cy={315+Math.sin(i/4*Math.PI)*6} r="3" fill="#e3c681"/>)}
 <text x="516" y="393" textAnchor="middle" fontSize="13" fill="#627762">月下乐庭</text>
 <path d="M81 433C90 400 149 404 176 421C201 435 221 467 192 492C161 518 92 493 81 465Z" fill="#a0bdb1" stroke="#adb59a" strokeWidth="7"/>
 <path d="M97 439Q140 426 174 448 M112 473Q151 485 182 467" fill="none" stroke="#d6e8dc" strokeWidth="2" opacity=".8"/>
 {[[106,453],[170,475],[137,427]].map(([x,y])=><g key={x}><ellipse cx={x} cy={y} rx="10" ry="5" fill="#789a7c"/><circle cx={x+4} cy={y-4} r="3" fill="#f3e8d6"/></g>)}
 <Roof x={449} y={430} w={88}/><rect x="416" y="501" width="54" height="66" rx="5" fill="#dfd8bd"/><circle cx="441" cy="530" r="12" fill="#a6997a"/>
 {[[423,529],[458,529],[440,550]].map(([x,y])=><rect key={x} x={x-5} y={y-4} width="10" height="8" rx="2" fill="#8a8d72"/>)}
 <path d="M70 509V558 M470 482V565" stroke="#7b8d79" strokeWidth="10"/><path d="M69 508V558 M469 482V565" stroke="#c2c8a7" strokeWidth="3"/>
 <ellipse cx="300" cy="389" rx="13" ry="8" fill="#8a9c89"/><rect x="267" y="380" width="17" height="12" rx="2" fill="#a98e69"/>
 {[{x:96,y:367,gold:true},{x:175,y:547,gold:true},{x:375,y:429,gold:true},{x:455,y:119},{x:115,y:172},{x:435,y:234},{x:540,y:484},{x:115,y:550},{x:360,y:554}].map((t,i)=><Tree key={i} {...t} s={i<3?1.1:.8}/>)}
 <Roof x={300} y={579} w={75}/><text x="300" y="617" textAnchor="middle" fontSize="12" fill="#78806a">院门</text>
 <g transform="translate(541 66)" fill="#839078"><path d="M0-22L-6 2L0-2L6 2Z"/><text y="20" textAnchor="middle" fontSize="12">北</text><path d="M-17 0H17M0-17V8" stroke="#839078" strokeWidth=".6"/></g>
 </svg>
 {destinations.map(d=>{const Icon=d.icon;return <button key={d.id} className={`game-map-pin ${selected===d.id?'selected':''} ${d.area===area&&!d.panel?'current':''}`} style={{left:`${d.x/6}%`,top:`${d.y/6.2}%`}} aria-label={d.name+'：'+d.note} aria-describedby={'map-tip-'+d.id} onPointerDown={e=>{touch.current=e.pointerType==='touch';}} onClick={()=>{if(touch.current){setSelected(d.id);return;}onTravel(d);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){touch.current=false;}}}>
 <Icon size={19} strokeWidth={1.6}/><span role="tooltip" id={'map-tip-'+d.id} className={`game-map-tooltip ${d.x>430?'tip-right':d.x<170?'tip-left':''}`}><strong>{d.name}</strong><small>{d.note}</small><em>点击前往</em></span>
 </button>})}
 <span className="map-you" style={{left:area==='court'?'50%':`${(here?.x||300)/6}%`,top:area==='court'?'86%':`${((here?.y||540)+29)/6.2}%`}}><MapPin size={12}/>你在这里</span>
 </div>
 <div className="game-map-caption">{chosen?<><span><strong>{chosen.name}</strong><small>{chosen.note}</small></span><button onClick={()=>onTravel(chosen)}>前往这里 →</button></>:<span>悬停看名称 · 点击前往<small>触屏轻点图标查看活动，再点“前往这里”</small></span>}</div>
 </>;
}
