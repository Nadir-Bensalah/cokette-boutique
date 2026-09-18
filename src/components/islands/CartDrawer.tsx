import { useStore } from '@nanostores/react';
import { useEffect, useRef } from 'react';
import { cartLines, cartOpen, cartTotal, closeCartDrawer, removeLine, setQty } from '@/stores/cart';

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

/** Panneau du panier, glisse depuis la droite. Se ferme à Échap et au clic
 *  sur le voile. Le focus est piégé dedans tant qu'il est ouvert. */
export default function CartDrawer({ base }: { base: string }) {
  const open = useStore(cartOpen);
  const lines = useStore(cartLines);
  const total = useStore(cartTotal);
  const panel = useRef<HTMLDivElement>(null);
  const b = base.replace(/\/$/, '');

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCartDrawer(); };
    document.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('button, a')?.focus();
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Votre panier">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={closeCartDrawer} />
      <div
        ref={panel}
        className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-cream shadow-float"
        style={{ animation: 'slide .3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-semibold">Votre panier</h2>
          <button type="button" onClick={closeCartDrawer} aria-label="Fermer le panier"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-wine-soft">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-ink-2">Votre panier est vide.</p>
            <a href={`${b}/boutique`} className="btn btn-primary btn-sm">Voir la boutique</a>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-3 rounded-lg bg-paper p-3 shadow-card">
                  <img src={`${b}/images/products/${l.image}`} alt="" width="64" height="85"
                    className="h-[85px] w-16 rounded-md object-cover" loading="lazy" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate font-semibold leading-tight">{l.name}</p>
                    <p className="mt-0.5 text-sm text-ink-3">Taille {l.size}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="inline-flex items-center rounded-full border border-line-2">
                        <button type="button" onClick={() => setQty(l.key, l.qty - 1)} disabled={l.qty <= 1}
                          className="grid h-8 w-8 place-items-center rounded-full disabled:opacity-30" aria-label="Retirer un">−</button>
                        <span className="w-6 text-center text-sm font-semibold tabular">{l.qty}</span>
                        <button type="button" onClick={() => setQty(l.key, l.qty + 1)} disabled={l.qty >= l.max}
                          className="grid h-8 w-8 place-items-center rounded-full disabled:opacity-30" aria-label="Ajouter un">+</button>
                      </div>
                      <span className="font-display font-semibold tabular">{eur(l.price * l.qty)}</span>
                    </div>
                    {l.qty >= l.max && <p className="mt-1 text-xs text-wine">Dernière pièce en {l.size}</p>}
                  </div>
                  <button type="button" onClick={() => removeLine(l.key)} aria-label={`Retirer ${l.name}`}
                    className="self-start p-1 text-ink-3 hover:text-wine">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line bg-paper px-5 py-4 safe-bottom">
              <div className="flex items-baseline justify-between">
                <span className="text-ink-2">Total</span>
                <span className="font-display text-2xl font-semibold tabular">{eur(total)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-3">Livraison calculée à l'étape suivante.</p>
              <a href={`${b}/commande`} className="btn btn-primary btn-lg mt-3 w-full">Commander</a>
            </footer>
          </>
        )}
      </div>
      <style>{`@keyframes slide { from { transform: translateX(100%) } to { transform: none } }
        @media (prefers-reduced-motion: reduce) { div[style*="slide"] { animation: none !important } }`}</style>
    </div>
  );
}
