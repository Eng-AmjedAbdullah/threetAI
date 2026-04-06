import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate chunk for ML inference
            'ml-inference': ['onnxruntime-web', 'onnxruntime-node'],
            // Separate chunk for charts
            'charts': ['recharts'],
            // Separate chunk for data processing
            'data-processing': ['papaparse', 'jspdf', 'jspdf-autotable'],
            // Separate chunk for UI libraries
            'ui-libs': ['framer-motion', 'motion', 'canvas-confetti', 'lucide-react'],
            // Separate chunk for Firebase
            'firebase': ['firebase'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
