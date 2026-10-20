import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (command === 'build' && !env.VITE_API_URL?.trim()) {
    throw new Error('VITE_API_URL must be set before building the frontend.')
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
  }
})