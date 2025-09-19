import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Optimisations de build
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les dépendances lourdes
          'mapbox': ['mapbox-gl'],
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
      },
    },
  },
  
  // Optimisations de dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react',
      'mapbox-gl',
    ],
    exclude: ['lucide-react'], // Exclure pour éviter les conflits
  },
  
  // Configuration du serveur de développement
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  
  // Configuration des tests
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  
  // Configuration CSS
  css: {
    devSourcemap: true,
  },
  
  // Configuration des assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
});