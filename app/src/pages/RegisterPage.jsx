import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Truck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, ErrorBox, Field, Input } from '../components/ui'
import AuthShell from '../features/auth/AuthShell'
import { useDocumentTitle } from '../lib/hooks'
import { registerSchema } from '../lib/schemas'
import { useAuth } from '../store/authStore'

const ROLE_OPTIONS = [
  { value: 'provider', label: 'გადამზიდი', text: 'მძღოლი / ინდივიდუალური გადამზიდი', icon: Truck },
  { value: 'company', label: 'კომპანია', text: 'იურიდიული პირი / კორპორატიული კლიენტი', icon: Building2 },
]

export default function RegisterPage() {
  useDocumentTitle('რეგისტრაცია')
  const navigate = useNavigate()
  const { user, register: registerUser } = useAuth()
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirm: '', role: 'provider', companyName: '', taxId: '' },
  })
  const role = watch('role')

  if (user) return <Navigate to="/dashboard" replace />

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      await registerUser(values)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.message)
    }
  }

  return (
    <AuthShell
      title="რეგისტრაცია"
      subtitle="აირჩიეთ როლი და შექმენით ანგარიში."
      footer={
        <>
          უკვე გაქვთ ანგარიში?{' '}
          <Link to="/login" className="font-semibold text-brand-700">
            შესვლა
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">როლი</legend>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map(({ value, label, text, icon: Icon }) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  role === value ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-line hover:border-brand-200'
                }`}
              >
                <input type="radio" value={value} className="sr-only" {...register('role')} />
                <Icon className="mb-1 size-5 text-brand-600" aria-hidden />
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-muted">{text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label={role === 'company' ? 'საკონტაქტო პირი' : 'სახელი და გვარი'} htmlFor="r-name" error={errors.name?.message}>
          <Input id="r-name" autoComplete="name" invalid={!!errors.name} {...register('name')} />
        </Field>

        {role === 'company' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="კომპანიის სახელი" htmlFor="r-company" error={errors.companyName?.message}>
              <Input id="r-company" autoComplete="organization" invalid={!!errors.companyName} {...register('companyName')} />
            </Field>
            <Field label="საიდენტიფიკაციო კოდი" htmlFor="r-tax" error={errors.taxId?.message}>
              <Input id="r-tax" inputMode="numeric" maxLength={9} invalid={!!errors.taxId} {...register('taxId')} />
            </Field>
          </div>
        )}

        <Field label="ელფოსტა" htmlFor="r-email" error={errors.email?.message}>
          <Input id="r-email" type="email" autoComplete="email" invalid={!!errors.email} {...register('email')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="პაროლი" htmlFor="r-password" error={errors.password?.message}>
            <Input id="r-password" type="password" autoComplete="new-password" invalid={!!errors.password} {...register('password')} />
          </Field>
          <Field label="გაიმეორეთ პაროლი" htmlFor="r-confirm" error={errors.confirm?.message}>
            <Input id="r-confirm" type="password" autoComplete="new-password" invalid={!!errors.confirm} {...register('confirm')} />
          </Field>
        </div>

        <ErrorBox message={serverError} />
        <Button type="submit" loading={isSubmitting} className="w-full">
          ანგარიშის შექმნა
        </Button>
      </form>
    </AuthShell>
  )
}
