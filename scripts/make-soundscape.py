"""Original synthetic soundscapes; no third-party recordings or models."""
from pathlib import Path
import math, random, struct, wave
random.seed(30)
OUT=Path(__file__).resolve().parent.parent/'public'/'audio'
OUT.mkdir(parents=True,exist_ok=True)
SR=22050
def write(name,data):
    fade=min(SR,len(data)//5)
    for i in range(fade):
        data[i]*=i/fade
        data[-i-1]*=i/fade
    with wave.open(str(OUT/name),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h',int(max(-.96,min(.96,v))*32767)) for v in data))
def tone(a,start,f,duration,amp=.12,decay=2):
    first=int(start*SR)
    for i in range(int(duration*SR)):
        if first+i>=len(a):break
        t=i/SR;env=min(1,t*120)*math.exp(-t*decay)
        a[first+i]+=amp*env*(math.sin(math.tau*f*t)+.24*math.sin(math.tau*f*2.01*t))
wind=[];v=0
for i in range(SR*20):
    v=.985*v+.015*random.uniform(-1,1)
    wind.append(v*(.5+.16*math.sin(i/SR*.7)))
for j in range(12):
    start=random.uniform(1,18);f=random.uniform(1400,2300)
    for n in range(2):tone(wind,start+n*.17,f+n*160,.12,.025,24)
write('courtyard.wav',wind)
chimes=[0.]*(SR*16)
for t,f in [(1,784),(4,1046.5),(7.4,1174.7),(11,880)]:tone(chimes,t,f,4,.10,1.4)
write('chimes.wav',chimes)
music=[0.]*(SR*16)
notes=[261.63,329.63,392,440,392,329.63,293.66,329.63,261.63,392,440,523.25,440,392,329.63,293.66]
for beat in range(24):
    at=beat*2/3
    tone(music,at,notes[beat%16],.6,.12,5)
    tone(music,at,65.4 if beat%2==0 else 98,.20,.10,18)
    for i in range(int(SR*.06)):
        n=int((at+.333)*SR)+i
        if n<len(music):music[n]+=random.uniform(-1,1)*.018*math.exp(-i/SR*60)
write('moon-dance.wav',music)
wood=[0.]*(SR//3)
tone(wood,.002,620,.24,.30,25);tone(wood,.002,960,.18,.12,35)
# Short effects retain a fast attack, unlike loops.
with wave.open(str(OUT/'wood.wav'),'wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(b''.join(struct.pack('<h',int(max(-.95,min(.95,v))*32767)) for v in wood))
bell=[0.]*(SR*3);tone(bell,.01,523.25,2.9,.17,1.5);tone(bell,.01,1048,2.9,.07,2.1)
write('bell.wav',bell)
print('Created five original WAV assets in',OUT)
