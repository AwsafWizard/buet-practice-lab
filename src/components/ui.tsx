import katex from 'katex'
import { AnimatePresence, motion } from 'motion/react'
import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { useStore } from '../store'

// ---------------------------------------------------------------- math
export function Tex({ children, block }: { children: string; block?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, { displayMode: !!block, throwOnError: false, strict: false })
    } catch {
      return children
    }
  }, [children, block])
  return block ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />
}

/** Tiny markdown: paragraphs, - lists, 1. lists, **bold**, *italic*, `code`, $inline$, $$block$$, ### headings */
export function Md({ children, className }: { children: string; className?: string }) {
  const blocks = useMemo(() => parseBlocks(children), [children])
  return <div className={'prose-ce ' + (className ?? '')}>{blocks}</div>
}

function parseBlocks(src: string): ReactNode[] {
  const out: ReactNode[] = []
  const lines = src.replace(/\r/g, '').split('\n')
  let i = 0
  let key = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    if (line.trim().startsWith('$$')) {
      let body = line.trim().slice(2)
      if (body.endsWith('$$')) body = body.slice(0, -2)
      else {
        i++
        while (i < lines.length && !lines[i].trim().endsWith('$$')) body += '\n' + lines[i++]
        if (i < lines.length) body += '\n' + lines[i].trim().slice(0, -2)
      }
      out.push(<Tex key={key++} block>{body}</Tex>)
      i++
      continue
    }
    const h = /^(#{2,4})\s+(.*)$/.exec(line)
    if (h) {
      const lvl = h[1].length
      out.push(lvl <= 3 ? <h3 key={key++}>{inline(h[2])}</h3> : <h4 key={key++}>{inline(h[2])}</h4>)
      i++
      continue
    }
    if (isRow(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const head = cells(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && isRow(lines[i])) rows.push(cells(lines[i++]))
      out.push(
        <div key={key++} className="md-tbl-wrap">
          <table className="tbl md-tbl">
            <thead>
              <tr>
                {head.map((c, k) => (
                  <th key={k}>{inline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, k) => (
                <tr key={k}>
                  {head.map((_, j) => (
                    <td key={j}>{inline(r[j] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''))
      out.push(
        <ul key={key++}>
          {items.map((t, k) => (
            <li key={k}>{inline(t)}</li>
          ))}
        </ul>,
      )
      continue
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ''))
      out.push(
        <ol key={key++}>
          {items.map((t, k) => (
            <li key={k}>{inline(t)}</li>
          ))}
        </ol>,
      )
      continue
    }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^\s*([-*]|\d+[.)])\s+/.test(lines[i]) && !lines[i].trim().startsWith('$$') && !/^#{2,4}\s/.test(lines[i]) && !isRow(lines[i]))
      para.push(lines[i++])
    out.push(<p key={key++}>{inline(para.join(' '))}</p>)
  }
  return out
}

// GFM-style pipe tables: | a | b | header, then | --- | --- |
const isRow = (l: string) => /^\s*\|.*\|\s*$/.test(l)
const isSep = (l: string) => /^\s*\|(\s*:?-{3,}:?\s*\|)+\s*$/.test(l)
const cells = (l: string) =>
  l
    .trim()
    .slice(1, -1)
    .split('|')
    .map((c) => c.trim())

export function inline(s: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(<Fragment key={k++}>{s.slice(last, m.index)}</Fragment>)
    const t = m[0]
    if (t.startsWith('$')) parts.push(<Tex key={k++}>{t.slice(1, -1)}</Tex>)
    else if (t.startsWith('**')) parts.push(<strong key={k++}>{inline(t.slice(2, -2))}</strong>)
    else if (t.startsWith('`')) parts.push(<code key={k++}>{t.slice(1, -1)}</code>)
    else parts.push(<em key={k++}>{t.slice(1, -1)}</em>)
    last = m.index + t.length
  }
  if (last < s.length) parts.push(<Fragment key={k++}>{s.slice(last)}</Fragment>)
  return parts
}

// ---------------------------------------------------------------- answer check
export interface AnswerProps {
  id: string
  label: ReactNode
  value: number
  unit?: string
  /** relative tolerance (default 2%) */
  tol?: number
  /** absolute tolerance floor */
  abs?: number
  hint?: string
  /** accept magnitude only (sign given by T/C selector etc.) */
  magnitude?: boolean
  digits?: number
  compact?: boolean
}

export function isClose(guess: number, value: number, tol = 0.02, abs = 0.01) {
  return Math.abs(guess - value) <= Math.max(Math.abs(value) * tol, abs)
}

export function Answer(p: AnswerProps) {
  const record = useStore((s) => s.record)
  const prev = useStore((s) => s.attempts[p.id])
  const [txt, setTxt] = useState('')
  const [state, setState] = useState<null | boolean>(prev?.correct ? true : null)
  const [show, setShow] = useState(false)
  const check = () => {
    const g = parseFloat(txt.replace(/[^\d.eE+-]/g, ''))
    if (!Number.isFinite(g)) return
    const v = p.magnitude ? Math.abs(p.value) : p.value
    const ok = isClose(p.magnitude ? Math.abs(g) : g, v, p.tol ?? 0.02, p.abs ?? Math.max(0.01, Math.abs(v) * 0.002))
    setState(ok)
    record(p.id, ok)
  }
  const d = p.digits ?? 3
  return (
    <div className={'flex flex-wrap items-center gap-2 ' + (p.compact ? '' : 'py-1')}>
      <span className="text-sm text-mute min-w-[7.5rem]">{p.label}</span>
      <input
        className="field w-28"
        value={txt}
        placeholder="your answer"
        onChange={(e) => {
          setTxt(e.target.value)
          setState(null)
        }}
        onKeyDown={(e) => e.key === 'Enter' && check()}
      />
      {p.unit && <span className="text-sm text-mute">{p.unit}</span>}
      <button className="btn !py-1 !px-2.5" onClick={check}>
        Check
      </button>
      {state === true && <span className="pop text-good font-bold text-sm">✓ correct{prev?.firstTry ? ' · first try' : ''}</span>}
      {state === false && <span className="pop text-bad font-bold text-sm">✗ not quite</span>}
      {(state === false || show || (prev && !prev.correct && prev.tries >= 2)) && (
        <button className="text-xs text-accent underline" onClick={() => setShow(true)}>
          {show ? (
            <span className="num">
              = {(p.magnitude ? Math.abs(p.value) : p.value).toFixed(d).replace(/\.?0+$/, '')} {p.unit}
            </span>
          ) : (
            'show answer'
          )}
        </button>
      )}
      {p.hint && <span className="text-xs text-faint">{p.hint}</span>}
    </div>
  )
}

/** choice check (e.g. Tension / Compression, Stable / Unstable) */
export function Choice<T extends string>({
  id,
  label,
  options,
  answer,
}: {
  id: string
  label: ReactNode
  options: { v: T; label: string }[]
  answer: T
}) {
  const record = useStore((s) => s.record)
  const [pick, setPick] = useState<T | null>(null)
  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <span className="text-sm text-mute min-w-[7.5rem]">{label}</span>
      {options.map((o) => {
        const chosen = pick === o.v
        const cls = chosen ? (o.v === answer ? 'border-good! text-good' : 'border-bad! text-bad') : ''
        return (
          <button
            key={o.v}
            className={'btn !py-1 !px-2.5 ' + cls}
            onClick={() => {
              setPick(o.v)
              record(id, o.v === answer)
            }}
          >
            {o.label}
          </button>
        )
      })}
      {pick && <span className={'text-sm font-bold ' + (pick === answer ? 'text-good' : 'text-bad')}>{pick === answer ? '✓' : '✗'}</span>}
    </div>
  )
}

// ---------------------------------------------------------------- reveal
export function Reveal({
  id,
  title = 'Show solution',
  children,
  defaultOpen,
  tone = 'accent',
}: {
  id?: string
  title?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  tone?: 'accent' | 'mute'
}) {
  const reveal = useStore((s) => s.reveal)
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className={'rounded-xl border ' + (open ? 'border-accent/50' : 'border-line')}>
      <button
        className={'w-full flex items-center justify-between px-4 py-2.5 font-semibold text-sm ' + (tone === 'accent' ? 'text-accent' : 'text-mute')}
        onClick={() => {
          setOpen(!open)
          if (!open && id) reveal(id)
        }}
      >
        <span className="flex items-center gap-2">
          <span className={'inline-block transition-transform ' + (open ? 'rotate-90' : '')}>▸</span>
          {title}
        </span>
        <span className="text-xs text-faint">{open ? 'hide' : 'expand'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 border-t border-line/60">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------- misc
export function Section({ title, sub, children, right }: { title: ReactNode; sub?: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="card p-5 mb-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {sub && <div className="text-sm text-mute mt-0.5">{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

export function Callout({ kind = 'tip', title, children }: { kind?: 'tip' | 'trap' | 'note' | 'exam'; title?: string; children: ReactNode }) {
  const map = {
    tip: { c: 'var(--c-good)', t: 'Tip' },
    trap: { c: 'var(--c-bad)', t: 'Common trap' },
    note: { c: 'var(--c-accent)', t: 'Note' },
    exam: { c: 'var(--c-load)', t: 'Exam pattern' },
  }[kind]
  return (
    <div className="rounded-xl px-4 py-3 my-3 text-sm" style={{ background: `color-mix(in oklab, ${map.c} 9%, transparent)`, borderLeft: `3px solid ${map.c}` }}>
      <div className="font-bold mb-1" style={{ color: map.c }}>
        {title ?? map.t}
      </div>
      <div className="prose-ce">{children}</div>
    </div>
  )
}

export function Ring({ value, size = 34, stroke = 4, color = 'var(--c-accent)', label }: { value: number; size?: number; stroke?: number; color?: string; label?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--c-line)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {label !== undefined && (
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.3} fontWeight={700} fill="var(--c-ink)">
          {label}
        </text>
      )}
    </svg>
  )
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { v: T; label: ReactNode; badge?: ReactNode }[] }) {
  return (
    <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-panel2 border border-line w-fit">
      {items.map((it) => (
        <button
          key={it.v}
          onClick={() => onChange(it.v)}
          className={'px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ' + (value === it.v ? 'bg-panel text-ink shadow-sm border border-line' : 'text-mute hover:text-ink border border-transparent')}
        >
          {it.label}
          {it.badge}
        </button>
      ))}
    </div>
  )
}

export function Seg<T extends string>({ value, onChange, items, size = 'sm' }: { value: T; onChange: (v: T) => void; items: { v: T; label: ReactNode }[]; size?: 'sm' | 'xs' }) {
  return (
    <div className="inline-flex rounded-lg border border-line overflow-hidden">
      {items.map((it) => (
        <button
          key={it.v}
          onClick={() => onChange(it.v)}
          className={(size === 'xs' ? 'px-2 py-0.5 text-xs ' : 'px-3 py-1 text-sm ') + 'font-semibold ' + (value === it.v ? 'bg-accent text-bg' : 'bg-panel2 text-mute hover:text-ink')}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

export function KV({ k, v, unit }: { k: ReactNode; v: ReactNode; unit?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5 text-sm">
      <span className="text-mute">{k}</span>
      <span className="num font-semibold">
        {v}
        {unit && <span className="text-mute font-normal ml-1">{unit}</span>}
      </span>
    </div>
  )
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="space-y-3 counter-reset">{children}</ol>
}

export function Step({ n, title, children }: { n: number | string; title: ReactNode; children?: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-7 h-7 rounded-full bg-accent/15 text-accent font-bold text-sm grid place-items-center">{n}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{title}</div>
        {children && <div className="text-sm mt-1 prose-ce">{children}</div>}
      </div>
    </li>
  )
}
