// The Artifact publisher wraps the page in its own <!doctype><html><head><body> skeleton,
// so keep only the inner head + body content of the single-file build.
import { readFileSync, writeFileSync } from 'node:fs'

const file = 'dist-artifact/index.html'
const html = readFileSync(file, 'utf8')
const head = html.match(/<head>([\s\S]*)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '')
const body = html.match(/<body>([\s\S]*)<\/body>/)[1]
writeFileSync(file, head.trim() + '\n' + body.trim() + '\n')
console.log(`artifact page: ${(Buffer.byteLength(head + body) / 1e6).toFixed(2)} MB`)
