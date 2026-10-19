import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Режим "artifact" — сборка для превью по ссылке: относительные пути к файлам
// и маршруты через # (см. main.jsx), потому что страница открывается не с корня домена.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === 'artifact' ? './' : '/',
  build: { outDir: mode === 'artifact' ? 'dist-artifact' : 'dist' },
}))
