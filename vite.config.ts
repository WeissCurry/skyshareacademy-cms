import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@public': path.resolve(__dirname, './public'),
      '@app': path.resolve(__dirname, './src/app'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@features': path.resolve(__dirname, './src/features'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@images': path.resolve(__dirname, './src/shared/assets/images'),
      '@components': path.resolve(__dirname, './src/shared/ui'),
      '@utilities': path.resolve(__dirname, './src/shared/api'),
      '@assets': path.resolve(__dirname, './src/shared/assets')
    }
  }
})
