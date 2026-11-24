// Chain survey: a triangle of main lines, offsets to the details, check lines, and station A fixed from
// three permanent objects. Plots the triangle to scale (bearing of AB from the compass), checks every
// check line against the plot, and draws each line's field-book page (start at the bottom, as in class).
import { useMemo } from 'react'
import { latDep, parseDMS, RAD } from '../engine/angle'
import { Check, Field, fx, Grid, has, n, type Row } from './Grid'
import { PlanFrame, Station, type Pt } from './plots'
import { Seg } from '../../components/ui'

export interface ChainData {
  unit: 'ft' | 'm'
  AB: string
  BC: string
  CA: string
  /** compass bearing of AB */
  brgAB: string
  /** C lies on the left or right of A→B */
  side: 'L' | 'R'
  offsets: Row[]
  checks: Row[]
  ties: Row[]
}

export const chainBlank = (): ChainData => ({ unit: 'ft', AB: '', BC: '', CA: '', brgAB: '', side: 'L', offsets: [{ line: 'AB' }, {}, {}], checks: [{}], ties: [{}, {}, {}] })

/** Nafim's 2022 chain survey (Group 17): AB 130 ft, BC 62 ft, CA 100 ft, check line D (on BC) – D′ (on AB) */
export const chainSample = (): ChainData => ({
  unit: 'ft',
  AB: '130',
  BC: '62',
  CA: '100',
  brgAB: '270',
  side: 'R',
  offsets: [
    { line: 'AB', ch: '47.5', side: 'L', off: '8.25', obj: 'bamboo stick' },
    { line: 'AB', ch: '100', side: 'L', off: '14', obj: 'bamboo stick' },
    { line: 'BC', ch: '22', side: 'L', off: '10', obj: 'bamboo stick' },
    { line: 'BC', ch: '42', side: 'L', off: '11', obj: 'bamboo stick' },
    { line: 'CA', ch: '30', side: 'L', off: '12', obj: 'bamboo stick' },
    { line: 'CA', ch: '50', side: 'L', off: '9.33', obj: 'bamboo stick' },
  ],
  checks: [{ name: 'DD′', l1: 'BC', c1: '42', l2: 'AB', c2: '100', len: '31.5' }],
  ties: [
    { obj: 'Tree 1', d: '36.42' },
    { obj: 'Tree 2', d: '30.08' },
    { obj: 'Tree 3', d: '20.25' },
  ],
})

type Lines = Record<'AB' | 'BC' | 'CA', { a: Pt; b: Pt; len: number }>

interface Geo {
  A: Pt
  B: Pt
  C: Pt
  lines: Lines
  angles: { A: number; B: number; C: number }
  area: number
}

function geometry(d: ChainData): Geo | { bad: string } | null {
  const AB = n(d.AB),
    BC = n(d.BC),
    CA = n(d.CA)
  if (![AB, BC, CA].every((v) => v > 0)) return null
  if (AB >= BC + CA || BC >= AB + CA || CA >= AB + BC) return { bad: 'These three sides do not make a triangle (one side is longer than the other two together).' }
  const brg = has(d.brgAB) ? parseDMS(d.brgAB) : 90
  const A: Pt = { e: 0, n: 0 }
  const ld = latDep(AB, brg)
  const B: Pt = { e: ld.dep, n: ld.lat }
  // angle at A from the cosine rule
  const cosA = (AB * AB + CA * CA - BC * BC) / (2 * AB * CA)
  const angA = Math.acos(Math.max(-1, Math.min(1, cosA))) / RAD
  const brgAC = d.side === 'L' ? brg - angA : brg + angA
  const lc = latDep(CA, brgAC)
  const C: Pt = { e: lc.dep, n: lc.lat }
  const cosB = (AB * AB + BC * BC - CA * CA) / (2 * AB * BC)
  const angB = Math.acos(Math.max(-1, Math.min(1, cosB))) / RAD
  const angC = 180 - angA - angB
  const lines: Lines = { AB: { a: A, b: B, len: AB }, BC: { a: B, b: C, len: BC }, CA: { a: C, b: A, len: CA } }
  return { A, B, C, lines, angles: { A: angA, B: angB, C: angC }, area: 0.5 * AB * CA * Math.sin(angA * RAD) }
}

/** point at chainage `ch` along a line, pushed `off` to the left (−) or right (+) of the chaining direction */
function along(l: Lines[keyof Lines], ch: number, off = 0): Pt {
  const de = l.b.e - l.a.e,
    dn = l.b.n - l.a.n
  const L = Math.hypot(de, dn)
  const ue = de / L,
    un = dn / L
  // right of the direction of travel = (un, −ue)
  return { e: l.a.e + ue * ch + un * off, n: l.a.n + un * ch - ue * off }
}

const lineKey = (s: string | undefined): keyof Lines | null => {
  const t = (s ?? '').trim().toUpperCase()
  return t === 'AB' || t === 'BA' ? 'AB' : t === 'BC' || t === 'CB' ? 'BC' : t === 'CA' || t === 'AC' ? 'CA' : null
}

export function ChainSheet({ data, set }: { data: ChainData; set: (d: ChainData) => void }) {
  const g = useMemo(() => geometry(data), [data])
  const u = data.unit
  const geo = g && 'lines' in g ? g : null
  const pts = geo
    ? data.offsets.flatMap((r) => {
        const k = lineKey(r.line)
        if (!k || !has(r.ch)) return []
        const foot = along(geo.lines[k], n(r.ch))
        const sign = (r.side ?? 'L').toUpperCase().startsWith('R') ? 1 : -1
        const obj = has(r.off) ? along(geo.lines[k], n(r.ch), sign * n(r.off)) : foot
        return [{ foot, obj, label: r.obj ?? '' }]
      })
    : []
  const checks = data.checks.map((r) => {
    const k1 = lineKey(r.l1),
      k2 = lineKey(r.l2)
    if (!geo || !k1 || !k2 || !has(r.c1) || !has(r.c2)) return null
    const p = along(geo.lines[k1], n(r.c1))
    const q = along(geo.lines[k2], n(r.c2))
    const plot = Math.hypot(p.e - q.e, p.n - q.n)
    return { p, q, plot, meas: has(r.len) ? n(r.len) : NaN }
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Units</span>
          <Seg<'ft' | 'm'> value={data.unit} onChange={(v) => set({ ...data, unit: v })} items={[{ v: 'ft', label: 'ft' }, { v: 'm', label: 'm' }]} />
        </label>
        <Field label={`AB (${u})`} value={data.AB} onChange={(v) => set({ ...data, AB: v })} w="5.5rem" />
        <Field label={`BC (${u})`} value={data.BC} onChange={(v) => set({ ...data, BC: v })} w="5.5rem" />
        <Field label={`CA (${u})`} value={data.CA} onChange={(v) => set({ ...data, CA: v })} w="5.5rem" />
        <Field label="Bearing of AB" type="dms" value={data.brgAB} onChange={(v) => set({ ...data, brgAB: v })} w="7rem" ph="e.g. 48 30" hint="prismatic compass; blank = drawn due east" />
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">C is to the … of A→B</span>
          <Seg<'L' | 'R'> value={data.side} onChange={(v) => set({ ...data, side: v })} items={[{ v: 'L', label: 'left' }, { v: 'R', label: 'right' }]} />
        </label>
      </div>
      {g && 'bad' in g && <div className="text-sm text-bad">⚠ {g.bad}</div>}
      {geo && (
        <div className="card p-4 space-y-1">
          <div className="font-bold">Triangle</div>
          {(['A', 'B', 'C'] as const).map((k) => {
            const a = geo.angles[k]
            return (
              <Check key={k} ok={a >= 30 && a <= 120}>
                Angle at {k} = <b className="num">{a.toFixed(1)}°</b> {a < 30 || a > 120 ? '— outside 30°–120°: ill-conditioned, plotting errors grow' : ''}
              </Check>
            )
          })}
          <div className="text-xs text-mute">
            Area of the triangle = <span className="num">{fx(geo.area, 1)}</span> {u}² · at least one side must exceed one chain ({u === 'ft' ? '100 ft' : '20 m / 30 m'}) — longest here {Math.max(n(data.AB), n(data.BC), n(data.CA))} {u}
          </div>
        </div>
      )}

      <div>
        <div className="font-bold text-sm mb-1">Offsets</div>
        <p className="text-xs text-mute mb-1">
          Line as chained (AB, BC, CA), chainage from its first station, side L / R of the direction of chaining, offset length.
        </p>
        <Grid
          rows={data.offsets}
          onChange={(offsets) => set({ ...data, offsets })}
          newRow={(p) => ({ line: p?.line ?? 'AB', side: p?.side ?? 'L' })}
          cols={[
            { key: 'line', label: 'Line', w: '3.4rem', type: 'text', ph: 'AB' },
            { key: 'ch', label: `Chainage (${u})`, w: '5rem', type: 'num' },
            { key: 'side', label: 'L / R', w: '3rem', type: 'text', ph: 'L' },
            { key: 'off', label: `Offset (${u})`, w: '5rem', type: 'num' },
            { key: 'obj', label: 'Object', w: '8rem', type: 'text', ph: 'tree, pole…' },
          ]}
        />
      </div>

      <div>
        <div className="font-bold text-sm mb-1">Check / tie lines</div>
        <p className="text-xs text-mute mb-1">From a point on one main line to a point on another; the measured length must agree with the plot.</p>
        <Grid
          rows={data.checks}
          onChange={(checks) => set({ ...data, checks })}
          cols={[
            { key: 'name', label: 'Name', w: '3.6rem', type: 'text', ph: 'DD′' },
            { key: 'l1', label: 'On line', w: '3.4rem', type: 'text', ph: 'BC' },
            { key: 'c1', label: 'at ch.', w: '4rem', type: 'num' },
            { key: 'l2', label: 'to line', w: '3.4rem', type: 'text', ph: 'AB' },
            { key: 'c2', label: 'at ch.', w: '4rem', type: 'num' },
            { key: 'len', label: `Measured (${u})`, w: '5rem', type: 'num' },
          ]}
          outs={[
            { label: 'From plot', cell: (i) => fx(checks[i]?.plot, 2) },
            {
              label: 'Difference',
              cell: (i) => {
                const c = checks[i]
                if (!c || !isFinite(c.meas)) return ''
                const dlt = c.meas - c.plot
                const ok = Math.abs(dlt) <= Math.max(0.01 * c.meas, u === 'ft' ? 0.5 : 0.15)
                return <span className={ok ? 'text-good' : 'text-bad'}>{(dlt >= 0 ? '+' : '') + dlt.toFixed(2)}</span>
              },
            },
          ]}
        />
      </div>

      <div>
        <div className="font-bold text-sm mb-1">Station A fixed from three permanent objects</div>
        <Grid
          rows={data.ties}
          onChange={(ties) => set({ ...data, ties })}
          cols={[
            { key: 'obj', label: 'Permanent object', w: '9rem', type: 'text', ph: 'tree, pole, pillar' },
            { key: 'd', label: `Distance from A (${u})`, w: '6rem', type: 'num' },
          ]}
        />
      </div>

      {geo && (
        <PlanFrame pts={[geo.A, geo.B, geo.C, ...pts.map((p) => p.obj)]} unit={u}>
          {({ X, Y }) => (
            <g>
              <path d={`M${X(geo.A.e)} ${Y(geo.A.n)} L${X(geo.B.e)} ${Y(geo.B.n)} L${X(geo.C.e)} ${Y(geo.C.n)} Z`} fill="var(--c-accent)" fillOpacity="0.05" stroke="var(--c-ink)" strokeWidth="1.6" />
              {checks.map((c, i) => c && <line key={i} x1={X(c.p.e)} y1={Y(c.p.n)} x2={X(c.q.e)} y2={Y(c.q.n)} stroke="var(--c-accent2)" strokeWidth="1.4" strokeDasharray="8 3 2 3" />)}
              {pts.map((p, i) => (
                <g key={i}>
                  <line x1={X(p.foot.e)} y1={Y(p.foot.n)} x2={X(p.obj.e)} y2={Y(p.obj.n)} stroke="var(--c-mute)" strokeDasharray="3 2" />
                  <circle cx={X(p.obj.e)} cy={Y(p.obj.n)} r="3.5" fill="none" stroke="var(--c-good)" strokeWidth="1.5" />
                  <text x={X(p.obj.e) + 5} y={Y(p.obj.n) - 4} fontSize="9.5" fill="var(--c-mute)">
                    {p.label}
                  </text>
                </g>
              ))}
              <Station x={X(geo.A.e)} y={Y(geo.A.n)} label="A" />
              <Station x={X(geo.B.e)} y={Y(geo.B.n)} label="B" />
              <Station x={X(geo.C.e)} y={Y(geo.C.n)} label="C" />
            </g>
          )}
        </PlanFrame>
      )}

      {geo && (
        <div>
          <div className="font-bold text-sm mb-1">Field-book pages (as you write them: start station at the bottom)</div>
          <div className="flex flex-wrap gap-3">
            {(['AB', 'BC', 'CA'] as const).map((k) => (
              <Strip key={k} name={k} len={geo.lines[k].len} unit={u} rows={data.offsets.filter((r) => lineKey(r.line) === k)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** chainage as the book writes it: 130 ft → 1+30, 47.5 → 0+47.5 */
export const chainNotation = (v: number) => `${Math.floor(v / 100)}+${String(+(v % 100).toFixed(2)).padStart(2, '0')}`

function Strip({ name, len, unit, rows }: { name: string; len: number; unit: string; rows: Row[] }) {
  const H = 300,
    W = 200,
    cx = W / 2,
    top = 24,
    bot = H - 24
  const Y = (ch: number) => bot - (ch / (len || 1)) * (bot - top)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="rounded-xl border border-line bg-bg">
      <line x1={cx - 6} x2={cx - 6} y1={top} y2={bot} stroke="var(--c-ink)" />
      <line x1={cx + 6} x2={cx + 6} y1={top} y2={bot} stroke="var(--c-ink)" />
      <text x={cx} y={bot + 16} fontSize="11" textAnchor="middle" fontWeight="700" fill="var(--c-accent)">
        {name[0]} · 0+00
      </text>
      <text x={cx} y={top - 8} fontSize="11" textAnchor="middle" fontWeight="700" fill="var(--c-accent)">
        {name[1]} · {unit === 'ft' ? chainNotation(len) : len}
      </text>
      {rows
        .filter((r) => has(r.ch))
        .map((r, i) => {
          const y = Y(n(r.ch))
          const right = (r.side ?? 'L').toUpperCase().startsWith('R')
          const x2 = right ? W - 14 : 14
          return (
            <g key={i}>
              <text x={cx} y={y + 3} fontSize="8.5" textAnchor="middle" fill="var(--c-ink)">
                {unit === 'ft' ? chainNotation(n(r.ch)) : r.ch}
              </text>
              <line x1={right ? cx + 6 : cx - 6} x2={x2} y1={y} y2={y} stroke="var(--c-mute)" />
              <circle cx={x2} cy={y} r="3" fill="none" stroke="var(--c-good)" />
              <text x={right ? cx + 10 : cx - 10} y={y - 3} fontSize="8.5" textAnchor={right ? 'start' : 'end'} fill="var(--c-mute)">
                {r.off}
                {unit === 'ft' ? '′' : ''} {r.obj ? '· ' + r.obj.slice(0, 10) : ''}
              </text>
            </g>
          )
        })}
    </svg>
  )
}
