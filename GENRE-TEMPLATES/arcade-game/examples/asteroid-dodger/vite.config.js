import { defineConfig } from 'vite';

export default defineConfig({
  base: '/game-creator/asteroid-dodger/',
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
