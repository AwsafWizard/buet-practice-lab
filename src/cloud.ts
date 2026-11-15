// Accounts and progress sync for the public build (Supabase).
// Off unless VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set at build time; never used in the Artifact build.
// Sign-in is an email magic link (PKCE, so the code comes back as ?code=… and leaves the #/route alone).
// Each device upserts only its own row in `progress` (user_id, device_id); every row of the user is merged in,
// exactly like the Artifact sync (see runSync in sync.ts). Schema and row rules: supabase/schema.sql.
import { useSyncExternalStore } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ARTIFACT, runSync, setStatus } from './sync'
import { device } from './timer'

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

function backendFor(sb: SupabaseClient, uid: string) {
  return {
    mineId: device,
    async write(state: string) {
      const { error } = await sb.from('progress').upsert({ user_id: uid, device_id: device, state, updated_at: new Date().toISOString() }, { onConflict: 'user_id,device_id' })
      if (error) throw error
    },
    watch(next: (docs: { id: string; state?: string }[]) => void, onError: () => void) {
      let alive = true
      const load = async () => {
        const { data, error } = await sb.from('progress').select('device_id,state').eq('user_id', uid)
        if (!alive) return
        if (error) return onError()
        next((data ?? []).map((r) => ({ id: r.device_id as string, state: r.state as string })))
      }
      void load()
      // other devices' saves arrive live; a refetch on return to the tab covers a dropped connection
      const channel = sb
        .channel('progress-' + uid)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'progress', filter: `user_id=eq.${uid}` }, () => void load())
        .subscribe()
      const onShow = () => document.visibilityState === 'visible' && void load()
      document.addEventListener('visibilitychange', onShow)
      return () => {
        alive = false
        document.removeEventListener('visibilitychange', onShow)
        void sb.removeChannel(channel)
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

function friendly(msg: string) {
  if (/database error saving new user|studentID@ce\.buet/i.test(msg)) return 'Only studentID@ce.buet.ac.bd accounts can sign in.'
  if (/rate limit|too many|security purposes/i.test(msg)) return 'Too many sign-in emails just now. Wait a few minutes and try again.'
  if (/expired|invalid/i.test(msg)) return 'That code is wrong or has expired. Ask for a new email.'
  return msg
}

/** send a sign-in email (link + 6-digit code); the link opens the site root (the course picker's Continue buttons remember where you were) */
export async function sendMagicLink(input: string) {
  const email = buetEmail(input)
  if (!email) return 'Use your BUET CE mail: studentID@ce.buet.ac.bd'
  const sb = await getClient()
  // no #route in the redirect: Supabase appends ?code=… to the end of it, which must stay before the hash
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } })
  return error ? friendly(error.message) : null
}

/** sign in with the code from the email (works on any device, unlike the link, which must open in the same browser) */
export async function verifyCode(input: string, code: string) {
  const email = buetEmail(input)
  if (!email) return 'Use your BUET CE mail: studentID@ce.buet.ac.bd'
  const sb = await getClient()
  const { error } = await sb.auth.verifyOtp({ email, token: code.replace(/\s/g, ''), type: 'email' })
  return error ? friendly(error.message) : null
}

export async function signOut() {
  const sb = await getClient()
  await sb.auth.signOut()
}
