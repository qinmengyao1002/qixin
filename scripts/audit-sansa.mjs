import fs from 'node:fs/promises';
const html=await(await fetch('https://sansatemple.com/')).text();
const scripts=[...html.matchAll(/src="([^"]+\.js)"/g)].map(m=>m[1]);
for(const src of scripts){let code=await(await fetch(new URL(src,'https://sansatemple.com'))).text();let game=code.match(/assets\/game-[\w-]+\.js/);if(game){code=await(await fetch('https://sansatemple.com/'+game[0])).text();await fs.writeFile('../docs/sansa-current-public.js',code);console.log([...new Set(code.match(/"[^"\n]{1,100}[가-힣][^"\n]{0,80}"/g)||[])].filter(x=>!x.includes('function')).slice(-280).join('\n'));}}
