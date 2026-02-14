import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    cssCodeSplit: false, 
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Menaikkan limit ke 1MB karena dashboard memang berat
    rollupOptions: {
      output: {
        // Memisahkan library pihak ketiga ke chunk vendor agar lebih efisien
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts'; // Pisahkan grafik
            }
            if (id.includes('react')) {
              return 'vendor'; // Pisahkan React core
            }
            return 'libs'; // Sisanya
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});