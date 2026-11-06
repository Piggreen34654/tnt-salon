import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true ouvre le serveur sur le réseau local (téléphone ou box Android, même Wi-Fi).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
