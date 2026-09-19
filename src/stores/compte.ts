import { atom, computed } from 'nanostores';
import type { Line } from './cart';

/**
 * Les comptes clientes.
 *
 * Cette version fonctionne entièrement dans le navigateur : la cliente crée
 * un compte, se connecte, retrouve ses commandes. C'est ce qui permet de
 * montrer le parcours complet avant que la base soit branchée.
 *
 * À la mise en ligne, seules les quatre fonctions du bas changent
 * (`creer`, `connecter`, `deconnecter`, `enregistrerCommande`) : elles
 * appelleront Supabase au lieu du stockage local. Les écrans, eux, ne
 * bougent pas : ils ne parlent qu'à ce fichier.
 *
 * Aucun mot de passe n'est stocké en clair : on garde une empreinte
 * SHA-256 salée. Ça ne remplace pas une vraie authentification serveur,
 * et ce n'est pas ce que ça prétend être.
 */

export interface Adresse {
  id: string;
  libelle: string;
  prenom: string;
  nom: string;
  rue: string;
  cp: string;
  ville: string;
  telephone: string;
  defaut: boolean;
}

export type StatutCommande = 'payee' | 'preparee' | 'expediee' | 'retiree' | 'remboursee';

export interface Commande {
  id: string;
  numero: string;
  date: string;
  statut: StatutCommande;
  lignes: Line[];
  livraison: { mode: 'retrait' | 'colissimo' | 'relais'; frais: number };
  total: number;
  suivi?: string;
}

export interface Preferences {
  /** Recevoir l'annonce des lives. */
  lettre: boolean;
  /** Être prévenue quand une pièce revient en stock. */
  retourStock: boolean;
  /** Tailles habituelles, pour filtrer la boutique d'entrée. */
  tailles: string[];
}

export interface Compte {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  /** Empreinte SHA-256 du mot de passe, salée. Jamais le mot de passe. */
  empreinte: string;
  sel: string;
  cree: string;
  adresses: Adresse[];
  commandes: Commande[];
  favoris: string[];
  preferences: Preferences;
}

const CLE_COMPTES = 'cokette.comptes.v1';
const CLE_SESSION = 'cokette.session.v1';

const lireComptes = (): Compte[] => {
  if (typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CLE_COMPTES) ?? '[]'); } catch { return []; }
};

const ecrireComptes = (c: Compte[]) => {
  try { localStorage.setItem(CLE_COMPTES, JSON.stringify(c)); } catch { /* navigation privée */ }
};

const lireSession = (): Compte | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const id = localStorage.getItem(CLE_SESSION);
    if (!id) return null;
    return lireComptes().find((c) => c.id === id) ?? null;
  } catch { return null; }
};

export const compte = atom<Compte | null>(lireSession());
export const connectee = computed(compte, (c) => c !== null);

const sauver = (c: Compte | null) => {
  compte.set(c);
  try {
    if (c) {
      localStorage.setItem(CLE_SESSION, c.id);
      const tous = lireComptes();
      const i = tous.findIndex((x) => x.id === c.id);
      if (i >= 0) tous[i] = c; else tous.push(c);
      ecrireComptes(tous);
    } else {
      localStorage.removeItem(CLE_SESSION);
    }
  } catch { /* navigation privée */ }
};

/** Empreinte du mot de passe. Le sel évite qu'un même mot de passe
 *  donne deux fois la même empreinte d'un compte à l'autre. */
async function empreinteDe(motDePasse: string, sel: string): Promise<string> {
  const data = new TextEncoder().encode(`${sel}:${motDePasse}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const idCourt = () => Math.random().toString(36).slice(2, 10);

const normalise = (email: string) => email.trim().toLowerCase();

export type Resultat = { ok: true } | { ok: false; erreur: string };

export async function creer(
  prenom: string, nom: string, email: string, motDePasse: string,
): Promise<Resultat> {
  const mail = normalise(email);
  if (motDePasse.length < 8) return { ok: false, erreur: 'Le mot de passe doit faire au moins 8 caractères.' };
  if (lireComptes().some((c) => normalise(c.email) === mail)) {
    return { ok: false, erreur: 'Un compte existe déjà avec cette adresse. Connectez-vous.' };
  }
  const sel = idCourt();
  sauver({
    id: idCourt(), prenom: prenom.trim(), nom: nom.trim(), email: mail,
    empreinte: await empreinteDe(motDePasse, sel), sel,
    cree: new Date().toISOString(),
    adresses: [], commandes: [], favoris: [],
    preferences: { lettre: false, retourStock: true, tailles: [] },
  });
  return { ok: true };
}

export async function connecter(email: string, motDePasse: string): Promise<Resultat> {
  const mail = normalise(email);
  const c = lireComptes().find((x) => normalise(x.email) === mail);
  // Même message dans les deux cas : on ne dit pas si l'adresse existe.
  const refus: Resultat = { ok: false, erreur: 'Adresse e-mail ou mot de passe incorrect.' };
  if (!c) return refus;
  if ((await empreinteDe(motDePasse, c.sel)) !== c.empreinte) return refus;
  sauver(c);
  return { ok: true };
}

export const deconnecter = () => sauver(null);

export function majCompte(champs: Partial<Omit<Compte, 'id' | 'empreinte' | 'sel'>>) {
  const c = compte.get();
  if (c) sauver({ ...c, ...champs });
}

export async function changerMotDePasse(actuel: string, nouveau: string): Promise<Resultat> {
  const c = compte.get();
  if (!c) return { ok: false, erreur: 'Vous n’êtes pas connectée.' };
  if ((await empreinteDe(actuel, c.sel)) !== c.empreinte) {
    return { ok: false, erreur: 'Le mot de passe actuel est incorrect.' };
  }
  if (nouveau.length < 8) return { ok: false, erreur: 'Le nouveau mot de passe doit faire au moins 8 caractères.' };
  const sel = idCourt();
  sauver({ ...c, sel, empreinte: await empreinteDe(nouveau, sel) });
  return { ok: true };
}

/* --- Adresses --- */

export function ajouterAdresse(a: Omit<Adresse, 'id'>) {
  const c = compte.get();
  if (!c) return;
  const neuve = { ...a, id: idCourt() };
  // La première adresse enregistrée devient celle par défaut.
  const adresses = c.adresses.length === 0
    ? [{ ...neuve, defaut: true }]
    : neuve.defaut
      ? [...c.adresses.map((x) => ({ ...x, defaut: false })), neuve]
      : [...c.adresses, neuve];
  sauver({ ...c, adresses });
}

export function supprimerAdresse(id: string) {
  const c = compte.get();
  if (!c) return;
  const restantes = c.adresses.filter((a) => a.id !== id);
  // Si on retire celle par défaut, la première reprend le rôle.
  if (restantes.length && !restantes.some((a) => a.defaut)) restantes[0]!.defaut = true;
  sauver({ ...c, adresses: restantes });
}

export function adresseParDefaut(id: string) {
  const c = compte.get();
  if (!c) return;
  sauver({ ...c, adresses: c.adresses.map((a) => ({ ...a, defaut: a.id === id })) });
}

/* --- Favoris --- */

export function basculerFavori(produitId: string) {
  const c = compte.get();
  if (!c) return;
  sauver({
    ...c,
    favoris: c.favoris.includes(produitId)
      ? c.favoris.filter((f) => f !== produitId)
      : [...c.favoris, produitId],
  });
}

/* --- Commandes --- */

export function enregistrerCommande(
  lignes: Line[], mode: Commande['livraison']['mode'], frais: number,
): Commande | null {
  const c = compte.get();
  if (!c) return null;
  const n = c.commandes.length + 1;
  const annee = new Date().getFullYear();
  const cmd: Commande = {
    id: idCourt(),
    numero: `CG-${annee}-${String(n).padStart(4, '0')}`,
    date: new Date().toISOString(),
    statut: 'payee',
    lignes,
    livraison: { mode, frais },
    total: lignes.reduce((s, l) => s + l.price * l.qty, 0) + frais,
  };
  sauver({ ...c, commandes: [cmd, ...c.commandes] });
  return cmd;
}

export const LIBELLE_STATUT: Record<StatutCommande, string> = {
  payee: 'Payée',
  preparee: 'En préparation',
  expediee: 'Expédiée',
  retiree: 'Retirée en boutique',
  remboursee: 'Remboursée',
};

export const LIBELLE_MODE: Record<Commande['livraison']['mode'], string> = {
  retrait: 'Retrait en boutique',
  colissimo: 'Colissimo à domicile',
  relais: 'Mondial Relay',
};
