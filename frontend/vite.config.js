import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Forces IPv4 instead of IPv6 (::1)
    port: 5173,         // You can change this if it's still causing issues
  },
})
