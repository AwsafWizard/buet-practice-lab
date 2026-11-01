import { useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Callout, Choice, Md, Section, Seg, Step, Steps, Tex } from '../../components/ui'
import { CITY_V, classifyEnclosure, CP_WINDWARD, cpLeeward, GCPI, gustFlexible, gustRigid, importanceWind, isLowRise, Kz, kzt, KZT_PARAMS, lambdaFactor, MS_TO_MPH, ps30, PSF_TO_KPA, storeyForces, TERRAIN, ZONES, type Enclosure, type Exposure, type Hill, type WallOpening } from '../../engine/wind'
import { GustRigidSolution, KztSolution, WindAnalytical, WindLoadCases } from '../../kit/loads'
import { CheckTable, hashKey, type CheckCol } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider, TopicFrequency, useSeed } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'
import { randomSimp, type SimpProblem } from './simplified'
import { SimplifiedPractice } from './SimplifiedPractice'

export { CITY_V }

// ---------------------------------------------------------------- pressure profile
function Profile({ r, B, h, levels }: { r: ReturnType<typeof storeyForces>; B: number; h: number; levels: number[] }) {
  const W = 560,
    H = 300
  const bw = 120
  const x0 = W / 2 - bw / 2
  const k = (H - 50) / Math.max(h + (r.parapet ? r.parapet.zp - h : 0), 1)
  const Y = (z: number) => H - 25 - z * k
  const pmax = Math.max(...r.rows.map((q) => q.pw), Math.abs(r.pl), 1e-6)
  const L = (p: number) => (Math.abs(p) / pmax) * 110
  void B
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-xl">
      <defs>
        <marker id="wa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent)" />
        </marker>
      </defs>
      <line x1={20} x2={W - 20} y1={Y(0)} y2={Y(0)} stroke="var(--c-mute)" strokeWidth={2} />
      <rect x={x0} y={Y(h)} width={bw} height={Y(0) - Y(h)} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.5} />
      {r.parapet && <rect x={x0} y={Y(r.parapet.zp)} width={bw} height={Y(h) - Y(r.parapet.zp)} fill="none" stroke="var(--c-ink)" strokeDasharray="4 3" />}
      {levels.map((z) => (
        <line key={z} x1={x0} x2={x0 + bw} y1={Y(z)} y2={Y(z)} stroke="var(--c-line)" />
      ))}
      {r.rows.map((q) => (
        <g key={q.level}>
          <line x1={x0 - L(q.pw) - 4} x2={x0 - 4} y1={Y(q.z)} y2={Y(q.z)} stroke="var(--c-accent)" strokeWidth={2} markerEnd="url(#wa)" />
          <text x={x0 - L(q.pw) - 8} y={Y(q.z) + 4} fontSize={10.5} textAnchor="end" className="num" fill="var(--c-ink)">
            {fmt(q.pw, 3)}
          </text>
          <line x1={x0 + bw + 4} x2={x0 + bw + 4 + L(r.pl)} y1={Y(q.z)} y2={Y(q.z)} stroke="var(--c-accent)" strokeWidth={2} markerEnd="url(#wa)" />
        </g>
      ))}
      <text x={x0 + bw + 10 + L(r.pl)} y={Y(h / 2)} fontSize={10.5} className="num" fill="var(--c-ink)">
        {fmt(r.pl, 3)} (suction, const.)
      </text>
      <text x={20} y={16} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        Windward pressure grows with height (q_z); leeward suction uses q_h everywhere. kN/m²
      </text>
      <text x={x0 - 140} y={Y(0) + 18} fontSize={11} fill="var(--c-accent)" fontWeight={700}>
        WIND →
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- random problem
interface Prob {
  city: string
  exp: Exposure
  occ: 1 | 2 | 3 | 4
  n: number
  hs: number
  B: number
  L: number
  par: number
  encl: Enclosure
  // set only for a generated problem
  use?: string
  walls?: WallOpening[]
}

const USES: Record<1 | 2 | 3 | 4, string[]> = {
  1: ['farm storage building', 'temporary storage facility'],
  2: ['residential apartment building', 'office building', 'hotel'],
  3: ['school building (≈ 400 students)', 'community centre for 500 people', 'college building (≈ 600 students)'],
  4: ['hospital with surgery and emergency units', 'fire station', 'designated cyclone shelter', 'police station'],
}
const TERRAIN_TEXT: Record<Exposure, (c: string) => string> = {
  A: (c) => `in a densely built-up urban area of ${c}, with buildings of similar height all around`,
  B: (c) => `on open terrain with scattered buildings and trees on the outskirts of ${c}`,
  C: (c) => `on flat, unobstructed open ground (paddy fields) near ${c}`,
}
const OCC = ['', 'I', 'II', 'III', 'IV']
const WALL_NAME: Record<WallOpening['wall'], string> = { windward: 'Windward', leeward: 'Leeward', side1: 'Side wall 1', side2: 'Side wall 2', roof: 'Roof' }

function randomProb(seed: number): Prob {
  const r = rng(seed)
  const occ = pick(r, [1, 2, 2, 2, 3, 3, 4, 4]) as 1
  const n = occ === 1 ? randInt(r, 1, 3) : randInt(r, 3, 14)
  const hs = pick(r, [3, 3, 3.2, 3.5])
  const B = randInt(r, 15, 45, 5),
    L = randInt(r, 15, 45, 5)
  const h = n * hs
  // openings in m²: a big windward opening (shop fronts, a garage) makes it partially enclosed
  const partial = r() < 0.4
  const op = (gross: number, lo: number, hi: number) => Math.round(gross * (lo + (hi - lo) * r()))
  const walls: WallOpening[] = ([
    { wall: 'windward', gross: Math.round(B * h), open: 0 },
    { wall: 'leeward', gross: Math.round(B * h), open: 0 },
    { wall: 'side1', gross: Math.round(L * h), open: 0 },
    { wall: 'side2', gross: Math.round(L * h), open: 0 },
  ] satisfies WallOpening[]).map((w) => ({ ...w, open: partial ? (w.wall === 'windward' ? op(w.gross, 0.12, 0.3) : op(w.gross, 0.005, 0.03)) : op(w.gross, 0.03, 0.1) }))
  return {
    city: pick(r, Object.keys(CITY_V)),
    exp: pick(r, ['A', 'B', 'C'] as Exposure[]),
    occ,
    n,
    hs,
    B,
    L,
    par: pick(r, [0, 1, 1, 1.2, 1.5]),
    encl: classifyEnclosure(walls).cls,
    use: pick(r, USES[occ]),
    walls,
  }
}

// ---------------------------------------------------------------- storey force table
type ForceRow = { key: string; name: string; z: number; Kz: number; q: number; net: number; F: number }
const FORCE_COLS: CheckCol<ForceRow>[] = [
  { key: 'Kz', label: 'K_z', get: (r) => r.Kz, abs: 0.005, digits: 3 },
  { key: 'q', label: 'q_z (kN/m²)', get: (r) => r.q, abs: 0.005, digits: 3 },
  { key: 'p', label: 'net p (kN/m²)', get: (r) => r.net, abs: 0.005, digits: 3 },
  { key: 'F', label: 'F (kN)', get: (r) => r.F, abs: 0.5, digits: 1 },
]

// ---------------------------------------------------------------- guided calculator
function Calculator() {
  const [pr, setPr] = useState<Prob>({ city: 'Dhaka', exp: 'A', occ: 2, n: 6, hs: 3, B: 20, L: 30, par: 1, encl: 'enclosed' })
  const [random, setRandom] = useState(false)
  const [plots, setPlots] = useState(false)
  const set = (o: Partial<Prob>) => setPr({ ...pr, ...o })
  const generate = () => {
    setPr(randomProb(Math.floor(Math.random() * 1e9)))
    setRandom(true)
    setPlots(false)
  }
  const { city, exp, occ, n, hs, B, L, par, encl } = pr
  const V = CITY_V[city]
  const I = importanceWind(occ, V)
  const levels = Array.from({ length: n }, (_, k) => (k + 1) * hs)
  const h = n * hs
  const T = 0.0466 * Math.pow(h, 0.9)
  const rigid = T < 1
  const G = rigid ? 0.85 : gustFlexible({ h, B, L, exp, V, n1: 1 / T, beta: 0.02 }).Gf
  const r = useMemo(() => storeyForces({ V, exp, I, Kzt: 1, G, B, L, levels, parapet: par > 0 ? { height: par } : undefined }), [V, exp, I, G, B, L, n, hs, par])
  const lr = isLowRise(h, Math.min(B, L))
  const encC = random && pr.walls ? classifyEnclosure(pr.walls) : null
  const key = hashKey(JSON.stringify([pr, random]))
  const id = (k: string) => `wind:calc:${key}:${k}`
  const tableRows: ForceRow[] = [
    ...(r.parapet ? [{ key: 'par', name: 'Parapet', z: r.parapet.zp, Kz: r.parapet.Kz, q: r.parapet.qp, net: r.parapet.net, F: r.parapet.F }] : []),
    ...[...r.rows].reverse().map((q) => ({ key: `L${q.level}`, name: q.level === n ? `Roof (L${q.level})` : `L${q.level}`, z: q.z, Kz: q.Kz, q: q.qz, net: q.net, F: q.F })),
  ]
  const plotsBlock = (
    <div className="space-y-2">
      <button className="text-sm text-accent underline" onClick={() => setPlots(!plots)}>
        {plots ? 'Hide' : 'Show'} pressure profile (gives away q_z and the leeward p)
      </button>
      {plots && (
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <Profile r={r} B={B} h={h} levels={levels} />
        </div>
      )}
    </div>
  )
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={generate}>
          🎲 Randomly generate
        </button>
        {random && (
          <button className="text-sm text-accent underline" onClick={() => setRandom(false)}>
            edit as custom building
          </button>
        )}
      </div>
      {random && pr.walls ? (
        <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">
          {[8, 11, 18].includes(n) ? 'An' : 'A'} {n}-storey RC <b>{pr.use}</b> stands {TERRAIN_TEXT[exp](city)}. Every storey is {hs} m high and the roof is flat{par > 0 ? ` with a ${par} m parapet` : ' with no parapet'}. Plan {B} m (normal to the wind) × {L} m (along the wind). The site is level (K_zt = 1). Wall openings are given below. Find the storey wind forces and the base shear for the MWFRS in this direction; estimate T = 0.0466 h^0.9.
        </div>
      ) : (
        <>
          <div className="grid cq-md:grid-cols-4 gap-2 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-mute">Location</span>
              <select className="field" value={city} onChange={(e) => set({ city: e.target.value })}>
                {Object.keys(CITY_V).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-mute">Exposure</span>
              <select className="field" value={exp} onChange={(e) => set({ exp: e.target.value as Exposure })}>
                <option value="A">A (urban, wooded)</option>
                <option value="B">B (open, scattered)</option>
                <option value="C">C (flat, unobstructed)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-mute">Occupancy</span>
              <select className="field" value={occ} onChange={(e) => set({ occ: +e.target.value as 1 })}>
                {[1, 2, 3, 4].map((o) => (
                  <option key={o} value={o}>
                    {OCC[o]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-mute">Enclosure</span>
              <select className="field" value={encl} onChange={(e) => set({ encl: e.target.value as Enclosure })}>
                <option value="enclosed">enclosed</option>
                <option value="partially">partially enclosed</option>
                <option value="open">open</option>
              </select>
            </label>
          </div>
          <div className="grid cq-md:grid-cols-3 gap-x-6">
            <Slider label="Storeys" value={n} min={1} max={20} onChange={(v) => set({ n: v })} />
            <Slider label="Storey height" value={hs} min={3} max={4} step={0.5} onChange={(v) => set({ hs: v })} unit=" m" />
            <Slider label="Parapet" value={par} min={0} max={1.5} step={0.25} onChange={(v) => set({ par: v })} unit=" m" />
            <Slider label="B (⊥ wind)" value={B} min={10} max={60} onChange={(v) => set({ B: v })} unit=" m" />
            <Slider label="L (∥ wind)" value={L} min={10} max={60} onChange={(v) => set({ L: v })} unit=" m" />
          </div>
        </>
      )}
      <div className="grid cq-lg:grid-cols-[1fr_1fr] gap-4">
        <div key={key} className="rounded-xl border border-line p-3 space-y-1 text-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Your checkpoints</div>
          {random && <Choice id={id('occ')} label="Occupancy" options={[1, 2, 3, 4].map((o) => ({ v: OCC[o], label: OCC[o] }))} answer={OCC[occ]} />}
          <Answer id={id('Vb')} label="Basic wind speed V (m/s)" value={V} compact />
          <Answer id={id('I')} label="Importance factor I" value={I} compact />
          {encC && (
            <>
              <Choice id={id('encl')} label="Enclosure" options={[{ v: 'open', label: 'Open' }, { v: 'partially', label: 'Partially' }, { v: 'enclosed', label: 'Enclosed' }]} answer={encC.cls} />
              <Answer id={id('gcpi')} label="GC_pi (±)" value={GCPI[encC.cls]} compact />
            </>
          )}
          <Choice id={id('lr')} label={`Low-rise? (h = ${fmt(h)} m)`} options={[{ v: 'y', label: 'Yes' }, { v: 'n', label: 'No' }]} answer={lr.ok ? 'y' : 'n'} />
          <Choice id={id('rig')} label={`Rigid? (T ≈ ${fmt(T, 3)} s)`} options={[{ v: 'y', label: 'Rigid' }, { v: 'n', label: 'Flexible' }]} answer={rigid ? 'y' : 'n'} />
          <Answer id={id('G')} label="Gust factor G" value={G} compact />
          <Answer id={id('kh')} label="K_h at the roof" value={r.Kh} compact />
          <Answer id={id('qh')} label="q_h (kN/m²)" value={r.qh} compact />
          <Answer id={id('pl')} label="Leeward p (kN/m²)" value={r.pl} compact />
          <Answer id={id('V')} label="Base shear (kN)" value={r.base} compact />
        </div>
        {random && pr.walls ? (
          <div className="space-y-2">
            <table className="tbl w-auto text-sm">
              <thead>
                <tr>
                  <th>Wall</th>
                  <th>Gross area (m²)</th>
                  <th>Openings (m²)</th>
                </tr>
              </thead>
              <tbody>
                {pr.walls.map((w) => (
                  <tr key={w.wall}>
                    <td className="txt">{WALL_NAME[w.wall]}</td>
                    <td>{w.gross}</td>
                    <td>{w.open}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-faint">Wind blows onto the windward wall. The roof has no openings.</p>
          </div>
        ) : (
          plotsBlock
        )}
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Storey forces — fill the table (net p = windward − leeward, external only)</div>
        <CheckTable key={key} rows={tableRows} rowKey={(x) => x.key} given={[{ label: 'Level', get: (x) => x.name }, { label: 'z (m)', get: (x) => fmt(x.z) }]} cols={FORCE_COLS} idp={id('tbl')} />
      </div>
      {random && plotsBlock}
      <details>
        <summary className="cursor-pointer text-accent font-semibold text-sm">Full solution table</summary>
        <div className="mt-2 space-y-2">
          {random && (
            <p className="text-sm">
              {pr.use} → occupancy {OCC[occ]}; {city} → V = {V} m/s; terrain → exposure {exp}.
            </p>
          )}
          {encC && (
            <Md>{`Enclosure: every wall ≥ 80 % open? ${encC.allOpen ? '**yes → open**' : 'no'}; (i) $A_o = ${encC.Ao} > 1.10A_{oi} = ${fmt(1.1 * encC.Aoi)}$ ${encC.c1 ? '✓' : '✗'}; (ii) $A_o > \\min(0.37, 0.01A_g)$ ${encC.c2 ? '✓' : '✗'}; (iii) $A_{oi}/A_{gi} = ${fmt(encC.ratio, 3)} \\le 0.20$ ${encC.c3 ? '✓' : '✗'} → **${encC.cls}**, $GC_{pi} = \\pm${GCPI[encC.cls]}$.`}</Md>
          )}
          <WindAnalytical V={V} exp={exp} I={I} G={G} B={B} L={L} levels={levels} enclosure={encl} parapet={par > 0 ? { height: par } : undefined} note={<p className="text-xs text-mute">{rigid ? 'T < 1 s → rigid, G = 0.85.' : `T ≥ 1 s → flexible; G_f computed with n₁ = 1/T and β = 2 %: ${fmt(G, 4)}.`} Period estimated with T = 0.0466 h^0.9 (RC frame); use the value your question gives.</p>} />
        </div>
      </details>
    </div>
  )
}

// ---------------------------------------------------------------- enclosure game
function EnclosureGame() {
  const { seed, next } = useSeed(9)
  const g = useMemo(() => {
    const r = rng(seed)
    const side = pick(r, [30, 40, 50])
    const hgt = pick(r, [10, 12, 15])
    const Ag = side * hgt
    const mode = pick(r, ['open', 'partially', 'enclosed', 'enclosed', 'partially'])
    const op = (f: number) => Math.round(Ag * f)
    let walls
    if (mode === 'open') walls = ['windward', 'leeward', 'side1', 'side2'].map((w) => ({ wall: w as 'windward', gross: Ag, open: op(0.8 + 0.15 * r()) }))
    else if (mode === 'partially')
      walls = [{ wall: 'windward' as const, gross: Ag, open: op(0.2 + 0.3 * r()) }, ...(['leeward', 'side1', 'side2'] as const).map((w) => ({ wall: w, gross: Ag, open: op(0.01 + 0.04 * r()) }))]
    else walls = (['windward', 'leeward', 'side1', 'side2'] as const).map((w) => ({ wall: w, gross: Ag, open: op(0.02 + 0.08 * r()) }))
    return { walls, side, hgt, c: classifyEnclosure(walls, 4) }
  }, [seed])
  return (
    <div className="grid cq-lg:grid-cols-[1fr_1fr] gap-4">
      <div>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Wall</th>
              <th>Gross area (ft²)</th>
              <th>Openings (ft²)</th>
            </tr>
          </thead>
          <tbody>
            {g.walls.map((w) => (
              <tr key={w.wall}>
                <td className="txt">{w.wall}</td>
                <td>{w.gross}</td>
                <td>{w.open}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-faint mt-1">Wind blows toward the windward wall. Roof has no openings.</p>
        <button className="btn mt-2" onClick={next}>
          ↻ New building
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <Choice key={seed} id={`wind:encl:${seed}`} label="Classification" options={[{ v: 'open', label: 'Open' }, { v: 'partially', label: 'Partially enclosed' }, { v: 'enclosed', label: 'Enclosed' }]} answer={g.c.cls} />
        <details>
          <summary className="cursor-pointer text-accent">why?</summary>
          <Md>{`- every wall ≥ 80 % open? ${g.c.allOpen ? '**yes → OPEN**' : 'no'}
- (i) $A_o = ${g.c.Ao} \\ge 1.10A_{oi} = ${fmt(1.1 * g.c.Aoi)}$ → ${g.c.c1 ? '✓' : '✗'}
- (ii) $A_o > \\min(4, 0.01A_g)$ → ${g.c.c2 ? '✓' : '✗'}
- (iii) $A_{oi}/A_{gi} = ${fmt(g.c.ratio, 3)} \\le 0.20$ → ${g.c.c3 ? '✓' : '✗'}

All of (i)–(iii) → partially enclosed; otherwise enclosed. GC_pi: open 0, partially ±0.55, enclosed ±0.18.`}</Md>
        </details>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Kzt explorer
const KZT_COLS: CheckCol<{ K3: number; Kzt: number }>[] = [
  { key: 'K3', label: 'K₃', get: (r) => r.K3, abs: 0.003, digits: 3 },
  { key: 'Kzt', label: 'Kzt', get: (r) => r.Kzt, abs: 0.005, digits: 3 },
]

type DimName = 'H' | 'Lh' | 'x'
const DIM_NAMES: DimName[] = ['H', 'Lh', 'x']

/** a tappable blank on a dimension line; green/red once every blank is named */
function DimTag({ cx, cy, pick, state, onClick }: { cx: number; cy: number; pick?: DimName; state: boolean | null; onClick: () => void }) {
  const col = state === true ? 'var(--c-good)' : state === false ? 'var(--c-bad)' : 'var(--c-accent)'
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect x={cx - 17} y={cy - 10} width={34} height={20} rx={5} fill="var(--c-panel)" stroke={col} />
      <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize={12} fontWeight={700} fill={col}>
        {pick === 'Lh' ? (
          <>
            L<tspan fontSize={9} dy={3}>h</tspan>
          </>
        ) : (
          (pick ?? '?')
        )}
      </text>
    </g>
  )
}

function KztExplorer() {
  const [hill, setHill] = useState<Hill>('escarpment')
  const [H, setH] = useState(30)
  const [Lh, setLh] = useState(40)
  const [x, setX] = useState(20)
  const [down, setDown] = useState(true)
  const [exp, setExp] = useState<Exposure>('C')
  const [hb, setHb] = useState(15)
  const [solve, setSolve] = useState(false)
  // dimension-name quiz on the drawing; answers are kept per problem (key)
  const [tagState, setTagState] = useState<{ k: string; v: Partial<Record<DimName, DimName>> }>({ k: '', v: {} })
  const generate = () => {
    const r = rng(Math.floor(Math.random() * 1e9))
    // exposure A needs H ≥ 18.3 m (60 ft) for speed-up, so problems use B or C with H ≥ 4.5 m (15 ft)
    const h = randInt(r, 15, 60, 5)
    // L_h between H and 4H keeps H/L_h in 0.25–1, so H/L_h ≥ 0.2 always holds and > 0.5 tests the cap
    const l = randInt(r, h, Math.min(120, 4 * h), 5)
    setHill(pick(r, ['escarpment', 'ridge', 'hill3d'] as Hill[]))
    setExp(pick(r, ['B', 'C'] as Exposure[]))
    setDown(r() < 0.7)
    setH(h)
    setLh(l)
    setX(randInt(r, 0, Math.min(120, 2 * l), 5))
    setHb(randInt(r, 10, 60, 5))
    setSolve(true)
  }
  const zs = [0.25, 0.5, 0.75, 1].map((f) => f * hb)
  const key = hashKey(JSON.stringify([hill, exp, H, Lh, x, down, hb]))
  const id = (k: string) => `wind:kzt:${key}:${k}`
  const k0 = kzt({ hill, exp, H, Lh, x, downwind: down, z: hb })
  const solveRows = [hb / 2, hb].map((z) => ({ z, ...kzt({ hill, exp, H, Lh, x, downwind: down, z }) }))
  const W = 620,
    Hs = 256
  // scale the scene so the whole slope, the building and its roof always fit (top 44 px is for the labels)
  const sx = down ? x : -x
  const left = Math.max(2 * Lh, -sx + 20) * 1.08
  const right = Math.max(hill === 'escarpment' ? 0.35 * left : 2 * Lh * 1.08, sx + 25)
  const base = Hs - 40
  const sc = Math.min((W - 60) / (left + right), (base - 44) / (H + hb))
  const crestX = 40 + left * sc
  const ground = (xx: number) => {
    // xx: ft from crest (+ downwind)
    if (hill === 'escarpment') return xx >= 0 ? H : xx > -2 * Lh ? H * (1 + xx / (2 * Lh)) : 0
    const dist = Math.abs(xx)
    return dist < 2 * Lh ? H * (1 - dist / (2 * Lh)) : 0
  }
  const Y = (ft: number) => base - ft * sc
  const pts: string[] = []
  for (let px = 0; px <= W; px += 2) pts.push(`${px},${Y(ground((px - crestX) / sc))}`)
  const bx = crestX + sx * sc
  const bw = 28
  // building base follows the slope: each wall stands on the ground under it
  const gl = Y(ground(sx - bw / 2 / sc)),
    gr = Y(ground(sx + bw / 2 / sc)),
    gc = Y(ground(sx))
  const roof = gc - hb * sc
  const bld = `${bx - bw / 2},${gl} ${bx - bw / 2},${roof} ${bx + bw / 2},${roof} ${bx + bw / 2},${gr}`
  const crestLeft = hill === 'escarpment' || bx > crestX
  // crop empty sky when the scene is short (limited by width, not height)
  const top = Math.max(0, Math.min(roof, Y(H) - 24) - 40)
  const tags = tagState.k === key ? tagState.v : {}
  const dims: DimName[] = x > 0 ? ['H', 'Lh', 'x'] : ['H', 'Lh']
  const allTagged = dims.every((d) => tags[d])
  const nTagOk = dims.filter((d) => tags[d] === d).length
  const cycle = (d: DimName) => {
    const i = tags[d] ? DIM_NAMES.indexOf(tags[d]!) : -1
    setTagState({ k: key, v: { ...tags, [d]: DIM_NAMES[(i + 1) % DIM_NAMES.length] } })
  }
  const tag = (d: DimName, cx: number, cy: number) => (
    <DimTag cx={cx} cy={cy} pick={tags[d]} state={allTagged ? tags[d] === d : null} onClick={() => cycle(d)} />
  )
  const xL = crestX - Lh * sc
  // a short hill has no room under the L_h line: its blank goes above the crest and the crest label above that
  const lhAbove = (H / 2) * sc < 28
  const hillName = hill === 'escarpment' ? 'a 2-D escarpment' : hill === 'ridge' ? 'a 2-D ridge' : 'a 3-D axisymmetric hill'
  return (
    <div className="grid cq-lg:grid-cols-[1.3fr_1fr] gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <button className="btn" onClick={generate}>
            🎲 Randomly generate
          </button>
          {solve ? (
            <button className="text-sm text-accent underline" onClick={() => setSolve(false)}>
              back to the explorer (shows the answers)
            </button>
          ) : (
            <>
              <Seg value={hill} onChange={setHill} items={[{ v: 'escarpment', label: '2-D escarpment' }, { v: 'ridge', label: '2-D ridge' }, { v: 'hill3d', label: '3-D hill' }]} />
              <Seg value={exp} onChange={setExp} items={[{ v: 'A', label: 'A' }, { v: 'B', label: 'B' }, { v: 'C', label: 'C' }]} />
              <Seg value={down ? 'd' : 'u'} onChange={(v) => setDown(v === 'd')} items={[{ v: 'u', label: 'upwind of crest' }, { v: 'd', label: 'downwind' }]} />
            </>
          )}
        </div>
        {solve && (
          <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed mb-2">
            A {hb} ft tall building stands {x === 0 ? 'right at the crest' : `${x} ft ${down ? 'downwind' : 'upwind'} of the crest`} of {hillName}, H = {H} ft, L<sub>h</sub> = {Lh} ft. Exposure {exp}. Find K₁ and K₂, then K₃ and K<sub>zt</sub> at mid-height (z = {fmt(hb / 2)} ft) and at the roof (z = {hb} ft).
          </div>
        )}
        <svg viewBox={`0 ${top} ${W} ${Hs - top}`} className="w-full h-auto">
          <line x1={0} y1={base} x2={W} y2={base} stroke="var(--c-line)" strokeDasharray="3 4" />
          <polyline points={pts.join(' ')} fill="none" stroke="var(--c-mute)" strokeWidth={2} />
          <polygon points={bld} fill="var(--c-panel2)" stroke="var(--c-ink)" />
          <circle cx={crestX} cy={Y(H)} r={3} fill="var(--c-accent)" />
          <text x={lhAbove ? crestX : crestLeft ? crestX - 6 : crestX + 6} y={lhAbove ? Y(H) - 32 : Y(H) - 6} textAnchor={lhAbove ? 'middle' : crestLeft ? 'end' : 'start'} fontSize={10} fill="var(--c-accent)">
            crest
          </text>
          {/* blank dimension lines: base level to crest; crest to the half-height point upwind; crest to building */}
          <line x1={crestX} y1={Y(H)} x2={crestX} y2={base + (x > 0 ? 16 : 0)} stroke="var(--c-line)" strokeDasharray="2 3" />
          <line x1={11} y1={Y(H)} x2={crestX} y2={Y(H)} stroke="var(--c-line)" strokeDasharray="2 3" />
          <line x1={16} y1={base} x2={16} y2={Y(H)} stroke="var(--c-faint)" />
          <line x1={xL} y1={Y(H / 2) - 4} x2={xL} y2={Y(H / 2) + 4} stroke="var(--c-faint)" />
          <line x1={xL} y1={Y(H / 2)} x2={crestX} y2={Y(H / 2)} stroke="var(--c-faint)" />
          {x > 0 && (
            <>
              <line x1={bx} y1={gc} x2={bx} y2={base + 16} stroke="var(--c-line)" strokeDasharray="2 3" />
              <line x1={crestX} y1={base + 12} x2={bx} y2={base + 12} stroke="var(--c-faint)" />
            </>
          )}
          {tag('H', 36, base - Y(H) < 26 ? Y(H) - 14 : (base + Y(H)) / 2)}
          {tag('Lh', (xL + crestX) / 2, lhAbove ? Y(H) - 16 : Y(H / 2) + 15)}
          {x > 0 && tag('x', (crestX + bx) / 2, base + 24)}
          <text x={bx + bw / 2 + 5} y={(gc + roof) / 2 + 4} fontSize={11} fill="var(--c-faint)">
            {hb}
          </text>
          <text x={30} y={top + 22} fontSize={13} fontWeight={700} fill="var(--c-load)">
            Wind →
          </text>
          <text x={W - 8} y={top + 22} textAnchor="end" fontSize={10} fill="var(--c-faint)">
            ft, drawn to scale
          </text>
        </svg>
        <p className="text-xs text-faint mb-1">
          Tap each <b>?</b> on the drawing to name that dimension (H, L<sub>h</sub> or x).{' '}
          {allTagged && <span className={nTagOk === dims.length ? 'text-good' : 'text-bad'}>{nTagOk === dims.length ? 'All correct ✓' : `${nTagOk}/${dims.length} correct — keep tapping the red ones`}</span>}
        </p>
        {!solve && (
          <div className="grid cq-md:grid-cols-2 gap-x-4">
            <Slider label="Hill height H" value={H} min={5} max={60} onChange={setH} unit=" ft" />
            <Slider label="L_h" value={Lh} min={10} max={120} onChange={setLh} unit=" ft" />
            <Slider label="x from crest" value={x} min={0} max={120} onChange={setX} unit=" ft" />
            <Slider label="Building height" value={hb} min={5} max={60} onChange={setHb} unit=" ft" />
          </div>
        )}
      </div>
      {solve ? (
        <div key={key} className="text-sm space-y-3">
          <div className="rounded-xl border border-line p-3 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Your checkpoints</div>
            <Answer id={id('K1')} label="K₁" value={k0.K1} abs={0.003} compact />
            <Answer id={id('K2')} label="K₂" value={k0.K2} abs={0.003} compact />
          </div>
          <CheckTable rows={solveRows} rowKey={(r) => String(r.z)} given={[{ label: 'z (ft)', get: (r) => fmt(r.z) }]} cols={KZT_COLS} idp={id('tbl')} />
          <details>
            <summary className="cursor-pointer text-accent font-semibold">Full solution</summary>
            <div className="mt-2 space-y-3">
              {solveRows.map((r) => (
                <KztSolution key={r.z} hill={hill} exp={exp} H={H} Lh={Lh} x={x} downwind={down} z={r.z} unit="ft" />
              ))}
            </div>
          </details>
        </div>
      ) : (
        <div className="text-sm">
          <table className="tbl">
            <thead>
              <tr>
                <th>z</th>
                <th>K₁</th>
                <th>K₂</th>
                <th>K₃</th>
                <th>Kzt</th>
              </tr>
            </thead>
            <tbody>
              {zs.map((z) => {
                const k = kzt({ hill, exp, H, Lh, x, downwind: down, z })
                return (
                  <tr key={z}>
                    <td>{fmt(z)}</td>
                    <td>{fmt(k.K1, 3)}</td>
                    <td>{fmt(k.K2, 3)}</td>
                    <td>{fmt(k.K3, 3)}</td>
                    <td className="font-bold">{fmt(k.Kzt, 3)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Md>{`Speed-up is largest **at the crest, near the ground**. K₂ decays with distance from the crest (μ = ${down ? KZT_PARAMS[hill].muDown : KZT_PARAMS[hill].muUp}), K₃ with height (γ = ${KZT_PARAMS[hill].gamma}). H/L_h > 0.5 → use 0.5 and L_h = 2H. Conditions: H/L_h ≥ 0.2 and H ≥ 4.5 m (B, C) / 18.3 m (A), isolated, protruding, building in the upper half/near the crest — otherwise Kzt = 1.`}</Md>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- simplified procedure
function Simplified() {
  const [Vms, setV] = useState(61.1)
  const [hm, setHm] = useState(9.1)
  const [exp, setExp] = useState<Exposure>('B')
  const [I, setI] = useState(1.15)
  const [Kz2, setKzt] = useState(1)
  const [prob, setProb] = useState<SimpProblem | null>(null)
  const mph = Vms * MS_TO_MPH
  const lam = lambdaFactor(hm, exp)
  const base = ps30(mph, '0-5')
  const top = (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn" onClick={() => setProb(randomSimp(Math.floor(Math.random() * 1e9)))}>
        🎲 Randomly generate
      </button>
      {prob && (
        <button className="text-sm text-accent underline" onClick={() => setProb(null)}>
          back to the explorer
        </button>
      )}
    </div>
  )
  if (prob)
    return (
      <div className="space-y-3">
        {top}
        <SimplifiedPractice key={JSON.stringify(prob)} p={prob} />
      </div>
    )
  return (
    <div className="space-y-2 text-sm">
      {top}
      <div className="grid cq-md:grid-cols-3 gap-x-6">
        <Slider label="V" value={Vms} min={40} max={85} step={0.1} onChange={setV} unit=" m/s" />
        <Slider label="mean roof h" value={hm} min={4.6} max={18.3} step={0.1} onChange={setHm} unit=" m" />
        <Slider label="I" value={I} min={0.77} max={1.15} step={0.01} onChange={setI} />
        <Slider label="Kzt" value={Kz2} min={1} max={2} step={0.01} onChange={setKzt} />
        <div className="flex items-center gap-2">
          Exposure <Seg size="xs" value={exp} onChange={setExp} items={[{ v: 'A', label: 'A' }, { v: 'B', label: 'B' }, { v: 'C', label: 'C' }]} />
        </div>
      </div>
      <Tex block>{`V = ${fmt(Vms)}\\text{ m/s} = ${fmt(mph, 1)}\\text{ mph},\\quad \\lambda(h = ${fmt(hm)}\\text{ m, exp. ${exp}}) = ${fmt(lam, 3)},\\quad p_s = \\lambda K_{zt} I p_{s30}`}</Tex>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Zone (flat roof 0–5°)</th>
              {ZONES.slice(0, 8).map((z) => (
                <th key={z}>{z}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="txt">p_s30 (psf, ≈V² scaled)</td>
              {base.slice(0, 8).map((v, i) => (
                <td key={i}>{fmt(v, 1)}</td>
              ))}
            </tr>
            <tr className="hl">
              <td className="txt">p_s (psf)</td>
              {base.slice(0, 8).map((v, i) => (
                <td key={i}>{fmt(v * lam * I * Kz2, 2)}</td>
              ))}
            </tr>
            <tr>
              <td className="txt">p_s (kN/m²)</td>
              {base.slice(0, 8).map((v, i) => (
                <td key={i}>{fmt(v * lam * I * Kz2 * PSF_TO_KPA, 3)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="note">In the exam use the p_s30 table printed with the paper (it is given for specific speeds — interpolate linearly). The values here are scaled from the 90 mph row by V², which matches the printed tables to ±0.1 psf. Horizontal pressures A–D act on the walls (A, C = end/interior zones of the windward wall, B, D of the roof edge for horizontal projection); E–H are vertical roof pressures.</Callout>
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="BNBC 2020 wind provisions at a glance" right={<div className="w-72 hidden cq-md:block"><TopicFrequency topic="wind" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <Md>{`**Three procedures**: Simplified (new, from ASCE 7-05), Analytical (detailed), Wind-tunnel.

**Velocity pressure**
$$q_z = 0.000613\\,K_zK_{zt}K_dV^2I\\ \\ \\text{kN/m}^2\\ (V\\text{ in m/s})$$
**Design pressure (MWFRS)**
$$p = qGC_p - q_i(GC_{pi})$$
- $q = q_z$ windward wall (varies with height), $q = q_h$ leeward/side walls and roof.
- Minimum design wind load 0.5 kN/m² on the vertical projection.`}</Md>
          <table className="tbl">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>What / value</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['V', '3-s gust basic wind speed (map / Table 6.2.8)'],
                ['K_z', '2.01(z/z_g)^(2/α), z ≥ 4.57 m; exposure A α=7, z_g=365.76; B 9.5, 274.32; C 11.5, 213.36'],
                ['K_zt', '(1 + K₁K₂K₃)²; = 1 if the speed-up conditions are not met'],
                ['K_d', '0.85 for buildings (only with the load combinations)'],
                ['I', 'Occ I 0.87 (0.77 if V > 44 m/s), II 1.0, III & IV 1.15'],
                ['G', 'Rigid (T < 1 s): 0.85 or formula; flexible: G_f'],
                ['C_p walls', `windward ${CP_WINDWARD}; leeward −0.5 (L/B ≤ 1), −0.3 (2), −0.2 (≥ 4); side −0.7`],
                ['GC_pi', 'open 0, partially enclosed ±0.55, enclosed ±0.18'],
                ['Parapet', 'p_p = q_p·GC_pn, GC_pn = +1.5 windward, −1.0 leeward (q_p at the parapet top)'],
              ].map((r) => (
                <tr key={r[0]}>
                  <td className="font-semibold">{r[0]}</td>
                  <td className="txt">{r[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Definitions examiners ask for">
        <div className="grid cq-md:grid-cols-2 gap-4">
          <Md>{`**Exposure** (upwind roughness):
- **A** — urban/suburban/wooded, prevailing ≥ 792 m or 20h upwind.
- **C** — flat unobstructed, mud/salt flats, water outside cyclone regions, ≥ 1524 m or 20h.
- **B** — everything else (open terrain, scattered obstructions < 9.1 m, water in cyclone-prone regions).

**Low-rise building**: enclosed/partially enclosed, mean roof height ≤ 18 m *and* ≤ least horizontal dimension.

**Rigid vs flexible**: natural period T < 1 s (n₁ ≥ 1 Hz) → rigid.`}</Md>
          <Md>{`**Simplified procedure (MWFRS) may be used only if** the building is: a simple diaphragm building; low-rise; enclosed (and meets wind-borne debris rules); regular-shaped; not flexible; without cross-wind / vortex / galloping / flutter sensitivity or channelling/buffeting sites; approximately symmetric with a flat, gable or hip roof θ ≤ 45°; exempt from (or not governed by) torsional load cases.
$$p_s = \\lambda K_{zt}Ip_{s30}$$

**Enclosure**: open (each wall ≥ 80 % open); partially enclosed if $A_o \\ge 1.10A_{oi}$, $A_o >$ min(0.37 m², 0.01$A_g$) and $A_{oi}/A_{gi} \\le 0.20$; otherwise enclosed.`}</Md>
        </div>
      </Section>
      <Section title="The four MWFRS load cases">
        <WindLoadCases />
      </Section>
      <Callout kind="exam">11 wind sub-questions in the last 3 papers: Kzt on escarpments/hills (3×), enclosure classification (3×), storey forces/base shear (3×), gust factor, parapets, simplified procedure, conditions for the simplified method, load cases. Probably 1½–2 questions of Section A.</Callout>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Analytical procedure — storey forces">
        <Steps>
          <Step n={1} title="Classify">Enclosure (→ GC_pi), exposure, occupancy (→ I), low-rise?, rigid/flexible (→ G).</Step>
          <Step n={2} title="K_zt">Check the five speed-up conditions; if met compute K₁, K₂, K₃.</Step>
          <Step n={3} title="q_z at every floor level and q_h at the roof">K_z from the formula (z &lt; 4.57 m → use 4.57 m).</Step>
          <Step n={4} title="Pressures">windward p_z = q_zGC_p (C_p = 0.8); leeward p_h = q_hGC_p (C_p from L/B). Internal pressure cancels for overall forces.</Step>
          <Step n={5} title="Storey forces">(p_z,windward − p_h,leeward) × B × tributary height; parapet force on the top level.</Step>
          <Step n={6} title="Base shear">Σ storey forces.</Step>
        </Steps>
      </Section>
      <Section title="Gust effect factor for a rigid building — worked">
        <GustRigidSolution h={12} B={40} exp="B" />
      </Section>
      <Section title="Topographic factor — lecture example (Kzt = 1.054)">
        <KztSolution hill="escarpment" exp="C" H={30} Lh={40} x={30} downwind z={65.75} unit="ft" />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Wind calculator with checkpoints" sub="Change the building; fill the checkpoints yourself before opening the full table.">
        <Calculator />
      </Section>
      <Section title="Enclosure classification game">
        <EnclosureGame />
      </Section>
      <Section title="Topographic factor explorer">
        <KztExplorer />
      </Section>
      <Section title="Simplified procedure">
        <Simplified />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const windP = (id: string, level: PYQ['level'], title: string, text: string, p: Parameters<typeof storeyForces>[0] & { occNote?: string }): PYQ => ({
  id: `own-wind-${id}`,
  paper: 'own',
  level,
  sec: 'A',
  no: id,
  marks: 0,
  topics: ['wind'],
  title,
  text,
  pages: [],
  checks: () => {
    const r = storeyForces(p)
    return [
      { key: 'qh', label: '$q_h$', value: r.qh, unit: 'kN/m²' },
      { key: 'F1', label: 'Storey force at level 1', value: r.rows[0].F, unit: 'kN' },
      { key: 'V', label: 'Base shear', value: r.base, unit: 'kN' },
    ]
  },
  solution: () => <WindAnalytical V={p.V} exp={p.exp} I={p.I} G={p.G} B={p.B} L={p.L} levels={p.levels} Kzt={typeof p.Kzt === 'number' ? p.Kzt : 1} parapet={p.parapet} />,
})
const problems: PYQ[] = [
  windP('1', 'warm-up', '4-storey office in Dhaka', 'Enclosed 4-storey RC office in Dhaka (V = 65.7 m/s), exposure A, occupancy II, 24 m × 18 m (wind on the 24 m face), storeys 3.5 m, G = 0.85. Storey forces and base shear.', { V: 65.7, exp: 'A', I: 1, G: 0.85, B: 24, L: 18, levels: [3.5, 7, 10.5, 14] }),
  windP('2', 'exam', 'Coastal hospital with parapet', "Hospital (occupancy IV) at Cox's Bazar, V = 80 m/s, exposure C, 5 storeys × 3 m, plan 30 m × 30 m, parapet 1 m, G = 0.85. Storey forces including the parapet.", { V: 80, exp: 'C', I: 1.15, G: 0.85, B: 30, L: 30, levels: [3, 6, 9, 12, 15], parapet: { height: 1 } }),
  windP('3', 'exam', 'Building on an escarpment', 'Same as problem 1 but Kzt = 1.25 (building near an escarpment crest). How much does the base shear grow?', { V: 65.7, exp: 'A', I: 1, G: 0.85, B: 24, L: 18, levels: [3.5, 7, 10.5, 14], Kzt: 1.25 }),
  {
    id: 'own-wind-4',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '4',
    marks: 0,
    topics: ['wind'],
    title: 'Kzt on a 3-D hill',
    text: 'A 4-storey building (12 m) sits 10 m downwind of the crest of a 3-D axisymmetric hill, H = 40 m, L_h = 60 m, exposure B. Find Kzt at mid-height and at the roof.',
    pages: [],
    checks: () => [
      { key: 'm', label: 'Kzt at z = 6 m', value: kzt({ hill: 'hill3d', exp: 'B', H: 40, Lh: 60, x: 10, downwind: true, z: 6 }).Kzt },
      { key: 'r', label: 'Kzt at z = 12 m', value: kzt({ hill: 'hill3d', exp: 'B', H: 40, Lh: 60, x: 10, downwind: true, z: 12 }).Kzt },
    ],
    solution: () => (
      <div className="space-y-3">
        <KztSolution hill="hill3d" exp="B" H={40} Lh={60} x={10} downwind z={6} />
        <KztSolution hill="hill3d" exp="B" H={40} Lh={60} x={10} downwind z={12} />
      </div>
    ),
  },
  {
    id: 'own-wind-5',
    paper: 'own',
    level: 'challenge',
    sec: 'A',
    no: '5',
    marks: 0,
    topics: ['wind'],
    title: 'Gust factor of a rigid building',
    text: 'Rigid building h = 15 m, B = 30 m, exposure C. Compute G by the formula and compare with 0.85.',
    pages: [],
    checks: () => [{ key: 'G', label: 'G', value: gustRigid({ h: 15, B: 30, exp: 'C' }).G }],
    solution: () => <GustRigidSolution h={15} B={30} exp="C" />,
  },
]

void [TERRAIN, Kz, cpLeeward, randInt]
const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
