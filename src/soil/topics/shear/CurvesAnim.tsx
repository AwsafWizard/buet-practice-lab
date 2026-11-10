// Animated qualitative curves for the shear theory card (t-curves):
//   (i)  CU triaxial: pore pressure vs axial strain for NC, lightly OC and heavily OC clay
//   (ii) drained: volume change vs strain / shear displacement for loose and dense sand
// One colour language across both: warm (load) = wants to contract, purple = in between,
// teal (shear) = wants to dilate. Water is always var(--c-water).
import { useEffect, useRef, useState, type ReactNode } from 'react'

const C_CONTRACT = 'var(--c-load)'
const C_MID = 'var(--c-moment)'
const C_DILATE = 'var(--c-shear)'

const RUN = 7 // seconds for one sweep 0 → 1
const HOLD = 1.6 // seconds paused at the end before looping

/** shared clock: p in [0, 1]; plays while on screen, respects reduced motion */
function useStrainClock() {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [p, setP] = useState(reduced ? 1 : 0)
  const [play, setPlay] = useState(!reduced)
  const [visible, setVisible] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const hold = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!play || !visible) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      setP((x) => {
        if (x >= 1) {
          hold.current += dt
          if (hold.current < HOLD) return 1
          hold.current = 0
          return 0
        }
        return Math.min(1, x + dt / RUN)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [play, visible])

  return { p, setP, play, setPlay, ref }
}

function Controls({ clock, readout }: { clock: ReturnType<typeof useStrainClock>; readout: string }) {
  const { p, setP, play, setPlay } = clock
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button className="btn !py-0.5 !px-2.5 !text-xs" onClick={() => (p >= 1 && !play && setP(0), setPlay(!play))} aria-label={play ? 'Pause' : 'Play'}>
        {play ? '❚❚ Pause' : '▶ Play'}
      </button>
      <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => (setP(0), setPlay(true))} title="Restart">
        ↺
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.002}
        value={p}
        onChange={(e) => (setPlay(false), setP(+e.target.value))}
        className="flex-1 min-w-[120px] accent-[var(--c-accent)]"
        aria-label="Strain"
      />
      <span className="font-mono text-mute tabular-nums whitespace-nowrap sm:w-[10rem] text-right">{readout}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ curves */

const nc = (u: number) => 0.85 * (1 - Math.exp(-4 * u))
const loc = (u: number) => 0.45 * (1 - Math.exp(-7 * u)) - 0.25 * u
const hoc = (u: number) => 0.35 * (1 - Math.exp(-15 * u)) - 0.75 * (1 - Math.exp(-3 * u))
const loose = (u: number) => -0.7 * (1 - Math.exp(-5 * u))
const dense = (u: number) => -0.45 * (1 - Math.exp(-22 * u)) + 0.95 * (1 - Math.exp(-5 * u))
const slope = (f: (u: number) => number, u: number) => (f(Math.min(1, u + 0.01)) - f(Math.max(0, u - 0.01))) / (Math.min(1, u + 0.01) - Math.max(0, u - 0.01))

/** first u where f crosses zero going down (after its small positive start) */
function zeroDown(f: (u: number) => number) {
  for (let u = 0.02; u <= 1; u += 0.001) if (f(u) < 0 && f(u - 0.001) >= 0) return u
  return 1
}
const HOC_PEAK = 0.0706
const HOC_ZERO = zeroDown(hoc)
/** where the dense curve bottoms out, and where it dilates fastest (peak shear stress) */
const argBest = (score: (u: number) => number) => {
  let best = 0,
    bu = 0
  for (let u = 0.005; u < 0.6; u += 0.001) if (score(u) > best) (best = score(u)), (bu = u)
  return bu
}
const DENSE_DIP = argBest((u) => -dense(u))
const DENSE_STEEP = argBest((u) => slope(dense, u))
const FLOW_MIN = 0.12 // |dεv/du| below this reads as constant volume

interface CurveSpec {
  f: (u: number) => number
  color: string
  label: string
  /** label anchor in data units, shown once p passes `from` */
  at: [number, number]
  from?: number
}

function Plot({
  p,
  curves,
  yl,
  xl,
  ymin,
  ymax,
  posLbl,
  negLbl,
  children,
}: {
  p: number
  curves: CurveSpec[]
  yl: string
  xl: string
  ymin: number
  ymax: number
  posLbl: string
  negLbl: string
  children?: (X: (u: number) => number, Y: (v: number) => number) => ReactNode
}) {
  const W = 340,
    H = 230,
    L = 30,
    R = 10,
    T = 12,
    B = 24
  const X = (u: number) => L + u * (W - L - R)
  const Y = (v: number) => T + ((ymax - v) / (ymax - ymin)) * (H - T - B)
  const n = 140
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={yl + ' vs ' + xl}>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={X(g)} x2={X(g)} y1={T} y2={H - B} stroke="var(--c-line)" strokeWidth={0.6} />
      ))}
      <line x1={L} x2={W - R} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" strokeWidth={1} />
      <line x1={L} x2={L} y1={T} y2={H - B} stroke="var(--c-ink)" strokeWidth={1} />
      <text x={L - 4} y={Y(0) + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
        0
      </text>
      <text x={L + 4} y={T + 9} fontSize={9} fill="var(--c-mute)">
        {posLbl}
      </text>
      <text x={L + 4} y={H - B - 4} fontSize={9} fill="var(--c-mute)">
        {negLbl}
      </text>
      <text x={W - R} y={H - 6} fontSize={9.5} textAnchor="end" fill="var(--c-mute)">
        {xl}
      </text>
      <text x={11} y={(T + H - B) / 2} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)" transform={`rotate(-90 11 ${(T + H - B) / 2})`}>
        {yl}
      </text>
      {/* cursor */}
      <line x1={X(p)} x2={X(p)} y1={T} y2={H - B} stroke="var(--c-faint)" strokeDasharray="2 3" strokeWidth={0.8} />
      {children?.(X, Y)}
      {curves.map((c) => {
        const k = Math.max(1, Math.round(n * p))
        const pts = Array.from({ length: k + 1 }, (_, i) => {
          const u = (i / k) * p
          return `${X(u).toFixed(1)},${Y(c.f(u)).toFixed(1)}`
        }).join(' ')
        return (
          <g key={c.label}>
            {p > 0.002 && <polyline points={pts} fill="none" stroke={c.color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />}
            <circle cx={X(p)} cy={Y(c.f(p))} r={3.6} fill={c.color} stroke="var(--c-panel)" strokeWidth={1.2} />
            <text
              x={X(c.at[0])}
              y={Y(c.at[1])}
              fontSize={10}
              fontWeight={700}
              fill={c.color}
              textAnchor="end"
              opacity={Math.min(1, Math.max(0, (p - (c.from ?? 0.45)) / 0.12))}
            >
              {c.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** a note that fades in once p passes `at` */
const fade = (p: number, at: number) => Math.min(1, Math.max(0, (p - at) / 0.06))

function Note({ x, y, t, c = 'var(--c-ink)', o, anchor = 'start' }: { x: number; y: number; t: string; c?: string; o: number; anchor?: 'start' | 'middle' | 'end' }) {
  if (o <= 0) return null
  return (
    <text x={x} y={y} fontSize={9} fill={c} opacity={o} textAnchor={anchor}>
      {t}
    </text>
  )
}

function Caption({ tag, children }: { tag: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-panel2/60 px-3 py-2 text-xs leading-relaxed min-h-[3.4rem]">
      <span className="mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-current text-accent">{tag}</span>
      {children}
    </div>
  )
}

const Warm = ({ children }: { children: ReactNode }) => <b style={{ color: C_CONTRACT }}>{children}</b>
const Mid = ({ children }: { children: ReactNode }) => <b style={{ color: C_MID }}>{children}</b>
const Cool = ({ children }: { children: ReactNode }) => <b style={{ color: C_DILATE }}>{children}</b>
const Wat = ({ children }: { children: ReactNode }) => <b style={{ color: 'var(--c-water)' }}>{children}</b>

/* -------------------------------------------------------- (i) CU specimens */

/** one triaxial specimen: ram, barrelling specimen (constant volume), closed drain valve, Δu gauge */
function CuSpecimen({ cx, p, du, rate, color, name }: { cx: number; p: number; du: number; rate: number; color: string; name: string }) {
  const H0 = 104,
    W0 = 36,
    base = 178
  const eps = 0.16 * p // drawn axial strain (exaggerated)
  const Hs = H0 * (1 - eps)
  const bulge = W0 * (Math.sqrt(1 / (1 - eps)) - 1) * 1.6 // undrained: volume stays, so it barrels
  const top = base - Hs
  const x0 = cx - 14 - W0 / 2,
    x1 = cx - 14 + W0 / 2
  const tint = du >= 0 ? C_CONTRACT : C_DILATE
  const gx = cx + 27
  const g0 = 112 // gauge zero
  const gk = 52 // gauge px per unit Δu
  const status = Math.abs(rate) < 0.08 ? 'Δu steady' : rate > 0 ? 'Δu rising ↑' : 'Δu falling ↓'
  return (
    <g>
      <text x={cx} y={12} fontSize={10.5} fontWeight={700} textAnchor="middle" fill={color}>
        {name}
      </text>
      {/* ram and load arrow */}
      <rect x={cx - 17} y={22} width={6} height={top - 26} fill="var(--c-steel)" />
      <rect x={x0 - 3} y={top - 5} width={W0 + 6} height={5} fill="var(--c-steel)" />
      <text x={cx - 22} y={34} fontSize={9} textAnchor="end" fill="var(--c-mute)">
        Δσ₁↓
      </text>
      {/* specimen: membrane barrels, pore water tinted by Δu */}
      <path
        d={`M${x0},${top} Q${x0 - bulge * 2},${(top + base) / 2} ${x0},${base} L${x1},${base} Q${x1 + bulge * 2},${(top + base) / 2} ${x1},${top} Z`}
        fill="var(--c-soil)"
        stroke="var(--c-ink)"
        strokeWidth={1}
      />
      <path
        d={`M${x0},${top} Q${x0 - bulge * 2},${(top + base) / 2} ${x0},${base} L${x1},${base} Q${x1 + bulge * 2},${(top + base) / 2} ${x1},${top} Z`}
        fill={tint}
        opacity={Math.min(0.75, Math.abs(du) * 0.85)}
      />
      {/* grains */}
      {Array.from({ length: 12 }, (_, i) => {
        const r = i % 3,
          q = Math.floor(i / 3)
        const gy = top + ((q + 0.5) / 4) * Hs
        const gxx = x0 + ((r + 0.5 + (q % 2) * 0.25) / 3.25) * W0
        return <circle key={i} cx={gxx} cy={gy} r={3.4} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth={0.6} opacity={0.8} />
      })}
      {/* pedestal, drain, closed valve */}
      <rect x={x0 - 4} y={base} width={W0 + 8} height={6} fill="var(--c-steel)" />
      <path d={`M${cx - 14},${base + 6} L${cx - 14},${base + 16} L${cx + 6},${base + 16}`} fill="none" stroke="var(--c-water)" strokeWidth={2} />
      <path d={`M${cx + 6},${base + 11} l8,5 l-8,5 Z M${cx + 22},${base + 11} l-8,5 l8,5 Z`} fill="var(--c-bad)" />
      <text x={cx + 14} y={base + 32} fontSize={8} textAnchor="middle" fill="var(--c-bad)">
        valve closed
      </text>
      {/* Δu gauge */}
      <rect x={gx - 4} y={g0 - gk} width={8} height={gk * 2} rx={3} fill="none" stroke="var(--c-line)" />
      <rect x={gx - 3} y={du >= 0 ? g0 - du * gk : g0} width={6} height={Math.abs(du) * gk} rx={2} fill={tint} />
      <line x1={gx - 7} x2={gx + 7} y1={g0} y2={g0} stroke="var(--c-ink)" strokeWidth={1} />
      <text x={gx} y={g0 - gk - 4} fontSize={8} textAnchor="middle" fill="var(--c-mute)">
        +Δu
      </text>
      <text x={gx} y={g0 + gk + 10} fontSize={8} textAnchor="middle" fill="var(--c-mute)">
        −Δu
      </text>
      <text x={cx} y={base + 44} fontSize={8.5} textAnchor="middle" fill={color}>
        {p < 0.003 ? 'Δu = 0' : status}
      </text>
    </g>
  )
}

export function CuPorePressureAnim() {
  const clock = useStrainClock()
  const { p } = clock
  const soils = [
    { f: nc, c: C_CONTRACT, n: 'NC clay' },
    { f: loc, c: C_MID, n: 'Lightly OC' },
    { f: hoc, c: C_DILATE, n: 'Heavily OC' },
  ]
  const phase = p < 0.06 ? 0 : p < HOC_ZERO ? 1 : p < 0.55 ? 2 : 3
  return (
    <div ref={clock.ref} className="space-y-2">
      <div className="text-xs font-semibold">(i) CU triaxial — pore pressure Δu vs axial strain ε (drainage valve closed, so the volume cannot change)</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1.15fr] items-center">
        <svg viewBox="0 0 300 228" className="w-full" role="img" aria-label="Three CU specimens">
          {soils.map((s, i) => (
            <CuSpecimen key={s.n} cx={50 + i * 100} p={p} du={s.f(p)} rate={slope(s.f, p)} color={s.c} name={s.n} />
          ))}
        </svg>
        <Plot
          p={p}
          yl="Pore pressure Δu"
          xl="axial strain ε →"
          ymin={-0.55}
          ymax={0.95}
          posLbl="+ (water pushed)"
          negLbl="− (suction)"
          curves={[
            { f: nc, color: C_CONTRACT, label: 'NC: large +Δu', at: [0.98, 0.9] },
            { f: loc, color: C_MID, label: 'lightly OC: smaller + peak', at: [0.98, 0.29], from: 0.5 },
            { f: hoc, color: C_DILATE, label: 'heavily OC: −Δu', at: [0.98, -0.47], from: 0.55 },
          ]}
        >
          {(X, Y) => (
            <>
              <circle cx={X(HOC_PEAK)} cy={Y(hoc(HOC_PEAK))} r={4.5} fill="none" stroke={C_DILATE} strokeWidth={1.2} opacity={fade(p, 0.1)} />
              <line x1={X(HOC_PEAK)} x2={X(HOC_PEAK)} y1={Y(hoc(HOC_PEAK)) + 5} y2={Y(-0.33)} stroke={C_DILATE} strokeWidth={0.7} strokeDasharray="2 2" opacity={fade(p, 0.1)} />
              <Note x={X(HOC_PEAK) - 4} y={Y(-0.41)} t="small + rise first (initial compression)" c={C_DILATE} o={fade(p, 0.1)} />
              <circle cx={X(HOC_ZERO)} cy={Y(0)} r={3} fill={C_DILATE} opacity={fade(p, HOC_ZERO + 0.02)} />
              <Note x={X(HOC_ZERO) + 5} y={Y(0) - 5} t="crosses zero → suction (dilation pulls on the water)" c={C_DILATE} o={fade(p, HOC_ZERO + 0.02)} />
              <Note x={X(0.5)} y={Y(0.6)} t="NC levels off at failure" c={C_CONTRACT} o={fade(p, 0.7)} anchor="middle" />
            </>
          )}
        </Plot>
      </div>
      <Controls clock={clock} readout={`ε ≈ ${(p * 15).toFixed(1)} % (qualitative)`} />
      <Caption tag={['start', 'shearing', 'past zero', 'at failure'][phase]}>
        {phase === 0 && (
          <>
            Shearing starts. Every specimen is squeezed a little at first, so Δu goes <b>up</b> in all three, even the <Cool>heavily OC</Cool> one. The valve is closed, so the
            soil cannot change volume: any urge to change volume shows up as pore pressure instead.
          </>
        )}
        {phase === 1 && (
          <>
            <Warm>NC clay</Warm> wants to contract, but the <Wat>water</Wat> is trapped and nearly incompressible, so the water carries the push: Δu keeps climbing.{' '}
            <Cool>Heavily OC</Cool> clay is already starting to dilate, so its Δu turns down.
          </>
        )}
        {phase === 2 && (
          <>
            <Cool>Heavily OC</Cool> clay wants to expand, but the water cannot flow in, so the water is put in tension: Δu becomes <b>negative</b> (suction). <Mid>Lightly OC</Mid> peaks
            and eases off a little but stays positive.
          </>
        )}
        {phase === 3 && (
          <>
            At failure: <Warm>NC</Warm> large +Δu, so σ′ = σ − u falls (weaker undrained); <Mid>lightly OC</Mid> a smaller positive value; <Cool>heavily OC</Cool> negative Δu, so σ′
            rises (stronger in the short term, until the suction dissipates).
          </>
        )}
      </Caption>
    </div>
  )
}

/* ------------------------------------------------- (ii) drained shear boxes */

function Grains({ x, y, w, h, rows, cols, r, hex, color, shift }: { x: number; y: number; w: number; h: number; rows: number; cols: number; r: number; hex: boolean; color: string; shift: number }) {
  const out: ReactNode[] = []
  for (let q = 0; q < rows; q++) {
    const gy = y + h - ((q + 0.5) / rows) * h
    const off = hex && q % 2 ? w / cols / 2 : 0
    const n = hex && q % 2 ? cols - 1 : cols
    for (let i = 0; i < n; i++) {
      const gx = x + shift + off + ((i + 0.5) / cols) * w
      out.push(<circle key={q + '-' + i} cx={gx} cy={gy} r={r} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={0.9} />)
    }
  }
  return <>{out}</>
}

/** direct shear box with open drainage, a dial gauge on the cap and a burette that catches / supplies water */
function ShearBox({ cx, p, ev, rate, color, name, dense: isDense }: { cx: number; p: number; ev: number; rate: number; color: string; name: string; dense: boolean }) {
  const bw = 100,
    half0 = 36,
    base = 168
  const x0 = cx - 18 - bw / 2
  const scale = 0.32 // drawn height change per unit εv (exaggerated)
  const half = half0 * (1 + scale * ev)
  const s = 16 * p // upper half moves right
  const midY = base - half
  const topY = base - 2 * half
  const r = isDense ? 4.3 : 4.6
  const cols = isDense ? 9 : 7
  const rows = isDense ? 4 : 3
  const flowing = Math.abs(rate) > FLOW_MIN
  const out = rate < 0 // contracting → water leaves
  const bx = cx + 52 // burette
  const level = 120 - ev * 34 // more water collected when the soil contracts
  const drops = flowing
    ? [0, 1, 2].map((k) => {
        const ph = (p * 9 + k / 3) % 1
        const t = out ? ph : 1 - ph
        // path: bottom of box → right → up the burette
        const px = x0 + bw + 2 + t * (bx - x0 - bw - 2)
        return <circle key={k} cx={px} cy={base + 10} r={2.2} fill="var(--c-water)" />
      })
    : null
  const status = p < 0.003 ? 'at rest' : !flowing ? 'constant volume' : out ? 'contracting: water out' : 'dilating: water sucked in'
  return (
    <g>
      <text x={cx} y={12} fontSize={10.5} fontWeight={700} textAnchor="middle" fill={color}>
        {name}
      </text>
      {/* normal load and dial gauge */}
      <text x={x0 + 4} y={topY - 24} fontSize={9} fill="var(--c-mute)">
        σn↓
      </text>
      <line x1={cx - 18 + s} x2={cx - 18 + s} y1={topY - 7} y2={topY - 22} stroke="var(--c-steel)" strokeWidth={2} />
      <circle cx={cx - 18 + s} cy={topY - 30} r={8} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth={0.9} />
      <line
        x1={cx - 18 + s}
        y1={topY - 30}
        x2={cx - 18 + s + 6 * Math.sin(ev * 2.2)}
        y2={topY - 30 - 6 * Math.cos(ev * 2.2)}
        stroke={ev >= 0 ? C_DILATE : C_CONTRACT}
        strokeWidth={1.4}
      />
      <text x={cx - 18 + s + 12} y={topY - 27} fontSize={8.5} fill={Math.abs(ev) < 0.02 ? 'var(--c-mute)' : ev > 0 ? C_DILATE : C_CONTRACT}>
        ΔH {ev > 0.02 ? '↑' : ev < -0.02 ? '↓' : '0'}
      </text>
      {/* top cap with porous stone */}
      <rect x={x0 + s} y={topY - 7} width={bw} height={7} fill="var(--c-steel)" />
      {/* upper half box (moves) */}
      <Grains x={x0} y={topY} w={bw} h={half} rows={rows} cols={cols} r={r} hex={isDense} color={color} shift={s} />
      <rect x={x0 + s - 3} y={topY - 2} width={bw + 6} height={half + 2} fill="none" stroke="var(--c-ink)" strokeWidth={1.4} />
      {/* lower half box (fixed) */}
      <Grains x={x0} y={midY} w={bw} h={half} rows={rows} cols={cols} r={r} hex={isDense} color={color} shift={0} />
      <rect x={x0 - 3} y={midY} width={bw + 6} height={half + 2} fill="none" stroke="var(--c-ink)" strokeWidth={1.4} />
      <line x1={x0 - 10} x2={x0 + bw + 12} y1={midY} y2={midY} stroke="var(--c-bad)" strokeDasharray="3 2" strokeWidth={0.9} />
      <path d={`M${x0 - 16},${topY + half / 2} l10,0 m-4,-3 l4,3 l-4,3`} fill="none" stroke="var(--c-ink)" strokeWidth={1.2} />
      {/* drain: base → open valve → burette */}
      <rect x={x0 - 3} y={base + 2} width={bw + 6} height={4} fill="var(--c-water)" opacity={0.5} />
      <path d={`M${x0 + bw + 3},${base + 10} L${bx},${base + 10} L${bx},${level}`} fill="none" stroke="var(--c-water)" strokeWidth={1.6} opacity={0.6} />
      <path d={`M${x0 + bw + 14},${base + 6} l7,4 l-7,4 Z M${x0 + bw + 28},${base + 6} l-7,4 l7,4 Z`} fill="var(--c-good)" opacity={0.85} />
      <text x={x0 + bw + 21} y={base + 24} fontSize={8} textAnchor="middle" fill="var(--c-good)">
        valve open
      </text>
      {drops}
      <rect x={bx - 4} y={72} width={8} height={92} rx={2} fill="none" stroke="var(--c-line)" />
      <rect x={bx - 3} y={level} width={6} height={164 - level} fill="var(--c-water)" opacity={0.7} />
      <text x={bx} y={68} fontSize={7.5} textAnchor="middle" fill="var(--c-mute)">
        burette
      </text>
      <text x={cx} y={base + 38} fontSize={8.5} textAnchor="middle" fill={color}>
        {status}
      </text>
    </g>
  )
}

export function DrainedVolumeAnim() {
  const clock = useStrainClock()
  const { p } = clock
  const phase = p < 0.08 ? 0 : p < 0.72 ? 1 : 2
  return (
    <div ref={clock.ref} className="space-y-2">
      <div className="text-xs font-semibold">(ii) Drained test — volume change vs axial strain (triaxial) or shear displacement (direct shear); drainage open, so the volume really changes</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1.15fr] items-center">
        <svg viewBox="0 0 300 226" className="w-full" role="img" aria-label="Loose and dense sand in drained direct shear">
          <ShearBox cx={75} p={p} ev={loose(p)} rate={slope(loose, p)} color={C_CONTRACT} name="Loose sand / NC clay" dense={false} />
          <ShearBox cx={225} p={p} ev={dense(p)} rate={slope(dense, p)} color={C_DILATE} name="Dense sand / OC clay" dense />
          <text x={150} y={222} fontSize={7.5} textAnchor="middle" fill="var(--c-faint)">
            height change drawn exaggerated
          </text>
        </svg>
        <Plot
          p={p}
          yl="Volumetric strain εv (or ΔH)"
          xl="axial strain / shear displacement →"
          ymin={-0.82}
          ymax={0.62}
          posLbl="+ expansion (dilation)"
          negLbl="− compression (contraction)"
          curves={[
            { f: dense, color: C_DILATE, label: 'dense sand / OC clay: dilates', at: [0.98, 0.555], from: 0.45 },
            { f: loose, color: C_CONTRACT, label: 'loose sand / NC clay: contracts', at: [0.98, -0.6], from: 0.45 },
          ]}
        >
          {(X, Y) => (
            <>
              <circle cx={X(DENSE_DIP)} cy={Y(dense(DENSE_DIP))} r={4.5} fill="none" stroke={C_DILATE} strokeWidth={1.2} opacity={fade(p, 0.07)} />
              <Note x={X(0.12)} y={Y(0) + 11} t="← slight compression first" c={C_DILATE} o={fade(p, 0.07)} />
              <circle cx={X(DENSE_STEEP)} cy={Y(dense(DENSE_STEEP))} r={4} fill="none" stroke="var(--c-ink)" strokeWidth={1.2} opacity={fade(p, DENSE_STEEP + 0.03)} />
              <Note x={X(0.24)} y={Y(0.06)} t="← steepest dilation ≈ peak τ" o={fade(p, DENSE_STEEP + 0.03)} />
              {p > 0.68 && (
                <g opacity={fade(p, 0.72)}>
                  <rect x={X(0.72)} y={Y(0.6)} width={X(1) - X(0.72)} height={Y(-0.78) - Y(0.6)} fill="var(--c-faint)" opacity={0.12} />
                  <text x={X(0.86)} y={Y(-0.2)} fontSize={9} textAnchor="middle" fill="var(--c-ink)">
                    critical state:
                  </text>
                  <text x={X(0.86)} y={Y(-0.2) + 11} fontSize={9} textAnchor="middle" fill="var(--c-ink)">
                    no more volume change
                  </text>
                </g>
              )}
            </>
          )}
        </Plot>
      </div>
      <Controls clock={clock} readout={`displacement ${(p * 100).toFixed(0)} % of run`} />
      <Caption tag={['start', 'shearing', 'critical state'][phase]}>
        {phase === 0 && (
          <>
            The valve is open, so <Wat>water</Wat> can flow in or out and the volume change actually happens (it is measured by the dial gauge in direct shear, or by the water in the
            burette in a triaxial test). Both specimens compress slightly at first.
          </>
        )}
        {phase === 1 && (
          <>
            <Warm>Loose sand</Warm> grains roll into the voids: the specimen contracts and <Wat>water is pushed out</Wat>. <Cool>Dense sand</Cool> grains are interlocked and must ride up
            over their neighbours: it dilates and <Wat>draws water in</Wat>. Peak shear stress of dense sand comes where it dilates fastest.
          </>
        )}
        {phase === 2 && (
          <>
            Both curves level off: the soil has reached the <b>critical state</b>, shearing on at constant volume with no water flowing. Loose and dense sand end up at the same
            critical void ratio, one by getting denser, the other by loosening.
          </>
        )}
      </Caption>
    </div>
  )
}
