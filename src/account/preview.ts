// Plain-text preview of a markdown post (kept apart from the renderer so the start page stays light).

/** first words of a post, as plain text, for the thread list */
export function mdPreview(src: string, max = 180): string {
  const text = src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' [maths] ')
    .replace(/\$(?![\s$])[^$\n]+?\$(?!\d)/g, '[maths]')
    .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, '')
    .replace(/^\s*[-*+]\s+\[x\]\s*/gim, '✓ ')
    .replace(/^\s*[-*+]\s+\[ \]\s*/gm, '☐ ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '🖼 $1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text
}
