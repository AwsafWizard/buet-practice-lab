import { useMemo, useState } from 'react'
import { Answer, Callout, Choice, Md, Reveal, Section, Step, Steps } from '../../../components/ui'
import { CheckTable, hashKey, type CheckCol } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { RcFrequency } from '../../components/Frequency'
import { CASE_TEXT, twoWay, type EdgeName, type Edges, type SlabCase, type TwoWayInput, type TwSteel } from '../../engine/twoway'
import { CasePict } from '../../reference/slab'
import type { Check, RcQ, RcTopicModule } from '../../types'
import { Box, f, FC_OPTS, Flow, FY_OPTS, Num, Pick, useMark } from '../oneway/kit'
import { PanelPlan } from './plan'
import { TwoWaySolution } from './solution'
import { TWOWAY_THEORY } from './theory'
import { TwoWayDesign } from './DesignProblems'
import { PickSection } from '../../components/PickDrill'
import { TWOWAY_PICKS } from './picks'
import { TwoWaySpacingSim } from './SpacingSim'

const TID = 'rc-twoway'
const E = (s: string): Edges => ({ top: s.includes('t'), right: s.includes('r'), bottom: s.includes('b'), left: s.includes('l') })
const edgeStr = (e: Edges) => (['top', 'right', 'bottom', 'left'] as EdgeName[]).filter((k) => e[k]).join(', ') || 'none'

interface TwState {
  lx: number
  ly: number
  /** beam width (in) when lx, ly are c/c; 0 = lx, ly are clear */
  bw: number
  edges: Edges
  ll: number
  ff: number
  pw: number
  dl: number
  fc: number
  fy: number
  h: number
  bar: number
}
const D2: TwState = { lx: 25, ly: 20, bw: 0, edges: E('bl'), ll: 60, ff: 25, pw: 40, dl: 0, fc: 3000, fy: 60000, h: 0, bar: 3 }
const toInput = (s: TwState): TwoWayInput => ({
  lx: s.lx - s.bw / 12,
  ly: s.ly - s.bw / 12,
  edges: s.edges,
  ll: s.ll,
  ff: s.ff,
  pw: s.pw,
  dlTotal: s.dl > 0 ? s.dl : undefined,
  fc: s.fc,
  fy: s.fy,
  h: s.h > 0 ? s.h : undefined,
  bar: s.bar,
})

const EDGE_SETS = ['bl', 'br', 'tl', 'tr', 'bl', 'tr', 'tblr', 'tblr', 'tbl', 'tbr', 'lrt', 'lrb', 't', 'l', 'tb', 'lr', '', 'b', 'r']
function randomTw(seed: number): TwState {
  const r = rng(seed)
  const la = randInt(r, 14, 24, 1)
  const lb = Math.min(la * 1.9, la + randInt(r, 0, 8, 1))
  const land = r() < 0.6
  const cc = r() < 0.3
  const bw = cc ? pick(r, [12, 15, 18, 24]) : 0
  return {
    lx: land ? lb + (cc ? bw / 12 : 0) : la + (cc ? bw / 12 : 0),
    ly: land ? la + (cc ? bw / 12 : 0) : lb + (cc ? bw / 12 : 0),
    bw,
    edges: E(pick(r, EDGE_SETS)),
    ll: pick(r, [40, 60, 80, 100]),
    ff: pick(r, [25, 30, 35, 40]),
    pw: pick(r, [0, 40, 50, 60]),
    dl: 0,
    fc: pick(r, [3000, 3000, 3500, 4000]),
    fy: pick(r, [60000, 60000, 60000, 40000]),
    h: 0,
    bar: 3,
  }
}
function panelName(cs: SlabCase) {
  return cs === 4 ? 'corner panel' : cs === 2 ? 'interior panel' : cs === 8 || cs === 9 ? 'edge panel' : cs === 1 ? 'isolated panel on brick walls / edge beams all round' : 'panel'
}
const statement = (s: TwState, cs: SlabCase) =>
  `Design the ${panelName(cs)} of a monolithic floor: ${s.lx} ft × ${s.ly} ft ${s.bw ? `centre-to-centre of ${s.bw} in wide stiff beams (αm > 2)` : '(clear) on stiff beams'}; the slab is continuous across the ${edgeStr(s.edges)} edge(s) as drawn. LL = ${s.ll} psf, floor finish ${s.ff} psf${s.pw ? `, partition wall ${s.pw} psf` : ''} + self-weight. f'c = ${s.fc / 1000} ksi, fy = ${s.fy / 1000} ksi. Use the moment coefficient method (Tables 12.3–12.6) and show the reinforcement in a sketch.`

type CoefRow = { k: string; name: string; v: number }
const COEF_COLS: CheckCol<CoefRow>[] = [{ key: 'v', label: 'coefficient', get: (x) => x.v, abs: 0.0006, digits: 4 }]
const ST_COLS: CheckCol<TwSteel>[] = [
  { key: 'Mu', label: 'Mu (k-ft/ft)', get: (x) => x.Mu, abs: 0.03, digits: 2 },
  { key: 'As', label: 'As req (in²/ft)', get: (x) => x.as.As, abs: 0.003, digits: 3 },
]

function TwLab() {
  const [s, setS] = useState<TwState>(D2)
  const [random, setRandom] = useState(false)
  const set = (o: Partial<TwState>) => {
    setS({ ...s, ...o })
    setRandom(false)
  }
  const r = useMemo(() => twoWay(toInput(s)), [s])
  const key = hashKey(JSON.stringify(['tw', s]))
  const id = (k: string) => `${TID}:lab:${key}:${k}`
  const mm = Math.max(0.5, r.m)
  useMark('sl-t123', { case: r.case, m: mm })
  useMark('sl-t124', { case: r.case, m: mm })
  useMark('sl-t125', { case: r.case, m: mm })
  useMark('sl-t126', { case: r.case, m: mm })
  useMark('sl-h2way', { la: +f(r.geo.la, 2), lb: +f(r.geo.lb, 2), h: r.h })
  useMark('sl-ts', { fy: s.fy })
  const coefRows: CoefRow[] = [
    { k: 'aNeg', name: 'Ca,neg (12.3)', v: r.C.aNeg },
    { k: 'bNeg', name: 'Cb,neg (12.3)', v: r.C.bNeg },
    { k: 'aDL', name: 'Ca,dl (12.4)', v: r.C.aDL },
    { k: 'bDL', name: 'Cb,dl (12.4)', v: r.C.bDL },
    { k: 'aLL', name: 'Ca,ll (12.5)', v: r.C.aLL },
    { k: 'bLL', name: 'Cb,ll (12.5)', v: r.C.bLL },
    { k: 'Wa', name: 'Wa (12.6)', v: r.C.Wa },
  ].filter((x): x is CoefRow => x.v !== null && (x.k !== 'aNeg' || r.M.aNeg !== null) && (x.k !== 'bNeg' || r.M.bNeg !== null))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            setS(randomTw(Math.floor(Math.random() * 1e9)))
            setRandom(true)
          }}
        >
          🎲 Random exam-style panel
        </button>
        <button className="text-sm text-accent underline" onClick={() => set(D2)}>
          Lecture corner panel
        </button>
        <button className="text-sm text-accent underline" onClick={() => set({ ...D2, lx: 30, ly: 25, bw: 24, edges: E('tr'), ll: 40, pw: 50, ff: 25, fc: 3500 })}>
          2023-24 Q8(a)
        </button>
        <button className="text-sm text-accent underline" onClick={() => set({ ...D2, ll: 80, pw: 60, ff: 40 })}>
          2021-22 Q2(a)
        </button>
      </div>
      {random && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">{statement(s, r.case)}</div>}
      <div className="grid cq-lg:grid-cols-[1.3fr_1fr] gap-4">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <div className="text-xs text-faint px-1">Click an edge to make it continuous (hatched) or discontinuous.</div>
          <PanelPlan lx={toInput(s).lx} ly={toInput(s).ly} edges={s.edges} onToggle={(e) => set({ edges: { ...s.edges, [e]: !s.edges[e] } })} r={r} />
        </div>
        <div className="grid grid-cols-2 gap-2 content-start">
          <Num label={s.bw ? 'Horizontal span (c/c)' : 'Horizontal span (clear)'} value={s.lx} onChange={(v) => set({ lx: v })} step={0.5} unit="ft" />
          <Num label={s.bw ? 'Vertical span (c/c)' : 'Vertical span (clear)'} value={s.ly} onChange={(v) => set({ ly: v })} step={0.5} unit="ft" />
          <Num label="Beam width (0 = spans are clear)" value={s.bw} onChange={(v) => set({ bw: Math.max(0, v) })} step={1} unit="in" />
          <Num label="LL" value={s.ll} onChange={(v) => set({ ll: v })} step={10} unit="psf" />
          <Num label="Floor finish" value={s.ff} onChange={(v) => set({ ff: v })} step={5} unit="psf" />
          <Num label="Partition wall" value={s.pw} onChange={(v) => set({ pw: v })} step={5} unit="psf" />
          <Num label="DL incl. self-wt (0 = compute)" value={s.dl} onChange={(v) => set({ dl: v })} step={5} unit="psf" />
          <Pick label="f'c" value={s.fc} onChange={(v) => set({ fc: v })} options={FC_OPTS} />
          <Pick label="fy" value={s.fy} onChange={(v) => set({ fy: v })} options={FY_OPTS} />
          <Num label="h given (0 = formula)" value={s.h} onChange={(v) => set({ h: v })} step={0.25} unit="in" />
          <Pick label="Bar" value={s.bar} onChange={(v) => set({ bar: v })} options={[3, 4, 5].map((v) => ({ v, label: `#${v}` }))} />
        </div>
      </div>
      {r.geo.oneWay && <Callout kind="trap">lb/la = {f(r.geo.ratio, 2)} ≥ 2: this is a ONE-WAY slab — use the one-way topic. Values below use m = 0.5.</Callout>}
      <div className="grid cq-lg:grid-cols-2 gap-4" key={key}>
        <Box title="Checkpoints — classify, thickness, load">
          <Choice id={id('case')} label="Case" options={([1, 2, 3, 4, 5, 6, 7, 8, 9] as SlabCase[]).map((c) => ({ v: String(c), label: String(c) }))} answer={String(r.case)} />
          <Answer id={id('m')} label="m = la/lb" value={r.m} abs={0.002} compact />
          <Answer id={id('h')} label="h (in)" value={r.h} compact />
          <Answer id={id('wu')} label="wu (psf)" value={r.loads.wu} abs={0.6} compact />
        </Box>
        <Box title="Checkpoints — bars, corners, beams">
          <Answer id={id('sa')} label={`short-way s (#${r.bar})`} value={r.midA.s} unit="in" compact />
          <Answer id={id('sb')} label="long-way s" value={r.midB.s} unit="in" compact />
          {r.extra.aNeg && <Answer id={id('exa')} label="extra top, short dir, cont. edge" value={r.extra.aNeg.n} compact />}
          <Answer id={id('csa')} label="column strip s, short dir" value={r.col.a.s} unit="in" compact />
          {r.corner.corners.length > 0 && <Answer id={id('cz')} label="corner zone (ft)" value={r.corner.zone} compact />}
          <Answer id={id('wl')} label="load on each long beam (k/ft)" value={r.beams.wLongBeam} abs={0.03} compact />
          <Answer id={id('ws')} label="load on each short beam (k/ft)" value={r.beams.wShortBeam} abs={0.03} compact />
        </Box>
      </div>
      <div className="grid cq-lg:grid-cols-[auto_1fr] gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Coefficients (interpolate)</div>
          <CheckTable key={key + ":coef"} rows={coefRows} rowKey={(x) => x.k} given={[{ label: 'Coefficient', get: (x) => x.name }]} cols={COEF_COLS} idp={id('coef')} />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Moments and steel</div>
          <CheckTable key={key + ":st"} rows={r.steel} rowKey={(x) => x.key} given={[{ label: 'Section', get: (x) => x.label }, { label: 'd (in)', get: (x) => f(x.d, 2) }]} cols={ST_COLS} idp={id('st')} />
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution (handnote style)">
        <TwoWaySolution r={r} plan={false} />
      </Reveal>
    </div>
  )
}

// ================================================================ pages
function CaseChart() {
  return (
    <div className="grid grid-cols-3 cq-md:grid-cols-9 gap-2">
      {([1, 2, 3, 4, 5, 6, 7, 8, 9] as SlabCase[]).map((c) => (
        <div key={c} className="rounded-lg border border-line p-1.5 flex flex-col items-center gap-1 text-center">
          <CasePict cs={c} w={46} active={c === 4} />
          <div className="text-xs font-bold">Case {c}</div>
          <div className="text-[10px] text-mute leading-tight">{CASE_TEXT[c]}</div>
        </div>
      ))}
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Two-way slabs — moment coefficient method" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic={TID} /></div>}>
        <Md>{`Edge-supported panels with $l_b/l_a < 2$ bend in both directions. The class (and BNBC) use the **1963 ACI moment coefficient method** with Nilson Tables 12.3–12.6, which are printed with the paper.

### How it is asked
- **Corner panel (Case 4)** with LL + PW + FF, "show the reinforcement in sketches" — 2023-24 Q8(a) (28 marks), 2021-22 Q2(a), 2020-21 Q7(a), Oct 2022. Older: four panels on brick walls (2013-14), L-shaped slab (2015-16: Cases 4 and 6), Feb 2017 S-1 (Case 6), 2016-17 two-way version.
- **Corner reinforcement** theory (7–10 marks): 2023-24, 2020-21, 2017-18.
- Jan 2021 replaced it with a Direct Design Method set (αfm, h by eq. 13.8b, Table 13.4) — see the code pane item.

### The formulas
- $m = l_a/l_b$ (clear spans), case from continuous edges; $h = l_n(0.8 + f_y/200{,}000)/(36 + 9\\beta) \\ge 3.5$ in.
- $M_{neg} = C_{neg}w_ul^2$ (Table 12.3, total load); $M_{pos} = C_{dl}w_Dl^2 + C_{ll}w_Ll^2$ (12.4 + 12.5); discontinuous edge $-M = \\tfrac13(+M)$.
- $d$ = h − 1 (short, lower layer), h − 1.5 (long +). $A_{s,min} = 0.0018bh$, $s \\le 2h$.
- Column strips 1.5s (≤ 2h, ≥ $A_{s,min}$); corner steel = max +ve steel, top & bottom, over $l_b/5$.
- Beams: long $W_aW/2l_b$, short $W_bW/2l_a$ (Table 12.6).`}</Md>
      </Section>
    </div>
  )
}

function Approach() {
  const ex = useMemo(() => twoWay(toInput(D2)), [])
  return (
    <div>
      <Section title="Which case? (hatched = continuous)">
        <Flow
          rows={[
            { q: 'Supported on all four sides and lb/la < 2?', yes: 'two-way, coefficient method', no: 'one-way: design a strip (one-way topic)' },
            { q: 'Interior panel (neighbours on all sides)?', yes: 'Case 2', no: '' },
            { q: 'Corner panel (two adjacent outside edges)?', yes: 'Case 4', no: '' },
            { q: 'Edge panel (one outside edge)?', yes: 'outside edge LONG → Case 8 · outside edge SHORT → Case 9', no: '' },
            { q: 'Only one continuous edge?', yes: 'long → Case 6 · short → Case 7 (square: call it long → 6)', no: '' },
            { q: 'Two opposite continuous edges?', yes: 'both short → Case 3 · both long → Case 5', no: 'none continuous (brick walls) → Case 1' },
          ]}
        />
        <div className="mt-3">
          <CaseChart />
        </div>
      </Section>
      <Section title="Recipe 3 — two-way panel">
        <Steps>
          <Step n={1} title="Clear spans la ≤ lb, m = la/lb; case 1–9" />
          <Step n={2} title="h = ln(0.8 + fy/200 000)/(36 + 9β) ≥ 3.5 in; round up; d = h − 1 (short), h − 1.5 (long +)" />
          <Step n={3} title="wD,u = 1.2D, wL,u = 1.6L, wu" />
          <Step n={4} title="Ma,neg = Ca wu la², Mb,neg = Cb wu lb² (Table 12.3) at continuous edges" />
          <Step n={5} title="Ma,pos = Ca,dl wD la² + Ca,ll wL la²; same for b (Tables 12.4 + 12.5)" />
          <Step n={6} title="Discontinuous edges: −M = ⅓ (+M)" />
          <Step n={7} title="As for every moment (≥ 0.0018bh), s ≤ 2h; middle strip alt cranked + extra top" />
          <Step n={8} title="Column strips 1.5s (≤ 2h, ≥ As,min); corner steel over lb/5 at exterior corners" />
          <Step n={9} title="Table 12.6 → beam loads, shear check; plan with legend (+ two sections)" />
        </Steps>
      </Section>
      <Section title="Traps">
        <Callout kind="trap">la is the SHORT clear span. Ca goes with la² and acts at the LONG edges; Cb with lb² at the SHORT edges. Using c/c instead of clear spans changes m and the coefficients.</Callout>
        <Callout kind="trap">Negative moments use the TOTAL load; positive moments are DL part (12.4) + LL part (12.5) computed separately — not (Cdl + Cll)·wu.</Callout>
        <Callout kind="trap">Interpolate linearly between table rows (m = 0.821 lies between 0.85 and 0.80); don't round m to the nearest row.</Callout>
        <Callout kind="trap">Long-direction positive bars sit on top of the short ones: d smaller by ≈ ½ in. Corner zone is l/5 of the LONGER span both ways.</Callout>
        <Callout kind="trap">2023-24 Q8(a): spans are c/c of 24 in beams → clear 23 × 28 ft. Read the break lines: they mark the continuous edges.</Callout>
      </Section>
      <Section title="Class corner panel (20 × 25 ft clear, LL 60, PW 40, FF 25, 3/60) — engine solution" sub="Class answer: h = 7 in, wu = 279 psf, 7.92 / 5.06 / 4.70 / 3.03, #3 @ 7 alt ckd short way, Wa = 0.71 → 1.98 k/ft.">
        <TwoWaySolution r={ex} />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <PickSection topic="rc-twoway" skills={TWOWAY_PICKS} />
      <Section title="Bar spacing simulator" sub="Set the middle-strip and column-strip spacings both ways and watch the bar mesh redraw on the panel. Middle strips are checked for strength and 2h, column strips for the 1.5× rule, As,min and 2h.">
        <TwoWaySpacingSim />
      </Section>
      <Section title="Design problems" sub="A floor plan with several panels: identify panel S1's case from its neighbours, then design it in the class order and check each step.">
        <TwoWayDesign />
      </Section>
      <Section title="Two-way panel designer with checkpoints" sub="Set the spans, click the edges, roll a random panel; the code-pane tables highlight the case and m you used.">
        <TwLab />
      </Section>
    </div>
  )
}

// ================================================================ practice problems
const twChecks = (p: TwoWayInput) => (): Check[] => {
  const r = twoWay(p)
  const out: Check[] = [
    { key: 'case', label: 'case', value: r.case },
    { key: 'h', label: 'h', value: r.h, unit: 'in' },
    { key: 'wu', label: 'wu', value: r.loads.wu, unit: 'psf', tol: 0.01 },
  ]
  if (r.M.aNeg !== null) out.push({ key: 'an', label: 'Ma,neg', value: r.M.aNeg, unit: 'k-ft/ft' })
  if (r.M.bNeg !== null) out.push({ key: 'bn', label: 'Mb,neg', value: r.M.bNeg, unit: 'k-ft/ft' })
  out.push({ key: 'ap', label: 'Ma,pos', value: r.M.aPos, unit: 'k-ft/ft' }, { key: 'bp', label: 'Mb,pos', value: r.M.bPos, unit: 'k-ft/ft' })
  out.push({ key: 'sa', label: `short-way spacing (#${r.bar})`, value: r.midA.s, unit: 'in' }, { key: 'wl', label: 'load on each long beam', value: r.beams.wLongBeam, unit: 'k/ft' })
  return out
}
const Q1: TwoWayInput = { lx: 18, ly: 18, edges: E('tblr'), ll: 100, ff: 25, fc: 3000, fy: 60000 }
const Q2: TwoWayInput = { lx: 26, ly: 20, edges: E('lrt'), ll: 80, pw: 50, ff: 30, fc: 3000, fy: 60000 }
const Q3: TwoWayInput = { lx: 27, ly: 21, edges: E('tl'), ll: 60, pw: 40, ff: 25, fc: 3000, fy: 40000 }

const mk = (id: string, no: string, level: RcQ['level'], title: string, text: string, p: TwoWayInput): RcQ => ({
  id,
  paper: 'own',
  level,
  sec: 'B',
  no,
  marks: 0,
  topics: [TID],
  title,
  text,
  pages: [],
  given: [
    { label: 'Table 12.3', ref: 'sl-t123' },
    { label: 'Table 12.4', ref: 'sl-t124' },
    { label: 'Table 12.5', ref: 'sl-t125' },
    { label: 'Table 12.6', ref: 'sl-t126' },
    { label: 'Thickness', ref: 'sl-h2way' },
  ],
  checks: twChecks(p),
  solution: () => <TwoWaySolution r={twoWay(p)} />,
})

const problems: RcQ[] = [
  mk('rc-own-2w-1', '1', 'warm-up', 'Interior square panel (Case 2)', 'An interior panel 18 ft × 18 ft (clear) of a beam-supported floor, all four edges continuous. LL = 100 psf, floor finish 25 psf + self-weight. f\'c = 3 ksi, fy = 60 ksi. Find h, all moments, the reinforcement and the load on the beams.', Q1),
  mk('rc-own-2w-2', '2', 'exam', 'Edge panel, long edge on the outside (Case 8)', 'An edge panel 20 ft × 26 ft (clear): its bottom LONG edge is on the building edge, the other three edges are continuous. LL = 80 psf, PW = 50 psf, FF = 30 psf + self-weight. f\'c = 3 ksi, fy = 60 ksi. Design by the coefficient method (interpolate m) and sketch.', Q2),
  mk('rc-own-2w-3', '3', 'challenge', 'Corner panel from c/c dimensions, Grade 40', 'Corner panel 28 ft × 22 ft centre-to-centre of 12 in wide stiff beams (clear 27 × 21 ft); continuous across the top and left edges. LL = 60 psf, PW = 40 psf, FF = 25 psf + self-weight. f\'c = 3 ksi, fy = 40 ksi. Design and show the corner reinforcement.', Q3),
]

const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory: TWOWAY_THEORY }
export default mod
