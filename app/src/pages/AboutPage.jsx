import { Building2, Truck, User } from 'lucide-react'
import { Card, PageHeader } from '../components/ui'
import { useDocumentTitle } from '../lib/hooks'

const ROLES = [
  {
    icon: User,
    title: 'მგზავრი / სტუმარი',
    items: ['მარშრუტების ძებნა ფილტრებით', 'ადგილების არჩევა', 'ექსპრეს ჯავშანი რეგისტრაციის გარეშე'],
  },
  {
    icon: Truck,
    title: 'გადამზიდი',
    items: ['მარშრუტის დამატება და რედაქტირება', 'ფასისა და ტევადობის მართვა', 'შემოსავლები და ბალანსი'],
  },
  {
    icon: Building2,
    title: 'კომპანია',
    items: ['კომპანიის პროფილი', 'ბიუჯეტის კონტროლი', 'მძღოლები და კორპორატიული რეისები'],
  },
]

const STACK = ['React', 'Vite', 'Tailwind CSS', 'React Router', 'Zustand', 'React Hook Form', 'Zod', 'Leaflet / OpenStreetMap']

export default function AboutPage() {
  useDocumentTitle('პროექტის შესახებ')
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="პროექტის შესახებ"
        subtitle="B2B / B2C ლოჯისტიკური და ტრანსპორტირების პლატფორმა — Skillwill-ის React ფინალური პროექტი."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {ROLES.map(({ icon: Icon, title, items }) => (
          <Card key={title}>
            <Icon className="mb-3 size-7 text-brand-600" aria-hidden />
            <h2 className="mb-2 font-bold">{title}</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted">
              {items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <Card>
        <h2 className="mb-3 font-bold">ტექნოლოგიები</h2>
        <div className="flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="rounded-full border border-line px-3 py-1 text-sm">
              {s}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-bold">დემო ანგარიშები</h2>
        <p className="mb-3 text-sm text-muted">ყველა ანგარიშის პაროლია <code className="rounded bg-brand-50 px-1.5 py-0.5">demo123</code></p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">როლი</th>
                <th className="py-2 font-medium">ელფოსტა</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line">
                <td className="py-2 pr-4">გადამზიდი</td>
                <td className="py-2 font-mono">giorgi@demo.ge</td>
              </tr>
              <tr className="border-t border-line">
                <td className="py-2 pr-4">გადამზიდი</td>
                <td className="py-2 font-mono">nino@demo.ge</td>
              </tr>
              <tr className="border-t border-line">
                <td className="py-2 pr-4">კომპანია</td>
                <td className="py-2 font-mono">company@demo.ge</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          მონაცემები ინახება ბრაუზერის localStorage-ში (mock backend). გადახდები არის იმიტაცია.
        </p>
      </Card>
    </div>
  )
}
