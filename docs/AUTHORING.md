# Authoring past-paper questions (PYQs)

Every paper lives in `src/pyq/papers/pYYYY.tsx` and exports `QYYYY: PYQ[]` (type in `src/pyq/types.ts`).
**`src/pyq/papers/p2023.tsx` is the reference implementation — read it fully before writing anything.**

## Rules
- Edit ONLY your own paper file(s). Do not touch engines, kit, components or other papers. If you hit an engine/kit bug or
  missing feature, work around it locally inside your paper file and mention it in your final report.
- Every number in a solution must come from the engines (`src/engine/*`) or be simple arithmetic shown in the text —
  never hand-type a final answer you did not compute.
- Read each figure from the scans at high resolution. Render pages yourself:
  `pdftoppm -r 170 -f N -l N -png "Notes and Files/CE-311 All Question Papers.pdf" <your-scratch-dir>/p` and crop/zoom
  with PIL. Pages are 1-based; the page map is in `src/pyq/types.ts` (`PAPERS[].pages`).
- When a figure is ambiguous (blurry dimension, unclear support), choose the most plausible reading and write it in
  `notes: [...]`. Never silently guess.
- Keep the question `text` faithful to the paper (you may tidy wording, add the key numbers from the figure in words).
  Markdown subset: paragraphs, `- ` lists, `**bold**`, `$inline math$`, `$$display$$`.
- Units: keep the paper's units (kip, ft, k-ft; kN, m). E in ksi with I in in⁴ → EI in k-ft² is `E*I/144`.
- In JSX text never write a bare `<` or `>` (use words or `{'<'}`).

## PYQ fields
```ts
{
  id: '2022-23-A1a',            // paper-section+number (+part letter)
  paper: '2022-23', sec: 'A', no: '1(a)', marks: 28,
  topics: ['lateral'],          // TopicId: frames truss ild floor wheel lateral vertical stability code wind eq vw cable
  title: 'Portal method: 2-bay, 2-storey frame',   // short, specific
  pages: [58, 59],              // scan pages holding the text + figure
  text: `...markdown...`,
  figure?: () => <Figure model={m} />,           // redrawn figure (recommended for every structure)
  checks?: () => [{ key, label, value, unit?, tol?, magnitude? }],   // 2–4 key answers the student types in
  solution?: () => <>...</>,                     // full worked solution
  notes?: string[],                              // assumptions / figure reading
  legacy?: string,                               // for BNBC-1993 wind/EQ questions recast to BNBC 2020
}
```
Topic classification: truss influence lines (bar-force ILD, counters, max bar force from moving loads) → `floor`;
beam/frame ILDs and max effects of uniform + roving loads → `ild`; wheel-load trains (incl. on trusses, max reaction) → `wheel`;
determinate frames & compound beams SFD/BMD/AFD → `frames`; member forces & X-braced approximation → `truss`;
portal / cantilever / truss-on-column bents → `lateral`; 0.1L gravity method → `vertical`; deflections → `vw`;
cables / suspension bridges / three-hinged arches → `cable`.

## Building models (`src/kit/builders.ts`)
- `beamOf('A:0:pin B:10 C*:15 D:25:roller E:30')` — straight beam; `*` = internal hinge; supports `pin|roller|fixed|link|guide`,
  `roller@0` = horizontal reaction direction. Member ids are node pairs: `AB`, `BC`, …
- `model(nodesSpec, membersSpec, supportsSpec, loads, {EI?, EA?})` — frames. nodes `'A:0,0 B:0,12 C*:10,12'`,
  members `'A-B B-C'` (id `AB`; custom id `X=A-B`; `oA-B` releases moment at the A end, `A-Bo` at the B end).
- `truss(nodes, members, supports, loads)` — all pin-ended bars.
- Loads (down/right positive arguments): `P(node, down)`, `H(node, right)`, `F(node, fx, fy)`, `Mo(node, ccw)`,
  `Pm(member, a, down)` point on member at distance a from end i, `Mm(member, a, ccw)`, `W(member, down, {a?, b?, proj?})`
  uniform, `Wv(member, w1, w2, …)` linearly varying, `Wx(member, right1, right2?)` horizontal distributed, `Wn` normal.
  Every load takes an optional display `label`.
- `floorSystem({ floorBeams, stringers: [[x0,x1],…], supports: [{x,type}], names: {x:'A'} })` → `{ model, path, fbr(x),
  shear(x), moment(x), reaction(x) }` responses for girder-with-floor-beam questions (stringers may overhang).
- Coordinates: x right, y up. Member local axis i→j; for horizontal beams build left→right so shear signs are textbook.

## Engines
- `solve(model)` (frame2d) → `.reaction(node)` {rx, ry, m}, `.member(id).N(x)/V(x)/M(x)` (x from end i; side -1/+1 at jumps),
  `.disp(node)`. Throws `UnstableError` for mechanisms.
- `influenceLine(model, path, response)` (ild) — path `{kind:'members', members:[...]}` (direct loading) or
  `{kind:'panel', nodes:[...]}` (truss panel points). Responses: `{kind:'reaction',node,comp:'y'|'x'|'m'}`,
  `{kind:'shear'|'moment'|'axial', member, x, side?}`, `{kind:'force', member}` (truss bar), `{kind:'custom', fn}`.
  Helpers `ildAt(ild, x, side)`, `ildAreas`, `ildExtremes`.
- `moving.ts`: `Train {P:[...], gaps:[...], udl?}`, `trainExtremes(ild, train)` (exhaustive max/min, both directions),
  `absoluteMaxMoment(L, train)`, `uniformPlusConcentrated(ild, w, P, wd)`, `ssMomentILD(L,a)`, `ssShearILD(L,a)`.
- `approx.ts`: `portalMethod(g)`, `cantileverMethod(g)` with `GridFrame {xs, heights (bottom first), loads (per floor level,
  bottom first, + right), loadSide?, base?, areas?}`; `xBraced(model, pairs, 'both'|'tension')`; `verticalApprox(g, w)`.
- `vw.ts`: `virtualWork(model, realLoads, virtualLoads, {EI?, EA?, GA?, shear?, axial?, dL?, settle?})`.
- `wind.ts`, `eq.ts`, `llr.ts`, `determinacy.ts`, `cable.ts` — BNBC 2020 / cable / arch formulas.

## Solution components
- `src/kit/solutions.tsx`: `Figure`, `FrameSolution` (reactions + SFD/BMD/AFD + member table), `TrussSolution`
  (`asked` members highlighted; pass `forces` map for approximate methods), `ILDStack` (structure + stacked ILDs + ordinate
  table), `MaxEffect` (uniform + roving + dead), `TrainOnILD` (wheel trial table + exhaustive check), `AbsMaxSolution`,
  `ApproxSolution` (portal/cantilever tables + diagrams), `VWSolution` (member integrals table), `ReactionsTable`.
- `src/kit/loads.tsx`: `WindAnalytical`, `KztSolution`, `GustRigidSolution`, `EQSolution`, `eqResult`, `buildingFloors`,
  `SpectrumPlot`, `LLRSolution`, `DeterminacyCard`, `WindLoadCases`.
- `src/kit/cables.tsx`: `SuspensionSolution`, `ArchSolution`, `FnPlot`; cable formulas in `src/engine/cable.ts`
  (`cablePointLoads`, `parabolicCable`).
- `Md` (markdown) and `Tex` (KaTeX) from `src/components/ui.tsx`; `fmt` from `src/components/DiagramView.tsx`.
Write the solution like a good tutor: 1–3 short paragraphs on the idea / method (as taught: method of sections, ILD by
statics or Müller-Breslau, criterion for wheel loads…), then the engine-backed component(s), then the final answers in bold.

## Verify (mandatory)
`PAPER=2022-23 npx vitest run src/pyq` must pass and prints every check value — sanity-check them by hand (statics,
symmetry, orders of magnitude). Also run `npx tsc --noEmit`. Visual check (optional):
`google-chrome --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=6000 --window-size=1400,2600 --screenshot=out.png "http://localhost:5173/#/q/<id>?sol=1"`
(dev server is usually already running on port 5173).

## Extract as PDF (every course, every problem)
Every problem card and every theory card carries a ⋮ menu with **Extract as PDF**, **Open on its own page** and **Copy the question text**. The machinery is shared in `src/components/ExportPdf.tsx`; a new course only wires it in:
- **Problem cards** (past questions and practice problems): put `<ProblemMenu doc={() => <ProblemDoc … />} filename={pdfName('CE xxx', paper, 'Q' + no)} footer="CE xxx Practice Lab" permalink=… copy=… />` at the top right of the card header, next to (not inside) the header's toggle button. `ProblemDoc` prints the question, the figure, what was given with the paper, the key answers (`checks`), the full solution and the assumptions. See `src/rc/components/RcQuestionCard.tsx` for a worked example.
- **Theory cards** (a question with a markdown model answer): `<ProblemMenu doc={() => <TheoryDoc … />} … />`, as in `src/rc/components/TheoryList.tsx`.
- **Recall courses** with their own answer shapes (CE 301) build their own documents from `PrintHead` / `PrintLabel` and call `exportPdf`, as in `src/ppc/components/ExportPdf.tsx`.
- The page renders in the white print style `.print-doc` (`src/styles.css`). A new colour token the course's figures use must get a light value there, or it prints in the dark theme's colour.
- While printing, `PrintMode` (from `components/ui.tsx`) is true: `Reveal` blocks print open, so a solution's collapsed steps appear in the PDF.
- Add the course's card to `src/components/ExportPdf.test.tsx`; the test checks that the menu is there and that every problem renders as a printable document.
