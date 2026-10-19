import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' + HashRouter => the build works on any static host
// (GitHub Pages, Netlify, Render, Vercel) and straight from file://
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  define: {
    // public / single-file builds hide the scanned exam-paper images (redrawn figures stay)
    __PUBLIC_BUILD__: JSON.stringify(mode === 'public' || mode === 'single'),
  },
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist', chunkSizeWarningLimit: 4000 },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
}))
