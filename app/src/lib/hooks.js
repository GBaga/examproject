import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * async მონაცემების ჩატვირთვა loading / error / data მდგომარეობებით.
 * deps-ის ცვლილებისას ძველი პასუხი იგნორირდება (race condition-ის პრევენცია).
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const requestId = useRef(0)

  const run = useCallback(() => {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    return fn()
      .then((data) => {
        if (id === requestId.current) setState({ data, loading: false, error: null })
        return data
      })
      .catch((error) => {
        if (id === requestId.current) setState({ data: null, loading: false, error: error.message })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { ...state, reload: run, setData: (data) => setState((s) => ({ ...s, data })) }
}

export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Logistics Platform` : 'Logistics Platform'
  }, [title])
}
