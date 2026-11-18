# CE 331 (Environmental Engineering I) authoring guide

CE 331 lives in `src/env/` (route `/ce331`, every id prefixed `ev-`). It is a hybrid of two older courses:
- **recall content as data**, like CE 301 (`docs/CE301_AUTHORING.md`): lists, flashcards and model answers per topic.
  The Memory Well and each topic's Recall tab build every drill from them.
- **numbers from engines**, like CE 341 (`docs/CE341_AUTHORING.md`): pure TypeScript engines with tests, interactive
  labs, and worked solutions for the number-type past-paper parts.

Read first: `src/env/types.ts` (all data types), `src/env/registry.ts` (24 topics, 3 teachers). Plan: `docs/CE331_PLAN.md`.

## Sources: read the digests, not the PDFs
`CE 331 (Envo-1)/Claude digests/` (gitignored):
- `README.md`: the topic ids and the digest conventions.
- `lec_tanvir.md` (TA: water quality and treatment), `lec_rowshan.md` (RM: environment, BD water supply, RWH, intake, pumps, transmission, WSP), `lec_snigdha.md` (SN: water supply system, demand, population, groundwater, tubewells, distribution).
  These are this term's (CE22) slides, and each ends with `## Math procedures as taught` and `## Doubts`.
- `papers.md`: all 14 papers (317 parts) as printed. `parts_<TA|RM|SN>.md` hold just the parts with that teacher's topics, so read that one instead.

**The CE22 slides win.** If they can't answer a past-paper part, look further in this order and record where the
answer came from (`from`, below):
1. The class notes and the teacher's own worked maths (already in the digests as `EXAMPLE` blocks).
2. Older slides of the same teacher: `CE 331 (Envo-1)/<teacher>/CE21 Slides/`, `CE19 Slides/`. Use `pdftotext` + `grep` on a keyword first, and read only the pages that hit.
3. Seniors' notes in `CE 331 (Envo-1)/Nafee vai notes (Maths)/` (scans: Ashraf sir, Rowsan ma'am, Delwar sir). Make a contact sheet (6 pages tiled at about 60 dpi) to find the page, then read at most a few pages at 120 dpi.
4. Standard textbook knowledge (Peavy / Davis / M. A. Aziz). Write it, set `from: ['textbook']`, and add a note saying it isn't in this term's slides.
5. If nothing can produce an answer (a missing figure, an unreadable scan), set `from: ['none']` and a `flag` explaining why. **The user asked for unsolved parts to be marked**, so never leave a part silently empty.

## File ownership (parallel agents: touch ONLY your own files)
| Block | Recall content (topic files) | Theory map | Numbers: engines · labs · map |
|---|---|---|---|
| **TA** Tanvir sir | `content/wq.ts aer.ts sed.ts coag.ts soft.ts ix.ts filt.ts dis.ts att.ts fe.ts` | `pyq/ta.tsx` (`TA_MAP`) | `engine/chem.ts settle.ts soften.ts ix.ts coag.ts chlorine.ts` (+ `.test.ts`) · `labs/ev-wq.tsx ev-sed.tsx ev-coag.tsx ev-soft.tsx ev-ix.tsx ev-dis.tsx` · `pyq/ta-math.tsx` (`TA_MATH`) |
| **RM** Rowshan ma'am | `content/eco.ts climate.ts bdws.ts rwh.ts intake.ts pump.ts trans.ts wsp.ts` | `pyq/rm.tsx` (`RM_MAP`) | `engine/pump.ts rwh.ts hammer.ts tank.ts` · `labs/ev-pump.tsx ev-rwh.tsx ev-trans.tsx` · `pyq/rm-math.tsx` (`RM_MATH`) |
| **SN** Snigdha ma'am | `content/ws.ts demand.ts pop.ts gw.ts well.ts dist.ts` | `pyq/sn.tsx` (`SN_MAP`) | `engine/population.ts demand.ts wells.ts dtw.ts network.ts` · `labs/ev-pop.tsx ev-demand.tsx ev-gw.tsx ev-well.tsx ev-dist.tsx` · `pyq/sn-math.tsx` (`SN_MATH`) |

Figures shared by an engine and a lab (well section, iso-removal chart, bar diagram…) go in `src/env/figs/<name>.tsx`, owned by the numbers author of that block.
Shared files (types, registry, pages, components, `content/index.ts`, `pyq/index.ts`, `labs/index.ts`, store) are the shell's.
Don't edit them; if you need something, say so in your report. Labs register themselves by file name (`labs/ev-sed.tsx` → topic `ev-sed`).

A part can be in a theory map and a numbers map at once (for example "derive the yield of a well … then find the flow"). `pyq/index.ts` merges the two field by field.
A part tagged with two teachers' topics is mapped by both, each for its own sub-asks.

## Recall content (topic files)
A topic file is `src/env/content/<suffix>.ts` (or `.tsx` when an answer has a `Fig`) for topic `ev-<suffix>`, with `export default { lists, cards, answers } satisfies EvTopicContent`.

**Lists (`EvList`)**: one per list an examiner can ask ("name / list / state the … / what are the … / steps of …"). This is the most important data in the course.
- `id` `l-…`, unique across the course (`l-wsp-steps`, `l-intake-site`).
- `points[].k`: the keyword as you'd write it in the script, 1–7 words, in the slide's wording. `alt`: other wordings that should also count when typed (abbreviations, the textbook's term). `d`: one plain line of explanation.
- `ordered: true` only when order matters (WSP steps, treatment train, hydrologic-cycle stages, procedure steps).
- `hook`: a memory hook that genuinely helps (first-letter mnemonic or a picture). Skip it for lists of 3 points or fewer.
- `seen`: paper labels exactly as in `EV_PAPERS`: `'2023-24' '2022-23' '2021-22' '2020-21' 'Jan 2021' '2017-18' '2016-17' '2015-16' '2012-13' '2011-12' '2010-11' '2009-10' '2008-09' '2007-08'`. Frequency drives the drill order, so get it right.
- `src`: `'RM L6 p12'`, `'TA T07 p5'`, `'SN L3 p8'`, `'CE21 slides RM L8 p20'`, `'textbook (Peavy 4-6)'`.

**Cards (`EvCard`)**: definitions (aquitard, specific yield, SOR, NPSH, NRW…), distinctions (dry vs wet intake, SSF vs RSF, RO vs ED, GAC vs PAC, confined vs unconfined), standards and numbers (WHO / BD limits, per-capita demand values, slot sizes, filter rates), one-line "why" facts. `front` is a question, `back` is at most 60 words. Don't repeat a list as a card (lists become cards on their own). Aim for 10–25 per topic.

**Answers (`EvAnswer`)**: one per *distinct* theory question; merge repeats and list every paper in `seen`. `a` is the answer that scores full marks at the most-asked mark value, about one point per 2–3 marks. Use `###` headings and numbered points led by the **bold keyword** plus one line. Use pipe tables for comparisons. Derivations are numbered steps with `$…$` / `$$…$$` TeX.
- `keys`: 5–15 keywords or short phrases the examiner looks for. **Each must appear verbatim (case-insensitive) in `a`**; a test checks this.
- `lists`: the list ids the answer uses.
- `Fig`: an SVG sketch whenever the question says sketch / draw / diagram / with figure (elements of a water supply system, hydrologic cycle, cone of depression, aquifer types, dry vs wet intake, centrifugal pump, pump curves, water hammer, double layer, dose vs colloid zones, breakpoint curve, filter section, treatment flow diagrams, WSP steps, service ladder…). Use only theme tokens: `var(--c-ink) var(--c-mute) var(--c-faint) var(--c-line) var(--c-panel) var(--c-panel2) var(--c-accent) var(--c-accent2) var(--c-water) var(--c-soil) var(--c-load) var(--c-good) var(--c-bad)` and the teacher colours `var(--c-rm) var(--c-sn) var(--c-ta)`. It must read in light and dark: `viewBox`, `width="100%"`, text at least 11px, no fixed colours.

Markdown (`Md`): `###` headings, `- ` and `1. ` lists (one level), `**bold**`, `*italic*`, pipe tables, `$tex$` and `$$tex$$`. A `$` always starts TeX, so write money as `Tk` and keep `$` paired. Escape backticks inside template literals.

## Theory map (`pyq/<block>.tsx`)
`export const <BLOCK>_MAP: Record<string, EvPartMap>`, keyed by part id (`ev-2023-24-3c`). Every part in your `parts_<BLOCK>.md` that asks theory gets an entry:
`topics` (1–2), `ans` (answer ids in the order you'd write them), `from` (where it came from: `'ce22' | 'notes' | 'old-slides' | 'seniors' | 'textbook' | 'none'`, main source first).
Add `extra` (markdown specific to that paper: the bit no shared answer covers, e.g. "for BUET campus…"), `flag` (outside this term's slides, e.g. "Not in Rowshan ma'am's CE22 slides — answer from the textbook"), and `notes` (doubtful readings) where needed.

## Numbers: engines, labs and the numbers map
**Engines** (`src/env/engine/<name>.ts`): pure functions, no React, SI or the paper's own units as the class does it. Each returns its result and its intermediate values, so solutions can show every step.
Each engine has a `<name>.test.ts`, and **every `EXAMPLE` in your digest whose numbers the engine covers is a test oracle** (assert to the printed precision). Where a slide's arithmetic is wrong, test the correct value and note it.
Follow the teacher's conventions exactly. The digests' `## Math procedures as taught` gives each method step by step. Examples:
- Rowshan ma'am's Darcy loss is $h_f = fLv^2/2gd$ with f as given (no 4).
- Snigdha ma'am's branch design uses $h_f = 4fLv^2/2gD$ (as printed in 2022-23 Q7c).
- Units in ft / cusec / gpm / psi where the paper uses them.

**Worked solutions** (`pyq/<block>-math.tsx`, `export const <BLOCK>_MATH`): every number-type part (`kind` has `math` or `design`) gets
`{ topics, ans: [], Sol, final, from }`. `Sol` is a component that calls the engine with that paper's data and lays out the solution as a student should write it:
- given → assumptions (say which reasonable values were assumed, like the paper invites) → numbered steps with the formula in TeX, then the substituted numbers, then the result with units → a boxed final line;
- a figure where it helps (the network with flows, the well log, the bar diagram, the worked iso-removal chart, the mass curve).

`final` is a one-line summary (`'Q = 1.06 cusec; input power ≈ 46 hp'`). It must come from the engine: compute it in the module with the same call, never type it.
Student-number data ("last three digits of your student ID + 150"): use a `NumIn` defaulting to a sample value, recompute live, and say so.
A part whose figure can't be read well enough to solve gets your best reading, a `notes` line on what was assumed, and `flag` if the result is shaky. Use `from: ['none']` only when no sensible solution exists.

```tsx
// pyq/sn-math.tsx (pattern)
import { Md } from '../../components/ui'
import { thiemConfined } from '../engine/wells'
const r5a = thiemConfined({ Q: 950 / 1000 / 60, b: 35, s: 7.5, rw: 0.075, R: 950 }) // 2022-23 Q5(a)
export const SN_MATH: Record<string, EvPartMap> = {
  'ev-2022-23-5a': { topics: ['ev-gw'], ans: [], from: ['ce22'], final: `K = ${r5a.K.toFixed(2)} m/day`, Sol: () => <WellSol r={r5a} /> },
}
```

**Labs** (`labs/ev-<topic>.tsx`, default export): intuition first, then practice, in the style of CE 341's labs (`src/soil/topics/seep/FlowNetLab.tsx`, `src/soil/topics/shear/TestBench.tsx`, `src/soil/topics/stress/Calculators.tsx`). Each lab has:
1. **A live simulation** (SVG, animated where motion explains something) with every input on a `Slider` / `Seg` / `NumIn`, and a few "notice that…" callouts saying what to try.
2. **Exam-style problems**: a seeded generator (`rng`, `useSeed` from `src/labs/common.tsx`) in the shape the papers ask, with step checks (`Answer` from `src/components/ui.tsx`, ids starting with the topic: `ev-sed:lab:<hashKey(...)>:eff`) and the full worked solution in `Reveal`.
3. Optionally a "which formula / which case?" drill when the topic has look-alike cases.
Shared kit: `src/components/ui.tsx` (`Md Tex Answer Choice Reveal Section Callout KV Steps Step Seg Tabs isClose`), `src/labs/common.tsx` (`rng pick randInt useSeed Slider Card Grid2`), `src/labs/CheckTable.tsx`, `src/reference/common.tsx` (`RT NumIn Lookup`), `fmt` from `src/components/DiagramView`.
JSX text: never a bare `<` or `>` (write `{'<'}` or words). Figures use the theme tokens above and must work at phone width (`viewBox`, `width="100%"`).

## Verify before you finish
`npx tsc --noEmit -p .` and `npx vitest run src/env` must pass. The content test checks ids, `seen` labels, keys-in-answer, that mapped parts exist and point at real answers, and that every unsolved part has a flag.
`EV_FULL=1 npx vitest run src/env` additionally checks that every part is mapped and every number part has a solution.
Do not start dev servers, do not commit. In your report, list the parts you marked `textbook` or `none`, and anything you need from the shell.
