import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import type { Line } from '@/stores/cart';
import Photo from './Photo';
import { cartLines, cartTotal, removeLine, setQty, undoRemove } from '@/stores/cart';

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const PORT = 4.95;
const FRANCO = 80;

/** Le panier en pleine page : mêmes règles que le panneau, plus de place
 *  pour la liste et le récapitulatif. */
export default function CartPage({ base }: { base: string }) {
  const lines = useStore(cartLines);
  const total = useStore(cartTotal);
  const b = base.replace(/\/$/, '');
  const [undo, setUndo] = useState<Line | null>(null);

  useEffect(() => {
    if (!undo) return;
    const id = setTimeout(() => setUndo(null), 8000);
    return () => clearTimeout(id);
  }, [undo]);

  const port = total >= FRANCO || total === 0 ? 0 : PORT;
  const atteint = total >= FRANCO;
  const progres = Math.min(100, Math.round((total / FRANCO) * 100));

  if (lines.length === 0) {
    return (
      <div className="mt-8 rounded-xl bg-paper p-10 text-center shadow-card">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-cream" aria-hidden="true">
          <svg width="52" height="52" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" className="text-wine/50">
            <circle cx="60" cy="24" r="8" /><path d="M60 32v10" />
            <path d="M60 42 18 82q-3 4 2 4h80q5 0 2-4z" />
          </svg>
        </span>
        <p className="mt-4 font-display text-xl font-semibold">Votre panier est vide</p>
        <p className="mx-auto mt-2 max-w-sm text-ink-2">Les pièces que vous ajoutez se retrouvent ici.</p>
        <a href={`${b}/boutique`} className="btn btn-primary mt-5">Voir la boutique</a>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-4 rounded-lg bg-paper p-4 shadow-card">
              <a href={`${b}/produits/${l.slug}`} className="h-[132px] w-[100px] shrink-0 overflow-hidden rounded-lg bg-cream" tabIndex={-1} aria-hidden="true">
                <Photo src={`/images/products/${l.image}`} base={base} sizes="100px" className="h-full w-full object-cover" width={100} height={132} />
              </a>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a href={`${b}/produits/${l.slug}`} className="font-display text-lg font-semibold leading-tight hover:text-wine">{l.name}</a>
                    <p className="mt-0.5 text-sm text-ink-3">Taille {l.size}</p>
                    <p className="mt-1 text-sm font-semibold text-wine tabular">{eur(l.price)}</p>
                  </div>
                  <button type="button" onClick={() => { removeLine(l.key); setUndo(l); }}
                    aria-label={`Retirer ${l.name}, taille ${l.size}`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-cream hover:text-ink">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="inline-flex items-center rounded-full border border-line-2 bg-cream">
                    <button type="button" onClick={() => setQty(l.key, l.qty - 1)} disabled={l.qty <= 1}
                      className="grid h-10 w-10 place-items-center rounded-full text-lg transition-colors hover:bg-wine-soft disabled:opacity-30"
                      aria-label="Retirer un">−</button>
                    <span className="min-w-9 text-center text-sm font-bold tabular" aria-live="polite">{l.qty}</span>
                    <button type="button" onClick={() => setQty(l.key, l.qty + 1)} disabled={l.qty >= l.max}
                      className="grid h-10 w-10 place-items-center rounded-full text-lg transition-colors hover:bg-wine-soft disabled:opacity-30"
                      aria-label="Ajouter un">+</button>
                  </div>
                  <span className="font-display text-lg font-semibold tabular">{eur(l.price * l.qty)}</span>
                </div>
                {l.qty >= l.max && (
                  <p className="mt-2 text-xs font-semibold text-wine">
                    {l.max === 1 ? 'Dernière pièce disponible' : `Stock maximum en ${l.size}`}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {undo && (
          <p className="mt-3 flex items-center justify-between gap-3 rounded-md bg-cream px-4 py-3 text-sm" role="status">
            <span className="min-w-0 truncate font-semibold text-ink-2">{undo.name} · retiré du panier</span>
            <button type="button" className="shrink-0 rounded-full px-3 py-2 text-sm font-bold text-wine hover:bg-wine-soft"
              onClick={() => { undoRemove(); setUndo(null); }}>
              Annuler
            </button>
          </p>
        )}

        <a href={`${b}/boutique`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-wine underline underline-offset-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Continuer mes achats
        </a>
      </div>

      <aside className="h-fit rounded-xl bg-paper p-6 shadow-card lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold">Récapitulatif</h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-2">Sous-total</dt>
            <dd className="tabular font-semibold">{eur(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-2">Livraison</dt>
            <dd className="tabular font-semibold">{port === 0 ? 'Offerte' : eur(port)}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-lg bg-wine-soft p-4">
          <p className="text-sm font-semibold text-wine" aria-live="polite">
            {atteint ? `Livraison offerte : ${eur(PORT)} économisés.` : `Plus que ${eur(FRANCO - total)} pour la livraison offerte.`}
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full"
            style={{ background: 'color-mix(in srgb, var(--color-wine) 15%, transparent)' }}
            role="progressbar" aria-label="Progression vers la livraison offerte"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={atteint ? 100 : progres}>
            <div className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${atteint ? 100 : Math.max(4, progres)}%`,
                background: atteint ? 'linear-gradient(90deg, var(--color-wine), var(--color-sage))' : 'var(--color-wine)',
              }} />
          </div>
        </div>

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
