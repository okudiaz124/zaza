import { defineConfig } from 'vite';

export default defineConfig({
  build: { rolldownOptions: { input: { app: 'index.html', gps: 'gps.html' } } }
});
