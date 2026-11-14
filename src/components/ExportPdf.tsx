// "Extract as PDF" for every course: a problem with its figure, key answers and full solution (or a
// theory question with its model answer) as a downloadable A4 PDF, plus the ⋮ menu that offers it.
//
// The document is rendered off-screen in a plain white print style (`.print-doc` in styles.css),
// captured, then cut into pages at the nearest paragraph / list item / table row / figure so no line is
// split. jspdf and html2canvas load on first use only.
//
// New course? Give every problem card a <ProblemMenu doc={() => <ProblemDoc … />} … /> and every theory
// card the same with <TheoryDoc>; see docs/AUTHORING.md "Extract as PDF".

import { Component, useEffect, useRef, useState, type FC, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import type { Check } from '../pyq/types'
import { Md, PrintMode } from './ui'

/** one broken figure or solution must not lose the whole PDF */
class Boundary extends Component<{ children: ReactNode; label: string }, { err: Error | null }> {
  state = { err: null as Error | null }
  static getDerivedStateFromError(err: Error) {
    return { err }
  }
  render() {
    return this.state.err ? <div style={{ color: 'var(--c-bad)', fontSize: 12 }}>Couldn’t print the {this.props.label}: {this.state.err.message}</div> : this.props.children
  }
}

const PAGE_W = 794 // A4 width at 96 dpi
const PAGE_H = Math.round((PAGE_W * 297) / 210)
const MARGIN = 44 // top / bottom margin on every page, px

// a hidden tab pauses animation frames, so a timer stands in (the export still finishes in the background)
const nextFrame = () =>
  new Promise((r) => {
    requestAnimationFrame(() => r(null))
    setTimeout(() => r(null), 80)
  })

/** render `doc` off-screen and save it as an A4 PDF; `footer` is printed at the foot of every page */
export async function exportPdf(doc: ReactNode, filename: string, footer = 'BUET Practice Lab') {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas-pro')])
  const host = document.createElement('div')
  host.className = 'print-doc'
  host.style.cssText = `position:fixed;left:-20000px;top:0;width:${PAGE_W}px;padding:0 48px;box-sizing:border-box;`
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    // solutions may hold links and collapsible steps: give them a router, and open every step
    root.render(
      <MemoryRouter>
        <PrintMode.Provider value={true}>{doc}</PrintMode.Provider>
      </MemoryRouter>,
    )
    await nextFrame()
    await nextFrame()
    host.querySelectorAll('details').forEach((d) => (d.open = true))
    await document.fonts?.ready
    await new Promise((r) => setTimeout(r, 150)) // let figures that measure themselves settle
    await nextFrame()

    const top0 = host.getBoundingClientRect().top
    const total = Math.ceil(host.scrollHeight)
    // where a page may end: below a block that should not be split
    const cuts = new Set<number>()
    host.querySelectorAll('p, li, tr, h1, h2, h3, h4, svg, canvas, img, table, .pc-keep, .katex-display, .md-tbl-wrap').forEach((el) => {
      const r = el.getBoundingClientRect()
      cuts.add(Math.round(r.bottom - top0) + 2)
    })
    const breaks = [...cuts].filter((y) => y > 0 && y < total).sort((a, b) => a - b)

    const scale = 2
    const canvas = await html2canvas(host, { scale, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: PAGE_W })
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
    const mmPerPx = 210 / PAGE_W
    const room = PAGE_H - 2 * MARGIN
    let start = 0
    let page = 0
    while (start < total - 1) {
      const limit = start + room
      let end = total
      if (limit < total) {
        const ok = breaks.filter((y) => y > start + room * 0.35 && y <= limit)
        end = ok.length ? ok[ok.length - 1] : limit
        // don't leave a last page holding only a line or two: carry the last block over with it
        if (total - end < 90) {
          const earlier = ok.filter((y) => y <= total - 90)
          if (earlier.length) end = earlier[earlier.length - 1]
        }
      }
      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = Math.ceil((end - start) * scale)
      const ctx = slice.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, slice.width, slice.height)
      ctx.drawImage(canvas, 0, Math.floor(start * scale), canvas.width, slice.height, 0, 0, canvas.width, slice.height)
      if (page > 0) pdf.addPage()
      pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, MARGIN * mmPerPx, 210, (end - start) * mmPerPx)
      page++
      pdf.setFontSize(8)
      pdf.setTextColor(140)
      pdf.text(`${footer} · ${filename.replace(/\.pdf$/, '')}`, 12, 290)
      pdf.text(`${page}`, 198, 290, { align: 'right' })
      start = end
    }
    pdf.save(filename)
  } finally {
    root.unmount()
    host.remove()
  }
}

export const pdfName = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .join('_')
    .replace(/[()]/g, '')
    .replace(/[^A-Za-z0-9_.-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) + '.pdf'

export const today = () => new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

// ---------- building blocks of a printed page ----------

export function PrintHead({ kicker, title, chips = [] }: { kicker: string; title: ReactNode; chips?: string[] }) {
  return (
    <div className="pc-keep" style={{ borderBottom: '2px solid var(--c-accent)', paddingBottom: 10, marginBottom: 16, paddingTop: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--c-mute)', letterSpacing: 0.4 }}>{kicker}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{title}</div>
      {chips.filter(Boolean).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {chips.filter(Boolean).map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function PrintLabel({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--c-accent)', margin: '18px 0 6px' }}>{children}</h2>
}

export function PrintFoot({ from, note }: { from: string; note?: string }) {
  return (
    <div style={{ fontSize: 11, color: 'var(--c-faint)', marginTop: 20 }}>
      Exported {today()} from {from}.{note ? ` ${note}` : ''}
    </div>
  )
}

const num = (v: number) => {
  if (!Number.isFinite(v)) return String(v)
  const a = Math.abs(v)
  const d = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 1 ? 2 : 3
  return v.toFixed(d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

export interface ProblemDocProps {
  /** e.g. 'CE 315 · Design of Concrete Structures I' */
  course: string
  /** e.g. '2023-24 term final (held 9 Sep 2025)' or 'Practice problem (exam level)' */
  source: string
  title: string
  chips?: string[]
  /** markdown (+ $tex$) as printed */
  text: string
  /** what the paper printed with the question (tables, charts, formulas) */
  given?: { label: string; what?: string }[]
  /** older method / outside the syllabus / old code */
  flag?: string
  figure?: () => ReactNode
  checks?: () => Check[]
  solution?: () => ReactNode
  /** 'Full solution' or 'Model answer' */
  solutionLabel?: string
  notes?: string[]
  /** footer line, e.g. 'CE 315 Practice Lab' */
  from: string
}

/** a numerical or theory problem: question, figure, key answers, full solution, assumptions */
export function ProblemDoc(p: ProblemDocProps) {
  let checks: Check[] = []
  try {
    checks = p.checks?.() ?? []
  } catch {
    checks = []
  }
  return (
    <div style={{ padding: '8px 0 24px' }}>
      <PrintHead kicker={`${p.course} · ${p.source}`} title={p.title} chips={p.chips} />
      <PrintLabel>Question</PrintLabel>
      <div style={{ fontSize: 15 }}>
        <Md>{p.text}</Md>
      </div>
      {p.given && (
        <div style={{ fontSize: 12, color: 'var(--c-mute)', marginTop: 6 }}>
          <b>Given with the paper:</b> {p.given.length ? p.given.map((g) => g.label + (g.what ? ` (${g.what})` : '')).join('; ') : 'nothing attached; every value is in the question text'}
        </div>
      )}
      {p.flag && <div style={{ fontSize: 12, color: 'var(--c-load)', marginTop: 6 }}>⚑ {p.flag}</div>}
      {p.figure && (
        <div className="pc-keep" style={{ marginTop: 10, border: '1px solid var(--c-line)', borderRadius: 10, padding: 8 }}>
          <Boundary label="figure">{p.figure()}</Boundary>
        </div>
      )}
      {checks.length > 0 && (
        <>
          <PrintLabel>Key answers</PrintLabel>
          <table className="tbl pc-keep">
            <tbody>
              {checks.map((c) => (
                <tr key={c.key}>
                  <td>
                    <Md>{c.label}</Md>
                  </td>
                  <td className="num" style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                    {num(c.magnitude ? Math.abs(c.value) : c.value)} {c.unit ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {p.solution && (
        <>
          <PrintLabel>{p.solutionLabel ?? 'Full solution'}</PrintLabel>
          <Boundary label="solution">{p.solution()}</Boundary>
        </>
      )}
      {p.notes && p.notes.length > 0 && (
        <>
          <PrintLabel>Assumptions and reading of the paper</PrintLabel>
          <ul style={{ margin: '0 0 0 20px', listStyle: 'disc', fontSize: 13 }}>
            {p.notes.map((n, i) => (
              <li key={i}>
                <Md>{n}</Md>
              </li>
            ))}
          </ul>
        </>
      )}
      <PrintFoot from={p.from} note="Check anything odd against your own notes." />
    </div>
  )
}

/** a theory question from a topic's theory bank: question, model answer, sketch, where it was asked */
export function TheoryDoc({ course, q, a, Fig, seen, topic, from }: { course: string; q: string; a: string; Fig?: FC; seen: string[]; topic?: string; from: string }) {
  return (
    <div style={{ padding: '8px 0 24px' }}>
      <PrintHead kicker={`${course} · theory question`} title={<Md>{q}</Md>} chips={[topic ?? '', seen.length ? `asked in ${seen.join(', ')}` : 'not asked yet']} />
      <PrintLabel>Model answer</PrintLabel>
      <Md>{a}</Md>
      {Fig && (
        <div className="pc-keep" style={{ marginTop: 10, border: '1px solid var(--c-line)', borderRadius: 10, padding: 8 }}>
          <Boundary label="sketch">
            <Fig />
          </Boundary>
        </div>
      )}
      <PrintFoot from={from} />
    </div>
  )
}

// ---------- the ⋮ menu ----------

export interface MenuItem {
  label: string
  icon?: string
  onClick: () => void | Promise<void>
}

/** ⋮ button with a small drop-down; closes on outside click or Escape */
export function KebabMenu({ items, label = 'More actions' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', off)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', off)
      document.removeEventListener('keydown', esc)
    }
  }, [open])
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost !px-1.5 !py-0 text-lg leading-none text-mute hover:text-ink"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
      >
        {busy ? <span className="text-xs">…</span> : '⋮'}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 z-30 min-w-[13rem] rounded-xl border border-line bg-panel shadow-lg p-1">
          {items.map((it) => (
            <button
              key={it.label}
              role="menuitem"
              type="button"
              className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-panel2 flex items-center gap-2"
              onClick={async (e) => {
                e.stopPropagation()
                setOpen(false)
                setBusy(it.label)
                try {
                  await it.onClick()
                } catch (err) {
                  console.error(err)
                  alert(`Couldn’t ${it.label.toLowerCase()}: ${(err as Error).message}`)
                } finally {
                  setBusy(null)
                }
              }}
            >
              <span className="w-4 text-center text-mute">{it.icon}</span>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** the standard ⋮ menu of a problem: Extract as PDF, open it on its own page, copy its text */
export function ProblemMenu({ doc, filename, footer, permalink, copy, label = 'More for this problem' }: { doc: () => ReactNode; filename: string; footer: string; permalink?: string; copy: string; label?: string }) {
  const nav = useNavigate()
  const items: MenuItem[] = [{ icon: '⤓', label: 'Extract as PDF', onClick: () => exportPdf(doc(), filename, footer) }]
  if (permalink) items.push({ icon: '↗', label: 'Open on its own page', onClick: () => nav(permalink) })
  items.push({ icon: '⧉', label: 'Copy the question text', onClick: () => navigator.clipboard?.writeText(copy) })
  return <KebabMenu label={label} items={items} />
}
