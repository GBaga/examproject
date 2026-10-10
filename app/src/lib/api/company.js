import { rpc } from './client'

// eslint-disable-next-line no-unused-vars
export const getCompany = (_companyId) => rpc('company.get')
// eslint-disable-next-line no-unused-vars
export const updateCompany = (_companyId, data) => rpc('company.update', data)
// eslint-disable-next-line no-unused-vars
export const listDrivers = (_companyId) => rpc('drivers.list')
// eslint-disable-next-line no-unused-vars
export const addDriver = (_companyId, { name, phone }) => rpc('drivers.add', { name, phone })
// eslint-disable-next-line no-unused-vars
export const removeDriver = (_companyId, driverId) => rpc('drivers.remove', { driverId })
