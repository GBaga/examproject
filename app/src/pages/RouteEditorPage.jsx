import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, EmptyState, PageHeader, Spinner } from '../components/ui'
import RouteForm from '../features/routes/RouteForm'
import { listDrivers } from '../lib/api/company'
import { createRoute, getRoute, updateRoute } from '../lib/api/routes'
import { useAsync, useDocumentTitle } from '../lib/hooks'
import { useAuth } from '../store/authStore'

export default function RouteEditorPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  useDocumentTitle(isEdit ? 'მარშრუტის რედაქტირება' : 'ახალი მარშრუტი')
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)

  const { data, loading, error } = useAsync(async () => {
    const [route, drivers] = await Promise.all([
      isEdit ? getRoute(id) : Promise.resolve(null),
      user.role === 'company' ? listDrivers(user.companyId) : Promise.resolve([]),
    ])
    return { route, drivers }
  }, [id, user.id])

  if (loading) return <Spinner />
  if (error) return <EmptyState title="მარშრუტი ვერ მოიძებნა" text={error} action={<Button to="/dashboard">Dashboard</Button>} />
  if (isEdit && data.route.ownerId !== user.id) {
    return <EmptyState title="წვდომა შეზღუდულია" text="ეს მარშრუტი თქვენი არ არის." action={<Button to="/dashboard">Dashboard</Button>} />
  }

  const { route, drivers } = data
  const booked = route ? route.capacity - route.seatsLeft : 0

  const handleSubmit = async (values) => {
    if (isEdit) await updateRoute(user, id, values)
    else await createRoute(user, values)
    navigate('/dashboard', { state: { flash: isEdit ? 'მარშრუტი განახლდა' : 'მარშრუტი დაემატა' } })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button to="/dashboard" variant="ghost" className="mb-4 -ml-3">
        <ArrowLeft className="size-4" aria-hidden /> Dashboard
      </Button>
      <PageHeader
        title={isEdit ? 'მარშრუტის რედაქტირება' : 'ახალი მარშრუტი'}
        subtitle={user.role === 'company' ? 'კორპორატიული რეისი — მიაბით მძღოლი.' : 'მიუთითეთ მიმართულება, დრო, ადგილები და ფასი.'}
      />
      <Card>
        <RouteForm
          role={user.role}
          drivers={drivers}
          minCapacity={Math.max(booked, 1)}
          initialValues={
            route && {
              from: route.from,
              to: route.to,
              date: route.date,
              time: route.time,
              capacity: route.capacity,
              price: route.price,
              driverId: route.driverId ?? '',
            }
          }
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'შენახვა' : 'მარშრუტის დამატება'}
        />
      </Card>
    </div>
  )
}
