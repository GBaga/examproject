import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, ErrorBox, Field, Input } from '../../components/ui'
import { updateCompany } from '../../lib/api/company'
import { formatMoney } from '../../lib/format'
import { companySchema } from '../../lib/schemas'

export default function CompanyProfileForm({ company, onSaved }) {
  const [serverError, setServerError] = useState(null)
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name,
      taxId: company.taxId,
      contact: company.contact,
      budgetLimit: company.budgetLimit,
    },
  })

  const onSubmit = async (values) => {
    setServerError(null)
    setSaved(false)
    try {
      const updated = await updateCompany(company.id, values)
      reset({ name: updated.name, taxId: updated.taxId, contact: updated.contact, budgetLimit: updated.budgetLimit })
      setSaved(true)
      onSaved?.(updated)
    } catch (err) {
      setServerError(err.message)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2 font-bold">
        <Building2 className="size-5 text-brand-600" aria-hidden /> კომპანიის პროფილი
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="კომპანიის სახელი" htmlFor="c-name" error={errors.name?.message}>
          <Input id="c-name" invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="საიდენტიფიკაციო კოდი" htmlFor="c-tax" error={errors.taxId?.message}>
          <Input id="c-tax" inputMode="numeric" maxLength={9} invalid={!!errors.taxId} {...register('taxId')} />
        </Field>
        <Field label="საკონტაქტო" htmlFor="c-contact" error={errors.contact?.message}>
          <Input id="c-contact" placeholder="+995 5XX XX XX XX" invalid={!!errors.contact} {...register('contact')} />
        </Field>
        <Field
          label="ბიუჯეტის ლიმიტი (₾)"
          htmlFor="c-budget"
          error={errors.budgetLimit?.message}
          hint={`ამჟამად დახარჯულია ${formatMoney(company.spent)}`}
        >
          <Input id="c-budget" type="number" min={0} inputMode="numeric" invalid={!!errors.budgetLimit} {...register('budgetLimit')} />
        </Field>
        <div className="flex flex-col gap-3 sm:col-span-2">
          <ErrorBox message={serverError} />
          <div className="flex items-center justify-end gap-3">
            {saved && !isDirty && (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" aria-hidden /> შენახულია
              </span>
            )}
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              შენახვა
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
