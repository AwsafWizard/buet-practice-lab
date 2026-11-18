// Mass-curve table and the picture that goes with it (rainwater tank sizing, RM L6 RWH-2 layout).
import { fmt } from '../../components/DiagramView'
import type { SupplySide } from '../engine/rwh'
import { MassCurve, RwhBars } from './rwh-charts'

export function MassTable({ s }: { s: SupplySide }) {
  const f = (v: number) => fmt(v, 2)
  return (
    <div className="overflow-x-auto">
      <table className="text-xs num w-full min-w-[34rem] border-collapse">
        <thead>
          <tr className="text-faint text-right">
            <th className="text-left py-1 pr-2">Month</th>
            <th className="px-2">Rain (mm)</th>
            <th className="px-2">Harvest (m³)</th>
            <th className="px-2">Cum. harvest</th>
            <th className="px-2">Demand</th>
            <th className="px-2">Cum. demand</th>
            <th className="px-2">Difference</th>
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r) => {
            const hot = r.month === s.maxDiffMonth
            return (
              <tr key={r.month} className={'text-right border-t border-line/60 ' + (hot ? 'bg-accent/15 font-bold' : '')}>
                <td className="text-left py-0.5 pr-2">{r.month}</td>
                <td className="px-2">{fmt(r.rain, 1)}</td>
                <td className="px-2">{f(r.harvest)}</td>
                <td className="px-2">{f(r.cumHarvest)}</td>
                <td className="px-2">{f(r.demand)}</td>
                <td className="px-2">{f(r.cumDemand)}</td>
                <td className="px-2">{f(r.diff)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function MassFigures({ s }: { s: SupplySide }) {
  const cal = Array.from({ length: 12 }, (_, i) => s.rows.find((r) => r.idx === i)!.harvest)
  return (
    <div className="grid gap-3 cq-lg:grid-cols-2">
      <div className="rounded-xl border border-line p-2">
        <div className="text-xs font-bold text-mute px-1">Harvest each month against the demand</div>
        <RwhBars harvest={cal} demand={s.demandUsed} />
      </div>
      <div className="rounded-xl border border-line p-2">
        <div className="text-xs font-bold text-mute px-1">Mass curve</div>
        <MassCurve rows={s.rows} tank={s.tank} />
      </div>
    </div>
  )
}
