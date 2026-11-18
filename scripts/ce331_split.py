# papers.md -> parts_TA.md / parts_RM.md / parts_SN.md (each part goes to every teacher whose topic it carries)
import re, sys
src, outdir = sys.argv[1], sys.argv[2]
TA = 'wq aer sed coag soft ix filt dis att fe'.split()
RM = 'eco climate bdws rwh intake pump trans wsp'.split()
SN = 'ws demand pop gw well dist'.split()
blk = {**{'ev-'+t: 'TA' for t in TA}, **{'ev-'+t: 'RM' for t in RM}, **{'ev-'+t: 'SN' for t in SN}}
txt = open(src, encoding='utf8').read()
# cut at the part headers
chunks = re.split(r'(?m)^(?=### ev-)', txt)
out = {'TA': [], 'RM': [], 'SN': []}
for c in chunks[1:]:
    c = re.split(r'(?m)^(?:## |Teachers:|---\s*$)', c)[0].rstrip()
    m = re.match(r'### (\S+) .*topics: ([^·]+)·', c)
    tags = [t.strip() for t in m.group(2).split(',')]
    for b in sorted({blk[t] for t in tags if t in blk}):
        out[b].append(c)
for b, xs in out.items():
    head = f'# CE 331 past-paper parts with {b} topics ({len(xs)} parts)\nGenerated from papers.md. A part listed here may also carry another teacher\'s topics; map only your own sub-asks.\nPaper labels for `seen`: 2023-24, 2022-23, 2021-22, 2020-21, Jan 2021 (id jan-2021), 2017-18, 2016-17, 2015-16, 2012-13, 2011-12, 2010-11, 2009-10, 2008-09, 2007-08.\n\n'
    open(f'{outdir}/parts_{b}.md', 'w', encoding='utf8').write(head + '\n\n'.join(xs) + '\n')
    print(b, len(xs), 'parts', sum(1 for x in xs if re.search(r'type: [^\n]*(math|design)', x)), 'number parts')
