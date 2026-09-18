import { useStore } from '@nanostores/react';
import { cartLines, cartTotal, removeLine, setQty } from '@/stores/cart';

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const PORT = 4.95;
const FRANCO = 80;

export default function CartPage({ base }: { base: string }) {
  const lines = useStore(cartLines);
  const total = useStore(cartTotal);
  const b = base.replace(/\/$/, '');
  const port = total >= FRANCO || total === 0 ? 0 : PORT;

  if (lines.length === 0) {
    return (
      <div className="mt-8 rounded-xl bg-paper p-10 text-center shadow-card">
        <p className="text-ink-2">Votre panier est vide pour le moment.</p>
        <a href={`${b}/boutique`} className="btn btn-primary mt-5">Voir la boutique</a>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ul className="space-y-3">
        {lines.map((l) => (
          <li key={l.key} className="flex gap-4 rounded-lg bg-paper p-4 shadow-card">
            <img src={`${b}/images/products/${l.image}`} alt="" width="90" height="120"
              className="h-[120px] w-[90px] rounded-md object-cover" loading="lazy" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <a href={`${b}/produits/${l.slug}`} className="font-semibold leading-tight hover:text-wine">{l.name}</a>
                  <p className="mt-0.5 text-sm text-ink-3">Taille {l.size}</p>
                </div>
                <button type="button" onClick={() => removeLine(l.key)} aria-label={`Retirer ${l.name}`}
                  className="p-1 text-ink-3 hover:text-wine">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                <div className="inline-flex items-center rounded-full border border-line-2">
                  <button type="button" onClick={() => setQty(l.key, l.qty - 1)} disabled={l.qty <= 1}
                    className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label="Retirer un">−</button>
                  <span className="w-7 text-center text-sm font-semibold tabular">{l.qty}</span>
                  <button type="button" onClick={() => setQty(l.key, l.qty + 1)} disabled={l.qty >= l.max}
                    className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label="Ajouter un">+</button>
                </div>
                <span className="font-display text-lg font-semibold tabular">{eur(l.price * l.qty)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-xl bg-paper p-6 shadow-card lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold">Récapitulatif</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-ink-2">Sous-total</dt><dd className="tabular font-semibold">{eur(total)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-ink-2">Livraison</dt>
            <dd className="tabular font-semibold">{port === 0 ? 'Offerte' : eur(port)}</dd>
          </div>
        </dl>
        {port > 0 && (
          <p className="mt-3 rounded-md bg-wine-soft px-3 py-2 text-xs text-wine">
            Plus que {eur(FRANCO - total)} pour la livraison offerte.
          </p>
        )}
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-display text-2xl font-semibold tabular">{eur(total + port)}</span>
        </div>
        <a href={`${b}/commande`} className="btn btn-primary btn-lg mt-5 w-full">Passer la commande</a>
        <p className="mt-3 text-center text-xs text-ink-3">Paiement sécurisé par Stripe</p>
      </aside>
    </div>
  );
}
