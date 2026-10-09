import { ArrowLeft, ArrowRight, Building2, CalendarDays, Clock, Truck, Users } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, EmptyState, Spinner } from '../components/ui'
import BookingForm from '../features/booking/BookingForm'
import { SeatsBadge } from '../features/routes/RouteCard'
import { getRoute } from '../lib/api/routes'
import { cityName } from '../lib/cities'
import { formatDate, formatMoney } from '../lib/format'
import { useAsync, useDocumentTitle } from '../lib/hooks'

// Leaflet მძიმე ბიბლიოთეკაა — იტვირთება მხოლოდ მარშრუტის გვერდზე (code splitting)
const RouteMap = lazy(() => import('../features/map/RouteMap'))

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-5 text-brand-500" aria-hidden />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}

export default function RouteDetailsPage() {
  const { id } = useParams()
  const { data: route, loading, error, reload } = useAsync(() => getRoute(id), [id])
  useDocumentTitle(route ? `${cityName(route.from)} → ${cityName(route.to)}` : 'მარშრუტი')

  if (loading && !route) return <Spinner />
  if (error || !route) {
    return (
      <EmptyState
        title="მარშრუტი ვერ მოიძებნა"
        text={error}
        action={<Button to="/search">ძებნაზე დაბრუნება</Button>}
      />
    )
  }

  const booked = route.capacity - route.seatsLeft

  return (
    <div>
      <Button to="/search" variant="ghost" className="mb-4 -ml-3">
        <ArrowLeft className="size-4" aria-hidden /> ყველა მარშრუტი
      </Button>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold sm:text-3xl">
          {cityName(route.from)} <ArrowRight className="size-6 text-accent-600" aria-hidden /> {cityName(route.to)}
        </h1>
        <SeatsBadge seatsLeft={route.seatsLeft} capacity={route.capacity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Suspense fallback={<div className="h-[340px] animate-pulse rounded-2xl bg-brand-50" aria-label="რუკა იტვირთება" />}>
            <RouteMap from={route.from} to={route.to} height={340} />
          </Suspense>
          <Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Info icon={CalendarDays} label="თარიღი" value={formatDate(route.date)} />
              <Info icon={Clock} label="გამგზავრების დრო" value={route.time} />
              <Info
                icon={route.ownerType === 'company' ? Building2 : Users}
                label={route.ownerType === 'company' ? 'კომპანია' : 'გადამზიდი'}
                value={route.ownerName}
              />
              {route.driverName && <Info icon={Truck} label="მძღოლი" value={route.driverName} />}
              <Info icon={Users} label="ტევადობა" value={`${route.capacity} ადგილი · დაჯავშნილია ${booked}`} />
            </div>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">ექსპრეს ჯავშანი</h2>
            <p>
              <span className="text-2xl font-bold text-brand-700">{formatMoney(route.price)}</span>
              <span className="text-sm text-muted"> / ადგილი</span>
            </p>
          </div>
          <BookingForm route={route} onBooked={reload} />
        </Card>
      </div>
    </div>
  )
}
