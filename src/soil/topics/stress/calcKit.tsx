// Small shared pieces of the stress calculators: table cells, cards, the result bar, the working box, mode buttons,
// the "load a case" menu.
import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Md, Seg } from '../../../components/ui'
import { openSmRef } from '../../reference/pane'

export const f1 = (v: number) => fmt(v, 1)
export const f2 = (v: number) => fmt(v, 2)
export const f3 = (v: number) => fmt(v, 3)
export const f4 = (v: number) => fmt(v, 4)
export const R = String.raw
export const fin = (...v: number[]) => v.every(Number.isFinite)

export function Cell({ value, onChange, step = 0.5, w = 'w-14' }: { value: number; onChange: (v: number) => void; step?: number; w?: string }) {
  return <input type="number" className={'field !py-0.5 !px-1 !text-xs num ' + w} value={Number.isFinite(value) ? value : ''} step={step} onChange={(e) => onChange(e.target.value === '' ? NaN : +e.target.value)} />
}

export function Card({ title, inputs, children, chart }: { title: ReactNode; inputs?: ReactNode; children: ReactNode; chart?: string }) {
  return (
    <div className="rounded-xl border border-line p-3 space-y-2 min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-bold text-sm">{title}</div>
        {chart && (
          <button className="text-xs text-accent underline shrink-0" onClick={() => openSmRef(chart)}>
            chart ↗
          </button>
        )}
      </div>
      {inputs && <div className="flex flex-wrap items-center gap-2">{inputs}</div>}
      {children}
    </div>
  )
}

export function Big({ label, value, unit }: { label: ReactNode; value: number; unit?: string }) {
  return (
    <div className="rounded-lg bg-accent/10 border border-accent/30 px-3 py-1.5 flex items-baseline justify-between gap-3">
      <span className="text-sm font-semibold">{label}</span>
      <span className="num text-lg font-bold text-accent">
        {Number.isFinite(value) ? f3(value) : '—'}
        {unit && <span className="text-sm text-mute font-normal ml-1">{unit}</span>}
      </span>
    </div>
  )
}

export const Work = ({ children }: { children: string }) => (
  <div className="rounded-lg bg-panel2/50 border border-line px-3 py-2 text-sm">
    <Md>{children}</Md>
  </div>
)

export const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button className="text-faint hover:text-bad text-xs px-1" onClick={onClick} aria-label="remove row">
    ✕
  </button>
)

export function Modes<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { v: T; label: string }[] }) {
  return <Seg value={value} onChange={onChange} items={items} />
}

export function Presets<T>({ items, onPick }: { items: { label: string; v: T }[]; onPick: (v: T) => void }) {
  return (
    <select
      className="field !py-1 !text-xs max-w-full"
      value=""
      onChange={(e) => {
        const p = items[+e.target.value]
        if (p) onPick(p.v)
      }}
    >
      <option value="">Load a case…</option>
      {items.map((p, i) => (
        <option key={i} value={i}>
          {p.label}
        </option>
      ))}
    </select>
  )
}

export const Hint = ({ children }: { children: ReactNode }) => <div className="text-xs text-faint">{children}</div>

/** canvas on the left, results on the right (stacked on a phone) */
export const Split = ({ children }: { children: ReactNode }) => <div className="grid cq-lg:grid-cols-[1fr_21rem] gap-4">{children}</div>
