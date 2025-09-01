import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/main.jsx'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'content' ? 'content.js' : '[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
