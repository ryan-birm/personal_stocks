import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Enable sourcemaps for debugging
  },
  // Exclude backend directory from being processed
  publicDir: 'public',
  resolve: {
    alias: {
      // Prevent imports from backend
    }
  }
})
