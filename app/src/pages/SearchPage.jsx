import { ArrowLeftRight, RotateCcw, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, EmptyState, ErrorBox, Field, Input, PageHeader, Select, Spinner } from '../components/ui'
import RouteCard from '../features/routes/RouteCard'
import { searchRoutes } from '../lib/api/routes'
import { CITIES } from '../lib/cities'
import { todayISO } from '../lib/format'
import { useAsync, useDebouncedValue, useDocumentTitle } from '../lib/hooks'

const KEYS = ['from', 'to', 'date', 'minPrice', 'maxPrice', 'sort']

export default function SearchPage() {
  useDocumentTitle('მარშრუტების ძებნა')
  const [params, setParams] = useSearchParams()
  const filters = Object.fromEntries(KEYS.map((k) => [k, params.get(k) ?? '']))

  // ფასის ველები: ლოკალური state + debounce, რომ ყოველ ღილაკზე ძებნა არ გაეშვას
  const [price, setPrice] = useState({ minPrice: filters.minPrice, maxPrice: filters.maxPrice })
  const debouncedPrice = useDebouncedValue(price, 400)

  const setFilter = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setParams(next, { replace: true })
  }

  useEffect(() => {
    if (debouncedPrice.minPrice !== filters.minPrice || debouncedPrice.maxPrice !== filters.maxPrice) {
      setFilter(debouncedPrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPrice])

  const queryKey = KEYS.map((k) => filters[k]).join('|')
  const { data, loading, error, reload } = useAsync(() => searchRoutes(filters), [queryKey])

  const swap = () => setFilter({ from: filters.to, to: filters.from })
  const reset = () => {
    setPrice({ minPrice: '', maxPrice: '' })
    setParams(new URLSearchParams(), { replace: true })
  }
  const hasFilters = KEYS.some((k) => k !== 'sort' && filters[k])

  return (
    <div>
      <PageHeader title="მარშრუტების ძებნა" subtitle="იპოვეთ რეისი და დაჯავშნეთ ადგილი რეგისტრაციის გარეშე." />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()} aria-label="ფილტრები">
            <div className="flex items-end gap-2">
              <Field label="საიდან" htmlFor="f-from" className="flex-1">
                <Select id="f-from" value={filters.from} onChange={(e) => setFilter({ from: e.target.value })}>
                  <option value="">ნებისმიერი</option>
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <button
                type="button"
                onClick={swap}
                className="mb-1 rounded-lg border border-line p-2 text-muted hover:text-brand-700"
                aria-label="მიმართულების შებრუნება"
                title="შებრუნება"
              >
                <ArrowLeftRight className="size-4" />
              </button>
            </div>
            <Field label="სად" htmlFor="f-to">
              <Select id="f-to" value={filters.to} onChange={(e) => setFilter({ to: e.target.value })}>
                <option value="">ნებისმიერი</option>
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="თარიღი" htmlFor="f-date">
              <Input id="f-date" type="date" min={todayISO()} value={filters.date} onChange={(e) => setFilter({ date: e.target.value })} />
            </Field>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-sm font-medium">ფასი (₾)</legend>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="მინ."
                  aria-label="მინიმალური ფასი"
                  value={price.minPrice}
                  onChange={(e) => setPrice((p) => ({ ...p, minPrice: e.target.value }))}
                />
                <span className="text-muted">—</span>
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="მაქს."
                  aria-label="მაქსიმალური ფასი"
                  value={price.maxPrice}
                  onChange={(e) => setPrice((p) => ({ ...p, maxPrice: e.target.value }))}
                />
              </div>
            </fieldset>
            <Field label="სორტირება" htmlFor="f-sort">
              <Select id="f-sort" value={filters.sort || 'date'} onChange={(e) => setFilter({ sort: e.target.value === 'date' ? '' : e.target.value })}>
                <option value="date">თარიღით (უახლოესი)</option>
                <option value="price-asc">ფასით (იაფიდან)</option>
                <option value="price-desc">ფასით (ძვირიდან)</option>
              </Select>
            </Field>
            {hasFilters && (
              <Button type="button" variant="ghost" onClick={reset}>
                <RotateCcw className="size-4" aria-hidden /> ფილტრების გასუფთავება
              </Button>
            )}
          </form>
        </aside>

        <section aria-live="polite">
          {!loading && data && (
            <p className="mb-3 text-sm text-muted">
              ნაპოვნია <span className="font-semibold text-ink">{data.length}</span> მარშრუტი
            </p>
          )}
          <ErrorBox message={error} onRetry={reload} />
          {loading ? (
            <Spinner />
          ) : data?.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="მარშრუტი ვერ მოიძებნა"
              text="შეცვალეთ თარიღი, მიმართულება ან ფასის დიაპაზონი."
              action={
                hasFilters && (
                  <Button variant="outline" onClick={reset}>
                    ფილტრების გასუფთავება
                  </Button>
                )
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {data?.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
