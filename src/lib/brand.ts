/**
 * Les informations de la boutique, telles qu'elles figurent sur son site
 * actuel (relevées le 18 septembre 2026). Une seule source : pages légales,
 * pied de page et formulaire de contact s'y réfèrent.
 */
export const brand = {
  nom: 'Cokette Girls by Rabaa',
  nomCourt: 'Cokette Girls',
  statut: 'Micro-entreprise',
  siret: '917 947 772 000 21',

  adresse: {
    rue: '15 Place de la Liberté',
    cp: '80340',
    ville: 'Bray-sur-Somme',
    pays: 'France',
    complet: '15 Place de la Liberté, 80340 Bray-sur-Somme, France',
  },

  email: 'cokette80340@gmail.com',
  telephone: '06 34 30 10 46',
  telephoneLien: '+33634301046',

  reseaux: {
    facebook: 'https://www.facebook.com/p/Cokette-Girls-by-rabaa-100084782481671/',
    instagram: 'https://www.instagram.com/cokettegirlsby/',
    tiktok: 'https://www.tiktok.com/@cokette.girls_',
  },

  /** Ce que la boutique vend, dans ses propres termes. */
  activite: 'Prêt-à-porter féminin et accessoires de mode',

  /** Dates de dernière mise à jour des textes légaux, reprises du site. */
  maj: {
    cgv: '06/05/2025',
    cgu: '06/05/2025',
    mentions: '07/06/2025',
    confidentialite: '07/05/2025',
    cookies: '07/05/2025',
    retours: '07/05/2025',
  },
} as const;

/** L'hébergeur actuel. À remplacer à la mise en ligne du nouveau site. */
export const hebergeur = {
  nom: 'Hostinger International Ltd.',
  adresse: '61 Lordou Vironos Street, 6023 Larnaca, Chypre',
  telephone: '+1 212 739 0610',
} as const;
