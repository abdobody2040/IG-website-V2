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
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            // Keep servicesExtendedData out of main bundle (112 KB static data)
            if (id.includes('servicesExtendedData')) return 'data-services';
            return;
          }
          // Recharts — only used in admin pages, never on public pages
          if (id.includes('recharts') || (id.includes('d3-') && !id.includes('d3-color'))) return 'vendor-recharts';
          // Framer Motion — needed on homepage
          if (id.includes('framer-motion')) return 'vendor-framer';
          // TanStack router + query
          if (id.includes('@tanstack')) return 'vendor-tanstack';
          // Lenis smooth scroll
          if (id.includes('lenis')) return 'vendor-lenis';
          // DOMPurify — only needed on blog/content pages
          if (id.includes('dompurify') || id.includes('purify.es')) return 'vendor-purify';
          // Zod + validation
          if (id.includes('zod')) return 'vendor-zod';
        },
      },
    },
  },
});