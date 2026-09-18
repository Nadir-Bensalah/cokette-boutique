import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { cartLines, cartTotal, clearCart } from '@/stores/cart';
import { compte, enregistrerCommande, type Commande } from '@/stores/compte';

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const PORT = 4.95;
const FRANCO = 80;

type Mode = 'retrait' | 'colissimo' | 'relais';

/** Tunnel en une seule page : tout tient dans un écran de téléphone.
 *  La démonstration s'arrête avant le paiement — c'est Stripe qui prend
 *  le relais dans la version branchée. */
export default function Checkout({ base }: { base: string }) {
  const lines = useStore(cartLines);
  const total = useStore(cartTotal);
  const c = useStore(compte);
  const b = base.replace(/\/$/, '');
  const [mode, setMode] = useState<Mode>('retrait');
  const [confirmee, setConfirmee] = useState<Commande | null>(null);
  const [envoye, setEnvoye] = useState(false);

  // Connectée, ses informations sont déjà là : elle n'a rien à ressaisir.
  const defaut = c?.adresses.find((a) => a.defaut) ?? c?.adresses[0];
  const [v, setV] = useState({
    prenom: '', nom: '', email: '', tel: '', adresse: '', cp: '', ville: '',
  });

  useEffect(() => {
    if (!c) return;
    setV((x) => ({
      ...x,
      prenom: x.prenom || c.prenom,
      nom: x.nom || c.nom,
      email: x.email || c.email,
      tel: x.tel || defaut?.telephone || '',
      adresse: x.adresse || defaut?.rue || '',
      cp: x.cp || defaut?.cp || '',
      ville: x.ville || defaut?.ville || '',
    }));
  }, [c, defaut]);

  const port = mode === 'retrait' || total >= FRANCO ? 0 : PORT;

  if (lines.length === 0 && !envoye) {
    return (
      <div className="mt-8 rounded-xl bg-paper p-10 text-center shadow-card">
        <p className="text-ink-2">Votre panier est vide.</p>
        <a href={`${b}/boutique`} className="btn btn-primary mt-5">Voir la boutique</a>
      </div>
    );
  }

  if (envoye) {
    return (
      <div className="mt-8 rounded-xl bg-paper p-10 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-soft text-sage">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7" /></svg>
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">Merci&nbsp;!</h2>
        {confirmee ? (
          <>
            <p className="mt-2 font-display text-lg font-semibold text-wine">{confirmee.numero}</p>
            <p className="mx-auto mt-3 max-w-sm text-ink-2">
              Votre commande est enregistrée. Vous la retrouvez à tout moment dans votre espace,
              avec son suivi et sa facture.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <a href={`${b}/compte`} className="btn btn-primary">Voir ma commande</a>
              <a href={`${b}/boutique`} className="btn btn-ghost">Continuer mes achats</a>
            </div>
          </>
        ) : (
          <>
            <p className="mx-auto mt-3 max-w-sm text-ink-2">
              Votre commande est bien prise en compte. Vous recevrez la confirmation
              et le suivi par e-mail.
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-ink-3">
              Avec un compte, vous retrouveriez ici vos commandes et vos factures.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <a href={`${b}/compte`} className="btn btn-soft">Créer mon compte</a>
              <a href={`${b}/boutique`} className="btn btn-ghost">Continuer mes achats</a>
            </div>
          </>
        )}
        <p className="mt-6 text-xs text-ink-3">
          Démonstration&nbsp;: le paiement Stripe arrive avec la version complète.
        </p>
      </div>
    );
  }

  const Option = ({ v, titre, detail, prix }: { v: Mode; titre: string; detail: string; prix: string }) => (
    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
      mode === v ? 'border-wine bg-wine-soft' : 'border-line-2 bg-paper hover:border-wine'}`}>
      <input type="radio" name="livraison" value={v} checked={mode === v}
        onChange={() => setMode(v)} className="mt-1 h-4 w-4 accent-[var(--color-wine)]" />
      <span className="flex-1">
        <span className="block font-semibold">{titre}</span>
        <span className="mt-0.5 block text-sm text-ink-2">{detail}</span>
      </span>
      <span className="font-display font-semibold tabular">{prix}</span>
    </label>
  );

  return (
    <form className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]"
      onSubmit={(e) => {
        e.preventDefault();
        const cmd = enregistrerCommande(lines, mode, port);
        setConfirmee(cmd);
        clearCart();
        setEnvoye(true);
      }}>
      <div className="space-y-8">
        {!c && (
          <p className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-wine-soft px-4 py-3 text-sm">
            <span className="text-ink-2">Vous avez un compte&nbsp;? Vos informations seront pré-remplies.</span>
            <a href={`${b}/compte`} className="shrink-0 font-bold text-wine underline underline-offset-2">Se connecter</a>
          </p>
        )}

        <fieldset>
          <legend className="font-display text-xl font-semibold">Vos coordonnées</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="prenom">Prénom</label>
              <input id="prenom" name="prenom" className="field" autoComplete="given-name" required
                value={v.prenom} onChange={(e) => setV({ ...v, prenom: e.target.value })} /></div>
            <div><label className="label" htmlFor="nom">Nom</label>
              <input id="nom" name="nom" className="field" autoComplete="family-name" required
                value={v.nom} onChange={(e) => setV({ ...v, nom: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" className="field" autoComplete="email" required
                value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
              <p className="help">Pour recevoir la confirmation et le suivi.</p></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="tel">Téléphone</label>
              <input id="tel" name="tel" type="tel" className="field" autoComplete="tel" inputMode="tel" required
                value={v.tel} onChange={(e) => setV({ ...v, tel: e.target.value })} /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-xl font-semibold">La livraison</legend>
          <div className="mt-4 space-y-3">
            <Option v="retrait" titre="Retrait en boutique" detail="À Bray-sur-Somme, dès le lendemain." prix="Gratuit" />
            <Option v="colissimo" titre="Colissimo à domicile" detail="Sous 48 à 72 h." prix={total >= FRANCO ? 'Offerte' : eur(PORT)} />
            <Option v="relais" titre="Mondial Relay" detail="Au point relais de votre choix." prix={total >= FRANCO ? 'Offerte' : eur(PORT)} />
          </div>

          {mode !== 'retrait' && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="label" htmlFor="adresse">Adresse</label>
                <input id="adresse" name="adresse" className="field" autoComplete="street-address" required
                  value={v.adresse} onChange={(e) => setV({ ...v, adresse: e.target.value })} /></div>
              <div><label className="label" htmlFor="cp">Code postal</label>
                <input id="cp" name="cp" className="field" autoComplete="postal-code" inputMode="numeric" required
                  value={v.cp} onChange={(e) => setV({ ...v, cp: e.target.value })} /></div>
              <div><label className="label" htmlFor="ville">Ville</label>
                <input id="ville" name="ville" className="field" autoComplete="address-level2" required
                  value={v.ville} onChange={(e) => setV({ ...v, ville: e.target.value })} /></div>
            </div>
          )}
        </fieldset>
      </div>

      <aside className="h-fit rounded-xl bg-paper p-6 shadow-card lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold">Votre commande</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate font-medium">{l.name}</span>
                <span className="text-ink-3">Taille {l.size} · ×{l.qty}</span>
              </span>
              <span className="tabular font-semibold">{eur(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-2">Sous-total</dt><dd className="tabular">{eur(total)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-2">Livraison</dt>
            <dd className="tabular">{port === 0 ? 'Offerte' : eur(port)}</dd></div>
        </dl>
        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-semibold">Total</span>
          <span className="font-display text-2xl font-semibold tabular">{eur(total + port)}</span>
        </div>
        <button type="submit" className="btn btn-primary btn-lg mt-5 w-full">Payer {eur(total + port)}</button>
        <p className="mt-3 text-center text-xs text-ink-3">
          Paiement sécurisé par Stripe. Aucune donnée bancaire ne transite par ce site.
        </p>
      </aside>
    </form>
  );
}
