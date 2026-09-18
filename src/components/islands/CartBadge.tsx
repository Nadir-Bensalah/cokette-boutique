import { useStore } from '@nanostores/react';
import { useEffect, useRef, useState } from 'react';
import { cartCount, openCartDrawer } from '@/stores/cart';

/** Icône panier de l'en-tête. Le compteur rebondit à chaque ajout.
 *  Porte #cart-anchor : c'est la cible de la photo qui vole. */
export default function CartBadge() {
  const n = useStore(cartCount);
  const [pop, setPop] = useState(false);
  const prev = useRef(n);

  useEffect(() => {
    if (n > prev.current) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 450);
      prev.current = n;
      return () => clearTimeout(id);
    }
    prev.current = n;
  }, [n]);

  return (
    <button
      type="button"
      id="cart-anchor"
      onClick={openCartDrawer}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-wine-soft"
      aria-label={n > 0 ? `Panier, ${n} article${n > 1 ? 's' : ''}` : 'Panier, vide'}
    >
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7h16l-1.5 12.5a1 1 0 0 1-1 .9h-11a1 1 0 0 1-1-.9z" />
        <path d="M8 7a4 4 0 0 1 8 0" />
      </svg>
      {n > 0 && (
        <span className={`absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-wine px-1 text-[11px] font-bold text-white tabular ${pop ? 'animate-pop' : ''}`}>
          {n}
        </span>
      )}
    </button>
  );
}
