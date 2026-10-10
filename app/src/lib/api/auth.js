import { rpc } from './client'

export const login = (email, password) => rpc('auth.login', { email, password })
export const register = (data) => rpc('auth.register', data)
export const me = () => rpc('auth.me')
// eslint-disable-next-line no-unused-vars
export const updateProfile = (_userId, { name }) => rpc('auth.updateProfile', { name })
