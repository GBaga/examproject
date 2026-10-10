import { z } from 'zod'
import { todayISO } from './format'
import { MAX_TOPUP } from './api/transactions'

const required = (msg = 'სავალდებულო ველი') => z.string().trim().min(1, msg)

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^5\d{8}$/, 'შეიყვანეთ მობილურის ნომერი ფორმატით 5XXXXXXXX'))

const email = z.string().trim().min(1, 'სავალდებულო ველი').email('ელფოსტის ფორმატი არასწორია')

// ---------- Auth ----------
export const loginSchema = z.object({
  email,
  password: required('შეიყვანეთ პაროლი'),
})

export const registerSchema = z
  .object({
    name: required().max(60, 'მაქსიმუმ 60 სიმბოლო'),
    email,
    password: z.string().min(6, 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს'),
    confirm: z.string(),
    role: z.enum(['provider', 'company'], { error: 'აირჩიეთ როლი' }),
    companyName: z.string().trim().optional(),
    taxId: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirm) {
      ctx.addIssue({ code: 'custom', path: ['confirm'], message: 'პაროლები არ ემთხვევა' })
    }
    if (v.role === 'company') {
      if (!v.companyName) {
        ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'შეიყვანეთ კომპანიის სახელი' })
      }
      if (!/^\d{9}$/.test(v.taxId ?? '')) {
        ctx.addIssue({ code: 'custom', path: ['taxId'], message: 'საიდენტიფიკაციო კოდი — 9 ციფრი' })
      }
    }
  })

// ---------- Routes ----------
export const routeSchema = (role) =>
  z
    .object({
      from: required('აირჩიეთ საწყისი ქალაქი'),
      to: required('აირჩიეთ დანიშნულების ქალაქი'),
      date: required('აირჩიეთ თარიღი'),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'აირჩიეთ დრო'),
      capacity: z.coerce
        .number({ error: 'შეიყვანეთ რიცხვი' })
        .int('მთელი რიცხვი')
        .min(1, 'მინიმუმ 1 ადგილი')
        .max(60, 'მაქსიმუმ 60 ადგილი'),
      price: z.coerce
        .number({ error: 'შეიყვანეთ რიცხვი' })
        .positive('ფასი უნდა იყოს 0-ზე მეტი')
        .max(1000, 'მაქსიმუმ 1000 ₾'),
      driverId: z.string().optional(),
    })
    .superRefine((v, ctx) => {
      if (v.from && v.to && v.from === v.to) {
        ctx.addIssue({ code: 'custom', path: ['to'], message: '„საიდან“ და „სად“ ერთნაირი ვერ იქნება' })
      }
      const today = todayISO()
      if (v.date && v.date < today) {
        ctx.addIssue({ code: 'custom', path: ['date'], message: 'თარიღი წარსულშია' })
      }
      if (v.date === today && v.time) {
        const now = new Date()
        const [h, m] = v.time.split(':').map(Number)
        if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) {
          ctx.addIssue({ code: 'custom', path: ['time'], message: 'დრო უკვე გავიდა' })
        }
      }
      if (role === 'company' && !v.driverId) {
        ctx.addIssue({ code: 'custom', path: ['driverId'], message: 'აირჩიეთ მძღოლი' })
      }
    })

// ---------- Booking ----------
export const bookingSchema = (maxSeats) =>
  z.object({
    passengerName: required('შეიყვანეთ სახელი და გვარი').max(60, 'მაქსიმუმ 60 სიმბოლო'),
    phone,
    seats: z.coerce
      .number()
      .int()
      .min(1, 'აირჩიეთ მინიმუმ 1 ადგილი სქემაზე')
      .max(Math.max(maxSeats, 1), `მაქსიმუმ ${maxSeats} ადგილი`),
  })

// ---------- Balance ----------
export const topUpSchema = z.object({
  amount: z.coerce
    .number({ error: 'შეიყვანეთ თანხა' })
    .positive('თანხა უნდა იყოს 0-ზე მეტი')
    .max(MAX_TOPUP, `ერთჯერადად მაქსიმუმ ${MAX_TOPUP} ₾`),
})

// ---------- Company ----------
export const companySchema = z.object({
  name: required('შეიყვანეთ კომპანიის სახელი'),
  taxId: z.string().trim().regex(/^\d{9}$/, 'საიდენტიფიკაციო კოდი — 9 ციფრი'),
  contact: z.string().trim().max(80),
  budgetLimit: z.coerce.number({ error: 'შეიყვანეთ თანხა' }).min(0, 'უარყოფითი ვერ იქნება').max(1000000),
})

export const driverSchema = z.object({
  name: required('შეიყვანეთ სახელი').max(60),
  phone,
})

export const profileSchema = z.object({
  name: required().max(60, 'მაქსიმუმ 60 სიმბოლო'),
})
