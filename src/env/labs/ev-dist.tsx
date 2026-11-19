// Network designer: a branched network (editable demands and lengths) with the pressure line against the required pressure,
// then a looped network with Hardy Cross iterations you can play, then exam-style problems.
import { useEffect, useMemo, useState } from 'react'
import { Callout, Md, Section, Seg } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { NumIn } from '../../reference/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import {
  cfsToM3s,
  designDemand,
  designTree,
  economicTank,
  fpsToMs,
  ftToM,
  hardyCross,
  lphToM3s,
  nodeBalance,
  sizeLoopPipes,
  US_GAL_FT3,
  type HcLoop,
  type HcPipe,
  type HcResult,
  type TreePipe,
  type TreeResult,
} from '../engine/network'
import { LoopFig } from '../figs/net-loop'
import { PressureProfile } from '../figs/net-profile'
import { TreeFig, type NodePos } from '../figs/net-tree'
import { HcWork } from '../figs/sn-hc-work'
import { TreeWork } from '../figs/sn-tree-work'
import { TankSol, TreeTables, type TankCase } from '../pyq/sn-dtw'

const n = (v: number, d = 2) => {
  const s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d)
  return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s
}
const comma = (v: number) => Math.round(v).toLocaleString('en')

// ================================================================== 1. branched network
const TREE: { id: string; from: string; to: string; L: number }[] = [
  { id: '1-2', from: '1', to: '2', L: 385 },
  { id: '2-3', from: '2', to: '3', L: 345 },
  { id: '3-4', from: '3', to: '4', L: 390 },
  { id: '1-5', from: '1', to: '5', L: 385 },
  { id: '5-6', from: '5', to: '6', L: 600 },
  { id: '5-7', from: '5', to: '7', L: 240 },
  { id: '7-8', from: '7', to: '8', L: 240 },
]
const DEM0: Record<string, number> = { '2': 31827, '3': 1397, '4': 2733, '5': 20659, '6': 38538, '7': 10499, '8': 7644 }
const POS_TREE: NodePos = { '1': [50, 160], '2': [190, 70], '3': [320, 70], '4': [450, 70], '5': [190, 200], '6': [190, 280], '7': [330, 200], '8': [460, 200] }

function BranchSim() {
  const [dem, setDem] = useState(DEM0)
  const [len, setLen] = useState<Record<string, number>>(Object.fromEntries(TREE.map((p) => [p.id, p.L])))
  const [V, setV] = useState(3)
  const [pf, setPf] = useState(1)
  const [rounding, setRounding] = useState<'commercial' | 'inch'>('commercial')
  const [mode, setMode] = useState<'actual' | 'design'>('actual')
  const [head, setHead] = useState(90)
  const [minP, setMinP] = useState(30)
  const [auto, setAuto] = useState(false)
  const [dmin, setDmin] = useState(4)
  const [sel, setSel] = useState('4')

  const res: TreeResult = useMemo(() => {
    const pipes: TreePipe[] = TREE.map((p) => ({ id: p.id, from: p.from, to: p.to, L: ftToM(len[p.id]) }))
    const demand = Object.fromEntries(Object.entries(dem).map(([k, v]) => [k, lphToM3s(v * pf)]))
    return designTree({ pipes, demand, root: '1', V: fpsToMs(V), f: 0.01, Dmin: dmin, rounding, hfVelocity: mode, startPsi: (head * 62.4) / 144, minPsi: minP, autoEnlarge: auto })
  }, [dem, len, V, pf, rounding, mode, head, minP, auto, dmin])
  const worst = [...res.terminals].sort((a, b) => a.p - b.p)[0]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="rounded-xl border border-line p-2 bg-panel">
            <TreeFig res={res} pos={POS_TREE} root="1" flowUnit="lph" selected={sel} />
          </div>
          <div className="rounded-xl border border-line p-2 bg-panel">
            <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
              <span className="text-mute">pressure line to terminal</span>
              <Seg size="xs" value={sel} onChange={setSel} items={res.terminals.map((t) => ({ v: t.node, label: t.node }))} />
            </div>
            <PressureProfile res={res} selected={sel} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-line p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Design rules</div>
            <Slider label="reservoir water column" value={head} min={50} max={140} step={5} unit=" ft" onChange={setHead} />
            <Slider label="required terminal pressure" value={minP} min={20} max={45} step={1} unit=" psi" onChange={setMinP} />
            <Slider label="design velocity" value={V} min={1} max={7} step={0.5} unit=" fps" onChange={setV} />
            <Slider label="peak factor on the demands" value={pf} min={1} max={4} step={0.1} onChange={setPf} />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-mute">smallest pipe</span>
              <Seg value={String(dmin)} onChange={(v) => setDmin(+v)} items={[{ v: '2', label: '2 in' }, { v: '4', label: '4 in (BNBC)' }]} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-mute">round up to</span>
              <Seg value={rounding} onChange={setRounding} items={[{ v: 'commercial', label: 'commercial sizes' }, { v: 'inch', label: 'next whole inch' }]} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-mute">h_f velocity</span>
              <Seg value={mode} onChange={setMode} items={[{ v: 'actual', label: 'Q/A in adopted pipe' }, { v: 'design', label: 'design V (class note)' }]} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> enlarge pipes automatically until every end passes
            </label>
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Demands (lph) and lengths (ft)</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {Object.keys(dem).map((k) => (
                <NumIn key={k} label={`node ${k}`} value={dem[k]} step={500} unit="lph" w="w-20" onChange={(v) => setDem({ ...dem, [k]: Math.max(0, v || 0) })} />
              ))}
              {TREE.map((p) => (
                <NumIn key={p.id} label={`pipe ${p.id}`} value={len[p.id]} step={10} unit="ft" w="w-16" onChange={(v) => setLen({ ...len, [p.id]: Math.max(10, v || 10) })} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border p-3 text-sm" style={{ borderColor: res.ok ? 'var(--c-good)' : 'var(--c-bad)' }}>
            <b style={{ color: res.ok ? 'var(--c-good)' : 'var(--c-bad)' }}>{res.ok ? '✓ every end meets the required pressure' : '✗ some ends are below the required pressure'}</b>
            <div className="text-xs text-mute mt-1">
              lowest end: node {worst.node} at {n(worst.p, 1)} psi (start {n(res.startPsi, 1)} psi, 1 ft = 0.433 psi).
              {res.enlarged.length > 0 && ` Enlarged: ${res.enlarged.map((e) => `${e.id} ${e.from}→${e.to} in`).join(', ')}.`}
            </div>
          </div>
        </div>
      </div>
      <details className="rounded-xl border border-line p-3">
        <summary className="cursor-pointer text-sm font-semibold">Pipe table (flow, diameter, velocity, head loss)</summary>
        <div className="mt-2 text-sm">
          <TreeTables res={res} />
        </div>
      </details>
      <div className="grid gap-2 md:grid-cols-3">
        <Callout kind="tip" title="Try: shrink the main">
          Put the smallest pipe at 2 in and the velocity at 7 fps: pipes get thin, head loss grows with v² / D and the far nodes sink under the red line.
        </Callout>
        <Callout kind="tip" title="Try: a peak factor of 2.5">
          Demand rises, the flows and diameters rise, but pressures fall little because the diameter grows with the flow (the design velocity stays fixed).
        </Callout>
        <Callout kind="tip" title="Try: lower the reservoir">
          At 60 ft (26 psi) the supply cannot reach 30 psi at all. No pipe size can fix it: raise the tank. The auto-enlarge box gives up.
        </Callout>
      </div>
    </div>
  )
}

// ================================================================== 2. Hardy Cross
interface HcPreset {
  id: string
  label: string
  blurb: string
  pipes: HcPipe[]
  loops: HcLoop[]
  law: Parameters<typeof hardyCross>[2]
  ext: Record<string, number>
  pos: NodePos
  loopAt: Record<string, [number, number]>
  lawText: string
  size?: boolean
}
const EX3_PIPES = (q: number[]): HcPipe[] => [
  { id: '1-2', from: '1', to: '2', L: 335, Q0: q[0] },
  { id: '2-3', from: '2', to: '3', L: 170, Q0: q[1] },
  { id: '3-6', from: '3', to: '6', L: 335, Q0: q[2] },
  { id: '6-1', from: '6', to: '1', L: 170, Q0: q[3] },
  { id: '3-4', from: '3', to: '4', L: 165, Q0: q[4] },
  { id: '4-5', from: '4', to: '5', L: 335, Q0: q[5] },
  { id: '5-6', from: '5', to: '6', L: 165, Q0: q[6] },
]
export const EX3_LOOPS: HcLoop[] = [
  { id: 'I', pipes: [{ id: '1-2', dir: 1 }, { id: '2-3', dir: 1 }, { id: '3-6', dir: 1 }, { id: '6-1', dir: 1 }] },
  { id: 'II', pipes: [{ id: '3-6', dir: -1 }, { id: '3-4', dir: 1 }, { id: '4-5', dir: 1 }, { id: '5-6', dir: 1 }] },
]
const EX3_POS: NodePos = { '1': [90, 60], '2': [430, 60], '3': [430, 160], '4': [430, 255], '5': [90, 255], '6': [90, 160] }
const HC_PRESETS: HcPreset[] = [
  {
    id: 'ex3', label: 'Slide Ex-3 (steps file)', blurb: 'Her six-node network, k = 1, x = 1.85, first guess 6→3 = 7 lps; the steps file stops when every correction is below 0.01 lps.',
    pipes: EX3_PIPES([13, 12.3, -7, -12, 5, -4, -5]), loops: EX3_LOOPS, law: { kind: 'k' }, ext: { '1': 25, '2': -0.7, '3': -14.3, '4': -9, '5': -1 }, pos: EX3_POS,
    loopAt: { I: [260, 110], II: [260, 205] }, lawText: '$H = kQ^{1.85}$ with $k = 1$', size: true,
  },
  {
    id: 'ex3c', label: 'Ex-3, class first guess', blurb: 'The class-note guess 6→3 = 8 lps (13 / 12.3 / 12 / 6 / 3 / 4): a worse start that needs more trials but lands on the same flows.',
    pipes: EX3_PIPES([13, 12.3, -8, -12, 6, -3, -4]), loops: EX3_LOOPS, law: { kind: 'k' }, ext: { '1': 25, '2': -0.7, '3': -14.3, '4': -9, '5': -1 }, pos: EX3_POS,
    loopAt: { I: [260, 110], II: [260, 205] }, lawText: '$H = kQ^{1.85}$ with $k = 1$', size: true,
  },
  {
    id: '1213', label: '2012-13 Q2(c)', blurb: 'Printed law $h_L = 1.59\\times10^{6} Q^{1.85} D^{-4.87}$ (lps, mm, m/m): pipes now differ in length and diameter, so the loop with the thin pipes takes the bigger correction.',
    pipes: [
      { id: 'AB', from: 'A', to: 'B', L: 400, D: 200, Q0: 2 },
      { id: 'BC', from: 'B', to: 'C', L: 300, D: 100, Q0: 1.2 },
      { id: 'DC', from: 'D', to: 'C', L: 400, D: 200, Q0: 1.8 },
      { id: 'AD', from: 'A', to: 'D', L: 300, D: 100, Q0: 3 },
      { id: 'BD', from: 'B', to: 'D', L: 500, D: 150, Q0: 0.8 },
    ],
    loops: [
      { id: 'I', pipes: [{ id: 'AB', dir: 1 }, { id: 'BD', dir: 1 }, { id: 'AD', dir: -1 }] },
      { id: 'II', pipes: [{ id: 'BC', dir: 1 }, { id: 'DC', dir: -1 }, { id: 'BD', dir: -1 }] },
    ],
    law: { kind: 'hw-lps-mm', coef: 1.59e6 }, ext: { A: 5, D: -2, C: -3 }, pos: { A: [90, 60], B: [400, 60], C: [400, 230], D: [90, 230] },
    loopAt: { I: [190, 120], II: [310, 180] }, lawText: '$H = 1.59\\times10^{6}\\,L\\,D^{-4.87}\\,Q^{1.85}$',
  },
]

function HardyCrossSim() {
  const [pid, setPid] = useState('ex3')
  const P = HC_PRESETS.find((p) => p.id === pid)!
  const [step, setStep] = useState(0)
  const [play, setPlay] = useState(false)
  const res: HcResult = useMemo(() => hardyCross(P.pipes, P.loops, P.law, { iterations: 12, tol: 0 }), [pid]) // eslint-disable-line react-hooks/exhaustive-deps
  const N = res.iters.length
  useEffect(() => {
    if (!play) return
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= N) {
          setPlay(false)
          return s
        }
        return s + 1
      })
    }, 1100)
    return () => clearInterval(t)
  }, [play, N])
  const flows = step === 0 ? Object.fromEntries(P.pipes.map((p) => [p.id, p.Q0])) : res.iters[step - 1].end
  const next = res.iters[Math.min(step, N - 1)]
  const hot = step > 0 ? res.iters[step - 1].pipeDelta : undefined
  const balance = nodeBalance(P.pipes, flows, P.ext)
  const maxBal = Math.max(...Object.values(balance).map(Math.abs))
  const sizing = P.size ? sizeLoopPipes(P.pipes, flows) : null
  const lbl = (id: string) => id

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {HC_PRESETS.map((p) => (
          <button key={p.id} className={'btn !py-1 !text-xs ' + (p.id === pid ? '!border-accent text-accent' : '')} onClick={() => (setPid(p.id), setStep(0), setPlay(false))}>
            {p.label}
          </button>
        ))}
        <Md className="text-xs text-faint basis-full">{P.blurb}</Md>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <div className="rounded-xl border border-line p-2 bg-panel">
            <LoopFig pipes={P.pipes} pos={P.pos} flows={flows} ext={P.ext} loops={P.loops} loopAt={P.loopAt} hot={hot} unit="lps" viewBox={[520, 300]} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn !py-1 !px-3" onClick={() => (step >= N ? setStep(0) : null, setPlay(!play))}>
              {play ? '⏸ pause' : '▶ play trials'}
            </button>
            <button className="btn !py-1 !px-3" onClick={() => (setPlay(false), setStep(Math.min(N, step + 1)))}>
              next trial
            </button>
            <button className="btn !py-1 !px-3" onClick={() => (setPlay(false), setStep(0))}>
              reset
            </button>
            <span className="text-xs text-mute">
              after trial {step} of {N}: largest node imbalance {n(maxBal, 6)} lps (continuity holds at every trial)
            </span>
          </div>
          <Slider label="trial" value={step} min={0} max={N} onChange={(v) => (setPlay(false), setStep(v))} />
        </div>
        <div className="space-y-2">
          <Md className="text-sm">{`${P.lawText}; $\\Delta = -\\dfrac{\\sum H}{1.85\\sum|H/Q|}$ for each loop; the common pipe takes the difference of the two corrections.`}</Md>
          {step < N ? (
            <div className="rounded-xl border border-line p-3 space-y-2 text-xs">
              <div className="font-bold uppercase tracking-wider text-faint">Trial {step + 1} from the flows now drawn</div>
              {next.loops.map((l) => (
                <div key={l.id}>
                  <div className="font-semibold mb-0.5">Loop {l.id} (clockwise +)</div>
                  <table className="w-full num">
                    <thead>
                      <tr className="text-mute text-left">
                        <th>pipe</th>
                        <th>Q (lps)</th>
                        <th>H (m)</th>
                        <th>|H/Q|</th>
                      </tr>
                    </thead>
                    <tbody>
                      {l.rows.map((x) => (
                        <tr key={x.pipe}>
                          <td>{lbl(x.pipe)}</td>
                          <td>{n(x.q, 3)}</td>
                          <td>{n(x.H, 3)}</td>
                          <td>{n(x.Hq, 3)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-line font-semibold">
                        <td colSpan={2}>sum</td>
                        <td>{n(l.sumH, 3)}</td>
                        <td>{n(l.sumHq, 3)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-0.5">
                    ΔQ<sub>{l.id}</sub> = −{n(l.sumH, 3)} / (1.85 × {n(l.sumHq, 3)}) = <b style={{ color: 'var(--c-accent2)' }}>{n(l.delta, 4)} lps</b>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Callout kind="note" title="All trials played">
              The corrections have shrunk below {n(res.iters[N - 1].maxDelta * 2, 3)} lps; further trials change the flows only in the third decimal.
            </Callout>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-line p-3">
        <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Convergence</div>
        <table className="w-full text-xs num">
          <thead>
            <tr className="text-left text-mute">
              <th>trial</th>
              {P.loops.map((l) => (
                <th key={l.id}>ΔQ {l.id}</th>
              ))}
              {P.loops.map((l) => (
                <th key={l.id + 's'}>ΣH {l.id} (m)</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {res.iters.map((it) => (
              <tr key={it.n} className={it.n === step ? 'font-bold' : it.n > step ? 'opacity-50' : ''}>
                <td>{it.n}</td>
                {it.loops.map((l) => (
                  <td key={l.id}>{n(l.delta, 4)}</td>
                ))}
                {it.loops.map((l) => (
                  <td key={l.id + 's'}>{n(l.sumH, 3)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sizing && (
        <details className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-semibold">Pipe sizes from the current flows (Hazen–Williams C = 130, S = 0.005 m/m, chart sizes)</summary>
          <table className="w-full text-xs num mt-2">
            <thead>
              <tr className="text-left text-mute">
                <th>pipe</th>
                <th>L (m)</th>
                <th>Q (lps)</th>
                <th>D req (mm)</th>
                <th>adopt (mm)</th>
                <th>v (m/s)</th>
                <th>H (m)</th>
              </tr>
            </thead>
            <tbody>
              {sizing.map((s) => (
                <tr key={s.pipe}>
                  <td>{s.pipe}</td>
                  <td>{s.L}</td>
                  <td>{n(s.Qlps, 3)}</td>
                  <td>{n(s.Dreq, 1)}</td>
                  <td>{s.Dadopt}</td>
                  <td>{n(s.v, 2)}</td>
                  <td>{n(s.H, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-faint mt-1">After trial 5 on the slide network: 150 mm everywhere except 3-4 at 100 mm (her steps file). The common pipe takes the larger size of the two loops.</p>
        </details>
      )}
      <div className="grid gap-2 md:grid-cols-3">
        <Callout kind="tip" title="Notice">The assumed flows already satisfy continuity at every node; Hardy Cross only moves flow round a loop, so continuity never breaks. What it fixes is ΣH around each loop.</Callout>
        <Callout kind="tip" title="Notice">A loop with ΣH positive (clockwise losses too big) gets a negative ΔQ: clockwise flows shrink and anticlockwise flows grow. The common pipe is corrected by both loops.</Callout>
        <Callout kind="exam" title="Exam">She said one Hardy Cross maths is a must. Write the table per loop (Q, H, H/Q), ΣH, Σ|H/Q|, Δ, new flows, and do exactly the trials asked.</Callout>
      </div>
    </div>
  )
}

// ================================================================== 3. exam problems
type Fam = 'cusec' | 'lph' | 'hc' | 'tank'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'cusec', label: '2022-23 style (cusec, peak factor)' },
  { v: 'lph', label: 'Ex-2 style (lph, 4 in main)' },
  { v: 'hc', label: 'Hardy Cross, two loops' },
  { v: 'tank', label: 'Economic tank' },
]
interface PP extends XProblem<Fam> {
  tree?: TreeResult
  pos?: NodePos
  flowUnit?: 'lph' | 'cfs'
  hc?: { pipes: HcPipe[]; ext: Record<string, number>; res: HcResult }
  tank?: TankCase
  lines?: string[]
}

function makeCusec(seed: number, level: Level): PP {
  const r = rng(seed * 313 + 11)
  const two = level === 'basic'
  const names = two ? ['B', 'C', 'D'] : ['B', 'C', 'D', 'E']
  const avg = names.slice(1).map(() => randInt(r, 5, 30) / 100)
  const pf = level === 'basic' ? 1.8 : pick(r, [1.5, 1.8, 2, 2.5])
  const loss = level === 'tough' ? randInt(r, 10, 20, 5) / 100 : pick(r, [0.1, 0.05, 0.15])
  const Pb = randInt(r, 36, 60, 2)
  const Pmin = pick(r, [30, 30, 35])
  const Ls = names.slice(1).map(() => randInt(r, 25, 60, 5) * 10)
  const pipes: TreePipe[] = names.slice(1).map((nm, i) => ({ id: names[i] + nm, from: names[i], to: nm, L: ftToM(Ls[i]) }))
  const demand = Object.fromEntries(names.slice(1).map((nm, i) => [nm, cfsToM3s(designDemand(avg[i], pf, loss))]))
  const tree = designTree({ pipes, demand, root: 'B', V: fpsToMs(3), f: 0.01, Dmin: 4, startPsi: Pb, minPsi: Pmin })
  const p0 = tree.pipes[0]
  const last = tree.terminals[0]
  const steps: XStep[] = [
    { key: 'q1', group: 'Design flows', label: `design demand at ${names[1]}`, value: designDemand(avg[0], pf, loss), unit: 'cusec', digits: 3, tol: 0.01 },
    { key: 'q2', group: 'Design flows', label: `flow in ${p0.id}`, value: p0.Qcfs, unit: 'cusec', digits: 3, tol: 0.01 },
    { key: 'd', group: 'Diameter', label: `calculated D of ${p0.id} (V = 3 fps)`, value: p0.DcalcIn, unit: 'in', digits: 2, tol: 0.02 },
    { key: 'da', group: 'Diameter', label: `adopted size of ${p0.id}`, value: p0.Din, unit: 'in', digits: 0, abs: 0.4, tol: 0 },
    { key: 'hf', group: 'Head loss and pressure', label: `h_f of ${p0.id}`, value: p0.hfFt, unit: 'ft', digits: 2, tol: 0.03 },
    { key: 'pe', group: 'Head loss and pressure', label: `pressure at ${last.node}`, value: last.p, unit: 'psi', digits: 1, tol: 0.01, abs: 0.1 },
  ]
  const pos: NodePos = { B: [60, 240], C: [60, 120], D: [260, 120], E: [440, 120] }
  return {
    family: 'cusec',
    level,
    title: '2022-23 Q7(c) style',
    hash: hashKey(JSON.stringify([seed, level, 'cusec', avg, pf, loss, Pb, Ls])),
    tree,
    pos,
    flowUnit: 'cfs',
    steps,
    lines: names.slice(1).map((nm, i) => `$q_{${nm}} = ${avg[i]} \\times ${pf} \\times ${n(1 + loss, 2)} = ${n(designDemand(avg[i], pf, loss), 3)}$ cusec`),
    text: `A branch line ${names.join('–')} supplies a residential area. Average demands: ${names.slice(1).map((nm, i) => `**${avg[i]} cusec at ${nm}**`).join(', ')}. Peak factor **${pf}**, losses and wastage **${n(loss * 100, 0)} %**. Pressure at ${names[0]} is **${Pb} psi** and the terminal pressure required is **${Pmin} psi**. Lengths: ${pipes.map((p, i) => `${p.id} = ${Ls[i]} ft`).join(', ')}. Design the branch lines. *(Use $h_f = 4fLv^2/2gD$, f = 0.01, V = 3 fps, smallest main 4 in, flat ground.)*`,
  }
}

function makeLph(seed: number, level: Level): PP {
  const r = rng(seed * 509 + 3)
  const head = randInt(r, 70, 100, 5)
  const dem: Record<string, number> = {}
  for (const k of ['2', '3', '4', '5', '6']) dem[k] = randInt(r, 10, 400) * 100
  const L: Record<string, number> = {}
  const pipesDef = [['1-2', '1', '2'], ['2-3', '2', '3'], ['2-4', '2', '4'], ['1-5', '1', '5'], ['5-6', '5', '6']]
  for (const [id] of pipesDef) L[id] = randInt(r, 20, 60, 5) * 10
  const pipes: TreePipe[] = pipesDef.map(([id, a, b]) => ({ id, from: a, to: b, L: ftToM(L[id]) }))
  const tree = designTree({
    pipes, demand: Object.fromEntries(Object.entries(dem).map(([k, v]) => [k, lphToM3s(v)])), root: '1', V: 1, f: 0.01, Dmin: 4,
    startPsi: (head * 62.4) / 144, minPsi: 30, autoEnlarge: level === 'tough', rounding: 'commercial',
  })
  const p12 = tree.pipes.find((p) => p.id === '1-2')!
  const worst = [...tree.terminals].sort((a, b) => a.p - b.p)[0]
  const steps: XStep[] = [
    { key: 'q', group: 'Flows', label: 'flow in 1-2', value: p12.Qlph, unit: 'lph', digits: 0, tol: 0.01 },
    { key: 'd', group: 'Diameters', label: 'calculated D of 1-2 (V = 1 m/s)', value: p12.DcalcIn, unit: 'in', digits: 2, tol: 0.02 },
    { key: 'da', group: 'Diameters', label: 'adopted size of 1-2 (2, 3, 4, 6, 8…)', value: p12.Din, unit: 'in', digits: 0, abs: 0.4, tol: 0 },
    { key: 'p0', group: 'Pressure', label: 'pressure at the reservoir', value: tree.startPsi, unit: 'psi', digits: 2, tol: 0.005 },
    { key: 'hf', group: 'Pressure', label: 'h_f of 1-2', value: p12.hfPsi, unit: 'psi', digits: 3, tol: 0.04, abs: 0.005 },
    { key: 'pw', group: 'Pressure', label: `lowest terminal pressure (node ${worst.node})`, value: worst.p, unit: 'psi', digits: 1, tol: 0.01, abs: 0.1 },
  ]
  const pos: NodePos = { '1': [50, 150], '2': [190, 80], '3': [330, 40], '4': [330, 120], '5': [190, 220], '6': [340, 260] }
  return {
    family: 'lph',
    level,
    title: 'L5-Ex2 style',
    hash: hashKey(JSON.stringify([seed, level, 'lph', head, dem, L])),
    tree,
    pos,
    flowUnit: 'lph',
    steps,
    text: `Service reservoir at node 1, water column **${head} ft**. Pipes: ${pipesDef.map(([id]) => `${id} = ${L[id]} ft`).join(', ')}. Demands (lph): ${Object.entries(dem).map(([k, v]) => `node ${k} = ${comma(v)}`).join(', ')}. Determine the pipe sizes. *(V = 1 m/s, f = 0.01, smallest main 4 in, round up to 2, 3, 4, 6, 8, 10 in…, 30 psi needed at every end, flat ground; enlarge a pipe if an end fails.)*`,
  }
}

function makeHc(seed: number, level: Level): PP {
  for (let tries = 0; tries < 60; tries++) {
    const r = rng(seed * 997 + 13 + tries * 7919)
    const q2 = randInt(r, 5, 20) / 10
    const q5 = randInt(r, 5, 30) / 10
    const q3 = randInt(r, 80, 160) / 10
    const q4 = randInt(r, 60, 110) / 10
    const Q = r2(q2 + q3 + q4 + q5)
    const a = r2(Q * (0.42 + r() * 0.2))
    const c = r2(q5 + 2 + r() * 4)
    const g = r2(Q - a - c)
    const h = r2(a - q2 + g - q3)
    const f54 = r2(c - q5)
    if (g <= 0.5 || h <= 0.5 || f54 <= 0.5) continue
    const pipes: HcPipe[] = [
      { id: '1-2', from: '1', to: '2', L: 335, Q0: a },
      { id: '2-3', from: '2', to: '3', L: 170, Q0: r2(a - q2) },
      { id: '3-6', from: '3', to: '6', L: 335, Q0: -g },
      { id: '6-1', from: '6', to: '1', L: 170, Q0: -r2(Q - a) },
      { id: '3-4', from: '3', to: '4', L: 165, Q0: h },
      { id: '4-5', from: '4', to: '5', L: 335, Q0: -f54 },
      { id: '5-6', from: '5', to: '6', L: 165, Q0: -c },
    ]
    const ext = { '1': Q, '2': -q2, '3': -q3, '4': -q4, '5': -q5 }
    const bal = nodeBalance(pipes, Object.fromEntries(pipes.map((p) => [p.id, p.Q0])), ext)
    if (Math.max(...Object.values(bal).map(Math.abs)) > 0.011) continue
    const res = hardyCross(pipes, EX3_LOOPS, { kind: 'k' }, { iterations: 2, tol: 0 })
    const it1 = res.iters[0]
    const it2 = res.iters[1]
    const steps: XStep[] = [
      { key: 'sh', group: 'Trial 1', label: 'ΣH of loop I', value: it1.loops[0].sumH, unit: 'm', digits: 2, tol: 0.02, abs: 0.05 },
      { key: 'd1', group: 'Trial 1', label: 'ΔQ of loop I', value: it1.loops[0].delta, unit: 'lps', digits: 3, tol: 0.03, abs: 0.005 },
      { key: 'd2', group: 'Trial 1', label: 'ΔQ of loop II', value: it1.loops[1].delta, unit: 'lps', digits: 3, tol: 0.03, abs: 0.005 },
      { key: 'q36', group: 'Trial 1', label: 'flow 3→6 after trial 1 (common pipe)', value: it1.end['3-6'], unit: 'lps', digits: 3, tol: 0.02, abs: 0.01 },
      { key: 'd1b', group: 'Trial 2', label: 'ΔQ of loop I', value: it2.loops[0].delta, unit: 'lps', digits: 3, tol: 0.05, abs: 0.005 },
      { key: 'd2b', group: 'Trial 2', label: 'ΔQ of loop II', value: it2.loops[1].delta, unit: 'lps', digits: 3, tol: 0.05, abs: 0.005 },
    ]
    return {
      family: 'hc',
      level,
      title: 'L5-Ex3 style',
      hash: hashKey(JSON.stringify([seed, level, 'hc', Q, a, c])),
      hc: { pipes, ext, res },
      steps,
      text: `Analyse the looped network (pipes 1-2, 2-3, 3-4, 4-5, 5-6, 6-1 and the middle pipe 6-3) by Hardy Cross with k = 1 and x = 1.85. External flows: **${Q} lps in at 1**; out ${q2} at 2, ${q3} at 3, ${q4} at 4, ${q5} at 5 (lps). Loop I = 1-2-3-6, loop II = 6-3-4-5, clockwise positive; the first guess (lps, clockwise sense) is ${pipes.map((p) => `${p.id} = ${n(p.Q0, 2)}`).join(', ')}. Both loops are corrected together; **do two trials**.`,
    }
  }
  return makeHc(seed + 1000, level)
}
const r2 = (v: number) => Math.round(v * 100) / 100

function makeTank(seed: number, level: Level): PP {
  const r = rng(seed * 211 + 5)
  const gal = pick(r, [100000, 150000, 200000, 250000, 300000])
  const cF = pick(r, [300, 500, 800, 1200])
  const cW = level === 'basic' ? cF : Math.round((cF * (1.25 + 0.25 * randInt(r, 0, 3))) / 50) * 50
  const V = gal * US_GAL_FT3
  const e = economicTank(V, cF, cW)
  const steps: XStep[] = [
    { key: 'v', group: 'Volume', label: 'volume', value: V, unit: 'ft³', digits: 0, tol: 0.005 },
    { key: 'd', group: 'Optimum', label: 'D', value: e.D, unit: 'ft', digits: 2, tol: 0.01 },
    { key: 'h', group: 'Optimum', label: 'H', value: e.H, unit: 'ft', digits: 2, tol: 0.015 },
    { key: 'c', group: 'Optimum', label: 'shell cost', value: e.cost, unit: 'Tk', digits: 0, tol: 0.02 },
  ]
  return {
    family: 'tank',
    level,
    title: 'economic tank',
    hash: hashKey(JSON.stringify([seed, level, 'tank', gal, cF, cW])),
    tank: { gal, gallon: 'US', cF, cW },
    steps,
    text: `An elevated cylindrical water tank of **${comma(gal)} US gallons** is to be designed. Concrete work per sft costs **Tk ${cF}** in the floor and **Tk ${cW}** in the wall of the shell. Determine the most economic dimensions (floor and wall only; 1 US gal = 0.13368 ft³).`,
  }
}

export function make(seed: number, family?: Fam, level: Level = 'exam'): PP {
  const f = family ?? pick(rng(seed * 17 + 3), ['cusec', 'lph', 'hc', 'tank'] as Fam[])
  return f === 'cusec' ? makeCusec(seed, level) : f === 'lph' ? makeLph(seed, level) : f === 'hc' ? makeHc(seed, level) : makeTank(seed, level)
}

function TreeSolution({ p }: { p: PP }) {
  const t = p.tree!
  const sixty = p.flowUnit === 'cfs'
  const startFt = (t.startPsi * 144) / 62.4
  return (
    <div className="space-y-3 text-sm">
      {sixty ? (
        <Md>{`**Design demand at each node** $= \\text{average} \\times \\text{peak factor} \\times (1 + \\text{losses})$:${p.lines?.length ? `\n\n${p.lines.map((l) => `- ${l}`).join('\n')}` : ''}`}</Md>
      ) : (
        <Md>{`**Pressure at the reservoir:** a water column of ${n(startFt, 1)} ft gives $${n(startFt, 1)} \\times 62.4/144 = ${n(t.startPsi, 2)}$ psi (1 ft of water = 0.433 psi).`}</Md>
      )}
      <div className="rounded-xl border border-line p-2 bg-panel">
        <TreeFig res={t} pos={p.pos!} root={t.pipes[0].from} flowUnit={p.flowUnit} viewBox={sixty ? [520, 290] : [520, 300]} />
      </div>
      <TreeWork res={t} unit={sixty ? 'cfs' : 'lph'} V={sixty ? fpsToMs(3) : 1} f={0.01} />
      <div className="rounded-xl border border-line p-2 bg-panel">
        <PressureProfile res={t} />
      </div>
    </div>
  )
}

function HcSolution({ p }: { p: PP }) {
  const { pipes, ext, res } = p.hc!
  return (
    <div className="space-y-3 text-sm">
      <HcWork pipes={pipes} loops={EX3_LOOPS} law={{ kind: 'k' }} res={res} />
      <div className="font-bold">Flows after {res.iters.length} trials</div>
      <LoopFig pipes={pipes} pos={EX3_POS} flows={res.flows} ext={ext} loops={EX3_LOOPS} loopAt={{ I: [260, 110], II: [260, 205] }} unit="lps" viewBox={[520, 300]} />
    </div>
  )
}

function Problems() {
  return (
    <ExamProblems<Fam, PP>
      topic="ev-dist:lab"
      families={FAMS}
      make={make}
      solution={(p) => (p.tree ? <TreeSolution p={p} /> : p.hc ? <HcSolution p={p} /> : <TankSol t={p.tank!} />)}
      figure={(p) => (p.hc ? <LoopFig pipes={p.hc.pipes} pos={EX3_POS} flows={Object.fromEntries(p.hc.pipes.map((q) => [q.id, q.Q0]))} ext={p.hc.ext} loops={EX3_LOOPS} loopAt={{ I: [260, 110], II: [260, 205] }} unit="lps" viewBox={[520, 300]} /> : null)}
      foot="Her class values: V = 3 fps (1 m/s) for every size, f = 0.01 (Fanning), 4 in smallest distribution main, 30 psi at the end of every branch, Hardy Cross with k = 1."
      initialSeed={9}
    />
  )
}

export default function DistLab() {
  const [tab, setTab] = useState<'tree' | 'loop'>('tree')
  return (
    <div className="space-y-6">
      <Section
        title="Network designer"
        sub={tab === 'tree' ? 'A dead-end network: change a demand, a length or the velocity and watch flow, diameter, head loss and the pressure along each branch against the 30 psi line.' : 'A looped network: play the Hardy Cross trials and watch the flows swing round each loop until the corrections die out.'}
        right={<Seg value={tab} onChange={setTab} items={[{ v: 'tree', label: 'Branched' }, { v: 'loop', label: 'Hardy Cross' }]} />}
      >
        {tab === 'tree' ? <BranchSim /> : <HardyCrossSim />}
      </Section>
      <Problems />
    </div>
  )
}
