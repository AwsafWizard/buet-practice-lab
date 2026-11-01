// Wind lab: a generated simplified-procedure problem — statement, the printed p_s30 rows to
// interpolate, eligibility check first, then step checks, the zone table and the full solution.

import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Md } from '../../components/ui'
import { LAMBDA_TABLE } from '../../engine/wind'
import { CheckTable, hashKey, type CheckCol } from '../../labs/CheckTable'
import { useStore } from '../../store'
import { SIMP_ZONES, solveSimp, type SimpProblem } from './simplified'

type ZoneRow = { z: string; p30: number; kpa: number }
const ZONE_COLS: CheckCol<ZoneRow>[] = [
  { key: 'p30', label: 'p_s30 (psf)', get: (r) => r.p30, abs: 0.15, digits: 2 },
  { key: 'kpa', label: 'p_s (kN/m²)', get: (r) => r.kpa, abs: 0.01, digits: 3 },
]
const OCC = ['', 'I', 'II', 'III', 'IV']
const sgn = (v: number, d = 1) => fmt(v, d).replace('-', '−')

export function SimplifiedPractice({ p }: { p: SimpProblem }) {
  const s = solveSimp(p)
  const record = useStore((st) => st.record)
  const [elig, setElig] = useState<'y' | 'n' | null>(null)
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `wind:simp:${key}:${k}`
  const answer = s.allowed ? 'y' : 'n'
  const gable = p.rise > 0
  const rows: ZoneRow[] = SIMP_ZONES.map((z, i) => ({ z, p30: s.p30[i], kpa: s.kpa[i] }))
  const lb = LAMBDA_TABLE.findIndex((r) => r.h >= s.h)
  const lamRows = lb <= 0 ? [LAMBDA_TABLE[0]] : [LAMBDA_TABLE[lb - 1], LAMBDA_TABLE[lb]]
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-xl border border-line bg-panel2/50 p-3 leading-relaxed">
        A <b>{p.use}</b> at {p.city} (basic wind speed V = {p.V} m/s), exposure {p.exp}, on level ground. Plan {p.B} m × {p.L} m, eave height {p.eave} m,{' '}
        {gable ? `gable roof with the ridge along the ${p.L} m length, rising ${p.rise} m above the eaves` : 'flat roof'}. The building is{' '}
        {p.enclosed ? 'enclosed' : 'partially enclosed (large openings on the windward wall)'}. Wind blows across the {p.B} m width{gable ? ' (normal to the ridge)' : ''}. Check whether the
        simplified procedure of BNBC 2020 may be used; if it may, find the MWFRS design pressures p<sub>s</sub> for zones A–H.
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Given with the paper — p_s30 (psf), exposure A, h = 9.1 m, I = 1.0</div>
        <div className="overflow-x-auto">
          <table className="tbl w-auto">
            <thead>
              <tr>
                <th>V (mph)</th>
                <th>Roof angle</th>
                {SIMP_ZONES.map((z) => (
                  <th key={z}>{z}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.given.map((g) => (
                <tr key={`${g.V}:${g.angle}`}>
                  <td>{g.V}</td>
                  <td className="txt">{g.angle}</td>
                  {g.p.map((v, i) => (
                    <td key={i}>{sgn(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-faint mt-1">λ (Fig 6.2.2) and the importance factor are in the code tables drawer.</p>
      </div>
      <div key={key} className="rounded-xl border border-line p-3 space-y-1">
        <div className="text-xs font-bold uppercase tracking-wider text-faint">Your checkpoints</div>
        <div className="flex flex-wrap items-center gap-2 py-1">
          <span className="text-sm text-mute min-w-[7.5rem]">Simplified procedure allowed?</span>
          {(['y', 'n'] as const).map((v) => (
            <button
              key={v}
              className={'btn !py-1 !px-2.5 ' + (elig === v ? (v === answer ? 'border-good! text-good' : 'border-bad! text-bad') : '')}
              onClick={() => {
                setElig(v)
                record(id('elig'), v === answer)
              }}
            >
              {v === 'y' ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
        {elig === answer && !s.allowed && (
          <div className="rounded-lg border border-good/50 bg-good/10 p-2">
            Right — it fails the condition {s.conds.filter((c) => !c.ok).map((c) => c.text).join('; ')} (h = {fmt(s.h, 2)} m, least width {fmt(s.least)} m). Use the analytical procedure instead. Roll another problem.
          </div>
        )}
        {elig === answer && s.allowed && (
          <>
            <Answer id={id('V')} label="V (mph)" value={s.Vmph} abs={0.2} compact />
            {gable && <Answer id={id('th')} label="Roof angle θ (°)" value={s.theta} abs={0.1} compact />}
            <Answer id={id('h')} label="Mean roof height h (m)" value={s.h} abs={0.01} compact />
            <Answer id={id('lam')} label="λ" value={s.lam} abs={0.005} compact />
            <Answer id={id('I')} label="I" value={s.I} compact />
            <Answer id={id('a')} label="End-zone a (m)" value={s.a} abs={0.02} compact />
          </>
        )}
      </div>
      {elig === answer && s.allowed && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Zones — interpolated p_s30 and p_s = λK_zt·I·p_s30</div>
          <CheckTable key={key} rows={rows} rowKey={(r) => r.z} given={[{ label: 'Zone', get: (r) => `${r.z} ${'ABCD'.includes(r.z) ? '(horiz.)' : '(vert.)'}` }]} cols={ZONE_COLS} idp={id('tbl')} />
        </div>
      )}
      <details>
        <summary className="cursor-pointer text-accent font-semibold">Full solution</summary>
        <div className="mt-2 space-y-2">
          <Md>{`**Conditions** (enclosed, low-rise, regular, simple diaphragm, flat/gable roof θ ≤ 45°): ${s.conds.map((c) => `${c.text} ${c.ok ? '✓' : '✗'}`).join('; ')}. Mean roof height $h = ${gable ? `${p.eave} + ${p.rise}/2 = ` : ''}${fmt(s.h, 2)}$ m, least horizontal dimension ${fmt(s.least)} m → **${s.allowed ? 'simplified procedure allowed' : 'not allowed — use the analytical procedure'}**.`}</Md>
          {s.allowed && (
            <>
              <Md>{`$V = ${p.V}\\times2.237 = ${fmt(s.Vmph, 2)}$ mph${s.vLo !== s.vHi ? ` → between the ${s.vLo} and ${s.vHi} mph rows, factor $(${fmt(s.Vmph, 2)} - ${s.vLo})/${s.vHi - s.vLo} = ${fmt(s.fv, 4)}$` : ''}.
${gable ? `Roof angle $\\theta = \\tan^{-1}\\frac{${p.rise}}{${p.B}/2} = ${fmt(s.theta, 2)}^\\circ$${s.angLo !== s.angHi ? ` → between the ${s.angLo} and ${s.angHi} rows, factor ${fmt(s.ft, 4)}` : ` → the ${s.angLo} row`}.` : 'Flat roof → the "0 to 5°" row.'}

$\\lambda$ (exposure ${p.exp}, h = ${fmt(s.h, 2)} m): ${lamRows.length === 2 ? `between ${lamRows[0].h} m (${lamRows[0][p.exp]}) and ${lamRows[1].h} m (${lamRows[1][p.exp]}) → ` : ''}$\\lambda = ${fmt(s.lam, 4)}$. Occupancy ${OCC[p.occ]} → $I = ${s.I}$. Level site → $K_{zt} = 1$.
$\\lambda K_{zt}I = ${fmt(s.lam * s.I, 4)}$.`}</Md>
              <div className="overflow-x-auto">
                <table className="tbl w-auto">
                  <thead>
                    <tr>
                      <th>Zone</th>
                      {s.vLo !== s.vHi && <th>at {s.vLo} mph</th>}
                      {s.vLo !== s.vHi && <th>at {s.vHi} mph</th>}
                      <th>p_s30 (psf)</th>
                      <th>p_s (psf)</th>
                      <th>p_s (kN/m²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIMP_ZONES.map((z, i) => (
                      <tr key={z} className={i === 0 || i === 2 ? 'hl' : ''}>
                        <td className="txt font-semibold">
                          {z} {i < 4 ? '(horizontal)' : '(vertical)'}
                        </td>
                        {s.vLo !== s.vHi && <td>{sgn(s.atLo[i], 3)}</td>}
                        {s.vLo !== s.vHi && <td>{sgn(s.atHi[i], 3)}</td>}
                        <td>{sgn(s.p30[i], 3)}</td>
                        <td>{sgn(s.ps[i], 3)}</td>
                        <td className="font-bold">{sgn(s.kpa[i], 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Md>{`A, B (end zones) and C, D (interior) are horizontal pressures on the vertical projection of the walls (A, C) and the roof (B, D); E, F (end) and G, H (interior) are vertical pressures on the windward and leeward roof (− = uplift). End zone: $a = \\min(0.1\\times${fmt(s.least)},\\ 0.4\\times${fmt(s.h, 2)})$, not below $0.04\\times${fmt(s.least)}$ or 0.9 m → $a = ${fmt(s.a, 3)}$ m, so the end zones are $2a = ${fmt(2 * s.a, 3)}$ m wide.`}</Md>
            </>
          )}
        </div>
      </details>
    </div>
  )
}
