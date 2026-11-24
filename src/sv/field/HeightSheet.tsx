// Height & distance with a theodolite: inaccessible tower; aerial distance / space triangle from a base AB.
import { useMemo } from 'react'
import { Seg } from '../../components/ui'
import { fmtDMS, parseDMS } from '../engine/angle'
import { aerialDistance, heron, locateTarget, towerHeight, type TargetObs } from '../engine/height'
import { Field, fx, Grid, has, n, type Row } from './Grid'
import { PlanFrame, Station } from './plots'

export interface HeightData {
  mode: 'tower' | 'space'
  // tower
  a: string
  th1: string
  th2: string
  h1: string
  h2: string
  // space triangle
  AB: string
  hi: string
  zenith: boolean
  targets: Row[]
}

export const heightBlank = (): HeightData => ({ mode: 'space', a: '', th1: '', th2: '', h1: '', h2: '', AB: '', hi: '', zenith: true, targets: [{ name: 'F', foot: 'C' }, { name: 'G', foot: 'D' }, { name: 'H', foot: 'E' }] })

/** Nafim's 2022 space triangle: base AB = 30 m, instrument height 1.345 m, zenith readings at A */
export const heightSample = (): HeightData => ({
  mode: 'space',
  a: '10',
  th1: '28 30',
  th2: '35 10',
  h1: '1.50',
  h2: '1.45',
  AB: '30',
  hi: '1.345',
  zenith: true,
  targets: [
    { name: 'F', foot: 'C', atA: '80 15 50', atB: '92 05 46', vA: '80 38 10' },
    { name: 'G', foot: 'D', atA: '53 28 40', atB: '121 34 00', vA: '75 24 40' },
    { name: 'H', foot: 'E', atA: '-2 20 10', atB: '183 02 30', vA: '84 34 50' },
  ],
})

export function HeightSheet({ data, set }: { data: HeightData; set: (d: HeightData) => void }) {
  return (
    <div className="space-y-5">
      <Seg<'tower' | 'space'>
        value={data.mode}
        onChange={(mode) => set({ ...data, mode })}
        items={[
          { v: 'space', label: 'Aerial distance & space triangle' },
          { v: 'tower', label: 'Inaccessible tower' },
        ]}
      />
      {data.mode === 'tower' ? <Tower data={data} set={set} /> : <Space data={data} set={set} />}
    </div>
  )
}

function Tower({ data, set }: { data: HeightData; set: (d: HeightData) => void }) {
  const ok = [data.a, data.h1, data.h2].every(has) && isFinite(parseDMS(data.th1)) && isFinite(parseDMS(data.th2))
  const r = ok ? towerHeight({ a: n(data.a), th1: parseDMS(data.th1), th2: parseDMS(data.th2), h1: n(data.h1), h2: n(data.h2) }) : null
  return (
    <div className="space-y-4">
      <p className="text-xs text-mute">
        Both instrument stations in line with the tower, the far one (θ₁) a metres behind the near one (θ₂). h₁, h₂ = height of the line of sight at each station above a common datum (e.g. RL of the BM + staff reading on it). Lecture sheet: H = h₁ + (a + x) tanθ₁ = h₂ + x tanθ₂.
      </p>
      <div className="flex flex-wrap gap-4 items-end">
        <Field label="a — distance between stations" value={data.a} onChange={(v) => set({ ...data, a: v })} w="6rem" />
        <Field label="θ₁ — elevation from the far station" type="dms" value={data.th1} onChange={(v) => set({ ...data, th1: v })} w="7rem" />
        <Field label="θ₂ — elevation from the near station" type="dms" value={data.th2} onChange={(v) => set({ ...data, th2: v })} w="7rem" />
        <Field label="h₁ — line of sight at far station" value={data.h1} onChange={(v) => set({ ...data, h1: v })} w="6rem" />
        <Field label="h₂ — line of sight at near station" value={data.h2} onChange={(v) => set({ ...data, h2: v })} w="6rem" />
      </div>
      {r && (
        <div className="card p-4 text-sm space-y-1">
          <div>
            tanθ₁ = {r.t1.toFixed(5)}, tanθ₂ = {r.t2.toFixed(5)}
          </div>
          <div>
            x = (h₂ − h₁ − a tanθ₁) / (tanθ₁ − tanθ₂) = ({data.h2} − {data.h1} − {data.a} × {r.t1.toFixed(5)}) / ({r.t1.toFixed(5)} − {r.t2.toFixed(5)}) = <b className="num">{fx(r.x, 3)}</b>
          </div>
          <div>
            H = h₂ + x tanθ₂ = <b className="num text-accent">{fx(r.H, 3)}</b> · check H = h₁ + (a + x) tanθ₁ = <span className="num">{fx(r.Hcheck, 3)}</span>
          </div>
          {r.x < 0 && <div className="text-bad">⚠ x came out negative: θ₁ must be the smaller angle (far station).</div>}
        </div>
      )}
    </div>
  )
}

function Space({ data, set }: { data: HeightData; set: (d: HeightData) => void }) {
  const AB = n(data.AB)
  const hi = has(data.hi) ? n(data.hi) : 0
  const obs: (TargetObs | null)[] = useMemo(
    () =>
      data.targets.map((t) => {
        const atA = parseDMS(t.atA),
          atB = parseDMS(t.atB),
          v = parseDMS(t.vA)
        if (![atA, atB, v].every(isFinite)) return null
        return { name: t.name || '?', atA, atB, vA: data.zenith ? 90 - v : v }
      }),
    [data.targets, data.zenith],
  )
  const sols = AB > 0 ? obs.map((o) => (o ? locateTarget(AB, o) : null)) : []
  const pairs: { p: number; q: number }[] = []
  for (let i = 0; i < obs.length; i++) for (let j = i + 1; j < obs.length; j++) if (obs[i] && obs[j]) pairs.push({ p: i, q: j })
  const dist = AB > 0 ? pairs.map(({ p, q }) => ({ p, q, ...aerialDistance(AB, obs[p]!, obs[q]!) })) : []
  const tri = dist.length === 3 ? heron(dist[0].space, dist[1].space, dist[2].space) : null
  const foot = (i: number) => data.targets[i]?.foot || data.targets[i]?.name || '?'
  return (
    <div className="space-y-4">
      <p className="text-xs text-mute">
        Theodolite at A and at B (base AB taped). For each elevated point (roof corner, pole top): the horizontal angle at A between B and the point, the horizontal angle at B between A and the point, and the vertical angle at A. A point on the other side of AB gets a negative angle at A (and more than 180° at B), as in the seniors’ sheet.
      </p>
      <div className="flex flex-wrap gap-4 items-end">
        <Field label="AB — base (m)" value={data.AB} onChange={(v) => set({ ...data, AB: v })} w="6rem" />
        <Field label="Height of instrument (m)" value={data.hi} onChange={(v) => set({ ...data, hi: v })} w="6rem" hint="added to get heights above ground" />
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Vertical readings are</span>
          <Seg<'z' | 'e'> value={data.zenith ? 'z' : 'e'} onChange={(v) => set({ ...data, zenith: v === 'z' })} items={[{ v: 'z', label: 'zenith (90° = level)' }, { v: 'e', label: 'elevation angles' }]} />
        </label>
      </div>
      <Grid
        rows={data.targets}
        onChange={(targets) => set({ ...data, targets })}
        cols={[
          { key: 'name', label: 'Point', w: '3rem', type: 'text' },
          { key: 'foot', label: 'Foot', w: '3rem', type: 'text' },
          { key: 'atA', label: '∠ at A from AB', w: '7rem', type: 'dms' },
          { key: 'atB', label: '∠ at B from BA', w: '7rem', type: 'dms' },
          { key: 'vA', label: data.zenith ? 'Zenith ∠ at A' : 'Elevation at A', w: '7rem', type: 'dms' },
        ]}
        outs={[
          { label: 'elev.', cell: (i) => (obs[i] ? fmtDMS(obs[i]!.vA) : '') },
          { label: '∠ at point', cell: (i) => (sols[i] ? fmtDMS(sols[i]!.atP) : '') },
          { label: `A${'–'}foot`, cell: (i) => fx(sols[i]?.AP, 2) },
          { label: `B–foot`, cell: (i) => fx(sols[i]?.BP, 2) },
          { label: 'rise above A', cell: (i) => fx(sols[i]?.h, 2) },
          { label: 'height', cell: (i) => <b>{fx(sols[i] ? sols[i]!.h + hi : NaN, 2)}</b>, title: 'rise above the line of sight + instrument height' },
        ]}
      />

      {sols.some(Boolean) && (
        <div className="card p-4 text-sm space-y-3">
          <div className="font-bold">Working (as the sheet sets it out)</div>
          {sols.map(
            (s, i) =>
              s && (
                <div key={i} className="space-y-0.5">
                  <div className="font-semibold">
                    △AB{foot(i)} (horizontal) and △A{foot(i)}
                    {s.name} (vertical)
                  </div>
                  <div className="num text-xs">
                    ∠A{foot(i)}B = 180° − ∠BA{foot(i)} − ∠AB{foot(i)} = {fmtDMS(s.atP)} · A{foot(i)} = AB sin∠AB{foot(i)} / sin∠A{foot(i)}B = <b>{fx(s.AP, 3)}</b> m · B{foot(i)} = AB sin∠BA{foot(i)} / sin∠A{foot(i)}B = {fx(s.BP, 3)} m
                  </div>
                  <div className="num text-xs">
                    {foot(i)}
                    {s.name} = A{foot(i)} tan∠{foot(i)}A{s.name} = {fx(s.AP, 3)} × tan {fmtDMS(obs[i]!.vA)} = <b>{fx(s.h, 3)}</b> m (+ {hi} m instrument = {fx(s.h + hi, 3)} m above ground at A)
                  </div>
                </div>
              ),
          )}
          {dist.map((d, k) => (
            <div key={k} className="num text-xs">
              {foot(d.p)}
              {foot(d.q)} = √(A{foot(d.p)}² + A{foot(d.q)}² − 2·A{foot(d.p)}·A{foot(d.q)} cos {fmtDMS(d.ang)}) = {fx(d.ground, 3)} m → <b>
                {obs[d.p]!.name}
                {obs[d.q]!.name} = √({fx(d.ground, 2)}² + ({fx(d.P.h, 2)} − {fx(d.Q.h, 2)})²) = {fx(d.space, 3)} m
              </b>
            </div>
          ))}
          {tri && dist.length === 3 && (
            <div className="text-sm pt-1 border-t border-line">
              s = (a + b + c)/2 = <span className="num">{fx(tri.s, 3)}</span> m · Area of the space triangle = √(s(s−a)(s−b)(s−c)) = <b className="num text-accent">{fx(tri.area, 2)} m²</b>
            </div>
          )}
        </div>
      )}

      {AB > 0 && sols.some(Boolean) && (
        <PlanFrame north={false} pts={[{ e: 0, n: 0 }, { e: AB, n: 0 }, ...sols.flatMap((s) => (s ? [{ e: s.x, n: s.y }] : []))]} unit="m">
          {({ X, Y }) => (
            <g>
              <line x1={X(0)} y1={Y(0)} x2={X(AB)} y2={Y(0)} stroke="var(--c-ink)" strokeWidth="1.8" />
              {sols.map(
                (s, i) =>
                  s && (
                    <g key={i}>
                      <line x1={X(0)} y1={Y(0)} x2={X(s.x)} y2={Y(s.y)} stroke="var(--c-line)" />
                      <line x1={X(AB)} y1={Y(0)} x2={X(s.x)} y2={Y(s.y)} stroke="var(--c-line)" />
                      <rect x={X(s.x) - 4} y={Y(s.y) - 4} width="8" height="8" fill="var(--c-accent)" opacity="0.8" />
                      <text x={X(s.x) + 7} y={Y(s.y) - 5} fontSize="10.5" fill="var(--c-ink)">
                        {foot(i)} ({s.name}, {fx(s.h + hi, 1)} m)
                      </text>
                    </g>
                  ),
              )}
              {sols.length >= 3 && sols.every(Boolean) && <path d={'M' + sols.map((s) => `${X(s!.x)} ${Y(s!.y)}`).join(' L') + ' Z'} fill="var(--c-accent)" fillOpacity="0.08" stroke="var(--c-accent)" strokeDasharray="5 3" />}
              <Station x={X(0)} y={Y(0)} label="A" />
              <Station x={X(AB)} y={Y(0)} label="B" />
            </g>
          )}
        </PlanFrame>
      )}
      <div className="text-xs text-faint">Plan drawn with AB along the page (not to north). Heights are above the ground at A’s station.</div>
    </div>
  )
}
