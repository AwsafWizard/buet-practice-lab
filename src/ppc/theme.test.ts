// "Make sure the Dracula theme works": every text colour CE 301 uses must be readable on every surface.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')

function block(selector: string): Record<string, string> {
  const i = css.indexOf(selector)
  if (i < 0) throw new Error('no ' + selector)
  const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i))
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)) out[m[1]] = m[2]
  return out
}

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const THEMES = {
  alucard: block("[data-course='ce301'][data-theme='light']"),
  dracula: block("[data-course='ce301'][data-theme='dark']"),
}

describe.each(Object.entries(THEMES))('%s', (_, t) => {
  const surfaces = ['bg', 'panel', 'panel2']
  it('body and muted text pass AA (4.5:1) on every surface', () => {
    for (const s of surfaces)
      for (const fg of ['ink', 'mute']) expect(contrast(t['c-' + fg], t['c-' + s]), `${fg} on ${s}`).toBeGreaterThanOrEqual(4.5)
  })
  it('accents and status colours used as text pass AA on every surface', () => {
    for (const s of surfaces)
      for (const fg of ['accent', 'accent2', 'good', 'bad', 'load', 'ia', 'oia', 'aan', 'tension'])
        expect(contrast(t['c-' + fg], t['c-' + s]), `${fg} on ${s}`).toBeGreaterThanOrEqual(4.5)
  })
  it('faint labels stay legible (3:1, large/secondary text)', () => {
    for (const s of surfaces) expect(contrast(t['c-faint'], t['c-' + s]), `faint on ${s}`).toBeGreaterThanOrEqual(3)
  })
  it('primary button text (page background on accent) passes AA', () => {
    expect(contrast(t['c-bg'], t['c-accent'])).toBeGreaterThanOrEqual(4.5)
  })
  it('lines are visible against panels', () => {
    expect(contrast(t['c-line'], t['c-panel'])).toBeGreaterThanOrEqual(1.25)
  })
})
