import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to avoid TypeScript error about missing 'cwd' property on 'Process' type
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true, // Forces the app to fail if port 3000 is occupied, rather than switching ports silently
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // If you have other process.env variables, add them here
    },
  };
});