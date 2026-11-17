import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite'; // <-- Vite-плагин v4

export default defineConfig({
  site: 'http://localhost:4321',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()], // <-- Здесь НЕТ tailwind()
  vite: {
    plugins: [tailwindcss()], // <-- Плагин здесь
  },
});