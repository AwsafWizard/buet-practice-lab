// Full written solution of a wall problem, every number from solveWall.
import { fmt } from '../../../components/DiagramView'
import { Tex } from '../../../components/ui'
import type { Piece, Wall, WallResult } from '../../engine/earth'
import { GW } from '../../engine/units'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

export const stateName = (s: Wall['state']) => (s === 'rest' ? 'at rest' : s)

export function kFormula(w: Wall, i: number, K: number) {
  const l = w.layers[i]
  if (w.state === 'rest') return `K_{0,${i + 1}} = ${f3(K)}`
  if (l.phi === 0) return `K_{${w.state === 'active' ? 'a' : 'p'},${i + 1}} = 1\\ (\\varphi = 0)`
  return w.state === 'active' ? `K_{a${w.layers.length > 1 ? i + 1 : ''}} = \\tan^2(45 - ${fmt(l.phi / 2, 2)}) = ${f3(K)}` : `K_{p${w.layers.length > 1 ? i + 1 : ''}} = \\tan^2(45 + ${fmt(l.phi / 2, 2)}) = ${f3(K)}`
}

export function PiecesTable({ pieces, title }: { pieces: Piece[]; title?: string }) {
  const F = pieces.reduce((s, p) => s + p.F, 0),
    M = pieces.reduce((s, p) => s + p.M, 0)
  return (
    <div className="overflow-x-auto">
      {title && <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">{title}</div>}
      <table className="tbl w-auto text-sm">
        <thead>
          <tr>
            <th>Piece</th>
            <th>Shape</th>
            <th>Force calc</th>
            <th>F (kN/m)</th>
            <th>Arm above base (m)</th>
            <th>M (kN·m/m)</th>
          </tr>
        </thead>
        <tbody>
          {pieces.map((p, i) => (
            <tr key={i}>
              <td className="txt">{p.label}</td>
              <td className="txt">{p.shape === 'rect' ? 'rectangle' : 'triangle'}</td>
              <td className="txt num">
                {p.shape === 'rect' ? '' : '½ × '}
                {f2(Math.abs(p.base))} × {f2(p.z2 - p.z1)}
              </td>
              <td>{f2(p.F)}</td>
              <td>{f3(p.arm)}</td>
              <td>{f2(p.M)}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="txt">Total</td>
            <td />
            <td />
            <td>{f2(F)}</td>
            <td>{Math.abs(F) > 1e-9 ? f3(M / F) : '—'}</td>
            <td>{f2(M)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function OrdinateTable({ w, r }: { w: Wall; r: WallResult }) {
  const cohHead = w.state === 'active' ? '−2c√K' : w.state === 'passive' ? '+2c√K' : null
  return (
    <div className="overflow-x-auto">
      <table className="tbl w-auto text-sm">
        <thead>
          <tr>
            <th>z (m)</th>
            <th>layer</th>
            <th>σ′0 = σv − u</th>
            <th>K</th>
            <th>σ′0K</th>
            {cohHead && <th>{cohHead}</th>}
            {w.q > 0 && <th>qK</th>}
            <th>σ′h</th>
            <th>u</th>
          </tr>
        </thead>
        <tbody>
          {r.ords.map((o, i) => (
            <tr key={i}>
              <td className="txt num">
                {f2(o.z)}
                {r.ords.filter((x) => Math.abs(x.z - o.z) < 1e-9).length > 1 ? (o.at === 'bot' ? ' (just above)' : ' (just below)') : ''}
              </td>
              <td>{o.layer + 1}</td>
              <td>{w.layers[o.layer].total ? `${f2(o.sv)} (total)` : f2(o.svP)}</td>
              <td>{f3(o.K)}</td>
              <td>{f2(o.soil)}</td>
              {cohHead && <td>{f2(o.coh)}</td>}
              {w.q > 0 && <td>{f2(o.sur)}</td>}
              <td className={o.earth < 0 ? 'text-bad' : ''}>{f2(o.earth)}</td>
              <td>{f2(o.water)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function WallSolution({ w, r }: { w: Wall; r: WallResult }) {
  const zw = w.zw !== null && w.zw < r.H ? w.zw : null
  return (
    <div className="space-y-3 text-sm">
      <p>
        <b>1. Coefficients ({stateName(w.state)}).</b>
      </p>
      {r.K.map((K, i) => (
        <Tex key={i} block>
          {kFormula(w, i, K)}
        </Tex>
      ))}
      <p>
        <b>2. Key depths</b>: top, {w.layers.length > 1 ? 'each interface, ' : ''}
        {zw !== null ? `the water table (${f2(zw)} m), ` : ''}base ({f2(r.H)} m). σ′0 adds γh above the WT and γ′h = (γsat − {GW})h below it
        {w.q > 0 ? `, starting from q = ${f2(w.q)} kPa` : ''}. Water pressure u = {GW} × (depth below the WT) with K = 1.
      </p>
      <OrdinateTable w={w} r={r} />
      {r.tension.length > 0 && (
        <div>
          <p>
            <b>3. Tension crack.</b> σ′h is negative from {r.tension.map((t) => `${f2(t.from)} to ${f2(t.to)} m`).join(' and ')}. Soil cannot carry tension, so a crack opens; the design (after-crack) force drops the negative zone.
          </p>
          {r.zc !== null && w.layers[0].c > 0 && (
            <Tex block>{`z_c = \\frac{2c/\\sqrt{K_a} - q}{\\gamma} = \\frac{2(${f2(w.layers[0].c)})/${f3(Math.sqrt(r.K[0]))} - ${f2(w.q)}}{${f2(w.layers[0].gamma)}} = ${f2(r.zc)}\\ \\text{m}`}</Tex>
          )}
          {r.zc !== null && zw !== null && zw < r.zc && <p className="text-xs text-faint">The WT lies inside the crack zone, so the formula above is only a first guess; the table gives the zero point.</p>}
        </div>
      )}
      <p>
        <b>{r.tension.length ? 4 : 3}. Pieces</b> (rectangle: b·h at h/2 above its bottom; triangle: ½b·h at h/3 above its bottom){r.front ? '; passive in front subtracted' : ''}.
      </p>
      <PiecesTable pieces={r.pieces} />
      {r.tension.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-accent">Before the crack (tension zone kept): F = {f2(r.Fbefore)} kN/m at {f2(r.zbarBefore)} m</summary>
          <PiecesTable pieces={r.piecesBefore.filter((p) => p.kind !== 'passive')} />
        </details>
      )}
      <p>
        <b>Result.</b> {r.front ? `Driving thrust ${f2(r.Fdrive)} kN/m, passive resistance ${f2(r.front.P)} kN/m at ${f2(r.front.arm)} m. ` : ''}
        {w.state === 'passive' ? 'Total passive force' : 'Sliding force'} F<sub>s</sub> = <b>{f2(r.Fs)} kN/m</b>, overturning moment about the base M<sub>OT</sub> = <b>{f2(r.MOT)} kN·m/m</b>, resultant at z̄ = M/F = <b>{f2(r.zbar)} m</b> above the base.
        {r.waterF > 0 && ` Water alone is ${f2(r.waterF)} kN/m (${fmt((100 * r.waterF) / r.Fdrive, 0)} % of the driving thrust).`}
      </p>
    </div>
  )
}
