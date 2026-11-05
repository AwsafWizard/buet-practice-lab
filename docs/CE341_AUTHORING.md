# CE 341 (soil mechanics) authoring guide

CE 341 lives in `src/soil/` (route `/ce341`, ids prefixed `sm-`). It is a copy of the CE 315 shell (`src/rc/`), so read `docs/CE315_AUTHORING.md` once for the shared UI, then follow this file where they differ.

Shared pieces you should reuse: `src/components/ui.tsx` (`Md`, `Tex`, `Answer`, `Choice`, `Reveal`, `Section`, `Callout`, `KV`, `Steps`/`Step`, `Seg`, `Tabs`, `isClose`), `src/labs/common.tsx` (`rng`, `pick`, `randInt`, `useSeed`, `Slider`, `Card`, `Grid2`), `src/labs/CheckTable.tsx` (`CheckTable`, `hashKey`), `src/reference/common.tsx` (`RT`, `NumIn`, `Lookup`), `fmt` from `src/components/DiagramView`. CE 341 pieces: `src/soil/components/PickDrill.tsx` ("Which one?" drill), `TheoryList.tsx`, `Frequency.tsx` (`SmFrequency`, questions per paper for a topic), `src/soil/reference/pane.ts` (`markUsed`, `useUsed`, `openSmRef`).
Good models to read before writing: CE 315 `src/rc/topics/shear/` (index + Lab + DesignProblems + picks + theory), CE 311 `src/topics/eq/index.tsx` (calculator lab), `src/labs/playground.tsx` (live playgrounds).

## File ownership (parallel agents: touch ONLY your own files)
| Area | Files |
|---|---|
| Topic module | `src/soil/topics/<t>/index.tsx` (+ any files inside that folder) — default export `SmTopicModule` {Overview, Approach, Lab, problems, theory}; `src/soil/topics/<t>/picks.ts` exports `<T>_PICKS` (already wired) |
| Engines | `src/soil/engine/<name>.ts` + `<name>.test.ts`; shared `src/soil/engine/units.ts` (γw etc.) belongs to the shell |
| Chart pane | `src/soil/reference/<group>.tsx` exporting `<G>_ITEMS: SmRefItem[]` (already wired in `reference/index.ts`) |
| Past papers | `src/soil/pyq/ajk/s<year>.tsx` (AJK sir's half, `A<YEAR>`) and `src/soil/pyq/sjmy/s<year>.tsx` (SJMY sir's half, `B<YEAR>`), e.g. `ajk/s2023.tsx` → `A2023`, `sjmy/sjan21.tsx` → `BJAN21` (already wired and sorted in `pyq/index.ts`) |

Topic folders: `wv plast class struct shear lep comp perm seep consol stress` (ids `sm-wv` …). Shared files (`types.ts`, `registry.ts`, `store.ts`, components, pages, `engine/units.ts`) are NOT yours: work around locally and say so in your report.

## Conventions (as taught)
- SI by default: kN, m, kPa (= kN/m²), γw = **9.81 kN/m³** (`GW` in `engine/units.ts`), ρw = 1 t/m³ = 1 g/cm³. Solve in the paper's own units when it uses t/m³, g/cc, pcf/psf, inches or kips, and say so. log = log10 unless shown as ln.
- Weight–volume (AJK sir): solve on the **phase (block) diagram** — assume V or Vs, fill weights and volumes, then read off e, n, S, w, γ ("No derived expression has been used!"). Show the formula route (Se = wGs, γ = (Gs+Se)γw/(1+e)) as the check.
- Relative density classes (Das Table 3.3): 0–15 very loose, 15–35 loose, 35–65 medium, 65–85 dense, 85–100 very dense.
- Classification: Das Ch. 5 exactly as on AJK sir's slides — AASHTO Table 5.1 + GI = (F−35)[0.2+0.005(LL−40)] + 0.01(F−15)(PI−10), negative → 0, rounded to a whole number, A-2-6/A-2-7 use only the PI term; USCS Table 5.2 + Figs 5.4–5.6 group names; A-line PI = 0.73(LL−20), U-line PI = 0.9(LL−8), CL-ML band PI 4–7. Organic if LL(oven-dried)/LL(not dried) < 0.75. Details and every table: `CE341/Claude digests/lec_AJK.md` §3 and the AASHTO M 145 section.
- Shear: Mohr circle with the **pole** method; failure plane at 45° + φ/2 to the major principal plane; σ′ = σ − u; CU gives total (c, φ) and effective (c′, φ′) envelopes; UU φu = 0, cu = (σ1−σ3)/2; unconfined qu with area correction A = A0/(1−ε), cu = qu/2. Fit envelopes through the circles (two circles: exact common tangent; three or more: least squares on the p–q (Kf) line, sin φ = tan α, c = a/cos φ) — say which.
- Earth pressure: σ′h = Kσ′v, Ka = tan²(45−φ/2), Kp = tan²(45+φ/2), K0 per AJK sir's five formulas (Jaky, Sherif, Mayne–Kulhawy, Massarsch, OC √OCR). Water separately (K = 1), surcharge qK as a rectangle, c′ gives −2c′√Ka (tension crack zc = 2c′/(γ√Ka); after the crack the tension zone is dropped). Pieces table: force, arm above base, moment. The handnote `CE341/Handnotes/Lateral_Earth_Pressure_Handnote.pdf` numbers are the test oracles.
- SJMY sir's half: formulas as in the Question Bank handnote's formula sheet (`CE341/Handnotes/CE341_Question_Bank_Solutions.pdf`, text at `/tmp/claude-1000/-home-awsaf-Desktop-Projects-CE311-Practice-Dashboard/8ae8a4b2-987a-47fc-807d-be3fd48effe9/scratchpad/qbank.txt`). Its final answers are the test oracles; where a digest says the handnote misread the scan, follow the scan and note it. Tv–U: exact series (and the table 0.008 … 0.848, Tv = (π/4)U² for U < 60%, 1.781 − 0.933 log(100−U) for U ≥ 60%). Sand drains: de = 1.05s triangular, 1.128s square (SJMY's slide writes 0.525s / 0.564s, which are re — flag it).
- Flow nets: q = kH·Nf/Nd. Where the paper prints a net, count it (as the student must) and also show the solver's Nf/Nd; where the student draws it, use the solver. Heave (Terzaghi prism D × D/2), piping by exit gradient (Harza), FS = icr/i.
- Every number in a solution comes from an engine (or one-line arithmetic in the text). Never hand-type a final answer.
- JSX text: never a bare `<` or `>` (write `{'<'}` or words). Markdown in `Md`: paragraphs, `- ` lists, `**bold**`, `$tex$`, `$$tex$$`, `###` headings.
- Figures are inline SVG using the theme tokens: `var(--c-soil)` (soil fill), `var(--c-water)` (water, water table ▽), `var(--c-accent)` (what the lab changes), `var(--c-load)` (loads), `var(--c-ink)/--c-mute/--c-line`. Draw to scale where sizes are given; label dimensions. Must read well in light and dark.

## Ids and keys
- Check / attempt ids start with the topic id: `Answer id={\`sm-lep:lab:${hashKey(JSON.stringify(inputs))}:pa\`}`. PYQ cards build `${topic}:${q.id}:${key}` themselves.
- SmQ ids: `sm-<paper>-<no>` with the number compacted, e.g. `sm-2023-24-1a`, `sm-jan-2021-5c`, `sm-2012-13-2-classify`; practice problems `sm-own-<topic>-<n>`.
- `flag` on a question = outside this term's slides (Coulomb/Culmann, sloping backfill, point/line loads behind walls, sheet-pile embedment, vane, Skempton A/B, β chart, shrinkage limit when not taught) or a print problem. Short sentence, e.g. "Coulomb's theory — not in AJK sir's slides this term."
- Theory item ids: unique within the topic, e.g. `t-zav`.

## Chart pane (right side, key T)
`SmRefItem {id, group, title, tag?, exam?, keywords?, Body}`. The id prefix decides the group: `c-` index & classification, `s-` shear strength, `e-` earth pressure, `w-` compaction & water, `k-` consolidation, `d-` stress distribution, `st-` step checklists (group `'steps'`, may live in any file).
- Draw charts from their formulas as SVG (exact), never from scans; put a `Lookup` calculator under each (enter m, n → I; Tv → U; …). Tables via `RT` with `hl` to highlight what a lab used (`markUsed(id, {...})` in the lab, `useUsed(id)` in the Body).
- `exam: true` = printed with recent papers. Canonical ids that past papers reference — these must exist (owner in brackets):
  - [index agent] `c-phase` W–V relations sheet, `c-dr` Dr classes (Das Table 3.3), `c-sizes` grain-size limits by organization, `c-burmister` plasticity descriptions, `c-plchart` plasticity chart (A-line, U-line, zones, point plotter), `c-aashto` AASHTO table (Das 5.1 / M 145) + GI calculator, `c-uscs` USCS Table 5.2, `c-uscs-names` group-name flowcharts (Figs 5.4–5.6), `c-usda` USDA triangle, `c-minerals` clay minerals.
  - [shear/earth-pressure agent] `s-phi` typical φ / c values, `s-tests` test summary (drainage, loading rates, specimen sizes), `s-mohr` Mohr circle and pole formulas, `s-ab` Skempton A and B, `s-beta` β vs OCR chart (as printed in 2017-18, Jan 2021, 2021-22), `s-vane` vane formula + Bjerrum correction, `s-cu` cu/σ′ correlations; `e-ka` Ka / Kp table vs φ, `e-k0` K0 formulas, `e-move` wall movement to reach active / passive, `e-coulomb` Coulomb Ka / Kp (flagged), `e-wallload` lateral pressure from point / line loads (flagged).
  - [water agent] `w-proctor` Standard vs Modified Proctor, `w-rollers` rollers and soils, `w-k` typical k and Hazen, `w-cap` capillary rise, `w-filter` filter criteria, `w-flownet` flow-net rules and formulas.
  - [consolidation/stress agent] `k-tvu` Tv–U table + curve, `k-cc` Cc / Cs correlations, `k-fit` √t and log t constructions, `k-barron` Barron Ur–Tr chart, `k-settle` settlement formulas (NC, OC both branches, secondary); `d-kb` Boussinesq KB table, `d-fadum` Fadum chart I(m, n), `d-newmark` Newmark chart (influence 0.005, 200 meshes), `d-osterberg` Osterberg chart, `d-steinbrenner` Steinbrenner chart, `d-strip` strip and triangular-strip tables, `d-circle` circle (below the centre) table, `d-21` 2:1 method.

## Topic module
- **Overview**: what the topic is, how often and in what styles it is asked (counts from the digests; `SmFrequency`), the key formulas in brief, a link to the lab.
- **Approach**: handnote style — numbered recipe (`Steps`/`Step`), a "which case am I in?" chart, traps (`Callout kind="trap"`), and one lecture/handnote example stepped through with engine numbers.
- **Lab**: every input selectable (`Seg`, `NumIn`, `Slider`, selects) + 🎲 exam-style problem (seeded `rng`), checkpoints (`Answer`/`Choice`/`CheckTable`), a live sketch, the full solution in `Reveal`; mark the pane items used. Then (as CE 315/311 did) a **"Which one?" drill** (`PickDrill` with your `<T>_PICKS`, 3–5 skills) and **exam-style full problems** (seeded generator, step checks, solution on reveal). A playground where it gives intuition (named per topic in your brief).
- **theory**: `SmTheoryItem[]` — every theory / derivation part the digests list for the topic, merged when they are the same question, `seen` = paper labels (`['2023-24','Jan 2021']`), a model answer in markdown that would score full marks (bullets, key numbers, a `Fig` sketch where the answer needs one). Derivations as numbered steps.
- **problems**: 2–4 practice problems (`SmQ`, paper `'own'`, checks + solution from the engine).

## Sources (already digested — prefer these over re-reading PDFs)
- `CE341/Claude digests/` — `README.md` (topic ids, entry format), `papers_P1.md` (2007-08 → 2011-12), `papers_P2.md` (2012-13 → 2017-18), `papers_P3.md` (Jan 2021 → 2023-24, with the attached charts transcribed), `lec_AJK.md` (AJK sir's slides, every table and worked example).
- SJMY sir's lecture text: `/tmp/claude-1000/-home-awsaf-Desktop-Projects-CE311-Practice-Dashboard/8ae8a4b2-987a-47fc-807d-be3fd48effe9/scratchpad/sj/L01.txt` … `L25.txt` (Lecture 03 has no text layer).
- Scans: PDF page N = `public/scans341/p-NNN.jpg`; sharper: `pdftoppm -r 170 -f N -l N -png "CE341/CE-341 All Question Papers.pdf" <your scratch dir>/p`.

## Verify before you finish
`npx tsc --noEmit` and `npx vitest run src/soil` must pass. Do not start dev servers, do not commit.
