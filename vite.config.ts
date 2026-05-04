import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    semi: false,
    sortImports: true,
    sortTailwindcss: true,
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  build: {
    chunkSizeWarningLimit: 1024,
  },
})
