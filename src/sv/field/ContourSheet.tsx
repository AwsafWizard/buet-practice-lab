// Contouring by the grid method: staff readings at every grid point from two level set-ups → RLs →
// contour map with an interval that gives at least 7 contour lines; plus the level book in rise & fall order.
import { useMemo, useState } from 'react'
import { contourSegments, levels, pickInterval, type Seg as CSeg } from '../engine/contour'
import { reduceLevels, type LevelRow } from '../engine/level'
import { Check, Field, fx, has, n } from './Grid'

export interface ContourData {
  spacing: string
  rows: number
  cols: number
  /** column labels left → right, row labels top → bottom */
  colNames: string
  rowNames: string
  bmRL: string
  bs1: string
  cpFS: string
  cpBS: string
  /** first column (0-based) read from set-up 2 */
  split: number
  interval: string
  read: string[][]
}

const empty = (r: number, c: number) => Array.from({ length: r }, () => Array.from({ length: c }, () => ''))

export const contourBlank = (): ContourData => ({ spacing: '5', rows: 11, cols: 11, colNames: 'ABCDEFGHIJK', rowNames: '1,2,3,4,5,6,7,8,9,10,11', bmRL: '100', bs1: '', cpFS: '', cpBS: '', split: 6, interval: '', read: empty(11, 11) })

/** Nafim's 2022 contour grid (7 × 7 at 5 m, BM 100, columns G…A, CP at D7): readings rebuilt from his RLs and HIs */
export const contourSample = (): ContourData => {
  const RL = [
    [100.045, 100.05, 100.005, 100.06, 100.02, 99.96, 99.92],
    [100.035, 99.98, 100.05, 99.89, 99.945, 99.925, 99.94],
    [99.925, 99.865, 99.88, 99.88, 99.935, 99.925, 99.925],
    [99.865, 99.905, 99.86, 99.875, 99.855, 99.845, 99.975],
    [99.89, 99.93, 99.855, 99.805, 99.845, 99.855, 100.045],
    [99.86, 99.945, 99.87, 99.835, 99.805, 99.99, 100.01],
    [99.885, 99.94, 99.85, 99.895, 99.945, 99.87, 100.0],
  ]
  const HI1 = 101.13,
    HI2 = 101.345
  return {
    spacing: '5',
    rows: 7,
    cols: 7,
    colNames: 'GFEDCBA',
    rowNames: '1,2,3,4,5,6,7',
    bmRL: '100',
    bs1: '1.13',
    cpFS: '1.235',
    cpBS: '1.45',
    split: 4,
    interval: '',
    read: RL.map((row) => row.map((z, c) => ((c < 4 ? HI1 : HI2) - z).toFixed(3))),
  }
}

const labelsOf = (s: string, k: number, fallback: (i: number) => string) => {
  const parts = s.includes(',') ? s.split(',').map((x) => x.trim()) : s.split('')
  return Array.from({ length: k }, (_, i) => parts[i] || fallback(i))
}

export function ContourSheet({ data, set }: { data: ContourData; set: (d: ContourData) => void }) {
  const [showBook, setShowBook] = useState(false)
  const cols = labelsOf(data.colNames, data.cols, (i) => String.fromCharCode(65 + i))
  const rows = labelsOf(data.rowNames, data.rows, (i) => String(i + 1))
  const HI1 = n(data.bmRL) + n(data.bs1)
  const cpRL = HI1 - n(data.cpFS)
  const HI2 = cpRL + n(data.cpBS)
  const twoSetups = has(data.cpFS) && has(data.cpBS)
  const z = useMemo(
    () =>
      data.read.map((row, r) =>
        row.map((v, c) => {
          if (!has(v)) return NaN
          const hi = c >= data.split && twoSetups ? HI2 : HI1
          return hi - n(v)
        }),
      ),
    [data.read, data.split, HI1, HI2, twoSetups],
  )
  const all = z.flat().filter(isFinite)
  const zmin = all.length ? Math.min(...all) : NaN
  const zmax = all.length ? Math.max(...all) : NaN
  const auto = all.length ? pickInterval(zmin, zmax, 7) : NaN
  const interval = has(data.interval) ? n(data.interval) : auto
  const lv = all.length ? levels(zmin, zmax, interval) : []
  const d = has(data.spacing) ? n(data.spacing) : 5
  const segs = useMemo(() => (all.length ? contourSegments(z, d, lv) : []), [z, d, lv.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const resize = (r: number, c: number) => {
    const read = Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => data.read[i]?.[j] ?? ''))
    set({ ...data, rows: r, cols: c, read, split: Math.min(data.split, c) })
  }
  const setCell = (r: number, c: number, v: string) => set({ ...data, read: data.read.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)) })

  // level book in reading order (set-up 1 columns down each column, then the change point, then set-up 2)
  const book = useMemo(() => {
    const out: (LevelRow & { name: string })[] = [{ name: 'BM', bs: n(data.bs1) }]
    const take = (c0: number, c1: number) => {
      for (let c = c0; c < c1; c++) for (let r = 0; r < data.rows; r++) if (has(data.read[r][c])) out.push({ name: cols[c] + rows[r], is: n(data.read[r][c]) })
    }
    take(0, twoSetups ? data.split : data.cols)
    if (twoSetups) {
      out.push({ name: 'CP', fs: n(data.cpFS), bs: n(data.cpBS) })
      take(data.split, data.cols)
    }
    // close the book on an FS: the last reading becomes the FS
    const last = out[out.length - 1]
    if (out.length > 1 && last.is != null) {
      last.fs = last.is
      last.is = null
    }
    return { rows: out, res: reduceLevels(out, n(data.bmRL)) }
  }, [data, cols, rows, twoSetups])

  const W = 640
  const pad = 36
  const span = Math.max(data.cols - 1, data.rows - 1) * d || 1
  const k = (W - 2 * pad) / span
  const H = (data.rows - 1) * d * k + 2 * pad
  const X = (x: number) => pad + x * k
  const Y = (y: number) => pad + y * k
  const hi = all.length ? z.flat().indexOf(zmax) : -1
  const lo = all.length ? z.flat().indexOf(zmin) : -1
  // one label per level, on its longest segment
  const labelFor = new Map<number, CSeg>()
  for (const s of segs) {
    const L = Math.hypot(s.a[0] - s.b[0], s.a[1] - s.b[1])
    const cur = labelFor.get(s.level)
    if (!cur || L > Math.hypot(cur.a[0] - cur.b[0], cur.a[1] - cur.b[1])) labelFor.set(s.level, s)
  }
  const dpL = interval < 0.01 ? 4 : 3

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <Field label="Grid spacing (m)" value={data.spacing} onChange={(v) => set({ ...data, spacing: v })} w="4.5rem" />
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Grid points</span>
          <span className="flex items-center gap-1">
            <input className="field w-14" type="number" min={2} max={15} value={data.rows} onChange={(e) => resize(Math.max(2, Math.min(15, +e.target.value || 2)), data.cols)} /> rows ×
            <input className="field w-14" type="number" min={2} max={15} value={data.cols} onChange={(e) => resize(data.rows, Math.max(2, Math.min(15, +e.target.value || 2)))} /> cols
          </span>
          <span className="text-[11px] text-faint">50 m at 5 m = 11 × 11</span>
        </label>
        <Field label="Column labels" type="text" value={data.colNames} onChange={(v) => set({ ...data, colNames: v })} w="8rem" />
        <Field label="Row labels" type="text" value={data.rowNames} onChange={(v) => set({ ...data, rowNames: v })} w="8rem" />
      </div>
      <div className="flex flex-wrap gap-4 items-end">
        <Field label="RL of BM" value={data.bmRL} onChange={(v) => set({ ...data, bmRL: v })} w="5rem" />
        <Field label="BS on BM (set-up 1)" value={data.bs1} onChange={(v) => set({ ...data, bs1: v })} w="5rem" hint={isFinite(HI1) ? `HI₁ = ${HI1.toFixed(3)}` : ''} />
        <Field label="FS on CP (set-up 1)" value={data.cpFS} onChange={(v) => set({ ...data, cpFS: v })} w="5rem" hint={isFinite(cpRL) ? `RL of CP = ${cpRL.toFixed(3)}` : ''} />
        <Field label="BS on CP (set-up 2)" value={data.cpBS} onChange={(v) => set({ ...data, cpBS: v })} w="5rem" hint={twoSetups && isFinite(HI2) ? `HI₂ = ${HI2.toFixed(3)}` : ''} />
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Set-up 2 reads from column</span>
          <select className="field" value={data.split} onChange={(e) => set({ ...data, split: +e.target.value })}>
            {cols.map((c, i) => (
              <option key={i} value={i}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="sv-grid text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              <th />
              {cols.map((c, j) => (
                <th key={j} className={'text-center ' + (twoSetups && j >= data.split ? 'out' : '')}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rname, r) => (
              <tr key={r}>
                <td className="text-xs font-bold text-mute pr-1">{rname}</td>
                {cols.map((_, c) => (
                  <td key={c} className={twoSetups && c >= data.split ? 'bg-accent/5' : ''}>
                    <input className="sv-cell !min-w-0 w-[4.3rem] text-center" inputMode="decimal" value={data.read[r]?.[c] ?? ''} onChange={(e) => setCell(r, c, e.target.value)} />
                    <div className="text-[10px] num text-center text-accent leading-none pb-0.5">{isFinite(z[r]?.[c]) ? z[r][c].toFixed(3) : ' '}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[11px] text-faint mt-1">Type the staff reading at each grid point; the RL appears under it. Shaded columns are read from set-up 2.</div>
      </div>

      {all.length > 3 && (
        <>
          <div className="flex flex-wrap gap-4 items-end">
            <Field label="Contour interval (m)" value={data.interval} onChange={(v) => set({ ...data, interval: v })} w="5rem" ph={String(auto)} hint={`auto = ${auto} m`} />
            <div className="text-sm">
              RL range {zmin.toFixed(3)} → {zmax.toFixed(3)} m · <b className={lv.length >= 7 ? 'text-good' : 'text-bad'}>{lv.length} contour lines</b> {lv.length < 7 ? '(the assignment wants at least 7: use a smaller interval)' : ''}
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl border border-line bg-bg">
            {cols.map((c, j) => (
              <g key={'c' + j}>
                <line x1={X(j * d)} x2={X(j * d)} y1={Y(0)} y2={Y((data.rows - 1) * d)} stroke="var(--c-line)" />
                <text x={X(j * d)} y={Y((data.rows - 1) * d) + 18} fontSize="11" textAnchor="middle" fontWeight="700" fill="var(--c-mute)">
                  {c}
                </text>
              </g>
            ))}
            {rows.map((r, i) => (
              <g key={'r' + i}>
                <line x1={X(0)} x2={X((data.cols - 1) * d)} y1={Y(i * d)} y2={Y(i * d)} stroke="var(--c-line)" />
                <text x={X(0) - 14} y={Y(i * d) + 4} fontSize="11" textAnchor="middle" fontWeight="700" fill="var(--c-mute)">
                  {r}
                </text>
              </g>
            ))}
            {segs.map((s, i) => {
              const idx = Math.round(s.level / interval)
              return <line key={i} x1={X(s.a[0])} y1={Y(s.a[1])} x2={X(s.b[0])} y2={Y(s.b[1])} stroke="var(--c-accent)" strokeWidth={idx % 5 === 0 ? 2.2 : 1.3} strokeLinecap="round" />
            })}
            {[...labelFor.values()].map((s) => (
              <text key={s.level} x={X((s.a[0] + s.b[0]) / 2)} y={Y((s.a[1] + s.b[1]) / 2) - 3} fontSize="9.5" fontWeight="700" textAnchor="middle" fill="var(--c-accent)" stroke="var(--c-bg)" strokeWidth="3" paintOrder="stroke">
                {s.level.toFixed(dpL)}
              </text>
            ))}
            {z.map((row, r) =>
              row.map((v, c) => {
                if (!isFinite(v)) return null
                const flat = r * data.cols + c
                return (
                  <g key={`${r}-${c}`}>
                    {flat === hi ? <rect x={X(c * d) - 3.5} y={Y(r * d) - 3.5} width="7" height="7" fill="var(--c-ink)" /> : flat === lo ? <circle cx={X(c * d)} cy={Y(r * d)} r="3.8" fill="var(--c-ink)" /> : <circle cx={X(c * d)} cy={Y(r * d)} r="1.8" fill="var(--c-mute)" />}
                    <text x={X(c * d) + 3} y={Y(r * d) + 10} fontSize="7.5" fill="var(--c-faint)">
                      {v.toFixed(3)}
                    </text>
                  </g>
                )
              }),
            )}
          </svg>
          <div className="text-xs text-mute">■ highest RL · ● lowest RL · contour lines by linear interpolation along the grid lines; every 5th line is drawn heavier.</div>

          <div className="card p-4 space-y-2">
            <button className="font-bold text-left" onClick={() => setShowBook(!showBook)}>
              {showBook ? '▾' : '▸'} Level book in rise & fall form ({book.rows.length} readings)
            </button>
            <Check ok={book.res.ok}>
              ΣBS − ΣFS = {book.res.dBSFS.toFixed(3)} · ΣRise − ΣFall = {book.res.dRF.toFixed(3)} · Last − First RL = {book.res.dRL.toFixed(3)}
            </Check>
            {showBook && (
              <div className="overflow-x-auto">
                <table className="sv-grid text-sm border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {['Point', 'BS', 'IS', 'FS', 'Rise', 'Fall', 'RL'].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {book.res.rows.map((r, i) => (
                      <tr key={i}>
                        <td className="px-2 font-semibold">{book.rows[i].name}</td>
                        <td className="px-2 num">{fx(r.bs, 3)}</td>
                        <td className="px-2 num">{fx(r.is, 3)}</td>
                        <td className="px-2 num">{fx(r.fs, 3)}</td>
                        <td className="px-2 num">{fx(r.rise, 3)}</td>
                        <td className="px-2 num">{fx(r.fall, 3)}</td>
                        <td className="out num">{fx(r.rl, 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
