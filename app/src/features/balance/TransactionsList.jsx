import { ArrowDownLeft, ArrowUpRight, PlusCircle, Receipt } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, EmptyState } from '../../components/ui'
import { formatDateTime, formatMoney } from '../../lib/format'

const TYPES = {
  topup: { label: 'შევსება', icon: PlusCircle, sign: '+', className: 'text-emerald-700' },
  earning: { label: 'შემოსავალი', icon: ArrowDownLeft, sign: '+', className: 'text-emerald-700' },
  spend: { label: 'ხარჯი', icon: ArrowUpRight, sign: '−', className: 'text-red-700' },
}

const FILTERS = [
  { value: 'all', label: 'ყველა' },
  { value: 'earning', label: 'შემოსავალი' },
  { value: 'topup', label: 'შევსება' },
  { value: 'spend', label: 'ხარჯი' },
]

export default function TransactionsList({ transactions }) {
  const [filter, setFilter] = useState('all')
  const visible = useMemo(
    () => (filter === 'all' ? transactions : transactions.filter((t) => t.type === filter)),
    [transactions, filter],
  )

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold">
          <Receipt className="size-5 text-brand-600" aria-hidden /> ტრანზაქციების ისტორია
        </h2>
        <div className="flex gap-1 rounded-lg bg-canvas p-1" role="tablist" aria-label="ტრანზაქციის ტიპი">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${filter === f.value ? 'bg-white text-brand-700 shadow-sm' : 'text-muted'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Receipt} title="ტრანზაქციები არ არის" />
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((t) => {
            const meta = TYPES[t.type]
            const Icon = meta.icon
            return (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-lg bg-canvas p-2">
                    <Icon className={`size-4 ${meta.className}`} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{t.note}</p>
                    <p className="text-xs text-muted">
                      {meta.label} · {formatDateTime(t.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 font-semibold ${meta.className}`}>
                  {meta.sign}
                  {formatMoney(t.amount)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
