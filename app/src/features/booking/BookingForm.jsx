import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus, Wallet } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, ErrorBox, Field, Input } from '../../components/ui'
import { createBooking } from '../../lib/api/bookings'
import { formatMoney } from '../../lib/format'
import { bookingSchema } from '../../lib/schemas'
import { useAuth } from '../../store/authStore'

export default function BookingForm({ route, onBooked }) {
  const user = useAuth((s) => s.user)
  const refresh = useAuth((s) => s.refresh)
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)

  const isOwner = user?.id === route.ownerId
  const soldOut = route.seatsLeft === 0

  // ვალიდაცია ყოველთვის მიმდინარე თავისუფალი ადგილების მიხედვით (route შეიძლება განახლდეს)
  const seatsLeftRef = useRef(route.seatsLeft)
  seatsLeftRef.current = route.seatsLeft

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: (values, context, options) => zodResolver(bookingSchema(seatsLeftRef.current))(values, context, options),
    defaultValues: { passengerName: user?.name ?? '', phone: '', seats: 1 },
  })

  const seats = Number(watch('seats')) || 1
  const total = seats * route.price
  const step = (delta) => {
    const next = Math.min(Math.max(seats + delta, 1), route.seatsLeft)
    setValue('seats', next, { shouldValidate: true })
  }

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      const booking = await createBooking({ routeId: route.id, ...values, payerId: user?.id ?? null })
      refresh()
      onBooked?.()
      navigate(`/booking/${booking.code}`)
    } catch (err) {
      setServerError(err.message)
      onBooked?.() // ადგილების რაოდენობა შეიძლება შეიცვალა — ვანახლებთ
    }
  }

  if (soldOut) {
    return <ErrorBox message="ამ მარშრუტზე თავისუფალი ადგილი აღარ არის." />
  }

  if (isOwner) {
    return <p className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900">ეს თქვენი მარშრუტია — მისი რედაქტირება შეგიძლიათ Dashboard-იდან.</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field label="სახელი და გვარი" htmlFor="b-name" error={errors.passengerName?.message}>
        <Input id="b-name" autoComplete="name" invalid={!!errors.passengerName} {...register('passengerName')} />
      </Field>
      <Field label="მობილური" htmlFor="b-phone" error={errors.phone?.message} hint="მაგ. 599123456">
        <Input id="b-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="5XXXXXXXX" invalid={!!errors.phone} {...register('phone')} />
      </Field>
      <Field label="ადგილების რაოდენობა" htmlFor="b-seats" error={errors.seats?.message} hint={`თავისუფალია ${route.seatsLeft}`}>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} className="rounded-lg border border-line p-2.5 hover:border-brand-500" aria-label="ადგილის მოკლება">
            <Minus className="size-4" />
          </button>
          <Input id="b-seats" type="number" min={1} max={route.seatsLeft} className="w-20 text-center" invalid={!!errors.seats} {...register('seats')} />
          <button type="button" onClick={() => step(1)} className="rounded-lg border border-line p-2.5 hover:border-brand-500" aria-label="ადგილის დამატება">
            <Plus className="size-4" />
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
        <span className="text-sm font-medium text-brand-900">ჯამი</span>
        <span className="text-xl font-bold text-brand-700">{formatMoney(total)}</span>
      </div>

      <p className="flex items-start gap-2 text-xs text-muted">
        <Wallet className="mt-0.5 size-4 shrink-0" aria-hidden />
        {user
          ? `თანხა ჩამოიჭრება თქვენი ბალანსიდან (ხელმისაწვდომია ${formatMoney(user.balance)}).`
          : 'სტუმრის რეჟიმი: გადახდა ხდება ადგილზე, მძღოლთან.'}
      </p>

      <ErrorBox message={serverError} />

      <Button type="submit" variant="accent" loading={isSubmitting} className="w-full py-3">
        დაჯავშნა
      </Button>
    </form>
  )
}
