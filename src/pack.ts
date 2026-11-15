// Gzip + base64 for the progress rows in Supabase: a 140 KB copy (mostly the attempts list) packs to a
// small fraction of that, and every byte read back counts toward the free plan's egress.
// Rows written before this (plain JSON) and browsers without CompressionStream keep working: unpack
// passes plain text through, and pack falls back to plain text.

const GZ = 'gz1:'

async function pipe(bytes: Uint8Array, stream: GenericTransformStream) {
  return new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream)).arrayBuffer())
}

export async function pack(text: string): Promise<string> {
  if (typeof CompressionStream === 'undefined') return text
  try {
    const gz = await pipe(new TextEncoder().encode(text), new CompressionStream('gzip'))
    let bin = ''
    for (let i = 0; i < gz.length; i += 0x8000) bin += String.fromCharCode(...gz.subarray(i, i + 0x8000))
    return GZ + btoa(bin)
  } catch {
    return text
  }
}

/** throws if the text is packed and this browser can't unpack it (the caller skips that row) */
export async function unpack(text: string): Promise<string> {
  if (!text.startsWith(GZ)) return text
  const bin = atob(text.slice(GZ.length))
  const gz = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(await pipe(gz, new DecompressionStream('gzip')))
}
