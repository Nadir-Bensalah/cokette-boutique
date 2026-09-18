import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { addToCart, cartLines, openCartDrawer } from '@/stores/cart';

interface Snapshot {
  id: string; slug: string; name: string; image: string;
  price: number; sizes: string[]; stock: Record<string, number>;
}

interface Props {
  product: Snapshot;
  base: string;
  /** Bouton rond « + » (cartes) ou bouton large (fiche produit). */
  compact?: boolean;
  /** Taille déjà choisie sur la fiche produit. */
  size?: string;
  className?: string;
}

/**
 * Bouton d'ajout au panier. Au clic : la photo « vole » vers l'icône panier,
 * le bouton passe en « Ajouté » une seconde, le compteur rebondit.
 *
 * Une pièce se vend par taille. Sur les cartes de la boutique, si plusieurs
 * tailles sont disponibles, le bouton ouvre d'abord un petit choix de tailles
 * plutôt que d'ajouter au hasard.
 */
export default function AddButton({ product, base, compact = false, size, className = '' }: Props) {
  const lines = useStore(cartLines);
  const [state, setState] = useState<'idle' | 'added'>('idle');
  const [picking, setPicking] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const drawerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dispo = product.sizes.filter((s) => (product.stock[s] ?? 0) > 0);
  const soldOut = dispo.length === 0;
  const inCart = lines.some((l) => l.product_id === product.id);

  useEffect(() => () => { if (drawerTimer.current) clearTimeout(drawerTimer.current); }, []);

  useEffect(() => {
    if (state !== 'added') return;
    const id = setTimeout(() => setState('idle'), 1100);
    return () => clearTimeout(id);
  }, [state]);

  // Un clic à côté ou la touche Échap referme le choix de tailles.
  useEffect(() => {
    if (!picking) return;
    const away = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setPicking(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPicking(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [picking]);

  const fly = useCallback(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = document.getElementById('cart-anchor');
    const from = btn.current?.closest('article')?.querySelector('img')
      ?? document.querySelector<HTMLImageElement>('[data-product-hero] img');
    if (!target || !from || !product.image) return;

    const a = from.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const ghost = document.createElement('img');
    ghost.src = (from as HTMLImageElement).currentSrc || `${base.replace(/\/$/, '')}/images/products/${product.image}`;
    ghost.alt = '';
    Object.assign(ghost.style, {
      position: 'fixed',
      left: `${a.left}px`,
      top: `${a.top}px`,
      width: `${Math.min(a.width, 96)}px`,
      height: `${Math.min(a.height, 120)}px`,
      objectFit: 'cover',
      borderRadius: '14px',
      zIndex: '80',
      pointerEvents: 'none',
      boxShadow: '0 12px 40px -12px rgba(43,27,32,.5)',
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(ghost);

    const dx = b.left + b.width / 2 - (a.left + Math.min(a.width, 96) / 2);
    const dy = b.top + b.height / 2 - (a.top + Math.min(a.height, 120) / 2);
    const anim = ghost.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(0.7)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.4 },
      ],
      { duration: 650, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' },
    );
    anim.onfinish = () => ghost.remove();
  }, [product.image, base]);

  const ajouter = (taille: string) => {
    fly();
    addToCart({
      product_id: product.id, slug: product.slug, name: product.name,
      image: product.image, size: taille, price: product.price,
      max: product.stock[taille] ?? 1,
    });
    setState('added');
    setPicking(false);
    // Sur une fiche produit, l'ajout est un geste réfléchi : le panneau
    // s'ouvre pour montrer le panier, une fois la photo arrivée. Sur les
    // cartes de la boutique il se mettrait en travers de celle qui remplit
    // vite son panier : la photo qui vole et le compteur suffisent.
    if (!compact) {
      if (drawerTimer.current) clearTimeout(drawerTimer.current);
      drawerTimer.current = setTimeout(openCartDrawer, 450);
    }
  };

  const onClick = () => {
    if (soldOut) return;
    const choisie = size && (product.stock[size] ?? 0) > 0 ? size : null;
    if (choisie) return ajouter(choisie);
    if (dispo.length === 1) return ajouter(dispo[0]);
    setPicking((v) => !v);
  };

  const Check = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="animate-pop">
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );

  if (compact) {
    return (
      <div className="relative" ref={wrap}>
        <button
          ref={btn}
          type="button"
          onClick={onClick}
          disabled={soldOut}
          aria-label={soldOut ? `${product.name} — épuisé` : `Ajouter ${product.name} au panier`}
          aria-expanded={dispo.length > 1 ? picking : undefined}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full shadow-card transition-[transform,background-color] duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${
            state === 'added' ? 'bg-sage text-white'
            : inCart ? 'bg-wine-soft text-wine'
            : 'bg-wine text-white hover:bg-wine-deep'
          } ${className}`}
        >
          {state === 'added' ? <Check /> : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>

        {picking && (
          <div className="absolute bottom-full end-0 z-30 mb-2 rounded-lg border border-line bg-paper p-2 shadow-float">
            <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Taille</p>
            <div className="flex flex-wrap gap-1.5" style={{ maxWidth: '11rem' }}>
              {product.sizes.map((s) => {
                const reste = product.stock[s] ?? 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ajouter(s)}
                    disabled={reste === 0}
                    className="min-w-11 rounded-md border border-line-2 px-2.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-wine hover:bg-wine hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:bg-cream-2 disabled:text-ink-3 disabled:line-through disabled:hover:bg-cream-2 disabled:hover:text-ink-3"
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Hors fiche produit (pas de taille choisie), le bouton large ouvre le même
  // choix de tailles que le bouton rond : il agit, il n'instruit pas.
  return (
    <div className="relative" ref={wrap}>
      <button
        ref={btn}
        type="button"
        onClick={onClick}
        disabled={soldOut}
        aria-expanded={!size && dispo.length > 1 ? picking : undefined}
        className={`btn btn-lg w-full ${
          state === 'added' ? 'bg-sage text-white' : 'bg-wine text-white shadow-card hover:bg-wine-deep'
        } ${className}`}
      >
        {soldOut ? 'Épuisé'
          : state === 'added' ? (<><Check />Ajouté au panier</>)
          : (<>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 7h16l-1.5 12.5a1 1 0 0 1-1 .9h-11a1 1 0 0 1-1-.9z" />
                <path d="M8 7a4 4 0 0 1 8 0" />
              </svg>
              Ajouter au panier
            </>)}
      </button>

      {picking && (
        <div className="absolute bottom-full start-0 end-0 z-30 mb-2 rounded-lg border border-line bg-paper p-3 shadow-float">
          <p className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Quelle taille ?</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const reste = product.stock[s] ?? 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => ajouter(s)}
                  disabled={reste === 0}
                  className="min-w-12 rounded-md border border-line-2 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-wine hover:bg-wine hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:bg-cream-2 disabled:text-ink-3 disabled:line-through disabled:hover:bg-cream-2 disabled:hover:text-ink-3"
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
