import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

/*
 * Caminho base do site. Em desenvolvimento e '/'. O deploy no GitHub Pages
 * (.github/workflows/deploy-pages.yml) serve o projeto em
 * https://<usuario>.github.io/<nome-do-repo>/ e passa VITE_BASE com essa
 * subpasta, por exemplo '/squad-modulos/'. Um base errado nao quebra o
 * `npm run dev`: so aparece depois do deploy, como 404 nos JS, CSS e imagens.
 * Caminho de asset no codigo vem de import ou de import.meta.env.BASE_URL,
 * nunca de "/" fixo.
 */
const BASE = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
})
