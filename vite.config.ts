import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Memaksa CSS masuk ke satu file utama untuk mencegah masalah path di beberapa proxy VPS
    cssCodeSplit: false, 
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Sederhanakan output untuk VPS
      },
    },
  },
  server: {
    port: 3000,
  },
});