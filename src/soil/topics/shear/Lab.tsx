// Shear-strength labs: Mohr circle studio (pole, any plane, envelope, failure planes on the element),
// the test lab (direct shear / CD / CU / UU / unconfined), and the water-table strength check (AJK Problem 3).
import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { tipAxes } from '../../../components/PointTip'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Tex } from '../../../components/ui'
import { CheckTable, hashKey, type CheckCol } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { circle, circleFromTangentPoint, elementFromPrincipal, failurePlane, fsOnPlane, mohr, obliquity, onPlane, touches, type Circle, type Envelope, type Stress2D } from '../../engine/mohr'
import { circleArea, consistencyFromQu, directShear, fitCircles, QU_CLASSES, squareArea, strengthAt, triaxCircles, unconfined, type TriaxTest } from '../../engine/shear'
import { GW, GW_PCF } from '../../engine/units'
import { markUsed, openSmRef } from '../../reference/pane'
import { MohrFig, StressElement, TauSigmaFig } from './figs'
import { TestBench } from './TestBench'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const norm = (d: number) => {
  let x = d % 180
  if (x <= -90) x += 180
  if (x > 90) x -= 180
  return x
}

// ================================================================ Mohr circle studio
type StudioMode = 'principal' | 'element'
interface StudioIn {
  mode: StudioMode
  s1: number
  s3: number
  /** angle of the major principal plane from the horizontal */
  beta: number
  sx: number
  sz: number
  txz: number
  theta: number
  c: number
  phi: number
  env: boolean
}
const STUDIO0: StudioIn = { mode: 'principal', s1: 399, s3: 172, beta: 0, sx: 60, sz: 140, txz: 30, theta: 56.7, c: 0, phi: 23.42, env: true }

export function MohrStudio() {
  const [p, setP] = useState<StudioIn>(STUDIO0)
  const set = (o: Partial<StudioIn>) => setP({ ...p, ...o })
  const st: Stress2D = p.mode === 'principal' ? elementFromPrincipal(Math.max(p.s1, p.s3), Math.min(p.s1, p.s3), p.beta) : { sx: p.sx, sz: p.sz, txz: p.txz }
  const valid = [st.sx, st.sz, st.txz, p.theta, p.c, p.phi].every(Number.isFinite) && p.phi >= 0 && p.phi < 60
  const m = mohr(st)
  const pl = onPlane(st, p.theta)
  const env: Envelope = { c: p.c, phi: p.phi }
  const cc: Circle = { C: m.C, R: m.R, s1: m.s1, s3: m.s3 }
  const tch = touches(cc, env)
  const fp = failurePlane(cc, p.phi)
  const th1 = norm(m.thMajor + fp.theta),
    th2 = norm(m.thMajor - fp.theta)
  const q1 = onPlane(st, th1),
    q2 = onPlane(st, th2)
  useEffect(() => {
    if (valid) markUsed('s-mohr', { s1: +m.s1.toFixed(1), s3: +m.s3.toFixed(1), th: +p.theta.toFixed(1) })
  })
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `sm-shear:mohr:${key}:${k}`
  const random = () => {
    const r = rng(Math.floor(Math.random() * 1e9))
    if (r() < 0.5) set({ mode: 'principal', s3: randInt(r, 50, 250, 10), s1: 0, beta: pick(r, [0, 0, 0, 20, 30, -25]), theta: randInt(r, -80, 80, 5), phi: randInt(r, 22, 36), c: pick(r, [0, 0, 10, 20]) })
    else set({ mode: 'element', sx: randInt(r, 40, 200, 10), sz: randInt(r, 60, 260, 10), txz: randInt(r, -60, 60, 5), theta: randInt(r, -80, 80, 5), phi: randInt(r, 22, 36), c: pick(r, [0, 10]) })
  }
  // σ1 in a random principal problem: s1 = 0 → make it fail-ish
  useEffect(() => {
    if (p.mode === 'principal' && p.s1 === 0) {
      const Kp = Math.tan(((45 + p.phi / 2) * Math.PI) / 180) ** 2
      setP({ ...p, s1: Math.round(p.s3 * Kp * (0.85 + Math.random() * 0.3) + 2 * p.c * Math.sqrt(Kp)) })
    }
  }, [p])
  const drag = (s: number) => {
    if (p.mode !== 'principal') return
    const sv = Math.max(0, Math.round(s))
    if (Math.abs(sv - p.s1) < Math.abs(sv - p.s3)) set({ s1: sv })
    else set({ s3: sv })
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Seg value={p.mode} onChange={(v) => set({ mode: v })} items={[{ v: 'principal', label: 'σ1, σ3 (+ plane angle)' }, { v: 'element', label: 'stress element σx, σz, τ' }]} />
        <button className="btn" onClick={random}>
          🎲 Random
        </button>
        <button className="text-xs text-accent underline" onClick={() => setP(STUDIO0)}>
          AJK CD Problem 3
        </button>
        <button className="text-xs text-accent underline" onClick={() => setP({ ...STUDIO0, s1: 350, s3: 100, phi: 33.75, theta: 45 })}>
          2012-13 Q4 (τmax plane)
        </button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-sm">
        {p.mode === 'principal' ? (
          <>
            <NumIn label="σ1" value={p.s1} onChange={(v) => set({ s1: v })} step={10} unit="kPa" w="w-16" />
            <NumIn label="σ3" value={p.s3} onChange={(v) => set({ s3: v })} step={10} unit="kPa" w="w-16" />
            <NumIn label="major principal plane at" value={p.beta} onChange={(v) => set({ beta: v })} step={5} unit="° to horizontal" w="w-14" />
          </>
        ) : (
          <>
            <NumIn label="σx (on vertical plane)" value={p.sx} onChange={(v) => set({ sx: v })} step={10} unit="kPa" w="w-16" />
            <NumIn label="σz (on horizontal plane)" value={p.sz} onChange={(v) => set({ sz: v })} step={10} unit="kPa" w="w-16" />
            <NumIn label="τ" value={p.txz} onChange={(v) => set({ txz: v })} step={5} unit="kPa" w="w-14" />
          </>
        )}
        <label className="inline-flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={p.env} onChange={(e) => set({ env: e.target.checked })} /> envelope
        </label>
        {p.env && (
          <>
            <NumIn label="c" value={p.c} onChange={(v) => set({ c: v })} step={5} unit="kPa" w="w-12" />
            <NumIn label="φ" value={p.phi} onChange={(v) => set({ phi: v })} step={1} unit="°" w="w-14" />
          </>
        )}
      </div>
      <Slider label="plane angle θ (ccw from horizontal)" value={p.theta} min={-90} max={90} step={0.5} onChange={(v) => set({ theta: v })} unit="°" />
      {!valid ? (
        <div className="text-bad text-sm">Fill in every input.</div>
      ) : (
        <>
          <div className="grid cq-lg:grid-cols-[1fr_auto] gap-3 items-start">
            <div className="rounded-xl bg-bg/60 border border-line p-2">
              <MohrFig
                full
                height={340}
                onDrag={p.mode === 'principal' ? drag : undefined}
                circles={[{ c: cc, color: 'var(--c-accent)' }]}
                envs={p.env ? [{ env, color: 'var(--c-bad)', label: `τ = ${f2(p.c)} + σ tan ${f2(p.phi)}°` }] : []}
                lines={[
                  { s1: m.pole.sigma, t1: m.pole.tau, s2: pl.sigma, t2: pl.tau, color: 'var(--c-accent)', w: 2 },
                  ...(p.env ? [q1, q2].map((q) => ({ s1: m.pole.sigma, t1: m.pole.tau, s2: q.sigma, t2: q.tau, color: 'var(--c-bad)', dash: true })) : []),
                  { s1: m.C, t1: 0, s2: pl.sigma, t2: pl.tau, color: 'var(--c-mute)', dash: true, w: 1 },
                ]}
                points={[
                  { s: m.s1, t: 0, color: 'var(--c-ink)', label: `σ1 ${f2(m.s1)}`, dx: 4, dy: -6 },
                  { s: m.s3, t: 0, color: 'var(--c-ink)', label: `σ3 ${f2(m.s3)}`, dx: -52, dy: -6 },
                  { s: m.pole.sigma, t: m.pole.tau, color: 'var(--c-load)', label: 'pole P', r: 5, dx: 6, dy: m.pole.tau > 1e-6 ? -6 : 26 },
                  { s: pl.sigma, t: pl.tau, color: 'var(--c-accent)', label: `(${f2(pl.sigma)}, ${f2(pl.tau)})`, r: 4.5 },
                  ...(p.env && tch.fails ? [{ s: q1.sigma, t: q1.tau, color: 'var(--c-bad)', label: 'failure plane', r: 3.5 }] : []),
                ]}
              />
              <div className="text-[11px] text-faint px-1">{p.mode === 'principal' ? 'Drag on the σ-axis to move σ1 or σ3. ' : ''}τ plotted with Das's sign (eq. 10.4); a line from the pole parallel to a plane meets the circle at the stresses on that plane.</div>
            </div>
            <div className="rounded-xl bg-bg/60 border border-line p-2 flex flex-col items-center">
              <StressElement sx={st.sx} sz={st.sz} txz={st.txz} planeDeg={p.theta} failDegs={p.env ? [th1, th2] : []} majorDeg={m.thMajor} />
              <div className="text-[11px] text-mute text-center">
                <span className="text-accent">━ plane θ = {f2(p.theta)}°</span> · <span className="text-bad">╌ failure planes {f2(th1)}°, {f2(th2)}°</span>
                <br />
                major principal plane at {f2(m.thMajor)}°
              </div>
            </div>
          </div>
          <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-line p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Circle</div>
              <div>C = {f2(m.C)}, R = {f2(m.R)} kPa</div>
              <div>σ1 = {f2(m.s1)}, σ3 = {f2(m.s3)} kPa</div>
              <div>τmax = {f2(m.R)} on planes at {f2(m.thTauMax[0])}°, {f2(m.thTauMax[1])}°</div>
              <div>pole at ({f2(m.pole.sigma)}, {f2(m.pole.tau)})</div>
            </div>
            <div className="rounded-xl border border-line p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Plane θ = {f2(p.theta)}°</div>
              <div>
                σ = <b>{f2(pl.sigma)}</b>, τ = <b>{f2(pl.tau)}</b> kPa
              </div>
              <div>obliquity = {f2(obliquity(pl.sigma, pl.tau))}°</div>
              {p.env && Math.abs(pl.tau) > 1e-9 && <div>strength c + σ tan φ = {f2(p.c + pl.sigma * Math.tan((p.phi * Math.PI) / 180))} → FS = {f2(fsOnPlane(pl.sigma, pl.tau, env))}</div>}
            </div>
            {p.env && (
              <div className={'rounded-xl border p-3 ' + (tch.fails ? 'border-bad/60' : 'border-good/50')}>
                <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Envelope</div>
                <div className={tch.fails ? 'text-bad font-semibold' : 'text-good font-semibold'}>{tch.fails ? (Math.abs(tch.margin) < 0.5 ? 'Touches: failure' : 'Crosses: the soil would already have failed') : 'Inside: safe'}</div>
                <div>R = {f2(m.R)} vs C sin φ + c cos φ = {f2(tch.need)}</div>
                <div>
                  failure planes at 45 + φ/2 = {f2(fp.theta)}° from the major plane; tangent-point stresses σf = {f2(fp.sigma)}, τf = {f2(fp.tau)}
                </div>
              </div>
            )}
          </div>
          <div key={key} className="rounded-xl border border-line p-3 space-y-1 text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints</div>
            {p.mode === 'element' && (
              <>
                <Answer id={id('s1')} label="σ1" value={m.s1} unit="kPa" compact />
                <Answer id={id('s3')} label="σ3" value={m.s3} unit="kPa" compact />
                <Answer id={id('thp')} label="major principal plane (° from horizontal)" value={m.thMajor} unit="°" abs={0.3} compact />
              </>
            )}
            <Answer id={id('sn')} label={`σ on the plane at ${f2(p.theta)}°`} value={pl.sigma} unit="kPa" compact />
            <Answer id={id('tn')} label={`τ on the plane at ${f2(p.theta)}°`} value={pl.tau} unit="kPa" abs={0.3} compact />
            {p.env && <Answer id={id('tf')} label="failure plane angle from the major principal plane" value={fp.theta} unit="°" compact />}
            {p.env && <Choice id={id('fail')} label="Does the circle reach the envelope?" options={[{ v: 'y', label: 'yes, failure' }, { v: 'n', label: 'no, safe' }]} answer={tch.fails ? 'y' : 'n'} />}
          </div>
        </>
      )}
    </div>
  )
}

// ================================================================ test lab
type TestKind = 'ds' | 'cd' | 'cu' | 'uu' | 'uc'
interface DSRow {
  N: number
  T: number
}
interface TriRow {
  s3: number
  dev: number
  u: number
}
interface TestIn {
  kind: TestKind
  // direct shear
  shape: 'square' | 'circle'
  size: number
  nUnit: 'N' | 'kg'
  ds: DSRow[]
  through0: boolean
  // triaxial
  tri: TriRow[]
  forceC0: boolean
  // unconfined
  P: number
  dH: number
  H0: number
  D: number
  story?: string
}
const TEST0: TestIn = {
  kind: 'cu',
  shape: 'square',
  size: 60,
  nUnit: 'N',
  ds: [
    { N: 200, T: 150 },
    { N: 300, T: 220 },
    { N: 400, T: 260 },
    { N: 500, T: 335 },
  ],
  through0: false,
  tri: [
    { s3: 75, dev: 200, u: 25 },
    { s3: 150, dev: 272, u: 50 },
    { s3: 300, dev: 418, u: 100 },
  ],
  forceC0: false,
  P: 127,
  dH: 0.8,
  H0: 76,
  D: 38,
}

export function randomTest(seed: number, kind: TestKind): TestIn {
  const r = rng(seed)
  const base = { ...TEST0, kind, story: undefined as string | undefined }
  const Kp = (phi: number) => Math.tan(((45 + phi / 2) * Math.PI) / 180) ** 2
  if (kind === 'ds') {
    const shape = pick(r, ['square', 'circle'] as const)
    const size = shape === 'square' ? 60 : 63.5
    const A = shape === 'square' ? squareArea(size) : circleArea(size)
    const kg = shape === 'circle' && r() < 0.6
    const c = pick(r, [0, 0, 5, 10, 20])
    const phi = randInt(r, 22, 36)
    const loads = kg ? [pick(r, [8, 16, 24]), 0, 0].map((x, i, a) => (i ? a[0] * 2 ** i : x)) : [200, 300, 400, 500].slice(0, randInt(r, 3, 4)).map((x) => x * pick(r, [1, 1, 0.5]))
    const ds = loads.map((L) => {
      const N = kg ? (L * 9.81) / 1000 : L / 1000
      const tau = c + (N / A) * Math.tan((phi * Math.PI) / 180)
      return { N: L, T: Math.round(tau * A * 1000 * (1 + (r() - 0.5) * 0.04) * 10) / 10 }
    })
    return { ...base, shape, size, nUnit: kg ? 'kg' : 'N', ds, through0: c === 0 && r() < 0.5, story: `Direct shear (${shape === 'square' ? `${size} × ${size} mm box` : `${size} mm diameter specimens`}). Determine c and φ${c ? '' : ' (sand: c = 0)'}; write the Mohr–Coulomb equation.` }
  }
  if (kind === 'cd' || kind === 'cu') {
    const nc = r() < 0.55
    const phi = randInt(r, 22, 34)
    const c = nc ? 0 : randInt(r, 5, 25)
    const n = kind === 'cd' ? (nc ? pick(r, [1, 1, 2]) : pick(r, [2, 3])) : pick(r, [1, 2, 3, 3])
    const s3s = [pick(r, [70, 100, 150]), 0, 0].map((x, i, a) => (i ? a[0] * (i + 1) : x)).slice(0, n)
    const Af = nc ? pick(r, [0.6, 0.8, 1.0, 1.1]) : pick(r, [0.1, 0.25, 0.4])
    const tri = s3s.map((s3) => {
      const k = Kp(phi)
      const dev = kind === 'cd' ? s3 * (k - 1) + 2 * c * Math.sqrt(k) : (s3 * (k - 1) + 2 * c * Math.sqrt(k)) / (1 + Af * (k - 1))
      const d = Math.round(dev * (1 + (r() - 0.5) * 0.03))
      return { s3, dev: d, u: kind === 'cu' ? Math.round(Af * d) : 0 }
    })
    return { ...base, tri, forceC0: nc && n === 1, story: `${kind.toUpperCase()} triaxial test${n > 1 ? `s on ${n} specimens` : ''} of a saturated ${nc ? 'normally consolidated' : 'overconsolidated'} clay. Find ${kind === 'cu' ? 'the total (c, φ) and effective (c′, φ′) parameters, Af' : 'c′ and φ′'}, the failure-plane angle and the stresses on it.` }
  }
  if (kind === 'uu') {
    const cu = randInt(r, 25, 110, 5)
    const tri = [50, 100, 200].map((s3) => ({ s3, dev: Math.round(2 * cu * (1 + (r() - 0.5) * 0.04)), u: 0 }))
    return { ...base, tri, story: 'UU tests on three specimens of a saturated clay. Find cu and φu; draw the circles and the envelope.' }
  }
  return { ...base, P: randInt(r, 60, 300), dH: randInt(r, 4, 30) / 10, H0: 76, D: 38, story: 'Unconfined compression on a 38 × 76 mm saturated clay specimen. Find ε, the corrected area, qu, cu and the consistency.' }
}

type DSOut = { k: string; sigma: number; tau: number }
const DS_COLS: CheckCol<DSOut>[] = [
  { key: 's', label: 'σ (kPa)', get: (r) => r.sigma, abs: 0.1 },
  { key: 't', label: 'τf (kPa)', get: (r) => r.tau, abs: 0.1 },
]
type TriOut = { k: string; C: number; R: number; s3p: number; s1p: number; Af: number }

export function TestLab() {
  const [p, setP] = useState<TestIn>(TEST0)
  const set = (o: Partial<TestIn>) => setP({ ...p, ...o, story: undefined })
  const key = hashKey(JSON.stringify({ ...p, story: '' }))
  const id = (k: string) => `sm-shear:lab:${key}:${k}`
  useEffect(() => {
    markUsed('s-tests', { test: p.kind === 'uc' ? 'UCS' : p.kind === 'ds' ? '' : p.kind.toUpperCase() })
  })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Seg
          value={p.kind}
          onChange={(v) => setP({ ...TEST0, kind: v, ...(v === 'ds' || v === 'uc' ? {} : v === 'uu' ? { tri: [{ s3: 50, dev: 200, u: 0 }, { s3: 100, dev: 200, u: 0 }, { s3: 200, dev: 200, u: 0 }] } : v === 'cd' ? { tri: [{ s3: 172, dev: 227, u: 0 }], forceC0: true } : {}) })}
          items={[
            { v: 'ds', label: 'Direct shear' },
            { v: 'cd', label: 'CD' },
            { v: 'cu', label: 'CU' },
            { v: 'uu', label: 'UU' },
            { v: 'uc', label: 'Unconfined' },
          ]}
        />
        <button className="btn" onClick={() => setP(randomTest(Math.floor(Math.random() * 1e9), p.kind))}>
          🎲 Random {p.kind === 'ds' ? 'direct shear' : p.kind === 'uc' ? 'unconfined' : p.kind.toUpperCase()} data
        </button>
      </div>
      {p.story && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{p.story}</div>}
      {p.kind === 'ds' && <DSPart p={p} set={set} id={id} k={key} />}
      {(p.kind === 'cd' || p.kind === 'cu' || p.kind === 'uu') && <TriPart p={p} set={set} id={id} k={key} />}
      {p.kind === 'uc' && <UCPart p={p} set={set} id={id} k={key} />}
    </div>
  )
}

function DSPart({ p, set, id, k }: { p: TestIn; set: (o: Partial<TestIn>) => void; id: (k: string) => string; k: string }) {
  const A = p.shape === 'square' ? squareArea(p.size) : circleArea(p.size)
  const ok = A > 0 && p.ds.length >= 1 && p.ds.every((r) => r.N > 0 && r.T >= 0)
  const tests = p.ds.map((r) => ({ N: p.nUnit === 'kg' ? (r.N * 9.81) / 1000 : r.N / 1000, T: r.T / 1000 }))
  const res = ok ? directShear(tests, A, { through0: p.through0 || p.ds.length === 1 }) : null
  const last = res?.pts[res.pts.length - 1]
  const circ = res && last && res.env.phi > 0 ? circleFromTangentPoint(last.sigma, last.tau, res.env.phi) : null
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-sm">
        <Seg value={p.shape} onChange={(v) => set({ shape: v, size: v === 'square' ? 60 : 63.5 })} items={[{ v: 'square', label: 'square box' }, { v: 'circle', label: 'circular' }]} />
        <NumIn label={p.shape === 'square' ? 'side' : 'diameter'} value={p.size} onChange={(v) => set({ size: v })} step={0.5} unit="mm" w="w-16" />
        <Seg value={p.nUnit} onChange={(v) => set({ nUnit: v })} items={[{ v: 'N', label: 'normal load in N' }, { v: 'kg', label: 'in kg (×9.81)' }]} />
        <label className="inline-flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={p.through0} onChange={(e) => set({ through0: e.target.checked })} /> through the origin (c = 0)
        </label>
      </div>
      <div className="space-y-1">
        {p.ds.map((r, i) => (
          <div key={i} className="flex flex-wrap gap-3 items-center text-sm">
            <span className="text-xs text-mute w-14">test {i + 1}</span>
            <NumIn label="normal" value={r.N} onChange={(v) => set({ ds: p.ds.map((x, j) => (j === i ? { ...x, N: v } : x)) })} step={10} unit={p.nUnit} w="w-16" />
            <NumIn label="shear at failure" value={r.T} onChange={(v) => set({ ds: p.ds.map((x, j) => (j === i ? { ...x, T: v } : x)) })} step={5} unit="N" w="w-16" />
            {p.ds.length > 1 && (
              <button className="text-xs text-bad underline" onClick={() => set({ ds: p.ds.filter((_, j) => j !== i) })}>
                remove
              </button>
            )}
          </div>
        ))}
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ ds: [...p.ds, { N: (p.ds.at(-1)?.N ?? 100) + 100, T: (p.ds.at(-1)?.T ?? 80) + 60 }] })}>
          + test
        </button>
      </div>
      {!res ? (
        <div className="text-bad text-sm">Positive loads and a specimen size, please.</div>
      ) : (
        <>
          <div className="grid cq-lg:grid-cols-2 gap-3">
            <div className="rounded-xl bg-bg/60 border border-line p-2">
              <TauSigmaFig pts={res.pts} env={res.env} />
            </div>
            {circ && (
              <div className="rounded-xl bg-bg/60 border border-line p-2">
                <MohrFig circles={[{ c: circ, color: 'var(--c-accent)', label: `test ${res.pts.length}` }]} envs={[{ env: res.env, color: 'var(--c-bad)' }]} points={[{ s: last!.sigma, t: last!.tau, color: 'var(--c-load)', label: 'measured (σ, τf) = tangent point' }]} height={260} />
                <div className="text-[11px] text-faint">Slide 27 / 2012-13 Q5: the measured point is the tangent point; the centre is where the normal to the envelope meets the σ-axis.</div>
              </div>
            )}
          </div>
          <div key={k} className="grid cq-lg:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">A = {fmt(A * 1e6, 1)} mm² = {fmt(A, 6)} m² — stresses</div>
              <CheckTable rows={res.pts.map((x, i) => ({ ...x, k: `d${i}` }))} rowKey={(x) => x.k} given={[{ label: 'test', get: (x) => String(+x.k.slice(1) + 1) }]} cols={DS_COLS} idp={id('ds')} />
            </div>
            <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Envelope ({res.fit.n === 1 || p.through0 ? 'through the origin' : 'least squares, as the slide’s Excel trend line'})</div>
              {!(p.through0 || p.ds.length === 1) && <Answer id={id('c')} label="c" value={res.env.c} unit="kPa" abs={0.3} compact />}
              <Answer id={id('phi')} label="φ" value={res.env.phi} unit="°" abs={0.15} compact />
              {circ && (
                <>
                  <Answer id={id('s1')} label={`σ1 at failure, test ${res.pts.length}`} value={circ.s1} unit="kPa" compact />
                  <Answer id={id('s3')} label={`σ3 at failure, test ${res.pts.length}`} value={circ.s3} unit="kPa" compact />
                </>
              )}
              <Choice id={id('hist')} label="stress history" options={[{ v: 'nc', label: 'c ≈ 0: NC / sand' }, { v: 'oc', label: 'c > 0: OC' }]} answer={res.env.c > 3 ? 'oc' : 'nc'} />
            </div>
          </div>
          <Reveal id={id('sol')} title="Full solution">
            <div className="text-sm space-y-1">
              <p>
                A = {fmt(A * 1e6, 1)} mm² = {fmt(A, 6)} m². σ = N/A, τf = T/A{p.nUnit === 'kg' ? ' (N = kg × 9.81)' : ''}: {res.pts.map((x) => `(${f2(x.sigma)}, ${f2(x.tau)})`).join(', ')} kPa.
              </p>
              <p>
                {p.through0 || p.ds.length === 1 ? `Line through the origin: tan φ = Στσ/Σσ² = ${fmt(res.fit.b, 4)}` : `Least-squares line τ = ${f2(res.fit.a)} + ${fmt(res.fit.b, 4)}σ (R² = ${fmt(res.fit.r2, 4)})`} → <b>φ = {f2(res.env.phi)}°</b>
                {p.through0 || p.ds.length === 1 ? '' : <>, <b>c = {f2(res.env.c)} kPa</b></>}. Mohr–Coulomb: τf = {f2(res.env.c)} + σ tan {f2(res.env.phi)}°.
              </p>
              {circ && (
                <p>
                  Circle tangent at ({f2(last!.sigma)}, {f2(last!.tau)}): centre σ + τ tan φ = {f2(circ.C)}, radius τ/cos φ = {f2(circ.R)} → σ1 = {f2(circ.s1)}, σ3 = {f2(circ.s3)} kPa; the failure (horizontal) plane is at 45 + φ/2 = {f2(45 + res.env.phi / 2)}° from the major principal plane.
                </p>
              )}
              <p>{res.env.c > 3 ? 'A clear cohesion intercept → overconsolidated (or cemented) clay.' : 'c ≈ 0 → sand or normally consolidated clay.'}</p>
            </div>
          </Reveal>
        </>
      )}
    </div>
  )
}

function TriPart({ p, set, id, k }: { p: TestIn; set: (o: Partial<TestIn>) => void; id: (k: string) => string; k: string }) {
  const cu = p.kind === 'cu',
    uu = p.kind === 'uu'
  const ok = p.tri.length > 0 && p.tri.every((r) => r.s3 >= 0 && r.dev > 0 && Number.isFinite(r.u))
  const tests: TriaxTest[] = p.tri.map((r) => ({ s3: r.s3, dev: r.dev, u: cu ? r.u : undefined }))
  const tc = ok ? triaxCircles(tests) : null
  const fitT = tc && !uu ? fitCircles(tc.total, { forceC0: p.forceC0 }) : null
  const fitE = tc?.eff ? fitCircles(tc.eff, { forceC0: p.forceC0 }) : null
  const main = cu ? fitE : fitT
  const effC = cu ? tc?.eff : tc?.total
  const cuAvg = tc ? tc.total.reduce((s, c) => s + c.R, 0) / tc.total.length : 0
  useEffect(() => {
    if (cu && tc) markUsed('s-ab', { Af: +(tc.Af[0] ?? 0).toFixed(2) })
  })
  const rows: TriOut[] = tc ? tc.total.map((c, i) => ({ k: `t${i}`, C: c.C, R: c.R, s3p: tc.eff?.[i].s3 ?? c.s3, s1p: tc.eff?.[i].s1 ?? c.s1, Af: tc.Af[i] ?? 0 })) : []
  const cols: CheckCol<TriOut>[] = [
    { key: 'C', label: 'centre (σ1+σ3)/2', get: (r) => r.C, abs: 0.1 },
    { key: 'R', label: 'radius', get: (r) => r.R, abs: 0.1 },
    ...(cu
      ? [
          { key: 's3p', label: "σ′3", get: (r: TriOut) => r.s3p, abs: 0.1 },
          { key: 's1p', label: "σ′1", get: (r: TriOut) => r.s1p, abs: 0.1 },
          { key: 'Af', label: 'Af', get: (r: TriOut) => r.Af, abs: 0.01 },
        ]
      : []),
  ]
  const fp = main && effC && main.ok ? failurePlane(effC[0], main.phi) : null
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {p.tri.map((r, i) => (
          <div key={i} className="flex flex-wrap gap-3 items-center text-sm">
            <span className="text-xs text-mute w-16">specimen {i + 1}</span>
            <NumIn label="σ3" value={r.s3} onChange={(v) => set({ tri: p.tri.map((x, j) => (j === i ? { ...x, s3: v } : x)) })} step={10} unit="kPa" w="w-16" />
            <NumIn label="(σ1 − σ3)f" value={r.dev} onChange={(v) => set({ tri: p.tri.map((x, j) => (j === i ? { ...x, dev: v } : x)) })} step={10} unit="kPa" w="w-16" />
            {cu && <NumIn label="uf" value={r.u} onChange={(v) => set({ tri: p.tri.map((x, j) => (j === i ? { ...x, u: v } : x)) })} step={5} unit="kPa" w="w-16" />}
            {p.tri.length > 1 && (
              <button className="text-xs text-bad underline" onClick={() => set({ tri: p.tri.filter((_, j) => j !== i) })}>
                remove
              </button>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-3 items-center">
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ tri: [...p.tri, { s3: (p.tri.at(-1)?.s3 ?? 100) * 2, dev: (p.tri.at(-1)?.dev ?? 100) * 1.6, u: (p.tri.at(-1)?.u ?? 0) * 2 }] })}>
            + specimen
          </button>
          {!uu && (
            <label className="inline-flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={p.forceC0} onChange={(e) => set({ forceC0: e.target.checked })} /> force c = 0 (NC clay / sand)
            </label>
          )}
        </div>
      </div>
      {!tc ? (
        <div className="text-bad text-sm">Positive deviators, please.</div>
      ) : (
        <>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <MohrFig
              height={300}
              circles={[...tc.total.map((c, i) => ({ c, color: 'var(--c-accent)', label: cu ? `T${i + 1}` : `${i + 1}` })), ...(cu && tc.eff ? tc.eff.map((c, i) => ({ c, color: 'var(--c-accent2)', dash: true, label: `E${i + 1}` })) : [])]}
              envs={
                uu
                  ? [{ env: { c: cuAvg, phi: 0 }, color: 'var(--c-bad)', label: `φu = 0, cu = ${f2(cuAvg)}` }]
                  : [
                      ...(fitT && fitT.ok ? [{ env: { c: fitT.c, phi: fitT.phi }, color: 'var(--c-accent)', label: `${cu ? 'total: ' : ''}c = ${f2(fitT.c)}, φ = ${f2(fitT.phi)}°` }] : []),
                      ...(fitE && fitE.ok ? [{ env: { c: fitE.c, phi: fitE.phi }, color: 'var(--c-accent2)', dash: true, label: `effective: c′ = ${f2(fitE.c)}, φ′ = ${f2(fitE.phi)}°` }] : []),
                    ]
              }
              points={fp && effC ? [{ s: fp.sigma, t: fp.tau, color: 'var(--c-bad)', label: '(σf, τf)' }] : []}
            />
            <div className="text-[11px] text-faint px-1">{cu ? 'Solid = total circles; dashed = effective (shifted left by uf).' : uu ? 'Equal circles: a cell-pressure increase only raises u.' : 'Effective = total in a drained test (u = 0).'}</div>
          </div>
          {[fitT, fitE].some((f) => f?.note) && (
            <Callout kind="note" title="Fit warning">
              {[fitT, fitE].map((f, i) => (f?.note ? <div key={i}>{(i ? 'Effective: ' : cu ? 'Total: ' : '') + f.note}</div> : null))}
            </Callout>
          )}
          <div key={k} className="grid cq-lg:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Circles {cu ? '(total) and effective stresses' : ''}</div>
              <CheckTable rows={rows} rowKey={(x) => x.k} given={[{ label: '#', get: (x) => String(+x.k.slice(1) + 1) }]} cols={cols} idp={id('tri')} />
            </div>
            <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Parameters ({main ? (main.method === 'one' ? 'one circle through the origin' : main.method === 'tangent' ? 'exact common tangent' : main.method === 'c0' ? 'c = 0 forced' : 'p–q least squares') : 'φu = 0'})</div>
              {uu ? (
                <>
                  <Answer id={id('cu')} label="cu" value={cuAvg} unit="kPa" compact />
                  <Choice id={id('phiu')} label="φu" options={[{ v: '0', label: '0' }, { v: 'x', label: 'from the slope' }]} answer="0" />
                </>
              ) : (
                <>
                  {fitT && fitT.ok && (
                    <>
                      <Answer id={id('phiT')} label={cu ? 'φ (total, φcu)' : "φ′"} value={fitT.phi} unit="°" abs={0.15} compact />
                      {fitT.method !== 'one' && fitT.method !== 'c0' && <Answer id={id('cT')} label={cu ? 'c (total)' : "c′"} value={fitT.c} unit="kPa" abs={0.5} compact />}
                    </>
                  )}
                  {fitE && fitE.ok && (
                    <>
                      <Answer id={id('phiE')} label="φ′" value={fitE.phi} unit="°" abs={0.15} compact />
                      {fitE.method !== 'one' && fitE.method !== 'c0' && <Answer id={id('cE')} label="c′" value={fitE.c} unit="kPa" abs={0.5} compact />}
                    </>
                  )}
                  {fp && (
                    <>
                      <Answer id={id('th')} label="failure plane from the major principal plane" value={fp.theta} unit="°" compact />
                      <Answer id={id('sf')} label={`σ${cu ? '′' : ''}f on it (specimen 1)`} value={fp.sigma} unit="kPa" compact />
                      <Answer id={id('tf')} label="τf on it (specimen 1)" value={fp.tau} unit="kPa" compact />
                    </>
                  )}
                  {cu && <Answer id={id('af')} label="Af (specimen 1) = uf/(σ1 − σ3)f" value={tc.Af[0] ?? 0} digits={3} abs={0.01} compact />}
                </>
              )}
            </div>
          </div>
          <Reveal id={id('sol')} title="Full solution">
            <TriSolution p={p} tc={tc} fitT={fitT} fitE={fitE} cuAvg={cuAvg} />
          </Reveal>
        </>
      )}
    </div>
  )
}

function fitText(f: ReturnType<typeof fitCircles>, cs: Circle[], prime: string) {
  if (f.method === 'one') return `One circle through the origin: sin φ${prime} = R/C = ${f2(cs[0].R)}/${f2(cs[0].C)} → φ${prime} = ${f2(f.phi)}°, c${prime} = 0.`
  if (f.method === 'c0') return `Envelope forced through the origin (least squares on q = p tan α): sin φ${prime} = tan α = ${fmt(Math.tan((f.alpha * Math.PI) / 180), 4)} → φ${prime} = ${f2(f.phi)}°.`
  if (f.method === 'tangent') return `Common tangent to the two circles: sin φ${prime} = (R2 − R1)/(C2 − C1) = (${f2(cs[1].R)} − ${f2(cs[0].R)})/(${f2(cs[1].C)} − ${f2(cs[0].C)}) → φ${prime} = ${f2(f.phi)}°; c${prime} = (R1 − C1 sin φ)/cos φ = ${f2(f.c)} kPa.`
  return `p–q (Kf) line by least squares: q = ${f2(f.a)} + p tan ${f2(f.alpha)}° → sin φ${prime} = tan α → φ${prime} = ${f2(f.phi)}°, c${prime} = a/cos φ = ${f2(f.c)} kPa.`
}

function TriSolution({ p, tc, fitT, fitE, cuAvg }: { p: TestIn; tc: ReturnType<typeof triaxCircles>; fitT: ReturnType<typeof fitCircles> | null; fitE: ReturnType<typeof fitCircles> | null; cuAvg: number }) {
  const cu = p.kind === 'cu'
  return (
    <div className="text-sm space-y-2">
      <table className="tbl w-auto">
        <thead>
          <tr>
            <th>#</th>
            <th>σ3</th>
            <th>(σ1 − σ3)f</th>
            <th>σ1</th>
            {cu && (
              <>
                <th>uf</th>
                <th>σ′3</th>
                <th>σ′1</th>
                <th>Af</th>
              </>
            )}
            <th>C</th>
            <th>R</th>
          </tr>
        </thead>
        <tbody>
          {p.tri.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{f2(r.s3)}</td>
              <td>{f2(r.dev)}</td>
              <td>{f2(r.s3 + r.dev)}</td>
              {cu && (
                <>
                  <td>{f2(r.u)}</td>
                  <td>{f2(tc.eff![i].s3)}</td>
                  <td>{f2(tc.eff![i].s1)}</td>
                  <td>{f3(tc.Af[i]!)}</td>
                </>
              )}
              <td>{f2(tc.total[i].C)}</td>
              <td>{f2(tc.total[i].R)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {p.kind === 'uu' ? (
        <p>
          All circles have (nearly) the same radius → horizontal envelope, <b>φu = 0</b>, <b>cu = {f2(cuAvg)} kPa</b> (average radius). A higher cell pressure only raises u in a saturated undrained specimen, so σ′ and the strength do not change.
        </p>
      ) : (
        <>
          {fitT && <p>{(cu ? 'Total: ' : '') + fitText(fitT, tc.total, cu ? '' : '′')}</p>}
          {fitE && <p>Effective (σ′ = σ − uf): {fitText(fitE, tc.eff!, '′')}</p>}
          {(cu ? fitE : fitT)?.ok && (
            <p>
              Failure plane: θ = 45 + φ′/2 = {f2(failurePlane((cu ? tc.eff! : tc.total)[0], (cu ? fitE! : fitT!).phi).theta)}° from the major principal (horizontal) plane; for specimen 1: σ′f = C − R sin φ′ = {f2(failurePlane((cu ? tc.eff! : tc.total)[0], (cu ? fitE! : fitT!).phi).sigma)} kPa, τf = R cos φ′ = {f2(failurePlane((cu ? tc.eff! : tc.total)[0], (cu ? fitE! : fitT!).phi).tau)} kPa.
            </p>
          )}
          {cu && <p>For NC clay φ′ {'>'} φcu (slide 53): the pore pressure at failure is positive, shifting the effective circles left. Negative uf (dense / OC) shifts them right.</p>}
        </>
      )}
      <Md>{`Mohr–Coulomb: $\\tau_f = c + \\sigma\\tan\\varphi$ (total) / $\\tau_f = c' + \\sigma'\\tan\\varphi'$ (effective). Draw the circles **to scale** on graph paper and mark c, φ.`}</Md>
    </div>
  )
}

function UCPart({ p, set, id, k }: { p: TestIn; set: (o: Partial<TestIn>) => void; id: (k: string) => string; k: string }) {
  const ok = p.P > 0 && p.H0 > 0 && p.D > 0 && p.dH >= 0 && p.dH < p.H0
  const r = ok ? unconfined(p.P / 1000, p.dH, p.H0, p.D) : null
  useEffect(() => {
    if (r) markUsed('s-phi', { cls: r.consistency })
  })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-sm">
        <NumIn label="max load P" value={p.P} onChange={(v) => set({ P: v })} step={5} unit="N" w="w-16" />
        <NumIn label="ΔH" value={p.dH} onChange={(v) => set({ dH: v })} step={0.1} unit="mm" w="w-14" />
        <NumIn label="H0" value={p.H0} onChange={(v) => set({ H0: v })} step={1} unit="mm" w="w-14" />
        <NumIn label="D" value={p.D} onChange={(v) => set({ D: v })} step={1} unit="mm" w="w-14" />
      </div>
      {!r ? (
        <div className="text-bad text-sm">Check the inputs.</div>
      ) : (
        <>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <MohrFig circles={[{ c: circle(r.qu, 0), color: 'var(--c-accent)', label: `qu = ${f2(r.qu)}` }]} envs={[{ env: { c: r.cu, phi: 0 }, color: 'var(--c-bad)', label: `cu = qu/2 = ${f2(r.cu)}` }]} height={230} />
          </div>
          <div key={k} className="rounded-xl border border-line p-3 space-y-1 text-sm">
            <Answer id={id('eps')} label="ε = ΔH/H0" value={r.eps * 100} unit="%" abs={0.01} compact />
            <Answer id={id('A')} label="corrected A = A0/(1 − ε)" value={r.A * 1e6} unit="mm²" compact />
            <Answer id={id('qu')} label="σ1 = qu = P/A" value={r.qu} unit="kPa" compact />
            <Answer id={id('cu')} label="cu = qu/2" value={r.cu} unit="kPa" compact />
            <Choice id={id('cls')} label="consistency (Das Table 12.4)" options={QU_CLASSES.map(([n]) => ({ v: n, label: n }))} answer={consistencyFromQu(r.qu)} />
          </div>
          <Reveal id={id('sol')} title="Full solution">
            <div className="text-sm space-y-1">
              <Tex block>{`\\varepsilon = \\frac{${p.dH}}{${p.H0}} = ${fmt(r.eps, 5)} = ${f2(r.eps * 100)}\\%`}</Tex>
              <Tex block>{`A = \\frac{A_0}{1-\\varepsilon} = \\frac{\\pi(${p.D / 1000})^2/4}{1 - ${fmt(r.eps, 5)}} = \\frac{${fmt(r.A0, 7)}}{${fmt(1 - r.eps, 5)}} = ${fmt(r.A, 7)}\\ \\text{m}^2`}</Tex>
              <Tex block>{`\\sigma_1 = q_u = \\frac{${fmt(p.P / 1000, 4)}}{${fmt(r.A, 7)}} = ${f2(r.qu)}\\ \\text{kPa},\\qquad c_u = \\frac{q_u}{2} = ${f2(r.cu)}\\ \\text{kPa}`}</Tex>
              <p>
                φu = 0; failure plane at 45° (pole at σ3 = 0). qu = {f2(r.qu)} kPa → <b>{r.consistency}</b> clay (Das Table 12.4).{' '}
                <button className="underline text-accent" onClick={() => openSmRef('s-phi')}>
                  table ↗
                </button>
              </p>
            </div>
          </Reveal>
        </>
      )}
    </div>
  )
}

// ================================================================ water table / loading at a point
interface WTIn {
  mode: 'wt' | 'load'
  units: 'si' | 'psf'
  z: number
  zw: number
  gamma: number
  gammaSat: number
  phi: number
  c: number
  dS: number
  tau: number
}
const WT0: WTIn = { mode: 'wt', units: 'psf', z: 46, zw: 26, gamma: 120, gammaSat: 123, phi: 30, c: 0, dS: 0, tau: 0 }

export function WaterTableLab() {
  const [p, setP] = useState<WTIn>(WT0)
  const set = (o: Partial<WTIn>) => setP({ ...p, ...o })
  const gw = p.units === 'psf' ? GW_PCF : GW
  const uS = p.units === 'psf' ? 'psf' : 'kPa'
  const uL = p.units === 'psf' ? 'ft' : 'm'
  const ok = p.z > 0 && p.gamma > 0 && p.gammaSat > 0 && p.phi >= 0
  const env = { c: p.c, phi: p.phi }
  const res = ok ? strengthAt({ z: p.z, zw: p.zw, gamma: p.gamma, gammaSat: p.gammaSat, gw, q: p.mode === 'load' ? p.dS : 0 }, env, p.mode === 'load' && p.tau > 0 ? p.tau : undefined) : null
  const before = ok && p.mode === 'load' ? strengthAt({ z: p.z, zw: p.zw, gamma: p.gamma, gammaSat: p.gammaSat, gw }, env) : null
  const curve = useMemo(() => (ok ? Array.from({ length: 41 }, (_, i) => -0.1 * p.z + (i / 40) * 1.2 * p.z).map((zw) => ({ zw, t: strengthAt({ z: p.z, zw, gamma: p.gamma, gammaSat: p.gammaSat, gw }, env).tauf })) : []), [p, ok, gw])
  const id = (k: string) => `sm-shear:wt:${hashKey(JSON.stringify(p))}:${k}`
  const W = 520,
    Hh = 230
  const tmax = Math.max(1, ...curve.map((c) => c.t))
  const X = (zw: number) => 50 + ((zw + 0.1 * p.z) / (1.2 * p.z)) * (W - 70)
  const Y = (t: number) => Hh - 30 - (t / (tmax * 1.1)) * (Hh - 50)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Seg value={p.mode} onChange={(v) => set({ mode: v })} items={[{ v: 'wt', label: 'water table moves (Problem 3)' }, { v: 'load', label: 'structure adds σ and τ (2008-09, 2015-16)' }]} />
        <Seg value={p.units} onChange={(v) => setP(v === 'psf' ? WT0 : { ...p, units: 'si', z: 4.5, zw: 10, gamma: 19.8, gammaSat: 19.8, phi: 32, c: 0, dS: 65, tau: 50, mode: 'load' })} items={[{ v: 'psf', label: 'ft, pcf' }, { v: 'si', label: 'm, kN/m³' }]} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-sm">
        <NumIn label="depth of point A" value={p.z} onChange={(v) => set({ z: v })} step={1} unit={uL} w="w-14" />
        <NumIn label="γ above WT" value={p.gamma} onChange={(v) => set({ gamma: v })} step={1} w="w-14" />
        <NumIn label="γsat" value={p.gammaSat} onChange={(v) => set({ gammaSat: v })} step={1} w="w-14" />
        <NumIn label="φ" value={p.phi} onChange={(v) => set({ phi: v })} step={1} unit="°" w="w-12" />
        <NumIn label="c" value={p.c} onChange={(v) => set({ c: v })} step={5} unit={uS} w="w-14" />
        {p.mode === 'load' && (
          <>
            <NumIn label="Δσv" value={p.dS} onChange={(v) => set({ dS: v })} step={5} unit={uS} w="w-14" />
            <NumIn label="applied τ" value={p.tau} onChange={(v) => set({ tau: v })} step={5} unit={uS} w="w-14" />
          </>
        )}
      </div>
      <Slider label={`water table depth below ground (${uL})`} value={p.zw} min={-Math.round(p.z * 0.1)} max={Math.round(p.z * 1.1)} step={p.units === 'psf' ? 1 : 0.5} onChange={(v) => set({ zw: v })} />
      {res && (
        <>
          <div className="grid cq-md:grid-cols-[180px_1fr] gap-3">
            <svg viewBox="0 0 180 230" className="w-full max-w-[200px]" role="img" aria-label="soil column">
              <rect x={40} y={20} width={100} height={190} fill="var(--c-soil)" opacity={0.45} />
              {p.zw < p.z * 1.05 && <rect x={40} y={20 + (Math.max(0, p.zw) / p.z) * 180} width={100} height={Math.max(0, 190 - (Math.max(0, p.zw) / p.z) * 180)} fill="var(--c-water)" opacity={0.18} />}
              <line x1={30} x2={150} y1={20 + (p.zw / p.z) * 180} y2={20 + (p.zw / p.z) * 180} stroke="var(--c-water)" strokeDasharray="5 3" />
              <path d={`M${135},${12 + (p.zw / p.z) * 180} l8,0 l-4,7 z`} fill="var(--c-water)" />
              <circle cx={90} cy={200} r={5} fill="var(--c-accent)" />
              <text x={100} y={204} fontSize={11} fill="var(--c-accent)">
                A
              </text>
              <line x1={30} x2={150} y1={20} y2={20} stroke="var(--c-ink)" />
              <text x={34} y={14} fontSize={10} fill="var(--c-ink)">
                ground
              </text>
              <text x={6} y={110} fontSize={10} fill="var(--c-mute)">
                {p.z} {uL}
              </text>
            </svg>
            <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full" role="img" aria-label="strength at A against water table depth" {...tipAxes({ X, Y, x: 'WT depth', xUnit: ' ' + uL, y: 'τf', yUnit: ' ' + uS })}>
              <line x1={50} x2={W - 10} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" />
              <line x1={50} x2={50} y1={10} y2={Y(0)} stroke="var(--c-ink)" />
              <path d={curve.map((c, i) => `${i ? 'L' : 'M'}${X(c.zw).toFixed(1)},${Y(c.t).toFixed(1)}`).join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
              <circle cx={X(p.zw)} cy={Y(strengthAt({ z: p.z, zw: p.zw, gamma: p.gamma, gammaSat: p.gammaSat, gw }, env).tauf)} r={5} fill="var(--c-load)" data-tip={`WT depth = ${fmt(p.zw, 2)} ${uL}, τf = ${fmt(strengthAt({ z: p.z, zw: p.zw, gamma: p.gamma, gammaSat: p.gammaSat, gw }, env).tauf, 3)} ${uS}`} />
              <text x={W - 10} y={Y(0) + 16} fontSize={10} textAnchor="end" fill="var(--c-ink)">
                WT depth ({uL}) → deeper
              </text>
              <text x={56} y={18} fontSize={10} fill="var(--c-ink)">
                τf at A ({uS})
              </text>
              <line x1={X(p.z)} x2={X(p.z)} y1={Y(0)} y2={14} stroke="var(--c-line)" strokeDasharray="3 3" />
              <text x={X(p.z) + 3} y={28} fontSize={9} fill="var(--c-mute)">
                WT below A: dry
              </text>
            </svg>
          </div>
          <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
            <Answer id={id('s')} label="σ at A" value={res.sigma} unit={uS} compact />
            <Answer id={id('u')} label="u at A" value={res.u} unit={uS} compact />
            <Answer id={id('sp')} label="σ′ = σ − u" value={res.sigmaP} unit={uS} compact />
            <Answer id={id('t')} label="τf = c + σ′ tan φ" value={res.tauf} unit={uS} compact />
            {res.FS !== null && <Answer id={id('fs')} label="FS = τf/τ" value={res.FS} compact />}
          </div>
          <Reveal id={id('sol')} title="Full solution">
            <div className="text-sm space-y-1">
              <p>
                σ = γ × {f2(Math.max(0, Math.min(p.z, p.zw)))} + γsat × {f2(p.z - Math.max(0, Math.min(p.z, p.zw)))}
                {p.mode === 'load' ? ` + Δσ ${f2(p.dS)}` : ''} = <b>{f2(res.sigma)}</b> {uS}; u = {gw} × {f2(Math.max(0, p.z - Math.max(0, p.zw)))} = <b>{f2(res.u)}</b>; σ′ = <b>{f2(res.sigmaP)}</b>; τf = {f2(p.c)} + {f2(res.sigmaP)} tan {p.phi}° = <b>{f2(res.tauf)}</b> {uS}.
              </p>
              {before && (
                <p>
                  Before the structure: σ′ = {f2(before.sigmaP)}, τf = {f2(before.tauf)} {uS}. After: τf = {f2(res.tauf)} {res.FS !== null && <>vs applied τ = {f2(p.tau)} → FS = <b>{f2(res.FS)}</b> {res.FS >= 1 ? '(stable)' : '(fails)'}</>}.
                </p>
              )}
              {p.mode === 'wt' && <p>Slide 34: “Effective stress reduces due to rise in water table. Shear strength reduces due to reduction in effective stress. Factor of safety of a shear surface also reduces.”</p>}
            </div>
          </Reveal>
        </>
      )}
    </div>
  )
}

export function ShearLabSections() {
  return (
    <>
      <Section title="Test bench: watch UU, CU and CD run" sub="Pick the apparatus, the test and the soil, set the confining stress and run it. The apparatus, the stress–strain curve, the pore-pressure or volume-change curve and the Mohr circles build together; run a few specimens to get the envelope.">
        <TestBench />
      </Section>
      <Section title="Mohr circle studio" sub="Enter σ1, σ3 (or a stress element), pick a plane: the pole, σ and τ on the plane, the envelope, whether the circle touches, and the failure planes on the element.">
        <MohrStudio />
      </Section>
      <Section title="Test lab: direct shear, CD, CU, UU, unconfined" sub="Enter or 🎲 test data → circles and envelopes (total and effective for CU) → c, φ, failure-plane stresses, Af. Two circles: exact tangent; three or more: p–q least squares.">
        <TestLab />
      </Section>
      <Section title="Strength at a point: the water table rises (AJK Problem 3) or a structure loads it" sub="σ′ = σ − u controls the strength on the slip surface.">
        <WaterTableLab />
      </Section>
    </>
  )
}
