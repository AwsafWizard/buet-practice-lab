import { useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Callout, Choice, Md, Section, Seg, Step, Steps, Tex } from '../../components/ui'
import { baseShear, Cs, CT, harmonicN, importanceEQ, kExponent, period, rcFrameFor, sdc, siteFromN, SOIL, SYSTEMS, ZONE_Z, type SiteClass } from '../../engine/eq'
import { buildingFloors, EQSolution, eqResult, SpectrumPlot } from '../../kit/loads'
import { CheckTable, hashKey, type CheckCol } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider, TopicFrequency, useSeed } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

// ---------------------------------------------------------------- storey force bars
function ForceBars({ rows, V }: { rows: { name: string; h: number; F: number; Vx: number }[]; V: number }) {
  const sorted = [...rows].filter((r) => r.h > 0).sort((a, b) => a.h - b.h)
  const H = 280,
    W = 560
  const hmax = Math.max(...sorted.map((r) => r.h), 1)
  const Y = (h: number) => H - 30 - (h / hmax) * (H - 60)
  const Fmax = Math.max(...sorted.map((r) => r.F), 1e-6)
  const x0 = 200
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-xl">
      <defs>
        <marker id="ea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-bad)" />
        </marker>
      </defs>
      <rect x={x0} y={Y(hmax)} width={90} height={Y(0) - Y(hmax)} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      <line x1={x0 - 160} x2={x0 + 260} y1={Y(0)} y2={Y(0)} stroke="var(--c-mute)" strokeWidth={2} />
      {sorted.map((r) => (
        <g key={r.name}>
          <line x1={x0} x2={x0 + 90} y1={Y(r.h)} y2={Y(r.h)} stroke="var(--c-line)" />
          <line x1={x0 - 8 - (r.F / Fmax) * 140} x2={x0 - 8} y1={Y(r.h)} y2={Y(r.h)} stroke="var(--c-bad)" strokeWidth={2.2} markerEnd="url(#ea)" />
          <text x={x0 - 12 - (r.F / Fmax) * 140} y={Y(r.h) - 4} fontSize={10.5} textAnchor="end" className="num" fill="var(--c-ink)">
            {fmt(r.F, 1)}
          </text>
          <text x={x0 + 100} y={Y(r.h) + 4} fontSize={10.5} className="num" fill="var(--c-mute)">
            {r.name} · V = {fmt(r.Vx, 1)}
          </text>
        </g>
      ))}
      <text x={x0 + 45} y={Y(0) + 18} fontSize={11} textAnchor="middle" fill="var(--c-bad)" fontWeight={700}>
        V = {fmt(V, 1)} kN
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- random problem
type Layer = { d: number; N: number; soil: string }
interface Prob {
  zone: 1 | 2 | 3 | 4
  occ: 1 | 2 | 3 | 4
  site: SiteClass
  n: number
  hs: number
  base: number
  area: number
  DL: number
  LL: number
  roofLL: number
  pedestal: number
  eta: number
  // set only for a generated problem
  city?: string
  use?: string
  dims?: [number, number]
  layers?: Layer[]
}

const CITIES: Record<1 | 2 | 3 | 4, string[]> = {
  1: ['Khulna', 'Barisal', 'Jessore', 'Rajshahi'],
  2: ['Dhaka', 'Comilla', 'Pabna', 'Noakhali', 'Dinajpur'],
  3: ['Chittagong', 'Rangpur', 'Brahmanbaria', 'Sirajganj'],
  4: ['Sylhet', 'Mymensingh', 'Kurigram'],
}
const USES: Record<1 | 2 | 3 | 4, string[]> = {
  1: ['farm storage building', 'temporary storage facility'],
  2: ['residential apartment building', 'office building', 'hotel'],
  3: ['school building (≈ 400 students)', 'community centre for 500 people', 'college building (≈ 600 students)'],
  4: ['hospital with surgery and emergency units', 'fire station', 'designated cyclone shelter', 'police station'],
}

function soilName(N: number) {
  return N < 4 ? 'Very soft clay' : N < 10 ? 'Soft silty clay' : N < 20 ? 'Loose silty sand' : N < 35 ? 'Medium dense sand' : N < 50 ? 'Dense sand' : 'Very dense sand'
}

/** SPT log over the top 30 m, N increasing with depth around a target band so all three site classes come up */
function sptLayers(r: () => number): Layer[] {
  const [lo, step] = pick(r, [
    [3, 3], // soft → SD
    [8, 6], // medium → SC
    [14, 9], // stiff → SC / SB
    [30, 10], // dense → SB
  ])
  const n = randInt(r, 4, 6)
  const out: Layer[] = []
  let rem = 30
  for (let k = 0; k < n; k++) {
    const d = k === n - 1 ? rem : Math.min(rem - 2 * (n - k - 1), randInt(r, 3, 8))
    rem -= d
    const N = Math.max(2, Math.round(lo + k * step + (r() - 0.5) * step))
    out.push({ d, N, soil: soilName(N) })
  }
  return out
}

function randomProb(seed: number): Prob {
  const r = rng(seed)
  const zone = randInt(r, 1, 4) as 1
  const occ = pick(r, [1, 2, 2, 2, 3, 3, 4, 4]) as 1
  const a = randInt(r, 15, 40, 5),
    b = randInt(r, 10, 30, 5)
  const layers = sptLayers(r)
  return {
    zone,
    occ,
    site: siteFromN(harmonicN(layers).N),
    n: occ === 1 ? randInt(r, 1, 3) : randInt(r, 3, 10),
    hs: pick(r, [3, 3, 3.2, 3.5]),
    base: pick(r, [1, 1.5, 1.5, 2]),
    area: a * b,
    DL: randInt(r, 8, 12, 0.5),
    LL: pick(r, [2, 2.4, 3, 3.5, 4]),
    roofLL: pick(r, [1, 1, 1.5]),
    pedestal: randInt(r, 50, 200, 10),
    eta: 1,
    city: pick(r, CITIES[zone]),
    use: pick(r, USES[occ]),
    dims: [a, b],
    layers,
  }
}

// ---------------------------------------------------------------- SPT bore log
const SOIL_FILL: Record<string, string> = {
  'Very soft clay': '#6b5a4a',
  'Soft silty clay': '#7d6a52',
  'Loose silty sand': '#9a8a5e',
  'Medium dense sand': '#b49c5c',
  'Dense sand': '#c9a95a',
  'Very dense sand': '#d8b85e',
}

function SPTLog({ layers }: { layers: Layer[] }) {
  const W = 520,
    H = 300,
    top = 26,
    bot = 16
  const Y = (z: number) => top + (z / 30) * (H - top - bot)
  const Nmax = Math.max(60, Math.ceil(Math.max(...layers.map((l) => l.N)) / 10) * 10)
  const x0 = 250,
    x1 = W - 20
  const X = (N: number) => x0 + (N / Nmax) * (x1 - x0)
  let z = 0
  const bands = layers.map((l) => {
    const b = { ...l, z0: z, z1: z + l.d }
    z += l.d
    return b
  })
  const path = bands.map((b, i) => `${i === 0 ? 'M' : 'L'}${X(b.N)},${Y(b.z0)} L${X(b.N)},${Y(b.z1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <text x={60} y={14} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        Bore log
      </text>
      <text x={x0} y={14} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        SPT N (blows / 300 mm)
      </text>
      {bands.map((b, i) => (
        <g key={i}>
          <rect x={60} y={Y(b.z0)} width={150} height={Y(b.z1) - Y(b.z0)} fill={SOIL_FILL[b.soil]} fillOpacity={0.55} stroke="var(--c-line)" />
          <text x={135} y={(Y(b.z0) + Y(b.z1)) / 2 + 4} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
            {b.soil}
          </text>
        </g>
      ))}
      {[0, ...bands.map((b) => b.z1)].map((d) => (
        <g key={d}>
          <line x1={52} x2={60} y1={Y(d)} y2={Y(d)} stroke="var(--c-mute)" />
          <text x={48} y={Y(d) + 3.5} fontSize={10} textAnchor="end" className="num" fill="var(--c-mute)">
            {d} m
          </text>
          <line x1={x0} x2={x1} y1={Y(d)} y2={Y(d)} stroke="var(--c-line)" strokeDasharray="2 4" />
        </g>
      ))}
      {Array.from({ length: Nmax / 10 + 1 }, (_, i) => i * 10).map((N) => (
        <g key={N}>
          <line x1={X(N)} x2={X(N)} y1={top} y2={H - bot} stroke="var(--c-line)" strokeOpacity={0.5} />
          <text x={X(N)} y={top - 4} fontSize={9.5} textAnchor="middle" className="num" fill="var(--c-faint)">
            {N}
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke="var(--c-accent)" strokeWidth={2.2} />
      {bands.map((b, i) => (
        <text key={i} x={X(b.N) + 5} y={(Y(b.z0) + Y(b.z1)) / 2 + 4} fontSize={10.5} className="num" fill="var(--c-accent)" fontWeight={700}>
          {b.N}
        </text>
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------- storey force table
type ForceRow = { name: string; h: number; w: number; F: number; Vx: number }
const FORCE_COLS: CheckCol<ForceRow>[] = [
  { key: 'w', label: 'w_x (kN)', get: (r) => r.w, abs: 0.5 },
  { key: 'F', label: 'F_x (kN)', get: (r) => r.F, abs: 0.5 },
  { key: 'V', label: 'Storey shear V_x (kN)', get: (r) => r.Vx, abs: 0.5 },
]

// ---------------------------------------------------------------- guided calculator
const OCC = ['', 'I', 'II', 'III', 'IV']

function Calculator() {
  const [pr, setPr] = useState<Prob>({ zone: 2, occ: 2, site: 'SC', n: 6, hs: 3, base: 1.5, area: 600, DL: 10, LL: 2.4, roofLL: 1, pedestal: 100, eta: 1 })
  const [random, setRandom] = useState(false)
  const [plots, setPlots] = useState(false)
  const set = (o: Partial<Prob>) => setPr({ ...pr, ...o })
  const generate = () => {
    setPr(randomProb(Math.floor(Math.random() * 1e9)))
    setRandom(true)
    setPlots(false)
  }
  const { zone, occ, n, hs, base, area, DL, LL, roofLL, pedestal, eta } = pr
  const spt = random && pr.layers ? harmonicN(pr.layers) : null
  const site = pr.site
  const s = sdc(site, zone, occ)
  const sys = rcFrameFor(s)
  const hn = base + n * hs
  const floors = useMemo(() => buildingFloors({ area, DL, LL, roofLL, storeys: n, h: hs, base, pedestal }), [area, DL, LL, roofLL, n, hs, base, pedestal])
  const p = { zone, occ, site, system: sys, hn, eta, floors }
  const r = eqResult(p)
  const key = hashKey(JSON.stringify([pr, random]))
  const id = (k: string) => `eq:calc:${key}:${k}`
  const plotsBlock = (
    <div className="space-y-2">
      <button className="text-sm text-accent underline" onClick={() => setPlots(!plots)}>
        {plots ? 'Hide' : 'Show'} spectrum & storey-force diagram (gives away T, C_s and F_x)
      </button>
      {plots && (
        <>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <SpectrumPlot site={site} T={r.T} eta={eta} />
          </div>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <ForceBars rows={r.rows} V={r.V} />
          </div>
        </>
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
      {random && pr.layers ? (
        <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">
          {[8, 11, 18].includes(n) ? 'An' : 'A'} {n}-storey RC <b>{pr.use}</b> is to be built at <b>{pr.city}</b>. The ground-floor slab is {base} m above the base (pedestal level) and every storey is {hs} m high. Plan {pr.dims![0]} m × {pr.dims![1]} m. Floor dead load {DL} kN/m² (incl. partitions), floor live load {LL} kN/m², roof live load {roofLL} kN/m². Pedestals and grade beams weigh {pedestal} kN in total. Take 5 % damping, the SPT log below for the site, and the least-ductile RC moment frame permitted. Find the base shear and the storey forces.
        </div>
      ) : (
        <>
          <div className="grid cq-md:grid-cols-4 gap-2 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-mute">Seismic zone</span>
              <select className="field" value={zone} onChange={(e) => set({ zone: +e.target.value as 1 })}>
                {[1, 2, 3, 4].map((z) => (
                  <option key={z} value={z}>
                    Zone {z}
                  </option>
                ))}
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
              <span className="text-xs text-mute">Site class</span>
              <select className="field" value={site} onChange={(e) => set({ site: e.target.value as SiteClass })}>
                {(['SA', 'SB', 'SC', 'SD', 'SE'] as SiteClass[]).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-mute">η (damping correction)</span>
              <input className="field" type="number" step={0.05} value={eta} onChange={(e) => set({ eta: +e.target.value || 1 })} />
            </label>
          </div>
          <div className="grid cq-md:grid-cols-3 gap-x-6">
            <Slider label="Storeys above GF" value={n} min={1} max={15} onChange={(v) => set({ n: v })} />
            <Slider label="Storey height" value={hs} min={3} max={4} step={0.5} onChange={(v) => set({ hs: v })} unit=" m" />
            <Slider label="Base → GF" value={base} min={0} max={3} step={0.5} onChange={(v) => set({ base: v })} unit=" m" />
            <Slider label="Plan area" value={area} min={100} max={2500} step={25} onChange={(v) => set({ area: v })} unit=" m²" />
            <Slider label="DL (incl. partitions)" value={DL} min={5} max={15} step={0.5} onChange={(v) => set({ DL: v })} unit=" kN/m²" />
            <Slider label="Floor LL" value={LL} min={1} max={5} step={0.1} onChange={(v) => set({ LL: v })} unit=" kN/m²" />
          </div>
        </>
      )}
      <div className="grid cq-lg:grid-cols-2 gap-4">
        <div key={key} className="rounded-xl border border-line p-3 space-y-1 text-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Your checkpoints</div>
          {random && <Choice id={id('occ')} label="Occupancy" options={[1, 2, 3, 4].map((o) => ({ v: OCC[o], label: OCC[o] }))} answer={OCC[occ]} />}
          <Answer id={id('Z')} label="Z" value={ZONE_Z[zone]} compact />
          <Answer id={id('I')} label="I" value={importanceEQ(occ)} compact />
          {spt && (
            <>
              <Answer id={id('N')} label="N̄ (top 30 m)" value={spt.N} compact />
              <Choice id={id('site')} label="Site class" options={['SB', 'SC', 'SD'].map((v) => ({ v, label: v }))} answer={site} />
            </>
          )}
          <Choice id={id('sdc')} label="SDC" options={['B', 'C', 'D'].map((v) => ({ v, label: v }))} answer={s} />
          <Answer id={id('R')} label={random ? 'R' : `R (${SYSTEMS[sys].name})`} value={SYSTEMS[sys].R} compact />
          <Answer id={id('T')} label={`T (h_n = ${fmt(hn)} m)`} value={r.T} unit="s" compact />
          <Answer id={id('cs')} label="C_s" value={r.Cs} compact />
          <Answer id={id('sa')} label="S_a" value={r.Sa} compact />
          <Answer id={id('W')} label="W" value={r.W} unit="kN" compact />
          <Answer id={id('V')} label="Base shear V" value={r.V} unit="kN" compact />
          <Answer id={id('k')} label="k" value={r.k} compact />
        </div>
        {random && pr.layers ? (
          <div className="space-y-2">
            <div className="rounded-xl bg-bg/60 border border-line p-2">
              <SPTLog layers={pr.layers} />
            </div>
            <table className="tbl w-auto text-sm">
              <thead>
                <tr>
                  <th>Depth (m)</th>
                  <th>Soil</th>
                  <th>N</th>
                </tr>
              </thead>
              <tbody>
                {pr.layers.map((l, i) => {
                  const z0 = pr.layers!.slice(0, i).reduce((a, x) => a + x.d, 0)
                  return (
                    <tr key={i}>
                      <td>
                        {z0} – {z0 + l.d}
                      </td>
                      <td className="txt">{l.soil}</td>
                      <td>{l.N}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          plotsBlock
        )}
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Storey forces — fill the table</div>
        <CheckTable key={key} rows={[...r.rows].sort((a, b) => b.h - a.h)} rowKey={(x) => x.name} given={[{ label: 'Level', get: (x) => x.name }, { label: 'h_x (m)', get: (x) => fmt(x.h) }]} cols={FORCE_COLS} idp={id('tbl')} />
      </div>
      {random && plotsBlock}
      <details>
        <summary className="cursor-pointer text-accent font-semibold text-sm">Full solution table</summary>
        <div className="mt-2 space-y-2">
          {random && (
            <p className="text-sm">
              {pr.use} → occupancy {OCC[occ]}; {pr.city} → zone {zone}.
            </p>
          )}
          {spt && <Tex block>{`\\bar N = \\frac{\\sum d_i}{\\sum d_i/N_i} = \\frac{${fmt(spt.sumD)}}{${fmt(spt.sumDN, 4)}} = ${fmt(spt.N, 3)}\\ \\Rightarrow\\ \\text{site class } ${site}`}</Tex>}
          <EQSolution {...p} sdcNote={<p className="text-sm">SDC {s} → least-ductile RC frame permitted: {SYSTEMS[sys].name}.</p>} />
        </div>
      </details>
    </div>
  )
}

function SPTGame() {
  const { seed, next } = useSeed(3)
  const layers = useMemo(() => {
    const r = rng(seed)
    const n = randInt(r, 4, 6)
    const out: { d: number; N: number }[] = []
    let rem = 30
    for (let k = 0; k < n; k++) {
      const d = k === n - 1 ? rem : Math.min(rem - (n - k - 1), randInt(r, 3, 9))
      rem -= d
      out.push({ d, N: randInt(r, 4, 60) })
    }
    return out
  }, [seed])
  const h = harmonicN(layers)
  const site = siteFromN(h.N)
  return (
    <div className="grid cq-md:grid-cols-2 gap-4 text-sm">
      <div>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Layer</th>
              <th>thickness d (m)</th>
              <th>N</th>
            </tr>
          </thead>
          <tbody>
            {layers.map((l, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{l.d}</td>
                <td>{l.N}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn mt-2" onClick={next}>
          ↻ New soil profile
        </button>
      </div>
      <div className="space-y-1">
        <Tex block>{`\\bar N = \\frac{\\sum d_i}{\\sum d_i/N_i}`}</Tex>
        <Answer key={seed} id={`eq:spt:${seed}`} label="N̄" value={h.N} />
        <Choice key={'c' + seed} id={`eq:sptc:${seed}`} label="Site class" options={['SB', 'SC', 'SD'].map((v) => ({ v, label: v }))} answer={site} />
        <div className="text-xs text-faint">SB: N̄ &gt; 50 · SC: 15–50 · SD: &lt; 15 (SA rock by V_s &gt; 800 m/s; SE special profile).</div>
      </div>
    </div>
  )
}

function SpectrumExplorer() {
  const [site, setSite] = useState<SiteClass>('SC')
  const [T, setT] = useState(0.8)
  const [eta, setEta] = useState(1)
  return (
    <div className="grid cq-md:grid-cols-[1.4fr_1fr] gap-4">
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <SpectrumPlot site={site} T={T} eta={eta} />
      </div>
      <div className="space-y-2 text-sm">
        <Seg value={site} onChange={setSite} items={(['SA', 'SB', 'SC', 'SD', 'SE'] as SiteClass[]).map((v) => ({ v, label: v }))} />
        <Slider label="T" value={T} min={0.05} max={4} step={0.01} onChange={setT} unit=" s" />
        <Slider label="η" value={eta} min={0.55} max={1.4} step={0.05} onChange={setEta} />
        <div>
          S = {SOIL[site].S}, T_B = {SOIL[site].TB}, T_C = {SOIL[site].TC}, T_D = {SOIL[site].TD} → C_s = <b className="num">{fmt(Cs(T, site, eta).Cs, 4)}</b> (branch {Cs(T, site, eta).branch})
        </div>
      </div>
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Equivalent static force method (BNBC 2020 Sec 2.5)" right={<div className="w-72 hidden cq-md:block"><TopicFrequency topic="eq" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`S_a = \\frac{2}{3}\\,\\frac{ZI}{R}\\,C_s\\ \\ \\left(\\ge 0.67\\beta ZIS,\\ \\beta = 0.11;\\ \\tfrac{I}{R}\\le 1\\right)`}</Tex>
            <Tex block>{`V = S_aW,\\qquad F_x = V\\frac{w_xh_x^k}{\\sum w_ih_i^k}`}</Tex>
            <Tex block>{`T = C_th_n^m\\ \\ (\\text{RC MRF: } C_t = 0.0466,\\ m = 0.9)`}</Tex>
            <Tex block>{`k = 1\\ (T \\le 0.5),\\ 2\\ (T \\ge 2.5),\\ \\text{linear between}`}</Tex>
          </div>
          <div>
            <Tex block>{`C_s = \\begin{cases}S\\left(1 + \\frac{T}{T_B}(2.5\\eta - 1)\\right) & 0 \\le T \\le T_B\\\\ 2.5S\\eta & T_B \\le T \\le T_C\\\\ 2.5S\\eta\\frac{T_C}{T} & T_C \\le T \\le T_D\\\\ 2.5S\\eta\\frac{T_CT_D}{T^2} & T_D \\le T \\le 4\\text{ s}\\end{cases}`}</Tex>
            <Md>{`$\\eta = \\sqrt{10/(5+\\xi)} \\ge 0.55$ → 1 for 5 % damping. The 2/3 converts the MCE map value Z to the design earthquake.`}</Md>
          </div>
        </div>
      </Section>
      <Section title="Tables you need">
        <div className="grid cq-lg:grid-cols-3 gap-4 text-sm">
          <table className="tbl">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Z</th>
                <th>e.g.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>0.12</td>
                <td className="txt">Khulna, Barisal, Rajshahi</td>
              </tr>
              <tr>
                <td>2</td>
                <td>0.20</td>
                <td className="txt">Dhaka, Comilla, Pabna</td>
              </tr>
              <tr>
                <td>3</td>
                <td>0.28</td>
                <td className="txt">Chittagong, Rangpur</td>
              </tr>
              <tr>
                <td>4</td>
                <td>0.36</td>
                <td className="txt">Sylhet, Mymensingh</td>
              </tr>
            </tbody>
          </table>
          <table className="tbl">
            <thead>
              <tr>
                <th>Site</th>
                <th>S</th>
                <th>T_B</th>
                <th>T_C</th>
                <th>T_D</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(SOIL) as SiteClass[]).map((k) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{SOIL[k].S}</td>
                  <td>{SOIL[k].TB}</td>
                  <td>{SOIL[k].TC}</td>
                  <td>{SOIL[k].TD}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="tbl">
            <thead>
              <tr>
                <th>RC frame</th>
                <th>R</th>
                <th>Ω₀</th>
                <th>C_d</th>
                <th>B/C/D</th>
              </tr>
            </thead>
            <tbody>
              {(['SMF_rc', 'IMF_rc', 'OMF_rc', 'SMF_steel', 'IMF_steel', 'OMF_steel'] as const).map((k) => (
                <tr key={k}>
                  <td className="txt">{SYSTEMS[k].name.replace(' moment frame', '')}</td>
                  <td>{SYSTEMS[k].R}</td>
                  <td>{SYSTEMS[k].Omega}</td>
                  <td>{SYSTEMS[k].Cd}</td>
                  <td>
                    {SYSTEMS[k].limit.B}/{SYSTEMS[k].limit.C}/{SYSTEMS[k].limit.D}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid cq-md:grid-cols-2 gap-4 mt-3 text-sm">
          <Md>{`**Importance factor**: occupancy I & II → 1.0, III (> 300 people, schools > 250, health care ≥ 50 beds…) → 1.25, IV (hospitals with surgery/emergency, fire/police stations, **designated shelters**, emergency centres) → 1.5.

**Seismic design category** (Table 6.2.18): Occ I–III — SA: B C C D, SB/SC: B C D D, SD: C D D D; Occ IV — SA–SC: C D D D, SD: D D D D (zones 1–4). SE: always D.`}</Md>
          <Md>{`**Seismic weight W** = dead load (incl. partitions) + **25 % of live load** (LL ≤ 3 kN/m²; 50 % if > 3) + 100 % of permanent equipment. The lecture exercise also adds 25 % of the roof live load and the pedestal weight at the base.

**Site class from SPT**: harmonic mean $\\bar N = \\sum d_i / \\sum (d_i/N_i)$ over the top 30 m: SB > 50, SC 15–50, SD < 15.`}</Md>
        </div>
        <Callout kind="exam">Every paper since 2021 has one EQ problem (≈ 30 marks): base shear and storey forces of a 3–8-storey RC building, sometimes with SPT data (→ site class), occupancy (shelter → IV), SDC and choice of frame system.</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  const ex = { zone: 2 as const, occ: 2 as const, site: 'SC' as SiteClass, system: 'IMF_rc' as const, hn: 25.5, floors: buildingFloors({ area: 600, DL: 10, LL: 2.4, roofLL: 1, storeys: 8, h: 3, base: 1.5, pedestal: 120 }) }
  return (
    <div>
      <Section title="13 steps, always in this order (Lec 13 exercise)">
        <Steps>
          <Step n={1} title="Occupancy category → I" />
          <Step n={2} title="Site class (given, or from N̄ / V̄s / s̄u)" />
          <Step n={3} title="Zone → Z" />
          <Step n={4} title="Seismic design category (Table 6.2.18)" />
          <Step n={5} title="Structural system → R, Ω₀, C_d (permitted in that SDC)" />
          <Step n={6} title="h_n and T = C_t h_n^m" />
          <Step n={7} title="S, T_B, T_C, T_D → C_s (pick the right branch!)" />
          <Step n={8} title="S_a = (2/3)(ZI/R)C_s, check the minimum" />
          <Step n={9} title="Seismic weight of each level (DL + 25 % LL)" />
          <Step n={10} title="V = S_a W" />
          <Step n={11} title="k from T" />
          <Step n={12} title="F_x for every level" />
          <Step n={13} title="Storey shears (cumulative from the top)" />
        </Steps>
      </Section>
      <Section title="The lecture exercise, reproduced" sub="8-storey RC office, Dhaka, IMF, SC, 30 × 20 m, DL 10 kN/m², LL 2.4, roof LL 1, pedestals 120 kN — V = 3057.6 kN">
        <EQSolution {...ex} />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Earthquake calculator with checkpoints" sub="Change the building and site; fill the checkpoints, then open the full table.">
        <Calculator />
      </Section>
      <Section title="Response spectrum explorer">
        <SpectrumExplorer />
      </Section>
      <Section title="SPT → site class drill">
        <SPTGame />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const eqP = (id: string, level: PYQ['level'], title: string, text: string, p: Parameters<typeof eqResult>[0], highlight?: string): PYQ => ({
  id: `own-eq-${id}`,
  paper: 'own',
  level,
  sec: 'A',
  no: id,
  marks: 0,
  topics: ['eq'],
  title,
  text,
  pages: [],
  checks: () => {
    const r = eqResult(p)
    const out = [
      { key: 'T', label: 'T', value: r.T, unit: 's' },
      { key: 'V', label: 'Base shear V', value: r.V, unit: 'kN' },
    ]
    if (highlight) out.push({ key: 'F', label: `F at ${highlight}`, value: r.rows.find((x) => x.name === highlight)!.F, unit: 'kN' })
    return out
  },
  solution: () => <EQSolution {...p} levels={highlight ? [highlight] : undefined} />,
})
const problems: PYQ[] = [
  eqP('1', 'warm-up', '4-storey school at Rajshahi', 'RC school (occupancy III), zone 1, site SC. Decide the SDC and the least-ductile RC frame permitted first. Storeys 3.5 m, GF 1.5 m above base, plan 25 × 15 m, DL 9 kN/m², LL 3 kN/m², roof LL 1, pedestals 80 kN.', { zone: 1, occ: 3, site: 'SC', system: rcFrameFor(sdc('SC', 1, 3)), hn: 1.5 + 4 * 3.5, floors: buildingFloors({ area: 375, DL: 9, LL: 3, roofLL: 1, storeys: 4, h: 3.5, base: 1.5, pedestal: 80 }) }, 'Roof'),
  eqP('2', 'exam', '10-storey apartment at Chittagong', 'Occupancy II, zone 3, site SD (find SDC and frame). Storeys 3 m, GF 1.5 m, plan 20 × 20 m, DL 10, LL 2, roof LL 1 kN/m², pedestals 150 kN. Base shear and the force at level 5.', { zone: 3, occ: 2, site: 'SD', system: rcFrameFor(sdc('SD', 3, 2)), hn: 31.5, floors: buildingFloors({ area: 400, DL: 10, LL: 2, roofLL: 1, storeys: 10, h: 3, base: 1.5, pedestal: 150 }) }, 'L5'),
  eqP('3', 'exam', 'Hospital at Sylhet (stiff soil)', 'Occupancy IV (surgery), zone 4, site SB, 5 storeys × 3.5 m, GF 2 m, plan 30 × 30 m, DL 11, LL 3.5 kN/m² (→ 50 % in W), roof LL 1.5, pedestals 200 kN.', { zone: 4, occ: 4, site: 'SB', system: 'SMF_rc', hn: 2 + 5 * 3.5, floors: buildingFloors({ area: 900, DL: 11, LL: 3.5, roofLL: 1.5, storeys: 5, h: 3.5, base: 2, pedestal: 200 }) }, 'Roof'),
  eqP('4', 'challenge', 'Tall steel frame (k > 1)', 'Special steel moment frame office (occupancy II), zone 2, site SC, 18 storeys × 3.5 m on a rigid basement (h_n = 63 m), plan 30 × 30 m, DL 7, LL 2.4 kN/m², roof LL 1.', { zone: 2, occ: 2, site: 'SC', system: 'SMF_steel', ct: 'steel_mrf', hn: 63, floors: buildingFloors({ area: 900, DL: 7, LL: 2.4, roofLL: 1, storeys: 18, h: 3.5, base: 0 }) }, 'Roof'),
]

void [CT, kExponent, period, baseShear]
const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
