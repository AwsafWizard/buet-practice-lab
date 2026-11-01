// Bond "Design problems" (top of the Lab tab): bars → ld → cut-off / hook in column / lap splice.
import { fmt } from '../../../components/DiagramView'
import { Tex } from '../../../components/ui'
import { simpleCoefTex } from '../../engine/bond'
import { DesignProblems } from '../tbeam/designShell'
import { B_FAMILIES, makeBDesign, type BProblem } from './design'
import { AnchorSketch, CutoffSketch, LapSketch } from './figs'

const f = (v: number, d = 2) => fmt(v, d)

function Elevation({ p }: { p: BProblem }) {
  const W = 560,
    H = 130
  const cant = p.family === 'cantilever'
  const x0 = cant ? 90 : 50
  const x1 = W - 40
  const y = 66
  const X = (ft: number) => x0 + ((x1 - x0) * ft) / p.L
  const ink = 'var(--c-ink)',
    mute = 'var(--c-mute)',
    load = 'var(--c-load, #f59e0b)'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 170 }}>
      <rect x={x0} y={y - 28} width={x1 - x0} height={9} fill={load} fillOpacity={0.25} stroke={load} />
      <text x={x1} y={y - 32} fontSize={10.5} textAnchor="end" fill={mute}>
        wD = {p.wD}, wL = {p.wL} k/ft
      </text>
      <rect x={x0} y={y - 12} width={x1 - x0} height={22} fill="var(--c-panel2)" stroke={ink} />
      <line x1={x0 + 3} x2={x1 - 4} y1={cant ? y - 7 : y + 5} y2={cant ? y - 7 : y + 5} stroke="var(--c-accent)" strokeWidth={2} />
      {cant ? (
        <>
          <rect x={x0 - 40} y={y - 46} width={40} height={90} fill="var(--c-panel2)" stroke={ink} />
          <text x={x0 - 20} y={y + 56} fontSize={10} textAnchor="middle" fill={mute}>
            col {p.col}″
          </text>
          {p.PD > 0 && (
            <>
              <line x1={x1} x2={x1} y1={y - 52} y2={y - 14} stroke={load} strokeWidth={2} />
              <text x={x1 - 4} y={y - 44} fontSize={10} textAnchor="end" fill={ink}>
                {p.PD}D + {p.PL}L k
              </text>
            </>
          )}
        </>
      ) : (
        <>
          <path d={`M${x0},${y + 10} l-7,12 h14 z`} fill="none" stroke={ink} />
          <path d={`M${x1},${y + 10} l-7,12 h14 z`} fill="none" stroke={ink} />
        </>
      )}
      {p.family === 'splice' && p.xs != null && (
        <g>
          <line x1={X(p.xs)} x2={X(p.xs)} y1={y - 16} y2={y + 26} stroke="var(--c-bad)" strokeDasharray="4 3" />
          <text x={X(p.xs)} y={y + 36} fontSize={10} textAnchor="middle" fill="var(--c-bad)">
            splice at {p.xs} ft
          </text>
        </g>
      )}
      <line x1={x0} x2={x1} y1={H - 10} y2={H - 10} stroke={mute} />
      <text x={(x0 + x1) / 2} y={H - 14} fontSize={10.5} textAnchor="middle" fill={mute}>
        {p.L} ft · section {p.b}″ × {p.h}″ · {p.ld.top ? 'top' : 'bottom'} bars {p.br.label}
      </text>
    </svg>
  )
}

function LdSolution({ p }: { p: BProblem }) {
  const { ld, br } = p
  const g = ld.geo
  return (
    <div className="space-y-1">
      <p>
        Bars {br.label} (db = {f(br.db, 3)} in): edge to bar centre = 1.5 + 0.375 + db/2 = {f(g.cSide, 3)} in, c/c spacing = {f(g.spacingCC, 3)} in, clear spacing = {f(g.clearSpacing, 3)} in, clear cover = {f(g.clearCover, 3)} in. ψt = {ld.psiT}
        {ld.top ? ' (top bars: more than 12 in of concrete below)' : ''}, ψe = 1, λ = 1.
      </p>
      {ld.method === 'simplified' ? (
        <>
          <p>{ld.why}.</p>
          <Tex block>{`\\frac{\\ell_d}{d_b} = ${simpleCoefTex(br.small, !!ld.met)}\\frac{f_y\\psi_t\\psi_e}{\\lambda\\sqrt{f'_c}} = ${f(ld.r.ratio, 2)}\\ \\Rightarrow\\ \\ell_d = ${f(ld.r.ratio, 2)}(${f(br.db, 3)}) = ${f(ld.r.ld0, 2)}\\text{ in}${ld.r.minGoverns ? '\\to 12\\text{ in (min)}' : ''}`}</Tex>
        </>
      ) : (
        <>
          <Tex block>{`c_b = \\min(${f(g.cSide, 3)},\\ ${f(g.cFace, 3)},\\ ${f(g.halfSpacing, 3)}) = ${f(g.cb, 3)}\\text{ in},\\quad K_{tr} = \\frac{40A_{tr}}{sn} = \\frac{40(0.22)}{${ld.sStir}(${p.n})} = ${f(ld.Ktr!, 3)}`}</Tex>
          <Tex block>{`\\frac{c_b + K_{tr}}{d_b} = ${f((ld.r as { conf: number }).conf, 3)}${(ld.r as { capped: boolean }).capped ? '\\to 2.5' : ''},\\quad \\ell_d = \\frac{3}{40}\\frac{f_y}{\\lambda\\sqrt{f'_c}}\\frac{\\psi_t\\psi_e\\psi_s}{(c_b + K_{tr})/d_b}d_b = ${f(ld.r.ld0, 2)}\\text{ in}`}</Tex>
        </>
      )}
      <p>
        <b>ld = {f(ld.r.final, 1)} in</b> (round up: {Math.ceil(ld.r.final - 1e-6)} in).
      </p>
    </div>
  )
}

function Solution({ p }: { p: BProblem }) {
  const co = p.co
  return (
    <div className="space-y-3 text-sm">
      <div className="font-bold">1. Bars</div>
      <Tex block>{`w_u = 1.2(${p.wD}) + 1.6(${p.wL}) = ${f(p.wu, 3)}\\text{ k/ft}${p.Pu ? `,\\ P_u = ${f(p.Pu, 2)}\\text{ k}` : ''},\\quad M_u = ${p.family === 'cantilever' ? `\\frac{w_uL^2}{2}${p.Pu ? ' + P_uL' : ''}` : '\\frac{w_uL^2}{8}'} = ${f(p.Mu, 1)}\\text{ k-ft}`}</Tex>
      <p>
        d = {p.d} in: As = {f(p.des.As, 3)} in² (a = {f(p.des.a, 3)} in, φ = {f(p.des.phi, 3)}), As,min = {f(p.des.AsMin, 2)} in² → <b>{p.n} {p.br.label}</b> ({f(p.n * p.br.Ab, 2)} in², one layer).
      </p>
      <div className="font-bold">2. Development length</div>
      <LdSolution p={p} />
      {p.family === 'splice' && (
        <>
          <div className="font-bold">3. Splice {p.xs} ft from the support</div>
          <Tex block>{`M_u(x) = \\frac{w_ux(L - x)}{2} = \\frac{${f(p.wu, 3)}(${p.xs})(${p.L} - ${p.xs})}{2} = ${f(p.Mx!, 1)}\\text{ k-ft}\\ \\Rightarrow\\ A_{s,req} = ${f(p.AsX!, 3)}\\text{ in}^2`}</Tex>
          <p>
            As,prov/As,req = {f(p.n * p.br.Ab, 2)}/{f(p.AsX!, 3)} = {f(p.ratio!, 2)}; {p.pct}% of the bars spliced → {p.cls!.why}.
          </p>
          <Tex block>{`\\ell_{st} = ${p.lap!.k}\\ell_d = ${p.lap!.k}(${f(p.ld.r.ld0, 2)}) = ${f(p.lap!.lst, 2)}\\text{ in}${p.lap!.minGoverns ? '\\to 12\\text{ in}' : ''}`}</Tex>
          <LapSketch lst={p.lap!.final} label={`Class ${p.cls!.cls}: ${Math.ceil(p.lap!.final - 1e-6)} in`} />
        </>
      )}
      {p.family === 'cantilever' && p.anch && (
        <>
          <div className="font-bold">3. Anchorage in the column</div>
          <p>
            Available = column depth − far cover = {p.col} − {p.backCover} = {f(p.anch.available, 1)} in. Straight ld = {f(p.ld.r.final, 1)} in → {p.anch.straightOK ? 'fits ✓' : 'does not fit ✗ → hook'}.
          </p>
          <p>
            {p.hf!.cNote}; {p.hf!.rNote}.
          </p>
          <Tex block>{`\\ell_{dh} = \\frac{f_y\\psi_e\\psi_c\\psi_r}{50\\lambda\\sqrt{f'_c}}d_b = \\frac{${p.fy}(1)(${p.hf!.psiC})(${p.hf!.psiR})}{50\\sqrt{${p.fc}}}(${f(p.br.db, 3)}) = ${f(p.ldh!.ld, 2)}\\text{ in},\\ \\ge \\max(8d_b, 6) = ${f(p.ldh!.min, 2)}\\ \\Rightarrow\\ ${f(p.ldh!.final, 2)}\\text{ in}`}</Tex>
          <p>
            Hook {p.anch.hookOK ? 'fits ✓' : 'does not fit ✗'}; least column depth = ldh + {p.backCover} = <b>{f(p.anch.minColumn, 1)} in</b>. Hook detail: 90° bend, inside diameter {p.hookGeo!.Dk}db = {f(p.hookGeo!.D, 2)} in, tail {p.hookGeo!.tailText} = {f(p.hookGeo!.tail, 2)} in.
          </p>
          <AnchorSketch colDepth={p.col!} backCover={p.backCover!} req={p.anch.straightOK ? p.ld.r.final : p.ldh!.final} kind={p.anch.straightOK ? 'straight' : 'hook'} db={p.br.db} ok={p.anch.straightOK || p.anch.hookOK} tail={p.hookGeo!.tail} />
        </>
      )}
      {co && p.dg && (
        <>
          <div className="font-bold">{p.family === 'cantilever' ? '4' : '3'}. Cut-off of {p.nCut} bar{p.nCut! > 1 ? 's' : ''}</div>
          <p>
            φMn with all {p.n} bars = {f(co.all.phiMn, 1)} k-ft ≥ Mu ✓. Continuing {p.n - p.nCut!} bars: φMn = {f(co.remain.phiMn, 1)} k-ft (a = {f(co.remain.a, 3)} in, φ = {f(co.remain.phi, 3)}).
          </p>
          <p>
            Theoretical cut-off where Mu = {f(co.remain.phiMn, 1)} k-ft: <b>{f(co.xTheo, 2)} ft</b> from the {p.family === 'cantilever' ? 'column face' : 'support face'}. Extension max(d, 12db) = max({p.d}, {f(12 * p.br.db, 2)}) = {f(co.ext, 2)} in ({co.extGov}).
          </p>
          <p>
            {p.family === 'cantilever'
              ? `Cut bars need ld = ${f(p.ld.r.final, 1)} in from the face (max stress): xCut = max(xTheo + ext, ld) = ${f(co.xCut, 2)} ft${co.ldGoverns ? ' (ld governs)' : ''}.`
              : `Cut bars need ld = ${f(p.ld.r.final, 1)} in from midspan (max stress): xCut = min(xTheo − ext, L/2 − ld) = ${f(co.xCut, 2)} ft${co.ldGoverns ? ' (ld governs)' : ''}.`}{' '}
            <b>Cut at {f(co.xCut, 2)} ft</b> from the face.
          </p>
          <p>
            Continuing bars: length available beyond the theoretical point = {f(co.availCont, 1)} in {co.contOK ? '≥' : '<'} ld → {co.contOK ? 'OK ✓' : 'not enough ✗ (hook or more embedment)'}.
          </p>
          {co.ssCheck && (
            <Tex block>{`1.3\\frac{M_n}{V_u} + \\ell_a = 1.3\\frac{${f(co.ssCheck.Mn, 1)}(12)}{${f(co.ssCheck.Vu, 2)}} + ${co.ssCheck.la} = ${f(co.ssCheck.limit, 1)}\\text{ in}\\ ${co.ssCheck.ok ? '\\ge' : '<'}\\ \\ell_d = ${f(p.ld.r.final, 1)}\\ ${co.ssCheck.ok ? '✓' : '✗'}`}</Tex>
          )}
          <CutoffSketch dg={p.dg} r={co} nTotal={p.n} nCut={p.nCut!} ldIn={p.ld.r.final} />
        </>
      )}
    </div>
  )
}

export function BondDesignProblems() {
  return (
    <DesignProblems
      topic="rc-bond"
      families={B_FAMILIES}
      make={makeBDesign}
      figure={(p) => <Elevation p={p} />}
      solution={(p) => <Solution p={p} />}
      foot="Lengths ld, ldh, lst within 5 % (the class rounds up to the inch); cut-off points within 0.05 ft. Distances from the support / column face."
    />
  )
}
