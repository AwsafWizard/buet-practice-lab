// Full handnote-style solutions for one-way slabs; every number comes from the engine.
import { Callout, Step, Steps, Tex } from '../../../components/ui'
import { END_LABEL, HMIN_DIV, HMIN_LABEL, type CantSlabResult, type OneWayCoefResult, type SlabLoads } from '../../engine/oneway'
import { AsWork, barTxt, f } from './kit'
import { CantSketch, ContSketch } from './sketch'

export function LoadsWork({ L, h }: { L: SlabLoads; h: number }) {
  return (
    <div className="space-y-0.5">
      {L.given ? (
        <div>Dead load (given, incl. self-weight) = {f(L.D, 1)} psf; live load = {f(L.L)} psf</div>
      ) : (
        <div>
          Self-weight = ({f(h, 2)}/12) × 150 = {f(L.sw, 1)} psf → total DL = {f(L.D, 1)} psf; LL = {f(L.L)} psf
        </div>
      )}
      <Tex>{`w_u = ${L.fD}D + ${L.fL}L = ${L.fD}\\times ${f(L.D, 1)} + ${L.fL}\\times ${f(L.L, 1)} = ${f(L.wD, 1)} + ${f(L.wL, 1)} = ${f(L.wu, 1)}\\text{ psf} = ${f(L.wuk, 3)}\\text{ k/ft per ft strip}`}</Tex>
    </div>
  )
}

const fyF = (fy: number) => (Math.abs(fy - 60000) < 1 ? '' : ` × (0.4 + ${fy}/100 000 = ${f(0.4 + fy / 100000, 3)})`)

export function CoefSolution({ r, sketch = true }: { r: OneWayCoefResult; sketch?: boolean }) {
  const p = r.input
  const shown = r.sections.filter((s) => !s.mirror)
  return (
    <div className="space-y-3 text-sm">
      {r.warnings.map((w) => (
        <Callout key={w} kind="note">
          {w}
        </Callout>
      ))}
      <Steps>
        <Step n={1} title="One-way? Thickness h">
          <div>
            Supported on two opposite sides (strip 12 in wide designed as a beam). Ends: {END_LABEL[p.ends[0]]} / {END_LABEL[p.ends[1]]}.
          </div>
          {r.hmin
            .filter((x, i, a) => a.findIndex((y) => y.rule === x.rule && y.l === x.l) === i)
            .map((x) => (
              <div key={x.span}>
                {x.rule === 'one' ? 'End span' : x.rule === 'both' ? 'Interior span' : 'Single span'} ({HMIN_LABEL[x.rule]}): l/{HMIN_DIV[x.rule]} = {f(x.l)} × 12/{HMIN_DIV[x.rule]}
                {fyF(p.fy)} = {f(x.h, 2)} in
              </div>
            ))}
          <div>
            {r.hGiven ? (
              <>
                h is given = <b>{f(r.h, 2)} in</b> {r.h + 1e-9 < r.hReq ? '(less than the ACI minimum — deflection should be checked)' : '(≥ minimum, OK)'}
              </>
            ) : (
              <>
                Round up (h {'>'} 6 in → next ½ in, else ¼ in): <b>h = {f(r.h, 2)} in</b>
              </>
            )}
            ; d = h − 1 = {f(r.d, 2)} in
          </div>
        </Step>
        <Step n={2} title="Factored load on a 1-ft strip">
          <LoadsWork L={r.loads} h={r.h} />
        </Step>
        <Step n={3} title="Design moments, Mu = C·wu·ln² (ln averaged at interior supports)">
          <table className="tbl w-auto">
            <thead>
              <tr>
                <th>Section</th>
                <th>C</th>
                <th>ln (ft)</th>
                <th>Mu (k-ft/ft)</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id}>
                  <td className="txt">{s.label}</td>
                  <td>
                    {s.kind === 'neg' ? '−' : '+'}1/{s.den}
                  </td>
                  <td>{f(s.ln, 2)}</td>
                  <td>
                    {f(r.loads.wuk, 3)} × {f(s.ln, 2)}² / {s.den} = <b>{f(s.Mu, 2)}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Step>
        <Step n={4} title="Is the depth enough? (εt = 0.005)">
          <Tex>{`\\rho_{0.005} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{0.003}{0.008} = ${f(r.depth.rho005, 4)},\\quad d_{req} = \\sqrt{\\frac{M_u\\times 12}{0.9\\rho f_y b(1 - 0.59\\rho f_y/f'_c)}} = ${f(r.depth.dreq, 2)}\\text{ in} ${r.depth.dreq <= r.d ? '\\le' : '>'} d = ${f(r.d, 2)}`}</Tex>
          <div>{r.depth.dreq <= r.d ? 'OK — tension-controlled.' : 'Not enough: increase h.'}</div>
        </Step>
        <Step n={5} title="Steel at each section (iterate a)">
          {shown.map((s) => (
            <AsWork key={s.id} as={s.as} fy={p.fy} name={s.label} />
          ))}
          <div>
            A<sub>s,min</sub> = {f(r.ts.ratio, 4)} × 12 × {f(r.h, 2)} = <b>{f(r.AsMin, 3)} in²/ft</b> (any section needing less gets this). ε<sub>t</sub> at the largest steel = {f(r.epsT, 4)} ≥ 0.005 → φ = 0.9 OK.
          </div>
        </Step>
        <Step n={6} title={`Bars and spacing (#${r.bar}, s = Ab×12/As, ≤ 3h = ${f(3 * r.h, 2)} and 18 in)`}>
          <table className="tbl w-auto">
            <thead>
              <tr>
                <th>Section</th>
                <th>As req</th>
                <th>As design</th>
                <th>s raw (in)</th>
                <th>bars</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id}>
                  <td className="txt">{s.label}</td>
                  <td>{f(s.as.As, 3)}</td>
                  <td>{f(s.AsD, 3)}</td>
                  <td>{f(s.sp.raw, 2)}</td>
                  <td className="txt">{s.kind === 'pos' ? <b>{barTxt(r.bar, s.sp.s)}</b> : <span className="text-mute">(straight: {barTxt(r.bar, s.sp.s)})</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Step>
        <Step n={7} title="Detailing: alternate bars cranked + extra top (class method)">
          <div className="text-mute">Bottom bars at s, every alternate bar cranked over the supports, so only one cranked bar per 2s width reaches the top; the shortfall is supplied by straight extra top bars.</div>
          {r.supports
            .filter((x) => !x.sec.mirror)
            .map((x) => (
              <div key={x.sec.id}>
                <b>{x.sec.label}</b>: need {f(x.extra.As, 3)} × {f(x.extra.width, 1)}/12 = {f(x.extra.need, 3)} in² in {f(x.extra.width, 1)} in; cranked bar gives {f(x.extra.cranked, 2)} → extra {f(x.extra.extra, 3)} in² = {f(x.extra.nRaw, 2)} bars → <b>{x.extra.n} extra #{r.bar}</b>
                <span className="text-mute">
                  {' '}
                  · spacing form: {f(x.extra.As, 3)} − {f((x.extra.cranked * 12) / x.extra.s, 3)}/2 = {f(x.extra.AsExtraFt, 3)} in²/ft → {x.extra.sExtra ? barTxt(r.bar, x.extra.sExtra) + ' extra top' : 'cranked bars suffice'}
                </span>
              </div>
            ))}
          {!r.supports.length && <div>No calculated negative moment (unrestrained ends): the cranked bars give nominal top steel at the walls.</div>}
          <div>
            Temperature & shrinkage bars ⊥ main bars: A<sub>s</sub> = {f(r.ts.As, 3)} in²/ft → s = 0.11 × 12/{f(r.ts.As, 3)} = {f(r.ts.raw, 2)} in (max 5h or 18 = {f(r.ts.smax, 2)}) → <b>{barTxt(3, r.ts.s)}</b>
          </div>
          <div className="text-mute">Cranked bars bend up at ≈ ln/7 from an unrestrained end and ln/4 from a continuous support; extra top bars run ln/3 into each span from the face.</div>
          <div className="text-mute">Straight-bar alternative: bottom bars straight at the spacings above, top bars over each support at their own (straight) spacing in the table.</div>
        </Step>
        <Step n={8} title="Shear check">
          <Tex>{`V_u = ${f(r.shear.c, 2)}\\frac{w_ul_n}{2} - w_u d = ${f(r.shear.c, 2)}\\times\\frac{${f(r.loads.wuk, 3)}\\times ${f(p.spans[r.shear.span], 2)}}{2} - ${f(r.loads.wuk, 3)}\\times\\frac{${f(r.d, 2)}}{12} = ${f(r.shear.Vd, 2)}\\text{ k}`}</Tex>
          <Tex>{`\\phi V_c = 0.75\\times 2\\sqrt{${p.fc}}\\times 12\\times ${f(r.d, 2)}/1000 = ${f(r.shear.phiVc, 2)}\\text{ k} ${r.shear.ok ? '>' : '<'} V_u`}</Tex>
          <div>{r.shear.ok ? 'OK — no shear reinforcement (slabs almost never need it).' : 'Not OK — increase h.'}</div>
        </Step>
      </Steps>
      <div className="rounded-xl border border-line p-3">
        <div className="font-bold mb-1">Final reinforcement (h = {f(r.h, 2)} in)</div>
        <ul className="list-disc pl-5 space-y-0.5">
          {r.spanBars
            .map((s, j) => ({ s, j }))
            .filter(({ j }) => !r.sections.find((x) => x.id === `p${j}`)!.mirror)
            .map(({ s, j }) => (
              <li key={j}>
                {barTxt(r.bar, s.s)} bottom, alternate bars cranked — {r.sections.find((x) => x.id === `p${j}`)!.label}
              </li>
            ))}
          {r.supports
            .filter((x) => !x.sec.mirror)
            .map((x) => (
              <li key={x.sec.id}>{x.extra.n ? `${x.extra.n} #${r.bar} extra top between alternate cranked bars` : 'cranked bars alone are enough'} — {x.sec.label}</li>
            ))}
          <li>{barTxt(3, r.ts.s)} temperature & shrinkage (distribution) bars perpendicular to the main bars</li>
        </ul>
      </div>
      {sketch && (
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <ContSketch r={r} />
        </div>
      )}
    </div>
  )
}

export function CantSolution({ r, sketch = true }: { r: CantSlabResult; sketch?: boolean }) {
  const p = r.input
  const g = r.geo
  const two = r.nC === 2
  const sym = two && Math.abs(p.cantL - p.cantR) < 1e-9
  const a = Math.max(p.cantL, p.cantR)
  const ac = Math.max(g.acL, g.acR)
  const { wDk, wuk } = r.loads
  return (
    <div className="space-y-3 text-sm">
      <Steps>
        <Step n={1} title="Structure and thickness">
          <div>
            Supported on two opposite edges with overhang{two ? 's on both sides' : ' on one side'} → one-way; design a 12-in strip as a beam with overhang(s). Coefficients do not apply: use statics with live-load patterns.
          </div>
          <div>
            Span (overhang acts like continuity on {two ? 'both ends' : 'one end'}): l/{HMIN_DIV[r.spanRule]} = {f(p.span)} × 12/{HMIN_DIV[r.spanRule]}
            {fyF(p.fy)} = {f(r.hSpan, 2)} in; cantilever l/10 = {f(a)} × 12/10{fyF(p.fy)} = {f(r.hCant, 2)} in
          </div>
          <div>
            {r.hGiven ? (
              <>
                h given = <b>{f(r.h, 2)} in</b>
              </>
            ) : (
              <>
                Use the larger, rounded up: <b>h = {f(r.h, 2)} in</b>
              </>
            )}
            ; d = h − 1 = {f(r.d, 2)} in
          </div>
        </Step>
        <Step n={2} title="Factored loads and geometry">
          <LoadsWork L={r.loads} h={r.h} />
          <div>
            L (c/c of supports) = {f(p.span)} + {f(p.support / 12, 2)} = {f(g.L, 2)} ft; cantilever to support centre = {f(ac, 2)} ft, to the face = {f(a, 2)} ft; w<sub>D</sub> = 1.2D = {f(wDk, 3)} k/ft
          </div>
        </Step>
        <Step n={3} title="Maximum NEGATIVE moment — LL on the cantilever">
          <Tex>{`-M_u = \\frac{w_u a^2}{2} = \\frac{${f(wuk, 3)}\\times ${f(a, 2)}^2}{2} = ${f(r.Mneg, 2)}\\text{ k-ft/ft (at the support face)}`}</Tex>
          {two && !sym && <div>Other cantilever: {f(Math.min(r.MnegL, r.MnegR), 2)} k-ft/ft (the larger governs the top steel).</div>}
          <div className="text-mute">A cantilever is statically determinate: only the load on it matters, so LL must be ON the cantilever.</div>
        </Step>
        <Step n={4} title="Maximum POSITIVE moment — LL on the span only, cantilever(s) with DL only">
          {sym ? (
            <>
              <Tex>{`\\frac{w_uL^2}{8} = \\frac{${f(wuk, 3)}\\times ${f(g.L, 2)}^2}{8} = ${f(r.simple, 2)};\\quad \\text{relief} = \\frac{1.2w_D a_c^2}{2} = \\frac{${f(wDk, 3)}\\times ${f(g.acL, 2)}^2}{2} = ${f(r.reliefSym, 2)}`}</Tex>
              <Tex>{`+M_u = ${f(r.simple, 2)} - ${f(r.reliefSym, 2)} = ${f(r.Mpos, 2)}\\text{ k-ft/ft}`}</Tex>
            </>
          ) : r.nC === 1 ? (
            <>
              <div>
                Moment at the overhang support (DL only on the cantilever) = {f(wDk, 3)} × {f(ac, 2)}²/2 = {f(r.Mc, 2)} k-ft
              </div>
              <Tex>{`R_{far} = \\frac{w_uL}{2} - \\frac{M}{L} = ${f((wuk * g.L) / 2, 3)} - \\frac{${f(r.Mc, 2)}}{${f(g.L, 2)}} = ${f(p.cantL > 0 ? r.patterns.span.RB : r.patterns.span.RA, 3)}\\text{ k};\\quad +M_u = \\frac{R^2}{2w_u} = ${f(r.Mpos, 2)}\\text{ k-ft/ft}`}</Tex>
            </>
          ) : (
            <div>
              Statics with both (unequal) overhangs on DL: R<sub>A</sub> = {f(r.patterns.span.RA, 3)} k, zero shear at x = {f(r.patterns.span.xm, 2)} ft → <b>+M<sub>u</sub> = {f(r.Mpos, 2)} k-ft/ft</b>
            </div>
          )}
          <div className="mt-1">
            <b>Uplift check</b> (DL only on the span, full load on the cantilever{two ? 's' : ''}):{' '}
            {sym ? (
              <Tex>{`M_{mid} = \\frac{1.2w_DL^2}{8} - \\frac{w_ua_c^2}{2} = ${f((wDk * g.L * g.L) / 8, 2)} - ${f((wuk * ac * ac) / 2, 2)} = ${f(r.uplift.Mmid, 2)}\\text{ k-ft}`}</Tex>
            ) : (
              <span>
                R<sub>A</sub> = {f(r.uplift.RA, 3)} k, R<sub>B</sub> = {f(r.uplift.RB, 3)} k; largest span moment = {f(r.uplift.Mmax, 2)} k-ft
              </span>
            )}
          </div>
          <div>
            {r.uplift.negThrough
              ? 'The span moment becomes NEGATIVE under this pattern → run top steel (at least As,min) through the whole span.'
              : `Span moment stays positive in the middle → top bars extend ≈ ${f(r.topExt, 2)} ft into the span (≥ ln/3 and ≥ the cantilever length).`}
            {Math.min(r.uplift.RA, r.uplift.RB) < 0 && ' A support reaction turns negative: anchor the slab against uplift there.'}
          </div>
        </Step>
        <Step n={5} title="Depth check">
          <Tex>{`\\rho_{0.005} = ${f(r.depth.rho005, 4)};\\ d_{req} = ${f(r.depth.dreq, 2)}\\text{ in} ${r.depth.dreq <= r.d ? '\\le' : '>'} d = ${f(r.d, 2)}\\text{ in}`}</Tex>
        </Step>
        <Step n={6} title="Steel">
          <AsWork as={r.asPos} fy={p.fy} name="Positive (bottom, span)" />
          <AsWork as={r.asNeg} fy={p.fy} name="Negative (top, support & cantilever)" />
          <div>
            A<sub>s,min</sub> = {f(r.ts.ratio, 4)} × 12 × {f(r.h, 2)} = {f(r.AsMin, 3)} in²/ft
          </div>
        </Step>
        <Step n={7} title="Bars, spacing and cranked-bar detailing">
          <div>
            Positive: s = Ab × 12/As = {f(r.pos.raw * r.pos.As / 12, 2)} × 12/{f(r.pos.As, 3)} with #{r.bar}: {f(r.pos.raw, 2)} in → <b>{barTxt(r.bar, r.pos.s)}</b> (alternate bars cranked into the cantilever top)
            {r.bar > 3 && ' — #3 would need s below ≈ 4.5 in'}
          </div>
          <div>
            Top at support: in {f(r.extra.width, 1)} in need {f(r.extra.As, 3)} × {f(r.extra.width, 1)}/12 = {f(r.extra.need, 3)} in²; one cranked bar = {f(r.extra.cranked, 2)} → extra {f(r.extra.extra, 3)} in² = {f(r.extra.nRaw, 2)} bars → <b>{r.extra.n} extra #{r.bar}</b>
            <span className="text-mute"> · spacing form: {r.extra.sExtra ? barTxt(r.bar, r.extra.sExtra) + ' extra top' : 'cranked bars suffice'}</span>
          </div>
          <div>
            Straight-bar alternative: top bars <b>{barTxt(r.bar, r.straight.s)}</b> over the support and the full cantilever.
          </div>
          <div>
            T&S bars: {f(r.ts.As, 3)} in²/ft → <b>{barTxt(3, r.ts.s)}</b> (≤ 5h, 18 in), bottom in the span, top in the cantilever.
          </div>
        </Step>
        <Step n={8} title="Shear check">
          <Tex>{`\\text{cantilever: } V_u = w_u(a - d) = ${f(wuk, 3)}(${f(a, 2)} - ${f(r.d / 12, 3)}) = ${f(r.shear.Vcant, 2)}\\text{ k};\\quad \\text{span: } V_u \\approx \\frac{w_uL}{2} + \\frac{M}{L} = ${f(r.shear.Vspan, 2)}\\text{ k}`}</Tex>
          <Tex>{`\\phi V_c = 0.75\\times 2\\sqrt{${p.fc}}\\times 12\\times ${f(r.d, 2)}/1000 = ${f(r.shear.phiVc, 2)}\\text{ k} \\Rightarrow ${r.shear.ok ? '\\text{OK}' : '\\text{NOT OK}'}`}</Tex>
        </Step>
      </Steps>
      <div className="rounded-xl border border-line p-3">
        <div className="font-bold mb-1">Final reinforcement (h = {f(r.h, 2)} in)</div>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>(a) {barTxt(r.bar, r.pos.s)} bottom in the span, alternate bars cranked up over the support(s) and carried to the free end of the cantilever</li>
          <li>(b) {r.extra.n ? `${r.extra.n} #${r.bar} extra top between alternate cranked bars over each cantilever support, through the cantilever and ≥ ${f(r.topExt, 1)} ft into the span` : 'no extra top bars needed — cranked bars are enough'}</li>
          <li>(c) {barTxt(3, r.ts.s)} temperature & shrinkage bars perpendicular to the main bars</li>
          {r.uplift.negThrough && <li>(d) top bars (at least As,min: {barTxt(3, r.ts.s)}) continued through the span because of the possible negative moment</li>}
        </ul>
      </div>
      {sketch && (
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <CantSketch r={r} pattern="span" />
        </div>
      )}
    </div>
  )
}
