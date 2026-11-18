import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { AstroPWAIntegration } from '@vite-pwa/astro'; // <-- Новый импорт

export default defineConfig({
  site: 'https://practice-phi-ecru.vercel.app',
  output: 'server',
  adapter: vercel(),
  integrations: [
    sitemap(),
    AstroPWAIntegration({ // <-- Новое имя функции
      registerType: 'autoUpdate',
      manifest: {
        name: 'Agency — Digital Studio',
        short_name: 'Agency',
        description: 'Разработка сайтов, дизайн и маркетинг',
        theme_color: '#1760F5',
        background_color: '#F4F7FF',
        display: 'standalone',
        icons: [
          { src: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/images/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});