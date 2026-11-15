// /account opened from the start page: same page as inside a course, but in the start page's own look
// (BUET maroon, default theme), not in whichever course's colours.
import { Link } from 'react-router-dom'
import buetLogo from '../assets/buet-logo.svg'
import { useStore } from '../store'
import AccountPage from './AccountPage'

export default function HomeAccount() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const dark = theme === 'dark'
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute -top-48 -left-40 w-[900px] h-[620px] rounded-full blur-3xl"
        aria-hidden="true"
        style={{ background: 'radial-gradient(closest-side, var(--c-accent), transparent)', opacity: dark ? 0.16 : 0.12 }}
      />
      <div
        className="pointer-events-none absolute right-[-140px] bottom-[-160px] w-[640px] h-[640px] max-md:right-[-280px] max-md:bottom-[-200px]"
        aria-hidden="true"
        style={{
          WebkitMaskImage: `url(${buetLogo})`,
          maskImage: `url(${buetLogo})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          background: 'var(--c-accent)',
          opacity: dark ? 0.06 : 0.05,
        }}
      />
      <div className="relative px-4 py-8 md:py-10">
        <div className="w-full max-w-[1040px] mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link to="/" className="flex items-center gap-3 min-w-0 group" title="All courses">
              <img src={buetLogo} alt="BUET" width={40} height={40} className="shrink-0 drop-shadow-sm" />
              <div className="min-w-0">
                <div className="text-accent text-xl leading-none -rotate-2 origin-left" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}>
                  Mojadar TF
                </div>
                <div className="text-xl font-extrabold leading-tight group-hover:text-accent transition-colors">Practice Lab</div>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/" className="btn !py-1 !px-2.5 !text-xs">
                ← All courses
              </Link>
              <button className="btn !py-1 !px-2.5 !text-xs" onClick={() => setTheme(dark ? 'light' : 'dark')}>
                {dark ? '☾ Dark' : '☀ Light'}
              </button>
            </div>
          </div>
          <main className="@container/page">
            <AccountPage />
          </main>
        </div>
      </div>
    </div>
  )
}
