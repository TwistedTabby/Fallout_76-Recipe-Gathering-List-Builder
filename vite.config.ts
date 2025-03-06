import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  assetsInclude: ['**/*.PNG'],  // Add support for PNG files
  base: './', // This ensures assets are loaded correctly in production
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 