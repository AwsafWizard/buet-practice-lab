// Small UI pieces shared by the doubly and T-beam labs (owned by the flexure-B author).
import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { BARS } from '../../engine/materials'

export const f = fmt
export const FC_OPTS = [3, 3.5, 4, 4.5, 5, 6]
export const FY_OPTS = [40, 50, 60, 72.5]
export const BAR_OPTS = [5, 6, 7, 8, 9, 10, 11]

export function Sel<T extends string | number>({ label, value, options, onChange, fmtOpt }: { label: ReactNode; value: T; options: T[]; onChange: (v: T) => void; fmtOpt?: (v: T) => string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-mute">{label}</span>
      <select
        className="field"
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value
          const hit = options.find((o) => String(o) === raw)
          if (hit !== undefined) onChange(hit)
        }}
      >
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>
            {fmtOpt ? fmtOpt(o) : String(o)}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Num({ label, value, onChange, step = 0.5, unit, min }: { label: ReactNode; value: number; onChange: (v: number) => void; step?: number; unit?: string; min?: number }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-mute">
        {label}
        {unit ? <span className="text-faint"> ({unit})</span> : null}
      </span>
      <input
        type="number"
        className="field num"
        value={Number.isFinite(value) ? value : ''}
        step={step}
        min={min}
        onChange={(e) => {
          const v = +e.target.value
          if (e.target.value !== '' && Number.isFinite(v)) onChange(v)
        }}
      />
    </label>
  )
}

/** n bars of size # — returns area */
export function BarsSel({ label, n, no, onN, onNo, nOpts = [2, 3, 4, 5, 6, 7, 8, 9, 10] }: { label: ReactNode; n: number; no: number; onN: (v: number) => void; onNo: (v: number) => void; nOpts?: number[] }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-mute">
        {label} <span className="text-faint num">= {f(n * BARS[no].A, 2)} in²</span>
      </span>
      <div className="flex gap-1">
        <select className="field flex-1" value={n} onChange={(e) => onN(+e.target.value)}>
          {nOpts.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select className="field flex-1" value={no} onChange={(e) => onNo(+e.target.value)}>
          {BAR_OPTS.map((k) => (
            <option key={k} value={k}>
              #{k}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/** "which case am I in?" chart: question boxes with yes / no branches */
export interface FlowNode {
  q: ReactNode
  yes: ReactNode
  no: ReactNode
}

export function Flow({ start, nodes, end }: { start: ReactNode; nodes: FlowNode[]; end?: ReactNode }) {
  return (
    <div className="flex flex-col items-stretch gap-1 text-sm max-w-2xl">
      <div className="rounded-lg border border-line bg-panel2 px-3 py-2 font-semibold">{start}</div>
      {nodes.map((n, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="text-center text-faint leading-none">↓</div>
          <div className="rounded-lg border-2 border-accent/60 px-3 py-2 font-semibold text-accent">◇ {n.q}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg px-3 py-2" style={{ background: 'color-mix(in oklab, var(--c-good) 10%, transparent)', borderLeft: '3px solid var(--c-good)' }}>
              <b className="text-good">Yes →</b> {n.yes}
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: 'color-mix(in oklab, var(--c-bad) 9%, transparent)', borderLeft: '3px solid var(--c-bad)' }}>
              <b className="text-bad">No →</b> {n.no}
            </div>
          </div>
        </div>
      ))}
      {end && (
        <>
          <div className="text-center text-faint leading-none">↓</div>
          <div className="rounded-lg border border-line bg-panel2 px-3 py-2">{end}</div>
        </>
      )}
    </div>
  )
}

export function ProblemBox({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm leading-relaxed">{children}</div>
}

export function Badge({ okv, yes, no }: { okv: boolean; yes: string; no: string }) {
  return <span className={'chip font-semibold ' + (okv ? 'text-good' : 'text-bad')}>{okv ? yes : no}</span>
}

export const zoneLabel = (z: 'tension' | 'transition' | 'compression') => (z === 'tension' ? 'tension-controlled' : z === 'transition' ? 'transition zone' : 'compression-controlled')

/** random seed for a new generated problem */
export const newSeed = () => Math.floor(Math.random() * 1e9)
