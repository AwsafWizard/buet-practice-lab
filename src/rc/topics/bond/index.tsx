// rc-bond — Bond, anchorage & detailing (Nilson Ch. 5/6, class handnote Chapter 6).

import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { Card, Grid2 } from '../../../labs/common'
import { RcFrequency } from '../../components/Frequency'
import {
  bar, beamBarGeometry, columnAnchorage, compressionLap, cutoff, hookFactors, hookGeometry, ktr, ldcCalc, ldGeneral, ldhCalc, ldSimplified, psiFactors, simplifiedCase,
  spliceClass, tensionLap, tieAreaCheck, upIn,
} from '../../engine/bond'
import { wu as wuOf } from '../../engine/materials'
import type { RcQ, RcTopicModule } from '../../types'
import { CutoffSketch, StdCutoffFig } from './figs'
import { BondDesignProblems } from './DesignProblems'
import { BarGeoExplainer } from './geo'
import { BondLab } from './lab'
import { BOND_THEORY } from './theory'
import { PickSection } from '../../components/PickDrill'
import { BOND_PICKS } from './picks'

const f = (v: number, d = 2) => fmt(v, d)
const T = ({ children }: { children: string }) => <Tex block>{children}</Tex>

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Bond, anchorage & detailing" sub="Can the bar actually develop fy where we need it? Straight, hooked, compression, lapped — and where may bars stop?">
        <Grid2>
          <div className="text-sm space-y-2">
            <Md>{`Every problem here is one question: **is there enough embedded length to develop the bar's stress?** The concrete must pass the force into the bar by bond (adhesion, friction, rib bearing), and it fails by **pull-out** or, more often, **splitting**.

**How it is asked (72 sub-questions in 19 papers, about 60 % theory):**
- **Theory pack in every paper** (often a full 35-mark question): factors affecting ld (15 papers), standard cut-off/bend-point sketch for equal spans (10), column lap lengths (8), Class A/B splices (6), hooks, bundled bars, why extend d or 12db.
- **ld of two bar sizes, top vs other bars** (simplified equation, often mm bars: 16/20/25 mm) — 8 papers; #6 and #9 compared with 90° hooks.
- **Cantilever set:** top bars hooked into the column (does ldh fit?), cut-off of the centre bar, splice length.
- **Cut-off from a moment diagram** (simply supported or cantilever) and **detail drawings** of continuous beams from an As list.`}</Md>
          </div>
          <Card title="Questions per paper">
            <RcFrequency topic="rc-bond" />
          </Card>
        </Grid2>
      </Section>
      <Section title="Key formulas (US units, f′c and fy in psi, √f′c ≤ 100)">
        <div className="grid cq-lg:grid-cols-2 gap-4 text-sm">
          <div>
            <Md>{`**Simplified (Table 6.1)** — first row: clear spacing ≥ db, cover ≥ db + min stirrups, or spacing ≥ 2db + cover ≥ db
$$\\ell_d = \\frac{f_y\\psi_t\\psi_e}{25\\lambda\\sqrt{f'_c}}d_b\\ (\\le\\#6),\\qquad \\frac{f_y\\psi_t\\psi_e}{20\\lambda\\sqrt{f'_c}}d_b\\ (\\ge\\#7)$$
other cases: 3/50 and 3/40.

**General (Eq. 6.4)**
$$\\ell_d = \\frac{3}{40}\\frac{f_y}{\\lambda\\sqrt{f'_c}}\\frac{\\psi_t\\psi_e\\psi_s}{(c_b+K_{tr})/d_b}d_b,\\quad K_{tr} = \\frac{40A_{tr}}{sn}$$
(cb + Ktr)/db ≤ 2.5, ψtψe ≤ 1.7, ld ≥ 12 in; × As,req/As,prov.`}</Md>
          </div>
          <div>
            <Md>{`**Hook** $\\ell_{dh} = \\dfrac{f_y\\psi_e\\psi_c\\psi_r}{50\\lambda\\sqrt{f'_c}}d_b \\ge 8d_b, 6$ in (ψc 0.7, ψr 0.8)

**Compression** $\\ell_{dc} = \\max\\left(\\dfrac{f_y}{50\\lambda\\sqrt{f'_c}}, 0.0003f_y\\right)d_b \\ge 8$ in (× 0.75 confined)

**Tension lap** Class A 1.0 ld (As,prov ≥ 2As,req AND ≤ 50 % spliced), else Class B 1.3 ld; ≥ 12 in; no excess factor.

**Compression lap** 0.0005fy db (fy ≤ 60 ksi) or (0.0009fy − 24)db; ≥ 12 in; +⅓ if f′c < 3000; × 0.83 tied / 0.75 spiral.

**Cut-off** extend max(d, 12db); ld from max stress; ⅓ (¼) of +As 6 in into support; ⅓ of −As past IP by max(d, 12db, ln/16).`}</Md>
          </div>
        </div>
        <Callout kind="exam">Hook formula: the slides and handnote use the ACI 318-11/14 form fy ψe ψc ψr / (50λ√f′c) (= 0.02 fy/√f′c). The lab and code pane use the same, and treat mm bars by their nearest US size (20 mm → No. 6 column, 25 mm → No. 8).</Callout>
        <p className="text-sm text-mute">Open the Lab tab for a calculator in six modes, the Theory tab for model answers to every paper question, and the code pane (Bond group) for Tables 6.1, A.10, A.11 and the cut-off figures.</p>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Box({ t, children, tone = 'var(--c-accent)' }: { t: string; children: ReactNode; tone?: string }) {
  return (
    <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: tone, background: `color-mix(in oklab, ${tone} 7%, transparent)` }}>
      <div className="font-bold" style={{ color: tone }}>
        {t}
      </div>
      <div className="text-mute text-[13px] leading-snug">{children}</div>
    </div>
  )
}

function Approach() {
  // Handnote Example 6.1 / 6.2 through the engine
  const b11 = bar('#11')
  const g = beamBarGeometry({ b: 10, cover: 1.5, ds: 0.375, db: b11.db, n: 2, faceCenter: 3 })
  const cs = simplifiedCase({ db: b11.db, clearSpacing: g.clearSpacing, clearCover: g.clearCover, stirrupsMin: true })
  const psi = psiFactors({ db: b11.db, small: false, top: true })
  const ex = 2.9 / 3.12
  const a = ldSimplified({ db: b11.db, small: false, fc: 4000, fy: 60000, met: cs.met, psiT: psi.psiT, excess: ex })
  const K = ktr(2 * 0.11, 5, 2)
  const c = ldGeneral({ db: b11.db, fc: 4000, fy: 60000, psiT: psi.psiT, psiS: psi.psiS, cb: g.cb, Ktr: K, excess: ex })
  const hf = hookFactors({ no: 11, sideCover: 4.9, tailCover: 2 })
  const h = ldhCalc({ db: b11.db, fc: 4000, fy: 60000, psiC: hf.psiC, psiR: hf.psiR, excess: ex })
  const fit = columnAnchorage({ colDepth: 21, backCover: 2, ldStraight: c.final, ldh: h.final })
  const hg = hookGeometry(11, b11.db, 90)
  return (
    <div>
      <Section title="Recipe — any development problem" sub="The handnote's universal routine; the same eight steps for ld, ldh, ldc and splices.">
        <Steps>
          <Step n={1} title="What is asked?">Tension or compression? Does the bar end straight, in a hook, a head, or a lap?</Step>
          <Step n={2} title="Bar data">db, Ab, √f′c (≤ 100 psi). mm bars: db = mm/25.4; use the nearest US size for the #6 / #7 split.</Step>
          <Step n={3} title="Geometry">Table 6.1 needs CLEAR spacing and CLEAR cover. Eq. 6.4 needs CENTRE distances: cb = min(centre to side, centre to top/bottom, ½ c/c spacing); Atr = all legs if ½-spacing governs, one leg if cover governs; s = largest spacing within ld.</Step>
          <Step n={4} title="Factors and caps">ψt = 1.3 top bars; ψe = 1.5 / 1.2 epoxy; ψtψe ≤ 1.7; ψs = 0.8 (≤ #6, Eq. 6.4 only); λ = 0.75 lightweight. Hooks: ψc = 0.7 (side ≥ 2.5 in, tail ≥ 2 in), ψr = 0.8 (ties ≤ 3db). Compression: ψr = 0.75.</Step>
          <Step n={5} title="Compute">ld (Table 6.1 or Eq. 6.4 with (cb+Ktr)/db ≤ 2.5), ldh, ldc, or lst / lsc.</Step>
          <Step n={6} title="Excess steel">× As,req/As,prov for development only — never for lap splices.</Step>
          <Step n={7} title="Minimums">ld ≥ 12 in; ldh ≥ max(8db, 6 in); ldc ≥ 8 in; laps ≥ 12 in.</Step>
          <Step n={8} title="Compare and round up">Available length (column depth − cover, distance to the free end …) vs required; round up to the whole inch.</Step>
        </Steps>
      </Section>

      <Section title="Clear spacing, clear cover and cb" sub="Table 6.1 uses CLEAR distances (bar surface to surface); Eq. 6.4 uses distances to the bar CENTRE. Change the section and watch every step.">
        <BarGeoExplainer />
      </Section>

      <Section title="Which formula?" sub="Start from how the bar ends.">
        <div className="grid cq-md:grid-cols-3 gap-3">
          <Box t="Straight bar, tension">
            Question says "simplified" or gives no stirrup data → <b>Table 6.1</b> (first row if spacing/cover OK, else other cases; #6− uses 25, #7+ uses 20). Stirrups, cover, spacing given and asked to save length → <b>Eq. 6.4</b>.
          </Box>
          <Box t="Not enough room (column)" tone="var(--c-bad)">
            Straight ld &gt; column depth − cover → <b>standard hook</b>, ldh (Eq. 6.6); then bend D and 12db tail. Still too long → ties at ≤ 3db (ψr 0.8), smaller bars, headed bar.
          </Box>
          <Box t="Compression bar" tone="var(--c-good)">
            Column bars, dowels → <b>ldc</b> = larger of the two; × 0.75 if spiral / #4 ties ≤ 4 in. No hooks, no top-bar factor.
          </Box>
          <Box t="Tension lap" tone="var(--c-load)">
            ld (no excess factor) → Class A only if As,prov ≥ 2As,req AND ≤ 50 % spliced, else <b>Class B 1.3 ld</b>.
          </Box>
          <Box t="Compression / column lap" tone="var(--c-load)">
            lsc = 0.0005fy db (≤ 60 ksi); +⅓ if f′c &lt; 3000; mixed sizes → max(ldc of larger, lsc of smaller); × 0.83 tied (0.0015hs) / 0.75 spiral.
          </Box>
          <Box t="Where can bars stop?" tone="var(--c-mute)">
            Moment diagram given → theoretical point (Mu = φMn of the continuing bars) + max(d, 12db), and ld checks. Equal spans, UDL, no diagram → standard <b>L/3, L/4, L/8</b> figure.
          </Box>
        </div>
      </Section>

      <Section title="Common traps">
        <Callout kind="trap">Centre-to-centre spacing in Table 6.1 (it needs CLEAR spacing and cover) — or clear distances in Eq. 6.4 (it needs distances to the bar CENTRE).</Callout>
        <Callout kind="trap">Forgetting ψt = 1.3 for negative (top) bars of a deep beam or a cantilever — cantilever top bars always have more than 12 in of concrete below when h ≥ 15 in.</Callout>
        <Callout kind="trap">Using the closest (3 in) stirrup spacing in Ktr — use the largest spacing within ld. Wrong Atr: horizontal plane → both legs; vertical plane → one leg.</Callout>
        <Callout kind="trap">Not capping (cb + Ktr)/db at 2.5 or ψtψe at 1.7; applying As,req/As,prov to a lap splice; taking ldc of the smaller bar / lsc of the larger bar in a mixed-size compression lap (it is the opposite).</Callout>
        <Callout kind="trap">Cut-off: extending d or 12db but forgetting the ld checks (cut bars from the max-stress point, continuing bars past the theoretical point) — in cantilevers ld usually governs, not the extension.</Callout>
      </Section>

      <Section title="Worked: handnote Examples 6.1 and 6.2 (engine numbers)" sub="2 No. 11 top bars at a column face; As,req = 2.90, As,prov = 3.12 in²; b = 10, d = 18, h = 21 in; No. 3 stirrups (5 in max spacing); f′c = 4000 psi, fy = 60 ksi.">
        <div className="text-sm space-y-2">
          <b>Geometry</b>
          <p>
            Clear spacing = 10 − 2(1.5 + 0.375 + 1.41) = {f(g.clearSpacing)} in = {f(g.clearSpacing / b11.db)} db; clear side cover = {f(g.clearSide, 3)} in; {cs.why}. ψt = 1.3 (18 in of concrete below), ψe = λ = ψs = 1.0.
          </p>
          <b>(a) Table 6.1</b>
          <T>{`\\frac{\\ell_d}{d_b} = \\frac{60000\\times 1.3}{20\\times 63.25} = ${f(a.ratio, 1)};\\ \\ell_d = ${f(a.ld0, 1)}\\times\\frac{2.90}{3.12} = ${f(a.ld, 1)} \\Rightarrow \\mathbf{${upIn(a.final)}\\text{ in}}`}</T>
          <p>(b) Table A.10, top bars, f′c = 4000, fy = 60: ld/db = 62 — the same.</p>
          <b>(c) Eq. 6.4</b>
          <T>{`c_b = \\min(${f(g.cSide)},\\,${f(g.cFace)},\\,${f(g.halfSpacing)}) = ${f(g.cb)};\\ K_{tr} = \\frac{40\\times 0.22}{5\\times 2} = ${f(K)};\\ \\frac{c_b+K_{tr}}{d_b} = ${f(c.conf)} \\le 2.5`}</T>
          <T>{`\\frac{\\ell_d}{d_b} = \\frac{3}{40}\\cdot\\frac{60000}{63.25}\\cdot\\frac{1.3}{${f(c.confUsed)}} = ${f(c.ratio, 1)};\\ \\ell_d = ${f(c.ld0, 1)}\\times 0.929 = ${f(c.ld, 1)} \\Rightarrow \\mathbf{${upIn(c.final)}\\text{ in}}`}</T>
          <b>Example 6.2 — hook into the 21 in column (2 in back cover)</b>
          <T>{`\\ell_{dh} = \\frac{60000\\times 0.7}{50\\times 63.25}\\times 1.41 = ${f(h.ld0, 1)};\\ \\times 0.929 = ${f(h.ld, 1)} \\Rightarrow ${upIn(h.final)}\\text{ in} \\le 21 - 2 = ${f(fit.available)}\\text{ in (fits)}`}</T>
          <p>
            ψc = 0.7 (side cover ≈ 4.9 in, tail cover 2 in), ψr = 1.0 (ties not at ≤ 3db). Hook: 90°, inside bend 8db = {f(hg.D)} in, tail 12db = {f(hg.tail)} in. Straight ld = {upIn(c.final)} in would not fit.
          </p>
        </div>
      </Section>

      <Section title="Standard cut-off figure (memorise)" sub="Asked in 10 of 19 papers. L = clear span.">
        <StdCutoffFig />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div className="space-y-6">
      <PickSection topic="rc-bond" skills={BOND_PICKS} />
      <BondDesignProblems />
      <BondLab />
    </div>
  )
}

// ---------------------------------------------------------------- practice problems
const P = (q: Omit<RcQ, 'paper' | 'sec' | 'topics' | 'pages'>): RcQ => ({ ...q, paper: 'own', sec: 'B', topics: ['rc-bond'], pages: [] })

// 1 — bottom bars, simplified vs general
const p1 = () => {
  const b9 = bar('#9')
  const g = beamBarGeometry({ b: 14, cover: 1.5, ds: 0.375, db: b9.db, n: 4 })
  const cs = simplifiedCase({ db: b9.db, clearSpacing: g.clearSpacing, clearCover: g.clearCover, stirrupsMin: true })
  const ex = 3.6 / 4.0
  const a = ldSimplified({ db: b9.db, small: false, fc: 4000, fy: 60000, met: cs.met, excess: ex })
  const K = ktr(g.legs * 0.11, 8, 4)
  const c = ldGeneral({ db: b9.db, fc: 4000, fy: 60000, cb: g.cb, Ktr: K, excess: ex })
  return { b9, g, cs, ex, a, K, c }
}
// 2 — cantilever: anchorage + cut-off
const p2 = () => {
  const b9 = bar('#9')
  const h = 22,
    d = 19.5,
    L = 9
  const sw = ((12 * h) / 144) * 0.15
  const w = wuOf(1.2 + sw, 1.8)
  const ld = ldSimplified({ db: b9.db, small: false, fc: 4000, fy: 60000, met: true, psiT: 1.3 })
  const hf = hookFactors({ no: 9, sideCover: 2.5, tailCover: 2 })
  const ldh = ldhCalc({ db: b9.db, fc: 4000, fy: 60000, psiC: hf.psiC, psiR: hf.psiR })
  const fit = columnAnchorage({ colDepth: 20, backCover: 2, ldStraight: ld.final, ldh: ldh.final })
  const dg = { kind: 'cant' as const, L, wu: w, P: 0 }
  const r = cutoff({ dg, b: 12, d, fc: 4000, fy: 60000, bar: b9, nTotal: 3, nCut: 1, ld: ld.final, endEmbed: 2 })
  return { b9, sw, w, ld, hf, ldh, fit, dg, r, d, L }
}
// 3 — mm bars + Class B
const p3 = () => {
  const r = (id: string, top: boolean) => {
    const b = bar(id)
    return ldSimplified({ db: b.db, small: b.small, fc: 3500, fy: 60000, met: true, psiT: top ? 1.3 : 1 })
  }
  const cls = spliceClass(1.5, 100)
  const lap = tensionLap(r('25mm', false).ld, cls.cls)
  return { r, cls, lap }
}
// 4 — compression lap, mixed sizes
const p4 = () => {
  const t3 = tieAreaCheck(16, 12, 2 * 0.11)
  const t4 = tieAreaCheck(16, 12, 2 * 0.2)
  const c3 = compressionLap({ db: 1.0, fy: 60000, fc: 3000, dbLarge: 1.27, tiedOK: t3.ok })
  const c4 = compressionLap({ db: 1.0, fy: 60000, fc: 3000, dbLarge: 1.27, tiedOK: t4.ok })
  return { t3, t4, c3, c4, ldc10: ldcCalc({ db: 1.27, fc: 3000, fy: 60000 }) }
}

const problems: RcQ[] = [
  P({
    id: 'rc-own-bond-1',
    level: 'exam',
    no: '1',
    marks: 15,
    title: 'Bottom bars: Table 6.1 vs Eq. 6.4',
    text: 'A 14 in wide beam has 4 No. 9 bottom bars in one layer, No. 3 stirrups at 8 in (≥ code minimum), 1.5 in clear cover to the stirrups. f′c = 4000 psi, fy = 60,000 psi, normalweight, uncoated. As,req = 3.60 in², As,prov = 4.00 in². Find ld by (a) the simplified equation and (b) the general equation.',
    checks: () => {
      const { a, c, g } = p1()
      return [
        { key: 'cs', label: 'clear spacing', value: g.clearSpacing, unit: 'in' },
        { key: 'a', label: 'ld simplified', value: a.final, unit: 'in' },
        { key: 'cb', label: 'cb', value: g.cb, unit: 'in' },
        { key: 'c', label: 'ld general', value: c.final, unit: 'in' },
      ]
    },
    solution: () => {
      const { b9, g, cs, ex, a, K, c } = p1()
      return (
        <div className="text-sm space-y-2">
          <T>{`s_{c/c} = \\frac{14 - 2(1.5 + 0.375 + 0.564)}{3} = ${f(g.spacingCC, 3)};\\ s_{clear} = ${f(g.clearSpacing, 3)}\\text{ in} = ${f(g.clearSpacing / b9.db)}d_b`}</T>
          <p>{cs.why}. Bottom bars, uncoated: ψt = ψe = 1.0.</p>
          <T>{`\\text{(a)}\\ \\ell_d = \\frac{60000}{20\\times 63.25}\\times 1.128\\times ${f(ex, 2)} = ${f(a.ld, 1)} \\Rightarrow ${upIn(a.final)}\\text{ in}`}</T>
          <T>{`\\text{(b)}\\ c_b = \\min(${f(g.cSide, 3)},\\ ${f(g.halfSpacing, 3)}) = ${f(g.cb, 3)};\\ K_{tr} = \\frac{40\\times ${f(g.legs * 0.11)}}{8\\times 4} = ${f(K, 3)};\\ \\frac{c_b+K_{tr}}{d_b} = ${f(c.conf, 3)}`}</T>
          <T>{`\\ell_d = \\frac{3}{40}\\cdot\\frac{60000}{63.25}\\cdot\\frac{1.0}{${f(c.confUsed, 3)}}\\times 1.128\\times ${f(ex, 2)} = ${f(c.ld, 1)} \\Rightarrow ${upIn(c.final)}\\text{ in}`}</T>
        </div>
      )
    },
  }),
  P({
    id: 'rc-own-bond-2',
    level: 'exam',
    no: '2',
    marks: 25,
    title: 'Cantilever: hook into the column and cut-off of the centre bar',
    text: 'A 9 ft cantilever (from the column face), 12 in × 22 in (d = 19.5 in), carries service DL = 1.2 k/ft (excluding self-weight) and LL = 1.8 k/ft. Top steel 3 No. 9 at the support; the centre bar is to be discontinued. The bars hook down into a 20 in deep column with 2 in clear at the back face; side cover 2.5 in, tail cover 2 in. f′c = 4000 psi, fy = 60 ksi. (a) Can a straight bar be developed in the column? (b) ldh and whether the hook fits. (c) Theoretical and actual cut-off point of the centre bar (simplified ld). (d) Do the continuing bars develop?',
    checks: () => {
      const { ld, ldh, r } = p2()
      return [
        { key: 'ld', label: 'straight ld (top bar)', value: ld.final, unit: 'in' },
        { key: 'ldh', label: 'ldh', value: ldh.final, unit: 'in' },
        { key: 'xt', label: 'theoretical cut-off from face', value: r.xTheo, unit: 'ft' },
        { key: 'xc', label: 'actual cut point from face', value: r.xCut, unit: 'ft' },
      ]
    },
    solution: () => {
      const { sw, w, ld, hf, ldh, fit, dg, r, d, L, b9 } = p2()
      return (
        <div className="text-sm space-y-2">
          <p>
            Self-weight = 12 × 22/144 × 0.15 = {f(sw, 3)} k/ft; wu = 1.2({f(1.2 + sw, 3)}) + 1.6(1.8) = {f(w, 3)} k/ft; Mu,max = wu L²/2 = {f(r.Mmax, 1)} k-ft.
          </p>
          <T>{`\\text{(a) top bars: }\\ell_d = \\frac{60000\\times 1.3}{20\\times 63.25}\\times 1.128 = ${f(ld.final, 1)}\\text{ in} > 20 - 2 = ${f(fit.available)}\\text{ in} \\Rightarrow \\text{hook needed}`}</T>
          <T>{`\\text{(b) }\\ell_{dh} = \\frac{60000\\times ${hf.psiC}}{50\\times 63.25}\\times 1.128 = ${f(ldh.final, 2)}\\text{ in} \\le ${f(fit.available)}\\ (${fit.hookOK ? '\\text{fits}' : '\\text{does not fit}'});\\ \\text{bend } 8d_b = ${f(8 * b9.db)},\\ \\text{tail } 12d_b = ${f(12 * b9.db)}`}</T>
          <T>{`\\text{(c) } \\phi M_n(3) = ${f(r.all.phiMn, 1)},\\ \\phi M_n(2) = ${f(r.remain.phiMn, 1)}\\text{ k-ft};\\ \\frac{w_u(L-x)^2}{2} = ${f(r.remain.phiMn, 1)} \\Rightarrow x = ${f(r.xTheo, 2)}\\text{ ft}`}</T>
          <p>
            Extension max(d, 12db) = max({f(d)}, {f(12 * b9.db, 2)}) = {f(r.ext, 2)} in → {f(r.xExt, 2)} ft; but the cut bar needs ld = {f(ld.final, 1)} in from the face (max stress) → <b>cut at {f(r.xCut, 2)} ft from the face</b> (ld governs).
          </p>
          <p>
            (d) Continuing bars: ({f(L)} − {f(r.xTheo, 2)}) × 12 − 2 = {f(r.availCont, 1)} in {r.contOK ? '≥' : '<'} ld → {r.contOK ? 'OK' : 'not OK (hook at the tip)'}. The cut is in a tension zone: check Vu ≤ ⅔φVn there.
          </p>
          <CutoffSketch dg={dg} r={r} nTotal={3} nCut={1} ldIn={ld.final} />
        </div>
      )
    },
  }),
  P({
    id: 'rc-own-bond-3',
    level: 'warm-up',
    no: '3',
    marks: 10,
    title: '16 mm and 25 mm bars, top vs other; Class B lap',
    text: 'Find ld for 16 mm and 25 mm uncoated bars used as (i) top bars and (ii) other bars, f′c = 3500 psi, fy = 60 ksi, spacing and cover satisfying the first row of Table 6.1. Then find the lap length of the 25 mm bottom bars if all of them are spliced at one section where As,prov/As,req = 1.5.',
    checks: () => {
      const { r, lap } = p3()
      return [
        { key: 'a', label: '16 mm top', value: r('16mm', true).final, unit: 'in' },
        { key: 'b', label: '16 mm other', value: r('16mm', false).final, unit: 'in' },
        { key: 'c', label: '25 mm top', value: r('25mm', true).final, unit: 'in' },
        { key: 'd', label: '25 mm other', value: r('25mm', false).final, unit: 'in' },
        { key: 'e', label: 'lap of 25 mm bars', value: lap.final, unit: 'in' },
      ]
    },
    solution: () => {
      const { r, cls, lap } = p3()
      const a = r('16mm', false),
        b = r('25mm', false)
      return (
        <div className="text-sm space-y-2">
          <p>16 mm: db = 0.630 in (≈ No. 5, "No. 6 and smaller" → 25); 25 mm: db = 0.984 in (≈ No. 8 → 20). √3500 = 59.16 psi.</p>
          <T>{`16\\text{ mm: }\\frac{\\ell_d}{d_b} = \\frac{60000}{25\\times 59.16} = ${f(a.ratio, 1)} \\Rightarrow ${f(a.final, 1)}\\text{ in (other)},\\ \\times 1.3 = ${f(r('16mm', true).final, 1)}\\text{ in (top)}`}</T>
          <T>{`25\\text{ mm: }\\frac{\\ell_d}{d_b} = \\frac{60000}{20\\times 59.16} = ${f(b.ratio, 1)} \\Rightarrow ${f(b.final, 1)}\\text{ in (other)},\\ ${f(r('25mm', true).final, 1)}\\text{ in (top)}`}</T>
          <p>{cls.why} → lst = 1.3 × {f(b.ld, 1)} = <b>{f(lap.final, 1)} in</b> (use {upIn(lap.final)} in).</p>
        </div>
      )
    },
  }),
  P({
    id: 'rc-own-bond-4',
    level: 'challenge',
    no: '4',
    marks: 12,
    title: 'Column compression lap: No. 10 below, No. 8 above',
    text: 'In a 16 in × 16 in tied column, four No. 10 bars from below are lap-spliced in compression with four No. 8 bars from above. f′c = 3000 psi, fy = 60 ksi, ties at 12 in. Find the lap length (a) with No. 3 ties, (b) with No. 4 ties.',
    checks: () => {
      const { c3, c4 } = p4()
      return [
        { key: 'lsc', label: 'lsc of No. 8', value: c3.lsc0, unit: 'in' },
        { key: 'ldc', label: 'ldc of No. 10', value: c3.ldcLarge, unit: 'in' },
        { key: 'a', label: 'lap with No. 3 ties', value: c3.final, unit: 'in' },
        { key: 'b', label: 'lap with No. 4 ties', value: c4.final, unit: 'in' },
      ]
    },
    solution: () => {
      const { t3, t4, c3, c4, ldc10 } = p4()
      return (
        <div className="text-sm space-y-2">
          <T>{`\\ell_{sc}(\\#8) = 0.0005\\times 60000\\times 1.0 = ${f(c3.lsc0, 1)}\\text{ in};\\ \\ell_{dc}(\\#10) = \\max(${f(ldc10.a, 2)},\\ ${f(ldc10.b, 2)}) = ${f(ldc10.basic, 2)}\\text{ in}`}</T>
          <p>
            Tie check 0.0015 × 16 × 12 = {f(t3.req, 3)} in². (a) No. 3: 2 × 0.11 = {f(t3.prov, 2)} &lt; {f(t3.req, 3)} → no 0.83 → lap = max({f(c3.lsc0, 1)}, {f(c3.ldcLarge, 1)}) = <b>{f(c3.final, 1)} in</b>.
          </p>
          <p>
            (b) No. 4: 2 × 0.20 = {f(t4.prov, 2)} ≥ {f(t4.req, 3)} → lsc × 0.83 = {f(c4.lsc, 1)} in, but the No. 10 still needs ldc = {f(c4.ldcLarge, 1)} in → lap = <b>{f(c4.final, 1)} in</b> (the larger bar's ldc governs — the trap).
          </p>
        </div>
      )
    },
  }),
]

const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory: BOND_THEORY }
export default mod
