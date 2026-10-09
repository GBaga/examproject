import { Card } from '../../components/ui'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-md py-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      <Card>{children}</Card>
      {footer && <div className="mt-4 text-center text-sm text-muted">{footer}</div>}
    </div>
  )
}
