// Closed theodolite traverse (pentagon): the traverse chart the sheet asks for, in the textbook's order.
import { useMemo } from 'react'
import { Seg } from '../../components/ui'
import { fmtDMS, latDep, norm360, parseDMS } from '../engine/angle'
import { acres, solveTraverse, type TraverseResult } from '../engine/traverse'
import { Check, Field, fx, Grid, has, n, type Row } from './Grid'
import { PlanFrame, Station } from './plots'

export interface TraverseData {
  unit: 'm' | 'ft'
  dir: 'acw' | 'cw'
  rule: 'bowditch' | 'transit'
  brg0: string
  startE: string
  startN: string
  rows: Row[]
  objects: Row[]
}

export const traverseBlank = (): TraverseData => ({
  unit: 'm',
  dir: 'acw',
  rule: 'bowditch',
  brg0: '',
  startE: '100',
  startN: '100',
  rows: ['A', 'B', 'C', 'D', 'E'].map((stn) => ({ stn })),
  objects: [{}, {}, {}],
})

/** Nafim's 2022 pentagon: ∠NAB′ = 48.93°, sides 16, 17, 18, 19, 15.9 m (angle at A read as 111.32°) */
export const traverseSample = (): TraverseData => ({
  unit: 'm',
  dir: 'acw',
  rule: 'bowditch',
  brg0: '48.93',
  startE: '100',
  startN: '100',
  rows: [
    { stn: 'A', ang: '111.32', len: '16' },
    { stn: 'B', ang: '122.48', len: '17' },
    { stn: 'C', ang: '91.09', len: '18' },
    { stn: 'D', ang: '113.33', len: '19' },
    { stn: 'E', ang: '100.22', len: '15.9' },
  ],
  objects: [
    { stn: 'A', obj: 'Rod 1', ang: '35 20', d: '6.5' },
    { stn: 'C', obj: 'Rod 2', ang: '48 10', d: '5' },
    { stn: 'D', obj: 'Rod 3', ang: '60 00', d: '7.2' },
  ],
})

export function useTraverse(d: TraverseData) {
  return useMemo(() => {
    const rows = d.rows.filter((r) => (r.stn ?? '').trim() || has(r.len))
    if (rows.length < 3) return null
    const angles = rows.map((r) => parseDMS(r.ang))
    const lengths = rows.map((r) => n(r.len))
    if (angles.some((a) => !isFinite(a)) || lengths.some((l) => !(l > 0)) || !isFinite(parseDMS(d.brg0))) return null
    const names = rows.map((r, i) => (r.stn ?? '').trim() || String.fromCharCode(65 + i))
    return solveTraverse({
      names,
      angles,
      lengths,
      bearing0: parseDMS(d.brg0),
      dir: d.dir,
      rule: d.rule,
      compass: rows.map((r) => (has(r.cb) || /\d/.test(r.cb ?? '') ? parseDMS(r.cb) : null)),
      start: { e: has(d.startE) ? n(d.startE) : 0, n: has(d.startN) ? n(d.startN) : 0 },
    })
  }, [d])
}

export function TraverseSheet({ data, set }: { data: TraverseData; set: (d: TraverseData) => void }) {
  const r = useTraverse(data)
  const u = data.unit
  const leg = (i: number) => r?.legs[i]
  const dp = u === 'm' ? 3 : 2
  const area = r ? acres(r.area, u) : null
  const allowedDeg = 1
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Stations go round</span>
          <Seg<'acw' | 'cw'> value={data.dir} onChange={(v) => set({ ...data, dir: v })} items={[{ v: 'acw', label: '↺ anticlockwise' }, { v: 'cw', label: '↻ clockwise' }]} />
        </label>
        <Field label={`Bearing of the first line (${data.rows[0]?.stn || 'A'}${data.rows[1]?.stn || 'B'})`} type="dms" value={data.brg0} onChange={(v) => set({ ...data, brg0: v })} ph="48 55 48 or 48.93" w="8rem" hint="theodolite with N set to 0 at A" />
        <Field label="Start E" value={data.startE} onChange={(v) => set({ ...data, startE: v })} w="5rem" />
        <Field label="Start N" value={data.startN} onChange={(v) => set({ ...data, startN: v })} w="5rem" />
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Adjustment</span>
          <Seg<'bowditch' | 'transit'> value={data.rule} onChange={(v) => set({ ...data, rule: v })} items={[{ v: 'bowditch', label: 'Bowditch' }, { v: 'transit', label: 'Transit' }]} />
        </label>
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Units</span>
          <Seg<'m' | 'ft'> value={data.unit} onChange={(v) => set({ ...data, unit: v })} items={[{ v: 'm', label: 'm' }, { v: 'ft', label: 'ft' }]} />
        </label>
      </div>
      <p className="text-xs text-mute">
        Stations in the order you walk them. <b>Included angle</b> = interior angle at the station (between the line back to the previous station and the line to the next). Angles as <span className="num">122.48</span> or <span className="num">122 28 48</span>. <b>Length</b> = side to the next station. Compass bearings of the other lines are optional — they catch a wrong walking direction.
      </p>
      <Grid
        rows={data.rows}
        onChange={(rows) => set({ ...data, rows })}
        minRows={3}
        newRow={(p) => ({ stn: p?.stn ? String.fromCharCode((p.stn.charCodeAt(0) || 64) + 1) : '' })}
        cols={[
          { key: 'stn', label: 'Station', w: '3.6rem', type: 'text' },
          { key: 'ang', label: 'Included angle', w: '7rem', type: 'dms' },
          { key: 'len', label: `Side to next (${u})`, w: '5.5rem', type: 'num' },
          { key: 'cb', label: 'Compass bearing (opt.)', w: '6.5rem', type: 'dms' },
        ]}
        outs={[
          { label: 'Corr. angle', cell: (i) => (leg(i) ? fmtDMS(leg(i)!.corrected) : '') },
          { label: 'Line', cell: (i) => (leg(i) ? `${leg(i)!.from}${leg(i)!.to}` : '') },
          { label: 'WCB', cell: (i) => (leg(i) ? fmtDMS(leg(i)!.wcb) : '') },
          { label: 'Reduced bearing', cell: (i) => leg(i)?.rb ?? '' },
        ]}
      />

      {!r && <div className="text-sm text-faint">Fill every angle, every side and the bearing of the first line to compute.</div>}
      {r && (
        <>
          <div className="card p-4 space-y-1.5">
            <div className="font-bold">Angular check</div>
            <Check ok={Math.abs(r.angError) <= allowedDeg}>
              Σ included angles = <b className="num">{fmtDMS(r.observedSum)}</b>; should be (n − 2) × 180° = ({r.n} − 2) × 180° = <b className="num">{r.theorySum}°</b> → error <b className="num">{fmtDMS(r.angError)}</b>
              {Math.abs(r.angError) > allowedDeg && ' — more than the 1° the class allows: re-measure the worst angle'}
            </Check>
            <div className="text-sm">
              Correction per angle = −error / n = <b className="num">{fmtDMS(r.angCorr)}</b> (equal distribution)
            </div>
            {r.dirHint && <div className="text-sm text-bad">⚠ {r.dirHint}</div>}
          </div>

          <div className="overflow-x-auto">
            <table className="sv-grid text-sm border-separate border-spacing-0">
              <thead>
                <tr>
                  {['Line', `Length`, 'WCB', 'RB', 'Latitude', 'Departure', 'Corr. lat', 'Corr. dep', 'Adj. lat', 'Adj. dep', 'Station', 'N', 'E'].map((h) => (
                    <th key={h} className={['Adj. lat', 'Adj. dep', 'N', 'E'].includes(h) ? 'out' : ''}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.legs.map((l, i) => (
                  <tr key={i}>
                    <td className="px-2 font-bold">
                      {l.from}
                      {l.to}
                    </td>
                    <td className="px-2 num">{l.length}</td>
                    <td className="px-2 num whitespace-nowrap">{fmtDMS(l.wcb)}</td>
                    <td className="px-2 num whitespace-nowrap">{l.rb}</td>
                    <td className="px-2 num text-right">{fx(l.lat, dp)}</td>
                    <td className="px-2 num text-right">{fx(l.dep, dp)}</td>
                    <td className="px-2 num text-right text-mute">{fx(l.cLat, 4)}</td>
                    <td className="px-2 num text-right text-mute">{fx(l.cDep, 4)}</td>
                    <td className="out num">{fx(l.adjLat, dp)}</td>
                    <td className="out num">{fx(l.adjDep, dp)}</td>
                    <td className="px-2 font-bold">{l.to}</td>
                    <td className="out num">{fx(r.coords[(i + 1) % r.n].n, dp)}</td>
                    <td className="out num">{fx(r.coords[(i + 1) % r.n].e, dp)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="px-2">Σ</td>
                  <td className="px-2 num">{fx(r.perimeter, 2)}</td>
                  <td />
                  <td />
                  <td className="px-2 num text-right">{fx(r.sumLat, 4)}</td>
                  <td className="px-2 num text-right">{fx(r.sumDep, 4)}</td>
                  <td className="px-2 num text-right">{fx(-r.sumLat, 4)}</td>
                  <td className="px-2 num text-right">{fx(-r.sumDep, 4)}</td>
                  <td className="out num">0</td>
                  <td className="out num">0</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="card p-4 space-y-1 text-sm">
              <div className="font-bold">Closing error</div>
              <div>
                e = √(ΣL² + ΣD²) = √({fx(r.sumLat, 4)}² + {fx(r.sumDep, 4)}²) = <b className="num">{fx(r.closing, 4)} {u}</b>
              </div>
              <div>
                Direction of the gap: <span className="num">{fmtDMS(r.closingBearing)}</span> (reduced: tan⁻¹(ΣD/ΣL))
              </div>
              <Check ok={r.precision >= 300}>
                Relative precision = e / perimeter = 1 in <b className="num">{isFinite(r.precision) ? Math.round(r.precision) : '∞'}</b>
                {r.precision < 300 ? ' — poor for a theodolite traverse; check the tapes and angles' : ''}
              </Check>
              <div className="text-xs text-mute">
                {data.rule === 'bowditch' ? 'Bowditch: correction to a lat (dep) = −ΣL (−ΣD) × side length / perimeter.' : 'Transit: correction to a lat = −ΣL × |lat| / Σ|lat| (same for departures).'}
              </div>
            </div>
            <div className="card p-4 space-y-1 text-sm">
              <div className="font-bold">Area within the traverse</div>
              <div>
                By coordinates: A = ½ |Σ (Eᵢ Nᵢ₊₁ − Eᵢ₊₁ Nᵢ)| = <b className="num">{fx(r.area, 2)} {u}²</b>
              </div>
              <div>
                By DMD: ½ |Σ DMD × adj. lat| = <span className="num">{fx(Math.abs(r.dmd.reduce((s, x) => s + x.dblArea, 0)) / 2, 2)}</span> {u}² (same)
              </div>
              {area && (
                <div className="text-base">
                  = <b className="num text-accent">{area.acres.toFixed(4)} acre</b> = <b className="num text-accent">{area.decimals.toFixed(2)} decimal</b>
                </div>
              )}
              <div className="text-xs text-mute">1 acre = 100 decimals = 4046.86 m² = 43 560 ft²</div>
            </div>
          </div>

          <ObjectsTable data={data} set={set} r={r} />
          <TraversePlot r={r} data={data} />
          <GraphicalCorrection r={r} unit={u} />
        </>
      )}
    </div>
  )
}

function objectPoints(data: TraverseData, r: TraverseResult) {
  return data.objects.flatMap((o) => {
    const i = r.legs.findIndex((l) => l.from.toUpperCase() === (o.stn ?? '').trim().toUpperCase())
    const ang = parseDMS(o.ang)
    if (i < 0 || !isFinite(ang)) return []
    const brg = norm360(r.legs[i].wcb + ang)
    const d = n(o.d)
    const at = r.coords[i]
    const p = isFinite(d) ? latDep(d, brg) : null
    return [{ name: o.obj ?? '', brg, at, p: p ? { e: at.e + p.dep, n: at.n + p.lat } : null }]
  })
}

function ObjectsTable({ data, set, r }: { data: TraverseData; set: (d: TraverseData) => void; r: TraverseResult }) {
  const pts = objectPoints(data, r)
  return (
    <div>
      <div className="font-bold text-sm mb-1">Objects (at least 3, ranging rods will do)</div>
      <p className="text-xs text-mute mb-1">Angle measured clockwise at the station from the line to the next station; distance optional (taped) to plot the object.</p>
      <Grid
        rows={data.objects}
        onChange={(objects) => set({ ...data, objects })}
        cols={[
          { key: 'stn', label: 'At station', w: '4rem', type: 'text' },
          { key: 'obj', label: 'Object', w: '7rem', type: 'text' },
          { key: 'ang', label: 'Angle (cw from fwd line)', w: '7rem', type: 'dms' },
          { key: 'd', label: 'Distance', w: '5rem', type: 'num' },
        ]}
        outs={[{ label: 'Bearing to object', cell: (i) => (pts[i] ? fmtDMS(pts[i].brg) : '') }]}
      />
    </div>
  )
}

function TraversePlot({ r, data }: { r: TraverseResult; data: TraverseData }) {
  const objs = objectPoints(data, r)
  const all = [...r.coords, ...r.raw, ...objs.flatMap((o) => (o.p ? [o.p] : []))]
  const adj = r.coords.map((c) => `${c.e},${c.n}`)
  return (
    <div>
      <div className="font-bold text-sm mb-1">Plot — before correction (dashed, A′B′C′…) and after (solid)</div>
      <PlanFrame pts={all} unit={data.unit} height={420}>
        {({ X, Y }) => (
          <g>
            <path d={'M' + r.raw.map((c) => `${X(c.e)} ${Y(c.n)}`).join(' L')} fill="none" stroke="var(--c-bad)" strokeWidth="1.2" strokeDasharray="5 3" />
            <path d={'M' + r.coords.map((c) => `${X(c.e)} ${Y(c.n)}`).join(' L') + ' Z'} fill="var(--c-accent)" fillOpacity="0.06" stroke="var(--c-ink)" strokeWidth="1.7" />
            {objs.map(
              (o, i) =>
                o.p && (
                  <g key={i}>
                    <line x1={X(o.at.e)} y1={Y(o.at.n)} x2={X(o.p.e)} y2={Y(o.p.n)} stroke="var(--c-mute)" strokeDasharray="2 3" />
                    <circle cx={X(o.p.e)} cy={Y(o.p.n)} r="4" fill="none" stroke="var(--c-good)" strokeWidth="1.5" />
                    <text x={X(o.p.e) + 6} y={Y(o.p.n) + 3} fontSize="10" fill="var(--c-mute)">
                      {o.name}
                    </text>
                  </g>
                ),
            )}
            {r.raw.slice(1).map((c, i) => (
              <text key={i} x={X(c.e) + 5} y={Y(c.n) + 12} fontSize="10" fill="var(--c-bad)">
                {c.name.endsWith('′') ? c.name : c.name + '′'}
              </text>
            ))}
            {r.coords.map((c) => (
              <Station key={c.name} x={X(c.e)} y={Y(c.n)} label={c.name} />
            ))}
            <desc>{adj.join(' ')}</desc>
          </g>
        )}
      </PlanFrame>
    </div>
  )
}

/** the graphical (Bowditch) adjustment: stations along a base at their cumulative distance, the closing error at the end */
function GraphicalCorrection({ r, unit }: { r: TraverseResult; unit: string }) {
  const W = 640,
    H = 170,
    L = 30,
    R = 30,
    B = 40
  const cum = [0]
  r.legs.forEach((l) => cum.push(cum[cum.length - 1] + l.length))
  const X = (d: number) => L + (d / r.perimeter) * (W - L - R)
  const hmax = H - B - 24
  const Y = (e: number) => H - B - (e / (r.closing || 1)) * hmax
  const names = [...r.legs.map((l) => l.from), r.legs[0].from + '′']
  return (
    <div>
      <div className="font-bold text-sm mb-1">Graphical adjustment of the closing error</div>
      <p className="text-xs text-mute mb-1">
        Lay the stations along a line at their running distance; at the end draw the closing error AA′ = {fx(r.closing, 3)} {unit} (to a larger scale). The ordinate at each station is how far to move it, parallel to AA′. On the drawing sheet: horizontal scale for the distances, a bigger vertical scale for the error.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl border border-line bg-bg">
        <line x1={X(0)} x2={X(r.perimeter)} y1={H - B} y2={H - B} stroke="var(--c-ink)" />
        <line x1={X(0)} y1={H - B} x2={X(r.perimeter)} y2={Y(r.closing)} stroke="var(--c-accent)" strokeWidth="1.6" />
        {cum.map((c, i) => {
          const e = (r.closing * c) / r.perimeter
          return (
            <g key={i}>
              <line x1={X(c)} x2={X(c)} y1={H - B} y2={Y(e)} stroke="var(--c-bad)" strokeWidth={i === 0 ? 0 : 1.4} />
              <text x={X(c)} y={H - B + 14} fontSize="11" textAnchor="middle" fontWeight="700" fill="var(--c-ink)">
                {names[i]}
              </text>
              <text x={X(c)} y={H - B + 27} fontSize="9" textAnchor="middle" fill="var(--c-mute)">
                {c.toFixed(1)}
              </text>
              {i > 0 && (
                <text x={X(c) - 4} y={Y(e) - 4} fontSize="9.5" textAnchor="end" fill="var(--c-bad)">
                  {e.toFixed(3)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
