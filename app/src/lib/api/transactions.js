import { rpc } from './client'

export const MAX_TOPUP = 10000

/** ბალანსის შევსების იმიტაცია — რეალური გადახდა არ ხდება */
// eslint-disable-next-line no-unused-vars
export const topUp = (_userId, amount) => rpc('transactions.topUp', { amount })
// eslint-disable-next-line no-unused-vars
export const listTransactions = (_userId) => rpc('transactions.list')
