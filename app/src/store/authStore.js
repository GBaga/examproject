import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../lib/api/auth'

/**
 * ავტორიზაციის გლობალური state.
 * სესიაში ინახება მხოლოდ userId; მომხმარებლის მონაცემები (ბალანსი და ა.შ.)
 * ყოველთვის იკითხება mock DB-დან `refresh()`-ით, რომ ეკრანზე აქტუალური იყოს.
 */
export const useAuth = create(
  persist(
    (set, get) => ({
      userId: null,
      user: null,

      login: async (email, password) => {
        const user = await authApi.login(email, password)
        set({ userId: user.id, user })
        return user
      },

      register: async (data) => {
        const user = await authApi.register(data)
        set({ userId: user.id, user })
        return user
      },

      logout: () => set({ userId: null, user: null }),

      refresh: () => {
        const { userId } = get()
        if (!userId) return
        const user = authApi.getUserSync(userId)
        set(user ? { user } : { userId: null, user: null })
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'lp_session',
      partialize: (state) => ({ userId: state.userId }),
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
