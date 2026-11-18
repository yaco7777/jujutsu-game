import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020'
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globals: false
  }
});
