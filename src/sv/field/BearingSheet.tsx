// Compass traverse: fore and back bearings → stations free from local attraction → corrected bearings →
// included angles (with the (n − 2)·180° check for a closed traverse).
import { useMemo } from 'react'
import { fmtDMS, latDep, norm360, parseDMS, reducedBearing } from '../engine/angle'
import { Check, Field, fx, Grid, has, n, type Row } from './Grid'
import { PlanFrame, Station, type Pt } from './plots'

export interface BearingData {
  rows: Row[]
  /** tolerance on FB − BB = 180°, in minutes */
  tolMin: string
}

export const bearingBlank = (): BearingData => ({ rows: [{ line: 'AB' }, { line: 'BC' }, { line: 'CD' }, { line: 'DA' }], tolMin: '15' })

/** a classic closed compass traverse with local attraction at two stations (textbook style) */
export const bearingSample = (): BearingData => ({
  tolMin: '15',
  rows: [
    { line: 'AB', fb: '45 45', bb: '226 10' },
    { line: 'BC', fb: '96 55', bb: '277 5' },
    { line: 'CD', fb: '29 45', bb: '209 10' },
    { line: 'DE', fb: '324 48', bb: '144 48' },
    { line: 'EA', fb: '305 50', bb: '124 25' },
  ],
})

export interface BearingResult {
  stations: string[]
  corr: (number | null)[]
  lines: { line: string; from: number; to: number; fb: number; bb: number; diff: number; free: boolean; cfb: number | null; cbb: number | null }[]
  closed: boolean
}

export function solveBearings(rows: Row[], tolDeg: number): BearingResult | null {
  const ls = rows.filter((r) => (r.line ?? '').trim().length >= 2 && isFinite(parseDMS(r.fb)) && isFinite(parseDMS(r.bb)))
  if (!ls.length) return null
  const stations: string[] = []
  const idx = (s: string) => {
    let i = stations.indexOf(s)
    if (i < 0) i = stations.push(s) - 1
    return i
  }
  const lines = ls.map((r) => {
    const name = r.line.trim().toUpperCase()
    const from = idx(name.slice(0, name.length / 2) || name[0])
    const to = idx(name.slice(name.length / 2) || name[1])
    const fb = parseDMS(r.fb),
      bb = parseDMS(r.bb)
    const diff = norm360(bb - fb)
    return { line: name, from, to, fb, bb, diff, free: Math.abs(diff - 180) <= tolDeg, cfb: null as number | null, cbb: null as number | null }
  })
  const corr: (number | null)[] = stations.map(() => null)
  const free = lines.find((l) => l.free) ?? lines.reduce((a, b) => (Math.abs(b.diff - 180) < Math.abs(a.diff - 180) ? b : a))
  corr[free.from] = 0
  corr[free.to] = norm360(free.fb + 180 - free.bb + 180) - 180
  if (free.free) corr[free.to] = 0
  // propagate both ways round
  for (let pass = 0; pass < stations.length + 2; pass++)
    for (const l of lines) {
      if (corr[l.from] != null && corr[l.to] == null) corr[l.to] = norm360(l.fb + corr[l.from]! + 180 - l.bb + 180) - 180
      else if (corr[l.to] != null && corr[l.from] == null) corr[l.from] = norm360(l.bb + corr[l.to]! - 180 - l.fb + 180) - 180
    }
  for (const l of lines) {
    l.cfb = corr[l.from] == null ? null : norm360(l.fb + corr[l.from]!)
    l.cbb = corr[l.to] == null ? null : norm360(l.bb + corr[l.to]!)
  }
  const closed = lines.length >= 3 && lines[lines.length - 1].to === lines[0].from
  return { stations, corr, lines, closed }
}

export function BearingSheet({ data, set }: { data: BearingData; set: (d: BearingData) => void }) {
  const tol = (has(data.tolMin) ? n(data.tolMin) : 15) / 60
  const r = useMemo(() => solveBearings(data.rows, tol), [data.rows, tol])
  const line = (i: number) => r?.lines.find((l) => l.line === (data.rows[i].line ?? '').trim().toUpperCase())
  // included angle at each station of a closed traverse: from the corrected bearings, BB of the arriving line − FB of the leaving line
  const angles = r?.closed
    ? r.lines.map((l, i) => {
        const prev = r.lines[(i - 1 + r.lines.length) % r.lines.length]
        if (prev.cbb == null || l.cfb == null) return null
        return { stn: r.stations[l.from], a: norm360(prev.cbb - l.cfb) }
      })
    : []
  const sum = angles.reduce((s, a) => s + (a?.a ?? 0), 0)
  const nA = angles.length
  const interior = Math.abs(sum - (nA - 2) * 180) < Math.abs(sum - (nA + 2) * 180)
  return (
    <div className="space-y-5">
      <p className="text-xs text-mute">
        Lines in the order walked (AB, BC, …) with the fore bearing (at the first station) and back bearing (at the second) read on the prismatic compass. A line whose FB and BB differ by exactly 180° has both ends free from local attraction; corrections start there and run round. Type the taped length of every line to get the plot of the traverse; without lengths the sheet draws each line's bearing.
      </p>
      <Field label="Allowed |FB − BB| − 180° (minutes)" value={data.tolMin} onChange={(v) => set({ ...data, tolMin: v })} w="5rem" />
      <Grid
        rows={data.rows}
        onChange={(rows) => set({ ...data, rows })}
        cols={[
          { key: 'line', label: 'Line', w: '3.4rem', type: 'text' },
          { key: 'fb', label: 'Fore bearing', w: '6.5rem', type: 'dms' },
          { key: 'bb', label: 'Back bearing', w: '6.5rem', type: 'dms' },
          { key: 'len', label: 'Length (m, opt.)', w: '5.5rem', type: 'num' },
        ]}
        outs={[
          { label: 'BB − FB', cell: (i) => (line(i) ? <span className={line(i)!.free ? 'text-good' : 'text-bad'}>{fmtDMS(line(i)!.diff)}</span> : '') },
          { label: 'Corr. FB', cell: (i) => (line(i)?.cfb != null ? fmtDMS(line(i)!.cfb!) : '') },
          { label: 'Corr. BB', cell: (i) => (line(i)?.cbb != null ? fmtDMS(line(i)!.cbb!) : '') },
          { label: 'Reduced bearing', cell: (i) => (line(i)?.cfb != null ? reducedBearing(line(i)!.cfb!).text : '') },
        ]}
      />
      {r && (
        <div className="card p-4 text-sm space-y-1">
          <div className="font-bold">Local attraction at each station</div>
          {r.stations.map((s, i) => (
            <div key={s} className="num">
              {s}: correction <b>{r.corr[i] == null ? '—' : (r.corr[i]! >= 0 ? '+' : '') + fmtDMS(r.corr[i]!)}</b> {r.corr[i] != null && Math.abs(r.corr[i]!) < 1e-6 ? <span className="text-good">free</span> : <span className="text-load">affected</span>}
            </div>
          ))}
          <div className="text-xs text-mute">The correction is added to every bearing read at that station.</div>
        </div>
      )}
      {r?.closed && nA >= 3 && (
        <div className="card p-4 text-sm space-y-1">
          <div className="font-bold">Included angles (from corrected bearings: BB of the line arriving − FB of the line leaving)</div>
          {angles.map((a, i) => a && <div key={i} className="num">∠{a.stn} = {fmtDMS(interior ? a.a : 360 - a.a)}</div>)}
          <Check ok={Math.abs((interior ? sum : 360 * nA - sum) - (nA - 2) * 180) < 0.02}>
            Σ = {fmtDMS(interior ? sum : 360 * nA - sum)} · should be (n − 2)·180° = {(nA - 2) * 180}°
          </Check>
        </div>
      )}
      {r && <BearingPlot r={r} rows={data.rows} />}
    </div>
  )
}

/** length typed for each solved line (NaN when blank) */
function lengthsOf(r: BearingResult, rows: Row[]) {
  return r.lines.map((l) => {
    const row = rows.find((x) => (x.line ?? '').trim().toUpperCase() === l.line)
    return row && has(row.len) ? n(row.len) : NaN
  })
}

/** with lengths: the traverse plotted from the observed (dashed) and corrected (solid) fore bearings; without: one bearing sketch per line */
function BearingPlot({ r, rows }: { r: BearingResult; rows: Row[] }) {
  const lens = lengthsOf(r, rows)
  if (lens.every((x) => isFinite(x) && x > 0)) {
    const walk = (brg: (i: number) => number) => {
      const pts: (Pt & { name: string })[] = [{ e: 0, n: 0, name: r.stations[r.lines[0].from] }]
      r.lines.forEach((l, i) => {
        const d = latDep(lens[i], brg(i))
        const p = pts[pts.length - 1]
        pts.push({ e: p.e + d.dep, n: p.n + d.lat, name: r.stations[l.to] })
      })
      return pts
    }
    const obs = walk((i) => r.lines[i].fb)
    const cor = walk((i) => r.lines[i].cfb ?? r.lines[i].fb)
    const end = cor[cor.length - 1]
    const gap = r.closed ? Math.hypot(end.e, end.n) : NaN
    const per = lens.reduce((s, x) => s + x, 0)
    return (
      <div className="space-y-1">
        <div className="font-bold text-sm">Plot — observed fore bearings (dashed) and corrected (solid)</div>
        <PlanFrame pts={[...obs, ...cor]} unit="m" height={400}>
          {({ X, Y }) => (
            <g>
              <path d={'M' + obs.map((p) => `${X(p.e)} ${Y(p.n)}`).join(' L')} fill="none" stroke="var(--c-bad)" strokeWidth="1.2" strokeDasharray="5 3" />
              <path d={'M' + cor.map((p) => `${X(p.e)} ${Y(p.n)}`).join(' L')} fill={r.closed ? 'var(--c-accent)' : 'none'} fillOpacity="0.06" stroke="var(--c-ink)" strokeWidth="1.7" />
              {r.closed && gap > 1e-9 && <line x1={X(end.e)} y1={Y(end.n)} x2={X(0)} y2={Y(0)} stroke="var(--c-load)" strokeWidth="2" />}
              {cor.slice(0, r.closed ? -1 : undefined).map((p, i) => (
                <Station key={i} x={X(p.e)} y={Y(p.n)} label={p.name} />
              ))}
              {r.closed && gap > 1e-9 && <Station x={X(end.e)} y={Y(end.n)} label={end.name + '′'} color="var(--c-load)" />}
            </g>
          )}
        </PlanFrame>
        {r.closed && (
          <div className="text-xs text-mute">
            Closing error (corrected bearings) = <b className="num">{fx(gap, 3)} m</b> over a perimeter of <span className="num">{fx(per, 2)} m</span> = 1 in <b className="num">{gap > 1e-9 ? Math.round(per / gap) : '∞'}</b>; a compass traverse is usually adjusted graphically (Bowditch), as on the closed-traverse sheet.
          </div>
        )}
      </div>
    )
  }
  // no lengths: each line's fore bearing on its own north line
  const C = 5
  const cw = 128,
    ch = 150,
    R = 44
  const nC = Math.min(C, r.lines.length)
  const W = Math.max(cw * nC, 320),
    H = ch * Math.ceil(r.lines.length / C)
  return (
    <div className="space-y-1">
      <div className="font-bold text-sm">Fore bearing of each line — observed (dashed) and corrected (solid)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl border border-line bg-bg" style={{ maxWidth: W * 1.25 }}>
        {r.lines.map((l, i) => {
          const cx = (i % C) * cw + cw / 2 + (W - cw * nC) / 2
          const cy = Math.floor(i / C) * ch + 70
          const ray = (b: number, len: number) => ({ x: cx + len * Math.sin((b * Math.PI) / 180), y: cy - len * Math.cos((b * Math.PI) / 180) })
          const o = ray(l.fb, R)
          const c = l.cfb != null ? ray(l.cfb, R) : null
          return (
            <g key={l.line}>
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--c-line)" />
              <line x1={cx} y1={cy + R} x2={cx} y2={cy - R - 8} stroke="var(--c-mute)" />
              <text x={cx} y={cy - R - 11} fontSize="10" fontWeight="700" textAnchor="middle" fill="var(--c-mute)">
                N
              </text>
              <line x1={cx} y1={cy} x2={o.x} y2={o.y} stroke="var(--c-bad)" strokeWidth="1.3" strokeDasharray="4 3" />
              {c && <line x1={cx} y1={cy} x2={c.x} y2={c.y} stroke="var(--c-accent)" strokeWidth="2" />}
              {c && <circle cx={c.x} cy={c.y} r="2.5" fill="var(--c-accent)" />}
              <circle cx={cx} cy={cy} r="2" fill="var(--c-ink)" />
              <text x={cx} y={cy + R + 17} fontSize="12" fontWeight="700" textAnchor="middle" fill="var(--c-ink)">
                {l.line}
              </text>
              <text x={cx} y={cy + R + 31} fontSize="9.5" textAnchor="middle" fill="var(--c-accent)">
                {l.cfb != null ? reducedBearing(l.cfb).text : fmtDMS(l.fb)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
