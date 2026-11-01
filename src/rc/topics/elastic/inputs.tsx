// Small labelled inputs for the CE 315 flexure labs.

import { useEffect, type ReactNode } from 'react'
import { markUsed } from '../../reference/pane'

export function Sel<T extends string | number>({ label, value, options, onChange }: { label: ReactNode; value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-mute">{label}</span>
      <select
        className="field"
        value={String(value)}
        onChange={(e) => {
          const o = options.find((x) => String(x.v) === e.target.value)
          if (o) onChange(o.v)
        }}
      >
        {options.map((o) => (
          <option key={String(o.v)} value={String(o.v)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Num({ label, value, onChange, step = 1, unit, min }: { label: ReactNode; value: number; onChange: (v: number) => void; step?: number; unit?: string; min?: number }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-mute">
        {label}
        {unit && <span className="text-faint"> ({unit})</span>}
      </span>
      <input
        className="field num"
        type="number"
        step={step}
        min={min}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (Number.isFinite(v)) onChange(v)
        }}
      />
    </label>
  )
}

export const BAR_OPTS = [4, 5, 6, 7, 8, 9, 10, 11].map((v) => ({ v, label: `#${v}` }))
export const COUNT_OPTS = [1, 2, 3, 4, 5, 6, 7, 8].map((v) => ({ v, label: String(v) }))
export const FC_OPTS = [3, 3.5, 4, 4.5, 5, 6].map((v) => ({ v, label: `${v} ksi` }))
export const FY_OPTS = [40, 60, 72.5].map((v) => ({ v, label: `${v} ksi` }))

/** mark code-pane rows after render (never during render) */
export function useMark(id: string, v: Record<string, number | string>) {
  const key = JSON.stringify(v)
  useEffect(() => {
    markUsed(id, JSON.parse(key))
  }, [id, key])
}

/** "Your checkpoints" frame */
export function Checks({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-3 space-y-0.5 text-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Your checkpoints</div>
      {children}
    </div>
  )
}

export function Prompt({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">{children}</div>
}
