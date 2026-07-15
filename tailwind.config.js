/** @type {import('tailwindcss').Config} */
export default {
  // Memberi tahu Tailwind untuk memindai file index.html dan semua file .ts/.tsx di folder src
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Kamu bisa menambahkan warna custom atau font kustom di sini nanti
      colors: {
        utama: '#1E40AF', 
      }
    },
  },
  plugins: [],
}