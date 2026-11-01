// Small UI pieces shared by the one-way and two-way slab topics.
import { useEffect, type ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Tex } from '../../../components/ui'
import type { AsResult } from '../../engine/oneway'
import { markUsed } from '../../reference/pane'

export const f = fmt
/** e.g. "#3 @ 7.5 in c/c" */
export const barTxt = (bar: number, s: number) => `#${bar} @ ${f(s, 1)} in c/c`

/** mark code-pane rows the lab used (after render, so the pane never updates mid-render) */
export function useMark(id: string, v: Record<string, number | string>) {
  const key = JSON.stringify(v)
  useEffect(() => {
    markUsed(id, JSON.parse(key))
  }, [id, key])
}

export function Num({ label, value, onChange, step = 1, unit, min, max, w = 'w-20' }: { label: ReactNode; value: number; onChange: (v: number) => void; step?: number; unit?: string; min?: number; max?: number; w?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-mute">{label}</span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          className={'field num ' + w}
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = +e.target.value
            if (e.target.value !== '' && Number.isFinite(v)) onChange(v)
          }}
        />
        {unit && <span className="text-xs text-faint">{unit}</span>}
      </span>
    </label>
  )
}

export function Pick<T extends string | number>({ label, value, onChange, options }: { label: ReactNode; value: T; onChange: (v: T) => void; options: { v: T; label: string }[] }) {
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

export const FC_OPTS = [3000, 3500, 3592, 4000, 4500, 5000].map((v) => ({ v, label: `${v / 1000} ksi` }))
export const FY_OPTS = [40000, 50000, 55000, 60000].map((v) => ({ v, label: `${v / 1000} ksi` }))

/** one line of the class's As iteration */
export function AsWork({ as, fy, name }: { as: AsResult; fy: number; name?: string }) {
  if (!(as.Mu > 0)) return null
  const it = as.iters.map((x) => `a=${f(x.a, 2)}\\to A_s=${f(x.As, 3)}`).join(';\\ ')
  return (
    <div className="text-sm">
      {name && <b>{name}</b>} <Tex>{`M_u = ${f(as.Mu, 2)},\\ d = ${f(as.d, 2)}:\\ A_s = \\frac{${f(as.Mu, 2)}\\times 12}{0.9\\times ${f(fy / 1000)}\\,(d - a/2)},\\ a = ${f(as.k, 3)}A_s`}</Tex>
      <div className="pl-3">
        <Tex>{`${it}\\ \\Rightarrow\\ A_s = \\mathbf{${f(as.As, 3)}}\\text{ in}^2/\\text{ft}`}</Tex>
      </div>
    </div>
  )
}

export function Box({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-faint">{title}</div>
      {children}
    </div>
  )
}

/** a simple flow chart made of boxes: rows of [question, answer → next] */
export function Flow({ rows }: { rows: { q: string; yes: string; no?: string }[] }) {
  return (
    <div className="space-y-2 text-sm">
      {rows.map((r, i) => (
        <div key={i} className="grid cq-md:grid-cols-[1.2fr_auto_1fr_1fr] gap-2 items-stretch">
          <div className="rounded-lg border border-accent/50 bg-accent/5 px-3 py-2 font-semibold">{r.q}</div>
          <div className="self-center text-faint text-center">→</div>
          <div className="rounded-lg border border-good/50 px-3 py-2">
            <span className="text-good font-bold">yes: </span>
            {r.yes}
          </div>
          {r.no ? (
            <div className="rounded-lg border border-line px-3 py-2">
              <span className="text-mute font-bold">no: </span>
              {r.no}
            </div>
          ) : (
            <div />
          )}
        </div>
      ))}
    </div>
  )
}
