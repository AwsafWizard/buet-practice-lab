// Turns solver output (exact or approximate) into sampled N/V/M along each member, ready to draw.

import type { MemberResult, Result } from './frame2d'
import type { Model } from './model'

export interface Sample {
  t: number // distance from end i
  N: number
  V: number
  M: number
}

export interface DiagramMember {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  L: number
  truss: boolean
  samples: Sample[]
}

/**
 * Sample a member: fine grid + both sides of every break (so jumps are kept).
 * Members are re-oriented so that horizontal members run left→right and vertical/inclined ones
 * bottom→top. This matches how the sign conventions are taught (beam: sagging +, left-up shear +).
 */
export function sampleMember(model: Model, mr: MemberResult, n = 40): DiagramMember {
  const mem = model.members.find((m) => m.id === mr.id)!
  const ni = model.nodes.find((q) => q.id === mem.i)!
  const nj = model.nodes.find((q) => q.id === mem.j)!
  const L = mr.L
  const ts = new Set<number>()
  for (let k = 0; k <= n; k++) ts.add((L * k) / n)
  for (const b of mr.breaks) ts.add(b)
  const sorted = [...ts].sort((a, b) => a - b)
  const raw: Sample[] = []
  for (const t of sorted) {
    const isBreak = mr.breaks.some((b) => Math.abs(b - t) < 1e-9) && t > 1e-9 && t < L - 1e-9
    if (isBreak) {
      raw.push({ t, N: mr.N(t, -1), V: mr.V(t, -1), M: mr.M(t, -1) })
      raw.push({ t, N: mr.N(t, 1), V: mr.V(t, 1), M: mr.M(t, 1) })
    } else {
      const side = t >= L - 1e-9 ? -1 : 1
      raw.push({ t, N: mr.N(t, side), V: mr.V(t, side), M: mr.M(t, side) })
    }
  }
  const dm: DiagramMember = { id: mr.id, x1: ni.x, y1: ni.y, x2: nj.x, y2: nj.y, L, truss: mr.truss, samples: raw }
  return normalise(dm)
}

/** flip i/j so horizontal members go left→right, others bottom→top */
export function normalise(dm: DiagramMember): DiagramMember {
  const dx = dm.x2 - dm.x1
  const dy = dm.y2 - dm.y1
  const flip = Math.abs(dy) < 1e-9 ? dx < 0 : dy < 0
  if (!flip) return dm
  return {
    ...dm,
    x1: dm.x2,
    y1: dm.y2,
    x2: dm.x1,
    y2: dm.y1,
    // reversing the axis also flips the local y axis: N and V keep their sign, M flips
    samples: dm.samples
      .map((s) => ({ t: dm.L - s.t, N: s.N, V: s.V, M: -s.M }))
      .reverse(),
  }
}

export function diagramsFromResult(model: Model, r: Result): DiagramMember[] {
  return r.members.map((m) => sampleMember(model, m))
}

/** Build a diagram member from end values for members without span loads (approximate methods). */
export function linearMember(
  id: string,
  p1: [number, number],
  p2: [number, number],
  vals: { N: number; V: number; Mi: number; Mj: number },
): DiagramMember {
  const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
  const samples: Sample[] = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    t: f * L,
    N: vals.N,
    V: vals.V,
    M: vals.Mi + (vals.Mj - vals.Mi) * f,
  }))
  return normalise({ id, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], L, truss: false, samples })
}

/** extreme values for labelling */
export function keyValues(dm: DiagramMember, key: 'N' | 'V' | 'M') {
  const out: { t: number; v: number }[] = []
  const s = dm.samples
  const push = (t: number, v: number) => {
    if (out.some((o) => Math.abs(o.t - t) < 1e-6 && Math.abs(o.v - v) < 1e-6)) return
    out.push({ t, v })
  }
  push(s[0].t, s[0][key])
  push(s[s.length - 1].t, s[s.length - 1][key])
  for (let i = 1; i < s.length - 1; i++) {
    const a = s[i - 1][key]
    const b = s[i][key]
    const c = s[i + 1][key]
    const jump = Math.abs(s[i].t - s[i - 1].t) < 1e-9 || Math.abs(s[i + 1].t - s[i].t) < 1e-9
    if (jump || (b >= a && b >= c && (b > a || b > c)) || (b <= a && b <= c && (b < a || b < c))) push(s[i].t, b)
  }
  return out
}
