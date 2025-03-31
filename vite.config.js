import { defineConfig,loadEnv } from 'vite';
import react from '@vitejs/plugin-react';


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true, // or use '0.0.0.0' to bind all network interfaces
      port: 5174, // Default port (optional)
      open: true, // Uncommented to open in browser by default
    },
    define: {
      'process.env': env,
    },
  };
});
