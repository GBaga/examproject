import { rpc } from './client'

/**
 * ექსპრეს ჯავშანი. სტუმარი იხდის ადგილზე; ავტორიზებული მომხმარებელი — ბალანსიდან.
 * Overbooking-ის დაცვა სერვერზეა (MongoDB-ის ატომური პირობითი განახლება).
 */
export const createBooking = ({ routeId, passengerName, phone, seats, payerId = null }) =>
  rpc('bookings.create', { routeId, passengerName, phone, seats, payWithBalance: Boolean(payerId) })
export const getBookingByCode = (code) => rpc('bookings.getByCode', { code })
// eslint-disable-next-line no-unused-vars
export const listBookingsForOwner = (_userId) => rpc('bookings.listForOwner')
