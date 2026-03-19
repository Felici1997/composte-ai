import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ─── Base URL : '/' pour Capacitor et Vercel ───
  base: '/',

  server: {
    host: "::",
    port: 8080,
    allowedHosts: ['.clackypaas.com', 'localhost', '127.0.0.1'],
    historyApiFallback: true,
  },

  build: {
    // Optimisé pour mobile : chunks plus petits
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Séparer les vendors pour un meilleur cache
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase':['@supabase/supabase-js'],
          'vendor-ui':      ['lucide-react'],
        },
      },
    },
  },

  plugins: [
    react(),
    // componentTagger retiré (non compatible production)
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
