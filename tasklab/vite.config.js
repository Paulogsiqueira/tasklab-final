import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// repassa /api p/ o proxy local (evita CORS), tbm no preview
const proxy = { '/api': 'http://127.0.0.1:3001' }

export default defineConfig({
  plugins: [vue()],
  server: { proxy },
  preview: { proxy }
})
