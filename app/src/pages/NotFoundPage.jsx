import { MapPinOff } from 'lucide-react'
import { Button, EmptyState } from '../components/ui'
import { useDocumentTitle } from '../lib/hooks'

export default function NotFoundPage() {
  useDocumentTitle('გვერდი ვერ მოიძებნა')
  return (
    <div className="mx-auto max-w-lg py-16">
      <EmptyState
        icon={MapPinOff}
        title="404 — გვერდი ვერ მოიძებნა"
        text="ასეთი მისამართი არ არსებობს. შესაძლოა ბმული მოძველებულია."
        action={<Button to="/">მთავარ გვერდზე</Button>}
      />
    </div>
  )
}
