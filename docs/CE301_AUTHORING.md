# CE 301 (Professional Practice & Communication) authoring guide

CE 301 lives in `src/ppc/` (route `/ce301`, every id prefixed `pc-`). The course is pure recall, so the content is **data**, not React modules: lists, flashcards and model answers per topic, and a map from each past-paper part to the answers that answer it. The Lab builds every drill from that data:

| Drill | Built from |
|---|---|
| Flashcards (Leitner boxes) | every `PcCard`, plus one card per `PcList` ("Name the 8 ways of …" → the points) |
| Keyword recall (type what you remember) | every `PcList` (`k` + `alt` decide what counts) |
| Put in order | lists with `ordered: true` |
| Cloze (fill the blanked keywords) | every `PcAnswer` (its `keys` are blanked in `a`) |
| Blurt (write the answer, see which keywords you hit) | every `PcAnswer` and every past-paper part (its answers' `keys`) |

Types: `src/ppc/types.ts` (read it first). Topics: `src/ppc/registry.ts`.

## Sources (read the digests, not the PDFs)
`CE301/Claude digests/`: `lec_procurement.md` (IA sir), `lec_project_legal.md` (OIA Ma'am, Tanvir sir's slides), `lec_communication.md` (AAN sir / Kabirul sir), `papers_new.md` (2016-17, 2017-18, 2023-24 as printed), `src/question_bank.txt` (earlier Claude-made answers for 9 papers; standard texts, NOT the teachers), `part_owners.md` (which block answers which part).
**The teacher's material wins** over the question bank. Where they differ, write the teacher's version and mention the other in `note` (lists) or a short line at the end of the answer ("Some books give …"). Content with no class source says so in `src` (`'question bank only (Lesikar)'`).

## File ownership (parallel agents: touch ONLY your own files)
| Block | Topic files | Paper map |
|---|---|---|
| IA sir — procurement | `src/ppc/content/law.ts methods.ts process.ts docs.ts gcc.ts spec.ts services.ts` | `src/ppc/pyq/ia.ts` exports `IA_MAP` |
| OIA Ma'am — project & legal | `src/ppc/content/ce.ts project.ts contract.ts risk.ts` | `src/ppc/pyq/oia.ts` exports `OIA_MAP` |
| AAN sir — communication & ethics | `src/ppc/content/comm.ts 7cs.ts writing.ts oral.ts ethics.ts` | `src/ppc/pyq/aan.ts` exports `AAN_MAP` |

A topic file is `src/ppc/content/<suffix>.ts` (or `.tsx` when it has a `Fig`) for topic `pc-<suffix>`, with `export default { lists, cards, answers } satisfies PcTopicContent`. The index (`content/index.ts`), pages, engines and tests are the shell's — do not edit them; if you need something, say so in your report.

## Writing rules
**Lists (`PcList`)** — one per list an examiner can ask ("name / list / what are the … "). This is the most important data in the course.
- `id` `l-…`, unique across the course (prefix with something topic-ish: `l-risk-ways`, `l-tender-flow`).
- `points[].k`: the keyword as you'd write it in the script, 1–7 words, teacher's wording. `alt`: other wordings that should also count when typed (question-bank wording, abbreviations like `'DBB'`, a shorter form like `'indemnity'`). Matching is forgiving (stemming, typos, half the meaning words of a phrase), so `alt` is for genuinely different words. `d`: one plain line of explanation.
- `ordered: true` only when order is examined or matters (flow charts, documents in order of priority, steps, phases).
- `hook`: a memory hook that genuinely helps: first-letter mnemonic, a sentence or a picture ("**C**an **C**ats …"). Skip it for lists of ≤ 3 points or when nothing natural fits. Never put the answer itself in the hook in full.
- `seen`: labels exactly as in `PC_PAPERS`: `'2023-24' 'May 2024' '2021-22' '2020-21' 'Jan 2021' '2017-18' '2016-17' '2015-16' '2014-15' '2013-14' '2012-13' '2011-12'`. Frequency drives the drill order, so get it right.
- `src`: `'Tanvir sir L5 p4'`, `'PPR 2008 r.98(2)'`, `'Kabirul sir note ch.3'`, `'question bank only'`.

**Cards (`PcCard`)** — definitions, distinctions (Act vs Regulation, DBB vs DB, bid vs performance bond), numbers (tender security %, validity days), who-does-what, one-line "why" facts. `front` is a question; `back` ≤ 60 words. Don't duplicate a list as a card (lists become cards automatically). Aim for 10–25 per topic.

**Answers (`PcAnswer`)** — one per *distinct* question (merge repeats; `seen` lists every paper). `a` is the answer that scores full marks at the most-asked mark value: about one point per 2–3 marks, headings `###`, numbered points led by the **bold keyword** then one line. Tables with pipes for GCC/PCC, TDS, BoQ, procurement plan. `keys`: 5–15 keywords/short phrases the examiner looks for; **each must appear verbatim (case-insensitive) in `a`** (a test checks). `lists`: the list ids it uses. `Fig`: an SVG sketch (flow chart, triangle, organisation diagram) when the question says draw/show/flow chart — use only theme tokens `var(--c-ink) var(--c-mute) var(--c-line) var(--c-panel) var(--c-panel2) var(--c-accent) var(--c-accent2)` and the block colours `var(--c-ia) var(--c-oia) var(--c-aan)`; it must read in light and dark; `viewBox` with `width="100%"`, text ≥ 11px.

**Paper map (`PcPartMap`)** — every part id listed for your block in `part_owners.md` gets an entry: `topics` (1–2), `ans` (answer ids in the order you'd write them), and where needed `extra` (markdown specific to that paper: its numbers, the BoQ for 50 m³ brickwork, the bridge's TDS, an extra sub-part no shared answer covers), `calc` (QCBS / TDS — the shell renders the worked solution from the engine; still explain the method in an answer), `flag` (outside this term's material, e.g. "Not in IA sir's material this term"), `notes` (doubtful readings). A part whose wording asks several things lists several answers.

Markdown (`Md`): `###` headings, `- ` and `1. ` lists (one level only), `**bold**`, `*italic*`, pipe tables. **Never use `$`** (it starts TeX) — write `Tk`, `USD`. Plain ASCII quotes are fine inside template literals; escape backticks.

## Verify before you finish
`npx tsc --noEmit` and `npx vitest run src/ppc` must pass (the content test checks ids, `seen` labels, keys-in-answer, every mapped part exists and points at real answers). Do not start dev servers, do not commit.
