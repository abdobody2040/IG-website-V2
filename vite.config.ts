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
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('pocketbase')) return 'vendor-pocketbase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@tanstack')) return 'vendor-tanstack';
            if (id.includes('lenis')) return 'vendor-lenis';
          }
        },
      },
    },
  },
});