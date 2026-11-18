// Table of operating points (one pump, two in parallel, two in series) at the minimum and maximum reservoir level.
import { fmt } from '../../components/DiagramView'
import type { OpPoint } from '../engine/pump'

export function PumpCurvesTable({ rows }: { rows: { name: string; min: OpPoint; max: OpPoint }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs num w-full min-w-[30rem] border-collapse">
        <thead>
          <tr className="text-faint text-right">
            <th className="text-left py-1">Duty</th>
            <th className="px-2">Q min level (m³/s)</th>
            <th className="px-2">H min level (m)</th>
            <th className="px-2">Q max level (m³/s)</th>
            <th className="px-2">H max level (m)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="text-right border-t border-line/60">
              <td className="text-left py-0.5">{r.name}</td>
              <td className="px-2">{fmt(r.min.Q, 3)}</td>
              <td className="px-2">{fmt(r.min.H, 2)}</td>
              <td className="px-2">{fmt(r.max.Q, 3)}</td>
              <td className="px-2">{fmt(r.max.H, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
