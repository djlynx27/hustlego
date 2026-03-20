import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const stmProxyHeaders = env.VITE_STM_KEY
    ? { apikey: env.VITE_STM_KEY }
    : undefined;

  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api/holidays': {
          target: 'https://canada-holidays.ca',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost');
            const yearParam = url.searchParams.get('year');
            const params = new URLSearchParams({ province: 'QC' });
            if (yearParam) params.set('year', yearParam);
            return `/api/v1/holidays?${params.toString()}`;
          },
        },
        '/api/habs-schedule': {
          target: 'https://api-web.nhle.com',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost');
            const dateParam = url.searchParams.get('date');
            const parsed = dateParam ? new Date(dateParam) : new Date();
            const baseDate = Number.isNaN(parsed.getTime())
              ? new Date()
              : parsed;
            const seasonStartYear =
              baseDate.getMonth() >= 8
                ? baseDate.getFullYear()
                : baseDate.getFullYear() - 1;
            return `/v1/club-schedule-season/mtl/${seasonStartYear}${seasonStartYear + 1}`;
          },
        },
        '/api/stm-alerts': {
          target: 'https://api.stm.info',
          changeOrigin: true,
          headers: stmProxyHeaders,
          rewrite: () => '/pub/od/gtfs-rt/ic/v2/serviceAlerts',
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        includeAssets: ['favicon.ico', 'pwa-icon-192.png', 'pwa-icon-512.png'],
        manifest: {
          name: 'HustleGo',
          short_name: 'HustleGo',
          description: 'Optimise tes trajets, booste tes revenus.',
          theme_color: '#0a0a1a',
          background_color: '#0a0a1a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: '/pwa-icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/pwa-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
  };
});
