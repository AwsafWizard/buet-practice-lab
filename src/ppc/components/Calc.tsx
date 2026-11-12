// Worked solutions for the number-type parts: the QCBS score sheet and the Tender Data Sheet.

import { useState } from 'react'
import { qcbs } from '../engine/qcbs'
import { cr, tds, tdsKey } from '../engine/tds'
import type { PcCalc } from '../types'

const f2 = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2))

export function CalcSolution({ calc }: { calc: PcCalc }) {
  return calc.kind === 'qcbs' ? <QcbsSheet calc={calc} /> : <TdsSheet calc={calc} />
}

function QcbsSheet({ calc }: { calc: Extract<PcCalc, { kind: 'qcbs' }> }) {
  const r = qcbs(calc.firms, calc.techWeight, calc.qualify)
  const unit = calc.unit ?? ''
  const T = calc.techWeight / 100
  return (
    <div className="text-sm space-y-2">
      <div className="font-bold">QCBS score sheet</div>
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          Technical proposals are evaluated first. Firms below the qualifying mark of <b>{calc.qualify}</b> are rejected and their financial proposals returned unopened
          {r.rows.some((x) => !x.qualified) ? `: ${r.rows.filter((x) => !x.qualified).map((x) => x.name).join(', ')}.` : ' (none here).'}
        </li>
        <li>
          Financial score of each qualified firm: S<sub>f</sub> = 100 × F<sub>m</sub> / F, with F<sub>m</sub> = lowest evaluated price = <b>{r.fm !== undefined ? `${f2(r.fm)} ${unit}` : '—'}</b>.
        </li>
        <li>
          Combined score S = S<sub>t</sub> × {f2(T)} + S<sub>f</sub> × {f2(1 - T)} (weights {calc.techWeight} : {100 - calc.techWeight}).
        </li>
      </ol>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Firm</th>
              <th>S<sub>t</sub></th>
              <th>Qualified?</th>
              <th>Price</th>
              <th>S<sub>f</sub></th>
              <th>S = {f2(T)}S<sub>t</sub> + {f2(1 - T)}S<sub>f</sub></th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {r.rows.map((x) => (
              <tr key={x.name} className={x.rank === 1 ? 'font-bold' : ''}>
                <td>{x.name}</td>
                <td className="num">{x.tech}</td>
                <td>{x.qualified ? 'yes' : <span className="text-bad">no — unopened</span>}</td>
                <td className="num">{x.price !== undefined ? `${f2(x.price)} ${unit}` : '—'}</td>
                <td className="num">{x.sf !== undefined ? `100 × ${f2(r.fm!)} / ${f2(x.price!)} = ${f2(x.sf)}` : '—'}</td>
                <td className="num">{x.s !== undefined ? `${f2(T * x.tech)} + ${f2((1 - T) * x.sf!)} = ${f2(x.s)}` : '—'}</td>
                <td className="num">{x.rank ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <b>{r.winner}</b> has the highest combined score and is invited for negotiation; if negotiation fails, the next-ranked firm is invited.
        {r.tie && <span className="text-load"> The top two scores are equal: the firm with the higher technical score is shown first. Write the tie down and say how you broke it.</span>}
      </div>
    </div>
  )
}

function TdsSheet({ calc }: { calc: Extract<PcCalc, { kind: 'tds' }> }) {
  const [why, setWhy] = useState(true)
  const r = tds({ costCrore: calc.costCrore, months: calc.months, storeys: calc.storeys })
  const rows = calc.items.map((it) => ({ it, line: r.lines[tdsKey(it) ?? ''] }))
  const tag = { PPR: 'PPR 2008', class: 'class note', practice: 'standard practice' }
  return (
    <div className="text-sm space-y-2">
      <div className="flex items-center gap-2">
        <div className="font-bold flex-1">Tender Data Sheet (TDS) entries</div>
        <button className="btn !py-0.5 !text-xs" onClick={() => setWhy(!why)}>
          {why ? 'hide' : 'show'} working
        </button>
      </div>
      <div className="text-mute">
        Estimate {cr(calc.costCrore)}, {calc.months} months{calc.storeys ? `, ${calc.storeys} storeys` : ''} → about {cr(r.annual)} of work a year, {cr(r.monthly)} a month.
      </div>
      <div className="overflow-x-auto">
        <table className="tbl [&_td]:font-sans [&_td]:text-[13px]">
          <thead>
            <tr>
              <th>ITT clause / item</th>
              <th>TDS entry</th>
              {why && <th>How the figure was set</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ it, line }) => (
              <tr key={it}>
                <td className="font-semibold">{it}</td>
                <td>{line ? line.entry : 'State the requirement for this tender (see the answer).'}</td>
                {why && (
                  <td className="text-mute">
                    {line?.basis} {line && <span className="chip !text-[10px]">{tag[line.from]}</span>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-mute">
        Only the tender-security rule is in PPR 2008 (a rounded fixed amount, never a percentage, at most 3% of the official estimate). The experience, turnover and liquid-asset multiples are
        standard-document practice, so the paper accepts reasonable values when you state the basis, as above. (2023-24: “Assume reasonable value for missing data.”)
      </div>
    </div>
  )
}
