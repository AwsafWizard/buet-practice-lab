// One hover readout for every chart.
//  1. Marked points: any SVG element with `data-tip` shows that text when the pointer is within SNAP px.
//  2. Anywhere on a curve: an element carrying `data-axes` (from `tipAxes(...)`, normally the chart's <svg>)
//     says how its drawing coordinates map back to data. Hovering near any stroked path / polyline / sloped
//     line inside it snaps to the nearest point on that curve and shows its abscissa and ordinate.
//     A `data-name` on the curve (or an ancestor <g>) prefixes the readout; `data-nocurve` opts a stroke out.
// Works for mouse, touch taps and while dragging.
import { useEffect, useRef, useState } from 'react'

const SNAP = 14
const CURVE_SNAP = 18

interface Tip {
  text: string
  x: number
  y: number
  /** screen position of the snapped point on a curve (draws a dot) */
  dot?: { x: number; y: number; color: string }
}

// ---------------------------------------------------------------- axis mapping

type Lin = [p0: number, p1: number, v0: number, v1: number, log: 0 | 1]
interface Axes {
  x: Lin
  y: Lin
  xn: string
  yn: string
  xu: string
  yu: string
}

export interface AxisMap {
  /** data → drawing coordinate (the same functions the chart draws with) */
  X: (v: number) => number
  Y: (v: number) => number
  xLog?: boolean
  yLog?: boolean
  /** names and units in the readout, e.g. x: 'N', y: 'w', yUnit: ' %' */
  x?: string
  y?: string
  xUnit?: string
  yUnit?: string
  /** two data values inside the drawn range used to read the scale (default 0,1 or 1,10 for log) */
  xAt?: [number, number]
  yAt?: [number, number]
}

/** spread onto a chart's <svg> (or the <g> whose coordinates X/Y produce): `<svg {...tipAxes({ X, Y, x: 'N', y: 'w' })}>` */
export function tipAxes(a: AxisMap): { 'data-axes': string } {
  const lin = (f: (v: number) => number, log: boolean | undefined, at?: [number, number]): Lin => {
    const [v0, v1] = at ?? (log ? [1, 10] : [0, 1])
    return [f(v0), f(v1), log ? Math.log10(v0) : v0, log ? Math.log10(v1) : v1, log ? 1 : 0]
  }
  const ax: Axes = { x: lin(a.X, a.xLog, a.xAt), y: lin(a.Y, a.yLog, a.yAt), xn: a.x ?? 'x', yn: a.y ?? 'y', xu: a.xUnit ?? '', yu: a.yUnit ?? '' }
  return { 'data-axes': JSON.stringify(ax) }
}

const unmap = ([p0, p1, v0, v1, log]: Lin, p: number) => {
  const v = v0 + ((p - p0) / (p1 - p0 || 1e-12)) * (v1 - v0)
  return log ? 10 ** v : v
}

/** 4 significant figures, no trailing zeros, no "-0" */
export function sig(v: number, n = 4) {
  if (!Number.isFinite(v)) return '—'
  if (Math.abs(v) < 1e-12) return '0'
  const a = Math.abs(v)
  if (a >= 1e6 || a < 1e-4) return v.toExponential(n - 1).replace(/\.?0+e/, 'e')
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(a)))
  const s = v.toFixed(Math.min(d, 10))
  return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s).replace(/^-0$/, '0')
}

// ---------------------------------------------------------------- curve geometry

type V = [number, number]
const geomCache = new WeakMap<Element, { key: string; pts: V[][] }>()

/** vertex runs in the element's own coordinates (M/L/H/V/Z parsed exactly; arcs and béziers sampled) */
function runsOf(el: SVGGeometryElement): V[][] {
  const tag = el.tagName.toLowerCase()
  const key = tag === 'path' ? (el.getAttribute('d') ?? '') : tag === 'polyline' || tag === 'polygon' ? (el.getAttribute('points') ?? '') : ['x1', 'y1', 'x2', 'y2'].map((k) => el.getAttribute(k)).join(',')
  const c = geomCache.get(el)
  if (c && c.key === key) return c.pts
  let pts: V[][] = []
  if (tag === 'line') {
    const n = (k: string) => parseFloat(el.getAttribute(k) ?? '0')
    pts = [[[n('x1'), n('y1')], [n('x2'), n('y2')]]]
  } else if (tag === 'polyline' || tag === 'polygon') {
    const nums = key.split(/[\s,]+/).filter(Boolean).map(Number)
    const run: V[] = []
    for (let i = 0; i + 1 < nums.length; i += 2) run.push([nums[i], nums[i + 1]])
    if (tag === 'polygon' && run.length) run.push(run[0])
    pts = [run]
  } else if (/^[\s\d.eE+\-,MmLlHhVvZz]*$/.test(key)) {
    const toks = key.match(/[MmLlHhVvZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) ?? []
    let cmd = 'M'
    let cx = 0
    let cy = 0
    let sx = 0
    let sy = 0
    let run: V[] = []
    const num = (i: number) => parseFloat(toks[i])
    for (let i = 0; i < toks.length; ) {
      if (/[A-Za-z]/.test(toks[i])) {
        cmd = toks[i++]
        if (cmd === 'Z' || cmd === 'z') {
          run.push([sx, sy])
          cx = sx
          cy = sy
        }
        continue
      }
      const rel = cmd === cmd.toLowerCase()
      const C = cmd.toUpperCase()
      if (C === 'M' || C === 'L') {
        const x = num(i) + (rel ? cx : 0)
        const y = num(i + 1) + (rel ? cy : 0)
        i += 2
        if (C === 'M') {
          if (run.length) pts.push(run)
          run = []
          sx = x
          sy = y
          cmd = rel ? 'l' : 'L'
        }
        run.push([x, y])
        cx = x
        cy = y
      } else if (C === 'H') {
        cx = num(i++) + (rel ? cx : 0)
        run.push([cx, cy])
      } else if (C === 'V') {
        cy = num(i++) + (rel ? cy : 0)
        run.push([cx, cy])
      } else i++
    }
    if (run.length) pts.push(run)
  } else {
    // arcs / curves: sample along the length
    const run: V[] = []
    try {
      const len = el.getTotalLength()
      const n = Math.min(240, Math.max(24, Math.round(len / 3)))
      for (let k = 0; k <= n; k++) {
        const p = el.getPointAtLength((len * k) / n)
        run.push([p.x, p.y])
      }
    } catch {
      /* not rendered (display: none, inside a closed <details>, …) */
    }
    pts = [run]
  }
  geomCache.set(el, { key, pts })
  return pts
}

function isCurve(el: Element): el is SVGGeometryElement {
  if (el.closest('[data-nocurve]') || el.closest('defs, clipPath, marker, text')) return false
  const cs = getComputedStyle(el)
  if (cs.stroke === 'none' || cs.stroke === 'transparent' || parseFloat(cs.strokeWidth) <= 0 || cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.strokeOpacity) === 0) return false
  if (el.tagName.toLowerCase() === 'line' && !el.hasAttribute('data-curve')) {
    // grid lines, axes and dashed guides are axis-aligned; sloped lines (best fits, envelopes) are curves
    const n = (k: string) => parseFloat(el.getAttribute(k) ?? '0')
    if (Math.abs(n('x1') - n('x2')) < 0.5 || Math.abs(n('y1') - n('y2')) < 0.5) return false
  }
  return true
}

/** nearest point (screen px) on any curve inside `host` */
function nearestOnCurves(host: Element, px: number, py: number) {
  let best: { d: number; x: number; y: number; el: Element } | null = null
  for (const el of host.querySelectorAll('path, polyline, polygon, line')) {
    if (!el.closest('[data-axes]') || !isCurve(el)) continue
    const m = el.getScreenCTM()
    if (!m) continue
    for (const run of runsOf(el)) {
      let prev: V | null = null
      for (const [ux, uy] of run) {
        const sx = m.a * ux + m.c * uy + m.e
        const sy = m.b * ux + m.d * uy + m.f
        if (prev) {
          const [ax, ay] = prev
          const dx = sx - ax
          const dy = sy - ay
          const L2 = dx * dx + dy * dy
          const t = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2)) : 0
          const qx = ax + t * dx
          const qy = ay + t * dy
          const d = Math.hypot(px - qx, py - qy)
          if (d < CURVE_SNAP && (!best || d < best.d)) best = { d, x: qx, y: qy, el }
        } else if (run.length === 1) {
          const d = Math.hypot(px - sx, py - sy)
          if (d < CURVE_SNAP && (!best || d < best.d)) best = { d, x: sx, y: sy, el }
        }
        prev = [sx, sy]
      }
    }
  }
  return best
}

// ---------------------------------------------------------------- the overlay

export function PointTip() {
  const [tip, setTip] = useState<Tip | null>(null)
  const hot = useRef<Element | null>(null)

  useEffect(() => {
    let last: { x: number; y: number; t: EventTarget | null } | null = null
    const setHot = (el: Element | null) => {
      if (hot.current === el) return
      hot.current?.removeAttribute('data-tip-hot')
      el?.setAttribute('data-tip-hot', '')
      hot.current = el
    }
    const show = (t: Tip | null) =>
      setTip((p) => (p === t || (p && t && p.text === t.text && p.x === t.x && p.y === t.y && p.dot?.x === t.dot?.x && p.dot?.y === t.dot?.y) ? p : t))
    const clear = () => {
      setHot(null)
      show(null)
    }
    const run = () => {
      if (!last) return
      const t = last.t instanceof Element ? last.t : null
      const svg = t?.closest('svg')
      if (!svg) return clear()
      // 1. marked points
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
      if (best) {
        setHot(best)
        return show({ text: best.getAttribute('data-tip') ?? '', x: bx, y: by })
      }
      setHot(null)
      // 2. any point on a curve of a chart with axes
      //    (an svg may hold several diagrams, each with its own axes: the nearest curve decides which)
      if (!svg.hasAttribute('data-axes') && !svg.querySelector('[data-axes]')) return show(null)
      const hit = nearestOnCurves(svg, last.x, last.y)
      const host = hit?.el.closest('[data-axes]')
      if (!hit || !host) return show(null)
      let ax: Axes
      try {
        ax = JSON.parse(host.getAttribute('data-axes') ?? '')
      } catch {
        return show(null)
      }
      const m = (host as SVGGraphicsElement).getScreenCTM?.()
      if (!m) return show(null)
      const u = new DOMPoint(hit.x, hit.y).matrixTransform(m.inverse())
      const xv = unmap(ax.x, u.x)
      const yv = unmap(ax.y, u.y)
      const name = hit.el.closest('[data-name]')?.getAttribute('data-name')
      const color = getComputedStyle(hit.el).stroke
      show({
        text: `${name ? name + ': ' : ''}${ax.xn} = ${sig(xv)}${ax.xu}, ${ax.yn} = ${sig(yv)}${ax.yu}`,
        x: hit.x,
        y: hit.y - 5,
        dot: { x: hit.x, y: hit.y, color },
      })
    }
    const move = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY, t: e.target }
      run()
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
    }
  }, [])

  if (!tip) return null
  const above = tip.y > 44
  return (
    <>
      {tip.dot && <div className="point-tip-dot" style={{ left: tip.dot.x, top: tip.dot.y, borderColor: tip.dot.color }} />}
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
    </>
  )
}

/** a short series name for readouts from a chart title: "BMD — P at x = 10′" → "BMD" */
export const tipName = (t: unknown) => (typeof t === 'string' ? t.split(/ [—(·:]| at /)[0].trim() : '')

/** readout name + unit from an axis label: "depth z (m)" → { name: 'z', unit: ' m' }, "U (%)" → { name: 'U', unit: ' %' } */
export function axisName(label: unknown, fallback: string): { name: string; unit: string } {
  if (typeof label !== 'string' || !label.trim()) return { name: fallback, unit: '' }
  const m = label.match(/^(.*?)\s*\(([^)]*)\)/)
  let name = (m ? m[1] : label).replace(/[,→←↑↓].*$/, '').trim()
  const unitRaw = m ? m[2].split(',')[0].trim() : ''
  const unit = !unitRaw || /^log/i.test(unitRaw) ? '' : unitRaw === '%' ? ' %' : ' ' + unitRaw
  const words = name.split(/\s+/)
  if (words.length > 1 && words[words.length - 1].length <= 4) name = words[words.length - 1]
  return { name: name || fallback, unit }
}

/** ordinate symbol for a diagram from its title: SFD → V, BMD → M, ILD → ordinate */
export const yNameFor = (title: unknown) => {
  const n = tipName(title)
  return /^ILD|influence/i.test(n) ? 'ordinate' : /^SFD|^shear/i.test(n) ? 'V' : /^BMD|^moment/i.test(n) ? 'M' : /^axial|^AFD/i.test(n) ? 'N' : 'y'
}
