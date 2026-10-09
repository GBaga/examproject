import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, CreditCard, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, ErrorBox, Field, Input } from '../../components/ui'
import { topUp } from '../../lib/api/transactions'
import { formatMoney } from '../../lib/format'
import { topUpSchema } from '../../lib/schemas'
import { useAuth } from '../../store/authStore'

const PRESETS = [20, 50, 100, 500]

/** ბალანსი და შევსების იმიტაცია (რეალური გადახდა არ ხდება) */
export default function BalanceCard({ onTopUp }) {
  const user = useAuth((s) => s.user)
  const refresh = useAuth((s) => s.refresh)
  const [serverError, setServerError] = useState(null)
  const [success, setSuccess] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(topUpSchema), defaultValues: { amount: '' } })

  const onSubmit = async ({ amount }) => {
    setServerError(null)
    setSuccess(null)
    try {
      await topUp(user.id, amount)
      refresh()
      reset({ amount: '' })
      setSuccess(`ბალანსი შეივსო ${formatMoney(amount)}-ით`)
      onTopUp?.()
    } catch (err) {
      setServerError(err.message)
    }
  }

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between rounded-xl bg-brand-900 p-5 text-white">
        <div>
          <p className="text-xs tracking-wider text-brand-200 uppercase">მიმდინარე ბალანსი</p>
          <p className="mt-1 text-3xl font-bold">{formatMoney(user.balance)}</p>
        </div>
        <Wallet className="size-10 text-accent-400" aria-hidden />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
        <Field label="შევსების თანხა (₾)" htmlFor="topup" error={errors.amount?.message}>
          <Input id="topup" type="number" min={1} step="1" inputMode="decimal" placeholder="0" invalid={!!errors.amount} {...register('amount')} />
        </Field>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue('amount', p, { shouldValidate: true })}
              className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:border-brand-500 hover:text-brand-700"
            >
              +{p} ₾
            </button>
          ))}
        </div>
        <ErrorBox message={serverError} />
        {success && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
            <CheckCircle2 className="size-4" aria-hidden /> {success}
          </p>
        )}
        <Button type="submit" variant="accent" loading={isSubmitting}>
          <CreditCard className="size-4" aria-hidden /> ბალანსის შევსება
        </Button>
        <p className="text-xs text-muted">დემო რეჟიმი: გადახდა არის იმიტაცია, ბარათის მონაცემები არ მოითხოვება.</p>
      </form>
    </Card>
  )
}
