import requests,concurrent.futures
from pathlib import Path
assets={'amitabha':'76b657d020934c3b928c0c05517d99c5','maitreya':'6f341339440b4626b42e5c7148470014','shakyamuni':'7d0cbc0e0d034e63a02274ab8af70eee'}
def download(pair):
    name,uid=pair
    session=requests.Session();session.mount('https://',requests.adapters.HTTPAdapter(max_retries=3))
    r=session.get('https://images.artheonmuseum.org/ugc/sketchfab/'+uid+'.glb',timeout=120);r.raise_for_status()
    assert r.content[:4]==b'glTF'
    Path('../asset-sources/'+name+'-source.glb').write_bytes(r.content)
    return name,len(r.content)
for result in concurrent.futures.ThreadPoolExecutor(3).map(download,assets.items()):print(result,flush=True)
