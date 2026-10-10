import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// პაროლები ინახება scrypt ჰეშით, სესია — HMAC-ით ხელმოწერილი ტოკენით.

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const a = Buffer.from(hash, 'hex')
  const b = scryptSync(password, salt, 32)
  return a.length === b.length && timingSafeEqual(a, b)
}

const TTL_MS = 7 * 24 * 60 * 60 * 1000

function secret() {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET is not configured')
  return s
}

const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('base64url')

export function createToken(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** აბრუნებს userId-ს ან null-ს, თუ ტოკენი არასწორია ან ვადაგასულია */
export function readToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [payload, sig] = token.split('.')
  const expected = sign(payload)
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return exp > Date.now() ? sub : null
  } catch {
    return null
  }
}
