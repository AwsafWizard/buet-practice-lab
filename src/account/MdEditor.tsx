// Markdown editor for Threads: toolbar, Write / Preview / Side by side, Ctrl+B/I/K,
// paste or drop files to upload them, open a .md file, and a draft kept on this device.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { MAX_UPLOAD, uploadFile } from './api'
import { renderMd } from './markdown'

export function MdView({ src, className }: { src: string; className?: string }) {
  const html = useMemo(() => renderMd(src), [src])
  return <div className={'md-body ' + (className ?? '')} dangerouslySetInnerHTML={{ __html: html }} />
}

type Mode = 'write' | 'preview' | 'split'

const readDraft = (k?: string) => {
  if (!k) return null
  try {
    return localStorage.getItem('draft:' + k)
  } catch {
    return null
  }
}
const writeDraft = (k: string, v: string) => {
  try {
    if (v) localStorage.setItem('draft:' + k, v)
    else localStorage.removeItem('draft:' + k)
  } catch {
    /* storage blocked */
  }
}
export const clearDraft = (k: string) => writeDraft(k, '')
/** a saved draft for this key, if any (so a form can start from it) */
export const loadDraft = (k: string) => readDraft(k) ?? ''

export function MdEditor({
  value,
  onChange,
  draftKey,
  placeholder = 'Write in Markdown…',
  minRows = 10,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  /** keep unsent text on this device under this key */
  draftKey?: string
  placeholder?: string
  minRows?: number
  autoFocus?: boolean
}) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<Mode>(() => (typeof window !== 'undefined' && window.innerWidth >= 1100 ? 'split' : 'write'))
  const [busy, setBusy] = useState<string[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)

  useEffect(() => {
    if (draftKey) writeDraft(draftKey, value)
  }, [draftKey, value])

  // grow with the text
  useEffect(() => {
    const el = ta.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(el.scrollHeight + 2, minRows * 22) + 'px'
  }, [value, mode, minRows])

  /** replace the selection, keeping the browser's undo history where it can */
  const insert = (text: string, selectFrom?: number, selectTo?: number) => {
    const el = ta.current
    if (!el) return
    el.focus()
    const start = el.selectionStart
    const ok = document.execCommand?.('insertText', false, text)
    if (!ok) {
      el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end')
      onChange(el.value)
    }
    if (selectFrom !== undefined) requestAnimationFrame(() => el.setSelectionRange(start + selectFrom, start + (selectTo ?? selectFrom)))
  }

  const wrap = (before: string, after: string, fallback: string) => {
    const el = ta.current
    if (!el) return
    const sel = el.value.slice(el.selectionStart, el.selectionEnd) || fallback
    insert(before + sel + after, before.length, before.length + sel.length)
  }

  /** put a prefix on every selected line (lists, quotes, headings) */
  const lines = (prefix: (i: number) => string) => {
    const el = ta.current
    if (!el) return
    const v = el.value
    const s = v.lastIndexOf('\n', el.selectionStart - 1) + 1
    let e = v.indexOf('\n', el.selectionEnd)
    if (e < 0) e = v.length
    el.setSelectionRange(s, e)
    const block = v.slice(s, e) || ''
    const out = block
      .split('\n')
      .map((l, i) => prefix(i) + l)
      .join('\n')
    insert(out, out.length)
  }

  const block = (text: string, cursor: number) => {
    const el = ta.current
    if (!el) return
    const before = el.value.slice(0, el.selectionStart)
    const pad = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''
    insert(pad + text, pad.length + cursor)
  }

  const uploadAll = async (files: File[]) => {
    setErr(null)
    for (const f of files) {
      if (f.size > MAX_UPLOAD) {
        setErr(`${f.name} is over 25 MB.`)
        continue
      }
      const tag = `⏳ uploading ${f.name}…`
      setBusy((b) => [...b, f.name])
      insert(tag)
      try {
        const url = await uploadFile(f)
        const md = f.type.startsWith('image/') ? `![${f.name}](${url})` : `[📎 ${f.name}](${url})`
        const el = ta.current!
        const i = el.value.indexOf(tag)
        if (i >= 0) {
          el.focus()
          el.setSelectionRange(i, i + tag.length)
          insert(md)
        } else insert(md)
      } catch (e) {
        const el = ta.current!
        const i = el.value.indexOf(tag)
        if (i >= 0) {
          el.setSelectionRange(i, i + tag.length)
          insert('')
        }
        setErr(`Could not upload ${f.name}: ${(e as Error).message}`)
      } finally {
        setBusy((b) => b.filter((n) => n !== f.name))
      }
    }
  }

  const pick = (accept: string, then: (files: File[]) => void, multiple = true) => {
    const inp = document.createElement('input')
    inp.type = 'file'
    inp.accept = accept
    inp.multiple = multiple
    inp.onchange = () => inp.files && then([...inp.files])
    inp.click()
  }

  const openMd = () =>
    pick(
      '.md,.markdown,.txt,text/markdown,text/plain',
      async ([f]) => {
        if (!f) return
        const text = await f.text()
        if (value.trim() && !confirm(`Replace what you've written with ${f.name}?`)) return
        ta.current?.focus()
        ta.current?.select()
        insert(text)
      },
      false,
    )

  const tools: { label: ReactNode; title: string; run: () => void; sep?: boolean }[] = [
    { label: <b>H</b>, title: 'Heading', run: () => lines(() => '## ') },
    { label: <b>B</b>, title: 'Bold (Ctrl+B)', run: () => wrap('**', '**', 'bold') },
    { label: <i className="font-serif">I</i>, title: 'Italic (Ctrl+I)', run: () => wrap('*', '*', 'italic') },
    { label: <s>S</s>, title: 'Strikethrough', run: () => wrap('~~', '~~', 'text') },
    { label: '🔗', title: 'Link (Ctrl+K)', run: () => wrap('[', '](https://)', 'link text'), sep: true },
    { label: '•', title: 'Bullet list', run: () => lines(() => '- ') },
    { label: '1.', title: 'Numbered list', run: () => lines((i) => `${i + 1}. `) },
    { label: '☑', title: 'Checklist', run: () => lines(() => '- [ ] ') },
    { label: '❝', title: 'Quote', run: () => lines(() => '> ') },
    { label: <span className="font-mono text-[11px]">{'<>'}</span>, title: 'Code', run: () => wrap('`', '`', 'code'), sep: true },
    { label: <span className="font-mono text-[11px]">{'{ }'}</span>, title: 'Code block', run: () => block('```\ncode\n```\n', 4) },
    { label: '∑', title: 'Maths: $inline$ or $$block$$', run: () => wrap('$', '$', 'M = wL^2/8') },
    { label: '▦', title: 'Table', run: () => block('| Column | Column |\n| --- | --- |\n| cell | cell |\n', 2) },
    { label: '―', title: 'Divider', run: () => block('---\n', 4) },
    { label: '📎', title: 'Attach files or images (or paste / drop them in the box)', run: () => pick('*/*', uploadAll), sep: true },
    { label: <span className="text-[11px] font-semibold">.md</span>, title: 'Open a .md file', run: openMd },
  ]

  const editor = (
    <textarea
      ref={ta}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck
      className="w-full resize-none bg-transparent outline-none px-3 py-2.5 font-mono text-[13px] leading-[22px] text-ink placeholder:text-faint"
      onKeyDown={(e) => {
        if (!(e.ctrlKey || e.metaKey)) return
        const k = e.key.toLowerCase()
        if (k === 'b') (e.preventDefault(), wrap('**', '**', 'bold'))
        else if (k === 'i') (e.preventDefault(), wrap('*', '*', 'italic'))
        else if (k === 'k') (e.preventDefault(), wrap('[', '](https://)', 'link text'))
      }}
      onPaste={(e) => {
        const files = [...e.clipboardData.files]
        if (files.length) {
          e.preventDefault()
          void uploadAll(files)
        }
      }}
    />
  )
  const preview = (
    <div className="px-4 py-3 min-h-[120px]">{value.trim() ? <MdView src={value} /> : <div className="text-faint text-sm">Nothing to preview yet.</div>}</div>
  )

  return (
    <div
      className={'rounded-xl border bg-bg transition-colors ' + (drag ? 'border-accent' : 'border-line')}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) (e.preventDefault(), setDrag(true))
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        setDrag(false)
        const files = [...e.dataTransfer.files]
        if (files.length) {
          e.preventDefault()
          if (mode === 'preview') setMode('write')
          void uploadAll(files)
        }
      }}
    >
      <div className="flex items-center gap-1 flex-wrap border-b border-line px-1.5 py-1 bg-panel2/60 rounded-t-xl">
        {mode !== 'preview' &&
          tools.map((t, i) => (
            <span key={i} className="contents">
              {t.sep && <span className="w-px h-5 bg-line mx-0.5" />}
              <button type="button" title={t.title} aria-label={t.title} onClick={t.run} className="h-7 min-w-7 px-1.5 rounded-md text-sm text-mute hover:text-ink hover:bg-panel">
                {t.label}
              </button>
            </span>
          ))}
        <div className="ml-auto flex rounded-lg border border-line overflow-hidden text-xs">
          {(['write', 'preview', 'split'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={'px-2.5 py-1 ' + (m === 'split' ? 'hidden md:block ' : '') + (mode === m ? 'bg-accent/15 text-ink font-semibold' : 'text-mute hover:text-ink')}
            >
              {m === 'write' ? 'Write' : m === 'preview' ? 'Preview' : 'Side by side'}
            </button>
          ))}
        </div>
      </div>
      {mode === 'split' ? (
        <div className="grid md:grid-cols-2 md:divide-x divide-line">
          {editor}
          <div className="max-md:border-t border-line">{preview}</div>
        </div>
      ) : mode === 'write' ? (
        editor
      ) : (
        preview
      )}
      <div className="flex items-center gap-3 flex-wrap px-3 py-1.5 border-t border-line text-[11px] text-faint">
        <span>
          Markdown · $maths$ · paste or drop files to attach (25 MB max){draftKey ? ' · draft saved on this device' : ''}
        </span>
        {busy.length > 0 && <span className="text-mute">Uploading {busy.length}…</span>}
        {err && <span className="text-bad">{err}</span>}
        <span className="ml-auto num">{value.length.toLocaleString()} chars</span>
      </div>
    </div>
  )
}
