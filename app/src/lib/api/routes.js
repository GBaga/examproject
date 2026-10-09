import { todayISO } from '../format'
import { ApiError, clone, delay, loadDb, mutate, uid } from './db'

function withOwner(db, route) {
  const owner = db.users.find((u) => u.id === route.ownerId)
  const company = owner?.companyId ? db.companies.find((c) => c.id === owner.companyId) : null
  const driver = route.driverId ? db.drivers.find((d) => d.id === route.driverId) : null
  return {
    ...clone(route),
    ownerName: company?.name ?? owner?.name ?? '—',
    ownerType: owner?.role ?? 'provider',
    driverName: driver?.name ?? (owner?.role === 'provider' ? owner.name : null),
  }
}

const sortKey = (r) => `${r.date} ${r.time}`

/**
 * ძებნა ფილტრებით.
 * filters: { from, to, date, minPrice, maxPrice, sort: 'date' | 'price-asc' | 'price-desc' }
 */
export async function searchRoutes(filters = {}) {
  await delay()
  const db = loadDb()
  const today = todayISO()
  const min = filters.minPrice === '' || filters.minPrice == null ? null : Number(filters.minPrice)
  const max = filters.maxPrice === '' || filters.maxPrice == null ? null : Number(filters.maxPrice)

  let list = db.routes.filter((r) => {
    if (r.date < today) return false
    if (filters.from && r.from !== filters.from) return false
    if (filters.to && r.to !== filters.to) return false
    if (filters.date && r.date !== filters.date) return false
    if (min != null && !Number.isNaN(min) && r.price < min) return false
    if (max != null && !Number.isNaN(max) && r.price > max) return false
    return true
  })

  const sort = filters.sort || 'date'
  list = list.sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price || sortKey(a).localeCompare(sortKey(b))
    if (sort === 'price-desc') return b.price - a.price || sortKey(a).localeCompare(sortKey(b))
    return sortKey(a).localeCompare(sortKey(b))
  })

  return list.map((r) => withOwner(db, r))
}

export async function getRoute(id) {
  await delay()
  const db = loadDb()
  const route = db.routes.find((r) => r.id === id)
  if (!route) throw new ApiError('მარშრუტი ვერ მოიძებნა', 'NOT_FOUND')
  return withOwner(db, route)
}

export async function listMyRoutes(userId) {
  await delay()
  const db = loadDb()
  return db.routes
    .filter((r) => r.ownerId === userId)
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
    .map((r) => withOwner(db, r))
}

export async function createRoute(user, data) {
  await delay()
  return mutate((db) => {
    if (!['provider', 'company'].includes(user.role)) {
      throw new ApiError('მარშრუტის შექმნის უფლება არ გაქვთ', 'FORBIDDEN')
    }
    const route = {
      id: uid('r'),
      ownerId: user.id,
      driverId: user.role === 'company' ? data.driverId : null,
      from: data.from,
      to: data.to,
      date: data.date,
      time: data.time,
      capacity: Number(data.capacity),
      seatsLeft: Number(data.capacity),
      price: Number(data.price),
      createdAt: new Date().toISOString(),
    }
    db.routes.push(route)
    return withOwner(db, route)
  })
}

export async function updateRoute(user, id, data) {
  await delay()
  return mutate((db) => {
    const route = db.routes.find((r) => r.id === id)
    if (!route) throw new ApiError('მარშრუტი ვერ მოიძებნა', 'NOT_FOUND')
    if (route.ownerId !== user.id) throw new ApiError('ეს მარშრუტი თქვენი არ არის', 'FORBIDDEN')

    const booked = route.capacity - route.seatsLeft
    const capacity = Number(data.capacity)
    if (capacity < booked) {
      throw new ApiError(`ტევადობა ვერ იქნება დაჯავშნილ ადგილებზე (${booked}) ნაკლები`, 'CAPACITY')
    }
    Object.assign(route, {
      from: data.from,
      to: data.to,
      date: data.date,
      time: data.time,
      capacity,
      seatsLeft: capacity - booked,
      price: Number(data.price),
      driverId: user.role === 'company' ? data.driverId : null,
    })
    return withOwner(db, route)
  })
}

export async function deleteRoute(user, id) {
  await delay()
  return mutate((db) => {
    const route = db.routes.find((r) => r.id === id)
    if (!route) throw new ApiError('მარშრუტი ვერ მოიძებნა', 'NOT_FOUND')
    if (route.ownerId !== user.id) throw new ApiError('ეს მარშრუტი თქვენი არ არის', 'FORBIDDEN')
    if (route.seatsLeft < route.capacity) {
      throw new ApiError('მარშრუტს უკვე აქვს ჯავშნები და ვერ წაიშლება', 'HAS_BOOKINGS')
    }
    db.routes = db.routes.filter((r) => r.id !== id)
    return true
  })
}
