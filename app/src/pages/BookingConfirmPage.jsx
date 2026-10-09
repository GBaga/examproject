import { ArrowRight, CheckCircle2, Printer } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Button, Card, EmptyState, Spinner } from '../components/ui'
import { getBookingByCode } from '../lib/api/bookings'
import { cityName } from '../lib/cities'
import { formatDate, formatDateTime, formatMoney } from '../lib/format'
import { useAsync, useDocumentTitle } from '../lib/hooks'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-3 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  )
}

export default function BookingConfirmPage() {
  const { code } = useParams()
  useDocumentTitle(`ჯავშანი ${code}`)
  const { data: booking, loading, error } = useAsync(() => getBookingByCode(code), [code])

  if (loading) return <Spinner />
  if (error) return <EmptyState title="ჯავშანი ვერ მოიძებნა" text={error} action={<Button to="/search">მარშრუტების ძებნა</Button>} />

  const { route } = booking
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex flex-col items-center text-center">
        <CheckCircle2 className="mb-3 size-14 text-emerald-600" aria-hidden />
        <h1 className="text-2xl font-bold">ჯავშანი დადასტურებულია</h1>
        <p className="mt-1 text-sm text-muted">წარუდგინეთ ჯავშნის კოდი მძღოლს ჩასხდომისას.</p>
      </div>

      <Card>
        <div className="mb-4 rounded-xl bg-brand-900 px-4 py-5 text-center text-white">
          <p className="text-xs tracking-widest text-brand-200 uppercase">ჯავშნის კოდი</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em]">{booking.code}</p>
        </div>
        {route && (
          <Row
            label="მარშრუტი"
            value={
              <span className="inline-flex items-center gap-1">
                {cityName(route.from)} <ArrowRight className="size-3.5" aria-hidden /> {cityName(route.to)}
              </span>
            }
          />
        )}
        {route && <Row label="გამგზავრება" value={`${formatDate(route.date)}, ${route.time}`} />}
        <Row label="მგზავრი" value={booking.passengerName} />
        <Row label="ტელეფონი" value={booking.phone} />
        <Row label="ადგილები" value={booking.seats} />
        <Row label="ჯამი" value={formatMoney(booking.total)} />
        <Row label="გადახდა" value={booking.payment === 'balance' ? 'ბალანსიდან' : 'ადგილზე, მძღოლთან'} />
        <Row label="შექმნილია" value={formatDateTime(booking.createdAt)} />
      </Card>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden /> ბეჭდვა
        </Button>
        <Button to="/search" className="flex-1">
          სხვა მარშრუტები
        </Button>
      </div>
    </div>
  )
}
