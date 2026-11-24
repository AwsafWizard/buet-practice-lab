// Accounts, roles and Threads on Supabase (public build only; tables and rules in supabase/accounts.sql).
// Reading Threads needs no account. Writing is checked by the database: only admins can post, edit,
// upload or change roles, whatever the browser sends.
import { useSyncExternalStore } from 'react'
import { CLOUD, cloudUser, getClient, onCloudUser } from '../cloud'
import { topicTag } from './topics'

export type Course = 'ce311' | 'ce315' | 'ce341' | 'ce301' | 'ce331' | 'ce104'
export type ThreadCourse = Course | 'all'

export const COURSE_NAME: Record<ThreadCourse, string> = {
  all: 'All courses',
  ce311: 'CE 311',
  ce315: 'CE 315',
  ce341: 'CE 341',
  ce301: 'CE 301',
  ce331: 'CE 331',
  ce104: 'CE 104',
}

/** a page inside a course: CE 311's pages sit at the root (/time), the others under /ce3xx */
export const coursePath = (c: Course, sub: string) => (c === 'ce311' ? '/' : `/${c}/`) + sub

/** the Account page: inside a course (its theme and sidebar), or on its own in the start page's look */
export const accountPath = (c?: Course) => (c ? `/${c}/account` : '/account')

// ─────────────────────────────────────────────────────────────── tiny external stores
function store<T>(init: T) {
  let v = init
  const subs = new Set<() => void>()
  return {
    get: () => v,
    set(p: Partial<T>) {
      v = { ...v, ...p }
      subs.forEach((f) => f())
    },
    use(): T {
      return useSyncExternalStore(
        (f) => (subs.add(f), () => void subs.delete(f)),
        () => v,
      )
    },
  }
}

// ─────────────────────────────────────────────────────────────── account + role
export interface Profile {
  email: string
  student_id: string
  display_name: string | null
  created_at: string
  last_seen: string | null
}

const acct = store({ admin: false, profile: null as Profile | null, loading: false, missing: false })

async function loadAccount() {
  const u = cloudUser()
  if (!u) return acct.set({ admin: false, profile: null, loading: false })
  acct.set({ loading: true })
  const sb = await getClient()
  await sb.rpc('touch_profile')
  const [role, prof] = await Promise.all([sb.rpc('is_admin'), sb.from('profiles').select('email,student_id,display_name,created_at,last_seen').eq('id', u.id).maybeSingle()])
  if (cloudUser()?.id !== u.id) return
  acct.set({ admin: role.data === true, profile: (prof.data as Profile | null) ?? null, loading: false, missing: !!role.error && !!prof.error })
}

let acctStarted = false
/** { admin, profile, loading } for whoever is signed in (admin false when signed out) */
export function useAccount() {
  if (CLOUD && !acctStarted) {
    acctStarted = true
    onCloudUser(() => void loadAccount())
    void loadAccount()
  }
  return acct.use()
}

export async function setDisplayName(name: string) {
  const u = cloudUser()
  if (!u) return 'Not signed in'
  const sb = await getClient()
  const { error } = await sb
    .from('profiles')
    .update({ display_name: name.trim() || null })
    .eq('id', u.id)
  if (!error) await loadAccount()
  return error?.message ?? null
}

// ─────────────────────────────────────────────────────────────── admin tools
export interface Member extends Profile {
  is_admin: boolean
}

export async function listMembers(): Promise<Member[]> {
  const sb = await getClient()
  const { data, error } = await sb.rpc('list_members')
  if (error) throw error
  return (data ?? []) as Member[]
}

/** every admin, including people promoted before their first sign-in */
export async function listAdmins(): Promise<{ email: string; added_by: string | null; added_at: string }[]> {
  const sb = await getClient()
  const { data, error } = await sb.from('admins').select('email,added_by,added_at').order('added_at')
  if (error) throw error
  return data ?? []
}

export async function addAdmin(idOrEmail: string) {
  const sb = await getClient()
  const { error } = await sb.rpc('add_admin', { target: idOrEmail })
  return error?.message ?? null
}

export async function removeAdmin(email: string) {
  const sb = await getClient()
  const { error } = await sb.rpc('remove_admin', { target: email })
  return error?.message ?? null
}

// ─────────────────────────────────────────────────────────────── threads
export interface Thread {
  id: string
  course: ThreadCourse
  title: string
  pinned: boolean
  /** topic ids (e.g. 'pc-law'); the thread also shows on those topics' pages */
  topics: string[]
  author_name: string | null
  created_at: string
  updated_at: string
}
export interface Post {
  id: string
  thread_id: string
  body: string
  author_name: string | null
  created_at: string
  edited_at: string | null
}

type ThreadStatus = 'off' | 'loading' | 'ready' | 'missing' | 'error'
const th = store({ status: (CLOUD ? 'loading' : 'off') as ThreadStatus, threads: [] as Thread[], posts: [] as Post[], seen: readSeen() })

async function loadThreads() {
  const sb = await getClient()
  const [t, p] = await Promise.all([sb.from('threads').select('*'), sb.from('thread_posts').select('*').order('created_at')])
  const err = t.error ?? p.error
  if (err) {
    // the tables don't exist until supabase/accounts.sql has been run
    const missing = err.code === '42P01' || err.code === 'PGRST205' || /does not exist|schema cache/i.test(err.message)
    if (th.get().status !== 'ready' || missing) th.set({ status: missing ? 'missing' : 'error' })
    return
  }
  th.set({ status: 'ready', threads: t.data as Thread[], posts: p.data as Post[] })
}

let thStarted = false
let reloadTimer: ReturnType<typeof setTimeout> | undefined
const reloadSoon = () => {
  clearTimeout(reloadTimer)
  reloadTimer = setTimeout(() => void loadThreads(), 300)
}
// No Realtime: the free plan allows 200 open connections, and a live channel per open tab wouldn't
// survive a whole class. New posts show on return to the tab (at most once a minute) and every 10 minutes.
const THREADS_GAP_MS = 60_000
const THREADS_POLL_MS = 10 * 60_000
let thLoaded = 0
async function startThreads() {
  thLoaded = Date.now()
  await loadThreads()
  const due = () => document.visibilityState === 'visible' && Date.now() - thLoaded > THREADS_GAP_MS
  const reload = () => {
    thLoaded = Date.now()
    reloadSoon()
  }
  document.addEventListener('visibilitychange', () => due() && reload())
  setInterval(() => due() && reload(), THREADS_POLL_MS)
}

/** every thread and post (all courses), loaded once, refreshed on return to the tab */
export function useThreads() {
  if (CLOUD && !thStarted) {
    thStarted = true
    void startThreads()
  }
  return th.use()
}

const byActivity = (a: Thread, b: Thread) => Number(b.pinned) - Number(a.pinned) || b.updated_at.localeCompare(a.updated_at)

/** a course's threads: its own, the "All courses" ones and any tagged with one of its topics; pinned first, then latest activity */
export function threadsFor(threads: Thread[], course: Course, topicCourse: (id: string) => string | undefined) {
  return threads.filter((t) => t.course === course || t.course === 'all' || (t.topics ?? []).some((id) => topicCourse(id) === course)).sort(byActivity)
}

/** threads tagged with one topic */
export const threadsForTopic = (threads: Thread[], topic: string) => threads.filter((t) => (t.topics ?? []).includes(topic)).sort(byActivity)

// "new" marks, per device
const SEEN_KEY = 'threads:seen'
const FIRST_KEY = 'threads:firstVisit'
function readSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
  } catch {
    return {}
  }
}
const firstVisit = (() => {
  try {
    let v = localStorage.getItem(FIRST_KEY)
    if (!v) localStorage.setItem(FIRST_KEY, (v = new Date(Date.now() - 7 * 86400000).toISOString()))
    return v
  } catch {
    return new Date(Date.now() - 7 * 86400000).toISOString()
  }
})()

/** changed since you last opened it (or, never opened, posted in the week before your first visit or later) */
export const isNew = (t: Thread, seen: Record<string, string>) => t.updated_at > (seen[t.id] ?? firstVisit)

export function markSeen(t: Thread) {
  const seen = { ...th.get().seen, [t.id]: t.updated_at }
  if (th.get().seen[t.id] === t.updated_at) return
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {
    /* storage blocked */
  }
  th.set({ seen })
}

/** unread threads for a course, for the sidebar badge */
export function useUnread(course: Course) {
  const s = useThreads()
  return s.status === 'ready' ? threadsFor(s.threads, course, (id) => topicTag(id)?.course).filter((t) => isNew(t, s.seen)).length : 0
}

// admin writes (the database refuses them for everyone else)
async function run<T>(f: (sb: Awaited<ReturnType<typeof getClient>>) => PromiseLike<{ error: { message: string } | null; data?: T }>) {
  const sb = await getClient()
  const { error, data } = await f(sb)
  if (error) throw new Error(error.message)
  await loadThreads()
  return data as T
}

export async function createThread(course: ThreadCourse, title: string, body: string, topics: string[] = []): Promise<string> {
  const sb = await getClient()
  const t = await sb.from('threads').insert({ course, title: title.trim(), topics }).select('id').single()
  if (t.error) throw new Error(t.error.message)
  const p = await sb.from('thread_posts').insert({ thread_id: t.data.id, body })
  if (p.error) {
    await sb.from('threads').delete().eq('id', t.data.id)
    throw new Error(p.error.message)
  }
  await loadThreads()
  return t.data.id as string
}

export const updateThread = (id: string, patch: Partial<Pick<Thread, 'title' | 'course' | 'pinned' | 'topics'>>) =>
  run((sb) => sb.from('threads').update(patch).eq('id', id))
export const deleteThread = (id: string) => run((sb) => sb.from('threads').delete().eq('id', id))
export const addPost = (threadId: string, body: string) => run((sb) => sb.from('thread_posts').insert({ thread_id: threadId, body }))
export const updatePost = (id: string, body: string) => run((sb) => sb.from('thread_posts').update({ body }).eq('id', id))
export const deletePost = (id: string) => run((sb) => sb.from('thread_posts').delete().eq('id', id))

const BUCKET = 'thread-files'
export const MAX_UPLOAD = 25 * 1024 * 1024

/** upload a file for a post; returns its public link */
export async function uploadFile(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD) throw new Error(`${file.name} is over 25 MB`)
  const sb = await getClient()
  const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-80) || 'file'
  const path = `${new Date().toISOString().slice(0, 7)}/${Math.random().toString(36).slice(2, 10)}-${safe}`
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined })
  if (error) throw new Error(error.message)
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
