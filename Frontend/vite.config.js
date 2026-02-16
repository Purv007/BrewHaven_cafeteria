import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: './', // Relative base path for deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production to reduce bundle size
    minify: 'terser', // More aggressive minification
    rollupOptions: {
      output: {
        manualChunks: {
          vendor_react: ['react', 'react-dom'],
          vendor_router: ['react-router-dom'],
          vendor_ui: ['react-icons']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    exclude: ['js-big-decimal']
  }
})
