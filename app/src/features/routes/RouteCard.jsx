import { ArrowRight, Building2, CalendarDays, Clock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui'
import { cityName } from '../../lib/cities'
import { formatDate, formatMoney } from '../../lib/format'

export function SeatsBadge({ seatsLeft, capacity }) {
  if (seatsLeft === 0) return <Badge tone="danger">ადგილები არ არის</Badge>
  if (seatsLeft <= Math.max(1, Math.floor(capacity * 0.25))) return <Badge tone="accent">დარჩა {seatsLeft}</Badge>
  return <Badge tone="success">{seatsLeft} თავისუფალი</Badge>
}

export default function RouteCard({ route }) {
  const soldOut = route.seatsLeft === 0
  return (
    <Link
      to={`/routes/${route.id}`}
      className={`group block rounded-2xl border border-line bg-white p-5 transition hover:border-brand-500 hover:shadow-md ${
        soldOut ? 'opacity-70' : ''
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-lg font-bold">
            <span>{cityName(route.from)}</span>
            <ArrowRight className="size-4 text-brand-500" aria-hidden />
            <span>{cityName(route.to)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-4" aria-hidden /> {formatDate(route.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" aria-hidden /> {route.time}
            </span>
            <span className="inline-flex items-center gap-1">
              {route.ownerType === 'company' ? <Building2 className="size-4" aria-hidden /> : <Users className="size-4" aria-hidden />}
              {route.ownerName}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <p className="text-2xl font-bold text-brand-700">{formatMoney(route.price)}</p>
          <SeatsBadge seatsLeft={route.seatsLeft} capacity={route.capacity} />
        </div>
      </div>
    </Link>
  )
}
