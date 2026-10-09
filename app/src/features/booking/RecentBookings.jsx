import { ArrowRight, Ticket } from 'lucide-react'
import { Badge, Card, EmptyState } from '../../components/ui'
import { cityName } from '../../lib/cities'
import { formatDateTime, formatMoney } from '../../lib/format'

export default function RecentBookings({ bookings }) {
  if (bookings.length === 0) {
    return <EmptyState icon={Ticket} title="ჯავშნები ჯერ არ არის" text="თქვენს მარშრუტებზე გაკეთებული ჯავშნები აქ გამოჩნდება." />
  }
  return (
    <Card className="!p-0">
      <ul className="divide-y divide-line">
        {bookings.slice(0, 6).map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {b.passengerName} · {b.seats} ადგილი
              </p>
              <p className="flex items-center gap-1 text-xs text-muted">
                {cityName(b.route?.from)} <ArrowRight className="size-3" aria-hidden /> {cityName(b.route?.to)} · {formatDateTime(b.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-emerald-700">+{formatMoney(b.total)}</p>
              <Badge tone={b.payment === 'balance' ? 'brand' : 'neutral'}>{b.payment === 'balance' ? 'ბალანსი' : 'ნაღდი'}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
