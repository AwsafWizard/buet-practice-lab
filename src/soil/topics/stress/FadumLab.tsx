// The Newmark chart lab: a paper plan overlaid at AB = z with the meshes counted. (The Fadum superposition builder
// that lived here is now the Fadum / Steinbrenner tab of the calculators.)
import { useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Md, Seg } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { NumIn } from '../../../reference/common'
import { NEWMARK_IF, newmarkCount, rectsInside, shapeI } from '../../engine/stressdist'
import { openSmRef } from '../../reference/pane'
import { NewmarkChart } from './newmark'
import { randomShape, SHAPES, TANK, type ShapeCase } from './shapes'

const f2 = (v: number) => fmt(v, 2)
const f4 = (v: number) => fmt(v, 4)

function ShapePicker({ value, onPick, withTank }: { value: ShapeCase; onPick: (s: ShapeCase) => void; withTank?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn" onClick={() => onPick(randomShape(Math.floor(Math.random() * 1e9)))}>
        🎲 Random plan
      </button>
      <select
        className="field !py-1 !text-xs max-w-full"
        value={[...SHAPES, TANK].some((s) => s.key === value.key) ? value.key : ''}
        onChange={(e) => {
          const s = [...SHAPES, TANK].find((x) => x.key === e.target.value)
          if (s) onPick(s)
        }}
      >
        <option value="">Load a paper plan…</option>
        {(withTank ? [...SHAPES, TANK] : SHAPES).map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function NewmarkLab() {
  const [c, setC] = useState<ShapeCase>(SHAPES[0])
  const [manual, setManual] = useState(false)
  const [z, setZ] = useState(c.z)
  const [q, setQ] = useState(150)
  const pick = (s: ShapeCase) => {
    setC(s)
    setZ(s.z)
    setQ(s.key === 't2122' ? 150 : s.q)
  }
  const inside = useMemo(() => (c.circle ? (x: number, y: number) => (x + c.P[0] - c.circle!.cx) ** 2 + (y + c.P[1] - c.circle!.cy) ** 2 <= c.circle!.r ** 2 : (x: number, y: number) => rectsInside(c.rects)(x + c.P[0], y + c.P[1])), [c])
  const cnt = useMemo(() => (z > 0 ? newmarkCount(inside, z, 8) : null), [inside, z])
  const exact = c.circle ? null : shapeI(c.rects, c.P[0], c.P[1], z)
  const rel = c.rects.map((r) => ({ x1: r.x1 - c.P[0], y1: r.y1 - c.P[1], x2: r.x2 - c.P[0], y2: r.y2 - c.P[1] }))
  const key = hashKey(JSON.stringify([c.key, c.rects, c.P, z, q]))
  const id = (k: string) => `sm-stress:lab:newmark:${key}:${k}`
  return (
    <div className="space-y-3">
      <ShapePicker value={c} onPick={pick} withTank />
      {c.note && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{c.note}</div>}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <NumIn label="z (= AB)" value={z} onChange={setZ} step={0.5} unit="m" w="w-14" />
        <NumIn label="q" value={q} onChange={setQ} step={10} unit="kPa" w="w-16" />
        <Seg size="xs" value={manual ? 'm' : 'a'} onChange={(v) => setManual(v === 'm')} items={[{ v: 'a', label: 'show the count' }, { v: 'm', label: 'I count (hide meshes)' }]} />
      </div>
      {cnt && (
        <div className="grid cq-lg:grid-cols-[1fr_18rem] gap-4">
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <NewmarkChart size={420} z={z} rects={rel} circles={c.circle ? [{ cx: c.circle.cx - c.P[0], cy: c.circle.cy - c.P[1], r: c.circle.r }] : undefined} meshes={manual ? undefined : cnt.meshes} />
            <div className="text-xs text-faint">The plan is drawn so that AB = z = {f2(z)} m, with P at the centre. Shading = fraction of each mesh covered (weighted by influence, so the count is exact).</div>
          </div>
          <div key={key} className="space-y-2 text-sm">
            {!manual && (
              <div className="overflow-x-auto">
                <table className="tbl text-xs num">
                  <thead>
                    <tr>
                      <th className="txt">ring (σz/q band)</th>
                      <th>meshes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cnt.perRing.map((v, i) => (
                      <tr key={i}>
                        <td className="txt">
                          {i + 1} ({fmt(i / 10, 1)}–{fmt((i + 1) / 10, 1)})
                        </td>
                        <td>{fmt(v, 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Answer id={id('N')} label="meshes N" value={cnt.N} tol={0.05} hint="±5 %: a hand count" compact />
            <Answer id={id('s')} label="σz = 0.005Nq" value={NEWMARK_IF * cnt.N * q} unit="kPa" tol={0.05} compact />
            <Md className="text-xs">{`N = ${fmt(cnt.N, 1)} → σz = 0.005 × ${fmt(cnt.N, 1)} × ${f2(q)} = **${f2(NEWMARK_IF * cnt.N * q)} kPa**${exact !== null ? `; Fadum superposition: ΣI = ${f4(exact)} → N = ${fmt(exact / NEWMARK_IF, 1)}, σz = ${f2(q * exact)} kPa` : `; formula ${f2(q * (1 - (1 / (1 + (c.circle!.r / z) ** 2)) ** 1.5))} kPa`}.`}</Md>
            <button className="text-xs text-accent underline" onClick={() => openSmRef('d-newmark')}>
              chart construction ↗
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
