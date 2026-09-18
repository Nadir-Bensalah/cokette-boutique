import { atom } from 'nanostores';

/**
 * Le consentement aux cookies, tel que la CNIL l'exige :
 *
 * - rien n'est déposé avant un choix explicite, hors cookies nécessaires ;
 * - refuser est aussi simple qu'accepter (un seul clic, au même niveau) ;
 * - le choix se retire aussi facilement qu'il se donne ;
 * - il est conservé 6 mois, puis redemandé.
 *
 * Le choix vit dans localStorage : il n'est jamais envoyé nulle part, et
 * aucun cookie tiers n'est posé tant qu'il n'a pas été donné.
 */

export type Choix = {
  mesure: boolean;
  reseaux: boolean;
  /** Quand le choix a été fait, en millisecondes. */
  date: number;
};

const CLE = 'cokette.cookies.v1';
/** Six mois : au-delà, on redemande. */
const VALIDITE = 182 * 24 * 60 * 60 * 1000;

const lire = (): Choix | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return null;
    const c = JSON.parse(brut) as Choix;
    if (typeof c?.date !== 'number' || Date.now() - c.date > VALIDITE) return null;
    return { mesure: !!c.mesure, reseaux: !!c.reseaux, date: c.date };
  } catch {
    return null;
  }
};

/** null = pas encore choisi, donc le bandeau doit s'afficher. */
export const consent = atom<Choix | null>(lire());

const ecrire = (c: Choix | null) => {
  consent.set(c);
  try {
    if (c) localStorage.setItem(CLE, JSON.stringify(c));
    else localStorage.removeItem(CLE);
  } catch {
    /* navigation privée : le choix ne survit pas à l'onglet, c'est acceptable */
  }
};

export const accepterTout = () => ecrire({ mesure: true, reseaux: true, date: Date.now() });
export const refuserTout = () => ecrire({ mesure: false, reseaux: false, date: Date.now() });
export const enregistrer = (mesure: boolean, reseaux: boolean) =>
  ecrire({ mesure, reseaux, date: Date.now() });

/** Repose la question : utilisé par le lien « Gestion des cookies ». */
export const rouvrirChoix = () => ecrire(null);
