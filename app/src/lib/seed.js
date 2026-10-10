import { todayISO } from './format.js'

// დემო მონაცემები. თარიღები ითვლება „დღეიდან“, რომ მარშრუტები ყოველთვის მომავალში იყოს.
export function createSeed() {
  const now = new Date().toISOString()

  const users = [
    {
      id: 'u-provider-1',
      name: 'გიორგი ბერიძე',
      email: 'giorgi@demo.ge',
      password: 'demo123',
      role: 'provider',
      balance: 120,
      createdAt: now,
    },
    {
      id: 'u-provider-2',
      name: 'ნინო კაპანაძე',
      email: 'nino@demo.ge',
      password: 'demo123',
      role: 'provider',
      balance: 45,
      createdAt: now,
    },
    {
      id: 'u-company-1',
      name: 'ლაშა მენეჯერი',
      email: 'company@demo.ge',
      password: 'demo123',
      role: 'company',
      balance: 2000,
      companyId: 'c-1',
      createdAt: now,
    },
  ]

  const companies = [
    {
      id: 'c-1',
      name: 'კავკასუს ტრანსი',
      taxId: '405123456',
      contact: '+995 555 12 34 56',
      budgetLimit: 1500,
      spent: 0,
    },
  ]

  const drivers = [
    { id: 'd-1', companyId: 'c-1', name: 'ლევან ჯაფარიძე', phone: '599112233' },
    { id: 'd-2', companyId: 'c-1', name: 'დავით გელაშვილი', phone: '577445566' },
  ]

  const r = (id, ownerId, from, to, day, time, capacity, seatsLeft, price, driverId) => ({
    id,
    ownerId,
    driverId: driverId ?? null,
    from,
    to,
    date: todayISO(day),
    time,
    capacity,
    seatsLeft,
    price,
    createdAt: now,
  })

  const routes = [
    r('r-1', 'u-provider-1', 'tbilisi', 'batumi', 1, '08:00', 7, 4, 35),
    r('r-2', 'u-provider-1', 'batumi', 'tbilisi', 2, '16:30', 7, 7, 35),
    r('r-3', 'u-provider-1', 'tbilisi', 'kutaisi', 1, '10:00', 4, 1, 20),
    r('r-4', 'u-provider-2', 'tbilisi', 'telavi', 1, '09:30', 6, 6, 15),
    r('r-5', 'u-provider-2', 'tbilisi', 'sighnaghi', 3, '11:00', 6, 0, 18),
    r('r-6', 'u-provider-2', 'tbilisi', 'stepantsminda', 2, '07:30', 7, 5, 25),
    r('r-7', 'u-provider-1', 'kutaisi', 'mestia', 4, '06:00', 7, 7, 40),
    r('r-8', 'u-provider-2', 'tbilisi', 'borjomi', 5, '12:00', 4, 3, 22),
    r('r-9', 'u-company-1', 'tbilisi', 'batumi', 3, '07:00', 18, 12, 30, 'd-1'),
    r('r-10', 'u-company-1', 'tbilisi', 'zugdidi', 4, '08:30', 18, 18, 28, 'd-2'),
    r('r-11', 'u-company-1', 'rustavi', 'tbilisi', 1, '08:00', 18, 9, 5, 'd-1'),
    r('r-12', 'u-provider-1', 'tbilisi', 'gori', 2, '14:00', 4, 4, 10),
    r('r-13', 'u-provider-2', 'batumi', 'poti', 6, '13:00', 6, 6, 8),
    r('r-14', 'u-company-1', 'tbilisi', 'akhaltsikhe', 7, '09:00', 18, 18, 25, 'd-2'),
  ]

  const transactions = [
    { id: 't-1', userId: 'u-provider-1', type: 'topup', amount: 50, note: 'ბალანსის შევსება', createdAt: now },
    { id: 't-2', userId: 'u-provider-1', type: 'earning', amount: 70, note: 'თბილისი → ბათუმი · 2 ადგილი', createdAt: now },
    { id: 't-3', userId: 'u-company-1', type: 'topup', amount: 2000, note: 'ბალანსის შევსება', createdAt: now },
  ]

  return { users, companies, drivers, routes, bookings: [], transactions }
}
