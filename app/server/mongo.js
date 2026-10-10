import { MongoClient } from 'mongodb'
import { createSeed } from '../src/lib/seed.js'
import { hashPassword } from './security.js'

// MongoDB კავშირი. serverless გარემოში კლიენტი ინახება globalThis-ზე,
// რომ ყოველ მოთხოვნაზე ახალი კავშირი არ გაიხსნას.

export const COLLECTIONS = ['users', 'companies', 'drivers', 'routes', 'bookings', 'transactions']

let override = null
/** ტესტებისთვის: Mongo-ს მსგავსი db ობიექტის ჩანაცვლება */
export function setDbForTests(db) {
  override = db
}

async function connect() {
  if (override) return override
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not configured')
  if (!globalThis.__lpMongo) {
    const client = new MongoClient(uri, { maxPoolSize: 5 })
    globalThis.__lpMongo = client.connect().then((c) => c.db(process.env.MONGODB_DB || 'logistics'))
  }
  return globalThis.__lpMongo
}

let ready = null

export async function getDb() {
  const db = await connect()
  if (!ready) {
    ready = (async () => {
      if (!override) {
        await Promise.all(COLLECTIONS.map((name) => db.collection(name).createIndex({ id: 1 }, { unique: true })))
        await db.collection('users').createIndex({ email: 1 }, { unique: true })
        await db.collection('bookings').createIndex({ code: 1 }, { unique: true })
      }
      if ((await db.collection('users').countDocuments({})) === 0) await seed(db)
    })().catch((e) => {
      ready = null
      throw e
    })
  }
  await ready
  return db
}

async function seed(db) {
  const data = createSeed()
  data.users = data.users.map(({ password, ...u }) => ({ ...u, passwordHash: hashPassword(password) }))
  for (const name of COLLECTIONS) {
    if (data[name]?.length) await db.collection(name).insertMany(data[name].map((d) => ({ ...d })))
  }
}

/** დემო მონაცემების დაბრუნება საწყის მდგომარეობაში */
export async function resetDatabase() {
  const db = await connect()
  for (const name of COLLECTIONS) await db.collection(name).deleteMany({})
  await seed(db)
}

/** _id-ის გარეშე დოკუმენტები */
export const NO_ID = { projection: { _id: 0 } }
