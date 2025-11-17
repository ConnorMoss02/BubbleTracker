import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const routerDomPath = resolve(__dirname, 'node_modules/react-router-dom')
const useShim = !existsSync(routerDomPath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: useShim
      ? {
          'react-router-dom': resolve(__dirname, 'src/lib/routerShim.tsx'),
        }
      : {},
  },
})
