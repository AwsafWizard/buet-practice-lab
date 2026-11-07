// One hover readout for every chart: any SVG element with a `data-tip` attribute (normally a plotted
// point's <circle>) shows its text in a floating label when the pointer comes near it. Nearest point
// within SNAP px wins, so small markers are easy to hit; works for touch taps and while dragging.
import { useEffect, useRef, useState } from 'react'

const SNAP = 14

interface Tip {
  text: string
  x: number
  y: number
}

export const tipOf = (...parts: string[]) => parts.filter(Boolean).join(', ')

export function PointTip() {
  const [tip, setTip] = useState<Tip | null>(null)
  const hot = useRef<Element | null>(null)

  useEffect(() => {
    let raf = 0
    let last: { x: number; y: number; t: EventTarget | null } | null = null
    const clear = () => {
      hot.current?.removeAttribute('data-tip-hot')
      hot.current = null
      setTip(null)
    }
    const run = () => {
      raf = 0
      if (!last) return
      const t = last.t instanceof Element ? last.t : null
      const svg = t?.closest('svg')
      if (!svg) return clear()
      let best: Element | null = null
      let bd = SNAP
      let bx = 0
      let by = 0
      for (const el of svg.querySelectorAll('[data-tip]')) {
        const r = el.getBoundingClientRect()
        if (!r.width && !r.height) continue
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const d = Math.max(0, Math.hypot(cx - last.x, cy - last.y) - r.width / 2)
        if (d < bd || (d === bd && best === null)) {
          bd = d
          best = el
          bx = cx
          by = r.top
        }
      }
      if (!best) return clear()
      if (hot.current !== best) {
        hot.current?.removeAttribute('data-tip-hot')
        best.setAttribute('data-tip-hot', '')
        hot.current = best
      }
      const text = best.getAttribute('data-tip') ?? ''
      setTip((p) => (p && p.text === text && p.x === bx && p.y === by ? p : { text, x: bx, y: by }))
    }
    const move = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY, t: e.target }
      if (!raf) raf = requestAnimationFrame(run)
    }
    const away = () => {
      last = null
      clear()
    }
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerdown', move, { passive: true })
    window.addEventListener('scroll', away, { passive: true, capture: true })
    document.addEventListener('pointerleave', away)
    return () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerdown', move)
      window.removeEventListener('scroll', away, { capture: true })
      document.removeEventListener('pointerleave', away)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  if (!tip) return null
  const above = tip.y > 44
  return (
    <div
      role="tooltip"
      className="point-tip"
      style={{
        left: Math.min(Math.max(tip.x, 8), window.innerWidth - 8),
        top: above ? tip.y - 8 : tip.y + 26,
        transform: `translate(-50%, ${above ? '-100%' : '0'})`,
      }}
    >
      {tip.text}
    </div>
  )
}
