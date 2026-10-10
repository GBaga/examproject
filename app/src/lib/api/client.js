// HTTP კლიენტი backend-ისთვის (Vercel Function /api/rpc → MongoDB Atlas).
// ყველა API მოდული ამ ერთ ფუნქციას იყენებს.

export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

let token = null
export const setToken = (value) => {
  token = value || null
}

export async function rpc(action, args = {}) {
  let res
  try {
    res = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ action, args }),
    })
  } catch {
    throw new ApiError('სერვერთან კავშირი ვერ დამყარდა. შეამოწმეთ ინტერნეტი.', 'NETWORK')
  }
  const payload = await res.json().catch(() => null)
  if (!res.ok || !payload || payload.error) {
    throw new ApiError(payload?.error?.message || 'სერვერის შეცდომა', payload?.error?.code || 'SERVER')
  }
  return payload.data
}

export const resetDb = () => rpc('demo.reset')
