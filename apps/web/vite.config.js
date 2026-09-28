import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

/*
 * ATENCAO - caminho base do deploy.
 *
 * Hoje e '/' porque o site ainda nao foi publicado. O GitHub Pages serve um
 * projeto em https://<usuario>.github.io/<nome-do-repo>/, entao no dia em que
 * este repositorio for para o Pages este valor precisa virar
 * '/<nome-do-repo>/' - por exemplo '/squad-modulos/'.
 *
 * Um valor errado NAO quebra o `npm run dev`: em desenvolvimento o Vite serve
 * na raiz e tudo funciona. A quebra so aparece depois do deploy, como 404 em
 * todos os JS, CSS e imagens. Por isso vale conferir este valor no mesmo PR
 * que criar o workflow de deploy.
 *
 * (O projeto original tinha '/squad-gestao-pessoas/' fixo aqui.)
 */
const BASE = '/'

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
})
