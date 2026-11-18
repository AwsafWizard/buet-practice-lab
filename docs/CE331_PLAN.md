# CE 331 (Environmental Engineering I): plan

Fifth course in the Practice Lab. Route `/ce331`, code in `src/env/`, every id prefixed `ev-`.
Status and handoff notes for another agent: [CE331_HANDOFF.md](CE331_HANDOFF.md).

## What the course is

Three teachers this term (CE22 slides, January 2026):

| Teacher | Lectures | Kind |
|---|---|---|
| **Rowshan ma'am** (Dr. Rowshan Mamtaz) | L1–3 environment, ecology, climate, energy · L4–5 Bangladesh water supply, SDG 6, problem areas · L6 rainwater harvesting · L7 intakes · L8 pumps · L9 transmission · L10 water safety plan | mostly recall; RWH tank and pump maths |
| **Snigdha ma'am** | L1 water supply system · L2 demand and population forecasting · L3 groundwater hydraulics · L4 tubewells (DTW design, STW, deep-set) · L5 distribution network | half maths, half recall |
| **Tanvir sir** | T00–T03 water quality and chemistry · T04 aeration · T05 settling · T06 coagulation · T07 softening · T08 ion exchange · T09 filtration · T10 disinfection · T11–12 membranes, adsorption · T13 Fe, Mn and As removal | half maths, half recall |

The 2023-24 paper puts Tanvir sir plus Rowshan ma'am's intro/RWH/WSP in **Section A**, and Snigdha ma'am plus
Rowshan ma'am's intake, pump and water hammer in **Section B**. There are 14 papers (2007-08 → 2023-24), about half
of them scanned only.

## How the course works on the site

It mixes CE 341 (labs and engine-computed answers) with CE 301 (recall drills). Each topic gets these tabs:

| Tab | What |
|---|---|
| **Overview** | the admins' threads, how the exam asks it (marks per paper), progress, key formulas |
| **Learn** | model answers for every theory question, with figures redrawn (cone of depression, double layer, breakpoint curve, pump curves, intake types…) |
| **Lab** *(numeric topics only)* | interactive simulations that give intuition first, then exam-style problems with checks |
| **Recall** | that topic's flashcards, keyword lists, order drills, cloze, blurt |
| **Past questions** | every part, answer or worked solution on reveal |

The memorisation gym gets a new name, **Memory Well**: one place for every drill across the course (Leitner
flashcards, keyword recall, put-in-order, cloze, blurt), ordered by how often each item appears in the papers.
There's also a **sketch-from-memory** card for figures the exam asks you to draw: you sketch on paper, flip the
card and tick off the labels you got.

### Labs (for intuition on the maths)

In rough order of exam weight:
1. **Settling column**: Type I particles falling past the overflow-rate cut-off, then a Type II iso-removal
   workbench (pick H and t and watch the ΔR·h/H strips add up).
2. **Softening bench**: bar diagram builder, lime and soda doses as the bars move, split treatment with a bypass
   slider and chemical purity. Plus ion exchange (bypass, resin volume, regeneration cycle, breakthrough curve).
3. **Cone of depression**: a well in a confined or unconfined aquifer. Drag Q, K and R and watch the drawdown
   curve, then add a second well and see the cones superpose (interference).
4. **Tubewell designer**: gradation curve → D10/D60 → slot size, gravel pack, housing pipe and strainer placement,
   yield, and a drawn well log.
5. **Pump & pipeline**: elevation profile with the HGL, static + friction head, water power and input power. The
   pump curve against the system curve gives the operating point. NPSH and cavitation, and a water hammer pressure
   wave (Joukowsky).
6. **Distribution network**: dead-end branch designer with pressure along the line; Hardy Cross iterations
   animated on a loop.
7. **Population forecaster**: census points with every method overlaid (arithmetic, geometric, incremental,
   least-squares line and parabola…). Shows how far they diverge.
8. **Rainwater tank**: monthly rainfall bars against demand, cumulative mass curve, dry-months storage.
9. **Water chemistry**: carbonate species vs pH, alkalinity and hardness split, Henry's law; coagulant alkalinity
   use; breakpoint chlorination curve; dose vs colloid concentration zones.
10. **Demand & fire flow**: Kuichling / Freeman / NBFU against population, fire streams, storage.

Every number in a solution comes from an engine (tested against the class's own worked examples), as in CE 341.

### Missing solutions are marked

Every past-paper part says where its answer comes from: **CE22 slides**, **class notes**, **older slides
(CE21/CE19)**, **seniors' notes (Nafee vai)** or **textbook (not in this term's material)**. A part nobody can
solve from the sources (a missing figure, an unreadable scan) is marked **⚠ No source solution**, and the Papers
page can filter to those.

## Order of work (token-aware)

1. **Reading** (4 background agents on a lighter model): digests of the CE22 slides per teacher plus a full
   transcription of every paper, in `CE 331 (Envo-1)/Claude digests/` (gitignored).
2. **Gap pass**: past-paper parts the CE22 digests don't answer get a targeted look in the CE21/CE19 slides, the
   class notes and Nafee vai's notes. Only those pages are read.
3. **Shell** (me): fork of the CE 301 shell, the new theme, course picker card, routes, Papers, planner, mock exam,
   Memory Well, then engines with tests.
4. **Content** (≤ 3 agents at a time, one per teacher): lists, cards, answers and the paper map, following
   `docs/CE331_AUTHORING.md`.
5. **Labs**, by exam weight.
6. **Verify** (typecheck, tests, browser check in light and dark), update the handoff README, commit. Pushing (=
   deploying) only when you say so.

If the session runs low, `docs/CE331_HANDOFF.md` says what is done, what's next and which digest to read.
