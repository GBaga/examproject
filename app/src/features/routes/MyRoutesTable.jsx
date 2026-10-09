import { ArrowRight, Eye, Pencil, Route as RouteIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, EmptyState, ErrorBox } from '../../components/ui'
import { deleteRoute } from '../../lib/api/routes'
import { cityName } from '../../lib/cities'
import { formatDate, formatMoney, todayISO } from '../../lib/format'
import { useAuth } from '../../store/authStore'

export default function MyRoutesTable({ routes, onChanged }) {
  const user = useAuth((s) => s.user)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const today = todayISO()

  const remove = async (route) => {
    if (!window.confirm(`წაიშალოს მარშრუტი ${cityName(route.from)} → ${cityName(route.to)}?`)) return
    setError(null)
    setBusyId(route.id)
    try {
      await deleteRoute(user, route.id)
      onChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (routes.length === 0) {
    return (
      <EmptyState
        icon={RouteIcon}
        title="მარშრუტები ჯერ არ გაქვთ"
        text="დაამატეთ პირველი მარშრუტი და ის მაშინვე გამოჩნდება ძებნაში."
        action={<Button to="/dashboard/routes/new">მარშრუტის დამატება</Button>}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ErrorBox message={error} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-canvas text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">მიმართულება</th>
              <th className="px-4 py-3 font-medium">თარიღი / დრო</th>
              {user.role === 'company' && <th className="px-4 py-3 font-medium">მძღოლი</th>}
              <th className="px-4 py-3 font-medium">ადგილები</th>
              <th className="px-4 py-3 font-medium">ფასი</th>
              <th className="px-4 py-3 text-right font-medium">მოქმედება</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => {
              const booked = r.capacity - r.seatsLeft
              const past = r.date < today
              return (
                <tr key={r.id} className={`border-b border-line last:border-0 ${past ? 'text-muted' : ''}`}>
                  <td className="px-4 py-3 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {cityName(r.from)} <ArrowRight className="size-3.5 text-brand-500" aria-hidden /> {cityName(r.to)}
                    </span>
                    {past && <Badge className="ml-2">დასრულებული</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(r.date)}, {r.time}
                  </td>
                  {user.role === 'company' && <td className="px-4 py-3">{r.driverName ?? '—'}</td>}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-brand-50" aria-hidden>
                        <div className="h-full bg-brand-500" style={{ width: `${(booked / r.capacity) * 100}%` }} />
                      </div>
                      <span>
                        {booked}/{r.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatMoney(r.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/routes/${r.id}`} className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700" title="ნახვა" aria-label="ნახვა">
                        <Eye className="size-4" />
                      </Link>
                      <Link
                        to={`/dashboard/routes/${r.id}/edit`}
                        className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700"
                        title="რედაქტირება"
                        aria-label="რედაქტირება"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        onClick={() => remove(r)}
                        disabled={busyId === r.id || booked > 0}
                        className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                        title={booked > 0 ? 'ჯავშნიანი მარშრუტი ვერ წაიშლება' : 'წაშლა'}
                        aria-label="წაშლა"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
