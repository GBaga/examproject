import { AlertTriangle } from 'lucide-react'
import { Component } from 'react'
import { Button } from '../components/ui'

/**
 * იჭერს გვერდის რენდერისას მომხდარ შეცდომას: თეთრი ეკრანის ნაცვლად ჩანს შეტყობინება,
 * header და ნავიგაცია კი აგრძელებს მუშაობას. Layout-ში key = მისამართი, ამიტომ სხვა გვერდზე გადასვლისას თავიდან ცდის.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('UI შეცდომა:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center" role="alert">
        <AlertTriangle className="size-10 text-accent-600" aria-hidden />
        <h1 className="text-xl font-bold">რაღაც არასწორად წავიდა</h1>
        <p className="text-sm text-muted">
          გვერდის ჩვენება ვერ მოხერხდა. სცადეთ განახლება ან დაბრუნდით მთავარ გვერდზე. თუ ინტერნეტი გაითიშა, შეამოწმეთ კავშირი.
        </p>
        <div className="mt-2 flex gap-2">
          <Button onClick={() => window.location.reload()}>განახლება</Button>
          <Button variant="outline" to="/">
            მთავარზე
          </Button>
        </div>
      </div>
    )
  }
}
