// Earthwork calculator: fill volume (or embankment section) at its spec → solids → borrow-pit volume, loose volume and
// truck loads, water to add, and the cost of one or two borrow areas. Solids are conserved through every state.

import { useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Md, Reveal, Seg } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { StatusBox } from '../../../labs/playground'
import { NumIn } from '../../../reference/common'
import { borrowPlan, embankmentArea, gdOf, type SourcePlan, type State } from '../../engine/compaction'
import { markUsed, openSmRef } from '../../reference/pane'

const f2 = (v: number) => fmt(v, 2)
const big = (v: number) => (Math.abs(v) >= 1e5 ? v.toLocaleString('en-US', { maximumFractionDigits: 0 }) : fmt(v, 2))

export type SIn = { kind: 'gd'; gd: number; w: number } | { kind: 'gbw'; gb: number; w: number } | { kind: 'ew'; e: number; Gs: number; w: number } | { kind: 'rc'; rc: number; mdd: number; w: number }
export const toState = (s: SIn): State => (s.kind === 'gd' ? { gd: s.gd, w: s.w } : s.kind === 'gbw' ? { gb: s.gb, w: s.w } : s.kind === 'ew' ? { e: s.e, Gs: s.Gs, w: s.w } : { rc: s.rc, mdd: s.mdd, w: s.w })

export interface Src {
  name: string
  bank: SIn
  looseMode: 'none' | 'bulk' | 'state'
  bulk: number
  loose: SIn
  costBasis: 'none' | 'm3' | '100m3' | 'truck'
  cost: number
  /** payment to the owner per m³ dug */
  pay: number
}
export interface EW {
  unit: 't' | 'kN'
  fillMode: 'V' | 'section'
  V: number
  top: number
  H: number
  n: number
  L: number
  fill: SIn
  srcs: Src[]
  truck: number
  waterCost: number
  Gs: number
}

const src = (name: string, bank: SIn, p: Partial<Src> = {}): Src => ({ name, bank, looseMode: 'none', bulk: 0, loose: { kind: 'gbw', gb: 11.5, w: 0.06 }, costBasis: 'none', cost: 0, pay: 0, ...p })
const base: EW = { unit: 'kN', fillMode: 'V', V: 1000, top: 2, H: 4, n: 1, L: 1, fill: { kind: 'rc', rc: 0.95, mdd: 17, w: 0.15 }, srcs: [src('Borrow', { kind: 'gbw', gb: 16.5, w: 0.18 })], truck: 0, waterCost: 0, Gs: 2.7 }

export const EW_PRESETS: { label: string; ew: EW }[] = [
  { label: '2023-24 Q7(c): borrow volume', ew: base },
  { label: '2021-22 Q3(c): pay the owner', ew: { ...base, V: 20000, fill: { kind: 'gd', gd: 18.6, w: NaN }, srcs: [src('Borrow', { kind: 'ew', e: 0.95, Gs: 2.7, w: NaN }, { pay: 500 })] } },
  { label: '2016-17 Q1(b): truck loads', ew: { ...base, V: 100, fill: { kind: 'gbw', gb: 18.2, w: 0.14 }, srcs: [src('Borrow', { kind: 'gbw', gb: 16.6, w: 0.08 }, { looseMode: 'state', loose: { kind: 'gbw', gb: 11.5, w: 0.06 } })], truck: 6 } },
  { label: '2015-16 Q9(b): embankment section', ew: { ...base, fillMode: 'section', top: 2, H: 4, n: 1, L: 1, fill: { kind: 'gd', gd: 15, w: 0.1 }, srcs: [src('Borrow', { kind: 'gbw', gb: 18, w: 0.08 })], Gs: 2.67 } },
  { label: '2012-13 Q9(b): water to add', ew: { ...base, unit: 't', V: 1, fill: { kind: 'gd', gd: 1.85, w: 0.18 }, srcs: [src('Borrow', { kind: 'gbw', gb: 1.8, w: 0.1 })] } },
  {
    label: '2010-11 Q5(c): area A or B (per 100 m³)',
    ew: { ...base, unit: 't', V: 10000, fill: { kind: 'gbw', gb: 2, w: 0.22 }, srcs: [src('A', { kind: 'ew', e: 0.8, Gs: 2.65, w: 0.2 }, { costBasis: '100m3', cost: 2000 }), src('B', { kind: 'ew', e: 0.7, Gs: 2.65, w: 0.15 }, { costBasis: '100m3', cost: 2200 })], Gs: 2.65 },
  },
  {
    label: '2009-10 Q5(d): Purbachal, per truck + water',
    ew: { ...base, unit: 't', V: 4e6, fill: { kind: 'gbw', gb: 2, w: 0.21 }, srcs: [src('A', { kind: 'ew', e: 0.79, Gs: 2.65, w: 0.18 }, { looseMode: 'bulk', bulk: 0.1, costBasis: 'truck', cost: 1000 }), src('B', { kind: 'ew', e: 0.65, Gs: 2.65, w: 0.15 }, { looseMode: 'bulk', bulk: 0.1, costBasis: 'truck', cost: 1150 })], truck: 10, waterCost: 300, Gs: 2.65 },
  },
]

export function fillVolume(ew: EW) {
  return ew.fillMode === 'V' ? { V: ew.V, area: NaN, bottom: NaN } : { ...embankmentArea(ew.top, ew.H, ew.n), V: embankmentArea(ew.top, ew.H, ew.n).area * ew.L }
}

export interface SrcResult {
  s: Src
  p: SourcePlan
  soilCost: number
  waterCost: number
  payCost: number
  total: number
}

export function runEarthwork(ew: EW): { V: number; res: SrcResult[]; gw: number } {
  const gw = ew.unit === 't' ? 1 : 9.81
  const { V } = fillVolume(ew)
  const res = ew.srcs.map((s) => {
    const p = borrowPlan({ Vfill: V, fill: toState(ew.fill), bank: toState(s.bank), loose: s.looseMode === 'state' ? toState(s.loose) : undefined, bulking: s.looseMode === 'bulk' ? s.bulk : 0, truck: ew.truck || undefined, gw })
    const soilCost = s.costBasis === 'm3' ? p.Vbank * s.cost : s.costBasis === '100m3' ? (p.Vbank / 100) * s.cost : s.costBasis === 'truck' ? p.trucks * s.cost : 0
    const waterCost = ew.waterCost && Number.isFinite(p.waterTrucks) ? p.waterTrucks * ew.waterCost : 0
    const payCost = s.pay * p.Vbank
    return { s, p, soilCost, waterCost, payCost, total: soilCost + waterCost + payCost }
  })
  return { V, res, gw }
}

function StateEd({ v, onChange, unit, allowRC }: { v: SIn; onChange: (s: SIn) => void; unit: 't' | 'kN'; allowRC?: boolean }) {
  const g = unit === 't' ? 't/m³' : 'kN/m³'
  const st = unit === 't' ? 0.01 : 0.1
  const w = Number.isFinite(v.w) ? +(v.w * 100).toFixed(2) : NaN
  const setW = (x: number) => onChange({ ...v, w: Number.isFinite(x) ? x / 100 : NaN })
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Seg
        size="xs"
        value={v.kind}
        onChange={(kind) => onChange(kind === 'gd' ? { kind, gd: unit === 't' ? 1.6 : 16, w: v.w } : kind === 'gbw' ? { kind, gb: unit === 't' ? 1.8 : 18, w: Number.isFinite(v.w) ? v.w : 0.1 } : kind === 'ew' ? { kind, e: 0.8, Gs: 2.65, w: v.w } : { kind, rc: 0.95, mdd: unit === 't' ? 1.75 : 17, w: v.w })}
        items={[{ v: 'gd', label: 'γd' }, { v: 'gbw', label: 'γ, w' }, { v: 'ew', label: 'e, Gs' }, ...(allowRC ? [{ v: 'rc' as const, label: 'RC × MDD' }] : [])]}
      />
      {v.kind === 'gd' && <NumIn label="γd" value={v.gd} onChange={(x) => onChange({ ...v, gd: x })} step={st} unit={g} w="w-16" />}
      {v.kind === 'gbw' && <NumIn label="γ" value={v.gb} onChange={(x) => onChange({ ...v, gb: x })} step={st} unit={g} w="w-16" />}
      {v.kind === 'ew' && (
        <>
          <NumIn label="e" value={v.e} onChange={(x) => onChange({ ...v, e: x })} step={0.01} w="w-14" />
          <NumIn label="Gs" value={v.Gs} onChange={(x) => onChange({ ...v, Gs: x })} step={0.01} w="w-14" />
        </>
      )}
      {v.kind === 'rc' && (
        <>
          <NumIn label="RC" value={+(v.rc * 100).toFixed(1)} onChange={(x) => onChange({ ...v, rc: x / 100 })} step={1} unit="%" w="w-14" />
          <NumIn label="MDD" value={v.mdd} onChange={(x) => onChange({ ...v, mdd: x })} step={st} unit={g} w="w-16" />
        </>
      )}
      <NumIn label="w" value={w} onChange={setW} step={0.5} unit="%" w="w-14" />
    </div>
  )
}

/** three states drawn to scale: the solids block is the same in each */
function StatesFig({ ew, r }: { ew: EW; r: SrcResult }) {
  const gw = ew.unit === 't' ? 1 : 9.81
  const Vs = r.p.Ws / (ew.Gs * gw)
  const bars = [
    { t: 'borrow pit', V: r.p.Vbank, gd: r.p.gdBank },
    ...(r.s.looseMode !== 'none' ? [{ t: 'loose (truck)', V: r.p.Vloose, gd: r.p.Ws / r.p.Vloose }] : []),
    { t: 'compacted fill', V: fillVolume(ew).V, gd: gdOf(toState(ew.fill), gw) },
  ]
  const vmax = Math.max(...bars.map((b) => b.V))
  const W = 420
  const H = 170
  const bw = 80
  const k = (H - 40) / vmax
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[440px]" role="img" aria-label="volumes in each state, solids conserved">
      {bars.map((b, i) => {
        const x = 30 + i * (bw + 50)
        const y0 = H - 24
        return (
          <g key={b.t}>
            <rect x={x} y={y0 - b.V * k} width={bw} height={b.V * k} fill="var(--c-water)" opacity={0.12} stroke="var(--c-ink)" />
            <rect x={x} y={y0 - Vs * k} width={bw} height={Vs * k} fill="var(--c-soil)" opacity={0.8} />
            <text x={x + bw / 2} y={y0 - b.V * k - 4} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
              {big(b.V)} m³
            </text>
            <text x={x + bw / 2} y={H - 8} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
              {b.t}
            </text>
          </g>
        )
      })}
      <text x={W - 6} y={14} fontSize={9.5} textAnchor="end" fill="var(--c-mute)">
        shaded: solids (same in every state; drawn with Gs = {ew.Gs})
      </text>
    </svg>
  )
}

function SectionFig({ ew }: { ew: EW }) {
  const a = embankmentArea(ew.top, ew.H, ew.n)
  const W = 420
  const H = 130
  const k = Math.min((W - 40) / a.bottom, (H - 40) / ew.H)
  const x0 = (W - a.bottom * k) / 2
  const y0 = H - 22
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[440px]" role="img" aria-label="embankment section">
      <path d={`M${x0},${y0}L${x0 + ew.n * ew.H * k},${y0 - ew.H * k}L${x0 + (ew.n * ew.H + ew.top) * k},${y0 - ew.H * k}L${x0 + a.bottom * k},${y0}Z`} fill="var(--c-soil)" opacity={0.6} stroke="var(--c-ink)" />
      <text x={W / 2} y={y0 - ew.H * k - 5} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
        top {f2(ew.top)} m
      </text>
      <text x={W / 2} y={y0 + 14} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
        base {f2(a.bottom)} m · area {f2(a.area)} m²
      </text>
      <text x={x0 + ew.n * ew.H * k * 0.3} y={y0 - ew.H * k * 0.55} fontSize={10} textAnchor="end" fill="var(--c-mute)">
        1 : {ew.n}
      </text>
      <text x={x0 + a.bottom * k - 4} y={y0 - ew.H * k / 2} fontSize={10} textAnchor="start" fill="var(--c-mute)">
        H = {f2(ew.H)} m
      </text>
    </svg>
  )
}

export function EarthworkSolution({ ew }: { ew: EW }) {
  const { V, res, gw } = runEarthwork(ew)
  const u = ew.unit === 't' ? 't' : 'kN'
  const gu = ew.unit === 't' ? 't/m³' : 'kN/m³'
  const fv = fillVolume(ew)
  const gdF = gdOf(toState(ew.fill), gw)
  const fillTxt = ew.fill.kind === 'gd' ? `$\\gamma_d = ${ew.fill.gd}$` : ew.fill.kind === 'gbw' ? `$\\gamma_d = ${ew.fill.gb}/(1 + ${ew.fill.w}) = ${f2(gdF)}$` : ew.fill.kind === 'rc' ? `$\\gamma_d = ${ew.fill.rc} \\times ${ew.fill.mdd} = ${f2(gdF)}$` : `$\\gamma_d = G_s\\gamma_w/(1 + e) = ${f2(gdF)}$`
  return (
    <div className="space-y-2 text-sm">
      <Md>{`${ew.fillMode === 'section' ? `**Section.** Base $= ${f2(ew.top)} + 2 \\times ${ew.n} \\times ${f2(ew.H)} = ${f2(fv.bottom)}$ m; area $= \\frac{${f2(ew.top)} + ${f2(fv.bottom)}}{2} \\times ${f2(ew.H)} = ${f2(fv.area)}$ m² → $V = ${f2(V)}$ m³ for ${f2(ew.L)} m.\n` : ''}**Fill.** ${fillTxt} ${gu}; solids $W_s = \\gamma_d V = ${f2(gdF)} \\times ${big(V)} = ${big(res[0]?.p.Ws ?? NaN)}$ ${u} (the same solids come from the pit).`}</Md>
      {res.map((r) => (
        <Md key={r.s.name}>{`**${r.s.name}.** Pit $\\gamma_d = ${f2(r.p.gdBank)}$ ${gu} → $V = W_s/\\gamma_d = ${big(r.p.Vbank)}$ m³.${r.s.looseMode === 'bulk' ? ` Loose: × ${1 + r.s.bulk} = ${big(r.p.Vloose)} m³.` : r.s.looseMode === 'state' ? ` Loose $\\gamma_d = ${f2(r.p.Ws / r.p.Vloose)}$ → ${big(r.p.Vloose)} m³.` : ''}${ew.truck ? ` Trucks: ${big(r.p.Vloose)}/${ew.truck} → **${big(r.p.trucks)} loads**.` : ''}${Number.isFinite(r.p.water) ? ` Water to add $(w_{fill} - w_{pit})W_s = ${big(r.p.water)}$ ${u} (${big(r.p.waterVol)} m³)${r.p.water < 0 ? ': negative, the soil must be dried' : ''}.` : ''}${r.total ? ` Cost: ${r.soilCost ? `soil Tk ${big(r.soilCost)}` : ''}${r.waterCost ? ` + water ${big(r.p.waterTrucks)} truck loads × ${ew.waterCost} = Tk ${big(r.waterCost)}` : ''}${r.payCost ? `owner ${big(r.p.Vbank)} × ${r.s.pay} = Tk ${big(r.payCost)}` : ''} → **Tk ${big(r.total)}**.` : ''}`}</Md>
      ))}
      {res.length > 1 && res.every((r) => r.total) && <Md>{`**${[...res].sort((a, b) => a.total - b.total)[0].s.name} is more economical** (saves Tk ${big(Math.abs(res[0].total - res[1].total))}).`}</Md>}
    </div>
  )
}

export function EarthworkLab() {
  const [ew, setEw] = useState<EW>(EW_PRESETS[0].ew)
  const { V, res } = runEarthwork(ew)
  const id = (k: string) => `sm-comp:lab:earth:${hashKey(JSON.stringify(ew))}:${k}`
  const upd = (p: Partial<EW>) => setEw({ ...ew, ...p })
  const setSrc = (k: number, p: Partial<Src>) => upd({ srcs: ew.srcs.map((s, i) => (i === k ? { ...s, ...p } : s)) })
  markUsed('w-field', { earth: 1 })
  const best = res.length > 1 && res.every((r) => r.total) ? [...res].sort((a, b) => a.total - b.total)[0] : null
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select className="field !py-1 !text-sm" onChange={(e) => +e.target.value >= 0 && setEw(EW_PRESETS[+e.target.value].ew)} value={EW_PRESETS.findIndex((p) => p.ew === ew)}>
          <option value={-1}>(your own)</option>
          {EW_PRESETS.map((p, k) => (
            <option key={k} value={k}>
              {p.label}
            </option>
          ))}
        </select>
        <Seg size="xs" value={ew.unit} onChange={(unit) => upd({ unit })} items={[{ v: 'kN', label: 'γ in kN/m³' }, { v: 't', label: 'ρ in t/m³' }]} />
        {ew.srcs.length < 2 ? (
          <button className="btn !py-1 !px-3" onClick={() => upd({ srcs: [...ew.srcs.map((s) => ({ ...s, name: s.name === 'Borrow' ? 'A' : s.name })), src('B', { kind: 'ew', e: 0.7, Gs: 2.65, w: 0.15 }, { costBasis: ew.srcs[0].costBasis, cost: ew.srcs[0].cost })] })}>
            + compare a second borrow area
          </button>
        ) : (
          <button className="btn !py-1 !px-3" onClick={() => upd({ srcs: ew.srcs.slice(0, 1) })}>
            one borrow area
          </button>
        )}
        <button className="chip hover:!border-load" onClick={() => openSmRef('st-earthwork')}>
          Chart pane: earthwork steps ↗
        </button>
      </div>
      <div className="grid cq-lg:grid-cols-2 gap-3">
        <div className="card p-3 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Fill</div>
          <Seg size="xs" value={ew.fillMode} onChange={(fillMode) => upd({ fillMode })} items={[{ v: 'V', label: 'volume' }, { v: 'section', label: 'embankment section' }]} />
          {ew.fillMode === 'V' ? (
            <NumIn label="V" value={ew.V} onChange={(V) => Number.isFinite(V) && V > 0 && upd({ V })} step={100} unit="m³" w="w-24" />
          ) : (
            <div className="flex flex-wrap gap-2">
              <NumIn label="top" value={ew.top} onChange={(top) => upd({ top })} step={0.5} unit="m" w="w-14" />
              <NumIn label="H" value={ew.H} onChange={(H) => upd({ H })} step={0.5} unit="m" w="w-14" />
              <NumIn label="slope 1 :" value={ew.n} onChange={(n) => upd({ n })} step={0.5} w="w-14" />
              <NumIn label="length" value={ew.L} onChange={(L) => upd({ L })} step={1} unit="m" w="w-16" />
            </div>
          )}
          <StateEd v={ew.fill} onChange={(fill) => upd({ fill })} unit={ew.unit} allowRC />
          {ew.fillMode === 'section' && <SectionFig ew={ew} />}
          <div className="flex flex-wrap gap-2">
            <NumIn label="truck" value={ew.truck} onChange={(truck) => upd({ truck: Number.isFinite(truck) ? truck : 0 })} step={1} unit="m³ (0 = none)" w="w-14" />
            <NumIn label="water Tk/truck" value={ew.waterCost} onChange={(waterCost) => upd({ waterCost: Number.isFinite(waterCost) ? waterCost : 0 })} step={50} w="w-16" />
            <NumIn label="Gs (picture)" value={ew.Gs} onChange={(Gs) => upd({ Gs })} step={0.01} w="w-14" />
          </div>
        </div>
        <div className="space-y-2">
          {ew.srcs.map((s, k) => (
            <div key={k} className="card p-3 space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Borrow area {s.name}</div>
              <StateEd v={s.bank} onChange={(bank) => setSrc(k, { bank })} unit={ew.unit} />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-mute">loose</span>
                <Seg size="xs" value={s.looseMode} onChange={(looseMode) => setSrc(k, { looseMode })} items={[{ v: 'none', label: 'not asked' }, { v: 'bulk', label: 'bulking %' }, { v: 'state', label: 'loose γ, w' }]} />
                {s.looseMode === 'bulk' && <NumIn label="" value={+(s.bulk * 100).toFixed(1)} onChange={(v) => setSrc(k, { bulk: v / 100 })} step={1} unit="%" w="w-14" />}
              </div>
              {s.looseMode === 'state' && <StateEd v={s.loose} onChange={(loose) => setSrc(k, { loose })} unit={ew.unit} />}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-mute">cost</span>
                <Seg size="xs" value={s.costBasis} onChange={(costBasis) => setSrc(k, { costBasis })} items={[{ v: 'none', label: '—' }, { v: 'm3', label: 'Tk/m³' }, { v: '100m3', label: 'Tk/100 m³' }, { v: 'truck', label: 'Tk/truck' }]} />
                {s.costBasis !== 'none' && <NumIn label="" value={s.cost} onChange={(cost) => setSrc(k, { cost })} step={100} w="w-20" />}
                <NumIn label="owner Tk/m³" value={s.pay} onChange={(pay) => setSrc(k, { pay: Number.isFinite(pay) ? pay : 0 })} step={50} w="w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid cq-md:grid-cols-2 gap-3">
        {res.map((r) => (
          <div key={r.s.name} className="card p-3 space-y-1">
            <StatusBox c={best ? (best === r ? 'var(--c-good)' : 'var(--c-mute)') : 'var(--c-accent)'} t={`${r.s.name}: dig ${big(r.p.Vbank)} m³${ew.truck ? `, ${big(r.p.trucks)} truck loads` : ''}${r.total ? `, Tk ${big(r.total)}` : ''}`} d={`Ws = ${big(r.p.Ws)} ${ew.unit === 't' ? 't' : 'kN'} · pit γd = ${f2(r.p.gdBank)} · water ${Number.isFinite(r.p.water) ? `${big(r.p.water)} ${ew.unit === 't' ? 't' : 'kN'} (${big(r.p.waterVol)} m³)` : 'n/a'}${best === r ? ' · cheaper' : ''}`} />
            <StatesFig ew={ew} r={r} />
          </div>
        ))}
      </div>
      <div className="card p-3 space-y-1">
        <Answer id={id('ws')} label={`solids Ws (${ew.unit === 't' ? 't' : 'kN'})`} value={res[0].p.Ws} />
        {res.map((r) => (
          <Answer key={r.s.name} id={id('v' + r.s.name)} label={`volume dug at ${r.s.name} (m³)`} value={r.p.Vbank} />
        ))}
        {ew.truck > 0 && <Answer id={id('t')} label={`truck loads (${res[0].s.name})`} value={res[0].p.trucks} abs={0.4} tol={0} digits={0} />}
        {Number.isFinite(res[0].p.water) && <Answer id={id('w')} label={`water to add (${ew.unit === 't' ? 't' : 'kN'}, ${res[0].s.name})`} value={res[0].p.water} />}
        {res[0].total > 0 && <Answer id={id('c')} label={`total cost (${res[0].s.name}), Tk`} value={res[0].total} />}
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <EarthworkSolution ew={ew} />
      </Reveal>
      <p className="text-xs text-faint">Fill volume used: {big(V)} m³. Leave w blank (NaN) when the question gives no water content.</p>
    </div>
  )
}
