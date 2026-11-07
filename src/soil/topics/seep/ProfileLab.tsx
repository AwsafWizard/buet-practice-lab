// σ / u / σ′ profile builder: layers, water table (or standing water), capillary zone, upward / downward seepage
// across one layer. Draws the soil column and the three diagrams with their controlling ordinates.

import { useMark } from './useMark'
import { useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { tipAxes } from '../../../components/PointTip'
import { Md, Reveal, Seg } from '../../../components/ui'
import { CheckTable, hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider, useSeed } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { profile, stressAt, type ProfileIn, type SoilLayer, type StressPt } from '../../engine/stresses'
import { GW } from '../../engine/units'

const f2 = (v: number) => fmt(v, 2)
const SOILS = ['Clay', 'Sand', 'Silt', 'Silty clay', 'Gravel']
const FILL = ['var(--c-soil)', 'color-mix(in oklab, var(--c-soil) 55%, var(--c-load))', 'color-mix(in oklab, var(--c-soil) 60%, var(--c-accent))', 'color-mix(in oklab, var(--c-soil) 70%, var(--c-ink))']

export interface ProfState {
  layers: SoilLayer[]
  wt: number
  hc: number
  flow: 'none' | 'up' | 'down'
  flowLayer: number
  dh: number
}

export const PROF_DEFAULT: ProfState = {
  layers: [
    { name: 'Clay', H: 3, gamma: 15, gammaSat: 18 },
    { name: 'Sand', H: 7, gamma: 20, gammaSat: 20 },
  ],
  wt: 2,
  hc: 0,
  flow: 'none',
  flowLayer: 0,
  dh: 1,
}

export const toProfileIn = (s: ProfState): ProfileIn => ({ layers: s.layers, wt: s.wt, hc: s.hc, flow: s.flow === 'none' ? undefined : { layer: Math.min(s.flowLayer, s.layers.length - 1), dh: s.flow === 'up' ? s.dh : -s.dh } })

export function randomProfile(seed: number, level: 'basic' | 'exam' | 'tough' = 'exam'): ProfState {
  const r = rng(seed * 7717 + 31)
  const n = level === 'basic' ? 2 : randInt(r, 2, 3)
  const layers: SoilLayer[] = []
  for (let k = 0; k < n; k++) {
    const name = pick(r, SOILS)
    const gs = randInt(r, 170, 210) / 10
    layers.push({ name, H: randInt(r, 2, 8) / (k === 0 ? 2 : 1), gamma: Math.round((gs - randInt(r, 15, 35) / 10) * 10) / 10, gammaSat: gs })
  }
  const tot = layers.reduce((s, l) => s + l.H, 0)
  const wt = level === 'basic' ? randInt(r, 0, 4) / 2 : pick(r, [-1, -0.5, 0, 1, 1.5, 2, 2.5, 3].filter((w) => w < tot - 1))
  const hc = level !== 'basic' && wt > 1 && r() < 0.45 ? Math.min(wt, randInt(r, 2, 4) / 2) : 0
  const flow: ProfState['flow'] = level === 'tough' ? pick(r, ['up', 'down']) : level === 'exam' && r() < 0.3 ? pick(r, ['up', 'down']) : 'none'
  const flowLayer = Math.max(0, layers.findIndex((_, k) => layers.slice(0, k).reduce((s, l) => s + l.H, 0) >= Math.max(0, wt)))
  return { layers, wt, hc, flow, flowLayer: flowLayer < 0 ? n - 1 : flowLayer, dh: randInt(r, 2, 8) / 2 }
}

/** the soil column + σ, u, σ′ diagrams */
export function ProfileFigure({ s, pts }: { s: ProfState; pts: StressPt[] }) {
  const tot = s.layers.reduce((a, l) => a + l.H, 0)
  const top = Math.min(0, s.wt)
  const W = 720
  const H = 300
  const y0 = 34
  const ky = (H - y0 - 22) / (tot - top)
  const Y = (z: number) => y0 + (z - top) * ky
  const colW = 120
  const pw = (W - colW - 40) / 3
  const smax = Math.max(1, ...pts.map((p) => p.sigma))
  const umin = Math.min(0, ...pts.map((p) => p.u))
  const span = smax - umin
  const kx = (pw - 34) / span
  const diag = (k: number, get: (p: StressPt) => number, color: string, title: string, sym: string) => {
    const x0 = colW + 30 + k * pw
    const zero = x0 + 4 + (0 - umin) * kx
    const X = (v: number) => zero + v * kx
    const d = `M${zero},${Y(pts[0].z)}` + pts.map((p) => `L${X(get(p)).toFixed(1)},${Y(p.z).toFixed(1)}`).join('') + `L${zero},${Y(pts[pts.length - 1].z)}Z`
    return (
      <g key={title} {...tipAxes({ X, Y, x: sym, xUnit: ' kPa', y: 'z', yUnit: ' m' })}>
        <text x={zero} y={14} fontSize={12} fontWeight={700} fill={color}>
          {title}
        </text>
        <line x1={zero} y1={y0 - 6} x2={zero} y2={H - 14} stroke="var(--c-line)" />
        <path d={d} fill={color} opacity={0.18} stroke={color} strokeWidth={1.5} />
        {pts.map((p, i) => (
          <text key={i} x={X(get(p)) + (get(p) < 0 ? -3 : 3)} y={Y(p.z) + (i % 2 ? 11 : -3)} fontSize={9.5} fill="var(--c-ink)" textAnchor={get(p) < 0 ? 'end' : 'start'}>
            {f2(get(p))}
          </text>
        ))}
      </g>
    )
  }
  let z = 0
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="soil profile with total, pore and effective stress diagrams">
      {s.wt < 0 && <rect x={20} y={Y(s.wt)} width={colW - 30} height={Y(0) - Y(s.wt)} fill="var(--c-water)" opacity={0.18} />}
      {s.layers.map((l, k) => {
        const a = z
        z += l.H
        return (
          <g key={k}>
            <rect x={20} y={Y(a)} width={colW - 30} height={Y(z) - Y(a)} fill={FILL[k % FILL.length]} opacity={0.55} stroke="var(--c-ink)" strokeWidth={0.8} />
            <text x={24} y={(Y(a) + Y(z)) / 2 - 2} fontSize={10.5} fontWeight={600} fill="var(--c-ink)">
              {l.name}
            </text>
            <text x={24} y={(Y(a) + Y(z)) / 2 + 10} fontSize={9} fill="var(--c-mute)">
              {l.gamma !== l.gammaSat ? `γ ${l.gamma}, γsat ${l.gammaSat}` : `γ ${l.gamma}`}
            </text>
            <text x={colW - 6} y={Y(z) - 2} fontSize={9} fill="var(--c-mute)">
              {f2(z)} m
            </text>
          </g>
        )
      })}
      {s.hc > 0 && s.wt - s.hc > 0 && <rect x={20} y={Y(s.wt - s.hc)} width={colW - 30} height={Y(s.wt) - Y(s.wt - s.hc)} fill="var(--c-water)" opacity={0.22} />}
      {s.hc > 0 && s.wt - s.hc > 0 && (
        <text x={colW - 12} y={Y(s.wt - s.hc) + 10} fontSize={8.5} textAnchor="end" fill="var(--c-water)">
          capillary
        </text>
      )}
      <line x1={14} y1={Y(Math.max(s.wt, top))} x2={colW - 6} y2={Y(Math.max(s.wt, top))} stroke="var(--c-water)" strokeWidth={1.5} />
      <path d={`M${colW - 18},${Y(s.wt) - 9}L${colW - 8},${Y(s.wt) - 9}L${colW - 13},${Y(s.wt) - 1}Z`} fill="var(--c-water)" />
      {s.flow !== 'none' && (
        <text x={colW - 14} y={Y(tot) - 6} fontSize={16} textAnchor="middle" fill="var(--c-water)">
          {s.flow === 'up' ? '↑' : '↓'}
        </text>
      )}
      <line x1={14} y1={Y(0)} x2={colW - 6} y2={Y(0)} stroke="var(--c-ink)" strokeWidth={1.5} />
      <text x={14} y={Y(0) - 4} fontSize={9} fill="var(--c-mute)">
        GL
      </text>
      {diag(0, (p) => p.sigma, 'var(--c-load)', 'σ (kPa)', 'σ')}
      {diag(1, (p) => p.u, 'var(--c-water)', 'u (kPa)', 'u')}
      {diag(2, (p) => p.eff, 'var(--c-accent)', 'σ′ (kPa)', 'σ′')}
    </svg>
  )
}

export function ProfileSolution({ s }: { s: ProfState }) {
  const p = toProfileIn(s)
  const pts = profile(p)
  let z = 0
  const tops = s.layers.map((l) => {
    const a = z
    z += l.H
    return a
  })
  const capTop = s.wt - s.hc
  return (
    <div className="space-y-2 text-sm">
      <Md>{`- **σ**: add $\\gamma \\times$ thickness down the column (${s.wt < 0 ? `plus the standing water ${f2(-s.wt)} × 9.81 = ${f2(-s.wt * GW)} kPa at GL; ` : ''}moist γ above ${s.hc > 0 ? 'the capillary zone' : 'the water table'}, γsat below${s.hc > 0 ? ' — the capillary zone is saturated' : ''}).
- **u**: zero above ${s.hc > 0 ? 'the capillary zone' : 'the WT'}${s.hc > 0 ? `; inside the capillary zone u = −(height above the WT) × γw, down to $-${f2(s.hc)} \\times 9.81 = -${f2(s.hc * GW)}$ kPa at its top` : ''}; below the WT $u = z_w\\gamma_w$.${p.flow ? ` Seepage across the ${s.layers[p.flow.layer].name.toLowerCase()} layer (${f2(tops[p.flow.layer])}–${f2(tops[p.flow.layer] + s.layers[p.flow.layer].H)} m) adds ${p.flow.dh > 0 ? 'an excess' : 'a loss of'} $${f2(Math.abs(p.flow.dh))}$ m of head at its bottom, growing linearly from zero at its top (i = ${f2(Math.abs(p.flow.dh) / s.layers[p.flow.layer].H)}); below it the ${p.flow.dh > 0 ? 'excess' : 'loss'} stays: ${p.flow.dh > 0 ? 'upward flow lowers σ′ by izγw' : 'downward flow raises σ′ by izγw'}.` : ''}
- **σ′ = σ − u** at each controlling depth; all three diagrams are straight between them.`}</Md>
      <table className="tbl w-auto">
        <thead>
          <tr>
            <th>depth (m)</th>
            <th></th>
            <th>σ (kPa)</th>
            <th>u (kPa)</th>
            <th>σ′ (kPa)</th>
          </tr>
        </thead>
        <tbody>
          {pts.map((q, i) => (
            <tr key={i}>
              <td>{f2(q.z)}</td>
              <td className="txt text-mute text-xs">{q.label ?? ''}</td>
              <td>{f2(q.sigma)}</td>
              <td>{f2(q.u)}</td>
              <td>{f2(q.eff)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {s.hc > 0 && capTop > 0 && <p className="text-xs text-faint">At {f2(capTop)} m σ′ jumps by {f2(s.hc * GW)} kPa (the suction switches on); it is drawn as two values at the same depth.</p>}
    </div>
  )
}

export function ProfileLab() {
  const [s, setS] = useState<ProfState>(PROF_DEFAULT)
  const { seed, next } = useSeed(5)
  const p = toProfileIn(s)
  const pts = profile(p)
  const tot = s.layers.reduce((a, l) => a + l.H, 0)
  useMark('w-eff', { flow: s.flow })
  const idp = `sm-seep:lab:prof:${hashKey(JSON.stringify(s))}`
  const setLayer = (k: number, q: Partial<SoilLayer>) => setS({ ...s, layers: s.layers.map((l, i) => (i === k ? { ...l, ...q } : l)) })
  const rows = pts.map((q, i) => ({ ...q, key: `${i}` }))
  const at = (z: number) => stressAt(p, z)
  const [probe, setProbe] = useState(5)
  const pz = Math.min(tot, Math.max(0, probe))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn !py-1 !px-3"
          onClick={() => {
            next()
            setS(randomProfile(seed + 1))
          }}
        >
          🎲 Exam-style profile
        </button>
        <button className="btn !py-1 !px-3" onClick={() => setS(PROF_DEFAULT)}>
          2020-21 Q2(b)
        </button>
        <button
          className="btn !py-1 !px-3"
          onClick={() =>
            setS({ layers: [{ name: 'Sand', H: 2, gamma: 20.58, gammaSat: 20.58 }], wt: -0.7, hc: 0, flow: 'up', flowLayer: 0, dh: 1.5 })
          }
        >
          Lecture 14: upward flow
        </button>
        {s.layers.length < 4 && (
          <button className="btn !py-1 !px-3" onClick={() => setS({ ...s, layers: [...s.layers, { name: pick(Math.random, SOILS), H: 3, gamma: 18, gammaSat: 20 }] })}>
            + layer
          </button>
        )}
      </div>
      <div className="grid cq-lg:grid-cols-[minmax(0,1fr)_18rem] gap-4">
        <div className="rounded-xl border border-line bg-bg/60 p-2">
          <ProfileFigure s={s} pts={pts} />
        </div>
        <div className="space-y-2">
          {s.layers.map((l, k) => (
            <div key={k} className="card p-2 space-y-1">
              <div className="flex items-center gap-2">
                <select className="field !py-0.5 !text-xs" value={l.name} onChange={(e) => setLayer(k, { name: e.target.value })}>
                  {SOILS.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
                {s.layers.length > 1 && (
                  <button className="ml-auto text-xs text-faint hover:text-bad" onClick={() => setS({ ...s, layers: s.layers.filter((_, i) => i !== k), flowLayer: 0 })}>
                    remove
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <NumIn label="H" value={l.H} onChange={(v) => Number.isFinite(v) && v > 0 && setLayer(k, { H: v })} step={0.5} unit="m" w="w-14" />
                <NumIn label="γ" value={l.gamma} onChange={(v) => Number.isFinite(v) && setLayer(k, { gamma: v })} step={0.5} w="w-14" />
                <NumIn label="γsat" value={l.gammaSat} onChange={(v) => Number.isFinite(v) && setLayer(k, { gammaSat: v })} step={0.5} w="w-14" />
              </div>
            </div>
          ))}
          <div className="card p-2 space-y-1">
            <Slider label="WT depth (− = water above GL)" value={s.wt} min={-3} max={tot} step={0.1} unit=" m" onChange={(wt) => setS({ ...s, wt, hc: Math.min(s.hc, Math.max(0, wt)) })} />
            <Slider label="capillary rise" value={s.hc} min={0} max={Math.max(0, Math.min(3, s.wt))} step={0.1} unit=" m" onChange={(hc) => setS({ ...s, hc })} />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-mute">seepage</span>
              <Seg size="xs" value={s.flow} onChange={(flow) => setS({ ...s, flow })} items={[{ v: 'none', label: 'none' }, { v: 'up', label: '↑ up' }, { v: 'down', label: '↓ down' }]} />
            </div>
            {s.flow !== 'none' && (
              <>
                <label className="text-sm flex items-center gap-2">
                  <span className="text-mute">across</span>
                  <select className="field !py-0.5 !text-xs" value={s.flowLayer} onChange={(e) => setS({ ...s, flowLayer: +e.target.value })}>
                    {s.layers.map((l, k) => (
                      <option key={k} value={k}>
                        layer {k + 1} ({l.name})
                      </option>
                    ))}
                  </select>
                </label>
                <Slider label="head difference" value={s.dh} min={0.1} max={10} step={0.1} unit=" m" onChange={(dh) => setS({ ...s, dh })} />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="card p-3">
        <div className="text-sm font-semibold mb-1">Fill the controlling ordinates</div>
        <CheckTable
          rows={rows}
          rowKey={(r) => r.key}
          given={[
            { label: 'depth (m)', get: (r) => f2(r.z) },
            { label: '', get: (r) => <span className="text-xs text-mute">{r.label ?? ''}</span> },
          ]}
          cols={[
            { key: 's', label: 'σ (kPa)', get: (r) => r.sigma, abs: 0.3, digits: 2 },
            { key: 'u', label: 'u (kPa)', get: (r) => r.u, abs: 0.3, digits: 2 },
            { key: 'e', label: 'σ′ (kPa)', get: (r) => r.eff, abs: 0.3, digits: 2 },
          ]}
          idp={idp}
        />
      </div>
      <div className="card p-3 text-sm flex flex-wrap items-center gap-3">
        <span className="font-semibold">Any depth:</span>
        <NumIn label="z" value={probe} onChange={(v) => Number.isFinite(v) && setProbe(v)} step={0.25} unit="m" w="w-16" />
        <span className="num">
          σ = {f2(at(pz).sigma)}, u = {f2(at(pz).u)}, σ′ = <b>{f2(at(pz).eff)}</b> kPa
        </span>
      </div>
      <Reveal id={`${idp}:sol`} title="Full solution">
        <ProfileSolution s={s} />
      </Reveal>
    </div>
  )
}
