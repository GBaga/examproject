import { LogIn, LogOut, Menu, RotateCcw, Search, Wallet, X } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Badge, Spinner } from '../components/ui'
import { resetDb } from '../lib/api/client'
import { formatMoney } from '../lib/format'
import { ROLE_LABELS, useAuth } from '../store/authStore'

// ნავიგაცია ემთხვევა Git მოდულის კონფლიქტის გადაწყვეტას: Home / About + Dashboard / Settings
const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/settings', label: 'Settings' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-brand-900">
      <img src="/favicon.svg" alt="" className="size-8" />
      <span className="leading-tight">
        Logistics
        <span className="block text-xs font-medium text-muted">Platform</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  const { user, logout, refresh } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  // მობილური მენიუ ღიაა მხოლოდ იმ გვერდზე, სადაც გაიხსნა — გადასვლისას თავისით იხურება
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === location.pathname
  const toggleMenu = () => setOpenOn(open ? null : location.pathname)

  // გვერდის შეცვლისას: ბალანსის განახლება და ზემოთ ასქროლვა
  useEffect(() => {
    refresh()
    window.scrollTo(0, 0)
  }, [location.pathname, refresh])

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-muted hover:text-brand-700'
    }`

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleReset = async () => {
    if (window.confirm('დემო მონაცემები დაბრუნდეს საწყის მდგომარეობაში? ყველა ცვლილება წაიშლება.')) {
      await resetDb().catch(() => {})
      logout()
      navigate('/')
      window.location.reload()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="მთავარი ნავიგაცია">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-400"
            >
              <Search className="size-4" aria-hidden /> მარშრუტები
            </Link>
            {user ? (
              <>
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold"
                  title="ბალანსი"
                >
                  <Wallet className="size-4 text-brand-600" aria-hidden />
                  {formatMoney(user.balance)}
                </Link>
                <div className="text-right leading-tight">
                  <p className="max-w-[10rem] truncate text-sm font-semibold">{user.name}</p>
                  <Badge tone="brand">{ROLE_LABELS[user.role]}</Badge>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700"
                  aria-label="გასვლა"
                  title="გასვლა"
                >
                  <LogOut className="size-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                <LogIn className="size-4" aria-hidden /> შესვლა
              </Link>
            )}
          </div>

          <button
            className="rounded-lg p-2 md:hidden"
            onClick={toggleMenu}
            aria-label={open ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-line bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="მობილური ნავიგაცია">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
              <NavLink to="/search" className={linkClass}>
                მარშრუტების ძებნა
              </NavLink>
            </nav>
            <div className="mt-3 border-t border-line pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted">
                      {ROLE_LABELS[user.role]} · {formatMoney(user.balance)}
                    </p>
                  </div>
                  <button onClick={handleLogout} className="text-sm font-semibold text-brand-700">
                    გასვლა
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-semibold text-brand-700">
                  შესვლა / რეგისტრაცია
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Logistics Platform · Skillwill React ფინალური პროექტი · მონაცემები: MongoDB Atlas</p>
          <button onClick={handleReset} className="inline-flex items-center gap-1 self-start hover:text-brand-700 sm:self-auto">
            <RotateCcw className="size-3.5" aria-hidden /> დემო მონაცემების განულება
          </button>
        </div>
      </footer>
    </div>
  )
}
