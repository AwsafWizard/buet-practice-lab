import type { FC, ReactNode } from 'react'
import type { RefGroup } from './drawer'

export interface RefItem {
  id: string
  group: RefGroup
  title: string
  /** code reference shown as a chip, e.g. "Table 6.2.10" */
  tag?: string
  /** printed with recent question papers */
  exam?: boolean
  /** extra search words (symbols, synonyms) */
  keywords?: string
  Body: FC
}

/** compact table: first column left-aligned text, the rest numbers */
export function RT({ head, rows, hl, cap, groups }: { head: ReactNode[]; rows: ReactNode[][]; hl?: (i: number) => boolean; cap?: ReactNode; groups?: [ReactNode, number][] }) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="tbl ref-tbl">
        <thead>
          {groups && (
            <tr>
              {groups.map(([g, span], i) => (
                <th key={i} colSpan={span} className="!text-center !pb-0 !border-b-0">
                  {g}
                </th>
              ))}
            </tr>
          )}
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={hl?.(i) ? 'hl' : undefined}>
              {r.map((c, j) => (
                <td key={j} className={j === 0 ? 'txt' : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {cap && <div className="text-[11px] text-faint mt-1 leading-snug">{cap}</div>}
    </div>
  )
}

/** small labelled number input for the lookup boxes */
export function NumIn({ label, value, onChange, step = 0.1, unit, w = 'w-20' }: { label: ReactNode; value: number; onChange: (v: number) => void; step?: number; unit?: string; w?: string }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs">
      <span className="text-mute">{label}</span>
      <input
        type="number"
        className={'field !py-0.5 !px-1.5 !text-xs num ' + w}
        value={Number.isFinite(value) ? value : ''}
        step={step}
        onChange={(e) => onChange(e.target.value === '' ? NaN : +e.target.value)}
      />
      {unit && <span className="text-faint">{unit}</span>}
    </label>
  )
}

/** framed "lookup" strip under a table */
export function Lookup({ children, result }: { children: ReactNode; result: ReactNode }) {
  return (
    <div className="mt-2 rounded-lg border border-line bg-panel2/60 px-2.5 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-bold text-accent">Lookup</span>
        {children}
      </div>
      <div className="mt-1.5 num">{result}</div>
    </div>
  )
}

export const ok = (v: number) => Number.isFinite(v)
