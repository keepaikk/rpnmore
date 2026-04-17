import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // Enable code splitting for better caching and performance
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks: (id) => {
            // Split React core
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') || 
                id.includes('node_modules/react-router-dom/')) {
              return 'vendor-react';
            }
            // Split motion
            if (id.includes('node_modules/motion/')) {
              return 'vendor-motion';
            }
            // Split Firebase modules separately
            if (id.includes('node_modules/firebase/')) {
              return 'vendor-firebase';
            }
            // Split UI libraries
            if (id.includes('node_modules/lucide-react/') || 
                id.includes('node_modules/clsx/') || 
                id.includes('node_modules/tailwind-merge/')) {
              return 'vendor-ui';
            }
          },
        },
      },
      // Enable minification and tree-shaking
      minify: 'esbuild',
      sourcemap: false,
      // Target modern browsers for smaller bundles
      target: 'es2022',
    },
    // Optimize Firebase deps
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
  };
});