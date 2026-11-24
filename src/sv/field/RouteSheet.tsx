// Route project: the alignment (three straights, their bearings and the deflection at each IP), the details
// beside it, and the levels along and across the centre line (level book → profile + cross-sections).
import { useMemo } from 'react'
import { fmtDMS, latDep, norm360, parseDMS } from '../engine/angle'
import { Field, fx, Grid, has, n, type Row } from './Grid'
import { LevelSheet, levelBlank, type LevelData } from './LevelSheet'
import { PlanFrame, Station } from './plots'

export interface RouteData {
  segs: Row[]
  details: Row[]
  lane: string
  row: string
  level: LevelData
}

export const routeBlank = (): RouteData => ({ segs: [{ name: 'IP0–IP1', len: '50' }, { name: 'IP1–IP2', len: '50' }, { name: 'IP2–IP3', len: '50' }], details: [{}, {}], lane: '3.5', row: '10', level: levelBlank() })

export const routeSample = (): RouteData => {
  const lv = levelBlank()
  lv.bmNote = 'TBM carried in from the nearby BM by fly levelling'
  const readings: [string, string, string, string][] = [
    // ch, off, reading kind, value
    ['', '', 'bs', '1.420'],
    ['0', 'L5', 'is', '1.515'],
    ['0', 'L3.5', 'is', '1.480'],
    ['0', 'CL', 'is', '1.452'],
    ['0', 'R3.5', 'is', '1.470'],
    ['0', 'R5', 'is', '1.505'],
    ['10', 'CL', 'is', '1.440'],
    ['20', 'CL', 'is', '1.418'],
    ['25', 'L5', 'is', '1.490'],
    ['25', 'L3.5', 'is', '1.455'],
    ['25', 'CL', 'is', '1.405'],
    ['25', 'R3.5', 'is', '1.433'],
    ['25', 'R5', 'is', '1.476'],
    ['30', 'CL', 'is', '1.398'],
    ['40', 'CL', 'is', '1.380'],
    ['50', 'CL', 'cp', '1.365|1.210'],
    ['60', 'CL', 'is', '1.230'],
    ['70', 'CL', 'is', '1.262'],
    ['75', 'L5', 'is', '1.340'],
    ['75', 'L3.5', 'is', '1.300'],
    ['75', 'CL', 'is', '1.275'],
    ['75', 'R3.5', 'is', '1.290'],
    ['75', 'R5', 'is', '1.330'],
    ['80', 'CL', 'is', '1.288'],
    ['90', 'CL', 'is', '1.305'],
    ['100', 'CL', 'fs', '1.322'],
  ]
  lv.rows = readings.map(([ch, off, k, v]) => (k === 'cp' ? { stn: 'CP1', ch, off, fs: v.split('|')[0], bs: v.split('|')[1], remark: 'change point' } : { stn: ch === '' ? 'TBM' : '', ch, off, [k]: v }))
  return {
    segs: [
      { name: 'IP0–IP1', len: '50', brg: '60' },
      { name: 'IP1–IP2', len: '50', brg: '105' },
      { name: 'IP2–IP3', len: '50', brg: '75' },
    ],
    details: [
      { ch: '12', side: 'L', off: '7', obj: 'tree' },
      { ch: '38', side: 'R', off: '6.5', obj: 'electric pole' },
      { ch: '64', side: 'L', off: '4', obj: 'drain' },
      { ch: '120', side: 'R', off: '8', obj: 'building corner' },
    ],
    lane: '3.5',
    row: '10',
    level: lv,
  }
}

export function RouteSheet({ data, set }: { data: RouteData; set: (d: RouteData) => void }) {
  const segs = useMemo(() => {
    let ch = 0
    let p = { e: 0, n: 0 }
    return data.segs.map((s) => {
      const L = n(s.len),
        b = parseDMS(s.brg)
      const ok = L > 0 && isFinite(b)
      const start = p
      const c0 = ch
      if (ok) {
        const d = latDep(L, b)
        p = { e: p.e + d.dep, n: p.n + d.lat }
        ch += L
      }
      return { ok, L, b, start, end: p, c0, c1: ch }
    })
  }, [data.segs])
  const at = (ch: number, off: number) => {
    const s = segs.find((x) => x.ok && ch <= x.c1 + 1e-9) ?? [...segs].reverse().find((x) => x.ok)
    if (!s) return null
    const d = latDep(ch - s.c0, s.b)
    const nrm = latDep(off, norm360(s.b + 90)) // + = right of the direction of travel
    return { e: s.start.e + d.dep + nrm.dep, n: s.start.n + d.lat + nrm.lat }
  }
  const total = segs.filter((s) => s.ok).reduce((a, s) => a + s.L, 0)
  const half = (has(data.lane) ? n(data.lane) : 3.5) * 1
  const row = (has(data.row) ? n(data.row) : 10) / 2
  const edge = (off: number) => {
    const pts: { e: number; n: number }[] = []
    for (let c = 0; c <= total + 1e-9; c += Math.max(total / 60, 0.5)) {
      const p = at(c, off)
      if (p) pts.push(p)
    }
    return pts
  }
  const okSegs = segs.filter((s) => s.ok)
  return (
    <div className="space-y-6">
      <div className="card p-4 space-y-3">
        <div className="font-bold">1 · Alignment (horizontal control)</div>
        <p className="text-xs text-mute">Each straight with its taped length and its bearing (theodolite / total station, carried from a north-set line). The deflection at each IP = change of bearing (R = clockwise).</p>
        <Grid
          rows={data.segs}
          onChange={(segs2) => set({ ...data, segs: segs2 })}
          cols={[
            { key: 'name', label: 'Straight', w: '6rem', type: 'text' },
            { key: 'len', label: 'Length (m)', w: '5rem', type: 'num' },
            { key: 'brg', label: 'WCB', w: '6rem', type: 'dms' },
          ]}
          outs={[
            { label: 'Chainage', cell: (i) => (segs[i]?.ok ? `${fx(segs[i].c0, 1)} → ${fx(segs[i].c1, 1)}` : '') },
            {
              label: 'Deflection at its start',
              cell: (i) => {
                if (i === 0 || !segs[i]?.ok || !segs[i - 1]?.ok) return ''
                const d = norm360(segs[i].b - segs[i - 1].b)
                return d <= 180 ? `${fmtDMS(d)} R` : `${fmtDMS(360 - d)} L`
              },
            },
          ]}
        />
        <div className="flex flex-wrap gap-4">
          <Field label="Lane width (m)" value={data.lane} onChange={(v) => set({ ...data, lane: v })} w="5rem" hint="2 lanes → carriageway edges at ± this" />
          <Field label="Right of way (m)" value={data.row} onChange={(v) => set({ ...data, row: v })} w="5rem" hint="ROW lines at ± half" />
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="font-bold">2 · Details beside the alignment</div>
        <Grid
          rows={data.details}
          onChange={(details) => set({ ...data, details })}
          cols={[
            { key: 'ch', label: 'Chainage (m)', w: '5rem', type: 'num' },
            { key: 'side', label: 'L / R', w: '3rem', type: 'text' },
            { key: 'off', label: 'Offset (m)', w: '5rem', type: 'num' },
            { key: 'obj', label: 'Feature', w: '9rem', type: 'text', ph: 'tree, pole, drain…' },
          ]}
          outs={[{ label: 'inside ROW?', cell: (i) => (has(data.details[i].off) ? (n(data.details[i].off) <= row ? <span className="text-bad">yes — affected</span> : 'no') : '') }]}
        />
      </div>

      {okSegs.length > 0 && (
        <PlanFrame pts={[...edge(-row - 2), ...edge(row + 2)]} unit="m" height={360}>
          {({ X, Y }) => {
            const line = (pts: { e: number; n: number }[]) => 'M' + pts.map((p) => `${X(p.e)} ${Y(p.n)}`).join(' L')
            return (
              <g>
                <path d={line(edge(-row))} fill="none" stroke="var(--c-bad)" strokeDasharray="6 4" />
                <path d={line(edge(row))} fill="none" stroke="var(--c-bad)" strokeDasharray="6 4" />
                <path d={line(edge(-half))} fill="none" stroke="var(--c-ink)" strokeWidth="1.3" />
                <path d={line(edge(half))} fill="none" stroke="var(--c-ink)" strokeWidth="1.3" />
                <path d={line(edge(0))} fill="none" stroke="var(--c-accent)" strokeWidth="1.4" strokeDasharray="12 3 2 3" />
                {Array.from({ length: Math.floor(total / 10) + 1 }, (_, i) => i * 10).map((c) => {
                  const a = at(c, -row),
                    b = at(c, row),
                    t = at(c, -row - 1.2)
                  return (
                    a &&
                    b &&
                    t && (
                      <g key={c}>
                        <line x1={X(a.e)} y1={Y(a.n)} x2={X(b.e)} y2={Y(b.n)} stroke="var(--c-line)" />
                        {c % 50 === 0 && (
                          <text x={X(t.e)} y={Y(t.n)} fontSize="9" textAnchor="middle" fill="var(--c-mute)">
                            {Math.floor(c / 100)}+{String(c % 100).padStart(2, '0')}
                          </text>
                        )}
                      </g>
                    )
                  )
                })}
                {data.details.map((d, i) => {
                  if (!has(d.ch) || !has(d.off)) return null
                  const p = at(n(d.ch), ((d.side ?? 'L').toUpperCase().startsWith('R') ? 1 : -1) * n(d.off))
                  return (
                    p && (
                      <g key={i}>
                        <circle cx={X(p.e)} cy={Y(p.n)} r="4" fill="none" stroke="var(--c-good)" strokeWidth="1.6" />
                        <text x={X(p.e) + 6} y={Y(p.n) + 3} fontSize="9.5" fill="var(--c-mute)">
                          {d.obj}
                        </text>
                      </g>
                    )
                  )
                })}
                {okSegs.map((s, i) => (
                  <Station key={i} x={X(s.start.e)} y={Y(s.start.n)} label={`IP${i}`} />
                ))}
                <Station x={X(okSegs[okSegs.length - 1].end.e)} y={Y(okSegs[okSegs.length - 1].end.n)} label={`IP${okSegs.length}`} />
              </g>
            )
          }}
        </PlanFrame>
      )}
      <div className="text-xs text-mute">Strip plan: centre line (dash-dot), carriageway edges (solid, ± {half} m), right-of-way (red dashed, ± {row} m); a tick every 10 m. Draw it at 1:500 on the sheet, the profile at 1:500 horizontal / 1:100 vertical.</div>

      <div className="space-y-2">
        <div className="font-bold">3 · Levels along and across the centre line (vertical control from the BM)</div>
        <LevelSheet data={data.level} set={(level) => set({ ...data, level })} />
      </div>
    </div>
  )
}
