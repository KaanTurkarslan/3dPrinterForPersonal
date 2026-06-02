import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  cacheDir: 'node_modules/.vite',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        product: path.resolve(__dirname, 'product.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: ['three', 'gsap'],
  },
})
