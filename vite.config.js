import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['sql.js', 'onnxruntime-web']
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/database'],
          charts: ['recharts', 'd3', 'topojson-client'],
          pdf: ['jspdf', 'jspdf-autotable', 'html2canvas'],
          motion: ['framer-motion', 'motion'],
          onnx: ['onnxruntime-web']
        }
      }
    }
  }
})
