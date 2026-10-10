import { randomBytes } from 'node:crypto'
import { cityName } from '../src/lib/cities.js'
import { todayISO } from '../src/lib/format.js'
import { getDb, NO_ID, resetDatabase } from './mongo.js'
import { createToken, hashPassword, verifyPassword } from './security.js'

// Backend-ის ბიზნეს-ლოგიკა MongoDB-ზე. ყოველი action იღებს (args, ctx),
// სადაც ctx.userId მოდის ხელმოწერილი ტოკენიდან და არა კლიენტის მონაცემებიდან.

export class ApiError extends Error {
  constructor(message, code, status = 400) {
    super(message)
    this.code = code
    this.status = status
  }
}

export const MAX_TOPUP = 10000
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`
const sortKey = (r) => `${r.date} ${r.time}`
const col = async (name) => (await getDb()).collection(name)

const publicUser = (u) => {
  if (!u) return null
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, _id, ...rest } = u
  return rest
}

async function requireUser(ctx, roles) {
  if (!ctx.userId) throw new ApiError('საჭიროა ავტორიზაცია', 'UNAUTHORIZED', 401)
  const user = await (await col('users')).findOne({ id: ctx.userId }, NO_ID)
  if (!user) throw new ApiError('საჭიროა ავტორიზაცია', 'UNAUTHORIZED', 401)
  if (roles && !roles.includes(user.role)) throw new ApiError('ამ მოქმედების უფლება არ გაქვთ', 'FORBIDDEN', 403)
  return user
}

async function withOwners(routes) {
  if (!routes.length) return []
  const ownerIds = [...new Set(routes.map((r) => r.ownerId))]
  const driverIds = [...new Set(routes.map((r) => r.driverId).filter(Boolean))]
  const owners = await (await col('users')).find({ id: { $in: ownerIds } }, NO_ID).toArray()
  const companyIds = owners.map((o) => o.companyId).filter(Boolean)
  const companies = companyIds.length ? await (await col('companies')).find({ id: { $in: companyIds } }, NO_ID).toArray() : []
  const drivers = driverIds.length ? await (await col('drivers')).find({ id: { $in: driverIds } }, NO_ID).toArray() : []
  return routes.map((route) => {
    const owner = owners.find((u) => u.id === route.ownerId)
    const company = owner?.companyId ? companies.find((c) => c.id === owner.companyId) : null
    const driver = route.driverId ? drivers.find((d) => d.id === route.driverId) : null
    return {
      ...route,
      ownerName: company?.name ?? owner?.name ?? '—',
      ownerType: owner?.role ?? 'provider',
      driverName: driver?.name ?? (owner?.role === 'provider' ? owner.name : null),
    }
  })
}

function routeFields(user, data) {
  const capacity = Number(data.capacity)
  const price = Number(data.price)
  if (!data.from || !data.to || data.from === data.to) throw new ApiError('აირჩიეთ განსხვავებული ქალაქები', 'CITIES')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || '') || !/^\d{2}:\d{2}$/.test(data.time || '')) {
    throw new ApiError('მიუთითეთ თარიღი და დრო', 'DATETIME')
  }
  if (!Number.isInteger(capacity) || capacity < 1) throw new ApiError('ტევადობა არასწორია', 'CAPACITY')
  if (!(price > 0)) throw new ApiError('ფასი არასწორია', 'PRICE')
  return {
    from: data.from,
    to: data.to,
    date: data.date,
    time: data.time,
    capacity,
    price,
    driverId: user.role === 'company' ? data.driverId || null : null,
  }
}

async function makeCode(bookings) {
  for (;;) {
    const bytes = randomBytes(6)
    const code = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
    if (!(await bookings.findOne({ code }))) return code
  }
}

export const actions = {
  // ---------- auth ----------
  'auth.login': async ({ email, password }) => {
    const user = await (await col('users')).findOne({ email: String(email || '').trim().toLowerCase() })
    if (!user || !verifyPassword(String(password || ''), user.passwordHash)) {
      throw new ApiError('ელფოსტა ან პაროლი არასწორია', 'INVALID_CREDENTIALS', 401)
    }
    return { user: publicUser(user), token: createToken(user.id) }
  },

  'auth.register': async ({ name, email, password, role, companyName, taxId }) => {
    const users = await col('users')
    const normalized = String(email || '').trim().toLowerCase()
    if (!['provider', 'company'].includes(role)) throw new ApiError('აირჩიეთ როლი', 'ROLE')
    if (!name?.trim() || !normalized || String(password || '').length < 6) throw new ApiError('შეავსეთ ყველა ველი', 'FIELDS')
    if (await users.findOne({ email: normalized })) throw new ApiError('ეს ელფოსტა უკვე დარეგისტრირებულია', 'EMAIL_TAKEN', 409)
    const user = {
      id: uid('u'),
      name: name.trim(),
      email: normalized,
      passwordHash: hashPassword(password),
      role,
      balance: 0,
      createdAt: new Date().toISOString(),
    }
    if (role === 'company') {
      const company = { id: uid('c'), name: String(companyName || '').trim(), taxId: String(taxId || '').trim(), contact: '', budgetLimit: 1000, spent: 0 }
      await (await col('companies')).insertOne({ ...company })
      user.companyId = company.id
    }
    await users.insertOne({ ...user })
    return { user: publicUser(user), token: createToken(user.id) }
  },

  'auth.me': async (_, ctx) => publicUser(await requireUser(ctx)),

  'auth.updateProfile': async ({ name }, ctx) => {
    const user = await requireUser(ctx)
    if (!name?.trim()) throw new ApiError('მიუთითეთ სახელი', 'NAME')
    await (await col('users')).updateOne({ id: user.id }, { $set: { name: name.trim() } })
    return publicUser({ ...user, name: name.trim() })
  },

  // ---------- routes ----------
  'routes.search': async (filters = {}) => {
    const q = { date: { $gte: todayISO() } }
    if (filters.from) q.from = filters.from
    if (filters.to) q.to = filters.to
    if (filters.date) q.date = filters.date < todayISO() ? '0000-00-00' : filters.date
    const min = filters.minPrice === '' || filters.minPrice == null ? NaN : Number(filters.minPrice)
    const max = filters.maxPrice === '' || filters.maxPrice == null ? NaN : Number(filters.maxPrice)
    if (!Number.isNaN(min) || !Number.isNaN(max)) {
      q.price = {}
      if (!Number.isNaN(min)) q.price.$gte = min
      if (!Number.isNaN(max)) q.price.$lte = max
    }
    const list = await (await col('routes')).find(q, NO_ID).toArray()
    const sort = filters.sort || 'date'
    list.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price || sortKey(a).localeCompare(sortKey(b))
      if (sort === 'price-desc') return b.price - a.price || sortKey(a).localeCompare(sortKey(b))
      return sortKey(a).localeCompare(sortKey(b))
    })
    return withOwners(list)
  },

  'routes.get': async ({ id }) => {
    const route = await (await col('routes')).findOne({ id }, NO_ID)
    if (!route) throw new ApiError('მარშრუტი ვერ მოიძებნა', 'NOT_FOUND', 404)
    return (await withOwners([route]))[0]
  },

  'routes.listMine': async (_, ctx) => {
    const user = await requireUser(ctx, ['provider', 'company'])
    const list = await (await col('routes')).find({ ownerId: user.id }, NO_ID).toArray()
    return withOwners(list.sort((a, b) => sortKey(a).localeCompare(sortKey(b))))
  },

  'routes.create': async (data, ctx) => {
    const user = await requireUser(ctx, ['provider', 'company'])
    const fields = routeFields(user, data)
    const route = { id: uid('r'), ownerId: user.id, ...fields, seatsLeft: fields.capacity, seatsTaken: [], createdAt: new Date().toISOString() }
    await (await col('routes')).insertOne({ ...route })
    return (await withOwners([route]))[0]
  },

  'routes.update': async ({ id, data }, ctx) => {
    const user = await requireUser(ctx, ['provider', 'company'])
    const routes = await col('routes')
    const route = await routes.findOne({ id }, NO_ID)
    if (!route) throw new ApiError('მარშრუტი ვერ მოიძებნა', 'NOT_FOUND', 404)
    if (route.ownerId !== user.id) throw new ApiError('ეს მარშრუტი თქვენი არ არის', 'FORBIDDEN', 403)
    const fields = routeFields(user, data)
    const taken = route.seatsTaken ?? []
    const highest = taken.length ? Math.max(...taken) : 0
    if (fields.capacity < highest) {
      throw new ApiError(`ტევადობა ვერ იქნება დაკავებულ ადგილის ნომერზე (№${highest}) ნაკლები`, 'CAPACITY')
    }
    // განახლება მხოლოდ მაშინ, თუ ამასობაში ახალი ჯავშანი არ გაკეთებულა (seatsLeft უცვლელია)
    const res = await routes.updateOne(
      { id, capacity: route.capacity, seatsLeft: route.seatsLeft },
      { $set: { ...fields, seatsLeft: fields.capacity - taken.length } },
    )
    if (!res.matchedCount) throw new ApiError('მარშრუტი ამასობაში შეიცვალა — სცადეთ თავიდან', 'CONFLICT', 409)
    return (await withOwners([await routes.findOne({ id }, NO_ID)]))[0]
  },

  'routes.delete': async ({ id }, ctx) => {
    const user = await requireUser(ctx, ['provider', 'company'])
    const routes = await col('routes')
    const route = await routes.findOne({ id }, NO_ID)
    if (!route) throw new ApiError('მარშრუტი ვერ მოიძებნა', 'NOT_FOUND', 404)
    if (route.ownerId !== user.id) throw new ApiError('ეს მარშრუტი თქვენი არ არის', 'FORBIDDEN', 403)
    if (route.seatsLeft < route.capacity) throw new ApiError('მარშრუტს უკვე აქვს ჯავშნები და ვერ წაიშლება', 'HAS_BOOKINGS')
    await routes.deleteOne({ id, ownerId: user.id })
    return true
  },

  // ---------- bookings ----------
  /**
   * ექსპრეს ჯავშანი. Overbooking-ს გამორიცხავს ატომური პირობითი განახლება:
   * ადგილი მცირდება მხოლოდ მაშინ, თუ seatsLeft >= მოთხოვნილი რაოდენობა.
   * შემდეგი ნაბიჯის ჩავარდნისას ცვლილებები უკან ბრუნდება (კომპენსაცია).
   */
  'bookings.create': async ({ routeId, passengerName, phone, seatNumbers, payWithBalance }, ctx) => {
    const nums = Array.isArray(seatNumbers) ? [...new Set(seatNumbers.map(Number))].sort((a, b) => a - b) : []
    const count = nums.length
    if (!count || nums.some((n) => !Number.isInteger(n) || n < 1)) throw new ApiError('აირჩიეთ ადგილები სქემაზე', 'SEATS')
    if (!passengerName?.trim() || !phone?.trim()) throw new ApiError('შეავსეთ სახელი და ტელეფონი', 'FIELDS')

    const [routes, users, companies, txs, bookings] = await Promise.all(
      ['routes', 'users', 'companies', 'transactions', 'bookings'].map(col),
    )
    const route = await routes.findOne({ id: routeId }, NO_ID)
    if (!route) throw new ApiError('მარშრუტი ვერ მოიძებნა', 'NOT_FOUND', 404)
    if (nums.some((n) => n > route.capacity)) throw new ApiError('ასეთი ადგილი ამ მარშრუტზე არ არსებობს', 'SEATS')

    const payer = payWithBalance && ctx.userId ? await requireUser(ctx) : null
    if (payer && payer.id === route.ownerId) throw new ApiError('საკუთარ მარშრუტზე ჯავშანი შეუძლებელია', 'OWN_ROUTE')

    const total = count * route.price
    const label = `${cityName(route.from)} → ${cityName(route.to)}`
    const now = new Date().toISOString()
    const undo = []

    try {
      // ატომური დაჯავშნა: ჩაიწერება მხოლოდ მაშინ, თუ არცერთი არჩეული ადგილი არ არის დაკავებული
      const seatRes = await routes.updateOne(
        { id: routeId, seatsLeft: { $gte: count }, seatsTaken: { $nin: nums } },
        { $push: { seatsTaken: { $each: nums } }, $inc: { seatsLeft: -count } },
      )
      if (!seatRes.modifiedCount) {
        const fresh = await routes.findOne({ id: routeId }, NO_ID)
        if (!fresh?.seatsLeft) throw new ApiError('ამ მარშრუტზე თავისუფალი ადგილი აღარ არის', 'SOLD_OUT', 409)
        const busy = nums.filter((n) => (fresh.seatsTaken ?? []).includes(n))
        throw new ApiError(`ადგილი № ${busy.join(', ')} უკვე დაკავებულია — აირჩიეთ სხვა`, 'SEAT_TAKEN', 409)
      }
      undo.push(() => routes.updateOne({ id: routeId }, { $pull: { seatsTaken: { $in: nums } }, $inc: { seatsLeft: count } }))

      let payment = 'cash'
      if (payer) {
        if (payer.role === 'company') {
          const company = await companies.findOne({ id: payer.companyId }, NO_ID)
          if (company) {
            const r = await companies.updateOne({ id: company.id, spent: { $lte: company.budgetLimit - total } }, { $inc: { spent: total } })
            if (!r.modifiedCount) {
              throw new ApiError(`ჯავშანი აჭარბებს კომპანიის ბიუჯეტის ლიმიტს (დარჩენილია ${company.budgetLimit - company.spent} ₾)`, 'BUDGET_LIMIT')
            }
            undo.push(() => companies.updateOne({ id: company.id }, { $inc: { spent: -total } }))
          }
        }
        const r = await users.updateOne({ id: payer.id, balance: { $gte: total } }, { $inc: { balance: -total } })
        if (!r.modifiedCount) throw new ApiError('ბალანსზე არასაკმარისი თანხაა. შეავსეთ ბალანსი პარამეტრებში.', 'INSUFFICIENT_FUNDS')
        undo.push(() => users.updateOne({ id: payer.id }, { $inc: { balance: total } }))
        await txs.insertOne({ id: uid('t'), userId: payer.id, type: 'spend', amount: total, note: `${label} · ${count} ადგილი`, createdAt: now })
        payment = 'balance'
      }

      await users.updateOne({ id: route.ownerId }, { $inc: { balance: total } })
      await txs.insertOne({
        id: uid('t'),
        userId: route.ownerId,
        type: 'earning',
        amount: total,
        note: `${label} · ${count} ადგილი${payment === 'cash' ? ' (ადგილზე გადახდა)' : ''}`,
        createdAt: now,
      })

      const booking = {
        id: uid('b'),
        code: await makeCode(bookings),
        routeId,
        passengerName: passengerName.trim(),
        phone: phone.trim(),
        seats: count,
        seatNumbers: nums,
        total,
        payment,
        payerId: payer?.id ?? null,
        createdAt: now,
      }
      await bookings.insertOne({ ...booking })
      return booking
    } catch (e) {
      for (const fn of undo.reverse()) await fn().catch(() => {})
      throw e
    }
  },

  'bookings.getByCode': async ({ code }) => {
    const booking = await (await col('bookings')).findOne({ code: String(code || '').toUpperCase() }, NO_ID)
    if (!booking) throw new ApiError('ჯავშანი ვერ მოიძებნა', 'NOT_FOUND', 404)
    const route = await (await col('routes')).findOne({ id: booking.routeId }, NO_ID)
    return { ...booking, route }
  },

  'bookings.listForOwner': async (_, ctx) => {
    const user = await requireUser(ctx, ['provider', 'company'])
    const myRoutes = await (await col('routes')).find({ ownerId: user.id }, NO_ID).toArray()
    if (!myRoutes.length) return []
    const list = await (await col('bookings')).find({ routeId: { $in: myRoutes.map((r) => r.id) } }, NO_ID).toArray()
    return list
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((b) => ({ ...b, route: myRoutes.find((r) => r.id === b.routeId) }))
  },

  // ---------- company ----------
  'company.get': async (_, ctx) => {
    const user = await requireUser(ctx, ['company'])
    const company = await (await col('companies')).findOne({ id: user.companyId }, NO_ID)
    if (!company) throw new ApiError('კომპანია ვერ მოიძებნა', 'NOT_FOUND', 404)
    return company
  },

  'company.update': async (data, ctx) => {
    const user = await requireUser(ctx, ['company'])
    const companies = await col('companies')
    const company = await companies.findOne({ id: user.companyId }, NO_ID)
    if (!company) throw new ApiError('კომპანია ვერ მოიძებნა', 'NOT_FOUND', 404)
    const budgetLimit = Number(data.budgetLimit)
    if (!(budgetLimit >= 0)) throw new ApiError('ლიმიტი არასწორია', 'BUDGET')
    if (budgetLimit < company.spent) {
      throw new ApiError(`ლიმიტი ვერ იქნება უკვე დახარჯულ თანხაზე (${company.spent} ₾) ნაკლები`, 'BUDGET')
    }
    const patch = {
      name: String(data.name || '').trim(),
      taxId: String(data.taxId || '').trim(),
      contact: String(data.contact || '').trim(),
      budgetLimit,
    }
    await companies.updateOne({ id: company.id }, { $set: patch })
    return { ...company, ...patch }
  },

  'drivers.list': async (_, ctx) => {
    const user = await requireUser(ctx, ['company'])
    const drivers = await (await col('drivers')).find({ companyId: user.companyId }, NO_ID).toArray()
    const trips = drivers.length
      ? await (await col('routes')).find({ driverId: { $in: drivers.map((d) => d.id) }, date: { $gte: todayISO() } }, NO_ID).toArray()
      : []
    return drivers.map((d) => ({ ...d, upcomingTrips: trips.filter((r) => r.driverId === d.id).length }))
  },

  'drivers.add': async ({ name, phone }, ctx) => {
    const user = await requireUser(ctx, ['company'])
    const drivers = await col('drivers')
    if (!name?.trim() || !phone?.trim()) throw new ApiError('შეავსეთ სახელი და ტელეფონი', 'FIELDS')
    if (await drivers.findOne({ companyId: user.companyId, phone: phone.trim() })) {
      throw new ApiError('ამ ნომრით მძღოლი უკვე დამატებულია', 'DUPLICATE', 409)
    }
    const driver = { id: uid('d'), companyId: user.companyId, name: name.trim(), phone: phone.trim() }
    await drivers.insertOne({ ...driver })
    return { ...driver, upcomingTrips: 0 }
  },

  'drivers.remove': async ({ driverId }, ctx) => {
    const user = await requireUser(ctx, ['company'])
    const trips = await (await col('routes')).countDocuments({ driverId, date: { $gte: todayISO() } })
    if (trips) throw new ApiError('მძღოლს აქვს დაგეგმილი რეისები — ჯერ გადაანაწილეთ ისინი', 'HAS_TRIPS')
    await (await col('drivers')).deleteOne({ id: driverId, companyId: user.companyId })
    return true
  },

  // ---------- balance ----------
  'transactions.topUp': async ({ amount }, ctx) => {
    const user = await requireUser(ctx, ['provider', 'company'])
    const value = Number(amount)
    if (!(value > 0) || value > MAX_TOPUP) throw new ApiError('არასწორი თანხა', 'AMOUNT')
    const users = await col('users')
    await users.updateOne({ id: user.id }, { $inc: { balance: value } })
    const tx = { id: uid('t'), userId: user.id, type: 'topup', amount: value, note: 'ბალანსის შევსება (იმიტაცია)', createdAt: new Date().toISOString() }
    await (await col('transactions')).insertOne({ ...tx })
    const fresh = await users.findOne({ id: user.id }, NO_ID)
    return { balance: fresh.balance, transaction: tx }
  },

  'transactions.list': async (_, ctx) => {
    const user = await requireUser(ctx)
    const list = await (await col('transactions')).find({ userId: user.id }, NO_ID).toArray()
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  // ---------- demo ----------
  'demo.reset': async () => {
    await resetDatabase()
    return true
  },
}

/** ერთიანი შესასვლელი წერტილი: { action, args } + token → { status, body } */
export async function handleRpc(body, token, readToken) {
  const { action, args } = body || {}
  const fn = actions[action]
  if (!fn) return { status: 404, body: { error: { message: 'უცნობი მოქმედება', code: 'UNKNOWN_ACTION' } } }
  try {
    const data = await fn(args ?? {}, { userId: readToken(token) })
    return { status: 200, body: { data } }
  } catch (e) {
    if (e instanceof ApiError) return { status: e.status, body: { error: { message: e.message, code: e.code } } }
    console.error(e)
    return { status: 500, body: { error: { message: 'სერვერის შეცდომა. სცადეთ მოგვიანებით.', code: 'SERVER' } } }
  }
}
