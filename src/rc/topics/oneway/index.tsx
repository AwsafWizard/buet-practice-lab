import { useMemo, useState } from 'react'
import { Answer, Callout, Md, Reveal, Section, Seg, Step, Steps, Tabs } from '../../../components/ui'
import { CheckTable, hashKey, type CheckCol } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { RcFrequency } from '../../components/Frequency'
import { cantSlab, END_LABEL, oneWayCoef, PATTERN_LABEL, type CantSlabInput, type DesignSection, type EndSupport, type LLPattern, type OneWayCoefInput } from '../../engine/oneway'
import type { Check, RcQ, RcTopicModule } from '../../types'
import { Box, f, FC_OPTS, Flow, FY_OPTS, Num, Pick, useMark } from './kit'
import { CantSketch, ContSketch } from './sketch'
import { CantSolution, CoefSolution } from './solution'
import { ONEWAY_THEORY } from './theory'
import { OneWayDesign } from './DesignProblems'
import { PickSection } from '../../components/PickDrill'
import { ONEWAY_PICKS } from './picks'
import { OneWaySpacingSim } from './SpacingSim'

const TID = 'rc-oneway'
const END_OPTS: { v: EndSupport; label: string }[] = (['spandrel', 'column', 'unrestrained'] as EndSupport[]).map((v) => ({ v, label: END_LABEL[v] }))
const BAR_OPTS: { v: string; label: string }[] = [
  { v: 'auto', label: 'auto (#3 unless s < 4.5 in)' },
  { v: '3', label: '#3' },
  { v: '4', label: '#4' },
  { v: '5', label: '#5' },
]
const barVal = (b: string) => (b === 'auto' ? 'auto' : +b) as number | 'auto'

/** keys of the sl-aci rows a result used */
function aciKeys(r: ReturnType<typeof oneWayCoef>) {
  const k = new Set<string>()
  for (const s of r.sections) {
    if (s.kind === 'pos') k.add(s.den === 11 ? 'p11' : s.den === 14 ? 'p14' : s.den === 16 ? 'p16' : '')
    else k.add(s.den === 9 ? 'n9' : s.den === 10 ? 'n10' : s.den === 11 ? 'n11' : s.den === 12 ? 'n12' : s.den === 24 ? 'n24' : 'n16')
  }
  if (r.n > 1) k.add('v115')
  return [...k].filter(Boolean).join('|')
}

// ================================================================ continuous slab lab
interface ContState {
  n: number
  endSpan: number
  intSpan: number
  endL: EndSupport
  endR: EndSupport
  ll: number
  ff: number
  pw: number
  dl: number
  fc: number
  fy: number
  h: number
  bar: string
  short: boolean
}
const CONT0: ContState = { n: 2, endSpan: 15, intSpan: 15, endL: 'spandrel', endR: 'spandrel', ll: 100, ff: 0, pw: 0, dl: 0, fc: 4000, fy: 60000, h: 6.5, bar: '3', short: false }

const contInput = (s: ContState): OneWayCoefInput => ({
  spans: s.n === 1 ? [s.endSpan] : Array.from({ length: s.n }, (_, j) => (j === 0 || j === s.n - 1 ? s.endSpan : s.intSpan)),
  ends: [s.endL, s.endR],
  short: s.short,
  ll: s.ll,
  ff: s.ff,
  pw: s.pw,
  dlTotal: s.dl > 0 ? s.dl : undefined,
  fc: s.fc,
  fy: s.fy,
  h: s.h > 0 ? s.h : undefined,
  bar: barVal(s.bar),
})

function randomCont(seed: number): ContState {
  const r = rng(seed)
  const n = pick(r, [2, 2, 2, 3, 4, 5])
  const span = randInt(r, 10, 17, 0.5)
  const end = pick(r, ['spandrel', 'spandrel', 'spandrel', 'unrestrained', 'column'] as EndSupport[])
  const fy = pick(r, [60000, 60000, 60000, 40000])
  return {
    n,
    endSpan: span,
    intSpan: n > 2 && r() < 0.3 ? span + pick(r, [-1, 1, 2]) : span,
    endL: end,
    endR: end,
    ll: pick(r, [40, 60, 80, 100, 120]),
    ff: pick(r, [0, 25, 30]),
    pw: pick(r, [0, 30, 40, 50, 60]),
    dl: 0,
    fc: pick(r, [3000, 3000, 3500, 4000]),
    fy,
    h: 0,
    bar: 'auto',
    short: false,
  }
}

const contStatement = (s: ContState) => {
  const spans = s.n === 1 ? `a single clear span of ${s.endSpan} ft` : s.endSpan === s.intSpan ? `${s.n} equal clear spans of ${s.endSpan} ft` : `${s.n} spans: end spans ${s.endSpan} ft, interior spans ${s.intSpan} ft (clear)`
  const ends = s.endL === 'unrestrained' ? 'resting on brick walls at the outer ends' : s.endL === 'column' ? 'built integrally with exterior columns' : 'built integrally with spandrel beams'
  const loads = [`LL = ${s.ll} psf`, s.ff ? `floor finish ${s.ff} psf` : '', s.pw ? `partition wall ${s.pw} psf` : ''].filter(Boolean).join(', ')
  return `A one-way slab has ${spans}, ${ends}. ${loads}${s.dl ? `, DL = ${s.dl} psf incl. self-weight` : ' + self-weight'}. f'c = ${s.fc / 1000} ksi, fy = ${s.fy / 1000} ksi. Design the slab using the ACI coefficients and show the reinforcement.`
}

type SecRow = DesignSection
const SEC_COLS: CheckCol<SecRow>[] = [
  { key: 'Mu', label: 'Mu (k-ft/ft)', get: (x) => x.Mu, abs: 0.03, digits: 2 },
  { key: 'As', label: 'As req (in²/ft)', get: (x) => x.as.As, abs: 0.003, digits: 3 },
  { key: 'AsD', label: 'As design', get: (x) => x.AsD, abs: 0.003, digits: 3 },
]

function ContLab() {
  const [s, setS] = useState<ContState>(CONT0)
  const [random, setRandom] = useState(false)
  const set = (o: Partial<ContState>) => {
    setS({ ...s, ...o })
    setRandom(false)
  }
  const r = useMemo(() => oneWayCoef(contInput(s)), [s])
  const key = hashKey(JSON.stringify(s))
  const id = (k: string) => `${TID}:lab:${key}:${k}`
  useMark('sl-aci', { keys: aciKeys(r) })
  useMark('sl-hmin', { rules: [...new Set(r.hmin.map((x) => x.rule))].join('|') })
  useMark('sl-ts', { fy: s.fy })
  const shown = r.sections.filter((x) => !x.mirror)
  const firstInt = r.supports.find((x) => x.sec.at === 1 && x.sec.kind === 'neg')
  const ext = r.supports.find((x) => x.sec.at === 0)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            setS(randomCont(Math.floor(Math.random() * 1e9)))
            setRandom(true)
          }}
        >
          🎲 Random exam-style slab
        </button>
        <button className="text-sm text-accent underline" onClick={() => set(CONT0)}>
          Lecture Ex 12.1
        </button>
        <button className="text-sm text-accent underline" onClick={() => set({ ...CONT0, endSpan: 16, intSpan: 16, ll: 80, ff: 30, pw: 50, fc: 3000, h: 0, bar: 'auto' })}>
          2023-24 Q7(a)
        </button>
      </div>
      {random && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">{contStatement(s)}</div>}
      <div className="grid grid-cols-2 cq-md:grid-cols-4 cq-lg:grid-cols-6 gap-2">
        <Pick label="Number of spans" value={s.n} onChange={(n) => set({ n })} options={[1, 2, 3, 4, 5].map((v) => ({ v, label: String(v) }))} />
        <Num label={s.n > 2 ? 'End span (clear)' : 'Clear span'} value={s.endSpan} onChange={(v) => set({ endSpan: v, intSpan: s.n > 2 ? s.intSpan : v })} step={0.5} unit="ft" />
        {s.n > 2 && <Num label="Interior spans (clear)" value={s.intSpan} onChange={(v) => set({ intSpan: v })} step={0.5} unit="ft" />}
        <Pick label="Left end support" value={s.endL} onChange={(v) => set({ endL: v })} options={END_OPTS} />
        <Pick label="Right end support" value={s.endR} onChange={(v) => set({ endR: v })} options={END_OPTS} />
        <Num label="LL" value={s.ll} onChange={(v) => set({ ll: v })} step={10} unit="psf" />
        <Num label="Floor finish" value={s.ff} onChange={(v) => set({ ff: v })} step={5} unit="psf" />
        <Num label="Partition wall" value={s.pw} onChange={(v) => set({ pw: v })} step={5} unit="psf" />
        <Num label="DL incl. self-wt (0 = compute)" value={s.dl} onChange={(v) => set({ dl: v })} step={5} unit="psf" />
        <Pick label="f'c" value={s.fc} onChange={(v) => set({ fc: v })} options={FC_OPTS} />
        <Pick label="fy" value={s.fy} onChange={(v) => set({ fy: v })} options={FY_OPTS} />
        <Num label="h given (0 = from l/24, l/28)" value={s.h} onChange={(v) => set({ h: v })} step={0.25} unit="in" />
        <Pick label="Main bar" value={s.bar} onChange={(v) => set({ bar: v })} options={BAR_OPTS} />
      </div>
      <label className="text-sm flex items-center gap-2">
        <input type="checkbox" checked={s.short} onChange={(e) => set({ short: e.target.checked })} /> spans ≤ 10 ft (−1/12 at all supports)
      </label>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <ContSketch r={r} />
      </div>
      <div className="grid cq-lg:grid-cols-2 gap-4" key={key}>
        <Box title="Checkpoints — thickness, load">
          <Answer id={id('h')} label="h (in)" value={r.h} compact />
          <Answer id={id('wu')} label="wu (psf)" value={r.loads.wu} abs={0.6} compact />
          <Answer id={id('dreq')} label="d required (in)" value={r.depth.dreq} compact />
          <Answer id={id('asmin')} label="As,min (in²/ft)" value={r.AsMin} abs={0.002} compact />
        </Box>
        <Box title="Checkpoints — bars">
          <Answer id={id('s0')} label={`bottom s, ${r.n > 2 ? 'end span' : 'span'} (#${r.bar})`} value={r.spanBars[0].s} unit="in" compact />
          {r.n > 2 && <Answer id={id('s1')} label="bottom s, interior span" value={r.spanBars[1].s} unit="in" compact />}
          {ext && <Answer id={id('ex0')} label="extra top bars, exterior support" value={ext.extra.n} compact />}
          {firstInt && <Answer id={id('ex1')} label={`extra top bars, ${firstInt.sec.label.replace(' (−)', '')}`} value={firstInt.extra.n} compact />}
          <Answer id={id('ts')} label="T&S #3 spacing" value={r.ts.s} unit="in" compact />
          <Answer id={id('vu')} label="Vu at d (k)" value={r.shear.Vd} abs={0.03} compact />
          <Answer id={id('vc')} label="φVc (k/ft)" value={r.shear.phiVc} abs={0.03} compact />
        </Box>
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Critical sections — fill the table</div>
        <CheckTable
          key={key}
          rows={shown}
          rowKey={(x) => x.id}
          given={[
            { label: 'Section', get: (x) => x.label },
            { label: 'C', get: (x) => `${x.kind === 'neg' ? '−' : '+'}1/${x.den}` },
            { label: 'ln (ft)', get: (x) => f(x.ln, 2) },
          ]}
          cols={SEC_COLS}
          idp={id('tbl')}
        />
      </div>
      <Reveal id={id('sol')} title="Full solution (handnote style)">
        <CoefSolution r={r} sketch={false} />
      </Reveal>
    </div>
  )
}

// ================================================================ cantilever lab
interface CantState {
  span: number
  support: number
  cantL: number
  cantR: number
  ll: number
  ff: number
  pw: number
  dl: number
  fc: number
  fy: number
  h: number
  bar: string
}
const CANT0: CantState = { span: 14, support: 12, cantL: 5, cantR: 5, ll: 100, ff: 30, pw: 60, dl: 0, fc: 3500, fy: 60000, h: 0, bar: 'auto' }
const cantInput = (s: CantState): CantSlabInput => ({
  span: s.span,
  support: s.support,
  cantL: s.cantL,
  cantR: s.cantR,
  ll: s.ll,
  ff: s.ff,
  pw: s.pw,
  dlTotal: s.dl > 0 ? s.dl : undefined,
  fc: s.fc,
  fy: s.fy,
  h: s.h > 0 ? s.h : undefined,
  bar: barVal(s.bar),
})
function randomCant(seed: number): CantState {
  const r = rng(seed)
  const both = r() < 0.55
  const a = randInt(r, 4, 6.5, 0.5)
  const given = r() < 0.4
  return {
    span: randInt(r, 10, 16, 1),
    support: pick(r, [10, 12, 12]),
    cantL: both ? a : 0,
    cantR: a,
    ll: pick(r, [60, 80, 100, 140]),
    ff: given ? 0 : pick(r, [25, 30]),
    pw: given ? 0 : pick(r, [30, 50, 60]),
    dl: given ? pick(r, [125, 130, 140, 180]) : 0,
    fc: pick(r, [3000, 3000, 3500, 4000]),
    fy: pick(r, [60000, 60000, 60000, 50000]),
    h: given ? pick(r, [6, 6.5]) : 0,
    bar: 'auto',
  }
}
const cantStatement = (s: CantState) => {
  const geo = s.cantL > 0 && s.cantR > 0 ? `${s.cantL}′ cantilever – ${s.support}″ support – ${s.span}′-0″ clear span – ${s.support}″ support – ${s.cantR}′ cantilever` : `${s.span}′-0″ clear span between ${s.support}″ supports with a ${s.cantR}′ cantilever on one side`
  const loads = s.dl ? `DL = ${s.dl} psf (incl. self-weight), working LL = ${s.ll} psf` : `LL = ${s.ll} psf + own weight; partition wall ${s.pw} psf, floor finish ${s.ff} psf`
  return `One-way slab: ${geo}. ${s.h ? `h = ${s.h} in. ` : ''}${loads}; live load can occupy any portion. f'c = ${s.fc / 1000} ksi, fy = ${s.fy / 1000} ksi. Find the critical design moments and show the reinforcement.`
}

type PatRow = { p: LLPattern; RA: number; RB: number; M: number }
const PAT_COLS: CheckCol<PatRow>[] = [
  { key: 'RA', label: 'R_A (k)', get: (x) => x.RA, abs: 0.02, digits: 3 },
  { key: 'RB', label: 'R_B (k)', get: (x) => x.RB, abs: 0.02, digits: 3 },
  { key: 'M', label: 'max span M (k-ft)', get: (x) => x.M, abs: 0.03, digits: 2 },
]

function CantLab() {
  const [s, setS] = useState<CantState>(CANT0)
  const [random, setRandom] = useState(false)
  const [pat, setPat] = useState<LLPattern>('span')
  const set = (o: Partial<CantState>) => {
    setS({ ...s, ...o })
    setRandom(false)
  }
  const r = useMemo(() => cantSlab(cantInput(s)), [s])
  const key = hashKey(JSON.stringify(['cant', s]))
  const id = (k: string) => `${TID}:lab:${key}:${k}`
  useMark('sl-hmin', { rules: [r.spanRule, ...(r.nC ? ['cant'] : [])].join('|') })
  useMark('sl-ts', { fy: s.fy })
  const sym = r.nC === 2 && s.cantL === s.cantR
  const rows: PatRow[] = (['cant', 'span', 'all'] as LLPattern[]).map((p) => ({ p, RA: r.patterns[p].RA, RB: r.patterns[p].RB, M: r.patterns[p].Mmax }))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            setS(randomCant(Math.floor(Math.random() * 1e9)))
            setRandom(true)
          }}
        >
          🎲 Random exam-style slab
        </button>
        <button className="text-sm text-accent underline" onClick={() => set(CANT0)}>
          2021-22 Q1(a)
        </button>
        <button className="text-sm text-accent underline" onClick={() => set({ span: 14, support: 12, cantL: 6.5, cantR: 6.5, ll: 80, ff: 25, pw: 30, dl: 0, fc: 3000, fy: 50000, h: 6, bar: 'auto' })}>
          2002-03 (fy 50)
        </button>
        <button className="text-sm text-accent underline" onClick={() => set({ span: 12, support: 10, cantL: 0, cantR: 5, ll: 80, ff: 0, pw: 0, dl: 140, fc: 3000, fy: 60000, h: 6.5, bar: 'auto' })}>
          2006-07 (one cantilever)
        </button>
      </div>
      {random && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">{cantStatement(s)}</div>}
      <div className="grid grid-cols-2 cq-md:grid-cols-4 cq-lg:grid-cols-6 gap-2">
        <Num label="Clear span" value={s.span} onChange={(v) => set({ span: v })} step={0.5} unit="ft" />
        <Num label="Support width" value={s.support} onChange={(v) => set({ support: v })} step={1} unit="in" />
        <Num label="Left cantilever (0 = none)" value={s.cantL} onChange={(v) => set({ cantL: Math.max(0, v) })} step={0.5} unit="ft" />
        <Num label="Right cantilever" value={s.cantR} onChange={(v) => set({ cantR: Math.max(0, v) })} step={0.5} unit="ft" />
        <Num label="LL" value={s.ll} onChange={(v) => set({ ll: v })} step={10} unit="psf" />
        <Num label="Floor finish" value={s.ff} onChange={(v) => set({ ff: v })} step={5} unit="psf" />
        <Num label="Partition wall" value={s.pw} onChange={(v) => set({ pw: v })} step={5} unit="psf" />
        <Num label="DL incl. self-wt (0 = compute)" value={s.dl} onChange={(v) => set({ dl: v })} step={5} unit="psf" />
        <Pick label="f'c" value={s.fc} onChange={(v) => set({ fc: v })} options={FC_OPTS} />
        <Pick label="fy" value={s.fy} onChange={(v) => set({ fy: v })} options={FY_OPTS} />
        <Num label="h given (0 = auto)" value={s.h} onChange={(v) => set({ h: v })} step={0.25} unit="in" />
        <Pick label="Main bar" value={s.bar} onChange={(v) => set({ bar: v })} options={BAR_OPTS} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Live-load pattern:</span>
        <Seg value={pat} onChange={setPat} items={(['cant', 'span', 'all'] as LLPattern[]).map((v) => ({ v, label: PATTERN_LABEL[v] }))} />
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <CantSketch r={r} pattern={pat} />
      </div>
      <div className="grid cq-lg:grid-cols-2 gap-4" key={key}>
        <Box title="Checkpoints — moments">
          <Answer id={id('h')} label="h (in)" value={r.h} compact />
          <Answer id={id('wu')} label="wu (psf)" value={r.loads.wu} abs={0.6} compact />
          <Answer id={id('mn')} label="−Mu at face (k-ft/ft)" value={r.Mneg} abs={0.03} compact />
          <Answer id={id('mp')} label="+Mu in span (k-ft/ft)" value={r.Mpos} abs={0.03} compact />
          {sym ? <Answer id={id('up')} label="uplift pattern: M at midspan" value={r.uplift.Mmid} abs={0.03} compact /> : <Answer id={id('up')} label="uplift pattern: far-end reaction" value={s.cantL > 0 ? r.uplift.RB : r.uplift.RA} abs={0.02} compact />}
          <Answer id={id('asp')} label="As+ (in²/ft)" value={r.asPos.As} abs={0.003} compact />
          <Answer id={id('asn')} label="As− (in²/ft)" value={r.asNeg.As} abs={0.003} compact />
        </Box>
        <Box title="Checkpoints — bars & shear">
          <Answer id={id('sp')} label={`bottom s (#${r.bar})`} value={r.pos.s} unit="in" compact />
          <Answer id={id('ex')} label="extra top bars per 2s" value={r.extra.n} compact />
          <Answer id={id('st')} label={`straight top s (#${r.bar})`} value={r.straight.s} unit="in" compact />
          <Answer id={id('ts')} label="T&S #3 spacing" value={r.ts.s} unit="in" compact />
          <Answer id={id('vc')} label="Vu cantilever at d (k)" value={r.shear.Vcant} abs={0.03} compact />
          <Answer id={id('pv')} label="φVc (k/ft)" value={r.shear.phiVc} abs={0.03} compact />
        </Box>
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Live-load patterns (A = left support, B = right) — fill the table</div>
        <CheckTable key={key} rows={rows} rowKey={(x) => x.p} given={[{ label: 'Pattern', get: (x) => PATTERN_LABEL[x.p] }]} cols={PAT_COLS} idp={id('pat')} />
      </div>
      <Reveal id={id('sol')} title="Full solution (handnote style)">
        <CantSolution r={r} sketch={false} />
      </Reveal>
    </div>
  )
}

// ================================================================ pages
function Overview() {
  return (
    <div>
      <Section title="One-way slabs" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic={TID} /></div>}>
        <Md>{`A slab supported on two opposite sides — or on four sides with **long/short ≥ 2** — bends in one direction only, so a **12-in strip is designed as a beam**. Every paper has a one-way slab (usually 20–28 marks) and almost every paper adds the **temperature & shrinkage steel** theory question (17 of 19 papers).

### The two numerical templates
- **Strip with cantilever(s)** (2002-03 → 2017-18, 2021-22 Q1(a)): 14 ft span with 5–6.5 ft overhangs on one or both sides, "LL can occupy any portion" → statics with **live-load patterns**, then cranked bars + extra top. Coefficients do NOT apply.
- **Continuous slab with ACI coefficients** (2023-24 Q7(a), 2013-14, 2011-12, Oct 2013, Feb 2017, 2016-17, Jan 2021, Oct 2022): two (or more) equal spans built integrally with spandrel beams → −1/24, +1/14, −1/9; the coefficient table is printed with the paper.

### Formulas you write every time
- $h_{min}$ = l/20, l/24, l/28, l/10 × $(0.4 + f_y/100{,}000)$; d = h − 1 in.
- $w_u = 1.2D + 1.6L$ psf → k/ft per ft. $M_u = C w_u l_n^2$.
- $A_s = M_u\\times 12/[0.9f_y(d - a/2)]$, $a = A_sf_y/(0.85f'_c\\,12)$; $A_{s,min} = 0.0018bh$ (Gr 60), 0.0020 (Gr 40/50).
- $s = 12A_b/A_s$, round down to ½ in, ≤ 3h & 18 in; T&S ≤ 5h & 18 in.
- Extra top in 2s: $A_s(2s)/12 - A_b$ → bars. Shear: $\\phi V_c = 0.75\\cdot2\\sqrt{f'_c}\\cdot12d$.`}</Md>
        <Callout kind="exam">The lab has both templates with 🎲 exam-style problems, the live-load pattern switcher and the class bar layout. Theory: open the Theory tab — T&S steel is the single most repeated question in CE 315.</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  const ex = useMemo(() => oneWayCoef({ spans: [15, 15], ends: ['spandrel', 'spandrel'], ll: 100, fc: 4000, fy: 60000, h: 6.5, bar: 3 }), [])
  const ex2 = useMemo(() => cantSlab({ span: 14, support: 12, cantL: 5, cantR: 5, ll: 100, ff: 30, pw: 60, fc: 3500, fy: 60000 }), [])
  return (
    <div>
      <Section title="Which method?">
        <Flow
          rows={[
            { q: 'Supported on 2 opposite sides, or lb/la ≥ 2?', yes: 'ONE-WAY: design a 12-in strip', no: 'two-way → coefficient method (Tables 12.3–12.6)' },
            { q: 'Any cantilever / overhang?', yes: 'statics + live-load patterns (Recipe 2)', no: 'continuous → ACI coefficients (Recipe 1)' },
            { q: 'Exterior support?', yes: 'spandrel −1/24 · column −1/16 · brick wall: none, +1/11 in the end span', no: '' },
            { q: 'Number of spans?', yes: '2 → −1/9 at the interior support, +1/14 · 3+ → −1/10 first interior, −1/11 others, +1/16 interior spans', no: '' },
          ]}
        />
      </Section>
      <Section title="Recipe 1 — continuous slab (ACI coefficients)">
        <Steps>
          <Step n={1} title="h: end span ln/24, interior ln/28 (× 0.4 + fy/100 000); round up; d = h − 1" />
          <Step n={2} title="wu = 1.2(self-wt + FF + PW) + 1.6 LL on a 1-ft strip" />
          <Step n={3} title="Mu = C wu ln² at every critical section (ln averaged at interior supports)" />
          <Step n={4} title="Depth check with ρ0.005" />
          <Step n={5} title="As at each section; compare with 0.0018bh" />
          <Step n={6} title="Bottom spacing (≤ 3h, 18 in); alternate bars cranked" />
          <Step n={7} title="Extra top = As·2s/12 − Ab → bars; T&S bars ⊥" />
          <Step n={8} title="Shear 1.15wu ln/2 − wu d vs φVc; sketch section + plan with legend" />
        </Steps>
      </Section>
      <Section title="Recipe 2 — slab with cantilever(s)">
        <Steps>
          <Step n={1} title="L = clear + support width (c/c); a = cantilever from the face, a_c to the support centre" />
          <Step n={2} title="h = max(span l/24 or l/28, cantilever l/10)" />
          <Step n={3} title="−Mu = wu a²/2 (LL on the cantilever)" />
          <Step n={4} title="+Mu: LL on the span only, DL on the cantilever(s): wuL²/8 − 1.2wD a_c²/2, or R²/2wu" />
          <Step n={5} title="Uplift: DL on the span + full load on the cantilever(s) → top steel through the span if M < 0" />
          <Step n={6} title="As±, bottom bars cranked into the cantilever top + extra top, T&S; shear wu(a − d)" />
        </Steps>
      </Section>
      <Section title="Traps">
        <Callout kind="trap">ACI coefficients use the CLEAR span; at interior supports the average of the two adjacent clear spans. They do not apply to slabs with cantilevers.</Callout>
        <Callout kind="trap">Two spans → −1/9; more than two → −1/10 at the first interior support. Brick-wall end: +1/11 and no exterior negative moment.</Callout>
        <Callout kind="trap">fy ≠ 60 ksi: multiply h_min by (0.4 + fy/100 000) and use 0.0020bh for Grade 40/50. As,min uses h (gross), not d.</Callout>
        <Callout kind="trap">Round h UP, spacing DOWN (to ½ in). Extra bars: round up unless only a hair above a whole number (2.07 → 2, but 2.12 → 3).</Callout>
        <Callout kind="trap">Cantilever relief uses the length to the support centre in statics, but the design −Mu is at the face: wu a²/2.</Callout>
      </Section>
      <Section title="Lecture Example 12.1 (2 × 15 ft, LL 100, 4/60, h = 6.5) — engine solution" sub="Class answer: 6.43 / 4.13 / 2.41 k-ft, #3 @ 7.5 alt ckd, 2 + 1 extra top, #3 @ 9 T&S. The class later redid it with h = l/24 = 7.5 in (set h = 0 in the lab).">
        <CoefSolution r={ex} />
      </Section>
      <Section title="2021-22 Q1(a): 14 ft span, 5 ft cantilevers both sides">
        <Reveal title="Show the full cantilever solution">
          <CantSolution r={ex2} />
        </Reveal>
      </Section>
    </div>
  )
}

function Lab() {
  const [tab, setTab] = useState<'cont' | 'cant'>('cont')
  return (
    <div>
      <PickSection topic="rc-oneway" skills={ONEWAY_PICKS} />
      <Section title="Bar spacing simulator" sub="Pick the bar size and spacing for the bottom bars, the extra top bars over the support and the T&S bars. The sections redraw live and every spacing rule is checked as you move the sliders.">
        <OneWaySpacingSim />
      </Section>
      <Section title="Design problems" sub="A full paper-style question each roll: floor plan or strip, loads, materials. Work it in the class order, check each step, then open the full solution.">
        <OneWayDesign />
      </Section>
      <Section title="One-way slab designer with checkpoints" sub="Change anything or roll a random exam problem; fill the checkpoints, then open the full solution.">
        <div className="mb-3">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { v: 'cont', label: 'Continuous (ACI coefficients)' },
              { v: 'cant', label: 'With cantilever(s) (statics)' },
            ]}
          />
        </div>
        {tab === 'cont' ? <ContLab /> : <CantLab />}
      </Section>
    </div>
  )
}

// ================================================================ practice problems
const coefChecks = (p: OneWayCoefInput) => (): Check[] => {
  const r = oneWayCoef(p)
  const out: Check[] = [
    { key: 'h', label: 'h', value: r.h, unit: 'in' },
    { key: 'wu', label: 'wu', value: r.loads.wu, unit: 'psf', tol: 0.01 },
  ]
  for (const s of r.sections.filter((x) => !x.mirror)) out.push({ key: s.id, label: `Mu, ${s.label}`, value: s.Mu, unit: 'k-ft/ft' })
  out.push({ key: 's0', label: 'bottom spacing, end span', value: r.spanBars[0].s, unit: 'in' })
  const fi = r.supports.find((x) => x.sec.at === 1)
  if (fi) out.push({ key: 'ex', label: `extra top bars, ${fi.sec.label}`, value: fi.extra.n })
  out.push({ key: 'ts', label: 'T&S #3 spacing', value: r.ts.s, unit: 'in' })
  return out
}
const cantChecks = (p: CantSlabInput) => (): Check[] => {
  const r = cantSlab(p)
  return [
    { key: 'h', label: 'h', value: r.h, unit: 'in' },
    { key: 'mn', label: '−Mu', value: r.Mneg, unit: 'k-ft/ft' },
    { key: 'mp', label: '+Mu', value: r.Mpos, unit: 'k-ft/ft' },
    { key: 'asp', label: 'As+', value: r.asPos.As, unit: 'in²/ft' },
    { key: 'asn', label: 'As−', value: r.asNeg.As, unit: 'in²/ft' },
    { key: 'sp', label: `bottom spacing (#${r.bar})`, value: r.pos.s, unit: 'in' },
    { key: 'ex', label: 'extra top bars', value: r.extra.n },
  ]
}

const P1: OneWayCoefInput = { spans: [13, 13, 13], ends: ['column', 'column'], ll: 100, ff: 25, fc: 3000, fy: 60000 }
const P2: CantSlabInput = { span: 15, support: 10, cantL: 0, cantR: 6, ll: 80, ff: 30, pw: 40, fc: 3500, fy: 60000 }
const P3: CantSlabInput = { span: 13, support: 12, cantL: 4, cantR: 6, dlTotal: 150, ll: 100, fc: 3000, fy: 60000, h: 7 }
const P4: OneWayCoefInput = { spans: [12, 12], ends: ['unrestrained', 'unrestrained'], ll: 40, other: 40, fc: 3000, fy: 40000 }

const problems: RcQ[] = [
  {
    id: 'rc-own-1w-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'B',
    no: '1',
    marks: 0,
    topics: [TID],
    title: 'Three equal spans on exterior columns',
    text: 'A one-way slab is built integrally with its supports: three equal clear spans of 13 ft, the outer supports being **columns** (no spandrel beam). LL = 100 psf, floor finish 25 psf + self-weight. f\'c = 3 ksi, fy = 60 ksi. Design with the ACI coefficients and sketch.',
    pages: [],
    given: [{ label: 'ACI coefficients', ref: 'sl-aci' }, { label: 'Min thickness', ref: 'sl-hmin' }],
    checks: coefChecks(P1),
    solution: () => <CoefSolution r={oneWayCoef(P1)} />,
  },
  {
    id: 'rc-own-1w-2',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '2',
    marks: 0,
    topics: [TID],
    title: 'Slab on brick walls with a 6 ft balcony',
    text: 'A one-way slab spans 15 ft (clear) between 10 in brick walls and overhangs 6 ft beyond one wall as a balcony. LL = 80 psf (any portion), FF = 30 psf, PW = 40 psf + self-weight. f\'c = 3.5 ksi, fy = 60 ksi. Find h, the critical moments (with LL patterns) and the reinforcement.',
    pages: [],
    given: [{ label: 'Min thickness', ref: 'sl-hmin' }, { label: 'T&S steel', ref: 'sl-ts' }],
    checks: cantChecks(P2),
    solution: () => <CantSolution r={cantSlab(P2)} />,
  },
  {
    id: 'rc-own-1w-3',
    paper: 'own',
    level: 'challenge',
    sec: 'B',
    no: '3',
    marks: 0,
    topics: [TID],
    title: 'Unequal cantilevers (4 ft and 6 ft)',
    text: 'A 7 in one-way slab: 4′ cantilever – 12″ beam – 13′-0″ clear span – 12″ beam – 6′ cantilever. DL = 150 psf including self-weight, working LL = 100 psf on any portion. f\'c = 3 ksi, fy = 60 ksi. Find the critical moments (check the uplift pattern) and design.',
    pages: [],
    checks: cantChecks(P3),
    solution: () => <CantSolution r={cantSlab(P3)} />,
  },
  {
    id: 'rc-own-1w-4',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '4',
    marks: 0,
    topics: [TID],
    title: 'Roof on brick walls, Grade 40 steel',
    text: 'A roof slab spans two 12 ft clear spans across brick walls (continuous over the middle wall). Lime terracing 40 psf, roof LL 40 psf + self-weight. f\'c = 3 ksi, fy = 40 ksi. Design with the ACI coefficients (note the fy factor on h and the Grade 40 T&S ratio).',
    pages: [],
    given: [{ label: 'ACI coefficients', ref: 'sl-aci' }, { label: 'T&S steel', ref: 'sl-ts' }],
    checks: coefChecks(P4),
    solution: () => <CoefSolution r={oneWayCoef(P4)} />,
  },
]

const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory: ONEWAY_THEORY }
export default mod
