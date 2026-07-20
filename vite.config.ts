import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(() => {
  const isTauri = Object.keys(process.env).some(key => key.startsWith('TAURI_'));

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: isTauri 
        ? path.resolve(__dirname, './dist') 
        : path.resolve(__dirname, '../backend/pb_public'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('xlsx')) {
                return 'vendor-excel';
              }
              return 'vendor';
            }
          },
        },
      },
      chunkWarningLimit: 1000,
    },
    server: {
      port: 5173,
      strictPort: true,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    }
  };
});