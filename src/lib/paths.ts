/**
 * Le site vit sous /cokette-boutique sur GitHub Pages et à la racine sur un
 * domaine dédié. TOUT lien passe par href(), TOUT fichier statique par asset().
 * Oublier l'un des deux casse le site sur Pages sans le casser en local.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const href = (path = '/') => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
export const asset = (path: string) => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;

export const routes = {
  home: '/',
  shop: '/boutique',
  product: (slug: string) => `/produits/${slug}`,
  category: (slug: string) => `/categorie/${slug}`,
  cart: '/panier',
  checkout: '/commande',
  account: '/compte',
  live: '/live',
  about: '/la-boutique',
  contact: '/contact',
  terms: '/conditions-de-vente',
  legal: '/mentions-legales',
  privacy: '/confidentialite',
} as const;
