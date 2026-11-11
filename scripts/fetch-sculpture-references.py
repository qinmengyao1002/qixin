import requests,re,json,sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
out=Path('../asset-sources/references')
session=requests.Session()
session.mount('https://',requests.adapters.HTTPAdapter(max_retries=3))
slugs=['buddha-statue-93c223','maitreya-the-buddha-of-the-future-6f3413','amitabha-buddha-76b657','amitabha-buddha-88bd23','gilt-bronze-statuette-of-sakyamuni-buddha-7d0cbc']
for slug in slugs:
    s=session.get('https://www.artheonmuseum.org/artwork/'+slug,timeout=40).text.replace('\\"','"')
    fields={k:re.search('"'+k+'":"(.*?)"',s) for k in ['description','model_url','license','attribution_text','source_url','thumbnail_url']}
    data={k:v.group(1) if v else '' for k,v in fields.items()}
    (out/(slug+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print(slug,json.dumps(data,ensure_ascii=False))
    if data['thumbnail_url']:
        try:
            r=session.get(data['thumbnail_url'],timeout=40);r.raise_for_status();(out/(slug+'.jpg')).write_bytes(r.content)
        except requests.RequestException: pass
