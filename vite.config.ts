import { defineConfig } from 'npm:vite';
import react from 'npm:@vitejs/plugin-react';
import { TanStackRouterVite } from 'npm:@tanstack/router-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      routesDirectory: './app/routes',
      generatedRouteTree: './app/routeTree.gen.tsx', // Adjusted path
    }),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  // Add Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts', // For @testing-library/jest-dom
    // You might want to exclude e2e tests or other specific files
    // exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
})
