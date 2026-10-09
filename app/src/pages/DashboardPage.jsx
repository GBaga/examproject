import { CheckCircle2, Plus, Route as RouteIcon, Ticket, TrendingUp, Wallet } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button, ErrorBox, PageHeader, Spinner, Stat } from '../components/ui'
import RecentBookings from '../features/booking/RecentBookings'
import BudgetCard from '../features/company/BudgetCard'
import DriversManager from '../features/company/DriversManager'
import MyRoutesTable from '../features/routes/MyRoutesTable'
import { listBookingsForOwner } from '../lib/api/bookings'
import { getCompany } from '../lib/api/company'
import { listMyRoutes } from '../lib/api/routes'
import { listTransactions } from '../lib/api/transactions'
import { formatMoney, todayISO } from '../lib/format'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { ROLE_LABELS, useAuth } from '../store/authStore'

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const user = useAuth((s) => s.user)
  const location = useLocation()
  const flash = location.state?.flash
  const isCompany = user.role === 'company'

  const { data, loading, error, reload } = useAsync(async () => {
    const [routes, bookings, transactions, company] = await Promise.all([
      listMyRoutes(user.id),
      listBookingsForOwner(user.id),
      listTransactions(user.id),
      isCompany ? getCompany(user.companyId) : Promise.resolve(null),
    ])
    return { routes, bookings, transactions, company }
  }, [user.id])

  if (loading && !data) return <Spinner />

  const today = todayISO()
  const activeRoutes = data?.routes.filter((r) => r.date >= today) ?? []
  const seatsSold = data?.routes.reduce((sum, r) => sum + (r.capacity - r.seatsLeft), 0) ?? 0
  const earnings = data?.transactions.filter((t) => t.type === 'earning').reduce((sum, t) => sum + t.amount, 0) ?? 0

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={isCompany && data?.company ? data.company.name : `გამარჯობა, ${user.name.split(' ')[0]}`}
        subtitle={`${ROLE_LABELS[user.role]} · სამუშაო სივრცე`}
        actions={
          <Button to="/dashboard/routes/new">
            <Plus className="size-4" aria-hidden /> {isCompany ? 'კორპორატიული რეისი' : 'ახალი მარშრუტი'}
          </Button>
        }
      />

      {flash && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          <CheckCircle2 className="size-4" aria-hidden /> {flash}
        </p>
      )}
      <ErrorBox message={error} onRetry={reload} />

      {data && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="სტატისტიკა">
            <Stat icon={Wallet} label="ბალანსი" value={formatMoney(user.balance)} />
            <Stat icon={RouteIcon} label="აქტიური მარშრუტები" value={activeRoutes.length} hint={`სულ ${data.routes.length}`} />
            <Stat icon={Ticket} label="გაყიდული ადგილები" value={seatsSold} />
            <Stat icon={TrendingUp} label="შემოსავალი" value={formatMoney(earnings)} />
          </section>

          {isCompany && data.company && (
            <section className="grid gap-6 lg:grid-cols-2">
              <BudgetCard company={data.company} />
              <DriversManager companyId={user.companyId} />
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-bold">{isCompany ? 'კორპორატიული რეისები' : 'ჩემი მარშრუტები'}</h2>
            <MyRoutesTable routes={data.routes} onChanged={reload} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">ბოლო ჯავშნები</h2>
            <RecentBookings bookings={data.bookings} />
          </section>
        </>
      )}
    </div>
  )
}
