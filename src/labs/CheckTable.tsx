// Fill-in table for calculator labs: every cell is an input checked against the engine value.

import { useState, type ReactNode } from 'react'
import { fmt } from '../components/DiagramView'
import { isClose } from '../components/ui'
import { useStore } from '../store'

export interface CheckCol<R> {
  key: string
  label: ReactNode
  get: (r: R) => number
  /** absolute tolerance floor (relative tolerance is 2 %) */
  abs: number
  digits?: number
}

/** short stable key so attempts are stored per generated problem */
export function hashKey(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

export function CheckTable<R>({ rows, rowKey, given, cols, idp }: { rows: R[]; rowKey: (r: R) => string; given: { label: ReactNode; get: (r: R) => ReactNode }[]; cols: CheckCol<R>[]; idp: string }) {
  const record = useStore((s) => s.record)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [res, setRes] = useState<Record<string, boolean>>({})
  const [reveal, setReveal] = useState(false)
  const check = () => {
    const out: Record<string, boolean> = {}
    for (const r of rows)
      for (const c of cols) {
        const cell = `${rowKey(r)}:${c.key}`
        const g = parseFloat((vals[cell] ?? '').replace(/[^\d.eE+-]/g, ''))
        if (!Number.isFinite(g)) continue
        const v = c.get(r)
        out[cell] = isClose(g, v, 0.02, c.abs)
        record(`${idp}:${cell}`, out[cell])
      }
    setRes(out)
  }
  const filled = Object.keys(res).length
  const nOk = Object.values(res).filter(Boolean).length
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="tbl w-auto">
          <thead>
            <tr>
              {given.map((g, i) => (
                <th key={i}>{g.label}</th>
              ))}
              {cols.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={rowKey(r)}>
                {given.map((g, i) => (
                  <td key={i} className={i === 0 ? 'txt' : ''}>
                    {g.get(r)}
                  </td>
                ))}
                {cols.map((c) => {
                  const cell = `${rowKey(r)}:${c.key}`
                  const st = res[cell]
                  return (
                    <td key={c.key}>
                      <input
                        className={'field w-24 !py-0.5 ' + (st === true ? 'border-good! text-good' : st === false ? 'border-bad! text-bad' : '')}
                        value={vals[cell] ?? ''}
                        placeholder={reveal ? fmt(c.get(r), c.digits ?? 1) : ''}
                        onChange={(e) => {
                          setVals({ ...vals, [cell]: e.target.value })
                          const { [cell]: _, ...rest } = res
                          setRes(rest)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && check()}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button className="btn !py-1 !px-2.5" onClick={check}>
          Check table
        </button>
        <button className="text-xs text-accent underline" onClick={() => setReveal(!reveal)}>
          {reveal ? 'hide answers' : 'show answers as hints'}
        </button>
        {filled > 0 && (
          <span className={'font-bold ' + (nOk === filled ? 'text-good' : 'text-mute')}>
            {nOk} / {filled} checked cells correct
          </span>
        )}
        <span className="text-xs text-faint">Enter checks every filled cell · 2 % tolerance</span>
      </div>
    </div>
  )
}
