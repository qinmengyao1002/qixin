import requests, re, json, sys, concurrent.futures
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
out=Path('../asset-sources/references');out.mkdir(exist_ok=True)
def fetch(url):
    for _ in range(3):
        try:
            r=requests.get(url,timeout=45);r.raise_for_status();return r.text
        except requests.RequestException: pass
    return ''
base='https://www.artheonmuseum.org'
urls=[base+'/3d/culture/buddhist-and-hindu']+[base+'/3d/culture/buddhist-and-hindu/page/'+str(i) for i in range(2,8)]
pages=list(concurrent.futures.ThreadPoolExecutor(3).map(fetch,urls))
links=sorted(set(m for s in pages for m in re.findall(r'/artwork/[a-zA-Z0-9-]+',s) if any(w in m for w in ['buddha','amit','guanyin','avalok','maitreya'])))
(out/'candidate-links.json').write_text(json.dumps(links,indent=2))
print('\n'.join(links))
