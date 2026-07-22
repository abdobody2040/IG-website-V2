import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // Proxy all PocketBase API calls through Vite dev server to avoid
      // cross-port CORS/shield blocking in browsers like Brave.
      '/pb-api': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pb-api/, ''),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('@react-three') || id.includes('three')) return 'three';
            if (id.includes('pocketbase')) return 'pocketbase';
            if (id.includes('lucide-react')) return 'icons';
          }
        },
      },
    },
  },
});