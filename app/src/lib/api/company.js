import { todayISO } from '../format'
import { ApiError, clone, delay, loadDb, mutate, uid } from './db'

export async function getCompany(companyId) {
  await delay()
  const db = loadDb()
  const company = db.companies.find((c) => c.id === companyId)
  if (!company) throw new ApiError('კომპანია ვერ მოიძებნა', 'NOT_FOUND')
  return clone(company)
}

export async function updateCompany(companyId, data) {
  await delay()
  return mutate((db) => {
    const company = db.companies.find((c) => c.id === companyId)
    if (!company) throw new ApiError('კომპანია ვერ მოიძებნა', 'NOT_FOUND')
    const budgetLimit = Number(data.budgetLimit)
    if (budgetLimit < company.spent) {
      throw new ApiError(`ლიმიტი ვერ იქნება უკვე დახარჯულ თანხაზე (${company.spent} ₾) ნაკლები`, 'BUDGET')
    }
    Object.assign(company, {
      name: data.name.trim(),
      taxId: data.taxId.trim(),
      contact: data.contact.trim(),
      budgetLimit,
    })
    return clone(company)
  })
}

export async function listDrivers(companyId) {
  await delay()
  const db = loadDb()
  const today = todayISO()
  return db.drivers
    .filter((d) => d.companyId === companyId)
    .map((d) => ({
      ...clone(d),
      upcomingTrips: db.routes.filter((r) => r.driverId === d.id && r.date >= today).length,
    }))
}

export async function addDriver(companyId, { name, phone }) {
  await delay()
  return mutate((db) => {
    if (db.drivers.some((d) => d.companyId === companyId && d.phone === phone.trim())) {
      throw new ApiError('ამ ნომრით მძღოლი უკვე დამატებულია', 'DUPLICATE')
    }
    const driver = { id: uid('d'), companyId, name: name.trim(), phone: phone.trim() }
    db.drivers.push(driver)
    return { ...clone(driver), upcomingTrips: 0 }
  })
}

export async function removeDriver(companyId, driverId) {
  await delay()
  return mutate((db) => {
    const today = todayISO()
    const hasTrips = db.routes.some((r) => r.driverId === driverId && r.date >= today)
    if (hasTrips) throw new ApiError('მძღოლს აქვს დაგეგმილი რეისები — ჯერ გადაანაწილეთ ისინი', 'HAS_TRIPS')
    db.drivers = db.drivers.filter((d) => !(d.id === driverId && d.companyId === companyId))
    return true
  })
}
