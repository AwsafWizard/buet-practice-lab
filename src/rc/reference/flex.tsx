// CE 315 code pane — flexure (B): Graph A.1, WSD T-beam formulas, effective flange width, A′s yield check, step checklists.
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md, Seg } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { minDepthForYield, reviewDoubly } from '../engine/doubly'
import { rhoLimits } from '../engine/materials'
import { effectiveWidth, wsdT, type FlangeKind } from '../engine/tbeam'
import { useUsed, type RcRefItem } from './pane'

// ---------------------------------------------------------------- Graph A.1
const FYS = [40, 50, 60] as const
const FCS = [3, 4, 5, 6] as const
const FY_COL: Record<number, string> = { 40: '#60a5fa', 50: '#a78bfa', 60: '#f59e0b', 75: '#f87171' }

/** R = ρ fy (1 − 0.59 ρ fy / f'c), psi (fy, f'c in ksi) */
export const Rof = (rho: number, fc: number, fy: number) => rho * fy * 1000 * (1 - (0.59 * rho * fy) / fc)
/** inverse: ρ = (0.85 f'c / fy)(1 − √(1 − 2R / 0.85f'c)), R in psi */
export const rhoOfR = (R: number, fc: number, fy: number) => {
  const disc = 1 - (2 * R) / (0.85 * fc * 1000)
  return disc < 0 ? NaN : ((0.85 * fc) / fy) * (1 - Math.sqrt(disc))
}

function GraphA1Chart({ hl, point }: { hl?: { fc: number; fy: number }; point?: { rho: number; R: number } }) {
  const W = 420,
    H = 260,
    L = 44,
    B = 30,
    T = 10,
    Rr = 12
  const xm = 0.045,
    ym = 1500
  const X = (r: number) => L + (r / xm) * (W - L - Rr)
  const Y = (R: number) => H - B - (R / ym) * (H - B - T)
  const curves: { fc: number; fy: number }[] = FYS.flatMap((fy) => FCS.map((fc) => ({ fc, fy })))
  if (hl && !curves.some((c) => c.fc === hl.fc && c.fy === hl.fy)) curves.push(hl)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 300, 600, 900, 1200, 1500].map((R) => (
        <g key={R}>
          <line x1={L} x2={W - Rr} y1={Y(R)} y2={Y(R)} stroke="var(--c-line)" strokeOpacity={0.6} />
          <text x={L - 4} y={Y(R) + 3} fontSize={9} textAnchor="end" fill="var(--c-faint)" className="num">
            {R}
          </text>
        </g>
      ))}
      {[0, 0.01, 0.02, 0.03, 0.04].map((r) => (
        <g key={r}>
          <line x1={X(r)} x2={X(r)} y1={T} y2={H - B} stroke="var(--c-line)" strokeOpacity={0.4} />
          <text x={X(r)} y={H - B + 12} fontSize={9} textAnchor="middle" fill="var(--c-faint)" className="num">
            {r}
          </text>
        </g>
      ))}
      <text x={(L + W) / 2} y={H - 4} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        ρ = As / bd
      </text>
      <text x={10} y={H / 2} fontSize={10} textAnchor="middle" fill="var(--c-mute)" transform={`rotate(-90 10 ${H / 2})`}>
        R = Mn/bd² (psi)
      </text>
      {curves.map(({ fc, fy }) => {
        const lim = rhoLimits(fc * 1000, fy * 1000)
        const n = 40
        const pts = Array.from({ length: n + 1 }, (_, i) => {
          const r = (lim.rhoMax * i) / n
          return `${i ? 'L' : 'M'}${X(r).toFixed(1)},${Y(Rof(r, fc, fy)).toFixed(1)}`
        }).join(' ')
        const isHl = hl && hl.fc === fc && hl.fy === fy
        const col = FY_COL[fy] ?? 'var(--c-accent)'
        return (
          <g key={`${fy}/${fc}`} opacity={hl && !isHl ? 0.35 : 1}>
            <path d={pts} fill="none" stroke={isHl ? 'var(--c-accent)' : col} strokeWidth={isHl ? 2.6 : 1.3} strokeOpacity={isHl ? 1 : 0.55 + fc * 0.07} />
            <circle cx={X(lim.rho005)} cy={Y(Rof(lim.rho005, fc, fy))} r={isHl ? 3 : 2} fill={isHl ? 'var(--c-accent)' : col} data-tip={`fy/f′c ${fy}/${fc}: εt = 0.005 at ρ = ${fmt(lim.rho005, 5)}, R = ${fmt(Rof(lim.rho005, fc, fy), 4)}`} />
            <line x1={X(lim.rhoMax)} x2={X(lim.rhoMax)} y1={Y(Rof(lim.rhoMax, fc, fy)) - 4} y2={Y(Rof(lim.rhoMax, fc, fy)) + 4} stroke={isHl ? 'var(--c-accent)' : col} strokeWidth={1.5} />
            <text x={X(lim.rhoMax) + 3} y={Y(Rof(lim.rhoMax, fc, fy)) + 3} fontSize={8} fill={isHl ? 'var(--c-accent)' : 'var(--c-faint)'} className="num">
              {fy}/{fc}
            </text>
          </g>
        )
      })}
      {point && ok(point.rho) && ok(point.R) && (
        <g>
          <line x1={X(point.rho)} x2={X(point.rho)} y1={Y(point.R)} y2={H - B} stroke="var(--c-bad)" strokeDasharray="3 3" />
          <line x1={L} x2={X(point.rho)} y1={Y(point.R)} y2={Y(point.R)} stroke="var(--c-bad)" strokeDasharray="3 3" />
          <circle cx={X(point.rho)} cy={Y(point.R)} r={3.5} fill="var(--c-bad)" data-tip={`ρ = ${fmt(point.rho, 5)}, R = ${fmt(point.R, 4)}`} />
        </g>
      )}
    </svg>
  )
}

function GraphA1() {
  const used = useUsed('f-graphA1')
  const [fc, setFc] = useState(4)
  const [fy, setFy] = useState(60)
  const [mode, setMode] = useState<'rho' | 'R' | 'M'>('M')
  const [rho, setRho] = useState(0.012)
  const [R, setR] = useState(600)
  const [Mu, setMu] = useState(300)
  const [b, setB] = useState(12)
  const [d, setD] = useState(21)
  const RfromM = (Mu * 12000) / (0.9 * b * d * d)
  const Rv = mode === 'rho' ? Rof(rho, fc, fy) : mode === 'R' ? R : RfromM
  const rv = mode === 'rho' ? rho : rhoOfR(Rv, fc, fy)
  const lim = ok(fc) && ok(fy) ? rhoLimits(fc * 1000, fy * 1000) : null
  const hl = used ? { fc: +used.fc, fy: +used.fy } : { fc, fy }
  return (
    <>
      <Md>{`$$R = \\frac{M_n}{bd^2} = \\frac{M_u}{\\phi bd^2} = \\rho f_y\\left(1 - 0.59\\frac{\\rho f_y}{f'_c}\\right)$$
Curves fy/f'c (ksi) end at ρmax (εt = 0.004, tick); the dot is ρ0.005 (φ = 0.9). Used for a singly section or for the **rectangular** case of a T-beam (b = beff).`}</Md>
      <GraphA1Chart hl={hl} point={used?.rho != null ? { rho: +used.rho, R: +used.R } : ok(rv) ? { rho: rv, R: Rv } : undefined} />
      {used && (
        <div className="text-[11px] text-accent">
          Lab: fy/f'c = {used.fy}/{used.fc}
          {used.rho != null && <> · ρ = {fmt(+used.rho, 4)}, R = {fmt(+used.R, 0)} psi</>}
        </div>
      )}
      <Lookup
        result={
          ok(rv) && lim ? (
            <>
              R = <b>{fmt(Rv, 0)} psi</b> ↔ ρ = <b>{fmt(rv, 5)}</b> {rv > lim.rhoMax ? '(> ρmax: doubly or bigger section)' : rv > lim.rho005 ? '(transition: φ < 0.9)' : '(tension-controlled)'} · ρ0.005 = {fmt(lim.rho005, 4)}, ρmax = {fmt(lim.rhoMax, 4)}
              {mode === 'M' && <> · As = ρbd = {fmt(rv * b * d, 2)} in²</>}
            </>
          ) : (
            'R too large for this f′c (no solution)'
          )
        }
      >
        <NumIn label="f′c" value={fc} onChange={setFc} step={0.5} unit="ksi" w="w-14" />
        <NumIn label="fy" value={fy} onChange={setFy} step={10} unit="ksi" w="w-14" />
        <Seg size="xs" value={mode} onChange={setMode} items={[{ v: 'M', label: 'Mu,b,d → ρ' }, { v: 'R', label: 'R → ρ' }, { v: 'rho', label: 'ρ → R' }]} />
        {mode === 'rho' && <NumIn label="ρ" value={rho} onChange={setRho} step={0.001} w="w-20" />}
        {mode === 'R' && <NumIn label="R" value={R} onChange={setR} step={25} unit="psi" w="w-16" />}
        {mode === 'M' && (
          <>
            <NumIn label="Mu" value={Mu} onChange={setMu} step={10} unit="k-ft" w="w-16" />
            <NumIn label="b" value={b} onChange={setB} step={1} unit="in" w="w-12" />
            <NumIn label="d" value={d} onChange={setD} step={0.5} unit="in" w="w-12" />
          </>
        )}
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- WSD T-beam
function WsdTBody() {
  const used = useUsed('f-wsdT')
  const [bf, setBf] = useState(75)
  const [t, setT] = useState(4)
  const [d, setD] = useState(20)
  const [As, setAs] = useState(3.5)
  const [n, setN] = useState(9)
  const w = [bf, t, d, As, n].every(ok) && As > 0 ? wsdT({ beff: bf, hf: t, d, As, n }) : null
  return (
    <>
      <Md>{`Printed with 2006-07 Q3, 2005-06 Q2 and 2004-05 Q5 ("T beams: WSD Method"). Web compression neglected; t = flange thickness, ρ = As / b d with b = beff.
$$k = \\frac{n\\rho + \\tfrac12 (t/d)^2}{n\\rho + t/d},\\qquad z = \\frac{3kd - 2t}{2kd - t}\\cdot\\frac{t}{3},\\qquad jd = d - z$$
$$j = \\frac{6 - 6(t/d) + 2(t/d)^2 + (t/d)^3/(2\\rho n)}{6 - 3(t/d)}$$
$$M_s = A_sf_s\\,jd,\\qquad M_c = f_c\\left(1 - \\frac{t}{2kd}\\right)b\\,t\\,jd,\\qquad f_c = \\frac{f_s}{n}\\frac{k}{1-k}$$
First check **kd ≤ t**: then it is a rectangle of width b: $k = \\sqrt{(\\rho n)^2 + 2\\rho n} - \\rho n$, $j = 1 - k/3$. Design: start with $jd \\approx d - t/2$, $A_s = M/f_s jd$, recompute k, z, jd and repeat; check $f_c \\le 0.45f'_c$.`}</Md>
      {used && (
        <div className="text-[11px] text-accent">
          Lab: k = {fmt(+used.k, 4)}, z = {fmt(+used.z, 3)} in, jd = {fmt(+used.jd, 3)} in {used.rect ? '(kd ≤ t: rectangular)' : ''}
        </div>
      )}
      <Lookup
        result={
          w ? (
            <>
              ρ = {fmt(w.rho, 5)} · k = <b>{fmt(w.k, 4)}</b> · kd = {fmt(w.kd, 3)} in {w.rect ? '≤ t → rectangular' : '> t'} · z = <b>{fmt(w.z, 3)}</b> · jd = <b>{fmt(w.jd, 3)}</b> in · j = {fmt(w.j, 4)}
            </>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="b" value={bf} onChange={setBf} step={1} unit="in" w="w-14" />
        <NumIn label="t" value={t} onChange={setT} step={0.5} unit="in" w="w-12" />
        <NumIn label="d" value={d} onChange={setD} step={0.5} unit="in" w="w-12" />
        <NumIn label="As" value={As} onChange={setAs} step={0.1} unit="in²" w="w-14" />
        <NumIn label="n" value={n} onChange={setN} step={1} w="w-12" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- effective flange width
function BeffFig() {
  return (
    <svg viewBox="0 0 420 120" className="w-full h-auto max-w-md">
      <rect x={10} y={20} width={400} height={14} fill="var(--c-panel2)" stroke="var(--c-mute)" />
      {[60, 210, 360].map((x) => (
        <rect key={x} x={x - 14} y={34} width={28} height={50} fill="var(--c-panel2)" stroke="var(--c-mute)" />
      ))}
      <rect x={150} y={20} width={120} height={14} fill="var(--c-accent)" fillOpacity={0.35} />
      <rect x={10} y={20} width={95} height={14} fill="var(--c-load)" fillOpacity={0.3} />
      <line x1={150} x2={270} y1={12} y2={12} stroke="var(--c-accent)" markerStart="url(#bfa)" markerEnd="url(#bfa)" />
      <text x={210} y={9} fontSize={10} textAnchor="middle" fill="var(--c-accent)">
        beff (interior T)
      </text>
      <text x={57} y={9} fontSize={10} textAnchor="middle" fill="var(--c-load)">
        beff (edge L)
      </text>
      <line x1={210} x2={360} y1={98} y2={98} stroke="var(--c-mute)" />
      <text x={285} y={110} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)">
        c/c spacing
      </text>
      <text x={222} y={62} fontSize={9.5} fill="var(--c-mute)">
        bw
      </text>
      <text x={414} y={31} fontSize={9.5} textAnchor="end" fill="var(--c-mute)">
        hf
      </text>
      <defs>
        <marker id="bfa" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent)" />
        </marker>
      </defs>
    </svg>
  )
}

function BeffBody() {
  const used = useUsed('f-beff')
  const [kind, setKind] = useState<FlangeKind>('interior')
  const [L, setL] = useState(24)
  const [bw, setBw] = useState(12)
  const [hf, setHf] = useState(4)
  const [cc, setCc] = useState(96)
  const r = [L, bw, hf, cc].every(ok) ? effectiveWidth({ kind, L, bw, hf, cc, bActual: cc }) : null
  const g = used?.gov
  return (
    <>
      <BeffFig />
      <RT
        head={['Beam', 'beff = least of', '', '']}
        rows={[
          ['Interior T (slab both sides)', '16hf + bw', 'L/4 + bw *', 'c/c spacing'],
          ['Edge L (slab one side)', '6hf + bw', 'L/12 + bw', '½ clear distance + bw'],
          ['Isolated T', 'hf ≥ bw/2', 'b ≤ 4bw', '—'],
        ]}
        hl={(i) => (used ? (i === 0 && used.kind === 'interior') || (i === 1 && used.kind === 'edge') || (i === 2 && used.kind === 'isolated') : false)}
        cap="* ACI 318-14 / Nilson 15th ed (the current deck and the class floor problem): overhang ≤ 8hf, ≤ ½ clear distance, ≤ ln/8 each side → bw + L/4. The older slides (14th ed, ACI 318-08) print b ≤ L/4. Say which you use; it rarely changes the answer."
      />
      <Md>{`Why limited: compression in the flange is carried by in-plane shear from the web, so longitudinal stress falls off away from the web (**shear lag**). beff is the width that, at the full web-line stress, carries the same total force.`}</Md>
      {used && (
        <div className="text-[11px] text-accent">
          Lab: {used.kind} beam, governs: {String(g)} → beff = {fmt(+used.b, 2)} in
        </div>
      )}
      <Lookup
        result={
          r ? (
            <>
              {r.cands.map((c) => (
                <span key={c.key} className={c.key === r.governs ? 'text-accent font-bold' : ''}>
                  {c.label.replace('h_f', 'hf').replace('b_w', 'bw')} = {fmt(c.value, 2)}
                  {'  ·  '}
                </span>
              ))}
              beff = <b>{fmt(r.b, 2)} in</b>
              {r.isolatedOk && <> · hf ≥ bw/2: {r.isolatedOk.hf ? '✓' : '✗'}</>}
            </>
          ) : (
            '—'
          )
        }
      >
        <Seg size="xs" value={kind} onChange={setKind} items={[{ v: 'interior', label: 'T' }, { v: 'edge', label: 'L' }, { v: 'isolated', label: 'isolated' }]} />
        <NumIn label="span" value={L} onChange={setL} step={1} unit="ft" w="w-14" />
        <NumIn label="bw" value={bw} onChange={setBw} step={1} unit="in" w="w-12" />
        <NumIn label="hf" value={hf} onChange={setHf} step={0.5} unit="in" w="w-12" />
        <NumIn label={kind === 'isolated' ? 'flange b' : 'c/c to next beam'} value={cc} onChange={setCc} step={6} unit="in" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- does A's yield?
function AsYield() {
  const used = useUsed('f-asyield')
  const [b, setB] = useState(14)
  const [d, setD] = useState(21)
  const [dt, setDt] = useState(22.5)
  const [dp, setDp] = useState(2.5)
  const [As, setAs] = useState(6.32)
  const [Asp, setAsp] = useState(2.37)
  const [fc, setFc] = useState(5)
  const [fy, setFy] = useState(72.5)
  const r = [b, d, dt, dp, As, Asp, fc, fy].every(ok) && b > 0 && d > dp ? reviewDoubly({ b, d, dt, dp, As, Asp, fc, fy }) : null
  return (
    <>
      <Md>{`**Quick test** (assume A′s yields): $a = \\frac{(A_s - A'_s)f_y}{0.85f'_cb}$, $c = a/\\beta_1$, $\\varepsilon'_s = 0.003\\frac{c - d'}{c} \\ge \\varepsilon_y = f_y/E_s$? Same as $\\rho \\ge \\bar\\rho_{cy} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{d'}{d}\\frac{\\varepsilon_u}{\\varepsilon_u - \\varepsilon_y} + \\rho'$.

**If not**: $A_sf_y = 0.85f'_c\\beta_1bc + A'_s\\left(E_s\\varepsilon_u\\frac{c - d'}{c} - 0.85f'_c\\right)$ (class handnotes subtract the displaced concrete) → quadratic in c, $f'_s = 87\\frac{c - d'}{c}$ ksi.
$$M_n = 0.85f'_cab\\left(d - \\tfrac a2\\right) + A'_s(f'_s - 0.85f'_c)(d - d'),\\quad \\varepsilon_t = 0.003\\frac{d_t - c}{c}$$`}</Md>
      <RT
        head={['fy (ksi)', 'max d′/d (εt = 0.004)', 'min d for d′ = 2.5', 'max d′/d (εt = 0.005)', 'min d for d′ = 2.5']}
        rows={[40, 60, 75].map((f) => {
          const a = minDepthForYield(2.5, f, 0.004)
          const c = minDepthForYield(2.5, f, 0.005)
          return [f, fmt(a.maxRatio, 2), fmt(a.dMin, 1), fmt(c.maxRatio, 2), fmt(c.dMin, 1)]
        })}
        hl={(i) => used != null && [40, 60, 75][i] === +used.fy}
        cap="Table 3.2 (Nilson): below these depths A′s cannot yield at the εt limit — expect the quadratic. Wide shallow beams, large d′, fy = 72.5 ksi and light tension steel all push f′s below fy."
      />
      {used && (
        <div className="text-[11px] text-accent">
          Lab: c = {fmt(+used.c, 3)} in, ε′s = {fmt(+used.esp, 5)} vs εy = {fmt(+used.ey, 5)} → {used.yields ? 'yields' : 'does not yield'}
        </div>
      )}
      <Lookup
        result={
          r ? (
            <>
              β1 = {fmt(r.b1, 3)} · ρ = {fmt(r.rho, 4)} vs ρ̄cy = {fmt(r.rhoCy, 4)} · trial c = {fmt(r.trial.c, 3)}, ε′s = {fmt(r.trial.epsSp, 5)} → <b>{r.compYields ? 'A′s yields' : 'does NOT yield'}</b> · c = {fmt(r.c, 3)}, f′s = <b>{fmt(r.fsp, 2)} ksi</b>, εt = {fmt(r.epsT, 5)}, φMn = <b>{fmt(r.phiMn, 1)} k-ft</b>
            </>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="b" value={b} onChange={setB} step={1} w="w-12" />
        <NumIn label="d" value={d} onChange={setD} step={0.5} w="w-12" />
        <NumIn label="dt" value={dt} onChange={setDt} step={0.5} w="w-12" />
        <NumIn label="d′" value={dp} onChange={setDp} step={0.5} w="w-12" />
        <NumIn label="As" value={As} onChange={setAs} step={0.1} w="w-14" />
        <NumIn label="A′s" value={Asp} onChange={setAsp} step={0.1} w="w-14" />
        <NumIn label="f′c" value={fc} onChange={setFc} step={0.5} w="w-12" />
        <NumIn label="fy" value={fy} onChange={setFy} step={5} w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- step checklists
function StDoubly() {
  return (
    <Md>{`### Review (find φMn)
1. As, A′s, ρ, ρ′; β1, εy = fy/Es.
2. Assume A′s yields: a = (As − A′s)fy / 0.85f′c b, c = a/β1.
3. ε′s = 0.003(c − d′)/c ≥ εy? (or ρ ≥ ρ̄cy). Yes → f′s = fy, keep c.
4. No → quadratic: 0.85f′cβ1b c² + (87A′s − As fy − 0.85f′cA′s) c − 87A′s d′ = 0; f′s = 87(c − d′)/c.
5. Check tension steel yields: εs = 0.003(d − c)/c ≥ εy.
6. a = β1c, Cc = 0.85f′c ab, Cs = A′s(f′s [− 0.85f′c]).  Check Cc + Cs = As fy.
7. Mn = Cc(d − a/2) + Cs(d − d′).
8. εt = 0.003(dt − c)/c at the **extreme** layer → φ (≥ 0.005: 0.9; ≥ 0.004 required).
9. φMn (k-ft).
### Design (b × h fixed, Mu given)
1. d (two layers: h − 4 or as given), dt, d′ = 2.5.
2. ρ0.005 → As1 = ρ0.005 bd, a, Mn1 = As1 fy(d − a/2), φMn1 = 0.9Mn1.
3. Mu ≤ φMn1? → singly. Else φMn2 = Mu − φMn1, Mn2 = φMn2/0.9.
4. c = a/β1 → ε′s → f′s (≤ fy).
5. A′s = Mn2 / f′s(d − d′); As2 = A′s f′s/fy; As = As1 + As2.
6. Choose bars (tension in 2 layers, compression ≥ 2 bars); sketch.
7. Review the provided section (steps above): φMn ≥ Mu, εt ≥ 0.004.`}</Md>
  )
}

function StTbeam() {
  return (
    <Md>{`### Midspan (+M, flange in compression)
1. beff = least of the rules (T: 16hf + bw, L/4 [+ bw], c/c; L: 6hf + bw, L/12 + bw, ½ clear + bw).
2. Review: a = As fy / 0.85f′c beff. a ≤ hf → rectangle beff × d (Mn = As fy(d − a/2)).
3. a > hf → Asf = 0.85f′c(beff − bw)hf/fy, Mn1 = Asf fy(d − hf/2); a = (As − Asf)fy / 0.85f′c bw, Mn2 = (As − Asf)fy(d − a/2).
4. c = a/β1, εt = 0.003(dt − c)/c → φ; φMn = φ(Mn1 + Mn2).
5. Design: trial a = hf → As = Mu/φfy(d − hf/2) → a with beff. a ≤ hf → rectangular design with beff (iterate a). Else Asf, φMn1, φMn2 = Mu − φMn1 → As − Asf with bw (iterate a) → As.
6. Check As ≥ As,min (bw), εt ≥ 0.005.
### Support (−M, flange in tension)
1. Rectangle bw × d; bars in the slab, two layers (d to centroid, dt to extreme layer).
2. Same as a singly beam; if εt < 0.004 use the bottom bars as A′s (doubly review).
### Floor loads
- Slab: hf/12 × 0.15 × spacing; web: bw(h − hf)/144 × 0.15; SDL, LL × spacing (k/ft).
- wu = 1.2D + 1.6L; Mu = coef × wu ln² (1/8 simple; 1/14, 1/16, −1/9, −1/10, −1/11 ACI).`}</Md>
  )
}

export const FLEX_ITEMS: RcRefItem[] = [
  { id: 'f-graphA1', group: 'flex', title: 'Graph A.1 — moment capacity R = Mn/bd² vs ρ', tag: 'Nilson App. A', exam: true, keywords: 'graph a.1 a1 r rho moment capacity flexural resistance factor design aid curve', Body: GraphA1 },
  { id: 'f-beff', group: 'flex', title: 'Effective flange width (T, L, isolated)', tag: 'ACI 6.3.2 / 8.12', keywords: 'beff effective flange width t beam l beam edge isolated shear lag 16hf span/4', Body: BeffBody },
  { id: 'f-wsdT', group: 'flex', title: 'WSD T-beam: k, z, jd, j', tag: 'printed formula box', exam: true, keywords: 'wsd working stress t beam k j z jd flange', Body: WsdTBody },
  { id: 'f-asyield', group: 'flex', title: 'Does A′s yield? ρ̄cy, quadratic for c, Table 3.2', tag: 'Nilson Eq 3.51–3.57', keywords: 'compression steel yield doubly quadratic rho cy fs prime table 3.2 minimum depth', Body: AsYield },
  { id: 'st-doubly', group: 'steps', title: 'Steps: doubly reinforced review & design', keywords: 'doubly compression steel steps checklist', Body: StDoubly },
  { id: 'st-tbeam', group: 'steps', title: 'Steps: T-beam (midspan, support, floor loads)', keywords: 't beam steps checklist flange support negative', Body: StTbeam },
]

