/** Petites icônes de trait, réutilisées dans les listes et les étapes. */
export type IconName =
  | 'camion' | 'boutique' | 'carte' | 'coeur' | 'etoile' | 'echange'
  | 'telephone' | 'sac' | 'live' | 'taille' | 'colis' | 'paiement';

export const ICON_PATHS: Record<IconName, string> = {
  camion: 'M3 13.5h12V7H3zM15 10.5h3.5L21 13.5v3h-6zM7 19.5m-1.8 0a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0M17.5 19.5m-1.8 0a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0',
  boutique: 'M4 9h16v11H4zM3 9l1.5-4h15L21 9M9 20v-6h6v6',
  carte: 'M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z',
  coeur: 'M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7-2.5c0 5-7 9.5-7 9.5z',
  etoile: 'M12 4l2.4 5 5.6.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.6-.8z',
  echange: 'M4 9h13l-3-3M20 15H7l3 3',
  telephone: 'M6 4h3l2 5-2 1.5a12 12 0 0 0 5 5L15 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z',
  sac: 'M4 7h16l-1.2 12.2a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8zM8.5 7a3.5 3.5 0 0 1 7 0',
  live: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M6.5 6.5a8 8 0 0 0 0 11M17.5 6.5a8 8 0 0 1 0 11',
  taille: 'M3 9h18v6H3zM7 9v3M11 9v4M15 9v3M19 9v4',
  colis: 'M12 3l8 4.2v9.6L12 21l-8-4.2V7.2zM4 7.2 12 11.5l8-4.3M12 11.5V21',
  paiement: 'M3 7h18v10H3zM3 11h18M6.5 14.5h3',
};
