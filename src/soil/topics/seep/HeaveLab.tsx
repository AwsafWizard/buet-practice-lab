// Two upward-seepage labs: (1) base heave of an excavation in clay over a sand under hydrostatic / artesian head,
// (2) quick condition in an upward-flow column and the weighting filter that restores a target FS.

import { useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Md, Reveal, Seg } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider, useSeed } from '../../../labs/common'
import { StatusBox } from '../../../labs/playground'
import { eFromN, excavationHeave, filterDepth, gsubFromGsE, icrFromGsE, sandHead, type HeaveIn } from '../../engine/stresses'
import { GW } from '../../engine/units'
import { markUsed } from '../../reference/pane'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

// ---------------------------------------------------------------- excavation
export interface ExState {
  Hc: number
  gSat: number
  wt: number
  /** artesian: sand head above GL (m); null = hydrostatic from the WT */
  art: number | null
  pit: number
  d: number
  FS: number
}
export const EX_DEFAULT: ExState = { Hc: 12, gSat: 18.5, wt: 0, art: null, pit: 0, d: 9, FS: 1 }
export const exIn = (s: ExState): HeaveIn => ({ Hc: s.Hc, gSat: s.gSat, wt: s.wt, hp: s.art === null ? undefined : s.Hc + s.art, pitWater: s.pit })

export function randomEx(seed: number): ExState {
  const r = rng(seed * 4241 + 7)
  const Hc = randInt(r, 6, 16)
  const art = r() < 0.35 ? randInt(r, 1, 6) / 2 : null
  return { Hc, gSat: randInt(r, 165, 200) / 10, wt: art === null ? pick(r, [0, 0, 0, 1, 1.5]) : 0, art, pit: 0, d: Math.round(Hc * (0.3 + 0.5 * r()) * 2) / 2, FS: pick(r, [1, 1, 1.2, 1.5]) }
}

export function ExFigure({ s }: { s: ExState }) {
  const o = exIn(s)
  const r = excavationHeave(o, s.d, s.FS)
  const hp = sandHead(o)
  const top = Math.max(1, (s.art ?? 0) + 1)
  const sandT = 3
  const W = 560
  const H = 260
  const k = (H - 30) / (s.Hc + sandT + top)
  const Y = (depth: number) => 10 + (depth + top) * k
  const pitL = 170
  const pitR = 330
  const safe = r.FS >= s.FS
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[600px]" role="img" aria-label="excavation in clay over sand">
      <rect x={20} y={Y(0)} width={W - 40} height={Y(s.Hc) - Y(0)} fill="var(--c-soil)" opacity={0.5} />
      <rect x={20} y={Y(s.Hc)} width={W - 40} height={Y(s.Hc + sandT) - Y(s.Hc)} fill="color-mix(in oklab, var(--c-soil) 55%, var(--c-load))" opacity={0.45} />
      <rect x={pitL} y={Y(0) - 1} width={pitR - pitL} height={Y(s.d) - Y(0) + 1} fill="var(--c-bg)" />
      {s.pit > 0 && <rect x={pitL} y={Y(s.d - s.pit)} width={pitR - pitL} height={Y(s.d) - Y(s.d - s.pit)} fill="var(--c-water)" opacity={0.2} />}
      <path d={`M20,${Y(0)}L${pitL},${Y(0)}L${pitL},${Y(s.d)}L${pitR},${Y(s.d)}L${pitR},${Y(0)}L${W - 20},${Y(0)}`} fill="none" stroke="var(--c-ink)" strokeWidth={1.5} />
      <line x1={20} y1={Y(s.Hc + sandT)} x2={W - 20} y2={Y(s.Hc + sandT)} stroke="var(--c-ink)" strokeWidth={1.5} />
      <text x={26} y={Y(s.Hc / 2)} fontSize={11} fill="var(--c-ink)">
        Clay γsat = {s.gSat}
      </text>
      <text x={26} y={Y(s.Hc + 1.6)} fontSize={11} fill="var(--c-ink)">
        Sand (aquifer)
      </text>
      {/* WT outside */}
      <line x1={20} y1={Y(s.wt)} x2={pitL - 6} y2={Y(s.wt)} stroke="var(--c-water)" strokeWidth={1.3} strokeDasharray="5 3" />
      <text x={pitL - 10} y={Y(s.wt) - 3} fontSize={9.5} textAnchor="end" fill="var(--c-water)">
        WT
      </text>
      {/* plug */}
      <rect x={pitL} y={Y(s.d)} width={pitR - pitL} height={Y(s.Hc) - Y(s.d)} fill={safe ? 'var(--c-good)' : 'var(--c-bad)'} opacity={0.12} />
      <text x={(pitL + pitR) / 2} y={(Y(s.d) + Y(s.Hc)) / 2 + 4} fontSize={11} textAnchor="middle" fill="var(--c-ink)">
        plug {f2(s.Hc - s.d)} m: {f2(r.W)} kPa
      </text>
      {/* uplift arrows */}
      {[0.2, 0.5, 0.8].map((t) => {
        const x = pitL + t * (pitR - pitL)
        return <path key={t} d={`M${x},${Y(s.Hc) + 18}L${x},${Y(s.Hc) + 3}M${x - 4},${Y(s.Hc) + 8}L${x},${Y(s.Hc) + 2}L${x + 4},${Y(s.Hc) + 8}`} stroke="var(--c-water)" strokeWidth={1.6} fill="none" />
      })}
      <text x={pitR + 6} y={Y(s.Hc) + 14} fontSize={10} fill="var(--c-water)">
        u = {f2(r.u)} kPa
      </text>
      {/* piezometer into the sand */}
      <line x1={W - 70} y1={Y(s.Hc + 1)} x2={W - 70} y2={Y(s.Hc - hp) - 4} stroke="var(--c-ink)" strokeWidth={0.8} />
      <line x1={W - 62} y1={Y(s.Hc + 1)} x2={W - 62} y2={Y(s.Hc - hp) - 4} stroke="var(--c-ink)" strokeWidth={0.8} />
      <rect x={W - 69} y={Y(s.Hc - hp)} width={6} height={Y(s.Hc + 1) - Y(s.Hc - hp)} fill="var(--c-water)" opacity={0.5} />
      <path d={`M${W - 71},${Y(s.Hc - hp) - 8}L${W - 61},${Y(s.Hc - hp) - 8}L${W - 66},${Y(s.Hc - hp) - 1}Z`} fill="var(--c-water)" />
      <text x={W - 56} y={Y(s.Hc - hp) + 4} fontSize={9.5} fill="var(--c-water)">
        hp = {f2(hp)} m
      </text>
      <text x={(pitL + pitR) / 2} y={Y(s.d) - 6} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        d = {f2(s.d)} m
      </text>
    </svg>
  )
}

export function ExSolution({ s }: { s: ExState }) {
  const o = exIn(s)
  const r = excavationHeave(o, s.d, s.FS)
  const hp = sandHead(o)
  return (
    <Md>{`1. Head in the sand at the clay base: ${s.art === null ? `hydrostatic from the WT, $h_p = ${f2(s.Hc)} - ${f2(s.wt)} = ${f2(hp)}$ m` : `artesian, ${f2(s.art)} m above GL, so $h_p = ${f2(s.Hc)} + ${f2(s.art)} = ${f2(hp)}$ m`}; $u = h_p\\gamma_w = ${f2(hp)} \\times 9.81 = ${f2(r.u)}$ kPa.
2. Downward stress of the clay left below the pit: $(H_c - d)\\gamma${s.wt > s.d ? ' (moist above the WT)' : '_{sat}'}${s.pit ? ` + pit water ${f2(s.pit)} × 9.81` : ''} $= ${f2(r.W)}$ kPa${s.pit ? '' : ' (the pit is pumped dry to its bottom)'}.
3. $FS = ${f2(r.W)}/${f2(r.u)} = ${f3(r.FS)}$ → ${r.FS >= s.FS ? '**safe**' : r.FS >= 1 ? '**not enough margin**' : '**the base heaves (blows up) before this depth**'}.
4. Deepest pit (σ′ = 0 at the clay base, FS = 1): $(H_c - d)\\gamma_{sat} = h_p\\gamma_w$ → $d_{max} = ${f3(r.dMax)}$ m${s.FS > 1 ? `; with FS = ${s.FS}: $d = ${f3(r.dSafe)}$ m` : ''}.
5. To reach ${f2(s.d)} m the sand head must be at most $${f2(r.W)}/(${s.FS} \\times 9.81) = ${f3(r.hpAllowed)}$ m above the clay base: lower it by **${f3(r.drawdown)} m** (relief wells / dewatering in the sand).`}</Md>
  )
}

function ExcavationLab() {
  const [s, setS] = useState<ExState>(EX_DEFAULT)
  const { seed, next } = useSeed(9)
  const o = exIn(s)
  const r = excavationHeave(o, s.d, s.FS)
  markUsed('w-eff', { heave: f2(r.FS) })
  const id = (k: string) => `sm-seep:lab:heave:${hashKey(JSON.stringify(s))}:${k}`
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="btn !py-1 !px-3" onClick={() => (next(), setS(randomEx(seed + 1)))}>
          🎲 Exam-style pit
        </button>
        <button className="btn !py-1 !px-3" onClick={() => setS(EX_DEFAULT)}>
          2021-22 Q2(b)
        </button>
        <button className="btn !py-1 !px-3" onClick={() => setS({ Hc: 7, gSat: 17, wt: 0, art: null, pit: 0, d: 3, FS: 1.2 })}>
          2023-24 Q5(b)
        </button>
      </div>
      <div className="grid cq-lg:grid-cols-[minmax(0,1fr)_17rem] gap-4">
        <div className="rounded-xl border border-line bg-bg/60 p-2">
          <ExFigure s={s} />
        </div>
        <div className="card p-3 space-y-1">
          <Slider label="clay thickness" value={s.Hc} min={3} max={20} step={0.5} unit=" m" onChange={(Hc) => setS({ ...s, Hc, d: Math.min(s.d, Hc - 0.5) })} />
          <Slider label="clay γsat" value={s.gSat} min={15} max={21} step={0.1} unit="" onChange={(gSat) => setS({ ...s, gSat })} />
          <Slider label="pit depth d" value={s.d} min={0} max={s.Hc - 0.5} step={0.1} unit=" m" onChange={(d) => setS({ ...s, d })} />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-mute">sand head</span>
            <Seg size="xs" value={s.art === null ? 'h' : 'a'} onChange={(v) => setS({ ...s, art: v === 'h' ? null : 2 })} items={[{ v: 'h', label: 'hydrostatic' }, { v: 'a', label: 'artesian' }]} />
          </div>
          {s.art === null ? <Slider label="WT depth" value={s.wt} min={0} max={Math.min(4, s.Hc - 1)} step={0.1} unit=" m" onChange={(wt) => setS({ ...s, wt })} /> : <Slider label="head above GL" value={s.art} min={0} max={8} step={0.1} unit=" m" onChange={(art) => setS({ ...s, art })} />}
          <Slider label="water kept in pit" value={s.pit} min={0} max={Math.max(0, s.d)} step={0.1} unit=" m" onChange={(pit) => setS({ ...s, pit })} />
          <Slider label="required FS" value={s.FS} min={1} max={2} step={0.05} unit="" onChange={(FS) => setS({ ...s, FS })} />
        </div>
      </div>
      <div className="grid cq-md:grid-cols-2 gap-3">
        <StatusBox c={r.FS >= s.FS ? 'var(--c-good)' : r.FS >= 1 ? 'var(--c-load)' : 'var(--c-bad)'} t={`FS = ${f3(r.FS)} at d = ${f2(s.d)} m`} d={`plug ${f2(r.W)} kPa vs uplift ${f2(r.u)} kPa · dmax = ${f3(r.dMax)} m${s.FS > 1 ? ` · d for FS ${s.FS} = ${f3(r.dSafe)} m` : ''} · drawdown needed ${f3(r.drawdown)} m`} />
        <div className="card p-3 space-y-1">
          <Answer id={id('u')} label="uplift u at the clay base" value={r.u} unit="kPa" />
          <Answer id={id('fs')} label="FS at this depth" value={r.FS} />
          <Answer id={id('dm')} label={s.FS > 1 ? `safe depth (FS ${s.FS})` : 'maximum safe depth'} value={s.FS > 1 ? r.dSafe : r.dMax} unit="m" />
          <Answer id={id('dd')} label="drawdown needed" value={r.drawdown} unit="m" abs={0.02} />
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <ExSolution s={s} />
      </Reveal>
    </div>
  )
}

// ---------------------------------------------------------------- quick condition / filter column
export interface QState {
  L: number
  h: number
  Gs: number
  n: number
  FS: number
}
export const Q_DEFAULT: QState = { L: 1.25, h: 1.8, Gs: 2.65, n: 0.35, FS: 2 }

export function QuickFigure({ s, zf }: { s: QState; zf: number }) {
  const W = 300
  const H = 260
  const tot = s.L + zf + 0.6
  const k = (H - 50) / Math.max(tot + s.h, 3)
  const Y = (z: number) => H - 20 - z * k
  const fs = (gsubFromGsE(s.Gs, eFromN(s.n)) * s.L) / (s.h * GW)
  const boil = fs < 1
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[320px]" role="img" aria-label="upward flow column with filter">
      <rect x={60} y={Y(s.L)} width={110} height={Y(0) - Y(s.L)} fill="var(--c-soil)" opacity={0.55} stroke="var(--c-ink)" />
      {zf > 0 && <rect x={60} y={Y(s.L + zf)} width={110} height={Y(s.L) - Y(s.L + zf)} fill="color-mix(in oklab, var(--c-soil) 50%, var(--c-load))" opacity={0.5} stroke="var(--c-ink)" />}
      {zf > 0 && (
        <text x={115} y={(Y(s.L) + Y(s.L + zf)) / 2 + 4} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
          filter {f2(zf)} m
        </text>
      )}
      <text x={115} y={(Y(0) + Y(s.L)) / 2 + 4} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
        soil L = {f2(s.L)} m
      </text>
      <rect x={60} y={Y(s.L + zf + 0.4)} width={110} height={Y(s.L + zf) - Y(s.L + zf + 0.4)} fill="var(--c-water)" opacity={0.18} />
      {/* standpipe from below */}
      <path d={`M60,${Y(-0.2)}L30,${Y(-0.2)}L30,${Y(s.L + zf + 0.4 + s.h) - 6}`} fill="none" stroke="var(--c-ink)" />
      <rect x={24} y={Y(s.L + zf + 0.4 + s.h)} width={12} height={Y(-0.2) - Y(s.L + zf + 0.4 + s.h)} fill="var(--c-water)" opacity={0.4} />
      <line x1={20} y1={Y(s.L + zf + 0.4)} x2={200} y2={Y(s.L + zf + 0.4)} stroke="var(--c-water)" strokeDasharray="3 3" />
      <line x1={190} y1={Y(s.L + zf + 0.4)} x2={190} y2={Y(s.L + zf + 0.4 + s.h)} stroke="var(--c-mute)" />
      <line x1={20} y1={Y(s.L + zf + 0.4 + s.h)} x2={200} y2={Y(s.L + zf + 0.4 + s.h)} stroke="var(--c-water)" />
      <text x={196} y={(Y(s.L + zf + 0.4) + Y(s.L + zf + 0.4 + s.h)) / 2 + 4} fontSize={10.5} fill="var(--c-mute)">
        h = {f2(s.h)} m
      </text>
      {[0.25, 0.5, 0.75].map((t) => (
        <path key={t} d={`M${60 + t * 110},${Y(0) - 4}l0,-16m-4,5l4,-5l4,5`} stroke="var(--c-water)" strokeWidth={1.4} fill="none" />
      ))}
      {boil && zf === 0 && (
        <g>
          {[0.2, 0.45, 0.7, 0.9].map((t) => (
            <circle key={t} cx={60 + t * 110} cy={Y(s.L) - 6 - 8 * t} r={3 + 2 * t} fill="none" stroke="var(--c-bad)">
              <animate attributeName="cy" values={`${Y(s.L)};${Y(s.L) - 26}`} dur={`${1 + t}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <text x={115} y={Y(s.L + 0.4) - 30} fontSize={11} textAnchor="middle" fill="var(--c-bad)" fontWeight={700}>
            boiling!
          </text>
        </g>
      )}
    </svg>
  )
}

export function QuickSolution({ s }: { s: QState }) {
  const e = eFromN(s.n)
  const gsub = gsubFromGsE(s.Gs, e)
  const icr = icrFromGsE(s.Gs, e)
  const f = filterDepth({ gsub, L: s.L, h: s.h, FS: s.FS })
  return (
    <Md>{`1. $e = n/(1-n) = ${f3(e)}$; $\\gamma' = \\dfrac{(G_s-1)\\gamma_w}{1+e} = \\dfrac{${f2(s.Gs - 1)} \\times 9.81}{${f3(1 + e)}} = ${f2(gsub)}$ kN/m³; $i_{cr} = ${f3(icr)}$.
2. Gradient $i = h/L = ${f2(s.h)}/${f2(s.L)} = ${f3(s.h / s.L)}$. Largest h without a quick condition: $i_{cr}L = ${f3(icr * s.L)}$ m.
3. Without a filter: $FS = \\dfrac{\\gamma' L}{h\\gamma_w} = \\dfrac{${f2(gsub)} \\times ${f2(s.L)}}{${f2(s.h)} \\times 9.81} = ${f3(f.FS0)}$ ${f.FS0 < 1 ? '(< 1: the soil boils)' : ''}.
4. A filter of depth z (same e and Gs, no head loss in it) adds weight but no seepage force: $FS = \\dfrac{\\gamma'(L + z)}{h\\gamma_w}$ → $${s.FS} = \\dfrac{${f2(gsub)}(${f2(s.L)} + z)}{${f2(s.h)} \\times 9.81}$ → $z = ${f3(f.z)}$ m.`}</Md>
  )
}

function QuickLab() {
  const [s, setS] = useState<QState>(Q_DEFAULT)
  const [withF, setWithF] = useState(true)
  const e = eFromN(s.n)
  const gsub = gsubFromGsE(s.Gs, e)
  const icr = icrFromGsE(s.Gs, e)
  const f = filterDepth({ gsub, L: s.L, h: s.h, FS: s.FS })
  const id = (k: string) => `sm-seep:lab:quick:${hashKey(JSON.stringify(s))}:${k}`
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="btn !py-1 !px-3" onClick={() => setS(Q_DEFAULT)}>
          2012-13 Q10(d)
        </button>
        <button className="btn !py-1 !px-3" onClick={() => setS({ L: 2, h: 1.9, Gs: 2.65, n: 0.35, FS: 2 })}>
          2009-10 Q6(c)
        </button>
        <label className="text-sm inline-flex items-center gap-1 ml-2">
          <input type="checkbox" checked={withF} onChange={(e) => setWithF(e.target.checked)} /> show the filter
        </label>
      </div>
      <div className="grid cq-md:grid-cols-[18rem_minmax(0,1fr)] gap-4">
        <QuickFigure s={s} zf={withF ? f.z : 0} />
        <div className="space-y-2">
          <div className="card p-3 space-y-1">
            <Slider label="soil layer L" value={s.L} min={0.5} max={4} step={0.05} unit=" m" onChange={(L) => setS({ ...s, L })} />
            <Slider label="upward head h" value={s.h} min={0.2} max={5} step={0.05} unit=" m" onChange={(h) => setS({ ...s, h })} />
            <Slider label="Gs" value={s.Gs} min={2.6} max={2.75} step={0.01} unit="" onChange={(Gs) => setS({ ...s, Gs })} />
            <Slider label="porosity n" value={s.n} min={0.25} max={0.5} step={0.01} unit="" onChange={(n) => setS({ ...s, n })} />
            <Slider label="target FS" value={s.FS} min={1} max={4} step={0.1} unit="" onChange={(FS) => setS({ ...s, FS })} />
          </div>
          <StatusBox c={f.FS0 >= s.FS ? 'var(--c-good)' : f.FS0 >= 1 ? 'var(--c-load)' : 'var(--c-bad)'} t={`i = ${f3(s.h / s.L)} vs icr = ${f3(icr)} → FS = ${f3(f.FS0)}`} d={`filter for FS ${s.FS}: ${f3(f.z)} m · largest h without boiling ${f3(icr * s.L)} m`} />
          <div className="card p-3 space-y-1">
            <Answer id={id('g')} label="γ′" value={gsub} unit="kN/m³" />
            <Answer id={id('fs0')} label="FS without filter" value={f.FS0} />
            <Answer id={id('z')} label={`filter depth for FS ${s.FS}`} value={f.z} unit="m" abs={0.02} />
          </div>
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <QuickSolution s={s} />
      </Reveal>
    </div>
  )
}

export function HeaveLabs() {
  const [tab, setTab] = useState<'ex' | 'q'>('ex')
  return (
    <div className="space-y-3">
      <Seg value={tab} onChange={setTab} items={[{ v: 'ex', label: 'Excavation over a sand aquifer' }, { v: 'q', label: 'Quick condition & filter' }]} />
      {tab === 'ex' ? <ExcavationLab /> : <QuickLab />}
    </div>
  )
}
