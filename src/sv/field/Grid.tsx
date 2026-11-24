// Editable field-book table. Cells hold the text as typed (so "123 30 15" or "1.2" mid-typing survive);
// the sheet's engine parses them. Enter moves down the column (adding a row at the end), like filling a book.
import { createContext, useContext, useRef, type ReactNode } from 'react'

export type Row = Record<string, string>

export interface Col {
  key: string
  label: ReactNode
  /** css width, e.g. '5.5rem' */
  w?: string
  /** 'num' brings up the number pad, 'dms' allows spaces (123 30 15), 'text' anything */
  type?: 'num' | 'dms' | 'text'
  ph?: string
  title?: string
}

export interface Out {
  label: ReactNode
  w?: string
  /** computed cell for row i */
  cell: (i: number) => ReactNode
  title?: string
}

/** sheet is shown read-only (PDF export) */
export const ReadOnly = createContext(false)

export function Grid({ rows, cols, outs = [], onChange, newRow = () => ({}), rowNote, minRows = 1, foot, lead }: { rows: Row[]; cols: Col[]; outs?: Out[]; onChange: (rows: Row[]) => void; newRow?: (prev?: Row) => Row; rowNote?: (i: number) => ReactNode; minRows?: number; foot?: ReactNode; lead?: (i: number) => ReactNode }) {
  const ro = useContext(ReadOnly)
  const table = useRef<HTMLTableElement>(null)
  const set = (i: number, k: string, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  const focus = (r: number, c: number) =>
    requestAnimationFrame(() => {
      const el = table.current?.querySelector<HTMLInputElement>(`input[data-r="${r}"][data-c="${c}"]`)
      el?.focus()
      el?.select()
    })
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    if (e.key === 'Enter' || (e.key === 'ArrowDown' && !e.altKey)) {
      e.preventDefault()
      if (r + 1 >= rows.length) onChange([...rows, newRow(rows[rows.length - 1])])
      focus(r + 1, c)
    } else if (e.key === 'ArrowUp' && r > 0) {
      e.preventDefault()
      focus(r - 1, c)
    }
  }
  const insert = (i: number) => onChange([...rows.slice(0, i + 1), newRow(rows[i]), ...rows.slice(i + 1)])
  const remove = (i: number) => rows.length > minRows && onChange(rows.filter((_, j) => j !== i))

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table ref={table} className="sv-grid text-sm border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="w-7 text-faint">#</th>
            {lead && <th />}
            {cols.map((c) => (
              <th key={c.key} style={{ minWidth: c.w }} title={c.title}>
                {c.label}
              </th>
            ))}
            {outs.map((o, k) => (
              <th key={'o' + k} className="out" style={{ minWidth: o.w }} title={o.title}>
                {o.label}
              </th>
            ))}
            {!ro && <th className="w-14" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="text-faint text-[11px] num text-center">{i + 1}</td>
              {lead && <td className="px-1">{lead(i)}</td>}
              {cols.map((c, ci) => (
                <td key={c.key}>
                  {ro ? (
                    <span className="block px-1.5 py-1 num">{r[c.key] ?? ''}</span>
                  ) : (
                    <input
                      className="sv-cell"
                      data-r={i}
                      data-c={ci}
                      value={r[c.key] ?? ''}
                      placeholder={i === 0 ? c.ph : undefined}
                      inputMode={c.type === 'num' ? 'decimal' : c.type === 'dms' ? 'text' : 'text'}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(e) => set(i, c.key, e.target.value)}
                      onKeyDown={(e) => onKey(e, i, ci)}
                      style={{ width: c.w }}
                    />
                  )}
                </td>
              ))}
              {outs.map((o, k) => (
                <td key={'o' + k} className="out num">
                  {o.cell(i)}
                </td>
              ))}
              {!ro && (
                <td className="whitespace-nowrap text-right">
                  <button className="sv-rowbtn" title="Insert a row below" onClick={() => insert(i)}>
                    +
                  </button>
                  <button className="sv-rowbtn" title="Delete this row" onClick={() => remove(i)} disabled={rows.length <= minRows}>
                    ×
                  </button>
                </td>
              )}
              {rowNote && <td className="text-xs text-bad pl-2 whitespace-nowrap">{rowNote(i)}</td>}
            </tr>
          ))}
        </tbody>
        {foot && <tfoot>{foot}</tfoot>}
      </table>
      {!ro && (
        <button className="btn btn-ghost !text-xs mt-1" onClick={() => onChange([...rows, newRow(rows[rows.length - 1])])}>
          + add a row
        </button>
      )}
    </div>
  )
}

/** a labelled input for a sheet's single values (BM RL, bearing of AB …) */
export function Field({ label, value, onChange, type = 'num', w = '7rem', hint, ph }: { label: ReactNode; value: string; onChange: (v: string) => void; type?: 'num' | 'dms' | 'text'; w?: string; hint?: ReactNode; ph?: string }) {
  const ro = useContext(ReadOnly)
  return (
    <label className="flex flex-col gap-0.5 text-xs">
      <span className="text-mute font-semibold">{label}</span>
      {ro ? (
        <span className="num text-sm">{value || '—'}</span>
      ) : (
        <input className="field" style={{ width: w }} value={value} placeholder={ph} inputMode={type === 'num' ? 'decimal' : 'text'} autoComplete="off" spellCheck={false} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="text-[11px] text-faint">{hint}</span>}
    </label>
  )
}

/** read a typed number; '' or junk → NaN */
export const n = (s: string | undefined | null) => {
  if (s == null) return NaN
  const t = String(s).trim().replace(/,/g, '')
  if (!t) return NaN
  const v = Number(t)
  return isFinite(v) ? v : NaN
}
export const has = (s: string | undefined | null) => isFinite(n(s))
export const fx = (v: number | null | undefined, dp = 3) => (v == null || !isFinite(v) ? '' : v.toFixed(dp))

/** a check line: ✓ / ✗ with the numbers */
export function Check({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className={'flex gap-2 items-start text-sm ' + (ok ? 'text-good' : 'text-bad')}>
      <span className="font-bold">{ok ? '✓' : '✗'}</span>
      <span className="text-ink">{children}</span>
    </div>
  )
}
