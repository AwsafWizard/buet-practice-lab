// Test helper: every generated design problem must be finite, positive and sensible.
import { expect } from 'vitest'
import type { DProblem } from './designCore'

export function checkProblem(p: DProblem, ctx: string) {
  expect(p.steps.length, ctx).toBeGreaterThan(4)
  expect(p.text, ctx).not.toMatch(/NaN|undefined|Infinity/)
  expect(p.answer, ctx).not.toMatch(/NaN|undefined|Infinity|—/)
  for (const s of p.steps) {
    if (s.choice) {
      expect(s.choice.options.map((o) => o.v), `${ctx} ${s.key}`).toContain(s.choice.answer)
      continue
    }
    expect(Number.isFinite(s.value), `${ctx} ${s.key} = ${s.value}`).toBe(true)
    expect(s.value!, `${ctx} ${s.key}`).toBeGreaterThan(0)
    expect(s.label, ctx).not.toMatch(/NaN|undefined/)
  }
  for (const sec of p.sol) for (const st of sec.steps) if (st.v !== undefined) expect(Number.isFinite(st.v), `${ctx} sol ${st.t}`).toBe(true)
  const val = (k: string) => p.steps.find((s) => s.key === k)?.value
  return val
}
