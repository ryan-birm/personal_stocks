export const config = {
  buildCommand: 'npm run build',
  framework: 'vite',
  outputDirectory: 'dist',

  // Handle SPA routing - serve index.html for all routes
  rewrites: [
    {
      source: '/(.*)',
      destination: '/index.html'
    }
  ],

  // Security and performance headers
  headers: [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        }
      ]
    },
    {
      source: '/assets/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ]
}