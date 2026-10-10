import { rpc } from './client'

/** filters: { from, to, date, minPrice, maxPrice, sort: 'date' | 'price-asc' | 'price-desc' } */
export const searchRoutes = (filters = {}) => rpc('routes.search', filters)
export const getRoute = (id) => rpc('routes.get', { id })
// მომხმარებელს სერვერი ტოკენიდან ადგენს, ამიტომ user/userId პარამეტრები მხოლოდ თავსებადობისთვისაა
// eslint-disable-next-line no-unused-vars
export const listMyRoutes = (_userId) => rpc('routes.listMine')
// eslint-disable-next-line no-unused-vars
export const createRoute = (_user, data) => rpc('routes.create', data)
// eslint-disable-next-line no-unused-vars
export const updateRoute = (_user, id, data) => rpc('routes.update', { id, data })
// eslint-disable-next-line no-unused-vars
export const deleteRoute = (_user, id) => rpc('routes.delete', { id })
