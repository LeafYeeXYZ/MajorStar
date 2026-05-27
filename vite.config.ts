import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
  ],
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
