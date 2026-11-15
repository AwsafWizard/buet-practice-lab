import { describe, expect, it } from 'vitest'
import { buetEmail } from '../cloud'
import { mdPreview, mdToHtml } from './markdown'

describe('thread markdown', () => {
  it('renders GFM: headings, tables, task lists, code', () => {
    const h = mdToHtml('# Notes\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n- [x] done\n\n```\nx = 1\n```')
    expect(h).toContain('<h1>Notes</h1>')
    expect(h).toContain('<table>')
    expect(h).toContain('type="checkbox"')
    expect(h).toContain('<code>x = 1')
  })
  it('renders $inline$ and $$block$$ maths with KaTeX', () => {
    expect(mdToHtml('Use $M = wL^2/8$ here')).toContain('class="katex"')
    expect(mdToHtml('$$\nV = \\frac{wL}{2}\n$$')).toContain('katex-display')
  })
  it('leaves money and code alone', () => {
    expect(mdToHtml('costs $5 and $10')).not.toContain('katex')
    expect(mdToHtml('`$x$`')).not.toContain('katex')
  })
  it('keeps single line breaks', () => {
    expect(mdToHtml('one\ntwo')).toContain('<br>')
  })
  it('previews as plain text', () => {
    expect(mdPreview('## Wind\n**Read** [the slides](http://x) first')).toBe('Wind Read the slides first')
    expect(mdPreview('| a | b |\n|---|---|\n- [x] done $M = wL^2$ my_file.pdf')).toBe('a b ✓ done [maths] my_file.pdf')
    expect(mdPreview('a'.repeat(300)).length).toBe(180)
  })
})

describe('BUET CE email', () => {
  it('accepts a student ID or the full address', () => {
    expect(buetEmail('2204080')).toBe('2204080@ce.buet.ac.bd')
    expect(buetEmail(' 2204038@CE.BUET.AC.BD ')).toBe('2204038@ce.buet.ac.bd')
  })
  it('refuses anything else', () => {
    expect(buetEmail('someone@gmail.com')).toBeNull()
    expect(buetEmail('2204080@buet.ac.bd')).toBeNull()
    expect(buetEmail('220408')).toBeNull()
  })
})
