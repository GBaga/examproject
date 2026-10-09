import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, ErrorBox, Field, Input } from '../components/ui'
import AuthShell from '../features/auth/AuthShell'
import { useDocumentTitle } from '../lib/hooks'
import { loginSchema } from '../lib/schemas'
import { useAuth } from '../store/authStore'

const DEMO = [
  { label: 'გადამზიდი', email: 'giorgi@demo.ge' },
  { label: 'კომპანია', email: 'company@demo.ge' },
]

/** მხოლოდ შიდა მისამართებზე გადამისამართება (open redirect-ის პრევენცია) */
const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard')

export default function LoginPage() {
  useDocumentTitle('შესვლა')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [serverError, setServerError] = useState(null)
  const next = safeNext(params.get('next'))

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  if (user) return <Navigate to={next} replace />

  const onSubmit = async ({ email, password }) => {
    setServerError(null)
    try {
      await login(email, password)
      navigate(next, { replace: true })
    } catch (err) {
      setServerError(err.message)
    }
  }

  const fillDemo = (email) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', 'demo123', { shouldValidate: true })
  }

  return (
    <AuthShell
      title="შესვლა"
      subtitle="გადამზიდებისა და კომპანიებისთვის. მგზავრს ჯავშნისთვის შესვლა არ სჭირდება."
      footer={
        <>
          ანგარიში არ გაქვთ?{' '}
          <Link to="/register" className="font-semibold text-brand-700">
            რეგისტრაცია
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="ელფოსტა" htmlFor="l-email" error={errors.email?.message}>
          <Input id="l-email" type="email" autoComplete="email" invalid={!!errors.email} {...register('email')} />
        </Field>
        <Field label="პაროლი" htmlFor="l-password" error={errors.password?.message}>
          <Input id="l-password" type="password" autoComplete="current-password" invalid={!!errors.password} {...register('password')} />
        </Field>
        <ErrorBox message={serverError} />
        <Button type="submit" loading={isSubmitting} className="w-full">
          შესვლა
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-4">
        <p className="mb-2 text-xs font-medium text-muted">დემო ანგარიშები (პაროლი: demo123)</p>
        <div className="flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => fillDemo(d.email)}
              className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:border-brand-500 hover:text-brand-700"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  )
}
