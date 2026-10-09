import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

const cx = (...classes) => classes.filter(Boolean).join(' ')

const BUTTON_VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-600 disabled:bg-brand-200',
  accent: 'bg-accent-500 text-brand-900 hover:bg-accent-400 disabled:opacity-50',
  outline: 'border border-line bg-white text-ink hover:border-brand-500 hover:text-brand-700',
  ghost: 'text-muted hover:bg-brand-50 hover:text-brand-700',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
}

export function Button({ variant = 'primary', loading = false, className, children, to, ...props }) {
  const classes = cx(
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed',
    BUTTON_VARIANTS[variant],
    className,
  )
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function Field({ label, error, hint, htmlFor, children, className }) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

const controlClasses = (invalid) =>
  cx(
    'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70',
    'focus:outline-none focus:ring-2 focus:ring-brand-200',
    invalid ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-brand-500',
  )

export const Input = forwardRef(function Input({ invalid, className, ...props }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cx(controlClasses(invalid), className)} {...props} />
})

export const Select = forwardRef(function Select({ invalid, className, children, ...props }, ref) {
  return (
    <select ref={ref} aria-invalid={invalid || undefined} className={cx(controlClasses(invalid), className)} {...props}>
      {children}
    </select>
  )
})

export function Card({ className, children, ...props }) {
  return (
    <div className={cx('rounded-2xl border border-line bg-white p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  )
}

const BADGE_TONES = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700',
  accent: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
  success: 'bg-emerald-50 text-emerald-700',
}

export function Badge({ tone = 'neutral', children, className }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', BADGE_TONES[tone], className)}>
      {children}
    </span>
  )
}

export function Spinner({ label = 'იტვირთება…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted" role="status">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

export function EmptyState({ title, text, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <Icon className="size-8 text-brand-500" aria-hidden />
      <p className="font-semibold">{title}</p>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action}
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex-1">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline">
          ხელახლა
        </button>
      )}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Stat({ label, value, hint, icon: Icon }) {
  return (
    <Card className="flex items-start gap-4 !p-5">
      {Icon && (
        <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
          <Icon className="size-5" aria-hidden />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
        <p className="mt-1 truncate text-xl font-bold">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </Card>
  )
}
