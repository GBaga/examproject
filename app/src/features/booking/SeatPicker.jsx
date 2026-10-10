import { Armchair, Steering } from './seatIcons'

/**
 * ადგილების სქემა: რიგში 4 ადგილი (2 + გასასვლელი + 2), ზემოთ მძღოლი.
 * taken — დაკავებული ნომრები, selected — მგზავრის არჩეული ნომრები.
 */
export default function SeatPicker({ capacity, taken = [], selected = [], max, onToggle }) {
  const takenSet = new Set(taken)
  const rows = []
  for (let i = 1; i <= capacity; i += 4) rows.push([i, i + 1, i + 2, i + 3].filter((n) => n <= capacity))

  const seat = (n) => {
    const isTaken = takenSet.has(n)
    const isSelected = selected.includes(n)
    const limitReached = !isSelected && selected.length >= max
    const state = isTaken ? 'დაკავებული' : isSelected ? 'არჩეული' : 'თავისუფალი'
    return (
      <button
        key={n}
        type="button"
        disabled={isTaken || limitReached}
        onClick={() => onToggle(n)}
        aria-pressed={isSelected}
        aria-label={`ადგილი ${n}, ${state}`}
        title={`ადგილი ${n} — ${state}`}
        className={`flex size-11 flex-col items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-colors ${
          isTaken
            ? 'cursor-not-allowed border-line bg-gray-100 text-gray-400'
            : isSelected
              ? 'border-brand-700 bg-brand-700 text-white'
              : limitReached
                ? 'cursor-not-allowed border-line bg-white text-gray-400'
                : 'border-line bg-white text-brand-900 hover:border-brand-500'
        }`}
      >
        <Armchair className="size-4" aria-hidden />
        {n}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex w-fit flex-col gap-2 rounded-2xl border border-line bg-brand-50/40 p-3">
        <div className="flex items-center justify-end pb-1 text-muted" aria-hidden>
          <Steering className="size-6" />
        </div>
        {rows.map((row, r) => (
          <div key={r} className="flex gap-2">
            {row.slice(0, 2).map(seat)}
            <div className="w-4" aria-hidden />
            {row.slice(2).map(seat)}
          </div>
        ))}
      </div>
      <ul className="flex flex-wrap gap-3 text-xs text-muted">
        <li className="flex items-center gap-1.5"><span className="size-3 rounded border border-line bg-white" />თავისუფალი</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-brand-700" />არჩეული</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-gray-200" />დაკავებული</li>
      </ul>
    </div>
  )
}
