import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// dev-რეჟიმში /api/rpc სერვერდება იგივე handler-ით, რაც Vercel-ზე (app/api/rpc.js)
function apiDevServer() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/rpc', async (req, res) => {
        const chunks = []
        for await (const c of req) chunks.push(c)
        const { handleRpc } = await server.ssrLoadModule('/server/handlers.js')
        const { readToken } = await server.ssrLoadModule('/server/security.js')
        const auth = req.headers.authorization || ''
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
        let body = {}
        try {
          body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
        } catch {
          // ცარიელი ან არასწორი JSON
        }
        const { status, body: out } = await handleRpc(body, token, readToken)
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(out))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), tailwindcss(), apiDevServer()],
  }
})
