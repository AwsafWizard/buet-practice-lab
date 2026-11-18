# papers.md -> src/env/pyq/parts.ts
import re, json, sys
src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding='utf8').read().split('\n')
parts = []
cur = None
hdr = re.compile(r'^### (ev-[\w-]+) · Q([^·]+?) · ([\d.]+) marks?([^·]*)· topics: ([^·]+)· type: (.+)$')
def flush():
    if not cur: return
    body = '\n'.join(cur['body']).strip()
    body = re.sub(r'\n{3,}', '\n\n', body)
    cur['text'] = body
    del cur['body']
    parts.append(cur)
for l in lines:
    m = hdr.match(l)
    if m:
        flush()
        pid, no, marks, split, topics, kind = m.groups()
        paper = re.match(r'ev-(jan-2021|\d{4}-\d{2})-', pid).group(1)
        q = int(re.match(r'\d+', no.strip()).group())
        cur = {'id': pid, 'paper': paper, 'sec': 'A' if q <= 4 else 'B', 'no': no.strip(), 'marks': float(marks),
               'split': split.strip().strip('()'), 'tags': [t.strip() for t in topics.split(',') if t.strip()], 'kind': kind.strip(), 'body': []}
        continue
    if cur is not None:
        if l.startswith('## ') or l.startswith('### ') or l.startswith('Teachers:') or l.strip() == '---':
            flush(); cur = None; continue
        cur['body'].append(l)
flush()
for p in parts:
    if p['marks'] == int(p['marks']): p['marks'] = int(p['marks'])
    if '$' in p['text']: p['text'] = p['text'].replace('$', 'USD ')
    # figure notes as italic paragraphs
    p['text'] = re.sub(r'^\[(FIG[^\]]*?)\]$', lambda m: '*[' + m.group(1).replace('*', '×') + ']*', p['text'], flags=re.M)
    if not p['split']: del p['split']
ts = ['// Every past-paper part as printed. GENERATED from `CE 331 (Envo-1)/Claude digests/papers.md` by the parts.py script',
      '// (see docs/CE331_HANDOFF.md). `tags` / `kind` are the transcriber\'s guesses; the teacher maps (ta/rm/sn.tsx) decide the topics.',
      "import type { EvPart } from '../types'", '', 'export const EV_PARTS: EvPart[] = [']
for p in parts:
    ts.append('  ' + json.dumps(p, ensure_ascii=False) + ',')
ts.append(']')
open(out, 'w', encoding='utf8').write('\n'.join(ts) + '\n')
# the course picker only needs the ids: keep the question text out of the main bundle
ids_out = out.replace('parts.ts', 'ids.ts')
open(ids_out, 'w', encoding='utf8').write('// GENERATED with parts.ts: just the part ids, for the course picker (keeps the question text out of the main bundle).\nexport const EV_PART_IDS: string[] = ' + json.dumps([p['id'] for p in parts]) + '\n')
print(len(parts), 'parts;', sum(p['marks'] for p in parts), 'marks')
from collections import Counter
print(Counter(p['paper'] for p in parts))
print('empty text:', [p['id'] for p in parts if len(p['text']) < 15])
