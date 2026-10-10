import { ShieldAlert } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { Button, EmptyState, Spinner } from '../components/ui'
import { can, useAuth } from '../store/authStore'

/**
 * Route guard (RBAC).
 * - არაავტორიზებული მომხმარებელი → /login (დაბრუნების მისამართით)
 * - ავტორიზებული, მაგრამ უფლების გარეშე → 403 შეტყობინება
 */
export function ProtectedRoute({ permission, children }) {
  const user = useAuth((s) => s.user)
  const token = useAuth((s) => s.token)
  const location = useLocation()

  // სესია აღდგება სერვერიდან — ტოკენი არის, მომხმარებელი ჯერ იტვირთება
  if (!user && token) return <Spinner label="სესია აღდგება…" />

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (permission && !can(user.role, permission)) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <EmptyState
          icon={ShieldAlert}
          title="წვდომა შეზღუდულია"
          text="ამ გვერდის ნახვის უფლება თქვენს როლს არ აქვს."
          action={<Button to="/dashboard">სამართავ პანელზე დაბრუნება</Button>}
        />
      </div>
    )
  }

  return children
}
