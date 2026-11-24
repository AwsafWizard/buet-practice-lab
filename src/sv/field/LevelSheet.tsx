// Level book: rise & fall (the method the course asks for) with HI alongside, the book checks,
// the longitudinal profile along the centre line and a cross-section at every chainage that has side readings.
import { useMemo } from 'react'
import { reduceLevels, type LevelRow } from '../engine/level'
import { Check, Field, fx, Grid, has, n, type Row } from './Grid'
import { Profile } from './plots'

export interface LevelData {
  bmRL: string
  closeRL: string
  bmNote: string
  rows: Row[]
}

/** 'CL' / '0' → 0, 'L3' / 'L 1.5' → −3 / −1.5, 'R1.5' → 1.5, '-3' → −3 */
export function parseOff(s: string | undefined): number {
  if (s == null) return NaN
  const t = s.trim().toUpperCase()
  if (!t) return NaN
  if (t === 'CL' || t === 'C') return 0
  const m = t.match(/^([LR])\s*([0-9.]+)$/)
  if (m) return (m[1] === 'L' ? -1 : 1) * Number(m[2])
  return n(t)
}

export const levelBlank = (): LevelData => ({ bmRL: '100', closeRL: '', bmNote: '', rows: [{ stn: 'BM' }, {}, {}, {}] })

/** Nafim's 2022 level book (rise & fall, BM 100, readings in m; offsets read off his cross-section sheet) */
export const levelSample = (): LevelData => {
  const r = (ch: string, off: string, v: { bs?: string; is?: string; fs?: string }, stn = '', remark = ''): Row => ({ stn, ch, off, bs: v.bs ?? '', is: v.is ?? '', fs: v.fs ?? '', remark })
  return {
    bmRL: '100',
    closeRL: '',
    bmNote: 'BM on the playground (18-batch level book, Nafim, 29.10.2022)',
    rows: [
      r('', '', { bs: '1.02' }, 'BM', 'BM'),
      r('0', 'L3', { is: '1.345' }, '', 'L2'),
      r('0', 'L1.5', { is: '1.340' }, '', 'L1'),
      r('0', 'CL', { is: '1.347' }, '', 'CL'),
      r('0', 'R1.5', { is: '1.345' }, '', 'R1'),
      r('0', 'R3', { is: '1.335' }, '', 'R2'),
      r('10', 'CL', { is: '1.3375' }),
      r('20', 'L3', { is: '1.340' }, '', 'L2'),
      r('20', 'L1.5', { is: '1.3425' }, '', 'L1'),
      r('20', 'CL', { is: '1.335' }, '', 'CL'),
      r('20', 'R1.5', { is: '1.343' }, '', 'R1'),
      r('20', 'R3', { is: '1.349' }, '', 'R2'),
      r('30', 'CL', { fs: '1.365', bs: '1.21' }, 'CP1', 'change point'),
      r('40', 'L3', { is: '1.225' }, '', 'L2'),
      r('40', 'L1.5', { is: '1.225' }, '', 'L1'),
      r('40', 'CL', { is: '1.210' }, '', 'CL'),
      r('40', 'R1.5', { is: '1.190' }, '', 'R1'),
      r('40', 'R3', { is: '1.205' }, '', 'R2'),
      r('50', 'CL', { is: '1.235' }),
      r('60', 'L3', { is: '1.265' }, '', 'L2'),
      r('60', 'L1.5', { is: '1.265' }, '', 'L1'),
      r('60', 'CL', { is: '1.265' }, '', 'CL'),
      r('60', 'R1.5', { is: '1.268' }, '', 'R1'),
      r('60', 'R3', { fs: '1.259' }, '', 'R2'),
    ],
  }
}

export function useLevel(d: LevelData) {
  return useMemo(() => {
    const rows: LevelRow[] = d.rows.map((r) => ({
      stn: r.stn,
      ch: has(r.ch) ? n(r.ch) : null,
      off: parseOff(r.off),
      bs: has(r.bs) ? n(r.bs) : null,
      is: has(r.is) ? n(r.is) : null,
      fs: has(r.fs) ? n(r.fs) : null,
      remark: r.remark,
    }))
    // keep the mapping from book rows to reduced rows (blank rows are skipped by the engine)
    const idx: number[] = []
    rows.forEach((r, i) => {
      if (r.bs != null || r.is != null || r.fs != null) idx.push(i)
    })
    const res = reduceLevels(rows, has(d.bmRL) ? n(d.bmRL) : 100, has(d.closeRL) ? n(d.closeRL) : null)
    const at = new Map(idx.map((bookRow, k) => [bookRow, res.rows[k]]))
    return { res, at, rows }
  }, [d])
}

export function LevelSheet({ data, set }: { data: LevelData; set: (d: LevelData) => void }) {
  const { res, at, rows } = useLevel(data)
  const cols = [
    { key: 'stn', label: 'Station', w: '4.2rem', type: 'text' as const, ph: 'BM / CP' },
    { key: 'ch', label: 'Chainage', w: '4.2rem', type: 'num' as const },
    { key: 'off', label: 'Offset', w: '4rem', type: 'text' as const, ph: 'CL / L3', title: 'CL, L1.5, R3 … (left is −)' },
    { key: 'bs', label: 'BS', w: '4.4rem', type: 'num' as const },
    { key: 'is', label: 'IS', w: '4.4rem', type: 'num' as const },
    { key: 'fs', label: 'FS', w: '4.4rem', type: 'num' as const },
    { key: 'remark', label: 'Remarks', w: '6rem', type: 'text' as const },
  ]
  const outs = [
    { label: 'Rise', cell: (i: number) => fx(at.get(i)?.rise, 3) },
    { label: 'Fall', cell: (i: number) => fx(at.get(i)?.fall, 3) },
    { label: 'HI', cell: (i: number) => (rows[i].bs != null ? fx((at.get(i)?.rl ?? NaN) + (rows[i].bs ?? 0), 3) : ''), title: 'height of instrument (collimation) of the set-up started on this row' },
    { label: 'RL', cell: (i: number) => <b>{fx(at.get(i)?.rl, 3)}</b> },
    ...(res.misclosure != null ? [{ label: 'Adj. RL', cell: (i: number) => fx(at.get(i)?.adj, 3) }] : []),
  ]

  // centre-line profile + cross-sections
  const cl = rows.map((r, i) => ({ r, red: at.get(i) })).filter((x) => x.r.ch != null && x.red?.rl != null && (x.r.off === 0 || isNaN(x.r.off as number)))
  const byCh = new Map<number, { off: number; z: number }[]>()
  rows.forEach((r, i) => {
    const red = at.get(i)
    if (r.ch == null || red?.rl == null || isNaN(r.off as number)) return
    const list = byCh.get(r.ch) ?? []
    list.push({ off: r.off as number, z: red.rl })
    byCh.set(r.ch, list)
  })
  const xs = [...byCh.entries()].filter(([, l]) => l.length >= 3).sort((a, b) => a[0] - b[0])
  const d3 = (v: number) => v.toFixed(3)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <Field label="RL of the BM (m)" value={data.bmRL} onChange={(v) => set({ ...data, bmRL: v })} hint="the first row’s BS is read on it" />
        <Field label="Known RL of the last point" value={data.closeRL} onChange={(v) => set({ ...data, closeRL: v })} hint="only if you closed back on a BM" />
        <Field label="BM description" type="text" w="18rem" value={data.bmNote} onChange={(v) => set({ ...data, bmNote: v })} ph="e.g. top of PL at DSW building" />
      </div>
      <p className="text-xs text-mute">
        One row per staff reading, in the order you took them. A change point is ONE row with its FS (read from the old set-up) and its BS (from the new one). Offsets: <b>CL</b>, <b>L1.5</b>, <b>R3</b>… Press Enter to go down a column.
      </p>
      <Grid rows={data.rows} cols={cols} outs={outs} onChange={(rows) => set({ ...data, rows })} rowNote={(i) => (rows[i].bs != null && i > 0 && rows[i].fs == null ? 'BS here needs its FS (change point)' : null)} />

      <div className="card p-4 space-y-1.5">
        <div className="font-bold mb-1">Level-book checks</div>
        <Check ok={res.ok}>
          ΣBS − ΣFS = {d3(res.sumBS)} − {d3(res.sumFS)} = <b>{d3(res.dBSFS)}</b> · ΣRise − ΣFall = {d3(res.sumRise)} − {d3(res.sumFall)} = <b>{d3(res.dRF)}</b> · Last RL − First RL = {d3(res.lastRL)} − {d3(res.firstRL)} = <b>{d3(res.dRL)}</b>
        </Check>
        <Check ok={res.hiCheck.ok}>
          HI method: Σ(HI of each IS/FS) − ΣIS − ΣFS = <b>{d3(res.hiCheck.lhs)}</b> = Σ RLs except the first = <b>{d3(res.hiCheck.rhs)}</b>
        </Check>
        <div className="text-xs text-mute">
          {res.setups} set-up{res.setups === 1 ? '' : 's'} · {rows.filter((r) => r.bs != null || r.is != null || r.fs != null).length} readings
          {res.setups < 2 && ' · the assignment needs at least 2 set-ups (one change point)'}
        </div>
        {res.misclosure != null && (
          <div className="text-sm">
            Misclosure on the closing BM = <b className="num">{(res.misclosure * 1000).toFixed(1)} mm</b>, spread equally over the {res.setups} set-ups (Adj. RL column).
          </div>
        )}
        {res.errors.map((e, i) => (
          <div key={i} className="text-xs text-bad">
            ⚠ {e}
          </div>
        ))}
      </div>

      <Profile title="Longitudinal profile (centre line)" pts={cl.map((x) => ({ x: x.r.ch as number, z: x.red!.rl as number }))} />
      {xs.length > 0 && (
        <div>
          <div className="font-bold mb-2 text-sm">Cross-sections</div>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
            {xs.map(([ch, l]) => (
              <Profile key={ch} title={`Ch ${ch} m`} height={170} xLabel="offset (m), left −  right +" pts={l.map((p) => ({ x: p.off, z: p.z, tag: p.off === 0 ? 'CL' : String(Math.abs(p.off)) }))} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
