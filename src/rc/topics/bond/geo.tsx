// Bond geometry explainer: how to get clear spacing, clear cover (Table 6.1) and cb (Eq. 6.4) from a beam section.
// Used in the Approach tab and the code pane (b-geo).

import { useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Md, Tex } from '../../../components/ui'
import { NumIn, ok } from '../../../reference/common'
import { bar, beamBarGeometry, MM_BAR_IDS, simplifiedCase, US_BAR_IDS, type BeamGeo } from '../../engine/bond'

const f = (v: number, d = 3) => fmt(v, d)
const INK = 'var(--c-ink)'
const MUTE = 'var(--c-mute)'
const ACC = 'var(--c-accent)'
const BAD = 'var(--c-bad)'
const GOOD = 'var(--c-good)'

function Dim({ x1, x2, y, label, color, size = 9.5 }: { x1: number; x2: number; y: number; label: string; color: string; size?: number }) {
  return (
    <g>
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={color} strokeWidth={1} markerStart="url(#bgA)" markerEnd="url(#bgA)" />
      <line x1={x1} x2={x1} y1={y - 4} y2={y + 4} stroke={color} strokeWidth={0.8} />
      <line x1={x2} x2={x2} y1={y - 4} y2={y + 4} stroke={color} strokeWidth={0.8} />
      <text x={(x1 + x2) / 2} y={y - 4} fontSize={size} textAnchor="middle" fill={color} className="num">
        {label}
      </text>
    </g>
  )
}

/** bottom strip of a beam section with the clear and centre distances dimensioned */
export function BarGeoFig({ b, cover, ds, db, n, g }: { b: number; cover: number; ds: number; db: number; n: number; g: BeamGeo }) {
  const W = 560
  const x0 = 16
  const avail = W - 2 * x0
  const two = n > 1
  // draw from the left face to just past the second bar, so the small distances are big enough to label
  const shownIn = two ? Math.min(b, g.cSide + 1.6 * g.spacingCC) : b
  const cut = shownIn < b - 1e-9
  const S = Math.min(avail / shownIn, 90)
  const xr = x0 + shownIn * S
  const r = (db * S) / 2
  const t3 = 78
  const t2 = t3 + 28
  const t1 = t2 + 28
  const yBar = t1 + 14 + r
  const yBot = yBar + g.cFace * S
  const top = 54
  const xs = Array.from({ length: n }, (_, k) => x0 + (g.cSide + k * (two ? g.spacingCC : 0)) * S).filter((x) => x < xr - r)
  const e = (cover + ds / 2) * S
  const hh = yBot - top
  const zig = `M${xr},${top} l-5,${hh * 0.4} l10,${hh * 0.15} l-10,${hh * 0.1} l5,${hh * 0.35}`
  return (
    <svg viewBox={`0 0 ${W} ${yBot + 40}`} className="w-full h-auto" style={{ maxWidth: 640 }}>
      <defs>
        <marker id="bgA" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={MUTE} />
        </marker>
      </defs>
      <rect x={x0} y={top} width={xr - x0} height={yBot - top} fill="var(--c-panel2)" />
      <path d={`M${x0},${top} L${x0},${yBot} L${xr},${yBot}${cut ? '' : ` L${xr},${top}`}`} fill="none" stroke={INK} strokeWidth={1.4} />
      {cut && <path d={zig} fill="none" stroke={MUTE} strokeDasharray="3 3" />}
      <line x1={x0 - 4} x2={xr + 4} y1={top} y2={top} stroke={MUTE} strokeDasharray="4 3" />
      {ds > 0 && <path d={`M${x0 + e},${top + 2} L${x0 + e},${yBot - e} L${cut ? xr : xr - e},${yBot - e}${cut ? '' : ` L${xr - e},${top + 2}`}`} fill="none" stroke={MUTE} strokeOpacity={0.45} strokeWidth={Math.max(1.5, ds * S)} strokeLinejoin="round" />}
      {xs.map((x, k) => (
        <circle key={k} cx={x} cy={yBar} r={r} fill={BAD} />
      ))}
      {xs.slice(0, 2).map((x, k) => (
        <line key={`c${k}`} x1={x} x2={x} y1={t3 - 6} y2={yBar} stroke={MUTE} strokeWidth={0.6} strokeDasharray="2 3" />
      ))}
      {/* tier 1: clear distances (Table 6.1) */}
      <Dim x1={x0} x2={xs[0] - r} y={t1} label={`clear cover ${f(g.clearSide, 2)}`} color={GOOD} size={11} />
      {two && xs[1] && <Dim x1={xs[0] + r} x2={xs[1] - r} y={t1} label={`clear spacing ${f(g.clearSpacing, 2)}`} color={GOOD} size={11} />}
      {/* tier 2: centre distances */}
      <Dim x1={x0} x2={xs[0]} y={t2} label={`face → centre ${f(g.cSide, 2)}`} color={g.governs !== 'spacing' ? ACC : MUTE} size={11} />
      {two && xs[1] && <Dim x1={xs[0]} x2={xs[1]} y={t2} label={`c/c ${f(g.spacingCC, 2)}`} color={MUTE} size={11} />}
      {/* tier 3: half spacing */}
      {two && xs[1] && <Dim x1={xs[0]} x2={(xs[0] + xs[1]) / 2} y={t3} label={`½ c/c ${f(g.halfSpacing, 2)}`} color={g.governs === 'spacing' ? ACC : MUTE} size={11} />}
      {/* below the bar: bottom clear cover */}
      <line x1={xs[0]} x2={xs[0]} y1={yBar + r} y2={yBot} stroke={GOOD} strokeWidth={1} markerEnd="url(#bgA)" />
      <text x={xs[0] + 6} y={(yBar + r + yBot) / 2 + 4} fontSize={11} fill={GOOD}>
        clear {f(g.clearFace, 2)}
      </text>
      <text x={x0} y={yBot + 17} fontSize={11} fill={MUTE}>
        b = {fmt(b)} in{cut ? ' (left part shown)' : ''} · cover {fmt(cover)} in{ds > 0 ? ` + stirrup ${fmt(ds)} in` : ''} · {n} bars, db = {f(db)} in
      </text>
      <text x={x0} y={yBot + 33} fontSize={11} fill={ACC}>
        amber = the distance that sets cb = {f(g.cb, 2)} in
      </text>
      <text x={x0} y={16} fontSize={11} fill={GOOD}>
        green = clear (bar surface to surface / to the face) → Table 6.1
      </text>
      <text x={x0} y={32} fontSize={11} fill={MUTE}>
        grey / amber = to bar centres → cb in Eq. 6.4
      </text>
    </svg>
  )
}

const STIRRUP: Record<string, number> = { none: 0, '#3': 0.375, '#4': 0.5 }

export function BarGeoExplainer() {
  const [b, setB] = useState(12)
  const [n, setN] = useState(3)
  const [id, setId] = useState('#8')
  const [cover, setCover] = useState(1.5)
  const [st, setSt] = useState('#3')
  const good = [b, n, cover].every(ok) && b > 0 && n >= 1 && Number.isInteger(n) && cover >= 0
  const br = bar(id)
  const ds = STIRRUP[st]
  const g = good ? beamBarGeometry({ b, cover, ds, db: br.db, n }) : null
  const fits = g && (n === 1 || g.clearSpacing >= Math.max(1, br.db) - 1e-9)
  const cs = g ? simplifiedCase({ db: br.db, clearSpacing: g.clearSpacing, clearCover: g.clearCover, stirrupsMin: ds > 0 }) : null
  const T = ({ children }: { children: string }) => <Tex block>{children}</Tex>
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <NumIn label="b" value={b} onChange={setB} step={1} unit="in" w="w-14" />
        <NumIn label="bars n" value={n} onChange={setN} step={1} w="w-12" />
        <select className="field !py-0.5 !px-1.5 !text-xs" value={id} onChange={(e) => setId(e.target.value)}>
          {[...US_BAR_IDS, ...MM_BAR_IDS].map((x) => (
            <option key={x} value={x}>
              {x.startsWith('#') ? `No. ${x.slice(1)}` : x.replace('mm', ' mm')}
            </option>
          ))}
        </select>
        <NumIn label="clear cover to stirrup" value={cover} onChange={setCover} step={0.25} unit="in" w="w-14" />
        <span className="text-mute">stirrup</span>
        <select className="field !py-0.5 !px-1.5 !text-xs" value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="none">none</option>
          <option value="#3">No. 3</option>
          <option value="#4">No. 4</option>
        </select>
      </div>
      {g && cs ? (
        <>
          <BarGeoFig b={b} cover={cover} ds={ds} db={br.db} n={n} g={g} />
          <div className="text-sm">
            <b>1. Face to bar centre</b>
            <T>{`c_{side} = \\text{cover} + d_s + \\tfrac{d_b}{2} = ${f(cover, 3)} + ${f(ds, 3)} + \\tfrac{${f(br.db, 3)}}{2} = ${f(g.cSide)}\\text{ in}`}</T>
            {n > 1 && (
              <>
                <b>2. Centre-to-centre spacing</b> (n bars leave n − 1 gaps)
                <T>{`s_{c/c} = \\frac{b - 2c_{side}}{n - 1} = \\frac{${fmt(b)} - 2(${f(g.cSide)})}{${n - 1}} = ${f(g.spacingCC)}\\text{ in}`}</T>
                <b>3. Clear spacing</b> = c/c minus one bar diameter
                <T>{`s_{clear} = s_{c/c} - d_b = ${f(g.spacingCC)} - ${f(br.db)} = ${f(g.clearSpacing)}\\text{ in} = ${f(g.clearSpacing / br.db, 2)}\\,d_b`}</T>
                <p className="text-mute text-xs">
                  Same thing in one line: (b − 2(cover + ds) − n·db)/(n − 1).{' '}
                  {fits ? (
                    <span>Fits in one layer (needs ≥ max(1 in, db) = {f(Math.max(1, br.db), 2)} in).</span>
                  ) : (
                    <span className="text-bad">Less than max(1 in, db) = {f(Math.max(1, br.db), 2)} in: these bars do not fit in one layer.</span>
                  )}
                </p>
              </>
            )}
            <b>{n > 1 ? '4' : '2'}. Clear cover</b> = cover + stirrup (to the bar surface)
            <T>{`c_{clear} = ${f(cover, 3)} + ${f(ds, 3)} = ${f(g.clearCover)}\\text{ in} = ${f(g.clearCover / br.db, 2)}\\,d_b`}</T>
            <p>
              <b>Table 6.1:</b> {cs.why}. {br.label} is {br.small ? 'No. 6 or smaller (25 / 50 column)' : 'No. 7 or larger (20 / 40 column)'}.
            </p>
            <b>{n > 1 ? '5' : '3'}. cb for Eq. 6.4</b> (centre distances, not clear)
            <T>{`c_b = \\min(c_{side},\\ c_{bottom},\\ \\tfrac12 s_{c/c}) = \\min(${f(g.cSide)},\\ ${f(g.cFace)}${n > 1 ? `,\\ ${f(g.halfSpacing)}` : ''}) = ${f(g.cb)}\\text{ in}`}</T>
            <p className="text-mute text-xs">
              {g.governs === 'spacing'
                ? 'Half the spacing governs → splitting along the horizontal plane of the bars → every stirrup leg crosses it (Atr = all legs).'
                : 'Cover governs → splitting through the cover (vertical plane) → one stirrup leg crosses it (Atr = one leg).'}
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm text-mute">Enter b, n and cover.</p>
      )}
      <Md className="text-xs">{`**Slab (no stirrups):** bars at spacing $s$ → clear spacing $= s - d_b$, clear cover = the cover ($\\tfrac34$ in), $c_b = \\min(\\text{cover} + d_b/2,\\ s/2)$.`}</Md>
    </div>
  )
}
