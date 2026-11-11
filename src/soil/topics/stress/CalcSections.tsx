// Drawable calculators for loads seen in cross-section (strip, embankment, 2:1 spread) and the circle in plan.
// Cross-sections use world y = −depth: the surface is y = 0, P sits below it.
import { useState } from 'react'
import { KV, Seg } from '../../../components/ui'
import { NumIn } from '../../../reference/common'
import {
  boussinesqRectCentre,
  circleAt,
  circleCentre,
  embankmentAt,
  embankmentBlocks,
  embQ,
  linearStrip,
  osterberg,
  osterbergAngles,
  stripAngles,
  stripAt,
  triStripDas,
  twoToOneCircle,
  twoToOneRect,
  twoToOneStrip,
  type Embankment,
  type XY,
} from '../../engine/stressdist'
import { Big, Card, f1, f2, f3, f4, fin, Hint, Modes, Presets, R, Split, Work } from './calcKit'
import { DrawCanvas, PMark, snap, useFrozenView, type Scale } from './DrawCanvas'
import { DepthChart } from './figs'

const deg = (r: number) => (r * 180) / Math.PI
/** keep P below the surface */
const below = (y: number) => Math.min(snap(y), -0.5)

/** a dimension label between two x positions at height y (world) */
function DimX({ s, xa, xb, y, text, c = 'var(--c-mute)' }: { s: Scale; xa: number; xb: number; y: number; text: string; c?: string }) {
  return (
    <g>
      <line x1={s.X(xa)} x2={s.X(xb)} y1={s.Y(y)} y2={s.Y(y)} stroke={c} strokeWidth={0.8} />
      <line x1={s.X(xa)} x2={s.X(xa)} y1={s.Y(y) - 3} y2={s.Y(y) + 3} stroke={c} strokeWidth={0.8} />
      <line x1={s.X(xb)} x2={s.X(xb)} y1={s.Y(y) - 3} y2={s.Y(y) + 3} stroke={c} strokeWidth={0.8} />
      <text x={(s.X(xa) + s.X(xb)) / 2} y={s.Y(y) - 3} fontSize={9} textAnchor="middle" fill={c}>
        {text}
      </text>
    </g>
  )
}

/** P below the surface with its depth marked */
function PDepth({ s, P }: { s: Scale; P: XY }) {
  return (
    <g>
      <line x1={s.X(P[0])} x2={s.X(P[0])} y1={s.Y(0)} y2={s.Y(P[1])} stroke="var(--c-accent)" strokeDasharray="2 3" />
      <text x={s.X(P[0]) - 4} y={s.Y(0) + 0.7 * (s.Y(P[1]) - s.Y(0))} fontSize={9} textAnchor="end" fill="var(--c-accent)">
        z = {f2(-P[1])}
      </text>
      <PMark s={s} at={P} />
    </g>
  )
}

// ---------------------------------------------------------------- strip (uniform or triangular)

const STRIP_PRESETS: { label: string; v: { xa: number; xb: number; q: number; tri: boolean; P: XY } }[] = [
  { label: 'Uniform 3 m strip, 100 kPa, 3 m below the centre', v: { xa: -1.5, xb: 1.5, q: 100, tri: false, P: [0, -3] } },
  { label: 'Uniform 2 m strip, 150 kPa, 2 m below an edge', v: { xa: 0, xb: 2, q: 150, tri: false, P: [0, -2] } },
  { label: 'Triangular 0 → 100 kPa over 4 m, 2 m below the high edge', v: { xa: 0, xb: 4, q: 100, tri: true, P: [4, -2] } },
]
const QH = 1.6 // drawn height of q (m)

export function StripCalc() {
  const [o, setO] = useState(STRIP_PRESETS[0].v)
  const [mode, setMode] = useState<'draw' | 'P'>('draw')
  const [drag, setDrag] = useState<'new' | 'P' | null>(null)
  const fv = useFrozenView([[o.xa, 0], [o.xb, 0], o.P, [o.xa, QH]], { x0: -6, x1: 6, y0: -6, y1: 2.5 }, 2)
  const X = o.P[0]
  const z = -o.P[1]
  const lo = Math.min(o.xa, o.xb)
  const hi = Math.max(o.xa, o.xb)
  const B = hi - lo
  const ok = B > 0 && z > 0 && fin(o.q, X)
  const at = (zz: number) => (o.tri ? (o.xa < o.xb ? linearStrip(o.xa, 0, o.xb, o.q, X, zz) : linearStrip(o.xb, o.q, o.xa, 0, X, zz)) : linearStrip(lo, o.q, hi, o.q, X, zz))
  const s = ok ? at(z) : NaN
  const ang = stripAngles(B, X - (lo + hi) / 2, z)
  const xr = (X - o.xa) * Math.sign(o.xb - o.xa)
  const das = triStripDas(o.q, B, xr, z)
  const down = (x: number, y: number, tol: number) => {
    fv.freeze()
    if (mode === 'P' || Math.hypot(o.P[0] - x, o.P[1] - y) <= tol || y < -0.6) {
      setO({ ...o, P: [snap(x), below(y)] })
      setDrag('P')
    } else {
      setO({ ...o, xa: snap(x), xb: snap(x) })
      setDrag('new')
    }
  }
  const move = (x: number, y: number) => {
    if (drag === 'P') setO({ ...o, P: [snap(x), below(y)] })
    else if (drag === 'new') setO({ ...o, xb: snap(x) })
  }
  const up = () => (setDrag(null), fv.thaw())
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Presets items={STRIP_PRESETS} onPick={(v) => (fv.reset(), setO(v))} />
        <Modes value={mode} onChange={setMode} items={[{ v: 'draw', label: '▬ draw strip' }, { v: 'P', label: '• move P' }]} />
        <Seg size="xs" value={o.tri ? 't' : 'u'} onChange={(v) => setO({ ...o, tri: v === 't' })} items={[{ v: 'u', label: 'uniform' }, { v: 't', label: 'triangular' }]} />
        {o.tri && (
          <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setO({ ...o, xa: o.xb, xb: o.xa })}>
            ⇄ flip
          </button>
        )}
        <NumIn label="q" value={o.q} onChange={(v) => setO({ ...o, q: v })} step={10} unit="kPa" w="w-16" />
        <NumIn label="B" value={B} onChange={(v) => setO({ ...o, xa: lo, xb: lo + v })} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={(v) => setO({ ...o, P: [X, -v] })} step={0.5} unit="m" w="w-14" />
      </div>
      <Split>
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">
          <DrawCanvas view={fv.view} section onDown={down} onMove={move} onUp={up} label="strip load section">
            {(sc) => (
              <>
                {B > 0 && (
                  <>
                    <path
                      d={o.tri ? `M${sc.X(o.xa)},${sc.Y(0)} L${sc.X(o.xb)},${sc.Y(0)} L${sc.X(o.xb)},${sc.Y(QH)} Z` : `M${sc.X(lo)},${sc.Y(0)} L${sc.X(hi)},${sc.Y(0)} L${sc.X(hi)},${sc.Y(QH)} L${sc.X(lo)},${sc.Y(QH)} Z`}
                      fill="var(--c-load)"
                      fillOpacity={0.2}
                      stroke="var(--c-load)"
                      strokeWidth={1.4}
                    />
                    {Array.from({ length: 7 }, (_, i) => lo + ((i + 0.5) / 7) * B).map((x, i) => {
                      const hgt = o.tri ? (QH * (x - o.xa)) / (o.xb - o.xa) : QH
                      return hgt > 0.25 ? <line key={i} x1={sc.X(x)} x2={sc.X(x)} y1={sc.Y(hgt) + 2} y2={sc.Y(0) - 3} stroke="var(--c-load)" strokeWidth={1} markerEnd="" /> : null
                    })}
                    <text x={sc.X(o.tri ? o.xb : (lo + hi) / 2)} y={sc.Y(QH) - 4} fontSize={10} textAnchor="middle" fontWeight={700} fill="var(--c-load)">
                      q = {f2(o.q)} kPa
                    </text>
                    <DimX s={sc} xa={lo} xb={hi} y={-0.35} text={`B = ${f2(B)} m`} c="var(--c-load)" />
                    {ok && (
                      <g>
                        <line x1={sc.X(X)} y1={sc.Y(o.P[1])} x2={sc.X(lo)} y2={sc.Y(0)} stroke="var(--c-accent)" strokeDasharray="4 3" />
                        <line x1={sc.X(X)} y1={sc.Y(o.P[1])} x2={sc.X(hi)} y2={sc.Y(0)} stroke="var(--c-accent)" strokeDasharray="4 3" />
                        <text x={sc.X(X) + 8} y={sc.Y(o.P[1]) + 16} fontSize={10} fill="var(--c-accent)">
                          α = {f1(deg(ang.alpha))}°
                        </text>
                      </g>
                    )}
                  </>
                )}
                <PDepth s={sc} P={o.P} />
              </>
            )}
          </DrawCanvas>
          <Hint>Drag along the surface to draw the strip (for a triangle, it rises from where you start to where you let go); click or drag below the surface to place P.</Hint>
        </div>
        <div className="space-y-2">
          {ok ? (
            <>
              <Big label="σz" value={s} unit="kPa" />
              <KV k="σz/q" v={f4(s / o.q)} />
              <DepthChart w={320} zMax={Math.max(2 * z, 3 * B)} mark={{ z, v: s }} curves={[{ f: at, label: 'σz below P' }]} />
            </>
          ) : (
            <div className="text-bad text-sm">Draw a strip; P must be below the surface.</div>
          )}
        </div>
      </Split>
      {ok && (o.tri ? <Work>{R`Triangular strip, x measured from the zero edge towards the high edge: x = ${f2(xr)} m, B = ${f2(B)} m. $\alpha = ${f4(das.alpha)}$ rad (${f1(deg(das.alpha))}°), $\delta = \tan^{-1}\frac{x-B}{z} = ${f4(das.delta)}$ rad: $\sigma_z = \frac q\pi\left[\frac xB\alpha - \tfrac12\sin2\delta\right] = ${f4(das.I)}q$ = **${f3(das.sigma)} kPa**.`}</Work> : <Work>{R`x from the centre = ${f2(X - (lo + hi) / 2)} m. $\alpha = ${f4(ang.alpha)}$ rad (${f1(deg(ang.alpha))}°), $\delta = ${f4(ang.delta)}$ rad (to the near edge): $\sigma_z = \frac q\pi[\alpha + \sin\alpha\cos(\alpha+2\delta)] = ${f4(s / o.q)}q$ = **${f3(stripAt(o.q, B, X - (lo + hi) / 2, z))} kPa**.`}</Work>)}
    </div>
  )
}

// ---------------------------------------------------------------- embankment (Osterberg)

interface EmbState {
  xs: [number, number, number, number]
  h: number
  gamma: number
  P: XY
}
const EMB_PRESETS: { label: string; v: EmbState }[] = [
  { label: 'Jan 2021 Q4(b) point B: crest 8, slopes 10 and 25 m, H 5 m, γ 19, below the crest centre, 3 m', v: { xs: [0, 10, 18, 43], h: 5, gamma: 19, P: [14, -3] } },
  { label: 'Jan 2021 Q4(b) point A: below the left crest edge, 2 m', v: { xs: [0, 10, 18, 43], h: 5, gamma: 19, P: [10, -2] } },
  { label: '2017-18 Q8(c): crest 30, slopes 20 (ft), q = 4 ksf, 21 ft below the centre', v: { xs: [0, 20, 50, 70], h: 1, gamma: 4, P: [35, -21] } },
]
const toEmb = (e: EmbState): Embankment => ({ aL: e.xs[1] - e.xs[0], c: e.xs[2] - e.xs[1], aR: e.xs[3] - e.xs[2], h: e.h, gamma: e.gamma })

export function EmbCalc() {
  const [e, setE] = useState<EmbState>(EMB_PRESETS[0].v)
  const [drag, setDrag] = useState<number | 'P' | null>(null)
  const [os, setOs] = useState({ a: 10, b: 4, z: 3, q: 95 })
  const em = toEmb(e)
  const fv = useFrozenView([[e.xs[0], 0], [e.xs[3], e.h], e.P], { x0: e.xs[0] - 2, x1: e.xs[3] + 2, y0: -Math.max(4, (e.xs[3] - e.xs[0]) * 0.3), y1: 1 }, 2)
  const X = e.P[0] - e.xs[0]
  const z = -e.P[1]
  const ok = em.aL >= 0 && em.aR >= 0 && em.c >= 0 && e.h > 0 && z > 0 && fin(e.gamma, X)
  const sig = ok ? embankmentAt(em, X, z) : NaN
  const bl = ok ? embankmentBlocks(em, X, z) : null
  const verts: XY[] = [
    [e.xs[0], 0],
    [e.xs[1], e.h],
    [e.xs[2], e.h],
    [e.xs[3], 0],
  ]
  const down = (x: number, y: number, tol: number) => {
    fv.freeze()
    const k = verts.findIndex((v) => Math.hypot(v[0] - x, v[1] - y) <= tol * 1.5)
    if (k >= 0) return setDrag(k)
    setE({ ...e, P: [snap(x), below(y)] })
    setDrag('P')
  }
  const move = (x: number, y: number) => {
    if (drag === null) return
    if (drag === 'P') return setE({ ...e, P: [snap(x), below(y)] })
    const xs = [...e.xs] as EmbState['xs']
    const lo = drag > 0 ? xs[drag - 1] : -Infinity
    const hi = drag < 3 ? xs[drag + 1] : Infinity
    xs[drag] = Math.max(lo, Math.min(hi, snap(x)))
    setE({ ...e, xs, h: drag === 1 || drag === 2 ? Math.max(0.5, snap(y)) : e.h })
  }
  const up = () => (setDrag(null), fv.thaw())
  const setLen = (k: 'aL' | 'c' | 'aR') => (v: number) => {
    const n = { ...em, [k]: v }
    setE({ ...e, xs: [e.xs[0], e.xs[0] + n.aL, e.xs[0] + n.aL + n.c, e.xs[0] + n.aL + n.c + n.aR] })
  }
  const oI = osterberg(os.a, os.b, os.z)
  const oa = osterbergAngles(os.a, os.b, os.z)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Presets items={EMB_PRESETS} onPick={(v) => (fv.reset(), setE(v))} />
        <NumIn label="H" value={e.h} onChange={(v) => setE({ ...e, h: v })} step={0.5} unit="m" w="w-14" />
        <NumIn label="γ" value={e.gamma} onChange={(v) => setE({ ...e, gamma: v })} step={0.5} w="w-14" />
        <NumIn label="left slope" value={em.aL} onChange={setLen('aL')} step={1} unit="m" w="w-14" />
        <NumIn label="crest" value={em.c} onChange={setLen('c')} step={1} unit="m" w="w-14" />
        <NumIn label="right slope" value={em.aR} onChange={setLen('aR')} step={1} unit="m" w="w-14" />
        <NumIn label="z" value={z} onChange={(v) => setE({ ...e, P: [e.P[0], -v] })} step={0.5} unit="m" w="w-14" />
      </div>
      <Split>
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">
          <DrawCanvas view={fv.view} section onDown={down} onMove={move} onUp={up} label="embankment section" grid={fv.view.x1 - fv.view.x0 > 40 ? 2 : 1}>
            {(s) => (
              <>
                <path d={`M${verts.map((v) => `${s.X(v[0])},${s.Y(v[1])}`).join(' L')} Z`} fill="var(--c-load)" fillOpacity={0.2} stroke="var(--c-load)" strokeWidth={1.4} />
                {bl && (
                  <g>
                    <line x1={s.X(e.P[0])} x2={s.X(e.P[0])} y1={s.Y(e.h)} y2={s.Y(0)} stroke="var(--c-good)" strokeWidth={1.4} strokeDasharray="5 3" />
                    <text x={s.X(e.P[0]) - 4} y={s.Y(e.h) - 4} fontSize={9} textAnchor="end" fill="var(--c-good)">
                      left a {f1(bl.blocks[0].a)}, b {f1(bl.blocks[0].b)}
                    </text>
                    <text x={s.X(e.P[0]) + 4} y={s.Y(e.h) - 4} fontSize={9} fill="var(--c-good)">
                      right a {f1(bl.blocks[1].a)}, b {f1(bl.blocks[1].b)}
                    </text>
                  </g>
                )}
                {verts.map((v, i) => (
                  <circle key={i} cx={s.X(v[0])} cy={s.Y(v[1])} r={4} fill="var(--c-bg)" stroke="var(--c-load)" strokeWidth={1.5} />
                ))}
                <DimX s={s} xa={e.xs[0]} xb={e.xs[1]} y={-0.6} text={`${f1(em.aL)}`} />
                <DimX s={s} xa={e.xs[1]} xb={e.xs[2]} y={-0.6} text={`crest ${f1(em.c)}`} />
                <DimX s={s} xa={e.xs[2]} xb={e.xs[3]} y={-0.6} text={`${f1(em.aR)}`} />
                <text x={s.X(e.xs[3])} y={s.Y(e.h) + 12} fontSize={9} textAnchor="end" fill="var(--c-load)">
                  H = {f1(e.h)}, q = γH = {f1(embQ(em))}
                </text>
                <PDepth s={s} P={e.P} />
              </>
            )}
          </DrawCanvas>
          <Hint>Drag the four corner dots to reshape the bank (the crest corners also set H); click or drag below the ground to place P. Under the crest, the green line is the Osterberg split.</Hint>
        </div>
        <div className="space-y-2">
          {ok ? (
            <>
              <Big label="σz" value={sig} unit="kPa" />
              {bl?.blocks.map((b) => <KV key={b.side} k={`Iz ${b.side} (a/z ${f3(b.az)}, b/z ${f3(b.bz)})`} v={f4(b.I)} />)}
              <DepthChart w={320} zMax={Math.max(2 * z, (em.aL + em.c + em.aR) / 2)} mark={{ z, v: sig }} curves={[{ f: (zz) => embankmentAt(em, X, zz), label: 'σz below P' }]} />
            </>
          ) : (
            <div className="text-bad text-sm">H and z must be positive.</div>
          )}
        </div>
      </Split>
      {ok &&
        (bl ? (
          <Work>{R`q = γH = ${f2(embQ(em))} kPa. Split at the vertical through P: ${bl.blocks.map((b) => R`${b.side} block a = ${f2(b.a)}, b = ${f2(b.b)}: $I_z = \frac1\pi\left[\frac{a+b}{a}\tan^{-1}\frac{a+b}{z} - \frac ba\tan^{-1}\frac bz\right] = ${f4(b.I)}$`).join('; ')}. σz = q ΣIz = ${f2(embQ(em))}(${f4(bl.I)}) = **${f2(bl.sigma)} kPa**.`}</Work>
        ) : (
          <Work>{R`P is not under the crest, so the two-block split does not apply directly. Exact superposition of the ramps and the crest (integrals of the line-load formula): **${f3(sig)} kPa**. On the chart: blocks for the whole section about P, minus the missing wedge.`}</Work>
        ))}
      <Card title="Osterberg lookup: one block" chart="d-osterberg" inputs={<><NumIn label="a (slope, horiz.)" value={os.a} onChange={(v) => setOs({ ...os, a: v })} unit="m" step={0.5} w="w-14" /><NumIn label="b (flat)" value={os.b} onChange={(v) => setOs({ ...os, b: v })} unit="m" step={0.5} w="w-14" /><NumIn label="z" value={os.z} onChange={(v) => setOs({ ...os, z: v })} unit="m" step={0.5} w="w-14" /><NumIn label="q = γH" value={os.q} onChange={(v) => setOs({ ...os, q: v })} unit="kPa" step={5} w="w-16" /></>}>
        {fin(oI) && os.z > 0 && (
          <>
            <div className="grid grid-cols-2 cq-md:grid-cols-4 gap-x-4">
              <KV k="a/z" v={f3(os.a / os.z)} />
              <KV k="b/z" v={f3(os.b / os.z)} />
              <KV k="Iz" v={f4(oI)} />
              <KV k="σz (one block)" v={f3(oI * os.q)} unit="kPa" />
            </div>
            <Hint>
              α1 + α2 = tan⁻¹((a+b)/z) = {f4(oa.a12)} rad, α2 = tan⁻¹(b/z) = {f4(oa.a2)} rad.
            </Hint>
          </>
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------- circle (plan)

const CIRCLE_PRESETS: { label: string; v: { cx: number; cy: number; R: number; P: XY; z: number; q: number } }[] = [
  { label: '2007-08 Q2(a): 8 m circular raft, 200 kPa, 4 m below the centre', v: { cx: 0, cy: 0, R: 4, P: [0, 0], z: 4, q: 200 } },
  { label: 'Same raft, 4 m below the edge', v: { cx: 0, cy: 0, R: 4, P: [4, 0], z: 4, q: 200 } },
  { label: 'Tank 10 m diameter, 150 kPa, 5 m below a point 2 m outside', v: { cx: 0, cy: 0, R: 5, P: [7, 0], z: 5, q: 150 } },
]

export function CircleCalc() {
  const [o, setO] = useState(CIRCLE_PRESETS[0].v)
  const [mode, setMode] = useState<'draw' | 'P'>('draw')
  const [drag, setDrag] = useState<'new' | 'P' | null>(null)
  const fv = useFrozenView([o.P, [o.cx - o.R, o.cy - o.R], [o.cx + o.R, o.cy + o.R]], { x0: -6, y0: -5, x1: 6, y1: 5 }, 1.5)
  const r = Math.hypot(o.P[0] - o.cx, o.P[1] - o.cy)
  const ok = o.R > 0 && o.z > 0 && fin(o.q, r)
  const f = (zz: number) => (r < 1e-9 ? circleCentre(o.q, o.R, zz) : circleAt(o.q, o.R, r, zz, 40, 72))
  const s = ok ? f(o.z) : NaN
  const down = (x: number, y: number, tol: number) => {
    fv.freeze()
    if (mode === 'P' || Math.hypot(o.P[0] - x, o.P[1] - y) <= tol) {
      setO({ ...o, P: [snap(x), snap(y)] })
      setDrag('P')
    } else {
      setO({ ...o, cx: snap(x), cy: snap(y), R: 0 })
      setDrag('new')
    }
  }
  const move = (x: number, y: number) => {
    if (drag === 'P') setO({ ...o, P: [snap(x), snap(y)] })
    else if (drag === 'new') setO({ ...o, R: snap(Math.hypot(x - o.cx, y - o.cy)) })
  }
  const up = () => {
    if (drag === 'new' && o.R <= 0) setO({ ...o, R: 0.5 })
    setDrag(null)
    fv.thaw()
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Presets items={CIRCLE_PRESETS} onPick={(v) => (fv.reset(), setO(v))} />
        <Modes value={mode} onChange={setMode} items={[{ v: 'draw', label: '◯ draw circle' }, { v: 'P', label: '• move P' }]} />
        <NumIn label="R" value={o.R} onChange={(v) => setO({ ...o, R: v })} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={o.z} onChange={(v) => setO({ ...o, z: v })} step={0.5} unit="m" w="w-14" />
        <NumIn label="q" value={o.q} onChange={(v) => setO({ ...o, q: v })} step={10} unit="kPa" w="w-16" />
      </div>
      <Split>
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">
          <DrawCanvas view={fv.view} onDown={down} onMove={move} onUp={up} label="plan of the circular load">
            {(sc) => (
              <>
                <circle cx={sc.X(o.cx)} cy={sc.Y(o.cy)} r={Math.max(0, o.R * sc.k)} fill="var(--c-load)" fillOpacity={0.18} stroke="var(--c-load)" strokeWidth={1.4} />
                <circle cx={sc.X(o.cx)} cy={sc.Y(o.cy)} r={2.5} fill="var(--c-load)" />
                <line x1={sc.X(o.cx)} y1={sc.Y(o.cy)} x2={sc.X(o.cx + o.R * Math.cos(2.4))} y2={sc.Y(o.cy + o.R * Math.sin(2.4))} stroke="var(--c-load)" />
                <text x={sc.X(o.cx + 0.5 * o.R * Math.cos(2.4)) - 4} y={sc.Y(o.cy + 0.5 * o.R * Math.sin(2.4)) - 4} fontSize={10} textAnchor="end" fill="var(--c-load)" fontWeight={700}>
                  R = {f2(o.R)}
                </text>
                {r > 0.01 && (
                  <g>
                    <line x1={sc.X(o.cx)} y1={sc.Y(o.cy)} x2={sc.X(o.P[0])} y2={sc.Y(o.P[1])} stroke="var(--c-accent)" strokeDasharray="4 3" />
                    <text x={(sc.X(o.cx) + sc.X(o.P[0])) / 2} y={(sc.Y(o.cy) + sc.Y(o.P[1])) / 2 + 12} fontSize={9} textAnchor="middle" fill="var(--c-accent)">
                      r = {f2(r)}
                    </text>
                  </g>
                )}
                <PMark s={sc} at={o.P} />
              </>
            )}
          </DrawCanvas>
          <Hint>Drag from the centre outwards to draw the circle; drag P anywhere — inside, on the edge or outside.</Hint>
        </div>
        <div className="space-y-2">
          {ok ? (
            <>
              <Big label="σz" value={s} unit="kPa" />
              <KV k="σz/q" v={f4(s / o.q)} />
              <KV k="r/R, z/R" v={`${f3(r / o.R)}, ${f3(o.z / o.R)}`} />
              <DepthChart w={320} zMax={Math.max(2 * o.z, 3 * o.R)} mark={{ z: o.z, v: s }} curves={[{ f, label: 'σz below P' }]} />
            </>
          ) : (
            <div className="text-bad text-sm">Draw a circle; z must be positive.</div>
          )}
        </div>
      </Split>
      {ok && (r < 1e-9 ? <Work>{R`Below the centre: $\sigma_z = q\{1-[1+(R/z)^2]^{-3/2}\}$, R/z = ${f3(o.R / o.z)} → ${f4(s / o.q)} × ${f2(o.q)} = **${f3(s)} kPa**.`}</Work> : <Work>{R`P is ${f2(r)} m from the centre (r/R = ${f3(r / o.R)}): no closed form taught — Newmark's chart (draw the circle at AB = z), or the Boussinesq integral over the circle done numerically here: **${f3(s)} kPa** (σz/q = ${f4(s / o.q)}). Below the centre it would be ${f3(circleCentre(o.q, o.R, o.z))} kPa.`}</Work>)}
    </div>
  )
}

// ---------------------------------------------------------------- 2:1 spread

export function TwoOneCalc() {
  const [o, setO] = useState({ x1: -1, x2: 1, L: 3, z: 4, Q: 1200, shape: 'rect' as 'rect' | 'strip' | 'circle' })
  const [mode, setMode] = useState<'draw' | 'depth'>('draw')
  const [drag, setDrag] = useState<'new' | 'z' | null>(null)
  const B = Math.abs(o.x2 - o.x1)
  const lo = Math.min(o.x1, o.x2)
  const hi = Math.max(o.x1, o.x2)
  const fv = useFrozenView([[lo - o.z / 2, -o.z], [hi + o.z / 2, 0.8]], { x0: -5, x1: 5, y0: -5, y1: 1.5 }, 1.5)
  const ok = B > 0 && o.z >= 0 && fin(o.Q, o.L) && (o.shape !== 'rect' || o.L > 0)
  const area = o.shape === 'rect' ? B * o.L : o.shape === 'circle' ? (Math.PI * B * B) / 4 : B
  const q = o.Q / area
  const s = o.shape === 'rect' ? twoToOneRect(o.Q, B, o.L, o.z) : o.shape === 'strip' ? twoToOneStrip(o.Q, B, o.z) : twoToOneCircle(o.Q, B, o.z)
  const bq = o.z > 0 ? (o.shape === 'rect' ? boussinesqRectCentre(q, B, o.L, o.z) : o.shape === 'strip' ? stripAt(q, B, 0, o.z) : circleCentre(q, B / 2, o.z)) : q
  const down = (x: number, y: number) => {
    fv.freeze()
    if (mode === 'depth' || y < -0.6) {
      setO({ ...o, z: Math.max(0.5, -below(y)) })
      setDrag('z')
    } else {
      setO({ ...o, x1: snap(x), x2: snap(x) })
      setDrag('new')
    }
  }
  const move = (x: number, y: number) => {
    if (drag === 'z') setO({ ...o, z: Math.max(0.5, -below(y)) })
    else if (drag === 'new') setO({ ...o, x2: snap(x) })
  }
  const up = () => (setDrag(null), fv.thaw())
  const wz = o.shape === 'rect' ? `(B+z)(L+z) = (${f2(B + o.z)})(${f2(o.L + o.z)})` : o.shape === 'strip' ? `B+z = ${f2(B + o.z)}` : `π(D+z)²/4 = π(${f2(B + o.z)})²/4`
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Seg size="xs" value={o.shape} onChange={(v) => setO({ ...o, shape: v })} items={[{ v: 'rect', label: 'rectangle' }, { v: 'strip', label: 'strip' }, { v: 'circle', label: 'circle' }]} />
        <Modes value={mode} onChange={setMode} items={[{ v: 'draw', label: '▬ draw footing' }, { v: 'depth', label: '↧ set depth' }]} />
        <NumIn label={o.shape === 'strip' ? 'Q (kN/m)' : 'Q (kN)'} value={o.Q} onChange={(v) => setO({ ...o, Q: v })} step={50} w="w-16" />
        <NumIn label={o.shape === 'circle' ? 'D' : 'B'} value={B} onChange={(v) => setO({ ...o, x1: lo, x2: lo + v })} step={0.5} unit="m" w="w-14" />
        {o.shape === 'rect' && <NumIn label="L (into the page)" value={o.L} onChange={(v) => setO({ ...o, L: v })} step={0.5} unit="m" w="w-14" />}
        <NumIn label="z" value={o.z} onChange={(v) => setO({ ...o, z: v })} step={0.5} unit="m" w="w-14" />
      </div>
      <Split>
        <div className="rounded-xl bg-bg/60 border border-line p-2 min-w-0">
          <DrawCanvas view={fv.view} section onDown={down} onMove={move} onUp={up} label="2:1 load spread">
            {(s2) => (
              <>
                {B > 0 && (
                  <>
                    <path d={`M${s2.X(lo)},${s2.Y(0)} L${s2.X(hi)},${s2.Y(0)} L${s2.X(hi + o.z / 2)},${s2.Y(-o.z)} L${s2.X(lo - o.z / 2)},${s2.Y(-o.z)} Z`} fill="var(--c-accent)" fillOpacity={0.1} stroke="var(--c-accent)" strokeDasharray="5 3" />
                    <rect x={s2.X(lo)} y={s2.Y(0.5)} width={B * s2.k} height={0.5 * s2.k} fill="var(--c-load)" fillOpacity={0.35} stroke="var(--c-load)" />
                    <text x={s2.X((lo + hi) / 2)} y={s2.Y(0.5) - 4} fontSize={10} textAnchor="middle" fontWeight={700} fill="var(--c-load)">
                      Q = {f1(o.Q)}, {o.shape === 'circle' ? 'D' : 'B'} = {f2(B)}
                    </text>
                    <DimX s={s2} xa={lo - o.z / 2} xb={hi + o.z / 2} y={-o.z - 0.4} text={`${o.shape === 'circle' ? 'D' : 'B'} + z = ${f2(B + o.z)} m`} c="var(--c-accent)" />
                    <text x={s2.X(hi + o.z / 4) + 6} y={s2.Y(-o.z / 2)} fontSize={9} fill="var(--c-accent)">
                      2V : 1H
                    </text>
                    <line x1={s2.X(lo - o.z / 2 - 1)} x2={s2.X(hi + o.z / 2 + 1)} y1={s2.Y(-o.z)} y2={s2.Y(-o.z)} stroke="var(--c-accent)" strokeWidth={1.6} />
                    <text x={s2.X(lo - o.z / 2 - 1)} y={s2.Y(-o.z) - 4} fontSize={9} fill="var(--c-accent)">
                      z = {f2(o.z)}
                    </text>
                  </>
                )}
              </>
            )}
          </DrawCanvas>
          <Hint>Drag along the surface to draw the footing width; click or drag below the ground to set the depth. The load spreads at 2 vertical : 1 horizontal on each side.</Hint>
        </div>
        <div className="space-y-2">
          {ok ? (
            <>
              <Big label="σz, average (2:1)" value={s} unit="kPa" />
              <KV k="contact pressure q" v={f2(q)} unit="kPa" />
              <KV k="Boussinesq below the centre" v={f3(bq)} unit="kPa" />
            </>
          ) : (
            <div className="text-bad text-sm">Draw a footing.</div>
          )}
        </div>
      </Split>
      {ok && <Work>{R`σz = Q / ${wz} = ${f2(o.Q)} / ${f3(o.shape === 'rect' ? (B + o.z) * (o.L + o.z) : o.shape === 'strip' ? B + o.z : (Math.PI * (B + o.z) ** 2) / 4)} = **${f3(s)} kPa** — an average over the spread area; the peak below the centre (Boussinesq) is ${f3(bq)} kPa.`}</Work>}
    </div>
  )
}
