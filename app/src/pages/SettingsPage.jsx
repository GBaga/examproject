import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Badge, Button, Card, ErrorBox, Field, Input, PageHeader, Spinner } from '../components/ui'
import BalanceCard from '../features/balance/BalanceCard'
import TransactionsList from '../features/balance/TransactionsList'
import CompanyProfileForm from '../features/company/CompanyProfileForm'
import { updateProfile } from '../lib/api/auth'
import { getCompany } from '../lib/api/company'
import { listTransactions } from '../lib/api/transactions'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { profileSchema } from '../lib/schemas'
import { ROLE_LABELS, useAuth } from '../store/authStore'

function ProfileCard() {
  const user = useAuth((s) => s.user)
  const setUser = useAuth((s) => s.setUser)
  const [serverError, setServerError] = useState(null)
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name } })

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      const updated = await updateProfile(user.id, values)
      setUser(updated)
      reset({ name: updated.name })
      setSaved(true)
    } catch (err) {
      setServerError(err.message)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2 font-bold">
        <UserRound className="size-5 text-brand-600" aria-hidden /> პროფილი
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="სახელი" htmlFor="p-name" error={errors.name?.message}>
          <Input id="p-name" invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="ელფოსტა">
          <Input value={user.email} disabled readOnly className="bg-canvas" />
        </Field>
        <div className="flex items-center justify-between">
          <Badge tone="brand">{ROLE_LABELS[user.role]}</Badge>
          <div className="flex items-center gap-3">
            {saved && !isDirty && (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" aria-hidden /> შენახულია
              </span>
            )}
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              შენახვა
            </Button>
          </div>
        </div>
        <ErrorBox message={serverError} />
      </form>
    </Card>
  )
}

export default function SettingsPage() {
  useDocumentTitle('პარამეტრები')
  const user = useAuth((s) => s.user)
  const isCompany = user.role === 'company'

  const transactions = useAsync(() => listTransactions(user.id), [user.id])
  const company = useAsync(() => (isCompany ? getCompany(user.companyId) : Promise.resolve(null)), [user.companyId])

  return (
    <div>
      <PageHeader title="პარამეტრები" subtitle="პროფილი, ბალანსი და ტრანზაქციები." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-6">
          <BalanceCard onTopUp={transactions.reload} />
          <ProfileCard />
        </div>
        <div className="flex flex-col gap-6">
          {isCompany && (company.loading && !company.data ? <Spinner /> : company.data && <CompanyProfileForm company={company.data} />)}
          <ErrorBox message={transactions.error} onRetry={transactions.reload} />
          {transactions.loading && !transactions.data ? <Spinner /> : transactions.data && <TransactionsList transactions={transactions.data} />}
        </div>
      </div>
    </div>
  )
}
