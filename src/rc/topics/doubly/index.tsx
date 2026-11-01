import { useEffect, useMemo, useState } from 'react'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Step, Steps, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, rng } from '../../../labs/common'
import { RcFrequency } from '../../components/Frequency'
import { designDoubly, reviewDoubly, singlyMax, type DoublyDesignIn, type DoublyReviewIn, type LimitBasis } from '../../engine/doubly'
import { BARS } from '../../engine/materials'
import { markUsed } from '../../reference/pane'
import type { RcQ, RcTheoryItem, RcTopicModule } from '../../types'
import { BarsSel, Badge, f, FC_OPTS, Flow, FY_OPTS, newSeed, Num, ProblemBox, Sel, zoneLabel } from './kit'
import { DesignSolution, DoublySketch, ReviewSolution } from './solve'

const TOPIC = 'rc-doubly'

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Doubly reinforced beams" sub="Tension steel plus compression steel A′s near the top face" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic={TOPIC} /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <Md>{`**Why**: the section is limited (architecture, headroom) and Mu is more than the largest tension-controlled singly section can give. A′s also reduces long-term (creep) deflection, takes moment reversal, and holds the stirrups (hanger bars).

**How often**: in every modern paper, usually twice — a **review** (≈ 20 marks: φMn, does A′s yield?, εt) and a **design with b × h fixed** (≈ 20 marks). The "12 × 25 in, d = 21, dt = 22.5, d′ = 2.5" design has been set three times (2015-16, 2016-17, 2017-18). In the recent reviews A′s did **not** yield in 3 of 4 papers, so the quadratic for c is the skill that pays.`}</Md>
          <div>
            <Tex block>{`a = \\frac{(A_s - A'_s)f_y}{0.85f'_cb},\\quad c = \\frac{a}{\\beta_1},\\quad \\varepsilon'_s = 0.003\\frac{c - d'}{c}`}</Tex>
            <Tex block>{`\\text{no yield: } A_sf_y = 0.85f'_c\\beta_1bc + A'_s\\left(87\\frac{c-d'}{c} - 0.85f'_c\\right)`}</Tex>
            <Tex block>{`M_n = 0.85f'_cab\\left(d - \\tfrac a2\\right) + C_s(d - d'),\\quad \\varepsilon_t = 0.003\\frac{d_t - c}{c}`}</Tex>
            <Tex block>{`\\text{design: } A_{s1} = \\rho_{0.005}bd,\\ A'_s = \\frac{M_u/\\phi - M_{n1}}{f'_s(d - d')},\\ A_s = A_{s1} + \\frac{A'_sf'_s}{f_y}`}</Tex>
          </div>
        </div>
        <Callout kind="exam">
          Section A of 2023-24, 2021-22, 2020-21 and Jan 2021 each had one doubly design and one doubly review (≈ 40 marks of 210). fy = 72.5 ksi appeared in 2023-24 Q3(b) and 2011-12 Q10(a): εy = 0.0025, and A′s will rarely yield. The Lab generates both kinds with the same numbers style.
        </Callout>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Approach() {
  const ex: DoublyReviewIn = { b: 14, d: 22.5, dt: 23, dp: 2.5, As: 7.62, Asp: 2.37, fc: 5, fy: 60 }
  const exR = reviewDoubly(ex)
  const dz: DoublyDesignIn = { b: 12, d: 21, dt: 22.5, dp: 2.5, fc: 4, fy: 60, Mu: 500 }
  const dzR = designDoubly(dz)
  return (
    <div>
      <Section title="Recipe (class handnotes: Nilson Ex 3.12, Hassoun Ex 3.10, Nilson Ex 3.13)">
        <div className="grid cq-lg:grid-cols-2 gap-6">
          <div>
            <div className="font-bold mb-2">Review — find φMn</div>
            <Steps>
              <Step n={1} title="As, A′s, ρ, ρ′; β1, εy = fy/29 000" />
              <Step n={2} title="Assume A′s yields: a = (As − A′s)fy / 0.85f′c b, c = a/β1" />
              <Step n={3} title="ε′s = 0.003(c − d′)/c ≥ εy ?">Same test as ρ ≥ ρ̄cy. Yes → f′s = fy, keep c.</Step>
              <Step n={4} title="No → quadratic in c">0.85f′cβ1b·c² + (87A′s − As fy − 0.85f′cA′s)·c − 87A′s d′ = 0, then f′s = 87(c − d′)/c.</Step>
              <Step n={5} title="Cc = 0.85f′c ab, Cs = A′s(f′s − 0.85f′c); check Cc + Cs = As fy" />
              <Step n={6} title="Mn = Cc(d − a/2) + Cs(d − d′)" />
              <Step n={7} title="εt at dt (extreme layer) → φ; εt ≥ 0.004" />
            </Steps>
          </div>
          <div>
            <div className="font-bold mb-2">Design — b × h fixed, Mu given</div>
            <Steps>
              <Step n={1} title="d, dt (two layers), d′ = 2.5 in" />
              <Step n={2} title="As1 = ρ0.005 b d → a, c, φMn1 = 0.9 As1 fy (d − a/2)" />
              <Step n={3} title="Mu ≤ φMn1? → singly. Else φMn2 = Mu − φMn1" />
              <Step n={4} title="ε′s at c of step 2 → f′s (≤ fy)" />
              <Step n={5} title="A′s = Mn2 / f′s(d − d′), As = As1 + A′s f′s/fy" />
              <Step n={6} title="Bars → review the provided section (φMn ≥ Mu, εt ≥ 0.004)" />
            </Steps>
          </div>
        </div>
      </Section>
      <Section title="Which case am I in?">
        <Flow
          start="Given b, d, dt, d′, As, A′s, f′c, fy"
          nodes={[
            { q: 'ε′s = 0.003(c − d′)/c ≥ εy with c from "both yield"?', yes: <>f′s = fy. Mn = A′s fy(d − d′) + (As − A′s)fy(d − a/2).</>, no: <>Quadratic for c (displaced concrete subtracted), f′s = 87(c − d′)/c.</> },
            { q: 'εs = 0.003(d − c)/c ≥ εy? (tension steel)', yes: 'Normal case: T = As fy.', no: 'Over-reinforced: solve with fs = 87(d − c)/c too (Lab does it); not acceptable for design.' },
            { q: 'εt (at dt) ≥ 0.005?', yes: 'φ = 0.90', no: <>0.004 ≤ εt {'<'} 0.005: φ = 0.483 + 83.3εt (Gr 60); εt {'<'} 0.004 not allowed.</> },
          ]}
          end="Design: Mu ≤ φMn of the largest tension-controlled singly section → singly. Otherwise add A′s for the remainder."
        />
        <Callout kind="trap">
          <ul>
            <li>Using d instead of <b>dt</b> for εt — the class figures always mark dt = d + 1.5 for two layers.</li>
            <li>Taking f′s = fy without the strain check. In 3 of the 4 recent reviews A′s did not yield.</li>
            <li>Forgetting that a = β1c comes out of the quadratic. Do not recompute a from (As − A′s)fy once f′s {'<'} fy.</li>
            <li>In design, adding A′s but not the matching As2 = A′s f′s/fy to the tension steel.</li>
            <li>Quoting Mn in in-k as k-ft: divide by 12.</li>
          </ul>
        </Callout>
        <Callout kind="note">The class handnotes subtract the displaced concrete (−0.85f′c A′s) only when A′s does not yield (Hassoun Ex 3.10, Nilson Ex 3.13 review). The both-yield formula of Nilson Ex 3.12 does not. The Lab follows the same convention.</Callout>
      </Section>
      <Section title="Lecture example: Hassoun Ex 3.10 (A′s does not yield)" sub="14 × 22.5 in (dt = 23), 6 #10 tension, 3 #8 compression at 2.5 in, f′c = 5 ksi, fy = 60 ksi — class answer c = 7.026 in, f′s = 56.04 ksi, φMn = 8136 in-k">
        <div className="rounded-xl bg-bg/60 border border-line p-2 mb-3">
          <DoublySketch inp={ex} r={exR} nT={6} nC={3} />
        </div>
        <ReviewSolution inp={ex} r={exR} />
      </Section>
      <Section title="Past-paper design: the recurring 12 × 25 beam (2017-18 Q2(c))" sub="b = 12, h = 25, d = 21, dt = 22.5, d′ = 2.5, f′c = 4, fy = 60, Mu = 500 k-ft">
        <DesignSolution inp={dz} r={dzR} />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- lab
interface RevP {
  b: number
  d: number
  dt: number
  dp: number
  nT: number
  tBar: number
  nC: number
  cBar: number
  fc: number
  fy: number
}
interface DesP {
  b: number
  h: number
  d: number
  dt: number
  dp: number
  fc: number
  fy: number
  Mu: number
  basis: LimitBasis
  fsMode: 'strain' | 'assume-yield'
  tBar: number
  cBar: number
}

function genReview(seed: number): RevP {
  const r = rng(seed)
  for (let k = 0; k < 40; k++) {
    const d = pick(r, [21, 22, 23, 24, 25, 26, 27])
    const p: RevP = { b: pick(r, [12, 12, 14, 14, 16]), d, dt: d + 1.5, dp: 2.5, nT: pick(r, [6, 8, 8]), tBar: pick(r, [8, 9, 10]), nC: pick(r, [2, 3, 3, 4]), cBar: pick(r, [7, 8, 9, 10]), fc: pick(r, [3, 3.5, 4, 4, 4.5, 5, 5]), fy: pick(r, [60, 60, 60, 60, 72.5]) }
    const res = reviewDoubly({ b: p.b, d: p.d, dt: p.dt, dp: p.dp, As: p.nT * BARS[p.tBar].A, Asp: p.nC * BARS[p.cBar].A, fc: p.fc, fy: p.fy })
    if (res.ductileOk && res.tensionYields && p.nC * BARS[p.cBar].A < p.nT * BARS[p.tBar].A * 0.7) return p
  }
  return { b: 14, d: 21, dt: 22.5, dp: 2.5, nT: 8, tBar: 8, nC: 3, cBar: 8, fc: 5, fy: 72.5 }
}

function genDesign(seed: number): DesP {
  const r = rng(seed)
  const b = pick(r, [12, 12, 14, 14, 16])
  const h = pick(r, [24, 25, 25, 26, 28, 29, 30])
  const fc = pick(r, [3, 4, 4, 4, 5])
  const fy = pick(r, [60, 60, 60, 50])
  const d = h - 4
  const sm = singlyMax(b, d, d + 1.5, fc, fy)
  const Mu = Math.round((sm.phiMn1 * (1.12 + r() * 0.45)) / 25) * 25
  return { b, h, d, dt: d + 1.5, dp: 2.5, fc, fy, Mu, basis: 'rho-d', fsMode: 'strain', tBar: 0, cBar: 0 }
}

function useMark(id: string, v: Record<string, number | string>) {
  const key = JSON.stringify(v)
  useEffect(() => {
    markUsed(id, JSON.parse(key))
  }, [id, key])
}

function ReviewLab() {
  const [p, setP] = useState<RevP>({ b: 14, d: 21, dt: 22.5, dp: 2.5, nT: 8, tBar: 8, nC: 3, cBar: 8, fc: 5, fy: 72.5 })
  const [gen, setGen] = useState(false)
  const set = (o: Partial<RevP>) => {
    setP({ ...p, ...o })
    setGen(false)
  }
  const As = p.nT * BARS[p.tBar].A
  const Asp = p.nC * BARS[p.cBar].A
  const inp: DoublyReviewIn = { b: p.b, d: p.d, dt: p.dt, dp: p.dp, As, Asp, fc: p.fc, fy: p.fy }
  const r = reviewDoubly(inp)
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `${TOPIC}:lab:rev:${key}:${k}`
  useMark('f-asyield', { c: r.trial.c, esp: r.trial.epsSp, ey: r.ey, yields: r.compYields ? 1 : 0, fy: p.fy })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className="btn"
          onClick={() => {
            setP(genReview(newSeed()))
            setGen(true)
          }}
        >
          🎲 Exam-style review problem
        </button>
        {gen && <span className="text-xs text-faint">edit any input to make it your own</span>}
      </div>
      {gen && (
        <ProblemBox>
          A rectangular beam is {p.b} in wide. The tension steel is {p.nT} No. {p.tBar} bars in two layers (d = {p.d} in to the centroid, dt = {p.dt} in to the lower layer); the compression steel is {p.nC} No. {p.cBar} bars at {p.dp} in from the compression face. f′c = {p.fc} ksi, fy = {p.fy} ksi. Determine the nominal and design moment capacities by ACI/BNBC, check whether the compression steel yields, and find εt.
        </ProblemBox>
      )}
      <div className="grid grid-cols-2 cq-md:grid-cols-4 cq-lg:grid-cols-6 gap-2">
        <Num label="b" unit="in" value={p.b} onChange={(v) => set({ b: v })} step={1} />
        <Num label="d (centroid)" unit="in" value={p.d} onChange={(v) => set({ d: v })} />
        <Num label="dt (extreme layer)" unit="in" value={p.dt} onChange={(v) => set({ dt: v })} />
        <Num label="d′" unit="in" value={p.dp} onChange={(v) => set({ dp: v })} />
        <Sel label="f′c (ksi)" value={p.fc} options={FC_OPTS} onChange={(v) => set({ fc: v })} />
        <Sel label="fy (ksi)" value={p.fy} options={FY_OPTS} onChange={(v) => set({ fy: v })} />
        <BarsSel label="Tension bars" n={p.nT} no={p.tBar} onN={(v) => set({ nT: v })} onNo={(v) => set({ tBar: v })} />
        <BarsSel label="Compression bars" n={p.nC} no={p.cBar} onN={(v) => set({ nC: v })} onNo={(v) => set({ cBar: v })} nOpts={[0, 2, 3, 4, 5, 6]} />
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <DoublySketch inp={inp} r={r} nT={p.nT} nC={p.nC} layers={p.dt > p.d ? 2 : 1} />
      </div>
      <div key={key} className="rounded-xl border border-line p-3 space-y-0.5">
        <div className="text-xs font-bold uppercase tracking-wider text-faint">Your checkpoints</div>
        <Answer id={id('b1')} label="β1" value={r.b1} compact />
        <Answer id={id('ct')} label="c assuming A′s yields" value={r.trial.c} unit="in" compact />
        <Choice id={id('y')} label="Does A′s yield?" options={[{ v: 'y', label: 'Yes' }, { v: 'n', label: 'No' }]} answer={r.compYields ? 'y' : 'n'} />
        <Answer id={id('c')} label="c (final)" value={r.c} unit="in" compact />
        <Answer id={id('fsp')} label="f′s" value={r.fsp} unit="ksi" compact />
        <Answer id={id('mn')} label="Mn" value={r.MnFt} unit="k-ft" compact />
        <Answer id={id('et')} label="εt (at dt)" value={r.epsT} tol={0.03} compact />
        <Answer id={id('phi')} label="φ" value={r.phi} tol={0.01} compact />
        <Answer id={id('pmn')} label="φMn" value={r.phiMn} unit="k-ft" compact />
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge okv={r.compYields} yes="A′s yields" no="A′s does not yield" />
        <Badge okv={r.tensionYields} yes="tension steel yields" no="tension steel elastic!" />
        <Badge okv={r.zone === 'tension'} yes="tension-controlled" no={zoneLabel(r.zone)} />
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <ReviewSolution inp={inp} r={r} />
      </Reveal>
    </div>
  )
}

function DesignLab() {
  const [p, setP] = useState<DesP>({ b: 12, h: 25, d: 21, dt: 22.5, dp: 2.5, fc: 4, fy: 60, Mu: 500, basis: 'rho-d', fsMode: 'strain', tBar: 0, cBar: 0 })
  const [gen, setGen] = useState(false)
  const set = (o: Partial<DesP>) => {
    setP({ ...p, ...o })
    setGen(false)
  }
  const inp: DoublyDesignIn = { b: p.b, d: p.d, dt: p.dt, dp: p.dp, fc: p.fc, fy: p.fy, Mu: p.Mu, basis: p.basis, fsMode: p.fsMode, tBar: p.tBar || undefined, cBar: p.cBar || undefined }
  const r = useMemo(() => designDoubly(inp), [JSON.stringify(inp)]) // eslint-disable-line react-hooks/exhaustive-deps
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `${TOPIC}:lab:des:${key}:${k}`
  const rv = r.review
  useMark('f-asyield', { c: r.sm.c, esp: r.needed ? r.epsSp : 0, ey: p.fy / 29000, yields: r.compYields ? 1 : 0, fy: p.fy })
  useMark('f-graphA1', { fc: p.fc, fy: p.fy, rho: r.sm.rho005, R: (r.sm.Mn1 * 1000) / (p.b * p.d * p.d) })
  const revInp: DoublyReviewIn = { b: p.b, d: p.d, dt: p.dt, dp: p.dp, As: r.tension.A, Asp: r.comp?.A ?? 0, fc: p.fc, fy: p.fy }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className="btn"
          onClick={() => {
            setP(genDesign(newSeed()))
            setGen(true)
          }}
        >
          🎲 Exam-style design problem
        </button>
      </div>
      {gen && (
        <ProblemBox>
          A beam section is limited to b = {p.b} in and h = {p.h} in for architectural reasons. Two layers of tension steel are expected (d = {p.d} in, dt = {p.dt} in); d′ = {p.dp} in if compression steel is required. f′c = {p.fc} ksi, fy = {p.fy} ksi. Calculate the required reinforcement for a factored moment Mu = {p.Mu} kip-ft.
        </ProblemBox>
      )}
      <div className="grid grid-cols-2 cq-md:grid-cols-4 cq-lg:grid-cols-6 gap-2">
        <Num label="b" unit="in" value={p.b} onChange={(v) => set({ b: v })} step={1} />
        <Num label="h" unit="in" value={p.h} onChange={(v) => set({ h: v, d: v - 4, dt: v - 2.5 })} step={1} />
        <Num label="d" unit="in" value={p.d} onChange={(v) => set({ d: v })} />
        <Num label="dt" unit="in" value={p.dt} onChange={(v) => set({ dt: v })} />
        <Num label="d′" unit="in" value={p.dp} onChange={(v) => set({ dp: v })} />
        <Num label="Mu" unit="k-ft" value={p.Mu} onChange={(v) => set({ Mu: v })} step={25} />
        <Sel label="f′c (ksi)" value={p.fc} options={FC_OPTS} onChange={(v) => set({ fc: v })} />
        <Sel label="fy (ksi)" value={p.fy} options={FY_OPTS} onChange={(v) => set({ fy: v })} />
        <Sel label="Tension bar" value={p.tBar} options={[0, 7, 8, 9, 10, 11]} onChange={(v) => set({ tBar: v })} fmtOpt={(v) => (v ? `#${v}` : 'auto')} />
        <Sel label="Compression bar" value={p.cBar} options={[0, 5, 6, 7, 8, 9, 10]} onChange={(v) => set({ cBar: v })} fmtOpt={(v) => (v ? `#${v}` : 'auto')} />
        <div className="flex flex-col gap-1 text-sm col-span-2">
          <span className="text-xs text-mute">Singly limit</span>
          <Seg size="xs" value={p.basis} onChange={(v) => set({ basis: v })} items={[{ v: 'rho-d', label: 'ρ0.005·bd (class)' }, { v: 'c-dt', label: 'εt = 0.005 at dt' }]} />
        </div>
        <div className="flex flex-col gap-1 text-sm col-span-2">
          <span className="text-xs text-mute">f′s for sizing A′s</span>
          <Seg size="xs" value={p.fsMode} onChange={(v) => set({ fsMode: v })} items={[{ v: 'strain', label: 'from strain' }, { v: 'assume-yield', label: 'assume fy (shortcut)' }]} />
        </div>
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <DoublySketch inp={revInp} r={rv} nT={r.tension.n} nC={r.comp?.n ?? 0} layers={r.tension.layers > 1 ? 2 : 1} />
        <div className="text-xs text-faint px-2">Sketch of the provided section: {r.tension.n} #{r.tension.no} tension{r.comp ? `, ${r.comp.n} #${r.comp.no} compression` : ''}.</div>
      </div>
      <div key={key} className="rounded-xl border border-line p-3 space-y-0.5">
        <div className="text-xs font-bold uppercase tracking-wider text-faint">Your checkpoints</div>
        <Answer id={id('as1')} label="As1 (singly limit)" value={r.sm.As1} unit="in²" compact />
        <Answer id={id('pm1')} label="φMn1" value={r.sm.phiMn1} unit="k-ft" compact />
        <Choice id={id('need')} label="Compression steel needed?" options={[{ v: 'y', label: 'Yes' }, { v: 'n', label: 'No' }]} answer={r.needed ? 'y' : 'n'} />
        {r.needed ? (
          <>
            <Answer id={id('mn2')} label="Mn2" value={r.Mn2 / 12} unit="k-ft" compact />
            <Answer id={id('fsp')} label="f′s (sizing)" value={r.fsp} unit="ksi" compact />
            <Answer id={id('asp')} label="A′s required" value={r.Asp} unit="in²" compact />
            <Answer id={id('as')} label="As required" value={r.As} unit="in²" compact />
          </>
        ) : (
          <Answer id={id('as')} label="As required" value={r.As} unit="in²" compact />
        )}
        <Answer id={id('pmn')} label="φMn of the provided bars" value={rv.phiMn} unit="k-ft" compact />
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge okv={r.ok} yes={`φMn = ${f(rv.phiMn, 1)} ≥ Mu ✓`} no={`φMn = ${f(rv.phiMn, 1)} < Mu or εt < 0.004`} />
        <Badge okv={rv.compYields} yes="A′s yields (provided)" no={`A′s at ${f(rv.fsp, 1)} ksi`} />
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <DesignSolution inp={inp} r={r} />
        {r.needed && (
          <Reveal title="Detailed review of the provided bars" tone="mute">
            <ReviewSolution inp={revInp} r={rv} />
          </Reveal>
        )}
      </Reveal>
    </div>
  )
}

function Lab() {
  const [mode, setMode] = useState<'review' | 'design'>('review')
  return (
    <div>
      <Section title="Doubly reinforced lab" sub="Every input is editable; 🎲 makes a paper-style problem. Code pane: 'Does A′s yield?' and Graph A.1 highlight what you used." right={<Seg value={mode} onChange={setMode} items={[{ v: 'review', label: 'Review' }, { v: 'design', label: 'Design' }]} />}>
        {mode === 'review' ? <ReviewLab /> : <DesignLab />}
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- theory
const theory: RcTheoryItem[] = [
  {
    id: 'td-def',
    topic: TOPIC,
    q: 'What is meant by a singly reinforced and a doubly reinforced beam? Also distinguish under-reinforced and over-reinforced beams; which is preferred?',
    seen: ['2007-08', '2005-06', '2002-03', '2013-14'],
    a: `- **Singly reinforced**: steel only in the tension zone; the concrete above the neutral axis takes all the compression. Top bars put in only to hold stirrups are ignored.
- **Doubly reinforced**: longitudinal steel in both the tension zone (As) and the compression zone (A′s); the compression steel is counted in the strength: $C = C_c + C_s$, $M_n = C_c(d - a/2) + C_s(d - d')$.
- **Under-reinforced** ($\\rho < \\rho_b$, $\\varepsilon_t > \\varepsilon_y$): the tension steel yields before the concrete crushes → large deflection and wide cracks give warning (ductile failure). ACI requires $\\varepsilon_t \\ge 0.004$ for beams and gives φ = 0.9 when $\\varepsilon_t \\ge 0.005$.
- **Over-reinforced** ($\\rho > \\rho_b$): concrete crushes before the steel yields → sudden, brittle failure with little warning, steel not used fully; φ = 0.65.
- **Balanced**: $\\varepsilon_c = 0.003$ and $\\varepsilon_s = \\varepsilon_y$ at the same time ($c_b = 0.003d/(0.003 + \\varepsilon_y)$).
- Preferred: **under-reinforced** (ductile, economical, warning before failure). When a limited section needs more steel than the ductility limit, make it doubly reinforced instead of over-reinforcing it.`,
  },
  {
    id: 'td-effect',
    topic: TOPIC,
    q: 'What is the effect of compression steel on the ultimate strength of a beam? Why is compression reinforcement used (ductility, deflection, creep)?',
    seen: ['2014-15'],
    a: `**Strength.** In an under-reinforced beam the strength is controlled by the tension steel: $M_n \\approx A_sf_y\\,jd$. Adding A′s only shifts part of the compression from concrete to steel, so a rises less and the lever arm grows slightly: **the gain in Mn is small (a few %)**. A′s raises the capacity substantially only when it is paired with extra tension steel: then $M_n = M_{n1} + A'_sf'_s(d - d')$, which is how a size-limited section carries a large Mu.

**Why it is used**
- **Limited section** (architectural depth/width): carry Mu above the tension-controlled singly limit while keeping $\\varepsilon_t \\ge 0.004$–0.005.
- **Ductility**: with A′s the concrete block is smaller, c moves up, $\\varepsilon_t$ and the curvature at failure increase → more ductile, better φ; allows $\\bar\\rho_{max} = \\rho_{max} + \\rho' f'_s/f_y$.
- **Long-term deflection**: concrete creeps and shrinks, the steel does not; A′s takes over compression as the concrete creeps, reducing creep deflection (ACI multiplier $\\lambda = \\xi/(1 + 50\\rho')$).
- **Moment reversal** (seismic/wind, continuous beams near supports) and minimum bottom steel through supports.
- **Hanger bars**: holds the stirrups in place; also improves toughness under repeated loads.`,
  },
  {
    id: 'td-always',
    topic: TOPIC,
    q: 'Will adding bars in the compression zone of a singly reinforced beam always increase its moment capacity? Justify.',
    seen: ['2007-08', '2005-06'],
    a: `**Not significantly, unless tension steel is added too.**
- In an under-reinforced section the tension force is fixed at $T = A_sf_y$. Adding A′s does not change T; it only lets the concrete block shrink ($a = (A_s f_y - A'_sf'_s)/0.85f'_cb$), so the lever arm increases a little. Gain ≈ 1–5 %.
- If A′s is near the neutral axis (large d′, shallow c) its strain is small, $f'_s \\ll f_y$ — even less benefit. If c ends up above d′, the "compression" bars are actually in tension.
- In an **over-reinforced** section the concrete crushes first; A′s then relieves the concrete, raises the steel strain and does increase both strength and ductility.
- So compression steel increases capacity effectively only when it is provided **with additional tension steel** (As2 = A′s f′s/fy), i.e. a true doubly reinforced design. Its main benefits otherwise are ductility, reduced creep deflection and moment reversal.`,
  },
  {
    id: 'td-2n',
    topic: TOPIC,
    q: 'Why is a value of 2 recommended by ACI in the WSD equation for the compression-steel stress, f′s = 2n fc (kd − d′)/kd?',
    seen: ['2006-07'],
    a: `- Under sustained service load concrete **creeps** and **shrinks**; the compression steel does not. The concrete next to A′s keeps shortening, so the strain (and stress) in A′s grows with time while the concrete stress drops.
- Elastic analysis with n would underestimate the long-term steel stress. ACI's working-stress (alternate design) method therefore uses an effective modular ratio **2n** for compression steel (equivalently the transformed area $(2n - 1)A'_s$, the −1 for the displaced concrete).
- The result is limited to the allowable tensile stress: $f'_s = 2nf_c\\frac{kd - d'}{kd} \\le f_s$.`,
  },
  {
    id: 'td-noyield',
    topic: TOPIC,
    q: 'When does the compression steel not yield at failure, and how is the capacity found then?',
    seen: [],
    a: `- A′s yields only if $\\varepsilon'_s = 0.003(c - d')/c \\ge \\varepsilon_y$, i.e. $c \\ge \\frac{0.003}{0.003 - \\varepsilon_y}d'$ (Grade 60: c ≥ 3.22d′). Equivalent test: $\\rho \\ge \\bar\\rho_{cy} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{d'}{d}\\frac{\\varepsilon_u}{\\varepsilon_u - \\varepsilon_y} + \\rho'$.
- It does **not** yield for shallow c: wide/shallow beams, large cover d′, light tension steel, large A′s, high fy (72.5 ksi: εy = 0.0025) — see Table 3.2 (Grade 60 needs d ≥ 18.8 in for d′ = 2.5 in at εt = 0.004).
- Then use strain compatibility: $A_sf_y = 0.85f'_c\\beta_1bc + A'_s\\left(E_s\\varepsilon_u\\frac{c - d'}{c} - 0.85f'_c\\right)$ → quadratic in c; $f'_s = 87(c - d')/c$ ksi; $M_n = 0.85f'_cab(d - a/2) + A'_s(f'_s - 0.85f'_c)(d - d')$; εt at dt for φ.`,
  },
]

// ---------------------------------------------------------------- own problems
const revQ = (id: string, level: RcQ['level'], title: string, text: string, inp: DoublyReviewIn): RcQ => ({
  id: `rc-own-doubly-${id}`,
  paper: 'own',
  level,
  sec: 'A',
  no: id,
  marks: 20,
  topics: [TOPIC],
  title,
  text,
  pages: [],
  checks: () => {
    const r = reviewDoubly(inp)
    return [
      { key: 'c', label: 'c', value: r.c, unit: 'in' },
      { key: 'fsp', label: "f's", value: r.fsp, unit: 'ksi' },
      { key: 'et', label: 'εt', value: r.epsT, tol: 0.03 },
      { key: 'pmn', label: 'φMn', value: r.phiMn, unit: 'k-ft' },
    ]
  },
  solution: () => <ReviewSolution inp={inp} r={reviewDoubly(inp)} />,
})
const desQ = (id: string, level: RcQ['level'], title: string, text: string, inp: DoublyDesignIn): RcQ => ({
  id: `rc-own-doubly-${id}`,
  paper: 'own',
  level,
  sec: 'A',
  no: id,
  marks: 20,
  topics: [TOPIC],
  title,
  text,
  pages: [],
  checks: () => {
    const r = designDoubly(inp)
    return [
      { key: 'pm1', label: 'φMn1 (singly limit)', value: r.sm.phiMn1, unit: 'k-ft' },
      { key: 'asp', label: "A's required", value: r.Asp, unit: 'in²' },
      { key: 'as', label: 'As required', value: r.As, unit: 'in²' },
    ]
  },
  solution: () => <DesignSolution inp={inp} r={designDoubly(inp)} />,
})

const problems: RcQ[] = [
  revQ('1', 'warm-up', 'Review: both steels yield', 'A 14 in wide beam has 8 No. 10 bars in two layers (d = 27 in, dt = 28.5 in) and 3 No. 9 compression bars at 2.5 in from the top. f′c = 4 ksi, fy = 60 ksi. Find φMn; check whether A′s yields and εt.', { b: 14, d: 27, dt: 28.5, dp: 2.5, As: 8 * 1.27, Asp: 3 * 1.0, fc: 4, fy: 60 }),
  revQ('2', 'exam', 'Review with fy = 72.5 ksi (A′s does not yield)', 'b = 12 in; tension 6 No. 9 in two layers, d = 24 in, dt = 25.5 in; compression 3 No. 8 at d′ = 2.5 in; f′c = 4.5 ksi, fy = 72.5 ksi. Nominal and design moment capacity, f′s and εt.', { b: 12, d: 24, dt: 25.5, dp: 2.5, As: 6 * 1.0, Asp: 3 * 0.79, fc: 4.5, fy: 72.5 }),
  desQ('3', 'exam', 'Design: 14 × 26 section, Mu = 650 k-ft', 'A beam is limited to b = 14 in, h = 26 in. Two layers of tension steel: d = 22 in, dt = 23.5 in; d′ = 2.5 in if needed. f′c = 4 ksi, fy = 60 ksi. Find the required reinforcement for Mu = 650 kip-ft and select bars.', { b: 14, d: 22, dt: 23.5, dp: 2.5, fc: 4, fy: 60, Mu: 650 }),
  desQ('4', 'challenge', 'Wide shallow beam, high-strength steel', 'b = 24 in, h = 16 in maximum; bar centres 3 in from each face (d = 13 in, dt = 13 in, d′ = 3 in). f′c = 4 ksi, fy = 72.5 ksi, Mu = 450 kip-ft (cf. 2011-12 Q10(a)). Design the flexural reinforcement; watch f′s.', { b: 24, d: 13, dt: 13, dp: 3, fc: 4, fy: 72.5, Mu: 450 }),
]

const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory }
export default mod
