// Worked solutions for the number-type parts: the QCBS score sheet and the Tender Data Sheet,
// laid out the way the class solves write them.

import { Fragment, useState } from 'react'
import { qcbs } from '../engine/qcbs'
import { cr, num, tds, TDS_ORDER, tdsKey } from '../engine/tds'
import type { PcCalc } from '../types'

const f2 = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2))

export function CalcSolution({ calc }: { calc: PcCalc }) {
  return calc.kind === 'qcbs' ? <QcbsSheet calc={calc} /> : <TdsSheet calc={calc} />
}

function QcbsSheet({ calc }: { calc: Extract<PcCalc, { kind: 'qcbs' }> }) {
  const r = qcbs(calc.firms, calc.techWeight, calc.qualify)
  const unit = calc.unit ?? ''
  const T = calc.techWeight / 100
  const out = r.rows.filter((x) => !x.qualified)
  return (
    <div className="text-sm space-y-2">
      <div className="font-bold">QCBS ranking</div>
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          Technical proposals are evaluated first. A firm scoring below the qualifying mark of <b>{calc.qualify}</b> is not considered and its financial proposal is returned unopened
          {out.length ? `: ${out.map((x) => x.name).join(', ')}.` : ' (none here).'}
        </li>
        <li>
          Financial score F<sub>s</sub> = 100 × F<sub>m</sub> / F, where F<sub>m</sub> is the lowest financial offer among the qualified firms = <b>{r.fm !== undefined ? `${f2(r.fm)} ${unit}` : '—'}</b> and F is the firm’s own offer.
        </li>
        <li>
          Combined score = {f2(T)} T<sub>s</sub> + {f2(1 - T)} F<sub>s</sub> (technical weight {calc.techWeight}%, financial weight {100 - calc.techWeight}%).
        </li>
      </ol>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Name of the firm</th>
              <th>T<sub>s</sub> (100)</th>
              <th>Financial offer{unit ? ` (${unit})` : ''}</th>
              <th>F<sub>s</sub></th>
              <th>Combined score ({f2(T)} T<sub>s</sub> + {f2(1 - T)} F<sub>s</sub>)</th>
              <th>Ranking</th>
            </tr>
          </thead>
          <tbody>
            {r.rows.map((x) => (
              <tr key={x.name} className={x.rank === 1 ? 'font-bold' : ''}>
                <td>{x.name}</td>
                <td className="num">{x.qualified ? x.tech : <span className="text-bad">{x.tech} (×)</span>}</td>
                <td className="num">{x.qualified && x.price !== undefined ? f2(x.price) : '—'}</td>
                <td className="num">{x.sf !== undefined ? `100 × ${f2(r.fm!)} / ${f2(x.price!)} = ${f2(x.sf)}` : '—'}</td>
                <td className="num">{x.s !== undefined ? `${f2(T * x.tech)} + ${f2((1 - T) * x.sf!)} = ${f2(x.s)}` : '—'}</td>
                <td className="num">{x.rank ?? (x.qualified ? '—' : 'not qualified')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <b>{r.winner} is selected</b>: it has the highest combined score and is invited for negotiation. If the negotiation fails, the firm ranked next is invited.
        {r.tie && (
          <span className="text-load"> The top two combined scores are equal. Class rule: when the combined scores are equal, the firm with the greater technical score is selected. Write that line in the answer.</span>
        )}
      </div>
    </div>
  )
}

function TdsSheet({ calc }: { calc: Extract<PcCalc, { kind: 'tds' }> }) {
  const [why, setWhy] = useState(true)
  const r = tds({ costCrore: calc.costCrore, months: calc.months, storeys: calc.storeys, lengthM: calc.lengthM, billingPct: calc.billingPct })
  // the items this paper asks for, in the order the class table is written
  const asked = new Set(calc.items.map(tdsKey))
  const keys = TDS_ORDER.filter((k) => asked.has(k))
  const other = calc.items.filter((it) => !tdsKey(it))
  const groups = ['Qualification Criteria', 'Tender Preparation'] as const
  const cols = why ? 3 : 2
  return (
    <div className="text-sm space-y-2">
      <div className="flex items-center gap-2">
        <div className="font-bold flex-1">Tender Data Sheet</div>
        <button className="btn !py-0.5 !text-xs" onClick={() => setWhy(!why)}>
          {why ? 'hide' : 'show'} working
        </button>
      </div>
      <div className="text-mute">
        Total cost {cr(calc.costCrore)}, duration {num(calc.months)} months ({num(r.years)} years){calc.storeys ? `, ${calc.storeys} storeys` : ''}
        {calc.lengthM ? `, ${num(calc.lengthM, 0)} m long` : ''}. Assuming the billing amount is {num(r.billingPct)}%{calc.billingPct ? ' (given)' : ''}.
      </div>
      <div className="overflow-x-auto">
        <table className="tbl [&_td]:!font-sans [&_td]:!text-[13px]">
          <thead>
            <tr>
              <th>ITT clause</th>
              <th>Tender Data Sheet entry</th>
              {why && <th>Working</th>}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const ks = keys.filter((k) => r.lines[k].group === g)
              if (!ks.length) return null
              return (
                <Fragment key={g}>
                  <tr>
                    <td colSpan={cols} className="font-bold text-accent">
                      {g}
                    </td>
                  </tr>
                  {ks.map((k) => {
                    const line = r.lines[k]
                    return (
                      <tr key={k}>
                        <td className="font-semibold whitespace-nowrap">
                          {line.itt}
                          <div className="font-normal text-mute">{line.item}</div>
                        </td>
                        <td>{line.entry}</td>
                        {why && <td className="text-mute">{line.basis}</td>}
                      </tr>
                    )
                  })}
                </Fragment>
              )
            })}
            {other.map((it) => (
              <tr key={it}>
                <td className="font-semibold">{it}</td>
                <td colSpan={cols - 1}>State the requirement for this tender (see the answer).</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-mute">
        These are the class formulas: turnover = (total cost ÷ years) × 3; liquid asset = cost per month × (months between two bills + 3 months of assumed delay), rounded up; tender security 2 to 3% of the
        cost. PPR 2008 r.22 words the security as a rounded fixed amount, never a percentage, of at most 3% of the official estimate. Always write your assumptions (billing amount, and the duration if the
        paper does not give one).
      </div>
    </div>
  )
}
