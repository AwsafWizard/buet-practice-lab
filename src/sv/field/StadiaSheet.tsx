// Stadia survey: tacheometric constants from taped shots, then every staff position by bearing + stadia hairs.
import { useMemo } from 'react'
import { Seg } from '../../components/ui'
import { fmtDMS, parseDMS } from '../engine/angle'
import { stadiaConstants, stadiaPoints } from '../engine/stadia'
import { Field, fx, Grid, has, n, type Row } from './Grid'
import { PlanFrame, Station } from './plots'

export interface StadiaData {
  read: 'm' | 'cm'
  consts: Row[]
  /** use these instead of the fitted constants (e.g. the maker's K = 100, C = 0) */
  Kfix: string
  Cfix: string
  stnRL: string
  hi: string
  rows: Row[]
}

export const stadiaBlank = (): StadiaData => ({ read: 'm', consts: [{ d: '10' }, { d: '20' }, { d: '30' }], Kfix: '', Cfix: '', stnRL: '', hi: '', rows: Array.from({ length: 5 }, (_, i) => ({ pt: String(i + 1) })) })

/** Nafim's 2022 stadia sheet: shots at 10 m and 20 m → K = 100, C = 0; 25 staff positions, readings in cm, level sights */
export const stadiaSample = (): StadiaData => {
  const raw: [string, string, string][] = [
    ['278 46 20', '146', '134'],
    ['292 41 20', '145.5', '133'],
    ['302 49 30', '145', '132.5'],
    ['310 06 30', '145', '131.5'],
    ['317 28 30', '143.5', '123.5'],
    ['325 12 30', '143.5', '129'],
    ['335 39 20', '143.5', '128.5'],
    ['343 34 50', '144', '128.5'],
    ['349 17 10', '140.5', '125'],
    ['354 30 10', '144', '128'],
    ['359 24 10', '149', '133.5'],
    ['2 38 20', '149', '133.5'],
    ['5 30 20', '149', '133.5'],
    ['10 51 30', '150', '134.5'],
    ['17 49 20', '149', '133.5'],
    ['22 53 50', '148', '132.5'],
    ['28 15 20', '149', '135'],
    ['32 59 50', '149', '133'],
    ['36 46 30', '144.5', '128.5'],
    ['40 25 10', '143', '127'],
    ['45 34 20', '144', '128'],
    ['52 59 10', '146', '130'],
    ['57 45 50', '144.5', '129.5'],
    ['63 53 20', '144.5', '130.5'],
    ['70 11 40', '144', '130.5'],
  ]
  return {
    read: 'cm',
    consts: [
      { d: '10', up: '143.5', lo: '133.5' },
      { d: '20', up: '148.5', lo: '128.5' },
    ],
    Kfix: '',
    Cfix: '',
    stnRL: '',
    hi: '',
    rows: raw.map(([brg, up, lo], i) => ({ pt: String(i + 1), brg, up, lo, mid: '', va: '' })),
  }
}

export function StadiaSheet({ data, set }: { data: StadiaData; set: (d: StadiaData) => void }) {
  const f = data.read === 'cm' ? 0.01 : 1
  const fit = useMemo(() => stadiaConstants(data.consts.filter((r) => has(r.d) && has(r.up) && has(r.lo)).map((r) => ({ d: n(r.d), s: Math.abs(n(r.up) - n(r.lo)) * f }))), [data.consts, f])
  const K = has(data.Kfix) ? n(data.Kfix) : (fit?.K ?? NaN)
  const C = has(data.Cfix) ? n(data.Cfix) : (fit?.C ?? NaN)
  const ok = isFinite(K) && isFinite(C)
  const pts = useMemo(() => {
    if (!ok) return []
    return data.rows.map((r) => {
      const b = parseDMS(r.brg)
      if (!isFinite(b) || !has(r.up) || !has(r.lo)) return null
      return stadiaPoints([{ bearing: b, upper: n(r.up) * f, lower: n(r.lo) * f, mid: has(r.mid) ? n(r.mid) * f : null, va: /\d/.test(r.va ?? '') ? parseDMS(r.va) : 0 }], K, C, { rl: has(data.stnRL) ? n(data.stnRL) : null, hi: has(data.hi) ? n(data.hi) : null })[0]
    })
  }, [data, K, C, ok, f])
  const ru = data.read
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Staff readings in</span>
          <Seg<'m' | 'cm'> value={data.read} onChange={(v) => set({ ...data, read: v })} items={[{ v: 'm', label: 'm' }, { v: 'cm', label: 'cm' }]} />
        </label>
      </div>

      <div className="card p-4 space-y-3">
        <div className="font-bold">1 · Tacheometric constants</div>
        <p className="text-xs text-mute">
          On level ground, tape two (or more) distances from the instrument in one line — e.g. 10 m and 20 m — and read the upper and lower hairs on the staff at each. D = K·s + C; two shots give K = (D₂ − D₁)/(s₂ − s₁), C = D₁ − K·s₁; more shots are fitted by least squares.
        </p>
        <Grid
          rows={data.consts}
          onChange={(consts) => set({ ...data, consts })}
          minRows={2}
          cols={[
            { key: 'd', label: 'Taped D (m)', w: '5rem', type: 'num' },
            { key: 'up', label: `Upper (${ru})`, w: '5rem', type: 'num' },
            { key: 'lo', label: `Lower (${ru})`, w: '5rem', type: 'num' },
          ]}
          outs={[
            { label: 's (m)', cell: (i) => (has(data.consts[i].up) && has(data.consts[i].lo) ? fx(Math.abs(n(data.consts[i].up) - n(data.consts[i].lo)) * f, 3) : '') },
            { label: 'K·s + C', cell: (i) => (ok && has(data.consts[i].up) && has(data.consts[i].lo) ? fx(K * Math.abs(n(data.consts[i].up) - n(data.consts[i].lo)) * f + C, 2) : '') },
          ]}
        />
        <div className="flex flex-wrap gap-4 items-end">
          <div className="text-sm">
            Fitted: <b className="num">K = {fit ? fit.K.toFixed(2) : '—'}</b>, <b className="num">C = {fit ? fit.C.toFixed(3) : '—'}</b> m
          </div>
          <Field label="Use K =" value={data.Kfix} onChange={(v) => set({ ...data, Kfix: v })} w="5rem" ph="fitted" />
          <Field label="Use C =" value={data.Cfix} onChange={(v) => set({ ...data, Cfix: v })} w="5rem" ph="fitted" />
        </div>
        <div className="text-xs text-mute">Usually K ≈ 100 and C ≈ 0 for an internal-focusing telescope. Round to those only if your teacher says so.</div>
      </div>

      <div className="space-y-2">
        <div className="font-bold">2 · Staff positions (at least 25)</div>
        <div className="flex flex-wrap gap-4 items-end">
          <Field label="RL of instrument station (opt.)" value={data.stnRL} onChange={(v) => set({ ...data, stnRL: v })} w="6rem" />
          <Field label="Height of instrument (m)" value={data.hi} onChange={(v) => set({ ...data, hi: v })} w="6rem" hint="ground to trunnion axis" />
        </div>
        <p className="text-xs text-mute">
          Bearing = horizontal angle with north set to 0. Vertical angle: + elevation, − depression, blank = level. Middle hair optional (defaults to the mean of upper and lower). Inclined sight: D = K s cos²θ + C cosθ, V = ½ K s sin2θ + C sinθ, RL = RL<sub>stn</sub> + h + V − mid.
        </p>
        <Grid
          rows={data.rows}
          onChange={(rows) => set({ ...data, rows })}
          newRow={(p) => ({ pt: p?.pt && has(p.pt) ? String(n(p.pt) + 1) : '' })}
          cols={[
            { key: 'pt', label: 'Pt', w: '2.6rem', type: 'text' },
            { key: 'brg', label: 'Bearing', w: '6.5rem', type: 'dms', ph: '278 46 20' },
            { key: 'up', label: `Upper (${ru})`, w: '4.6rem', type: 'num' },
            { key: 'mid', label: `Mid (${ru})`, w: '4.6rem', type: 'num' },
            { key: 'lo', label: `Lower (${ru})`, w: '4.6rem', type: 'num' },
            { key: 'va', label: 'Vert. angle', w: '5rem', type: 'dms' },
          ]}
          outs={[
            { label: 's (m)', cell: (i) => fx(pts[i]?.s, 3) },
            { label: 'D (m)', cell: (i) => <b>{fx(pts[i]?.hd, 2)}</b> },
            { label: 'V (m)', cell: (i) => (pts[i] && pts[i]!.va ? fx(pts[i]!.v, 3) : '') },
            { label: 'RL', cell: (i) => fx(pts[i]?.rl, 3) },
          ]}
        />
      </div>

      {ok && (
        <PlanFrame pts={[{ e: 0, n: 0 }, ...pts.flatMap((p) => (p ? [{ e: p.e, n: p.n }] : []))]} unit="m" height={420}>
          {({ X, Y }) => (
            <g>
              {pts.map(
                (p, i) =>
                  p && (
                    <g key={i}>
                      <line x1={X(0)} y1={Y(0)} x2={X(p.e)} y2={Y(p.n)} stroke="var(--c-line)" />
                      <circle cx={X(p.e)} cy={Y(p.n)} r="3" fill="var(--c-accent)" />
                      <text x={X(p.e) + 4} y={Y(p.n) - 4} fontSize="9" fill="var(--c-mute)">
                        {data.rows[i].pt}
                      </text>
                    </g>
                  ),
              )}
              <path d={'M' + pts.flatMap((p) => (p ? [`${X(p.e)} ${Y(p.n)}`] : [])).join(' L')} fill="none" stroke="var(--c-accent2)" strokeWidth="1.2" strokeDasharray="4 3" />
              <Station x={X(0)} y={Y(0)} label="O" />
            </g>
          )}
        </PlanFrame>
      )}
      {ok && <div className="text-xs text-mute">Bearings shown as {pts.find(Boolean) ? fmtDMS(pts.find(Boolean)!.bearing) : '—'} … The dashed line joins the staff points in order — the path you surveyed.</div>}
    </div>
  )
}
