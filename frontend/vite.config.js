// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Tambahkan konfigurasi proxy ini
    proxy: {
      '/books': { // Setiap request yang dimulai dengan '/books'
        target: 'http://localhost:5555', // Akan diarahkan ke backend Anda
        changeOrigin: true, // Penting untuk hosting virtual
        // rewrite tidak diperlukan jika path di backend sama (e.g., /books -> /books)
      },
      '/api/users': { // Untuk rute otentikasi
        target: 'http://localhost:5555',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/users/, '/api/users'), // Tetap mempertahankan path
      }
    }
  }
});