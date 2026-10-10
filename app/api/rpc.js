import { handleRpc } from '../server/handlers.js'
import { readToken } from '../server/security.js'

// Vercel Serverless Function: POST /api/rpc  { action, args }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: { message: 'Method not allowed', code: 'METHOD' } })
  }
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body
  const { status, body: out } = await handleRpc(body, token, readToken)
  res.status(status).json(out)
}
