import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import deno from '@deno/vite-plugin'
import tailwindcss from '@tailwindcss/vite'

import 'react'
import 'react-dom'

export default defineConfig({
  root: './client',
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    deno(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
})
