import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Une seule page HTML, tout compris (code, polices) : elle marche sans internet.
const BUILD = new Date().toISOString().slice(0, 16).replace('T', ' ');

export default defineConfig({
  define: { __BUILD__: JSON.stringify(BUILD) },
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'version-file',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.txt', source: BUILD });
      },
    },
  ],
  base: './',
  build: { assetsInlineLimit: 100_000_000 },
});
