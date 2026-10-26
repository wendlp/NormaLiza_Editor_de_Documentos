import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * Troca __SITE_URL__ pelo endereço público do site (variável SITE_URL),
 * necessário para que a imagem de prévia do link seja encontrada pelos
 * aplicativos que geram a pré-visualização. Ex.: SITE_URL=https://meusite.com
 */
function siteUrl(): Plugin {
  const url = (process.env.SITE_URL ?? '').replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('__SITE_URL__', url) },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
  },
})
