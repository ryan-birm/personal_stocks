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
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
    allowedHosts: [
      'personal-stocks.onrender.com',
      '.onrender.com', // Allow all Render subdomains
      'localhost'
    ]
  },
  // Exclude backend directory from being processed
  publicDir: 'public',
  resolve: {
    alias: {
      // Prevent imports from backend
    }
  }
})
