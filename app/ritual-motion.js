// Timed poses use smooth interpolation, independent of rendering frame rate.
const smooth = x => { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); };
export const RITUAL_DURATION={pickup:3.4,incense:9.2,lantern:5.6,receive:1.8,sip:3};
const poses={
  pickup:[[0,0,0,0,'走到取香台'],[1.3,-1.3,.26,0,'伸手取香'],[2.4,-1.5,.12,0,'轻轻拿起香'],[3.4,-1.45,0,0,'双手捧好香']],
  incense:[
    [0,-1.45,0,0,'双手执香'],[1.8,-2.45,.02,0,'举香礼敬'],
    [3.2,-2.45,.02,0,'静心礼敬'],[4.6,-1.65,.25,0,'俯身靠近香炉'],
    [7.4,-1.55,.36,1,'缓缓插入香灰'],[8.2,-1.1,.16,1,'松手收回'],[9.2,0,0,1,'礼敬完成']],
  lantern:[[0,0,0,0,'托起莲灯'],[1,-1.5,.05,0,'双手托灯'],
    [2,-1.3,.35,0,'俯身临水'],[3.8,-.9,.65,1,'轻放入水'],
    [4.6,-.7,.5,1,'松手送灯'],[5.6,0,0,1,'看灯漂远']],
  receive:[[0,-.3,0,0,'伸手接杯'],[.8,-1.6,.12,0,'双手接杯'],[1.8,-1.25,0,1,'捧好饮品']],
  sip:[[0,-1.25,0,0,'捧起茶杯'],[.8,-2.1,-.04,0,'轻抿一口'],[1.7,-2.1,-.04,0,'轻抿一口'],[3,-1.25,0,1,'慢慢放下']],
};
export function ritualPose(kind,time){
  const keys=poses[kind]; if(!keys)throw new Error('Unknown ritual: '+kind);
  const t=Math.max(0,time);let i=1;while(i<keys.length-1&&t>keys[i][0])i++;
  const a=keys[i-1],b=keys[i],f=smooth((t-a[0])/(b[0]-a[0]));
  return {arm:a[1]+(b[1]-a[1])*f,bend:a[2]+(b[2]-a[2])*f,release:a[3]+(b[3]-a[3])*f,label:b[4],done:t>=RITUAL_DURATION[kind]};
}
