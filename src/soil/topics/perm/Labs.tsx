// Permeability labs: constant / falling-head permeameter with an animated standpipe, layered deposits (both
// directions, with the flow picture), pumping tests (confined / unconfined) and capillary rise.

import { useMark } from '../seep/useMark'
import { useEffect, useRef, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Md, Reveal, Seg } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider, useSeed } from '../../../labs/common'
import { Row, StatusBox } from '../../../labs/playground'
import { NumIn } from '../../../reference/common'
import { capRiseSoil, capRiseTube, constantHead, darcy, fallingHead, headAfter, kBand, layered, porosityFromDry, pumpConfined, pumpUnconfined, scaleFallTime, type KLayer } from '../../engine/permeability'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
export const sci = (v: number, d = 2) => (Number.isFinite(v) ? v.toExponential(d).replace(/e([+-]\d+)/, (_, e) => ` × 10^${+e}`).replace(/\^(-?\d+)/, (_, e) => [...String(e)].map((c) => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)]).join('')) : '—')
export const sciTex = (v: number, d = 2) => (Number.isFinite(v) ? v.toExponential(d).replace(/e([+-]\d+)/, (_, e) => `\\times 10^{${+e}}`) : '—')

// ---------------------------------------------------------------- permeameter
export interface PermState {
  mode: 'const' | 'fall'
  D: number
  L: number
  // constant head
  h: number
  Q: number
  t: number
  // falling head
  d: number
  h1: number
  h2: number
  // optional dry mass for seepage velocity
  Ws: number
  Gs: number
}
export const PERM_DEFAULT: PermState = { mode: 'const', D: 5, L: 15, h: 40, Q: 500, t: 900, d: 0.5, h1: 50, h2: 48, Ws: 486, Gs: 2.65 }

export function randomPerm(seed: number): PermState {
  const r = rng(seed * 811 + 1)
  const mode = pick(r, ['const', 'fall'] as const)
  return {
    mode,
    D: pick(r, [5, 6, 7.5, 10]),
    L: pick(r, [10, 12, 15, 20]),
    h: randInt(r, 20, 80),
    Q: randInt(r, 100, 900),
    t: pick(r, [300, 600, 900, 1200]),
    d: pick(r, [0.4, 0.5, 0.8, 1]),
    h1: randInt(r, 50, 120),
    h2: 0,
    Ws: 0,
    Gs: pick(r, [2.65, 2.67, 2.7]),
  }
}

export function permResults(s: PermState) {
  const A = (Math.PI / 4) * s.D * s.D
  if (s.mode === 'const') {
    const c = constantHead({ Q: s.Q, L: s.L, h: s.h, t: s.t, D: s.D })
    const n = s.Ws > 0 ? porosityFromDry(s.Ws, s.Gs, A * s.L) : NaN
    return { A, k: c.k, i: c.i, v: c.v, n, vs: darcy({ k: c.k, i: c.i, n }).vs }
  }
  const h2 = s.h2 > 0 ? s.h2 : s.h1 * 0.6
  const f = fallingHead({ L: s.L, h1: s.h1, h2, t: s.t, d: s.d, D: s.D })
  return { A, k: f.k, i: NaN, v: NaN, n: NaN, vs: NaN, a: f.a, h2 }
}

function Permeameter({ s, k }: { s: PermState; k: number }) {
  const [time, setTime] = useState(0)
  const [play, setPlay] = useState(false)
  const raf = useRef(0)
  const A = (Math.PI / 4) * s.D * s.D
  const a = (Math.PI / 4) * s.d * s.d
  const T = s.t * 1.5
  useEffect(() => {
    if (!play) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setTime((x) => (x + (dt * T) / 6 > T ? 0 : x + (dt * T) / 6))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [play, T])
  const W = 260
  const H = 280
  const top = 30
  const hMax = s.mode === 'fall' ? s.h1 : s.h + s.L
  const k1 = (H - 70) / (hMax + s.L * 0.4)
  const yBase = H - 30
  const ySoilTop = yBase - s.L * k1
  const head = s.mode === 'fall' ? headAfter({ k, a, A, L: s.L, h1: s.h1, t: time }) : s.h
  const yh = Math.max(top, yBase - head * k1)
  const drops = s.mode === 'const' || play
  return (
    <div className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[280px]" role="img" aria-label="permeameter">
        <rect x={90} y={ySoilTop} width={70} height={s.L * k1} fill="var(--c-soil)" opacity={0.6} stroke="var(--c-ink)" />
        <text x={125} y={(ySoilTop + yBase) / 2 + 4} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
          L = {s.L}
        </text>
        {s.mode === 'fall' ? (
          <g>
            <rect x={110} y={top} width={14} height={ySoilTop - top} fill="none" stroke="var(--c-ink)" />
            <rect x={111} y={yh} width={12} height={Math.max(0, ySoilTop - yh)} fill="var(--c-water)" opacity={0.45} />
            <line x1={100} y1={yBase - s.h1 * k1} x2={134} y2={yBase - s.h1 * k1} stroke="var(--c-mute)" strokeDasharray="3 2" />
            <text x={136} y={yBase - s.h1 * k1 + 3} fontSize={9} fill="var(--c-mute)">
              h1
            </text>
            <line x1={100} y1={yBase - (s.h2 || s.h1 * 0.6) * k1} x2={134} y2={yBase - (s.h2 || s.h1 * 0.6) * k1} stroke="var(--c-mute)" strokeDasharray="3 2" />
            <text x={136} y={yBase - (s.h2 || s.h1 * 0.6) * k1 + 3} fontSize={9} fill="var(--c-mute)">
              h2
            </text>
            <text x={4} y={yh - 3} fontSize={10} fill="var(--c-water)">
              h = {f2(head)}
            </text>
            <line x1={4} y1={yh} x2={110} y2={yh} stroke="var(--c-water)" strokeDasharray="2 2" />
          </g>
        ) : (
          <g>
            <rect x={90} y={yh} width={70} height={Math.max(0, ySoilTop - yh)} fill="var(--c-water)" opacity={0.3} stroke="var(--c-ink)" />
            <path d={`M160,${yh + 4}L185,${yh + 4}L185,${yh + 30}`} stroke="var(--c-water)" fill="none" strokeWidth={2} />
            <text x={4} y={yh - 3} fontSize={10} fill="var(--c-water)">
              constant h = {s.h}
            </text>
          </g>
        )}
        <line x1={70} y1={yBase} x2={180} y2={yBase} stroke="var(--c-ink)" strokeWidth={1.5} />
        <path d={`M125,${yBase}L125,${yBase + 12}L200,${yBase + 12}`} stroke="var(--c-water)" fill="none" strokeWidth={2} />
        {drops &&
          [0, 1, 2].map((i) => (
            <circle key={i} cx={203} r={2.5} fill="var(--c-water)">
              <animate attributeName="cy" values={`${yBase + 14};${H - 4}`} dur="0.9s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        <text x={210} y={H - 6} fontSize={9} fill="var(--c-mute)">
          Q
        </text>
        <text x={4} y={14} fontSize={10} fill="var(--c-mute)">
          {s.mode === 'fall' ? `t = ${f2(time)} s` : `i = h/L = ${f3(s.h / s.L)}`}
        </text>
        <text x={4} y={H - 6} fontSize={9} fill="var(--c-faint)">
          heads in cm above the outflow
        </text>
      </svg>
      {s.mode === 'fall' && (
        <div className="flex items-center gap-2">
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setPlay(!play)}>
            {play ? '❚❚ pause' : '▶ run the test'}
          </button>
          <input type="range" min={0} max={T} step={T / 200} value={time} onChange={(e) => (setPlay(false), setTime(+e.target.value))} className="flex-1 accent-[var(--c-accent)]" />
        </div>
      )}
    </div>
  )
}

export function PermSolution({ s }: { s: PermState }) {
  const R = permResults(s)
  if (s.mode === 'const')
    return (
      <Md>{`$A = \\frac{\\pi}{4}(${s.D})^2 = ${f2(R.A)}$ cm²; $i = h/L = ${s.h}/${s.L} = ${f3(R.i)}$.
$$k = \\frac{QL}{Aht} = \\frac{${s.Q} \\times ${s.L}}{${f2(R.A)} \\times ${s.h} \\times ${s.t}} = ${sciTex(R.k, 3)}\\ \\text{cm/s}$$
Typical of **${kBand(R.k).toLowerCase()}**. Discharge velocity $v = Q/(At) = ki = ${sciTex(R.v, 3)}$ cm/s.${Number.isFinite(R.n) ? `\nVolume of solids $V_s = W_s/G_s = ${s.Ws}/${s.Gs} = ${f2(s.Ws / s.Gs)}$ cm³ of $V = ${f2(R.A * s.L)}$ cm³ → $n = ${f3(R.n)}$; seepage velocity $v_s = v/n = ${sciTex(R.vs, 3)}$ cm/s.` : ''}`}</Md>
    )
  return (
    <Md>{`$a = \\frac{\\pi}{4}(${s.d})^2 = ${f3(R.a!)}$ cm², $A = ${f2(R.A)}$ cm².
$$k = 2.303\\frac{aL}{At}\\log\\frac{h_1}{h_2} = 2.303 \\times \\frac{${f3(R.a!)} \\times ${s.L}}{${f2(R.A)} \\times ${s.t}}\\log\\frac{${s.h1}}{${f2(R.h2!)}} = ${sciTex(R.k, 3)}\\ \\text{cm/s}$$
(${kBand(R.k).toLowerCase()}). Same apparatus: $t \\propto \\ln(h_1/h_2)$, so the time to fall from ${s.h1} to ${f2(s.h1 / 2)} cm is $${s.t}\\ln 2/\\ln(${s.h1}/${f2(R.h2!)}) = ${f2(scaleFallTime(s.t, s.h1, R.h2!, s.h1 / 2))}$ s.`}</Md>
  )
}

export function PermeameterLab() {
  const [s, setS] = useState<PermState>(PERM_DEFAULT)
  const { seed, next } = useSeed(6)
  const R = permResults(s)
  const id = (k: string) => `sm-perm:lab:meter:${hashKey(JSON.stringify(s))}:${k}`
  useMark('w-k', { band: kBand(R.k) })
  const up = (p: Partial<PermState>) => setS({ ...s, ...p })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Seg value={s.mode} onChange={(mode) => up({ mode })} items={[{ v: 'const', label: 'Constant head' }, { v: 'fall', label: 'Falling head' }]} />
        <button className="btn !py-1 !px-3" onClick={() => setS(PERM_DEFAULT)}>
          2012-13 Q10(c)
        </button>
        <button className="btn !py-1 !px-3" onClick={() => setS({ ...PERM_DEFAULT, mode: 'fall', h1: 50, h2: 48, t: 300, d: 0.5, D: 7.5, L: 12 })}>
          2011-12 Q6(c)
        </button>
        <button className="btn !py-1 !px-3" onClick={() => (next(), setS(randomPerm(seed + 1)))}>
          🎲 New test
        </button>
      </div>
      <div className="grid cq-md:grid-cols-[17rem_minmax(0,1fr)] gap-4">
        <Permeameter s={{ ...s, h2: R.h2 ?? s.h2 }} k={R.k} />
        <div className="space-y-2">
          <div className="card p-3 flex flex-wrap gap-2">
            <NumIn label="sample D" value={s.D} onChange={(D) => up({ D })} step={0.5} unit="cm" w="w-14" />
            <NumIn label="L" value={s.L} onChange={(L) => up({ L })} step={1} unit="cm" w="w-14" />
            {s.mode === 'const' ? (
              <>
                <NumIn label="h" value={s.h} onChange={(h) => up({ h })} step={1} unit="cm" w="w-14" />
                <NumIn label="Q" value={s.Q} onChange={(Q) => up({ Q })} step={10} unit="cm³" w="w-16" />
                <NumIn label="t" value={s.t} onChange={(t) => up({ t })} step={60} unit="s" w="w-16" />
                <NumIn label="dry mass" value={s.Ws} onChange={(Ws) => up({ Ws: Number.isFinite(Ws) ? Ws : 0 })} step={1} unit="g (0 = none)" w="w-16" />
                <NumIn label="Gs" value={s.Gs} onChange={(Gs) => up({ Gs })} step={0.01} w="w-14" />
              </>
            ) : (
              <>
                <NumIn label="standpipe d" value={s.d} onChange={(d) => up({ d })} step={0.1} unit="cm" w="w-14" />
                <NumIn label="h1" value={s.h1} onChange={(h1) => up({ h1 })} step={1} unit="cm" w="w-14" />
                <NumIn label="h2" value={+(R.h2 ?? s.h2).toFixed(2)} onChange={(h2) => up({ h2 })} step={1} unit="cm" w="w-14" />
                <NumIn label="t" value={s.t} onChange={(t) => up({ t })} step={60} unit="s" w="w-16" />
              </>
            )}
          </div>
          <StatusBox c="var(--c-accent)" t={`k = ${sci(R.k, 3)} cm/s`} d={`${kBand(R.k)} · ${sci(R.k / 100, 2)} m/s · ${f3((R.k / 100) * 86400)} m/day`} />
          <div className="card p-3 space-y-1">
            <Answer id={id('k')} label="k (cm/s)" value={R.k} tol={0.02} digits={6} />
            {s.mode === 'const' && <Answer id={id('v')} label="discharge velocity (cm/s)" value={R.v} tol={0.02} digits={5} />}
            {s.mode === 'const' && Number.isFinite(R.vs) && <Answer id={id('vs')} label="seepage velocity (cm/s)" value={R.vs} tol={0.02} digits={5} />}
            {s.mode === 'fall' && <Answer id={id('t2')} label={`time to fall from ${s.h1} to ${f2(s.h1 / 2)} cm (s)`} value={scaleFallTime(s.t, s.h1, R.h2!, s.h1 / 2)} />}
          </div>
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <PermSolution s={{ ...s, h2: R.h2 ?? s.h2 }} />
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- layered deposits
export function LayersFig({ ls, dir }: { ls: KLayer[]; dir: 'h' | 'v' }) {
  const L = layered(ls)
  const W = 420
  const H = 200
  const k = (H - 30) / L.H
  let z = 15
  const kmax = Math.max(...ls.map((l) => l.k))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[460px]" role="img" aria-label="layered deposit">
      {ls.map((l, i) => {
        const y = z
        z += l.H * k
        const share = dir === 'h' ? L.qShare[i] : L.hShare[i]
        return (
          <g key={i}>
            <rect x={40} y={y} width={240} height={l.H * k} fill="var(--c-soil)" opacity={0.25 + 0.5 * (1 - Math.log10(kmax / l.k + 1) / 4)} stroke="var(--c-ink)" />
            <text x={46} y={y + 13} fontSize={10} fill="var(--c-ink)">
              H{i + 1} = {fmt(l.H, 2)}, k{i + 1} = {sci(l.k, 1)}
            </text>
            {dir === 'h' ? (
              <path d={`M50,${y + (l.H * k) / 2 + 5}l${Math.max(8, 220 * share)},0m-6,-4l6,4l-6,4`} stroke="var(--c-water)" strokeWidth={2 + 6 * share} fill="none" />
            ) : null}
            <text x={290} y={y + (l.H * k) / 2 + 4} fontSize={10} fill="var(--c-mute)">
              {dir === 'h' ? `${f2(share * 100)} % of q` : `${f2(share * 100)} % of head lost`}
            </text>
          </g>
        )
      })}
      {dir === 'v' && [100, 160, 220].map((x) => <path key={x} d={`M${x},12l0,${H - 30}m-4,-6l4,6l4,-6`} stroke="var(--c-water)" strokeWidth={1.8} fill="none" />)}
    </svg>
  )
}

export function LayeredSolution({ ls, h, A }: { ls: KLayer[]; h?: number; A?: number }) {
  const L = layered(ls)
  const q = h !== undefined && A !== undefined ? L.kv * (h / L.H) * A : NaN
  return (
    <Md>{`$H = ${ls.map((l) => fmt(l.H, 2)).join(' + ')} = ${fmt(L.H, 2)}$.
$$k_{h,eq} = \\frac{\\sum k_iH_i}{H} = \\frac{${ls.map((l) => `${sciTex(l.k, 1)}(${fmt(l.H, 2)})`).join(' + ')}}{${fmt(L.H, 2)}} = ${sciTex(L.kh, 3)}$$
$$k_{v,eq} = \\frac{H}{\\sum H_i/k_i} = \\frac{${fmt(L.H, 2)}}{${ls.map((l) => `${fmt(l.H, 2)}/${sciTex(l.k, 1)}`).join(' + ')}} = ${sciTex(L.kv, 3)}$$
$k_h/k_v = ${f2(L.ratio)}$: flow along the layers is controlled by the most permeable layer, flow across them by the least permeable.${Number.isFinite(q) ? `\nVertical flow under head ${h} over ${fmt(L.H, 2)}: $i = ${f3(h! / L.H)}$, $q = k_viA = ${sciTex(L.kv, 3)} \\times ${f3(h! / L.H)} \\times ${f2(A!)} = ${sciTex(q, 3)}$ per unit time; head lost in each layer: ${ls.map((_, i) => `${f3(L.hShare[i] * h!)}`).join(', ')}.` : ''}`}</Md>
  )
}

export function LayeredLab() {
  const [ls, setLs] = useState<KLayer[]>([
    { H: 5, k: 3e-4 },
    { H: 5, k: 4e-4 },
    { H: 5, k: 6e-4 },
  ])
  const [dir, setDir] = useState<'h' | 'v'>('v')
  const [h, setH] = useState(30)
  const [D, setD] = useState(6)
  const [t, setT] = useState(300)
  const L = layered(ls)
  const A = (Math.PI / 4) * D * D
  const q = L.kv * (h / L.H) * A
  const id = (k: string) => `sm-perm:lab:layers:${hashKey(JSON.stringify([ls, h, D, t]))}:${k}`
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Seg value={dir} onChange={setDir} items={[{ v: 'v', label: '↓ across the layers' }, { v: 'h', label: '→ along the layers' }]} />
        <button className="btn !py-1 !px-3" onClick={() => (setLs([{ H: 5, k: 3e-4 }, { H: 5, k: 4e-4 }, { H: 5, k: 6e-4 }]), setH(30), setD(6), setT(300), setDir('v'))}>
          2020-21 Q2(a)
        </button>
        <button className="btn !py-1 !px-3" onClick={() => setLs([{ H: 3, k: 1e-4 }, { H: 4, k: 3.2e-2 }, { H: 6, k: 4.1e-5 }])}>
          Das 5.20
        </button>
        {ls.length < 5 && (
          <button className="btn !py-1 !px-3" onClick={() => setLs([...ls, { H: 2, k: 1e-5 }])}>
            + layer
          </button>
        )}
      </div>
      <div className="grid cq-md:grid-cols-[minmax(0,1fr)_16rem] gap-4">
        <LayersFig ls={ls} dir={dir} />
        <div className="card p-3 space-y-1">
          {ls.map((l, i) => (
            <div key={i} className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold">{i + 1}</span>
              <NumIn label="H" value={l.H} onChange={(H) => Number.isFinite(H) && H > 0 && setLs(ls.map((x, j) => (j === i ? { ...x, H } : x)))} step={0.5} w="w-14" />
              <NumIn label="k" value={l.k} onChange={(k) => Number.isFinite(k) && k > 0 && setLs(ls.map((x, j) => (j === i ? { ...x, k } : x)))} step={0.0001} w="w-20" />
              {ls.length > 2 && (
                <button className="text-xs text-faint hover:text-bad" onClick={() => setLs(ls.filter((_, j) => j !== i))}>
                  ×
                </button>
              )}
            </div>
          ))}
          <Row k="kh,eq" v={sci(L.kh, 3)} strong={dir === 'h'} />
          <Row k="kv,eq" v={sci(L.kv, 3)} strong={dir === 'v'} />
          <Row k="kh/kv" v={f2(L.ratio)} />
        </div>
      </div>
      {dir === 'v' && (
        <div className="card p-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">Permeameter pipe:</span>
          <NumIn label="head lost" value={h} onChange={(v) => Number.isFinite(v) && setH(v)} step={1} unit="(same unit as H)" w="w-14" />
          <NumIn label="pipe D" value={D} onChange={(v) => Number.isFinite(v) && setD(v)} step={0.5} w="w-14" />
          <NumIn label="time" value={t} onChange={(v) => Number.isFinite(v) && setT(v)} step={60} unit="s" w="w-16" />
          <span className="num">
            q = {sci(q, 3)} · volume in {t} s = <b>{f3(q * t)}</b>
          </span>
        </div>
      )}
      <div className="card p-3 space-y-1">
        <Answer id={id('kh')} label="kh,eq" value={L.kh} tol={0.02} digits={7} />
        <Answer id={id('kv')} label="kv,eq" value={L.kv} tol={0.02} digits={7} />
        {dir === 'v' && <Answer id={id('Q')} label={`volume through in ${t} s`} value={q * t} tol={0.02} digits={4} />}
      </div>
      <p className="text-xs text-faint">2020-21 Q2(a): water kept at the top of the 30 cm pipe and free outflow at the screen: 30 cm of head is lost across 15 cm of sand (i = 2), as the handnote reads it.</p>
      <Reveal id={id('sol')} title="Full solution">
        <LayeredSolution ls={ls} h={dir === 'v' ? h : undefined} A={dir === 'v' ? A : undefined} />
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- pumping test
export interface PumpState {
  kind: 'unconf' | 'conf'
  q: number
  r1: number
  r2: number
  h1: number
  h2: number
  T: number
}
export const PUMP_DEFAULT: PumpState = { kind: 'unconf', q: 0.02, r1: 15, r2: 60, h1: 5.5, h2: 6.2, T: 4 }
export const pumpK = (s: PumpState) => (s.kind === 'unconf' ? pumpUnconfined(s) : pumpConfined(s))

export function PumpFig({ s, k }: { s: PumpState; k: number }) {
  const W = 460
  const H = 200
  const R = s.r2 * 1.6
  const top = Math.max(s.h2, s.kind === 'conf' ? s.T : 0) * 1.35
  const X = (r: number) => 230 + (r / R) * 220
  const Xl = (r: number) => 230 - (r / R) * 220
  const Y = (h: number) => H - 20 - (h / top) * (H - 40)
  const rw = s.r1 * 0.15
  const hAt = (r: number) => (s.kind === 'unconf' ? Math.sqrt(Math.max(0, s.h1 * s.h1 + (s.q / (Math.PI * k)) * Math.log(r / s.r1))) : s.h1 + (s.q / (2 * Math.PI * k * s.T)) * Math.log(r / s.r1))
  const rs = Array.from({ length: 50 }, (_, i) => rw + ((R - rw) * i) / 49)
  const curve = (side: 1 | -1) => rs.map((r, i) => `${i ? 'L' : 'M'}${(side > 0 ? X(r) : Xl(r)).toFixed(1)},${Y(hAt(r)).toFixed(1)}`).join('')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[480px]" role="img" aria-label="pumping test">
      {s.kind === 'conf' ? (
        <>
          <rect x={10} y={Y(s.T)} width={W - 20} height={Y(0) - Y(s.T)} fill="var(--c-soil)" opacity={0.45} />
          <rect x={10} y={Y(s.T) - 14} width={W - 20} height={14} fill="var(--c-mute)" opacity={0.35} />
          <text x={16} y={Y(s.T) - 4} fontSize={9.5} fill="var(--c-ink)">
            impermeable
          </text>
          <text x={16} y={Y(s.T / 2)} fontSize={9.5} fill="var(--c-ink)">
            confined aquifer T = {s.T}
          </text>
        </>
      ) : (
        <rect x={10} y={Y(top * 0.95)} width={W - 20} height={Y(0) - Y(top * 0.95)} fill="var(--c-soil)" opacity={0.35} />
      )}
      <line x1={10} y1={Y(0)} x2={W - 10} y2={Y(0)} stroke="var(--c-ink)" strokeWidth={1.5} />
      <path d={curve(1)} fill="none" stroke="var(--c-water)" strokeWidth={2} />
      <path d={curve(-1)} fill="none" stroke="var(--c-water)" strokeWidth={2} />
      <rect x={X(0) - 5} y={Y(top * 0.95)} width={10} height={Y(0) - Y(top * 0.95)} fill="var(--c-bg)" stroke="var(--c-ink)" />
      <text x={X(0)} y={Y(top * 0.95) - 3} fontSize={9.5} textAnchor="middle" fill="var(--c-ink)">
        well, q = {s.q}
      </text>
      {[
        { r: s.r1, h: s.h1, n: '1' },
        { r: s.r2, h: s.h2, n: '2' },
      ].map((o) => (
        <g key={o.n}>
          <line x1={X(o.r)} y1={Y(0)} x2={X(o.r)} y2={Y(top * 0.9)} stroke="var(--c-ink)" strokeWidth={0.8} />
          <circle cx={X(o.r)} cy={Y(o.h)} r={3} fill="var(--c-water)" />
          <text x={X(o.r) + 3} y={Y(o.h) - 5} fontSize={9.5} fill="var(--c-ink)">
            h{o.n} = {o.h} at r{o.n} = {o.r}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function PumpLab() {
  const [s, setS] = useState<PumpState>(PUMP_DEFAULT)
  const k = pumpK(s)
  const id = (x: string) => `sm-perm:lab:pump:${hashKey(JSON.stringify(s))}:${x}`
  const up = (p: Partial<PumpState>) => setS({ ...s, ...p })
  return (
    <div className="space-y-3">
      <Seg value={s.kind} onChange={(kind) => up({ kind })} items={[{ v: 'unconf', label: 'Unconfined (water table)' }, { v: 'conf', label: 'Confined aquifer' }]} />
      <div className="grid cq-md:grid-cols-[minmax(0,1fr)_16rem] gap-4">
        <PumpFig s={s} k={k} />
        <div className="card p-3 space-y-1">
          <Slider label="q (m³/s)" value={s.q} min={0.002} max={0.1} step={0.001} onChange={(q) => up({ q })} />
          <Slider label="r1 (m)" value={s.r1} min={2} max={s.r2 - 2} step={0.5} onChange={(r1) => up({ r1 })} />
          <Slider label="r2 (m)" value={s.r2} min={s.r1 + 2} max={150} step={1} onChange={(r2) => up({ r2 })} />
          <Slider label="h1 (m)" value={s.h1} min={0.5} max={s.h2 - 0.05} step={0.05} onChange={(h1) => up({ h1 })} />
          <Slider label="h2 (m)" value={s.h2} min={s.h1 + 0.05} max={30} step={0.05} onChange={(h2) => up({ h2 })} />
          {s.kind === 'conf' && <Slider label="T (m)" value={s.T} min={1} max={30} step={0.5} onChange={(T) => up({ T })} />}
        </div>
      </div>
      <StatusBox c="var(--c-accent)" t={`k = ${sci(k, 3)} m/s = ${sci(k * 100, 3)} cm/s`} d={kBand(k * 100)} />
      <Answer id={id('k')} label="k (m/s)" value={k} tol={0.02} digits={7} />
      <Reveal id={id('sol')} title="Full solution">
        <Md>{s.kind === 'unconf' ? `Unconfined: through a cylinder of radius r and height h, $q = k\\frac{dh}{dr}2\\pi rh$ → $\\int_{r_1}^{r_2}\\frac{dr}{r} = \\frac{2\\pi k}{q}\\int_{h_1}^{h_2}h\\,dh$ →
$$k = \\frac{q\\ln(r_2/r_1)}{\\pi(h_2^2 - h_1^2)} = \\frac{${s.q}\\ln(${s.r2}/${s.r1})}{\\pi(${s.h2}^2 - ${s.h1}^2)} = ${sciTex(k, 3)}\\ \\text{m/s}$$` : `Confined (thickness T): $q = k\\frac{dh}{dr}2\\pi rT$ →
$$k = \\frac{q\\ln(r_2/r_1)}{2\\pi T(h_2 - h_1)} = \\frac{${s.q}\\ln(${s.r2}/${s.r1})}{2\\pi(${s.T})(${s.h2} - ${s.h1})} = ${sciTex(k, 3)}\\ \\text{m/s}$$`}</Md>
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- capillary rise
export function CapLab() {
  const [d, setD] = useState(0.02)
  const [e, setE] = useState(0.6)
  const [D10, setD10] = useState(0.02)
  const [C, setC] = useState(0.3)
  const ht = capRiseTube(d / 1000)
  const hs = capRiseSoil(e, D10 / 10, C) / 100
  useMark('w-cap', { soil: hs > 7.5 ? 'Clay' : hs > 1.2 ? 'Silt' : hs > 0.15 ? 'Fine sand' : 'Coarse sand' })
  const id = (x: string) => `sm-perm:lab:cap:${hashKey(JSON.stringify([d, e, D10, C]))}:${x}`
  const tubes = [d * 4, d * 2, d]
  const hmax = Math.max(...tubes.map((x) => capRiseTube(x / 1000)))
  return (
    <div className="space-y-3">
      <div className="grid cq-md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <svg viewBox="0 0 260 200" className="w-full max-w-[300px]" role="img" aria-label="capillary tubes">
            <rect x={10} y={160} width={240} height={30} fill="var(--c-water)" opacity={0.25} />
            {tubes.map((x, i) => {
              const h = capRiseTube(x / 1000)
              const top = 160 - (h / hmax) * 140
              const w = 8 + 6 * (2 - i)
              const cx = 60 + i * 70
              return (
                <g key={i}>
                  <rect x={cx - w / 2} y={15} width={w} height={170} fill="none" stroke="var(--c-ink)" />
                  <rect x={cx - w / 2 + 1} y={top} width={w - 2} height={175 - top} fill="var(--c-water)" opacity={0.45} />
                  <path d={`M${cx - w / 2 + 1},${top}Q${cx},${top + 6} ${cx + w / 2 - 1},${top}`} fill="none" stroke="var(--c-water)" />
                  <text x={cx} y={top - 4} fontSize={9.5} textAnchor="middle" fill="var(--c-ink)">
                    {f3(h)} m
                  </text>
                  <text x={cx} y={198} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
                    d = {fmt(x, 3)} mm
                  </text>
                </g>
              )
            })}
          </svg>
          <Slider label="tube d (mm)" value={d} min={0.002} max={0.5} step={0.001} onChange={setD} />
          <Row k="hc = 4σcosθ/(dγw)" v={`${f3(ht)} m`} strong />
        </div>
        <div className="space-y-2">
          <div className="card p-3 space-y-1">
            <Slider label="void ratio e" value={e} min={0.3} max={1.5} step={0.01} onChange={setE} />
            <Slider label="D10 (mm)" value={D10} min={0.001} max={1} step={0.001} onChange={setD10} />
            <Slider label="C (cm²)" value={C} min={0.1} max={0.5} step={0.05} onChange={setC} />
            <Row k="soil hc = C/(eD10)" v={`${f2(hs)} m`} strong />
            <Row k="suction at the top" v={`${f2(-hs * 9.81)} kPa`} />
          </div>
          <Answer id={id('t')} label="tube rise (m)" value={ht} />
          <Answer id={id('s')} label="soil rise (m)" value={hs} />
        </div>
      </div>
      <p className="text-xs text-faint">σ = 0.0728 N/m (20 °C), θ = 0. In the capillary zone the soil is saturated and u = −(height above WT)γw, so σ′ there is larger than σ.</p>
    </div>
  )
}
