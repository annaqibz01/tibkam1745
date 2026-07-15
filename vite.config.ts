// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Mengarahkan hasil build langsung ke folder pb_public di backend
    outDir: path.resolve(__dirname, '../backend/pb_public'),
    
    // 2. Membersihkan isi pb_public yang lama setiap kali npm run build
    emptyOutDir: true,

    // 3. Pintasan Code Splitting Resmi Rollup Engine
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('xlsx')) {
              return 'vendor-excel'; // File excel dipisahkan sendiri
            }
            return 'vendor'; // Library pihak ketiga lainnya
          }
        },
      },
    },

    // 4. Menaikkan batas toleransi peringatan ukuran file dari 500kB ke 1000kB (1MB)
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: true,
  }
});