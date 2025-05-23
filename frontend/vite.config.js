import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  darkmode : 'class',
  // tailwind.config.js

  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure this matches your file structure
  ],
  theme: { extend: {} },
  plugins: [react()],
})
