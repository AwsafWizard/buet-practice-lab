// "Extract": a question with its model answer and details as a downloadable A4 PDF.
// The page is rendered off-screen in a plain print style, captured, then cut into pages at the
// nearest paragraph / list item / table row so no line is split. The libraries load on first use.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Md } from '../../components/ui'
import { answerById, listById } from '../content'
import { pcTopicById } from '../registry'
import { pcPaperById, pcPaperLabel, type PcAnswer, type PcQ } from '../types'
import { AnswerBody } from './Blurt'
import { PartAnswer, partKeys } from './PcQuestionCard'

const PAGE_W = 794 // A4 width at 96 dpi
const PAGE_H = Math.round((PAGE_W * 297) / 210)
const MARGIN = 44 // top / bottom margin on every page, px

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)))

export async function exportPdf(doc: ReactNode, filename: string) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas-pro')])
  const host = document.createElement('div')
  host.className = 'pc-print'
  host.style.cssText = `position:fixed;left:-20000px;top:0;width:${PAGE_W}px;padding:0 48px;box-sizing:border-box;`
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    root.render(doc)
    await nextFrame()
    await nextFrame()
    await document.fonts?.ready
    await nextFrame()

    const top0 = host.getBoundingClientRect().top
    const total = Math.ceil(host.scrollHeight)
    // where a page may end: below a block that should not be split
    const cuts = new Set<number>()
    host.querySelectorAll('p, li, tr, h1, h2, h3, h4, svg, table, .pc-keep, .katex-display, .md-tbl-wrap').forEach((el) => {
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
      pdf.text(`CE 301 Practice Lab · ${filename.replace(/\.pdf$/, '')}`, 12, 290)
      pdf.text(`${page}`, 198, 290, { align: 'right' })
      start = end
    }
    pdf.save(filename)
  } finally {
    root.unmount()
    host.remove()
  }
}

const today = () => new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

function Head({ kicker, title, chips }: { kicker: string; title: string; chips: string[] }) {
  return (
    <div className="pc-keep" style={{ borderBottom: '2px solid var(--c-accent)', paddingBottom: 10, marginBottom: 16, paddingTop: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--c-mute)', letterSpacing: 0.4 }}>{kicker}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
        {chips.filter(Boolean).map((c) => (
          <span key={c} className="chip">
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--c-accent)', margin: '18px 0 6px' }}>{children}</h2>
}

function Keys({ keys }: { keys: string[] }) {
  if (!keys.length) return null
  return (
    <>
      <Label>Examiner keywords</Label>
      <div className="pc-keep" style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {keys.map((k) => (
          <span key={k} className="chip" style={{ fontSize: 11 }}>
            {k}
          </span>
        ))}
      </div>
    </>
  )
}

function ListsUsed({ ids }: { ids: string[] }) {
  const lists = ids.map((id) => listById(id)).filter(Boolean)
  if (!lists.length) return null
  return (
    <>
      <Label>Lists to remember</Label>
      {lists.map((l) => (
        <div key={l!.id} className="pc-keep" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>
            {l!.title}
            {l!.ordered ? ' (in order)' : ''}
          </div>
          <ol style={{ margin: '4px 0 0 20px', listStyle: 'decimal' }}>
            {l!.points.map((p, i) => (
              <li key={i}>
                <b>{p.k}</b>
                {p.d ? ` — ${p.d}` : ''}
              </li>
            ))}
          </ol>
          {l!.hook && <div style={{ fontSize: 12, color: 'var(--c-accent2)', marginTop: 3 }}>Memory hook: {l!.hook.replace(/\*\*/g, '')}</div>}
        </div>
      ))}
    </>
  )
}

/** a past-paper part: question, keywords, model answer, where else it was asked */
export function QuestionDoc({ q }: { q: PcQ }) {
  const paper = pcPaperById(q.paper)
  const answers = q.ans.map((id) => answerById(id)).filter(Boolean) as PcAnswer[]
  const seen = [...new Set(answers.flatMap((a) => a.seen))]
  const lists = [...new Set(answers.flatMap((a) => a.lists ?? []))]
  return (
    <div style={{ padding: '8px 0 24px' }}>
      <Head
        kicker={`CE 301 · Professional Practice and Communication · ${paper?.label ?? q.paper} term final (${paper?.held ?? ''})`}
        title={`Section ${q.sec} · Q${q.no} · ${q.marks} marks`}
        chips={[...q.topics.map((t) => pcTopicById(t)?.title ?? t), q.flag ? `⚑ ${q.flag}` : '']}
      />
      <Label>Question</Label>
      <div style={{ fontSize: 15 }}>
        <Md>{q.text}</Md>
      </div>
      {seen.length > 1 && (
        <div style={{ fontSize: 12, color: 'var(--c-mute)', marginTop: 6 }}>Also asked in: {seen.filter((s) => s !== pcPaperLabel(q.paper)).join(', ')}</div>
      )}
      <Keys keys={partKeys(q)} />
      <Label>Model answer</Label>
      <PartAnswer q={q} />
      <ListsUsed ids={lists} />
      <div style={{ fontSize: 11, color: 'var(--c-faint)', marginTop: 20 }}>Exported {today()} from CE 301 Practice Lab. Answers follow the class material; check anything odd against your notes.</div>
    </div>
  )
}

/** a model answer from the bank */
export function AnswerDoc({ a }: { a: PcAnswer }) {
  return (
    <div style={{ padding: '8px 0 24px' }}>
      <Head kicker="CE 301 · Professional Practice and Communication · model answer" title={a.q} chips={[pcTopicById(a.topic)?.title ?? a.topic, a.seen.length ? `asked in ${a.seen.join(', ')}` : 'not asked yet']} />
      <Keys keys={a.keys} />
      <Label>Model answer</Label>
      <AnswerBody a={a} />
      <ListsUsed ids={a.lists ?? []} />
      <div style={{ fontSize: 11, color: 'var(--c-faint)', marginTop: 20 }}>Exported {today()} from CE 301 Practice Lab.</div>
    </div>
  )
}

export const pdfName = (...parts: string[]) =>
  parts
    .join('_')
    .replace(/[()]/g, '')
    .replace(/[^A-Za-z0-9_.-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) + '.pdf'

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
      <button type="button" className="btn btn-ghost !px-1.5 !py-0 text-lg leading-none text-mute hover:text-ink" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
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
              onClick={async () => {
                setOpen(false)
                setBusy(it.label)
                try {
                  await it.onClick()
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
