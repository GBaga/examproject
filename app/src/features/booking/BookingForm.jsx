import { zodResolver } from '@hookform/resolvers/zod'
import { Wallet } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, ErrorBox, Field, Input } from '../../components/ui'
import { createBooking } from '../../lib/api/bookings'
import { formatMoney } from '../../lib/format'
import SeatPicker from './SeatPicker'
import { bookingSchema } from '../../lib/schemas'
import { useAuth } from '../../store/authStore'

export default function BookingForm({ route, onBooked }) {
  const user = useAuth((s) => s.user)
  const refresh = useAuth((s) => s.refresh)
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)
  const [selected, setSelected] = useState([])

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
    defaultValues: { passengerName: user?.name ?? '', phone: '', seats: 0 },
  })

  watch('seats')
  const total = selected.length * route.price
  const toggleSeat = (n) => {
    const next = selected.includes(n) ? selected.filter((x) => x !== n) : [...selected, n].sort((a, b) => a - b)
    setSelected(next)
    setValue('seats', next.length, { shouldValidate: true })
  }

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      const booking = await createBooking({ routeId: route.id, ...values, seatNumbers: selected, payerId: user?.id ?? null })
      refresh()
      onBooked?.()
      navigate(`/booking/${booking.code}`)
    } catch (err) {
      setServerError(err.message)
      if (err.code === 'SEAT_TAKEN') {
        setSelected([])
        setValue('seats', 0)
      }
      onBooked?.() // ადგილები შეიძლება შეიცვალა — ვანახლებთ
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
      <Field
        label="აირჩიეთ ადგილები"
        htmlFor="b-seats"
        error={errors.seats?.message}
        hint={selected.length ? `არჩეულია: № ${selected.join(', ')}` : `თავისუფალია ${route.seatsLeft} ადგილი`}
      >
        <input id="b-seats" type="hidden" {...register('seats')} />
        <SeatPicker capacity={route.capacity} taken={route.seatsTaken} selected={selected} max={route.seatsLeft} onToggle={toggleSeat} />
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
