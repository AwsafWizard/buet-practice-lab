# CE 301 revision — handoff for the fixing agent (13 Nov 2026)

The student sits the CE 301 *Professional Practice and Communication* term final on **Tue 17 Nov 2026** and memorises this site's lists, flashcards and model answers (`src/ppc/`, route `/ce301`). The answers must follow the teachers' own material word for word. A read-only audit of everything not yet revised has been done; **your job is to apply it.**

## Where things stand
| Done and live | Commit |
|---|---|
| First revision pass: `spec`, `methods`, `law`, `ce`, `risk`, `writing`, `ethics` (+ light `docs`); TDS engine on class formulas; QCBS tie rule; paper labels (`may-2024` = **2022-23**, Jan 2021 = 2:30 h, Sec B Q5 compulsory) | a36d4c0 |
| Targeted fixes: comm process (6 slide elements), 2011-12 14(a) sender's attitude, oral 7 steps + 9 verbal strategies, leadership = 2 styles, Jan 2021 8(b) | c1a8a70 |
| `/ce301`-style links open directly | 877f22c, fef6a4a |

| Audit applied (14 Nov): `comm`, `oral`, `7cs`, `project`, `contract`, `process`, `gcc`, `services` (now `.tsx`, consultant flow chart), `docs`, leftovers in `law` / `methods` / `spec` / `risk`, and the three maps | this commit |

**Status: the four `v4_audit_*.md` audits are applied in full.** Every finding was applied as written except three optional ones left out: a figure for `a-pr-engagement`, a parenthesis on `c-ct-standard`, and an extra pump-specification answer. PPA s.37 / s.38 follow the class copy printed in the seniors' solve and the typed note ("within the as prescribed price limit"), not the older English PPA text. The rest of this file describes how that pass was run.

## Read, in this order
1. `docs/CE301_AUTHORING.md` and `src/ppc/types.ts`: data shapes and writing rules.
2. `CE301/Claude digests/v3_revise_brief.md`: the revision rules and the authority order (teacher's slide / own file > what the teacher said in class > 18-batch TF solve and Nafee's note > senior summaries > old question bank). Ignore its "six agents at the same time" section; you are alone.
3. **The audits** (one entry per finding: id, file:line, Now, **Should be** with the exact replacement text, Source, Notes for the fixer). `CE301/` is git-ignored, so these exist only on this machine.

| Audit file | Covers | Findings |
|---|---|---|
| `CE301/Claude digests/v4_audit_ia_process_gcc.md` | `process.tsx`, `gcc.tsx`, their `ia.ts` parts; 4 leftovers in spec/methods/law | 32 (7 high, 15 med, 10 low) |
| `CE301/Claude digests/v4_audit_ia_services_docs.md` | `services.ts`, `docs.ts`, their `ia.ts` parts, `engine/tds.ts`, `engine/qcbs.ts`, `Calc.tsx` | 25 (5 high, 9 med, 11 low); all TDS/QCBS numbers already match the solves |
| `CE301/Claude digests/v4_audit_oia.md` | `project.tsx`, `contract.tsx`, their `oia.ts` parts; 1 leftover in `risk.tsx` (R-26 `c-rk-hierarchy`) | 20 |
| `CE301/Claude digests/v4_audit_aan.md` | `comm.ts`, `oral.ts`, `7cs.ts`, their `aan.ts` parts | ~110 (37 WRONG, 18 MISSING, 25 WORDING, …); `writing`/`ethics` clean |

The audits were written from the `v2_*.md` digests in the same folder. Go back to a digest or the source PDFs in `CE 301 (ppc)/` only when an audit entry has confidence **low** or sits under "Open questions" (use `pdftotext -layout` or `pdftoppm` into a scratch directory, never the repo).

## Order of work (most marks at risk first)
1. **IA high items** (Section B is half the paper):
   - JV: `a-jv` must contain the exact phrase **"joint and several liability"** (Sir gives 0 without it); add the JV-agreement answer (this term's Assignment 3).
   - LD is **0.5 % per week, max 10 %** (the site says 0.05 %/day in `a-gcc-clauses`, `a-gcc-timely`, `pc-may-2024-4b`); fix retention; GCC/PCC answers in the class table **Terminology | GCC Clause | PCC Clause**.
   - `a-services-methods`: PPA s.37/38 word for word.
   - QCBS answer in the class table + N.B. (equal combined → greater technical); fix the `pc-2016-17-3c` note.
   - New `a-tor`; NOA extra for `pc-2013-14-2b` from the TF solve; arithmetic correction with ITT 44.1–44.2.
2. **`7cs.ts`**: none of v2_aan §4.7 is applied; whole topic to the L07 slide.
3. **`comm.ts` rest and `oral.ts` meetings**: barriers, non-verbal (3 body-language elements, no "smell and touch"), categories, skills order (also in the `pc-2023-24-1a` extra), `pc-2014-15-5a` map, meeting before/during/roles, group formation and problem-solution phase lists.
4. **OIA**: R-15 `a-ct-procurement`, R-11 `a-pr-cd-emphasis`, R-29 `l-pr-evolution` (Class Test 1 tested it twice), then R-13 / R-17 / R-18 and the `seen` fixes.
5. Medium and low items in every audit, then the NEW (extra-question) entries.

Work **one topic file at a time** and run the checks after each, so a half-finished run still leaves the site consistent.

## Rules the tests enforce
- Every answer `keys` entry appears verbatim (case-insensitive) in `a`; at least 3 keys; **never the `$` character** (write Tk / USD).
- Lists have ≥ 2 points; each `k` is ≤ 9 words (explanation goes in `d`); rewrite or drop a `hook` whose first letters no longer match.
- Ids unique across the course (`l-` / `c-` / `a-`). **Keep ids stable**; the student's progress is stored by id. If you remove one, remove every reference (`lists: [...]`, `ans: [...]` in the maps).
- `seen` labels exactly: `'2023-24' '2022-23' '2021-22' '2020-21' 'Jan 2021' '2017-18' '2016-17' '2015-16' '2014-15' '2013-14' '2012-13' '2011-12'`.
- Markdown: `###` headings, one-level `- ` / `1. ` lists, `**bold**`, pipe tables. Don't edit `pyq/skeleton.ts`.
- Don't invent clause numbers, figures or quotations; if a source doesn't give it, keep what's there and say so in `src`.

## Check, commit, deploy
```bash
npx tsc --noEmit
PC_FULL=1 npx vitest run src/ppc
npm run build:public
```
Then commit on `master` and push: **pushing master deploys to Vercel** (`https://tf-practice-dashboard.vercel.app/#/ce301`). If no build shows up for the commit within ~5 min, Vercel's GitHub hook missed it: Vercel dashboard → project tf-practice-dashboard → Deployments → ⋯ → Create Deployment → `master` → Deploy to Production. Check the live CE 301 bundle contains a phrase you added.

When done, update this file's "Where things stand" table and the user's memory note `ce301-dashboard-project.md`.
