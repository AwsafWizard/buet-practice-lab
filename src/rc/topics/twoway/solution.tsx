// Full handnote-style solution for a two-way panel (coefficient method); every number from the engine.
import { Callout, Step, Steps, Tex } from '../../../components/ui'
import { CASE_TEXT, type TwoWayResult } from '../../engine/twoway'
import { AsWork, barTxt, f } from '../oneway/kit'
import { LoadsWork } from '../oneway/solution'
import { PanelPlan } from './plan'

const c4 = (v: number | null) => (v === null ? '–' : f(v, 4))

export function TwoWaySolution({ r, plan = true }: { r: TwoWayResult; plan?: boolean }) {
  const p = r.input
  const g = r.geo
  const { la, lb } = g
  const L = r.loads
  const bar = r.bar
  const C = r.C
  const ex = r.extra
  const extraLine = (name: string, e: typeof ex.aNeg) =>
    e && (
      <div>
        {name}: need {f(e.As, 3)} × {f(e.width, 1)}/12 = {f(e.need, 3)} in² in {f(e.width, 1)} in; cranked gives {f(e.cranked, 2)} → {f(Math.max(0, e.nRaw), 2)} bars → <b>{e.n ? `${e.n} extra #${bar}` : 'cranked bars alone are enough'}</b>
        <span className="text-mute"> · spacing form: {e.sExtra ? `${barTxt(bar, e.sExtra)} extra top` : 'none needed'}</span>
      </div>
    )
  const exterior = r.corner.corners.map(([a, b]) => `${a}-${b}`).join(', ')
  return (
    <div className="space-y-3 text-sm">
      {g.oneWay && <Callout kind="trap">lb/la = {f(g.ratio, 2)} ≥ 2 → this panel is really ONE-WAY; the tables stop at m = 0.5 (values below use m = 0.5).</Callout>}
      <Steps>
        <Step n={1} title="Classify the panel">
          <div>
            Clear spans: l<sub>a</sub> (short) = {f(la, 2)} ft, l<sub>b</sub> (long) = {f(lb, 2)} ft → l<sub>b</sub>/l<sub>a</sub> = {f(g.ratio, 2)} {g.oneWay ? '≥' : '<'} 2 → <b>{g.oneWay ? 'one-way' : 'two-way'}</b>; m = l<sub>a</sub>/l<sub>b</sub> = <b>{f(r.m, 3)}</b>
            {Math.abs(r.m * 20 - Math.round(r.m * 20)) > 1e-6 ? ' (between table rows → interpolate linearly)' : ''}
          </div>
          <div>
            Continuous long edges: {g.nLong}, continuous short edges: {g.nShort} → <b>Case {r.case}</b>: {CASE_TEXT[r.case]}.
          </div>
        </Step>
        <Step n={2} title="Thickness (stiff beams, αm > 2)">
          {r.hGiven ? (
            <div>
              h is given = <b>{f(r.h, 2)} in</b> (formula would give {f(r.th.raw, 2)} in)
            </div>
          ) : (
            <>
              <Tex>{`h = \\frac{l_n(0.8 + f_y/200{,}000)}{36 + 9\\beta} = \\frac{${f(lb, 2)}\\times 12\\,(0.8 + ${p.fy}/200{,}000)}{36 + 9\\times ${f(r.th.beta, 3)}} = ${f(r.th.raw, 2)}\\text{ in}\\ (\\ge 3.5)`}</Tex>
              <div>
                (Old method: perimeter/180 = 2({f(la, 1)} + {f(lb, 1)}) × 12/180 = {f(r.th.perim, 2)} in) → <b>use h = {f(r.h, 2)} in</b>
              </div>
            </>
          )}
          <div>
            d (short direction, lower layer) = h − 1 = {f(r.d.short, 2)} in; d (long-direction positive bars on top) = {f(r.d.long, 2)} in; top bars d = {f(r.d.top, 2)} in
          </div>
        </Step>
        <Step n={3} title="Loads">
          <LoadsWork L={L} h={r.h} />
          <div>
            w<sub>D,u</sub> = {f(L.wDk, 3)}, w<sub>L,u</sub> = {f(L.wLk, 3)}, w<sub>u</sub> = {f(L.wuk, 3)} k/ft²
          </div>
        </Step>
        <Step n={4} title="Moments in the MIDDLE strip (k-ft per ft)">
          <div className="text-mute">Negative at continuous edges — Table 12.3 with the TOTAL load:</div>
          <div>{r.M.aNeg !== null ? <Tex>{`M_{a,neg} = ${c4(C.aNeg)}\\times ${f(L.wuk, 3)}\\times ${f(la, 2)}^2 = ${f(r.M.aNeg, 2)}`}</Tex> : 'Ma,neg: no continuous long edge'}</div>
          <div>{r.M.bNeg !== null ? <Tex>{`M_{b,neg} = ${c4(C.bNeg)}\\times ${f(L.wuk, 3)}\\times ${f(lb, 2)}^2 = ${f(r.M.bNeg, 2)}`}</Tex> : 'Mb,neg: no continuous short edge'}</div>
          <div className="text-mute mt-1">Positive — Table 12.4 (factored DL) + Table 12.5 (factored LL), separately:</div>
          <Tex>{`M_{a,pos} = ${c4(C.aDL)}\\times ${f(L.wDk, 3)}\\times ${f(la, 2)}^2 + ${c4(C.aLL)}\\times ${f(L.wLk, 3)}\\times ${f(la, 2)}^2 = ${f(r.M.aPosDL, 2)} + ${f(r.M.aPosLL, 2)} = ${f(r.M.aPos, 2)}`}</Tex>
          <Tex>{`M_{b,pos} = ${c4(C.bDL)}\\times ${f(L.wDk, 3)}\\times ${f(lb, 2)}^2 + ${c4(C.bLL)}\\times ${f(L.wLk, 3)}\\times ${f(lb, 2)}^2 = ${f(r.M.bPosDL, 2)} + ${f(r.M.bPosLL, 2)} = ${f(r.M.bPos, 2)}`}</Tex>
          <div className="text-mute mt-1">Negative at DISCONTINUOUS edges = ⅓ × positive:</div>
          <div>
            {r.M.aDisc !== null && (
              <>
                M<sub>a,neg,disc</sub> = {f(r.M.aPos, 2)}/3 = {f(r.M.aDisc, 2)}
              </>
            )}
            {r.M.aDisc !== null && r.M.bDisc !== null && ' ; '}
            {r.M.bDisc !== null && (
              <>
                M<sub>b,neg,disc</sub> = {f(r.M.bPos, 2)}/3 = {f(r.M.bDisc, 2)}
              </>
            )}
            {r.M.aDisc === null && r.M.bDisc === null && 'none (all edges continuous)'}
          </div>
        </Step>
        <Step n={5} title="Depth check">
          <Tex>{`M_{max} = ${f(r.Mmax, 2)};\\ \\rho_{0.005} = ${f(r.depth.rho005, 4)};\\ d_{req} = ${f(r.depth.dreq, 2)}\\text{ in} ${r.depth.dreq <= r.d.short ? '\\le' : '>'} d = ${f(r.d.short, 2)}\\text{ in}`}</Tex>
        </Step>
        <Step n={6} title="Steel areas (b = 12 in)">
          {r.steel.map((s) => (
            <AsWork key={s.key} as={s.as} fy={p.fy} name={s.label} />
          ))}
          <div>
            A<sub>s,min</sub> = {f(r.AsMin / 12 / r.h, 4)} × 12 × {f(r.h, 2)} = <b>{f(r.AsMin, 3)} in²/ft</b>; max spacing = 2h = {f(r.smax, 2)} in (≤ 18 in)
          </div>
        </Step>
        <Step n={7} title="Middle-strip bars (alternate cranked) + extra top">
          <div>
            SHORT direction positive: s = {f(r.midA.raw, 2)} in (As = {f(r.midA.As, 3)}) → <b>{barTxt(bar, r.midA.s)} alt ckd</b> (lower layer)
          </div>
          {extraLine('— continuous edge', ex.aNeg)}
          {extraLine('— discontinuous edge (As,min governs)', ex.aDisc)}
          <div className="mt-1">
            LONG direction positive: s = {f(r.midB.raw, 2)} in (As = {f(r.midB.As, 3)}) → <b>{barTxt(bar, r.midB.s)} alt ckd</b> (on top of the short bars)
          </div>
          {extraLine('— continuous edge', ex.bNeg)}
          {extraLine('— discontinuous edge (As,min governs)', ex.bDisc)}
        </Step>
        <Step n={8} title="Column strips (outer quarters)">
          <div className="text-mute">Moment falls from the full value to ⅓ at the edge (average ≈ ⅔), so spacing = 1.5 × middle-strip spacing, but ≤ 2h and not less steel than As,min.</div>
          <div>
            SHORT: 1.5 × {f(r.midA.s, 1)} = {f(r.col.a.s15, 2)} in; As,min limit {f(r.col.a.sMin, 2)} in; 2h = {f(r.col.a.s2h, 2)} in → <b>{barTxt(bar, r.col.a.s)} (alt ckd)</b>
          </div>
          <div>
            LONG: 1.5 × {f(r.midB.s, 1)} = {f(r.col.b.s15, 2)} in; As,min limit {f(r.col.b.sMin, 2)} in; 2h = {f(r.col.b.s2h, 2)} in → <b>{barTxt(bar, r.col.b.s)} (alt ckd)</b>
          </div>
          {r.colTop.a && (
            <div>
              Column-strip top at the continuous long edge: ⅔ × {f(r.st.aNeg!.as.As, 3)} = {f(r.colTop.a.As23, 3)} → {f(r.colTop.a.As, 3)} in²/ft {r.colTop.a.As23 < r.AsMin ? '(As,min governs)' : ''} → {r.colTop.a.extra.n} extra #{bar} per {f(r.colTop.a.extra.width, 1)} in
            </div>
          )}
          {r.colTop.b && (
            <div>
              Column-strip top at the continuous short edge: ⅔ × {f(r.st.bNeg!.as.As, 3)} = {f(r.colTop.b.As23, 3)} → {f(r.colTop.b.As, 3)} in²/ft {r.colTop.b.As23 < r.AsMin ? '(As,min governs)' : ''} → {r.colTop.b.extra.n} extra #{bar} per {f(r.colTop.b.extra.width, 1)} in
            </div>
          )}
          <div className="text-mute">
            Strips: short-way bars — middle strip {f(r.strips.aMid, 2)} ft, column strips {f(r.strips.aCol, 2)} ft each; long-way bars — middle {f(r.strips.bMid, 2)} ft, column {f(r.strips.bCol, 2)} ft.
          </div>
        </Step>
        <Step n={9} title="Corner reinforcement (exterior corners)">
          {r.corner.corners.length ? (
            <div>
              Exterior corner(s): {exterior}. Steel = that for the max positive moment = {f(r.corner.As, 3)} in²/ft → <b>{barTxt(bar, r.corner.sp.s)}</b>, TOP and BOTTOM, both directions (bands parallel to the edges), over l<sub>b</sub>/5 = {f(lb, 2)}/5 = <b>{f(r.corner.zone, 2)} ft</b> from the corner each way.
            </div>
          ) : (
            <div>No exterior corner (no two discontinuous edges meet) → no special corner steel.</div>
          )}
        </Step>
        <Step n={10} title="Load on the supporting beams and shear (Table 12.6)">
          <Tex>{`W_a = ${f(r.beams.Wa, 3)},\\ W_b = ${f(r.beams.Wb, 3)};\\ W = w_ul_al_b = ${f(L.wuk, 3)}\\times ${f(la, 2)}\\times ${f(lb, 2)} = ${f(r.beams.W, 1)}\\text{ k}`}</Tex>
          <Tex>{`\\text{each long beam: } \\frac{W_aW}{2l_b} = ${f(r.beams.wLongBeam, 2)}\\text{ k/ft};\\quad \\text{each short beam: } \\frac{W_bW}{2l_a} = ${f(r.beams.wShortBeam, 2)}\\text{ k/ft}`}</Tex>
          <Tex>{`V_u \\le ${f(r.shear.Vu, 2)}\\text{ k/ft} ${r.shear.ok ? '<' : '>'} \\phi V_c = 0.75\\times 2\\sqrt{${p.fc}}\\times 12\\times ${f(r.shear.d, 2)}/1000 = ${f(r.shear.phiVc, 2)}\\text{ k}`}</Tex>
          <div className="text-mute">(The class answer for the lecture panel used d = 6.5 in → φVc = {f(r.shear.phiVc65, 2)} k; either way two-way slabs on stiff beams almost never fail in shear.)</div>
        </Step>
      </Steps>
      <div className="rounded-xl border border-line p-3">
        <div className="font-bold mb-1">Final reinforcement legend (h = {f(r.h, 2)} in)</div>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>SHORT dir — {barTxt(bar, r.midA.s)} bottom, alternate bars cranked (middle strip), LOWER layer</li>
          {ex.aNeg && <li>SHORT dir — continuous edge: {ex.aNeg.n ? `${ex.aNeg.n} #${bar} extra top between alt cranked bars` : 'cranked bars alone are enough'}</li>}
          {ex.aDisc && <li>SHORT dir — discontinuous edge: {ex.aDisc.n ? `${ex.aDisc.n} #${bar} extra top between alt cranked bars` : 'cranked bars alone are enough'}</li>}
          <li>LONG dir — {barTxt(bar, r.midB.s)} bottom, alternate bars cranked (middle strip), on top of the short bars</li>
          {ex.bNeg && <li>LONG dir — continuous edge: {ex.bNeg.n ? `${ex.bNeg.n} #${bar} extra top between alt cranked bars` : 'cranked bars alone are enough'}</li>}
          {ex.bDisc && <li>LONG dir — discontinuous edge: {ex.bDisc.n ? `${ex.bDisc.n} #${bar} extra top between alt cranked bars` : 'cranked bars alone are enough'}</li>}
          <li>Column strips — short dir {barTxt(bar, r.col.a.s)}, long dir {barTxt(bar, r.col.b.s)} bottom, alt cranked; extra top at continuous edges as in Step 8</li>
          {r.corner.corners.length > 0 && (
            <li>
              Corner steel — {barTxt(bar, r.corner.sp.s)} top & bottom, both ways, over {f(r.corner.zone, 1)} ft × {f(r.corner.zone, 1)} ft at each exterior corner
            </li>
          )}
          <li>
            Bend points: l/4 from a continuous edge, l/7 from a discontinuous edge (short way {f(r.cutoffs.a.bendCont, 2)} / {f(r.cutoffs.a.bendDisc, 2)} ft, long way {f(r.cutoffs.b.bendCont, 2)} / {f(r.cutoffs.b.bendDisc, 2)} ft); top bars extend l/3 past the face ({f(r.cutoffs.a.topExt, 2)} ft short, {f(r.cutoffs.b.topExt, 2)} ft long).
          </li>
          <li className="text-mute">
            Straight-bar alternative: straight bottom bars; top bars at continuous edges {r.straight.aNeg ? barTxt(bar, r.straight.aNeg.s) : '—'} (short) / {r.straight.bNeg ? barTxt(bar, r.straight.bNeg.s) : '—'} (long); discontinuous edges at the As,min spacing; binder bars where no bar crosses.
          </li>
        </ul>
        <div className="text-xs text-faint mt-1">Temperature steel is automatically satisfied because both directions carry at least As,min.</div>
      </div>
      {plan && (
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <PanelPlan lx={p.lx} ly={p.ly} edges={p.edges} r={r} />
        </div>
      )}
    </div>
  )
}
