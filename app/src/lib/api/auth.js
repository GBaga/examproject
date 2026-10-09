import { ApiError, clone, delay, loadDb, mutate, uid } from './db'

const publicUser = (user) => {
  if (!user) return null
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = user
  return clone(rest)
}

export async function login(email, password) {
  await delay()
  const db = loadDb()
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user || user.password !== password) {
    throw new ApiError('ელფოსტა ან პაროლი არასწორია', 'INVALID_CREDENTIALS')
  }
  return publicUser(user)
}

export async function register({ name, email, password, role, companyName, taxId }) {
  await delay()
  return mutate((db) => {
    const normalized = email.trim().toLowerCase()
    if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
      throw new ApiError('ეს ელფოსტა უკვე დარეგისტრირებულია', 'EMAIL_TAKEN')
    }
    const user = {
      id: uid('u'),
      name: name.trim(),
      email: normalized,
      password,
      role,
      balance: 0,
      createdAt: new Date().toISOString(),
    }
    if (role === 'company') {
      const company = {
        id: uid('c'),
        name: companyName.trim(),
        taxId: taxId.trim(),
        contact: '',
        budgetLimit: 1000,
        spent: 0,
      }
      db.companies.push(company)
      user.companyId = company.id
    }
    db.users.push(user)
    return publicUser(user)
  })
}

/** სესიის აღდგენა / ბალანსის განახლება — დაყოვნების გარეშე */
export function getUserSync(id) {
  const db = loadDb()
  return publicUser(db.users.find((u) => u.id === id))
}

export async function updateProfile(userId, { name }) {
  await delay()
  return mutate((db) => {
    const user = db.users.find((u) => u.id === userId)
    if (!user) throw new ApiError('მომხმარებელი ვერ მოიძებნა', 'NOT_FOUND')
    user.name = name.trim()
    return publicUser(user)
  })
}
