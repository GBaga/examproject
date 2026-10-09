import { zodResolver } from '@hookform/resolvers/zod'
import { Phone, Trash2, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Badge, Button, Card, ErrorBox, Field, Input, Spinner } from '../../components/ui'
import { addDriver, listDrivers, removeDriver } from '../../lib/api/company'
import { useAsync } from '../../lib/hooks'
import { driverSchema } from '../../lib/schemas'

export default function DriversManager({ companyId }) {
  const { data: drivers, loading, error, reload } = useAsync(() => listDrivers(companyId), [companyId])
  const [actionError, setActionError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(driverSchema), defaultValues: { name: '', phone: '' } })

  const onAdd = async (values) => {
    setActionError(null)
    try {
      await addDriver(companyId, values)
      reset()
      // სიას თავიდან ვკითხულობთ „სერვერიდან“ — ლოკალური შერწყმა შეიძლება მოხდეს
      // ჯერ არჩატვირთულ (ცარიელ) სიაზე და დაკარგოს არსებული მძღოლები
      await reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const onRemove = async (driver) => {
    if (!window.confirm(`წაიშალოს მძღოლი ${driver.name}?`)) return
    setActionError(null)
    try {
      await removeDriver(companyId, driver.id)
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2 font-bold">
        <Users className="size-5 text-brand-600" aria-hidden /> მძღოლები
      </h2>

      <ErrorBox message={error} onRetry={reload} />
      {loading && !drivers ? (
        <Spinner />
      ) : drivers?.length === 0 ? (
        <p className="mb-4 text-sm text-muted">მძღოლები ჯერ არ დაგიმატებიათ.</p>
      ) : (
        <ul className="mb-5 divide-y divide-line">
          {drivers?.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Phone className="size-3" aria-hidden /> {d.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={d.upcomingTrips > 0 ? 'brand' : 'neutral'}>{d.upcomingTrips} რეისი</Badge>
                <button
                  onClick={() => onRemove(d)}
                  className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-700"
                  aria-label={`${d.name}-ის წაშლა`}
                  title="წაშლა"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onAdd)} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start" noValidate>
        <Field error={errors.name?.message}>
          <Input placeholder="სახელი და გვარი" aria-label="მძღოლის სახელი" invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field error={errors.phone?.message}>
          <Input placeholder="5XXXXXXXX" type="tel" aria-label="მძღოლის ტელეფონი" invalid={!!errors.phone} {...register('phone')} />
        </Field>
        <Button type="submit" variant="outline" loading={isSubmitting}>
          <UserPlus className="size-4" aria-hidden /> დამატება
        </Button>
      </form>
      <div className="mt-3">
        <ErrorBox message={actionError} />
      </div>
    </Card>
  )
}
