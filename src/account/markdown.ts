// Markdown for Threads: GitHub-flavoured (tables, task lists, fenced code), single line breaks kept,
// $inline$ and $$block$$ maths through KaTeX. Output is sanitised before it reaches the page.
import DOMPurify from 'dompurify'
import katex from 'katex'
import { Marked, type TokenizerAndRendererExtension } from 'marked'

const tex = (s: string, display: boolean) => katex.renderToString(s, { displayMode: display, throwOnError: false, strict: false })

const mathBlock: TokenizerAndRendererExtension = {
  name: 'mathBlock',
  level: 'block',
  start: (src) => src.match(/^ {0,3}\$\$/m)?.index,
  tokenizer(src) {
    const m = /^ {0,3}\$\$([\s\S]+?)\$\$[ \t]*(?:\n+|$)/.exec(src)
    if (m) return { type: 'mathBlock', raw: m[0], text: m[1].trim() }
  },
  renderer: (t) => `<div class="md-math">${tex(t.text, true)}</div>`,
}

const mathInline: TokenizerAndRendererExtension = {
  name: 'mathInline',
  level: 'inline',
  start: (src) => {
    const i = src.indexOf('$')
    return i < 0 ? undefined : i
  },
  tokenizer(src) {
    // $$…$$ inline = display; $…$ needs no space inside the dollars and no digit right after ("$5 and $10" stays text)
    const m = /^\$\$([^$]+?)\$\$/.exec(src) ?? /^\$(?![\s$])((?:\\\$|[^$\n])+?)(?<![\s\\])\$(?!\d)/.exec(src)
    if (m) return { type: 'mathInline', raw: m[0], text: m[1], display: m[0].startsWith('$$') }
  },
  renderer: (t) => tex(t.text, !!t.display),
}

const md = new Marked({ gfm: true, breaks: true, extensions: [mathBlock, mathInline] })

/** markdown → HTML (not yet sanitised) */
export function mdToHtml(src: string): string {
  return md.parse(src, { async: false }) as string
}

let hooked = false
/** markdown → safe HTML; links open in a new tab */
export function renderMd(src: string): string {
  if (!hooked) {
    hooked = true
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A' && node.getAttribute('href') && !node.getAttribute('href')!.startsWith('#')) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
      if (node.tagName === 'IMG') node.setAttribute('loading', 'lazy')
    })
  }
  return DOMPurify.sanitize(mdToHtml(src), { ADD_ATTR: ['target'] })
}

export { mdPreview } from './preview'
