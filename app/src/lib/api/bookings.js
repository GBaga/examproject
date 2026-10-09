import { cityName } from '../cities'
import { ApiError, clone, delay, loadDb, mutate, uid } from './db'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeCode(existing) {
  let code
  do {
    code = Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('')
  } while (existing.has(code))
  return code
}

/**
 * ექსპრეს ჯავშანი.
 * ადგილების შემოწმება და შემცირება ხდება ერთ ოპერაციაში (mutate), რაც overbooking-ს გამორიცხავს.
 * - სტუმარი იხდის ადგილზე (payment: 'cash')
 * - ავტორიზებული მომხმარებელი იხდის ბალანსიდან (payment: 'balance');
 *   კომპანიისთვის დამატებით მოწმდება ბიუჯეტის ლიმიტი.
 */
export async function createBooking({ routeId, passengerName, phone, seats, payerId = null }) {
  await delay()
  return mutate((db) => {
    const route = db.routes.find((r) => r.id === routeId)
    if (!route) throw new ApiError('მარშრუტი ვერ მოიძებნა', 'NOT_FOUND')

    const count = Number(seats)
    if (!Number.isInteger(count) || count < 1) throw new ApiError('აირჩიეთ ადგილების რაოდენობა', 'SEATS')
    if (route.seatsLeft === 0) throw new ApiError('ამ მარშრუტზე თავისუფალი ადგილი აღარ არის', 'SOLD_OUT')
    if (count > route.seatsLeft) {
      throw new ApiError(`დარჩენილია მხოლოდ ${route.seatsLeft} თავისუფალი ადგილი`, 'NOT_ENOUGH_SEATS')
    }

    const total = count * route.price
    const label = `${cityName(route.from)} → ${cityName(route.to)}`
    const now = new Date().toISOString()
    let payment = 'cash'

    if (payerId) {
      const payer = db.users.find((u) => u.id === payerId)
      if (!payer) throw new ApiError('მომხმარებელი ვერ მოიძებნა', 'NOT_FOUND')
      if (payer.id === route.ownerId) throw new ApiError('საკუთარ მარშრუტზე ჯავშანი შეუძლებელია', 'OWN_ROUTE')
      if (payer.balance < total) {
        throw new ApiError('ბალანსზე არასაკმარისი თანხაა. შეავსეთ ბალანსი პარამეტრებში.', 'INSUFFICIENT_FUNDS')
      }
      if (payer.role === 'company') {
        const company = db.companies.find((c) => c.id === payer.companyId)
        if (company && company.spent + total > company.budgetLimit) {
          throw new ApiError(
            `ჯავშანი აჭარბებს კომპანიის ბიუჯეტის ლიმიტს (დარჩენილია ${company.budgetLimit - company.spent} ₾)`,
            'BUDGET_LIMIT',
          )
        }
        if (company) company.spent += total
      }
      payer.balance -= total
      db.transactions.push({
        id: uid('t'),
        userId: payer.id,
        type: 'spend',
        amount: total,
        note: `${label} · ${count} ადგილი`,
        createdAt: now,
      })
      payment = 'balance'
    }

    // შემოსავალი გადამზიდს
    const owner = db.users.find((u) => u.id === route.ownerId)
    if (owner) {
      owner.balance += total
      db.transactions.push({
        id: uid('t'),
        userId: owner.id,
        type: 'earning',
        amount: total,
        note: `${label} · ${count} ადგილი${payment === 'cash' ? ' (ადგილზე გადახდა)' : ''}`,
        createdAt: now,
      })
    }

    route.seatsLeft -= count

    const booking = {
      id: uid('b'),
      code: makeCode(new Set(db.bookings.map((b) => b.code))),
      routeId: route.id,
      passengerName: passengerName.trim(),
      phone: phone.trim(),
      seats: count,
      total,
      payment,
      payerId,
      createdAt: now,
    }
    db.bookings.push(booking)
    return clone(booking)
  })
}

export async function getBookingByCode(code) {
  await delay()
  const db = loadDb()
  const booking = db.bookings.find((b) => b.code === code)
  if (!booking) throw new ApiError('ჯავშანი ვერ მოიძებნა', 'NOT_FOUND')
  const route = db.routes.find((r) => r.id === booking.routeId)
  return { ...clone(booking), route: route ? clone(route) : null }
}

/** მარშრუტის მფლობელისთვის — მის მარშრუტებზე გაკეთებული ჯავშნები */
export async function listBookingsForOwner(userId) {
  await delay()
  const db = loadDb()
  const myRouteIds = new Set(db.routes.filter((r) => r.ownerId === userId).map((r) => r.id))
  return db.bookings
    .filter((b) => myRouteIds.has(b.routeId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => ({ ...clone(b), route: clone(db.routes.find((r) => r.id === b.routeId)) }))
}
