import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';

// Le site vit sous /cokette-boutique sur GitHub Pages, à la racine sur un
// domaine dédié. BASE_PATH règle ça : tout lien passe par href(), tout
// fichier statique par asset() (src/lib/paths.ts).
const BASE = process.env.BASE_PATH ?? '/cokette-boutique';

export default defineConfig({
  site: 'https://nadir-bensalah.github.io',
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [react()],
  vite: { plugins: [tailwind()] },
});
