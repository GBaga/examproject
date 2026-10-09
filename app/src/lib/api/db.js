import { createSeed } from '../seed'

// Mock backend: მონაცემები ინახება localStorage-ში.
// ყველა API ფუნქცია async-ია და ქსელის დაყოვნებას ახდენს იმიტაციას,
// რომ რეალურ backend-ზე გადასვლისას მხოლოდ ეს ფენა შეიცვალოს.

const KEY = 'lp_db_v1'
const LATENCY_MS = 250

let memoryFallback = null

function readRaw() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return memoryFallback
  }
}

function writeRaw(db) {
  memoryFallback = db
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // localStorage მიუწვდომელია (მაგ. private mode) — ვრჩებით მეხსიერებაში
  }
}

export function loadDb() {
  let db = readRaw()
  if (!db) {
    db = createSeed()
    writeRaw(db)
  }
  return db
}

export function saveDb(db) {
  writeRaw(db)
}

/** ტრანზაქციული ცვლილება: წაიკითხე → შეცვალე → ჩაწერე ერთ ნაბიჯში */
export function mutate(fn) {
  const db = loadDb()
  const result = fn(db)
  saveDb(db)
  return result
}

export function resetDb() {
  writeRaw(createSeed())
}

export const delay = (ms = LATENCY_MS) => new Promise((res) => setTimeout(res, ms))

export const uid = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const clone = (value) => JSON.parse(JSON.stringify(value))

export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}
