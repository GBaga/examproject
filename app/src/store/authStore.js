import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../lib/api/auth'
import { setToken } from '../lib/api/client'

/**
 * ავტორიზაციის გლობალური state.
 * სესიაში ინახება userId და სერვერის მიერ ხელმოწერილი ტოკენი; მომხმარებლის მონაცემები
 * (ბალანსი და ა.შ.) ყოველთვის იკითხება backend-იდან `refresh()`-ით, რომ ეკრანზე აქტუალური იყოს.
 */
export const useAuth = create(
  persist(
    (set, get) => ({
      userId: null,
      token: null,
      user: null,

      login: async (email, password) => {
        const { user, token } = await authApi.login(email, password)
        setToken(token)
        set({ userId: user.id, token, user })
        return user
      },

      register: async (data) => {
        const { user, token } = await authApi.register(data)
        setToken(token)
        set({ userId: user.id, token, user })
        return user
      },

      logout: () => {
        setToken(null)
        set({ userId: null, token: null, user: null })
      },

      refresh: async () => {
        const { token } = get()
        if (!token) return
        setToken(token)
        try {
          const user = await authApi.me()
          if (get().token === token) set({ user, userId: user.id })
        } catch (e) {
          // ვადაგასული ან არასწორი ტოკენი → გასვლა; ქსელის შეცდომისას სესია რჩება
          if (e.code === 'UNAUTHORIZED' && get().token === token) get().logout()
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'lp_session',
      partialize: (state) => ({ userId: state.userId, token: state.token }),
      onRehydrateStorage: () => (state) => state?.refresh(),
    },
  ),
)

export const ROLE_LABELS = {
  guest: 'სტუმარი',
  provider: 'გადამზიდი',
  company: 'კომპანია',
}

/** RBAC — უფლებების ერთიანი წყარო (იხ. docs/01-technical-spec.md, წვდომის მატრიცა) */
export const PERMISSIONS = {
  'routes:search': ['guest', 'provider', 'company'],
  'booking:create': ['guest', 'provider', 'company'],
  'routes:manage': ['provider', 'company'],
  'balance:manage': ['provider', 'company'],
  'company:manage': ['company'],
  'drivers:manage': ['company'],
  'dashboard:view': ['provider', 'company'],
}

export const can = (role, permission) => (PERMISSIONS[permission] ?? []).includes(role ?? 'guest')
