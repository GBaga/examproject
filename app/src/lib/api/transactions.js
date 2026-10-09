import { ApiError, clone, delay, loadDb, mutate, uid } from './db'

export const MAX_TOPUP = 10000

/** ბალანსის შევსების იმიტაცია — რეალური გადახდა არ ხდება */
export async function topUp(userId, amount) {
  await delay(500)
  return mutate((db) => {
    const value = Number(amount)
    if (!(value > 0) || value > MAX_TOPUP) throw new ApiError('არასწორი თანხა', 'AMOUNT')
    const user = db.users.find((u) => u.id === userId)
    if (!user) throw new ApiError('მომხმარებელი ვერ მოიძებნა', 'NOT_FOUND')
    user.balance = Math.round((user.balance + value) * 100) / 100
    const tx = {
      id: uid('t'),
      userId,
      type: 'topup',
      amount: value,
      note: 'ბალანსის შევსება (იმიტაცია)',
      createdAt: new Date().toISOString(),
    }
    db.transactions.push(tx)
    return { balance: user.balance, transaction: clone(tx) }
  })
}

export async function listTransactions(userId) {
  await delay()
  const db = loadDb()
  return db.transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(clone)
}
