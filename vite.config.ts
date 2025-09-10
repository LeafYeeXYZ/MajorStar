import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import deno from '@deno/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

import 'react'
import 'react-dom'

const IS_SINGLE_FILE = true

export default IS_SINGLE_FILE ? defineConfig({
  root: './client',
  build: {
    target: ['chrome110', 'firefox115', 'safari16', 'edge110'],
  },
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    deno(),
    tailwindcss(),
    viteSingleFile(),
  ],
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
}) : defineConfig({
  root: './client',
  build: {
    target: ['chrome110', 'firefox115', 'safari16', 'edge110'],
    rollupOptions: {
      output: {
        manualChunks: {
          plots: ['@ant-design/plots'],
        },
      },
    },
  },
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
