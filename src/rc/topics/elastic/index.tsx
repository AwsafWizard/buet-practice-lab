// CE 315 — Elastic analysis & WSD: uncracked / cracked transformed sections, Mcr, service stresses,
// allowable moment, the three loading stages, and the older WSD design helpers.

import { useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Step, Steps, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../../labs/common'
import { RcFrequency } from '../../components/Frequency'
import { allowableMoment, cracked, elasticAt, modular, uncracked, uncrackedStresses, wsdDesign, wsdDoublyDesign, type ElasticInput } from '../../engine/elastic'
import { BARS, Ec, fr } from '../../engine/materials'
import { stageAt, stagesData, STAGE_LABEL, type StageInput } from '../../engine/singly'
import type { RcQ, RcTheoryItem, RcTopicModule } from '../../types'
import { BAR_OPTS, Checks, COUNT_OPTS, FC_OPTS, Num, Prompt, Sel, useMark } from './inputs'
import { SectionSketch, SolSteps, StageDiagram } from './ui'

const T = 'rc-elastic'

// ---------------------------------------------------------------- problem state
interface EP {
  b: number
  h: number
  d: number
  nb: number
  bar: number
  fc: number // ksi
  fy: number // ksi
  nGiven: number | null
  frGiven: number | null // psi
  M: number // service moment k-ft
  fsAll: number // ksi
  comp: boolean
  nbc: number
  barc: number
  dp: number
  span?: number
}

const DEF: EP = { b: 14, h: 21, d: 18.5, nb: 4, bar: 8, fc: 6, fy: 60, nGiven: 7, frGiven: 581, M: 80, fsAll: 24, comp: false, nbc: 2, barc: 6, dp: 2.5 }

export const toInput = (p: EP): StageInput => ({
  b: p.b,
  h: p.h,
  d: p.d,
  As: p.nb * BARS[p.bar].A,
  Asp: p.comp ? p.nbc * BARS[p.barc].A : 0,
  dp: p.dp,
  fc: p.fc * 1000,
  fy: p.fy * 1000,
  n: p.nGiven ?? undefined,
  frPsi: p.frGiven ?? undefined,
})

function randomEP(seed: number): EP {
  const r = rng(seed)
  const fc = pick(r, [3, 4, 4, 5, 6])
  const b = pick(r, [12, 12, 14, 14, 16])
  const h = randInt(r, 18, 28)
  const bar = pick(r, [7, 8, 8, 9, 10])
  const nb = pick(r, [3, 3, 4, 4])
  const n = Math.round(29e6 / Ec(fc * 1000))
  const frPsi = Math.round(fr(fc * 1000))
  const p: EP = { b, h, d: h - 2.5, nb, bar, fc, fy: 60, nGiven: n, frGiven: frPsi, M: 0, fsAll: 24, comp: false, nbc: 2, barc: 6, dp: 2.5, span: pick(r, [16, 18, 20, 22, 24]) }
  const a = allowableMoment(toInput(p), 0.45 * fc, 24)
  p.M = Math.round(a.M * pick(r, [0.6, 0.8, 0.9]))
  return p
}

function SectionInputs({ p, set }: { p: EP; set: (o: Partial<EP>) => void }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 cq-md:grid-cols-4 gap-2">
        <Num label="b" unit="in" value={p.b} onChange={(b) => set({ b })} />
        <Num label="h" unit="in" value={p.h} onChange={(h) => set({ h, d: Math.min(p.d, h - 1) })} />
        <Num label="d" unit="in" step={0.5} value={p.d} onChange={(d) => set({ d })} />
        <Sel label="f′c" value={p.fc} options={FC_OPTS} onChange={(fc) => set({ fc })} />
        <Sel label="Tension bars" value={p.nb} options={COUNT_OPTS} onChange={(nb) => set({ nb })} />
        <Sel label="size" value={p.bar} options={BAR_OPTS} onChange={(bar) => set({ bar })} />
        <Sel label="n" value={p.nGiven ?? 0} options={[{ v: 0, label: 'auto (Es/Ec rounded)' }, ...[6, 7, 8, 9, 10].map((v) => ({ v, label: `given ${v}` }))]} onChange={(v) => set({ nGiven: v || null })} />
        <Sel label="f_r" value={p.frGiven ?? 0} options={[{ v: 0, label: '7.5√f′c' }, ...(p.frGiven ? [{ v: p.frGiven, label: `given ${p.frGiven} psi` }] : [])]} onChange={(v) => set({ frGiven: v || null })} />
      </div>
      <div className="grid grid-cols-2 cq-md:grid-cols-4 gap-2 items-end">
        <Sel label="Allowable f_s" value={p.fsAll} options={[{ v: 24, label: '24 ksi (0.4fy, Gr 60)' }, { v: 20, label: '20 ksi (Gr 40)' }]} onChange={(fsAll) => set({ fsAll })} />
        <Sel label="Compression steel" value={p.comp ? 1 : 0} options={[{ v: 0, label: 'none (singly)' }, { v: 1, label: "yes (A′s)" }]} onChange={(v) => set({ comp: !!v })} />
        {p.comp && (
          <>
            <Sel label="A′s bars" value={p.nbc} options={COUNT_OPTS.slice(1, 5)} onChange={(nbc) => set({ nbc })} />
            <Sel label="size" value={p.barc} options={BAR_OPTS} onChange={(barc) => set({ barc })} />
          </>
        )}
      </div>
      <Slider label="Service moment M" value={p.M} min={5} max={300} step={1} onChange={(M) => set({ M })} unit=" k-ft" />
    </div>
  )
}

// ---------------------------------------------------------------- calculator
function Calculator({ p, setP, random, setRandom }: { p: EP; setP: (p: EP) => void; random: boolean; setRandom: (v: boolean) => void }) {
  const set = (o: Partial<EP>) => setP({ ...p, ...o })
  const inp = toInput(p)
  const u = uncracked(inp)
  const al = allowableMoment(inp, 0.45 * p.fc, p.fsAll)
  const at = elasticAt(inp, p.M)
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `${T}:lab:${key}:${k}`
  useMark('f-elastic', { b: p.b, h: p.h })
  useMark('m-props', { fc: p.fc * 1000 })
  useMark('f-wsd', { row: p.fsAll === 24 ? 2 : 1 })
  useMark('m-bars', { bar: p.bar })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className="btn"
          onClick={() => {
            setP(randomEP(Math.floor(Math.random() * 1e9)))
            setRandom(true)
          }}
        >
          🎲 Exam-style problem
        </button>
        {random && (
          <button className="text-sm text-accent underline" onClick={() => setRandom(false)}>
            edit the inputs
          </button>
        )}
      </div>
      {random ? (
        <Prompt>
          A simply supported beam of span {p.span ?? 20} ft has b = {p.b} in, h = {p.h} in and d = {p.d} in, reinforced with {p.nb} No. {p.bar} bars (A_s = {fmt(inp.As, 2)} in²). f′c = {p.fc} ksi, fy = {p.fy} ksi, f_r = {p.frGiven} psi, E_c = {fmt(Ec(p.fc * 1000) / 1000, 0)} ksi, E_s = 29,000 ksi, n = {p.nGiven}. Determine (i) the cracking moment M_cr; (ii) the steel stress and strain just before cracking; (iii) the maximum service moment without stressing the concrete above 0.45f′c or the steel above 0.4fy; (iv) the concrete and steel stresses under a service moment of {p.M} k-ft.
        </Prompt>
      ) : (
        <SectionInputs p={p} set={set} />
      )}
      <div className="grid cq-lg:grid-cols-[1fr_1.1fr] gap-4">
        <Checks key={key}>
          <Answer id={id('n')} label="n" value={u.n} compact />
          <Answer id={id('yb')} label="ȳ (uncracked, from top)" value={u.ybar} unit="in" compact />
          <Answer id={id('I')} label="I_ut" value={u.I} unit="in⁴" compact />
          <Answer id={id('mcr')} label="M_cr (transformed)" value={u.Mcr} unit="k-ft" compact hint={`gross: ${fmt(u.McrG, 1)}`} />
          <Answer id={id('fs0')} label="f_s just before cracking" value={u.fsCr} unit="ksi" compact />
          <Answer id={id('kd')} label="kd (cracked)" value={al.kd} unit="in" compact />
          <Answer id={id('icr')} label="I_cr" value={al.Icr} unit="in⁴" compact />
          <Answer id={id('mc')} label="M by concrete" value={al.Mc} unit="k-ft" compact />
          <Answer id={id('ms')} label="M by steel" value={al.Ms} unit="k-ft" compact />
          <Choice id={id('gov')} label="Which governs?" options={[{ v: 'concrete', label: 'Concrete' }, { v: 'steel', label: 'Steel' }]} answer={al.governs} />
          <Choice id={id('st')} label={`At M = ${p.M} k-ft`} options={[{ v: 'uncracked', label: 'Uncracked' }, { v: 'cracked', label: 'Cracked' }]} answer={at.state} />
          <Answer id={id('fc')} label="f_c (top) at M" value={at.fc} unit="ksi" compact />
          <Answer id={id('fsm')} label="f_s at M" value={at.fs} unit="ksi" compact />
        </Checks>
        <div className="space-y-2">
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <SectionSketch
              b={p.b}
              h={p.h}
              rows={[{ d: p.d, n: p.nb, db: BARS[p.bar].d }, ...(p.comp ? [{ d: p.dp, n: p.nbc, db: BARS[p.barc].d }] : [])]}
              na={at.na}
              cracked={at.state === 'cracked'}
              tag={at.state === 'cracked' ? `kd = ${fmt(at.na, 2)}″` : `ȳ = ${fmt(at.na, 2)}″`}
            />
          </div>
          <div className="text-xs text-mute">
            At M = {p.M} k-ft the section is <b>{at.state}</b> (M_cr = {fmt(u.Mcr, 1)} k-ft). Allowable service moment {fmt(al.M, 1)} k-ft ({al.governs} governs).
          </div>
        </div>
      </div>
      <Reveal id={`${T}:lab:sol`} title="Full solution">
        <div className="space-y-3">
          <div className="font-semibold text-sm">(i)–(ii) Uncracked transformed section</div>
          <SolSteps steps={u.steps} />
          <div className="font-semibold text-sm">(iii) Allowable moment (cracked section)</div>
          <SolSteps steps={al.steps} start={u.steps.length + 1} />
          <div className="font-semibold text-sm">(iv) Stresses at M = {p.M} k-ft</div>
          <SolSteps steps={at.steps.filter((s) => !u.steps.some((x) => x.t === s.t) && !al.steps.some((x) => x.t === s.t))} start={u.steps.length + al.steps.length + 1} />
        </div>
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- loading-stage playground
function Playground({ p }: { p: EP }) {
  const inp = toInput(p)
  const data = useMemo(() => stagesData(inp), [JSON.stringify(inp)]) // eslint-disable-line react-hooks/exhaustive-deps
  const top = Math.ceil(data.Mmax)
  const [M, setM] = useState(Math.round(data.u.Mcr * 0.7))
  const m = Math.min(M, top)
  const st = stageAt(data, inp, m)
  const marks: [string, number][] = [
    ['M_cr', data.u.Mcr],
    ...(data.My ? ([['M_y', data.My]] as [string, number][]) : []),
    ['M_n', data.Mult],
  ]
  return (
    <div className="space-y-3">
      <Slider label="Moment M" value={m} min={0} max={top} step={top > 200 ? 2 : 1} onChange={setM} unit=" k-ft" />
      <div className="relative h-7 rounded-lg bg-panel2 border border-line">
        <div className="absolute inset-y-0 left-0 rounded-l-lg bg-accent/25" style={{ width: `${(m / top) * 100}%` }} />
        {marks.map(([l, v]) => (
          <button key={l} className="absolute -translate-x-1/2 top-0 h-full text-[10px] font-bold text-ink px-1" style={{ left: `${(v / top) * 100}%` }} onClick={() => setM(Math.ceil(v + (l === 'M_cr' ? 0.5 : 0)))} title={`jump to ${l}`}>
            <span className="border-l border-ink/60 pl-1">
              {l} {fmt(v, 0)}
            </span>
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StageDiagram b={p.b} h={p.h} d={p.d} As={inp.As} st={st} fyKsi={p.fy} fcKsi={p.fc} bars={[{ d: p.d, n: p.nb, db: BARS[p.bar].d }]} whitney={{ a: data.rv.a }} />
      </div>
      <div className="grid cq-md:grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg border border-line p-2">
          <b>{STAGE_LABEL[st.stage]}</b>
          <div className="text-mute mt-1">
            {st.stage === 'uncracked' && 'Whole section works, concrete carries tension below the N.A. Linear strain and stress. Use the uncracked transformed section, (n − 1)A_s.'}
            {st.stage === 'cracked' && 'Tension cracks reach almost to the N.A.; concrete below it is ignored. Stress still linear (f_c < f′c/2): cracked transformed section, k and j.'}
            {st.stage === 'inelastic' && 'Concrete stress above about f′c/2: the compression stress curve bends (non-linear). Elastic formulas now underestimate f_c.'}
            {st.stage === 'yielded' && 'Steel has yielded (f_s = f_y): T stays A_s f_y, the N.A. moves up, cracks widen, the beam deflects visibly — the warning before failure.'}
            {st.stage === 'ultimate' && 'Top fibre reaches ε_u = 0.003 and the concrete crushes. Replace the curved block by the equivalent 0.85f′c × a block (dashed): M_n = A_s f_y(d − a/2).'}
          </div>
        </div>
        <div className="rounded-lg border border-line p-2 num">
          N.A. depth {fmt(st.na, 2)} in
          <br />ε_c top = {st.epsTop.toExponential(2)}
          <br />ε_s = {st.epsS.toExponential(2)} (ε_y = {(p.fy / 29000).toExponential(2)})
        </div>
        <div className="rounded-lg border border-line p-2 num">
          f_c top = {fmt(st.fcTop * 1000, 0)} psi ({fmt((st.fcTop / p.fc) * 100, 0)} % of f′c)
          <br />f_s = {fmt(st.fs, 2)} ksi
          <br />Whitney M_n = {fmt(data.Mn, 1)} k-ft (fibre model {fmt(data.Mult, 1)})
        </div>
      </div>
      <Callout kind="note" title="How this is drawn">
        Up to M_cr: uncracked transformed section. After cracking: strain compatibility with a Hognestad parabola for concrete (peak f′c at 2f′c/E_c) and elastic–plastic steel, so the jump in steel stress at M_cr and the yield plateau are real. Notice M_cr is only ~15–25 % of M_n.
      </Callout>
    </div>
  )
}

// ---------------------------------------------------------------- WSD design mini lab
function WsdLab() {
  const [mode, setMode] = useState<'size' | 'fixed'>('size')
  const [M, setM] = useState(150)
  const [b, setB] = useState(12)
  const [fc, setFc] = useState(4)
  const [fs, setFs] = useState(24)
  const [n, setN] = useState(8)
  const [h, setH] = useState(18)
  const fca = 0.45 * fc
  const w = wsdDesign(M, b, n, fca, fs)
  const dd = wsdDoublyDesign(M, b, h - 2.5, 2.5, n, fca, fs)
  const key = hashKey(JSON.stringify([mode, M, b, fc, fs, n, h]))
  const id = (k: string) => `${T}:wsd:${key}:${k}`
  return (
    <div className="space-y-3">
      <Seg value={mode} onChange={setMode} items={[{ v: 'size', label: 'Size the section' }, { v: 'fixed', label: 'Fixed b × h (A′s if needed)' }]} />
      <div className="grid grid-cols-3 cq-md:grid-cols-6 gap-2">
        <Num label="M (service)" unit="k-ft" value={M} onChange={setM} step={5} />
        <Num label="b" unit="in" value={b} onChange={setB} />
        {mode === 'fixed' && <Num label="h" unit="in" value={h} onChange={setH} />}
        <Sel label="f′c" value={fc} options={FC_OPTS} onChange={setFc} />
        <Sel label="f_s" value={fs} options={[{ v: 20, label: '20 ksi' }, { v: 24, label: '24 ksi' }]} onChange={setFs} />
        <Sel label="n" value={n} options={[7, 8, 9, 10].map((v) => ({ v, label: String(v) }))} onChange={setN} />
      </div>
      <Checks key={key}>
        <Answer id={id('k')} label="k (balanced)" value={w.k} compact />
        <Answer id={id('j')} label="j" value={w.j} compact />
        <Answer id={id('R')} label="R" value={w.R * 1000} unit="psi" compact />
        {mode === 'size' ? (
          <>
            <Answer id={id('d')} label="d required" value={w.dReq} unit="in" compact />
            <Answer id={id('As')} label="A_s" value={w.As} unit="in²" compact />
          </>
        ) : (
          <>
            <Answer id={id('m1')} label="M₁ = Rbd²" value={dd.M1} unit="k-ft" compact />
            <Choice id={id('need')} label="Compression steel?" options={[{ v: 'y', label: 'Needed' }, { v: 'n', label: 'Not needed' }]} answer={dd.needsComp ? 'y' : 'n'} />
            {dd.needsComp && (
              <>
                <Answer id={id('fsp')} label="f′s" value={dd.fsp} unit="ksi" compact />
                <Answer id={id('asp')} label="A′s" value={dd.Asp} unit="in²" compact />
                <Answer id={id('ast')} label="A_s total" value={dd.As} unit="in²" compact />
              </>
            )}
          </>
        )}
      </Checks>
      <Reveal title="WSD solution">
        {mode === 'size' ? <SolSteps steps={w.steps} /> : dd.needsComp ? <SolSteps steps={dd.steps} /> : <SolSteps steps={wsdDesign(M, b, n, fca, fs, h - 2.5).steps} />}
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- pages
function Overview() {
  return (
    <div>
      <Section title="What this topic is" right={<div className="w-72 hidden cq-md:block"><RcFrequency topic={T} /></div>}>
        <Md>{`Elastic (service-load) behaviour of an RC beam: the **uncracked** section (concrete takes tension, transformed area $(n-1)A_s$), the **cracked** section (concrete below the neutral axis ignored, transformed area $nA_s$), the cracking moment and the stresses under service loads. WSD (working stress design) uses the cracked section with allowable stresses $0.45f'_c$ and $f_s$ = 20/24 ksi.

**How it is asked** (every recent paper, 20–28 marks):
- The **three-stage sketch** (uncracked / cracked / ultimate strain and stress) — 7–9 marks, in 13 papers.
- **One section, four parts**: (i) $M_{cr}$, (ii) $f_s$ and $\\varepsilon_s$ just before cracking, (iii) the allowable service moment at $0.45f'_c$ / $0.4f_y$ (which governs varies), (iv) $M_n$ and the strains at failure (→ Singly). 2023-24 Q1(b), 2021-22 Q5(b), 2020-21 Q1(c), Jan 2021 Q1.
- Older papers: stresses at a given M (decide cracked or not first), load at first cracking of a cantilever, WSD design (k, j, R; compression steel with 2n).`}</Md>
      </Section>
      <Section title="Formulas in brief">
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`n = \\frac{E_s}{E_c},\\quad E_c = 57000\\sqrt{f'_c},\\quad f_r = 7.5\\sqrt{f'_c}`}</Tex>
            <Tex block>{`\\bar y = \\frac{bh\\,\\tfrac h2 + (n-1)A_s d}{bh + (n-1)A_s},\\quad M_{cr} = \\frac{f_r I_{ut}}{h - \\bar y}`}</Tex>
            <Tex block>{`f_s = n f_r\\frac{d - \\bar y}{h - \\bar y}\\ \\text{(just before cracking)}`}</Tex>
          </div>
          <div>
            <Tex block>{`k = \\sqrt{(\\rho n)^2 + 2\\rho n} - \\rho n,\\quad j = 1 - \\tfrac k3`}</Tex>
            <Tex block>{`I_{cr} = \\tfrac13 b(kd)^3 + nA_s(d - kd)^2`}</Tex>
            <Tex block>{`M_c = \\frac{f_c I_{cr}}{kd},\\quad M_s = \\frac{f_s I_{cr}}{n(d - kd)}\\ \\Rightarrow\\ M_{all} = \\min`}</Tex>
          </div>
        </div>
        <Callout kind="exam">The Lab has a 🎲 generator for the four-part template and a moment slider that draws the strain and stress diagrams at every stage — the sketch question in one place.</Callout>
      </Section>
    </div>
  )
}

const ex41: ElasticInput = { b: 10, h: 25, d: 23, As: 2.37, fc: 4000, frPsi: 475 }

function Approach() {
  const u = uncracked(ex41)
  const s45 = uncrackedStresses(ex41, 45)
  const c = cracked(ex41)
  const at90 = elasticAt(ex41, 90)
  return (
    <div>
      <Section title="Recipe (class / Nilson Ch 4)">
        <Steps>
          <Step n={1} title="Material constants">n = E_s/E_c rounded to a whole number (use the given n if printed), f_r = 7.5√f′c psi.</Step>
          <Step n={2} title="Uncracked transformed section">Add (n − 1)A_s at d. Find ȳ from the top, I_ut, y_t = h − ȳ.</Step>
          <Step n={3} title="Cracking moment">M_cr = f_r I_ut / y_t. State whether gross or transformed (papers accept both; the class uses transformed).</Step>
          <Step n={4} title="Is the given M above M_cr?">No → stresses from My/I_ut (steel ×n). Yes → cracked section.</Step>
          <Step n={5} title="Cracked transformed section">ρn → k → kd, j; I_cr = b(kd)³/3 + nA_s(d − kd)².</Step>
          <Step n={6} title="Stresses or allowable moment">f_c = M kd/I_cr, f_s = nM(d − kd)/I_cr. Allowable: compute M for f_c,all and for f_s,all; the smaller governs.</Step>
          <Step n={7} title="Sketch">Strain linear through the N.A.; stress triangle (and concrete tension triangle only if uncracked); T = A_s f_s at the steel.</Step>
        </Steps>
      </Section>
      <Section title="Which case am I in?">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-line p-3">
            <div className="font-bold text-good">M ≤ M_cr → uncracked</div>
            <Md>{`Whole section, $(n-1)A_s$. Concrete in tension below the N.A. Stresses $My/I_{ut}$.`}</Md>
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="font-bold text-accent">M_cr {'<'} M, f_c ≤ ~f′c/2 → cracked elastic</div>
            <Md>{`Concrete below the N.A. ignored, $nA_s$. k, j, $I_{cr}$. This is WSD / service.`}</Md>
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="font-bold text-bad">ε_c → 0.003 → ultimate</div>
            <Md>{`Non-linear; steel yields first in an under-reinforced beam. Use the stress block (Singly topic).`}</Md>
          </div>
        </div>
      </Section>
      <Section title="Common traps">
        <Callout kind="trap">Using nA_s in the uncracked section. The concrete is still there at the bar, so add only (n − 1)A_s. In the cracked section the concrete at the bar is gone (it is cracked), so it is nA_s.</Callout>
        <Callout kind="trap">Forgetting n when finding steel stress: f_s = n × (concrete stress at the steel level), both before and after cracking.</Callout>
        <Callout kind="trap">Not checking which allowable governs — the papers alternate (2023-24 and 2020-21: steel; 2021-22 and Jan 2021: concrete).</Callout>
        <Callout kind="trap">Mixing units: f_r in psi with M in k-ft. Work in lb and in (or kip and in) and convert once at the end (÷ 12,000 for in-lb → k-ft).</Callout>
      </Section>
      <Section title="Nilson Ex 4.1 / 4.2 with the engine" sub="b = 10 in, h = 25 in, d = 23 in, 3 #8 (2.37 in²), f′c = 4000 psi, f_r = 475 psi, M = 45 then 90 k-ft">
        <div className="font-semibold text-sm mb-1">Ex 4.1 — M = 45 k-ft</div>
        <SolSteps steps={[...u.steps, ...s45.stressSteps]} />
        <div className="text-sm mt-2 text-mute">
          f_ct = {fmt(s45.fct * 1000, 0)} psi {'<'} 475 psi: uncracked, as assumed. (Book: ȳ = 13.2 in, I = 14,740 in⁴, 484 / 432 / 2870 psi.)
        </div>
        <div className="font-semibold text-sm mt-4 mb-1">Ex 4.2 — M = 90 k-ft</div>
        <SolSteps steps={at90.steps} />
        <div className="text-sm mt-2 text-mute">
          Neutral axis moved up from {fmt(u.ybar, 1)} to {fmt(c.kd, 2)} in; doubling M raised f_s about {fmt(at90.fs / s45.fs, 1)}× and I fell from {fmt(u.I, 0)} to {fmt(c.Icr, 0)} in⁴ (book: 22,300 psi, 1390 psi, 5910 in⁴).
        </div>
      </Section>
    </div>
  )
}

function Lab() {
  const [p, setP] = useState<EP>(DEF)
  const [random, setRandom] = useState(false)
  return (
    <div>
      <Section title="Elastic section calculator" sub="The four-part paper template: M_cr, f_s before cracking, allowable moment, stresses at a service M.">
        <Calculator p={p} setP={setP} random={random} setRandom={setRandom} />
      </Section>
      <Section title="Loading stages playground" sub="Drag M from 0 to failure: uncracked → cracked → yield → crushing. Same section as above.">
        <Playground key={hashKey(JSON.stringify(toInput(p)))} p={p} />
      </Section>
      <Section title="WSD design (older papers)" sub="k = n/(n + f_s/f_c), j = 1 − k/3, R = ½f_c k j.">
        <WsdLab />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- theory
function StagesFig() {
  const inp: StageInput = { b: 10, h: 25, d: 23, As: 2.37, fc: 4000, fy: 60000, frPsi: 475 }
  const data = stagesData(inp)
  return (
    <div className="space-y-2">
      {[30, 90, data.Mult].map((M) => (
        <StageDiagram key={M} b={10} h={25} d={23} As={2.37} st={stageAt(data, inp, M)} fyKsi={60} fcKsi={4} whitney={{ a: data.rv.a }} />
      ))}
      <div className="text-[11px] text-faint">Nilson Ex 4.1 beam: M = 30 k-ft (uncracked), 90 k-ft (cracked, service), ultimate.</div>
    </div>
  )
}

const theory: RcTheoryItem[] = [
  {
    id: 'te-stages',
    topic: T,
    q: 'Discuss the behaviour of an RC rectangular beam in flexure under increasing load, with neat sketches of the strain and stress distributions for the uncracked, cracked and ultimate conditions.',
    seen: ['2023-24', '2021-22', '2020-21', '2017-18', '2015-16', '2013-14', '2012-13', '2011-12', '2010-11', '2007-08', '2006-07', '2005-06', '2002-03'],
    a: `**Stage 1 — uncracked (M < M_cr).** Load is small; the maximum concrete tension is below the modulus of rupture $f_r = 7.5\\sqrt{f'_c}$. The whole section is effective, concrete carries tension below the neutral axis, steel and concrete strains are equal at the bar level. Strain is linear (plane sections), and stress is linear (elastic): compression triangle at the top, tension triangle at the bottom. Analyse with the **uncracked transformed section**, steel replaced by $(n-1)A_s$. Steel stress is tiny ($f_s = nf_c$, a few ksi).

**Stage 2 — cracked, elastic (M_cr < M, service loads).** When the bottom fibre reaches $f_r$, tension cracks form and run up almost to the neutral axis, which moves up. Concrete below the N.A. is ignored; the steel carries all the tension $T = A_sf_s$. As long as $f_c \\lesssim 0.5f'_c$ and $f_s < f_y$, stresses are still linear: compression triangle above the N.A. with $C = \\tfrac12 f_c\\,b\\,kd$ and lever arm $jd = d - kd/3$. Analyse with the **cracked transformed section** ($nA_s$). This is the WSD / service stage; deflections and crack widths are checked here.

**Stage 3 — ultimate.** With more load the concrete stress-strain becomes non-linear and the compression stress block becomes curved (parabolic). In an under-reinforced beam the steel yields first ($f_s = f_y$, large deflection and wide cracks = warning), the N.A. rises, and failure occurs when the top fibre strain reaches $\\varepsilon_u = 0.003$ and the concrete crushes. The curved block is replaced by the equivalent rectangular block $0.85f'_c$ over $a = \\beta_1c$: $M_n = A_sf_y(d - a/2)$.

Sketch for each stage: the section (cracks in 2 and 3), the strain diagram (linear, $\\varepsilon_s$ at the steel), and the stress diagram (triangle + tension triangle / triangle + T / curved block + T). Note M_cr is only about 15–25 % of M_n.`,
    Fig: StagesFig,
  },
  {
    id: 'te-2n',
    topic: T,
    q: "Why is a value of 2 recommended by ACI in the WSD equation for the compression-steel stress, $f'_s = 2n f_c (kd - d')/kd$?",
    seen: ['2006-07'],
    a: `- Under sustained service load the concrete **creeps** (and shrinks): its strain keeps growing while the stress in it falls, so load is transferred from the concrete to the compression steel lying next to it.
- With the instantaneous modular ratio n the elastic analysis would badly underestimate the compression-steel stress. Tests show the long-term steel stress is about twice the elastic value, so ACI's alternate design method takes an effective modular ratio of **2n** for compression steel (transformed area $(2n-1)A'_s$), but limits $f'_s$ to the allowable tensile stress $f_s$.
- Tension steel is not treated this way because the concrete around it is cracked and carries no stress to shed.`,
  },
  {
    id: 'te-balwsd',
    topic: T,
    q: 'What is the balanced-stress steel ratio (WSD)? How does it differ from the balanced steel ratio (USD)?',
    seen: ['2007-08'],
    a: `- **Balanced-stress ratio (WSD):** the steel ratio for which, under the service moment, the concrete reaches its allowable stress ($0.45f'_c$) and the steel its allowable stress ($f_s$ = 20/24 ksi) at the same time. From the linear strain diagram $k = \\dfrac{n}{n + f_s/f_c}$, and from $C = T$: $\\rho_{bal} = \\dfrac{f_c k}{2f_s}$. Typical value ≈ 0.01–0.015. Less steel → steel governs; more → concrete governs (both are safe).
- **Balanced ratio (USD):** the steel ratio at which, at *ultimate*, the steel just reaches yield ($\\varepsilon_y$) when the concrete reaches $\\varepsilon_u = 0.003$: $\\rho_b = 0.85\\beta_1\\dfrac{f'_c}{f_y}\\dfrac{0.003}{0.003 + \\varepsilon_y}$ (0.0285 for 4/60). Beams must have much less (ρ ≤ ρ_max at εt = 0.004) so that they fail by yielding.
- So one is about service stresses at allowable values (economy), the other about the failure mode at ultimate (ductility). $\\rho_b$(USD) is about twice $\\rho_{bal}$(WSD).`,
  },
]

// ---------------------------------------------------------------- own problems
const P1: ElasticInput = { b: 12, h: 24, d: 21.5, As: 3 * 0.79, fc: 4000 }
const P2: ElasticInput = { b: 16, h: 28, d: 25, As: 4 * 1.27, fc: 5000, n: 7 }
const P3: ElasticInput = { b: 12, h: 20, d: 17.5, As: 3 * 0.6, fc: 3000 }

const problems: RcQ[] = [
  {
    id: 'rc-own-el-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'A',
    no: '1',
    marks: 0,
    topics: [T],
    title: 'Mcr and the steel stress at cracking',
    text: `A 12 in × 24 in beam (d = 21.5 in) has 3 #8 bars. f′c = 4 ksi, fy = 60 ksi, f_r = 7.5√f′c, n = Es/Ec rounded. Find the cracking moment using the uncracked transformed section, and the steel stress just before cracking.`,
    pages: [],
    given: [{ label: 'β₁, Ec, fr, n table', ref: 'm-props' }, { label: 'Elastic formulas', ref: 'f-elastic' }],
    checks: () => {
      const u = uncracked(P1)
      return [
        { key: 'n', label: 'n', value: u.n },
        { key: 'yb', label: 'ȳ', value: u.ybar, unit: 'in' },
        { key: 'mcr', label: 'M_cr', value: u.Mcr, unit: 'k-ft' },
        { key: 'fs', label: 'f_s before cracking', value: u.fsCr, unit: 'ksi' },
      ]
    },
    solution: () => <SolSteps steps={uncracked(P1).steps} />,
  },
  {
    id: 'rc-own-el-2',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '2',
    marks: 0,
    topics: [T],
    title: 'Allowable service moment — which limit governs?',
    text: `b = 16 in, d = 25 in, h = 28 in, 4 #10 bars, f′c = 5 ksi, n = 7. Allowable stresses 0.45f′c and 24 ksi. Find kd, I_cr and the maximum service moment. Which material governs?`,
    pages: [],
    given: [{ label: 'WSD allowables', ref: 'f-wsd' }],
    checks: () => {
      const a = allowableMoment(P2, 2.25, 24)
      return [
        { key: 'kd', label: 'kd', value: a.kd, unit: 'in' },
        { key: 'icr', label: 'I_cr', value: a.Icr, unit: 'in⁴' },
        { key: 'm', label: 'M allowable', value: a.M, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const a = allowableMoment(P2, 2.25, 24)
      return (
        <div>
          <SolSteps steps={a.steps} />
          <p className="text-sm mt-2">{a.governs === 'concrete' ? 'Concrete' : 'Steel'} governs: ρ = {fmt(a.rho, 4)} is {a.governs === 'concrete' ? 'above' : 'below'} the balanced-stress ratio.</p>
        </div>
      )
    },
  },
  {
    id: 'rc-own-el-3',
    paper: 'own',
    level: 'challenge',
    sec: 'B',
    no: '3',
    marks: 0,
    topics: [T],
    title: 'Live load at first cracking of a cantilever',
    text: `A 10 ft cantilever, 12 in × 20 in (d = 17.5 in from the bottom face; 3 #7 bars at the top), f′c = 3 ksi. Self-weight only as dead load. Using the uncracked transformed section (tension face on top), find the uniform service live load that first cracks the section at the support.`,
    pages: [],
    flag: 'older style (2006-07 Q5)',
    checks: () => {
      const u = uncracked(P3)
      const sw = (12 * 20) / 144 * 0.15
      return [
        { key: 'mcr', label: 'M_cr', value: u.Mcr, unit: 'k-ft' },
        { key: 'w', label: 'live load w_L', value: (2 * u.Mcr) / 100 - sw, unit: 'k/ft' },
      ]
    },
    solution: () => {
      const u = uncracked(P3)
      const sw = ((12 * 20) / 144) * 0.15
      return (
        <div>
          <Md>{`Hogging: measure d from the bottom (compression) face — the same formulas apply with the section turned over.`}</Md>
          <SolSteps steps={u.steps} />
          <Tex block>{`w_{total} = \\frac{2M_{cr}}{L^2} = \\frac{2(${fmt(u.Mcr, 2)})}{10^2} = ${fmt((2 * u.Mcr) / 100, 3)}\\text{ k/ft};\\ \\ w_{sw} = \\frac{12\\times20}{144}(0.150) = ${fmt(sw, 3)}\\ \\Rightarrow\\ w_L = ${fmt((2 * u.Mcr) / 100 - sw, 3)}\\text{ k/ft}`}</Tex>
        </div>
      )
    },
  },
]

void modular
const mod: RcTopicModule = { Overview, Approach, Lab, problems, theory }
export default mod
