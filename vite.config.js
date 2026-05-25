import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  cacheDir: 'node_modules/.vite',
  build: {
    outDir: 'dist',
    sourcemap: true,
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
