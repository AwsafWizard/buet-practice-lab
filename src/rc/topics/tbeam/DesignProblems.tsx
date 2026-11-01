// T-beam "Design problems" (top of the Lab tab): floor system → beff, loads, Mu → As, bars, εt (+ support section).
import { Tex } from '../../../components/ui'
import { BARS } from '../../engine/materials'
import { aciMoment } from '../../engine/tbeam'
import { f } from '../doubly/kit'
import { makeTDesign, T_FAMILIES, type TProblem } from './design'
import { DesignProblems } from './designShell'
import { BeffSolution, FloorSolution, RectDesignSolution, TDesignSolution, TSketch } from './solve'

function FloorFig({ p }: { p: TProblem }) {
  const { g } = p
  const W = 560,
    H = 190
  const sc = Math.min(4, 150 / g.h)
  const sPx = 170
  const x0 = 110
  const yTop = 22
  const hfPx = Math.max(8, g.hf * sc)
  const hPx = g.h * sc
  const bwPx = Math.max(14, Math.min(60, g.bw * sc))
  const webs = [x0, x0 + sPx, x0 + 2 * sPx]
  const ink = 'var(--c-ink)',
    mute = 'var(--c-mute)'
  // elevation strip
  const n = g.nSpans ?? 1
  const eY = H - 22,
    eX0 = 20,
    eW = 120
  const span = (i: number) => (n === 1 ? true : p.g.span === 'end' ? i === 0 : i === Math.floor(n / 2))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 220 }}>
      <rect x={x0 - sPx / 2 - 30} y={yTop} width={2 * sPx + sPx + 60} height={hfPx} fill="var(--c-panel2)" stroke={ink} />
      {webs.map((x) => (
        <rect key={x} x={x - bwPx / 2} y={yTop + hfPx} width={bwPx} height={hPx - hfPx} fill="var(--c-panel2)" stroke={ink} />
      ))}
      {/* spacing */}
      <line x1={webs[0]} x2={webs[1]} y1={yTop - 8} y2={yTop - 8} stroke={mute} />
      <text x={(webs[0] + webs[1]) / 2} y={yTop - 11} fontSize={11} textAnchor="middle" fill={mute}>
        {g.s} ft c/c
      </text>
      <text x={webs[2] + sPx / 2 + 32} y={yTop + hfPx / 2 + 4} fontSize={11} fill={mute} textAnchor="end">
        hf = {g.hf}″
      </text>
      <text x={webs[1]} y={yTop + hPx + 14} fontSize={11} textAnchor="middle" fill={mute}>
        bw = {g.bw}″
      </text>
      <line x1={webs[2] + bwPx / 2 + 8} x2={webs[2] + bwPx / 2 + 8} y1={yTop} y2={yTop + hPx} stroke={mute} />
      <text x={webs[2] + bwPx / 2 + 12} y={yTop + hPx / 2} fontSize={11} fill={mute}>
        h = {g.h}″
      </text>
      <text x={webs[1]} y={yTop + hfPx + 14} fontSize={10} textAnchor="middle" fill="var(--c-accent)">
        interior beam
      </text>
      {/* elevation */}
      <text x={eX0} y={eY - 14} fontSize={10} fill={mute}>
        {p.family === 'continuous' ? `elevation: ${n} spans × ${g.Lcc} ft c/c, columns ${g.col}″` : `elevation: simple span ${g.L} ft${p.family === 'girder' ? `, girder at midspan (${g.PD}D + ${g.PL}L k)` : ''}`}
      </text>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <line x1={eX0 + i * eW} x2={eX0 + (i + 1) * eW} y1={eY} y2={eY} stroke={span(i) ? 'var(--c-accent)' : ink} strokeWidth={span(i) ? 4 : 2} />
          <path d={`M${eX0 + i * eW},${eY + 2} l-6,10 h12 z`} fill="none" stroke={ink} />
        </g>
      ))}
      <path d={`M${eX0 + n * eW},${eY + 2} l-6,10 h12 z`} fill="none" stroke={ink} />
      {p.family === 'girder' && <line x1={eX0 + eW / 2} x2={eX0 + eW / 2} y1={eY - 24} y2={eY - 4} stroke="var(--c-load, #f59e0b)" strokeWidth={2} />}
    </svg>
  )
}

function Solution({ p }: { p: TProblem }) {
  const { g, mid, sup } = p
  const Ab = BARS[g.bar].A
  const Mw = aciMoment(p.fl.wu, g.L, p.coefPos)
  return (
    <div className="space-y-3 text-sm">
      <BeffSolution inp={p.beffIn} out={p.beff} />
      <FloorSolution p={{ hf: g.hf, spacing: g.s, bw: g.bw, h: g.h, sdl: g.sdl, ll: g.ll }} o={p.fl} L={g.L} coefLabel={p.coefPosLabel} coef={p.coefPos} Mu={Mw} />
      {p.family === 'continuous' && <p>ACI coefficients ({g.span} span, ℓn = {f(g.L, 2)} ft): +M {f(p.coefPos, 4)} at midspan, −M {f(p.coefNeg, 4)} at the {g.span === 'end' ? 'first interior' : 'interior'} support.</p>}
      {p.family === 'girder' && (
        <Tex block>{`P_u = 1.2(${g.PD}) + 1.6(${g.PL}) = ${f(p.Pu, 2)}\\text{ k},\\quad M_u = \\frac{w_u\\ell^2}{8} + \\frac{P_u\\ell}{4} = ${f(Mw, 1)} + \\frac{${f(p.Pu, 2)}(${g.L})}{4} = ${f(mid.Mu, 1)}\\text{ k-ft}`}</Tex>
      )}
      {sup && <Tex block>{`M_u^- = ${p.coefNegLabel}\\,w_u\\ell_n^2 = ${f(p.coefNeg, 4)}(${f(p.fl.wu, 3)})(${f(g.L, 2)})^2 = ${f(sup.Mu, 1)}\\text{ k-ft}`}</Tex>}
      <div className="font-bold">Midspan section (d = {f(mid.d)} in{mid.layers === 2 ? `, dt = ${f(mid.dt)} in` : ''})</div>
      <TDesignSolution inp={{ Mu: mid.Mu, beff: p.beff.b, bw: g.bw, hf: g.hf, d: mid.d, dt: mid.dt, fc: g.fc, fy: g.fy }} r={mid.des} />
      <p>
        <b>Bars:</b> n = max(As, As,min)/Ab = {f(Math.max(mid.des.As, mid.des.AsMin), 3)}/{f(Ab, 2)} → <b>{mid.n} No. {g.bar}</b> (As = {f(mid.As, 2)} in²){mid.layers === 2 ? `, ${Math.ceil(mid.n / 2)} per layer in two layers` : ', one layer fits in bw'}.
      </p>
      <p>
        Check with the bars provided: {mid.rev.rect ? 'a ≤ hf (rectangular)' : 'true T'}, a = {f(mid.rev.a, 3)} in, c = {f(mid.rev.c, 3)} in, εt = {f(mid.rev.epsT, 5)} → φ = {f(mid.rev.phi, 3)}, φMn = {f(mid.rev.phiMn, 1)} k-ft ≥ Mu = {f(mid.Mu, 1)} ✓
      </p>
      <TSketch beff={p.beff.b} bw={g.bw} hf={g.hf} d={mid.d} dt={mid.dt} a={mid.rev.a} c={mid.rev.c} nBars={mid.n} />
      {sup && (
        <>
          <div className="font-bold">
            Support section: flange in tension → rectangle {g.bw} × {f(sup.d)} in (dt = {f(sup.dt)} in)
          </div>
          <RectDesignSolution Mu={sup.Mu} b={g.bw} d={sup.d} dt={sup.dt} fy={g.fy} r={sup.des} />
          <p>
            <b>Top bars:</b> {f(Math.max(sup.des.As, sup.des.AsMin), 3)}/{f(BARS[g.supBar!].A, 2)} → <b>{sup.n} No. {g.supBar}</b> in two layers (As = {f(sup.As, 2)} in²); εt = {f(sup.rev.epsT, 5)}, φ = {f(sup.rev.phi, 3)}, φMn = {f(sup.rev.phiMn, 1)} k-ft ≥ {f(sup.Mu, 1)} ✓
          </p>
          <TSketch beff={p.beff.b} bw={g.bw} hf={g.hf} d={sup.d} dt={sup.dt} a={sup.rev.a} c={sup.rev.c} nBars={sup.n} support />
        </>
      )}
    </div>
  )
}

export function TBeamDesign() {
  return (
    <DesignProblems
      topic="rc-tbeam"
      families={T_FAMILIES}
      make={makeTDesign}
      figure={(p) => <FloorFig p={p} />}
      solution={(p) => <Solution p={p} />}
      foot="Interior beam, beff by ACI 318-14 (16hf + bw, ℓ/4 + bw, c/c spacing). Answers within 2 %; bar counts exact."
    />
  )
}
