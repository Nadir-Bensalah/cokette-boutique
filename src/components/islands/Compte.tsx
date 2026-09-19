import { useStore } from '@nanostores/react';
import { useMemo, useState } from 'react';
import Photo from './Photo';
import catalogue from '@/data/catalogue.json';
import {
  compte, creer, connecter, deconnecter, majCompte, changerMotDePasse,
  ajouterAdresse, supprimerAdresse, adresseParDefaut, basculerFavori,
  LIBELLE_STATUT, LIBELLE_MODE,
  type Commande,
} from '@/stores/compte';

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const jour = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

interface P { id: string; slug: string; name: string; price: number; images: string[] }
const PRODUITS = catalogue.products as P[];

type Onglet = 'commandes' | 'adresses' | 'favoris' | 'preferences' | 'securite';

const ONGLETS: { id: Onglet; libelle: string; d: string }[] = [
  { id: 'commandes', libelle: 'Mes commandes', d: 'M4 7h16l-1.2 12.2a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8zM8.5 7a3.5 3.5 0 0 1 7 0' },
  { id: 'adresses', libelle: 'Mes adresses', d: 'M12 22s7-7.1 7-12a7 7 0 0 0-14 0c0 4.9 7 12 7 12Z' },
  { id: 'favoris', libelle: 'Mes favoris', d: 'M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7-2.5c0 5-7 9.5-7 9.5z' },
  { id: 'preferences', libelle: 'Préférences', d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7' },
  { id: 'securite', libelle: 'Connexion', d: 'M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z' },
];

/* ---------- Écran de connexion et d'inscription ---------- */

function Porte({ base }: { base: string }) {
  const [mode, setMode] = useState<'connexion' | 'creation'>('connexion');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState('');
  const [occupe, setOccupe] = useState(false);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setOccupe(true);
    const r = mode === 'connexion'
      ? await connecter(email, mdp)
      : await creer(prenom, nom, email, mdp);
    setOccupe(false);
    if (!r.ok) setErreur(r.erreur);
  };

  return (
    <div className="not-prose mx-auto max-w-md">
      <div className="mb-5 flex rounded-full bg-cream-2 p-1" role="tablist">
        {(['connexion', 'creation'] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m}
            onClick={() => { setMode(m); setErreur(''); }}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
              mode === m ? 'bg-wine text-white shadow-card' : 'text-ink-2 hover:text-wine'}`}>
            {m === 'connexion' ? 'Se connecter' : 'Créer un compte'}
          </button>
        ))}
      </div>

      <form onSubmit={envoyer} className="rounded-xl bg-paper p-6 shadow-card">
        {mode === 'creation' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-prenom">Prénom</label>
              <input id="c-prenom" className="field" autoComplete="given-name" required
                value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="c-nom">Nom</label>
              <input id="c-nom" className="field" autoComplete="family-name" required
                value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
          </div>
        )}

        <div className={mode === 'creation' ? 'mt-4' : ''}>
          <label className="label" htmlFor="c-email">Adresse e-mail</label>
          <input id="c-email" type="email" className="field" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="c-mdp">Mot de passe</label>
          <div className="relative">
            <input id="c-mdp" type={voir ? 'text' : 'password'} className="field pe-12"
              autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
              minLength={8} required value={mdp} onChange={(e) => setMdp(e.target.value)} />
            <button type="button" onClick={() => setVoir((v) => !v)}
              aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute end-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-3 hover:bg-cream hover:text-ink">
              {voir ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.4 5.4A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9 7a12 12 0 0 1-2.4 3.3M6.3 6.8A12.4 12.4 0 0 0 3 12c0 2.5 4 7 9 7a9.6 9.6 0 0 0 3.6-.7" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <path d="M3 12s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z" /><circle cx="12" cy="12" r="2.6" />
                </svg>
              )}
            </button>
          </div>
          {mode === 'creation' && <p className="help">Au moins 8 caractères.</p>}
        </div>

        {erreur && (
          <p className="mt-4 rounded-md bg-wine-soft px-4 py-3 text-sm font-semibold text-wine" role="alert">
            {erreur}
          </p>
        )}

        <button type="submit" disabled={occupe} className="btn btn-primary btn-lg mt-5 w-full">
          {occupe ? 'Un instant…' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
        </button>

        <p className="mt-4 text-center text-xs leading-snug text-ink-3">
          Vous pouvez aussi <a href={`${base.replace(/\/$/, '')}/boutique`} className="font-semibold text-wine underline underline-offset-2">commander sans compte</a>.
          Le compte sert à retrouver vos commandes et vos adresses.
        </p>
      </form>
    </div>
  );
}

/* ---------- Une commande ---------- */

function CarteCommande({ c, base }: { c: Commande; base: string }) {
  const [ouvert, setOuvert] = useState(false);
  const b = base.replace(/\/$/, '');
  const teinte: Record<string, string> = {
    payee: 'bg-gold-soft text-gold',
    preparee: 'bg-wine-soft text-wine',
    expediee: 'bg-sage-soft text-sage',
    retiree: 'bg-sage-soft text-sage',
    remboursee: 'bg-cream-2 text-ink-2',
  };

  return (
    <li className="rounded-xl bg-paper shadow-card">
      <div className="flex flex-wrap items-center gap-3 p-5">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold">{c.numero}</p>
          <p className="mt-0.5 text-sm text-ink-3">
            {jour(c.date)} · {c.lignes.length} article{c.lignes.length > 1 ? 's' : ''} · {LIBELLE_MODE[c.livraison.mode]}
          </p>
        </div>
        <span className={`chip ${teinte[c.statut]}`}>{LIBELLE_STATUT[c.statut]}</span>
        <span className="font-display text-xl font-semibold tabular">{eur(c.total)}</span>
        <button type="button" onClick={() => setOuvert((v) => !v)} aria-expanded={ouvert}
          className="btn btn-ghost btn-sm shrink-0">
          {ouvert ? 'Réduire' : 'Voir le détail'}
        </button>
      </div>

      {ouvert && (
        <div className="border-t border-line p-5">
          <ul className="space-y-3">
            {c.lignes.map((l) => (
              <li key={l.key} className="flex items-center gap-3">
                <Photo src={`/images/products/${l.image}`} base={base} sizes="48px" className="h-16 w-12 rounded-md object-cover" width={48} height={64} />
                <div className="min-w-0 flex-1">
                  <a href={`${b}/produits/${l.slug}`} className="block truncate text-sm font-semibold hover:text-wine">{l.name}</a>
                  <p className="text-xs text-ink-3">Taille {l.size} · ×{l.qty}</p>
                </div>
                <span className="text-sm font-semibold tabular">{eur(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-2">{LIBELLE_MODE[c.livraison.mode]}</dt>
              <dd className="tabular">{c.livraison.frais === 0 ? 'Offerte' : eur(c.livraison.frais)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total payé</dt><dd className="tabular">{eur(c.total)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-soft btn-sm"
              onClick={() => window.print()}>
              Imprimer la facture
            </button>
            <a href={`${b}/livraison-retours`} className="btn btn-ghost btn-sm">Retourner un article</a>
          </div>
          <p className="mt-3 text-xs text-ink-3">
            Une question sur cette commande&nbsp;? Indiquez le numéro {c.numero} dans votre message.
          </p>
        </div>
      )}
    </li>
  );
}

/* ---------- L'espace connecté ---------- */

export default function Compte({ base }: { base: string }) {
  const c = useStore(compte);
  const b = base.replace(/\/$/, '');
  const [onglet, setOnglet] = useState<Onglet>('commandes');

  if (!c) return <Porte base={base} />;

  return (
    <div className="not-prose">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-wine-soft p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-wine font-display text-xl font-semibold text-white" aria-hidden="true">
            {c.prenom.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-display text-xl font-semibold">Bonjour {c.prenom}</p>
            <p className="text-sm text-ink-2">{c.email}</p>
          </div>
        </div>
        <button type="button" onClick={deconnecter} className="btn btn-ghost btn-sm">Se déconnecter</button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Mon compte">
          <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
            {ONGLETS.map((o) => (
              <li key={o.id} className="shrink-0 lg:shrink">
                <button type="button" onClick={() => setOnglet(o.id)} aria-current={onglet === o.id ? 'page' : undefined}
                  className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    onglet === o.id ? 'bg-wine text-white' : 'bg-paper text-ink-2 shadow-card hover:text-wine'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={o.d} />
                  </svg>
                  {o.libelle}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {onglet === 'commandes' && <Commandes c={c} base={base} />}
          {onglet === 'adresses' && <Adresses c={c} />}
          {onglet === 'favoris' && <Favoris c={c} base={base} />}
          {onglet === 'preferences' && <Preferences c={c} />}
          {onglet === 'securite' && <Securite c={c} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Les onglets ---------- */

function Vide({ titre, texte, lien, libelle }: { titre: string; texte: string; lien: string; libelle: string }) {
  return (
    <div className="rounded-xl bg-paper p-10 text-center shadow-card">
      <p className="font-display text-lg font-semibold">{titre}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">{texte}</p>
      <a href={lien} className="btn btn-primary btn-sm mt-5">{libelle}</a>
    </div>
  );
}

function Commandes({ c, base }: { c: NonNullable<ReturnType<typeof compte.get>>; base: string }) {
  const b = base.replace(/\/$/, '');
  if (c.commandes.length === 0) {
    return <Vide titre="Aucune commande pour le moment"
      texte="Vos commandes s'afficheront ici, avec leur suivi et leur facture."
      lien={`${b}/boutique`} libelle="Voir la boutique" />;
  }
  return <ul className="space-y-3">{c.commandes.map((x) => <CarteCommande key={x.id} c={x} base={base} />)}</ul>;
}

function Adresses({ c }: { c: NonNullable<ReturnType<typeof compte.get>> }) {
  const [form, setForm] = useState(false);
  const [v, setV] = useState({ libelle: '', prenom: c.prenom, nom: c.nom, rue: '', cp: '', ville: '', telephone: '' });

  const ajouter = (e: React.FormEvent) => {
    e.preventDefault();
    ajouterAdresse({ ...v, defaut: c.adresses.length === 0 });
    setV({ libelle: '', prenom: c.prenom, nom: c.nom, rue: '', cp: '', ville: '', telephone: '' });
    setForm(false);
  };

  return (
    <div className="space-y-3">
      {c.adresses.length === 0 && !form && (
        <div className="rounded-xl bg-paper p-10 text-center shadow-card">
          <p className="font-display text-lg font-semibold">Aucune adresse enregistrée</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-2">
            Enregistrez-en une pour ne plus la ressaisir à chaque commande.
          </p>
          <button type="button" onClick={() => setForm(true)} className="btn btn-primary btn-sm mt-5">
            Ajouter une adresse
          </button>
        </div>
      )}

      {c.adresses.map((a) => (
        <div key={a.id} className="flex flex-wrap items-start gap-4 rounded-xl bg-paper p-5 shadow-card">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-semibold">
              {a.libelle || 'Adresse'}
              {a.defaut && <span className="chip bg-wine-soft text-wine">Par défaut</span>}
            </p>
            <p className="mt-1 text-sm leading-snug text-ink-2">
              {a.prenom} {a.nom}<br />{a.rue}<br />{a.cp} {a.ville}
              {a.telephone && <><br />{a.telephone}</>}
            </p>
          </div>
          <div className="flex gap-2">
            {!a.defaut && (
              <button type="button" onClick={() => adresseParDefaut(a.id)} className="btn btn-ghost btn-sm">
                Par défaut
              </button>
            )}
            <button type="button" onClick={() => supprimerAdresse(a.id)} className="btn btn-ghost btn-sm">
              Supprimer
            </button>
          </div>
        </div>
      ))}

      {form ? (
        <form onSubmit={ajouter} className="rounded-xl bg-paper p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold">Nouvelle adresse</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="a-lib">Nom de l'adresse</label>
              <input id="a-lib" className="field" placeholder="Maison, bureau…" value={v.libelle}
                onChange={(e) => setV({ ...v, libelle: e.target.value })} />
            </div>
            <div><label className="label" htmlFor="a-prenom">Prénom</label>
              <input id="a-prenom" className="field" required value={v.prenom} onChange={(e) => setV({ ...v, prenom: e.target.value })} /></div>
            <div><label className="label" htmlFor="a-nom">Nom</label>
              <input id="a-nom" className="field" required value={v.nom} onChange={(e) => setV({ ...v, nom: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="a-rue">Adresse</label>
              <input id="a-rue" className="field" autoComplete="street-address" required value={v.rue} onChange={(e) => setV({ ...v, rue: e.target.value })} /></div>
            <div><label className="label" htmlFor="a-cp">Code postal</label>
              <input id="a-cp" className="field" inputMode="numeric" required value={v.cp} onChange={(e) => setV({ ...v, cp: e.target.value })} /></div>
            <div><label className="label" htmlFor="a-ville">Ville</label>
              <input id="a-ville" className="field" required value={v.ville} onChange={(e) => setV({ ...v, ville: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="a-tel">Téléphone</label>
              <input id="a-tel" type="tel" className="field" inputMode="tel" value={v.telephone} onChange={(e) => setV({ ...v, telephone: e.target.value })} /></div>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="submit" className="btn btn-primary">Enregistrer</button>
            <button type="button" onClick={() => setForm(false)} className="btn btn-ghost">Annuler</button>
          </div>
        </form>
      ) : c.adresses.length > 0 && (
        <button type="button" onClick={() => setForm(true)} className="btn btn-soft">Ajouter une adresse</button>
      )}
    </div>
  );
}

function Favoris({ c, base }: { c: NonNullable<ReturnType<typeof compte.get>>; base: string }) {
  const b = base.replace(/\/$/, '');
  const pieces = useMemo(() => PRODUITS.filter((p) => c.favoris.includes(p.id)), [c.favoris]);

  if (pieces.length === 0) {
    return <Vide titre="Aucun favori"
      texte="Le cœur sur une fiche produit met la pièce de côté ici."
      lien={`${b}/boutique`} libelle="Voir la boutique" />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {pieces.map((p) => (
        <article key={p.id} className="rounded-lg bg-paper p-3 shadow-card">
          <a href={`${b}/produits/${p.slug}`} className="block overflow-hidden rounded-md bg-cream">
            <Photo src={`/images/products/${p.images[0]}`} base={base} sizes="(min-width: 640px) 20vw, 45vw" className="aspect-[3/4] w-full object-cover" width={300} height={400} />
          </a>
          <h3 className="mt-2 text-sm font-semibold leading-tight">
            <a href={`${b}/produits/${p.slug}`} className="hover:text-wine">{p.name}</a>
          </h3>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-display font-semibold tabular">{eur(p.price)}</span>
            <button type="button" onClick={() => basculerFavori(p.id)} aria-label={`Retirer ${p.name} des favoris`}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-3 hover:bg-cream hover:text-wine">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Preferences({ c }: { c: NonNullable<ReturnType<typeof compte.get>> }) {
  const p = c.preferences;
  const TAILLES = ['S', 'M', 'L', 'XL'];

  const bascule = (t: string) =>
    majCompte({
      preferences: {
        ...p,
        tailles: p.tailles.includes(t) ? p.tailles.filter((x) => x !== t) : [...p.tailles, t],
      },
    });

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-paper p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold">Vos tailles</h3>
        <p className="mt-1 text-sm text-ink-2">
          Nous les préselectionnerons dans la boutique pour ne vous montrer que ce qui vous va.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TAILLES.map((t) => (
            <button key={t} type="button" onClick={() => bascule(t)} aria-pressed={p.tailles.includes(t)}
              className={`min-w-14 rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
                p.tailles.includes(t) ? 'border-wine bg-wine text-white' : 'border-line-2 bg-paper text-ink hover:border-wine'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-paper p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold">Ce que vous recevez</h3>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={p.lettre} className="mt-1 h-4 w-4 accent-[var(--color-wine)]"
              onChange={(e) => majCompte({ preferences: { ...p, lettre: e.target.checked } })} />
            <span>
              <span className="block text-sm font-semibold">L'annonce des lives</span>
              <span className="block text-sm text-ink-2">Un message avant chaque direct, rien d'autre.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={p.retourStock} className="mt-1 h-4 w-4 accent-[var(--color-wine)]"
              onChange={(e) => majCompte({ preferences: { ...p, retourStock: e.target.checked } })} />
            <span>
              <span className="block text-sm font-semibold">Le retour en stock</span>
              <span className="block text-sm text-ink-2">Quand une pièce de vos favoris revient dans votre taille.</span>
            </span>
          </label>
        </div>
        <p className="mt-4 text-xs text-ink-3">
          Vous pouvez changer d'avis à tout moment. Nous ne transmettons votre adresse à personne.
        </p>
      </div>
    </div>
  );
}

function Securite({ c }: { c: NonNullable<ReturnType<typeof compte.get>> }) {
  const [prenom, setPrenom] = useState(c.prenom);
  const [nom, setNom] = useState(c.nom);
  const [actuel, setActuel] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [msg, setMsg] = useState<{ t: 'ok' | 'ko'; x: string } | null>(null);

  const identite = (e: React.FormEvent) => {
    e.preventDefault();
    majCompte({ prenom: prenom.trim(), nom: nom.trim() });
    setMsg({ t: 'ok', x: 'Vos informations sont à jour.' });
  };

  const motDePasse = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await changerMotDePasse(actuel, nouveau);
    setMsg(r.ok ? { t: 'ok', x: 'Mot de passe modifié.' } : { t: 'ko', x: r.erreur });
    if (r.ok) { setActuel(''); setNouveau(''); }
  };

  return (
    <div className="space-y-3">
      {msg && (
        <p role="status" className={`rounded-md px-4 py-3 text-sm font-semibold ${
          msg.t === 'ok' ? 'bg-sage-soft text-sage' : 'bg-wine-soft text-wine'}`}>
          {msg.x}
        </p>
      )}

      <form onSubmit={identite} className="rounded-xl bg-paper p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold">Vos informations</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="s-prenom">Prénom</label>
            <input id="s-prenom" className="field" value={prenom} onChange={(e) => setPrenom(e.target.value)} /></div>
          <div><label className="label" htmlFor="s-nom">Nom</label>
            <input id="s-nom" className="field" value={nom} onChange={(e) => setNom(e.target.value)} /></div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-mail">Adresse e-mail</label>
            <input id="s-mail" className="field" value={c.email} readOnly aria-readonly="true" />
            <p className="help">Pour changer d'adresse, écrivez-nous.</p>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-5">Enregistrer</button>
      </form>

      <form onSubmit={motDePasse} className="rounded-xl bg-paper p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold">Mot de passe</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="s-actuel">Mot de passe actuel</label>
            <input id="s-actuel" type="password" className="field" autoComplete="current-password" required
              value={actuel} onChange={(e) => setActuel(e.target.value)} /></div>
          <div><label className="label" htmlFor="s-nouveau">Nouveau mot de passe</label>
            <input id="s-nouveau" type="password" className="field" autoComplete="new-password" minLength={8} required
              value={nouveau} onChange={(e) => setNouveau(e.target.value)} />
            <p className="help">Au moins 8 caractères.</p></div>
        </div>
        <button type="submit" className="btn btn-primary mt-5">Changer le mot de passe</button>
      </form>
    </div>
  );
}
