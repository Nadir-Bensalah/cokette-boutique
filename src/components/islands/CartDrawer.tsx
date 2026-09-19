import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Photo from './Photo';
import catalogue from '@/data/catalogue.json';
import type { Line } from '@/stores/cart';
import {
  cartLines, cartOpen, cartTotal, closeCartDrawer,
  addToCart, removeLine, setQty, undoRemove,
} from '@/stores/cart';

/**
 * Panneau du panier : il glisse depuis le bord de l'écran sans quitter la page.
 * Collé au bord sur ordinateur, plein écran sur téléphone. Il porte ses propres
 * styles, car il peut s'ouvrir depuis n'importe quelle page.
 */

const CSS = `
.cd-root { position: fixed; inset: 0; z-index: 75; }
.cd-veil {
  position: absolute; inset: 0;
  background: color-mix(in srgb, var(--color-ink) 45%, transparent);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  opacity: 0; transition: opacity .3s var(--ease-out-expo);
}
.cd-root[data-open='true'] .cd-veil { opacity: 1; }
.cd-panel {
  position: absolute; inset-block: 0; inset-inline-end: 0;
  display: flex; flex-direction: column;
  width: 100%; max-width: 560px;
  background: var(--color-paper);
  box-shadow: var(--shadow-float);
  transform: translateX(100%);
  transition: transform .3s var(--ease-out-expo);
  will-change: transform;
}
.cd-root[data-open='true'] .cd-panel { transform: none; }
@media (width >= 640px) {
  .cd-panel {
    border-start-start-radius: var(--radius-lg);
    border-end-start-radius: var(--radius-lg);
  }
}
.cd-head {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.25rem 1.5rem 1rem; padding-top: max(1.25rem, env(safe-area-inset-top));
  border-bottom: 1px solid var(--color-line);
}
.cd-bag { position: relative; flex: none; color: var(--color-wine); }
.cd-bag-n {
  position: absolute; top: -4px; inset-inline-end: -4px;
  min-width: 24px; height: 24px; padding: 0 6px; border-radius: 999px;
  background: var(--color-wine); color: #fff;
  font-size: 12px; font-weight: 700; line-height: 24px; text-align: center;
  font-variant-numeric: tabular-nums;
}
.cd-close {
  display: inline-flex; height: 52px; width: 52px; flex: none;
  align-items: center; justify-content: center;
  border-radius: 999px; background: var(--color-cream); color: var(--color-ink);
  transition: background-color .2s;
}
.cd-close:hover { background: var(--color-cream-2); }
.cd-body {
  flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain;
  display: flex; flex-direction: column; gap: 1.25rem;
  padding: 1rem 1.5rem 1.5rem;
}
.cd-foot {
  flex: none;
  border-top: 1px solid var(--color-line);
  background: var(--color-paper);
  padding: 1rem 1.5rem calc(1rem + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; gap: .75rem;
  box-shadow: 0 -10px 26px -20px rgba(43, 27, 32, .55);
}
.cd-line { display: flex; gap: 1.25rem; padding: 1.25rem 0; border-top: 1px solid var(--color-line); }
.cd-line:first-child { border-top: 0; padding-top: .5rem; }
.cd-thumb {
  height: 132px; width: 100px; flex: none; overflow: hidden;
  border-radius: 1rem; background: var(--color-cream);
}
.cd-thumb img { height: 100%; width: 100%; object-fit: cover; }
@media (width < 640px) { .cd-thumb { height: 104px; width: 78px; } .cd-line { gap: .875rem; } }
.cd-step {
  display: inline-flex; align-items: center;
  border: 1px solid var(--color-line-2); border-radius: 999px;
  background: var(--color-cream);
}
.cd-step button {
  display: grid; place-items: center; height: 40px; width: 40px;
  border-radius: 999px; color: var(--color-ink); font-size: 18px; line-height: 1;
  transition: background-color .2s;
}
.cd-step button:hover:not(:disabled) { background: var(--color-wine-soft); }
.cd-step button:disabled { opacity: .3; cursor: not-allowed; }
.cd-step span {
  min-width: 2.25rem; text-align: center;
  font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums;
}
.cd-free {
  display: flex; align-items: center; gap: 1rem;
  border-radius: var(--radius-lg); background: var(--color-wine-soft); padding: 1.125rem 1.25rem;
}
.cd-free-ico {
  display: inline-flex; height: 56px; width: 56px; flex: none;
  align-items: center; justify-content: center;
  border-radius: 999px; background: color-mix(in srgb, var(--color-wine) 15%, transparent);
  color: var(--color-wine);
}
.cd-bar {
  height: 10px; border-radius: 999px; overflow: hidden;
  background: color-mix(in srgb, var(--color-wine) 15%, transparent);
}
.cd-bar-fill {
  height: 100%; min-width: 10px; border-radius: 999px;
  background: var(--color-wine);
  transition: width .6s var(--ease-out-expo), background .3s ease;
}
.cd-bar-fill[data-full='true'] { background: linear-gradient(90deg, var(--color-wine), var(--color-sage)); }
.cd-trust { display: flex; justify-content: space-between; gap: .5rem; padding-top: .25rem; }
.cd-trust li { display: flex; align-items: center; gap: .5rem; font-size: 13px; font-weight: 600; color: var(--color-ink-2); }
.cd-trust svg { color: var(--color-wine); flex: none; }
.cd-sug {
  display: flex; align-items: center; gap: .75rem;
  border: 1px solid var(--color-line); border-radius: var(--radius-md);
  background: var(--color-paper); padding: .5rem;
  transition: border-color .2s;
}
.cd-sug:hover { border-color: var(--color-line-2); }
.cd-sug-add {
  display: inline-flex; height: 44px; width: 44px; flex: none;
  align-items: center; justify-content: center;
  border-radius: 999px; background: var(--color-wine-soft); color: var(--color-wine);
  transition: background-color .2s, color .2s, transform .2s;
}
.cd-sug-add:hover { background: var(--color-wine); color: #fff; }
.cd-sug-add:active { transform: scale(.92); }
@media (prefers-reduced-motion: reduce) {
  .cd-panel { transform: none; opacity: 0; transition: opacity .2s ease; }
  .cd-root[data-open='true'] .cd-panel { opacity: 1; }
  .cd-veil, .cd-bar-fill { transition: none; }
}
`;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const FRANCO = 80;
const PORT = 4.95;

interface P {
  id: string; slug: string; name: string; short: string;
  price: number; images: string[]; sizes: string[]; stock: Record<string, number>; badges: string[];
}
const PRODUITS = catalogue.products as P[];

export default function CartDrawer({ base }: { base: string }) {
  const open = useStore(cartOpen);
  const lines = useStore(cartLines);
  const total = useStore(cartTotal);
  const b = base.replace(/\/$/, '');

  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);
  const [undo, setUndo] = useState<Line | null>(null);

  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Entrée et sortie : le panneau reste monté le temps de glisser dehors.
  useEffect(() => {
    if (open) {
      setRender(true);
      // Le glissement a besoin que l'état fermé soit peint d'abord. L'image
      // suivante suffit, avec un filet de sécurité si le navigateur ne dessine
      // pas (onglet en arrière-plan) : sans lui, le panneau resterait dehors.
      const raf = requestAnimationFrame(() => setShown(true));
      const fb = setTimeout(() => setShown(true), 40);
      return () => { cancelAnimationFrame(raf); clearTimeout(fb); };
    }
    setShown(false);
    const id = setTimeout(() => setRender(false), 320);
    return () => clearTimeout(id);
  }, [open]);

  // Défilement bloqué derrière, focus donné au panneau puis rendu au bouton.
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = 'hidden';
    const id = setTimeout(() => closeBtn.current?.focus(), 30);
    return () => {
      clearTimeout(id);
      document.documentElement.style.overflow = '';
      opener.current?.focus();
    };
  }, [open]);

  // Échap, où que soit le curseur.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeCartDrawer(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Un lien du panneau mène ailleurs : le panneau se referme avec la page.
  useEffect(() => {
    const off = () => closeCartDrawer();
    document.addEventListener('astro:before-swap', off);
    return () => document.removeEventListener('astro:before-swap', off);
  }, []);

  useEffect(() => {
    if (!undo) return;
    const id = setTimeout(() => setUndo(null), 8000);
    return () => clearTimeout(id);
  }, [undo]);

  const retirer = useCallback((l: Line) => { removeLine(l.key); setUndo(l); }, []);

  const onTab = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panel.current) return;
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter((el) => el.offsetParent !== null);
    const first = items[0]; const last = items[items.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, []);

  const dansPanier = useMemo(() => new Set(lines.map((l) => l.product_id)), [lines]);
  const suggestions = useMemo(() => {
    const dispo = (p: P) => p.sizes.some((s) => (p.stock[s] ?? 0) > 0);
    const note = (p: P) => (p.badges.includes('nouveau') ? 2 : 0);
    return PRODUITS.filter((p) => dispo(p) && !dansPanier.has(p.id))
      .sort((a, z) => note(z) - note(a))
      .slice(0, 3);
  }, [dansPanier]);

  if (!render || typeof document === 'undefined') return null;

  const vide = lines.length === 0;
  const atteint = total >= FRANCO;
  const progres = Math.min(100, Math.round((total / FRANCO) * 100));

  return createPortal(
    <div className="cd-root" data-open={shown ? 'true' : 'false'}>
      <style>{CSS}</style>
      <div className="cd-veil" onClick={closeCartDrawer} aria-hidden="true" />

      <div ref={panel} className="cd-panel" role="dialog" aria-modal="true" aria-labelledby="cd-title" onKeyDown={onTab}>
        <header className="cd-head">
          <span className="cd-bag" aria-hidden="true">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {!vide && <span className="cd-bag-n">{lines.length}</span>}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="cd-title" className="font-display text-2xl font-semibold leading-tight text-ink">Votre panier</h2>
            <p className="mt-0.5 text-sm text-ink-2">
              {vide ? 'Il est encore vide' : `${lines.length} article${lines.length > 1 ? 's' : ''} · livraison à l'étape suivante`}
            </p>
          </div>
          <button ref={closeBtn} type="button" className="cd-close" onClick={closeCartDrawer} aria-label="Fermer le panier">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="cd-body">
          {vide && (
            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
              <span className="grid h-24 w-24 place-items-center rounded-full bg-cream" aria-hidden="true">
                <svg width="52" height="52" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-wine/50">
                  <circle cx="60" cy="24" r="8" /><path d="M60 32v10" />
                  <path d="M60 42 18 82q-3 4 2 4h80q5 0 2-4z" />
                </svg>
              </span>
              <p className="text-base font-bold">Votre panier est vide</p>
              <p className="max-w-xs text-sm text-ink-3">Les pièces que vous ajoutez se retrouvent ici.</p>
              <a href={`${b}/boutique`} className="btn btn-primary btn-lg mt-1">Voir la boutique</a>
            </div>
          )}

          {!vide && (
            <>
              <ul>
                {lines.map((l) => (
                  <li key={l.key} className="cd-line">
                    <a href={`${b}/produits/${l.slug}`} className="cd-thumb" tabIndex={-1} aria-hidden="true">
                      <Photo src={`/images/products/${l.image}`} base={base} sizes="100px" className="h-full w-full object-cover" width={100} height={132} />
                    </a>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg font-semibold leading-tight">
                            <a href={`${b}/produits/${l.slug}`} className="hover:text-wine">{l.name}</a>
                          </h3>
                          <p className="mt-0.5 text-sm text-ink-3">Taille {l.size}</p>
                          <p className="mt-1 text-sm font-semibold text-wine tabular">{eur(l.price)}</p>
                        </div>
                        <p className="shrink-0 font-display text-lg font-semibold tabular">{eur(l.price * l.qty)}</p>
                        <button type="button" onClick={() => retirer(l)}
                          className="-me-2 -mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-cream hover:text-ink"
                          aria-label={`Retirer ${l.name}, taille ${l.size}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="cd-step">
                          <button type="button" onClick={() => setQty(l.key, l.qty - 1)} disabled={l.qty <= 1} aria-label="Retirer un">−</button>
                          <span aria-live="polite">{l.qty}</span>
                          <button type="button" onClick={() => setQty(l.key, l.qty + 1)} disabled={l.qty >= l.max} aria-label="Ajouter un">+</button>
                        </div>
                        {l.qty >= l.max && (
                          <p className="text-xs font-semibold text-wine">
                            {l.max === 1 ? 'Dernière pièce' : `Stock maximum en ${l.size}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {undo && (
                <p className="flex items-center justify-between gap-3 rounded-md bg-cream px-4 py-2.5 text-sm" role="status">
                  <span className="min-w-0 truncate font-semibold text-ink-2">{undo.name} · retiré</span>
                  <button type="button" className="shrink-0 rounded-full px-3 py-2 text-sm font-bold text-wine hover:bg-wine-soft"
                    onClick={() => { undoRemove(); setUndo(null); }}>
                    Annuler
                  </button>
                </p>
              )}

              <div className="cd-free">
                <span className="cd-free-ico" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M2 6.5A1.5 1.5 0 0 1 3.5 5H14a1 1 0 0 1 1 1v9H2z" />
                    <path d="M15 9h3.2a1 1 0 0 1 .8.4l2.6 3.3a1 1 0 0 1 .2.6V15h-6.8z" />
                    <circle cx="6.5" cy="17.5" r="2.2" /><circle cx="17.5" cy="17.5" r="2.2" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold leading-tight text-wine">Livraison offerte</p>
                  <p className="mt-0.5 text-sm text-ink-2" aria-live="polite">
                    {atteint ? `C'est gagné : ${eur(PORT)} économisés.` : `Plus que ${eur(FRANCO - total)} pour en profiter.`}
                  </p>
                  <div className="cd-bar mt-3" role="progressbar" aria-label="Progression vers la livraison offerte"
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={atteint ? 100 : progres}>
                    <div className="cd-bar-fill" data-full={atteint ? 'true' : 'false'}
                      style={{ width: `${atteint ? 100 : Math.max(4, progres)}%` }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {suggestions.length > 0 && (
            <section aria-labelledby="cd-sug" className="flex flex-col gap-2.5">
              <h3 id="cd-sug" className="text-sm font-bold">Ça irait bien avec</h3>
              <ul className="flex flex-col gap-2">
                {suggestions.map((p) => {
                  const tailles = p.sizes.filter((s) => (p.stock[s] ?? 0) > 0);
                  return (
                    <li key={p.id} className="cd-sug">
                      <a href={`${b}/produits/${p.slug}`} className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-cream" tabIndex={-1} aria-hidden="true">
                        <Photo src={`/images/products/${p.images[0]}`} base={base} sizes="48px" className="h-full w-full object-cover" width={48} height={64} />
                      </a>
                      <div className="min-w-0 flex-1">
                        <a href={`${b}/produits/${p.slug}`} className="line-clamp-2 text-sm font-bold leading-tight">{p.name}</a>
                        <p className="text-xs font-semibold text-ink-3 tabular">{eur(p.price)}</p>
                      </div>
                      <button type="button" className="cd-sug-add"
                        onClick={() => {
                          const s = tailles[0];
                          if (!s) return;
                          addToCart({
                            product_id: p.id, slug: p.slug, name: p.name,
                            image: p.images[0] ?? '', size: s, price: p.price,
                            max: p.stock[s] ?? 1,
                          });
                        }}
                        aria-label={`Ajouter ${p.name} au panier`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                          <path d="M12 5.5v13M5.5 12h13" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {!vide && (
          <div className="cd-foot">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-lg font-semibold text-ink">Sous-total</span>
              <span className="font-display text-[1.75rem] font-semibold tabular">{eur(total)}</span>
            </div>
            <p className="flex items-center gap-2 text-sm text-ink-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-wine" aria-hidden="true">
                <path d="M4 9h16v11H4zM3 9l1.5-4h15L21 9" />
              </svg>
              Livraison et retrait choisis à l'étape suivante.
            </p>
            <a href={`${b}/commande`} className="btn btn-primary btn-lg min-h-16 w-full gap-3 text-lg">
              Commander
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a href={`${b}/panier`} className="self-center rounded-full px-3 py-1.5 text-sm font-bold text-wine underline underline-offset-4 hover:text-wine-deep">
              Voir le panier en entier
            </a>
            <ul className="cd-trust">
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9h16v11H4zM3 9l1.5-4h15L21 9M9 20v-6h6v6" /></svg>
                Retrait gratuit
              </li>
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.2 5 6v6.1c0 4 3 6.7 7 8.2 4-1.5 7-4.2 7-8.2V6z" /><path d="m9 12 2.1 2.1L15.2 10" /></svg>
                Paiement sécurisé
              </li>
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9h13l-3-3M20 15H7l3 3" /></svg>
                14 jours
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
