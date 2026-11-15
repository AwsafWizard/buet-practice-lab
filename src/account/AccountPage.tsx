// Account: sign in with BUET CE mail, your role, screen time and study numbers; admins also manage roles here.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { courseOf } from '../App'
import { CLOUD, buetEmail, sendMagicLink, signOut, useCloudUser, verifyCode } from '../cloud'
import { COURSES } from '../components/CoursePicker'
import { Ring, Section } from '../components/ui'
import { CourseSplit, DayChart } from '../pages/ScreenTime'
import { useStore } from '../store'
import { useSyncStatus, type SyncStatus } from '../sync'
import { dayRange, fmtShort, shiftDay, useTimer } from '../timer'
import { addAdmin, coursePath, listAdmins, listMembers, removeAdmin, setDisplayName, useAccount, type Course, type Member } from './api'
import { ago } from './ThreadsPage'

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export default function AccountPage() {
  const key = courseOf(useLocation().pathname)
  const course = key === 'home' ? null : key
  const user = useCloudUser()
  const { admin } = useAccount()
  return (
    <div className="max-w-[980px]">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold">Account</h1>
        <p className="text-sm text-mute">
          {user ? 'Your profile, screen time and progress, synced across every device you sign in on.' : 'Everything works without an account. Sign in with your BUET CE mail to sync progress across devices.'}
        </p>
      </div>
      {!CLOUD ? (
        <div className="card p-5 text-sm text-mute mb-6">Accounts live on the website (tf-practice-dashboard.vercel.app). Here your progress stays on this device.</div>
      ) : user ? (
        <Profile email={user.email} />
      ) : (
        <SignIn />
      )}
      <TimeBlock course={course} />
      <StudyBlock />
      {admin && <AdminPanel me={user?.email ?? ''} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────── sign in
function SignIn() {
  const [id, setId] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ bad: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const email = buetEmail(id)
  const send = async () => {
    if (!email) return setMsg({ bad: true, text: 'Enter your 7-digit student ID (or the full studentID@ce.buet.ac.bd address).' })
    setBusy(true)
    setMsg(null)
    const err = await sendMagicLink(email)
    setBusy(false)
    if (err) setMsg({ bad: true, text: err })
    else setSentTo(email)
  }
  return (
    <div className="card p-5 mb-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <div>
        <div className="font-bold text-lg mb-1">Sign in</div>
        {!sentTo ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void send()
            }}
            className="space-y-3"
          >
            <label className="block text-sm text-mute">BUET CE mail</label>
            <div className="flex items-stretch rounded-lg border border-line bg-bg focus-within:border-accent overflow-hidden max-w-md">
              <input
                className="flex-1 min-w-0 bg-transparent px-3 py-2 outline-none num"
                inputMode="numeric"
                autoComplete="username"
                placeholder="2204080"
                value={id.replace(/@ce\.buet\.ac\.bd$/i, '')}
                onChange={(e) => setId(e.target.value.trim())}
                autoFocus
              />
              <span className="px-3 grid place-items-center bg-panel2 text-mute text-sm border-l border-line">@ce.buet.ac.bd</span>
            </div>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setBusy(true)
              setMsg(null)
              const err = await verifyCode(sentTo, code)
              setBusy(false)
              if (err) setMsg({ bad: true, text: err })
            }}
          >
            <div className="text-sm">
              Sent to <b className="num">{sentTo}</b>. Open the email and tap the link <span className="text-mute">(in this browser)</span>, or type the code from it here:
            </div>
            <div className="flex gap-2 flex-wrap">
              <input className="field w-40 text-center tracking-[0.3em] !text-lg" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
              <button className="btn btn-primary" disabled={busy || code.length < 6}>
                {busy ? 'Checking…' : 'Sign in'}
              </button>
            </div>
            <div className="text-xs text-faint">
              Nothing came? Check spam, then{' '}
              <button type="button" className="underline hover:text-ink" onClick={() => (setSentTo(null), setCode(''), setMsg(null))}>
                try again
              </button>
              .
            </div>
          </form>
        )}
        {msg && <div className={'text-sm mt-3 ' + (msg.bad ? 'text-bad' : 'text-good')}>{msg.text}</div>}
      </div>
      <ul className="text-sm text-mute space-y-2 md:border-l md:border-line md:pl-5">
        <li>✓ No password. We email a one-time link and code to your institutional mail.</li>
        <li>✓ Your progress, screen time and planner follow you to every device.</li>
        <li>✓ What you did before signing in on this device is kept and merged in.</li>
        <li className="text-faint">Only studentID@ce.buet.ac.bd addresses can sign in.</li>
      </ul>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────── profile
const SYNC: Record<SyncStatus, [string, string]> = {
  off: ['text-faint', ''],
  connecting: ['text-faint', 'Connecting…'],
  local: ['text-faint', 'This device only'],
  saving: ['text-mute', 'Saving…'],
  synced: ['text-good', '✓ Synced across devices'],
  error: ['text-bad', 'Sync failed, saved on this device'],
}

function Profile({ email }: { email: string }) {
  const { admin, profile, loading } = useAccount()
  const [cls, text] = SYNC[useSyncStatus()]
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const id = email.split('@')[0]
  const shown = profile?.display_name || id
  const initials = (profile?.display_name || id)
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="card p-5 mb-6">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent grid place-items-center text-xl font-extrabold shrink-0">{/^\d/.test(initials) ? id.slice(-3) : initials}</div>
        <div className="flex-1 min-w-[200px]">
          {editing ? (
            <form
              className="flex gap-2 flex-wrap"
              onSubmit={async (e) => {
                e.preventDefault()
                const r = await setDisplayName(name)
                if (r) setErr(r)
                else setEditing(false)
              }}
            >
              <input className="field !font-sans" placeholder="Your name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <button className="btn btn-primary !py-1">Save</button>
              <button type="button" className="btn !py-1" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-extrabold">{shown}</span>
              <span className={'chip ' + (admin ? '!border-accent !text-accent' : '')}>{loading ? '…' : admin ? '★ Admin' : 'Member'}</span>
              <button className="text-xs text-faint hover:text-ink underline" onClick={() => (setName(profile?.display_name ?? ''), setEditing(true), setErr(null))}>
                {profile?.display_name ? 'edit name' : 'add your name'}
              </button>
            </div>
          )}
          {err && <div className="text-xs text-bad mt-1">{err}</div>}
          <div className="text-sm text-mute mt-1 num">{email}</div>
          <div className="text-xs text-faint mt-1.5 flex gap-x-4 gap-y-1 flex-wrap">
            <span>Student ID <b className="text-mute num">{id}</b></span>
            {profile && <span>Joined {day(profile.created_at)}</span>}
            <span className={cls}>{text}</span>
          </div>
        </div>
        <button className="btn" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
      {admin && (
        <div className="mt-4 text-xs text-mute border-t border-line pt-3">
          As an admin you can post and edit Threads in every course and make other people admins (below).
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────── screen time
function TimeBlock({ course }: { course: Course | null }) {
  const t = useTimer()
  const goalH = useStore((s) => s.timeGoal)
  const goal = goalH * 3600
  const sec = (d: string) => t.days[d] ?? 0
  const recorded = Object.keys(t.days)
    .filter((d) => t.days[d] > 0)
    .sort()
  const all = dayRange(recorded[0] && recorded[0] < t.day ? recorded[0] : t.day, t.day)
  const past = all.filter((d) => d < t.day && sec(d) > 0)
  const avg = past.length ? past.reduce((a, d) => a + sec(d), 0) / past.length : t.today
  const week = dayRange(shiftDay(t.day, -6), t.day).reduce((a, d) => a + sec(d), 0)
  const total = all.reduce((a, d) => a + sec(d), 0)
  const studied = all.filter((d) => sec(d) > 0).length
  return (
    <Section
      title="Screen time"
      sub="Time on this site, every course, every signed-in device. A day runs 2 AM to 2 AM."
      right={
        course && (
          <Link to={coursePath(course, 'time')} className="text-sm text-accent hover:underline whitespace-nowrap">
            Full page →
          </Link>
        )
      }
    >
      <div className="grid grid-cols-2 cq-md:grid-cols-4 gap-3 mb-4">
        <div className="card p-3.5 flex items-center gap-3">
          <Ring value={goal ? t.today / goal : 0} size={42} stroke={4.5} label={`${Math.min(999, Math.round((t.today / Math.max(goal, 1)) * 100))}%`} />
          <div>
            <div className="text-[10.5px] uppercase tracking-wider text-faint font-bold">Today</div>
            <div className="num text-lg font-bold">{fmtShort(t.today)}</div>
          </div>
        </div>
        <Tile label="Last 7 days" value={fmtShort(week)} />
        <Tile label="Daily average" value={fmtShort(avg)} />
        <Tile label="All time" value={fmtShort(total)} sub={`${studied} day${studied === 1 ? '' : 's'}`} />
      </div>
      <DayChart days={dayRange(shiftDay(t.day, -13), t.day)} sec={sec} today={t.day} goal={goal} avg={avg} />
      <div className="mt-2">
        <CourseSplit day={t.day} />
      </div>
    </Section>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3.5">
      <div className="text-[10.5px] uppercase tracking-wider text-faint font-bold">{label}</div>
      <div className="num text-lg font-bold whitespace-nowrap">
        {value}
        {sub && <span className="text-xs text-mute font-normal ml-1.5">{sub}</span>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────── study numbers
function StudyBlock() {
  const qStatus = useStore((s) => s.qStatus)
  const attempts = useStore((s) => s.attempts)
  const xp = useStore((s) => s.xp)
  const streak = useStore((s) => s.streak)
  const cards = useStore((s) => s.cards)
  const activity = useStore((s) => s.activity)
  const checks = Object.values(attempts)
  const firstTry = checks.filter((a) => a.firstTry).length
  const activeDays = Object.values(activity).filter((n) => n > 0).length
  return (
    <Section title="Progress" sub="Across all four courses.">
      <div className="grid grid-cols-2 cq-md:grid-cols-4 gap-3 mb-4">
        <Tile label={`Level ${Math.floor(xp / 200) + 1}`} value={`${xp} XP`} />
        <Tile label="Streak" value={`🔥 ${streak.count}`} sub={`${activeDays} active day${activeDays === 1 ? '' : 's'}`} />
        <Tile label="Checks done" value={String(checks.length)} sub={checks.length ? `${Math.round((firstTry / checks.length) * 100)}% first try` : ''} />
        <Tile label="Flashcards seen" value={String(Object.keys(cards).length)} />
      </div>
      <div className="card divide-y divide-line">
        {COURSES.map((c) => {
          const solved = c.qids.filter((id) => qStatus[id] === 'solved').length
          const review = c.qids.filter((id) => qStatus[id] === 'review').length
          const cs = Object.entries(attempts).filter(([k]) => c.checkPrefix(k))
          const ok = cs.filter(([, a]) => a.correct).length
          return (
            <Link key={c.key} to={c.home} className="flex items-center gap-3 px-4 py-3 hover:bg-panel2/60 transition-colors">
              <Ring value={c.qids.length ? solved / c.qids.length : 0} size={36} stroke={4} color={c.light.acc} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">
                  {c.code} <span className="text-mute font-normal">· {c.name}</span>
                </div>
                <div className="text-xs text-mute num">
                  {solved}/{c.qids.length} past questions solved{review ? ` · ${review} to review` : ''} · {ok}/{cs.length} checks correct
                </div>
              </div>
              <span className="text-faint">→</span>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────── admin
function AdminPanel({ me }: { me: string }) {
  const [members, setMembers] = useState<Member[] | null>(null)
  const [admins, setAdmins] = useState<{ email: string; added_by: string | null; added_at: string }[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [add, setAdd] = useState('')
  const [q, setQ] = useState('')
  const load = async () => {
    try {
      const [m, a] = await Promise.all([listMembers(), listAdmins()])
      setMembers(m)
      setAdmins(a)
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  const act = async (f: () => Promise<string | null>) => {
    setErr(null)
    const r = await f()
    if (r) setErr(r)
    await load()
  }
  const adminSet = new Set(admins.map((a) => a.email))
  const shown = (members ?? []).filter((m) => !q || m.email.includes(q.toLowerCase()) || (m.display_name ?? '').toLowerCase().includes(q.toLowerCase()))
  const pendingAdmins = admins.filter((a) => !(members ?? []).some((m) => m.email === a.email))
  return (
    <Section title="Admin" sub="Admins can post in Threads and change roles. Roles are checked by the database, not just this page.">
      <div className="card p-4 mb-4">
        <form
          className="flex gap-2 flex-wrap items-center"
          onSubmit={(e) => {
            e.preventDefault()
            const email = buetEmail(add)
            if (!email) return setErr('Enter a 7-digit student ID or studentID@ce.buet.ac.bd.')
            void act(() => addAdmin(email)).then(() => setAdd(''))
          }}
        >
          <span className="text-sm font-semibold mr-1">Make someone an admin</span>
          <input className="field w-48" placeholder="Student ID, e.g. 2204038" value={add} onChange={(e) => setAdd(e.target.value)} />
          <button className="btn btn-primary !py-1">Add admin</button>
          <span className="text-xs text-faint basis-full">Works even before they've signed in for the first time.</span>
        </form>
        {pendingAdmins.length > 0 && (
          <div className="mt-3 text-xs text-mute flex flex-wrap gap-2 items-center">
            Not signed in yet:
            {pendingAdmins.map((a) => (
              <span key={a.email} className="chip">
                {a.email.split('@')[0]}
                {a.email !== me && (
                  <button className="text-bad ml-0.5" title="Remove admin" onClick={() => void act(() => removeAdmin(a.email))}>
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
        {err && <div className="text-sm text-bad mt-2">{err}</div>}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-line flex-wrap">
          <span className="font-bold text-sm">Members</span>
          <span className="text-xs text-mute">
            {members ? `${members.length} signed up · ${adminSet.size} admin${adminSet.size === 1 ? '' : 's'}` : 'Loading…'}
          </span>
          {members && members.length > 8 && <input className="field ml-auto w-44 !py-1 !text-xs" placeholder="Search ID or name" value={q} onChange={(e) => setQ(e.target.value)} />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-faint">
              <tr className="text-left">
                <th className="px-4 py-2 font-bold">Student</th>
                <th className="px-2 py-2 font-bold">Joined</th>
                <th className="px-2 py-2 font-bold">Last seen</th>
                <th className="px-4 py-2 font-bold text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => {
                const isAdm = adminSet.has(m.email)
                return (
                  <tr key={m.email} className="border-t border-line">
                    <td className="px-4 py-2">
                      <span className="num font-semibold">{m.student_id}</span>
                      {m.display_name && <span className="text-mute"> · {m.display_name}</span>}
                      {m.email === me && <span className="text-faint text-xs"> (you)</span>}
                    </td>
                    <td className="px-2 py-2 text-mute whitespace-nowrap">{day(m.created_at)}</td>
                    <td className="px-2 py-2 text-mute whitespace-nowrap">{m.last_seen ? ago(m.last_seen) : '—'}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      {isAdm ? (
                        <>
                          <span className="chip !border-accent !text-accent mr-2">★ Admin</span>
                          {m.email !== me && (
                            <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => confirm(`Remove ${m.student_id}'s admin role?`) && void act(() => removeAdmin(m.email))}>
                              Remove
                            </button>
                          )}
                        </>
                      ) : (
                        <button className="btn !py-0.5 !px-2 !text-xs" disabled={!/@ce\.buet\.ac\.bd$/.test(m.email)} onClick={() => void act(() => addAdmin(m.email))}>
                          Make admin
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}
