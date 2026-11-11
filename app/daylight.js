// A gentle artistic cycle in China standard time, independent of device timezone.
export function chinaHour(time=Date.now()) { return ((time/3600000+8)%24+24)%24; }
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function daylight(time=Date.now(),mode='auto') {
  const hour=mode==='day'?12:mode==='sunset'?18:mode==='night'?22:chinaHour(time);
  const day=smooth((hour-5.5)/2)*(1-smooth((hour-17)/2.5));
  const warm=Math.max(0,1-Math.abs(hour-6.5)/1.5,1-Math.abs(hour-18)/1.5);
  return {hour,day,warm,lamps:1-smooth(day/.65)};
}
