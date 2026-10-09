import { ArrowRight, Building2, MapPinned, ShieldCheck, Truck, Wallet, Zap } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Select, Spinner } from '../components/ui'
import RouteCard from '../features/routes/RouteCard'
import { searchRoutes } from '../lib/api/routes'
import { CITIES } from '../lib/cities'
import { todayISO } from '../lib/format'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { useAuth } from '../store/authStore'

const FEATURES = [
  { icon: Zap, title: 'ექსპრეს ჯავშანი', text: 'მგზავრს რეგისტრაცია არ სჭირდება — სახელი, ტელეფონი და ადგილი საკმარისია.' },
  { icon: Truck, title: 'გადამზიდებისთვის', text: 'დაამატეთ მარშრუტი, განსაზღვრეთ ფასი და ადევნეთ თვალი შემოსავალს.' },
  { icon: Building2, title: 'კომპანიებისთვის', text: 'მძღოლები, კორპორატიული რეისები და ბიუჯეტის კონტროლი ერთ სივრცეში.' },
  { icon: ShieldCheck, title: 'როლებზე დაფუძნებული წვდომა', text: 'თითოეული როლი ხედავს მხოლოდ იმას, რაც მას ეკუთვნის.' },
]

export default function HomePage() {
  useDocumentTitle(null)
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const [form, setForm] = useState({ from: '', to: '', date: '' })
  const { data: upcoming, loading } = useAsync(() => searchRoutes({}), [])

  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(Object.entries(form).filter(([, v]) => v))
    navigate(`/search?${params}`)
  }

  return (
    <div className="flex flex-col gap-14">
      <section className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-12 text-white sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-600/40 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <MapPinned className="size-3.5" aria-hidden /> ქალაქთაშორისი მარშრუტები საქართველოში
          </p>
          <h1 className="text-3xl leading-tight font-bold sm:text-5xl">
            იპოვე რეისი. დაჯავშნე ადგილი. <span className="text-accent-400">გზას დაადექი.</span>
          </h1>
          <p className="mt-4 text-brand-100">
            პლატფორმა მგზავრებისთვის, გადამზიდებისა და კომპანიებისთვის — ძებნა, ფილტრაცია და ექსპრეს ჯავშანი ერთ ადგილას.
          </p>
        </div>

        <form onSubmit={submit} className="relative mt-8 grid gap-3 rounded-2xl bg-white p-3 text-ink sm:grid-cols-[1fr_1fr_1fr_auto]" aria-label="სწრაფი ძებნა">
          <Select aria-label="საიდან" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
            <option value="">საიდან</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select aria-label="სად" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}>
            <option value="">სად</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input type="date" aria-label="თარიღი" min={todayISO()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Button type="submit" variant="accent">
            ძებნა
          </Button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">უახლოესი რეისები</h2>
          <Button to="/search" variant="ghost">
            ყველა <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming?.filter((r) => r.seatsLeft > 0).slice(0, 4).map((r) => (
              <RouteCard key={r.id} route={r} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="!p-5">
            <Icon className="mb-3 size-6 text-brand-600" aria-hidden />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </Card>
        ))}
      </section>

      {!user && (
        <section className="flex flex-col items-start gap-4 rounded-3xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <Wallet className="size-8 shrink-0 text-accent-600" aria-hidden />
            <div>
              <h2 className="text-lg font-bold">ხართ გადამზიდი ან კომპანია?</h2>
              <p className="text-sm text-muted">დარეგისტრირდით, დაამატეთ მარშრუტები და მართეთ შემოსავალი.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button to="/register">რეგისტრაცია</Button>
            <Button to="/login" variant="outline">
              შესვლა
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
