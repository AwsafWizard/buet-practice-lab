import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' + HashRouter => the build works on any static host
// (GitHub Pages, Netlify, Render, Vercel) and straight from file://
// 'artifact' = private claude.ai Artifact for phone/tablet: one inlined HTML + scans/ beside it
const singleFile = (mode: string) => mode === 'single' || mode === 'artifact'
const outDir = (mode: string) => (mode === 'single' ? 'dist-single' : mode === 'artifact' ? 'dist-artifact' : 'dist')

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(singleFile(mode) ? [viteSingleFile()] : [])],
  define: {
    // public / single-file builds hide the scanned exam-paper images (redrawn figures stay)
    __PUBLIC_BUILD__: JSON.stringify(mode === 'public' || mode === 'single'),
    // the Artifact viewer's frame drops #/routes and blocks window.print()
    __ARTIFACT__: JSON.stringify(mode === 'artifact'),
  },
  build: { outDir: outDir(mode), chunkSizeWarningLimit: 4000 },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
}))
