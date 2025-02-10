import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: './', // This ensures assets are loaded correctly in production
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 