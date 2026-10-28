import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, ErrorBox, Field, Input, Select } from '../../components/ui'
import { CITIES } from '../../lib/cities'
import { todayISO } from '../../lib/format'
import { routeSchema } from '../../lib/schemas'

const EMPTY = { from: '', to: '', date: '', time: '', capacity: 4, price: '', driverId: '' }

/**
 * მარშრუტის შექმნის / რედაქტირების ფორმა (React Hook Form + Zod).
 * კომპანიისთვის სავალდებულოა მძღოლის არჩევა (კორპორატიული რეისი).
 */
export default function RouteForm({ role, initialValues, drivers = [], minCapacity = 1, onSubmit, submitLabel }) {
  const [serverError, setServerError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(routeSchema(role)),
    defaultValues: { ...EMPTY, ...initialValues },
  })

  const submit = async (values) => {
    setServerError(null)
    try {
      await onSubmit(values)
    } catch (err) {
      setServerError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="საიდან" htmlFor="rf-from" error={errors.from?.message}>
          <Select id="rf-from" invalid={!!errors.from} {...register('from')}>
            <option value="">აირჩიეთ ქალაქი</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="სად" htmlFor="rf-to" error={errors.to?.message}>
          <Select id="rf-to" invalid={!!errors.to} {...register('to')}>
            <option value="">აირჩიეთ ქალაქი</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="თარიღი" htmlFor="rf-date" error={errors.date?.message}>
          <Input id="rf-date" type="date" min={todayISO()} invalid={!!errors.date} {...register('date')} />
        </Field>
        <Field label="გამგზავრების დრო" htmlFor="rf-time" error={errors.time?.message}>
          <Input id="rf-time" type="time" invalid={!!errors.time} {...register('time')} />
        </Field>
        <Field
          label="ტევადობა (ადგილები)"
          htmlFor="rf-capacity"
          error={errors.capacity?.message}
          hint={minCapacity > 1 ? `უკვე დაჯავშნილია ${minCapacity} ადგილი` : undefined}
        >
          <Input id="rf-capacity" type="number" min={minCapacity} max={60} inputMode="numeric" invalid={!!errors.capacity} {...register('capacity')} />
        </Field>
        <Field label="ფასი ერთ ადგილზე (₾)" htmlFor="rf-price" error={errors.price?.message}>
          <Input id="rf-price" type="number" min={1} step="0.5" inputMode="decimal" invalid={!!errors.price} {...register('price')} />
        </Field>
        {role === 'company' && (
          <Field
            label="მძღოლი"
            htmlFor="rf-driver"
            error={errors.driverId?.message}
            hint={drivers.length === 0 ? 'ჯერ დაამატეთ მძღოლი სამართავ პანელზე' : undefined}
            className="sm:col-span-2"
          >
            <Select id="rf-driver" invalid={!!errors.driverId} {...register('driverId')}>
              <option value="">აირჩიეთ მძღოლი</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.phone}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <ErrorBox message={serverError} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" to="/dashboard">
          გაუქმება
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
