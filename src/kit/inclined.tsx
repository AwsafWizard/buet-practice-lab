// Inclined frame members: separate AFD / SFD / BMD per member plus the hand calculation behind every value.

import { useMemo } from 'react'
import type { DiagramMember } from '../engine/diagrams'
import type { Result } from '../engine/frame2d'
import { inclinedWork, type Cut, type Force, type InclinedWork } from '../engine/inclined'
import type { Model } from '../engine/model'
import { DiagramView, fmt, type DiagramKind } from '../components/DiagramView'
import { Tex } from '../components/ui'

const par = (v: number) => (v < 0 ? `(${fmt(v)})` : fmt(v))
const dirX = (v: number) => (v > 0 ? '\\rightarrow' : v < 0 ? '\\leftarrow' : '')
const dirY = (v: number) => (v > 0 ? '\\uparrow' : v < 0 ? '\\downarrow' : '')

export function InclinedMembers({ model, r, dms, ids, unit, lenUnit, mu }: { model: Model; r: Result; dms: DiagramMember[]; ids: string[]; unit: string; lenUnit: string; mu: string }) {
  const works = useMemo(() => ids.map((id) => inclinedWork(model, r, id)), [model, r, ids])
  const lu = lenUnit === ' m' ? 'm' : 'ft'
  return (
    <div className="space-y-3">
      <h4 className="font-bold">3 · Inclined members — AFD, SFD, BMD with the working</h4>
      <p className="text-sm text-mute">
        Every inclined member is read <b>bottom → top</b>, like the diagrams. Forces are first taken in global components (H → +, V ↑ +, couples ↺ +); at each section the sums are resolved <b>along</b> the member (axial N, tension +) and <b>across</b> it (shear V, + towards the left of the walking direction). Moments are taken about the section using horizontal / vertical lever arms; M + = tension on the right-hand side as you walk from the bottom end to the top end (the plotted sign).
      </p>
      {works.map((w) => (
        <MemberWork key={w.id} w={w} dm={dms.find((d) => d.id === w.id)!} model={model} unit={unit} lu={lu} mu={mu} lenUnit={lenUnit} />
      ))}
    </div>
  )
}

function MemberWork({ w, dm, model, unit, lu, mu, lenUnit }: { w: InclinedWork; dm: DiagramMember; model: Model; unit: string; lu: string; mu: string; lenUnit: string }) {
  const S = w.start
  const E = w.end
  const sub = useMemo<Model>(() => {
    const ns = model.nodes.filter((n) => n.id === S || n.id === E)
    return { nodes: ns, members: [{ id: w.id, i: S, j: E }], supports: model.supports.filter((q) => q.node === S || q.node === E), loads: [] }
  }, [model, w.id, S, E])
  // section names: nodes at the ends, numbered points in between
  const inner = [...new Set(w.cuts.map((c) => c.t).filter((t) => t > 1e-9 && t < w.L - 1e-9))]
  const name = (c: Cut) => {
    const base = c.t < 1e-9 ? S : c.t > w.L - 1e-9 ? E : String(inner.findIndex((t) => Math.abs(t - c.t) < 1e-9) + 1)
    const both = w.cuts.filter((k) => Math.abs(k.t - c.t) < 1e-9).length > 1
    return both ? `${base}^{${c.side < 0 ? '-' : '+'}}` : base
  }
  const peakName = (i: number) => `\\text{max}${w.peaks.length > 1 ? `_${i + 1}` : ''}`
  const loadText = (f: Force) => {
    if (f.what === 'dist')
      return `Distributed load from ${fmt(f.from!)} to ${fmt(f.to!)} ${lu} along ${S}${E}: resultant ${fmt(Math.hypot(f.fx, f.fy))} ${unit} (H = ${fmt(f.fx)}, V = ${fmt(f.fy)}) acting ${fmt(f.t)} ${lu} from ${S}`
    const parts = [Math.hypot(f.fx, f.fy) > 1e-9 ? `${fmt(Math.hypot(f.fx, f.fy))} ${unit} (H = ${fmt(f.fx)}, V = ${fmt(f.fy)})` : '', f.m ? `couple ${fmt(f.m)} ${mu} (↺ +)` : ''].filter(Boolean)
    return `Point load ${fmt(f.t)} ${lu} from ${S}: ${parts.join(', ')}`
  }
  const kinds: DiagramKind[] = ['N', 'V', 'M']
  return (
    <details open className="rounded-xl border border-line p-3">
      <summary className="cursor-pointer font-semibold">
        Member {S}{E} — inclined at {fmt(w.deg, 1)}° to the horizontal (read {S} → {E})
      </summary>
      <div className="mt-2 grid cq-sm:grid-cols-3 gap-2">
        {kinds.map((k) => (
          <div key={k} className="rounded-lg bg-bg/60 border border-line p-1">
            <div className="text-xs text-mute font-semibold px-1">{k === 'N' ? 'AFD' : k === 'V' ? 'SFD' : 'BMD'} of {S}{E}</div>
            <DiagramView model={sub} members={[dm]} kind={k} maxHeight={330} pad={76} lenUnit={lenUnit} forceUnit={unit} freeEnds={false} />
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div>
          <b>(a) Geometry.</b>
          <Tex block>{`\\Delta x = ${fmt(w.dx)},\\quad \\Delta y = ${fmt(w.dy)},\\quad L = \\sqrt{${par(w.dx)}^2 + ${fmt(w.dy)}^2} = ${fmt(w.L)}\\text{ ${lu}}`}</Tex>
          <Tex block>{`\\cos\\alpha = \\frac{\\Delta x}{L} = ${fmt(w.c, 4)},\\qquad \\sin\\alpha = \\frac{\\Delta y}{L} = ${fmt(w.s, 4)}`}</Tex>
          <p className="text-xs text-faint">α is the direction {S} → {E} measured from +x{w.c < 0 ? ` (the member leans left, so cos α is negative: α = 180° − ${fmt(w.deg, 1)}°)` : ''}.</p>
        </div>

        <div>
          <b>(b) Forces on the member at {S}.</b>{' '}
          {w.fromSupport ? (
            <span>
              {S} is a support and only {S}{E} meets it, so these are the support reactions.
            </span>
          ) : (
            <span>
              From the free body of joint {S}: what the rest of the frame (supports, other members, joint loads) passes into {S}{E}.
            </span>
          )}
          <Tex block>{`H_{${S}} = ${fmt(Math.abs(w.F0.fx))}\\text{ ${unit}}\\ ${dirX(w.F0.fx)},\\qquad V_{${S}} = ${fmt(Math.abs(w.F0.fy))}\\text{ ${unit}}\\ ${dirY(w.F0.fy)}${w.F0.m ? `,\\qquad M_{${S}} = ${fmt(Math.abs(w.F0.m))}\\ ${w.F0.m > 0 ? '\\circlearrowleft' : '\\circlearrowright'}` : ''}`}</Tex>
        </div>

        <div>
          <b>(c) Loads on {S}{E}</b> (global components, H → +, V ↑ +):
          {w.loads.length ? (
            <ul className="list-disc pl-5">
              {w.loads.map((f, i) => (
                <li key={i}>{loadText(f)}</li>
              ))}
            </ul>
          ) : (
            <span> none — N and V are constant and M is linear.</span>
          )}
        </div>

        <div>
          <b>(d) Resolve and take moments at each section</b> (forces between {S} and the section):
          <Tex block>{`N = -\\left(\\Sigma H\\cos\\alpha + \\Sigma V\\sin\\alpha\\right),\\qquad V = -\\Sigma H\\sin\\alpha + \\Sigma V\\cos\\alpha`}</Tex>
          <Tex block>{`M_P = \\sum \\big[F_{y}\\,(x_P - x_k) - F_{x}\\,(y_P - y_k)\\big] - \\sum C_{\\circlearrowleft}`}</Tex>
          <div className="space-y-2 mt-1">
            {w.cuts.map((c, i) => (
              <CutWork key={i} c={c} name={name(c)} w={w} unit={unit} lu={lu} prev={w.cuts[i - 1]} />
            ))}
            {w.peaks.map((c, i) => (
              <div key={`p${i}`} className="rounded-lg border border-line px-3 py-2">
                <div className="text-xs font-semibold text-mute">
                  Max moment where V = 0 inside the distributed load: {fmt(c.t)} {lu} from {S}
                </div>
                <Tex block>{`${peakName(i)}:\\quad \\Sigma H = ${fmt(c.H)},\\ \\Sigma V = ${fmt(c.V)}\\ \\Rightarrow\\ V = 0,\\quad M = ${momentTerms(c)} = \\mathbf{${fmt(c.M)}}`}</Tex>
              </div>
            ))}
          </div>
        </div>

        <table className="tbl mt-2">
          <thead>
            <tr>
              <th>Section</th>
              <th>from {S} ({lu})</th>
              <th>ΣH</th>
              <th>ΣV</th>
              <th>N ({unit})</th>
              <th>V ({unit})</th>
              <th>M ({mu})</th>
            </tr>
          </thead>
          <tbody>
            {[...w.cuts, ...w.peaks].map((c, i) => (
              <tr key={i}>
                <td className="txt">
                  <Tex>{i < w.cuts.length ? name(c) : peakName(i - w.cuts.length)}</Tex>
                </td>
                <td>{fmt(c.t)}</td>
                <td>{fmt(c.H)}</td>
                <td>{fmt(c.V)}</td>
                <td>{fmt(c.N)}</td>
                <td>{fmt(c.Vs)}</td>
                <td>{fmt(c.M)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-faint">
          Check: M is 0 wherever {S} or {E} is a pin, internal hinge or free end; at a rigid joint the end moment of {S}{E} balances the moments of the other members meeting there.
        </p>
      </div>
    </details>
  )
}

function momentTerms(c: Cut) {
  const terms: string[] = []
  for (const f of c.forces) {
    const dx = c.x - f.x
    const dy = c.y - f.y
    if (Math.abs(f.fy) > 1e-9 && Math.abs(dx) > 1e-9) terms.push(`${par(f.fy)}(${fmt(dx)})`)
    if (Math.abs(f.fx) > 1e-9 && Math.abs(dy) > 1e-9) terms.push(`-${par(f.fx)}(${fmt(dy)})`)
    if (Math.abs(f.m) > 1e-9) terms.push(`-${par(f.m)}`)
  }
  if (!terms.length) return '0'
  return terms.map((t, i) => (i === 0 || t.startsWith('-') ? t : `+${t}`)).join(' ')
}

/** "a + b = total", or just the total when there is nothing to add up */
const sumOf = (terms: string[], total: number, bold = false) => {
  const tot = bold ? `\\mathbf{${fmt(total)}}` : fmt(total)
  const expr = terms.join(' + ')
  return terms.length === 0 || (terms.length === 1 && (expr === fmt(total) || expr === '0')) ? tot : `${expr} = ${tot}`
}

function CutWork({ c, name, w, unit, lu, prev }: { c: Cut; name: string; w: InclinedWork; unit: string; lu: string; prev?: Cut }) {
  const sumH = c.forces.filter((f) => Math.abs(f.fx) > 1e-9).map((f) => par(f.fx))
  const sumV = c.forces.filter((f) => Math.abs(f.fy) > 1e-9).map((f) => par(f.fy))
  const sameM = prev && Math.abs(prev.t - c.t) < 1e-9 && Math.abs(prev.M - c.M) < 1e-9
  const where = c.t < 1e-9 ? `just past ${w.start}` : c.t > w.L - 1e-9 ? `just before ${w.end}` : `${fmt(c.t)} ${lu} from ${w.start}, just ${c.side < 0 ? 'before' : 'after'} the load`
  return (
    <div className="rounded-lg border border-line px-3 py-2">
      <div className="text-xs font-semibold text-mute">
        Section <Tex>{name}</Tex> — {where} (x = {fmt(c.x)}, y = {fmt(c.y)})
      </div>
      <Tex block>{`\\Sigma H = ${sumOf(sumH, c.H)},\\qquad \\Sigma V = ${sumOf(sumV, c.V)}`}</Tex>
      <Tex block>{`N = -\\big[${par(c.H)}(${fmt(w.c, 4)}) + ${par(c.V)}(${fmt(w.s, 4)})\\big] = \\mathbf{${fmt(c.N)}\\text{ ${unit}}}\\ (${c.N > 1e-9 ? '\\text{T}' : c.N < -1e-9 ? '\\text{C}' : '0'}),\\qquad V = -${par(c.H)}(${fmt(w.s, 4)}) + ${par(c.V)}(${fmt(w.c, 4)}) = \\mathbf{${fmt(c.Vs)}\\text{ ${unit}}}`}</Tex>
      {sameM ? (
        <Tex block>{`M_{${name}} = M \\text{ just before} = ${fmt(c.M)}`}</Tex>
      ) : (
        <Tex block>{`M_{${name}} = ${sumOf([momentTerms(c)], c.M, true)}`}</Tex>
      )}
    </div>
  )
}
