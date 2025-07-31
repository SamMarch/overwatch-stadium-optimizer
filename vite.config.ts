import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      '@components': path.resolve(process.cwd(), './src/components'),
      '@pages': path.resolve(process.cwd(), './src/pages'),
      '@utils': path.resolve(process.cwd(), './src/utils'),
      '@types': path.resolve(process.cwd(), './src/types'),
      '@data': path.resolve(process.cwd(), './src/data'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
