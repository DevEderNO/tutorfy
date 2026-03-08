import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // @ts-expect-error - process.cwd is missing from Vite's env types in this workspace
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_API_URL || 'http://localhost:3333';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(targetUrl)
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': {
          target: targetUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
