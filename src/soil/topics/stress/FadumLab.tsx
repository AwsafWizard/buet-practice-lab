// Fadum superposition builder: draw L, T or notched plans from rectangles on a grid, pick the point, see the ± corner
// rectangles and ΣI. And the Newmark chart lab: the same plan overlaid at AB = z with the meshes counted.
import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Md, Reveal, Seg } from '../../../components/ui'
import { CheckTable, hashKey, type CheckCol } from '../../../labs/CheckTable'
import { NumIn } from '../../../reference/common'
import { cornerTerms, NEWMARK_IF, newmarkCount, rectsInside, shapeI, simplifyTerms, type CornerTerm, type Rect } from '../../engine/stressdist'
import { markUsed, openSmRef } from '../../reference/pane'
import { NewmarkChart } from './newmark'
import { PlanFig, viewFor } from './figs'
import { randomShape, SHAPES, TANK, type ShapeCase } from './shapes'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)
const snap = (v: number, g = 0.5) => Math.round(v / g) * g

function overlaps(rs: Rect[]) {
  for (let i = 0; i < rs.length; i++)
    for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i]
      const b = rs[j]
      const w = Math.min(Math.max(a.x1, a.x2), Math.max(b.x1, b.x2)) - Math.max(Math.min(a.x1, a.x2), Math.min(b.x1, b.x2))
      const h = Math.min(Math.max(a.y1, a.y2), Math.max(b.y1, b.y2)) - Math.max(Math.min(a.y1, a.y2), Math.min(b.y1, b.y2))
      if (w > 1e-9 && h > 1e-9) return true
    }
  return false
}
const norm = (r: Rect): Rect => ({ x1: Math.min(r.x1, r.x2), y1: Math.min(r.y1, r.y2), x2: Math.max(r.x1, r.x2), y2: Math.max(r.y1, r.y2) })

type TermRow = CornerTerm & { k: string }
const COLS: CheckCol<TermRow>[] = [{ key: 'I', label: 'I(m, n)', get: (t) => t.I, abs: 0.002, digits: 4 }]

function useShape(initial: ShapeCase) {
  const [c, setC] = useState<ShapeCase>(initial)
  return [c, setC] as const
}

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

export function FadumBuilder() {
  const [c, setC] = useShape(SHAPES[0])
  const [mode, setMode] = useState<'draw' | 'point' | 'erase'>('draw')
  const [draft, setDraft] = useState<Rect | null>(null)
  const set = (o: Partial<ShapeCase>) => setC({ ...c, ...o, key: c.key.endsWith('*') ? c.key : c.key + '*', note: undefined })
  const view = useMemo(() => {
    const v = viewFor(c.rects, c.P, 2)
    return { x0: Math.min(v.x0, -4), y0: Math.min(v.y0, -4), x1: Math.max(v.x1, 8), y1: Math.max(v.y1, 6) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.key])
  const terms = useMemo(() => simplifyTerms(c.rects.flatMap((r) => cornerTerms(r, c.P[0], c.P[1], c.z))), [c])
  const I = shapeI(c.rects, c.P[0], c.P[1], c.z)
  const ok = c.rects.length > 0 && c.z > 0 && Number.isFinite(c.q)
  useEffect(() => {
    if (ok) markUsed('d-fadum', { mn: terms.map((t) => `${t.m.toFixed(3)},${t.n.toFixed(3)}`).join(';') })
  })
  const key = hashKey(JSON.stringify([c.rects, c.P, c.z, c.q]))
  const id = (k: string) => `sm-stress:lab:fadum:${key}:${k}`
  const down = (x: number, y: number) => {
    if (mode === 'point') set({ P: [snap(x), snap(y)] })
    else if (mode === 'erase') {
      const i = c.rects.findIndex((r) => x >= Math.min(r.x1, r.x2) && x <= Math.max(r.x1, r.x2) && y >= Math.min(r.y1, r.y2) && y <= Math.max(r.y1, r.y2))
      if (i >= 0) set({ rects: c.rects.filter((_, j) => j !== i) })
    } else setDraft({ x1: snap(x), y1: snap(y), x2: snap(x), y2: snap(y) })
  }
  const move = (x: number, y: number) => draft && setDraft({ ...draft, x2: snap(x), y2: snap(y) })
  const up = () => {
    if (draft && Math.abs(draft.x2 - draft.x1) > 0 && Math.abs(draft.y2 - draft.y1) > 0) set({ rects: [...c.rects, norm(draft)] })
    setDraft(null)
  }
  return (
    <div className="space-y-3">
      <ShapePicker value={c} onPick={(s) => setC(s)} />
      {c.note && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{c.note}</div>}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Seg value={mode} onChange={setMode} items={[{ v: 'draw', label: '▭ draw rectangle' }, { v: 'point', label: '• move P' }, { v: 'erase', label: '✕ erase' }]} />
        <NumIn label="P x" value={c.P[0]} onChange={(v) => set({ P: [v, c.P[1]] })} step={0.5} unit="m" w="w-14" />
        <NumIn label="P y" value={c.P[1]} onChange={(v) => set({ P: [c.P[0], v] })} step={0.5} unit="m" w="w-14" />
        <NumIn label="z" value={c.z} onChange={(v) => set({ z: v })} step={0.5} unit="m" w="w-14" />
        <NumIn label="q" value={c.q} onChange={(v) => set({ q: v })} step={10} unit="kPa" w="w-16" />
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ rects: [] })}>
          clear
        </button>
      </div>
      <div className="grid cq-lg:grid-cols-[1fr_20rem] gap-4">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <PlanFig rects={c.rects} P={c.P} terms={terms} view={view} draft={draft} onDown={down} onMove={move} onUp={up} grid={1} />
          <div className="text-xs text-faint">Drag on the grid to add a loaded rectangle (snaps to 0.5 m). Green dashed = + corner rectangle, red = − (fictitious). Rectangles must not overlap.</div>
        </div>
        <div key={key} className="space-y-2 text-sm">
          {overlaps(c.rects) && <Callout kind="trap">Two rectangles overlap — that area would be counted twice.</Callout>}
          {ok ? (
            <>
              <CheckTable rows={terms.map((t, i) => ({ ...t, k: `t${i}` }))} rowKey={(t) => t.k} given={[{ label: '±', get: (t) => (t.sign > 0 ? '+' : '−') }, { label: 'B × L', get: (t) => `${f2(t.B)} × ${f2(t.L)}` }, { label: 'm', get: (t) => f3(t.m) }, { label: 'n', get: (t) => f3(t.n) }]} cols={COLS} idp={id('terms')} />
              <Answer id={id('I')} label="ΣI" value={I} digits={4} abs={0.002} compact />
              <Answer id={id('s')} label="σz = qΣI" value={c.q * I} unit="kPa" compact />
              <button className="text-xs text-accent underline" onClick={() => openSmRef('d-fadum')}>
                Fadum chart ↗
              </button>
              <Reveal id={id('sol')} title="Solution">
                <Md>{`Rectangles with a corner at P (z = ${f2(c.z)} m): ${terms.map((t) => `${t.sign > 0 ? '+' : '−'}I(${f3(t.m)}, ${f3(t.n)}) = ${t.sign > 0 ? '' : '−'}${f4(t.I)}`).join('; ')}. ΣI = **${f4(I)}**, σz = ${f2(c.q)} × ${f4(I)} = **${f2(c.q * I)} kPa**. (Newmark: N = ΣI/0.005 ≈ ${fmt(I / NEWMARK_IF, 1)} meshes.)`}</Md>
              </Reveal>
            </>
          ) : (
            <div className="text-bad">Draw at least one rectangle; z must be positive.</div>
          )}
        </div>
      </div>
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
