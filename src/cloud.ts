// Accounts and progress sync for the public build (Supabase).
// Off unless VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set at build time; never used in the Artifact build.
// Sign-in is an email magic link (PKCE, so the code comes back as ?code=… and leaves the #/route alone).
// Each device upserts only its own row in `progress` (user_id, device_id); every row of the user is merged in,
// exactly like the Artifact sync (see runSync in sync.ts). Schema and row rules: supabase/schema.sql.
import { useSyncExternalStore } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ARTIFACT, runSync, setStatus } from './sync'
import { device } from './timer'
import { pack, unpack } from './pack'

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const CLOUD = !ARTIFACT && !!URL_ && !!KEY

let client: SupabaseClient | null = null
let user: { id: string; email: string } | null = null
let stop: (() => void) | null = null
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

/** the signed-in user right now, and a listener for changes (used by the account / role code) */
export const cloudUser = () => user
export function onCloudUser(f: () => void) {
  subs.add(f)
  return () => void subs.delete(f)
}

export function useCloudUser() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => user,
  )
}

export async function getClient() {
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(URL_!, KEY!, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } })
  }
  return client
}

/** how often an open, visible tab checks for other devices' saves */
const POLL_MS = 5 * 60_000
/** returning to the tab checks too, but not more often than this */
const SHOW_GAP_MS = 20_000

/**
 * The progress table without Realtime (each change used to push the whole row to every open tab, and every
 * tab then re-read every row: 7 GB in a day). First load reads all of the user's rows; after that only other
 * devices' rows the server stamped later than the newest one seen, so a check that finds nothing costs bytes.
 * Rows are gzipped (pack.ts).
 */
function backendFor(sb: SupabaseClient, uid: string) {
  return {
    mineId: device,
    async write(state: string) {
      const { error } = await sb.from('progress').upsert({ user_id: uid, device_id: device, state: await pack(state) }, { onConflict: 'user_id,device_id' })
      if (error) throw error
    },
    watch(next: (docs: { id: string; state?: string }[]) => void, onError: () => void) {
      let alive = true
      let since: string | null = null // newest updated_at seen (server time)
      let busy = false
      let last = 0
      const load = async () => {
        if (busy) return
        busy = true
        last = Date.now()
        try {
          let q = sb.from('progress').select('device_id,state,updated_at').eq('user_id', uid)
          if (since) q = q.neq('device_id', device).gt('updated_at', since)
          const { data, error } = await q
          if (!alive) return
          if (error) return onError()
          const first = !since
          const docs: { id: string; state?: string }[] = []
          for (const r of data ?? []) {
            const at = r.updated_at as string
            if (!since || Date.parse(at) > Date.parse(since)) since = at
            try {
              docs.push({ id: r.device_id as string, state: await unpack(r.state as string) })
            } catch {
              /* packed by a browser that can, unreadable here: skip it */
            }
          }
          // nothing new is the usual answer, and needs no merge
          if (alive && (first || docs.length)) next(docs)
        } catch {
          if (alive) onError()
        } finally {
          busy = false
        }
      }
      void load()
      const onShow = () => document.visibilityState === 'visible' && Date.now() - last > SHOW_GAP_MS && void load()
      document.addEventListener('visibilitychange', onShow)
      const poll = setInterval(() => document.visibilityState === 'visible' && void load(), POLL_MS)
      return () => {
        alive = false
        clearInterval(poll)
        document.removeEventListener('visibilitychange', onShow)
      }
    },
  }
}

function signedIn(sb: SupabaseClient, u: { id: string; email?: string } | null) {
  if (u?.id === user?.id) return
  stop?.()
  stop = null
  user = u ? { id: u.id, email: u.email ?? '' } : null
  emit()
  if (user) {
    setStatus('connecting')
    stop = runSync(backendFor(sb, user.id))
  } else setStatus('local')
}

/** call once at start-up: restores a session (or finishes a magic-link sign-in) and starts syncing */
export async function startCloud() {
  if (!CLOUD) return
  setStatus('local')
  const sb = await getClient()
  sb.auth.onAuthStateChange((_e, session) => signedIn(sb, session?.user ?? null))
  const { data } = await sb.auth.getSession()
  signedIn(sb, data.session?.user ?? null)
  // drop the one-time ?code= from the address bar once it has been exchanged
  if (new URLSearchParams(location.search).has('code')) history.replaceState(null, '', location.pathname + location.hash)
}

/** "2204080" or "2204080@ce.buet.ac.bd" → the institutional address, or null if it is neither */
export function buetEmail(input: string): string | null {
  const v = input.trim().toLowerCase()
  if (/^[0-9]{7}$/.test(v)) return v + '@ce.buet.ac.bd'
  return /^[0-9]{7}@ce\.buet\.ac\.bd$/.test(v) ? v : null
}

/** Supabase auth errors in plain words (by error code where Supabase gives one) */
export function friendly(msg: string, code?: string) {
  // the site's whole email allowance is used up (Supabase's built-in mailer sends only a few per hour)
  if (code === 'over_email_send_rate_limit' || /email rate limit exceeded/i.test(msg))
    return "The site has hit its limit on sign-in emails for this hour (not your fault). If an earlier email reached you, use its link or code; otherwise try again later."
  // this address asked for an email moments ago
  if (code === 'over_request_rate_limit' || /security purposes|only request this after/i.test(msg)) {
    const s = /after (\d+) seconds?/i.exec(msg)?.[1]
    return `An email was just sent to this address. Check your inbox (and spam), or ask again in ${s ? s + ' seconds' : 'a minute'}.`
  }
  if (/database error saving new user|studentID@ce\.buet/i.test(msg)) return 'Only studentID@ce.buet.ac.bd accounts can sign in.'
  if (code === 'otp_expired' || /expired|invalid/i.test(msg)) return 'That code is wrong or has expired. Ask for a new email.'
  return msg
}

/** send a sign-in email (link + 6-digit code); the link opens the site root (the course picker's Continue buttons remember where you were) */
export async function sendMagicLink(input: string) {
  const email = buetEmail(input)
  if (!email) return 'Use your BUET CE mail: studentID@ce.buet.ac.bd'
  const sb = await getClient()
  // no #route in the redirect: Supabase appends ?code=… to the end of it, which must stay before the hash
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } })
  return error ? friendly(error.message, (error as { code?: string }).code) : null
}

/** sign in with the code from the email (works on any device, unlike the link, which must open in the same browser) */
export async function verifyCode(input: string, code: string) {
  const email = buetEmail(input)
  if (!email) return 'Use your BUET CE mail: studentID@ce.buet.ac.bd'
  const sb = await getClient()
  const { error } = await sb.auth.verifyOtp({ email, token: code.replace(/\s/g, ''), type: 'email' })
  return error ? friendly(error.message, (error as { code?: string }).code) : null
}

export async function signOut() {
  const sb = await getClient()
  await sb.auth.signOut()
}
