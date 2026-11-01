# CE 315 (RCC) authoring guide

CE 315 lives in `src/rc/`. It reuses CE 311's UI (`src/components/ui.tsx`: `Md`, `Tex`, `Answer`, `Choice`, `Reveal`, `Section`, `Callout`, `KV`, `Steps`/`Step`, `Seg`, `Tabs`), the lab helpers (`src/labs/common.tsx`: `rng`, `pick`, `randInt`, `useSeed`, `Slider`, `Card`, `Grid2`), `src/labs/CheckTable.tsx` (`CheckTable`, `hashKey`) and the code-table pieces (`src/reference/common.tsx`: `RT`, `NumIn`, `Lookup`).
The CE 311 earthquake lab `src/topics/eq/index.tsx` is the model for a "calculator" lab: every input selectable, 🎲 random generator, checkpoints, full solution on demand. Read it before writing a lab.

## File ownership (parallel agents: touch ONLY your own files)
| Area | Files |
|---|---|
| Topic module | `src/rc/topics/<name>/index.tsx` (+ any extra files inside that folder) — default export `RcTopicModule` {Overview, Approach, Lab, problems, theory} |
| Engines | `src/rc/engine/<name>.ts` + `<name>.test.ts` (shared: `materials.ts`, read-only for agents) |
| Code pane | `src/rc/reference/<group file>.tsx` exporting an `RcRefItem[]` (already wired in `reference/index.ts`) |
| Past papers | `src/rc/pyq/papers/r<year>.tsx` exporting `R<YEAR>: RcQ[]` (already wired in `pyq/index.ts`) |

Shared files (`types.ts`, `registry.ts`, `store.ts`, `materials.ts`, components, pages) are NOT yours: if you need a change, work around it locally and say so in your report.

## Conventions (as taught in class — Nilson, ACI 318, US units)
- Units: in, ft, kip, ksi, k-ft. `materials.ts` functions take f'c and fy in **psi** (e.g. `beta1(4000)`). Show work in the class's units (ksi in formulas, k-ft for moments).
- Load factors 1.2D + 1.6L (check 1.4D). Older papers (pre-2013) used 1.4D + 1.7L and φ = 0.9 flexure / 0.85 shear: solve as asked, add `flag`.
- Concrete self-weight 150 pcf. Cover: beams 1.5 in clear, slabs ¾ in. d = h − 2.5 in (one layer), h − 3.5 in (two layers, 1 in clear between); dt = depth to the extreme layer.
- εcu = 0.003, Es = 29 000 ksi, Ec = 57 000√f'c psi, fr = 7.5√f'c, β1 from `beta1`. φ from `phiFlex(εt)` (0.65 → 0.90, transition 0.002–0.005 for Grade 60). Beams: εt ≥ 0.004 (ρmax). Tension-controlled: εt ≥ 0.005.
- Elastic: n = Es/Ec rounded to a whole number as the class does (say so). Transformed areas (n−1)A's for compression steel (class uses 2n−1? — check the lecture digest and follow it; state the choice).
- WSD allowables: fc = 0.45 f'c, fs = 24 ksi (Grade 60) / 20 ksi (Grade 40) or 0.4 fy if the question says so.
- Shear (class method): Vc = 2λ√f'c bw d; Vu at d from the support face; Case A–D table (see `CE315 Notes/Claude digests/lec_ch05-08.md`). Stirrups #3 two-legged (Av = 0.22) unless told; practical minimum spacing 3–4 in; round spacing down to ½ in.
- Every number shown in a solution must come from an engine (or one-line arithmetic in the text). Never hand-type a final answer.
- JSX text: never a bare `<` or `>` (write `{'<'}` or words). Markdown in `Md`: paragraphs, `- ` lists, `**bold**`, `$tex$`, `$$tex$$`, `###` headings.

## Ids and keys
- Check / attempt ids must start with the topic id: `Answer id={\`rc-doubly:lab:${hashKey(JSON.stringify(inputs))}:c\`}`. PYQ cards build `${topic}:${q.id}:${key}` themselves.
- RcQ ids: `rc-<paper>-<no>` with the number compacted, e.g. `rc-2023-24-1b-ii`, `rc-jan-2021-5c`; practice problems `rc-own-<topic-short>-<n>`.
- Theory item ids: unique within the topic, e.g. `ts-steel`.

## Code pane (right side)
`RcRefItem {id, group, title, tag?, exam?, keywords?, Body}`. id prefix decides the group colour/jump: `m-` materials, `f-` flexure, `s-` shear & torsion, `b-` bond, `sl-` slabs, `st-` step checklists (group `'steps'`, may live in any file).
- Tables: `RT` with `hl={(i) => …}` to highlight the row a lab used. Labs call `markUsed('sl-t123', { case: 4, m: 0.8 })` on render; the table's Body reads `useUsed('sl-t123')` (from `src/rc/reference/pane.ts`) to highlight.
- Add a `Lookup` calculator under big tables (interpolation, ld calculator, ρ limits for any f'c/fy …).
- Canonical ids that past papers reference — these must exist (owner in brackets):
  - `sl-aci` ACI moment & shear coefficients (Table 12.1 / summary panels), `sl-t123` `sl-t124` `sl-t125` `sl-t126` Tables 12.3–12.6, `sl-h2way` two-way minimum thickness (eq. 13.8b, h formula), `sl-t134` column-strip % (DDM, Table 13.4), `sl-ts` temperature & shrinkage steel, `sl-hmin` one-way minimum thickness (Table 7.3.1.1) [slab agent]
  - `f-graphA1` Graph A.1 moment capacity R = Mn/bd² vs ρ (+ R calculator), `f-wsdT` WSD T-beam k, j formulas, `f-beff` effective flange width [flexure-B agent]; `f-rho` ρb / ρmax / ρ0.005 / ρmin table (Table A.4), `f-block` stress block & β1, `f-elastic` cracked / uncracked transformed-section formulas, `f-wsd` WSD allowable stresses [flexure-A agent]
  - `m-bars` bar areas and diameters (# and mm), `m-asft` As per foot width of slab for bar spacing, `m-phi` φ factors and the φ–εt chart, `m-loads` load combinations, `m-cover` cover & spacing rules [flexure-A agent]
  - `s-vc` Vc and limits, `s-cases` Case A–D table with spacing limits, `s-tth` torsion threshold (4 cases) [shear agent]
  - `b-ld` ld simplified + general, `b-psi` ψ factors, `b-hook` ldh, `b-ldc` compression ld, `b-splice` Class A/B splices, `b-cutoff` cut-off rules, `b-a10` Table A.10, `b-a11` Table A.11 [bond agent]

## Topic module
- **Overview**: what the topic is, how often/what it's asked (use the counts and question styles from the paper digests), the key formulas in brief, links to the lab.
- **Approach**: the handnote style — numbered recipe (`Steps`/`Step`), a "which case am I in?" decision chart (simple boxes/arrows in SVG or a styled list), common traps (`Callout kind="trap"`), and one lecture/handnote example stepped through with engine numbers.
- **Lab**: every input selectable (selects / `NumIn` / `Slider` / `Seg`) + 🎲 random exam-style problem (seeded `rng`), checkpoints (`Answer`/`Choice`/`CheckTable`), a live sketch (section, strain/stress diagram, beam with zones …), and the full solution in `Reveal`. Mark the code-pane items used.
- **theory**: `RcTheoryItem[]` — every theory question the digests list for the topic, merged when they are the same question, with `seen` = paper labels (e.g. `['2023-24','2021-22']`), a model answer in markdown that would score full marks (bullets, key numbers, sketch described or an SVG `Fig`).
- **problems**: 2–4 practice problems (`RcQ`, paper `'own'`, checks + solution from the engine).

## Sources (already digested — prefer these over re-reading PDFs)
- `CE315 Notes/Claude digests/` — `papers_P1..P4.md` (all 427 sub-questions with givens, figures, aids), `lec_ch01-03.md`, `lec_ch04.md` (outline), `lec_ch05-08.md`, `lec_ch06-12.md` (outline).
- Handnote texts: `/tmp/claude-1000/-home-awsaf-Desktop-Projects-CE311-Practice-Dashboard/0892b53c-8951-4398-a154-deecfdf22d87/scratchpad/txt/` (`flexural_design_master_guide_v2.txt`, `Torsion_Handnote_CE315.txt`, `Bond_Anchorage_Handnote.txt`, `CE315_Slab_Handnote.txt`). The handnote numbers are the test oracles.
- PDFs in `CE315 Notes/` (slides) and `~/Downloads/CE315_Term_Final_Questions.pdf` (papers; page N = `public/scans315/p-NNN.jpg`, render sharper with `pdftoppm -r 170 -f N -l N -png <pdf> <your scratch dir>/p`).

## Verify before you finish
`npx tsc --noEmit` and `npx vitest run src/rc` must pass. Do not start dev servers, do not commit.

Overview helper: `RcFrequency` from `src/rc/components/Frequency.tsx` draws questions-per-paper for a topic (fills in as papers are added).
