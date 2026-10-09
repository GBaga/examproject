import { AlertTriangle, PiggyBank } from 'lucide-react'
import { Card } from '../../components/ui'
import { formatMoney } from '../../lib/format'

export default function BudgetCard({ company }) {
  const pct = company.budgetLimit > 0 ? Math.min((company.spent / company.budgetLimit) * 100, 100) : 100
  const remaining = Math.max(company.budgetLimit - company.spent, 0)
  const tone = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-accent-500' : 'bg-brand-500'

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold">
          <PiggyBank className="size-5 text-brand-600" aria-hidden /> ბიუჯეტის კონტროლი
        </h2>
        <span className="text-sm text-muted">ლიმიტი: {formatMoney(company.budgetLimit)}</span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-brand-50"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ბიუჯეტის ათვისება"
      >
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span>
          დახარჯული: <strong>{formatMoney(company.spent)}</strong>
        </span>
        <span>
          დარჩენილი: <strong>{formatMoney(remaining)}</strong>
        </span>
      </div>
      {pct >= 90 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          ბიუჯეტი თითქმის ამოწურულია. ლიმიტის გაზრდა შეგიძლიათ Settings-ში.
        </p>
      )}
      <p className="mt-3 text-xs text-muted">ხარჯი ითვლება კომპანიის ანგარიშიდან გაკეთებული ჯავშნებით. ლიმიტის გადაჭარბებისას ჯავშანი იბლოკება.</p>
    </Card>
  )
}
